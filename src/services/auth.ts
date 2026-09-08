/**
 * Apple and Google sign-in.
 *
 * Both return an **identity token** that goes to Supabase's `signInWithIdToken`.
 * That is the whole point: the provider proves who the person is, Supabase mints
 * the session, and the app never sees a password or handles a redirect itself.
 *
 * The previous implementation discarded the provider argument and flipped a
 * local flag. It looked like it worked — the app navigated — but no account
 * existed, so with a backend attached every subsequent write failed RLS, the
 * queue retried eight times and then dropped the row. A sign-in that silently
 * produces no session is worse than one that visibly fails.
 */
import { Platform } from 'react-native';
import { optional } from './optional';
import type { MessageKey } from '@/i18n';
import * as remote from '@/data/remote';

export type Provider = 'apple' | 'google';

export interface SignInResult {
  ok: boolean;
  /** The user cancelled the sheet. Not an error — say nothing, do nothing. */
  cancelled?: boolean;
  userId?: string;
  email?: string | null;
  displayName?: string | null;
  /**
   * Why it could not run here, when it could not — a message key, not a
   * sentence. This module has no locale and no hook; the sign-in screen has
   * both, and translates it there.
   */
  reason?: MessageKey;
}

const CANCELLED = { ok: false, cancelled: true } as const;

/* ------------------------------------------------------------------ Apple */

export function appleAvailable(): boolean {
  if (Platform.OS !== 'ios') return false;
  return Boolean(optional(() => require('expo-apple-authentication')));
}

/**
 * Apple gives the name and email ONCE, on the very first authorisation, and
 * never again. Miss it and the account is nameless forever, so it is captured
 * here and handed straight to the caller.
 */
