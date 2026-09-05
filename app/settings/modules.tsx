import React from 'react';
import { Screen, Group, ToggleRow, Card, Text } from '@/ui';
import { useStore } from '@/data/store';

/** S-04 · Modules. */
export default function ModuleSettings() {
  const { profile, updateProfile } = useStore();
  const m = profile?.modules ?? { nicotine: false, social: true };
  return (
    <Screen title="Modules" back mood="night">
      <Group>
        <ToggleRow
          title="Nicotine tracking"
          subtitle="Adds a separate dashboard. Never mixed into your drink history."
          value={m.nicotine}
          onValueChange={(v) => updateProfile({ modules: { ...m, nicotine: v } })}
        />
        <ToggleRow
          title="Social features"
          subtitle="Friends, crews, shared nights, plans"
          value={m.social}
          onValueChange={(v) => updateProfile({ modules: { ...m, social: v } })}
          last
        />
      </Group>
      <Card>
        <Text variant="footnote" tone="tertiary">
          With social off, ROUNDS is entirely private: pace, spend, history, goals and everything in
          Get home safe all still work.
        </Text>
      </Card>
    </Screen>
  );
}
