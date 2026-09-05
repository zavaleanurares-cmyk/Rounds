import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useStore } from '@/data/store';
import { nightKey, NIGHT_BOUNDARY_HOUR } from '@/domain/nightKey';
import type { Session, Plan } from '@/domain/types';

export type NightState = 'idle' | 'planned' | 'live' | 'winddown' | 'morning';

export interface NightStateResult {
  state: NightState;
  session: Session | null;
  lastSession: Session | null;
  nextPlan: Plan | null;
  morningDue: boolean;
  morningSessionId: string | null;
}

/**
 * The Tonight state machine — the single most important piece of state logic in
 * the app. Tonight is ONE route rendering five materially different screens.
 *
 * It re-evaluates on app foreground, on the 04:00 night-key boundary, and on any
 * session mutation. Everything else in Tonight is a pure function of this.
 */
export function useNightState(): NightStateResult {
  const { sessions, plans } = useStore();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Re-evaluate on foreground …
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setNow(Date.now());
    });
    // … on a coarse tick while the app is open …
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    // … and exactly on the 04:00 boundary.
    const next = new Date();
    next.setHours(NIGHT_BOUNDARY_HOUR, 0, 5, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
    const boundary = setTimeout(() => setNow(Date.now()), next.getTime() - Date.now());
    return () => {
      sub.remove();
      clearInterval(tick);
      clearTimeout(boundary);
    };
  }, []);

  return useMemo(() => {
    const active = sessions.find((s) => s.endedAt === null) ?? null;
    const ended = sessions.filter((s) => s.endedAt !== null).sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0));
    const last = ended[0] ?? null;
    const hour = new Date(now).getHours();

    const upcoming = plans
      .filter((p) => p.startsAt > now && p.startsAt - now <= 12 * 3600000)
      .sort((a, b) => a.startsAt - b.startsAt);
    const nextPlan =
      upcoming[0] ??
      plans.filter((p) => p.startsAt > now).sort((a, b) => a.startsAt - b.startsAt)[0] ??
      null;

    // morningDue: the most recent ended session has no mood, ended within 18h,
    // and the local clock is between 06:00 and 14:00.
    const morningDue = Boolean(
      last &&
        last.mood === null &&
        last.endedAt !== null &&
        now - last.endedAt < 18 * 3600000 &&
        hour >= 6 &&
        hour < 14
    );

    let state: NightState;
    if (active) state = 'live';
    else if (morningDue) state = 'morning';
    else if (
      last &&
      last.endedAt !== null &&
      now - last.endedAt < 6 * 3600000 &&
      (hour >= 22 || hour < 6) &&
      last.mood === null
    )
      state = 'winddown';
    else if (upcoming.length > 0) state = 'planned';
    else state = 'idle';

    return {
      state,
      session: active,
      lastSession: last,
      nextPlan,
      morningDue,
      morningSessionId: morningDue ? last?.id ?? null : null,
    };
  }, [sessions, plans, now]);
}

export const currentNightKey = () => nightKey(new Date());
