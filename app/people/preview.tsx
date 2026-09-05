import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Avatar, StatTile } from '@/ui';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';
import { plural } from '@/domain/stats';

/**
 * Y-02 · Public profile preview — "this is what friends see".
 *
 * Worth its own screen because the answer is reassuring and non-obvious: almost
 * nothing. Showing people that is cheaper than explaining it in a privacy
 * policy nobody reads.
 */
export default function ProfilePreview() {
  const { profile, sessions, people } = useStore();
  const shared = people.filter((p) => p.status === 'friend').length;

  return (
    <Screen title="What friends see" subtitle="Your profile, from the other side." back mood="calm">
      <Card aurora>
        <View style={{ alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
          <Avatar name={profile?.displayName || 'You'} size={72} />
          <View style={{ alignItems: 'center' }}>
            <Text variant="title2">{profile?.displayName || 'You'}</Text>
            <Text variant="subheadline" tone="tertiary">
              @{profile?.username || 'you'} · level {profile?.level ?? 1}
            </Text>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label="Nights together" value="—" caption="per person" icon="moon.stars" />
        <StatTile label="Mutual crews" value={String(shared > 0 ? 1 : 0)} icon="person.2" />
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">WHAT THEY CANNOT SEE</Text>
        <View style={{ marginTop: space.m, gap: space.sm }}>
          {[
            'How much you drink, ever',
            'Your pace, your estimate, your pace curve',
            'Your spend, your goals, your streaks',
            `Any of your ${plural(sessions.length, 'night')} unless they were there or you shared it`,
            'Your body basics, your date of birth, your location',
          ].map((line) => (
            <Text key={line} variant="subheadline" tone="secondary">· {line}</Text>
          ))}
        </View>
      </Card>

      <Text variant="footnote" tone="quaternary" center>
        A friend is not a benchmark. There is nothing here to compare.
      </Text>
    </Screen>
  );
}
