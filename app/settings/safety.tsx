import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Group, NavRow, Card, Text } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/** S-07 · Safety settings. */
export default function SafetySettings() {
  const router = useRouter();
  const { safety } = useStore();
  return (
    <Screen title="Safety" back mood="safety">
      <Group>
        <NavRow
          title="Trusted contacts"
          value={`${safety.contacts.length} of 3`}
          onPress={() => router.push('/safety/contacts')}
        />
        <NavRow title="Arm a check-in" onPress={() => router.push('/safety/arm')} />
        <NavRow title="Get home safe" onPress={() => router.push('/safety')} last />
      </Group>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">HOME ADDRESS</Text>
        <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
          Stored on this device only. Used to pre-fill your ride home.
        </Text>
        <View style={{ marginTop: space.m }}>
          <Field label="" value={safety.homeAddress ?? ''} onChangeText={() => {}} placeholder="Street, city" autoCapitalize="words" />
        </View>
      </Card>

      <Card>
        <Text variant="footnote" tone="tertiary">
          Everything under Get home safe is free forever. ROUNDS will never put a subscription in
          front of it.
        </Text>
      </Card>
    </Screen>
  );
}
