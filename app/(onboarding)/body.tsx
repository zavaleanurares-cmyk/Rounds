import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, Segmented, Icon, InlineLink } from '@/ui';
import { useStore } from '@/data/store';
import { BODY_FALLBACK, type Sex } from '@/domain/pace';
import { color, radius, space } from '@/design/tokens';

/**
 * A-06 · Body basics. SKIPPABLE, and the skip is a first-class path — skipping
 * stores nulls and the pace model falls back to 75 kg / r = 0.615.
 */
export default function Body() {
  const router = useRouter();
  const { profile, updateProfile } = useStore();
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'unspecified');
  const [weight, setWeight] = useState(profile?.weightKg ?? BODY_FALLBACK.weightKg);
  const imperial = profile?.unitSystem === 'US';
  const shown = imperial ? Math.round(weight * 2.2046) : weight;

  return (
    <Screen
      title="Body basics"
      subtitle="Only used on this phone, only for the pace estimate."
      mood="calm"
      footer={
        <View style={{ gap: space.m }}>
          <Button
            title="Continue"
            onPress={() => {
              updateProfile({ sex, weightKg: weight });
              router.push('/(onboarding)/intent');
            }}
          />
          <View style={{ alignItems: 'center' }}>
            <InlineLink
              title="Skip this"
              onPress={() => {
                updateProfile({ sex: null, weightKg: null });
                router.push('/(onboarding)/intent');
              }}
            />
          </View>
        </View>
      }
    >
      <Card aurora>
        <Text variant="sectionHeader" tone="tertiary">Sex</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label="Sex"
            value={sex}
            onChange={setSex}
            options={[
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
              { value: 'unspecified', label: 'Prefer not to' },
            ]}
          />
        </View>

        <Text variant="sectionHeader" tone="tertiary" style={{ marginTop: space.lg }}>Weight</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.m }}>
          <Stepper icon="minus" onPress={() => setWeight((w) => Math.max(35, w - 1))} label="Decrease weight" />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="numericLarge">{shown}</Text>
            <Text variant="footnote" tone="tertiary">{imperial ? 'lb' : 'kg'}</Text>
          </View>
          <Stepper icon="plus" onPress={() => setWeight((w) => Math.min(220, w + 1))} label="Increase weight" />
        </View>
      </Card>

      <Text variant="footnote" tone="tertiary" center style={{ paddingHorizontal: space.md }}>
        Your pace ring gets a lot more accurate with this. You can add it any time.
      </Text>
    </Screen>
  );
}

function Stepper({ icon, onPress, label }: { icon: 'plus' | 'minus'; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 52,
        height: 52,
        borderRadius: radius.control,
        backgroundColor: color.surface.secondary,
        borderWidth: 1,
        borderColor: color.separator,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={20} color={color.label.primary} />
    </Pressable>
  );
}
