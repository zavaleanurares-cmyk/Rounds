/**
 * APNs, over HTTP/2, with a signed provider token.
 *
 * Written against the raw API rather than an SDK for one reason: Live Activity
 * updates need the `liveactivity` push type and an `apns-topic` with the
 * `.push-type.liveactivity` suffix, and most wrappers do not expose either.
 *
 * The provider token is an ES256 JWT signed with the .p8 key from the Apple
 * Developer portal. Apple requires it to be refreshed at least every hour and
 * REJECTS a token minted more often than once every twenty minutes, so it is
 * cached here between invocations of the same isolate.
 */

const CACHE: { token: string; mintedAt: number } = { token: '', mintedAt: 0 };
/** Apple's floor is 20 minutes; its ceiling is 60. Sit safely between them. */
const REMINT_AFTER = 40 * 60_000;

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const byte of b) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** The .p8 file is PKCS#8 PEM. Strip the armour and decode. */
function pemToPkcs8(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const raw = atob(body);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export interface ApnsConfig {
  keyId: string;
  teamId: string;
  bundleId: string;
  privateKey: string;
  /** Apple's production host unless explicitly told otherwise. */
  host: string;
}

export function apnsConfig(): ApnsConfig | null {
  const keyId = Deno.env.get('APNS_KEY_ID');
  const teamId = Deno.env.get('APNS_TEAM_ID');
  const bundleId = Deno.env.get('APNS_BUNDLE_ID');
  // Newlines survive an env var badly; accept the escaped form too.
  const privateKey = Deno.env.get('APNS_PRIVATE_KEY')?.replace(/\\n/g, '\n');
  if (!keyId || !teamId || !bundleId || !privateKey) return null;
  return {
    keyId,
    teamId,
    bundleId,
    privateKey,
    host: Deno.env.get('APNS_HOST') ?? 'https://api.push.apple.com',
  };
}

async function providerToken(cfg: ApnsConfig): Promise<string> {
  if (CACHE.token && Date.now() - CACHE.mintedAt < REMINT_AFTER) return CACHE.token;

  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'ES256', kid: cfg.keyId })));
  const claims = b64url(
    new TextEncoder().encode(JSON.stringify({ iss: cfg.teamId, iat: Math.floor(Date.now() / 1000) }))
  );
  const signingInput = `${header}.${claims}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(cfg.privateKey),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput)
  );

  CACHE.token = `${signingInput}.${b64url(sig)}`;
  CACHE.mintedAt = Date.now();
  return CACHE.token;
}

/**
 * Apple's own words for what went wrong, so a failed row in `outbound` says
 * something a person can act on rather than "apns 400".
 */
export class ApnsError extends Error {
  constructor(
    readonly status: number,
    readonly reason: string,
    /** True when the token is dead and the row should be dropped, not retried. */
    readonly permanent: boolean
  ) {
    super(`apns ${status} ${reason}`);
  }
}

const DEAD_TOKEN = new Set([
  'BadDeviceToken',
  'Unregistered',
  'DeviceTokenNotForTopic',
  'ExpiredToken',
  // The Activity ended on the device; its token will never work again.
  'BadCollapseId',
]);

/**
 * Sends one Live Activity content-state update.
 *
 * `staleDate` is what stops a HUD showing a count from two hours ago when the
 * phone has been in a pocket with no signal: iOS greys the Activity out rather
 * than lying. `dismissalDate` is deliberately not set here — ending a night is
 * the app's job, not a push's.
 */
export async function sendLiveActivityUpdate(
  cfg: ApnsConfig,
  token: string,
  contentState: Record<string, unknown>,
  { staleSeconds = 4 * 3600, priority = 5 }: { staleSeconds?: number; priority?: 5 | 10 } = {}
): Promise<void> {
  const jwt = await providerToken(cfg);
  const now = Math.floor(Date.now() / 1000);

  const res = await fetch(`${cfg.host}/3/device/${token}`, {
    method: 'POST',
    headers: {
      authorization: `bearer ${jwt}`,
      'apns-topic': `${cfg.bundleId}.push-type.liveactivity`,
      'apns-push-type': 'liveactivity',
      // Priority 5 is the right default: a HUD refresh is not urgent enough to
      // be worth waking a sleeping phone, and 10 on a stream of them is how an
      // app earns a throttle from Apple.
      'apns-priority': String(priority),
      'apns-expiration': String(now + 1800),
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      aps: {
        timestamp: now,
        event: 'update',
        'content-state': contentState,
        'stale-date': now + staleSeconds,
      },
    }),
  });

  if (res.ok) return;

  let reason = `http ${res.status}`;
  try {
    reason = (await res.json())?.reason ?? reason;
  } catch {
    /* Apple sometimes returns an empty body; the status is the message */
  }
  throw new ApnsError(res.status, reason, DEAD_TOKEN.has(reason) || res.status === 410);
}
