import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Sparkline, EmptyState, StatTile } from '@/ui';
import { useStore } from '@/data/store';
import { weekTotals, spendTotals, summariseNights, hangoverForecast } from '@/domain/stats';
import { gramsToUnits, UNIT_LABEL } from '@/domain/units';
import { useT, useFormat, type MessageKey, type TranslateFn } from '@/i18n';
import { color, space } from '@/design/tokens';

const DAY_INITIALS: MessageKey[] = [
  'stats.dayInitialSun',
  'stats.dayInitialMon',
  'stats.dayInitialTue',
  'stats.dayInitialWed',
  'stats.dayInitialThu',
  'stats.dayInitialFri',
  'stats.dayInitialSat',
];

const DAY_SHORT: MessageKey[] = [
  'stats.dayShortSun',
  'stats.dayShortMon',
  'stats.dayShortTue',
  'stats.dayShortWed',
  'stats.dayShortThu',
  'stats.dayShortFri',
  'stats.dayShortSat',
];

const BAND: Record<'fine' | 'tender' | 'rough', MessageKey> = {
  fine: 'stats.bandFine',
  tender: 'stats.bandTender',
  rough: 'stats.bandRough',
};

/**
 * Y-05 · Insights.
 *
 * Every chart carries a one-line plain-language read beneath it. A chart without
 * an interpretation is decoration — the user should never have to work out what
 * they are supposed to notice.
 *
 * Free tier: 90 days.
 */
