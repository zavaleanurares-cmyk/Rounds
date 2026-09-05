import { nicotineThisWeek, nicotineFreeDays, NICOTINE, isNicotine } from '@/domain/nicotine';
import { goalProgress } from '@/domain/stats';
import { nightKey } from '@/domain/nightKey';
import type { Log } from '@/domain/types';

/**
 * The nicotine module used to be a shell: two literal zeros on a dashboard, a
 * "Log nicotine" button that opened the drinks sheet, no nicotine category to
 * log into, and a `nicotine_free` goal type with no branch in `goalProgress`,
 * so its ring read 0% whatever anybody did.
 *
 * These are the two counts that screen shows and the goal behind them.
 */

const DAY = 86400000;

function log(at: number, over: Partial<Log> = {}): Log {
  return {
    id: `${at}`,
    sessionId: null,
    userId: 'me',
    drinkId: 'cigarette',
    drinkName: 'Cigarette',
    category: 'nicotine',
    volumeMl: 0,
    abv: 0,
    ethanolG: 0,
    priceMinor: null,
    currency: 'EUR',
    venueId: null,
    at,
    nightKey: nightKey(at),
    deleted: false,
    ...over,
  } as Log;
}

describe('the nicotine entries', () => {
  it('contain no alcohol, by derivation rather than by assertion', () => {
    // Zero volume and zero ABV means `ethanolG` cannot be anything else, which
    // is what keeps every alcohol total in the app correct without a filter.
    for (const d of NICOTINE) {
      expect(d.ethanolG).toBe(0);
      expect(d.category).toBe('nicotine');
    }
  });

  it('are not in the drink catalogue', () => {
    // The log sheet is a grid of drinks. A cigarette between a Negroni and a
    // pint is in the way of everybody who does not smoke.
    const { CATALOG } = require('@/domain/catalog');
    for (const d of NICOTINE) {
      expect(CATALOG.find((x: { id: string }) => x.id === d.id)).toBeUndefined();
    }
  });
});

describe('counting', () => {
  // A Wednesday, so "this week" has a Monday behind it and days ahead of it.
  const wed = new Date(2026, 8, 2, 20, 0, 0).getTime();

  it('counts what was logged since Monday', () => {
    const logs = [log(wed), log(wed - DAY), log(wed - 9 * DAY)];
    expect(nicotineThisWeek(logs, wed)).toBe(2);
  });

  it('ignores a deleted log', () => {
    expect(nicotineThisWeek([log(wed), log(wed - 1000, { deleted: true })], wed)).toBe(1);
  });

  it('ignores drinks', () => {
    const drink = log(wed, { category: 'beer', ethanolG: 16, drinkId: 'beer-pint' });
    expect(nicotineThisWeek([drink], wed)).toBe(0);
    expect(isNicotine(drink)).toBe(false);
  });

  it('counts a free streak in nights, not in calendar days', () => {
    // 02:00 on Saturday morning belongs to Friday night — this app's day ends
    // at 04:00. Counting calendar days would tell somebody they were a day
    // clean when they smoked six hours ago.
    const satMorning = new Date(2026, 8, 5, 2, 0, 0).getTime();
    const satEvening = new Date(2026, 8, 5, 22, 0, 0).getTime();
    expect(nicotineFreeDays([log(satMorning)], satEvening)).toBe(0);
  });

  it('counts completed nights, so tonight is not banked before it ends', () => {
    // Smoked on Sunday night, now Wednesday evening: Monday and Tuesday are
    // over and clean. Wednesday is in progress and does not count yet.
    expect(nicotineFreeDays([log(wed - 3 * DAY)], wed)).toBe(2);
  });

  it('reports no streak for somebody who has never logged one', () => {
    // Zero rather than 365: a streak needs a before, and "you have been clean
    // for a year" is not something to tell a person on their first launch.
    expect(nicotineFreeDays([], wed)).toBe(0);
  });
});

describe('the nicotine_free goal', () => {
  const now = Date.now();

  it('progresses on days clean', () => {
    const goal = { type: 'nicotine_free' as const, target: 7, enabled: true };
    const p = goalProgress([log(now - 3 * DAY)], goal);
    expect(p.value).toBe(2);
    expect(p.pct).toBeCloseTo(2 / 7, 5);
  });

  it('is not stuck at zero, which is what it used to be for everybody', () => {
    const goal = { type: 'nicotine_free' as const, target: 30, enabled: true };
    expect(goalProgress([log(now - 10 * DAY)], goal).value).toBeGreaterThan(0);
  });

  it('resets the moment one is logged', () => {
    const goal = { type: 'nicotine_free' as const, target: 7, enabled: true };
    expect(goalProgress([log(now)], goal).value).toBe(0);
  });
});
