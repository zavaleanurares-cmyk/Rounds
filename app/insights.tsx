import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Sparkline, EmptyState, StatTile } from '@/ui';
import { useStore } from '@/data/store';
import { weekTotals, spendTotals, summariseNights, formatMoney, hangoverForecast } from '@/domain/stats';
import { gramsToUnits, UNIT_LABEL } from '@/domain/units';
import { color, space } from '@/design/tokens';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  const { logs, profile, settings, venues , plus } = useStore();
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
      <Screen title="Insights" back mood="calm">
        <EmptyState icon="chart.bar" title="Not enough nights yet" body="After three or four nights the patterns start being real rather than noise. Come back then." />
      </Screen>
    );
  }

  return (
    <Screen title="Insights" subtitle={plus ? 'All time' : 'Last 90 days'} back mood="calm">
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile
          label="Last 30 days"
          value={gramsToUnits(g30, system).toFixed(0)}
          caption={UNIT_LABEL[system]}
          icon="wineglass"
        />
        <StatTile
          label="vs previous 30"
          value={delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}%`}
          tint={delta === null ? color.label.tertiary : delta > 0 ? color.pace.quick : color.pace.steady}
          icon="chart.bar"
        />
      </View>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">EIGHT WEEKS</Text>
        <View style={{ marginTop: space.m }}>
          <Sparkline values={weeks.map((w) => w.totalG)} height={52} />
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          {readWeeks(weeks.map((w) => w.totalG))}
        </Text>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">SPEND</Text>
        <Text variant="numericMedium" style={{ marginTop: space.xs }}>
          {formatMoney(spend.month, profile?.currency ?? 'EUR')} this month
        </Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.sm }}>
          {formatMoney(spend.perNight, profile?.currency ?? 'EUR')} a night on average.{' '}
          {new Date().getDate() < 7
            ? `Too early in the month to call it — last month was ${formatMoney(spend.prevMonth, profile?.currency ?? 'EUR')}.`
            : `At this rate that's ${formatMoney(spend.projectedYear, profile?.currency ?? 'EUR')} over a year.`}
        </Text>
        {topVenues.length > 0 ? (
          <View style={{ marginTop: space.md, gap: space.sm }}>
            {topVenues.map(([venueId, amount]) => (
              <View key={venueId} style={{ flexDirection: 'row' }}>
                <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
                  {venues.find((v) => v.id === venueId)?.name ?? 'Somewhere'}
                </Text>
                <Text variant="subheadline">{formatMoney(amount, profile?.currency ?? 'EUR')}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">BY DAY</Text>
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
                <Text variant="caption2" tone="tertiary">{DAYS[i][0]}</Text>
              </View>
            );
          })}
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          {DAYS[byDay.indexOf(Math.max(...byDay))]} is consistently your biggest night.
        </Text>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">PREDICTED VS ACTUAL</Text>
        <View style={{ marginTop: space.m, gap: space.sm }}>
          {nights.slice(0, 5).map((n) => {
            const f = hangoverForecast(n);
            return (
              <View key={n.key} style={{ flexDirection: 'row' }}>
                <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
                  {new Date(n.key).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </Text>
                <Text variant="subheadline" color={f.band === 'rough' ? color.pace.quick : color.label.primary}>
                  {f.band}
                </Text>
              </View>
            );
          })}
        </View>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: space.m }}>
          Answering "how do you feel" each morning is what tunes this to you rather than to averages.
        </Text>
      </Card>

      {!plus ? (
        <Button title="See all of it with ROUNDS+" kind="glass" onPress={() => router.push('/paywall')} />
      ) : null}
    </Screen>
  );
}

function readWeeks(values: number[]): string {
  if (values.length < 3) return 'Not enough weeks yet to call a trend.';
  const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const before = values.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, values.length - 3);
  if (before === 0) return 'Your first weeks of data.';
  const pct = Math.round(((recent - before) / before) * 100);
  if (Math.abs(pct) < 10) return 'Steady — the last three weeks look like the ones before them.';
  return pct > 0
    ? `The last three weeks are about ${pct}% heavier than the ones before.`
    : `The last three weeks are about ${Math.abs(pct)}% lighter than the ones before.`;
}