export default function Insights() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { logs, profile, settings, venues, plus } = useStore();
  const system = profile?.unitSystem ?? 'EU';

  // `cutoff` is computed INSIDE the memo. As a dependency it was a new number on
  // every render, so every aggregate below recomputed on every render — full
  // passes over the whole history, on every store change.
  const scoped = useMemo(() => {
    const cutoff = plus ? 0 : Date.now() - 90 * 86400000;
    return logs.filter((l) => !l.deleted && l.at >= cutoff);
  }, [logs, plus]);
  const weeks = useMemo(() => weekTotals(scoped, 8), [scoped]);
  const spend = useMemo(() => spendTotals(scoped), [scoped]);
  const nights = useMemo(() => summariseNights(scoped), [scoped]);

  const byDay = useMemo(() => {
    const totals = Array.from({ length: 7 }, () => 0);
    const counts = Array.from({ length: 7 }, () => 0);
    nights.forEach((n) => {
      totals[n.weekday] += n.totalG;
      counts[n.weekday] += 1;
    });
    return totals.map((t, i) => (counts[i] ? t / counts[i] : 0));
  }, [nights]);

  const last30 = nights.filter((n) => Date.now() - new Date(n.key).getTime() < 30 * 86400000);
  const prev30 = nights.filter((n) => {
    const age = Date.now() - new Date(n.key).getTime();
    return age >= 30 * 86400000 && age < 60 * 86400000;
  });
  const g30 = last30.reduce((s, n) => s + n.totalG, 0);
  const gPrev = prev30.reduce((s, n) => s + n.totalG, 0);
  const delta = gPrev > 0 ? Math.round(((g30 - gPrev) / gPrev) * 100) : null;

  const topVenues = useMemo(() => {
    const m = new Map<string, number>();
    scoped.forEach((l) => l.venueId && m.set(l.venueId, (m.get(l.venueId) ?? 0) + (l.priceMinor ?? 0)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [scoped]);

  if (nights.length === 0) {
    return (
      <Screen title={t('stats.insights')} back mood="calm">
        <EmptyState icon="chart.bar" title={t('stats.insightsEmptyTitle')} body={t('stats.insightsEmptyBody')} />
      </Screen>
    );
  }

  return (
    <Screen title={t('stats.insights')} subtitle={plus ? t('stats.insightsAllTime') : t('stats.insightsLast90')} back mood="calm">
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile
          label={t('stats.last30Days')}
          value={f.number(gramsToUnits(g30, system), 0)}
          caption={t(UNIT_LABEL[system])}
          icon="wineglass"
        />
        <StatTile
          label={t('stats.vsPrevious30')}
          value={
            delta === null
              ? '—'
              : delta > 0
                ? t('stats.deltaUp', { pct: f.number(delta, 0) })
                : t('stats.deltaDown', { pct: f.number(delta, 0) })
          }
          tint={delta === null ? color.label.tertiary : delta > 0 ? color.pace.quick : color.pace.steady}
          icon="chart.bar"
        />
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('stats.eightWeeks')}</Text>
        <View style={{ marginTop: space.m }}>
          <Sparkline values={weeks.map((w) => w.totalG)} height={52} />
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          {readWeeks(weeks.map((w) => w.totalG), t, f.number)}
        </Text>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('stats.spendHeader')}</Text>
        <Text variant="numericMedium" style={{ marginTop: space.xs }}>
          {t('stats.spendThisMonth', { amount: f.money(spend.month, profile?.currency ?? 'EUR') })}
        </Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.sm }}>
          {t('stats.spendPerNight', { amount: f.money(spend.perNight, profile?.currency ?? 'EUR') })}{' '}
          {new Date().getDate() < 7
            ? t('stats.spendTooEarly', { amount: f.money(spend.prevMonth, profile?.currency ?? 'EUR') })
            : t('stats.spendProjected', { amount: f.money(spend.projectedYear, profile?.currency ?? 'EUR') })}
        </Text>
        {topVenues.length > 0 ? (
          <View style={{ marginTop: space.md, gap: space.sm }}>
            {topVenues.map(([venueId, amount]) => (
              <View key={venueId} style={{ flexDirection: 'row' }}>
                <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
                  {venues.find((v) => v.id === venueId)?.name ?? t('stats.somewhere')}
                </Text>
                <Text variant="subheadline">{f.money(amount, profile?.currency ?? 'EUR')}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('stats.byDay')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, height: 80, marginTop: space.m }}>
          {byDay.map((v, i) => {
            const max = Math.max(1, ...byDay);
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: '100%',
                    height: Math.max(3, (v / max) * 58),
                    borderRadius: 4,
                    backgroundColor: v === max ? color.brand.tint : 'rgba(124,179,255,0.3)',
                  }}
                />
                <Text variant="caption2" tone="tertiary">{t(DAY_INITIALS[i])}</Text>
              </View>
            );
          })}
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          {t('stats.biggestNight', { day: t(DAY_SHORT[byDay.indexOf(Math.max(...byDay))]) })}
        </Text>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('stats.predictedVsActual')}</Text>
        <View style={{ marginTop: space.m, gap: space.sm }}>
          {nights.slice(0, 5).map((n) => {
            const forecast = hangoverForecast(n);
            return (
              <View key={n.key} style={{ flexDirection: 'row' }}>
                <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
                  {f.dayCompact(new Date(n.key).getTime())}
                </Text>
                <Text variant="subheadline" color={forecast.band === 'rough' ? color.pace.quick : color.label.primary}>
                  {t(BAND[forecast.band])}
                </Text>
              </View>
            );
          })}
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          {t('stats.morningTuneNote')}
        </Text>
      </Card>

    </Screen>
  );
}

function readWeeks(values: number[], t: TranslateFn, num: (n: number, digits?: number) => string): string {
  if (values.length < 3) return t('stats.weeksNotEnough');
  const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const before = values.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, values.length - 3);
  if (before === 0) return t('stats.weeksFirst');
  const pct = Math.round(((recent - before) / before) * 100);
  if (Math.abs(pct) < 10) return t('stats.weeksSteady');
  return pct > 0
    ? t('stats.weeksHeavier', { pct: num(pct, 0) })
    : t('stats.weeksLighter', { pct: num(Math.abs(pct), 0) });
}
