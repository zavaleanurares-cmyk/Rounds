import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Chip, Segmented, ToggleRow } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import type { Visibility } from '@/domain/types';
import { space } from '@/design/tokens';

/** T-06 · Start night sheet. */
export default function StartNight() {
  const router = useRouter();
  const { startSession, venues, profile, crews } = useStore();
  const [title, setTitle] = useState('');
  const [venueId, setVenueId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>(profile?.defaultVisibility ?? 'friends');
  const [invite, setInvite] = useState(true);

  return (
    <Sheet
      title="Start the night"
      onClose={() => router.back()}
      footer={
        <Button
          title="Start"
          onPress={() => {
            startSession({ title: title.trim() || null, venueId, visibility });
            router.replace('/(tabs)/tonight');
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Field label="Name it (optional)" value={title} onChangeText={setTitle} placeholder="Friday, properly" autoCapitalize="sentences" />

        <Text variant="sectionHeader" tone="tertiary">STARTING AT</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {venues.slice(0, 6).map((v) => (
            <Chip key={v.id} label={v.name} compact selected={venueId === v.id} onPress={() => setVenueId(v.id)} />
          ))}
          <Chip label="Search…" compact onPress={() => router.push('/venue/search')} />
        </View>

        <Text variant="sectionHeader" tone="tertiary">WHO CAN SEE IT</Text>
        <Segmented
          label="Visibility"
          value={visibility}
          onChange={setVisibility}
          options={[
            { value: 'private', label: 'Private' },
            { value: 'friends', label: 'Friends' },
            { value: 'crew', label: 'Crew' },
            { value: 'link', label: 'Link' },
          ]}
        />
        <Text variant="footnote" tone="tertiary">
          {visibility === 'private'
            ? 'Nobody sees this night, and no join code is created.'
            : 'A join code is created so people can scan in. It expires when the night ends.'}
        </Text>

        {visibility !== 'private' ? (
          <ToggleRow
            title="Tell the crew"
            subtitle={crews[0] ? `${crews[0].name} gets a notification` : 'Your crews get a notification'}
            value={invite}
            onValueChange={setInvite}
            last
          />
        ) : null}
      </View>
    </Sheet>
  );
}
