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
import type {
  Log, Profile, Session, Person, Crew, Plan, Venue, Goal, TrustedContact,
  SafeArrivalCheck, AppNotification, Rsvp,
} from '@/domain/types';

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

/**
 * What the server said about a friend request that was not simply sent.
 *
 * `request_friendship` answers with a word instead of an error, so the queue
 * sees a successful write for a request the server declined. The store
 * registers a reporter here to roll the optimistic "pending" row back, which is
 * the difference between a request that never arrives and a request the sender
 * can see never arrived.
 */
export type FriendRequestOutcome = 'sent' | 'self' | 'rate_limited';

let friendRequestReporter: ((personId: string, outcome: FriendRequestOutcome) => void) | null = null;

export function setFriendRequestReporter(
  fn: ((personId: string, outcome: FriendRequestOutcome) => void) | null
): void {
  friendRequestReporter = fn;
}

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
            // The two that decide what the SERVER sends, and in which language.
            // Both were device-local: a preference kept on the phone cannot be
            // honoured by a job that composes and delivers the message.
            locale: p.locale,
            notification_prefs: p.notificationPrefs,
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
      default:
        return writeExtended(supabase, item);
    }
  });

  return true;
}


/**
 * Everything the queue can write beyond logs, sessions and profiles.
 *
 * Split out of the switch above rather than added to it: the original three
 * carry hand-written row builders and comments explaining why — generated
 * columns, tombstones, client-minted UUIDs — and burying them in a thirty-case
 * switch would lose that. These are ordinary rows.
 *
 * Every one is an UPSERT on a key the client already knows, so a replay after
 * a flaky night is a no-op rather than a duplicate. That is the same property
 * that makes the log queue safe, applied to the rest of the schema.
 */
