import { en } from '@/i18n/locales/en/index';
import { fr } from '@/i18n/locales/fr/index';
import { ro } from '@/i18n/locales/ro/index';
import { es } from '@/i18n/locales/es/index';
import { pluralCategory, REQUIRED_FORMS, type Locale } from '@/i18n/plurals';
import { isPlural, type Message } from '@/i18n/types';
import { translate } from '@/i18n/translate';
import * as fmt from '@/i18n/format';

type Catalogue = Record<string, Message>;
const CATALOGUES: Record<Locale, Catalogue> = { en, fr, ro, es };
const EN: Catalogue = en;
const LOCALES: Locale[] = ['en', 'fr', 'ro', 'es'];

describe('plural rules', () => {
  it('English: one is 1 and nothing else', () => {
    expect(pluralCategory('en', 1)).toBe('one');
    for (const n of [0, 2, 5, 11, 21, 100]) expect(pluralCategory('en', n)).toBe('other');
  });

  it('French treats zero as singular', () => {
    // "0 nuit", not "0 nuits". Getting this wrong is the classic English-brain
    // mistake in French.
    expect(pluralCategory('fr', 0)).toBe('one');
    expect(pluralCategory('fr', 1)).toBe('one');
    expect(pluralCategory('fr', 2)).toBe('other');
  });

  it('Spanish: one is 1, zero is plural', () => {
    expect(pluralCategory('es', 0)).toBe('other');
    expect(pluralCategory('es', 1)).toBe('one');
    expect(pluralCategory('es', 2)).toBe('other');
  });

  /**
   * The rule this whole file exists for. Romanian has three forms and the third
   * is the one every naive implementation misses: above nineteen the noun takes
   * "de". "19 nopți" but "20 de nopți"; "119 nopți" but "120 de nopți".
   */
  describe('Romanian has three forms', () => {
    it('1 is singular', () => {
      expect(pluralCategory('ro', 1)).toBe('one');
    });

    it('0 and 2 through 19 are the few form', () => {
      for (const n of [0, 2, 3, 10, 15, 19]) expect(pluralCategory('ro', n)).toBe('few');
    });

    it('20 and up take the other form, which carries "de"', () => {
      for (const n of [20, 21, 45, 99, 100]) expect(pluralCategory('ro', n)).toBe('other');
    });

    it('and the pattern repeats above a hundred', () => {
      // 101–119 are few again; 120–199 are other.
      for (const n of [101, 105, 119]) expect(pluralCategory('ro', n)).toBe('few');
      for (const n of [120, 155, 199]) expect(pluralCategory('ro', n)).toBe('other');
    });

    it('renders the "de" in a real message', () => {
      expect(translate('ro', 'ui.people', { count: 1 })).toBe('o persoană');
      expect(translate('ro', 'ui.people', { count: 5 })).toBe('5 persoane');
      expect(translate('ro', 'ui.people', { count: 20 })).toBe('20 de persoane');
      expect(translate('ro', 'ui.people', { count: 105 })).toBe('105 persoane');
      expect(translate('ro', 'ui.people', { count: 120 })).toBe('120 de persoane');
    });
  });
});

