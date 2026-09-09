import {
  personalNormal, priorGrams, PRIOR_WEIGHT, POPULATION_G_PER_NIGHT, type Baseline,
} from '@/domain/baseline';
import { byId } from '@/domain/catalog';
import { nightKey } from '@/domain/nightKey';
import type { Log } from '@/domain/types';

/**
 * The baseline, and the two rules it must not break.
 *
 * This is the file that decides what "normal for you" means, which is the
 * denominator under the pace ring. Two things have to stay true no matter what
 * anyone changes here later, and both are executed rather than asserted in a
 * comment:
 *
 *   1. Real nights progressively outweigh what somebody typed in a form.
 *   2. Nothing here estimates upward — the answer never exceeds the larger of
 *      what they said and what they logged. A normal that drifts up is a pace
 *      ring that stops noticing heavy nights, which is the failure that
 *      matters in an app about pace.
 */

let seq = 0;
const at = (day: number, hour = 21) => new Date(2026, 8, day, hour).getTime();

const log = (drinkId: string, when: number, sessionId = 's'): Log => {
  const d = byId(drinkId)!;
  return {
    id: `l${seq++}`,
    sessionId,
    userId: 'u',
    drinkId: d.id,
    drinkName: d.name,
    category: d.category,
    volumeMl: d.volumeMl,
    abv: d.abv,
    ethanolG: d.ethanolG,
    priceMinor: null,
    nicotineMg: null,
    at: when,
    nightKey: nightKey(when),
    venueId: null,
    deleted: false,
  } as Log;
};

/** n nights, each of `drinks` pints, one per week so each is its own night. */
const nightsOf = (count: number, drinks: number, startDay: number) => {
  const out: Log[] = [];
  for (let i = 0; i < count; i += 1) {
    for (let k = 0; k < drinks; k += 1) out.push(log('beer-pint', at(startDay + i * 7) + k * 1800_000, `s${i}`));
  }
  return out;
};

const PINT = byId('beer-pint')!.ethanolG;
const stated: Baseline = { usualDrinkIds: ['beer-pint'], drinksPerNight: 4, nightsPerMonth: 6 };

describe('the prior is what they said, in their own drinks', () => {
  it('multiplies their usual by their typical count', () => {
    expect(priorGrams(stated)).toBeCloseTo(PINT * 4, 5);
  });

  /**
   * The point of asking which drinks rather than assuming a standard one.
   * Somebody whose usual is a small glass of wine and somebody whose usual is
   * a double spirit both answer "four" and must not get the same baseline.
   */
  it('two people who both say four get different priors', () => {
    const wine = priorGrams({ ...stated, usualDrinkIds: ['wine-red'] })!;
    const shots = priorGrams({ ...stated, usualDrinkIds: ['tequila-shot'] })!;
    expect(wine).not.toBeCloseTo(shots, 1);
  });

  it('averages several usuals rather than taking the strongest', () => {
    const mixed = priorGrams({ ...stated, usualDrinkIds: ['beer-pint', 'tequila-shot'] })!;
    const beerOnly = priorGrams({ ...stated, usualDrinkIds: ['beer-pint'] })!;
    const shotOnly = priorGrams({ ...stated, usualDrinkIds: ['tequila-shot'] })!;
    expect(mixed).toBeLessThanOrEqual(Math.max(beerOnly, shotOnly));
    expect(mixed).toBeGreaterThanOrEqual(Math.min(beerOnly, shotOnly));
  });

  it('an id the catalogue no longer has is skipped, not counted as zero', () => {
    const withGhost = priorGrams({ ...stated, usualDrinkIds: ['beer-pint', 'no-such-drink'] })!;
    expect(withGhost).toBeCloseTo(PINT * 4, 5);
  });

  it('no baseline, or a nonsense one, is no prior at all', () => {
    expect(priorGrams(null)).toBeNull();
    expect(priorGrams({ ...stated, usualDrinkIds: [] })).toBeNull();
    expect(priorGrams({ ...stated, drinksPerNight: 0 })).toBeNull();
  });
});

describe('with nothing to go on', () => {
  it('no baseline and no history is the population figure, unchanged', () => {
    const n = personalNormal({ logs: [], weekday: 5, baseline: null });
    expect(n.gramsPerNight).toBe(POPULATION_G_PER_NIGHT);
    expect(n.source).toBe('population');
    expect(n.fromHistory).toBe(0);
  });

  it('a baseline and no history is exactly what they said, and says so', () => {
    const n = personalNormal({ logs: [], weekday: 5, baseline: stated });
    expect(n.gramsPerNight).toBeCloseTo(PINT * 4, 5);
    expect(n.source).toBe('stated');
    expect(n.fromHistory).toBe(0);
    expect(n.nights).toBe(0);
  });
});

