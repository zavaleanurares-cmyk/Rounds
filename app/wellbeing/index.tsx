import React, { useMemo } from 'react';
import { View, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, ProgressRing, NavRow, Group, Button, InlineLink, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { goalProgress, computeStreaks, formatMoney } from '@/domain/stats';
import { gramsToUnits, UNIT_LABEL } from '@/domain/units';
import type { Goal } from '@/domain/types';
import { color, space } from '@/design/tokens';

const LABEL: Record<Goal['type'], string> = {
  nightly_cap: 'Nightly cap',
  weekly_cap: 'Weekly cap',
  dry_days: 'Dry days a month',
  spend_cap: 'Spend cap',
  nicotine_free: 'Nicotine-free days',
};

/** Y-06 · Wellbeing hub. Goals with rings, safety entry, support resources. */
export default function Wellbeing() {
  const router = useRouter();
  const { goals, logs, profile } = useStore();
  const system = profile?.unitSystem ?? 'EU';
  const streaks = useMemo(() => computeStreaks(logs), [logs]);
  const active = goals.filter((g) => g.enabled);

  const display = (g: Goal, value: number) =>
    g.type === 'spend_cap'
      ? formatMoney(value, profile?.currency ?? 'EUR')
      : g.type === 'dry_days' || g.type === 'nicotine_free'
        ? String(Math.round(value))
        : `${gramsToUnits(value, system).toFixed(1)}`;

  return (
    <Screen title="Wellbeing" back mood="calm">
      <Card aurora accent={color.pace.steady}>
        <Text variant="sectionHeader" tone="tertiary">DRY STREAK</Text>
        <Text variant="numericLarge" style={{ marginTop: space.xs }}>{streaks.dryStreak}</Text>
        <Text variant="subheadline" tone="secondary">
          {streaks.dryStreak === 1 ? 'night' : 'nights'} · longest {streaks.longestDry}
        </Text>
        <Text variant="footnote" tone="quaternary" style={{ marginTop: space.m }}>
          There is no streak here for consecutive nights out. That one rewards the wrong thing.
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.m }}>
        {active.map((g) => {
          const p = goalProgress(logs, g);
          const over = p.pct >= 1 && (g.type === 'weekly_cap' || g.type === 'nightly_cap' || g.type === 'spend_cap');
          return (
            <Card key={g.type} style={{ flex: 1, minWidth: '45%' }} onPress={() => router.push(`/wellbeing/goal/${g.type}` as never)}>
              <View style={{ alignItems: 'center', gap: space.sm }}>
                <ProgressRing
                  value={p.pct}
                  tint={over ? color.pace.quick : color.pace.steady}
                  size={72}
                  caption={`${Math.round(p.pct * 100)}%`}
                  label={LABEL[g.type]}
                />
                <Text variant="caption1" tone="secondary" center>{LABEL[g.type]}</Text>
                <Text variant="caption2" tone="tertiary" center>
                  {display(g, p.value)} of {display(g, g.target)}
                  {g.type === 'weekly_cap' || g.type === 'nightly_cap' ? ` ${UNIT_LABEL[system]}` : ''}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>

      <Group title="GOALS">
        {goals.map((g, i) => (
          <NavRow
            key={g.type}
            title={LABEL[g.type]}
            value={g.enabled ? 'On' : 'Off'}
            onPress={() => router.push(`/wellbeing/goal/${g.type}` as never)}
            last={i === goals.length - 1}
          />
        ))}
      </Group>

      <Button title="Get home safe" kind="glass" icon="checkmark.shield" onPress={() => router.push('/safety')} />

      <Card>
        <View style={{ flexDirection: 'row', gap: space.m }}>
          <Icon name="heart" size={20} color={color.brand.tintLight} />
          <View style={{ flex: 1 }}>
            <Text variant="headline">If it stops being fun</Text>
            <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
              Talking to someone about drinking is a normal thing to do, and it doesn't have to be a
              crisis first.
            </Text>
            <View style={{ marginTop: space.m, gap: space.sm }}>
              <InlineLink title="Alcohol support · WHO resources" onPress={() => void Linking.openURL('https://www.who.int/health-topics/alcohol')} />
              <InlineLink title="Find local services" onPress={() => void Linking.openURL('https://www.who.int/health-topics/alcohol')} />
            </View>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
