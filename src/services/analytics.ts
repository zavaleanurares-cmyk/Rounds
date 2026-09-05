/**
 * Instrumentation.
 *
 * One headline number: **the share of logs made outside the app**. The product's
 * central promise is logging without opening it, and that ratio is the only
 * honest measure of whether the promise is being kept. Everything else here
 * exists to explain a drop in it.
 *
 * Provider-agnostic on purpose — the sink is swappable and defaults to the
 * user's own Supabase, so nothing about a person's drinking leaves for a
 * third-party analytics vendor by default.
 *
 * Never recorded, at all:
 *   · the ‰ estimate, or anything derived from it
 *   · drink names, venues, prices, or free text
 *   · location, contacts, or anything about another person
 * Events carry counts and enums. If a property could identify what someone
 * drank or where, it does not belong in this file.
 */
import { Platform } from 'react-native';
import { getClient } from '@/data/remote';
import { readJson, writeJson } from '@/data/storage';
import { optional } from './optional';

export type Event =
  // acquisition
  | 'app_open' | 'onboarding_step' | 'onboarding_done' | 'age_gate_failed'
  // the core loop
  | 'session_start' | 'session_end' | 'log_added' | 'log_undone' | 'log_edited'
  | 'gaps_filled' | 'morning_opened' | 'mood_given'
  // the promise
  | 'surface_log' | 'hud_started' | 'widget_added'
  // social
  | 'friend_added' | 'plan_created' | 'plan_rsvp' | 'night_joined'
  // safety — counted, never described
  | 'safety_opened' | 'check_armed' | 'check_resolved' | 'home_safe'
  // money
  | 'paywall_shown' | 'purchase_started' | 'purchase_completed' | 'purchase_restored'
  // trouble
  | 'error_shown' | 'offline_queue_deep';

export interface Props {
  [key: string]: string | number | boolean | null;
}

const QUEUE_KEY = 'rounds.analytics.v1';
const OPT_OUT_KEY = 'rounds.analytics.optout';
const MAX_QUEUE = 300;

interface Row {
  event: Event;
  props: Props;
  at: number;
  session: string;
}

let sessionId = Math.random().toString(36).slice(2, 10);
let optedOut = false;
let queue: Row[] = [];
let flushing = false;

export async function init(): Promise<void> {
  optedOut = (await readJson<boolean>(OPT_OUT_KEY, false)) === true;
  queue = await readJson<Row[]>(QUEUE_KEY, []);
  sessionId = Math.random().toString(36).slice(2, 10);
}

export async function setOptOut(value: boolean): Promise<void> {
  optedOut = value;
  await writeJson(OPT_OUT_KEY, value);
  if (value) {
    queue = [];
    await writeJson(QUEUE_KEY, []);
  }
}

export const isOptedOut = () => optedOut;

/**
 * Fire-and-forget. Never awaited by a screen, never blocks an interaction, and
 * a failure to record is not an error the user should ever see.
 */
export function track(event: Event, props: Props = {}): void {
  if (optedOut) return;
  queue.push({ event, props: sanitise(props), at: Date.now(), session: sessionId });
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
  void writeJson(QUEUE_KEY, queue);
  if (__DEV__) console.log(`[analytics] ${event}`, props);
  if (queue.length >= 20) void flush();
}

/**
 * A last line of defence rather than a policy. The policy is "don't pass it";
 * this is here because someone eventually will.
 */
const FORBIDDEN = /bac|permille|estimate|drinkname|venue|address|phone|email|lat|lng|note|message/i;

function sanitise(props: Props): Props {
  const out: Props = {};
  for (const [k, v] of Object.entries(props)) {
    if (FORBIDDEN.test(k)) continue;
    out[k] = typeof v === 'string' ? v.slice(0, 48) : v;
  }
  return out;
}

export async function flush(): Promise<void> {
  if (flushing || optedOut || queue.length === 0) return;
  const supabase = getClient();
  if (!supabase) return; // no sink configured; events stay on the device
  flushing = true;
  const batch = queue.slice(0, 100);
  try {
    const { error } = await supabase.from('events').insert(
      batch.map((r) => ({
        event: r.event,
        props: r.props,
        occurred_at: new Date(r.at).toISOString(),
        session_key: r.session,
        platform: Platform.OS,
        app_version: optional(() => require('expo-application').nativeApplicationVersion) ?? null,
      }))
    );
    if (!error) {
      queue = queue.slice(batch.length);
      await writeJson(QUEUE_KEY, queue);
    }
  } catch {
    // Keep them. Analytics that drop on a bad network are analytics that lie
    // about the exact nights you most want to understand.
  } finally {
    flushing = false;
  }
}

/**
 * Crash reporting.
 *
 * A global handler that records the crash the same way as any other event, so a
 * beta tester's stack trace arrives without them having to describe it. The
 * message is truncated and never carries user content.
 */
export function installCrashReporting(): void {
  const ErrorUtils = (globalThis as { ErrorUtils?: any }).ErrorUtils;
  if (!ErrorUtils) return;
  const previous = ErrorUtils.getGlobalHandler?.();
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    track('error_shown', {
      fatal: Boolean(isFatal),
      name: String(error?.name ?? 'Error'),
      message: String(error?.message ?? '').slice(0, 160),
    });
    void flush();
    previous?.(error, isFatal);
  });
}

/** The headline metric, computed locally so it is visible in the app itself. */
export function outOfAppShare(logs: Array<{ source: string; deleted: boolean }>): number {
  const live = logs.filter((l) => !l.deleted);
  if (live.length === 0) return 0;
  return live.filter((l) => l.source !== 'app').length / live.length;
}
