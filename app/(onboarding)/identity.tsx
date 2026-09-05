import React, { useEffect, useState } from 'react';
import { View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, Avatar, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

const TAKEN = ['ana', 'admin', 'rounds', 'tudor'];

/** A-05 · Identity. Live username availability, 400ms debounce. */
export default function Identity() {
  const router = useRouter();
  const t = useT();
  const { profile, updateProfile } = useStore();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [status, setStatus] = useState<'idle' | 'checking' | 'free' | 'taken' | 'invalid'>('idle');

  useEffect(() => {
    if (!username) return setStatus('idle');
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return setStatus('invalid');
    setStatus('checking');
    const id = setTimeout(() => setStatus(TAKEN.includes(username) ? 'taken' : 'free'), 400);
    return () => clearTimeout(id);
  }, [username]);

  const ok = name.trim().length >= 2 && status === 'free';

  return (
    <Screen
      title={t('onboarding.identityTitle')}
      subtitle={t('onboarding.identitySubtitle')}
      mood="calm"
      footer={
        <Button
          title={t('onboarding.continue')}
          disabled={!ok}
          onPress={() => {
            updateProfile({ displayName: name.trim(), username });
            router.push('/(onboarding)/region');
          }}
        />
      }
    >
      <Card aurora>
        <View style={{ alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
          <Avatar name={name || '?'} size={72} />
          <Text variant="footnote" tone="tertiary">
            {t('onboarding.monogramNote')}
          </Text>
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('onboarding.displayName')}</Text>
        <Field value={name} onChangeText={setName} placeholder={t('onboarding.displayNamePlaceholder')} autoCapitalize="words" label={t('onboarding.displayName')} />

        <Text variant="sectionHeader" tone="tertiary" style={{ marginTop: space.md }}>{t('onboarding.username')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Text variant="body" tone="tertiary">@</Text>
          <View style={{ flex: 1 }}>
            <Field
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder={t('onboarding.usernamePlaceholder')}
              autoCapitalize="none"
              label={t('onboarding.username')}
              tint={status === 'taken' || status === 'invalid' ? color.safety : status === 'free' ? color.success : undefined}
            />
          </View>
          {status === 'free' ? <Icon name="checkmark" size={18} color={color.success} /> : null}
        </View>
        <Text
          variant="footnote"
          color={status === 'taken' || status === 'invalid' ? color.safety : color.label.tertiary}
          style={{ marginTop: space.sm }}
        >
          {status === 'checking'
            ? t('onboarding.usernameChecking')
            : status === 'taken'
              ? t('onboarding.usernameTaken')
              : status === 'invalid'
                ? t('onboarding.usernameInvalid')
                : status === 'free'
                  ? t('onboarding.usernameFree')
                  : t('onboarding.usernameHint')}
        </Text>
      </Card>
    </Screen>
  );
}

export function Field({
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
  label,
  tint,
  multiline,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  label: string;
  tint?: string;
  multiline?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={color.label.quaternary}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      accessibilityLabel={label}
      multiline={multiline}
      style={{
        marginTop: space.sm,
        minHeight: 48,
        borderRadius: radius.control,
        backgroundColor: color.surface.secondary,
        borderWidth: 1,
        borderColor: tint ?? color.separator,
        paddingHorizontal: space.md,
        paddingTop: multiline ? space.m : 0,
        color: color.label.primary,
        fontSize: 17,
      }}
    />
  );
}
