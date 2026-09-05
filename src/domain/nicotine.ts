import type { Drink, Log } from './types';
import { makeDrink } from './makeDrink';
import type { GlassShape } from './art';
import { nightKey } from './nightKey';

/**
 * The nicotine module.
 *
 * Two rules shape this file, and both come from the law that governs the market
 * this app is built for rather than from taste.
 *
 * 1. POUCHES CARRY A STRENGTH. It is printed on the tin, it is the unit the
 *    whole category is sold and compared in, and somebody stepping down from
 *    Zyn 6 to Zyn 3 is doing the single most useful thing this module can
 *    support. Romanian Law 64/2024 caps a pouch at 20 mg of nicotine, so the
 *    catalogue below stops there: stronger products exist — White Fox Black at
 *    22.5 mg, Siberia in the forties — and cannot legally be sold in Romania,
 *    so listing them would be listing contraband.
 *
 * 2. CIGARETTES DO NOT. This is the part worth reading twice. EU Directive
 *    2014/40 Article 13(1)(a) forbids printing nicotine, tar or CO content on a
 *    pack, and recital 25 gives the reason: the figures "proved to be
 *    misleading as [they lead] consumers to believe that certain cigarettes are
 *    less harmful than others". A per-brand milligram table in this app would
 *    rebuild exactly what the Directive removed from the packaging, and it
 *    would rank brands by apparent harm — in an app whose own rule is that it
 *    never ranks anything countable about consumption. So a cigarette is a
 *    count and a brand name, and the brand is a label for the person's own
 *    record, not a number to compare.
 *
 * Kept out of `CATALOG` on purpose: the log sheet is a grid of drinks, and a
 * cigarette between a Negroni and a pint is in the way of the roughly seven
 * people in ten who do not smoke — the same reason the module is off by
 * default. These are logged from the nicotine screen.
 *
 * Every entry has zero volume and zero ABV, so `ethanolG` is zero by derivation
 * rather than by assertion, and no alcohol total anywhere has to know they
 * exist.
 */

/** The ceiling a pouch may legally carry in Romania — Law 64/2024. */
export const POUCH_MAX_MG = 20;

export type NicotineFormat = 'pouch' | 'cigarette' | 'rolled' | 'heated' | 'vape';

export interface NicotineProduct {
  id: string;
  /** What it is called on the tin or the pack. */
  name: string;
  brand: string;
  format: NicotineFormat;
  /**
   * Milligrams per unit, where the market itself publishes one.
   *
   * Pouches: the figure on the tin. Cigarettes, rolled tobacco and heated
   * sticks: `null`, and see rule 2 above — this is not missing data, it is a
   * number the EU deliberately removed from packaging because it misleads.
   */
  mg: number | null;
  glass: GlassShape;
  /** The tin or pack colour, so a brand is recognisable at 18pt. */
  tint: readonly [string, string];
}

/* Tin and pack colours, drawn from each brand's own packaging. */
const TINT = {
  zyn:      ['#E9EEF3', '#B9C6D2'],
  velo:     ['#2E3A8C', '#131A44'],
  nordic:   ['#1B7F6B', '#0C4438'],
  loop:     ['#E4572E', '#8E2A12'],
  whitefox: ['#F2F4F5', '#C2C8CC'],
  killa:    ['#111417', '#000000'],
  klint:    ['#3E7CB1', '#1D3F5E'],
  skruf:    ['#2B6E4F', '#12513A'],
  helwit:   ['#7A4FA3', '#3C2455'],
  xqs:      ['#EFC94C', '#A8871F'],
  tobacco:  ['#B4713A', '#6E401B'],
  ember:    ['#E2703A', '#8A3410'],
  device:   ['#3D4854', '#1B2129'],
} as const satisfies Record<string, readonly [string, string]>;

/**
 * Pouches, by brand, at the strengths each actually sells.
 *
 * Sourced from the brands' own ranges as sold in the EU. Where a brand
 * publishes a spread rather than one figure (Skruf's "11–12"), the catalogue
 * takes the figure the tins are labelled with.
 */
