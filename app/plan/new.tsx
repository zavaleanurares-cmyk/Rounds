import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Chip } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/** D-07 · Create plan. */
export default function NewPlan() {
  const router = useRouter();
  const { venues, people, createPlan } = useStore();
  const [title, setTitle] = useState('');
  const [dayOffset, setDayOffset] = useState(1);
  const [hour, setHour] = useState(21);
  const [venueIds, setVenueIds] = useState<string[]>([]);
  const [inviteeIds, setInviteeIds] = useState<string[]>([]);
  const friends = people.filter((p) => p.status === 'friend');

  const start = new Date();
  start.setDate(start.getDate() + dayOffset);
  start.setHours(hour, 0, 0, 0);

  return (
    <Sheet
      title="New plan"
      onClose={() => router.back()}
      footer={
        <Button
          title="Create it"
          disabled={title.trim().length < 2}
          onPress={() => {
            const plan = createPlan({
              title: title.trim(),
              startsAt: start.getTime(),
              note: null,
              venueIds,
              inviteeIds,
            });
            router.replace(`/plan/${plan.id}` as never);
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Field label="What is it" value={title} onChangeText={setTitle} placeholder="Friday, properly" autoCapitalize="sentences" />

        <Text variant="sectionHeader" tone="tertiary">WHEN</Text>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4, 5, 6].map((d) => {
            const day = new Date();
            day.setDate(day.getDate() + d);
            return (
              <Chip
                key={d}
                label={d === 0 ? 'Tonight' : day.toLocaleDateString(undefined, { weekday: 'short' })}
                compact
                selected={dayOffset === d}
                onPress={() => setDayOffset(d)}
              />
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[19, 20, 21, 22, 23].map((h) => (
            <Chip key={h} label={`${h}:00`} compact selected={hour === h} onPress={() => setHour(h)} />
          ))}
        </View>

        <Text variant="sectionHeader" tone="tertiary">WHERE · OR LET THEM VOTE</Text>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          {venues.map((v) => (
            <Chip
              key={v.id}
              label={v.name}
              compact
              selected={venueIds.includes(v.id)}
              onPress={() => setVenueIds((s) => (s.includes(v.id) ? s.filter((x) => x !== v.id) : [...s, v.id]))}
            />
          ))}
        </View>

        <Text variant="sectionHeader" tone="tertiary">WHO</Text>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          {friends.map((f) => (
            <Chip
              key={f.id}
              label={f.displayName}
              compact
              selected={inviteeIds.includes(f.id)}
              onPress={() => setInviteeIds((s) => (s.includes(f.id) ? s.filter((x) => x !== f.id) : [...s, f.id]))}
            />
          ))}
          {friends.length === 0 ? (
            <Text variant="subheadline" tone="tertiary">Add friends first, or share the link once it exists.</Text>
          ) : null}
        </View>
      </View>
    </Sheet>
  );
}
