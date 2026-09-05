# ROUNDS

> The app you open before you go out and check the next morning — it keeps your
> pace, keeps your group together, and gets you home.

An Expo / React Native app for iOS and Android. Dark, branded, offline-first.

## Run it

```bash
npm install
npm run go         # Expo Go: scan the QR, you're in — nothing else to install
npm run web        # browser, fastest way to look at it
npm start          # full build config, needs a development build
```

**`npm run go` is the one to hand someone.** It drops the custom native module
(Expo Go cannot load one) and everything else works — all 74 screens, the real
map, the QR scanner, local notifications. `TESTING.md` has the other three
routes in, and the app itself lists what this build can and cannot do on
Settings › System surfaces.

```bash
npm run check      # everything below, in one
npm test           # 225 unit tests: pace, queue, stats, catalogue, i18n, nicotine, policy
npm run typecheck  # tsc --noEmit, strict
npm run db:test    # every migration against a scratch Postgres, then all three SQL suites
npm run export:web # production web bundle into dist/
npm run tester     # one self-contained HTML file with the whole app in it
npm run tokens     # regenerate tokens.json + Swift + Kotlin from src/design/tokens.ts
npm run manifest   # regenerate the screen manifest by walking the route tree
```

**`npm run tester`** writes `/tmp/rounds-tester.html` — the entire app inlined
into a single file, running inside a realistic iPhone. Open it anywhere, no
install and no backend; CI attaches one to every run, so a pull request can be
used rather than read. Sign in with any email and any six digits.

For the system surfaces — Live Activity, widgets, Control Center, Siri — you
need a development build rather than Expo Go:

```bash
npx expo prebuild && npx expo run:ios     # or run:android
```

**It ships in the night-one state on purpose.** A fresh install has no history,
because that is the state a real new user sees and the one apps get wrong.
Settings → Demo data → *Fill with 14 weeks of history* flips it into the
has-history state.

There is no backend required to run any of this. Every screen works against the
local store; `src/data/remote.ts` is where a Supabase client attaches.

## What's here

```
app/                 74 screens, expo-router, matching the route graph in the brief
  (auth)             welcome · sign-in · verify
  (onboarding)       age · identity · region · body · intent · modules · permissions · done · blocked
  (tabs)             tonight · discover · circle · you
  log/ session/ …    everything else, modal or push per the presentation table
src/
  design/tokens.ts   the single source of truth, transcribed from the Figma foundations
  ui/                the design system: Glass, Card, PaceRing, TabBar, DrinkGlyph, …
  domain/            pace model, night key, units, 165-drink catalogue, derived stats
  data/              store, offline queue, client UUIDs, Supabase adapter, seed
  native/            the shared JS interface for the eight system surfaces
  features/          the Tonight state machine's four screens
modules/
  rounds-native/     Swift + Kotlin for the surfaces, and the config plugin
supabase/
  migrations/        00001–00050: schema, RLS, moderation, deletion, plans, safety,
                     spend, push, full sync, i18n, nicotine, the scheduled jobs
  tests/             three suites, 269 assertions, plain SQL — no pgtap, no Docker
  services/          venues, purchases, push, analytics, capability detection
supabase/
  functions/         edge functions: outbound queue, store webhook, entitlement
tokens/              tokens.json + NativeWind + Swift + Kotlin, generated
store/               App Store and Play submission answers
ios-config/          PrivacyInfo.xcprivacy
public/              .well-known verification files, and the invite web page
docs/                figma-audit · component-map · drinks · native-surfaces · screen-manifest
```

## The parts that carry the product

**The offline log queue** (`src/data/queue.ts`). The client mints each row's
UUID, so replaying a write is a no-op on the server rather than a duplicate
drink. Every write path — the log sheet, the widget, the Live Activity button,
the notification action, Siri, the watch — goes through it, and there is never a
second one. `enqueue` returns before any I/O; the UI never waits on the network.

**The pace model** (`src/domain/pace.ts`). Two readouts and the order matters.
`paceState()` produces a state word relative to *your own* median for this
weekday — the primary readout, because nobody knows what 0.94‰ means and
everybody knows what "you're going faster than usual" means. `bacAt()` is a
Widmark estimate shown small, with the disclaimer attached, and **suppressed
entirely in the slow-down state**. It is never stored and never sent.

**The Tonight state machine** (`src/hooks/useNightState.ts`). One route, five
materially different screens: idle, planned, live, wind-down, morning. It
re-evaluates on foreground, on the 04:00 night boundary, and on any session
mutation.

**Row-level security** (`supabase/tests/rls_matrix.sql`). Six roles — owner,
participant, friend, crew-mate, stranger, and **blocked**. The sixth is the
point: a block is a clause in every social predicate, not a filtered list. 145
assertions in plain SQL, so `npm run db:test` runs the whole schema and matrix
against a bare Postgres with no Docker, no pgtap and no Supabase CLI.

Two suites sit beside it. `safety_escalation.sql` (42) proves what actually
*happens* to an armed check — both stages, the grace window, the queue under
retry, a user offline for the whole window. `rpc_rules.sql` (82) covers the
rules that live inside `security definer` functions, where RLS does not apply
and every scope has to be hand-written: the friend-request cap, who may resolve
a safe-arrival check, what a stranger may see of an invite.

