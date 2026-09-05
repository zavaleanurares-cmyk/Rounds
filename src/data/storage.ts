import AsyncStorage from '@react-native-async-storage/async-storage';

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* best effort — never block the UI on storage */
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const KEYS = {
  profile: 'rounds.profile.v1',
  logs: 'rounds.logs.v1',
  sessions: 'rounds.sessions.v1',
  people: 'rounds.people.v1',
  plans: 'rounds.plans.v1',
  crews: 'rounds.crews.v1',
  venues: 'rounds.venues.v1',
  goals: 'rounds.goals.v1',
  safety: 'rounds.safety.v1',
  blocks: 'rounds.blocks.v1',
  reports: 'rounds.reports.v1',
  notifications: 'rounds.notifications.v1',
  settings: 'rounds.settings.v1',
  auth: 'rounds.auth.v1',
  seeded: 'rounds.seeded.v2',
  /** What the user has already been shown a celebration for. */
  celebrated: 'rounds.celebrated.v1',
} as const;
