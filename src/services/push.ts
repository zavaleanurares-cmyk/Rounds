/**
 * Notifications.
 *
 * ROUNDS sends four things and no more: the morning recap, a safe-arrival
 * reminder, plans, and social. Capped at three a week by default, gamification
 * off by default, and — the rule that matters most — **never during a live
 * night**. Interrupting someone who is out is the fastest way to get an app
 * deleted, and it is enforced here rather than left to each sender.
 *
 * Local notifications work everywhere including Expo Go, which is what the
 * safety check-in reminder actually needs. Remote push needs a development
 * build on Android; the app says so rather than silently doing nothing.
 */
import { Platform } from 'react-native';
import { capabilities, optional, isExpoGo } from './optional';
import { getClient } from '@/data/remote';

export type Category = 'morning' | 'weekly' | 'plans' | 'social' | 'safety' | 'gamification' | 'live';

/**
 * What a `live` data push carries.
 *
 * Android has no Live Activity. Its equivalent is the ongoing foreground
 * notification, which only this process can redraw, so the fan-out reaches it
 * as a silent data push that this handler turns into a HUD update.
 *
 * The shape is the same as the iOS content state and, like it, carries only the
 * shared facts of the night: a count and the last drink. There is no pace and
 * no estimate in it, because neither is computable from anyone else's log and
 * neither should ever travel between devices.
 */
export interface LiveHudPush {
  sessionId: string;
  drinks: number;
  lastDrink: string;
  at: number;
}

const CHANNELS: Array<{ id: Category; name: string; importance: 'default' | 'high' | 'low' }> = [
  { id: 'safety', name: 'Safety check-ins', importance: 'high' },
  { id: 'morning', name: 'Morning recap', importance: 'default' },
  { id: 'plans', name: 'Plans', importance: 'default' },
  { id: 'social', name: 'Friends and crews', importance: 'default' },
  { id: 'weekly', name: 'Weekly recap', importance: 'low' },
  { id: 'gamification', name: 'Achievements', importance: 'low' },
];

function mod() {
  if (!capabilities().notifications) return null;
  return optional(() => require('expo-notifications'));
}

export function configureHandler(isNightLive: () => boolean): void {
  const N = mod();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async (notification: any) => {
      const category = notification?.request?.content?.data?.category as Category | undefined;

      // A HUD refresh is not a notification. It exists to redraw a surface the
      // user is already looking at; showing a banner and a tray entry for it
      // would mean a buzz in your pocket every time anyone at the table logged
      // a drink, which is the fastest way to make people turn the feature off.
      if (category === 'live') {
        return {
          shouldShowBanner: false,
          shouldShowList: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        };
      }

      // The one rule. A safety notification is the sole exception, because it
      // is the one the user explicitly asked for before they went out.
      const suppress = isNightLive() && category !== 'safety';
      return {
        shouldShowBanner: !suppress,
        shouldShowList: true,
        shouldPlaySound: !suppress && category === 'safety',
        shouldSetBadge: false,
      };
    },
  });
}

/**
 * Subscribes to `live` data pushes and hands each one to `onHudRefresh`.
 *
 * Returns an unsubscribe function, or a no-op where notifications are
 * unavailable — the caller must not have to care which.
 */
export function onLiveHudPush(handler: (payload: LiveHudPush) => void): () => void {
  const N = mod();
  if (!N) return () => {};
  const sub = N.addNotificationReceivedListener((notification: any) => {
    const data = notification?.request?.content?.data;
    if (data?.category !== 'live' || !data?.sessionId) return;
    handler({
      sessionId: String(data.sessionId),
      drinks: Number(data.drinks ?? 0),
      lastDrink: String(data.lastDrink ?? ''),
      at: Number(data.at ?? Date.now()),
    });
  });
  return () => {
    try {
      sub?.remove();
    } catch {
      /* already gone */
    }
  };
}

export async function ensureChannels(): Promise<void> {
  const N = mod();
  if (!N || Platform.OS !== 'android') return;
  for (const c of CHANNELS) {
    await N.setNotificationChannelAsync(c.id, {
      name: c.name,
      importance:
        c.importance === 'high'
          ? N.AndroidImportance.HIGH
          : c.importance === 'low'
            ? N.AndroidImportance.LOW
            : N.AndroidImportance.DEFAULT,
      sound: c.id === 'safety' ? 'default' : null,
      vibrationPattern: c.id === 'safety' ? [0, 250, 250, 250] : undefined,
    }).catch(() => {});
  }
}

