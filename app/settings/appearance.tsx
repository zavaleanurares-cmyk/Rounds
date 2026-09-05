import React from 'react';
import { View, Pressable } from 'react-native';
import { Screen, Card, Text, ToggleRow, Group, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { previewCue } from '@/services/feedback';
import { useT, type MessageKey } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

const CUES = [
  ['log', 'settings.cueLog'],
  ['round', 'settings.cueRound'],
  ['start', 'settings.cueStart'],
  ['end', 'settings.cueEnd'],
  ['unlock', 'ui.achievement'],
  ['levelup', 'settings.cueLevelUp'],
] as const satisfies ReadonlyArray<readonly [string, MessageKey]>;

/** S-02 · Appearance, motion and sound. */
export default function Appearance() {
  const t = useT();
  const { settings, updateSettings } = useStore();
  return (
    <Screen title={t('settings.appearance')} back mood="night">
      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('settings.nightAccent')}</Text>
        <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.m }}>
          {color.night.map((c, i) => (
            <View
              key={c}
              accessible
              accessibilityRole="button"
              accessibilityLabel={t('settings.accentLabel', { index: i + 1 })}
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
          {t('settings.accentNote')}
        </Text>
      </Card>

      <Group>
        <ToggleRow
          title={t('settings.dimAfter1am')}
          subtitle={t('settings.dimAfter1amSubtitle')}
          value={settings.nightDimming}
          onValueChange={(v) => updateSettings({ nightDimming: v })}
        />
        <ToggleRow
          title={t('settings.reduceMotion')}
          subtitle={t('settings.reduceMotionSubtitle')}
          value={settings.reduceMotion}
          onValueChange={(v) => updateSettings({ reduceMotion: v })}
          last
        />
      </Group>

      <Group title={t('settings.groupFeedback')}>
        <ToggleRow
          title={t('settings.haptics')}
          subtitle={t('settings.hapticsSubtitle')}
          value={settings.haptics}
          onValueChange={(v) => updateSettings({ haptics: v })}
        />
        <ToggleRow
          title={t('settings.sound')}
          subtitle={t('settings.soundSubtitle')}
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
          <Text variant="sectionHeader" tone="tertiary">{t('settings.hearThem')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.m }}>
            {CUES.map(([cue, labelKey]) => (
              <Pressable
                key={cue}
                onPress={() => previewCue(cue)}
                accessibilityRole="button"
                accessibilityLabel={t('settings.playCue', { label: t(labelKey) })}
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
                <Text variant="footnote">{t(labelKey)}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
