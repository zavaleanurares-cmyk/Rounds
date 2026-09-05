import { pluralCategory, type Locale } from './plurals';
import { isPlural, type Message } from './types';
import { en, type MessageKey } from './locales/en/index';
import { fr } from './locales/fr/index';
import { ro } from './locales/ro/index';
import { es } from './locales/es/index';

/**
 * Message resolution, as a pure function.
 *
 * Deliberately separate from the provider: this file imports no React, no
 * storage and no native module, so it can be called from a share-card renderer,
 * from a test, or from a script that generates store screenshots in three
 * languages at once — none of which have a React tree to hang a hook on.
 */

const CATALOGUES: Record<Locale, Partial<Record<MessageKey, Message>>> = { en, fr, ro, es };

/**
 * Missing keys fall back to English rather than rendering the key, because a
 * user who has just switched to Romanian and hits an untranslated string is far
 * better served by an English sentence than by `settings.privacy.header`. The
 * type system and `i18n.test.ts` between them mean this path should never run
 * in a shipped build — it exists for the seconds between adding a key and
 * translating it.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const k = key as MessageKey;
  const entry: Message | undefined = CATALOGUES[locale][k] ?? CATALOGUES.en[k];
  if (entry === undefined) {
    if (__DEV__) console.warn(`[i18n] missing key: ${key}`);
    return key;
  }

  let template: string;
  if (isPlural(entry)) {
    const count = Number(vars?.count ?? 0);
    const category = pluralCategory(locale, count);
    // A locale missing a form it needs falls back within its own entry before
    // it falls back to another language — `other` is always present.
    template = entry[category] ?? entry.other;
  } else {
    template = entry;
  }

  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const v = vars[name];
    return v === undefined ? whole : String(v);
  });
}
