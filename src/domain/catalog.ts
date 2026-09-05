import type { Drink, DrinkCategory } from './types';
import type { MessageKey } from '@/i18n';
import { LIQUID } from './art';
import { makeDrink as d } from './makeDrink';
import { COCKTAILS } from './cocktails';

/**
 * The drink catalogue.
 *
 * Volumes and ABVs are real. Beer, wine and spirit servings follow the UK unit
 * guidance (25ml spirit at 40%, 175ml wine at 12%, 568ml pint); cocktails carry
 * their finished poured volume and the ABV of the finished drink, not of the
 * base spirit — a Negroni is 90ml at ~24%, not 30ml of gin. That distinction is
 * the difference between a pace ring that means something and one that doesn't.
 *
 * The cocktails are the IBA official list: The Unforgettables, Contemporary
 * Classics and New Era Drinks.
 *
 * Every entry carries `art` — glassware, liquid, garnish — and nothing carries
 * an emoji. See `art.ts` for why.
 */


/* ------------------------------------------------------------------ water */

export const WATER: Drink = d({
  id: 'water',
  name: 'Water',
  category: 'water',
  ml: 330,
  abv: 0,
  art: { glass: 'water', liquid: LIQUID.water, fill: 0.72, ice: 'cubes' },
});

/* ------------------------------------------------------------- beer/cider */

const BEER: Drink[] = [
  d({ id: 'beer-pint', name: 'Pint of lager', category: 'beer', ml: 568, abv: 4.5,
      art: { glass: 'pint', liquid: LIQUID.lager, fill: 0.86, head: '#FFF6E0' } }),
  d({ id: 'beer-pint-strong', name: 'Strong pint', category: 'beer', ml: 568, abv: 5.2,
      art: { glass: 'pint', liquid: LIQUID.paleAle, fill: 0.86, head: '#FFF1D6' } }),
  d({ id: 'beer-half', name: 'Half pint', category: 'beer', ml: 284, abv: 4.5,
      art: { glass: 'pint', liquid: LIQUID.lager, fill: 0.58, head: '#FFF6E0' } }),
  d({ id: 'beer-bottle', name: 'Bottle of beer', category: 'beer', ml: 330, abv: 5,
      art: { glass: 'bottle', liquid: LIQUID.lager, fill: 0.8 } }),
  d({ id: 'beer-can', name: 'Can of beer', category: 'beer', ml: 440, abv: 5.5,
      art: { glass: 'can', liquid: LIQUID.lager, fill: 0.8 } }),
  d({ id: 'pilsner', name: 'Pilsner', category: 'beer', ml: 330, abv: 4.8,
      art: { glass: 'tulip', liquid: LIQUID.pilsner, fill: 0.82, head: '#FFFBEC' } }),
  d({ id: 'ipa', name: 'IPA', category: 'beer', ml: 330, abv: 6.5,
      art: { glass: 'tulip', liquid: LIQUID.ipa, fill: 0.82, head: '#FFEFD2' } }),
  d({ id: 'pale-ale', name: 'Pale ale', category: 'beer', ml: 330, abv: 5,
      art: { glass: 'tulip', liquid: LIQUID.paleAle, fill: 0.82, head: '#FFF2DC' } }),
  d({ id: 'stout', name: 'Stout', category: 'beer', ml: 568, abv: 4.2,
      art: { glass: 'pint', liquid: LIQUID.stout, fill: 0.84, head: '#EFE0C6' } }),
  d({ id: 'porter', name: 'Porter', category: 'beer', ml: 330, abv: 5.4,
      art: { glass: 'tulip', liquid: LIQUID.porter, fill: 0.82, head: '#E9D8BC' } }),
  d({ id: 'wheat-beer', name: 'Wheat beer', category: 'beer', ml: 500, abv: 5.2,
      art: { glass: 'tulip', liquid: LIQUID.wheat, fill: 0.8, head: '#FFFDF3',
             garnish: ['citrusWheel'] } }),
  d({ id: 'sour-beer', name: 'Sour', category: 'beer', ml: 330, abv: 4.5,
      art: { glass: 'tulip', liquid: LIQUID.sour, fill: 0.8, head: '#FFE6E0' } }),
  d({ id: 'stein', name: 'Stein', category: 'beer', ml: 1000, abv: 5.2,
      art: { glass: 'stein', liquid: LIQUID.amber, fill: 0.85, head: '#FFF4DE' } }),
  d({ id: 'cider', name: 'Cider', category: 'beer', ml: 568, abv: 4.5,
      art: { glass: 'pint', liquid: LIQUID.cider, fill: 0.86, head: '#FFF0CE',
             ice: 'cubes' } }),
  d({ id: 'radler', name: 'Radler', category: 'beer', ml: 500, abv: 2.5,
      art: { glass: 'pint', liquid: LIQUID.lemon, fill: 0.84, head: '#FFFCEA',
             garnish: ['citrusWedge'] } }),
  d({ id: 'nonalc-beer', name: 'Alcohol-free beer', category: 'soft', ml: 330, abv: 0.4,
      art: { glass: 'bottle', liquid: LIQUID.lager, fill: 0.8 } }),
];

