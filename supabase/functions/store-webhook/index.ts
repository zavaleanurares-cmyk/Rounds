import { admin, json } from '../_shared/db.ts';

/**
 * The entitlement webhook — the ONLY thing that can grant ROUNDS+.
 *
 * The client can claim whatever it likes; `subscriptions` has no client insert
 * or update policy, so a claim buys ninety seconds of Insights and nothing
 * more. This function is what makes a purchase real, and it verifies the
 * request before it writes anything.
 *
 * Accepts RevenueCat's webhook shape; App Store Server Notifications v2 and
 * Google RTDN map onto the same three fields.
 */
Deno.serve(async (req) => {
  const secret = Deno.env.get('STORE_WEBHOOK_SECRET');
  if (!secret) return json({ error: 'not configured' }, 500);

  // Constant-time-ish check on a shared secret. A webhook that trusts its
  // caller is a webhook that hands out subscriptions to anyone with the URL.
  const provided = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (provided.length !== secret.length || provided !== secret) {
    return json({ error: 'unauthorized' }, 401);
  }

  const body = await req.json().catch(() => null);
  const event = body?.event;
  if (!event) return json({ error: 'no event' }, 400);

  const userId: string | undefined = event.app_user_id;
  if (!userId) return json({ error: 'no app_user_id' }, 400);

  const status = mapStatus(String(event.type ?? ''));
  const db = admin();

  if (status === null) return json({ ignored: event.type });

  const { error } = await db.from('subscriptions').upsert(
    {
      user_id: userId,
      product_id: event.product_id ?? 'plus.annual',
      platform: (event.store ?? '').toLowerCase().includes('play') ? 'android' : 'ios',
      status,
      current_period_end: event.expiration_at_ms
        ? new Date(Number(event.expiration_at_ms)).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, user: userId, status });
});

function mapStatus(type: string): 'active' | 'grace' | 'expired' | 'refunded' | null {
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'UNCANCELLATION':
      return 'active';
    case 'BILLING_ISSUE':
      return 'grace';
    case 'CANCELLATION':
    case 'EXPIRATION':
      return 'expired';
    case 'REFUND':
      return 'refunded';
    default:
      return null;
  }
}
