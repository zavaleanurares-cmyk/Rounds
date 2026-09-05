import React from 'react';
import { Screen, Card, Group, ToggleRow, Text } from '@/ui';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/**
 * S-05 · Notifications.
 *
 * Safety is UNMUTABLE while a safe-arrival check is armed, and the screen says
 * why inline rather than showing a dead switch.
 */
export default function NotificationSettings() {
  const { settings, updateSettings, safety } = useStore();
  const n = settings.notifications;
  const set = (k: keyof typeof n, v: boolean) => updateSettings({ notifications: { ...n, [k]: v } });
  const armed = safety.activeCheck !== null;

  return (
    <Screen title="Notifications" subtitle="Capped at three a week by default. Never during a live night." back mood="night">
      <Group>
        <ToggleRow title="Morning recap" subtitle="One push at your usual wake time" value={n.morning} onValueChange={(v) => set('morning', v)} />
        <ToggleRow title="Weekly recap" value={n.weekly} onValueChange={(v) => set('weekly', v)} />
        <ToggleRow title="Plans" subtitle="Invites and reminders" value={n.plans} onValueChange={(v) => set('plans', v)} />
        <ToggleRow title="Social" subtitle="Friend requests and crew activity" value={n.social} onValueChange={(v) => set('social', v)} />
        <ToggleRow
          title="Safety"
          subtitle="Check-in reminders and escalation"
          value={n.safety}
          onValueChange={(v) => set('safety', v)}
          disabled={armed}
          disabledNote={armed ? "Can't be turned off while a check-in is armed." : undefined}
        />
        <ToggleRow
          title="Achievements"
          subtitle="Off by default"
          value={n.gamification}
          onValueChange={(v) => set('gamification', v)}
          last
        />
      </Group>
      <Card>
        <Text variant="footnote" tone="tertiary">
          ROUNDS never sends a notification while a night is live. Interrupting someone who is out is
          the fastest way to get an app deleted.
        </Text>
      </Card>
    </Screen>
  );
}
