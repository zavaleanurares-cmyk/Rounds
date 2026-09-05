import type { Drink } from './types';
import type { MessageKey } from '@/i18n';
import { LIQUID } from './art';
import { makeDrink as d, type DrinkSpec } from './makeDrink';

/**
 * The IBA official cocktail list — The Unforgettables, Contemporary Classics
 * and New Era Drinks.
 *
 * `ml` is the FINISHED poured volume and `abv` the strength of the finished
 * drink, diluted. A Negroni is 30+30+30 of ~24% ingredients, poured over ice: it
 * lands near 90ml at 24%, not 30ml at 40%. Getting this wrong is how a tracker
 * ends up telling someone three Negronis is a light night.
 *
 * The art is what makes 102 cocktails legible at 20pt: the right glass, the
 * right colour, the right garnish. A Margarita and a Daiquiri are both pale and
 * citrus-led — the salt rim and the coupe are what tell them apart.
 */

const c = (
  id: string,
  name: string,
  ml: number,
  abv: number,
  art: DrinkSpec['art'],
  family: DrinkSpec['family'],
  note?: string
): Drink => d({ id, name, category: 'cocktail', ml, abv, art, family, note });

/* ------------------------------------------------------- The Unforgettables */

export const UNFORGETTABLES: Drink[] = [
  c('alexander', 'Alexander', 90, 22, { glass: 'coupe', liquid: LIQUID.creamLiq, fill: 0.6, garnish: ['nutmeg'] }, 'unforgettable'),
  c('americano', 'Americano', 150, 12, { glass: 'rocks', liquid: LIQUID.campari, fill: 0.62, ice: 'cubes', garnish: ['orangePeel'] }, 'unforgettable'),
  c('angel-face', 'Angel Face', 75, 28, { glass: 'coupe', liquid: LIQUID.peach, fill: 0.6 }, 'unforgettable'),
  c('aviation', 'Aviation', 90, 24, { glass: 'coupe', liquid: LIQUID.violet, fill: 0.6, garnish: ['cherry'] }, 'unforgettable'),
  c('between-the-sheets', 'Between the Sheets', 90, 26, { glass: 'coupe', liquid: LIQUID.brandy, fill: 0.6, garnish: ['citrusTwist'] }, 'unforgettable'),
  c('boulevardier', 'Boulevardier', 90, 26, { glass: 'rocks', liquid: LIQUID.vermouthRed, fill: 0.46, ice: 'sphere', garnish: ['orangePeel'] }, 'unforgettable'),
  c('brandy-crusta', 'Brandy Crusta', 90, 26, { glass: 'coupe', liquid: LIQUID.brandy, fill: 0.58, rim: 'sugar', garnish: ['citrusTwist'] }, 'unforgettable'),
  c('casino', 'Casino', 80, 26, { glass: 'coupe', liquid: LIQUID.gin, fill: 0.6, garnish: ['cherry'] }, 'unforgettable'),
  c('clover-club', 'Clover Club', 110, 18, { glass: 'coupe', liquid: LIQUID.rose, fill: 0.6, garnish: ['foam', 'berry'] }, 'unforgettable'),
  c('daiquiri', 'Daiquiri', 90, 22, { glass: 'coupe', liquid: LIQUID.lime, fill: 0.6, garnish: ['citrusWheel'] }, 'unforgettable'),
  c('dry-martini', 'Dry Martini', 80, 30, { glass: 'martini', liquid: LIQUID.gin, fill: 0.62, garnish: ['olive'] }, 'unforgettable'),
  c('gin-fizz', 'Gin Fizz', 180, 12, { glass: 'collins', liquid: LIQUID.lemon, fill: 0.78, ice: 'cubes', garnish: ['foam', 'citrusWheel'] }, 'unforgettable'),
  c('hanky-panky', 'Hanky Panky', 90, 26, { glass: 'coupe', liquid: LIQUID.vermouthRed, fill: 0.6, garnish: ['orangePeel'] }, 'unforgettable'),
  c('john-collins', 'John Collins', 200, 11, { glass: 'collins', liquid: LIQUID.lemon, fill: 0.8, ice: 'cubes', garnish: ['citrusWheel', 'cherry', 'straw'] }, 'unforgettable'),
  c('last-word', 'Last Word', 90, 26, { glass: 'coupe', liquid: LIQUID.chartreuse, fill: 0.6, garnish: ['cherry'] }, 'unforgettable'),
  c('manhattan', 'Manhattan', 90, 28, { glass: 'coupe', liquid: LIQUID.vermouthRed, fill: 0.6, garnish: ['cherry'] }, 'unforgettable'),
  c('mary-pickford', 'Mary Pickford', 100, 18, { glass: 'coupe', liquid: LIQUID.hibiscus, fill: 0.6, garnish: ['cherry'] }, 'unforgettable'),
  c('martinez', 'Martinez', 85, 27, { glass: 'nickAndNora', liquid: LIQUID.vermouthRed, fill: 0.6, garnish: ['citrusTwist'] }, 'unforgettable'),
  c('monkey-gland', 'Monkey Gland', 100, 20, { glass: 'coupe', liquid: LIQUID.orangeJuice, fill: 0.6, garnish: ['orangePeel'] }, 'unforgettable'),
  c('negroni', 'Negroni', 90, 24, { glass: 'rocks', liquid: LIQUID.campari, fill: 0.46, ice: 'sphere', garnish: ['orangePeel'] }, 'unforgettable'),
  c('old-fashioned', 'Old Fashioned', 80, 32, { glass: 'rocks', liquid: LIQUID.whisky, fill: 0.44, ice: 'sphere', garnish: ['orangePeel', 'cherry'] }, 'unforgettable'),
  c('paradise', 'Paradise', 90, 20, { glass: 'coupe', liquid: LIQUID.peach, fill: 0.6, garnish: ['orangePeel'] }, 'unforgettable'),
  c('planters-punch', "Planter's Punch", 200, 14, { glass: 'collins', liquid: LIQUID.orangeJuice, fill: 0.8, ice: 'crushed', garnish: ['pineapple', 'cherry', 'straw'] }, 'unforgettable'),
  c('porto-flip', 'Porto Flip', 90, 18, { glass: 'coupe', liquid: LIQUID.port, fill: 0.6, garnish: ['nutmeg'] }, 'unforgettable'),
  c('ramos-fizz', 'Ramos Gin Fizz', 220, 10, { glass: 'collins', liquid: LIQUID.creamLiq, fill: 0.82, garnish: ['foam'] }, 'unforgettable'),
  c('remember-the-maine', 'Remember the Maine', 90, 28, { glass: 'coupe', liquid: LIQUID.vermouthRed, fill: 0.6, garnish: ['cherry'] }, 'unforgettable'),
  c('rusty-nail', 'Rusty Nail', 70, 32, { glass: 'rocks', liquid: LIQUID.whisky, fill: 0.42, ice: 'sphere', garnish: ['citrusTwist'] }, 'unforgettable'),
  c('sazerac', 'Sazerac', 70, 34, { glass: 'rocks', liquid: LIQUID.whisky, fill: 0.4, garnish: ['citrusTwist'] }, 'unforgettable'),
  c('sidecar', 'Sidecar', 90, 26, { glass: 'coupe', liquid: LIQUID.brandy, fill: 0.6, rim: 'sugar', garnish: ['citrusTwist'] }, 'unforgettable'),
  c('stinger', 'Stinger', 70, 32, { glass: 'coupe', liquid: LIQUID.greenMint, fill: 0.58, garnish: ['mint'] }, 'unforgettable'),
  c('tuxedo', 'Tuxedo', 85, 28, { glass: 'nickAndNora', liquid: LIQUID.gin, fill: 0.6, garnish: ['cherry'] }, 'unforgettable'),
  c('vieux-carre', 'Vieux Carré', 100, 27, { glass: 'rocks', liquid: LIQUID.brandy, fill: 0.48, ice: 'cubes', garnish: ['citrusTwist'] }, 'unforgettable'),
  c('whiskey-sour', 'Whiskey Sour', 110, 20, { glass: 'rocks', liquid: LIQUID.whisky, fill: 0.5, ice: 'cubes', garnish: ['foam', 'cherry', 'citrusWheel'] }, 'unforgettable'),
  c('white-lady', 'White Lady', 90, 26, { glass: 'coupe', liquid: LIQUID.clear, fill: 0.6, garnish: ['citrusTwist'] }, 'unforgettable'),
];

