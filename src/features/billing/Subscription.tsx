import React, { useState } from 'react';
import { Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, InlineLink } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import * as purchases from '@/services/purchases';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/** S-08 · Subscription. */
export function Subscription() {
  const router = useRouter();
  const t = useT();
  const { settings, updateSettings , plus } = useStore();
  const [restoring, setRestoring] = useState(false);
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
          {/*
            A subscription is managed by the store that sold it — neither
            platform lets an app cancel its own. These deep links are the only
            correct destination, and both were `onPress={() => {}}`.
          */}
          <Button
            title={t('billing.manageInStore')}
            kind="glass"
            onPress={() =>
              void Linking.openURL(
                Platform.OS === 'ios'
                  ? 'https://apps.apple.com/account/subscriptions'
                  : 'https://play.google.com/store/account/subscriptions'
              )
            }
          />
          <Button title={t('billing.cancelPlus')} kind="plain" onPress={() => updateSettings({ subscribed: false })} />
        </View>
      ) : (
        <Button title={t('billing.seePlus')} onPress={() => router.push('/paywall')} />
      )}

      <View style={{ alignItems: 'center' }}>
        {/*
          Restore Purchases is a store-review requirement, and this one did
          nothing at all — `purchases.restore()` existed and was wired only into
          the paywall. Somebody who reinstalled and came here to get their
          subscription back pressed a link that was not connected.
        */}
        <InlineLink
          title={restoring ? t('ui.saving') : t('billing.restorePurchases')}
          onPress={async () => {
            if (restoring) return;
            setRestoring(true);
            const entitlement = await purchases.restore().catch(() => purchases.NO_ENTITLEMENT);
            updateSettings({ subscribed: entitlement.active });
            setRestoring(false);
          }}
        />
      </View>

      <Text variant="footnote" tone="quaternary" center>
        {t('billing.entitlementNote')}
      </Text>
    </Screen>
  );
}
