/**
 * The visual vocabulary for a drink.
 *
 * No emoji anywhere in ROUNDS. Emoji render differently on every platform, they
 * cannot be tinted, they cannot carry the app's palette, and — the actual
 * problem — there is no emoji for a Negroni, a Paloma or a Paper Plane, so a
 * catalogue built on them collapses into 🍸 for everything interesting.
 *
 * Instead every drink is drawn: a glassware silhouette, a liquid gradient, and
 * garnishes. Three cheap axes that combine into something recognisable at 20pt
 * on a dark screen — which is the size and the light this app actually runs in.
 */

/** Real glassware. A drink served in the wrong glass is a drink you misread. */
export type GlassShape =
  | 'pint'          // nonic British pint
  | 'tulip'         // craft beer
  | 'stein'         // dimpled mug
  | 'bottle'
  | 'can'
  | 'wineRed'       // wide bowl
  | 'wineWhite'     // narrower bowl
  | 'flute'
  | 'coupe'
  | 'martini'       // the V
  | 'nickAndNora'
  | 'rocks'         // old fashioned
  | 'highball'
  | 'collins'       // taller, narrower
  | 'shot'
  | 'sherry'        // copita / fortified
  | 'mug'           // irish coffee, hot drinks
  | 'copper'        // moscow mule
  | 'hurricane'
  | 'tiki'
  | 'sling'         // footed sling
  | 'julep'         // silver cup
  | 'water'
  | 'cup'           // coffee, soft
  /**
   * Not glassware.
   *
   * The nicotine module records things that are not drunk, and the glyph
   * system is the app's whole answer to "never an emoji" — so rather than
   * exempt it, these are two more silhouettes drawn the same way, with an
   * empty cavity so the liquid layer has nothing to fill.
   */
  | 'cigarette'
  | 'vape';

export type Garnish =
  | 'citrusWheel' | 'citrusWedge' | 'citrusTwist' | 'orangePeel'
  | 'olive' | 'cherry' | 'mint' | 'basil' | 'rosemary'
  | 'coffeeBeans' | 'celery' | 'cucumber' | 'pineapple' | 'umbrella'
  | 'straw' | 'strawPair' | 'stirrer' | 'starAnise' | 'nutmeg'
  | 'cream' | 'foam' | 'flag' | 'chilli' | 'berry';

export interface DrinkArt {
  glass: GlassShape;
  /** Liquid gradient, top → bottom. The single most identifying feature. */
  liquid: readonly [string, string];
  /** How full, 0–1. A martini is filled to the brim; a rocks glass is not. */
  fill?: number;
  /** Beer head / crema / egg-white foam. */
  head?: string;
  ice?: 'cubes' | 'crushed' | 'sphere' | 'none';
  garnish?: readonly Garnish[];
  rim?: 'salt' | 'sugar' | null;
  /** Layered or floated drinks: colour + height from the bottom, 0–1. */
  layers?: ReadonlyArray<{ color: string; at: number }>;
}

/* -------------------------------------------------------------- palettes */

/**
 * Named liquids, so two drinks that really are the same colour stay the same
 * colour, and every hue gets picked once rather than eyeballed 150 times.
 * Tuned for a very dark ground — a real pint is duller than this; on #06070B it
 * would read as mud.
 */
