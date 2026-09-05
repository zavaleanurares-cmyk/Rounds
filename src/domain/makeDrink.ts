import type { Drink, DrinkCategory } from './types';
import type { DrinkArt } from './art';
import { ethanolGrams } from './units';

/**
 * The one place a Drink is constructed, so `ethanolG` is always derived from
 * volume and ABV rather than typed in — a hand-entered gram figure is a number
 * that will disagree with its own drink eventually.
 *
 * It lives in its own module because both `catalog.ts` and `cocktails.ts` need
 * it, and having them import each other was a circular dependency waiting to
 * bite in a build that hoists differently from Metro.
 */
export interface DrinkSpec {
  id: string;
  name: string;
  category: DrinkCategory;
  ml: number;
  abv: number;
  art: DrinkArt;
  note?: string;
  family?: 'unforgettable' | 'contemporary' | 'newera';
}

export const makeDrink = (s: DrinkSpec): Drink => ({
  id: s.id,
  name: s.name,
  category: s.category,
  volumeMl: s.ml,
  abv: s.abv,
  ethanolG: ethanolGrams(s.ml, s.abv),
  art: s.art,
  note: s.note,
  family: s.family,
});
