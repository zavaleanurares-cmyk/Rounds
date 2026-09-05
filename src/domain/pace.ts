/**
 * The pace model.
 *
 * Two separate readouts, and the order matters:
 *
 *   1. `paceState` — the PRIMARY readout. A state word ("STEADY") answering
 *      "am I going faster than I usually do?". It is relative to the user's own
 *      median for this weekday, so it means something to them.
 *   2. `bacAt` — a SECONDARY estimate, Widmark, shown small with the disclaimer
 *      attached. Never near a transport affordance, never on a share card, never
 *      in a social surface, and suppressed entirely in the slow_down state.
 *
 * `bacAt` output is never stored and never sent to the server. It is a pure
 * function of local inputs, recomputed on demand.
 */
import type { PaceState } from '@/design/tokens';
import { translate } from '@/i18n/translate';
import type { Locale } from '@/i18n/plurals';

export type Sex = 'male' | 'female' | 'unspecified';

export interface PaceLog {
  /** ISO timestamp or epoch ms. */
  at: number;
  /** Canonical grams of ethanol. Water and soft drinks are 0. */
  ethanolG: number;
}

export interface BodyProfile {
  weightKg: number | null;
  sex: Sex | null;
}

/** Body basics are skippable, so the model has to work without them. */
export const BODY_FALLBACK = { weightKg: 75, r: 0.615 } as const;

/** Widmark distribution ratio. */
export function distributionRatio(sex: Sex | null): number {
  switch (sex) {
    case 'male':
      return 0.68;
    case 'female':
      return 0.55;
    default:
      return BODY_FALLBACK.r;
  }
}

/** Elimination rate in ‰ per hour (g/L per hour). Population mean. */
export const ELIMINATION_PER_HOUR = 0.15;

/** Absorption half-life: a drink is not instantly in the blood. */
const ABSORPTION_TAU_MIN = 20;

function absorbedFraction(minutesSince: number): number {
  if (minutesSince <= 0) return 0;
  return 1 - Math.exp(-minutesSince / ABSORPTION_TAU_MIN);
}

/**
 * Blood alcohol estimate in ‰ (g/L) at `now`.
 *
 * NOT a legal or medical measurement. Population averages, no food, no
 * medication, no individual variation. The UI must always carry the disclaimer.
 */
export function bacAt(
  logs: PaceLog[],
  body: BodyProfile,
  now: number = Date.now()
): number {
  const weight = body.weightKg && body.weightKg > 0 ? body.weightKg : BODY_FALLBACK.weightKg;
  const r = distributionRatio(body.sex);
  const bodyWaterL = weight * r;
  if (bodyWaterL <= 0) return 0;

  let peak = 0;
  let firstDrinkAt: number | null = null;

  for (const log of logs) {
    if (log.ethanolG <= 0) continue;
    if (log.at > now) continue;
    if (firstDrinkAt === null || log.at < firstDrinkAt) firstDrinkAt = log.at;
    const minutes = (now - log.at) / 60000;
    peak += (log.ethanolG / bodyWaterL) * absorbedFraction(minutes);
  }

  if (firstDrinkAt === null) return 0;

  const hoursElapsed = Math.max(0, (now - firstDrinkAt) / 3600000);
  const eliminated = ELIMINATION_PER_HOUR * hoursElapsed;
  return Math.max(0, peak - eliminated);
}

/** Hours until the estimate reaches zero. Used for the wind-down copy only. */
export function hoursToZero(bac: number): number {
  return bac <= 0 ? 0 : bac / ELIMINATION_PER_HOUR;
}

/* ------------------------------------------------------------------- pace */

export interface PaceInput {
  logs: PaceLog[];
  /** Grams of ethanol the user typically reaches by this point on this weekday. */
  weekdayMedianG: number | null;
  /** Session start, epoch ms. */
  startedAt: number;
  now?: number;
}

export interface PaceResult {
  state: PaceState;
  /** Drinks logged tonight (ethanol > 0). */
  drinks: number;
  /** Canonical grams tonight. */
  totalG: number;
  /** Grams per hour, the thing "pace" actually means. */
  gramsPerHour: number;
  /** 1.0 = exactly the user's own normal for this weekday. */
  ratioToNormal: number;
  /** Minutes since the last alcoholic drink, or null. */
  minutesSinceLast: number | null;
  /** Filled segments out of six, for the ring. */
  filled: number;
  segments: number;
}

