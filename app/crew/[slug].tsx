import React from 'react';
import { View, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, Avatar, NavRow, Group, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * C-09 · Crew detail.
 *
 * Order is deliberate: PLANS first, then nights together, then chat, then the
 * leaderboard, then members. A crew that only has chat and a leaderboard does
 * not retain; a crew that has a plan in it does.
 *
 * The leaderboard ranks nights together, venues explored, quests completed and
 * rounds bought. NEVER drinks, units, or a drinking streak — that is both a
 * store-review risk and the wrong signal to send.
 */
export default function CrewDetail() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const store = useStore();
  const { crews, people, plans, sessions } = store;
  const crew = crews.find((c) => c.slug === slug);

  if (!crew) return <Screen title={t('social.crewTitle')} back><EmptyState title={t('social.crewNotFoundTitle')} body={t('social.crewNotFoundBody')} icon="person.2" /></Screen>;

  const members = people.filter((p) => crew.memberIds.includes(p.id));
  const crewPlans = plans.filter((p) => p.crewId === crew.id);

  /**
   * Nights out together, and only that — with each of them, not against them.
   *
   * This board used to carry `venues: 6` and `quests: 3` for you and
   * `venues: 4 - i, quests: 2` for everybody else — literals, with the venue
   * count going negative on the fifth member, under a header reading "Nights
   * out together, places explored, quests done". `quests` was computed and
   * never even rendered.
   *
   * It also put YOU in the ranking, counting `sessions.length` — every night
   * you have ever recorded, the solo ones included — against everybody else's
   * `sharedNights`, which was hard-coded 0. You came first every time, by
   * construction.
   *
   * The number that actually exists is "nights you and this person were both
   * scanned into", so the card is now a list of exactly that. Your own row is
   * gone: you cannot share a night with yourself, and a leaderboard where the
   * metric is your own presence is not a ranking of anything.
   */
  const board = members
    .map((m) => ({ id: m.id, name: m.displayName, nights: m.sharedNights }))
    .sort((a, b) => b.nights - a.nights);

  return (
    <Screen
      title={crew.name}
      subtitle={t('ui.people', { count: crew.memberIds.length })}
      back
      mood="calm"
      accent={color.night[crew.accentIndex % 4]}
      footer={<Button title={t('social.planSomething')} onPress={() => router.push('/plan/new')} />}
    >
      <Card aurora accent={color.night[crew.accentIndex % 4]}>
        <Text variant="sectionHeader" tone="tertiary">{t('social.plans')}</Text>
        {crewPlans.length === 0 ? (
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.sm }}>
            {t('social.crewNoPlans')}
          </Text>
        ) : (
          crewPlans.map((p) => (
            <NavRow
              key={p.id}
              title={p.title}
              subtitle={t('social.crewPlanWhen', {
                day: f.weekdayShort(p.startsAt),
                time: f.clock(p.startsAt),
              })}
              onPress={() => router.push(`/plan/${p.id}` as never)}
              last
            />
          ))
        )}
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('social.together')}</Text>
        <Text variant="footnote" tone="quaternary" style={{ marginTop: 2 }}>
          {t('social.togetherNote')}
        </Text>
        <View style={{ marginTop: space.m, gap: space.m }}>
          {board.map((row, i) => (
            <View key={row.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Text variant="numericSmall" tone="tertiary" style={{ width: 22 }}>{i + 1}</Text>
              <Avatar name={row.name} size={30} />
              <Text variant="body" style={{ flex: 1 }}>{row.name}</Text>
              <Text variant="footnote" tone="secondary">
                {t('social.boardNights', { count: row.nights })}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Group title={t('social.members')}>
        {members.map((m, i) => (
          <NavRow key={m.id} title={m.displayName} subtitle={t('social.handle', { username: m.username })} onPress={() => router.push(`/people/${m.id}` as never)} last={i === members.length - 1} />
        ))}
      </Group>

      {/*
        Leaving removes this account's membership and nothing else. A crew
        outlives the person who walks out of it, so this is not a delete — and
        it asks first, because there is no undo from here.
      */}
      <Button
        title={t('social.leaveCrew')}
        kind="destructive"
        onPress={() =>
          Alert.alert(t('social.leaveCrewTitle', { name: crew.name }), t('social.leaveCrewBody'), [
            { text: t('ui.cancel'), style: 'cancel' },
            {
              text: t('social.leaveCrew'),
              style: 'destructive',
              onPress: () => {
                store.leaveCrew(crew.id);
                router.replace('/(tabs)/circle');
              },
            },
          ])
        }
      />
    </Screen>
  );
}
