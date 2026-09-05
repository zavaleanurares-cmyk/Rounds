/**
 * Romanian. Informal throughout — "tu", never "dumneavoastră".
 *
 * Two things this catalogue is careful about:
 *
 *  · Diacritics are correct and use the COMMA-BELOW forms — ș and ț (U+0219,
 *    U+021B), not the Turkish cedilla ş and ţ. The wrong pair renders as a
 *    different letter in several fonts and marks the text as machine-produced
 *    to any Romanian reader.
 *  · Counts above nineteen take "de": "20 de nopți", not "20 nopți". That is
 *    the `other` form; `few` covers 0 and 2–19. See plurals.ts.
 */
import type { MessageKey } from '../en/index';
import type { Message } from '../../types';
import { common } from './common';
import { ui } from './ui';
import { auth } from './auth';
import { onboarding } from './onboarding';
import { tonight } from './tonight';
import { log } from './log';
import { session } from './session';
import { morning } from './morning';
import { discover } from './discover';
import { social } from './social';
import { plan } from './plan';
import { live } from './live';
import { safety } from './safety';
import { stats } from './stats';
import { settings } from './settings';
import { profile } from './profile';
import { notifications } from './notifications';
import { drinks } from './drinks';

/**
 * Typed against the English catalogue: every key it defines must exist here,
 * so an untranslated string is a compile error rather than a sentence in the
 * wrong language in front of a user.
 */
export const ro: Record<MessageKey, Message> = {
  ...common,
  ...ui,
  ...auth,
  ...onboarding,
  ...tonight,
  ...log,
  ...session,
  ...morning,
  ...discover,
  ...social,
  ...plan,
  ...live,
  ...safety,
  ...stats,
  ...settings,
  ...profile,
  ...notifications,
  ...drinks,
};
