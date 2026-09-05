import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, InlineLink } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/** S-08 · Subscription. */
export function Subscription() {
  const router = useRouter();
  const t = useT();
  const { settings, updateSettings , plus } = useStore();
  return (
    <Screen title={t('billing.subscriptionTitle')} back mood="night">
      <Card aurora accent={plus ? color.brand.tint : null}>
        <Text variant="sectionHeader" tone="tertiary">{t('billing.statusHeader')}</Text>
        <Text variant="title2" style={{ marginTop: space.xs }}>
          {plus ? t('billing.plus') : t('billing.statusFree')}
        </Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
          {plus ? t('billing.plusBody') : t('billing.freeBody')}
        </Text>
      </Card>

      {plus ? (
        <View style={{ gap: space.m }}>
          <Button title={t('billing.manageInStore')} kind="glass" onPress={() => {}} />
          <Button title={t('billing.cancelPlus')} kind="plain" onPress={() => updateSettings({ subscribed: false })} />
        </View>
      ) : (
        <Button title={t('billing.seePlus')} onPress={() => router.push('/paywall')} />
      )}

      <View style={{ alignItems: 'center' }}>
        <InlineLink title={t('billing.restorePurchases')} onPress={() => {}} />
      </View>

      <Text variant="footnote" tone="quaternary" center>
        {t('billing.entitlementNote')}
      </Text>
    </Screen>
  );
}
