/**
 * Plural rules, per CLDR.
 *
 * This file exists because English has two forms and Romanian has three, and a
 * naive `n === 1 ? singular : plural` is wrong in three of the four languages
 * ROUNDS ships in. The failures are not subtle:
 *
 *   en   1 night     · 2 nights
 *   fr   0 nuit      · 1 nuit      · 2 nuits          ← zero is SINGULAR
 *   es   1 noche     · 2 noches
 *   ro   o noapte    · 2 nopți     · 20 DE nopți      ← a third form, with "de"
 *
 * Romanian's third form is the one nobody remembers. Above 19, and again above
 * 119, the noun takes "de": "19 nopți" but "20 de nopți", "101 nopți" but
 * "120 de nopți". Getting it wrong does not read as a rounding error; it reads
 * as an app written by someone who does not speak the language.
 *
 * Only the four categories these four languages actually use are implemented.
 * Adding a language means adding its rule here and nowhere else.
 */

export type PluralCategory = 'one' | 'few' | 'other';
export type Locale = 'en' | 'fr' | 'ro' | 'es';

/**
 * `Intl.PluralRules` would do this, and does on every platform ROUNDS targets.
 * It is used when present and this table is the fallback — Hermes has shipped
 * with `Intl` stripped on some Android builds, and a missing `Intl` must
 * degrade to correct grammar rather than to a crash or to English's rule.
 */
const RULES: Record<Locale, (n: number) => PluralCategory> = {
  // one: i = 1 and v = 0
  en: (n) => (Number.isInteger(n) && n === 1 ? 'one' : 'other'),

  // one: i = 0,1 — French treats zero as singular. "0 nuit", not "0 nuits".
  fr: (n) => (n >= 0 && n < 2 ? 'one' : 'other'),

  // one: n = 1
  es: (n) => (n === 1 ? 'one' : 'other'),

  /**
   * one:   i = 1 and v = 0                       → 1
   * few:   v != 0 or n = 0 or n % 100 = 1..19    → 0, 2..19, 101..119, …
   * other: everything else                       → 20..99, 120..199, … (takes "de")
   */
  ro: (n) => {
    if (!Number.isInteger(n)) return 'few';
    if (n === 1) return 'one';
    const rem = n % 100;
    if (n === 0 || (rem >= 1 && rem <= 19)) return 'few';
    return 'other';
  },
};

const cache = new Map<Locale, Intl.PluralRules | null>();

function intlRules(locale: Locale): Intl.PluralRules | null {
  if (cache.has(locale)) return cache.get(locale)!;
  let rules: Intl.PluralRules | null = null;
  try {
    rules = new Intl.PluralRules(locale);
    // A polyfill-less Hermes can return a PluralRules that answers 'other' to
    // everything. If it cannot tell 1 from 2 it is not usable.
    if (rules.select(1) === rules.select(2)) rules = null;
  } catch {
    rules = null;
  }
  cache.set(locale, rules);
  return rules;
}

export function pluralCategory(locale: Locale, n: number): PluralCategory {
  const intl = intlRules(locale);
  if (intl) {
    const c = intl.select(n);
    // CLDR has six categories; these four languages only ever produce three,
    // and anything unexpected falls back to the table rather than to a missing
    // message.
    if (c === 'one' || c === 'few' || c === 'other') return c;
  }
  return RULES[locale](n);
}

/** Which forms a locale's catalogue must define for a countable message. */
export const REQUIRED_FORMS: Record<Locale, PluralCategory[]> = {
  en: ['one', 'other'],
  fr: ['one', 'other'],
  es: ['one', 'other'],
  ro: ['one', 'few', 'other'],
};
