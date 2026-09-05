import React, { useState } from 'react';
import { View, Pressable, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Avatar, StatTile, Button, Icon, Glass, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { color, radius, space } from '@/design/tokens';

/**
 * C-03 · Person profile.
 *
 * Deliberately absent: their volume, their streaks, any comparison against you.
 * A friend is not a benchmark, and a leaderboard on anything countable about
 * alcohol is both a review risk and the wrong signal.
 *
 * Block and report live here — this is the screen review will look for them on.
 */
export default function PersonProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const person = store.people.find((p) => p.id === id);
  const [menu, setMenu] = useState(false);

  if (!person) {
    return (
      <Screen title="Profile" back>
        <EmptyState title="Not available" body="This person isn't visible to you." icon="person.crop.circle" />
      </Screen>
    );
  }

  const isBlocked = store.blocked.includes(person.id);

  const confirmBlock = () => {
    const doBlock = () => {
      store.blockUser(person.id);
      setMenu(false);
      router.back();
    };
    if (Platform.OS === 'web') doBlock();
    else
      Alert.alert(
        `Block ${person.displayName}?`,
        "They won't be able to find you, see your nights, or appear anywhere in your app. They aren't told.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Block', style: 'destructive', onPress: doBlock },
        ]
      );
  };

  return (
    <Screen
      title={person.displayName}
      back
      mood="calm"
      right={{ icon: 'ellipsis', label: 'More', onPress: () => setMenu((m) => !m) }}
    >
      <Card aurora>
        <View style={{ alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
          <Avatar name={person.displayName} size={72} live={person.liveNow} />
          <View style={{ alignItems: 'center' }}>
            <Text variant="title2">{person.displayName}</Text>
            <Text variant="subheadline" tone="tertiary">@{person.username} · level {person.level}</Text>
          </View>
        </View>
      </Card>

      {menu ? (
        <Glass radius={radius.card}>
          <View style={{ padding: space.sm }}>
            <MenuItem
              label={person.status === 'friend' ? 'Remove friend' : 'Add friend'}
              icon="person.2"
              onPress={() => {
                if (person.status !== 'friend') store.addFriend(person.id);
                setMenu(false);
              }}
            />
            <MenuItem label={isBlocked ? 'Unblock' : 'Block'} icon="hand.raised" destructive onPress={isBlocked ? () => { store.unblockUser(person.id); setMenu(false); } : confirmBlock} />
            <MenuItem
              label="Report"
              icon="flag"
              destructive
              onPress={() => {
                setMenu(false);
                router.push(`/report/user/${person.id}` as never);
              }}
            />
          </View>
        </Glass>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label="Nights together" value={String(person.sharedNights)} icon="moon.stars" />
        <StatTile
          label="Mutual crews"
          value={String(person.mutualCrews.length)}
          caption={person.mutualCrews.join(', ') || undefined}
          icon="person.2"
        />
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">WHAT YOU DON'T SEE HERE</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.sm }}>
          How much they drink, their streaks, or any comparison with you. ROUNDS never ranks people
          on anything countable about alcohol.
        </Text>
      </Card>

      {person.status !== 'friend' && !isBlocked ? (
        <Button title="Add friend" onPress={() => store.addFriend(person.id)} />
      ) : null}
    </Screen>
  );
}

function MenuItem({
  label,
  icon,
  onPress,
  destructive,
}: {
  label: string;
  icon: 'person.2' | 'hand.raised' | 'flag';
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.m,
        minHeight: 48,
        paddingHorizontal: space.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={18} color={destructive ? color.safety : color.label.primary} />
      <Text variant="body" color={destructive ? color.safety : color.label.primary}>{label}</Text>
    </Pressable>
  );
}
