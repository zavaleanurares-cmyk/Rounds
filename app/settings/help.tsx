import React from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Group, NavRow, Card, Text } from '@/ui';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/** S-13 · Help & legal. */
export default function Help() {
  const router = useRouter();
  const t = useT();
  return (
    <Screen title={t('settings.helpLegal')} back mood="night">
      <Group title={t('settings.groupLegal')}>
        <NavRow title={t('settings.termsOfService')} onPress={() => router.push('/legal/terms')} />
        <NavRow title={t('settings.privacyPolicy')} onPress={() => router.push('/legal/privacy')} last />
      </Group>

      <Group title={t('settings.groupSupport')}>
        <NavRow title={t('settings.contactSupport')} subtitle="hello@rounds.app" onPress={() => void Linking.openURL('mailto:hello@rounds.app')} />
        <NavRow title={t('settings.reportProblem')} onPress={() => router.push('/report/app/general')} last />
      </Group>

      <Group title={t('settings.groupDrinkingSupport')}>
        <NavRow
          title={t('settings.helplines')}
          subtitle={t('settings.helplinesSubtitle')}
          onPress={() => router.push('/legal/support')}
        />
        <NavRow title={t('settings.whoAlcoholHealth')} onPress={() => void Linking.openURL('https://www.who.int/health-topics/alcohol')} last />
      </Group>

      <Card>
        <Text variant="footnote" tone="tertiary">
          {t('settings.paceDisclaimer')}
        </Text>
      </Card>
    </Screen>
  );
}
