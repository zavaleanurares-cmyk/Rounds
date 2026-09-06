# ROUNDS

An Expo / React Native app for iOS and Android. Dark, offline-first, built
around a night out: keep your pace, keep your group together, get home.

## Before you start

- `docs/ios-widget-target.md` — the widget extension target, now created. Read
  it before touching `modules/rounds-native/`; it carries the contract, the
  embed phase that is the whole trap, and the one library behaviour that makes
  the dependency silently not happen.
- `docs/deploy.md` — the deployment steps, two of which are silent if skipped.
- `npm run store:check` — the live list of what is blocked on accounts.

## The rule this codebase was built on

**A green test suite proves very little.** Every bug that has mattered here was
found by running something, not by reading it:

| Found by | Bug |
|---|---|
| Rendering a contact sheet | `fill: 0` meant no pictogram ever painted its brand colour — 22 identical white tiles |
| Opening 74 routes in a browser | The sign-in screen rendered blank whenever no Google client id was set |
| Mutation-testing a new constraint | `auth.uid()` was not callable in the harness, so **seven** `t.rejects` assertions had been passing on a permission error |
| Diffing a clone against the tree | `.gitignore` patterns without a leading slash excluded the entire native module |
| Running `expo prebuild` once | Two hard build failures and a crash-on-launch dependency, in a repository that was fully green |
| Parsing the project prebuild produced | `addTargetDependency` returns having done nothing when the `PBXTargetDependency` section does not exist yet, so the app → extension dependency was silently never wired |

So: prefer the check that executes. When you add an assertion, **mutation-test
it** — break the thing it claims to protect and watch it go red. An assertion
that has never failed is not known to work.

## Verify like this

```bash
npm run typecheck && npm test -- --ci   # 239 tests
bash supabase/tests/run.sh              # 269 assertions, needs PGHOST/PGUSER/PGDATABASE
npm run manifest                        # every screen still has a route
npm run store:check                     # metadata, privacy manifest, permissions
npm run tester                          # one self-contained HTML with the whole app
```

The native project, on Linux, in seconds and with no Xcode:

```bash
npx expo prebuild --platform ios --no-install --clean
npm run verify:ios                      # the widget extension contract
```

That one parses the generated `project.pbxproj` and asserts the whole of
`docs/ios-widget-target.md` — including the copy-files phase with
`dstSubfolderSpec = 13`, which is the difference between an app with widgets and
a green build without them.

Against a deployed project, after `supabase db push`:

```bash
SUPABASE_DB_URL=postgresql://... npm run verify:deploy
```

That one checks the things `docs/deploy.md` warns are silent when skipped —
`pg_cron` present, all seven jobs scheduled, the outbound drain actually
delivering. A document that tells you to check something is weaker than a
command that checks it.

CI additionally compiles iOS on a macOS runner and assembles the Android APK —
`.github/workflows/ios.yml`. Those jobs exist because nothing else here compiles
a line of Swift, which is how an Xcode project with no widget extension sat in a
green build. `ios / widgets` is no longer advisory: it fails unless
`ROUNDS.app/PlugIns/RoundsWidgets.appex` is inside the built app.

## Standing rules, each enforced by a test

- **No per-cigarette nicotine figure, ever.** EU Directive 2014/40 Art. 13(1)(a)
  took those numbers off packs because recital 25 found they made some brands
  look less harmful than others. The catalogue, a database constraint and a test
  all refuse one, and the screen says why so the absence reads as deliberate.
- **No pouch above 20 mg** — Romanian Law 64/2024 caps a legally sold one there.
- **`alter type … add value` goes in its own migration.** Adding an enum value
  and using it in the same transaction fails on a real database and passes the
  suite, where each file is its own autocommitting run.
- **Every queue job appears in the schedules migration.**
- **No scheduler function is executable by `authenticated`** — Supabase's default
  privileges grant execute on new functions, so each needs an explicit revoke.
- **BAC is never stored or transmitted.** `paceState()` is primary, `bacAt()`
  secondary, opt-in and off by default.
- **The offline queue mints its own UUIDs.** Idempotency by construction; there
  is one write path and demo data never syncs.
- **No emoji in the product.** Every glyph is drawn — see `src/ui/DrinkGlyph.tsx`.

## Still unproven

Every system surface compiles and is embedded, and nothing beyond that can be
checked without hardware: the Live Activity appearing on a real Lock Screen,
each widget size rendering, the Control Center control being addable. Those wait
on an Apple Developer account — `npm run store:check` prints the live list.

## Deliberately not done

- **Billing.** `src/services/purchases.ts` is a complete interface behind
  `BILLING_VISIBLE = false`; both routes redirect and nothing is locked. Ten
  policy tests hold it shut and **will fail when the flag flips** — that is what
  they are for.
- **The Watch app.** No code. Would reuse `RoundsShared.swift`.

## Layout

```
app/                    expo-router routes (74 screens)
src/domain/             pure logic — pace, catalogue, nicotine, stats
src/services/           the outside world — auth, sync, push, purchases
src/ui/  src/features/  design system, then screen-level composition
src/i18n/locales/       en · ro · es · fr, 1228 keys each, all four in step
supabase/migrations/    41 files, applied in order, never edited after landing
supabase/tests/         RLS matrix · escalation · RPC rules, plain psql
modules/rounds-native/  Live Activity, widgets, Control Center, Quick Settings
```
