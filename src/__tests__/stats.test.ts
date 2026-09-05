import { nightKey, nightWeekday, NIGHT_BOUNDARY_HOUR } from '@/domain/nightKey';
import {
  summariseNights, computeStreaks, spendTotals, heatmap, goalProgress, estimateMissedDrinks,
  hangoverForecast, formatMoney, formatDuration, plural,
} from '@/domain/stats';
import type { Log, Session } from '@/domain/types';

const mkLog = (over: Partial<Log>): Log => ({
  id: Math.random().toString(36),
  sessionId: 's1',
  userId: 'me',
  drinkId: 'beer-pint',
  drinkName: 'Pint',
  category: 'beer',
  volumeMl: 568,
  abv: 4.5,
  ethanolG: 20,
  priceMinor: 1500,
  currency: 'EUR',
  venueId: 'v1',
  at: Date.now(),
  nightKey: nightKey(Date.now()),
  deleted: false,
  createdAt: Date.now(),
  source: 'app',
  ...over,
});

describe('nightKey', () => {
  it('keeps a 2:30am drink on the previous night', () => {
    const lateSaturday = new Date(2026, 8, 5, 2, 30); // Sat 05 Sep, 02:30
    expect(nightKey(lateSaturday)).toBe('2026-09-04'); // Friday night
  });
  it('rolls over at the boundary hour, not midnight', () => {
    const justBefore = new Date(2026, 8, 5, NIGHT_BOUNDARY_HOUR - 1, 59);
    const justAfter = new Date(2026, 8, 5, NIGHT_BOUNDARY_HOUR, 1);
    expect(nightKey(justBefore)).toBe('2026-09-04');
    expect(nightKey(justAfter)).toBe('2026-09-05');
  });
  it('gives an evening drink its own date', () => {
    expect(nightKey(new Date(2026, 8, 4, 22, 0))).toBe('2026-09-04');
  });
  it('reports the weekday of the night, not of the calendar day', () => {
    expect(nightWeekday('2026-09-04')).toBe(5); // Friday
  });
});

describe('summariseNights', () => {
  it('separates drinks from water and sums spend', () => {
    const key = '2026-09-04';
    const at = new Date(2026, 8, 4, 22).getTime();
    const nights = summariseNights([
      mkLog({ at, nightKey: key, ethanolG: 20, priceMinor: 1500 }),
      mkLog({ at: at + 1, nightKey: key, ethanolG: 0, category: 'water', priceMinor: 0 }),
      mkLog({ at: at + 2, nightKey: key, ethanolG: 16, priceMinor: 900 }),
    ]);
    expect(nights).toHaveLength(1);
    expect(nights[0].drinks).toBe(2);
    expect(nights[0].waters).toBe(1);
    expect(nights[0].totalG).toBe(36);
    expect(nights[0].spendMinor).toBe(2400);
  });

  it('excludes tombstoned logs', () => {
    const nights = summariseNights([mkLog({ deleted: true })]);
    expect(nights).toHaveLength(0);
  });
});

describe('computeStreaks', () => {
  it('counts consecutive dry nights back from yesterday', () => {
    const today = new Date(2026, 8, 10);
    const drinkAt = new Date(2026, 8, 4, 22).getTime();
    const streaks = computeStreaks([mkLog({ at: drinkAt, nightKey: nightKey(drinkAt) })], today);
    expect(streaks.dryStreak).toBe(5); // 5th–9th
  });

  it('has no concept of a consecutive-drinking streak', () => {
    const streaks = computeStreaks([], new Date());
    expect(Object.keys(streaks)).toEqual(['dryStreak', 'longestDry', 'goalWeeks']);
  });
});

describe('spendTotals', () => {
  it('sums the year and this month separately', () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 2, 22).getTime();
    const totals = spendTotals([mkLog({ at: thisMonth, priceMinor: 2000 })]);
    expect(totals.month).toBe(2000);
    expect(totals.year).toBeGreaterThanOrEqual(2000);
  });
  it('ignores logs with no price', () => {
    expect(spendTotals([mkLog({ priceMinor: null })]).year).toBe(0);
  });
});