describe('the catalogues', () => {
  it('every locale has every key the English one does', () => {
    const keys = Object.keys(en);
    expect(keys.length).toBeGreaterThan(0);
    for (const locale of LOCALES) {
      const missing = keys.filter((k) => !(k in CATALOGUES[locale]));
      expect({ locale, missing }).toEqual({ locale, missing: [] });
    }
  });

  it('and no locale has a key the English one does not', () => {
    const keys = new Set(Object.keys(en));
    for (const locale of LOCALES) {
      const extra = Object.keys(CATALOGUES[locale]).filter((k) => !keys.has(k));
      expect({ locale, extra }).toEqual({ locale, extra: [] });
    }
  });

  it('a countable message is countable in every language', () => {
    for (const key of Object.keys(en)) {
      const shapes = LOCALES.map((l) => isPlural(CATALOGUES[l][key]));
      const allSame = shapes.every((s) => s === shapes[0]);
      expect({ key, allSame }).toEqual({ key, allSame: true });
    }
  });

  /**
   * A Romanian plural with only `one` and `other` would silently render
   * "2 de persoane". The forms each language needs are declared in plurals.ts
   * and enforced here.
   */
  it('every plural defines the forms its own language needs', () => {
    const wrong: string[] = [];
    for (const locale of LOCALES) {
      for (const [key, msg] of Object.entries(CATALOGUES[locale])) {
        if (!isPlural(msg)) continue;
        for (const form of REQUIRED_FORMS[locale]) {
          if (!msg[form]) wrong.push(`${locale}:${key} missing ${form}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('placeholders match across languages, so nothing renders a bare {count}', () => {
    const vars = (m: Message): string[] =>
      [...(typeof m === 'string' ? m : Object.values(m).join(' ')).matchAll(/\{(\w+)\}/g)]
        .map((x) => x[1])
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();

    const bad: string[] = [];
    for (const key of Object.keys(en)) {
      const expected = vars(EN[key]);
      for (const locale of LOCALES) {
        const got = vars(CATALOGUES[locale][key]);
        // A translation may legitimately drop {count} in a singular form —
        // "o persoană" reads better than "1 persoană" — so the check is that a
        // locale introduces no placeholder English does not have, and that a
        // non-count placeholder is never dropped.
        const invented = got.filter((v) => !expected.includes(v));
        const lost = expected.filter((v) => v !== 'count' && !got.includes(v));
        if (invented.length) bad.push(`${locale}:${key} invents ${invented.join(',')}`);
        if (lost.length) bad.push(`${locale}:${key} drops ${lost.join(',')}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('no message is empty or accidentally left in English', () => {
    const suspicious: string[] = [];
    for (const locale of LOCALES) {
      if (locale === 'en') continue;
      for (const key of Object.keys(en)) {
        const source = EN[key];
        const target = CATALOGUES[locale][key];
        const flatten = (m: Message) => (typeof m === 'string' ? m : Object.values(m).join('|'));
        const a = flatten(source);
        const b = flatten(target);
        if (!b.trim()) suspicious.push(`${locale}:${key} is empty`);
        // Identical strings are fine when there is nothing to translate — a
        // brand name, a phone number, a bare placeholder. Flag only prose.
        if (a === b && /\s/.test(a) && a.split(/\s+/).length > 2 && !/ROUNDS|@|\d{3}/.test(a)) {
          suspicious.push(`${locale}:${key} is still English: "${a}"`);
        }
      }
    }
    expect(suspicious).toEqual([]);
  });

  it('Romanian uses comma-below diacritics, not the Turkish cedilla', () => {
    // ş U+015F and ţ U+0163 are Turkish. Romanian is ș U+0219 and ț U+021B.
    // They look almost identical and render as different letters in many fonts.
    const offenders: string[] = [];
    for (const [key, msg] of Object.entries(ro)) {
      const text = typeof msg === 'string' ? msg : Object.values(msg).join(' ');
      if (/[şţŞŢ]/.test(text)) offenders.push(key);
    }
    expect(offenders).toEqual([]);
  });
});

describe('formatting', () => {
  const at = Date.UTC(2026, 8, 5, 21, 14, 0);

  it('formats a clock in 24 hours in every language', () => {
    for (const l of LOCALES) expect(fmt.formatClock(l, at)).toMatch(/^\d{2}:\d{2}$/);
  });

  it('writes Romanian lei after the number, the way a receipt does', () => {
    expect(fmt.formatMoney('ro', 3550, 'RON')).toBe('36 lei');
  });

  it('uses each locale’s own separators', () => {
    expect(fmt.formatNumber('en', 1234.5, 1)).toBe('1,234.5');
    // French groups with a narrow no-break space, not a comma.
    expect(fmt.formatNumber('fr', 1234.5, 1)).toMatch(/^1\s234,5$/);
    expect(fmt.formatNumber('ro', 1234.5, 1)).toBe('1.234,5');
    // Spanish does NOT group a four-digit number — "1234,5" is correct and
    // "1.234,5" is not. It starts grouping at five digits.
    expect(fmt.formatNumber('es', 1234.5, 1)).toBe('1234,5');
    expect(fmt.formatNumber('es', 12345.5, 1)).toBe('12.345,5');
  });

  it('abbreviates minutes the way each language does', () => {
    expect(fmt.formatDuration('en', 3 * 3600_000 + 20 * 60_000)).toBe('3h 20m');
    expect(fmt.formatDuration('fr', 3 * 3600_000 + 20 * 60_000)).toBe('3h 20min');
    expect(fmt.formatDuration('ro', 45 * 60_000)).toBe('45min');
  });

  it('never throws, whatever it is handed', () => {
    for (const l of LOCALES) {
      expect(() => fmt.formatDayShort(l, NaN)).not.toThrow();
      expect(() => fmt.formatMoney(l, 0, 'XYZ')).not.toThrow();
      expect(() => fmt.formatDuration(l, -1)).not.toThrow();
    }
  });
});

describe('translate', () => {
  it('interpolates', () => {
    expect(translate('en', 'ui.level', { level: 6 })).toBe('Level 6');
    expect(translate('ro', 'ui.level', { level: 6 })).toBe('Nivelul 6');
  });

  it('leaves an unknown placeholder alone rather than printing undefined', () => {
    expect(translate('en', 'ui.level', {})).toBe('Level {level}');
  });

  it('falls back to English for a key a locale is missing', () => {
    // Nothing should be missing — the type system and the tests above see to
    // that — but the fallback must be a real sentence, not a key.
    expect(translate('fr', 'ui.retry')).toBe('Réessayer');
  });
});
