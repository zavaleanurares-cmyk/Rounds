import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Segmented, ToggleRow, Group } from '@/ui';
import { useStore } from '@/data/store';
import { STANDARD_DRINK_G, type UnitSystem } from '@/domain/units';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/** S-03 · Units & region. */
export default function Units() {
  const t = useT();
  const { profile, updateProfile, settings, updateSettings } = useStore();
  const system = profile?.unitSystem ?? 'EU';
  return (
    <Screen title={t('settings.unitsRegion')} back mood="night">
      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('settings.standardDrinkHeader')}</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label={t('settings.unitSystemLabel')}
            value={system}
            onChange={(v: UnitSystem) => updateProfile({ unitSystem: v })}
            options={[
              { value: 'EU', label: t('settings.unitSystemEU') },
              { value: 'UK', label: t('settings.unitSystemUK') },
              { value: 'US', label: t('settings.unitSystemUS') },
            ]}
          />
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          {t('settings.standardDrinkNote', { grams: STANDARD_DRINK_G[system] })}
        </Text>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('settings.currencyHeader')}</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label={t('settings.currencyLabel')}
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

      <Group title={t('settings.paceReadoutHeader')}>
        <ToggleRow
          title={t('settings.showEstimate')}
          subtitle={t('settings.showEstimateSubtitle')}
          value={settings.showEstimate}
          onValueChange={(v) => updateSettings({ showEstimate: v })}
          last
        />
      </Group>

      <Text variant="footnote" tone="quaternary">
        {t('settings.estimateNote')}
      </Text>
    </Screen>
  );
}
