import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, StatTile, Avatar, EmptyState, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { computeStreaks, summariseNights, goalProgress, formatMoney, formatDuration, plural } from '@/domain/stats';
import { gramsToUnits, UNIT_LABEL } from '@/domain/units';
import type { Plan, Session } from '@/domain/types';
import { color, space } from '@/design/tokens';
import { ProgressBar } from '@/ui';
import { InstallBanner } from '@/features/web/InstallBanner';

/**
 * T-01 · Tonight · Idle.
 *
 * The zero-data state is the one that matters: on night one there is no plan, no
 * streak and no last night, and a shrug here is where the app loses the user. So
 * night one gets its own card with one action rather than three empty tiles.
 */
export function TonightIdle({ nextPlan, lastSession }: { nextPlan: Plan | null; lastSession: Session | null }) {
  const router = useRouter();
  const { profile, logs, goals, venues, hydrated } = useStore();

  const streaks = useMemo(() => computeStreaks(logs), [logs]);
  const weekly = goals.find((g) => g.type === 'weekly_cap');
  const weeklyProgress = useMemo(
    () => (weekly ? goalProgress(logs, weekly) : null),
    [logs, weekly]
  );
  const lastNight = useMemo(() => {
    if (!lastSession) return null;
    const summary = summariseNights(logs).find((n) => n.key === lastSession.nightKey);
    return summary ?? null;
  }, [logs, lastSession]);

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Still up' : hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
  const firstName = profile?.displayName?.split(' ')[0] ?? '';
  const nightOne = logs.length === 0 && !nextPlan && !lastSession;

  return (
    <Screen
      title={`${greeting}${firstName ? `, ${firstName}` : ''}`}
      subtitle={nightOne ? 'Nothing logged yet.' : undefined}
      mood="default"
      tabBarSpace
      right={{ icon: 'gearshape', label: 'Settings', onPress: () => router.push('/settings') }}
      footer={<Button title="Start a night" onPress={() => router.push('/session/start')} />}
    >
      <InstallBanner />

      {!hydrated ? null : nightOne ? (
        <EmptyState
          icon="moon.stars"
          title="Your first night"
          body="Start a night when you head out. Log what you drink with one tap, and tomorrow morning ROUNDS shows you where you went, what it cost, and how it went."
          actionLabel="Start a night"
          onAction={() => router.push('/session/start')}
        />
      ) : (
        <>
          {nextPlan ? (
            <Card
              aurora
              accent={color.night[1]}
              onPress={() => router.push(`/plan/${nextPlan.id}` as never)}
              accessibilityLabel={`Next plan: ${nextPlan.title}`}
            >
              <Text variant="sectionHeader" tone="tertiary">NEXT UP</Text>
              <Text variant="title2" style={{ marginTop: space.xs }}>{nextPlan.title}</Text>
              <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>
                {new Date(nextPlan.startsAt).toLocaleDateString(undefined, { weekday: 'long' })} ·{' '}
                {new Date(nextPlan.startsAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                {nextPlan.venueCandidates.length ? ` · ${leadingVenue(nextPlan)}` : ''}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.m }}>
                {nextPlan.invitees
                  .filter((i) => i.rsvp === 'yes')
                  .slice(0, 5)
                  .map((i) => (
                    <Avatar key={i.userId} name={i.displayName} size={28} />
                  ))}
                <Text variant="caption2" tone="tertiary" style={{ marginLeft: 4 }}>
                  {nextPlan.invitees.filter((i) => i.rsvp === 'yes').length} in ·{' '}
                  {nextPlan.invitees.filter((i) => i.rsvp === 'maybe').length} maybe
                </Text>
              </View>
            </Card>
          ) : (
            <Card onPress={() => router.push('/plan/new')} accessibilityLabel="Plan something">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <Icon name="calendar" size={20} color={color.label.tertiary} />
                <View style={{ flex: 1 }}>
                  <Text variant="headline">Nothing planned</Text>
                  <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
                    Put something in the calendar and your crew can vote on where.
                  </Text>
                </View>
                <Icon name="chevron.right" size={16} color={color.label.quaternary} />
              </View>
            </Card>
          )}

          <View style={{ flexDirection: 'row', gap: space.m }}>
            <StatTile
              label="Dry streak"
              value={`${streaks.dryStreak}`}
              caption={streaks.dryStreak === 1 ? 'night' : 'nights'}
              tint={color.pace.steady}
              icon="flame"
            />
            <StatTile
              label="This week"
              value={
                weeklyProgress
                  ? `${gramsToUnits(weeklyProgress.value, profile?.unitSystem ?? 'EU').toFixed(1)}`
                  : '—'
              }
              caption={
                weekly && weeklyProgress
                  ? `of ${gramsToUnits(weekly.target, profile?.unitSystem ?? 'EU').toFixed(0)} ${UNIT_LABEL[profile?.unitSystem ?? 'EU']}`
                  : undefined
              }
              icon="chart.bar"
              onPress={() => router.push('/wellbeing')}
            />
          </View>

          {weeklyProgress ? (
            <ProgressBar
              value={weeklyProgress.pct}
              tint={weeklyProgress.pct > 1 ? color.pace.quick : color.brand.tint}
              label="Weekly goal"
            />
          ) : null}

          {lastSession && lastNight ? (
            <Card
              onPress={() => router.push(`/session/${lastSession.id}` as never)}
              accessibilityLabel="Your last night"
              accent={color.night[lastSession.accentIndex % 4]}
            >
              <Text variant="sectionHeader" tone="tertiary">
                {Date.now() - (lastSession.endedAt ?? 0) < 36 * 3600000
                  ? 'LAST NIGHT'
                  : new Date(lastSession.startedAt)
                      .toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
                      .toUpperCase()}
              </Text>
              <Text variant="headline" style={{ marginTop: space.xs }}>
                {venues.find((v) => v.id === lastSession.venueId)?.name ?? 'A night out'}
              </Text>
              <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>
                {formatDuration((lastSession.endedAt ?? 0) - lastSession.startedAt)} ·{' '}
                {plural(lastNight.drinks, 'drink')} ·{' '}
                {formatMoney(lastNight.spendMinor, profile?.currency ?? 'EUR')}
              </Text>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function leadingVenue(plan: Plan): string {
  const sorted = [...plan.venueCandidates].sort((a, b) => b.votes.length - a.votes.length);
  if (sorted.length === 0) return 'no venue yet';
  if (sorted[0].votes.length === 0) return 'still voting';
  return sorted[0].name;
}
