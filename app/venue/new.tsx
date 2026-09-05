import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Button, Text, useToast } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * D-04 · Add venue. P2, and deliberately plain: user-created venues produce
 * garbage data, so this exists only as the escape hatch when the provider misses
 * a real place.
 */
export default function AddVenue() {
  const router = useRouter();
  const toast = useToast();
  const t = useT();
  const { addVenue } = useStore();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  return (
    <Sheet
      title={t('discover.addPlaceTitle')}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('discover.addIt')}
          disabled={name.trim().length < 2}
          onPress={() => {
            const venue = addVenue({ name, area, category: null });
            router.replace(`/venue/${venue.id}` as never);
            setTimeout(() => toast.show({ message: t('discover.venueAdded', { name: venue.name }) }), 160);
          }}
        />
      }
    >
      <View style={{ gap: space.m, paddingBottom: space.md }}>
        <Field label={t('discover.venueName')} value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label={t('discover.venueArea')} value={area} onChangeText={setArea} autoCapitalize="words" />
        <Text variant="footnote" tone="quaternary">
          {t('discover.addPlaceNote')}
        </Text>
      </View>
    </Sheet>
  );
}
