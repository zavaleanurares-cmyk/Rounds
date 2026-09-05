import React from 'react';
import { View, Linking } from 'react-native';
import { Aurora, Text, InlineLink } from '@/ui';
import { useT } from '@/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, geometry, space } from '@/design/tokens';

/**
 * A-12 · Underage block. A terminal state: no retry affordance, no back, no way
 * to edit the date. If it were retryable it would not be an age gate.
 */
export default function Blocked() {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      <Aurora mood="night" intensity={0.5} />
      <View
        style={{
          flex: 1,
          paddingHorizontal: geometry.screenMargin,
          paddingTop: insets.top + 80,
          gap: space.md,
        }}
      >
        <Text variant="title1">{t('onboarding.blockedTitle')}</Text>
        <Text variant="body" tone="secondary">
          {t('onboarding.blockedBody')}
        </Text>
        <View style={{ marginTop: space.lg }}>
          <InlineLink
            title={t('onboarding.blockedLink')}
            onPress={() => void Linking.openURL('https://www.who.int/health-topics/alcohol')}
          />
        </View>
      </View>
    </View>
  );
}
