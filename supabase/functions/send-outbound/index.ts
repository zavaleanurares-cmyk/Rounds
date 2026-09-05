import { admin, json } from '../_shared/db.ts';

/**
 * Drains the outbound queue.
 *
 * Push goes through Expo's service; SMS through whichever provider is
 * configured. Both are best-effort with a bounded retry, and a row that has
 * failed five times is left with its error visible rather than retried forever
 * — a stuck safety message must be findable, not silently requeued.
 *
 * Invoked on a schedule (every minute) alongside `run_safety_escalation`.
 */
const MAX_ATTEMPTS = 5;
const BATCH = 100;

interface Row {
  id: string;
  user_id: string | null;
  channel: 'push' | 'sms' | 'email';
  category: string;
  payload: Record<string, unknown>;
  destination: string | null;
  attempts: number;
}

Deno.serve(async () => {
  const db = admin();

  const { data: rows, error } = await db
    .from('outbound')
    .select('*')
    .is('sent_at', null)
    .lte('send_after', new Date().toISOString())
    .lt('attempts', MAX_ATTEMPTS)
    // Safety first, always. A morning recap can wait a minute; a check-in
    // escalation is the reason this queue exists.
    .order('category', { ascending: true })
    .order('send_after', { ascending: true })
    .limit(BATCH);

  if (error) return json({ error: error.message }, 500);

  let sent = 0;
  let failed = 0;

  for (const row of (rows ?? []) as Row[]) {
    try {
      if (row.channel === 'push') await sendPush(db, row);
      else if (row.channel === 'sms') await sendSms(row);
      else await sendEmail(row);

      await db.from('outbound').update({ sent_at: new Date().toISOString() }).eq('id', row.id);
      sent++;
    } catch (err) {
      failed++;
      await db
        .from('outbound')
        .update({
          attempts: row.attempts + 1,
          last_error: String(err).slice(0, 400),
          // Exponential backoff, so a provider having a bad afternoon does not
          // burn every attempt in ninety seconds.
          send_after: new Date(Date.now() + 2 ** row.attempts * 60_000).toISOString(),
        })
        .eq('id', row.id);
    }
  }

  return json({ sent, failed, considered: rows?.length ?? 0 });
});

async function sendPush(db: ReturnType<typeof admin>, row: Row) {
  const { data: tokens } = await db
    .from('push_tokens')
    .select('token')
    .eq('user_id', row.user_id);

  if (!tokens?.length) return; // no device registered; not an error

  const messages = tokens.map((t: { token: string }) => ({
    to: t.token,
    title: row.payload.title ?? 'ROUNDS',
    body: row.payload.body ?? '',
    data: { category: row.category, ...row.payload },
    sound: row.category === 'safety' ? 'default' : null,
    channelId: row.category,
    priority: row.category === 'safety' ? 'high' : 'default',
    // A safety notification must survive the OS deciding the app is idle.
    ...(row.category === 'safety' ? { _contentAvailable: true } : {}),
  }));

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  if (!res.ok) throw new Error(`expo push ${res.status}`);

  const result = await res.json();
  // Prune tokens the service says are dead, or they retry forever.
  const dead = (result?.data ?? [])
    .map((r: { status: string; details?: { error?: string } }, i: number) =>
      r.status === 'error' && r.details?.error === 'DeviceNotRegistered' ? tokens[i].token : null
    )
    .filter(Boolean);
  if (dead.length) await db.from('push_tokens').delete().in('token', dead);
}

async function sendSms(row: Row) {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const auth = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_FROM');
  if (!sid || !auth || !from) throw new Error('sms provider not configured');
  if (!row.destination) throw new Error('no destination');

  const venue = row.payload.lastVenue ? ` Last seen at ${row.payload.lastVenue}.` : '';
  const body = `${row.payload.body ?? ''}${venue}`.slice(0, 480);

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${sid}:${auth}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: row.destination, From: from, Body: body }),
  });
  if (!res.ok) throw new Error(`twilio ${res.status} ${await res.text()}`);
}

async function sendEmail(row: Row) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key || !row.destination) throw new Error('email provider not configured');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'ROUNDS <hello@rounds.app>',
      to: row.destination,
      subject: String(row.payload.title ?? 'ROUNDS'),
      text: String(row.payload.body ?? ''),
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}
