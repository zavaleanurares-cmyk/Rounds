import React from 'react';
import { View } from 'react-native';
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
  const { crews, people, plans, sessions } = useStore();
  const crew = crews.find((c) => c.slug === slug);

  if (!crew) return <Screen title={t('social.crewTitle')} back><EmptyState title={t('social.crewNotFoundTitle')} body={t('social.crewNotFoundBody')} icon="person.2" /></Screen>;

  const members = people.filter((p) => crew.memberIds.includes(p.id));
  const crewPlans = plans.filter((p) => p.crewId === crew.id);

  const board = [
    { name: t('social.you'), nights: sessions.length, venues: 6, quests: 3 },
    ...members.map((m, i) => ({ name: m.displayName, nights: m.sharedNights, venues: 4 - i, quests: 2 })),
  ].sort((a, b) => b.nights - a.nights);

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
            <View key={row.name} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Text variant="numericSmall" tone="tertiary" style={{ width: 22 }}>{i + 1}</Text>
              <Avatar name={row.name} size={30} />
              <Text variant="body" style={{ flex: 1 }}>{row.name}</Text>
              <Text variant="footnote" tone="secondary">
                {t('social.boardRow', {
                  count: row.nights,
                  places: t('social.boardPlaces', { count: row.venues }),
                })}
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
    </Screen>
  );
}