/* ------------------------------------------------------------------- wine */

const WINE: Drink[] = [
  d({ id: 'wine-red', name: 'Red wine', category: 'wine', ml: 175, abv: 13,
      art: { glass: 'wineRed', liquid: LIQUID.red, fill: 0.42 } }),
  d({ id: 'wine-red-large', name: 'Large red', category: 'wine', ml: 250, abv: 13,
      art: { glass: 'wineRed', liquid: LIQUID.red, fill: 0.58 } }),
  d({ id: 'wine-white', name: 'White wine', category: 'wine', ml: 175, abv: 12,
      art: { glass: 'wineWhite', liquid: LIQUID.white, fill: 0.42 } }),
  d({ id: 'wine-white-large', name: 'Large white', category: 'wine', ml: 250, abv: 12,
      art: { glass: 'wineWhite', liquid: LIQUID.white, fill: 0.58 } }),
  d({ id: 'wine-rose', name: 'Rosé', category: 'wine', ml: 175, abv: 12,
      art: { glass: 'wineWhite', liquid: LIQUID.rose, fill: 0.42 } }),
  d({ id: 'orange-wine', name: 'Orange wine', category: 'wine', ml: 150, abv: 12.5,
      art: { glass: 'wineWhite', liquid: LIQUID.orangeWine, fill: 0.4 } }),
  d({ id: 'small-wine', name: 'Small glass', category: 'wine', ml: 125, abv: 12,
      art: { glass: 'wineWhite', liquid: LIQUID.white, fill: 0.32 } }),
  d({ id: 'prosecco', name: 'Prosecco', category: 'wine', ml: 125, abv: 11,
      art: { glass: 'flute', liquid: LIQUID.sparkling, fill: 0.66, garnish: ['foam'] } }),
  d({ id: 'champagne', name: 'Champagne', category: 'wine', ml: 125, abv: 12,
      art: { glass: 'flute', liquid: LIQUID.sparkling, fill: 0.66, garnish: ['foam'] } }),
  d({ id: 'cava', name: 'Cava', category: 'wine', ml: 125, abv: 11.5,
      art: { glass: 'flute', liquid: LIQUID.sparkling, fill: 0.66, garnish: ['foam'] } }),
  d({ id: 'port', name: 'Port', category: 'wine', ml: 75, abv: 20,
      art: { glass: 'sherry', liquid: LIQUID.port, fill: 0.5 } }),
  d({ id: 'sherry', name: 'Sherry', category: 'wine', ml: 75, abv: 17,
      art: { glass: 'sherry', liquid: LIQUID.sherry, fill: 0.5 } }),
  d({ id: 'vermouth', name: 'Vermouth', category: 'wine', ml: 75, abv: 16,
      art: { glass: 'rocks', liquid: LIQUID.vermouthRed, fill: 0.42, ice: 'cubes',
             garnish: ['orangePeel'] } }),
];

/* ----------------------------------------------------------------- spirit */

