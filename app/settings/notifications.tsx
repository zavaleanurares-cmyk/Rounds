import React from 'react';
import { Screen, Card, Group, ToggleRow, Text } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * S-05 · Notifications.
 *
 * Safety is UNMUTABLE while a safe-arrival check is armed, and the screen says
 * why inline rather than showing a dead switch.
 */
export default function NotificationSettings() {
  const t = useT();
  const { settings, updateSettings, safety } = useStore();
  const n = settings.notifications;
  const set = (k: keyof typeof n, v: boolean) => updateSettings({ notifications: { ...n, [k]: v } });
  const armed = safety.activeCheck !== null;

  return (
    <Screen title={t('settings.notifications')} subtitle={t('settings.notificationsSubtitle')} back mood="night">
      <Group>
        <ToggleRow title={t('settings.morningRecap')} subtitle={t('settings.morningRecapSubtitle')} value={n.morning} onValueChange={(v) => set('morning', v)} />
        <ToggleRow title={t('settings.weeklyRecap')} value={n.weekly} onValueChange={(v) => set('weekly', v)} />
        <ToggleRow title={t('settings.plans')} subtitle={t('settings.plansSubtitle')} value={n.plans} onValueChange={(v) => set('plans', v)} />
        <ToggleRow title={t('settings.social')} subtitle={t('settings.socialSubtitle')} value={n.social} onValueChange={(v) => set('social', v)} />
        <ToggleRow
          title={t('settings.safety')}
          subtitle={t('settings.safetyNotificationsSubtitle')}
          value={n.safety}
          onValueChange={(v) => set('safety', v)}
          disabled={armed}
          disabledNote={armed ? t('settings.safetyArmedNote') : undefined}
        />
        <ToggleRow
          title={t('settings.achievements')}
          subtitle={t('settings.achievementsSubtitle')}
          value={n.gamification}
          onValueChange={(v) => set('gamification', v)}
          last
        />
      </Group>
      <Card>
        <Text variant="footnote" tone="tertiary">
          {t('settings.notificationsLiveNote')}
        </Text>
      </Card>
    </Screen>
  );
}
