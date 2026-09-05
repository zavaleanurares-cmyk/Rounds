import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Card, Text, Button, Icon, Avatar } from '@/ui';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

/**
 * C-04 · Contact match.
 *
 * Numbers are hashed on-device with a salt (`expo-crypto`) and only the hashes
 * are sent. The screen says so, because a permission prompt with no explanation
 * is how you lose the permission and the trust in one go.
 */
export default function ContactMatch() {
  const router = useRouter();
  const { people, addFriend } = useStore();
  const [granted, setGranted] = useState(false);
  const candidates = people.filter((p) => p.status === 'none');

  return (
    <Sheet title="Find friends from contacts" onClose={() => router.back()}>
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Card>
          <View style={{ flexDirection: 'row', gap: space.m }}>
            <Icon name="lock" size={20} color={color.brand.tintLight} />
            <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
              Your phone numbers are hashed on this device before anything is sent. The raw numbers
              never leave your phone, and we don't store your contact list.
            </Text>
          </View>
        </Card>

        {!granted ? (
          <Button title="Match my contacts" onPress={() => setGranted(true)} />
        ) : candidates.length === 0 ? (
          <Text variant="subheadline" tone="tertiary">Nobody in your contacts is on ROUNDS yet.</Text>
        ) : (
          candidates.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Avatar name={p.displayName} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{p.displayName}</Text>
                <Text variant="footnote" tone="tertiary">@{p.username}</Text>
              </View>
              <Button title="Add" kind="glass" compact full={false} onPress={() => addFriend(p.id)} />
            </View>
          ))
        )}
      </View>
    </Sheet>
  );
}
