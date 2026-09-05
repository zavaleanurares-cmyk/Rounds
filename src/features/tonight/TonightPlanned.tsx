import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Button, Avatar, AvatarStack } from '@/ui';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import { useTick } from '@/hooks/useTick';
import type { Plan, Session } from '@/domain/types';
import { color, space } from '@/design/tokens';

/**
 * T-02 · Tonight · Planned.
 *
 * Same shell as idle, hero replaced by a countdown. "Start the night" creates a
 * session with `plan_id` set and every RSVP-yes person pre-added as a
 * participant — the plan is the thing that makes the shared night possible
 * without anybody scanning anything.
 */
export function TonightPlanned({ plan, lastSession }: { plan: Plan; lastSession: Session | null }) {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { startSession, profile } = useStore();
  const now = useTick(30_000);
  const ms = plan.startsAt - now;

  const leading = [...plan.venueCandidates].sort((a, b) => b.votes.length - a.votes.length)[0];
  const going = plan.invitees.filter((i) => i.rsvp === 'yes');
  const maybe = plan.invitees.filter((i) => i.rsvp === 'maybe');
  const firstName = profile?.displayName?.split(' ')[0] ?? '';

  return (
    <Screen
      title={firstName ? t('tonight.plannedTitleNamed', { name: firstName }) : t('tonight.plannedTitle')}
      mood="default"
      tabBarSpace
      right={{ icon: 'gearshape', label: t('ui.settings'), onPress: () => router.push('/settings') }}
      footer={
        <Button
          title={t('tonight.startTheNight')}
          onPress={() => {
            const s = startSession({
              planId: plan.id,
              venueId: leading?.venueId ?? null,
              title: plan.title,
              visibility: 'friends',
            });
            router.replace('/(tabs)/tonight');
            void s;
          }}
        />
      }
    >
      <Card aurora accent={color.night[1]} onPress={() => router.push(`/plan/${plan.id}` as never)}>
        <Text variant="sectionHeader" tone="tertiary">{t('tonight.startsIn')}</Text>
        <Text variant="numericLarge" style={{ marginTop: space.xs }}>
          {ms <= 0 ? t('tonight.startsNow') : f.duration(ms)}
        </Text>
        <Text variant="title3" style={{ marginTop: space.m }}>{plan.title}</Text>
        <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>
          {leading && leading.votes.length > 0
            ? t('tonight.plannedWhenVenue', { time: f.clock(plan.startsAt), venue: leading.name })
            : t('tonight.plannedWhenVoting', { time: f.clock(plan.startsAt) })}
        </Text>
        <View style={{ marginTop: space.md, flexDirection: 'row', alignItems: 'center', gap: space.m }}>
          <AvatarStack names={going.map((g) => g.displayName)} />
          <Text variant="caption2" tone="tertiary">
            {t('tonight.rsvpSummary', { going: going.length, maybe: maybe.length })}
          </Text>
        </View>
      </Card>

      {plan.note ? (
        <Card>
          <Text variant="subheadline" tone="secondary">{plan.note}</Text>
        </Card>
      ) : null}

      <Card onPress={() => router.push(`/plan/${plan.id}` as never)}>
        <Text variant="sectionHeader" tone="tertiary">{t('tonight.where')}</Text>
        <View style={{ marginTop: space.sm, gap: space.sm }}>
          {plan.venueCandidates.map((c) => (
            <View key={c.venueId} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Text variant="subheadline" style={{ flex: 1 }}>{c.name}</Text>
              <View style={{ flexDirection: 'row' }}>
                {c.votes.slice(0, 3).map((v, i) => (
                  <View key={v} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                    <Avatar name={v === 'me' ? t('tonight.you') : v} size={22} />
                  </View>
                ))}
              </View>
              <Text variant="caption1" tone="tertiary" style={{ width: 22, textAlign: 'right' }}>
                {c.votes.length}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {lastSession ? (
        <Text variant="footnote" tone="quaternary" center>
          {t('tonight.startNightNote')}
        </Text>
      ) : null}
    </Screen>
  );
}
