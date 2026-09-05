import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, useToast } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * Developer utility. The app ships in the ZERO-DATA state on purpose — night one
 * is the state that has to be right, and it is the one that gets skipped when
 * demo data is the default.
 */
export default function DemoData() {
  const router = useRouter();
  const t = useT();
  const toast = useToast();
  const { seedDemoHistory, clearAllData, logs, sessions } = useStore();
  const [busy, setBusy] = useState(false);

  return (
    <Screen title={t('settings.demoData')} back mood="night">
      <Card>
        <Text variant="subheadline" tone="secondary">
          {t('settings.demoCurrent', {
            count: logs.length,
            nights: t('settings.demoNights', { count: sessions.length }),
          })}
        </Text>
        <View style={{ marginTop: space.md, gap: space.m }}>
          <Button
            title={t('settings.fillHistory')}
            loading={busy}
            onPress={async () => {
              setBusy(true);
              await seedDemoHistory();
              setBusy(false);
              toast.show({ message: t('settings.historyAdded') });
              router.replace('/(tabs)/you');
            }}
          />
          <Button
            title={t('settings.backToNightOne')}
            kind="plain"
            onPress={async () => {
              await clearAllData();
              toast.show({ message: t('settings.cleared') });
              router.replace('/(tabs)/tonight');
            }}
          />
        </View>
      </Card>
      <Text variant="footnote" tone="quaternary" center>
        {t('settings.nightOneNote')}
      </Text>
    </Screen>
  );
}
