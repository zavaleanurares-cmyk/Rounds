/**
 * The English catalogue — the source of truth.
 *
 * `MessageKey` is derived from this object, so a key that does not exist here
 * is a type error at every call site. The other three locales are typed against
 * it, which makes a missing translation a compile failure rather than a string
 * that quietly falls back in front of a user.
 *
 * Split by namespace so that several people (or several agents) can add copy to
 * different parts of the app without ever touching the same file.
 */
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
import { billing } from './billing';

export const en = {
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
  ...billing,
} as const;

/** Every key in the app. Derived, never hand-maintained. */
export type MessageKey = keyof typeof en;
