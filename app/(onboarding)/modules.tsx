import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, ToggleRow } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * A-09 · Modules. Both OFF by default.
 *
 * Nicotine is good work, but it doubles the conceptual surface for the ~70% of
 * users who don't smoke and it bloats onboarding. It earns its place by being
 * asked for, not by being present.
 */
export default function Modules() {
  const router = useRouter();
  const t = useT();
  const { profile, updateProfile } = useStore();
  const [nicotine, setNicotine] = useState(profile?.modules.nicotine ?? false);
  const [social, setSocial] = useState(profile?.modules.social ?? true);

  return (
    <Screen
      title={t('onboarding.modulesTitle')}
      subtitle={t('onboarding.modulesSubtitle')}
      mood="calm"
      footer={
        <Button
          title={t('onboarding.continue')}
          onPress={() => {
            updateProfile({ modules: { nicotine, social } });
            router.push('/(onboarding)/permissions');
          }}
        />
      }
    >
      <Card>
        <ToggleRow
          title={t('onboarding.nicotineTitle')}
          subtitle={t('onboarding.nicotineSubtitle')}
          value={nicotine}
          onValueChange={setNicotine}
        />
        <ToggleRow
          title={t('onboarding.socialTitle')}
          subtitle={t('onboarding.socialSubtitle')}
          value={social}
          onValueChange={setSocial}
          last
        />
      </Card>
      <Text variant="footnote" tone="quaternary" center>
        {t('onboarding.modulesNote')}
      </Text>
    </Screen>
  );
}
