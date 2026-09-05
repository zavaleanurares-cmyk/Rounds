/**
 * Standard-drink definitions differ by region, so ROUNDS stores every log in
 * canonical grams of ethanol and converts only at the display edge.
 */

export type UnitSystem = 'UK' | 'US' | 'EU';

/** Grams of ethanol in one "standard drink" / "unit", by region. */
export const STANDARD_DRINK_G: Record<UnitSystem, number> = {
  // 1 UK unit is defined as 10 ml of pure ethanol, which at 0.789 g/ml is
  // 7.89 g — not 8. Rounding it costs about 1.4% on every UK figure in the app,
  // which is enough to put a pint at 2.5 units instead of the 2.6 the NHS table
  // gives, and to make the published unit rows fail to reconcile.
  UK: 7.89,
  US: 14, // 1 US standard drink = 0.6 fl oz of ethanol = 14 g
  EU: 10, // 1 EU standard drink = 10 g
};

export const UNIT_LABEL: Record<UnitSystem, string> = {
  UK: 'units',
  US: 'drinks',
  EU: 'units',
};

const ETHANOL_DENSITY = 0.789; // g/ml at 20 °C

/** Grams of ethanol in `volumeMl` at `abv` percent. */
export function ethanolGrams(volumeMl: number, abvPercent: number): number {
  if (!(volumeMl > 0) || !(abvPercent > 0)) return 0;
  return volumeMl * (abvPercent / 100) * ETHANOL_DENSITY;
}

export function gramsToUnits(grams: number, system: UnitSystem): number {
  return grams / STANDARD_DRINK_G[system];
}

export function unitsToGrams(units: number, system: UnitSystem): number {
  return units * STANDARD_DRINK_G[system];
}

/** "≈ 1.4 units" — shown on the custom-drink screen so the user can sanity-check. */
export function formatUnits(grams: number, system: UnitSystem): string {
  const u = gramsToUnits(grams, system);
  return `≈ ${u.toFixed(1)} ${UNIT_LABEL[system]}`;
}
