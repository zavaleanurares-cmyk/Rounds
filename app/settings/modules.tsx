import React from 'react';
import { Screen, Group, ToggleRow, Card, Text } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';

/** S-04 · Modules. */
export default function ModuleSettings() {
  const t = useT();
  const { profile, updateProfile } = useStore();
  const m = profile?.modules ?? { nicotine: false, social: true };
  return (
    <Screen title={t('settings.modules')} back mood="night">
      <Group>
        <ToggleRow
          title={t('settings.nicotineTracking')}
          subtitle={t('settings.nicotineTrackingSubtitle')}
          value={m.nicotine}
          onValueChange={(v) => updateProfile({ modules: { ...m, nicotine: v } })}
        />
        <ToggleRow
          title={t('settings.socialFeatures')}
          subtitle={t('settings.socialFeaturesSubtitle')}
          value={m.social}
          onValueChange={(v) => updateProfile({ modules: { ...m, social: v } })}
          last
        />
      </Group>
      <Card>
        <Text variant="footnote" tone="tertiary">
          {t('settings.socialOffNote')}
        </Text>
      </Card>
    </Screen>
  );
}
