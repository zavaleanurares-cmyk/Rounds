/**
 * Demo history.
 *
 * Every data screen has to render three account states: signed out, zero data
 * (night one), and has history. The zero-data state is the one apps get wrong,
 * so it is the DEFAULT here — a fresh install lands on night one and you can
 * see the real first-run copy. `seedDemoHistory()` is what Settings › Demo data
 * calls to flip into the has-history state.
 */
import type { Log, Session, Person, Plan, Crew, Venue, AppNotification } from '@/domain/types';
import type { Locale } from '@/i18n';
import { translate } from '@/i18n/translate';
import { CATALOG, WATER } from '@/domain/catalog';
import { nightKey } from '@/domain/nightKey';
import { uuid } from './uuid';

export const DEMO_VENUES: Venue[] = [
  { id: 'v1', providerId: null, name: 'Enigma', area: 'Cluj-Napoca', lat: 46.7712, lng: 23.5859, priceBand: 2, category: 'Cocktail bar' },
  { id: 'v2', providerId: null, name: 'Form Space', area: 'Cluj-Napoca', lat: 46.7801, lng: 23.6142, priceBand: 2, category: 'Club' },
  { id: 'v3', providerId: null, name: 'Joben Bistro', area: 'Cluj-Napoca', lat: 46.7705, lng: 23.5921, priceBand: 3, category: 'Bar' },
  { id: 'v4', providerId: null, name: 'Roots', area: 'Cluj-Napoca', lat: 46.7688, lng: 23.5895, priceBand: 1, category: 'Pub' },
  { id: 'v5', providerId: null, name: 'Yolka', area: 'Cluj-Napoca', lat: 46.7731, lng: 23.5807, priceBand: 2, category: 'Bar' },
  { id: 'v6', providerId: null, name: 'Janis', area: 'Cluj-Napoca', lat: 46.7669, lng: 23.5866, priceBand: 1, category: 'Club' },
];

export const DEMO_PEOPLE: Person[] = [
  { id: 'p1', displayName: 'Ana Marin', username: 'anam', avatarUrl: null, level: 7, sharedNights: 14, mutualCrews: ['Vineri'], status: 'friend', liveNow: true },
  { id: 'p2', displayName: 'Tudor', username: 'tudorr', avatarUrl: null, level: 5, sharedNights: 9, mutualCrews: ['Vineri'], status: 'friend', liveNow: true },
  { id: 'p3', displayName: 'Ilinca', username: 'ilinca', avatarUrl: null, level: 4, sharedNights: 6, mutualCrews: [], status: 'friend', liveNow: false },
  { id: 'p4', displayName: 'Mihai P.', username: 'mihaip', avatarUrl: null, level: 9, sharedNights: 3, mutualCrews: ['Vineri'], status: 'friend', liveNow: false },
  { id: 'p5', displayName: 'Sara', username: 'saraq', avatarUrl: null, level: 2, sharedNights: 0, mutualCrews: [], status: 'pending_in', liveNow: false },
  { id: 'p6', displayName: 'Radu', username: 'raduv', avatarUrl: null, level: 3, sharedNights: 0, mutualCrews: [], status: 'none', liveNow: false },
];

export const DEMO_CREWS: Crew[] = [
  { id: 'c1', slug: 'vineri', name: 'Vineri', accentIndex: 1, icon: 'moon.stars', memberIds: ['me', 'p1', 'p2', 'p4'] },
];

export function demoPlans(locale: Locale = 'en'): Plan[] {
  const friday = new Date();
  friday.setDate(friday.getDate() + ((5 - friday.getDay() + 7) % 7 || 7));
  friday.setHours(21, 30, 0, 0);
  return [
    {
      id: 'plan1',
      title: translate(locale, 'common.demoPlanTitle'),
      startsAt: friday.getTime(),
      crewId: 'c1',
      note: translate(locale, 'common.demoPlanNote'),
      createdBy: 'p1',
      invitees: [
        { userId: 'me', displayName: translate(locale, 'common.you'), avatarUrl: null, rsvp: 'yes' },
        { userId: 'p1', displayName: 'Ana Marin', avatarUrl: null, rsvp: 'yes' },
        { userId: 'p2', displayName: 'Tudor', avatarUrl: null, rsvp: 'yes' },
        { userId: 'p4', displayName: 'Mihai P.', avatarUrl: null, rsvp: 'maybe' },
        { userId: 'p3', displayName: 'Ilinca', avatarUrl: null, rsvp: null },
      ],
      venueCandidates: [
        { venueId: 'v4', name: 'Roots', votes: ['p1', 'p2', 'me'] },
        { venueId: 'v1', name: 'Enigma', votes: ['p4'] },
        { venueId: 'v5', name: 'Yolka', votes: [] },
      ],
    },
  ];
}

