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

const APP_GROUP = 'group.app.rounds.client';

/* ------------------------------------------------------------------- iOS */

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
   * THE WIDGET EXTENSION TARGET IS NOT CREATED HERE, AND THAT IS THE GAP.
   *
   * This block used to set a `__roundsTargets` property on the project and
   * return. Nothing ever read that property. It described a target instead of
   * creating one, so every prebuild produced an Xcode project with exactly one
   * native target — the app — and the six Swift files in `ios/` were not copied
   * in, not compiled, and not embedded.
   *
   * The effect: `NSSupportsLiveActivities` is set, the app group is
   * entitled, the JS calls into the native module, and none of the Live
   * Activity, the three widget families or the Control Center control exist in
   * the binary. Nothing in the repository could catch it — the JS suite, the
   * typecheck, `store:check` and CI all pass without ever building iOS.
   *
   * Until the target is really created, prebuild fails loudly rather than
   * quietly producing a build with no system surfaces in it. A missing feature
   * you are told about at prebuild costs an hour; one you find in TestFlight
   * costs a release.
   */
  config = withXcodeProject(config, (cfg) => {
    if (process.env.ROUNDS_ALLOW_NO_WIDGETS === '1') {
      console.warn(
        '[rounds-native] Building WITHOUT the iOS widget extension: no Live Activity, ' +
          'no widgets, no Control Center control. ROUNDS_ALLOW_NO_WIDGETS=1 is set.'
      );
      return cfg;
    }
    throw new Error(
      [
        'rounds-native: the iOS widget extension target is not created yet.',
        '',
        'modules/rounds-native/ios/ holds the Live Activity, the three widget',
        'families and the Control Center control, but nothing adds them to the',
        'Xcode project, so an iOS build silently ships without them.',
        '',
        'Either finish withIosSurfaces() so it creates a real PBXNativeTarget',
        '(sources, an Info.plist, the app-group entitlement, and an embed-appex',
        'phase on the app target), or set ROUNDS_ALLOW_NO_WIDGETS=1 to build the',
        'app deliberately without its system surfaces.',
      ].join('\n')
    );
  });

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
