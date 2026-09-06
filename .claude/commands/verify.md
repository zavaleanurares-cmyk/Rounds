---
description: Run every check this repository can run, and report what actually passed
---

```bash
npm run check
```

That is typecheck, the unit suite, the three SQL suites and the store preflight.
`npm run db:test` inside it needs a Postgres — if `pg_isready` fails, start one
rather than skipping it. A suite that was skipped and reported as green is the
exact failure this repository keeps finding.

Report the real numbers, not "tests pass": the test count, the assertion counts
from the three SQL suites, the route count, the store tally. If anything fails,
show the failure rather than summarising it.

Then say clearly what a green run here does **not** cover, because both have bitten:

- **Nothing in `npm run check` compiles Swift or Kotlin.**
  `.github/workflows/ios.yml` does that on a macOS runner. A green local run
  says nothing about whether the app builds.
- **`docs/ios-widget-target.md` is open work.** If `ios / widgets` is still
  `continue-on-error`, say so: an iOS build currently ships with no Live
  Activity, no widgets and no Control Center control.

If a deployed project is reachable, also run:

```bash
SUPABASE_DB_URL=... npm run verify:deploy
```
