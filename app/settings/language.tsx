import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, NavRow, Group } from '@/ui';
import { useI18n, LOCALES, deviceLocale, type Locale } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * S-16 · Language.
 *
 * Two things this screen does that a plain list of languages would not:
 *
 *  · "Follow my phone" is an explicit, selectable option rather than the
 *    absence of a choice. It is the default, and it says which language that
 *    currently resolves to — so a user whose phone is set to French but who
 *    sees English knows immediately that ROUNDS does not speak their variant,
 *    rather than assuming the app is broken.
 *  · Every language is named IN that language. Somebody looking for Romanian
 *    scans for "Română", not for "Romanian".
 *
 * Switching is instant and needs no restart: the catalogue is bundled, so there
 * is nothing to download and nothing to wait for.
 */
export default function Language() {
  const { locale, preference, setLocale, t } = useI18n();
  const device = deviceLocale();
  const deviceName = LOCALES.find((l) => l.code === device)?.label ?? 'English';

  const row = (code: Locale | null, label: string, subtitle?: string, last?: boolean) => {
    const active = preference === code;
    return (
      <NavRow
        key={code ?? 'auto'}
        title={label}
        subtitle={subtitle}
        // Picks a language rather than navigating, so it gets a drawn tick and
        // announces itself as a radio to a screen reader.
        selected={active}
        onPress={() => setLocale(code)}
        last={last}
      />
    );
  };

  return (
    <Screen title={t('settings.language')} back mood="night">
      <Group title={t('settings.languageGroup')}>
        {row(null, t('settings.languageFollowPhone'), t('settings.languageCurrently', { name: deviceName }))}
        {LOCALES.map((l, i) =>
          row(l.code, l.label, l.english, i === LOCALES.length - 1)
        )}
      </Group>

      <Card>
        <View style={{ gap: space.sm }}>
          <Text variant="subheadline" tone="secondary">
            {t('settings.languageNote')}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