export const LIQUID = {
  lager:        ['#F6C74A', '#D99020'],
  pilsner:      ['#FBD97A', '#E0A82E'],
  paleAle:      ['#F0A83C', '#C2701A'],
  ipa:          ['#F59331', '#B85C14'],
  amber:        ['#D97A2B', '#8F3F0E'],
  stout:        ['#3A2418', '#140B06'],
  porter:       ['#4A2C1C', '#1C0F08'],
  wheat:        ['#F7D98E', '#DDA83F'],
  sour:         ['#F2857A', '#C0403A'],
  cider:        ['#EFB94E', '#C07C1C'],

  red:          ['#8E2036', '#4A0C1B'],
  rose:         ['#F08AA0', '#C74E68'],
  white:        ['#F0E3A8', '#CBB55E'],
  sparkling:    ['#F6E7B4', '#DCC172'],
  orangeWine:   ['#E09A46', '#A9631C'],
  port:         ['#6E1329', '#33060F'],
  sherry:       ['#C98A34', '#8A5312'],
  vermouthRed:  ['#8C2436', '#4C0F1C'],

  clear:        ['#DCE7F5', '#9FB6D0'],
  whisky:       ['#D68A2E', '#96500F'],
  darkRum:      ['#9A5320', '#4E2409'],
  goldRum:      ['#DFA748', '#B2701E'],
  brandy:       ['#C1621F', '#7A3208'],
  tequila:      ['#EBD9A0', '#C0A75C'],
  mezcal:       ['#E3D3A4', '#AE9550'],
  gin:          ['#E3F0FA', '#A9C4DC'],
  absinthe:     ['#A8D24A', '#5C8A18'],
  chartreuse:   ['#B7D839', '#6E9410'],
  campari:      ['#E01E3C', '#8E0B1E'],
  aperol:       ['#FF7A18', '#C24A05'],
  coffee:       ['#4A2B18', '#1D0F07'],
  creamLiq:     ['#E8D3B4', '#BB9A72'],
  blueCuracao:  ['#2FA8E8', '#0E5C97'],
  greenMint:    ['#3FD39A', '#128B62'],
  cranberry:    ['#D62A4E', '#8A0F27'],
  tomato:       ['#D5391F', '#8A1A0B'],
  grapefruit:   ['#F1697A', '#BE3247'],
  orangeJuice:  ['#FCA326', '#D2700C'],
  pineapple:    ['#F7CE4B', '#D19A11'],
  lime:         ['#C7E86A', '#7FA828'],
  lemon:        ['#F4E06A', '#CBAE1D'],
  cola:         ['#4A2A19', '#1B0E06'],
  ginger:       ['#E0A34C', '#A76A15'],
  tonic:        ['#E7F1FA', '#B4C9DD'],
  soda:         ['#EAF2FA', '#BCCEE0'],
  water:        ['#BEE0F5', '#5F97C4'],
  espresso:     ['#3B2214', '#160A04'],
  peach:        ['#FBB07A', '#D06F30'],
  passionfruit: ['#FBC02D', '#C97F06'],
  hibiscus:     ['#C6295E', '#7A0F35'],
  violet:       ['#9A6BD8', '#5B2FA0'],
  banana:       ['#F6DE72', '#CBAA23'],
  falernum:     ['#E4C48B', '#B18C41'],
  sugarcane:    ['#DFE9C8', '#AFC087'],
} as const satisfies Record<string, readonly [string, string]>;

export type LiquidName = keyof typeof LIQUID;

/**
 * Fallback artwork for a custom drink. The user told us the category; that is
 * enough to pick a plausible glass, and a plausible glass beats a blank square.
 */
export const CUSTOM_ART = {
  beer:     { glass: 'pint',     liquid: LIQUID.amber,  fill: 0.84, head: '#FFF4DE' },
  wine:     { glass: 'wineRed',  liquid: LIQUID.red,    fill: 0.44 },
  spirit:   { glass: 'rocks',    liquid: LIQUID.whisky, fill: 0.34, ice: 'cubes' },
  cocktail: { glass: 'coupe',    liquid: LIQUID.grapefruit, fill: 0.6, garnish: ['citrusTwist'] },
  shot:     { glass: 'shot',     liquid: LIQUID.clear,  fill: 0.72 },
  soft:     { glass: 'highball', liquid: LIQUID.soda,   fill: 0.8, ice: 'cubes', garnish: ['straw'] },
  water:    { glass: 'water',    liquid: LIQUID.water,  fill: 0.72, ice: 'cubes' },
  // A custom nicotine entry cannot be created from the drink sheet, but the map
  // is keyed by category and a missing key is a crash rather than a blank.
  nicotine: { glass: 'cigarette', liquid: LIQUID.water,  fill: 0 },
} satisfies Record<string, DrinkArt>;
