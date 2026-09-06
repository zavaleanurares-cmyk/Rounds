## What changed

<!-- One or two sentences. What a reviewer needs to know before reading the diff. -->

## How it was verified

<!-- Which of these actually ran, and what they showed. Delete what does not apply. -->

- [ ] `npm run check` — typecheck, unit tests, the three SQL suites, store preflight
- [ ] Opened the **rounds-on-device** artifact from this run and used the change
- [ ] New assertions mutation-tested: the fix reverted, the assertion failed
- [ ] Built natively, if this touches `modules/rounds-native/`, `app.config.ts`
      or a config plugin — nothing in `npm run check` compiles Swift or Kotlin

## If this touches `supabase/`

- [ ] Any `alter type … add value` is **alone in its migration** — adding an enum
      value and using it in one transaction fails on a real database and passes
      the suite, where each file is its own autocommitting run
- [ ] Any new scheduled job appears in `00049_schedules.sql`, and is also named
      in `docs/deploy.md` and the `supabase` workflow's expected list — the doc
      drifted out of step once and a test now holds all three together
- [ ] Any new `security definer` function revokes execute from `authenticated`
      — Supabase grants it by default