/* ---------------------------------------------------- Contemporary Classics */

export const CONTEMPORARY: Drink[] = [
  c('bellini', 'Bellini', 120, 9, { glass: 'flute', liquid: LIQUID.peach, fill: 0.68 }, 'contemporary'),
  c('black-russian', 'Black Russian', 70, 28, { glass: 'rocks', liquid: LIQUID.coffee, fill: 0.42, ice: 'cubes' }, 'contemporary'),
  c('bloody-mary', 'Bloody Mary', 200, 11, { glass: 'highball', liquid: LIQUID.tomato, fill: 0.8, ice: 'cubes', garnish: ['celery', 'citrusWedge'] }, 'contemporary'),
  c('caipirinha', 'Caipirinha', 120, 25, { glass: 'rocks', liquid: LIQUID.sugarcane, fill: 0.62, ice: 'crushed', garnish: ['citrusWedge'] }, 'contemporary'),
  c('cardinale', 'Cardinale', 90, 26, { glass: 'coupe', liquid: LIQUID.campari, fill: 0.6, garnish: ['citrusTwist'] }, 'contemporary'),
  c('champagne-cocktail', 'Champagne Cocktail', 130, 13, { glass: 'flute', liquid: LIQUID.sparkling, fill: 0.68, garnish: ['orangePeel'] }, 'contemporary'),
  c('corpse-reviver-2', 'Corpse Reviver #2', 100, 22, { glass: 'coupe', liquid: LIQUID.lemon, fill: 0.6, garnish: ['citrusTwist'] }, 'contemporary'),
  c('cosmopolitan', 'Cosmopolitan', 100, 21, { glass: 'martini', liquid: LIQUID.cranberry, fill: 0.62, garnish: ['citrusTwist'] }, 'contemporary'),
  c('cuba-libre', 'Cuba Libre', 220, 9, { glass: 'highball', liquid: LIQUID.cola, fill: 0.82, ice: 'cubes', garnish: ['citrusWedge', 'straw'] }, 'contemporary'),
  c('french-75', 'French 75', 150, 15, { glass: 'flute', liquid: LIQUID.sparkling, fill: 0.7, garnish: ['citrusTwist'] }, 'contemporary'),
  c('french-connection', 'French Connection', 70, 36, { glass: 'rocks', liquid: LIQUID.brandy, fill: 0.42, ice: 'sphere' }, 'contemporary'),
  c('garibaldi', 'Garibaldi', 180, 8, { glass: 'highball', liquid: LIQUID.orangeJuice, fill: 0.8, ice: 'cubes', garnish: ['orangePeel'] }, 'contemporary'),
  c('grasshopper', 'Grasshopper', 90, 16, { glass: 'coupe', liquid: LIQUID.greenMint, fill: 0.6, garnish: ['mint'] }, 'contemporary'),
  c('hemingway-special', 'Hemingway Special', 120, 20, { glass: 'coupe', liquid: LIQUID.grapefruit, fill: 0.62, garnish: ['citrusWheel'] }, 'contemporary'),
  c('horses-neck', "Horse's Neck", 220, 8, { glass: 'highball', liquid: LIQUID.ginger, fill: 0.82, ice: 'cubes', garnish: ['citrusTwist', 'straw'] }, 'contemporary'),
  c('irish-coffee', 'Irish Coffee', 180, 8, { glass: 'mug', liquid: LIQUID.coffee, fill: 0.72, garnish: ['cream'] }, 'contemporary'),
  c('kir', 'Kir', 130, 11, { glass: 'wineWhite', liquid: LIQUID.hibiscus, fill: 0.42 }, 'contemporary'),
  c('lemon-drop', 'Lemon Drop', 100, 22, { glass: 'martini', liquid: LIQUID.lemon, fill: 0.62, rim: 'sugar', garnish: ['citrusTwist'] }, 'contemporary'),
  c('long-island', 'Long Island Iced Tea', 250, 15, { glass: 'collins', liquid: LIQUID.cola, fill: 0.82, ice: 'cubes', garnish: ['citrusWedge', 'straw'] }, 'contemporary'),
  c('mai-tai', 'Mai Tai', 160, 20, { glass: 'rocks', liquid: LIQUID.goldRum, fill: 0.66, ice: 'crushed', garnish: ['mint', 'citrusWedge'] }, 'contemporary'),
  c('margarita', 'Margarita', 110, 22, { glass: 'coupe', liquid: LIQUID.lime, fill: 0.6, rim: 'salt', garnish: ['citrusWheel'] }, 'contemporary'),
  c('mimosa', 'Mimosa', 130, 7, { glass: 'flute', liquid: LIQUID.orangeJuice, fill: 0.68 }, 'contemporary'),
  c('mint-julep', 'Mint Julep', 130, 25, { glass: 'julep', liquid: LIQUID.whisky, fill: 0.66, ice: 'crushed', garnish: ['mint', 'straw'] }, 'contemporary'),
  c('mojito', 'Mojito', 220, 11, { glass: 'collins', liquid: LIQUID.lime, fill: 0.8, ice: 'crushed', garnish: ['mint', 'citrusWedge', 'straw'] }, 'contemporary'),
  c('moscow-mule', 'Moscow Mule', 220, 10, { glass: 'copper', liquid: LIQUID.ginger, fill: 0.8, ice: 'cubes', garnish: ['mint', 'citrusWedge'] }, 'contemporary'),
  c('pina-colada', 'Piña Colada', 220, 12, { glass: 'hurricane', liquid: LIQUID.creamLiq, fill: 0.78, ice: 'crushed', garnish: ['pineapple', 'cherry', 'umbrella'] }, 'contemporary'),
  c('pisco-sour', 'Pisco Sour', 120, 20, { glass: 'coupe', liquid: LIQUID.lemon, fill: 0.6, garnish: ['foam'] }, 'contemporary'),
  c('rabo-de-galo', 'Rabo de Galo', 90, 26, { glass: 'rocks', liquid: LIQUID.vermouthRed, fill: 0.46, ice: 'cubes' }, 'contemporary'),
  c('sea-breeze', 'Sea Breeze', 220, 9, { glass: 'highball', liquid: LIQUID.cranberry, fill: 0.82, ice: 'cubes', garnish: ['citrusWedge', 'straw'] }, 'contemporary'),
  c('sex-on-the-beach', 'Sex on the Beach', 220, 10, { glass: 'highball', liquid: LIQUID.peach, fill: 0.82, ice: 'cubes', garnish: ['orangePeel', 'straw'] }, 'contemporary'),
  c('singapore-sling', 'Singapore Sling', 200, 14, { glass: 'sling', liquid: LIQUID.hibiscus, fill: 0.78, ice: 'cubes', garnish: ['pineapple', 'cherry', 'straw'] }, 'contemporary'),
  c('tequila-sunrise', 'Tequila Sunrise', 220, 10, { glass: 'highball', liquid: LIQUID.orangeJuice, fill: 0.82, ice: 'cubes', garnish: ['orangePeel', 'straw'],
      layers: [{ color: '#D62A4E', at: 0 }, { color: '#FCA326', at: 0.42 }] }, 'contemporary'),
  c('vesper', 'Vesper', 90, 32, { glass: 'martini', liquid: LIQUID.gin, fill: 0.62, garnish: ['citrusTwist'] }, 'contemporary'),
  c('zombie', 'Zombie', 220, 20, { glass: 'tiki', liquid: LIQUID.darkRum, fill: 0.78, ice: 'crushed', garnish: ['mint', 'cherry', 'umbrella'] }, 'contemporary'),
];

