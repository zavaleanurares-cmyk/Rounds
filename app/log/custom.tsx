import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Segmented, useToast } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { ethanolGrams, formatUnits } from '@/domain/units';
import type { DrinkCategory } from '@/domain/types';
import { CUSTOM_ART } from '@/domain/art';
import { space } from '@/design/tokens';

/**
 * L-02 · Custom drink.
 *
 * Computes ethanol client-side and shows it as "≈ 1.4 units" so the user can
 * sanity-check what they typed before it becomes a number in their history.
 */
export default function CustomDrink() {
  const router = useRouter();
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
      title="Something else"
      onClose={() => router.back()}
      footer={
        <Button
          title="Log it"
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
            setTimeout(() => toast.show({ message: `${name} logged`, actionLabel: 'Undo', onAction: () => store.undoLast() }), 120);
          }}
        />
      }
    >
      <View style={{ gap: space.m, paddingBottom: space.md }}>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Cider, 0.5" autoCapitalize="sentences" />
        <Segmented
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: 'beer', label: 'Beer' },
            { value: 'wine', label: 'Wine' },
            { value: 'spirit', label: 'Spirit' },
            { value: 'cocktail', label: 'Cocktail' },
          ]}
        />
        <View style={{ flexDirection: 'row', gap: space.m }}>
          <View style={{ flex: 1 }}>
            <Field label="Volume (ml)" value={volume} onChangeText={setVolume} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="ABV (%)" value={abv} onChangeText={setAbv} keyboardType="decimal-pad" />
          </View>
        </View>
        <Field label="Price (optional)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <Text variant="headline" tone="secondary">
          {formatUnits(grams, store.profile?.unitSystem ?? 'EU')} · {grams.toFixed(1)}g of alcohol
        </Text>
      </View>
    </Sheet>
  );
}
