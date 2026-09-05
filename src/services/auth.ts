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

export function googleAvailable(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) ||
         Boolean(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
}

/**
 * Google through `expo-auth-session`, which works in Expo Go as well as in a
 * development build — the native Google SDK does not. `id_token` response type,
 * because that is what Supabase wants and it avoids handling a code exchange.
 */
export async function signInWithGoogle(
  promptAsync?: () => Promise<{ type: string; params?: Record<string, string> }>
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
    const session = await remote.signInWithIdToken('google', idToken);
    // No backend configured — the token was real, there is just nothing to
    // exchange it with. Sign in locally rather than reporting a failure.
    if (!session) return { ok: true };
    return {
      ok: true,
      userId: session.user.id,
      email: session.user.email ?? null,
      displayName: (session.user.user_metadata?.full_name as string) ?? null,
    };
  } catch {
    return { ok: false, reason: 'common.authDidNotGoThrough' };
  }
}

/**
 * The hook the sign-in screen uses to build Google's request. Kept here so the
 * screen has one import and no knowledge of AuthSession.
 */
export function useGoogleAuthRequest() {
  const Google = optional(() => require('expo-auth-session/providers/google'));
  const clientIds = {
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  };
  // The hook must be called unconditionally, so it is called with empty config
  // when nothing is set and the screen simply hides the button.
  const [request, , promptAsync] = Google
    ? Google.useIdTokenAuthRequest(clientIds)
    : [null, null, undefined];
  return { ready: Boolean(request) && googleAvailable(), promptAsync };
}
