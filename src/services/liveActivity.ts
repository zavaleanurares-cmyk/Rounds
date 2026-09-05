import { Platform } from 'react-native';
import { getClient } from '@/data/remote';

/**
 * The Live Activity token registry.
 *
 * An Activity started with `pushType: .token` gets an APNs token that anyone
 * holding it can use to update that Activity. Storing it per session is what
 * lets a log by one person move everybody else's Lock Screen.
 *
 * Three things this deliberately does NOT do:
 *
 *  · It does not go through the offline log queue. That queue exists to make
 *    drinks idempotent; a push token is not a drink, and a token that failed to
 *    upload should be forgotten rather than replayed hours later against an
 *    Activity that has since ended.
 *  · It does not throw. Every path here is best-effort — a HUD that only
 *    updates from its own device is the old behaviour, not a broken app.
 *  · It never sends anything about the user. The row is a session id, a user
 *    id and an opaque token.
 */

export async function registerActivityToken(sessionId: string, token: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return false;

    // Upsert on the natural key: the same Activity re-registering after a
    // relaunch must not accumulate rows, and a rotated token must not leave the
    // old one behind to be pushed at forever.
    const { error } = await supabase.from('live_activity_tokens').upsert(
      {
        session_id: sessionId,
        user_id: userId,
        token,
        platform: Platform.OS === 'android' ? 'android' : 'ios',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id,user_id,token' }
    );
    return !error;
  } catch {
    return false;
  }
}

/** Called when the HUD ends. Removes this user's tokens; the RLS allows no more. */
export async function releaseActivityTokens(): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return;
    await supabase.from('live_activity_tokens').delete().eq('user_id', userId);
  } catch {
    /* best effort — a stale token is pruned server-side on its first rejection */
  }
}