/**
 * The demo tray. A notification carries finished copy rather than a key —
 * that is the shape a real one arrives in — so it is rendered in the language
 * the account was seeded in.
 */
export function demoNotifications(locale: Locale): AppNotification[] {
  const now = Date.now();
  const t = (key: string) => translate(locale, key);
  return [
    { id: uuid(), kind: 'plan', title: t('common.demoPlanNotificationTitle'), body: t('common.demoPlanNotificationBody'), at: now - 3 * 3600000, read: false, href: '/plan/plan1' },
    { id: uuid(), kind: 'social', title: t('common.demoRequestNotificationTitle'), body: t('common.demoRequestNotificationBody'), at: now - 26 * 3600000, read: false, href: '/people/requests' },
    { id: uuid(), kind: 'morning', title: t('common.demoMorningNotificationTitle'), body: t('common.demoMorningNotificationBody'), at: now - 30 * 3600000, read: true, href: null },
  ];
}

/** Deterministic-ish history: ~14 weeks of plausible nights. */
export function demoHistory(userId: string, currency: string): { logs: Log[]; sessions: Session[] } {
  const logs: Log[] = [];
  const sessions: Session[] = [];
  const now = new Date();
  let rand = 42;
  const rnd = () => {
    rand = (rand * 1103515245 + 12345) % 2147483648;
    return rand / 2147483648;
  };

  for (let week = 13; week >= 0; week--) {
    // Most weeks: one Friday and one Saturday night. Some weeks: neither.
    const outNights = rnd() < 0.15 ? [] : rnd() < 0.45 ? [5] : [5, 6];
    for (const dow of outNights) {
      const start = new Date(now);
      start.setDate(start.getDate() - week * 7 - ((start.getDay() - dow + 7) % 7));
      start.setHours(21, Math.floor(rnd() * 50), 0, 0);
      if (start.getTime() > now.getTime()) continue;

      const durationH = 3 + rnd() * 3;
      const end = new Date(start.getTime() + durationH * 3600000);
      const venue = DEMO_VENUES[Math.floor(rnd() * DEMO_VENUES.length)];
      const sessionId = uuid();
      sessions.push({
        id: sessionId,
        ownerId: userId,
        planId: null,
        venueId: venue.id,
        title: null,
        visibility: 'friends',
        joinCode: null,
        startedAt: start.getTime(),
        endedAt: end.getTime(),
        safeHomeAt: end.getTime() + 40 * 60000,
        mood: (['great', 'good', 'good', 'rough'] as const)[Math.floor(rnd() * 4)],
        nightKey: nightKey(start),
        accentIndex: Math.floor(rnd() * 4),
      });

      const drinkCount = 2 + Math.floor(rnd() * 5);
      const pool = CATALOG.filter((c) => c.ethanolG > 0);
      for (let i = 0; i < drinkCount; i++) {
        const drink = pool[Math.floor(rnd() * pool.length)];
        const at = start.getTime() + (i * durationH * 3600000) / drinkCount + rnd() * 900000;
        logs.push({
          id: uuid(),
          sessionId,
          userId,
          drinkId: drink.id,
          drinkName: drink.name,
          category: drink.category,
          volumeMl: drink.volumeMl,
          abv: drink.abv,
          ethanolG: drink.ethanolG,
          priceMinor: Math.round((1200 + rnd() * 2600) / 50) * 50,
          currency,
          venueId: venue.id,
          at,
          nightKey: nightKey(at),
          deleted: false,
          createdAt: at,
          source: 'app',
        });
      }
      // Water, sometimes.
      if (rnd() < 0.6) {
        const at = start.getTime() + durationH * 3600000 * 0.7;
        logs.push({
          id: uuid(),
          sessionId,
          userId,
          drinkId: WATER.id,
          drinkName: WATER.name,
          category: 'water',
          volumeMl: WATER.volumeMl,
          abv: 0,
          ethanolG: 0,
          priceMinor: 0,
          currency,
          venueId: venue.id,
          at,
          nightKey: nightKey(at),
          deleted: false,
          createdAt: at,
          source: 'app',
        });
      }
    }
  }
  logs.sort((a, b) => a.at - b.at);
  sessions.sort((a, b) => a.startedAt - b.startedAt);
  return { logs, sessions };
}
