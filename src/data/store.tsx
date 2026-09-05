/**
 * The app store.
 *
 * Local-first by design: every read is served from memory, every write lands in
 * memory and AsyncStorage first and only then goes to the queue. No screen ever
 * awaits the network — that is the rule that makes the log sheet a single tap in
 * a loud room with two bars of signal.
 *
 * A Supabase adapter can be attached at runtime (see `src/data/remote.ts`); when
 * it is absent the app is fully functional offline, which is also how it runs in
 * development and in the web preview.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type {
  AppNotification,
  Crew,
  Drink,
  Goal,
  Log,
  Mood,
  Person,
  Plan,
  Profile,
  Report,
  Rsvp,
  SafeArrivalCheck,
  Session,
  TrustedContact,
  Venue,
  Visibility,
} from '@/domain/types';
import { nightKey } from '@/domain/nightKey';
import { CATALOG, WATER, byId } from '@/domain/catalog';
import { KEYS, readJson, writeJson, remove } from './storage';
import { logQueue, type QueueState } from './queue';
import { uuid } from './uuid';
import * as remote from './remote';
import * as analytics from '@/services/analytics';
import * as push from '@/services/push';
import * as purchases from '@/services/purchases';
import { configureFeedback, releaseFeedback } from '@/services/feedback';
import { BILLING_VISIBLE } from '@/config/flags';
import {
  DEMO_CREWS,
  DEMO_PEOPLE,
  DEMO_VENUES,
  demoHistory,
  demoNotifications,
  demoPlans,
} from './seed';

/* ------------------------------------------------------------------ state */

export interface Settings {
  notifications: Record<'morning' | 'weekly' | 'plans' | 'social' | 'safety' | 'gamification', boolean>;
  locationSharingDefault: boolean;
  contactMatching: boolean;
  nightDimming: boolean;
  reduceMotion: boolean;
  /** Sound effects. Off by default — this app gets opened in quiet places. */
  sound: boolean;
  haptics: boolean;
  /**
   * Whether to show the ‰ figure under the pace ring.
   *
   * OFF by default, and that is a product decision rather than a cautious one.
   * The state word IS the readout — it is relative to this person's own
   * weekday median, which is the only comparison that means anything. The ‰ is
   * a population-average approximation that invites exactly the interpretation
   * the product must never invite, and a person who has not asked for it is
   * better served without it.
   *
   * It also keeps the number off a default install, which is what the store
   * screenshots are taken from.
   */
  showEstimate: boolean;
  accentIndex: number;
  subscribed: boolean;
}

export interface SafetyState {
  contacts: TrustedContact[];
  homeAddress: string | null;
  activeCheck: SafeArrivalCheck | null;
  locationSharingUntil: number | null;
}

export interface AuthState {
  status: 'loading' | 'signed_out' | 'signed_in';
  userId: string | null;
  email: string | null;
  pendingEmail: string | null;
  /** A deep link (usually a QR join) captured before auth, resumed after. */
  pendingHref: string | null;
  ageVerified: boolean;
  underageBlocked: boolean;
}

export interface State {
  hydrated: boolean;
  auth: AuthState;
  profile: Profile | null;
  logs: Log[];
  sessions: Session[];
  people: Person[];
  crews: Crew[];
  plans: Plan[];
  venues: Venue[];
  goals: Goal[];
  safety: SafetyState;
  blocked: string[];
  reports: Report[];
  notifications: AppNotification[];
  settings: Settings;
}

const DEFAULT_SETTINGS: Settings = {
  notifications: {
    morning: true,
    weekly: true,
    plans: true,
    social: true,
    safety: true,
    gamification: false, // default off, on purpose
  },
  locationSharingDefault: false,
  contactMatching: false,
  nightDimming: true,
  reduceMotion: false,
  sound: false,
  haptics: true,
  showEstimate: false,
  accentIndex: 0,
  subscribed: false,
};

const DEFAULT_GOALS: Goal[] = [
  { type: 'weekly_cap', target: 140, enabled: true }, // grams
  { type: 'nightly_cap', target: 60, enabled: true },
  { type: 'dry_days', target: 12, enabled: true },
  { type: 'spend_cap', target: 40000, enabled: false }, // minor units
];

const INITIAL: State = {
  hydrated: false,
  auth: {
    status: 'loading',
    userId: null,
    email: null,
    pendingEmail: null,
    pendingHref: null,
    ageVerified: false,
    underageBlocked: false,
  },
  profile: null,
  logs: [],
  sessions: [],
  people: [],
  crews: [],
  plans: [],
  venues: DEMO_VENUES,
  goals: DEFAULT_GOALS,
  safety: { contacts: [], homeAddress: null, activeCheck: null, locationSharingUntil: null },
  blocked: [],
  reports: [],
  notifications: [],
  settings: DEFAULT_SETTINGS,
};

