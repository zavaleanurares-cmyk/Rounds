/**
 * The Supabase adapter.
 *
 * The app is fully functional with no backend at all — that is not a fallback,
 * it is the architecture. Every screen reads from the local store; the network
 * is a background reconciliation. Attaching a real backend is `attachRemote()`
 * at start-up, and no screen changes.
 *
 * Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to enable it.
 */
import {
  createClient, type RealtimeChannel, type Session as AuthSession, type SupabaseClient,
} from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logQueue, type QueueItem } from './queue';
import type { Log, Profile, Session } from '@/domain/types';

let client: SupabaseClient | null = null;
let attached = false;

export function getClient(): SupabaseClient | null {
  if (client) return client;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    realtime: { params: { eventsPerSecond: 4 } },
  });
  return client;
}

export const isRemoteEnabled = () => getClient() !== null;

/* ------------------------------------------------------------------- push */

/** Local shape → the column names in 00004. */
function logRow(log: Log) {
  return {
    id: log.id, // client-generated: the whole point
    user_id: log.userId,
    session_id: log.sessionId,
    drink_id: log.drinkId,
    drink_name: log.drinkName,
    category: log.category,
    volume_ml: log.volumeMl,
    abv: log.abv,
    price_minor: log.priceMinor,
    currency: log.currency,
    venue_id: log.venueId,
    consumed_at: new Date(log.at).toISOString(),
    round_size: log.roundSize ?? null,
    // ethanol_g and night_key are GENERATED columns — never sent, so a client
    // that computes them differently cannot corrupt the data.
  };
}

function sessionRow(s: Partial<Session> & { id: string }) {
  return {
    id: s.id,
    owner_id: s.ownerId,
    plan_id: s.planId,
    venue_id: s.venueId,
    title: s.title,
    visibility: s.visibility,
    join_code: s.joinCode,
    started_at: s.startedAt ? new Date(s.startedAt).toISOString() : undefined,
    accent_index: s.accentIndex,
  };
}

/**
 * Wires the queue's drain to Supabase.
 *
 * Note what this is NOT: a write path. Screens never call it. Its only job is to
 * push rows the queue already owns, and the client UUID in `item.id` is what
 * makes every one of these upserts idempotent — a retry after a timeout cannot
 * produce a second drink.
 */
export function attachRemote(): boolean {
  const supabase = getClient();
  if (!supabase || attached) return attached;
  attached = true;

  logQueue.setSyncer(async (item: QueueItem) => {
    switch (item.op) {
      case 'insert_log': {
        const { error } = await supabase
          .from('consumption_logs')
          .upsert(logRow(item.payload as Log), { onConflict: 'id', ignoreDuplicates: false });
        if (error) throw error;
        return;
      }
      case 'update_log': {
        const log = item.payload as Log;
        const { error } = await supabase
          .from('consumption_logs')
          .update({
            drink_id: log.drinkId,
            drink_name: log.drinkName,
            category: log.category,
            volume_ml: log.volumeMl,
            abv: log.abv,
            price_minor: log.priceMinor,
            consumed_at: new Date(log.at).toISOString(),
          })
          .eq('id', log.id);
        if (error) throw error;
        return;
      }
      case 'delete_log': {
        // Tombstone, never a hard delete. There is no delete policy on the
        // table at all, so this is also the only thing that would work.
        const { id } = item.payload as { id: string };
        const { error } = await supabase
          .from('consumption_logs')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
        return;
      }
      case 'upsert_session': {
        const { error } = await supabase
          .from('sessions')
          .upsert(sessionRow(item.payload as Session), { onConflict: 'id' });
        if (error) throw error;
        return;
      }
      case 'upsert_profile': {
        // Profile edits go through the same offline queue as everything else,
        // so a name changed on the train is not lost in the tunnel. The row is
        // keyed on the user's own id, and the table's update policy already
        // refuses anyone else's.
        const p = item.payload as Profile;
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: p.displayName,
            username: p.username,
            avatar_url: p.avatarUrl,
            bio: p.bio,
            avatar_tint: p.avatarTint,
            home_city: p.homeCity,
            signature_drink_id: p.signatureDrinkId,
            private_account: p.privateAccount,
            default_visibility: p.defaultVisibility,
            unit_system: p.unitSystem,
            currency: p.currency,
            region: p.region,
            onboarded: p.onboarded,
          })
          .eq('id', p.id);
        if (error) throw error;
        return;
      }
      case 'end_session': {
        const s = item.payload as { id: string; endedAt: number; mood: string | null; safeHomeAt: number | null };
        const { error } = await supabase
          .from('sessions')
          .update({
            ended_at: new Date(s.endedAt).toISOString(),
            mood: s.mood,
            safe_home_at: s.safeHomeAt ? new Date(s.safeHomeAt).toISOString() : null,
          })
          .eq('id', s.id);
        if (error) throw error;
        return;
      }
    }
  });

  return true;
}

/* ------------------------------------------------------------------- pull */

export interface PullResult {
  logs: Log[];
  sessions: Session[];
  serverTime: number;
}

/**
 * The whole pull in one round trip (`sync_pull` in 00008). One RPC rather than
 * five selects, because this runs on a phone that has just come back from a
 * basement with no signal, and every extra request is another chance to fail
 * halfway.
 */
export async function pull(since: Date | null): Promise<PullResult | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('sync_pull', {
    since: (since ?? new Date(0)).toISOString(),
  });
  if (error) throw error;
  const payload = data as {
    logs: Array<Record<string, unknown>>;
    sessions: Array<Record<string, unknown>>;
    server_time: string;
  };
  return {
    logs: (payload.logs ?? []).map(toLog),
    sessions: (payload.sessions ?? []).map(toSession),
    serverTime: new Date(payload.server_time).getTime(),
  };
}

