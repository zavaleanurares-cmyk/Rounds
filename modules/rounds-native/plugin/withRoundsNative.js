/**
 * The Expo config plugin for the system surfaces.
 *
 * These surfaces cannot run in Expo Go — Live Activities, WidgetKit, App
 * Intents, Control Center controls, foreground services and Quick Settings
 * tiles all need native targets and entitlements. This plugin is what turns a
 * `npx expo prebuild` into a project that has them.
 *
 * That is the "leave Expo Go, stay on Expo" call from the strategy doc, made
 * concrete: a build-pipeline change, not a rewrite.
 */
const fs = require('node:fs');
const path = require('node:path');
const {
  withInfoPlist,
  withEntitlementsPlist,
  withAndroidManifest,
  withXcodeProject,
  withDangerousMod,
  AndroidConfig,
} = require('expo/config-plugins');
const plist = require('@expo/plist').default;

const APP_GROUP = 'group.app.rounds.client';

/**
 * What the widget extension target must contain when it is finally created.
 *
 * Kept as data rather than prose so the implementation and the test can agree
 * on it, and so the list cannot quietly drift from the directory. See
 * docs/ios-widget-target.md.
 */
const WIDGET_EXTENSION = {
  name: 'RoundsWidgets',
  bundleIdSuffix: '.widgets',
  deploymentTarget: '17.0',
  entitlements: { 'com.apple.security.application-groups': [APP_GROUP] },
  infoPlist: {
    NSExtension: { NSExtensionPointIdentifier: 'com.apple.widgetkit-extension' },
  },
  frameworks: ['WidgetKit', 'SwiftUI', 'ActivityKit', 'AppIntents'],
  sources: [
    // RoundsWidgetBundle carries the @main entry point; without it the
    // extension has no executable start and the surfaces never instantiate.
    'RoundsWidgetBundle.swift',
    'RoundsShared.swift',
    'RoundsActivityAttributes.swift',
    'RoundsIntents.swift',
    'RoundsLiveActivityView.swift',
    'RoundsWidgets.swift',
    'RoundsControl.swift',
  ],
};

/* ------------------------------------------------------------------- iOS */

/**
 * Where the extension's sources live in the repository, and where they are
 * copied to inside the generated `ios/` directory.
 *
 * They are copied rather than referenced in place because `ios/` is disposable:
 * `expo prebuild --clean` deletes it, and an Xcode project whose sources point
 * up and out of the project directory is a path that breaks the first time
 * somebody moves the module.
 */
const MODULE_IOS_DIR = path.join(__dirname, '..', 'ios');

function extensionInfoPlist(config) {
  return {
    CFBundleDevelopmentRegion: '$(DEVELOPMENT_LANGUAGE)',
    CFBundleDisplayName: config.name ?? WIDGET_EXTENSION.name,
    CFBundleExecutable: '$(EXECUTABLE_NAME)',
    CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)',
    CFBundleInfoDictionaryVersion: '6.0',
    CFBundleName: '$(PRODUCT_NAME)',
    CFBundlePackageType: '$(PRODUCT_BUNDLE_PACKAGE_TYPE)',
    CFBundleShortVersionString: config.version ?? '1.0.0',
    CFBundleVersion: '1',
    ...WIDGET_EXTENSION.infoPlist,
  };
}

/**
 * Step one: the extension's files.
 *
 * The seven Swift sources, an Info.plist that makes it a WidgetKit extension,
 * and the entitlements that let it read the App Group the app writes into. All
 * written on every prebuild, for the same reason `PrivacyInfo.xcprivacy` is —
 * a manual copy into a directory that gets deleted is a step that is done
 * correctly four times and forgotten on the fifth.
 */
function withWidgetExtensionFiles(config) {
  return withDangerousMod(config, [
    'ios',
    (cfg) => {
      const dir = path.join(cfg.modRequest.platformProjectRoot, WIDGET_EXTENSION.name);
      fs.mkdirSync(dir, { recursive: true });

      for (const file of WIDGET_EXTENSION.sources) {
        const from = path.join(MODULE_IOS_DIR, file);
        if (!fs.existsSync(from)) {
          throw new Error(
            `rounds-native: ${WIDGET_EXTENSION.name} lists ${file}, but ` +
              `modules/rounds-native/ios/${file} does not exist. The source list in ` +
              'WIDGET_EXTENSION and the directory have drifted apart.'
          );
        }
        fs.copyFileSync(from, path.join(dir, file));
      }

      fs.writeFileSync(
        path.join(dir, 'Info.plist'),
        plist.build(extensionInfoPlist(cfg)),
        'utf8'
      );
      fs.writeFileSync(
        path.join(dir, `${WIDGET_EXTENSION.name}.entitlements`),
        plist.build(WIDGET_EXTENSION.entitlements),
        'utf8'
      );

      return cfg;
    },
  ]);
}