type Action =
  | { type: 'hydrate'; payload: Partial<State> }
  | { type: 'set'; payload: Partial<State> }
  | { type: 'patchProfile'; payload: Partial<Profile> }
  | { type: 'addLog'; payload: Log }
  | { type: 'patchLog'; id: string; payload: Partial<Log> }
  | { type: 'addSession'; payload: Session }
  | { type: 'patchSession'; id: string; payload: Partial<Session> }
  | { type: 'patchSettings'; payload: Partial<Settings> }
  | { type: 'patchSafety'; payload: Partial<SafetyState> }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.payload, hydrated: true };
    case 'set':
      return { ...state, ...action.payload };
    case 'patchProfile':
      return state.profile ? { ...state, profile: { ...state.profile, ...action.payload } } : state;
    case 'addLog':
      return { ...state, logs: [...state.logs, action.payload].sort((a, b) => a.at - b.at) };
    case 'patchLog':
      return {
        ...state,
        logs: state.logs.map((l) => (l.id === action.id ? { ...l, ...action.payload } : l)),
      };
    case 'addSession':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'patchSession':
      return {
        ...state,
        sessions: state.sessions.map((s) => (s.id === action.id ? { ...s, ...action.payload } : s)),
      };
    case 'patchSettings':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'patchSafety':
      return { ...state, safety: { ...state.safety, ...action.payload } };
    case 'reset':
      return { ...INITIAL, hydrated: true, auth: { ...INITIAL.auth, status: 'signed_out' } };
    default:
      return state;
  }
}

/* ---------------------------------------------------------------- actions */

export interface LogDraft {
  drink: Drink;
  priceMinor?: number | null;
  at?: number;
  venueId?: string | null;
  /**
   * A UUID minted elsewhere — by a Live Activity button, a notification action,
   * a widget or the watch. Passing it through rather than minting a new one is
   * what stops a drained surface log from becoming a second drink.
   */
  id?: string;
  /** Which surface produced it. Instrumented from day one. */
  source?: 'app' | 'live_activity' | 'notification' | 'widget' | 'tile' | 'voice' | 'watch';
  /**
   * Set only by the round sheet: how many people the round was for. It records
   * a social fact and never touches any consumption figure — this log is still
   * one drink.
   */
  roundSize?: number | null;
}

export interface Store extends State {
  queue: QueueState;
  /**
   * Whether the paid tier is on.
   *
   * While `BILLING_VISIBLE` is false this is hard TRUE. There is no way to buy
   * anything, so there must be no way to be locked out of anything either — a
   * feature that is both unbuyable and gated is just a broken feature.
   *
   * When billing comes back: `entitled` is what the SERVER says;
   * `settings.subscribed` is the optimistic mirror set the instant a purchase
   * returns, so the UI does not sit spinning while a webhook lands.
   *
   * Screens read `plus`. Nothing that matters is protected by it — the real
   * boundary is RLS on the server. This gates depth of history, not access to
   * anything a person owns, and NEVER anything under Get home safe.
   */
  plus: boolean;
  entitled: boolean;
  refreshEntitlement(): Promise<void>;
  /* auth */
  signInWithEmail(email: string): Promise<void>;
  verifyOtp(code: string): Promise<boolean>;
  signInWithProvider(result: { userId?: string; email?: string | null; displayName?: string | null }): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  setPendingHref(href: string | null): void;
  /* onboarding */
  submitDob(dob: string): { ok: boolean; underage: boolean };
  completeOnboarding(): void;
  updateProfile(patch: Partial<Profile>): void;
  /* logging */
  addLog(draft: LogDraft): Log;
  repeatLast(): Log | null;
  logWater(): Log;
  editLog(id: string, patch: Partial<Log>): void;
  deleteLog(id: string): void;
  undoLast(): void;
  /* sessions */
  startSession(input: { title?: string | null; venueId?: string | null; visibility: Visibility; planId?: string | null }): Session;
  endSession(id: string, input: { mood: Mood | null; safeHome: boolean }): void;
  updateSessionVisibility(id: string, visibility: Visibility): void;
  activeSession: Session | null;
  /* social */
  setRsvp(planId: string, rsvp: Rsvp): void;
  voteVenue(planId: string, venueId: string): void;
  createPlan(input: { title: string; startsAt: number; note: string | null; venueIds: string[]; inviteeIds: string[] }): Plan;
  createCrew(input: { name: string; icon: Crew['icon']; accentIndex: number; memberIds?: string[] }): Crew;
  joinCrew(code: string): Crew | null;
  addVenue(input: { name: string; area: string | null; category: string | null }): Venue;
  addFriend(personId: string): void;
  respondToRequest(personId: string, accept: boolean): void;
  blockUser(personId: string): void;
  unblockUser(personId: string): void;
  reportTarget(input: Omit<Report, 'id' | 'at'>): void;
  markNotificationsRead(): void;
  /* wellbeing */
  setGoal(goal: Goal): void;
  /* safety */
  armSafeArrival(input: { deadlineAt: number; message: string; contactIds: string[] }): void;
  resolveSafeArrival(): void;
  addTrustedContact(c: Omit<TrustedContact, 'id'>): void;
  removeTrustedContact(id: string): void;
  shareLocationFor(hours: number): void;
  /* settings */
  updateSettings(patch: Partial<Settings>): void;
  /** Absorbs venues from the provider, keyed so the same pub never doubles. */
  mergeVenues(incoming: Venue[]): void;
  seedDemoHistory(): Promise<void>;
  clearAllData(): Promise<void>;
  exportData(): string;
  /* helpers */
  lastLog: Log | null;
  favourites: Drink[];
  undoable: Log | null;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [queue, setQueue] = useState<QueueState>(logQueue.state());
  const undoRef = useRef<Log | null>(null);