describe('real nights progressively outweigh the form', () => {
  /**
   * THE load-bearing test. Someone said four pints; they actually drink two.
   * Every extra night has to move the answer toward the truth and never away
   * from it, and the weight on history has to rise monotonically.
   */
  it('each night moves the answer toward what actually happened', () => {
    const truth = PINT * 2;
    let previousGap = Infinity;
    let previousWeight = -1;

    for (const count of [1, 2, 3, 4, 6, 10, 20]) {
      // Same weekday every time, so the weekday branch is the one under test.
      const n = personalNormal({ logs: nightsOf(count, 2, 4), weekday: new Date(at(4)).getDay(), baseline: stated });

      expect(n.nights).toBe(count);
      expect(n.fromHistory).toBeGreaterThan(previousWeight);
      const gap = Math.abs(n.gramsPerNight - truth);
      expect(gap).toBeLessThan(previousGap);
      previousWeight = n.fromHistory;
      previousGap = gap;
    }
  });

  it('the crossover is where PRIOR_WEIGHT says it is', () => {
    const n = personalNormal({ logs: nightsOf(PRIOR_WEIGHT, 2, 4), weekday: new Date(at(4)).getDay(), baseline: stated });
    expect(n.fromHistory).toBeCloseTo(0.5, 5);
    // Exactly half way between the two.
    expect(n.gramsPerNight).toBeCloseTo((PINT * 4 + PINT * 2) / 2, 4);
  });

  it('stops hedging once the prior is worth less than the rounding', () => {
    const many = personalNormal({ logs: nightsOf(40, 2, 4), weekday: new Date(at(4)).getDay(), baseline: stated });
    expect(many.source).toBe('history');
    expect(many.fromHistory).toBeGreaterThan(0.9);

    const few = personalNormal({ logs: nightsOf(2, 2, 4), weekday: new Date(at(4)).getDay(), baseline: stated });
    expect(few.source).toBe('blend');
  });

  it('history with no baseline is history, undiluted', () => {
    const n = personalNormal({ logs: nightsOf(3, 2, 4), weekday: new Date(at(4)).getDay(), baseline: null });
    expect(n.gramsPerNight).toBeCloseTo(PINT * 2, 4);
    expect(n.source).toBe('history');
    expect(n.fromHistory).toBe(1);
  });
});

describe('nothing here estimates upward', () => {
  /**
   * The second rule, executed across the whole space rather than at a point:
   * whatever the mix of stated and observed, the answer must sit between them.
   * A blend that could exceed both would be inventing headroom, and headroom
   * in this number is a pace ring that says "steady" to a heavy night.
   */
  it('the answer is always between what they said and what they logged', () => {
    const prior = priorGrams(stated)!;
    for (const realDrinks of [1, 2, 3, 4, 5, 8]) {
      for (const count of [1, 3, 5, 12]) {
        const n = personalNormal({
          logs: nightsOf(count, realDrinks, 4),
          weekday: new Date(at(4)).getDay(),
          baseline: stated,
        });
        const observed = PINT * realDrinks;
        expect(n.gramsPerNight).toBeGreaterThanOrEqual(Math.min(prior, observed) - 1e-6);
        expect(n.gramsPerNight).toBeLessThanOrEqual(Math.max(prior, observed) + 1e-6);
      }
    }
  });
});

describe('the weekday only counts once there is a weekday to count', () => {
  it('one night on this weekday is not yet a weekday median', () => {
    // Two Fridays of 2 pints, one Tuesday of 8. Asking about Tuesday with a
    // single Tuesday on file must not answer "8" — that is one night wearing
    // the authority of a statistic.
    const friday = nightsOf(2, 2, 4);
    const tuesday = nightsOf(1, 8, 8);
    const tuesdayWeekday = new Date(at(8)).getDay();

    const n = personalNormal({ logs: [...friday, ...tuesday], weekday: tuesdayWeekday, baseline: null });

    expect(n.nights).toBe(3);
    expect(n.gramsPerNight).toBeLessThan(PINT * 8);
  });

  it('two nights on this weekday are', () => {
    const friday = nightsOf(2, 2, 4);
    const tuesday = nightsOf(2, 8, 8);
    const n = personalNormal({ logs: [...friday, ...tuesday], weekday: new Date(at(8)).getDay(), baseline: null });

    expect(n.nights).toBe(2);
    expect(n.gramsPerNight).toBeCloseTo(PINT * 8, 4);
  });
});

describe('tonight is not compared against itself', () => {
  it('excludes the session in progress', () => {
    // Day 25 is a Friday, like days 4/11/18 — tonight has to fall on the SAME
    // weekday, or the weekday filter drops it before the session filter can and
    // the test passes for the wrong reason.
    const past = nightsOf(3, 2, 4);
    const tonight = [log('beer-pint', at(25), 'live'), log('beer-pint', at(25) + 1000, 'live')];

    const withIt = personalNormal({ logs: [...past, ...tonight], weekday: new Date(at(4)).getDay(), baseline: null });
    const withoutIt = personalNormal({
      logs: [...past, ...tonight],
      weekday: new Date(at(4)).getDay(),
      baseline: null,
      excludeSessionId: 'live',
    });

    expect(withoutIt.nights).toBe(3);
    expect(withIt.nights).toBeGreaterThan(withoutIt.nights);
  });
});
