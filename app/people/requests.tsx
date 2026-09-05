import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Avatar, Button, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/** C-12 · Friend requests. */
export default function Requests() {
  const { people, respondToRequest } = useStore();
  const incoming = people.filter((p) => p.status === 'pending_in');
  const sent = people.filter((p) => p.status === 'pending_out');

  return (
    <Screen title="Requests" back mood="calm">
      {incoming.length === 0 && sent.length === 0 ? (
        <EmptyState icon="person.2" title="Nothing waiting" body="Friend requests show up here, both the ones you get and the ones you send." />
      ) : null}

      {incoming.length > 0 ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">INCOMING</Text>
          {incoming.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
              <Avatar name={p.displayName} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{p.displayName}</Text>
                <Text variant="footnote" tone="tertiary">@{p.username}</Text>
              </View>
              <Button title="Accept" compact full={false} onPress={() => respondToRequest(p.id, true)} />
              <Button title="No" kind="plain" compact full={false} onPress={() => respondToRequest(p.id, false)} />
            </View>
          ))}
        </Card>
      ) : null}

      {sent.length > 0 ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">SENT</Text>
          {sent.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
              <Avatar name={p.displayName} size={34} />
              <Text variant="body" style={{ flex: 1 }}>{p.displayName}</Text>
              <Button title="Cancel" kind="plain" compact full={false} onPress={() => respondToRequest(p.id, false)} />
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
