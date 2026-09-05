import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Text, Button } from '@/ui';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * The Wrapped upsell slide.
 *
 * It lives in the billing feature rather than in the Wrapped screen so that
 * every string carrying a tier name sits behind one directory. It navigates
 * itself for the same reason: the route to the paywall should not appear in a
 * screen that is otherwise nothing to do with billing.
 *
 * While `BILLING_VISIBLE` is false nothing renders this — `locked` cannot be
 * true, because `plus` is hard true.
 */
export function UpgradeSlide() {
  const router = useRouter();
  const t = useT();
  return (
    <Card aurora>
      <Text variant="title2">{t('billing.upgradeTitle')}</Text>
      <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
        {t('billing.upgradeBody')}
      </Text>
      <View style={{ marginTop: space.md }}>
        <Button title={t('billing.seeItAll')} onPress={() => router.push('/paywall')} />
      </View>
    </Card>
  );
}
