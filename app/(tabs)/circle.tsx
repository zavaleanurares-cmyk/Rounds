import React from 'react';
import { View, Pressable, Platform, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Avatar, Icon, Button, EmptyState, NavRow, Group } from '@/ui';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';
import { plural } from '@/domain/stats';

/**
 * C-01 · Circle home. Replaces the Feed.
 *
 * Why it beats a feed: it is actionable, ephemeral, cannot be doomscrolled, and
 * contains no user-generated content — so it needs no moderation queue, which
 * removes the single biggest store-review risk in the product.
 */
export default function Circle() {
  const router = useRouter();
  const { people, crews, profile, blocked } = useStore();
  const friends = people.filter((p) => p.status === 'friend' && !blocked.includes(p.id));
  const out = friends.filter((p) => p.liveNow);
  const requests = people.filter((p) => p.status === 'pending_in');
  const nightOne = friends.length === 0 && crews.length === 0;

  return (
    <Screen
      title="Circle"
      mood="calm"
      tabBarSpace
      right={{ icon: 'bell', label: 'Notifications', onPress: () => router.push('/notifications') }}
    >
      {nightOne ? (
        <>
          <EmptyState
            icon="person.2"
            title="Nobody here yet"
            body="ROUNDS is better with the people you actually go out with. Find them by username, or match your contacts — numbers are hashed on your phone and never sent."
            actionLabel="Find people"
            onAction={() => router.push('/people/search')}
          />
          <Card>
            <Text variant="sectionHeader" tone="tertiary">YOUR CODE</Text>
            <Text variant="numericMedium" style={{ marginTop: space.sm }}>@{profile?.username ?? 'you'}</Text>
            <View style={{ marginTop: space.m }}>
              <Button
                title="Share it"
                kind="glass"
                compact
                icon="square.and.arrow.up"
                onPress={() => void Share.share({ message: `Add me on ROUNDS: @${profile?.username ?? ''}` })}
              />
            </View>
          </Card>
        </>
      ) : (
        <>
          {requests.length > 0 ? (
            <Card accent={color.brand.tint} onPress={() => router.push('/people/requests')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <Icon name="person.2" size={20} color={color.brand.tintLight} />
                <Text variant="headline" style={{ flex: 1 }}>
                  {requests.length} friend {requests.length === 1 ? 'request' : 'requests'}
                </Text>
                <Icon name="chevron.right" size={15} color={color.label.quaternary} />
              </View>
            </Card>
          ) : null}

          {out.length > 0 ? (
            <Card aurora accent={color.pace.steady}>
              <Text variant="sectionHeader" tone="tertiary">OUT RIGHT NOW</Text>
              <View style={{ marginTop: space.m, gap: space.m }}>
                {out.map((p) => (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/people/${p.id}` as never)}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.displayName}, out right now`}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}
                  >
                    <Avatar name={p.displayName} size={40} live />
                    <View style={{ flex: 1 }}>
                      <Text variant="headline">{p.displayName}</Text>
                      <Text variant="footnote" tone="tertiary">out now</Text>
                    </View>
                    <Icon name="chevron.right" size={15} color={color.label.quaternary} />
                  </Pressable>
                ))}
              </View>
            </Card>
          ) : null}

          {crews.length > 0 ? (
            <Group title="CREWS">
              {crews.map((c, i) => (
                <NavRow
                  key={c.id}
                  title={c.name}
                  icon={c.icon}
                  subtitle={plural(c.memberIds.length, 'person', 'people')}
                  onPress={() => router.push(`/crew/${c.slug}` as never)}
                  last={i === crews.length - 1}
                />
              ))}
            </Group>
          ) : (
            <Button title="Make a crew" kind="glass" icon="person.2" onPress={() => router.push('/crew/new')} />
          )}

          <Group title={`FRIENDS · ${friends.length}`}>
            {friends.map((p, i) => (
              <NavRow
                key={p.id}
                title={p.displayName}
                subtitle={p.sharedNights > 0 ? `${plural(p.sharedNights, 'night')} together` : 'no nights together yet'}
                onPress={() => router.push(`/people/${p.id}` as never)}
                last={i === friends.length - 1}
              />
            ))}
          </Group>

          <Button title="Find people" kind="glass" icon="magnifyingglass" onPress={() => router.push('/people/search')} />
        </>
      )}

      <Button title="Join a night" kind="plain" icon="qrcode.viewfinder" onPress={() => router.push('/live/join')} />
      {Platform.OS === 'web' ? null : null}
    </Screen>
  );
}
