import {
  bacAt, paceState, distributionRatio, shouldPromptWater, weekdayMedian, BODY_FALLBACK, ELIMINATION_PER_HOUR,
} from '@/domain/pace';
import { ethanolGrams, gramsToUnits, STANDARD_DRINK_G } from '@/domain/units';

const HOUR = 3600000;

describe('units', () => {
  it('computes ethanol grams from volume and ABV', () => {
    // A UK pint of 4.5% lager: 568ml × 0.045 × 0.789 ≈ 20.2g
    expect(ethanolGrams(568, 4.5)).toBeCloseTo(20.2, 1);
  });
  it('returns zero for non-alcoholic drinks', () => {
    expect(ethanolGrams(330, 0)).toBe(0);
    expect(ethanolGrams(0, 5)).toBe(0);
  });
  it('converts grams to the right regional unit', () => {
    expect(gramsToUnits(STANDARD_DRINK_G.UK, 'UK')).toBe(1);
    expect(gramsToUnits(STANDARD_DRINK_G.US, 'US')).toBe(1);
    expect(gramsToUnits(STANDARD_DRINK_G.EU, 'EU')).toBe(1);
  });
});

describe('bacAt', () => {
  const now = Date.now();

  it('is zero with no logs', () => {
    expect(bacAt([], { weightKg: 75, sex: 'male' }, now)).toBe(0);
  });

  it('is zero when only water was logged', () => {
    expect(bacAt([{ at: now - HOUR, ethanolG: 0 }], { weightKg: 75, sex: 'male' }, now)).toBe(0);
  });

  it('falls back to 75kg and r=0.615 when body basics are skipped', () => {
    const skipped = bacAt([{ at: now - HOUR, ethanolG: 20 }], { weightKg: null, sex: null }, now);
    const explicit = bacAt(
      [{ at: now - HOUR, ethanolG: 20 }],
      { weightKg: BODY_FALLBACK.weightKg, sex: 'unspecified' },
      now
    );
    expect(skipped).toBeCloseTo(explicit, 6);
  });

  it('uses the documented Widmark ratios', () => {
    expect(distributionRatio('male')).toBe(0.68);
    expect(distributionRatio('female')).toBe(0.55);
    expect(distributionRatio(null)).toBe(BODY_FALLBACK.r);
  });

  it('gives a lower estimate to a heavier person for the same drink', () => {
    const light = bacAt([{ at: now - HOUR, ethanolG: 20 }], { weightKg: 55, sex: 'male' }, now);
    const heavy = bacAt([{ at: now - HOUR, ethanolG: 20 }], { weightKg: 95, sex: 'male' }, now);
    expect(heavy).toBeLessThan(light);
  });

  it('eliminates over time and never goes negative', () => {
    const logs = [{ at: now - HOUR, ethanolG: 20 }];
    const body = { weightKg: 75, sex: 'male' as const };
    const soon = bacAt(logs, body, now);
    const later = bacAt(logs, body, now + 2 * HOUR);
    expect(later).toBeLessThan(soon);
    expect(bacAt(logs, body, now + 48 * HOUR)).toBe(0);
  });

  it('eliminates at roughly the documented rate', () => {
    const logs = [{ at: now - 6 * HOUR, ethanolG: 80 }];
    const body = { weightKg: 75, sex: 'male' as const };
    const a = bacAt(logs, body, now);
    const b = bacAt(logs, body, now + HOUR);
    expect(a - b).toBeCloseTo(ELIMINATION_PER_HOUR, 2);
  });

  it('ignores logs in the future', () => {
    expect(bacAt([{ at: now + HOUR, ethanolG: 30 }], { weightKg: 75, sex: 'male' }, now)).toBe(0);
  });

  it('absorbs gradually rather than instantly', () => {
    const body = { weightKg: 75, sex: 'male' as const };
    const justNow = bacAt([{ at: now - 60000, ethanolG: 20 }], body, now);
    const settled = bacAt([{ at: now - 40 * 60000, ethanolG: 20 }], body, now);
    expect(justNow).toBeLessThan(settled);
  });
});

