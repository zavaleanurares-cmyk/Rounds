import { comboStep, isComboResolution, COMBO_WINDOW_MS, COMBO_STEPS } from '@/domain/combo';

/** Times ascending, each `gapMin` after the last. */
const run = (gapsMin: number[]): number[] => {
  const t = [0];
  for (const g of gapsMin) t.push(t[t.length - 1] + g * 60_000);
  return t;
};

describe('the combo ladder', () => {
  it('is 0 for the first drink of a night', () => {
    expect(comboStep([1_000])).toBe(0);
  });

  it('climbs while the drinks keep coming', () => {
    expect(comboStep(run([30]))).toBe(1);
    expect(comboStep(run([30, 30]))).toBe(2);
    expect(comboStep(run([30, 30, 30]))).toBe(3);
    expect(comboStep(run([30, 30, 30, 30]))).toBe(4);
  });

  it('resolves at the top and starts the next climb', () => {
    const five = run([30, 30, 30, 30, 30]);
    expect(comboStep(five)).toBe(COMBO_STEPS);
    expect(isComboResolution(comboStep(five))).toBe(true);

    // The sixth is a new climb, not a sixth rung and not silence.
    expect(comboStep(run([30, 30, 30, 30, 30, 30]))).toBe(0);
    expect(comboStep(run([30, 30, 30, 30, 30, 30, 30]))).toBe(1);
  });

  it('breaks the run when the gap is longer than the window', () => {
    // Three quick, then a long pause, then one: the pause ends the run and the
    // drink after it is the first of a new one.
    const t = run([30, 30]);
    t.push(t[t.length - 1] + COMBO_WINDOW_MS + 1);
    expect(comboStep(t)).toBe(0);
  });

  it('counts a gap exactly on the window as still in the run', () => {
    // The boundary belongs to the run. A drink at exactly the window is the
    // pace the app considers a round, so it continues rather than resets.
    const t = [0, COMBO_WINDOW_MS];
    expect(comboStep(t)).toBe(1);
  });

  it('only the gaps matter, not when the night started', () => {
    const early = run([20, 20, 20]);
    const late = early.map((x) => x + 5 * 3_600_000);
    expect(comboStep(late)).toBe(comboStep(early));
  });

  it('is derived, so removing the last log gives the previous answer', () => {
    // This is why nothing is stored: undo is just a shorter array.
    const t = run([30, 30, 30]);
    expect(comboStep(t)).toBe(3);
    expect(comboStep(t.slice(0, -1))).toBe(2);
  });

  it('answers 0 rather than throwing when there are no logs', () => {
    expect(comboStep([])).toBe(0);
  });

  it('never returns a step the sound ladder cannot play', () => {
    // The rate table has COMBO_STEPS + 1 entries; a step outside that range
    // would be an undefined playback rate, which is a silent cue at best.
    let t = [0];
    for (let i = 0; i < 40; i += 1) {
      t = [...t, t[t.length - 1] + 60_000];
      const step = comboStep(t);
      expect(step).toBeGreaterThanOrEqual(0);
      expect(step).toBeLessThanOrEqual(COMBO_STEPS);
    }
  });
});
