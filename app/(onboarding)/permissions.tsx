import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon, InlineLink } from '@/ui';
import { requestPermission } from '@/services/push';
import { color, space } from '@/design/tokens';

const REASONS = [
  { icon: 'moon.stars' as const, title: 'Your morning after', body: 'One push at your usual wake time, with the night and the gaps to fill.' },
  { icon: 'checkmark.shield' as const, title: 'Safe arrival', body: "If you armed a check-in and the deadline passes, we ask you before we ask anyone else." },
  { icon: 'calendar' as const, title: 'Plans', body: 'When someone invites you or a plan is about to start.' },
];

/**
 * A-10 · Notification primer. Shown BEFORE the OS dialog so a "no" costs a tap
 * rather than the permission.
 *
 * On Android 13+ POST_NOTIFICATIONS is a runtime permission, so this screen is
 * mandatory there, not optional.
 */
export default function Permissions() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  /**
   * This screen exists to earn the permission, so it has to actually ask for
   * it. It previously just navigated — the OS dialog was never shown, and on
   * Android 13+ POST_NOTIFICATIONS is a runtime permission, so the safe-arrival
   * check-in silently never fired for anyone.
   */
  const allow = async () => {
    setBusy(true);
    await requestPermission();
    setBusy(false);
    router.push('/(onboarding)/done');
  };

  return (
    <Screen
      title="Three things we'd send"
      subtitle="Never during a live night. Capped at three a week by default."
      mood="calm"
      footer={
        <View style={{ gap: space.m }}>
          <Button title="Allow notifications" loading={busy} onPress={() => void allow()} />
          <View style={{ alignItems: 'center' }}>
            <InlineLink title="Not now" onPress={() => router.push('/(onboarding)/done')} />
          </View>
        </View>
      }
    >
      <Card aurora>
        <View style={{ gap: space.lg }}>
          {REASONS.map((r) => (
            <View key={r.title} style={{ flexDirection: 'row', gap: space.md }}>
              <Icon name={r.icon} size={22} color={color.brand.tintLight} />
              <View style={{ flex: 1 }}>
                <Text variant="headline">{r.title}</Text>
                <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>{r.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
      {Platform.OS === 'android' ? (
        <Text variant="footnote" tone="quaternary" center>
          Android will ask you next. Declining is fine — safety check-ins still work in the app.
        </Text>
      ) : null}
    </Screen>
  );
}
