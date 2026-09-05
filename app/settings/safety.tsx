import React, { useEffect, useState } from 'react';
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
  const { safety, setHomeAddress } = useStore();

  // Local while typing, committed on blur: an address is a whole thing, and
  // writing a queue item per keystroke would be twenty half-addresses.
  const [home, setHome] = useState(safety.homeAddress ?? '');
  useEffect(() => {
    setHome(safety.homeAddress ?? '');
  }, [safety.homeAddress]);

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
          {/*
            This field used to discard every keystroke: `onChangeText={() => {}}`,
            no store action behind it, `homeAddress` null forever — and so the
            Ride home button on the safety screen always opened Uber with no
            destination, on the screen somebody reaches for at the point they
            want to stop thinking.
          */}
          <Field
            label=""
            value={home}
            onChangeText={setHome}
            onBlur={() => setHomeAddress(home)}
            placeholder={t('settings.homeAddressPlaceholder')}
            autoCapitalize="words"
          />
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
