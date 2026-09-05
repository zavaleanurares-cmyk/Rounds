import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Chip } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import { space } from '@/design/tokens';

/** D-07 · Create plan. */
export default function NewPlan() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
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
      title={t('plan.newTitle')}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('plan.createIt')}
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
        <Field
          label={t('plan.whatLabel')}
          value={title}
          onChangeText={setTitle}
          placeholder={t('plan.whatPlaceholder')}
          autoCapitalize="sentences"
        />

        <Text variant="sectionHeader" tone="tertiary">{t('plan.when')}</Text>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4, 5, 6].map((d) => {
            const day = new Date();
            day.setDate(day.getDate() + d);
            return (
              <Chip
                key={d}
                label={d === 0 ? t('plan.tonight') : f.weekdayShort(day.getTime())}
                compact
                selected={dayOffset === d}
                onPress={() => setDayOffset(d)}
              />
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[19, 20, 21, 22, 23].map((h) => {
            const at = new Date(start);
            at.setHours(h, 0, 0, 0);
            return <Chip key={h} label={f.clock(at.getTime())} compact selected={hour === h} onPress={() => setHour(h)} />;
          })}
        </View>

        <Text variant="sectionHeader" tone="tertiary">{t('plan.whereVote')}</Text>
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

        <Text variant="sectionHeader" tone="tertiary">{t('plan.who')}</Text>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          {friends.map((friend) => (
            <Chip
              key={friend.id}
              label={friend.displayName}
              compact
              selected={inviteeIds.includes(friend.id)}
              onPress={() => setInviteeIds((s) => (s.includes(friend.id) ? s.filter((x) => x !== friend.id) : [...s, friend.id]))}
            />
          ))}
          {friends.length === 0 ? (
            <Text variant="subheadline" tone="tertiary">{t('plan.noFriends')}</Text>
          ) : null}
        </View>
      </View>
    </Sheet>
  );
}
