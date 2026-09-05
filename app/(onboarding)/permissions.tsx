import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon, InlineLink } from '@/ui';
import { requestPermission } from '@/services/push';
import { useT, useI18n } from '@/i18n';
import { color, space } from '@/design/tokens';

const REASONS = [
  { icon: 'moon.stars' as const, title: 'onboarding.pushMorningTitle' as const, body: 'onboarding.pushMorningBody' as const },
  { icon: 'checkmark.shield' as const, title: 'onboarding.pushSafetyTitle' as const, body: 'onboarding.pushSafetyBody' as const },
  { icon: 'calendar' as const, title: 'onboarding.pushPlansTitle' as const, body: 'onboarding.pushPlansBody' as const },
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
  const t = useT();
  const { locale } = useI18n();
  const [busy, setBusy] = useState(false);

  /**
   * This screen exists to earn the permission, so it has to actually ask for
   * it. It previously just navigated — the OS dialog was never shown, and on
   * Android 13+ POST_NOTIFICATIONS is a runtime permission, so the safe-arrival
   * check-in silently never fired for anyone.
   */
  const allow = async () => {
    setBusy(true);
    await requestPermission(locale);
    setBusy(false);
    router.push('/(onboarding)/done');
  };

  return (
    <Screen
      title={t('onboarding.permissionsTitle')}
      subtitle={t('onboarding.permissionsSubtitle')}
      mood="calm"
      footer={
        <View style={{ gap: space.m }}>
          <Button title={t('onboarding.allowNotifications')} loading={busy} onPress={() => void allow()} />
          <View style={{ alignItems: 'center' }}>
            <InlineLink title={t('onboarding.notNow')} onPress={() => router.push('/(onboarding)/done')} />
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
                <Text variant="headline">{t(r.title)}</Text>
                <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>{t(r.body)}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
      {Platform.OS === 'android' ? (
        <Text variant="footnote" tone="quaternary" center>
          {t('onboarding.androidNote')}
        </Text>
      ) : null}
    </Screen>
  );
}
