import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, InlineLink } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

/** S-08 · Subscription. */
export function Subscription() {
  const router = useRouter();
  const { settings, updateSettings , plus } = useStore();
  return (
    <Screen title="Subscription" back mood="night">
      <Card aurora accent={plus ? color.brand.tint : null}>
        <Text variant="sectionHeader" tone="tertiary">STATUS</Text>
        <Text variant="title2" style={{ marginTop: space.xs }}>
          {plus ? 'ROUNDS+' : 'Free'}
        </Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
          {plus
            ? 'Full history, spend breakdowns, calibration and Wrapped.'
            : 'Everything you need to use ROUNDS. Insights and history are capped at 90 days.'}
        </Text>
      </Card>

      {plus ? (
        <View style={{ gap: space.m }}>
          <Button title="Manage in the App Store" kind="glass" onPress={() => {}} />
          <Button title="Cancel ROUNDS+" kind="plain" onPress={() => updateSettings({ subscribed: false })} />
        </View>
      ) : (
        <Button title="See ROUNDS+" onPress={() => router.push('/paywall')} />
      )}

      <View style={{ alignItems: 'center' }}>
        <InlineLink title="Restore purchases" onPress={() => {}} />
      </View>

      <Text variant="footnote" tone="quaternary" center>
        Entitlements are verified server-side from StoreKit 2 and Google Play Billing. The client is
        never the source of truth for what you've paid for.
      </Text>
    </Screen>
  );
}
