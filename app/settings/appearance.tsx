import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, ToggleRow, Group } from '@/ui';
import { useStore } from '@/data/store';
import { color, radius, space } from '@/design/tokens';

/** S-02 · Appearance. */
export default function Appearance() {
  const { settings, updateSettings } = useStore();
  return (
    <Screen title="Appearance" back mood="night">
      <Card>
        <Text variant="sectionHeader" tone="tertiary">NIGHT ACCENT</Text>
        <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.m }}>
          {color.night.map((c, i) => (
            <View
              key={c}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Accent ${i + 1}`}
              accessibilityState={{ selected: settings.accentIndex === i }}
              style={{
                flex: 1,
                height: 56,
                borderRadius: radius.control,
                backgroundColor: c,
                opacity: settings.accentIndex === i ? 1 : 0.4,
                borderWidth: settings.accentIndex === i ? 2 : 0,
                borderColor: '#fff',
              }}
              onTouchEnd={() => updateSettings({ accentIndex: i })}
            />
          ))}
        </View>
        <Text variant="footnote" tone="tertiary" style={{ marginTop: space.m }}>
          Each night gets its own accent so your history has colour. This picks the one ROUNDS starts
          from.
        </Text>
      </Card>

      <Group>
        <ToggleRow
          title="Dim after 1am"
          subtitle="Lowers the aurora and raises contrast during a late night"
          value={settings.nightDimming}
          onValueChange={(v) => updateSettings({ nightDimming: v })}
        />
        <ToggleRow
          title="Reduce motion"
          subtitle="Also follows your system setting"
          value={settings.reduceMotion}
          onValueChange={(v) => updateSettings({ reduceMotion: v })}
          last
        />
      </Group>
    </Screen>
  );
}
