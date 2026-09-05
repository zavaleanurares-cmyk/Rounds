import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen, Card, Text, Avatar, QuickAction, Sparkline, Icon, EmptyState, NavRow, Group,
  LevelBar, Enter, DrinkGlyph,
} from '@/ui';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import { useProgress } from '@/hooks/useProgress';
import { CATALOG } from '@/domain/catalog';
import { spendTotals, weekTotals, heatmap, summariseNights } from '@/domain/stats';
import { color, space, radius } from '@/design/tokens';

/**
 * Y-01 · You.
 *
 * Spend leads, because people moderate for their wallet far more reliably than
 * for their liver, and it is the highest-signal number the app has that isn't
 * about alcohol.
 *
 * The heatmap depth is the one thing `plus` gates. While billing is hidden it
 * is hard true, so this shows the full range to everybody.
 */
export default function You() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
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
  const handle = profile?.username || t('stats.usernameFallback');

  return (
    <Screen
      title={t('stats.title')}
      mood="calm"
      tabBarSpace
      right={{ icon: 'gearshape', label: t('ui.settings'), onPress: () => router.push('/settings') }}
    >
      <Enter from="fade">
        <Pressable
          onPress={() => router.push('/profile/edit')}
          accessibilityRole="button"
          accessibilityLabel={t('stats.editProfile')}
          accessibilityHint={t('stats.editProfileHint')}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, gap: space.md })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Avatar
              name={profile?.displayName || t('stats.you')}
              url={profile?.avatarUrl}
              tint={profile?.avatarTint}
              size={56}
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Text variant="title3" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {profile?.displayName || t('stats.you')}
                </Text>
                {signature ? <DrinkGlyph drink={signature} size={22} simple /> : null}
              </View>
              <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                {profile?.homeCity
                  ? t('stats.handleCity', { username: handle, city: profile.homeCity })
                  : t('stats.handle', { username: handle })}
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
          title={t('stats.emptyTitle')}
          body={t('stats.emptyBody')}
          actionLabel={t('stats.startNight')}
          onAction={() => router.push('/session/start')}
        />
      ) : (
        <Card aurora accent={color.pace.quick}>
          <Text variant="sectionHeader" tone="tertiary">{t('stats.spentThisYear')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm, marginTop: space.xs }}>
            <Text variant="numericLarge">{f.money(spend.year, profile?.currency ?? 'EUR')}</Text>
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
                  {spend.trendPct > 0
                    ? t('stats.trendUp', { pct: f.number(spend.trendPct) })
                    : t('stats.trendDown', { pct: f.number(spend.trendPct) })}
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
            {t('stats.perNight', { amount: f.money(spend.perNight, profile?.currency ?? 'EUR') })}
          </Text>
          <View style={{ marginTop: space.md }}>
            <Sparkline values={weeks.map((w) => w.spendMinor)} />
          </View>
        </Card>
      )}

      <View style={{ flexDirection: 'row', gap: space.m }}>
        <QuickAction label={t('stats.insights')} icon="chart.bar" onPress={() => router.push('/insights')} />
        <QuickAction label={t('stats.goals')} icon="checkmark.shield" onPress={() => router.push('/wellbeing')} />
        <QuickAction label={t('stats.wrapped')} icon="sparkles" onPress={() => router.push(`/wrapped/${new Date().getFullYear()}` as never)} />
        <QuickAction label={t('stats.passport')} icon="location" onPress={() => router.push('/passport')} />
      </View>

      {!nightOne ? (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="sectionHeader" tone="tertiary" style={{ flex: 1 }}>
              {t('stats.lastNights', { count: days })}
            </Text>
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
        <Group title={t('stats.recentNights')}>
          {recent.map((s, i) => {
            const n = nights.find((x) => x.key === s.nightKey);
            return (
              <NavRow
                key={s.id}
                title={venues.find((v) => v.id === s.venueId)?.name ?? t('stats.aNightOut')}
                subtitle={t('stats.nightRow', {
                  date: f.dayCompact(s.startedAt),
                  duration: f.duration((s.endedAt ?? 0) - s.startedAt),
                  count: n?.drinks ?? 0,
                })}
                onPress={() => router.push(`/session/${s.id}` as never)}
                last={i === recent.length - 1}
              />
            );
          })}
        </Group>
      ) : null}

      <NavRowCard onPress={() => router.push('/nights')} label={t('stats.allNights')} icon="calendar" />
      <NavRowCard onPress={() => router.push('/achievements')} label={t('stats.achievements')} icon="star" />
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
