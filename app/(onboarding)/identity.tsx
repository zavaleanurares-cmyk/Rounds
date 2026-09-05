import React, { useEffect, useState } from 'react';
import { View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, Avatar, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { color, radius, space } from '@/design/tokens';

const TAKEN = ['ana', 'admin', 'rounds', 'tudor'];

/** A-05 · Identity. Live username availability, 400ms debounce. */
export default function Identity() {
  const router = useRouter();
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
      title="Who are you?"
      subtitle="Your friends will see this. Nothing else is public."
      mood="calm"
      footer={
        <Button
          title="Continue"
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
            Skip the photo and you get a coloured monogram.
          </Text>
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">Display name</Text>
        <Field value={name} onChangeText={setName} placeholder="Rareș" autoCapitalize="words" label="Display name" />

        <Text variant="sectionHeader" tone="tertiary" style={{ marginTop: space.md }}>Username</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Text variant="body" tone="tertiary">@</Text>
          <View style={{ flex: 1 }}>
            <Field
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="rares"
              autoCapitalize="none"
              label="Username"
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
            ? 'Checking…'
            : status === 'taken'
              ? 'Someone already has that one.'
              : status === 'invalid'
                ? '3–20 characters, letters, numbers and underscores.'
                : status === 'free'
                  ? 'Yours.'
                  : 'How friends find you.'}
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
