import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Button, Text, useToast } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/**
 * D-04 · Add venue. P2, and deliberately plain: user-created venues produce
 * garbage data, so this exists only as the escape hatch when the provider misses
 * a real place.
 */
export default function AddVenue() {
  const router = useRouter();
  const toast = useToast();
  const { addVenue } = useStore();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  return (
    <Sheet
      title="Add a place"
      onClose={() => router.back()}
      footer={
        <Button
          title="Add it"
          disabled={name.trim().length < 2}
          onPress={() => {
            const venue = addVenue({ name, area, category: null });
            router.replace(`/venue/${venue.id}` as never);
            setTimeout(() => toast.show({ message: `${venue.name} added` }), 160);
          }}
        />
      }
    >
      <View style={{ gap: space.m, paddingBottom: space.md }}>
        <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label="Area" value={area} onChangeText={setArea} autoCapitalize="words" />
        <Text variant="footnote" tone="quaternary">
          Places you add are only visible to you until enough people log there.
        </Text>
      </View>
    </Sheet>
  );
}
