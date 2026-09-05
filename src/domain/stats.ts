/**
 * Everything derived from logs. All pure, all local, all recomputed rather than
 * stored — a retroactive edit on the morning-after screen must move every
 * downstream number, and it can only do that if nothing is cached server-side.
 */
import type { Log, Session, Goal } from './types';
import { nightKey, nightWeekday } from './nightKey';

export interface NightSummary {
  key: string;
  weekday: number;
  totalG: number;
  drinks: number;
  waters: number;
  spendMinor: number;
  venueIds: string[];
  firstAt: number | null;
  lastAt: number | null;
}

export function summariseNights(logs: Log[]): NightSummary[] {
  const map = new Map<string, NightSummary>();
  for (const log of logs) {
    if (log.deleted) continue;
    const key = log.nightKey || nightKey(log.at);
    let n = map.get(key);
    if (!n) {
      n = {
        key,
        weekday: nightWeekday(key),
        totalG: 0,
        drinks: 0,
        waters: 0,
        spendMinor: 0,
        venueIds: [],
        firstAt: null,
        lastAt: null,
      };
      map.set(key, n);
    }
    if (log.ethanolG > 0) {
      n.totalG += log.ethanolG;
      n.drinks += 1;
    } else if (log.category === 'water') {
      n.waters += 1;
    }
    n.spendMinor += log.priceMinor ?? 0;
    if (log.venueId && !n.venueIds.includes(log.venueId)) n.venueIds.push(log.venueId);
    if (n.firstAt === null || log.at < n.firstAt) n.firstAt = log.at;
    if (n.lastAt === null || log.at > n.lastAt) n.lastAt = log.at;
  }
  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
}

export interface Streaks {
  /** Consecutive nights with no alcohol, ending today. */
  dryStreak: number;
  longestDry: number;
  /** Consecutive weeks where the weekly goal was met. */
  goalWeeks: number;
}

/**
 * Deliberately: there is no "nights out in a row" streak, and never will be.
 * A streak that rewards consecutive drinking nights is the wrong mechanic to
 * put in a product that also shows people a pace ring.
 */
export function computeStreaks(logs: Log[], today: Date = new Date()): Streaks {
  const nights = new Map(summariseNights(logs).map((n) => [n.key, n]));
  let dryStreak = 0;
  const cursor = new Date(today);
  // Today only counts once it is over, so start from yesterday's night.
  cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < 400; i++) {
    const key = nightKey(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 22));
    const n = nights.get(key);
    if (n && n.totalG > 0) break;
    dryStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longestDry = 0;
  let run = 0;
  const allKeys = [...nights.keys()].sort();
  if (allKeys.length > 0) {
    const start = new Date(allKeys[0]);
    const end = new Date();
    const c = new Date(start);
    while (c <= end) {
      const key = nightKey(new Date(c.getFullYear(), c.getMonth(), c.getDate(), 22));
      const n = nights.get(key);
      if (n && n.totalG > 0) {
        longestDry = Math.max(longestDry, run);
        run = 0;
      } else run += 1;
      c.setDate(c.getDate() + 1);
    }
    longestDry = Math.max(longestDry, run);
  }

  return { dryStreak, longestDry, goalWeeks: 0 };
}

export function weekTotals(logs: Log[], weeksBack = 8): Array<{ label: string; totalG: number; spendMinor: number }> {
  const out: Array<{ label: string; totalG: number; spendMinor: number }> = [];
  const now = new Date();
  for (let w = weeksBack - 1; w >= 0; w--) {
    const end = new Date(now);
    end.setDate(end.getDate() - w * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    let totalG = 0;
    let spendMinor = 0;
    for (const log of logs) {
      if (log.deleted) continue;
      const at = new Date(log.at);
      if (at >= start && at <= end) {
        totalG += log.ethanolG;
        spendMinor += log.priceMinor ?? 0;
      }
    }
    out.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, totalG, spendMinor });
  }
  return out;
}

export function spendTotals(logs: Log[]) {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  let year = 0;
  let month = 0;
  let prevMonth = 0;
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  for (const log of logs) {
    if (log.deleted || !log.priceMinor) continue;
    if (log.at >= yearStart) year += log.priceMinor;
    if (log.at >= monthStart) month += log.priceMinor;
    else if (log.at >= prevMonthStart) prevMonth += log.priceMinor;
  }
  const nights = summariseNights(logs).filter((n) => n.spendMinor > 0);
  const perNight = nights.length ? Math.round(nights.reduce((s, n) => s + n.spendMinor, 0) / nights.length) : 0;

  // Compare like for like: the previous month is counted only up to the same day
  // of the month, otherwise the 3rd of any month always reads "-90%".
  const dayOfMonth = now.getDate();
  const prevSamePoint = logs.reduce((sum, log) => {
    if (log.deleted || !log.priceMinor) return sum;
    if (log.at < prevMonthStart || log.at >= monthStart) return sum;
    return new Date(log.at).getDate() <= dayOfMonth ? sum + log.priceMinor : sum;
  }, 0);

  // Below a week there is not enough of the month to say anything honest.
  const trendPct = dayOfMonth >= 7 && prevSamePoint > 0
    ? Math.round(((month - prevSamePoint) / prevSamePoint) * 100)
    : null;

  const projectedYear = dayOfMonth >= 7 ? Math.round((month / dayOfMonth) * 365) : prevMonth * 12;
  return { year, month, prevMonth, perNight, trendPct, projectedYear };
}

