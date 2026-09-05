import type { Log, Session, Person, Crew, Plan, Goal } from './types';
import type { MessageKey } from '@/i18n';
import { summariseNights, computeStreaks } from './stats';

/**
 * Levels and achievements.
 *
 * The rule that shapes every number in this file: NOTHING here is earned by
 * drinking more. Not a point, not a badge, not a level. A user who logs six
 * beers and a user who logs one earn exactly the same XP for that night —
 * the XP is for *recording* it, and for the things around it: coming home,
 * answering the morning question, drinking water, going somewhere new, taking
 * a night off, being someone's trusted contact.
 *
 * The consequence is that a person can max this entire system out while
 * drinking nothing at all, and that is the intended outcome. If a change to
 * this file would make a heavier night score higher than a lighter one, the
 * change is wrong.
 *
 * It is a pure function of state so it can be recomputed anywhere — client,
 * edge function, a test — and always agree.
 */

export interface AchievementDef {
  id: string;
  group: 'exploration' | 'consistency' | 'moderation' | 'social';
  /**
   * The name and the hint are message KEYS, not words. This table is a
   * module-level constant evaluated at import time, so it cannot call a hook —
   * the screen and the celebration overlay translate it as they render it.
   */
  nameKey: MessageKey;
  hintKey: MessageKey;
  /** XP granted once, when it is first earned. */
  xp: number;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: 'first-night', group: 'consistency', nameKey: 'common.achFirstNightName', hintKey: 'common.achFirstNightHint', xp: 40 },
  { id: 'gap-filler', group: 'consistency', nameKey: 'common.achGapFillerName', hintKey: 'common.achGapFillerHint', xp: 30 },
  { id: 'week-of-logs', group: 'consistency', nameKey: 'common.achWeekOfLogsName', hintKey: 'common.achWeekOfLogsHint', xp: 80 },
  { id: 'morning-person', group: 'consistency', nameKey: 'common.achMorningPersonName', hintKey: 'common.achMorningPersonHint', xp: 60 },
  { id: 'honest-editor', group: 'consistency', nameKey: 'common.achHonestEditorName', hintKey: 'common.achHonestEditorHint', xp: 30 },
  { id: 'five-venues', group: 'exploration', nameKey: 'common.achFiveVenuesName', hintKey: 'common.achFiveVenuesHint', xp: 50 },
  { id: 'ten-venues', group: 'exploration', nameKey: 'common.achTenVenuesName', hintKey: 'common.achTenVenuesHint', xp: 90 },
  { id: 'new-place', group: 'exploration', nameKey: 'common.achNewPlaceName', hintKey: 'common.achNewPlaceHint', xp: 40 },
  { id: 'passport-page', group: 'exploration', nameKey: 'common.achPassportPageName', hintKey: 'common.achPassportPageHint', xp: 60 },
  { id: 'home-city', group: 'exploration', nameKey: 'common.achHomeCityName', hintKey: 'common.achHomeCityHint', xp: 70 },
  { id: 'far-afield', group: 'exploration', nameKey: 'common.achFarAfieldName', hintKey: 'common.achFarAfieldHint', xp: 50 },
  { id: 'hydrated', group: 'moderation', nameKey: 'common.achHydratedName', hintKey: 'common.achHydratedHint', xp: 50 },
  { id: 'dry-week', group: 'moderation', nameKey: 'common.achDryWeekName', hintKey: 'common.achDryWeekHint', xp: 80 },
  { id: 'dry-fortnight', group: 'moderation', nameKey: 'common.achDryFortnightName', hintKey: 'common.achDryFortnightHint', xp: 140 },
  { id: 'under-goal', group: 'moderation', nameKey: 'common.achUnderGoalName', hintKey: 'common.achUnderGoalHint', xp: 60 },
  { id: 'under-goal-month', group: 'moderation', nameKey: 'common.achUnderGoalMonthName', hintKey: 'common.achUnderGoalMonthHint', xp: 160 },
  { id: 'early-home', group: 'moderation', nameKey: 'common.achEarlyHomeName', hintKey: 'common.achEarlyHomeHint', xp: 60 },
  { id: 'water-first', group: 'moderation', nameKey: 'common.achWaterFirstName', hintKey: 'common.achWaterFirstHint', xp: 40 },
  { id: 'safe-arrival', group: 'moderation', nameKey: 'common.achSafeArrivalName', hintKey: 'common.achSafeArrivalHint', xp: 70 },
  { id: 'first-friend', group: 'social', nameKey: 'common.achFirstFriendName', hintKey: 'common.achFirstFriendHint', xp: 30 },
  { id: 'crew-founder', group: 'social', nameKey: 'common.achCrewFounderName', hintKey: 'common.achCrewFounderHint', xp: 40 },
  { id: 'plan-maker', group: 'social', nameKey: 'common.achPlanMakerName', hintKey: 'common.achPlanMakerHint', xp: 60 },
  { id: 'round-buyer', group: 'social', nameKey: 'common.achRoundBuyerName', hintKey: 'common.achRoundBuyerHint', xp: 40 },
  { id: 'looked-out', group: 'social', nameKey: 'common.achLookedOutName', hintKey: 'common.achLookedOutHint', xp: 50 },
] as const;

export const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

export interface ProgressInput {
  logs: Log[];
  sessions: Session[];
  people: Person[];
  crews: Crew[];
  plans: Plan[];
  goals: Goal[];
  trustedContacts: number;
  safeArrivalsResolved: number;
  now?: number;
}

