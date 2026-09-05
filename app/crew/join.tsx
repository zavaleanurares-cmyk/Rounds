import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Button, Text, useToast } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/**
 * C-11 · Join crew.
 *
 * An unknown code says so rather than pretending. Inventing a crew from a code
 * nobody recognises would put a group on the user's Circle tab that does not
 * exist anywhere else, and they would only find out when nobody was in it.
 */
export default function JoinCrew() {
  const router = useRouter();
  const toast = useToast();
  const { joinCrew } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const join = () => {
    // A pasted link is accepted as readily as a bare code — people share links.
    const cleaned = code.trim().replace(/^.*\/crew\//, '').replace(/[?#].*$/, '');
    const crew = joinCrew(cleaned);
    if (!crew) {
      setError('No crew with that code. Check it with whoever sent it.');
      return;
    }
    router.replace(`/crew/${crew.slug}` as never);
    setTimeout(() => toast.show({ message: `You're in ${crew.name}` }), 160);
  };

  return (
    <Sheet
      title="Join a crew"
      onClose={() => router.back()}
      footer={<Button title="Join" disabled={code.trim().length < 3} onPress={join} />}
    >
      <View style={{ paddingBottom: space.md, gap: space.sm }}>
        <Field
          label="Crew code or link"
          value={code}
          onChangeText={(t) => {
            setCode(t);
            setError(null);
          }}
          autoCapitalize="none"
          error={error ?? undefined}
        />
        <Text variant="footnote" tone="quaternary">
          Whoever runs the crew can send you one from the crew screen.
        </Text>
      </View>
    </Sheet>
  );
}