/** The You-screen heatmap: 400 nights of intensity, 0–4. */
export function heatmap(logs: Log[], days = 400): Array<{ key: string; level: 0 | 1 | 2 | 3 | 4 }> {
  const nights = new Map(summariseNights(logs).map((n) => [n.key, n]));
  const out: Array<{ key: string; level: 0 | 1 | 2 | 3 | 4 }> = [];
  const cursor = new Date();
  for (let i = 0; i < days; i++) {
    const key = nightKey(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 22));
    const g = nights.get(key)?.totalG ?? 0;
    const level: 0 | 1 | 2 | 3 | 4 = g === 0 ? 0 : g < 20 ? 1 : g < 40 ? 2 : g < 70 ? 3 : 4;
    out.push({ key, level });
    cursor.setDate(cursor.getDate() - 1);
  }
  // Built newest-first and reversed once, rather than unshifted 400 times —
  // unshift is O(n) per call, so the loop was quietly O(n²).
  out.reverse();
  return out;
}

export function goalProgress(logs: Log[], goal: Goal): { value: number; target: number; pct: number } {
  const now = new Date();
  let value = 0;
  if (goal.type === 'weekly_cap' || goal.type === 'spend_cap') {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    for (const log of logs) {
      if (log.deleted || log.at < weekStart.getTime()) continue;
      value += goal.type === 'spend_cap' ? log.priceMinor ?? 0 : log.ethanolG;
    }
  } else if (goal.type === 'nightly_cap') {
    const key = nightKey(now);
    for (const log of logs) {
      if (!log.deleted && log.nightKey === key) value += log.ethanolG;
    }
  } else if (goal.type === 'dry_days') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nights = summariseNights(logs);
    const dry = new Set(nights.filter((n) => n.totalG === 0).map((n) => n.key));
    const days = Math.floor((now.getTime() - monthStart.getTime()) / 86400000);
    let count = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(monthStart);
      d.setDate(d.getDate() + i);
      const key = nightKey(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 22));
      const has = nights.find((n) => n.key === key);
      if (!has || dry.has(key)) count += 1;
    }
    value = count;
  }
  return { value, target: goal.target, pct: goal.target > 0 ? Math.min(1, value / goal.target) : 0 };
}

/**
 * "Fill the gaps" on the morning-after screen. Drunk logging is lossy; without
 * this every downstream number is wrong and the user stops trusting the ring.
 * A gap is inferred from session duration against log density, not guessed.
 */
export function estimateMissedDrinks(session: Session, logs: Log[]): number {
  const own = logs.filter((l) => l.sessionId === session.id && !l.deleted && l.ethanolG > 0);
  const end = session.endedAt ?? Date.now();
  const hours = Math.max(0, (end - session.startedAt) / 3600000);
  if (hours < 1.5) return 0;
  // One drink per 50 minutes is a conservative floor for a night out.
  const expected = Math.floor(hours / 0.85);
  return Math.max(0, Math.min(4, expected - own.length));
}

/** Predicted hangover, 0–100. Calibrated per user by the morning-after feedback. */
export function hangoverForecast(
  night: NightSummary | undefined,
  calibration = 1
): { score: number; band: 'fine' | 'tender' | 'rough' } {
  if (!night) return { score: 0, band: 'fine' };
  const hydration = Math.max(0, 1 - night.waters / Math.max(1, night.drinks));
  const lateness = night.lastAt ? Math.min(1, Math.max(0, (new Date(night.lastAt).getHours() + 24 - 22) % 24) / 6) : 0;
  const raw = night.totalG * 1.1 + hydration * 25 + lateness * 15;
  const score = Math.round(Math.min(100, raw * calibration));
  return { score, band: score < 30 ? 'fine' : score < 60 ? 'tender' : 'rough' };
}

export function formatMoney(minor: number, currency: string): string {
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'RON' ? 'lei ' : '€';
  const major = minor / 100;
  const s = major >= 1000 ? major.toLocaleString(undefined, { maximumFractionDigits: 0 }) : major.toFixed(major % 1 === 0 ? 0 : 2);
  return currency === 'RON' ? `${s} lei` : `${symbol}${s}`;
}

export function formatDuration(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}m`;
}

export function formatClock(at: number): string {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
