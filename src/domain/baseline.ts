import { byId } from './catalog';
import type { Log } from './types';
import { summariseNights } from './stats';

/**
 * What "normal for you" means before there is anything to measure.
 *
 * ── The problem this exists for ─────────────────────────────────────────────
 *
 * Every headline readout in ROUNDS is a comparison against the person's own
 * history: the pace ring's state word is `gramsPerHour / theirNormal`, Insights
 * says "13% heavier than the weeks before", the morning recap says whether last
 * night was unusual. A new account has no history, so on night one — the night
 * somebody actually decides whether this app is worth keeping — every one of
 * those either says nothing or compares them to a stranger.
 *
 * `paceState` was explicit about it: with `weekdayMedianG` null it falls back
 * to `DEFAULT_NORMAL_G_PER_HOUR = 10`, "a defensible steady for night one". It
 * is defensible as a population figure and it is not this person. And because
 * the median is taken PER WEEKDAY, the gap is not "the first few weeks" — a
 * user with twenty Saturdays logged still has nothing the first time they go
 * out on a Tuesday.
 *
 * ── What this does about it ─────────────────────────────────────────────────
 *
 * Onboarding asks two things it can ask in about eight seconds — what you
 * usually order, and how many of them on a typical night — and those compose
 * into a personal prior:
 *
 *     prior grams = (mean ethanol of YOUR usual drinks) × YOUR typical count
 *
 * Note whose numbers those are. A person whose usual is a 175ml glass of wine
 * and a person whose usual is a double gin get different priors from the same
 * answer to "how many", because the ethanol comes from the catalogue entry they
 * picked rather than from an assumed standard drink.
 *
 * Then the prior is blended with real nights and gives way as they arrive:
 *
 *     weight on history = n / (n + PRIOR_WEIGHT)
 *
 * which is ordinary additive smoothing — the prior counts as `PRIOR_WEIGHT`
 * nights of evidence and is outvoted from there. At four real nights it is half
 * the answer, at twelve a quarter, at thirty-six about a tenth. It never
 * reaches zero and never needs to: by then it is rounding error.
 *
 * ── The two rules ───────────────────────────────────────────────────────────
 *
 *  1. **A stated number is never presented as a measurement.** `source` says
 *     where the answer came from and `fromHistory` says in what proportion, and
 *     the screens are expected to use them. "Based on what you told us" and
 *     "based on your last twelve nights" are different claims and the app must
 *     not make the first one look like the second.
 *  2. **Nothing here estimates upward.** The prior is what the person said
 *     about themselves; it is not scaled by any population figure, and no
 *     branch below can return more than the larger of what they said and what
 *     they logged. An app about pace that quietly inflated your normal would be
 *     making it harder to notice a heavy night, which is the one thing it
 *     exists to do.
 */

export interface Baseline {
  /** One to three catalogue ids — what this person actually orders. */
  usualDrinkIds: string[];
  /** Drinks on a typical night out, as they described it. */
  drinksPerNight: number;
  /** Nights out in a typical month. Not used by pace; used by spend and goals. */
  nightsPerMonth: number;
}

export type NormalSource = 'history' | 'blend' | 'stated' | 'population';

export interface Normal {
  /** Grams of ethanol on a typical night for this person. */
  gramsPerNight: number;
  /** 0–1. The share of the answer that came from nights actually recorded. */
  fromHistory: number;
  source: NormalSource;
  /** Nights that fed the observed half. */
  nights: number;
}

/**
 * The prior counts as this many nights of evidence.
 *
 * Four, not one and not twenty. One would let a single unusual night — a
 * wedding, a birthday — redefine somebody's normal on their second use of the
 * app. Twenty would keep telling a person who has logged a month of real nights
 * what they said in a form. Four puts the crossover at the fourth night, which
 * is roughly a month of ordinary use and is the point at which the app has
 * genuinely learned more than it was told.
 */
export const PRIOR_WEIGHT = 4;

/**
 * Grams on a typical night with nothing to go on at all.
 *
 * Deliberately the same figure `paceState` already falls back to, times a
 * three-hour night, so an account with no baseline and no history behaves
 * exactly as it did before this file existed. This is the no-regression path,
 * not a recommendation.
 */
export const POPULATION_G_PER_NIGHT = 30;

/** At least this many same-weekday nights before the weekday is worth honouring. */
const MIN_SAME_WEEKDAY = 2;

/**
 * What the person said, in grams.
 *
 * The mean rather than the max of their usual drinks: somebody who names a
 * pint, a gin and tonic and a glass of wine drinks some mixture of the three,
 * and taking the strongest would inflate their normal — which rule 2 forbids.
 * Unknown ids are skipped rather than counted as zero, because a catalogue that
 * has moved on should not silently halve somebody's baseline.
 */
export function priorGrams(baseline: Baseline | null): number | null {
  if (!baseline) return null;
  const drinks = baseline.usualDrinkIds.map((id) => byId(id)).filter((d): d is NonNullable<typeof d> => Boolean(d));
  if (drinks.length === 0 || baseline.drinksPerNight <= 0) return null;
  const perDrink = drinks.reduce((s, d) => s + d.ethanolG, 0) / drinks.length;
  return perDrink * baseline.drinksPerNight;
}

export interface NormalInput {
  logs: Log[];
  /** 0–6, as `Date.getDay()`. The night being compared against. */
  weekday: number;
  baseline: Baseline | null;
  /** Exclude the night in progress, so tonight is not compared to itself. */
  excludeSessionId?: string | null;
}

/**
 * "Normal for you", from whatever evidence exists.
 *
 * Same-weekday nights first, because a Tuesday and a Saturday are different
 * questions — but only once there are two of them. Below that the weekday
 * median is one number wearing the authority of a statistic, and every night
 * this person has recorded is the better answer.
 */
export function personalNormal(input: NormalInput): Normal {
  const relevant = input.logs.filter(
    (l) => !l.deleted && (!input.excludeSessionId || l.sessionId !== input.excludeSessionId)
  );
  const nights = summariseNights(relevant).filter((n) => n.totalG > 0);

  const sameWeekday = nights.filter((n) => n.weekday === input.weekday);
  const used = sameWeekday.length >= MIN_SAME_WEEKDAY ? sameWeekday : nights;
  const observed = median(used.map((n) => n.totalG));
  const n = used.length;

  const prior = priorGrams(input.baseline);

  if (n === 0) {
    if (prior === null) {
      return { gramsPerNight: POPULATION_G_PER_NIGHT, fromHistory: 0, source: 'population', nights: 0 };
    }
    return { gramsPerNight: prior, fromHistory: 0, source: 'stated', nights: 0 };
  }

  if (prior === null) {
    return { gramsPerNight: observed, fromHistory: 1, source: 'history', nights: n };
  }

  const fromHistory = n / (n + PRIOR_WEIGHT);
  return {
    gramsPerNight: fromHistory * observed + (1 - fromHistory) * prior,
    fromHistory,
    // Past nine tenths the prior is worth less than the rounding on the number
    // it is adjusting, and the screen should stop hedging.
    source: fromHistory >= 0.9 ? 'history' : 'blend',
    nights: n,
  };
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
