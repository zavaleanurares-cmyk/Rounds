import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Text, Button, ToggleRow, Icon } from '@/ui';
import { useStore } from '@/data/store';
import type { Goal } from '@/domain/types';
import { gramsToUnits, unitsToGrams, UNIT_LABEL } from '@/domain/units';
import { useT, useFormat, type MessageKey } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

const LABEL: Record<string, MessageKey> = {
  nightly_cap: 'stats.goalNightlyCap',
  weekly_cap: 'stats.goalWeeklyCap',
  dry_days: 'stats.goalDryDays',
  spend_cap: 'stats.goalSpendCap',
  nicotine_free: 'stats.goalNicotineFree',
};

/**
 * Y-07 · Goal editor.
 *
 * Goals are stored in canonical grams (or minor currency units) and converted
 * only for display — changing your region never silently changes your goal.
 */
export default function GoalEditor() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { goals, setGoal, profile } = useStore();
  const goal = goals.find((g) => g.type === type) ?? { type: type as Goal['type'], target: 0, enabled: false };
  const system = profile?.unitSystem ?? 'EU';
  const isSpend = goal.type === 'spend_cap';
  const isDays = goal.type === 'dry_days' || goal.type === 'nicotine_free';

  const toDisplay = (g: number) => (isSpend ? g / 100 : isDays ? g : gramsToUnits(g, system));
  const toStored = (d: number) => (isSpend ? Math.round(d * 100) : isDays ? d : unitsToGrams(d, system));

  const [value, setValue] = useState(toDisplay(goal.target));
  const [enabled, setEnabled] = useState(goal.enabled);
  const step = isSpend ? 10 : 1;

  const label = t(LABEL[goal.type] ?? 'stats.goalFallback');

  return (
    <Sheet
      title={label}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('ui.save')}
          onPress={() => {
            setGoal({ type: goal.type, target: toStored(value), enabled });
            router.back();
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Step icon="minus" onPress={() => setValue((v) => Math.max(0, v - step))} label={t('stats.less')} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="numericLarge">
              {isSpend ? f.money(Math.round(value * 100), profile?.currency ?? 'EUR') : f.number(value, isDays ? 0 : 1)}
            </Text>
            <Text variant="footnote" tone="tertiary">
              {isSpend ? t('stats.perWeek') : isDays ? t('stats.days') : t(UNIT_LABEL[system])}
            </Text>
          </View>
          <Step icon="plus" onPress={() => setValue((v) => v + step)} label={t('stats.more')} />
        </View>

        <ToggleRow title={t('stats.trackThisGoal')} value={enabled} onValueChange={setEnabled} last />

        <Text variant="footnote" tone="quaternary">
          {t('stats.goalsPrivate')}
        </Text>
      </View>
    </Sheet>
  );
}

function Step({ icon, onPress, label }: { icon: 'plus' | 'minus'; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 52,
        height: 52,
        borderRadius: radius.control,
        backgroundColor: color.surface.secondary,
        borderWidth: 1,
        borderColor: color.separator,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size={20} color={color.label.primary} />
    </Pressable>
  );
}
