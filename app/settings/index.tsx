import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, Group, NavRow, Text, Button } from '@/ui';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/** S-01 · Settings home. */
export default function Settings() {
  const router = useRouter();
  const { profile, signOut, settings, safety , plus } = useStore();

  return (
    <Screen title="Settings" back mood="night">
      <Group title="YOU">
        <NavRow title="Units & region" value={profile?.unitSystem ?? 'EU'} onPress={() => router.push('/settings/units')} />
        <NavRow title="Appearance" onPress={() => router.push('/settings/appearance')} />
        <NavRow title="Modules" value={profile?.modules.nicotine ? 'Nicotine on' : 'Default'} onPress={() => router.push('/settings/modules')} last />
      </Group>

      <Group title="APP">
        <NavRow title="Notifications" onPress={() => router.push('/settings/notifications')} />
        <NavRow title="Privacy" onPress={() => router.push('/settings/privacy')} />
        <NavRow title="Safety" value={safety.contacts.length ? `${safety.contacts.length} contacts` : 'Not set up'} onPress={() => router.push('/settings/safety')} />
        <NavRow title="Subscription" value={plus ? 'ROUNDS+' : 'Free'} onPress={() => router.push('/settings/subscription')} />
        <NavRow title="System surfaces" subtitle="Live Activity, widgets, Siri, watch" onPress={() => router.push('/settings/surfaces')} last />
      </Group>

      <Group title="SAFETY & PEOPLE">
        <NavRow title="Blocked users" onPress={() => router.push('/settings/blocked')} />
        <NavRow title="Data & account" onPress={() => router.push('/settings/data')} />
        <NavRow title="Help & legal" onPress={() => router.push('/settings/help')} last />
      </Group>

      <Group title="DEVELOPER">
        <NavRow title="Demo data" subtitle="Fill the app with 14 weeks of plausible history" onPress={() => router.push('/settings/demo')} />
        <NavRow title="Every drink" subtitle={`All ${165} glyphs, drawn`} onPress={() => router.push('/dev/drinks')} last />
      </Group>

      <Button title="Sign out" kind="plain" onPress={() => void signOut()} />
      <Text variant="footnote" tone="quaternary" center style={{ marginTop: space.sm }}>
        ROUNDS 1.0.0 · @{profile?.username ?? 'you'}
      </Text>
    </Screen>
  );
}
