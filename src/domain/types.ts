import type { UnitSystem } from './units';
import type { Sex } from './pace';
import type { DrinkArt } from './art';

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
  privateAccount: boolean;
  defaultVisibility: Visibility;
  modules: { nicotine: boolean; social: boolean };
  intent: string[];
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