async function writeExtended(supabase: SupabaseClient, item: QueueItem): Promise<void> {
  const p = item.payload as Record<string, any>;
  const fail = (error: { message: string } | null) => {
    if (error) throw new Error(error.message);
  };

  switch (item.op) {
    /* ------------------------------------------------------------- night */
    case 'join_session':
      return fail(
        (await supabase
          .from('session_participants')
          .upsert({ session_id: p.sessionId, user_id: p.userId }, { onConflict: 'session_id,user_id' })).error
      );
    case 'leave_session':
      return fail(
        (await supabase
          .from('session_participants')
          .delete()
          .eq('session_id', p.sessionId)
          .eq('user_id', p.userId)).error
      );
    case 'insert_message':
      // The row the room's realtime subscription has been waiting for since it
      // was written. `id` is the client's UUID, so the copy that comes back off
      // the channel is recognisably the one the sender already has on screen.
      return fail(
        (await supabase
          .from('session_messages')
          .upsert(
            { id: p.id, session_id: p.sessionId, user_id: p.userId, body: p.text },
            { onConflict: 'id' }
          )).error
      );
    case 'insert_reaction':
      // Keyed by the id the client minted (00032), like everything else here,
      // so a replay after a flaky night lands on the same row rather than
      // producing a second cheer. `created_at` is sent too because the old
      // composite is still a uniqueness rule.
      return fail(
        (await supabase.from('session_reactions').upsert(
          {
            id: p.id,
            session_id: p.sessionId,
            user_id: p.userId,
            emoji: p.reaction,
            created_at: new Date(p.at).toISOString(),
          },
          { onConflict: 'id' }
        )).error
      );

    /* ----------------------------------------------------------- account */
    case 'upsert_goal':
      return fail(
        (await supabase
          .from('goals')
          .upsert(
            { user_id: p.userId, type: p.type, target: p.target, enabled: p.enabled },
            { onConflict: 'user_id,type' }
          )).error
      );

    case 'earn_achievement':
      // Achievements are computed locally from logs and sessions, so the server
      // copy is not the source of truth — it is the RECORD that this account
      // reached it, and when. Without it a reinstall silently un-earns two
      // dozen things somebody actually did, and no other device or person can
      // ever see them.
      //
      // `ignoreDuplicates` because the earliest earned_at is the true one: a
      // re-sync must not move the date forward.
      return fail(
        (await supabase
          .from('achievements')
          .upsert(
            { user_id: p.userId, code: p.code, earned_at: new Date(p.earnedAt).toISOString() },
            { onConflict: 'user_id,code', ignoreDuplicates: true }
          )).error
      );

    /* ------------------------------------------------------------ safety */
    // The ops this whole change exists for. Until these ran, the server-side
    // escalation had an empty table to act on.
    case 'upsert_contact':
      return fail(
        (await supabase
          .from('trusted_contacts')
          .upsert({ id: p.id, user_id: p.userId, name: p.name, phone: p.phone }, { onConflict: 'id' })).error
      );
    case 'delete_contact':
      return fail((await supabase.from('trusted_contacts').delete().eq('id', p.id)).error);
    case 'arm_check':
      return fail(
        (await supabase
          .from('safe_arrival_checks')
          .upsert(
            {
              id: p.id,
              user_id: p.userId,
              session_id: p.sessionId ?? null,
              deadline_at: new Date(p.deadlineAt).toISOString(),
              message: p.message,
              // Which contacts THIS check named. Null means all of them, so an
              // empty choice must never silently become everyone.
              contact_ids: p.contactIds?.length ? p.contactIds : null,
            },
            { onConflict: 'id' }
          )).error
      );
    /**
     * Checking in goes through the RPC because resolving is two writes, not one.
     *
     * Marking the check resolved is the obvious half. The other half is
     * deleting the queued-but-unsent `outbound` safety rows for it: the
     * escalation job stages messages before the deadline, so a direct update to
     * `resolved_at` still leaves an SMS sitting in the outbox with a trusted
     * contact's number on it. Someone who got home and pressed "I'm safe"
     * having their mother texted anyway is the worst bug this feature has.
     */
    case 'resolve_check':
      return fail((await supabase.rpc('resolve_safe_arrival', { p_check: p.id })).error);

    case 'upsert_private_profile':
      // "private is yours alone" is a `for all` policy keyed on auth.uid(), so
      // this needs no scope of its own beyond the id it writes.
      return fail(
        (await supabase
          .from('profiles_private')
          .upsert(
            {
              id: p.id,
              weight_kg: p.weightKg ?? null,
              sex: p.sex ?? null,
              modules: p.modules,
              intent: p.intent ?? [],
              home_address: p.homeAddress ?? null,
            },
            { onConflict: 'id' }
          )).error
      );

    /**
     * Both of these tell OTHER people something, so neither writes a row: the
     * function decides who is in the audience for this night and refuses
     * everybody else in silence. See 00039 for the rules.
     */
    case 'notify_night_started':
      return fail((await supabase.rpc('notify_night_started', { p_session: p.sessionId })).error);
    case 'ask_for_round':
      return fail(
        (await supabase.rpc('ask_for_round', {
          p_session: p.sessionId,
          p_round: p.roundId,
          p_targets: p.targets,
          p_drink: p.drink,
        })).error
      );

    /* ------------------------------------------------------------ people */
    /**
     * Sending a request goes through the RPC, never the table.
     *
     * `request_friendship` caps an account at 25 sent requests a day and
     * answers a self-request with a word instead of an error. The cap lives in
     * the function, not in a policy — the insert policy only checks that the
     * requester is you — so writing the row directly (which is what this case
     * used to do) removed the only spam control the server had. The screen's
     * own counter is a courtesy; it resets when the app restarts.
     *
     * The RPC returns a word rather than raising, so an outcome like
     * `rate_limited` must not be thrown: throwing would stall the whole queue
     * behind eight retries, taking the night's drink logs with it. It is
     * reported back instead, and the store undoes the optimistic row.
     */
    case 'request_friendship': {
      const { data, error } = await supabase.rpc('request_friendship', { target: p.target });
      fail(error);
      const outcome = (data as FriendRequestOutcome | null) ?? 'sent';
      if (outcome !== 'sent') friendRequestReporter?.(p.target as string, outcome);
      return;
    }
    /**
     * Accepting one is an ordinary status update. RLS ("respond to a request")
     * allows it only to the addressee, so the rule is already where it belongs
     * and there is nothing an RPC would add. The row keeps THEIR id as the
     * requester — writing it the other way round mirrors the friendship instead
     * of answering it.
     */
    case 'accept_friendship':
      return fail(
        (await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('requester_id', p.requesterId)
          .eq('addressee_id', p.addresseeId)).error
      );
    case 'delete_friendship':
      return fail(
        (await supabase
          .from('friendships')
          .delete()
          .or(
            `and(requester_id.eq.${p.a},addressee_id.eq.${p.b}),and(requester_id.eq.${p.b},addressee_id.eq.${p.a})`
          )).error
      );
    case 'insert_block':
      return fail(
        (await supabase
          .from('blocks')
          .upsert({ blocker_id: p.blockerId, blocked_id: p.blockedId }, { onConflict: 'blocker_id,blocked_id' })).error
      );
    case 'delete_block':
      return fail(
        (await supabase.from('blocks').delete().eq('blocker_id', p.blockerId).eq('blocked_id', p.blockedId)).error
      );
    case 'insert_report':
      return fail(
        (await supabase.from('reports').upsert(
          {
            id: p.id,
            reporter_id: p.reporterId,
            target_type: p.targetType,
            target_id: p.targetId,
            reason: p.reason,
            detail: p.detail,
          },
          { onConflict: 'id' }
        )).error
      );

    /* ------------------------------------------------------------- crews */
    case 'upsert_crew':
      return fail(
        (await supabase.from('crews').upsert(
          {
            id: p.id,
            slug: p.slug,
            name: p.name,
            accent_index: p.accentIndex,
            icon: p.icon,
            created_by: p.createdBy,
          },
          { onConflict: 'id' }
        )).error
      );
    case 'upsert_crew_member':
      return fail(
        (await supabase
          .from('crew_members')
          .upsert({ crew_id: p.crewId, user_id: p.userId }, { onConflict: 'crew_id,user_id' })).error
      );
    case 'delete_crew_member':
      return fail(
        (await supabase.from('crew_members').delete().eq('crew_id', p.crewId).eq('user_id', p.userId)).error
      );

    /* ------------------------------------------------------------- plans */
    case 'upsert_plan':
      return fail(
        (await supabase.from('plans').upsert(
          {
            id: p.id,
            created_by: p.createdBy,
            crew_id: p.crewId ?? null,
            title: p.title,
            note: p.note ?? null,
            starts_at: new Date(p.startsAt).toISOString(),
          },
          { onConflict: 'id' }
        )).error
      );
    case 'upsert_plan_invitee':
      return fail(
        (await supabase
          .from('plan_invitees')
          .upsert({ plan_id: p.planId, user_id: p.userId, rsvp: p.rsvp }, { onConflict: 'plan_id,user_id' })).error
      );
    case 'add_plan_venue':
      // The shortlist, which is not the votes. A place proposed that nobody has
      // voted for yet still has to exist, or a plan syncs without the choice it
      // was created to offer.
      return fail(
        (await supabase
          .from('plan_venues')
          .upsert({ plan_id: p.planId, venue_id: p.venueId, added_by: p.addedBy }, { onConflict: 'plan_id,venue_id' })).error
      );
    case 'set_plan_vote':
      return fail(
        (await supabase
          .from('plan_venue_votes')
          .upsert(
            { plan_id: p.planId, venue_id: p.venueId, user_id: p.userId },
            { onConflict: 'plan_id,venue_id,user_id' }
          )).error
      );
    case 'clear_plan_vote':
      return fail(
        (await supabase.from('plan_venue_votes').delete().eq('plan_id', p.planId).eq('user_id', p.userId)).error
      );

    /* ------------------------------------------------------------ places */
    case 'upsert_venue':
      return fail(
        (await supabase.from('venues').upsert(
          {
            id: p.id,
            provider_id: p.providerId ?? null,
            name: p.name,
            area: p.area ?? null,
            lat: p.lat ?? null,
            lng: p.lng ?? null,
            price_band: p.priceBand ?? null,
            category: p.category ?? null,
          },
          { onConflict: 'id' }
        )).error
      );

    /* ------------------------------------------------------------- inbox */
    case 'read_notification':
      return fail(
        (await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', p.id)).error
      );
  }
}

/* ------------------------------------------------------------------- pull */

/**
 * Note what is NOT in here: chat. `sync_pull` does not return session_messages
 * and should not — a night's messages arriving over realtime while you are in
 * the room is the feature, and back-filling a week of other people's chat on
 * every cold start is a different and worse one.
 */
export interface PullResult {
  profile: Partial<Profile> | null;
  logs: Log[];
  sessions: Session[];
  goals: Goal[];
  people: Person[];
  crews: Crew[];
  plans: Plan[];
  venues: Venue[];
  trustedContacts: TrustedContact[];
  activeCheck: SafeArrivalCheck | null;
  /** Lives in `profiles_private`, belongs to safety state on this side. */
  homeAddress: string | null;
  blocked: string[];
  notifications: AppNotification[];
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
  const p = data as Record<string, any>;
  const rows = (k: string): Array<Record<string, any>> => (Array.isArray(p[k]) ? p[k] : []);
  const me = p.profile?.id as string | undefined;

  /* Friendships and crew/plan membership are separate tables on the server and
     one object on the client, so the joining happens here. The store should
     never have to know the schema's shape. */
  const friendships = rows('friendships');
  const crewMembers = rows('crew_members');
  const invitees = rows('plan_invitees');
  const votes = rows('plan_votes');
  const shortlist = rows('plan_venues');
  const peopleRows = rows('people');
  const crewRows = rows('crews');
  const venueRows = rows('venues');
  const byId = new Map(peopleRows.map((x) => [x.id as string, x]));

  const statusFor = (otherId: string): Person['status'] => {
    const f = friendships.find((x) => x.requester_id === otherId || x.addressee_id === otherId);
    if (!f) return 'none';
    if (f.status === 'accepted') return 'friend';
    // Which side of a pending request this account is on decides what the UI
    // offers: accept and decline, or "requested".
    return f.requester_id === me ? 'pending_out' : 'pending_in';
  };

  return {
    profile: p.profile ? toProfilePatch(p.profile, p.private) : null,
    logs: rows('logs').map(toLog),
    sessions: rows('sessions').map(toSession),
    goals: rows('goals').map((g) => ({
      type: g.type,
      target: Number(g.target),
      enabled: Boolean(g.enabled),
    })),
    people: peopleRows.map((x) => ({
      id: x.id,
      displayName: x.display_name ?? '',
      username: x.username ?? '',
      avatarUrl: x.avatar_url ?? null,
      level: Number(x.level ?? 1),
      // Derived locally from shared sessions; the server does not count it.
      sharedNights: 0,
      mutualCrews: crewRows
        .filter((c) => crewMembers.some((m) => m.crew_id === c.id && m.user_id === x.id))
        .map((c) => c.name as string),
      status: statusFor(x.id),
      // Realtime decides this, never a pull.
      liveNow: false,
    })),
    crews: crewRows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      accentIndex: Number(c.accent_index ?? 0),
      icon: c.icon ?? 'moon.stars',
      memberIds: crewMembers.filter((m) => m.crew_id === c.id).map((m) => m.user_id as string),
    })),
    plans: rows('plans').map((pl) => ({
      id: pl.id,
      title: pl.title,
      startsAt: new Date(pl.starts_at).getTime(),
      crewId: pl.crew_id ?? null,
      note: pl.note ?? null,
      createdBy: pl.created_by,
      invitees: invitees
        .filter((i) => i.plan_id === pl.id)
        .map((i) => ({
          userId: i.user_id,
          displayName: (byId.get(i.user_id)?.display_name as string) ?? '',
          avatarUrl: (byId.get(i.user_id)?.avatar_url as string) ?? null,
          rsvp: (i.rsvp ?? null) as Rsvp,
        })),
      // The shortlist is its own table; votes only decide the counts on it.
      // Deriving candidates from votes lost every option nobody had picked yet.
      venueCandidates: [
        ...new Set([
          ...shortlist.filter((c) => c.plan_id === pl.id).map((c) => c.venue_id as string),
          ...votes.filter((v) => v.plan_id === pl.id).map((v) => v.venue_id as string),
        ]),
      ].map((venueId) => ({
        venueId,
        name: (venueRows.find((v) => v.id === venueId)?.name as string) ?? '',
        votes: votes
          .filter((v) => v.plan_id === pl.id && v.venue_id === venueId)
          .map((v) => v.user_id as string),
      })),
    })),
    venues: venueRows.map((v) => ({
      id: v.id,
      providerId: v.provider_id ?? null,
      name: v.name,
      area: v.area ?? null,
      lat: v.lat ?? null,
      lng: v.lng ?? null,
      priceBand: v.price_band ?? null,
      category: v.category ?? null,
    })),
    trustedContacts: rows('trusted_contacts').map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
    })),
    homeAddress: (p.private as Record<string, any> | null)?.home_address ?? null,
    activeCheck: (() => {
      const c = rows('safe_arrival_checks')[0];
      if (!c) return null;
      return {
        id: c.id,
        deadlineAt: new Date(c.deadline_at).getTime(),
        armedAt: new Date(c.armed_at).getTime(),
        resolvedAt: c.resolved_at ? new Date(c.resolved_at).getTime() : null,
        message: c.message,
        contactIds: (c.contact_ids as string[] | null) ?? [],
      };
    })(),
    blocked: rows('blocks').map((b) => b.blocked_id as string),
    notifications: rows('notifications').map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      body: n.body,
      at: new Date(n.created_at).getTime(),
      read: Boolean(n.read_at),
      href: n.href ?? null,
    })),
    serverTime: new Date(p.server_time).getTime(),
  };
}

