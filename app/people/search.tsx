import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Avatar, Icon, Button } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

/** C-02 · Find people. Server-side rate limit surfaced in plain language. */
export default function FindPeople() {
  const router = useRouter();
  const { people, addFriend, blocked } = useStore();
  const [q, setQ] = useState('');
  const [sentToday, setSentToday] = useState(0);

  const results = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return [];
    return people.filter(
      (p) =>
        !blocked.includes(p.id) &&
        (p.username.includes(term) || p.displayName.toLowerCase().includes(term))
    );
  }, [people, q, blocked]);

  const limited = sentToday >= 5;

  return (
    <Sheet title="Find people" onClose={() => router.back()}>
      <View style={{ gap: space.m, paddingBottom: space.md }}>
        <Field label="Username" value={q} onChangeText={setQ} placeholder="anam" autoCapitalize="none" />
        {limited ? (
          <Text variant="footnote" color={color.warning}>
            You've sent a lot of requests today. Try again tomorrow.
          </Text>
        ) : null}
        {results.map((p) => (
          <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
            <Avatar name={p.displayName} size={40} live={p.liveNow} />
            <Pressable style={{ flex: 1 }} onPress={() => router.replace(`/people/${p.id}` as never)} accessibilityLabel={p.displayName}>
              <Text variant="body">{p.displayName}</Text>
              <Text variant="footnote" tone="tertiary">
                @{p.username}
                {p.mutualCrews.length ? ` · ${p.mutualCrews.join(', ')}` : ''}
              </Text>
            </Pressable>
            {p.status === 'friend' ? (
              <Icon name="checkmark" size={18} color={color.success} />
            ) : p.status === 'pending_out' ? (
              <Text variant="footnote" tone="tertiary">Sent</Text>
            ) : (
              <Button
                title="Add"
                kind="glass"
                compact
                full={false}
                disabled={limited}
                onPress={() => {
                  addFriend(p.id);
                  setSentToday((n) => n + 1);
                }}
              />
            )}
          </View>
        ))}
        {q.length > 1 && results.length === 0 ? (
          <Text variant="subheadline" tone="tertiary">No one with that username.</Text>
        ) : null}
        <Button title="Match my contacts" kind="plain" icon="person.2" onPress={() => router.replace('/people/contacts')} />
      </View>
    </Sheet>
  );
}
