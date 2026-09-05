import React from 'react';
import { View, Pressable } from 'react-native';
import { Screen, Card, Text, ToggleRow, Group, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { previewCue } from '@/services/feedback';
import { color, radius, space } from '@/design/tokens';

/** S-02 · Appearance, motion and sound. */
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

      <Group title="FEEDBACK">
        <ToggleRow
          title="Haptics"
          subtitle="A small tap when something lands"
          value={settings.haptics}
          onValueChange={(v) => updateSettings({ haptics: v })}
        />
        <ToggleRow
          title="Sound"
          subtitle="Off by default. Never plays when your phone is on silent."
          value={settings.sound}
          onValueChange={(v) => {
            updateSettings({ sound: v });
            if (v) previewCue('log');
          }}
          last
        />
      </Group>

      {settings.sound ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">HEAR THEM</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.m }}>
            {([
              ['log', 'A drink'],
              ['round', 'A round'],
              ['start', 'Night starts'],
              ['end', 'Night ends'],
              ['unlock', 'Achievement'],
              ['levelup', 'Level up'],
            ] as const).map(([cue, label]) => (
              <Pressable
                key={cue}
                onPress={() => previewCue(cue)}
                accessibilityRole="button"
                accessibilityLabel={`Play ${label}`}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: space.m,
                  paddingVertical: space.sm,
                  borderRadius: radius.control,
                  backgroundColor: color.surface.secondary,
                  borderWidth: 1,
                  borderColor: color.separator,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Icon name="bolt" size={14} color={color.label.secondary} />
                <Text variant="footnote">{label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