  /* --------------------------------------------------------- hydration */
  useEffect(() => {
    (async () => {
      await logQueue.load();
      const [auth, profile, logs, sessions, people, crews, plans, goals, safety, blocked, reports, notifications, settings] =
        await Promise.all([
          readJson<AuthState>(KEYS.auth, INITIAL.auth),
          readJson<Profile | null>(KEYS.profile, null),
          readJson<Log[]>(KEYS.logs, []),
          readJson<Session[]>(KEYS.sessions, []),
          readJson<Person[]>(KEYS.people, []),
          readJson<Crew[]>(KEYS.crews, []),
          readJson<Plan[]>(KEYS.plans, []),
          readJson<Goal[]>(KEYS.goals, DEFAULT_GOALS),
          readJson<SafetyState>(KEYS.safety, INITIAL.safety),
          readJson<string[]>(KEYS.blocks, []),
          readJson<Report[]>(KEYS.reports, []),
          readJson<AppNotification[]>(KEYS.notifications, []),
          readJson<Settings>(KEYS.settings, DEFAULT_SETTINGS),
        ]);
      dispatch({
        type: 'hydrate',
        payload: {
          auth: { ...auth, status: auth.userId ? 'signed_in' : 'signed_out', pendingHref: auth.pendingHref ?? null },
          profile,
          logs,
          sessions,
          people,
          crews,
          plans,
          goals,
          safety,
          blocked,
          reports,
          notifications,
          settings: { ...DEFAULT_SETTINGS, ...settings },
        },
      });
    })();
    return logQueue.subscribe(setQueue);
  }, []);

