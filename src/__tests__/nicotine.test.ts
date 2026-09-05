import {
  nicotineThisWeek, nicotineFreeDays, NICOTINE, NICOTINE_PRODUCTS, POUCHES,
  UNKNOWN_NICOTINE, isNicotine, asDrink, nicotineById, pouchMgThisWeek,
} from '@/domain/nicotine';
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

describe('the pictograms', () => {
  /**
   * The bug this exists for: `asDrink` passed `fill: 0`.
   *
   * `fill` is how full a vessel is, and the glyph draws the tint from the
   * cavity floor upwards by `depth * fill`. Zero is a legal number, so the
   * `?? 0.6` default did not catch it, and the tint rectangle collapsed to
   * nothing at the floor of the clip path. Every one of the twenty-two pouches
   * rendered as the same white outline and the whole colour table was dead
   * data — which no type check and no snapshot would have noticed.
   */
  it('fills the silhouette, or the brand colour never paints', () => {
    for (const p of NICOTINE_PRODUCTS) {
      expect({ id: p.id, fill: asDrink(p).art.fill }).toEqual({ id: p.id, fill: 1 });
    }
  });

  it('gives the pouch brands colours that differ from each other', () => {
    // Two pouches that render identically are two products the user cannot
    // tell apart in a grid of twenty-two.
    const tints = new Set(POUCHES.map((p) => p.tint.join()));
    expect(tints.size).toBeGreaterThanOrEqual(8);
  });

  it('gives no two products the same picture', () => {
    /**
     * `Cigarette` and `Rolled` shared a silhouette, and so did IQOS and glo —
     * in both cases the two products a person actually chooses between. A
     * contact sheet showed it; nothing else did, so this is the assertion that
     * stands in for looking.
     *
     * `scripts/render-nicotine.mjs` is the looking, when a shape changes.
     */
    const seen = new Map<string, string>();
    for (const p of NICOTINE_PRODUCTS) {
      const art = asDrink(p).art;
      const key = `${art.glass}|${art.liquid.join()}`;
      const clash = seen.get(key);
      expect({ id: p.id, sameAs: clash ?? null }).toEqual({ id: p.id, sameAs: null });
      seen.set(key, p.id);
    }
  });

  it('deepens a brand’s colour as the strength rises', () => {
    // Real tins signal strength by shade, and four identical white pillows
    // labelled only by their text is not a picker.
    const zyn = POUCHES.filter((p) => p.brand === 'ZYN');
    expect(zyn.length).toBeGreaterThan(2);
    const shades = zyn.map((p) => asDrink(p).art.liquid[0]);
    expect(new Set(shades).size).toBe(zyn.length);
    // …and never past recognition: the hue is the brand.
    for (const s of shades) expect(s).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('draws a legacy cigarette as a cigarette, not as a vape', () => {
    // The old catalogue had two ids; `cigarette` became `cig-other`, so every
    // row written before this catalogue existed resolved to nothing and fell
    // back to whatever was last in the list — which was the vape.
    expect(nicotineById('cigarette')?.id).toBe('cig-other');
    expect(nicotineById('vape')?.id).toBe('vape');
    expect(UNKNOWN_NICOTINE.format).toBe('cigarette');
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

describe('milligrams', () => {
  const wed = new Date(2026, 8, 2, 20, 0, 0).getTime();

  it('totals what pouches are labelled with', () => {
    const logs = [log(wed, { nicotineMg: 6 }), log(wed - 1000, { nicotineMg: 9.4 })];
    expect(pouchMgThisWeek(logs, wed)).toBeCloseTo(15.4, 5);
  });

  it('counts a cigarette in the count and in no total', () => {
    // The asymmetry is the design: EU Directive 2014/40 Art. 13(1)(a) took
    // nicotine figures off packs because they made brands look comparably
    // harmful. A "total nicotine" that silently invented one per cigarette
    // would put it back.
    const logs = [log(wed, { drinkId: 'cig-marlboro', nicotineMg: null })];
    expect(nicotineThisWeek(logs, wed)).toBe(1);
    expect(pouchMgThisWeek(logs, wed)).toBe(0);
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
