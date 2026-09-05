/**
 * A "night" does not end at midnight. The boundary is 04:00 local — a drink at
 * 02:30 on Saturday belongs to Friday night. Every aggregate in the app (streaks,
 * heatmap, weekly goal, morning-after) keys off this, so it lives in one place.
 */
export const NIGHT_BOUNDARY_HOUR = 4;

/** `YYYY-MM-DD` of the night that `at` belongs to. */
export function nightKey(at: Date | number | string): string {
  const d = new Date(at);
  const shifted = new Date(d.getTime());
  if (shifted.getHours() < NIGHT_BOUNDARY_HOUR) {
    shifted.setDate(shifted.getDate() - 1);
  }
  const y = shifted.getFullYear();
  const m = String(shifted.getMonth() + 1).padStart(2, '0');
  const day = String(shifted.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Local Date at the start of the given night key (04:00 that day). */
export function nightStart(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, NIGHT_BOUNDARY_HOUR, 0, 0, 0);
}

/** 0 = Sunday … 6 = Saturday, for the night (not the calendar day). */
export function nightWeekday(key: string): number {
  return nightStart(key).getDay();
}

export function nightKeysBetween(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12);
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 12);
  while (cursor <= end) {
    keys.push(nightKey(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 22)));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}