export const POUCHES: NicotineProduct[] = [
  { id: 'zyn-3',        brand: 'ZYN',           name: 'ZYN Slim 3',            format: 'pouch', mg: 3,    glass: 'pouch', tint: TINT.zyn },
  { id: 'zyn-6',        brand: 'ZYN',           name: 'ZYN Slim 6',            format: 'pouch', mg: 6,    glass: 'pouch', tint: TINT.zyn },
  { id: 'zyn-9',        brand: 'ZYN',           name: 'ZYN Slim 9',            format: 'pouch', mg: 9,    glass: 'pouch', tint: TINT.zyn },
  { id: 'zyn-11',       brand: 'ZYN',           name: 'ZYN Slim 11',           format: 'pouch', mg: 11,   glass: 'pouch', tint: TINT.zyn },
  { id: 'velo-4',       brand: 'VELO',          name: 'VELO 4',                format: 'pouch', mg: 4,    glass: 'pouch', tint: TINT.velo },
  { id: 'velo-6',       brand: 'VELO',          name: 'VELO 6',                format: 'pouch', mg: 6,    glass: 'pouch', tint: TINT.velo },
  { id: 'velo-10',      brand: 'VELO',          name: 'VELO 10',               format: 'pouch', mg: 10,   glass: 'pouch', tint: TINT.velo },
  { id: 'velo-14',      brand: 'VELO',          name: 'VELO Ultra 14',         format: 'pouch', mg: 14,   glass: 'pouch', tint: TINT.velo },
  { id: 'velo-17',      brand: 'VELO',          name: 'VELO Max 17',           format: 'pouch', mg: 17,   glass: 'pouch', tint: TINT.velo },
  { id: 'nordic-6',     brand: 'Nordic Spirit', name: 'Nordic Spirit 6',       format: 'pouch', mg: 6,    glass: 'pouch', tint: TINT.nordic },
  { id: 'nordic-9',     brand: 'Nordic Spirit', name: 'Nordic Spirit Strong',  format: 'pouch', mg: 9,    glass: 'pouch', tint: TINT.nordic },
  { id: 'nordic-11',    brand: 'Nordic Spirit', name: 'Nordic Spirit X-Strong', format: 'pouch', mg: 11,  glass: 'pouch', tint: TINT.nordic },
  { id: 'loop-9',       brand: 'LOOP',          name: 'LOOP Strong',           format: 'pouch', mg: 9.4,  glass: 'pouch', tint: TINT.loop },
  { id: 'loop-12',      brand: 'LOOP',          name: 'LOOP Extra Strong',     format: 'pouch', mg: 11.8, glass: 'pouch', tint: TINT.loop },
  { id: 'loop-16',      brand: 'LOOP',          name: 'LOOP Hyper Strong',     format: 'pouch', mg: 15.6, glass: 'pouch', tint: TINT.loop },
  { id: 'whitefox-12',  brand: 'White Fox',     name: 'White Fox Slim',        format: 'pouch', mg: 12,   glass: 'pouch', tint: TINT.whitefox },
  { id: 'whitefox-17',  brand: 'White Fox',     name: 'White Fox Full Charge', format: 'pouch', mg: 16.5, glass: 'pouch', tint: TINT.whitefox },
  { id: 'killa-16',     brand: 'Killa',         name: 'Killa Extra Strong',    format: 'pouch', mg: 16,   glass: 'pouch', tint: TINT.killa },
  { id: 'klint-17',     brand: 'Klint',         name: 'Klint Avalanche',       format: 'pouch', mg: 17.5, glass: 'pouch', tint: TINT.klint },
  { id: 'skruf-11',     brand: 'Skruf',         name: 'Skruf Super White',     format: 'pouch', mg: 11,   glass: 'pouch', tint: TINT.skruf },
  { id: 'xqs-4',        brand: 'XQS',           name: 'XQS 4',                 format: 'pouch', mg: 4,    glass: 'pouch', tint: TINT.xqs },
  { id: 'helwit-6',     brand: 'Helwit',        name: 'Helwit 6',              format: 'pouch', mg: 6,    glass: 'pouch', tint: TINT.helwit },
];

/**
 * Everything smoked, inhaled or heated.
 *
 * Brands only — see rule 2. They are here so somebody's own record says what
 * they actually smoke rather than "Cigarette" twenty times, and so the pack on
 * screen looks like the pack in their pocket. No strength, no ranking, no
 * implication that one of these is lighter than another.
 */
