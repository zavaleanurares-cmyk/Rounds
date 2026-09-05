import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useStore } from '@/data/store';

/** After 01:00 and before 06:00 — the hours the setting is named for. */
function isLateNight(at = Date.now()): boolean {
  const hour = new Date(at).getHours();
  return hour >= 1 && hour < 6;
}

/**
 * Whether the aurora should be turned down right now.
 *
 * Settings › Appearance has "Dim after 1am — lowers the aurora and raises
 * contrast during a late night". `nightDimming` was written to local state and
 * read by nothing: the only screen that dimmed was the live one, which decided
 * on the hour alone and never consulted the switch. So the setting did nothing
 * whether it was on or off, and the dimming happened to people who had turned
 * it off.
 *
 * Ticking every minute rather than on a timer to the boundary: this is a
 * cosmetic threshold, and a minute of lag at 01:00 costs nothing, while a
 * scheduled timeout in every mounted screen costs a timer per screen.
 */
export function useNightDimming(): boolean {
  const { settings } = useStore();
  const [late, setLate] = useState(() => isLateNight());

  useEffect(() => {
    const tick = setInterval(() => setLate(isLateNight()), 60_000);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setLate(isLateNight());
    });
    return () => {
      clearInterval(tick);
      sub.remove();
    };
  }, []);

  return settings.nightDimming && late;
}