export interface Progress {
  earned: Set<string>;
  xp: number;
  level: number;
  /** XP into the current level, and how much that level costs in total. */
  intoLevel: number;
  levelSpan: number;
  /** 0–1, for the bar. */
  fraction: number;
  nextLevelAt: number;
  breakdown: { nights: number; mornings: number; dry: number; venues: number; achievements: number };
}

/**
 * Level curve. Level n starts at 60·n·(n−1)/2 + 100·(n−1) XP — a gentle
 * quadratic, so early levels arrive within the first couple of nights and
 * later ones take a season rather than a year.
 */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level)) - 1;
  return 30 * n * (n + 1) + 100 * n;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp && level < 200) level += 1;
  return level;
}

export function evaluate(input: ProgressInput): Progress {
  const { logs, sessions, people, crews, plans, goals, trustedContacts, safeArrivalsResolved } = input;
  const now = input.now ?? Date.now();

  const nights = summariseNights(logs);
  const streaks = computeStreaks(logs, new Date(now));
  const venueIds = new Set(logs.filter((l) => !l.deleted && l.venueId).map((l) => l.venueId));
  const recorded = sessions.filter((s) => s.endedAt);
  const mornings = sessions.filter((s) => s.mood);
  // "Home before two" against the 04:00 night boundary: a night that ended at
  // 23:40 or at 01:30 counts; one that ended at 03:00 does not.
  const homeBeforeTwo = recorded.filter((s) => {
    const h = new Date(s.endedAt as number).getHours();
    return h >= 18 || h < 2;
  });

  const weeklyCap = goals.find((g) => g.type === 'weekly_cap');
  const weeksUnderCap = weeksUnder(nights, weeklyCap?.enabled ? weeklyCap.target : null);

  const earned = new Set<string>();
  const add = (id: string, when: boolean) => {
    if (when) earned.add(id);
  };

  add('first-night', recorded.length >= 1);
  add('week-of-logs', recorded.length >= 7);
  add('morning-person', mornings.length >= 5);
  add('honest-editor', logs.some((l) => l.createdAt - l.at > 6 * 3600_000));
  add('gap-filler', sessions.some((s) => s.mood && s.venueId));
  add('five-venues', venueIds.size >= 5);
  add('ten-venues', venueIds.size >= 10);
  add('passport-page', venueIds.size >= 3);
  add('home-city', logs.filter((l) => !l.deleted && l.venueId).length >= 20);
  add('hydrated', nights.filter((n) => n.waters > 0).length >= 3);
  add('dry-week', streaks.longestDry >= 7);
  add('dry-fortnight', streaks.longestDry >= 14);
  add('under-goal', weeksUnderCap >= 1);
  add('under-goal-month', weeksUnderCap >= 4);
  add('early-home', homeBeforeTwo.length >= 3);
  add('water-first', startedWithWater(logs));
  add('safe-arrival', safeArrivalsResolved >= 1);
  add('first-friend', people.some((p) => p.status === 'friend'));
  add('crew-founder', crews.length > 0);
  add('plan-maker', plans.some((p) => p.invitees.filter((i) => i.rsvp === 'yes').length >= 3));
  add('round-buyer', roundsBought(logs) >= 1);
  add('looked-out', trustedContacts > 0);

  // XP. Every term below is per NIGHT or per ACT, never per drink.
  const breakdown = {
    nights: recorded.length * 25,
    mornings: mornings.length * 15,
    dry: Math.min(streaks.longestDry, 30) * 8,
    venues: venueIds.size * 12,
    achievements: [...earned].reduce((sum, id) => sum + (ACHIEVEMENT_BY_ID.get(id)?.xp ?? 0), 0),
  };
  const xp = breakdown.nights + breakdown.mornings + breakdown.dry + breakdown.venues + breakdown.achievements;

  const level = levelForXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const span = Math.max(1, next - base);

  return {
    earned,
    xp,
    level,
    intoLevel: xp - base,
    levelSpan: span,
    fraction: Math.max(0, Math.min(1, (xp - base) / span)),
    nextLevelAt: next,
    breakdown,
  };
}

/** How many complete weeks came in under the weekly cap, most recent first. */
function weeksUnder(nights: ReturnType<typeof summariseNights>, cap: number | null): number {
  if (!cap) return 0;
  const byWeek = new Map<string, number>();
  for (const n of nights) {
    const d = new Date(`${n.key}T12:00:00`);
    if (Number.isNaN(d.getTime())) continue;
    // ISO-ish week bucket: Monday-anchored.
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    byWeek.set(key, (byWeek.get(key) ?? 0) + n.totalG);
  }
  let count = 0;
  for (const total of byWeek.values()) if (total <= cap) count += 1;
  return count;
}

/** Did any night open with water rather than with a drink? */
function startedWithWater(logs: Log[]): boolean {
  const byNight = new Map<string, Log[]>();
  for (const l of logs) {
    if (l.deleted) continue;
    const arr = byNight.get(l.nightKey) ?? [];
    arr.push(l);
    byNight.set(l.nightKey, arr);
  }
  for (const arr of byNight.values()) {
    arr.sort((a, b) => a.at - b.at);
    if (arr[0] && arr[0].ethanolG === 0) return true;
  }
  return false;
}

/** A round for three or more people, recorded from the round sheet. */
function roundsBought(logs: Log[]): number {
  return logs.filter((l) => !l.deleted && (l.roundSize ?? 0) >= 3).length;
}