/**
 * The server's profile, as a PATCH rather than a whole object.
 *
 * The client's `Profile` carries fields the server splits across two tables and
 * a couple it does not store at all, so a pull contributes what it knows and
 * leaves the rest of the local row alone. Returning a whole object here would
 * blank a field the moment the server stopped sending it.
 */
function toProfilePatch(r: Record<string, any>, priv: Record<string, any> | null): Partial<Profile> {
  return {
    id: r.id,
    displayName: r.display_name ?? '',
    username: r.username ?? '',
    avatarUrl: r.avatar_url ?? null,
    avatarTint: r.avatar_tint ?? null,
    bio: r.bio ?? null,
    homeCity: r.home_city ?? null,
    signatureDrinkId: r.signature_drink_id ?? null,
    level: Number(r.level ?? 1),
    unitSystem: r.unit_system ?? 'EU',
    currency: r.currency ?? 'EUR',
    region: r.region ?? 'RO',
    privateAccount: Boolean(r.private_account),
    defaultVisibility: r.default_visibility ?? 'friends',
    onboarded: Boolean(r.onboarded),
    locale: r.locale ?? 'en',
    notificationPrefs: r.notification_prefs ?? undefined,
    ...(priv
      ? {
          weightKg: priv.weight_kg ?? null,
          sex: priv.sex ?? null,
          dob: priv.dob ?? null,
          modules: priv.modules ?? { nicotine: false, social: true },
          intent: priv.intent ?? [],
        }
      : {}),
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
    onReaction?: (row: Record<string, unknown>) => void;
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
    // Reactions travel the same way. Writing them without listening for them
    // was the mirror image of the bug this channel was built to fix: durable,
    // and invisible to everybody else in the room.
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'session_reactions', filter: `session_id=eq.${sessionId}` },
      (p) => handlers.onReaction?.(p.new as Record<string, unknown>))
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

