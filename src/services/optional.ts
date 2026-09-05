/**
 * Optional native modules.
 *
 * The app has to run in three places with very different capabilities: a
 * development build (everything), Expo Go (most things, no custom native code),
 * and a browser (no native at all). A screen that throws because a module is
 * missing turns "this feature isn't available here" into "the app is broken".
 *
 * So every native dependency is required lazily through this file and every
 * caller gets `null` rather than an exception. The rule: a missing capability
 * must degrade to a stated limitation the user can read, never to a crash.
 */
import type { Locale } from '@/i18n';
import { translate } from '@/i18n/translate';

export function optional<T>(loader: () => T): T | null {
  try {
    return loader();
  } catch {
    return null;
  }
}

/** True in Expo Go, where custom native modules are absent by definition. */
export function isExpoGo(): boolean {
  const Constants = optional(() => require('expo-constants').default);
  return Constants?.appOwnership === 'expo';
}

export function isWeb(): boolean {
  return require('react-native').Platform.OS === 'web';
}

/**
 * What this build can actually do. Screens read this rather than testing for
 * modules themselves, so the answer is consistent and explainable in one place.
 */
export interface Capabilities {
  map: boolean;
  camera: boolean;
  location: boolean;
  /** Local notifications. Remote push needs a dev build on Android. */
  notifications: boolean;
  remotePush: boolean;
  purchases: boolean;
  /** Live Activity, widgets, Control Center, Siri — custom native only. */
  systemSurfaces: boolean;
  contacts: boolean;
  haptics: boolean;
  shareCard: boolean;
}

/**
 * Every require below is STATIC.
 *
 * Metro resolves the dependency graph at build time, so `require(someVariable)`
 * is a build error, not a runtime miss. Each module gets its own line and its
 * own try/catch — more verbose, but it is the only shape that works and it makes
 * the list of what the app optionally depends on readable in one place.
 */
const probe = {
  maps: () => optional(() => require('react-native-maps')),
  camera: () => optional(() => require('expo-camera')),
  location: () => optional(() => require('expo-location')),
  notifications: () => optional(() => require('expo-notifications')),
  purchases: () => optional(() => require('react-native-purchases')),
  contacts: () => optional(() => require('expo-contacts')),
  viewShot: () => optional(() => require('react-native-view-shot')),
  // Expo module, so it resolves through expo-modules-core — not NativeModules.
  surfaces: () => optional(() => require('expo-modules-core').requireOptionalNativeModule('RoundsNative')),
};

let cached: Capabilities | null = null;

export function capabilities(): Capabilities {
  if (cached) return cached;
  const web = isWeb();
  const go = isExpoGo();

  cached = {
    map: !web && Boolean(probe.maps()),
    camera: !web && Boolean(probe.camera()),
    location: Boolean(probe.location()),
    notifications: !web && Boolean(probe.notifications()),
    // Expo Go dropped remote push on Android; local notifications still work,
    // which is what the safety check-in reminder actually needs.
    remotePush: !web && !go && Boolean(probe.notifications()),
    purchases: !web && !go && Boolean(probe.purchases()),
    systemSurfaces: !web && !go && Boolean(probe.surfaces()),
    contacts: !web && Boolean(probe.contacts()),
    haptics: !web,
    shareCard: !web && Boolean(probe.viewShot()),
  };
  return cached;
}

/** The modules themselves, for callers that need more than a boolean. */
export const modules = probe;

/**
 * Human-readable reason a capability is missing. Shown, never swallowed.
 *
 * Takes the locale rather than reading a hook: this is a plain function called
 * from render bodies and from services alike, and `translate` is pure.
 */
export function whyMissing(key: keyof Capabilities, locale: Locale): string {
  if (isWeb()) return translate(locale, 'common.missingBrowser');
  if (isExpoGo() && (key === 'systemSurfaces' || key === 'purchases' || key === 'remotePush')) {
    return translate(locale, 'common.missingDevBuild');
  }
  return translate(locale, 'common.missingDevice');
}
