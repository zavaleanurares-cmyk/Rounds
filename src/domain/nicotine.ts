import type { Drink } from './types';
import { makeDrink } from './makeDrink';
import { LIQUID } from './art';
import { nightKey } from './nightKey';
import type { Log } from './types';

/**
 * The nicotine module's two entries.
 *
 * Kept out of `CATALOG` on purpose: the log sheet is a grid of drinks, and a
 * cigarette appearing between a Negroni and a pint would be in everybody's way
 * — the ~70% of people who do not smoke included, which is the same reason the
 * module is off by default. They are logged from the nicotine screen instead.
 *
 * Zero volume and zero ABV, so `ethanolG` is zero by derivation rather than by
 * assertion, and no alcohol total anywhere has to know they exist.
 */
export const NICOTINE: Drink[] = [
  makeDrink({
    id: 'cigarette',
    name: 'Cigarette',
    category: 'nicotine',
    ml: 0,
    abv: 0,
    art: { glass: 'cigarette', liquid: LIQUID.water, fill: 0 },
  }),
  makeDrink({
    id: 'vape',
    name: 'Vape',
    category: 'nicotine',
    ml: 0,
    abv: 0,
    art: { glass: 'vape', liquid: LIQUID.water, fill: 0 },
  }),
];

export const isNicotine = (log: Pick<Log, 'category'>) => log.category === 'nicotine';

/**
 * How many were logged since the start of this week (Monday).
 *
 * The dashboard rendered a literal `0` here for as long as the module has
 * existed.
 */
export function nicotineThisWeek(logs: Log[], now = Date.now()): number {
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  return logs.filter((l) => !l.deleted && isNicotine(l) && l.at >= weekStart.getTime()).length;
}

/**
 * Consecutive completed nights with nothing logged.
 *
 * Two decisions, both conservative on purpose.
 *
 * Counted in night keys rather than calendar days, because this app's day ends
 * at 04:00: somebody who smoked at 2am on Saturday morning did it on Friday
 * night. A calendar difference would call that "yesterday" and start the
 * streak; this does not.
 *
 * And tonight does not count until it is over. At 22:00 on a clean Saturday,
 * having smoked in the small hours of that same morning, a streak of "1 day"
 * would be twenty hours old and would evaporate on the next cigarette. Zero is
 * the truthful answer, and a number that only ever goes up when a night
 * genuinely ends is the one worth showing somebody who is trying to stop.
 *
 * Capped at a year: an unbounded loop over an account with no nicotine logs at
 * all would count until it ran out of milliseconds, and no streak this screen
 * shows needs more.
 */
export function nicotineFreeDays(logs: Log[], now = Date.now()): number {
  const smoked = new Set(logs.filter((l) => !l.deleted && isNicotine(l)).map((l) => l.nightKey));
  if (smoked.size === 0) return 0; // never logged one: a streak needs a before
  // One logged tonight ends it now — the streak is not a day behind reality in
  // the direction that flatters.
  if (smoked.has(nightKey(now))) return 0;
  let days = 0;
  for (let i = 1; i <= 365; i++) {
    if (smoked.has(nightKey(now - i * 86400000))) break;
    days += 1;
  }
  return days;
}