const SPIRIT: Drink[] = [
  d({ id: 'spirit-single', name: 'Single spirit', category: 'spirit', ml: 25, abv: 40,
      art: { glass: 'rocks', liquid: LIQUID.clear, fill: 0.2, ice: 'cubes' } }),
  d({ id: 'spirit-double', name: 'Double spirit', category: 'spirit', ml: 50, abv: 40,
      art: { glass: 'rocks', liquid: LIQUID.clear, fill: 0.34, ice: 'cubes' } }),
  d({ id: 'whisky', name: 'Whisky', category: 'spirit', ml: 50, abv: 40,
      art: { glass: 'rocks', liquid: LIQUID.whisky, fill: 0.34, ice: 'sphere' } }),
  d({ id: 'whisky-neat', name: 'Whisky, neat', category: 'spirit', ml: 35, abv: 43,
      art: { glass: 'sherry', liquid: LIQUID.whisky, fill: 0.4 } }),
  d({ id: 'gin-tonic-simple', name: 'Gin & tonic', category: 'cocktail', ml: 250, abv: 8,
      art: { glass: 'highball', liquid: LIQUID.tonic, fill: 0.82, ice: 'cubes',
             garnish: ['citrusWedge', 'straw'] } }),
  d({ id: 'vodka-soda', name: 'Vodka soda', category: 'cocktail', ml: 250, abv: 8,
      art: { glass: 'highball', liquid: LIQUID.soda, fill: 0.82, ice: 'cubes',
             garnish: ['citrusWedge', 'straw'] } }),
  d({ id: 'rum-coke', name: 'Rum & Coke', category: 'cocktail', ml: 250, abv: 8,
      art: { glass: 'highball', liquid: LIQUID.cola, fill: 0.82, ice: 'cubes',
             garnish: ['citrusWedge', 'straw'] } }),
  d({ id: 'whisky-ginger', name: 'Whisky ginger', category: 'cocktail', ml: 250, abv: 8,
      art: { glass: 'highball', liquid: LIQUID.ginger, fill: 0.82, ice: 'cubes',
             garnish: ['citrusWedge', 'straw'] } }),
  d({ id: 'brandy', name: 'Brandy', category: 'spirit', ml: 35, abv: 40,
      art: { glass: 'sherry', liquid: LIQUID.brandy, fill: 0.4 } }),
  d({ id: 'absinthe', name: 'Absinthe', category: 'spirit', ml: 30, abv: 60,
      art: { glass: 'rocks', liquid: LIQUID.absinthe, fill: 0.28 } }),
  d({ id: 'tuica', name: 'Țuică', category: 'spirit', ml: 50, abv: 45,
      art: { glass: 'shot', liquid: LIQUID.clear, fill: 0.72 },
      note: 'Romanian plum brandy' }),
  d({ id: 'palinca', name: 'Pălincă', category: 'spirit', ml: 50, abv: 52,
      art: { glass: 'shot', liquid: LIQUID.clear, fill: 0.72 } }),
];

/* ------------------------------------------------------------------ shots */

const SHOTS: Drink[] = [
  d({ id: 'shot', name: 'Shot', category: 'shot', ml: 40, abv: 40,
      art: { glass: 'shot', liquid: LIQUID.clear, fill: 0.72 } }),
  d({ id: 'tequila-shot', name: 'Tequila', category: 'shot', ml: 40, abv: 38,
      art: { glass: 'shot', liquid: LIQUID.tequila, fill: 0.72, rim: 'salt',
             garnish: ['citrusWedge'] } }),
  d({ id: 'mezcal-shot', name: 'Mezcal', category: 'shot', ml: 40, abv: 42,
      art: { glass: 'shot', liquid: LIQUID.mezcal, fill: 0.72, garnish: ['citrusWedge'] } }),
  d({ id: 'sambuca', name: 'Sambuca', category: 'shot', ml: 30, abv: 38,
      art: { glass: 'shot', liquid: LIQUID.clear, fill: 0.72, garnish: ['coffeeBeans'] } }),
  d({ id: 'jaeger', name: 'Jägermeister', category: 'shot', ml: 40, abv: 35,
      art: { glass: 'shot', liquid: LIQUID.porter, fill: 0.72 } }),
  d({ id: 'baby-guinness', name: 'Baby Guinness', category: 'shot', ml: 35, abv: 25,
      art: { glass: 'shot', liquid: LIQUID.coffee, fill: 0.74,
             layers: [{ color: '#2A170D', at: 0 }, { color: '#EFE0C6', at: 0.72 }] } }),
  d({ id: 'b52', name: 'B-52', category: 'shot', ml: 45, abv: 26,
      art: { glass: 'shot', liquid: LIQUID.coffee, fill: 0.76,
             layers: [
               { color: '#2A170D', at: 0 },
               { color: '#E3C69A', at: 0.4 },
               { color: '#E08A2A', at: 0.72 },
             ] } }),
  d({ id: 'tequila-rose', name: 'Tequila Rose', category: 'shot', ml: 35, abv: 15,
      art: { glass: 'shot', liquid: LIQUID.rose, fill: 0.72 } }),
  d({ id: 'fireball', name: 'Cinnamon whisky', category: 'shot', ml: 40, abv: 33,
      art: { glass: 'shot', liquid: LIQUID.amber, fill: 0.72, garnish: ['chilli'] } }),
  d({ id: 'limoncello', name: 'Limoncello', category: 'shot', ml: 40, abv: 28,
      art: { glass: 'shot', liquid: LIQUID.lemon, fill: 0.72 } }),
  d({ id: 'ouzo', name: 'Ouzo', category: 'shot', ml: 40, abv: 38,
      art: { glass: 'shot', liquid: LIQUID.clear, fill: 0.72 } }),
  d({ id: 'vodka-shot', name: 'Vodka', category: 'shot', ml: 40, abv: 40,
      art: { glass: 'shot', liquid: LIQUID.clear, fill: 0.72 } }),
];

