/**
 * One definition of what somebody has earned, not two.
 *
 * `evaluate_achievements()` scored six achievements from SQL. The app scores
 * twenty-four, in `src/domain/progress.ts`, from the same logs and sessions —
 * including every one that depends on data the server does not hold, like the
 * local pace history. The client is the source of truth by construction:
 * achievements are recomputed on every launch, and the `achievements` table is
 * the RECORD that this account reached one, and when, so a reinstall does not
 * silently un-earn two dozen things somebody actually did.
 *
 * The function was never called from anywhere. Left in place it is a second,
 * quieter answer to the same question, six codes wide, waiting for somebody to
 * wire it up "because it is already there" and produce an account whose
 * achievements disagree with its own screen. Dropped instead.
 *
 * The table, its RLS and the client's writer are untouched.
 */
drop function if exists public.evaluate_achievements();
