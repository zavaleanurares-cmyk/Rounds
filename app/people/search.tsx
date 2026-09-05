import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Avatar, Icon, Button, Spinner } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { searchPeople, isRemoteEnabled, type SearchHit } from '@/data/remote';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * C-02 · Find people.
 *
 * This screen used to filter the local `people` array — the friends, pending
 * requests and crew-mates this device already knew about. Typing a stranger's
 * exact handle returned "No one with that username", which was false: they were
 * there, on the server, behind an RPC nothing called. The whole Add Friend
 * flow existed and could not be started, because the only way to acquire a new
 * friend was to be added by somebody who already had you.
 *
 * So the search is now a server search, debounced, and the local list is used
 * for one thing only: knowing whether somebody in the results is already a
 * friend, already asked, or blocked. That state lives on this device and is not
 * worth a round trip.
 *
 * The old client-side cap of five is gone. It reset on every app restart, which
 * made it a suggestion rather than a limit; `request_friendship` holds the real
 * one at 25 a day, and a request the server declines comes back as a message.
 */
export default function FindPeople() {
  const router = useRouter();
  const t = useT();
  const { people, addFriend, blocked } = useStore();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [state, setState] = useState<'idle' | 'searching' | 'done' | 'offline'>('idle');

  // The result of the LAST query typed, not of whichever request happens to
  // return last. Two keystrokes in flight at once is the normal case on a
  // phone, and an out-of-order response showing results for "ma" under the
  // text "maria" is the classic version of this bug.
  const latest = useRef(0);

  useEffect(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) {
      setHits([]);
      setState('idle');
      return;
    }
    if (!isRemoteEnabled()) {
      setState('offline');
      return;
    }
    setState('searching');
    const ticket = ++latest.current;
    const timer = setTimeout(async () => {
      const found = await searchPeople(term);
      if (ticket !== latest.current) return;
      if (found === null) {
        setState('offline');
        return;
      }
      setHits(found);
      setState('done');
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  // Everything this device knows about the people who came back. A blocked
  // account is filtered server-side too; this is belt and braces, and it also
  // covers a block made offline that has not synced yet.
  const known = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const results = useMemo(() => hits.filter((h) => !blocked.includes(h.id)), [hits, blocked]);

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

        {state === 'searching' ? <Spinner /> : null}
        {state === 'offline' ? (
          <Text variant="subheadline" tone="tertiary">{t('social.searchOffline')}</Text>
        ) : null}

        {results.map((p) => {
          const local = known.get(p.id);
          const status = local?.status ?? 'none';
          return (
            <View
              key={p.id}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.sm }}
            >
              <Avatar name={p.displayName} url={p.avatarUrl} size={40} live={local?.liveNow} />
              <Pressable
                style={{ flex: 1 }}
                onPress={() => router.replace(`/people/${p.id}` as never)}
                accessibilityLabel={p.displayName}
              >
                <Text variant="body">{p.displayName}</Text>
                <Text variant="footnote" tone="tertiary">
                  {local?.mutualCrews.length
                    ? t('social.handleCrews', { username: p.username, crews: local.mutualCrews.join(', ') })
                    : t('social.handle', { username: p.username })}
                </Text>
              </Pressable>
              {status === 'friend' ? (
                <Icon name="checkmark" size={18} color={color.success} />
              ) : status === 'pending_out' ? (
                <Text variant="footnote" tone="tertiary">{t('social.requestSent')}</Text>
              ) : (
                <Button
                  title={t('social.add')}
                  kind="glass"
                  compact
                  full={false}
                  onPress={() => addFriend(p.id)}
                />
              )}
            </View>
          );
        })}

        {state === 'done' && results.length === 0 ? (
          <Text variant="subheadline" tone="tertiary">{t('social.noResults')}</Text>
        ) : null}

        <Button
          title={t('social.matchContacts')}
          kind="plain"
          icon="person.2"
          onPress={() => router.replace('/people/contacts')}
        />
      </View>
    </Sheet>
  );
}