export const SMOKED: NicotineProduct[] = [
  { id: 'cig-marlboro',    brand: 'Marlboro',     name: 'Marlboro',     format: 'cigarette', mg: null, glass: 'pack', tint: TINT.ember },
  { id: 'cig-lm',          brand: 'L&M',          name: 'L&M',          format: 'cigarette', mg: null, glass: 'pack', tint: TINT.ember },
  { id: 'cig-winston',     brand: 'Winston',      name: 'Winston',      format: 'cigarette', mg: null, glass: 'pack', tint: TINT.ember },
  { id: 'cig-camel',       brand: 'Camel',        name: 'Camel',        format: 'cigarette', mg: null, glass: 'pack', tint: TINT.tobacco },
  { id: 'cig-kent',        brand: 'Kent',         name: 'Kent',         format: 'cigarette', mg: null, glass: 'pack', tint: TINT.device },
  { id: 'cig-pallmall',    brand: 'Pall Mall',    name: 'Pall Mall',    format: 'cigarette', mg: null, glass: 'pack', tint: TINT.ember },
  { id: 'cig-lucky',       brand: 'Lucky Strike', name: 'Lucky Strike', format: 'cigarette', mg: null, glass: 'pack', tint: TINT.ember },
  { id: 'cig-rothmans',    brand: 'Rothmans',     name: 'Rothmans',     format: 'cigarette', mg: null, glass: 'pack', tint: TINT.device },
  { id: 'cig-chesterfield',brand: 'Chesterfield', name: 'Chesterfield', format: 'cigarette', mg: null, glass: 'pack', tint: TINT.tobacco },
  { id: 'cig-davidoff',    brand: 'Davidoff',     name: 'Davidoff',     format: 'cigarette', mg: null, glass: 'pack', tint: TINT.device },
  { id: 'cig-parliament',  brand: 'Parliament',   name: 'Parliament',   format: 'cigarette', mg: null, glass: 'pack', tint: TINT.device },
  { id: 'cig-other',       brand: '',             name: 'Cigarette',    format: 'cigarette', mg: null, glass: 'cigarette', tint: TINT.ember },
  { id: 'rolled',          brand: '',             name: 'Rolled',       format: 'rolled',    mg: null, glass: 'cigarette', tint: TINT.tobacco },
  { id: 'heated-iqos',     brand: 'IQOS',         name: 'IQOS',         format: 'heated',    mg: null, glass: 'heatstick', tint: TINT.device },
  { id: 'heated-glo',      brand: 'glo',          name: 'glo',          format: 'heated',    mg: null, glass: 'heatstick', tint: TINT.device },
  { id: 'vape',            brand: '',             name: 'Vape',         format: 'vape',      mg: null, glass: 'vape',      tint: TINT.device },
];

export const NICOTINE_PRODUCTS: NicotineProduct[] = [...POUCHES, ...SMOKED];

/** What an unrecognised nicotine log is drawn as: a cigarette, not a device. */
export const UNKNOWN_NICOTINE: NicotineProduct =
  SMOKED.find((p) => p.id === 'cig-other') ?? SMOKED[0];

const BY_ID = new Map(NICOTINE_PRODUCTS.map((p) => [p.id, p]));

/**
 * What the module was before it had brands.
 *
 * The first version had exactly two entries, `cigarette` and `vape`. `vape`
 * survived; `cigarette` became `cig-other`, so every cigarette logged before
 * this catalogue existed would have resolved to nothing and been drawn with
 * whatever the caller's fallback happened to be — in one place, a vape. A row
 * already written is not something to migrate; it is something to keep
 * understanding.
 */
const LEGACY_IDS: Record<string, string> = { cigarette: 'cig-other' };

export const nicotineById = (id: string): NicotineProduct | undefined =>
  BY_ID.get(id) ?? BY_ID.get(LEGACY_IDS[id] ?? '');

/**
 * A product as a `Drink`, which is what the log pipeline takes.
 *
 * Nicotine rides the same rails as everything else — one write path, one queue,
 * one row shape. `makeDrink` derives `ethanolG` from volume and ABV, both zero,
 * so it is zero by construction.
 */
export function asDrink(product: NicotineProduct): Drink {
  return makeDrink({
    id: product.id,
    name: product.name,
    category: 'nicotine',
    ml: 0,
    abv: 0,
    /**
     * `fill: 1`, and that is not cosmetic.
     *
     * `fill` is how full a VESSEL is, and the glyph draws the liquid from
     * `cavity.bottom` up by `depth * fill`. These three are solid objects, not
     * part-full glasses: a pouch is a pouch all the way through. The first
     * version passed `fill: 0` — which is a legal number, so the `?? 0.6`
     * default did not catch it — and the tint rectangle collapsed to zero
     * height at the floor of the clip path. Every one of the twenty-two
     * pouches rendered as the same white outline, and the whole `TINT` table
     * was dead data. `1` fills the silhouette, which is what makes a Killa
     * read black and a ZYN read white at 18pt in a chip.
     */
    art: { glass: product.glass, liquid: product.tint, fill: 1 },
  });
}

/** Every product as a Drink, for the log pipeline and for `byId` lookups. */
export const NICOTINE: Drink[] = NICOTINE_PRODUCTS.map(asDrink);

export const isNicotine = (log: Pick<Log, 'category'>) => log.category === 'nicotine';

/**
 * How many were logged since the start of this week (Monday).
 *
 * The dashboard rendered a literal `0` here for as long as the module existed.
 */
export function nicotineThisWeek(logs: Log[], now = Date.now()): number {
  return sinceMonday(logs, now).length;
}

/**
 * Milligrams of nicotine from pouches since Monday.
 *
 * Pouches only, and that is not an omission — see rule 2 at the top. A total
 * that silently mixed in a made-up figure per cigarette would be a number the
 * EU took off the packaging, reinvented by an app.
 */
export function pouchMgThisWeek(logs: Log[], now = Date.now()): number {
  return sinceMonday(logs, now).reduce((sum, l) => sum + (l.nicotineMg ?? 0), 0);
}

function sinceMonday(logs: Log[], now: number): Log[] {
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  return logs.filter((l) => !l.deleted && isNicotine(l) && l.at >= weekStart.getTime());
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
