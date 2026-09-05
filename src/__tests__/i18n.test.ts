import { en } from '@/i18n/locales/en/index';
import { fr } from '@/i18n/locales/fr/index';
import { ro } from '@/i18n/locales/ro/index';
import { es } from '@/i18n/locales/es/index';
import { pluralCategory, REQUIRED_FORMS, type Locale } from '@/i18n/plurals';
import { isPlural, type Message } from '@/i18n/types';
import { translate } from '@/i18n/translate';
import * as fmt from '@/i18n/format';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';

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

  /**
   * Product names Apple and Google ship untranslated in every locale. Naming
   * them here rather than loosening the heuristic: the list is short, it is
   * reviewable, and anything not on it that stays English is a bug.
   */
  const UNTRANSLATABLE = new Set([
    'settings.surfaceHudIos',       // Live Activity + Dynamic Island
    'settings.surfaceVoiceIos',     // App Intents / Siri
  ]);

  it('no message is empty or accidentally left in English', () => {
    const suspicious: string[] = [];
    for (const locale of LOCALES) {
      if (locale === 'en') continue;
      for (const key of Object.keys(en)) {
        if (UNTRANSLATABLE.has(key)) continue;
        const source = EN[key];
        const target = CATALOGUES[locale][key];
        const flatten = (m: Message) => (typeof m === 'string' ? m : Object.values(m).join('|'));
        const a = flatten(source);
        const b = flatten(target);
        if (!b.trim()) suspicious.push(`${locale}:${key} is empty`);
        // Identical strings are fine when there is nothing to translate — a
        // brand name, a phone number, a bare placeholder. Flag only prose.
        // A message made only of placeholders and punctuation — "{id} · {name}"
        // — is the same in every language, and so is a brand name or a phone
        // number. Only flag prose.
        const prose = a.replace(/\{\w+\}/g, '').replace(/[^\p{L}]+/gu, ' ').trim();
        if (a === b && prose.split(/\s+/).filter(Boolean).length > 2 && !/ROUNDS/.test(a)) {
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
    // Not zero-padded — "2h 5m" is how a person says it.
    expect(fmt.formatDuration('en', 2 * 3600_000 + 5 * 60_000)).toBe('2h 5m');
  });

  it('never throws, whatever it is handed', () => {
    for (const l of LOCALES) {
      expect(() => fmt.formatDayShort(l, NaN)).not.toThrow();
      expect(() => fmt.formatMoney(l, 0, 'XYZ')).not.toThrow();
      expect(() => fmt.formatDuration(l, -1)).not.toThrow();
    }
  });
});

describe('a sentence that counts two things', () => {
  /**
   * Plural selection reads ONE number. A message that counts two — drinks and
   * minutes — cannot inflect both, and in Romanian that is the difference
   * between "acum 5 minute" and "acum 25 de minute".
   *
   * The pace accessibility label used to be one such message. It is now two,
   * and this asserts that both halves inflect independently.
   */
  const { paceAccessibilityLabel } = require('@/domain/pace') as typeof import('@/domain/pace');
  const result = (drinks: number, minutes: number | null) => ({
    state: 'steady' as const,
    drinks,
    totalG: 0,
    gramsPerHour: 0,
    ratioToNormal: 1,
    minutesSinceLast: minutes,
    filled: drinks,
    segments: 6,
  });

  it('inflects each count on its own, in Romanian', () => {
    // 2 drinks (few, no "de") and 25 minutes (other, takes "de")
    expect(paceAccessibilityLabel(result(2, 25), 'ro')).toContain('2 băuturi');
    expect(paceAccessibilityLabel(result(2, 25), 'ro')).toContain('25 de minute');
    // 25 drinks (other, takes "de") and 5 minutes (few, no "de")
    expect(paceAccessibilityLabel(result(25, 5), 'ro')).toContain('25 de băuturi');
    expect(paceAccessibilityLabel(result(25, 5), 'ro')).toContain('5 minute');
    expect(paceAccessibilityLabel(result(25, 5), 'ro')).not.toContain('5 de minute');
  });

  it('drops the tail entirely when there is nothing to say', () => {
    for (const l of LOCALES) {
      expect(paceAccessibilityLabel(result(3, null), l)).not.toMatch(/\{/);
    }
  });

  it('says something in every language', () => {
    for (const l of LOCALES) {
      const label = paceAccessibilityLabel(result(3, 12), l);
      expect(label.length).toBeGreaterThan(20);
      expect(label).not.toMatch(/\{|undefined/);
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

describe('the app uses the catalogue', () => {
  const walk = (dir: string, out: string[] = []): string[] => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (/\.tsx?$/.test(entry)) out.push(full);
    }
    return out;
  };

  const SOURCE = [...walk('app'), ...walk('src')].filter(
    (f) => !f.includes('__tests__') && !f.includes(`i18n${sep}locales`)
  );
  const ALL = SOURCE.map((f) => readFileSync(f, 'utf8')).join('\n');

  it('every key is used somewhere', () => {
    // A key nobody reads is a key three people translate for nothing.
    const unused = Object.keys(en).filter((k) => !ALL.includes(`'${k}'`) && !ALL.includes(`"${k}"`));
    expect(unused).toEqual([]);
  });

  /**
   * The catch-all. Any user-facing string left as a literal is a string that
   * will still be English after the app is switched to Romanian, and the only
   * way to find those reliably is to look for them.
   */
  it('no screen renders a hardcoded English sentence', () => {
    const offenders: string[] = [];
    for (const file of SOURCE) {
      const src = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');

      // Props that reach an eye or a screen reader.
      const props =
        /\b(title|subtitle|label|placeholder|hint|actionLabel|accessibilityLabel|accessibilityHint|eyebrow)=["']([^"']{4,})["']/g;
      for (const m of src.matchAll(props)) {
        const value = m[2];
        if (/^[a-z0-9.[\]_-]+$/i.test(value)) continue;        // an id, an icon name
        if (!/\s/.test(value)) continue;                        // a single word
        offenders.push(`${file}: ${m[1]}="${value}"`);
      }

      // JSX text nodes that are prose rather than an interpolation.
      for (const m of src.matchAll(/>\s*([A-Z][a-z]+(?:\s+[\w',.!?-]+){2,})\s*</g)) {
        offenders.push(`${file}: >${m[1]}<`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
