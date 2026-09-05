import type { PluralCategory } from './plurals';

/**
 * A countable message. Which forms are required depends on the locale — see
 * `REQUIRED_FORMS` in plurals.ts, and the test that enforces it.
 */
export type PluralMessage = Partial<Record<PluralCategory, string>> & { other: string };

export type Message = string | PluralMessage;

export const isPlural = (m: Message): m is PluralMessage => typeof m !== 'string';
