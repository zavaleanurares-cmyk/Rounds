import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Text, Button, ToggleRow, Icon } from '@/ui';
import { useStore } from '@/data/store';
import type { Goal } from '@/domain/types';
import { gramsToUnits, unitsToGrams, UNIT_LABEL } from '@/domain/units';
import { formatMoney } from '@/domain/stats';
import { color, radius, space } from '@/design/tokens';

/**
 * Y-07 · Goal editor.
 *
 * Goals are stored in canonical grams (or minor currency units) and converted
 * only for display — changing your region never silently changes your goal.
 */
export default function GoalEditor() {
  const router = useRouter();
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

  const label =
    { nightly_cap: 'Nightly cap', weekly_cap: 'Weekly cap', dry_days: 'Dry days a month', spend_cap: 'Spend cap', nicotine_free: 'Nicotine-free days' }[
      goal.type
    ] ?? 'Goal';

  return (
    <Sheet
      title={label}
      onClose={() => router.back()}
      footer={
        <Button
          title="Save"
          onPress={() => {
            setGoal({ type: goal.type, target: toStored(value), enabled });
            router.back();
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Step icon="minus" onPress={() => setValue((v) => Math.max(0, v - step))} label="Less" />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="numericLarge">
              {isSpend ? formatMoney(Math.round(value * 100), profile?.currency ?? 'EUR') : value.toFixed(isDays ? 0 : 1)}
            </Text>
            <Text variant="footnote" tone="tertiary">
              {isSpend ? 'per week' : isDays ? 'days' : UNIT_LABEL[system]}
            </Text>
          </View>
          <Step icon="plus" onPress={() => setValue((v) => v + step)} label="More" />
        </View>

        <ToggleRow title="Track this goal" value={enabled} onValueChange={setEnabled} last />

        <Text variant="footnote" tone="quaternary">
          Goals are yours. Nothing here is shared, ranked, or shown to anyone else.
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
