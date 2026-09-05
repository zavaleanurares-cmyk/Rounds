import React from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Group, NavRow, Card, Text } from '@/ui';
import { space } from '@/design/tokens';

/** S-13 · Help & legal. */
export default function Help() {
  const router = useRouter();
  return (
    <Screen title="Help & legal" back mood="night">
      <Group title="LEGAL">
        <NavRow title="Terms of Service" onPress={() => router.push('/legal/terms')} />
        <NavRow title="Privacy Policy" onPress={() => router.push('/legal/privacy')} last />
      </Group>

      <Group title="SUPPORT">
        <NavRow title="Contact support" subtitle="hello@rounds.app" onPress={() => void Linking.openURL('mailto:hello@rounds.app')} />
        <NavRow title="Report a problem" onPress={() => router.push('/report/app/general')} last />
      </Group>

      <Group title="DRINKING SUPPORT">
        <NavRow
          title="Helplines for your region"
          subtitle="Free and confidential"
          onPress={() => router.push('/legal/support')}
        />
        <NavRow title="WHO · alcohol and health" onPress={() => void Linking.openURL('https://www.who.int/health-topics/alcohol')} last />
      </Group>

      <Card>
        <Text variant="footnote" tone="tertiary">
          The pace estimate in ROUNDS is not a breathalyser and not medical advice. It cannot account
          for food, medication, illness or a drink you forgot to log. Never use it to decide whether
          to drive.
        </Text>
      </Card>
    </Screen>
  );
}
