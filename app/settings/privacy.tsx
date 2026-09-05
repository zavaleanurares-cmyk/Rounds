import React from 'react';
import { Screen, Card, Group, ToggleRow, Text, Segmented } from '@/ui';
import { View } from 'react-native';
import { useStore } from '@/data/store';
import type { Visibility } from '@/domain/types';
import { space } from '@/design/tokens';

/** S-06 · Privacy. */
export default function Privacy() {
  const { profile, updateProfile, settings, updateSettings } = useStore();
  return (
    <Screen title="Privacy" back mood="night">
      <Group>
        <ToggleRow
          title="Private account"
          subtitle="Only people you've accepted can find you"
          value={profile?.privateAccount ?? false}
          onValueChange={(v) => updateProfile({ privateAccount: v })}
        />
        <ToggleRow
          title="Contact matching"
          subtitle="Hashes numbers on this device. Raw numbers never leave your phone."
          value={settings.contactMatching}
          onValueChange={(v) => updateSettings({ contactMatching: v })}
        />
        <ToggleRow
          title="Share location by default"
          subtitle="Still opt-in per night; this just pre-selects it"
          value={settings.locationSharingDefault}
          onValueChange={(v) => updateSettings({ locationSharingDefault: v })}
          last
        />
      </Group>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">DEFAULT NIGHT VISIBILITY</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label="Default visibility"
            value={profile?.defaultVisibility ?? 'friends'}
            onChange={(v: Visibility) => updateProfile({ defaultVisibility: v })}
            options={[
              { value: 'private', label: 'Private' },
              { value: 'friends', label: 'Friends' },
              { value: 'crew', label: 'Crew' },
            ]}
          />
        </View>
      </Card>

      <Card>
        <Text variant="footnote" tone="tertiary">
          Your pace estimate is computed on this phone and is never stored or sent anywhere. Location
          sharing is per night, participants only, and expires when the night ends.
        </Text>
      </Card>
    </Screen>
  );
}
