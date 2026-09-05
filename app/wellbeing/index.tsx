import React, { useMemo } from 'react';
import { View, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, ProgressRing, NavRow, Group, Button, InlineLink, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { goalProgress, computeStreaks } from '@/domain/stats';
import { gramsToUnits, UNIT_LABEL } from '@/domain/units';
import type { Goal } from '@/domain/types';
import { useT, useFormat, type MessageKey } from '@/i18n';
import { color, space } from '@/design/tokens';

const LABEL: Record<Goal['type'], MessageKey> = {
  nightly_cap: 'stats.goalNightlyCap',
  weekly_cap: 'stats.goalWeeklyCap',
  dry_days: 'stats.goalDryDays',
  spend_cap: 'stats.goalSpendCap',
  nicotine_free: 'stats.goalNicotineFree',
};

/** Y-06 · Wellbeing hub. Goals with rings, safety entry, support resources. */
export default function Wellbeing() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { goals, logs, profile } = useStore();
  const system = profile?.unitSystem ?? 'EU';
  const streaks = useMemo(() => computeStreaks(logs), [logs]);
  const active = goals.filter((g) => g.enabled);

  const display = (g: Goal, value: number) =>
    g.type === 'spend_cap'
      ? f.money(value, profile?.currency ?? 'EUR')
      : g.type === 'dry_days' || g.type === 'nicotine_free'
        ? f.number(Math.round(value), 0)
        : f.number(gramsToUnits(value, system), 1);

  return (
    <Screen title={t('stats.wellbeing')} back mood="calm">
      <Card aurora accent={color.pace.steady}>
        <Text variant="sectionHeader" tone="tertiary">{t('stats.dryStreakHeader')}</Text>
        <Text variant="numericLarge" style={{ marginTop: space.xs }}>{f.number(streaks.dryStreak, 0)}</Text>
        <Text variant="subheadline" tone="secondary">
          {t('stats.dryStreakLongest', { count: streaks.dryStreak, longest: f.number(streaks.longestDry, 0) })}
        </Text>
        <Text variant="footnote" tone="quaternary" style={{ marginTop: space.m }}>
          {t('stats.noOutStreakNote')}
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
                  caption={t('stats.percent', { pct: f.number(Math.round(p.pct * 100), 0) })}
                  label={t(LABEL[g.type])}
                />
                <Text variant="caption1" tone="secondary" center>{t(LABEL[g.type])}</Text>
                <Text variant="caption2" tone="tertiary" center>
                  {g.type === 'weekly_cap' || g.type === 'nightly_cap'
                    ? t('stats.goalOfUnit', {
                        value: display(g, p.value),
                        target: display(g, g.target),
                        unit: t(UNIT_LABEL[system]),
                      })
                    : t('stats.goalOf', { value: display(g, p.value), target: display(g, g.target) })}
                </Text>
              </View>
            </Card>
          );
        })}
      </View>

      <Group title={t('stats.goalsHeader')}>
        {goals.map((g, i) => (
          <NavRow
            key={g.type}
            title={t(LABEL[g.type])}
            value={g.enabled ? t('stats.on') : t('stats.off')}
            onPress={() => router.push(`/wellbeing/goal/${g.type}` as never)}
            last={i === goals.length - 1}
          />
        ))}
      </Group>

      <Button title={t('stats.getHomeSafe')} kind="glass" icon="checkmark.shield" onPress={() => router.push('/safety')} />

      <Card>
        <View style={{ flexDirection: 'row', gap: space.m }}>
          <Icon name="heart" size={20} color={color.brand.tintLight} />
          <View style={{ flex: 1 }}>
            <Text variant="headline">{t('stats.stopsBeingFun')}</Text>
            <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
              {t('stats.stopsBeingFunBody')}
            </Text>
            <View style={{ marginTop: space.m, gap: space.sm }}>
              <InlineLink title={t('stats.alcoholSupport')} onPress={() => void Linking.openURL('https://www.who.int/health-topics/alcohol')} />
              <InlineLink title={t('stats.findLocalServices')} onPress={() => void Linking.openURL('https://www.who.int/health-topics/alcohol')} />
            </View>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
