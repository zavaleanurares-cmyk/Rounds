import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

const MARKS = [
  { icon: 'moon.stars' as const, text: 'onboarding.markTonight' as const },
  { icon: 'plus' as const, text: 'onboarding.markLog' as const },
  { icon: 'checkmark.shield' as const, text: 'onboarding.markSafety' as const },
];

/** A-11 · Ready. Coach marks over the three things that are not obvious. */
export default function Done() {
  const router = useRouter();
  const t = useT();
  const { completeOnboarding } = useStore();

  return (
    <Screen
      title={t('onboarding.doneTitle')}
      subtitle={t('onboarding.doneSubtitle')}
      mood="default"
      footer={
        <Button
          title={t('onboarding.takeMeIn')}
          onPress={() => {
            completeOnboarding();
            router.replace('/(tabs)/tonight');
          }}
        />
      }
    >
      <Card aurora>
        <View style={{ gap: space.lg }}>
          {MARKS.map((m, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: 'rgba(59,130,246,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={m.icon} size={17} color={color.brand.tintLight} />
              </View>
              <Text variant="subheadline" tone="secondary" style={{ flex: 1, paddingTop: 6 }}>{t(m.text)}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