export const PACE_SEGMENTS = 6;

/**
 * Fallback normal when there is no history: 10 g/h is a little under one
 * standard EU drink an hour, which is a defensible "steady" for night one.
 */
const DEFAULT_NORMAL_G_PER_HOUR = 10;

export function paceState(input: PaceInput): PaceResult {
  const now = input.now ?? Date.now();
  const alcohol = input.logs.filter((l) => l.ethanolG > 0 && l.at <= now);
  const totalG = alcohol.reduce((sum, l) => sum + l.ethanolG, 0);
  const drinks = alcohol.length;

  const elapsedH = Math.max(0.5, (now - input.startedAt) / 3600000);
  const gramsPerHour = totalG / elapsedH;

  const normalPerHour =
    input.weekdayMedianG && input.weekdayMedianG > 0
      ? input.weekdayMedianG / Math.max(1, elapsedH)
      : DEFAULT_NORMAL_G_PER_HOUR;

  const ratioToNormal = normalPerHour > 0 ? gramsPerHour / normalPerHour : 0;

  const lastAlcohol = alcohol.reduce<number | null>(
    (latest, l) => (latest === null || l.at > latest ? l.at : latest),
    null
  );
  const minutesSinceLast = lastAlcohol === null ? null : Math.round((now - lastAlcohol) / 60000);

  let state: PaceState;
  if (drinks === 0) state = 'easy';
  else if (ratioToNormal < 0.7) state = 'easy';
  else if (ratioToNormal < 1.15) state = 'steady';
  else if (ratioToNormal < 1.6) state = 'quick';
  else state = 'slow_down';

  return {
    state,
    drinks,
    totalG,
    gramsPerHour,
    ratioToNormal,
    minutesSinceLast,
    filled: Math.min(PACE_SEGMENTS, drinks),
    segments: PACE_SEGMENTS,
  };
}

/**
 * After two drinks with no water in the last 60 minutes, Tonight inserts an
 * inline water card. This is the rule, kept out of the view.
 */
export function shouldPromptWater(
  logs: Array<PaceLog & { isWater?: boolean }>,
  now: number = Date.now()
): boolean {
  const hourAgo = now - 60 * 60000;
  const recentAlcohol = logs.filter((l) => l.ethanolG > 0 && l.at >= hourAgo).length;
  const recentWater = logs.filter((l) => l.isWater && l.at >= hourAgo).length;
  return recentAlcohol >= 2 && recentWater === 0;
}

/** Median grams reached by this weekday, across the user's own history. */
export function weekdayMedian(
  history: Array<{ weekday: number; totalG: number }>,
  weekday: number
): number | null {
  const values = history.filter((h) => h.weekday === weekday).map((h) => h.totalG).sort((a, b) => a - b);
  if (values.length === 0) return null;
  const mid = Math.floor(values.length / 2);
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

/**
 * VoiceOver reads the state word, never just the colour.
 *
 * Built from two whole sentences rather than by gluing clauses together. The
 * "last one N minutes ago" tail is its OWN message, keyed on its own count:
 * plural selection reads a single number, and this sentence counts two.
 */
export function paceAccessibilityLabel(result: PaceResult, locale: Locale = 'en'): string {
  const word = translate(locale, PACE_LABEL_KEY[result.state]);
  const head = translate(locale, 'common.paceLabel', { word, count: result.drinks });
  if (result.minutesSinceLast === null) return head;
  // Two sentences, not one. A message can only pluralise on a single number,
  // and this sentence counts two — drinks AND minutes. In Romanian that is the
  // difference between "acum 5 minute" and "acum 25 de minute", so the tail has
  // to be its own message keyed on its own count.
  const tail = translate(locale, 'common.paceSince', { count: result.minutesSinceLast });
  return `${head} ${tail}`;
}

/** The spoken form of each state. Distinct from `paceWord`, which is shouted. */
const PACE_LABEL_KEY = {
  easy: 'common.paceSpokenEasy',
  steady: 'common.paceSpokenSteady',
  quick: 'common.paceSpokenQuick',
  slow_down: 'common.paceSpokenSlowDown',
} as const;
