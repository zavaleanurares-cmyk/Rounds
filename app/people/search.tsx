import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Avatar, Icon, Button } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/** C-02 · Find people. Server-side rate limit surfaced in plain language. */
export default function FindPeople() {
  const router = useRouter();
  const t = useT();
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
    <Sheet title={t('social.findPeople')} onClose={() => router.back()}>
      <View style={{ gap: space.m, paddingBottom: space.md }}>
        <Field
          label={t('social.username')}
          value={q}
          onChangeText={setQ}
          placeholder={t('social.usernamePlaceholder')}
          autoCapitalize="none"
        />
        {limited ? (
          <Text variant="footnote" color={color.warning}>
            {t('social.rateLimited')}
          </Text>
        ) : null}
        {results.map((p) => (
          <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
            <Avatar name={p.displayName} size={40} live={p.liveNow} />
            <Pressable style={{ flex: 1 }} onPress={() => router.replace(`/people/${p.id}` as never)} accessibilityLabel={p.displayName}>
              <Text variant="body">{p.displayName}</Text>
              <Text variant="footnote" tone="tertiary">
                {p.mutualCrews.length
                  ? t('social.handleCrews', { username: p.username, crews: p.mutualCrews.join(', ') })
                  : t('social.handle', { username: p.username })}
              </Text>
            </Pressable>
            {p.status === 'friend' ? (
              <Icon name="checkmark" size={18} color={color.success} />
            ) : p.status === 'pending_out' ? (
              <Text variant="footnote" tone="tertiary">{t('social.requestSent')}</Text>
            ) : (
              <Button
                title={t('social.add')}
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
          <Text variant="subheadline" tone="tertiary">{t('social.noResults')}</Text>
        ) : null}
        <Button title={t('social.matchContacts')} kind="plain" icon="person.2" onPress={() => router.replace('/people/contacts')} />
      </View>
    </Sheet>
  );
}
