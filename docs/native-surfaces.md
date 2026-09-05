# System surfaces — X-01 to X-08

The product's central promise is logging **without opening the app**. These are
the surfaces that keep it, and the target is that **≥40% of all logs** are made
outside the app — instrumented from day one, and shown in
Settings › System surfaces rather than buried in a dashboard.

## The rule everything obeys

Every surface writes through the **same offline queue** as the log sheet, with a
**UUID the surface mints itself**.

```
  Live Activity button ─┐
  Notification action  ─┤
  Widget button        ─┼─▶ shared container ─▶ QuickLog.drain() ─▶ logQueue ─▶ server
  Quick Settings tile  ─┤     (App Group /        (on foreground)   (idempotent
  Siri / App Actions   ─┤      SharedPreferences)                    by that UUID)
  Watch                ─┘
```

The surfaces run in separate processes and cannot reach the JS queue while the
app is suspended, so they append to a shared container instead. The app drains
it on next foreground and hands the rows to the queue — which treats them
exactly like an in-app log, because they already carry a client UUID.

Two consequences worth stating plainly:

- **A drain that runs twice is harmless.** The read-then-clear is deliberately
  not atomic; if the process dies in between, the rows are drained again and the
  queue's upsert-on-id makes that a no-op.
- **A watch that syncs an hour late cannot turn one drink into two.** There is
  no second write path to disagree with the first.

## What is deliberately absent from every surface

The **‰ estimate**. A Live Activity sits on a Lock Screen anyone can read over
your shoulder; a widget sits on a Home Screen; Siri says things out loud in a
bar. None of those is a place for a number that invites the one interpretation
the product is designed to prevent. The surfaces carry the **state word** and the
**count**, and `HowManyIntent` answers *"5 so far, and you're going steady"* —
never a figure.

## The eight

| ID | Surface | iOS | Android | File |
|---|---|---|---|---|
| X-01 | Live night HUD | Live Activity + Dynamic Island, 12h ceiling | Ongoing foreground notification, `CATEGORY_STOPWATCH`, progress arc | `RoundsLiveActivityView.swift` · `NightHudService.kt` |
| X-02 | One-tap log | `LiveActivityIntent` buttons | Notification actions via `QuickLogReceiver` | `RoundsIntents.swift` · `QuickLogReceiver.kt` |
| X-03 | Widget · small | WidgetKit — weekly ring, or live pace | AppWidget 2×2 | `RoundsWidgets.swift` · `RoundsWidget.kt` |
| X-04 | Widget · medium | WidgetKit, **interactive** on iOS 17+ | AppWidget 4×2, interactive on Android 12+ | same |
| X-05 | Widget · large | 91-night heatmap | AppWidget 4×4 | same |
| X-06 | Quick toggle | Control Center control (iOS 18+) | Quick Settings tile | `RoundsControl.swift` · `RoundsTileService.kt` |
| X-07 | Voice | App Intents + `AppShortcutsProvider` | App Actions / shortcuts.xml | `RoundsIntents.swift` |
| X-08 | Watch | watchOS target + complication (P2) | Wear OS tile (P2) | plugin target stub |

## Running them

They cannot run in Expo Go or a browser — Live Activities, WidgetKit, App
Intents, Control Center controls, foreground services and Quick Settings tiles
all need native targets and entitlements. That is the "leave Expo Go, stay on
Expo" call made concrete: a build-pipeline change, not a rewrite.

```bash
npx expo prebuild            # the config plugin adds the targets
npx expo run:ios             # or run:android
```

`modules/rounds-native/plugin/withRoundsNative.js` adds:

- the App Group `group.app.rounds.client` (iOS) — without it the Live Activity's
  buttons have nowhere to put a log
- `NSSupportsLiveActivities` and frequent updates (other participants' logs
  arrive by push during a shared night)
- the widget-extension target carrying the Live Activity, three widget families
  and the Control Center control in one binary
- the foreground service, tile service, quick-log receiver and widget provider
  in the Android manifest, with `FOREGROUND_SERVICE_SPECIAL_USE` and its
  required subtype declaration
- `android:enableOnBackInvokedCallback` for predictive back

Where the native module is absent, every call in `src/native/index.ts` degrades
to a no-op that reports it did nothing. A failing widget is a cosmetic problem;
a failing widget that crashes the app is not.

## Instrumentation

`Log.source` records which surface produced each row —
`app | live_activity | notification | widget | tile | voice | watch`. That column
is the whole measurement: the share of logs where `source !== 'app'` is the
number that says whether the product is keeping its promise.
