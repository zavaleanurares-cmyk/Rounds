import { useStore } from '@/data/store';

/**
 * Is the social half of the app switched on?
 *
 * `modules.social` is a promise made in two places — Settings › Modules ("With
 * social off, ROUNDS is entirely private") and the onboarding step ("Turning
 * this off makes ROUNDS entirely private") — and for a while it was a
 * boolean that was written, synced, and read by nothing. The Circle tab stayed
 * mounted, friend requests kept arriving, crews and plans kept working, and
 * somebody who had switched it off believing they had made the app private was
 * as social as before.
 *
 * Defaults to ON for an account with no profile yet: the app is social unless
 * somebody has said otherwise, and a hook that returned `false` while the
 * profile loads would flicker the tab bar on every launch.
 */
export function useSocial(): boolean {
  const { profile } = useStore();
  return profile?.modules?.social ?? true;
}

/**
 * Every route that only exists because of other people.
 *
 * Listed rather than pattern-matched: the guard has to be a decision somebody
 * made about each screen, not something a prefix happens to match.
 *
 * `policy.test.ts` walks the actual route files and fails on a top-level route
 * group that is neither listed here nor listed there as deliberately non-social
 * — the list cannot quietly fall behind the app. That test is the reason this
 * comment can claim the list is complete; the first version of it said the same
 * thing with no test behind it, and had already missed `/(tabs)/circle`.
 */
export const SOCIAL_ROUTE_PREFIXES = [
  '/people',
  '/crew',
  '/plan',
  '/live',
  '/share',
  '/notifications',
  // The Circle tab itself. Filtering it out of the tab bar hides the button and
  // nothing else — the route stays registered, and `/(tabs)/circle` is exactly
  // the href `notify_night_started` and `ask_for_round` write into an inbox,
  // and where the report and crew screens navigate back to.
  '/(tabs)/circle',
  // The Circle tab itself. Filtering it out of the tab bar hides the button and
  // nothing else — the route stays registered, and `/(tabs)/circle` is exactly
  // the href `notify_night_started` and `ask_for_round` write into an inbox,
  // and what the report screen and the crew screen navigate back to.
] as const;

export function isSocialRoute(pathname: string): boolean {
  return SOCIAL_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
