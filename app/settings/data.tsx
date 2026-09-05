import React, { useState } from 'react';
import { View, Platform, Share } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Screen, Card, Text, Button, useToast } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

/**
 * S-12 · Data & account — a store blocker.
 *
 * Export is free JSON per GDPR (analysable CSV is the ROUNDS+ version). Delete
 * is type-to-confirm, 30-day grace, server-side cascade, and signs you out
 * immediately — no "contact support to delete your account".
 */
export default function DataAccount() {
  const router = useRouter();
  const toast = useToast();
  const store = useStore();
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState<'idle' | 'confirming'>('idle');

  const exportData = async () => {
    const json = store.exportData();
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(json);
      toast.show({ message: 'Your data is on the clipboard' });
    } else {
      await Share.share({ message: json.slice(0, 100000) });
    }
  };

  return (
    <Screen title="Data & account" back mood="night">
      <Card>
        <Text variant="sectionHeader" tone="tertiary">EXPORT</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
          Everything ROUNDS holds about you, as JSON. Free, always — that's what GDPR requires and
          what's right anyway.
        </Text>
        <View style={{ marginTop: space.m, gap: space.m }}>
          <Button title="Export my data" kind="glass" icon="square.and.arrow.up" onPress={() => void exportData()} />
          <Button title="Export as CSV" kind="plain" onPress={() => router.push('/paywall')} />
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">DELETE ACCOUNT</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
          You're signed out immediately. Everything is removed by a server-side cascade after a
          30-day grace period — sign back in within 30 days and nothing has been lost.
        </Text>

        {stage === 'idle' ? (
          <View style={{ marginTop: space.m }}>
            <Button title="Delete my account" kind="destructive" icon="trash" onPress={() => setStage('confirming')} />
          </View>
        ) : (
          <View style={{ marginTop: space.m, gap: space.m }}>
            <Field
              label="Type DELETE to confirm"
              value={confirm}
              onChangeText={setConfirm}
              autoCapitalize="none"
              placeholder="DELETE"
            />
            <Button
              title="Delete everything"
              kind="destructive"
              disabled={confirm.trim().toUpperCase() !== 'DELETE'}
              onPress={() => void store.deleteAccount()}
            />
            <Button title="Never mind" kind="plain" onPress={() => setStage('idle')} />
          </View>
        )}
      </Card>

      <Text variant="footnote" tone="quaternary" center>
        {store.queue.pending > 0
          ? `${store.queue.pending} logs are still waiting to sync. They'll be included.`
          : 'Everything on this device is synced.'}
      </Text>
    </Screen>
  );
}
