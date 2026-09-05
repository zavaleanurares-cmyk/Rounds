import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

const MARKS = [
  { icon: 'moon.stars' as const, text: 'Tonight changes shape through the night — plan, live, wind-down, morning.' },
  { icon: 'plus' as const, text: 'The middle button logs a drink. From the lock screen it is one tap.' },
  { icon: 'checkmark.shield' as const, text: 'Get home safe is reachable from anywhere and always free.' },
];

/** A-11 · Ready. Coach marks over the three things that are not obvious. */
export default function Done() {
  const router = useRouter();
  const { completeOnboarding } = useStore();

  return (
    <Screen
      title="You're set"
      subtitle="Three things worth knowing before your first night."
      mood="default"
      footer={
        <Button
          title="Take me in"
          onPress={() => {
            completeOnboarding();
            router.replace('/(tabs)/tonight');
          }}
        />
      }
    >
      <Card aurora>
        <View style={{ gap: space.lg }}>
          {MARKS.map((m, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: 'rgba(59,130,246,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={m.icon} size={17} color={color.brand.tintLight} />
              </View>
              <Text variant="subheadline" tone="secondary" style={{ flex: 1, paddingTop: 6 }}>{m.text}</Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
