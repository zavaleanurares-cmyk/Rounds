import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, Segmented } from '@/ui';
import { useStore } from '@/data/store';
import { STANDARD_DRINK_G, type UnitSystem } from '@/domain/units';
import { useT, useFormat } from '@/i18n';
import { space } from '@/design/tokens';

/** A-07 · Region & units. Sets the standard-drink definition everything converts to. */
export default function Region() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { profile, updateProfile } = useStore();
  const [system, setSystem] = useState<UnitSystem>(profile?.unitSystem ?? 'EU');
  const [currency, setCurrency] = useState(profile?.currency ?? 'EUR');
  // 7.89 g in the UK, whole grams elsewhere — and the decimal separator is a
  // comma in three of the four languages.
  const grams = f.number(
    STANDARD_DRINK_G[system],
    Number.isInteger(STANDARD_DRINK_G[system]) ? 0 : 2
  );

  return (
    <Screen
      title={t('onboarding.regionTitle')}
      subtitle={t('onboarding.regionSubtitle')}
      mood="calm"
      footer={
        <Button
          title={t('onboarding.continue')}
          onPress={() => {
            updateProfile({ unitSystem: system, currency, region: system === 'US' ? 'US' : system === 'UK' ? 'UK' : 'RO' });
            router.push('/(onboarding)/body');
          }}
        />
      }
    >
      <Card aurora>
        <Text variant="sectionHeader" tone="tertiary">{t('onboarding.standardDrink')}</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label={t('onboarding.unitSystem')}
            value={system}
            onChange={setSystem}
            options={[
              { value: 'EU', label: t('onboarding.unitSystemEU') },
              { value: 'UK', label: t('onboarding.unitSystemUK') },
              { value: 'US', label: t('onboarding.unitSystemUS') },
            ]}
          />
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          {system === 'US'
            ? t('onboarding.standardDrinkUS', { grams })
            : t('onboarding.standardDrinkUnit', { grams })}{' '}
          {t('onboarding.standardDrinkNote')}
        </Text>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('onboarding.currency')}</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label={t('onboarding.currency')}
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
          {t('onboarding.currencyNote')}
        </Text>
      </Card>
    </Screen>
  );
}
