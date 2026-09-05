import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, useToast } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/**
 * Developer utility. The app ships in the ZERO-DATA state on purpose — night one
 * is the state that has to be right, and it is the one that gets skipped when
 * demo data is the default.
 */
export default function DemoData() {
  const router = useRouter();
  const toast = useToast();
  const { seedDemoHistory, clearAllData, logs, sessions } = useStore();
  const [busy, setBusy] = useState(false);

  return (
    <Screen title="Demo data" back mood="night">
      <Card>
        <Text variant="subheadline" tone="secondary">
          Currently {logs.length} logs across {sessions.length} nights.
        </Text>
        <View style={{ marginTop: space.md, gap: space.m }}>
          <Button
            title="Fill with 14 weeks of history"
            loading={busy}
            onPress={async () => {
              setBusy(true);
              await seedDemoHistory();
              setBusy(false);
              toast.show({ message: 'History added' });
              router.replace('/(tabs)/you');
            }}
          />
          <Button
            title="Back to night one"
            kind="plain"
            onPress={async () => {
              await clearAllData();
              toast.show({ message: 'Cleared' });
              router.replace('/(tabs)/tonight');
            }}
          />
        </View>
      </Card>
      <Text variant="footnote" tone="quaternary" center>
        Night one is what a new user sees. Every data screen has a designed state for it.
      </Text>
    </Screen>
  );
}
