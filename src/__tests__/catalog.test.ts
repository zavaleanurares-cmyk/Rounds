import { CATALOG, byId, searchDrinks, WATER, CATEGORY_ORDER } from '@/domain/catalog';
import { COCKTAILS, UNFORGETTABLES, CONTEMPORARY, NEW_ERA } from '@/domain/cocktails';
import { ethanolGrams, gramsToUnits } from '@/domain/units';
import { LIQUID } from '@/domain/art';

describe('the catalogue', () => {
  it('has no duplicate ids', () => {
    const ids = CATALOG.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every drink artwork — there are no emoji in this app', () => {
    for (const drink of CATALOG) {
      expect(drink.art).toBeDefined();
      expect(drink.art.glass).toBeTruthy();
      expect(drink.art.liquid).toHaveLength(2);
      expect(drink.art.liquid[0]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(drink.art.liquid[1]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(JSON.stringify(drink)).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    }
  });

  it('derives ethanol from volume and ABV rather than taking it on trust', () => {
    for (const drink of CATALOG) {
      expect(drink.ethanolG).toBeCloseTo(ethanolGrams(drink.volumeMl, drink.abv), 6);
    }
  });

  it('carries the whole IBA official list', () => {
    expect(UNFORGETTABLES.length).toBe(34);
    expect(CONTEMPORARY.length).toBe(34);
    expect(NEW_ERA.length).toBeGreaterThanOrEqual(34);
    expect(COCKTAILS.length).toBeGreaterThanOrEqual(102);
  });

  it('gives cocktails a finished-drink strength, not a base-spirit one', () => {
    // A Negroni is 30+30+30 of ~24% ingredients over ice — about 90ml at 24%.
    // Recording it as 30ml of 40% gin is how a tracker tells someone three
    // Negronis was a light night.
    const negroni = byId('negroni')!;
    expect(negroni.volumeMl).toBe(90);
    expect(negroni.abv).toBeGreaterThan(20);
    expect(gramsToUnits(negroni.ethanolG, 'UK')).toBeGreaterThan(2);

    for (const c of COCKTAILS) {
      expect(c.abv).toBeLessThan(40); // nothing is served at neat-spirit strength
      expect(c.volumeMl).toBeGreaterThanOrEqual(70);
    }
  });

  it('matches the published UK unit figures, row for row', () => {
    // From the NHS/CPOC unit table. Every row here is a published figure, so a
    // change to the ethanol constants shows up as a failing row rather than as
    // a number that is quietly a bit wrong everywhere.
    const u = (ml: number, abv: number) => gramsToUnits(ethanolGrams(ml, abv), 'UK');
    expect(u(25, 40)).toBeCloseTo(1, 1);      // single spirit
    expect(u(275, 4.6)).toBeCloseTo(1.3, 1);  // alcopop
    expect(u(125, 12)).toBeCloseTo(1.5, 1);   // small wine
    expect(u(330, 5)).toBeCloseTo(1.7, 1);    // bottle of beer
    expect(u(440, 5.5)).toBeCloseTo(2.4, 1);  // can
    expect(u(175, 12)).toBeCloseTo(2.1, 1);   // standard wine
    expect(u(568, 3.6)).toBeCloseTo(2.0, 1);  // lower-strength pint
    expect(u(568, 5.2)).toBeCloseTo(3.0, 1);  // higher-strength pint
    expect(u(250, 12)).toBeCloseTo(3.0, 1);   // large wine
  });

  it('keeps water at zero and pinned', () => {
    expect(WATER.ethanolG).toBe(0);
    expect(CATALOG[0].id).toBe('water');
  });

  it('covers every category in the picker order', () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATALOG.some((d) => d.category === cat)).toBe(true);
    }
  });

  it('reuses named liquids rather than eyeballing 165 hues', () => {
    const named = new Set(Object.values(LIQUID).map((l) => l.join()));
    const used = CATALOG.map((d) => d.art.liquid.join());
    const unnamed = used.filter((u) => !named.has(u));
    expect(unnamed).toEqual([]);
  });
});

describe('searchDrinks', () => {
  it('returns nothing for an empty query', () => {
    expect(searchDrinks('')).toEqual([]);
    expect(searchDrinks('   ')).toEqual([]);
  });
  it('puts prefix matches before substring matches', () => {
    const results = searchDrinks('mar');
    expect(results.length).toBeGreaterThan(1);
    expect(results[0].name.toLowerCase().startsWith('mar')).toBe(true);
  });
  it('is case-insensitive', () => {
    expect(searchDrinks('NEGRONI')[0]?.id).toBe('negroni');
  });
  it('finds a drink with a diacritic by its real name', () => {
    expect(searchDrinks('păl')[0]?.id).toBe('palinca');
  });
  it('is bounded, so the sheet never renders 165 rows', () => {
    expect(searchDrinks('a').length).toBeLessThanOrEqual(40);
  });
});
