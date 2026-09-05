import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen, Card, Text, Avatar, QuickAction, Sparkline, Icon, EmptyState, NavRow, Group,
  LevelBar, Enter, DrinkGlyph,
} from '@/ui';
import { useStore } from '@/data/store';
import { useProgress } from '@/hooks/useProgress';
import { CATALOG } from '@/domain/catalog';
import { spendTotals, weekTotals, heatmap, summariseNights, formatMoney, formatDuration, plural } from '@/domain/stats';
import { color, space, radius } from '@/design/tokens';

/**
 * Y-01 · You.
 *
 * Spend leads, because people moderate for their wallet far more reliably than
 * for their liver, and it is the highest-signal number the app has that isn't
 * about alcohol.
 *
 * Free tier shows 90 days of heatmap and spend; the full year prompts ROUNDS+.
 */
export default function You() {
  const router = useRouter();
  const { profile, logs, sessions, settings, venues , plus } = useStore();

  const spend = useMemo(() => spendTotals(logs), [logs]);
  const weeks = useMemo(() => weekTotals(logs, 8), [logs]);
  const days = plus ? 400 : 90;
  const grid = useMemo(() => heatmap(logs, days), [logs, days]);
  const recent = useMemo(
    () => sessions.filter((s) => s.endedAt).sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0)).slice(0, 3),
    [sessions]
  );
  const nights = useMemo(() => summariseNights(logs), [logs]);
  const nightOne = logs.length === 0;
  const { progress } = useProgress();
  const signature = useMemo(
    () => CATALOG.find((d) => d.id === profile?.signatureDrinkId) ?? null,
    [profile?.signatureDrinkId]
  );

  return (
    <Screen
      title="You"
      mood="calm"
      tabBarSpace
      right={{ icon: 'gearshape', label: 'Settings', onPress: () => router.push('/settings') }}
    >
      <Enter from="fade">
        <Pressable
          onPress={() => router.push('/profile/edit')}
          accessibilityRole="button"
          accessibilityLabel="Edit your profile"
          accessibilityHint="Name, handle, photo, colour and the line about you"
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, gap: space.md })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Avatar
              name={profile?.displayName || 'You'}
              url={profile?.avatarUrl}
              tint={profile?.avatarTint}
              size={56}
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Text variant="title3" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {profile?.displayName || 'You'}
                </Text>
                {signature ? <DrinkGlyph drink={signature} size={22} simple /> : null}
              </View>
              <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                @{profile?.username || 'you'}
                {profile?.homeCity ? ` · ${profile.homeCity}` : ''}
              </Text>
              {profile?.bio ? (
                <Text variant="footnote" tone="secondary" numberOfLines={2} style={{ marginTop: 2 }}>
                  {profile.bio}
                </Text>
              ) : null}
            </View>
            <Icon name="chevron.right" size={15} color={color.label.quaternary} />
          </View>

          <LevelBar
            level={progress.level}
            fraction={progress.fraction}
            intoLevel={progress.intoLevel}
            levelSpan={progress.levelSpan}
          />
        </Pressable>
      </Enter>

      {nightOne ? (
        <EmptyState
          icon="chart.bar"
          title="Nothing to show yet"
          body="After your first night this fills with what you spent, where you went and how the weeks compare. Nothing here is shared with anyone."
          actionLabel="Start a night"
          onAction={() => router.push('/session/start')}
        />
      ) : (
        <Card aurora accent={color.pace.quick}>
          <Text variant="sectionHeader" tone="tertiary">SPENT THIS YEAR</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, marginTop: space.xs }}>
            <Text variant="numericLarge">{formatMoney(spend.year, profile?.currency ?? 'EUR')}</Text>
            {spend.trendPct !== null ? (
              <View
                style={{
                  paddingHorizontal: space.sm,
                  paddingVertical: 3,
                  borderRadius: radius.capsule,
                  backgroundColor: spend.trendPct > 0 ? 'rgba(255,159,10,0.16)' : 'rgba(48,209,88,0.16)',
                  marginBottom: 6,
                }}
              >
                <Text variant="caption1" color={spend.trendPct > 0 ? color.pace.quick : color.pace.steady}>
                  {spend.trendPct > 0 ? '+' : ''}{spend.trendPct}% vs last month
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
            {formatMoney(spend.perNight, profile?.currency ?? 'EUR')} a night on average
          </Text>
          <View style={{ marginTop: space.md }}>
            <Sparkline values={weeks.map((w) => w.spendMinor)} />
          </View>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: space.m }}>
        <QuickAction label="Insights" icon="chart.bar" onPress={() => router.push('/insights')} />
        <QuickAction label="Goals" icon="checkmark.shield" onPress={() => router.push('/wellbeing')} />
        <QuickAction label="Wrapped" icon="sparkles" onPress={() => router.push(`/wrapped/${new Date().getFullYear()}` as never)} />
        <QuickAction label="Passport" icon="location" onPress={() => router.push('/passport')} />
      </View>

      {!nightOne ? (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="sectionHeader" tone="tertiary" style={{ flex: 1 }}>
              {plus ? 'LAST 400 NIGHTS' : 'LAST 90 NIGHTS'}
            </Text>
            {!plus ? (
              <Pressable onPress={() => router.push('/paywall')} hitSlop={8} accessibilityRole="button" accessibilityLabel="See the full year with ROUNDS plus">
                <Text variant="caption1" color={color.brand.tintLight}>See the full year</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: space.m }}>
            {grid.map((d) => (
              <View
                key={d.key}
                accessibilityElementsHidden
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  backgroundColor:
                    d.level === 0
                      ? 'rgba(255,255,255,0.05)'
                      : `rgba(59,130,246,${0.22 + d.level * 0.19})`,
                }}
              />
            ))}
          </View>
        </Card>
      ) : null}

      {recent.length > 0 ? (
        <Group title="RECENT NIGHTS">
          {recent.map((s, i) => {
            const n = nights.find((x) => x.key === s.nightKey);
            return (
              <NavRow
                key={s.id}
                title={venues.find((v) => v.id === s.venueId)?.name ?? 'A night out'}
                subtitle={`${new Date(s.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · ${formatDuration((s.endedAt ?? 0) - s.startedAt)} · ${plural(n?.drinks ?? 0, 'drink')}`}
                onPress={() => router.push(`/session/${s.id}` as never)}
                last={i === recent.length - 1}
              />
            );
          })}
        </Group>
      ) : null}

      <NavRowCard onPress={() => router.push('/nights')} label="All nights" icon="calendar" />
      <NavRowCard onPress={() => router.push('/achievements')} label="Achievements" icon="star" />
    </Screen>
  );
}

function NavRowCard({ onPress, label, icon }: { onPress: () => void; label: string; icon: 'calendar' | 'star' }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.m,
        minHeight: 54,
        paddingHorizontal: space.md,
        borderRadius: radius.card,
        backgroundColor: color.surface.primary,
        borderWidth: 1,
        borderColor: color.card.rim,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name={icon} size={18} color={color.label.secondary} />
      <Text variant="body" style={{ flex: 1 }}>{label}</Text>
      <Icon name="chevron.right" size={15} color={color.label.quaternary} />
    </Pressable>
  );
}
