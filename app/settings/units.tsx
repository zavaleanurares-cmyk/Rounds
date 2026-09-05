import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Segmented, ToggleRow, Group } from '@/ui';
import { useStore } from '@/data/store';
import { STANDARD_DRINK_G, type UnitSystem } from '@/domain/units';
import { space } from '@/design/tokens';

/** S-03 · Units & region. */
export default function Units() {
  const { profile, updateProfile, settings, updateSettings } = useStore();
  const system = profile?.unitSystem ?? 'EU';
  return (
    <Screen title="Units & region" back mood="night">
      <Card>
        <Text variant="sectionHeader" tone="tertiary">STANDARD DRINK</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label="Unit system"
            value={system}
            onChange={(v: UnitSystem) => updateProfile({ unitSystem: v })}
            options={[
              { value: 'EU', label: 'EU' },
              { value: 'UK', label: 'UK' },
              { value: 'US', label: 'US' },
            ]}
          />
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          One unit = {STANDARD_DRINK_G[system]}g of alcohol. Your history is stored in grams, so this
          changes only how numbers are shown — never what they mean.
        </Text>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">CURRENCY</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label="Currency"
            value={profile?.currency ?? 'EUR'}
            onChange={(v) => updateProfile({ currency: v })}
            options={[
              { value: 'RON', label: 'lei' },
              { value: 'EUR', label: '€' },
              { value: 'GBP', label: '£' },
              { value: 'USD', label: '$' },
            ]}
          />
        </View>
      </Card>

      <Group title="THE PACE READOUT">
        <ToggleRow
          title="Show the ‰ estimate"
          subtitle="Off by default. The pace word is the real readout — it compares you to your own usual Friday, which the number cannot."
          value={settings.showEstimate}
          onValueChange={(v) => updateSettings({ showEstimate: v })}
          last
        />
      </Group>

      <Text variant="footnote" tone="quaternary">
        Whether it is shown or not, the figure is an estimate from population averages, it is
        computed on your phone and sent nowhere, and it disappears entirely when ROUNDS is telling
        you to slow down. Never use it to decide whether to drive.
      </Text>
    </Screen>
  );
}
