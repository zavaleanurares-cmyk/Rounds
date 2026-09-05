import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Two builds from one config.
 *
 * `ROUNDS_GO=1` produces a config Expo Go can run: the custom native module is
 * left out, because Expo Go cannot load one. Everything else — the map, the QR
 * scanner, local notifications, all 74 screens — works, so a tester scans a QR
 * code and is in the app in ten seconds with nothing installed but Expo Go.
 *
 * The default is the full build, where `npx expo prebuild` adds the Live
 * Activity, the widgets, the Control Center control and the App Intents.
 *
 *   npm start           full build config
 *   npm run go          Expo Go config, tunnelled, QR on screen
 */
const EXPO_GO = process.env.ROUNDS_GO === '1';

/**
 * Some keys land in the shipped `ExpoConfig` types later than they land in
 * Expo itself, so the object is asserted once at the end rather than sprinkled
 * with per-key casts.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: EXPO_GO ? 'ROUNDS (Go)' : 'ROUNDS',
  slug: 'rounds',
  version: '1.0.0',
  scheme: 'rounds',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#06070B',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#06070B',
  },
  assetBundlePatterns: ['**/*'],

  ios: {
    supportsTablet: false,
    bundleIdentifier: 'app.rounds.client',
    associatedDomains: ['applinks:rounds.app'],
    ...(EXPO_GO
      ? {}
      : { entitlements: { 'com.apple.security.application-groups': ['group.app.rounds.client'] } }),
    infoPlist: {
      UIViewControllerBasedStatusBarAppearance: true,
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'ROUNDS shows venues near you and, only if you turn it on for a night, shares your location with the people in that night.',
      NSCameraUsageDescription: "To scan a night's QR code and join your group.",
      NSContactsUsageDescription:
        'Contacts are hashed on your device to find friends. Raw numbers never leave your phone.',
      NSPhotoLibraryUsageDescription:
        'To choose a photo for your profile. ROUNDS reads only the picture you pick and never browses your library.',
      NSUserTrackingUsageDescription:
        'ROUNDS does not track you across other apps. This prompt appears only because a library requests it.',
    },
  },

  android: {
    package: 'app.rounds.client',
    // No edgeToEdgeEnabled: Android 16 makes edge-to-edge mandatory and the
    // key is now rejected by the plugin. The app already lays out for it.
    predictiveBackGestureEnabled: true,
    adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#06070B' },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'CAMERA',
      'POST_NOTIFICATIONS',
      'VIBRATE',
      ...(EXPO_GO ? [] : ['FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_SPECIAL_USE']),
    ],
    // Blocked on purpose: ROUNDS never reads a person's contacts wholesale, and
    // never asks for background location. Both are declined at review otherwise.
    blockedPermissions: ['android.permission.ACCESS_BACKGROUND_LOCATION'],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: 'rounds.app', pathPrefix: '/n' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    config: {
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY ?? '' },
    },
  },

  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-font',
    ['expo-splash-screen', { backgroundColor: '#06070B', imageWidth: 200 }],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'ROUNDS shows venues near you and, only if you turn it on for a night, shares your location with the people in that night.',
      },
    ],
    ['expo-camera', { cameraPermission: "To scan a night's QR code and join your group." }],
    [
      'expo-notifications',
      { color: '#3B82F6', defaultChannel: 'safety' },
    ],
    // The system surfaces need a development build; Expo Go cannot load them.
    ...(EXPO_GO ? [] : ['./modules/rounds-native/plugin/withRoundsNative']),
  ],

  extra: {
    expoGo: EXPO_GO,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },

  experiments: { typedRoutes: false },
} as ExpoConfig);