export type PermissionState = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export async function permissionStatus(): Promise<PermissionState> {
  const N = mod();
  if (!N) return 'unavailable';
  try {
    const { status } = await N.getPermissionsAsync();
    return status as PermissionState;
  } catch {
    // Unguarded, this was an unhandled rejection that left the diagnostics row
    // reading '…' forever.
    return 'unavailable';
  }
}

/**
 * Asked only after the primer screen has explained the three things we send.
 * A cold OS dialog costs the permission, and on Android 13+ it is a runtime
 * permission you get exactly one shot at.
 */
export async function requestPermission(): Promise<PermissionState> {
  const N = mod();
  if (!N) return 'unavailable';
  await ensureChannels();
  const { status } = await N.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false, allowProvisional: false },
  });
  return status as PermissionState;
}

/** Registers this device for remote push and stores the token server-side. */
export async function registerForPush(): Promise<string | null> {
  const N = mod();
  if (!N || !capabilities().remotePush) return null;
  const Constants = optional(() => require('expo-constants').default);
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  try {
    const token = (await N.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    const supabase = getClient();
    if (supabase && token) {
      await supabase.from('push_tokens').upsert(
        { token, platform: Platform.OS },
        { onConflict: 'token' }
      );
    }
    return token;
  } catch {
    return null;
  }
}

/**
 * The safe-arrival reminder, scheduled LOCALLY on purpose.
 *
 * A check-in that depends on a push server is a check-in that fails exactly
 * when the network does — which is the night you most needed it. The server
 * escalation to trusted contacts is the backstop; this is the primary, and it
 * fires from the device with no signal at all.
 */
export async function scheduleSafetyReminder(deadlineAt: number, message: string): Promise<string | null> {
  const N = mod();
  if (!N) return null;
  await cancelSafetyReminders();
  const seconds = Math.max(1, Math.round((deadlineAt - Date.now()) / 1000));
  try {
    return await N.scheduleNotificationAsync({
      content: {
        title: 'Are you home?',
        body: "Tap to check in. If you don't, we'll let your trusted contacts know in 15 minutes.",
        data: { category: 'safety' as Category, kind: 'safe_arrival', message },
        sound: 'default',
        categoryIdentifier: 'safe_arrival',
      },
      trigger: { type: N.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
    });
  } catch {
    return null;
  }
}

export async function cancelSafetyReminders(): Promise<void> {
  const N = mod();
  if (!N) return;
  const scheduled = await N.getAllScheduledNotificationsAsync().catch(() => []);
  for (const n of scheduled) {
    if (n.content?.data?.kind === 'safe_arrival') {
      await N.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
    }
  }
}

/**
 * The morning recap, at the user's typical wake time for that weekday and never
 * before 09:00. Scheduled locally too — it is a better experience than a push
 * that arrives at 06:40 because a server queue drained early.
 */
export async function scheduleMorningRecap(wakeHour: number, sessionId: string): Promise<string | null> {
  const N = mod();
  if (!N) return null;
  const hour = Math.max(9, Math.min(13, wakeHour));
  const when = new Date();
  when.setDate(when.getDate() + (when.getHours() >= hour ? 1 : 0));
  when.setHours(hour, 15, 0, 0);
  try {
    return await N.scheduleNotificationAsync({
      content: {
        title: 'Your night is ready',
        body: 'Where you went, what it cost, and the gaps worth filling.',
        data: { category: 'morning' as Category, href: `/morning/${sessionId}` },
      },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: when },
    });
  } catch {
    return null;
  }
}

/** Sets up the actionable buttons so a check-in is answerable from the banner. */
export async function registerCategories(): Promise<void> {
  const N = mod();
  if (!N) return;
  await N.setNotificationCategoryAsync('safe_arrival', [
    { identifier: 'home_safe', buttonTitle: "I'm home safe", options: { opensAppToForeground: false } },
    { identifier: 'need_more_time', buttonTitle: 'Give me an hour', options: { opensAppToForeground: false } },
  ]).catch(() => {});
}

export const pushDiagnostics = () => ({
  local: capabilities().notifications,
  remote: capabilities().remotePush,
  note: isExpoGo()
    ? 'Expo Go has no remote push on Android. Local notifications — including the safety check-in — work.'
    : null,
});