/**
 * Step two: the target itself.
 *
 * This block used to set a `__roundsTargets` property on the project and
 * return. Nothing ever read that property. It described a target instead of
 * creating one, so every prebuild produced an Xcode project with exactly one
 * native target — the app — and the six Swift files in `ios/` were not copied
 * in, not compiled, and not embedded: `NSSupportsLiveActivities` was set, the
 * app group was entitled, the JS called into the native module, and none of the
 * Live Activity, the three widget families or the Control Center control
 * existed in the binary.
 *
 * `addTarget(..., 'app_extension', ...)` does four things that must all happen
 * together, and the fourth is the one that gets forgotten by hand:
 *
 *   1 · the PBXNativeTarget, typed `com.apple.product-type.app-extension`
 *   2 · the `.appex` product file
 *   3 · a PBXTargetDependency app → extension, so building the app builds it
 *   4 · a PBXCopyFilesBuildPhase on the *app* target with
 *       `dstSubfolderSpec = 13` (PlugIns) holding that `.appex`
 *
 * Without 4 everything still compiles, the build is green, and the installed
 * app has no widgets — which is why the CI check is not "did it build" but
 * `ROUNDS.app/PlugIns/RoundsWidgets.appex exists`, and why
 * `scripts/verify-ios-target.mjs` asserts the subfolder spec rather than the
 * phase's name.
 */
function withWidgetExtensionTarget(config) {
  return withXcodeProject(config, (cfg) => {
    const proj = cfg.modResults;
    const name = WIDGET_EXTENSION.name;

    // Prebuild can run the mod against an existing project. Adding the target
    // twice produces two of everything and an Xcode project that will not open.
    if (proj.pbxTargetByName(name) || proj.pbxTargetByName(`"${name}"`)) return cfg;

    const appBundleId = cfg.ios?.bundleIdentifier;
    if (!appBundleId) {
      throw new Error('rounds-native: ios.bundleIdentifier is not set, so the extension has no bundle id.');
    }
    const bundleId = `${appBundleId}${WIDGET_EXTENSION.bundleIdSuffix}`;

    // getFirstTarget() is the app; the embed phase and the dependency go on it.
    const appTarget = proj.getFirstTarget();

    // A project with a single target has no PBXTargetDependency or
    // PBXContainerItemProxy section at all, and `addTargetDependency` in the
    // `xcode` package guards on both existing — `if (proxySection &&
    // dependencySection)` — and returns having done nothing when they do not.
    // So `addTarget` appeared to wire app → extension and silently did not:
    // the extension would have been built only when Xcode felt like it, and
    // `xcodebuild -scheme ROUNDS` need not have built it at all.
    //
    // Found by scripts/verify-ios-target.mjs on the first run, not by reading
    // the library. The sections are created here so the dependency lands.
    const objects = proj.hash.project.objects;
    objects.PBXTargetDependency = objects.PBXTargetDependency || {};
    objects.PBXContainerItemProxy = objects.PBXContainerItemProxy || {};

    const target = proj.addTarget(name, 'app_extension', name, bundleId);

    proj.addBuildPhase([], 'PBXSourcesBuildPhase', 'Sources', target.uuid);
    proj.addBuildPhase([], 'PBXResourcesBuildPhase', 'Resources', target.uuid);
    proj.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);

    // A group so the sources are visible in Xcode's navigator, and so their
    // paths resolve relative to ios/RoundsWidgets/ rather than the project root.
    const groupKey = proj.pbxCreateGroup(name, name);
    const groups = proj.hash.project.objects.PBXGroup;
    for (const key of Object.keys(groups)) {
      if (key.endsWith('_comment')) continue;
      const group = groups[key];
      // The main group is the only one with neither a name nor a path.
      if (group.name === undefined && group.path === undefined) {
        proj.addToPbxGroup(groupKey, key);
      }
    }

    for (const file of WIDGET_EXTENSION.sources) {
      proj.addSourceFile(`${name}/${file}`, { target: target.uuid }, groupKey);
    }

    for (const framework of WIDGET_EXTENSION.frameworks) {
      proj.addFramework(`${framework}.framework`, { target: target.uuid });
    }

    // The app is iPhone-only; an extension that claims iPad is rejected at
    // submission for supporting a device family its container does not.
    const appSettings = appTargetBuildSettings(proj, appTarget);

    const settings = {
      CLANG_ENABLE_MODULES: 'YES',
      CODE_SIGN_ENTITLEMENTS: `"${name}/${name}.entitlements"`,
      CODE_SIGN_STYLE: 'Automatic',
      CURRENT_PROJECT_VERSION: '1',
      INFOPLIST_FILE: `"${name}/Info.plist"`,
      IPHONEOS_DEPLOYMENT_TARGET: WIDGET_EXTENSION.deploymentTarget,
      LD_RUNPATH_SEARCH_PATHS:
        '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
      MARKETING_VERSION: '1.0.0',
      PRODUCT_BUNDLE_IDENTIFIER: `"${bundleId}"`,
      SKIP_INSTALL: 'YES',
      SWIFT_EMIT_LOC_STRINGS: 'YES',
      SWIFT_VERSION: '5.0',
      TARGETED_DEVICE_FAMILY: appSettings.TARGETED_DEVICE_FAMILY ?? '"1"',
    };

    const configurations = proj.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(configurations)) {
      if (key.endsWith('_comment')) continue;
      const buildSettings = configurations[key].buildSettings;
      if (!buildSettings || buildSettings.PRODUCT_NAME !== `"${name}"`) continue;
      Object.assign(buildSettings, settings);
      if (configurations[key].name === 'Debug') {
        buildSettings.SWIFT_OPTIMIZATION_LEVEL = '"-Onone"';
        buildSettings.SWIFT_ACTIVE_COMPILATION_CONDITIONS = 'DEBUG';
      }
    }

    // `addTarget` names the embed phase "Copy Files", which is what the xcode
    // package calls it. Xcode's own name for a phase with dstSubfolderSpec 13
    // is "Embed App Extensions", and this is the phase a reader will go looking
    // for after a build ships without widgets.
    renameEmbedPhase(proj, appTarget.uuid);

    return cfg;
  });
}