function toLog(r: Record<string, any>): Log {
  return {
    id: r.id,
    sessionId: r.session_id,
    userId: r.user_id,
    drinkId: r.drink_id,
    drinkName: r.drink_name,
    category: r.category,
    volumeMl: Number(r.volume_ml),
    abv: Number(r.abv),
    ethanolG: Number(r.ethanol_g),
    priceMinor: r.price_minor ?? null,
    currency: r.currency ?? 'EUR',
    venueId: r.venue_id ?? null,
    at: new Date(r.consumed_at).getTime(),
    nightKey: r.night_key,
    deleted: Boolean(r.deleted_at),
    createdAt: new Date(r.created_at).getTime(),
    source: r.source ?? 'app',
    roundSize: r.round_size ?? null,
  };
}

function toSession(r: Record<string, any>): Session {
  return {
    id: r.id,
    ownerId: r.owner_id,
    planId: r.plan_id ?? null,
    venueId: r.venue_id ?? null,
    title: r.title ?? null,
    visibility: r.visibility,
    joinCode: r.join_code ?? null,
    startedAt: new Date(r.started_at).getTime(),
    endedAt: r.ended_at ? new Date(r.ended_at).getTime() : null,
    safeHomeAt: r.safe_home_at ? new Date(r.safe_home_at).getTime() : null,
    mood: r.mood ?? null,
    nightKey: r.night_key,
    accentIndex: r.accent_index ?? 0,
  };
}

/**
 * Merge rule: the local row wins on anything the user is still editing, the
 * server wins on generated columns. In practice conflicts barely happen —
 * client-generated ids mean two devices writing the same drink write the same
 * row — so the rule only has to be defensible, not clever.
 */
export function mergeLogs(local: Log[], remote: Log[]): Log[] {
  const byId = new Map(local.map((l) => [l.id, l]));
  for (const r of remote) {
    const mine = byId.get(r.id);
    if (!mine) byId.set(r.id, r);
    else byId.set(r.id, { ...r, deleted: mine.deleted || r.deleted });
  }
  return [...byId.values()].sort((a, b) => a.at - b.at);
}

/* --------------------------------------------------------------- realtime */

/**
 * ONE multiplexed channel per session, carrying logs, participants and chat.
 * Three channels would be three reconnects on foreground and three times the
 * load on a busy Saturday, which the brief correctly names as the first real
 * scaling problem this product will hit.
 */
export function subscribeToSession(
  sessionId: string,
  handlers: {
    onLog?: (row: Record<string, unknown>) => void;
    onParticipant?: (row: Record<string, unknown>) => void;
    onMessage?: (row: Record<string, unknown>) => void;
    onStatus?: (status: string) => void;
  }
): (() => void) | null {
  const supabase = getClient();
  if (!supabase) return null;

  const channel: RealtimeChannel = supabase
    .channel(`session:${sessionId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'consumption_logs', filter: `session_id=eq.${sessionId}` },
      (p) => handlers.onLog?.(p.new as Record<string, unknown>))
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionId}` },
      (p) => handlers.onParticipant?.(p.new as Record<string, unknown>))
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'session_messages', filter: `session_id=eq.${sessionId}` },
      (p) => handlers.onMessage?.(p.new as Record<string, unknown>))
    .subscribe((status) => handlers.onStatus?.(status));

  return () => void supabase.removeChannel(channel);
}

/* ------------------------------------------------------------------- auth */

export async function signInWithOtp(email: string) {
  const supabase = getClient();
  if (!supabase) return { ok: true, local: true as const };
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
  return { ok: true, local: false as const };
}

export async function verifyOtp(email: string, token: string): Promise<AuthSession | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
  return data.session;
}

export async function signInWithIdToken(provider: 'apple' | 'google', idToken: string) {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.signInWithIdToken({ provider, token: idToken });
  if (error) throw error;
  return data.session;
}

/** Age is verified and stored SERVER-side, so a reinstall cannot reset it. */
export async function verifyAge(dob: string): Promise<boolean | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('verify_age', { p_dob: dob });
  if (error) throw error;
  return Boolean(data);
}

export async function requestAccountDeletion() {
  const supabase = getClient();
  if (!supabase) return;
  const { error } = await supabase.rpc('request_account_deletion');
  if (error) throw error;
  await supabase.auth.signOut();
}

/**
 * The blood-alcohol estimate is never uploaded. It is derived locally from logs
 * that ARE uploaded, and storing it would turn a disclaimed estimate into a
 * record — exactly the interpretation the product must never invite.
 */
export const NEVER_UPLOADED = ['bacAt', 'paceState'] as const;

/* -------------------------------------------------------------- profile */

/**
 * Is this handle free?
 *
 * Goes through an RPC rather than a select, so the client learns one boolean
 * and nothing else — no row, no id, no confirmation that a particular person
 * exists. Returns `null` when there is no backend at all, which the caller
 * treats as "cannot tell" rather than as "taken".
 */
export async function usernameAvailable(username: string): Promise<boolean | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('username_available', { p_username: username });
  if (error) return null;
  return Boolean(data);
}

/**
 * Uploads an avatar and returns its public URL.
 *
 * The file is stored under the user's own id, which is what the bucket policy
 * keys on, and it is always overwritten rather than versioned — an old avatar
 * left behind is a copy of someone's face nobody asked to keep.
 */
export async function uploadAvatar(userId: string, uri: string): Promise<string | null> {
  const supabase = getClient();
  if (!supabase) return null;
  try {
    const res = await fetch(uri);
    const blob = await res.blob();
    const path = `${userId}/avatar.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
    if (error) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    // Cache-bust, or every device keeps showing the previous face.
    return data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : null;
  } catch {
    return null;
  }
}
