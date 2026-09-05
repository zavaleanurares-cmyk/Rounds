import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, ToggleRow } from '@/ui';
import { useStore } from '@/data/store';
import { space } from '@/design/tokens';

/**
 * A-09 · Modules. Both OFF by default.
 *
 * Nicotine is good work, but it doubles the conceptual surface for the ~70% of
 * users who don't smoke and it bloats onboarding. It earns its place by being
 * asked for, not by being present.
 */
export default function Modules() {
  const router = useRouter();
  const { profile, updateProfile } = useStore();
  const [nicotine, setNicotine] = useState(profile?.modules.nicotine ?? false);
  const [social, setSocial] = useState(profile?.modules.social ?? true);

  return (
    <Screen
      title="Anything else?"
      subtitle="Both optional. You can change these any time in Settings."
      mood="calm"
      footer={
        <Button
          title="Continue"
          onPress={() => {
            updateProfile({ modules: { nicotine, social } });
            router.push('/(onboarding)/permissions');
          }}
        />
      }
    >
      <Card>
        <ToggleRow
          title="Nicotine tracking"
          subtitle="Cigarettes, vapes and pouches, with cost and free-day streaks."
          value={nicotine}
          onValueChange={setNicotine}
        />
        <ToggleRow
          title="Social features"
          subtitle="Friends, crews, shared nights and plans. Turning this off makes ROUNDS entirely private."
          value={social}
          onValueChange={setSocial}
          last
        />
      </Card>
      <Text variant="footnote" tone="quaternary" center>
        With social off you keep pace, spend, history and everything in Get home safe.
      </Text>
    </Screen>
  );
}