describe('paceState', () => {
  const now = Date.now();
  const started = now - 2 * HOUR;

  it('is easy with nothing logged', () => {
    const r = paceState({ logs: [], weekdayMedianG: 40, startedAt: started, now });
    expect(r.state).toBe('easy');
    expect(r.drinks).toBe(0);
    expect(r.filled).toBe(0);
  });

  it('counts drinks but not water', () => {
    const r = paceState({
      logs: [
        { at: now - HOUR, ethanolG: 16 },
        { at: now - 30 * 60000, ethanolG: 0 },
        { at: now - 10 * 60000, ethanolG: 16 },
      ],
      weekdayMedianG: 40,
      startedAt: started,
      now,
    });
    expect(r.drinks).toBe(2);
    expect(r.totalG).toBe(32);
  });

  it('escalates as the ratio to the user\'s own normal rises', () => {
    const mk = (n: number) =>
      paceState({
        logs: Array.from({ length: n }, (_, i) => ({ at: started + i * 20 * 60000, ethanolG: 16 })),
        weekdayMedianG: 32,
        startedAt: started,
        now,
      }).state;
    expect(mk(1)).toBe('easy');
    expect(['steady', 'quick']).toContain(mk(2));
    expect(mk(6)).toBe('slow_down');
  });

  it('caps the ring at six filled segments', () => {
    const r = paceState({
      logs: Array.from({ length: 12 }, (_, i) => ({ at: started + i * 60000, ethanolG: 16 })),
      weekdayMedianG: 40,
      startedAt: started,
      now,
    });
    expect(r.filled).toBe(6);
    expect(r.segments).toBe(6);
  });

  it('reports minutes since the last alcoholic drink', () => {
    const r = paceState({
      logs: [
        { at: now - 45 * 60000, ethanolG: 16 },
        { at: now - 5 * 60000, ethanolG: 0 },
      ],
      weekdayMedianG: 40,
      startedAt: started,
      now,
    });
    expect(r.minutesSinceLast).toBe(45);
  });

  it('works with no history at all (night one)', () => {
    const r = paceState({ logs: [{ at: now - HOUR, ethanolG: 16 }], weekdayMedianG: null, startedAt: started, now });
    expect(['easy', 'steady', 'quick', 'slow_down']).toContain(r.state);
  });
});

describe('shouldPromptWater', () => {
  const now = Date.now();
  it('prompts after two drinks with no water in the last hour', () => {
    expect(
      shouldPromptWater([
        { at: now - 50 * 60000, ethanolG: 16 },
        { at: now - 20 * 60000, ethanolG: 16 },
      ], now)
    ).toBe(true);
  });
  it('does not prompt if water was logged', () => {
    expect(
      shouldPromptWater([
        { at: now - 50 * 60000, ethanolG: 16 },
        { at: now - 30 * 60000, ethanolG: 0, isWater: true },
        { at: now - 20 * 60000, ethanolG: 16 },
      ], now)
    ).toBe(false);
  });
  it('does not prompt on a single drink', () => {
    expect(shouldPromptWater([{ at: now - 20 * 60000, ethanolG: 16 }], now)).toBe(false);
  });
});

describe('weekdayMedian', () => {
  it('returns null with no history for that weekday', () => {
    expect(weekdayMedian([{ weekday: 5, totalG: 40 }], 6)).toBeNull();
  });
  it('takes the middle value', () => {
    expect(weekdayMedian([
      { weekday: 5, totalG: 20 },
      { weekday: 5, totalG: 40 },
      { weekday: 5, totalG: 90 },
    ], 5)).toBe(40);
  });
});

describe('regression: a drink logged after the clock tick', () => {
  it('is ignored when `now` is stale — which is why the live screen must pass a fresh clock', () => {
    const staleNow = Date.now();
    const started = staleNow - 2 * HOUR;
    const justLogged = staleNow + 5_000; // logged 5s after the last 60s tick

    const stale = paceState({
      logs: [{ at: justLogged, ethanolG: 20 }],
      weekdayMedianG: 40,
      startedAt: started,
      now: staleNow,
    });
    expect(stale.drinks).toBe(0); // the model is right to ignore the future

    const fresh = paceState({
      logs: [{ at: justLogged, ethanolG: 20 }],
      weekdayMedianG: 40,
      startedAt: started,
      now: justLogged,
    });
    expect(fresh.drinks).toBe(1); // so the screen owes the model a current clock
  });
});