  /* --------------------------------------------------------- persistence */
  const persist = useCallback((key: string, value: unknown) => void writeJson(key, value), []);
  useEffect(() => { if (state.hydrated) persist(KEYS.auth, state.auth); }, [state.auth, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.profile, state.profile); }, [state.profile, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.logs, state.logs); }, [state.logs, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.sessions, state.sessions); }, [state.sessions, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.people, state.people); }, [state.people, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.crews, state.crews); }, [state.crews, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.plans, state.plans); }, [state.plans, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.goals, state.goals); }, [state.goals, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.safety, state.safety); }, [state.safety, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.blocks, state.blocked); }, [state.blocked, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.reports, state.reports); }, [state.reports, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.notifications, state.notifications); }, [state.notifications, state.hydrated, persist]);
  useEffect(() => { if (state.hydrated) persist(KEYS.settings, state.settings); }, [state.settings, state.hydrated, persist]);

  /**
   * Feedback reads its switches from a module-level variable rather than a
   * hook, so that a cue can be fired from a service or a reducer and not only
   * from a component. This is the one place that keeps it in step with state.
   */
  const { sound, haptics } = state.settings;
  useEffect(() => {
    configureFeedback({ sound, haptics });
    if (!sound) releaseFeedback();
  }, [sound, haptics]);

  /**
   * Demo hook: a host page (the web preview) can ask for the has-history state
   * by setting `rounds.wants-demo` before load. It is consumed once and cleared,
   * and it can only ever ADD demo data — it never touches real logs, because it
   * only fires when there are none.
   */
  useEffect(() => {
    if (!state.hydrated || state.logs.length > 0) return;
    void (async () => {
      const flag = await readJson<string | null>('rounds.wants-demo', null);
      if (!flag) return;
      await remove('rounds.wants-demo');
      const currency = state.profile?.currency ?? 'EUR';
      const { logs, sessions } = demoHistory(state.auth.userId ?? 'me', currency);
      dispatch({
        type: 'set',
        payload: {
          logs, sessions,
          people: DEMO_PEOPLE, crews: DEMO_CREWS,
          plans: demoPlans(), notifications: demoNotifications(),
        },
      });
    })();
  }, [state.hydrated, state.logs.length, state.profile?.currency, state.auth.userId]);

  /**
   * Entitlement is whatever the server says. `settings.subscribed` unlocks the
   * UI optimistically after a purchase; this is what makes it true, and it is
   * re-checked on every cold start.
   */
  const [entitled, setEntitled] = useState(false);
  const refreshEntitlement = useCallback(async () => {
    if (!BILLING_VISIBLE) return;
    const server = await purchases.serverEntitlement().catch(() => purchases.NO_ENTITLEMENT);
    setEntitled(server.active);
  }, []);
  useEffect(() => {
    if (!state.hydrated) return;
    // While billing is hidden the store adapter is never configured and the
    // entitlement endpoint is never called. Hiding an interface that still
    // talks to RevenueCat on every cold start would be hiding nothing.
    if (!BILLING_VISIBLE) return;
    void purchases.configure(state.auth.userId);
    void refreshEntitlement();
  }, [state.hydrated, state.auth.userId, refreshEntitlement]);

  /**
   * Every action reads state through this ref rather than through the closure.
   *
   * The alternative — listing `state` in each action's deps — gives every
   * action a new identity on every store change, and any effect that depends on
   * one then re-fires on every unrelated mutation. That is how a venue fetch
   * ends up re-running because someone logged a drink.
   */
  const stateRef = useRef(state);
  stateRef.current = state;

  const activeSession = useMemo(
    () => state.sessions.find((s) => s.endedAt === null) ?? null,
    [state.sessions]
  );

  const liveRef = useRef(false);
  liveRef.current = state.sessions.some((s) => s.endedAt === null);

  useEffect(() => {
    void analytics.init().then(() => {
      analytics.installCrashReporting();
      analytics.track('app_open');
    });
    // The one notification rule, applied in one place rather than remembered by
    // each sender: nothing but safety interrupts a live night.
    push.configureHandler(() => liveRef.current);
    void push.ensureChannels();
    void push.registerCategories();
  }, []);

  const visibleLogs = useMemo(() => state.logs.filter((l) => !l.deleted), [state.logs]);

  const lastLog = useMemo(() => {
    const alcohol = visibleLogs.filter((l) => l.ethanolG > 0);
    return alcohol.length ? alcohol[alcohol.length - 1] : null;
  }, [visibleLogs]);

  /** Top 4 over 60 days, water always pinned first. */
  const favourites = useMemo(() => {
    const cutoff = Date.now() - 60 * 86400000;
    const counts = new Map<string, number>();
    for (const l of visibleLogs) {
      if (l.at < cutoff || l.category === 'water') continue;
      counts.set(l.drinkId, (counts.get(l.drinkId) ?? 0) + 1);
    }
    const ranked = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => byId(id))
      .filter((d): d is Drink => Boolean(d))
      .slice(0, 4);
    const fallback = CATALOG.filter((d) => ['beer-pint', 'wine-glass', 'spirit-double', 'gin-tonic'].includes(d.id));
    const list = ranked.length >= 4 ? ranked : [...ranked, ...fallback.filter((f) => !ranked.some((r) => r.id === f.id))].slice(0, 4);
    return [WATER, ...list];
  }, [visibleLogs]);

  /* ------------------------------------------------------------ actions */

  const makeLog = useCallback(
    (draft: LogDraft): Log => {
      const at = draft.at ?? Date.now();
      const { auth, profile, sessions } = stateRef.current;
      const live = sessions.find((s) => s.endedAt === null) ?? null;
      const userId = auth.userId ?? 'me';
      return {
        id: draft.id ?? uuid(), // client-generated: what makes the queue idempotent

        sessionId: live?.id ?? null,
        userId,
        drinkId: draft.drink.id,
        drinkName: draft.drink.name,
        category: draft.drink.category,
        volumeMl: draft.drink.volumeMl,
        abv: draft.drink.abv,
        ethanolG: draft.drink.ethanolG,
        priceMinor: draft.priceMinor ?? null,
        currency: profile?.currency ?? 'EUR',
        venueId: draft.venueId ?? live?.venueId ?? null,
        at,
        nightKey: nightKey(at),
        deleted: false,
        createdAt: Date.now(),
        source: draft.source ?? 'app',
        roundSize: draft.roundSize ?? null,
      };
    },
    // Reads everything through the ref, so it never needs to be rebuilt.
    []
  );

  const addLog = useCallback(
    (draft: LogDraft): Log => {
      const log = makeLog(draft);
      dispatch({ type: 'addLog', payload: log });
      undoRef.current = log;
      logQueue.enqueue({ id: log.id, op: 'insert_log', payload: log });
      analytics.track(draft.source && draft.source !== 'app' ? 'surface_log' : 'log_added', {
        source: log.source,
        category: log.category,   // an enum, never the drink's name
        hasPrice: log.priceMinor !== null,
      });
      return log;
    },
    [makeLog]
  );

  /**
   * Memoized. Without this the provider hands every consumer a new object on
   * every render, so a single RSVP tap re-renders all four tabs, the map's
   * markers and every aurora SVG in the stack. The actions themselves are
   * stable because they read through `stateRef`, so only real state changes
   * propagate.
   */
  const store: Store = useMemo(() => ({
    ...state,
    queue,
    // Hard true while billing is hidden. See BILLING_VISIBLE.
    plus: !BILLING_VISIBLE || entitled || stateRef.current.settings.subscribed,
    entitled,
    refreshEntitlement,
    activeSession,
    lastLog,
    favourites,
    undoable: undoRef.current,

    /* ---------------------------------------------------------- auth */
    async signInWithEmail(email) {
      dispatch({ type: 'set', payload: { auth: { ...stateRef.current.auth, pendingEmail: email } } });
      // Sends a real OTP when Supabase is configured; a no-op otherwise, and the
      // screen above cannot tell the difference.
      await remote.signInWithOtp(email);
    },
    async verifyOtp(code) {
      if (!/^\d{6}$/.test(code)) return false;

      let userId = stateRef.current.auth.userId ?? 'me';
      if (remote.isRemoteEnabled() && stateRef.current.auth.pendingEmail) {
        const session = await remote.verifyOtp(stateRef.current.auth.pendingEmail, code).catch(() => null);
        if (!session) return false;
        userId = session.user.id;
      }

      dispatch({
        type: 'set',
        payload: {
          auth: { ...stateRef.current.auth, status: 'signed_in', userId, email: stateRef.current.auth.pendingEmail, pendingEmail: null },
        },
      });
      return true;
    },
    /**
     * Takes the RESULT of a provider sheet, not the provider's name.
     *
     * The identity token was already exchanged for a Supabase session by
     * `src/services/auth.ts`; this only records who signed in. Apple hands over
     * the display name exactly once, on first authorisation, so it is captured
     * here or never.
     */
    async signInWithProvider(result) {
      const { auth, profile } = stateRef.current;
      dispatch({
        type: 'set',
        payload: {
          auth: {
            ...auth,
            status: 'signed_in',
            userId: result.userId ?? auth.userId ?? 'me',
            email: result.email ?? auth.email,
            pendingEmail: null,
          },
        },
      });
      if (result.displayName && !profile?.displayName) {
        dispatch({ type: 'patchProfile', payload: { displayName: result.displayName } });
      }
    },
    async signOut() {
      dispatch({ type: 'set', payload: { auth: { ...INITIAL.auth, status: 'signed_out' } } });
    },
    async deleteAccount() {
      // Server-side first: a 30-day grace and a cascade, then local wipe. The
      // user is signed out immediately either way.
      await remote.requestAccountDeletion().catch(() => {});
      await Promise.all(Object.values(KEYS).map((k) => remove(k)));
      await logQueue.clear();
      dispatch({ type: 'reset' });
    },
    setPendingHref(href) {
      dispatch({ type: 'set', payload: { auth: { ...stateRef.current.auth, pendingHref: href } } });
    },

    /* ---------------------------------------------------- onboarding */
    submitDob(dob) {
      const born = new Date(dob);
      const age = Math.floor((Date.now() - born.getTime()) / (365.2425 * 86400000));
      const minimum = stateRef.current.profile?.region === 'US' ? 21 : 18;
      if (age < minimum) {
        dispatch({
          type: 'set',
          payload: { auth: { ...stateRef.current.auth, underageBlocked: true, ageVerified: false } },
        });
        return { ok: false, underage: true };
      }
      // The server is the authority on age and keeps the answer, so a reinstall
      // cannot reset it. Locally we mirror the result for the gate above.
      void remote.verifyAge(dob).catch(() => null);
      dispatch({ type: 'set', payload: { auth: { ...stateRef.current.auth, ageVerified: true } } });
      const base: Profile = stateRef.current.profile ?? {
        id: stateRef.current.auth.userId ?? 'me',
        displayName: '',
        username: '',
        avatarUrl: null,
        level: 1,
        unitSystem: 'EU',
        currency: 'EUR',
        weightKg: null,
        sex: null,
        dob,
        region: 'RO',
        onboarded: false,
        bio: null,
        avatarTint: null,
        homeCity: null,
        signatureDrinkId: null,
        privateAccount: false,
        defaultVisibility: 'friends',
        modules: { nicotine: false, social: true },
        intent: [],
        createdAt: Date.now(),
      };
      dispatch({ type: 'set', payload: { profile: { ...base, dob } } });
      return { ok: true, underage: false };
    },
    completeOnboarding() {
      dispatch({ type: 'patchProfile', payload: { onboarded: true } });
      if (stateRef.current.notifications.length === 0) {
        dispatch({ type: 'set', payload: { notifications: [] } });
      }
    },
    updateProfile(patch) {
      dispatch({ type: 'patchProfile', payload: patch });
      const current = stateRef.current.profile;
      if (!current) return;
      // Queued rather than sent, so an edit made offline still lands. The
      // queue dedupes on id+op, so ten keystrokes are one write.
      logQueue.enqueue({ id: current.id, op: 'upsert_profile', payload: { ...current, ...patch } });
    },

    /* ------------------------------------------------------- logging */
    addLog,
    repeatLast() {
      if (!lastLog) return null;
      const drink = byId(lastLog.drinkId);
      if (!drink) return null;
      return addLog({ drink, priceMinor: lastLog.priceMinor });
    },
    logWater() {
      return addLog({ drink: WATER, priceMinor: 0 });
    },
    editLog(id, patch) {
      dispatch({ type: 'patchLog', id, payload: patch });
      const log = stateRef.current.logs.find((l) => l.id === id);
      if (log) logQueue.enqueue({ id, op: 'update_log', payload: { ...log, ...patch } });
    },
    deleteLog(id) {
      // Tombstone, never a hard delete — a synced row that vanishes is a sync bug
      // waiting to happen on the next device.
      dispatch({ type: 'patchLog', id, payload: { deleted: true } });
      logQueue.enqueue({ id, op: 'delete_log', payload: { id } });
    },
    undoLast() {
      const log = undoRef.current;
      if (!log) return;
      undoRef.current = null;
      dispatch({ type: 'patchLog', id: log.id, payload: { deleted: true } });
      logQueue.enqueue({ id: log.id, op: 'delete_log', payload: { id: log.id } });
    },

    /* ------------------------------------------------------ sessions */
    startSession(input) {
      const now = Date.now();
      const session: Session = {
        id: uuid(),
        ownerId: stateRef.current.auth.userId ?? 'me',
        planId: input.planId ?? null,
        venueId: input.venueId ?? null,
        title: input.title ?? null,
        visibility: input.visibility,
        joinCode:
          input.visibility === 'private'
            ? null
            : uuid().replace(/-/g, '').slice(0, 8).toUpperCase(),
        startedAt: now,
        endedAt: null,
        safeHomeAt: null,
        mood: null,
        nightKey: nightKey(now),
        accentIndex: stateRef.current.sessions.length % 4,
      };
      dispatch({ type: 'addSession', payload: session });
      logQueue.enqueue({ id: session.id, op: 'upsert_session', payload: session });
      analytics.track('session_start', { visibility: session.visibility, fromPlan: Boolean(session.planId) });
      return session;
    },
    endSession(id, input) {
      const now = Date.now();
      const patch = {
        endedAt: now,
        mood: input.mood,
        safeHomeAt: input.safeHome ? now : null,
      };
      dispatch({ type: 'patchSession', id, payload: patch });
      logQueue.enqueue({ id, op: 'end_session', payload: { id, ...patch } });
      analytics.track('session_end', { gaveMood: input.mood !== null, homeSafe: input.safeHome });
      // The morning recap is scheduled locally, so it arrives even if the phone
      // spends the night with no signal.
      if (stateRef.current.settings.notifications.morning) {
        void push.scheduleMorningRecap(9, id);
      }
    },
    updateSessionVisibility(id, visibility) {
      dispatch({ type: 'patchSession', id, payload: { visibility } });
      // Send the WHOLE session, not just the changed field. The queue dedupes on
      // id+op by replacing, so a partial payload enqueued while a full one is
      // still waiting would drop owner_id and started_at — and the upsert would
      // then fail against NOT NULL columns and burn every retry.
      const session = stateRef.current.sessions.find((s) => s.id === id);
      logQueue.enqueue({
        id,
        op: 'upsert_session',
        payload: session ? { ...session, visibility } : { id, visibility },
      });
    },

    /* -------------------------------------------------------- social */
    setRsvp(planId, rsvp) {
      const me = stateRef.current.auth.userId ?? 'me';
      dispatch({
        type: 'set',
        payload: {
          plans: stateRef.current.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  invitees: p.invitees.map((i) => (i.userId === me ? { ...i, rsvp } : i)),
                }
              : p
          ),
        },
      });
    },
    voteVenue(planId, venueId) {
      const me = stateRef.current.auth.userId ?? 'me';
      dispatch({
        type: 'set',
        payload: {
          plans: stateRef.current.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  venueCandidates: p.venueCandidates.map((c) => ({
                    ...c,
                    votes:
                      c.venueId === venueId
                        ? c.votes.includes(me)
                          ? c.votes
                          : [...c.votes, me]
                        : c.votes.filter((v) => v !== me),
                  })),
                }
              : p
          ),
        },
      });
    },
    createPlan(input) {
      const me = stateRef.current.auth.userId ?? 'me';
      const plan: Plan = {
        id: uuid(),
        title: input.title,
        startsAt: input.startsAt,
        crewId: null,
        note: input.note,
        createdBy: me,
        invitees: [
          { userId: me, displayName: 'You', avatarUrl: null, rsvp: 'yes' },
          ...input.inviteeIds.map((id) => {
            const p = stateRef.current.people.find((x) => x.id === id);
            return {
              userId: id,
              displayName: p?.displayName ?? 'Someone',
              avatarUrl: p?.avatarUrl ?? null,
              rsvp: null as Rsvp,
            };
          }),
        ],
        venueCandidates: input.venueIds.map((vid) => ({
          venueId: vid,
          name: stateRef.current.venues.find((v) => v.id === vid)?.name ?? 'Venue',
          votes: [],
        })),
      };
      dispatch({ type: 'set', payload: { plans: [...stateRef.current.plans, plan] } });
      return plan;
    },
    createCrew(input) {
      const me = stateRef.current.auth.userId ?? 'me';
      // The slug is what a join link carries, so it has to be unique locally
      // before it is unique on the server. A collision gets a numeric suffix
      // rather than silently replacing the crew already using that slug.
      const bare = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'crew';
      const taken = new Set(stateRef.current.crews.map((c) => c.slug));
      let slug = bare;
      for (let i = 2; taken.has(slug); i++) slug = `${bare}-${i}`;

      const crew: Crew = {
        id: uuid(),
        slug,
        name: input.name.trim(),
        accentIndex: input.accentIndex,
        icon: input.icon,
        memberIds: [me, ...(input.memberIds ?? [])],
      };
      dispatch({ type: 'set', payload: { crews: [...stateRef.current.crews, crew] } });
      return crew;
    },
    joinCrew(code) {
      // Locally a join code IS the slug. The server resolves a real invite code
      // to a crew; until it answers, matching what we already know is the only
      // honest thing the client can do — and it must not invent a crew that
      // does not exist, so an unknown code returns null and the screen says so.
      const slug = code.trim().toLowerCase();
      const crew = stateRef.current.crews.find((c) => c.slug === slug || c.id === slug);
      if (!crew) return null;
      const me = stateRef.current.auth.userId ?? 'me';
      if (crew.memberIds.includes(me)) return crew;
      const joined = { ...crew, memberIds: [...crew.memberIds, me] };
      dispatch({
        type: 'set',
        payload: { crews: stateRef.current.crews.map((c) => (c.id === crew.id ? joined : c)) },
      });
      return joined;
    },
    addVenue(input) {
      const venue: Venue = {
        id: uuid(),
        providerId: null, // hand-added: it belongs to no provider and never will
        name: input.name.trim(),
        area: input.area?.trim() || null,
        lat: null,
        lng: null,
        priceBand: null,
        category: input.category,
      };
      dispatch({ type: 'set', payload: { venues: [...stateRef.current.venues, venue] } });
      return venue;
    },
    addFriend(personId) {
      dispatch({
        type: 'set',
        payload: {
          people: stateRef.current.people.map((p) => (p.id === personId ? { ...p, status: 'pending_out' } : p)),
        },
      });
    },
    respondToRequest(personId, accept) {
      dispatch({
        type: 'set',
        payload: {
          people: stateRef.current.people.map((p) =>
            p.id === personId ? { ...p, status: accept ? 'friend' : 'none' } : p
          ),
        },
      });
    },
    blockUser(personId) {
      // Bidirectional and immediate: they vanish from search, friends, crews,
      // live rooms and plans in the same tick.
      dispatch({
        type: 'set',
        payload: {
          blocked: stateRef.current.blocked.includes(personId) ? stateRef.current.blocked : [...stateRef.current.blocked, personId],
          people: stateRef.current.people.map((p) => (p.id === personId ? { ...p, status: 'blocked', liveNow: false } : p)),
          plans: stateRef.current.plans.map((p) => ({
            ...p,
            invitees: p.invitees.filter((i) => i.userId !== personId),
          })),
          crews: stateRef.current.crews.map((c) => ({ ...c, memberIds: c.memberIds.filter((m) => m !== personId) })),
        },
      });
    },
    unblockUser(personId) {
      dispatch({
        type: 'set',
        payload: {
          blocked: stateRef.current.blocked.filter((b) => b !== personId),
          people: stateRef.current.people.map((p) => (p.id === personId ? { ...p, status: 'none' } : p)),
        },
      });
    },
    reportTarget(input) {
      const report: Report = { ...input, id: uuid(), at: Date.now() };
      dispatch({ type: 'set', payload: { reports: [...stateRef.current.reports, report] } });
    },
    markNotificationsRead() {
      // Guarded, because an unconditional dispatch here always produces a NEW
      // array — which re-renders the provider, which gives the caller's effect
      // a new function identity, which calls this again. That was a real
      // infinite loop: one dispatch and one disk write every 600ms, forever.
      const { notifications } = stateRef.current;
      if (!notifications.some((n) => !n.read)) return;
      dispatch({
        type: 'set',
        payload: { notifications: notifications.map((n) => ({ ...n, read: true })) },
      });
    },

    /* ----------------------------------------------------- wellbeing */
    setGoal(goal) {
      dispatch({
        type: 'set',
        payload: {
          goals: stateRef.current.goals.some((g) => g.type === goal.type)
            ? stateRef.current.goals.map((g) => (g.type === goal.type ? goal : g))
            : [...stateRef.current.goals, goal],
        },
      });
    },

    /* -------------------------------------------------------- safety */
    armSafeArrival(input) {
      analytics.track('check_armed', { hours: Math.round((input.deadlineAt - Date.now()) / 3600000), contacts: input.contactIds.length });
      void push.scheduleSafetyReminder(input.deadlineAt, input.message);
      dispatch({
        type: 'patchSafety',
        payload: {
          activeCheck: {
            id: uuid(),
            deadlineAt: input.deadlineAt,
            armedAt: Date.now(),
            resolvedAt: null,
            message: input.message,
            contactIds: input.contactIds,
          },
        },
      });
    },
    resolveSafeArrival() {
      analytics.track('check_resolved');
      void push.cancelSafetyReminders();
      dispatch({ type: 'patchSafety', payload: { activeCheck: null } });
    },
    addTrustedContact(c) {
      if (stateRef.current.safety.contacts.length >= 3) return;
      dispatch({
        type: 'patchSafety',
        payload: { contacts: [...stateRef.current.safety.contacts, { ...c, id: uuid() }] },
      });
    },
    removeTrustedContact(id) {
      dispatch({
        type: 'patchSafety',
        payload: { contacts: stateRef.current.safety.contacts.filter((c) => c.id !== id) },
      });
    },
    shareLocationFor(hours) {
      dispatch({
        type: 'patchSafety',
        payload: { locationSharingUntil: Date.now() + hours * 3600000 },
      });
    },

    /* ------------------------------------------------------ settings */
    updateSettings(patch) {
      dispatch({ type: 'patchSettings', payload: patch });
    },
    mergeVenues(incoming) {
      if (incoming.length === 0) return;
      const byKey = new Map(stateRef.current.venues.map((v) => [v.id, v]));
      let changed = false;
      for (const v of incoming) {
        if (!byKey.has(v.id)) { byKey.set(v.id, v); changed = true; }
      }
      if (!changed) return;
      // Bounded: a user who walks across a city should not accumulate every bar
      // in it forever.
      dispatch({ type: 'set', payload: { venues: [...byKey.values()].slice(-400) } });
    },
    async seedDemoHistory() {
      const currency = stateRef.current.profile?.currency ?? 'EUR';
      const { logs, sessions } = demoHistory(stateRef.current.auth.userId ?? 'me', currency);
      dispatch({
        type: 'set',
        payload: {
          logs,
          sessions,
          people: DEMO_PEOPLE,
          crews: DEMO_CREWS,
          plans: demoPlans(),
          notifications: demoNotifications(),
        },
      });
    },
    async clearAllData() {
      dispatch({
        type: 'set',
        payload: { logs: [], sessions: [], people: [], crews: [], plans: [], notifications: [] },
      });
      await logQueue.clear();
    },
    exportData() {
      return JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          profile: stateRef.current.profile,
          logs: stateRef.current.logs,
          sessions: stateRef.current.sessions,
          goals: stateRef.current.goals,
          settings: stateRef.current.settings,
        },
        null,
        2
      );
    },
  }),
    // `state` is the only thing that should invalidate this. The actions close
    // over `stateRef`, not over `state`, so they never need to be listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, queue, entitled, addLog, activeSession, lastLog, favourites, refreshEntitlement]
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