function appTargetBuildSettings(proj, appTarget) {
  const lists = proj.pbxXCConfigurationList();
  const configurations = proj.pbxXCBuildConfigurationSection();
  const listKey = appTarget.pbxNativeTarget
    ? appTarget.pbxNativeTarget.buildConfigurationList
    : appTarget.buildConfigurationList;
  const list = lists?.[listKey];
  const first = list?.buildConfigurations?.[0]?.value;
  return (first && configurations[first]?.buildSettings) || {};
}

function renameEmbedPhase(proj, appTargetUuid) {
  const section = proj.hash.project.objects.PBXCopyFilesBuildPhase || {};
  for (const key of Object.keys(section)) {
    if (key.endsWith('_comment')) continue;
    const phase = section[key];
    if (String(phase.dstSubfolderSpec) !== '13') continue;
    phase.name = '"Embed App Extensions"';
    section[`${key}_comment`] = 'Embed App Extensions';
    const app = proj.hash.project.objects.PBXNativeTarget[appTargetUuid];
    for (const entry of app.buildPhases || []) {
      if (entry.value === key) entry.comment = 'Embed App Extensions';
    }
  }
}

function withIosSurfaces(config) {
  config = withEntitlementsPlist(config, (cfg) => {
    // The App Group is the shared container every out-of-app surface writes
    // into. Without it the Live Activity's buttons have nowhere to put a log.
    const groups = new Set(cfg.modResults['com.apple.security.application-groups'] || []);
    groups.add(APP_GROUP);
    cfg.modResults['com.apple.security.application-groups'] = [...groups];
    return cfg;
  });

  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.NSSupportsLiveActivities = true;
    // Other participants' logs arrive by push during a shared night.
    cfg.modResults.NSSupportsLiveActivitiesFrequentUpdates = true;
    return cfg;
  });

  /**
   * ROUNDS_ALLOW_NO_WIDGETS builds the app deliberately without its system
   * surfaces. It exists so that a break in the app itself is not hidden behind
   * the extension, which is what the `ios / app` CI job uses it for. Nothing
   * else should set it: the resulting build has no Live Activity, no widgets
   * and no Control Center control, while the app is configured as though it
   * does.
   */
  if (process.env.ROUNDS_ALLOW_NO_WIDGETS === '1') {
    console.warn(
      '[rounds-native] Building WITHOUT the iOS widget extension: no Live Activity, ' +
        'no widgets, no Control Center control. ROUNDS_ALLOW_NO_WIDGETS=1 is set.'
    );
  } else {
    config = withWidgetExtensionFiles(config);
    config = withWidgetExtensionTarget(config);
  }

  /**
   * Apple's privacy manifest, copied into the iOS project on every prebuild.
   *
   * `ios-config/PrivacyInfo.xcprivacy` used to carry the instruction "copy into
   * the iOS target after prebuild", which is the kind of step that is done
   * correctly four times and then forgotten on the fifth — and a missing or
   * stale privacy manifest is a rejection, not a warning. Prebuild wipes the
   * `ios/` directory, so a manual copy is guaranteed to be lost eventually.
   *
   * `store:check` asserts that the source file and the copy agree, so a manifest
   * edited in `ios/` by hand is caught rather than silently overwritten.
   */
  config = withDangerousMod(config, [
    'ios',
    (cfg) => {
      const source = path.join(cfg.modRequest.projectRoot, 'ios-config', 'PrivacyInfo.xcprivacy');
      if (!fs.existsSync(source)) {
        throw new Error(
          'ios-config/PrivacyInfo.xcprivacy is missing. It is required at submission and its ' +
            'contents must match the App Privacy answers — see store/app-store.md.'
        );
      }
      const target = path.join(cfg.modRequest.platformProjectRoot, cfg.modRequest.projectName ?? '');
      fs.mkdirSync(target, { recursive: true });
      fs.copyFileSync(source, path.join(target, 'PrivacyInfo.xcprivacy'));
      return cfg;
    },
  ]);

  return config;
}