/**
 * Signing back in cancels a pending deletion.
 *
 * The settings screen promises exactly this — "sign back in within 30 days and
 * nothing has been lost" — and for a while the app did not keep it. Requesting
 * deletion stamps `deletion_requested_at` and signs the user out; a cron job
 * cascades the account away 30 days later. `cancel_account_deletion` existed
 * from the start and was called from nowhere, so somebody who changed their
 * mind, signed back in and used the app for three weeks was still erased on
 * day 30, with the screen that told them otherwise still in the app.
 *
 * Idempotent: it clears a column that is usually already null.
 */
export async function cancelAccountDeletion() {
  const supabase = getClient();
  if (!supabase) return;
  const { error } = await supabase.rpc('cancel_account_deletion');
  if (error) throw error;
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
 * Finds people by username, on the server.
 *
 * This is what makes it possible to add somebody you are not already connected
 * to. The search screen used to filter the local `people` array — the friends,
 * pending requests and crew-mates this device already knew about — so typing a
 * stranger's exact handle returned nothing, and the only way to acquire a new
 * friend was to be added by one. The Add Friend flow existed end to end and
 * could not be started.
 *
 * `search_profiles` is prefix-matched, capped at twenty, and already excludes
 * you, private accounts and anybody either of you has blocked. It returns six
 * columns, not the row.
 *
 * `null` means there is no backend to ask, which the caller shows as "cannot
 * search right now" rather than as "nobody by that name".
 */
export interface SearchHit {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  avatarTint: number | null;
  level: number;
}

export async function searchPeople(term: string): Promise<SearchHit[] | null> {
  const supabase = getClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('search_profiles', { term: term.toLowerCase() });
  if (error) return null;
  return (data as Record<string, any>[]).map((r) => ({
    id: r.id,
    username: r.username,
    displayName: r.display_name,
    avatarUrl: r.avatar_url ?? null,
    avatarTint: r.avatar_tint ?? null,
    level: r.level ?? 1,
  }));
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
