/**
 * The combo ladder.
 *
 * Logging a drink shortly after the last one continues a run, and the run is
 * what the cue sound climbs. Five steps up a D-flat pentatonic, then the run
 * resolves on the sixth and starts again — climb, payoff, reset, which is the
 * shape every combo loop has had since arcade cabinets.
 *
 * It is pure and it is derived. Nothing about a combo is stored: the step is
 * recomputed from the timestamps already in the session, so an undo, a sync
 * from another device or a log edited to an earlier time all produce the right
 * answer without a counter to keep in step. `paceState()` is the same idea and
 * this deliberately mirrors it.
 *
 * The window is the app's own idea of a round's pace rather than a number
 * chosen to feel good: drinks further apart than this are not a run, they are
 * just a night.
 */

/** Longer than this between two logs and the run has ended. */
export const COMBO_WINDOW_MS = 90 * 60_000;

/**
 * Steps in the climb before it resolves. Six sounds: five rising, then the
 * resolution — see RATE in services/feedback.
 */
export const COMBO_STEPS = 5;

/**
 * Where in the climb the log at `times[times.length - 1]` sits.
 *
 * Returns 0 for the first drink of a run and counts up; the run resolves at
 * COMBO_STEPS and the next drink starts a new one at 0. An empty list is 0,
 * because the caller asking about a log that does not exist should get the
 * quietest answer rather than a throw.
 *
 * `times` must be ascending. It is the session's own log times, which are.
 */
export function comboStep(times: readonly number[], window = COMBO_WINDOW_MS): number {
  if (times.length === 0) return 0;

  // Walk back while each gap is inside the window. `run` counts the logs in
  // the current run, including the one just added.
  let run = 1;
  for (let i = times.length - 1; i > 0; i -= 1) {
    if (times[i] - times[i - 1] > window) break;
    run += 1;
  }

  // The climb resolves and restarts, so a long run keeps producing payoffs
  // rather than sitting at the top playing the same note.
  return (run - 1) % (COMBO_STEPS + 1);
}

/** True when this step is the resolution rather than a rung of the climb. */
export function isComboResolution(step: number): boolean {
  return step === COMBO_STEPS;
}