/* --------------------------------------------------------------- Android */

function withAndroidSurfaces(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    manifest.manifest['uses-permission'] = manifest.manifest['uses-permission'] || [];
    const perms = [
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
      'android.permission.POST_NOTIFICATIONS',
    ];
    for (const name of perms) {
      if (!manifest.manifest['uses-permission'].some((p) => p.$['android:name'] === name)) {
        manifest.manifest['uses-permission'].push({ $: { 'android:name': name } });
      }
    }

    app.service = app.service || [];
    if (!app.service.some((s) => s.$['android:name'] === '.NightHudService')) {
      app.service.push({
        $: {
          'android:name': 'app.rounds.nativemodule.NightHudService',
          'android:exported': 'false',
          'android:foregroundServiceType': 'specialUse',
        },
        property: [
          {
            $: {
              'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
              'android:value': 'Shows your current night and lets you log without opening the app.',
            },
          },
        ],
      });
    }

    // X-06 · the Quick Settings tile
    if (!app.service.some((s) => s.$['android:name']?.includes('RoundsTileService'))) {
      app.service.push({
        $: {
          'android:name': 'app.rounds.nativemodule.RoundsTileService',
          'android:exported': 'true',
          'android:icon': '@drawable/ic_notification',
          'android:label': 'Log a drink',
          'android:permission': 'android.permission.BIND_QUICK_SETTINGS_TILE',
        },
        'intent-filter': [
          { action: [{ $: { 'android:name': 'android.service.quicksettings.action.QS_TILE' } }] },
        ],
      });
    }

    app.receiver = app.receiver || [];
    // X-02 · the one-tap log. NOT exported: only our own notification,
    // widget and tile may fire it.
    if (!app.receiver.some((r) => r.$['android:name']?.includes('QuickLogReceiver'))) {
      app.receiver.push({
        $: { 'android:name': 'app.rounds.nativemodule.QuickLogReceiver', 'android:exported': 'false' },
        'intent-filter': [{ action: [{ $: { 'android:name': 'app.rounds.QUICK_LOG' } }] }],
      });
    }

    // X-03/04/05 · the widget
    if (!app.receiver.some((r) => r.$['android:name']?.includes('RoundsWidget'))) {
      app.receiver.push({
        $: { 'android:name': 'app.rounds.nativemodule.RoundsWidget', 'android:exported': 'false' },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
              { $: { 'android:name': 'app.rounds.WIDGET_REFRESH' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/rounds_widget_info',
            },
          },
        ],
      });
    }

    // Predictive back, per the platform-differences table.
    app.$['android:enableOnBackInvokedCallback'] = 'true';

    return cfg;
  });
}

module.exports = function withRoundsNative(config) {
  config = withIosSurfaces(config);
  config = withAndroidSurfaces(config);
  return config;
};

module.exports.APP_GROUP = APP_GROUP;
module.exports.WIDGET_EXTENSION = WIDGET_EXTENSION;
