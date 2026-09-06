# The iOS widget extension target

**Status: built.** `expo prebuild --platform ios` produces a project with two
native targets, `npm run verify:ios` asserts the contract below against the
generated `project.pbxproj`, and — as of the run on 6 September 2026 — the
`ios / widgets` job compiles the extension on a macOS runner and finds
`ROUNDS.app/PlugIns/RoundsWidgets.appex` inside the built app. Steps 1 to 3 are
done. What remains is step 4, a real device, which needs an Apple Developer
account.

Getting there took five rounds of that job, and every one of them found
something no check in this repository could have: two Swift files that had
never been compiled and did not import AppIntents, an `Optional.map` closure
that dropped its argument, a runner whose Swift was a version behind what Expo
57 requires, and — after the contract verifier had passed — extension sources
referenced one directory too deep, which is the failure below.

## What was wrong

`modules/rounds-native/plugin/withRoundsNative.js` used to do this:

```js
cfg.modResults.__roundsTargets = { widgetExtension: {...}, watchApp: {...} };
```

Nothing ever read `__roundsTargets`. It described a target rather than creating
one, so the generated Xcode project contained **exactly one** `PBXNativeTarget`
— the app — and none of the Swift files in `modules/rounds-native/ios/` were
compiled into anything. The Live Activity, the three home-screen widget families
and the Control Center control **did not exist in an iOS build**, while the app
was configured as though they did: `NSSupportsLiveActivities` and
`NSSupportsLiveActivitiesFrequentUpdates` set in `Info.plist`, the app target
entitled for `group.app.rounds.client`, and the JS calling into the native
module. The app would install, run, and silently have no system surfaces.

Nothing in this repository could catch it. The JS suite, the typecheck,
`store:check` and every Linux CI job pass without compiling a line of Swift.

`ROUNDS_ALLOW_NO_WIDGETS=1` still builds without them deliberately, which is
what the `ios / app` CI job uses so that a break in the app itself is not hidden
behind the extension.

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

## How it is done

By hand, against the `xcode` package that `withXcodeProject` exposes — no new
dependency, and every part of it asserted by a command rather than trusted.
`withWidgetExtensionFiles` copies the seven sources into `ios/RoundsWidgets/`
and writes the `Info.plist` and `.entitlements` there, the same way
`PrivacyInfo.xcprivacy` is copied. `withWidgetExtensionTarget` then calls
`addTarget(name, 'app_extension', ...)`, which creates the target, the `.appex`
product, the app → extension dependency and the PlugIns copy-files phase
together, and adds the sources, the frameworks and the build settings to it.

**One thing to know if you touch this.** `addTargetDependency` in the `xcode`
package guards on the `PBXTargetDependency` and `PBXContainerItemProxy` sections
already existing, and *returns having done nothing* when they do not. An Expo
project with a single target has neither. So `addTarget` appeared to wire the
app to the extension and silently did not. The plugin creates both sections
before calling it. This was found by running `npm run verify:ios` on the first
attempt, not by reading the library — the project looked complete, and the
dependency was simply absent.

The sources are copied into `ios/` rather than referenced in place because
`ios/` is disposable: `prebuild --clean` deletes it, and a project whose sources
point up and out of the project directory breaks the first time somebody moves
the module.

## How to verify — in this order

```bash
npx expo prebuild --platform ios --no-install --clean   # 1 · must not throw
npm run verify:ios                                      # 2 · the contract above
```

Step 2 is `scripts/verify-ios-target.mjs`. It reads `WIDGET_EXTENSION` out of
the plugin, so the contract has one source, and asserts every row of it against
the generated `project.pbxproj`: two native targets, the app-extension product
type, the `.appex` product, the app → extension dependency, a copy-files phase
on the *app* target with `dstSubfolderSpec = 13` containing that `.appex`, the
seven sources and nothing else, the four frameworks, the deployment target, the
bundle id, the entitlements path, and the two files on disk. It names which part
is wrong rather than saying the build has no PlugIns directory.

It asserts the **number** 13, not the phase's name: Xcode calls that phase
"Embed App Extensions", the `xcode` package calls it "Copy Files", and the name
is decoration. Ten mutations of the generated project — dropping the `.appex`
from the phase, retargeting the phase to Resources, removing the dependency,
removing `RoundsWidgetBundle.swift`, raising the deployment target, unlinking
ActivityKit, pointing at the app's entitlements, deleting the target, deleting
the `Info.plist`, changing the app group — each turn it red.

3. `ios / widgets` in `.github/workflows/ios.yml` runs both of those on a free
   macOS runner, then builds and fails unless
   `ROUNDS.app/PlugIns/RoundsWidgets.appex` exists. `continue-on-error` is gone
   from that job: it is the requirement now, not a report.
4. Only then, on hardware: start a night and confirm the Live Activity appears
   on the Lock Screen, place each widget size, and add the Control Center
   control.

### What step 3 caught that step 2 could not

`verify:ios` passed, and the build then stopped with

```
error: Build input files cannot be found:
'.../ios/RoundsWidgets/RoundsWidgets/RoundsWidgetBundle.swift', ...
```

RoundsWidgets twice. The extension's group carries `path = RoundsWidgets` and
each source was added as `RoundsWidgets/<file>`, so every reference resolved one
directory too deep. Both verifiers compared basenames — `path.split('/').pop()`
— which cannot tell that string apart from the same string in a group with no
path, and only one of the two exists on disk.

The verifier resolves each source the way Xcode does now: its own path with the
path of every group above it in front, then checks the file is there. That is
the difference between a two-second failure on Linux and a five-minute one that
compiles the whole pod graph before noticing.

Steps 1–3 need no Apple Developer account and no Mac. Step 4 needs both.

## Do not

- Do not chase a green build as the finish line. The embed phase is the trap.
- Do not add the extension's sources to the app target as well. Duplicate
  `@main`, duplicate symbols. `RoundsNative.podspec` used to glob
  `**/*.{h,m,swift}`, which did exactly that — every widget type and the `@main`
  bundle went into the app's static framework as well. It now names the three
  files the app needs, and a test holds it there.
- Do not raise the extension's deployment target above 17.0 for the Control
  Center control — it is behind `if #available(iOS 18.0, *)` in the bundle for
  exactly that reason.

## What is left

Step 4, and only step 4. Nothing about the Live Activity actually appearing on a
Lock Screen, a widget rendering at each size, or the Control Center control
being addable can be proven by a compiler. That needs an Apple Developer
account, a device, and somebody watching it — see `npm run store:check` for the
rest of that list.
