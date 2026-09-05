import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, Segmented, Icon, InlineLink } from '@/ui';
import { useStore } from '@/data/store';
import { BODY_FALLBACK, type Sex } from '@/domain/pace';
import { useT, useFormat } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * A-06 · Body basics. SKIPPABLE, and the skip is a first-class path — skipping
 * stores nulls and the pace model falls back to 75 kg / r = 0.615.
 */
export default function Body() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { profile, updateProfile } = useStore();
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'unspecified');
  const [weight, setWeight] = useState(profile?.weightKg ?? BODY_FALLBACK.weightKg);
  const imperial = profile?.unitSystem === 'US';
  const shown = imperial ? Math.round(weight * 2.2046) : weight;

  return (
    <Screen
      title={t('onboarding.bodyTitle')}
      subtitle={t('onboarding.bodySubtitle')}
      mood="calm"
      footer={
        <View style={{ gap: space.m }}>
          <Button
            title={t('onboarding.continue')}
            onPress={() => {
              updateProfile({ sex, weightKg: weight });
              router.push('/(onboarding)/intent');
            }}
          />
          <View style={{ alignItems: 'center' }}>
            <InlineLink
              title={t('onboarding.skipThis')}
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
        <Text variant="sectionHeader" tone="tertiary">{t('onboarding.sex')}</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label={t('onboarding.sex')}
            value={sex}
            onChange={setSex}
            options={[
              { value: 'female', label: t('onboarding.sexFemale') },
              { value: 'male', label: t('onboarding.sexMale') },
              { value: 'unspecified', label: t('onboarding.sexUnspecified') },
            ]}
          />
        </View>

        <Text variant="sectionHeader" tone="tertiary" style={{ marginTop: space.lg }}>{t('onboarding.weight')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.m }}>
          <Stepper icon="minus" onPress={() => setWeight((w) => Math.max(35, w - 1))} label={t('onboarding.decreaseWeight')} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="numericLarge">{f.number(shown)}</Text>
            <Text variant="footnote" tone="tertiary">
              {imperial ? t('onboarding.weightUnitLb') : t('onboarding.weightUnitKg')}
            </Text>
          </View>
          <Stepper icon="plus" onPress={() => setWeight((w) => Math.min(220, w + 1))} label={t('onboarding.increaseWeight')} />
        </View>
      </Card>

      <Text variant="footnote" tone="tertiary" center style={{ paddingHorizontal: space.md }}>
        {t('onboarding.bodyNote')}
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