describe('goalProgress', () => {
  it('measures a nightly cap against tonight only', () => {
    const at = Date.now();
    const p = goalProgress([mkLog({ at, nightKey: nightKey(at), ethanolG: 30 })], {
      type: 'nightly_cap', target: 60, enabled: true,
    });
    expect(p.value).toBe(30);
    expect(p.pct).toBeCloseTo(0.5);
  });
  it('clamps the percentage at 1 so a bar never overflows', () => {
    const at = Date.now();
    const p = goalProgress([mkLog({ at, nightKey: nightKey(at), ethanolG: 300 })], {
      type: 'nightly_cap', target: 60, enabled: true,
    });
    expect(p.pct).toBe(1);
  });
});

describe('estimateMissedDrinks', () => {
  const session: Session = {
    id: 's1', ownerId: 'me', planId: null, venueId: 'v1', title: null, visibility: 'friends',
    joinCode: null, startedAt: Date.now() - 5 * 3600000, endedAt: Date.now(), safeHomeAt: null,
    mood: null, nightKey: nightKey(Date.now()), accentIndex: 0,
  };

  it('spots a long night with very few logs', () => {
    expect(estimateMissedDrinks(session, [mkLog({ sessionId: 's1' })])).toBeGreaterThan(0);
  });
  it('does not invent gaps in a short night', () => {
    const short = { ...session, startedAt: Date.now() - 3600000 };
    expect(estimateMissedDrinks(short, [mkLog({ sessionId: 's1' })])).toBe(0);
  });
  it('is capped so it never suggests something absurd', () => {
    const marathon = { ...session, startedAt: Date.now() - 20 * 3600000 };
    expect(estimateMissedDrinks(marathon, [])).toBeLessThanOrEqual(4);
  });
});

describe('hangoverForecast', () => {
  it('is fine with nothing to go on', () => {
    expect(hangoverForecast(undefined).band).toBe('fine');
  });
  it('rates a heavy, unhydrated night worse than a light one', () => {
    const base = { key: '2026-09-04', weekday: 5, venueIds: [], spendMinor: 0, firstAt: null, lastAt: null };
    const heavy = hangoverForecast({ ...base, totalG: 90, drinks: 6, waters: 0 });
    const light = hangoverForecast({ ...base, totalG: 15, drinks: 1, waters: 2 });
    expect(heavy.score).toBeGreaterThan(light.score);
  });
});

describe('formatting', () => {
  it('formats money by currency', () => {
    expect(formatMoney(1500, 'EUR')).toBe('€15');
    expect(formatMoney(1550, 'GBP')).toBe('£15.50');
    expect(formatMoney(2000, 'RON')).toBe('20 lei');
  });
  it('formats durations as hours and minutes', () => {
    expect(formatDuration(3600000)).toBe('1h00');
    expect(formatDuration(45 * 60000)).toBe('45m');
  });
});

describe('heatmap', () => {
  it('returns one cell per day, oldest first', () => {
    const cells = heatmap([], 30);
    expect(cells).toHaveLength(30);
    expect(cells[0].level).toBe(0);
  });
});

describe('plural', () => {
  it('says "1 person", not "1 people"', () => {
    expect(plural(1, 'person', 'people')).toBe('1 person');
    expect(plural(3, 'person', 'people')).toBe('3 people');
  });

  it('adds an s when no irregular form is given', () => {
    expect(plural(1, 'night')).toBe('1 night');
    expect(plural(2, 'night')).toBe('2 nights');
  });

  it('treats zero as plural, the way English does', () => {
    expect(plural(0, 'night')).toBe('0 nights');
    expect(plural(0, 'person', 'people')).toBe('0 people');
  });
});
