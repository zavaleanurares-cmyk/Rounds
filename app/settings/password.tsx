import React, { useEffect, useState } from 'react';
import { View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, useToast } from '@/ui';
import { changePassword, MIN_PASSWORD } from '@/services/auth';
import { hasPassword } from '@/data/remote';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * S-xx · Set or change the password.
 *
 * One screen for both, because for most of this app's users they are the same
 * act: codes are the default sign-in, so the majority of accounts have no
 * password at all and are "changing" one that was never there.
 *
 * There is deliberately no "current password" field. GoTrue does not need one —
 * holding a live session is the proof — and asking for it would lock every
 * code-only user out of ever setting one, which is precisely the group this
 * screen exists for.
 */
export default function PasswordSettings() {
  const router = useRouter();
  const t = useT();
  const toast = useToast();
  const [existing, setExisting] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void hasPassword().then(setExisting).catch(() => setExisting(null));
  }, []);

  const save = async () => {
    setBusy(true);
    setError(null);
    const result = await changePassword(password, repeat);
    setBusy(false);
    if (!result.ok) {
      setError(result.reason ? t(result.reason) : t('common.authDidNotGoThrough'));
      return;
    }
    toast.show({ message: t('settings.passwordSaved') });
    router.back();
  };

  const field = (
    value: string,
    onChange: (v: string) => void,
    label: string,
    autoComplete: 'new-password' | 'off'
  ) => (
    <TextInput
      value={value}
      onChangeText={(v) => {
        onChange(v);
        setError(null);
      }}
      placeholder={label}
      placeholderTextColor={color.label.quaternary}
      secureTextEntry
      autoCapitalize="none"
      autoComplete={autoComplete}
      accessibilityLabel={label}
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
    />
  );

  const ready = password.length >= MIN_PASSWORD && repeat.length >= MIN_PASSWORD;

  return (
    <Screen
      title={t('settings.password')}
      back
      mood="night"
      subtitle={
        existing === null
          ? undefined
          : existing
            ? t('settings.passwordSet')
            : t('settings.passwordNotSet')
      }
    >
      <Card>
        <Text variant="footnote" tone="secondary">{t('settings.passwordIntro')}</Text>

        {field(password, setPassword, t('settings.passwordNew'), 'new-password')}
        {field(repeat, setRepeat, t('settings.passwordRepeat'), 'off')}

        <Text variant="caption1" tone="quaternary" style={{ marginTop: space.sm }}>
          {t('auth.passwordHint')}
        </Text>

        {error ? (
          <Text variant="footnote" color={color.safety} style={{ marginTop: space.sm }}>
            {error}
          </Text>
        ) : null}

        <View style={{ marginTop: space.md }}>
          <Button
            title={t('settings.savePassword')}
            onPress={() => void save()}
            loading={busy}
            disabled={!ready}
          />
        </View>
      </Card>
    </Screen>
  );
}
