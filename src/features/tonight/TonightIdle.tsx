import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, StatTile, Avatar, EmptyState, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { useT, useFormat, type MessageKey } from '@/i18n';
import { computeStreaks, summariseNights, goalProgress } from '@/domain/stats';
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
  const t = useT();
  const f = useFormat();
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
  const firstName = profile?.displayName?.split(' ')[0] ?? '';
  const greeting = greetingKey(hour, firstName.length > 0);
  const nightOne = logs.length === 0 && !nextPlan && !lastSession;
  const planVenue = nextPlan ? leadingVenue(nextPlan) : null;

  return (
    <Screen
      title={t(greeting, { name: firstName })}
      subtitle={nightOne ? t('tonight.nothingLoggedYet') : undefined}
      mood="default"
      tabBarSpace
      right={{ icon: 'gearshape', label: t('ui.settings'), onPress: () => router.push('/settings') }}
      footer={<Button title={t('tonight.startNight')} onPress={() => router.push('/session/start')} />}
    >
      <InstallBanner />

      {!hydrated ? null : nightOne ? (
        <EmptyState
          icon="moon.stars"
          title={t('tonight.firstNightTitle')}
          body={t('tonight.firstNightBody')}
          actionLabel={t('tonight.startNight')}
          onAction={() => router.push('/session/start')}
        />
      ) : (
        <>
          {nextPlan ? (
            <Card
              aurora
              accent={color.night[1]}
              onPress={() => router.push(`/plan/${nextPlan.id}` as never)}
              accessibilityLabel={t('tonight.nextPlanLabel', { title: nextPlan.title })}
            >
              <Text variant="sectionHeader" tone="tertiary">{t('tonight.nextUp')}</Text>
              <Text variant="title2" style={{ marginTop: space.xs }}>{nextPlan.title}</Text>
              <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>
                {nextPlan.venueCandidates.length === 0
                  ? t('tonight.planWhen', {
                      day: f.weekday(nextPlan.startsAt),
                      time: f.clock(nextPlan.startsAt),
                    })
                  : planVenue
                    ? t('tonight.planWhenVenue', {
                        day: f.weekday(nextPlan.startsAt),
                        time: f.clock(nextPlan.startsAt),
                        venue: planVenue,
                      })
                    : t('tonight.planWhenVoting', {
                        day: f.weekday(nextPlan.startsAt),
                        time: f.clock(nextPlan.startsAt),
                      })}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.m }}>
                {nextPlan.invitees
                  .filter((i) => i.rsvp === 'yes')
                  .slice(0, 5)
                  .map((i) => (
                    <Avatar key={i.userId} name={i.displayName} size={28} />
                  ))}
                <Text variant="caption2" tone="tertiary" style={{ marginLeft: 4 }}>
                  {t('tonight.rsvpSummary', {
                    going: nextPlan.invitees.filter((i) => i.rsvp === 'yes').length,
                    maybe: nextPlan.invitees.filter((i) => i.rsvp === 'maybe').length,
                  })}
                </Text>
              </View>
            </Card>
          ) : (
            <Card onPress={() => router.push('/plan/new')} accessibilityLabel={t('tonight.planSomething')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <Icon name="calendar" size={20} color={color.label.tertiary} />
                <View style={{ flex: 1 }}>
                  <Text variant="headline">{t('tonight.nothingPlanned')}</Text>
                  <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
                    {t('tonight.nothingPlannedBody')}
                  </Text>
                </View>
                <Icon name="chevron.right" size={16} color={color.label.quaternary} />
              </View>
            </Card>
          )}

          <View style={{ flexDirection: 'row', gap: space.m }}>
            <StatTile
              label={t('tonight.dryStreak')}
              value={f.number(streaks.dryStreak)}
              caption={t('tonight.dryStreakUnit', { count: streaks.dryStreak })}
              tint={color.pace.steady}
              icon="flame"
            />
            <StatTile
              label={t('tonight.thisWeek')}
              value={
                weeklyProgress
                  ? f.number(gramsToUnits(weeklyProgress.value, profile?.unitSystem ?? 'EU'), 1)
                  : '—'
              }
              caption={
                weekly && weeklyProgress
                  ? t('tonight.thisWeekOf', {
                      amount: f.number(gramsToUnits(weekly.target, profile?.unitSystem ?? 'EU')),
                      unit: t(UNIT_LABEL[profile?.unitSystem ?? 'EU']),
                    })
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
              label={t('tonight.weeklyGoal')}
            />
          ) : null}

          {lastSession && lastNight ? (
            <Card
              onPress={() => router.push(`/session/${lastSession.id}` as never)}
              accessibilityLabel={t('tonight.lastNightLabel')}
              accent={color.night[lastSession.accentIndex % 4]}
            >
              <Text variant="sectionHeader" tone="tertiary">
                {Date.now() - (lastSession.endedAt ?? 0) < 36 * 3600000
                  ? t('tonight.lastNight')
                  : t('tonight.lastNightDate', {
                      weekday: f.weekday(lastSession.startedAt),
                      date: f.dayLong(lastSession.startedAt),
                    }).toUpperCase()}
              </Text>
              <Text variant="headline" style={{ marginTop: space.xs }}>
                {venues.find((v) => v.id === lastSession.venueId)?.name ?? t('tonight.aNightOut')}
              </Text>
              <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>
                {t('tonight.lastNightSummary', {
                  duration: f.duration((lastSession.endedAt ?? 0) - lastSession.startedAt),
                  count: lastNight.drinks,
                  money: f.money(lastNight.spendMinor, profile?.currency ?? 'EUR'),
                })}
              </Text>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  );
}

/** The venue in the lead, or null while nobody has voted. */
function leadingVenue(plan: Plan): string | null {
  const sorted = [...plan.venueCandidates].sort((a, b) => b.votes.length - a.votes.length);
  if (sorted.length === 0) return null;
  if (sorted[0].votes.length === 0) return null;
  return sorted[0].name;
}

/** The greeting depends on the hour, and on whether ROUNDS knows your name. */
function greetingKey(hour: number, named: boolean): MessageKey {
  if (hour < 5) return named ? 'tonight.greetingStillUpNamed' : 'tonight.greetingStillUp';
  if (hour < 12) return named ? 'tonight.greetingMorningNamed' : 'tonight.greetingMorning';
  if (hour < 18) return named ? 'tonight.greetingAfternoonNamed' : 'tonight.greetingAfternoon';
  return named ? 'tonight.greetingEveningNamed' : 'tonight.greetingEvening';
}