**165 drawn drinks** (`src/domain/catalog.ts`, `src/ui/DrinkGlyph.tsx`). The
whole IBA official cocktail list plus everything people actually order, each
with real volumes and ABVs and its own artwork — glass, liquid, garnish. No
emoji anywhere in the app. See `docs/drinks.md`.

**Eight system surfaces** (`src/native/`, `modules/rounds-native/`). Live
Activity and Dynamic Island, ongoing notification, three widget families both
platforms, Control Center control and Quick Settings tile, App Intents and
Siri. All of them write through the same queue with a UUID the surface mints
itself. See `docs/native-surfaces.md`.

**A policy test suite** (`src/__tests__/policy.test.ts`). The non-negotiables in
the brief are rules a person has to remember on every file they touch, so they
are asserted instead: safety never reads entitlement, the estimate never reaches
an outward-facing surface, there is no feed and no drinking leaderboard, the log
sheet has no `await` in it, there is exactly one place that enqueues a write,
and there are no emoji anywhere in the app. Breaking one is a red test rather
than something nobody notices until review.

## Non-negotiables, and where they are enforced in code

| Rule | Where |
|---|---|
| Glass is functional-layer only; content cards are solid | `ui/Glass.tsx` vs `ui/Card.tsx` — separate components, so it is hard to get wrong |
| One tinted control per screen | `<Button kind="primary">` is the only thing carrying `Glow/Primary` |
| Three light sources, in order | `Aurora` → `Card aurora` blooms → card `sheen` |
| The pace state word is the primary readout | `PaceRing` renders the word; `PaceEstimate` is a separate component |
| The ‰ estimate vanishes in slow-down | `PaceEstimate` returns `null` — enforced, not remembered |
| No estimate on a share card | `app/share/[sessionId].tsx` renders venues, hours and people only |
| No paywall during a live night | `app/paywall.tsx` refuses to render one when a session is active |
| Safety is free forever | Nothing under `app/safety/` reads `settings.subscribed` |
| The log sheet has no network dependency | `store.addLog` → `logQueue.enqueue`, both synchronous |
| No feed, no drinking leaderboard, no drinking streak | Circle replaces the feed; `computeStreaks` returns dry streaks only; crew boards rank nights, venues, quests |

## Backend

Unset `EXPO_PUBLIC_SUPABASE_URL` and the app runs entirely on-device: every
screen works, nothing is sent anywhere. That is not a fallback, it is the
architecture — the network is a background reconciliation, never a dependency.

Set it and the same code paths attach without a single screen changing:
`signInWithOtp` / `verifyOtp`, server-side age verification that a reinstall
cannot reset, the queue's drain, `sync_pull` in one round trip, and one
multiplexed realtime channel per live session with backoff on foreground.

## Known gaps

Honest list of what is still missing.

- **Watch app** — deferred, and P2 by the brief's own ordering.
- **Billing.** `src/services/purchases.ts` is complete behind `BILLING_VISIBLE`,
  which is `false`: both routes redirect, nothing is locked, and ten policy
  tests hold that shut. Shipping it needs StoreKit and Play Billing products,
  which need developer accounts.
- **Legal `[DRAFT]` sections.** `src/content/legal.ts` is written to be
  reviewable and specific — the alcohol disclaimer, the GDPR articles, the
  retention periods and the subprocessor list are all there — but the governing
  law, the liability cap and the entity details are marked `[DRAFT]` and the app
  shows a warning banner on any document that still contains one. A lawyer has
  to settle those, and `legal.test.ts` flips from passing to blocking when they
  are gone.
- **Store account plumbing**: product IDs, certificates, service-account keys
  and the `sha256_cert_fingerprints` in `public/.well-known/assetlinks.json`.
  `npm run store:check` prints the live list — 11 items, all needing accounts.
- **Five surfaces nobody has watched run**: the map, the QR scanner, the Live
  Activity, the widgets, and push delivery end to end. All wired, all
  type-checked, none possible without a development build on real hardware.

## Deploying

`docs/deploy.md` is the whole procedure. Two steps there are load-bearing and
silent if skipped:

1. **`create extension pg_cron;` before `db push`.** Without it `00049` applies,
   prints a notice and schedules nothing — safety escalation included. The
   deploy workflow enables it and then reads `cron.job` back to prove the seven
   jobs are there, because a migration that schedules nothing looks exactly like
   one that worked.
2. **Schedule the outbound drain.** `send-outbound` is an edge function, so it
   cannot be scheduled from SQL. Skip it and every message the product composes
   sits in a table forever, the safety SMS included.

## A note on how this was built

Nearly every bug worth fixing in this repo was found by *running* something
rather than reading it — a contact sheet that showed 22 pouches rendering
identically, a browser walk that found the sign-in screen rendering a blank
page, a mutation test that revealed seven database assertions had been passing
for the wrong reason. The test suites are green and that is worth very little on
its own; `npm run tester` and `scripts/render-nicotine.mjs` exist because
looking is the part that finds things.
