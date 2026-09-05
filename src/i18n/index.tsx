import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJson, writeJson } from '@/data/storage';
import type { Locale } from './plurals';
import type { Message } from './types';
import { translate } from './translate';
import { en, type MessageKey } from './locales/en/index';
import { fr } from './locales/fr/index';
import { ro } from './locales/ro/index';
import { es } from './locales/es/index';
import * as fmt from './format';

export type { Locale } from './plurals';
export type { MessageKey } from './locales/en/index';
export { translate } from './translate';

const CATALOGUES: Record<Locale, Partial<Record<MessageKey, Message>>> = { en, fr, ro, es };

export const LOCALES: Array<{ code: Locale; label: string; english: string }> = [
  // Each language is named IN that language. A person looking for their own
  // language scans for the word they would use for it, not for its English name.
  { code: 'en', label: 'English', english: 'English' },
  { code: 'fr', label: 'Français', english: 'French' },
  { code: 'ro', label: 'Română', english: 'Romanian' },
  { code: 'es', label: 'Español', english: 'Spanish' },
];

const STORAGE_KEY = 'rounds.locale.v1';
const SUPPORTED = new Set<Locale>(['en', 'fr', 'ro', 'es']);

/**
 * The device's language, if ROUNDS speaks it.
 *
 * Matched on the primary subtag only: fr-CA, fr-BE and fr-FR are all French as
 * far as this app is concerned, and refusing a Canadian phone its own language
 * because the region does not match would be absurd. Falls back to English
 * rather than to the first supported language, because an unrecognised locale
 * usually means somewhere ROUNDS has no copy for and English is the safer
 * lingua franca.
 */
export function deviceLocale(): Locale {
  try {
    const localization = require('expo-localization') as typeof import('expo-localization');
    for (const tag of localization.getLocales()) {
      const primary = (tag.languageCode ?? '').toLowerCase() as Locale;
      if (SUPPORTED.has(primary)) return primary;
    }
  } catch {
    /* no expo-localization, or a runtime without it */
  }
  return 'en';
}

interface I18nValue {
  locale: Locale;
  /** True until the stored choice has been read, so nothing renders twice. */
  ready: boolean;
  /** Null means "follow the device". */
  preference: Locale | null;
  setLocale(next: Locale | null): void;
  t: TranslateFn;
  /** The formatters, already bound to the active locale. */
  fmt: BoundFormatters;
}

export interface TranslateFn {
  (key: MessageKey, vars?: Record<string, string | number>): string;
}

interface BoundFormatters {
  dayShort(at: number): string;
  dayLong(at: number): string;
  dayCompact(at: number): string;
  clock(at: number): string;
  monthYear(at: number): string;
  weekday(at: number): string;
  money(minor: number, currency: string): string;
  number(n: number, digits?: number): string;
  duration(ms: number): string;
  tag: string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<Locale | null>(null);
  const [ready, setReady] = useState(false);
  const [device] = useState<Locale>(() => deviceLocale());

  useEffect(() => {
    let alive = true;
    readJson<{ locale: Locale | null }>(STORAGE_KEY, { locale: null }).then((stored) => {
      if (!alive) return;
      if (stored.locale && SUPPORTED.has(stored.locale)) setPreference(stored.locale);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const locale = preference ?? device;

  const setLocale = useCallback((next: Locale | null) => {
    setPreference(next);
    void writeJson(STORAGE_KEY, { locale: next });
  }, []);

  const value = useMemo<I18nValue>(() => {
    const t: TranslateFn = (key, vars) => translate(locale, key as string, vars);
    return {
      locale,
      ready,
      preference,
      setLocale,
      t,
      fmt: {
        dayShort: (at) => fmt.formatDayShort(locale, at),
        dayLong: (at) => fmt.formatDayLong(locale, at),
        dayCompact: (at) => fmt.formatDayCompact(locale, at),
        clock: (at) => fmt.formatClock(locale, at),
        monthYear: (at) => fmt.formatMonthYear(locale, at),
        weekday: (at) => fmt.formatWeekday(locale, at),
        money: (minor, currency) => fmt.formatMoney(locale, minor, currency),
        number: (n, digits) => fmt.formatNumber(locale, n, digits),
        duration: (ms) => fmt.formatDuration(locale, ms),
        tag: fmt.localeTag(locale),
      },
    };
  }, [locale, ready, preference, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

/** The common case: `const t = useT();` then `t('tonight.title')`. */
export function useT(): TranslateFn {
  return useI18n().t;
}

/** Formatters bound to the active locale. */
export function useFormat(): BoundFormatters {
  return useI18n().fmt;
}