/* ------------------------------------------------------------ New Era Drinks */

export const NEW_ERA: Drink[] = [
  c('bees-knees', "Bee's Knees", 90, 24, { glass: 'coupe', liquid: LIQUID.lemon, fill: 0.6, garnish: ['citrusTwist'] }, 'newera'),
  c('bramble', 'Bramble', 140, 16, { glass: 'rocks', liquid: LIQUID.hibiscus, fill: 0.64, ice: 'crushed', garnish: ['berry', 'citrusWheel'] }, 'newera'),
  c('canchanchara', 'Canchánchara', 100, 24, { glass: 'rocks', liquid: LIQUID.goldRum, fill: 0.5, ice: 'crushed', garnish: ['citrusWedge'] }, 'newera'),
  c('chartreuse-swizzle', 'Chartreuse Swizzle', 180, 16, { glass: 'collins', liquid: LIQUID.chartreuse, fill: 0.78, ice: 'crushed', garnish: ['mint', 'straw'] }, 'newera'),
  c('dark-n-stormy', "Dark 'n' Stormy", 220, 10, { glass: 'highball', liquid: LIQUID.ginger, fill: 0.82, ice: 'cubes', garnish: ['citrusWedge', 'straw'],
      layers: [{ color: '#E0A34C', at: 0 }, { color: '#4E2409', at: 0.6 }] }, 'newera'),
  c('dons-special-daiquiri', "Don's Special Daiquiri", 120, 22, { glass: 'coupe', liquid: LIQUID.goldRum, fill: 0.6, garnish: ['mint'] }, 'newera'),
  c('espresso-martini', 'Espresso Martini', 120, 20, { glass: 'martini', liquid: LIQUID.espresso, fill: 0.62, garnish: ['foam', 'coffeeBeans'] }, 'newera'),
  c('fernandito', 'Fernandito', 220, 10, { glass: 'highball', liquid: LIQUID.cola, fill: 0.82, ice: 'cubes', garnish: ['straw'] }, 'newera'),
  c('french-martini', 'French Martini', 110, 18, { glass: 'martini', liquid: LIQUID.hibiscus, fill: 0.62, garnish: ['foam'] }, 'newera'),
  c('gin-basil-smash', 'Gin Basil Smash', 130, 20, { glass: 'rocks', liquid: LIQUID.absinthe, fill: 0.62, ice: 'cubes', garnish: ['basil'] }, 'newera'),
  c('grand-margarita', 'Grand Margarita', 120, 23, { glass: 'coupe', liquid: LIQUID.lime, fill: 0.6, rim: 'salt', garnish: ['citrusWheel'] }, 'newera'),
  c('iba-tiki', 'IBA Tiki', 200, 18, { glass: 'tiki', liquid: LIQUID.pineapple, fill: 0.78, ice: 'crushed', garnish: ['pineapple', 'mint', 'umbrella'] }, 'newera'),
  c('illegal', 'Illegal', 100, 26, { glass: 'coupe', liquid: LIQUID.mezcal, fill: 0.6, garnish: ['foam'] }, 'newera'),
  c('jungle-bird', 'Jungle Bird', 150, 17, { glass: 'rocks', liquid: LIQUID.campari, fill: 0.66, ice: 'crushed', garnish: ['pineapple'] }, 'newera'),
  c('missionarys-downfall', "Missionary's Downfall", 160, 16, { glass: 'coupe', liquid: LIQUID.greenMint, fill: 0.62, ice: 'crushed', garnish: ['mint'] }, 'newera'),
  c('naked-and-famous', 'Naked and Famous', 90, 24, { glass: 'coupe', liquid: LIQUID.chartreuse, fill: 0.6 }, 'newera'),
  c('new-york-sour', 'New York Sour', 120, 20, { glass: 'rocks', liquid: LIQUID.whisky, fill: 0.56, ice: 'cubes', garnish: ['foam'],
      layers: [{ color: '#96500F', at: 0 }, { color: '#8E2036', at: 0.68 }] }, 'newera'),
  c('old-cuban', 'Old Cuban', 150, 16, { glass: 'coupe', liquid: LIQUID.sparkling, fill: 0.62, garnish: ['mint'] }, 'newera'),
  c('paloma', 'Paloma', 220, 9, { glass: 'highball', liquid: LIQUID.grapefruit, fill: 0.82, ice: 'cubes', rim: 'salt', garnish: ['citrusWedge', 'straw'] }, 'newera'),
  c('paper-plane', 'Paper Plane', 100, 22, { glass: 'coupe', liquid: LIQUID.aperol, fill: 0.6 }, 'newera'),
  c('penicillin', 'Penicillin', 110, 24, { glass: 'rocks', liquid: LIQUID.whisky, fill: 0.5, ice: 'sphere', garnish: ['citrusTwist'] }, 'newera'),
  c('pisco-punch', 'Pisco Punch', 160, 16, { glass: 'coupe', liquid: LIQUID.pineapple, fill: 0.62, garnish: ['pineapple'] }, 'newera'),
  c('porn-star-martini', 'Porn Star Martini', 130, 18, { glass: 'martini', liquid: LIQUID.passionfruit, fill: 0.62, garnish: ['foam'] }, 'newera'),
  c('russian-spring-punch', 'Russian Spring Punch', 180, 12, { glass: 'collins', liquid: LIQUID.hibiscus, fill: 0.78, ice: 'cubes', garnish: ['berry', 'straw'] }, 'newera'),
  c('sherry-cobbler', 'Sherry Cobbler', 160, 12, { glass: 'collins', liquid: LIQUID.sherry, fill: 0.78, ice: 'crushed', garnish: ['orangePeel', 'berry', 'straw'] }, 'newera'),
  c('south-side', 'South Side', 110, 22, { glass: 'coupe', liquid: LIQUID.lime, fill: 0.6, garnish: ['mint'] }, 'newera'),
  c('spicy-fifty', 'Spicy Fifty', 110, 22, { glass: 'martini', liquid: LIQUID.lemon, fill: 0.62, garnish: ['chilli'] }, 'newera'),
  c('spritz', 'Spritz', 200, 9, { glass: 'wineRed', liquid: LIQUID.aperol, fill: 0.6, ice: 'cubes', garnish: ['orangePeel'] }, 'newera'),
  c('suffering-bastard', 'Suffering Bastard', 220, 14, { glass: 'tiki', liquid: LIQUID.ginger, fill: 0.78, ice: 'cubes', garnish: ['mint', 'citrusWedge'] }, 'newera'),
  c('three-dots-and-a-dash', 'Three Dots and a Dash', 180, 18, { glass: 'tiki', liquid: LIQUID.goldRum, fill: 0.78, ice: 'crushed', garnish: ['cherry', 'pineapple'] }, 'newera'),
  c('tipperary', 'Tipperary', 90, 26, { glass: 'coupe', liquid: LIQUID.chartreuse, fill: 0.6, garnish: ['cherry'] }, 'newera'),
  c('tommys-margarita', "Tommy's Margarita", 110, 23, { glass: 'rocks', liquid: LIQUID.lime, fill: 0.5, ice: 'cubes', rim: 'salt', garnish: ['citrusWheel'] }, 'newera'),
  c('trinidad-sour', 'Trinidad Sour', 100, 20, { glass: 'coupe', liquid: LIQUID.amber, fill: 0.6 }, 'newera'),
  c('vento', 'Ve.n.to', 100, 20, { glass: 'rocks', liquid: LIQUID.white, fill: 0.5, ice: 'cubes', garnish: ['rosemary'] }, 'newera'),
  c('aperol-spritz', 'Aperol Spritz', 200, 9, { glass: 'wineRed', liquid: LIQUID.aperol, fill: 0.6, ice: 'cubes', garnish: ['orangePeel'] }, 'newera'),
  c('hugo', 'Hugo Spritz', 200, 8, { glass: 'wineRed', liquid: LIQUID.sparkling, fill: 0.6, ice: 'cubes', garnish: ['mint', 'citrusWheel'] }, 'newera'),
  c('gin-tonic', 'Gin & tonic', 250, 8, { glass: 'wineRed', liquid: LIQUID.tonic, fill: 0.6, ice: 'cubes', garnish: ['cucumber', 'rosemary'] }, 'newera'),
];

export const COCKTAILS: Drink[] = [...UNFORGETTABLES, ...CONTEMPORARY, ...NEW_ERA];

/** The three IBA families, as message keys. Translated at the render site. */
export const IBA_FAMILY_LABEL = {
  unforgettable: 'common.ibaUnforgettable',
  contemporary: 'common.ibaContemporary',
  newera: 'common.ibaNewEra',
} as const satisfies Record<string, MessageKey>;