export async function signInWithApple(): Promise<SignInResult> {
  const AppleAuth = optional(() => require('expo-apple-authentication'));
  if (!AppleAuth) return { ok: false, reason: 'common.authAppleNeedsIosBuild' };

  try {
    const available = await AppleAuth.isAvailableAsync();
    if (!available) return { ok: false, reason: 'common.authAppleUnavailable' };

    const credential = await AppleAuth.signInAsync({
      requestedScopes: [
        AppleAuth.AppleAuthenticationScope.FULL_NAME,
        AppleAuth.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { ok: false, reason: 'common.authAppleNoToken' };
    }

    const displayName = [credential.fullName?.givenName, credential.fullName?.familyName]
      .filter(Boolean)
      .join(' ') || null;

    const session = await remote.signInWithIdToken('apple', credential.identityToken);
    if (!session) {
      // No backend configured. The token was real; there is just nothing to
      // exchange it with, so sign in locally rather than pretending to fail.
      return { ok: true, userId: credential.user, email: credential.email, displayName };
    }
    return {
      ok: true,
      userId: session.user.id,
      email: session.user.email ?? credential.email,
      displayName,
    };
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return CANCELLED;
    return { ok: false, reason: 'common.authDidNotGoThrough' };
  }
}

/* ----------------------------------------------------------------- Google */

/**
 * Whether Google is configured FOR THIS PLATFORM.
 *
 * Per-platform, because the client ids are: `expo-auth-session` wants a web
 * client id on web, and having only an iOS one is not "Google is available"
 * anywhere else. Read once at module scope — env vars cannot change while the
 * process runs — which is what lets the hook below decide whether to call
 * another hook at all without ever changing hook order.
 */
/**
 * Hand the popup's result back to the window that opened it.
 *
 * `expo-auth-session`'s own docs, on the hook this file uses: "In order to
 * close the popup window on web, you need to invoke
 * `WebBrowser.maybeCompleteAuthSession()`." Nothing in this app called it.
 *
 * The consequence was the worst shape a bug can take. Google authenticated you,
 * you picked an account, the popup redirected back — and with nobody listening
 * for that redirect, `promptAsync()` resolved as `dismiss`. `signInWithGoogle`
 * maps `dismiss` to cancelled, and the screen says nothing at all when you
 * cancel, because a person who closes a sheet does not need to be told they
 * closed it. So a successful sign-in and changing your mind produced byte-for-
 * byte identical behaviour: back to the sign-in screen, no error, nothing in
 * the console.
 *
 * Module scope, and before any hook runs: the redirect is processed as the page
 * loads, so registering the handler inside a component is already too late.
 * `optional()` because expo-web-browser is a native module that a web-only
 * bundle can be missing, and a missing module must cost the Google button, not
 * the screen.
 */
optional(() => {
  const WebBrowser = require('expo-web-browser') as typeof import('expo-web-browser');
  WebBrowser.maybeCompleteAuthSession();
});

const GOOGLE_CONFIGURED: boolean = (() => {
  const web = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (Platform.OS === 'web') return Boolean(web);
  if (Platform.OS === 'ios') return Boolean(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || web);
  return Boolean(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || web);
})();

export function googleAvailable(): boolean {
  return GOOGLE_CONFIGURED;
}

/**
 * Google through `expo-auth-session`, which works in Expo Go as well as in a
 * development build — the native Google SDK does not. `id_token` response type,
 * because that is what Supabase wants and it avoids handling a code exchange.
 */
export async function signInWithGoogle(
  promptAsync?: () => Promise<{ type: string; params?: Record<string, string> }>,
  /**
   * The raw nonce the request was built with. `expo-auth-session` mints one for
   * every `id_token` request whether or not you ask, so the token always
   * carries the claim — and GoTrue refuses a token whose nonce claim has no
   * matching raw value. See `remote.signInWithIdToken`.
   */
  nonce?: string
): Promise<SignInResult> {
  if (!promptAsync) {
    return { ok: false, reason: 'common.authGoogleNotConfigured' };
  }
  try {
    const result = await promptAsync();
    if (result.type === 'dismiss' || result.type === 'cancel') return CANCELLED;
    const idToken = result.params?.id_token;
    if (result.type !== 'success' || !idToken) {
      return { ok: false, reason: 'common.authGoogleNoToken' };
    }
    const session = await remote.signInWithIdToken('google', idToken, nonce);
    // No backend configured — the token was real, there is just nothing to
    // exchange it with. Sign in locally rather than reporting a failure.
    if (!session) return { ok: true };
    return {
      ok: true,
      userId: session.user.id,
      email: session.user.email ?? null,
      displayName: (session.user.user_metadata?.full_name as string) ?? null,
    };
  } catch (err: unknown) {
    // The third failure on this path, and the first two were invisible for the
    // same reason this line used to be `catch {}`: the error was caught,
    // discarded, and reported as one generic sentence. Somebody debugging saw
    // an empty console and a toast that named no cause.
    //
    // It costs nothing to keep the error in development, and the Apple branch
    // above already reads `code` off it, so this is the pattern this file
    // already uses rather than a new one.
    if (__DEV__) console.warn('[auth] Google sign-in failed', err);
    if (popupWasBlocked(err)) return { ok: false, reason: 'common.authPopupBlocked' };
    return { ok: false, reason: 'common.authDidNotGoThrough' };
  }
}

/**
 * A blocked pop-up is the one failure here the person can actually fix, so it
 * is the one that must not be folded into "that did not go through".
 *
 * `expo-web-browser` throws exactly this code when `window.open` comes back
 * null — `ExpoWebBrowser.web.ts`, `openAuthSessionAsync`:
 *
 *     throw new CodedError('ERR_WEB_BROWSER_BLOCKED', 'Popup window was
 *     blocked by the browser or failed to open. ...')
 *
 * It throws *before* the account chooser, so nothing downstream runs: no
 * redirect, no token, no exchange. Any diagnostic further down the path —
 * anything inside `signInWithIdToken` — prints nothing at all, which is
 * precisely how this presents as "I click the button and nothing happens".
 */
function popupWasBlocked(err: unknown): boolean {
  return (err as { code?: string })?.code === 'ERR_WEB_BROWSER_BLOCKED';
}

/**
 * Web takes the redirect road; native keeps the id_token one.
 *
 * On native, `useIdTokenAuthRequest` is right: the system browser opens, there
 * is no pop-up blocker, and the token comes straight back. On the web the same
 * call depends on a pop-up surviving a browser's judgement about whether a
 * click caused it, which is not something this app can guarantee or test.
 *
 * Nothing is returned because nothing comes back — the page navigates away and
 * the session is picked up on the way in. See `remote.currentSession`.
 */
export function providerRedirectSupported(): boolean {
  return Platform.OS === 'web' && GOOGLE_CONFIGURED;
}

export async function signInWithGoogleRedirect(): Promise<SignInResult> {
  if (Platform.OS !== 'web') return { ok: false, reason: 'common.authGoogleNotConfigured' };
  try {
    // Back to the page they left, not to a hard-coded route: the sign-in screen
    // can be reached from a deep link and dumping people at "/" loses that.
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : '';
    await remote.signInWithOAuthRedirect('google', redirectTo);
    // The browser is navigating. Anything after this line is a race with it.
    return { ok: true };
  } catch (err: unknown) {
    if (__DEV__) console.warn('[auth] Google redirect failed', err);
    return { ok: false, reason: 'common.authDidNotGoThrough' };
  }
}

/**
 * The hook the sign-in screen uses to build Google's request. Kept here so the
 * screen has one import and no knowledge of AuthSession.
 */
export function useGoogleAuthRequest(): {
  ready: boolean;
  promptAsync?: () => Promise<{ type: string; params?: Record<string, string> }>;
  /** Whatever nonce the library put in the request, so the exchange can match it. */
  nonce?: string;
} {
  /**
   * Not called at all when Google is not configured for this platform.
   *
   * The previous version called `useIdTokenAuthRequest` with an empty config on
   * the reasoning that a hook must be called unconditionally — and the library
   * does not return null for that, it THROWS during render: "Client Id property
   * `webClientId` must be defined to use Google auth on this platform." So on
   * any web build without a Google client id, the sign-in screen rendered
   * nothing at all. A blank white page, on the first screen a new user ever
   * sees, and every route test passed because none of them opened it.
   *
   * Skipping the call is safe here specifically because `GOOGLE_CONFIGURED` is
   * a module-scope constant read from the environment: it cannot differ between
   * two renders of the same process, so hook order is stable. A value that
   * could change would have to be handled the other way round.
   */
  if (!GOOGLE_CONFIGURED) return { ready: false };

  const Google = optional(() => require('expo-auth-session/providers/google'));
  if (!Google) return { ready: false };

  try {
    const [request, , promptAsync] = Google.useIdTokenAuthRequest({
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    });
    return { ready: Boolean(request), promptAsync, nonce: request?.nonce };
  } catch {
    // Belt and braces: a misconfiguration must cost the Google button, never
    // the screen. Nothing about signing in with an email depends on Google.
    return { ready: false };
  }
}
