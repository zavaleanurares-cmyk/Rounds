import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, EmptyState, StatTile } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * Y-08 · Nicotine dashboard — module-gated, off by default.
 *
 * It doubles the conceptual surface for the ~70% of people who don't smoke, so
 * it only exists once somebody has asked for it in Settings.
 */
export default function Nicotine() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { profile } = useStore();

  if (!profile?.modules.nicotine) {
    return (
      <Screen title={t('stats.nicotine')} back mood="calm">
        <EmptyState
          icon="flame"
          title={t('stats.nicotineOffTitle')}
          body={t('stats.nicotineOffBody')}
          actionLabel={t('stats.turnItOn')}
          onAction={() => router.push('/settings/modules')}
        />
      </Screen>
    );
  }

  return (
    <Screen title={t('stats.nicotine')} back mood="calm">
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label={t('stats.thisWeek')} value={f.number(0, 0)} caption={t('stats.logged')} icon="flame" />
        <StatTile label={t('stats.freeStreak')} value={f.number(0, 0)} caption={t('stats.days')} tint={color.pace.steady} icon="checkmark.shield" />
      </View>
      <Card>
        <Text variant="subheadline" tone="secondary">
          {t('stats.nicotineNote')}
        </Text>
      </Card>
      <Button title={t('stats.logNicotine')} kind="glass" onPress={() => router.push('/log')} />
    </Screen>
  );
}
