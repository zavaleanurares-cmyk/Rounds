import React from 'react';
import { View, Pressable, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, Avatar, Segmented, ProgressBar, Icon, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import type { Rsvp } from '@/domain/types';
import { useT, useFormat } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * D-06 · Plan detail.
 *
 * Plans are the sober-day reason to open the app, and the acquisition loop: the
 * invite link's web preview is a real page with OG tags, and it is the only
 * surface ROUNDS has for people who haven't installed it.
 */
export default function PlanDetail() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const plan = store.plans.find((p) => p.id === id);
  const me = store.auth.userId ?? 'me';

  if (!plan) return <Screen title={t('plan.title')} back><EmptyState title={t('plan.notFoundTitle')} body={t('plan.notFoundBody')} icon="calendar" /></Screen>;

  const myRsvp = plan.invitees.find((i) => i.userId === me)?.rsvp ?? null;
  const going = plan.invitees.filter((i) => i.rsvp === 'yes');
  const totalVotes = plan.venueCandidates.reduce((s, c) => s + c.votes.length, 0);

  return (
    <Screen
      title={plan.title}
      subtitle={t('plan.detailWhen', { day: f.weekday(plan.startsAt), time: f.clock(plan.startsAt) })}
      back
      mood="default"
      accent={color.night[1]}
      right={{
        icon: 'square.and.arrow.up',
        label: t('plan.invite'),
        onPress: () =>
          void Share.share({
            message: t('plan.shareMessage', { title: plan.title, url: `https://rounds.app/p/${plan.id}` }),
          }),
      }}
      footer={
        <Button
          title={t('plan.startTheNight')}
          onPress={() => {
            const leading = [...plan.venueCandidates].sort((a, b) => b.votes.length - a.votes.length)[0];
            store.startSession({ planId: plan.id, venueId: leading?.venueId ?? null, title: plan.title, visibility: 'friends' });
            router.replace('/(tabs)/tonight');
          }}
        />
      }
    >
      <Card aurora accent={color.night[1]}>
        <Text variant="sectionHeader" tone="tertiary">{t('plan.areYouIn')}</Text>
        <View style={{ marginTop: space.m }}>
          <Segmented
            label={t('plan.rsvpLabel')}
            value={(myRsvp ?? 'none') as string}
            onChange={(v) => store.setRsvp(plan.id, (v === 'none' ? null : v) as Rsvp)}
            options={[
              { value: 'yes', label: t('plan.rsvpIn') },
              { value: 'maybe', label: t('plan.rsvpMaybe') },
              { value: 'no', label: t('plan.rsvpOut') },
            ]}
          />
        </View>
        {plan.note ? (
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.md }}>{plan.note}</Text>
        ) : null}
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('plan.whereOneVote')}</Text>
        <View style={{ marginTop: space.m, gap: space.md }}>
          {plan.venueCandidates.map((c) => {
            const mine = c.votes.includes(me);
            return (
              <Pressable
                key={c.venueId}
                onPress={() => store.voteVenue(plan.id, c.venueId)}
                accessibilityRole="button"
                accessibilityState={{ selected: mine }}
                accessibilityLabel={t('plan.venueVotesLabel', { name: c.name, count: c.votes.length })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                  <Icon name={mine ? 'checkmark' : 'location'} size={17} color={mine ? color.brand.tintLight : color.label.tertiary} />
                  <Text variant="body" style={{ flex: 1 }} color={mine ? color.brand.tintLight : color.label.primary}>
                    {c.name}
                  </Text>
                  <Text variant="footnote" tone="tertiary">{c.votes.length}</Text>
                </View>
                <View style={{ marginTop: space.sm }}>
                  <ProgressBar value={totalVotes ? c.votes.length / totalVotes : 0} tint={mine ? color.brand.tint : color.surface.tertiary} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('plan.whosIn', { count: going.length })}</Text>
        <View style={{ marginTop: space.m, gap: space.m }}>
          {plan.invitees.map((i) => (
            <View key={i.userId} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Avatar name={i.displayName} size={34} />
              <Text variant="body" style={{ flex: 1 }}>{i.displayName}</Text>
              <Text
                variant="footnote"
                color={i.rsvp === 'yes' ? color.success : i.rsvp === 'maybe' ? color.warning : color.label.tertiary}
              >
                {i.rsvp === 'yes'
                  ? t('plan.rsvpIn')
                  : i.rsvp === 'maybe'
                    ? t('plan.rsvpMaybe')
                    : i.rsvp === 'no'
                      ? t('plan.rsvpOut')
                      : t('plan.rsvpNoAnswer')}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
