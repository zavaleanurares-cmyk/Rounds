import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Segmented, useToast } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { ethanolGrams, formatUnits } from '@/domain/units';
import type { DrinkCategory } from '@/domain/types';
import { CUSTOM_ART } from '@/domain/art';
import { useT, useFormat, useI18n } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * L-02 · Custom drink.
 *
 * Computes ethanol client-side and shows it as "≈ 1.4 units" so the user can
 * sanity-check what they typed before it becomes a number in their history.
 */
export default function CustomDrink() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { locale } = useI18n();
  const toast = useToast();
  const store = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DrinkCategory>('beer');
  const [volume, setVolume] = useState('330');
  const [abv, setAbv] = useState('5');
  const [price, setPrice] = useState('');

  const grams = useMemo(
    () => ethanolGrams(parseFloat(volume) || 0, parseFloat(abv) || 0),
    [volume, abv]
  );
  const ok = name.trim().length > 0 && grams >= 0;

  return (
    <Sheet
      title={t('log.somethingElse')}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('log.logIt')}
          disabled={!ok}
          onPress={() => {
            store.addLog({
              drink: {
                id: `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
                name: name.trim(),
                category,
                volumeMl: parseFloat(volume) || 0,
                abv: parseFloat(abv) || 0,
                ethanolG: grams,
                art: CUSTOM_ART[category],
              },
              priceMinor: price ? Math.round(parseFloat(price.replace(',', '.')) * 100) : null,
            });
            router.back();
            setTimeout(
              () =>
                toast.show({
                  message: t('log.drinkLogged', { drink: name }),
                  actionLabel: t('ui.undo'),
                  onAction: () => store.undoLast(),
                }),
              120
            );
          }}
        />
      }
    >
      <View style={{ gap: space.m, paddingBottom: space.md }}>
        <Field
          label={t('log.nameLabel')}
          value={name}
          onChangeText={setName}
          placeholder={t('log.namePlaceholder')}
          autoCapitalize="sentences"
        />
        <Segmented
          label={t('log.categoryLabel')}
          value={category}
          onChange={setCategory}
          options={[
            { value: 'beer', label: t('log.categoryBeer') },
            { value: 'wine', label: t('log.categoryWine') },
            { value: 'spirit', label: t('log.categorySpirit') },
            { value: 'cocktail', label: t('log.categoryCocktail') },
          ]}
        />
        <View style={{ flexDirection: 'row', gap: space.m }}>
          <View style={{ flex: 1 }}>
            <Field label={t('log.volumeLabel')} value={volume} onChangeText={setVolume} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label={t('log.abvLabel')} value={abv} onChangeText={setAbv} keyboardType="decimal-pad" />
          </View>
        </View>
        <Field label={t('log.priceOptional')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Text variant="headline" tone="secondary">
          {t('log.customUnits', {
            units: formatUnits(grams, store.profile?.unitSystem ?? 'EU', locale),
            grams: f.number(grams, 1),
          })}
        </Text>
      </View>
    </Sheet>
  );
}
