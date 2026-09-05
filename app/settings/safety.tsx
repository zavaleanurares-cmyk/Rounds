import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Group, NavRow, Card, Text } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/** S-07 · Safety settings. */
export default function SafetySettings() {
  const router = useRouter();
  const t = useT();
  const { safety } = useStore();
  return (
    <Screen title={t('settings.safety')} back mood="safety">
      <Group>
        <NavRow
          title={t('settings.trustedContacts')}
          value={t('settings.contactsOfMax', { count: safety.contacts.length, max: 3 })}
          onPress={() => router.push('/safety/contacts')}
        />
        <NavRow title={t('settings.armCheckIn')} onPress={() => router.push('/safety/arm')} />
        <NavRow title={t('settings.getHomeSafe')} onPress={() => router.push('/safety')} last />
      </Group>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('settings.homeAddressHeader')}</Text>
        <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
          {t('settings.homeAddressNote')}
        </Text>
        <View style={{ marginTop: space.m }}>
          <Field label="" value={safety.homeAddress ?? ''} onChangeText={() => {}} placeholder={t('settings.homeAddressPlaceholder')} autoCapitalize="words" />
        </View>
      </Card>

      <Card>
        <Text variant="footnote" tone="tertiary">
          {t('settings.safetyFreeNote')}
        </Text>
      </Card>
    </Screen>
  );
}
