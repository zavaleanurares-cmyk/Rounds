import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Text, Button, Chip, useToast , DrinkGlyph } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { CATALOG } from '@/domain/catalog';
import { useT, useFormat } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * L-04 · Edit log. Deleting a synced row leaves a tombstone rather than
 * vanishing — same rule as T-09.
 */
export default function EditLog() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const toast = useToast();
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const store = useStore();
  const log = store.logs.find((l) => l.id === logId);
  const [drinkId, setDrinkId] = useState(log?.drinkId ?? '');
  const [price, setPrice] = useState(log?.priceMinor ? (log.priceMinor / 100).toFixed(2) : '');
  const [minutesBack, setMinutesBack] = useState(0);

  if (!log) {
    return (
      <Sheet title={t('log.notFoundTitle')} onClose={() => router.back()}>
        <Text variant="subheadline" tone="secondary">{t('log.notFoundBody')}</Text>
      </Sheet>
    );
  }

  return (
    <Sheet
      title={t('log.editTitle')}
      subtitle={t('log.loggedAt', { time: f.clock(log.at) })}
      onClose={() => router.back()}
      footer={
        <View style={{ gap: space.m }}>
          <Button
            title={t('ui.save')}
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
            title={t('log.deleteLog')}
            kind="destructive"
            icon="trash"
            onPress={() => {
              store.deleteLog(log.id);
              router.back();
              setTimeout(() => toast.show({ message: t('log.logRemoved') }), 120);
            }}
          />
        </View>
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Text variant="sectionHeader" tone="tertiary">{t('log.drinkSection')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {CATALOG.map((d) => (
            <Chip key={d.id} label={d.name} glyph={<DrinkGlyph drink={d} size={18} />} compact selected={d.id === drinkId} onPress={() => setDrinkId(d.id)} />
          ))}
        </View>
        <Field label={t('log.priceLabel')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Text variant="sectionHeader" tone="tertiary">{t('log.timeSection')}</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[0, 30, 60, 120].map((m) => (
            <Chip
              key={m}
              label={m === 0 ? t('log.asLogged') : t('log.minusMinutes', { count: m })}
              compact
              selected={minutesBack === m}
              onPress={() => setMinutesBack(m)}
            />
          ))}
        </View>
      </View>
    </Sheet>
  );
}
