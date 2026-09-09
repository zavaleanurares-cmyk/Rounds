import { CATALOG, CATEGORY_ORDER, byId } from './catalog';
import type { Drink, DrinkCategory, Log } from './types';

/**
 * The collection.
 *
 * A card per drink you have ever had, once. The 165-drink catalogue is the
 * album; logging something you have never logged before turns a card over.
 *
 * ── The rule that makes this shippable ──────────────────────────────────────
 *
 * A collection rewards drinking. That is the whole appeal and there is no
 * point pretending otherwise, so the only question that matters is WHICH
 * drinking it rewards — and the answer here is *variety, and only variety*.
 *
 * The collection is computed from the SET of distinct drink ids in your logs.
 * Not the count. Not the volume. Not the ethanol. A person on their fortieth
 * pint of lager has exactly the collection they had after their first, and the
 * screen will keep telling them so. The cheapest way to fill a card is to have
 * one glass of something new and stop, which is the behaviour a bar would call
 * tasting and a doctor would not object to.
 *
 * That inversion is what an app-store reviewer is actually looking for under
 * Guideline 1.4.3, and it is why this can exist where a "drinks tonight"
 * leaderboard cannot. The mechanic is not smuggled past the rule; it does not
 * meet the rule at all, because the quantity term is absent from the maths.
 *
 * Two consequences follow, and both are deliberate:
 *
 *  · **Water and soft drinks are cards.** Eight of them, in the album, with
 *    the same treatment as everything else. An album you can meaningfully
 *    advance while drinking nothing is the point, not a disclaimer.
 *  · **`newCards` fires on the first serving and never again.** The reward
 *    lands where the interesting choice was and is silent for every repeat, so
 *    a long night gets one celebration at most, and usually none.
 *
 * `collectionOf` is a pure function of `Log[]` — the same shape as
 * `progress.ts` — so the album screen, the celebration and a test all compute
 * it the same way and cannot drift.
 */

export interface Card {
  drink: Drink;
  /** When this drink was first logged, ever. */
  firstAt: number;
  /** Where, if the night it was first logged had a venue. */
  firstVenueId: string | null;
}

export interface CollectionSet {
  category: DrinkCategory;
  /** Every drink of this category in the catalogue, in catalogue order. */
  all: Drink[];
  /** The ones found, newest first. */
  found: Card[];
  /** 0–1. */
  fraction: number;
}

export interface Collection {
  cards: Map<string, Card>;
  sets: CollectionSet[];
  found: number;
  total: number;
  /** Distinct drinks first tried in the last 30 days. */
  newThisMonth: number;
}

/** Nicotine is logged through the same table and is not part of the album. */
const ALBUM = CATALOG.filter((d) => d.category !== 'nicotine');

const MONTH = 30 * 24 * 60 * 60 * 1000;

/**
 * Size variants share an id with their base drink, so a large gin & tonic does
 * not open a second card. That is not a limitation to work around later: a
 * bigger serving of a thing you have already had is precisely what this album
 * refuses to reward.
 */
export function collectionOf(logs: Log[], now = Date.now()): Collection {
  const cards = new Map<string, Card>();

  for (const log of logs) {
    if (log.deleted) continue;
    if (log.category === 'nicotine') continue;
    const drink = byId(log.drinkId);
    if (!drink) continue;
    const existing = cards.get(drink.id);
    // Earliest wins, so editing a log's time cannot invent a "new" card and
    // re-fire a celebration that already happened.
    if (!existing || log.at < existing.firstAt) {
      cards.set(drink.id, {
        drink,
        firstAt: log.at,
        firstVenueId: log.venueId ?? existing?.firstVenueId ?? null,
      });
    }
  }

  const sets = CATEGORY_ORDER.map((category) => {
    const all = ALBUM.filter((d) => d.category === category);
    const found = all
      .map((d) => cards.get(d.id))
      .filter((c): c is Card => Boolean(c))
      .sort((a, b) => b.firstAt - a.firstAt);
    return { category, all, found, fraction: all.length === 0 ? 0 : found.length / all.length };
  });

  let newThisMonth = 0;
  cards.forEach((c) => {
    if (now - c.firstAt <= MONTH) newThisMonth += 1;
  });

  return { cards, sets, found: cards.size, total: ALBUM.length, newThisMonth };
}

/**
 * The drink ids in `after` that were not in `before`.
 *
 * The celebration asks this rather than recomputing a whole collection and
 * diffing sizes, because two cards can open in one round and the overlay wants
 * to name them.
 */
export function newCards(before: Collection, after: Collection): Card[] {
  const out: Card[] = [];
  after.cards.forEach((card, id) => {
    if (!before.cards.has(id)) out.push(card);
  });
  return out.sort((a, b) => a.firstAt - b.firstAt);
}

/**
 * A set is "complete" at every card found, and the album at every set.
 *
 * Returned as its own function because three surfaces ask it and one of them
 * (the You tab) has no reason to build the full set list.
 */
export function completedSets(c: Collection): DrinkCategory[] {
  return c.sets.filter((s) => s.all.length > 0 && s.found.length === s.all.length).map((s) => s.category);
}
