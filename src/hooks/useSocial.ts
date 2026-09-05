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
 * made about each screen, and a new social screen that nobody adds here should
 * be caught by the test that walks the routes, not silently allowed through by
 * a prefix that happened not to match.
 */
export const SOCIAL_ROUTE_PREFIXES = [
  '/people',
  '/crew',
  '/plan',
  '/live',
  '/share',
  '/notifications',
] as const;

export function isSocialRoute(pathname: string): boolean {
  return SOCIAL_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
