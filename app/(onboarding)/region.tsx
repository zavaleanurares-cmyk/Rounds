import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, Segmented } from '@/ui';
import { useStore } from '@/data/store';
import { STANDARD_DRINK_G, type UnitSystem } from '@/domain/units';
import { space } from '@/design/tokens';

/** A-07 · Region & units. Sets the standard-drink definition everything converts to. */
export default function Region() {
  const router = useRouter();
  const { profile, updateProfile } = useStore();
  const [system, setSystem] = useState<UnitSystem>(profile?.unitSystem ?? 'EU');
  const [currency, setCurrency] = useState(profile?.currency ?? 'EUR');

  return (
    <Screen
      title="Where are you drinking?"
      subtitle="A 'unit' means different things in different places. Pick yours."
      mood="calm"
      footer={
        <Button
          title="Continue"
          onPress={() => {
            updateProfile({ unitSystem: system, currency, region: system === 'US' ? 'US' : system === 'UK' ? 'UK' : 'RO' });
            router.push('/(onboarding)/body');
          }}
        />
      }
    >
      <Card aurora>
        <Text variant="sectionHeader" tone="tertiary">Standard drink</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label="Unit system"
            value={system}
            onChange={setSystem}
            options={[
              { value: 'EU', label: 'EU' },
              { value: 'UK', label: 'UK' },
              { value: 'US', label: 'US' },
            ]}
          />
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          One {system === 'US' ? 'drink' : 'unit'} = {STANDARD_DRINK_G[system]}g of alcohol. Everything
          you log is stored in grams and converted here, so changing this later never rewrites your
          history.
        </Text>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">Currency</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: 'RON', label: 'lei' },
              { value: 'EUR', label: '€' },
              { value: 'GBP', label: '£' },
              { value: 'USD', label: '$' },
            ]}
          />
        </View>
        <Text variant="footnote" tone="tertiary" style={{ marginTop: space.m }}>
          Spend is the number people actually moderate for. It's optional on every log.
        </Text>
      </Card>
    </Screen>
  );
}
