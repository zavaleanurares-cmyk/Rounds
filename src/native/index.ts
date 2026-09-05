/**
 * The system surfaces — X-01 to X-08.
 *
 * These are the product's core promise: logging without opening the app. The
 * target is that ≥40% of all logs are made outside it, and that number is
 * instrumented from day one.
 *
 * The rule that makes all of this safe: EVERY surface writes through the
 * existing offline queue with a client-generated UUID. There is never a second
 * write path. A tap on the Lock Screen and a tap in the log sheet produce the
 * same row by the same route, which is why a watch that syncs late cannot
 * duplicate a drink.
 *
 * One shared JS interface, two native implementations. Where the native module
 * is absent — Expo Go, the web preview, a simulator without the target — every
 * call degrades to a no-op that reports it did nothing, rather than throwing.
 */
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import type { Drink } from '@/domain/types';
import type { PaceState } from '@/design/tokens';

interface RoundsNativeSpec {
  /** X-01 · Live Activity (iOS) / ongoing foreground notification (Android). */
  startHud(payload: string): Promise<boolean>;
  updateHud(payload: string): Promise<boolean>;
  endHud(): Promise<boolean>;
  /** Drains the shared container the out-of-app surfaces write into. */
  drainPending(): Promise<string>;
  /** X-03/04/05 · Widget payload. */
  publishWidget(payload: string): Promise<boolean>;
  /** X-06 · Control Center control / Quick Settings tile. */
  setQuickTile(payload: string): Promise<boolean>;
  /** X-07 · Donates the shortcuts Siri and Assistant offer. */
  donateShortcuts(payload: string): Promise<boolean>;
  /** X-08 · Pushes state to the watch. */
  updateWatch(payload: string): Promise<boolean>;
}

/**
 * `requireOptionalNativeModule`, not `NativeModules`.
 *
 * The module is an Expo module (see `modules/rounds-native/expo-module.config.json`),
 * and Expo modules are never registered on the old bridge's `NativeModules` map
 * — with `newArchEnabled` they are not there at all. Looking it up in the wrong
 * place made every surface a silent no-op on builds that actually shipped them,
 * and pinned the product's headline metric at zero.
 */
const Native = requireOptionalNativeModule<Partial<RoundsNativeSpec>>('RoundsNative');

export const nativeAvailable = Boolean(Native);

async function call<K extends keyof RoundsNativeSpec>(
  method: K,
  ...args: Parameters<RoundsNativeSpec[K]>
): Promise<ReturnType<RoundsNativeSpec[K]> | null> {
  const fn = Native?.[method] as ((...a: unknown[]) => Promise<unknown>) | undefined;
  if (!fn) return null;
  try {
    return (await fn(...args)) as ReturnType<RoundsNativeSpec[K]>;
  } catch {
    // A failing widget must never take the app down with it.
    return null;
  }
}

/* --------------------------------------------------------------- payloads */

export interface HudState {
  sessionId: string;
  venue: string | null;
  startedAt: number;
  drinks: number;
  paceState: PaceState;
  /** The state WORD, not the estimate. */
  paceWord: string;
  /** The last drink, so "Same again" knows what it repeats. */
  lastDrinkId: string | null;
  lastDrinkName: string | null;
  spendMinor: number;
  currency: string;
}

/**
 * Deliberately absent from every payload below: the ‰ estimate.
 *
 * A Live Activity sits on a Lock Screen that anyone can see, a widget sits on a
 * Home Screen, and neither is a place to put a number that invites the one
 * interpretation the product must never invite. The surfaces carry the state
 * word and the count — nothing else.
 */
export const NightHud = {
  async start(state: HudState) {
    return (await call('startHud', JSON.stringify(state))) ?? false;
  },
  async update(state: HudState) {
    return (await call('updateHud', JSON.stringify(state))) ?? false;
  },
  async end() {
    return (await call('endHud')) ?? false;
  },
};

export interface PendingLog {
  /** Minted by the native surface, so it is idempotent before it ever reaches JS. */
  id: string;
  drinkId: string;
  at: number;
  /** Which surface it came from — instrumented from day one. */
  source: 'live_activity' | 'notification' | 'widget' | 'tile' | 'voice' | 'watch';
}

/**
 * X-02 · One-tap log.
 *
 * The out-of-app surfaces cannot reach the JS queue while the app is suspended,
 * so they write into a shared container (App Group on iOS, DataStore on
 * Android). This drains that container on the next foreground and hands the rows
 * to the queue — which then treats them exactly like an in-app log, because
 * they already carry a client UUID.
 */
export const QuickLog = {
  async drain(): Promise<PendingLog[]> {
    const raw = await call('drainPending');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as PendingLog[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
};

export interface WidgetPayload {
  /** Small: the weekly goal ring, or live pace during a night. */
  live: boolean;
  paceWord: string | null;
  drinks: number;
  weeklyPct: number;
  nextPlanTitle: string | null;
  nextPlanAt: number | null;
  friendsOut: number;
  lastDrinkId: string | null;
  lastDrinkName: string | null;
  /** Large: 91 days of intensity, 0–4, for the heatmap. */
  heatmap: number[];
  accentHex: string;
}

export const WidgetData = {
  async publish(payload: WidgetPayload) {
    return (await call('publishWidget', JSON.stringify(payload))) ?? false;
  },
};

export const QuickTile = {
  /** iOS 18 Control Center control · Android Quick Settings tile. */
  async set(input: { enabled: boolean; lastDrink: Drink | null }) {
    return (
      (await call(
        'setQuickTile',
        JSON.stringify({
          enabled: input.enabled,
          drinkId: input.lastDrink?.id ?? null,
          label: input.lastDrink ? `Log ${input.lastDrink.name}` : 'Log a drink',
        })
      )) ?? false
    );
  },
};

export const VoiceIntents = {
  /** "Log a beer" · "Start a night" · "How many have I had?" · "I'm home safe". */
  async donate(input: { lastDrinkId: string | null; lastDrinkName: string | null }) {
    return (await call('donateShortcuts', JSON.stringify(input))) ?? false;
  },
};

export const WatchBridge = {
  async update(state: HudState | null) {
    return (await call('updateWatch', JSON.stringify(state))) ?? false;
  },
};

export const platformSurfaces = {
  hud: Platform.select({ ios: 'Live Activity + Dynamic Island', android: 'Ongoing notification', default: 'none' }),
  widget: Platform.select({ ios: 'WidgetKit', android: 'Glance', default: 'none' }),
  tile: Platform.select({ ios: 'Control Center control', android: 'Quick Settings tile', default: 'none' }),
  voice: Platform.select({ ios: 'App Intents / Siri', android: 'App Actions', default: 'none' }),
};
