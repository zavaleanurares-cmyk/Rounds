import { admin, json } from '../_shared/db.ts';

/**
 * Re-reads the store for the calling user, right now.
 *
 * The webhook is the source of truth, but a webhook can be seconds or minutes
 * behind a purchase, and a person who has just paid should not be told to wait.
 * This is the "check again" path — it still writes only what the store says.
 */
Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);

  const db = admin();
  const { data: userData } = await db.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
  const userId = userData?.user?.id;
  if (!userId) return json({ error: 'unauthorized' }, 401);

  const key = Deno.env.get('RC_SECRET_KEY');
  if (!key) return json({ ok: true, note: 'store not configured' });

  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return json({ error: `store ${res.status}` }, 502);

  const info = await res.json();
  const ent = info?.subscriber?.entitlements?.plus;
  const expires = ent?.expires_date ? new Date(ent.expires_date) : null;
  const active = Boolean(ent) && (!expires || expires.getTime() > Date.now());

  await db.from('subscriptions').upsert(
    {
      user_id: userId,
      product_id: ent?.product_identifier ?? 'plus.annual',
      platform: 'ios',
      status: active ? 'active' : 'expired',
      current_period_end: expires?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  return json({ ok: true, active });
});
