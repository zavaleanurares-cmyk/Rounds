import type { ReactionKind } from '@/ui/Reaction';
import type { UnitSystem } from './units';
import type { Sex } from './pace';
import type { DrinkArt } from './art';
import type { Locale } from '@/i18n/plurals';

export type Visibility = 'private' | 'friends' | 'crew' | 'link';
export type Mood = 'great' | 'good' | 'rough' | 'bad';
export type DrinkCategory = 'beer' | 'wine' | 'spirit' | 'cocktail' | 'shot' | 'soft' | 'water';

export interface Profile {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  unitSystem: UnitSystem;
  currency: string;
  weightKg: number | null;
  sex: Sex | null;
  dob: string | null;
  region: string;
  onboarded: boolean;
  /** A line about yourself. 140 characters, deliberately. */
  bio: string | null;
  /**
   * Index into the avatar palette. Null means "pick one from my name", which is
   * what every profile starts as — there is never a grey blob.
   */
  avatarTint: number | null;
  /** Coarse and user-typed. A city, never a coordinate. */
  homeCity: string | null;
  /** A drink from the catalogue, shown as its drawn glyph. */
  signatureDrinkId: string | null;
  privateAccount: boolean;
  defaultVisibility: Visibility;
  modules: { nicotine: boolean; social: boolean };
  intent: string[];
  /**
   * The language this account reads.
   *
   * Kept on the profile rather than only on the device because the server
   * composes and sends the notifications. Without it a Romanian user got a
   * Romanian app that woke them in English — including the safe-arrival
   * check-in, which is the one that has to be understood at 3am.
   */
  locale: Locale;
  /**
   * A mirror of the six switches on Settings › Notifications.
   *
   * Same reason: four of the six governed nothing, because every message the
   * product sends is composed server-side and the preference never left the
   * phone. `may_notify` reads this column.
   */
  notificationPrefs: Record<'morning' | 'weekly' | 'plans' | 'social' | 'safety' | 'gamification', boolean>;
  createdAt: number;
}

export interface Venue {
  id: string;
  providerId: string | null;
  name: string;
  area: string | null;
  lat: number | null;
  lng: number | null;
  priceBand: 1 | 2 | 3 | null;
  /**
   * Whether the provider says it is open right now.
   *
   * `null` means nobody told us — the OpenStreetMap fallback carries opening
   * hours as free text that would have to be parsed, and guessing at it is
   * worse than not answering. Transient by nature: it is whatever the last
   * search said, and the Open-now chip on Discover only appears when this can
   * be answered at all, so the filter is never a control that does nothing.
   */
  openNow?: boolean | null;
  category: string | null;
}

export interface Drink {
  id: string;
  name: string;
  category: DrinkCategory;
  volumeMl: number;
  abv: number;
  /** Canonical grams of ethanol for one serving of this drink. */
  ethanolG: number;
  /** How the drink is drawn. There are no emoji in this app — see art.ts. */
  art: DrinkArt;
  note?: string;
  /** IBA family, where the drink is an official cocktail. */
  family?: 'unforgettable' | 'contemporary' | 'newera';
}

/**
 * A consumption log. `id` is a client-generated UUID: that is what makes every
 * write path — in-app, widget, notification, voice, watch — idempotent by
 * construction. Never let the server mint this.
 */
export interface Log {
  id: string;
  sessionId: string | null;
  userId: string;
  drinkId: string;
  drinkName: string;
  category: DrinkCategory;
  volumeMl: number;
  abv: number;
  ethanolG: number;
  priceMinor: number | null;
  currency: string;
  venueId: string | null;
  at: number;
  nightKey: string;
  /** Deleting a synced row leaves a tombstone rather than vanishing. */
  deleted: boolean;
  createdAt: number;
  /**
   * Which surface logged this. The product's core promise is logging without
   * opening the app, so the share of logs made outside it is the number that
   * says whether the promise is being kept.
   */
  source: 'app' | 'live_activity' | 'notification' | 'widget' | 'tile' | 'voice' | 'watch';
  /**
   * How many people this drink was bought for, when it was logged from the
   * round sheet. Null for an ordinary log — it is not a count of drinks and it
   * never affects any consumption figure.
   */
  roundSize?: number | null;
}

export interface Session {
  id: string;
  ownerId: string;
  planId: string | null;
  venueId: string | null;
  title: string | null;
  visibility: Visibility;
  joinCode: string | null;
  startedAt: number;
  endedAt: number | null;
  safeHomeAt: number | null;
  mood: Mood | null;
  nightKey: string;
  accentIndex: number;
}

export interface Participant {
  sessionId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  joinedAt: number;
  isHost: boolean;
}

/**
 * One line in a live room: a message, or a reaction.
 *
 * `id` is a client-generated UUID, for the same reason a `Log`'s is — the queue
 * replays, and a replay must land on the row it already wrote. It is also what
 * the realtime handler dedupes on: the sender receives their OWN insert back
 * off the channel a moment after posting it, and must not see it twice.
 *
 * Exactly one of `text` and `reaction` is set. A reaction is one of the five
 * drawn kinds rather than free emoji — see `src/ui/Reaction.tsx` for why that
 * set is closed.
 */
export interface SessionMessage {
  id: string;
  sessionId: string;
  userId: string;
  /** Resolved when the row lands, because the server row carries only an id. */
  displayName: string;
  text: string | null;
  reaction: ReactionKind | null;
  at: number;
}

export interface Person {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  sharedNights: number;
  mutualCrews: string[];
  status: 'friend' | 'pending_in' | 'pending_out' | 'none' | 'blocked';
  liveNow: boolean;
}

export interface Crew {
  id: string;
  slug: string;
  name: string;
  /** Index into color.night — a crew reads as a colour, not as an emoji. */
  accentIndex: number;
  /** An icon from the app's own set. */
  icon: 'moon.stars' | 'flame' | 'sparkles' | 'bolt' | 'star' | 'person.2';
  memberIds: string[];
}

export type Rsvp = 'yes' | 'maybe' | 'no' | null;

export interface Plan {
  id: string;
  title: string;
  startsAt: number;
  crewId: string | null;
  note: string | null;
  createdBy: string;
  invitees: Array<{ userId: string; displayName: string; avatarUrl: string | null; rsvp: Rsvp }>;
  venueCandidates: Array<{ venueId: string; name: string; votes: string[] }>;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
}

export interface SafeArrivalCheck {
  id: string;
  deadlineAt: number;
  armedAt: number;
  resolvedAt: number | null;
  message: string;
  contactIds: string[];
}

export interface Goal {
  type: 'nightly_cap' | 'weekly_cap' | 'dry_days' | 'spend_cap' | 'nicotine_free';
  target: number;
  /** Canonical grams for alcohol goals, minor units for spend, count for days. */
  enabled: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  hint: string;
  earnedAt: number | null;
  group: 'exploration' | 'consistency' | 'moderation' | 'social';
}

export interface AppNotification {
  id: string;
  kind: 'plan' | 'social' | 'morning' | 'safety' | 'system';
  title: string;
  body: string;
  at: number;
  read: boolean;
  href: string | null;
}

export interface Report {
  id: string;
  targetType: 'user' | 'session' | 'message' | 'venue';
  targetId: string;
  reason: 'harassment' | 'spam' | 'impersonation' | 'inappropriate' | 'safety' | 'other';
  detail: string;
  at: number;
}
