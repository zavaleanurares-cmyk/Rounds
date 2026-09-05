import { getClient } from '@/data/remote';

/**
 * Live location sharing.
 *
 * Deliberately NOT through the offline queue, which is the opposite of the rule
 * everywhere else in this app. A queued drink from an hour ago is still true; a
 * queued LOCATION from an hour ago is a lie, and a dangerous one on a screen
 * whose entire purpose is telling people where you are. So a point that cannot
 * be sent now is dropped, and the next tick tries again with a fresh one.
 *
 * The audience is the people in your night — that is what `session_locations`
 * models and what its RLS enforces. It is not your trusted contacts: they are
 * phone numbers, they may not have the app, and there is nothing for them to
 * read. The safety copy used to claim otherwise and has been corrected.
 *
 * Rows carry `expires_at` and a scheduled job deletes them, but stopping also
 * deletes immediately rather than waiting: "it stops on its own" has to mean
 * the row is gone, not merely hidden.
 */

/** Every two minutes. Often enough to be useful, rare enough not to be felt. */
const INTERVAL_MS = 2 * 60_000;

interface Session {
  sessionId: string;
  userId: string;
  until: number;
}

let timer: ReturnType<typeof setInterval> | null = null;
let active: Session | null = null;

/** The last point that actually reached the server, for the UI to show. */
let lastSentAt: number | null = null;

export const sharingState = () => ({ active: active !== null, until: active?.until ?? null, lastSentAt });

async function currentPoint(): Promise<{ lat: number; lng: number } | null> {
  try {
    const Location = require('expo-location') as typeof import('expo-location');
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    // Balanced, not Highest: a nightlife app needs the right street, not the
    // right doorway, and Highest costs battery on a phone that is already low
    // by 1am.
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

async function push(): Promise<void> {
  if (!active) return;
  if (Date.now() >= active.until) {
    await stopSharing();
    return;
  }
  const supabase = getClient();
  if (!supabase) return;
  const point = await currentPoint();
  if (!point) return;
  try {
    const { error } = await supabase.from('session_locations').upsert(
      {
        session_id: active.sessionId,
        user_id: active.userId,
        lat: point.lat,
        lng: point.lng,
        updated_at: new Date().toISOString(),
        // The row expires when the window does, so a crash mid-window cannot
        // leave somebody's position readable indefinitely.
        expires_at: new Date(active.until).toISOString(),
      },
      { onConflict: 'session_id,user_id' }
    );
    if (!error) lastSentAt = Date.now();
  } catch {
    /* dropped on purpose — see the note at the top */
  }
}

/**
 * Starts sharing for this night until `until`. Idempotent: calling it again
 * with a later deadline extends the window rather than starting a second timer.
 */
export function startSharing(sessionId: string, userId: string, until: number): void {
  active = { sessionId, userId, until };
  if (!timer) timer = setInterval(() => void push(), INTERVAL_MS);
  // Send one immediately; waiting two minutes to appear reads as broken.
  void push();
}

/** Stops, and removes the row rather than leaving it to expire. */
export async function stopSharing(): Promise<void> {
  const was = active;
  active = null;
  lastSentAt = null;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (!was) return;
  const supabase = getClient();
  if (!supabase) return;
  try {
    await supabase
      .from('session_locations')
      .delete()
      .eq('session_id', was.sessionId)
      .eq('user_id', was.userId);
  } catch {
    /* the TTL and the purge job are the backstop */
  }
}
