import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, EmptyState, StatTile } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

/**
 * Y-08 · Nicotine dashboard — module-gated, off by default.
 *
 * It doubles the conceptual surface for the ~70% of people who don't smoke, so
 * it only exists once somebody has asked for it in Settings.
 */
export default function Nicotine() {
  const router = useRouter();
  const { profile } = useStore();

  if (!profile?.modules.nicotine) {
    return (
      <Screen title="Nicotine" back mood="calm">
        <EmptyState
          icon="flame"
          title="This module is off"
          body="Nicotine tracking is optional and off by default. Turn it on and this becomes intake, cost and free-day streaks."
          actionLabel="Turn it on"
          onAction={() => router.push('/settings/modules')}
        />
      </Screen>
    );
  }

  return (
    <Screen title="Nicotine" back mood="calm">
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label="This week" value="0" caption="logged" icon="flame" />
        <StatTile label="Free streak" value="0" caption="days" tint={color.pace.steady} icon="checkmark.shield" />
      </View>
      <Card>
        <Text variant="subheadline" tone="secondary">
          Log a cigarette, vape or pouch from the log sheet and it appears here rather than in your
          drink history. The two are never mixed.
        </Text>
      </Card>
      <Button title="Log nicotine" kind="glass" onPress={() => router.push('/log')} />
    </Screen>
  );
}
