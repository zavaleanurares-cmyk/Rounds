import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, Group, NavRow, Text, Button } from '@/ui';
import { useStore } from '@/data/store';
import { useT, type MessageKey } from '@/i18n';
import { space } from '@/design/tokens';

const UNIT_SYSTEM_LABEL = {
  EU: 'settings.unitSystemEU',
  UK: 'settings.unitSystemUK',
  US: 'settings.unitSystemUS',
} as const satisfies Record<string, MessageKey>;

/** S-01 · Settings home. */
export default function Settings() {
  const router = useRouter();
  const t = useT();
  const { profile, signOut, settings, safety } = useStore();

  return (
    <Screen title={t('ui.settings')} back mood="night">
      <Group title={t('settings.groupYou')}>
        <NavRow title={t('settings.unitsRegion')} value={t(UNIT_SYSTEM_LABEL[profile?.unitSystem ?? 'EU'])} onPress={() => router.push('/settings/units')} />
        <NavRow title={t('settings.appearance')} onPress={() => router.push('/settings/appearance')} />
        <NavRow title={t('settings.modules')} value={profile?.modules.nicotine ? t('settings.modulesNicotineOn') : t('settings.modulesDefault')} onPress={() => router.push('/settings/modules')} last />
      </Group>

      <Group title={t('settings.groupApp')}>
        <NavRow title={t('settings.notifications')} onPress={() => router.push('/settings/notifications')} />
        <NavRow title={t('settings.privacy')} onPress={() => router.push('/settings/privacy')} />
        <NavRow title={t('settings.safety')} value={safety.contacts.length ? t('settings.safetyContacts', { count: safety.contacts.length }) : t('settings.safetyNotSetUp')} onPress={() => router.push('/settings/safety')} />
        <NavRow title={t('settings.systemSurfaces')} subtitle={t('settings.systemSurfacesSubtitle')} onPress={() => router.push('/settings/surfaces')} last />
      </Group>

      <Group title={t('settings.groupSafetyPeople')}>
        <NavRow title={t('settings.blockedUsers')} onPress={() => router.push('/settings/blocked')} />
        <NavRow title={t('settings.dataAccount')} onPress={() => router.push('/settings/data')} />
        <NavRow title={t('settings.helpLegal')} onPress={() => router.push('/settings/help')} last />
      </Group>

      <Group title={t('settings.groupDeveloper')}>
        <NavRow title={t('settings.demoData')} subtitle={t('settings.demoDataSubtitle')} onPress={() => router.push('/settings/demo')} />
        <NavRow title={t('settings.everyDrink')} subtitle={t('settings.everyDrinkSubtitle', { count: 165 })} onPress={() => router.push('/dev/drinks')} last />
      </Group>

      <Button title={t('settings.signOut')} kind="plain" onPress={() => void signOut()} />
      <Text variant="footnote" tone="quaternary" center style={{ marginTop: space.sm }}>
        {t('settings.versionLine', { version: '1.0.0', username: profile?.username ?? t('settings.usernameFallback') })}
      </Text>
    </Screen>
  );
}
