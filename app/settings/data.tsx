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
 * Both exports are free and always will be — GDPR requires one of them and the
 * other costs nothing to give. Delete is type-to-confirm, 30-day grace,
 * server-side cascade, and signs you out immediately — no "contact support to
 * delete your account".
 */
export default function DataAccount() {
  const router = useRouter();
  const toast = useToast();
  const store = useStore();
  const [confirm, setConfirm] = useState('');
  const [stage, setStage] = useState<'idle' | 'confirming'>('idle');

  const deliver = async (payload: string, what: string) => {
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(payload);
      toast.show({ message: `${what} is on the clipboard` });
    } else {
      // Share has a practical payload ceiling; a very long history is truncated
      // rather than silently failing to open the sheet at all.
      await Share.share({ message: payload.slice(0, 100000) });
    }
  };

  const exportData = () => deliver(store.exportData(), 'Your data');

  /**
   * One row per log, with the night key so a spreadsheet can group by night
   * without re-implementing the 04:00 boundary. Every field is escaped, because
   * a venue called Lulu's, Bar will otherwise quietly shift every column after
   * it by one.
   */
  const exportCsv = () => {
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = [
      'id', 'night', 'consumed_at', 'drink', 'category', 'volume_ml', 'abv',
      'ethanol_g', 'price_minor', 'currency', 'venue', 'source',
    ];
    const rows = store.logs
      .filter((l) => !l.deleted)
      .sort((a, b) => a.at - b.at)
      .map((l) => [
        l.id,
        l.nightKey,
        new Date(l.at).toISOString(),
        l.drinkName,
        l.category,
        l.volumeMl,
        l.abv,
        l.ethanolG.toFixed(2),
        l.priceMinor ?? '',
        l.currency,
        store.venues.find((v) => v.id === l.venueId)?.name ?? '',
        l.source,
      ]);
    const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
    return deliver(csv, 'Your CSV');
  };

  return (
    <Screen title="Data & account" back mood="night">
      <Card>
        <Text variant="sectionHeader" tone="tertiary">EXPORT</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
          Everything ROUNDS holds about you. JSON keeps every field; CSV is one row per drink,
          ready for a spreadsheet. Both free, always.
        </Text>
        <View style={{ marginTop: space.m, gap: space.m }}>
          <Button title="Export my data" kind="glass" icon="square.and.arrow.up" onPress={() => void exportData()} />
          <Button title="Export as CSV" kind="plain" onPress={() => void exportCsv()} />
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
