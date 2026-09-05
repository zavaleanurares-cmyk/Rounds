/**
 * French. Informal throughout — "tu", never "vous".
 *
 * ROUNDS is for people in their twenties deciding where to go on a Friday. A
 * nightlife app that addresses them as "vous" sounds like a bank, and the
 * distance it puts between the app and the reader is exactly wrong for the two
 * moments that matter: the pace nudge and the safety check-in.
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
export const fr: Record<MessageKey, Message> = {
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