/* -------------------------------------------------------------- soft/none */

const SOFT: Drink[] = [
  d({ id: 'soft', name: 'Soft drink', category: 'soft', ml: 330, abv: 0,
      art: { glass: 'highball', liquid: LIQUID.cola, fill: 0.82, ice: 'cubes',
             garnish: ['straw'] } }),
  d({ id: 'tonic', name: 'Tonic', category: 'soft', ml: 200, abv: 0,
      art: { glass: 'highball', liquid: LIQUID.tonic, fill: 0.8, ice: 'cubes',
             garnish: ['citrusWedge'] } }),
  d({ id: 'lemonade', name: 'Lemonade', category: 'soft', ml: 330, abv: 0,
      art: { glass: 'collins', liquid: LIQUID.lemon, fill: 0.82, ice: 'cubes',
             garnish: ['citrusWheel', 'straw'] } }),
  d({ id: 'coffee', name: 'Coffee', category: 'soft', ml: 200, abv: 0,
      art: { glass: 'cup', liquid: LIQUID.coffee, fill: 0.7 } }),
  d({ id: 'sparkling-water', name: 'Sparkling water', category: 'water', ml: 330, abv: 0,
      art: { glass: 'highball', liquid: LIQUID.soda, fill: 0.82, ice: 'cubes',
             garnish: ['citrusWedge'] } }),
  d({ id: 'mocktail', name: 'Mocktail', category: 'soft', ml: 220, abv: 0,
      art: { glass: 'hurricane', liquid: LIQUID.grapefruit, fill: 0.78, ice: 'crushed',
             garnish: ['citrusWheel', 'mint', 'straw'] } }),
];

/* ---------------------------------------------------------------- exports */

/** Everything, in the order the picker shows it. */
export const CATALOG: Drink[] = [
  WATER, ...BEER, ...WINE, ...SPIRIT, ...SHOTS, ...COCKTAILS, ...SOFT,
];

const INDEX = new Map(CATALOG.map((x) => [x.id, x]));
export const byId = (id: string): Drink | undefined => INDEX.get(id);

/** Section headings, as message keys — a module constant cannot call a hook. */
export const CATEGORY_LABEL: Record<DrinkCategory, MessageKey> = {
  beer: 'common.categoryBeer',
  wine: 'common.categoryWine',
  spirit: 'common.categorySpirit',
  cocktail: 'common.categoryCocktail',
  shot: 'common.categoryShot',
  soft: 'common.categorySoft',
  water: 'common.categoryWater',
};

export const CATEGORY_ORDER: DrinkCategory[] = [
  'beer', 'wine', 'cocktail', 'spirit', 'shot', 'soft', 'water',
];

/** Fuzzy-ish search over the whole catalogue. Used by the log sheet. */
export function searchDrinks(term: string): Drink[] {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const starts: Drink[] = [];
  const contains: Drink[] = [];
  for (const drink of CATALOG) {
    const name = drink.name.toLowerCase();
    if (name.startsWith(q)) starts.push(drink);
    else if (name.includes(q)) contains.push(drink);
  }
  return [...starts, ...contains].slice(0, 40);
}
