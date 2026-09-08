import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Animated, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, InlineLink } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';
import { OTP_LENGTH as CODE_LENGTH } from '@/services/auth';


/** A-03 · OTP verify. Auto-advance, paste, 60s resend timer. */
export default function Verify() {
  const router = useRouter();
  const t = useT();
  const { verifyOtp, auth } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const shake = useRef(new Animated.Value(0)).current;
  const input = useRef<TextInput>(null);
  /**
   * Eight boxes at the old fixed 46pt overflow a 375pt screen once the gaps and
   * the card's padding are counted. The width is derived instead, so the row
   * fits whatever length the project is set to and on the narrowest phone.
   */
  const { width: screenW } = useWindowDimensions();
  const boxW = Math.max(
    30,
    Math.min(46, Math.floor((screenW - 88 - space.sm * (CODE_LENGTH - 1)) / CODE_LENGTH))
  );

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds > 0]);

  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const submit = async (value: string) => {
    const ok = await verifyOtp(value);
    if (ok) {
      router.replace('/(onboarding)/age');
    } else {
      // Wrong code shakes the field. It does NOT clear it — retyping five
      // correct digits because of one typo is the worst possible penalty here.
      setError(true);
      Animated.sequence([
        Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <Screen title={t('auth.checkYourEmail')} back mood="calm" subtitle={auth.pendingEmail ?? undefined}>
      <Card aurora>
        <Animated.View style={{ transform: [{ translateX: shake }] }}>
          <Pressable onPress={() => input.current?.focus()} accessibilityLabel={t('auth.verificationCode')}>
            <View style={{ flexDirection: 'row', gap: space.sm, justifyContent: 'center' }}>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: boxW,
                    height: 58,
                    borderRadius: radius.control,
                    backgroundColor: color.surface.secondary,
                    borderWidth: 1.5,
                    borderColor: error
                      ? color.safety
                      : i === code.length
                        ? color.brand.tint
                        : color.separator,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="title2">{code[i] ?? ''}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        </Animated.View>

        <TextInput
          ref={input}
          value={code}
          onChangeText={(t) => {
            const digits = t.replace(/\D/g, '').slice(0, CODE_LENGTH);
            setCode(digits);
            setError(false);
            if (digits.length === CODE_LENGTH) void submit(digits);
          }}
          keyboardType="number-pad"
          inputMode="numeric"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
        />

        {error ? (
          <Text variant="footnote" color={color.safety} center style={{ marginTop: space.md }}>
            {t('auth.codeWrong')}
          </Text>
        ) : null}

        <View style={{ alignItems: 'center', marginTop: space.lg }}>
          {seconds > 0 ? (
            <Text variant="footnote" tone="tertiary">{t('auth.resendIn', { count: seconds })}</Text>
          ) : (
            <InlineLink title={t('auth.sendAnotherCode')} onPress={() => setSeconds(60)} />
          )}
        </View>
      </Card>
      {/*
        A note about how the build is wired, for whoever is testing it. It has
        no business on a user's screen and none at all in a store build, so it
        is compiled out rather than merely written small.
      */}
      {__DEV__ ? (
        <Text variant="footnote" tone="quaternary" center>
          {t('auth.otpBuildNote')}
        </Text>
      ) : null}
    </Screen>
  );
}
