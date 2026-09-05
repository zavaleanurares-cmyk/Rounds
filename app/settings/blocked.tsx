import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Button, Avatar, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/** S-11 · Blocked users — a store blocker for both App Store and Play. */
export default function Blocked() {
  const { blocked, people, unblockUser } = useStore();
  const list = people.filter((p) => blocked.includes(p.id));

  return (
    <Screen title="Blocked" back mood="night">
      {list.length === 0 ? (
        <EmptyState icon="hand.raised" title="Nobody blocked" body="Blocking someone from their profile removes them from search, your friends, every crew, every live night and every plan — immediately, and in both directions." />
      ) : (
        <Card>
          {list.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
              <Avatar name={p.displayName} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{p.displayName}</Text>
                <Text variant="footnote" tone="tertiary">@{p.username}</Text>
              </View>
              <Button title="Unblock" kind="glass" compact full={false} onPress={() => unblockUser(p.id)} />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
