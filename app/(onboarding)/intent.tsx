import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Chip, Icon } from '@/ui';
import { color } from '@/design/tokens';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

const OPTIONS = [
  { id: 'track', label: 'onboarding.intentTrack' as const, icon: 'chart.bar' as const },
  { id: 'social', label: 'onboarding.intentSocial' as const, icon: 'person.2' as const },
  { id: 'easier', label: 'onboarding.intentEasier' as const, icon: 'checkmark.shield' as const },
];

/** A-08 · Intent. Drives week-one messaging and which tab gets the first coach mark. */
export default function Intent() {
  const router = useRouter();
  const t = useT();
  const { updateProfile } = useStore();
  const [picked, setPicked] = useState<string[]>([]);

  return (
    <Screen
      title={t('onboarding.intentTitle')}
      subtitle={t('onboarding.intentSubtitle')}
      mood="calm"
      footer={
        <Button
          title={t('onboarding.continue')}
          onPress={() => {
            updateProfile({ intent: picked });
            router.push('/(onboarding)/modules');
          }}
        />
      }
    >
      <Card aurora>
        <View style={{ gap: space.m }}>
          {OPTIONS.map((o) => (
            <Chip
              key={o.id}
              label={t(o.label)}
              glyph={<Icon name={o.icon} size={18} color={picked.includes(o.id) ? color.brand.tintLight : color.label.secondary} />}
              selected={picked.includes(o.id)}
              onPress={() =>
                setPicked((p) => (p.includes(o.id) ? p.filter((x) => x !== o.id) : [...p, o.id]))
              }
            />
          ))}
        </View>
      </Card>
      <Text variant="footnote" tone="quaternary" center>{t('onboarding.intentNote')}</Text>
    </Screen>
  );
}
