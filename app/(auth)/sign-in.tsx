import React, { useState } from 'react';
import { View, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Text, Button, Card, useToast } from '@/ui';
import { useStore } from '@/data/store';
import {
  appleAvailable, createAccountWithPassword, emailSignInReason, MIN_PASSWORD,
  signInWithApple, signInWithGoogle, signInWithGoogleRedirect, signInWithPassword,
  providerRedirectSupported, useGoogleAuthRequest,
} from '@/services/auth';
import { track } from '@/services/analytics';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * A-02 · Sign in.
 *
 * Passwords are dropped entirely: Apple on iOS (required by review once any
 * third-party sign-in exists), Google where it is configured, email OTP
 * everywhere as the always-available path.
 *
 * A provider button is only shown when it can actually complete. A button that
 * opens nothing is worse than no button — the previous version flipped a local
 * flag and navigated, which looked like success and left the person with no
 * account at all.
 */
export default function SignIn() {
  const router = useRouter();
  const toast = useToast();
  const t = useT();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { signInWithEmail, signInWithProvider } = useStore();
  const google = useGoogleAuthRequest();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  /** Codes by default; a password is opt-in, per screen, and never remembered. */
  const [authMode, setAuthMode] = useState<'code' | 'password'>('code');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'email' | 'apple' | 'google' | 'password' | null>(null);

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const submit = async () => {
    if (!valid) {
      setError(t('auth.invalidEmail'));
      return;
    }
    setBusy('email');
    setError(null);
    try {
      await signInWithEmail(email.trim());
      router.push('/(auth)/verify');
    } catch (err: unknown) {
      // Not every failure here is a rate limit, and for a long time every one
      // of them said it was. Keep the error in development — this path has
      // twice now been the only place a real server fault surfaced, and twice
      // it surfaced as the wrong sentence.
      if (__DEV__) console.warn('[auth] email sign-in failed', err);
      setError(t(emailSignInReason(err)));
    } finally {
      setBusy(null);
    }
  };

  /**
   * Sign in, or create the account, with a password.
   *
   * Two explicit buttons rather than one that guesses. GoTrue cannot tell a
   * wrong password from an address with no account — on purpose, so nobody can
   * enumerate who has one — so a single button would have to choose which of
   * those to do on the person's behalf, and would sometimes create an account
   * for somebody who simply mistyped.
   */
  const withPassword = async (intent: 'signIn' | 'create') => {
    if (!valid) {
      setError(t('auth.invalidEmail'));
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    setBusy('password');
    setError(null);
    const result =
      intent === 'create'
        ? await createAccountWithPassword(email.trim(), password)
        : await signInWithPassword(email.trim(), password);
    setBusy(null);
    if (!result.ok) {
      setError(result.reason ? t(result.reason) : t('auth.providerFailed'));
      return;
    }
    await signInWithProvider(result);
  };

  const provider = async (which: 'apple' | 'google') => {
    setBusy(which);
    track('onboarding_step', { step: `signin_${which}` });
    const result =
      which === 'apple'
        ? await signInWithApple()
        // On the web this navigates away and never resolves to a session here;
        // the redirect brings one back and the store adopts it on load.
        : providerRedirectSupported()
          ? await signInWithGoogleRedirect()
          : await signInWithGoogle(google.promptAsync, google.nonce);
    setBusy(null);

    // A dismissed sheet is not an error. Say nothing.
    if (result.cancelled) return;
    if (!result.ok) {
      toast.show({ message: result.reason ? t(result.reason) : t('auth.providerFailed') });
      return;
    }
    await signInWithProvider(result);
  };

  return (
    <Screen title={mode === 'signin' ? t('auth.welcomeBack') : t('auth.signIn')} back mood="calm">
      {appleAvailable() || google.ready ? (
        <Card aurora>
          <View style={{ gap: space.m }}>
            {appleAvailable() ? (
              <Button
                title={t('auth.continueWithApple')}
                kind="glass"
                icon="person.crop.circle"
                loading={busy === 'apple'}
                onPress={() => void provider('apple')}
              />
            ) : null}
            {google.ready || providerRedirectSupported() ? (
              <Button
                title={t('auth.continueWithGoogle')}
                kind="glass"
                icon="person.crop.circle"
                loading={busy === 'google'}
                onPress={() => void provider('google')}
              />
            ) : null}
          </View>
        </Card>
      ) : null}

      {appleAvailable() || google.ready ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, marginVertical: space.sm }}>
          <View style={{ flex: 1, height: 1, backgroundColor: color.separator }} />
          <Text variant="footnote" tone="tertiary">{t('auth.or')}</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: color.separator }} />
        </View>
      ) : null}

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('auth.email')}</Text>
        <TextInput
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            setError(null);
          }}
          placeholder="you@example.com"
          placeholderTextColor={color.label.quaternary}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
          accessibilityLabel={t('auth.emailLabel')}
          style={{
            marginTop: space.sm,
            height: 50,
            borderRadius: radius.control,
            backgroundColor: color.surface.secondary,
            borderWidth: 1,
            borderColor: error ? color.safety : color.separator,
            paddingHorizontal: space.md,
            color: color.label.primary,
            fontSize: 17,
          }}
          onSubmitEditing={submit}
          returnKeyType="go"
        />
        {error ? (
          <Text variant="footnote" color={color.safety} style={{ marginTop: space.sm }}>{error}</Text>
        ) : null}
        {authMode === 'password' ? (
          <TextInput
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError(null);
            }}
            placeholder={t('auth.passwordHint')}
            placeholderTextColor={color.label.quaternary}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            accessibilityLabel={t('auth.passwordLabel')}
            style={{
              marginTop: space.sm,
              height: 50,
              borderRadius: radius.control,
              backgroundColor: color.surface.secondary,
              borderWidth: 1,
              borderColor: error ? color.safety : color.separator,
              paddingHorizontal: space.md,
              color: color.label.primary,
              fontSize: 17,
            }}
            onSubmitEditing={() => void withPassword('signIn')}
            returnKeyType="go"
          />
        ) : null}

        <View style={{ marginTop: space.md, gap: space.m }}>
          {authMode === 'code' ? (
            <Button title={t('auth.sendMeACode')} onPress={submit} loading={busy === 'email'} disabled={!valid} />
          ) : (
            <>
              <Button
                title={t('auth.signIn')}
                onPress={() => void withPassword('signIn')}
                loading={busy === 'password'}
                disabled={!valid || password.length < MIN_PASSWORD}
              />
              <Button
                title={t('auth.createAccount')}
                kind="glass"
                onPress={() => void withPassword('create')}
                disabled={!valid || password.length < MIN_PASSWORD}
              />
            </>
          )}
          <Button
            title={authMode === 'code' ? t('auth.usePassword') : t('auth.useCodeInstead')}
            kind="plain"
            compact
            onPress={() => {
              setAuthMode(authMode === 'code' ? 'password' : 'code');
              setPassword('');
              setError(null);
            }}
          />
        </View>
      </Card>

      {!appleAvailable() && !google.ready && Platform.OS !== 'web' ? (
        <Text variant="footnote" tone="quaternary" center>
          {t('auth.providersUnconfigured')}
        </Text>
      ) : null}

      <Text variant="footnote" tone="quaternary" center>
        {t('auth.terms')}
      </Text>
    </Screen>
  );
}
