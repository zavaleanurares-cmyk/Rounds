import type { Locale } from './plurals';

/**
 * Locale-aware formatting.
 *
 * Everything here takes a locale rather than reading a global, so the same
 * function can render a share card in the viewer's language and the store
 * screenshots in three at once.
 *
 * `Intl` is used where it exists and every function degrades to something
 * readable where it does not — a date is more useful slightly wrong than
 * missing, and a crash inside a formatter takes down the screen around it.
 */

/** The full BCP-47 tag. Romanian dates without the region read oddly. */
const TAG: Record<Locale, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  ro: 'ro-RO',
  es: 'es-ES',
};

export const localeTag = (l: Locale) => TAG[l];

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** "Fri 5 Sep" — the form used on night rows. */
export function formatDayShort(locale: Locale, at: number): string {
  return safe(
    () =>
      new Date(at).toLocaleDateString(TAG[locale], {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
    new Date(at).toDateString()
  );
}

/** "5 September" — headings. */
export function formatDayLong(locale: Locale, at: number): string {
  return safe(
    () => new Date(at).toLocaleDateString(TAG[locale], { day: 'numeric', month: 'long' }),
    new Date(at).toDateString()
  );
}

/** "5 Sep" — compact, for a row that already says which year. */
export function formatDayCompact(locale: Locale, at: number): string {
  return safe(
    () => new Date(at).toLocaleDateString(TAG[locale], { day: 'numeric', month: 'short' }),
    new Date(at).toDateString()
  );
}

/**
 * "23:14" everywhere. All four locales use a 24-hour clock by default, and a
 * nightlife app has a specific reason to want one: "1:30" is ambiguous at the
 * exact hour the app is most used.
 */
export function formatClock(locale: Locale, at: number): string {
  return safe(
    () =>
      new Date(at).toLocaleTimeString(TAG[locale], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    new Date(at).toISOString().slice(11, 16)
  );
}

/** Month and year, for the nights list and Wrapped. */
export function formatMonthYear(locale: Locale, at: number): string {
  return safe(
    () => new Date(at).toLocaleDateString(TAG[locale], { month: 'long', year: 'numeric' }),
    String(new Date(at).getFullYear())
  );
}

/** The weekday alone, capitalised the way each language capitalises it. */
export function formatWeekday(locale: Locale, at: number): string {
  return safe(() => new Date(at).toLocaleDateString(TAG[locale], { weekday: 'long' }), '');
}

/** "Fri", "ven.", "vin.", "vie" — for a chip or a column header. */
export function formatWeekdayShort(locale: Locale, at: number): string {
  return safe(() => new Date(at).toLocaleDateString(TAG[locale], { weekday: 'short' }), '');
}

/** "Saturday 5 September" — a night's own heading. */
export function formatDayFull(locale: Locale, at: number): string {
  return safe(
    () =>
      new Date(at).toLocaleDateString(TAG[locale], {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    new Date(at).toDateString()
  );
}

/**
 * Money.
 *
 * Amounts are stored in minor units. Romanian leu is written "35 lei" after the
 * number, and `Intl` renders RON as "RON 35,00" or "35,00 RON" depending on
 * locale — neither is what a person in Bucharest reads on a receipt, so lei is
 * special-cased. Everything else goes through `Intl`.
 */
export function formatMoney(locale: Locale, minor: number, currency: string): string {
  const major = minor / 100;
  if (currency === 'RON') {
    const n = safe(
      () => new Intl.NumberFormat(TAG[locale], { maximumFractionDigits: 0 }).format(Math.round(major)),
      String(Math.round(major))
    );
    return `${n} lei`;
  }
  return safe(
    () =>
      new Intl.NumberFormat(TAG[locale], {
        style: 'currency',
        currency,
        maximumFractionDigits: major % 1 === 0 ? 0 : 2,
      }).format(major),
    `${Math.round(major)} ${currency}`
  );
}

/** A plain number with the locale's own group and decimal separators. */
export function formatNumber(locale: Locale, n: number, digits = 0): string {
  return safe(
    () =>
      new Intl.NumberFormat(TAG[locale], {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(n),
    n.toFixed(digits)
  );
}

/**
 * A duration, as "3h 20m".
 *
 * The unit letters differ: French and Spanish use h/min, Romanian uses h/min
 * too, and English uses h/m. Rendered from parts rather than through `Intl`
 * because `Intl.DurationFormat` is not on any of the runtimes ROUNDS targets.
 */
export function formatDuration(locale: Locale, ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const minute = locale === 'en' ? 'm' : 'min';
  if (h === 0) return `${m}${minute}`;
  if (m === 0) return `${h}h`;
  // Not zero-padded: "2h 5m", the way a person says it, not "2h 05m".
  return `${h}h ${m}${minute}`;
}
