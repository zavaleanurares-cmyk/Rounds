# The iOS widget extension target

**Status: not created. This is the last piece of native work before an iOS
build is complete.**

## What is wrong

`modules/rounds-native/plugin/withRoundsNative.js` used to do this:

```js
cfg.modResults.__roundsTargets = { widgetExtension: {...}, watchApp: {...} };
```

Nothing ever read `__roundsTargets`. It described a target rather than creating
one. Confirmed by running `expo prebuild --platform ios` and parsing the result:

- the generated Xcode project contains **exactly one** `PBXNativeTarget` — the app
- **none** of the Swift files in `modules/rounds-native/ios/` are copied into `ios/`

So the Live Activity, the three home-screen widget families and the Control
Center control **do not exist in an iOS build**, while the app is configured as
though they do: `NSSupportsLiveActivities` and
`NSSupportsLiveActivitiesFrequentUpdates` are set in `Info.plist`, the app
target is entitled for `group.app.rounds.client`, and the JS calls into the
native module. The app would install, run, and silently have no system surfaces.

Nothing in this repository could catch it. The JS suite, the typecheck,
`store:check` and every Linux CI job pass without compiling a line of Swift.

Prebuild now **throws** rather than producing a widget-less project.
`ROUNDS_ALLOW_NO_WIDGETS=1` builds without them deliberately, which is what the
`ios / app` CI job uses.

## The contract

Kept as data in the plugin, as `WIDGET_EXTENSION`, so the implementation and the
test agree and the source list cannot drift from the directory:

| | |
|---|---|
| Target name | `RoundsWidgets` |
| Product type | `com.apple.product-type.app-extension` |
| Bundle id | app's bundle id + `.widgets` → `app.rounds.client.widgets` |
| Deployment target | 17.0 |
| Entitlements | `com.apple.security.application-groups` = `["group.app.rounds.client"]` |
| Info.plist | `NSExtension.NSExtensionPointIdentifier` = `com.apple.widgetkit-extension` |
| Frameworks | WidgetKit, SwiftUI, ActivityKit, AppIntents |

Sources, in order:

1. `RoundsWidgetBundle.swift` — **the `@main` entry point.** A WidgetKit
   extension is a separate executable and needs one; without it the five
   surfaces are types nothing instantiates.
2. `RoundsShared.swift` — the App Group store. Compiled into **both** the app
   module and the extension; they are separate processes sharing a suite, not a
   shared library.
3. `RoundsActivityAttributes.swift`
4. `RoundsIntents.swift`
5. `RoundsLiveActivityView.swift`
6. `RoundsWidgets.swift`
7. `RoundsControl.swift`

`RoundsNativeModule.swift` belongs to the **app** target, not the extension —
it is the Expo module, autolinked through the podspec.

## The step that gets forgotten

An **Embed App Extensions** copy-files phase on the *app* target, with
`dstSubfolderSpec = 13` (PlugIns), plus a target dependency app → extension.

Miss it and everything still compiles, the build is green, and the installed app
has no widgets. That is why the CI check is not "did it build" but:

```
ROUNDS.app/PlugIns/RoundsWidgets.appex exists
```

## How to do it

**Recommended: `@bacons/apple-targets`.** Purpose-built for this, and what most
Expo apps with widgets use. Roughly: add the dependency, add an
`expo-target.config.js` describing the extension, and let it generate the
target — then keep `withRoundsNative.js` for the Info.plist, entitlements,
Android manifest and privacy-manifest copy it already handles well.

**By hand**, against the `xcode` package that `withXcodeProject` exposes:
`addTarget`, `addBuildPhase` (Sources / Frameworks / Resources),
`addXCConfigurationList`, `addTargetDependency`,
`addToPbxCopyfilesBuildPhase` for the embed, plus a `PBXGroup` for the sources.
Fiddlier, no new dependency, and easier to get subtly wrong.

Either way, write the extension's `Info.plist` and `.entitlements` into `ios/`
from a `withDangerousMod`, the same way `PrivacyInfo.xcprivacy` is copied today.

## How to verify — in this order

1. `npx expo prebuild --platform ios --clean` — must no longer throw
2. `node -e "const x=require('xcode');const p=x.project('ios/ROUNDS.xcodeproj/project.pbxproj').parseSync();console.log(Object.values(p.pbxNativeTargetSection()).filter(t=>t.name).map(t=>t.name))"` — must print **two** targets
3. Push. The `ios / widgets` CI job compiles it on a free macOS runner and fails
   unless the `.appex` is embedded. Then remove `continue-on-error` from that
   job — that is what makes this done.
4. Only then, on hardware: start a night and confirm the Live Activity appears
   on the Lock Screen, place each widget size, and add the Control Center
   control.

Steps 1–3 need no Apple Developer account and no Mac. Step 4 needs both.

## Do not

- Do not chase a green build as the finish line. The embed phase is the trap.
- Do not add the extension's sources to the app target as well. Duplicate
  `@main`, duplicate symbols.
- Do not raise the extension's deployment target above 17.0 for the Control
  Center control — it is behind `if #available(iOS 18.0, *)` in the bundle for
  exactly that reason.

## While it is unfinished

`ios / widgets` is `continue-on-error: true`, so it reports without blocking
merges. It is the standing, visible record that an iOS build ships without its
system surfaces. Delete neither the job nor this file until step 3 is done.
