import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Text, Button, Chip, useToast , DrinkGlyph } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { CATALOG } from '@/domain/catalog';
import { formatClock } from '@/domain/stats';
import { space } from '@/design/tokens';

/**
 * L-04 · Edit log. Deleting a synced row leaves a tombstone rather than
 * vanishing — same rule as T-09.
 */
export default function EditLog() {
  const router = useRouter();
  const toast = useToast();
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const store = useStore();
  const log = store.logs.find((l) => l.id === logId);
  const [drinkId, setDrinkId] = useState(log?.drinkId ?? '');
  const [price, setPrice] = useState(log?.priceMinor ? (log.priceMinor / 100).toFixed(2) : '');
  const [minutesBack, setMinutesBack] = useState(0);

  if (!log) {
    return (
      <Sheet title="Not found" onClose={() => router.back()}>
        <Text variant="subheadline" tone="secondary">That log is gone.</Text>
      </Sheet>
    );
  }

  return (
    <Sheet
      title="Edit"
      subtitle={`Logged at ${formatClock(log.at)}`}
      onClose={() => router.back()}
      footer={
        <View style={{ gap: space.m }}>
          <Button
            title="Save"
            onPress={() => {
              const drink = CATALOG.find((d) => d.id === drinkId);
              store.editLog(log.id, {
                ...(drink
                  ? {
                      drinkId: drink.id,
                      drinkName: drink.name,
                      category: drink.category,
                      volumeMl: drink.volumeMl,
                      abv: drink.abv,
                      ethanolG: drink.ethanolG,
                    }
                  : {}),
                priceMinor: price ? Math.round(parseFloat(price.replace(',', '.')) * 100) : null,
                at: log.at - minutesBack * 60000,
              });
              router.back();
            }}
          />
          <Button
            title="Delete this log"
            kind="destructive"
            icon="trash"
            onPress={() => {
              store.deleteLog(log.id);
              router.back();
              setTimeout(() => toast.show({ message: 'Log removed' }), 120);
            }}
          />
        </View>
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Text variant="sectionHeader" tone="tertiary">DRINK</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {CATALOG.map((d) => (
            <Chip key={d.id} label={d.name} glyph={<DrinkGlyph drink={d} size={18} />} compact selected={d.id === drinkId} onPress={() => setDrinkId(d.id)} />
          ))}
        </View>
        <Field label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Text variant="sectionHeader" tone="tertiary">TIME</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[0, 30, 60, 120].map((m) => (
            <Chip key={m} label={m === 0 ? 'As logged' : `−${m}m`} compact selected={minutesBack === m} onPress={() => setMinutesBack(m)} />
          ))}
        </View>
      </View>
    </Sheet>
  );
}
