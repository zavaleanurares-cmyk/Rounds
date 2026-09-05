import React from 'react';
import { View, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Card, Text, Button } from '@/ui';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import { space } from '@/design/tokens';

/**
 * D-08 · Plan invite.
 *
 * The link's web preview is a real page with OG tags showing time, venue and
 * who's in. It is the app's only surface for people who haven't installed it,
 * and therefore the primary growth loop — not an afterthought.
 */
export default function PlanInvite() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = useStore().plans.find((p) => p.id === id);
  const url = `https://rounds.app/p/${id}`;

  return (
    <Sheet
      title={t('plan.invite')}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('plan.shareLink')}
          icon="square.and.arrow.up"
          onPress={() =>
            void Share.share({ message: t('plan.shareMessage', { title: plan?.title ?? t('plan.aPlan'), url }) })
          }
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Card aurora>
          <Text variant="sectionHeader" tone="tertiary">{t('plan.theyllSee')}</Text>
          <Text variant="title3" style={{ marginTop: space.xs }}>{plan?.title}</Text>
          <Text variant="subheadline" tone="secondary">
            {t('plan.inviteWhen', {
              day: plan ? f.weekday(plan.startsAt) : '',
              time: plan ? f.clock(plan.startsAt) : '',
              count: plan?.invitees.filter((i) => i.rsvp === 'yes').length ?? 0,
            })}
          </Text>
          <Text variant="footnote" tone="quaternary" style={{ marginTop: space.m }}>{url}</Text>
        </Card>
        <Text variant="footnote" tone="tertiary">
          {t('plan.invitePageNote')}
        </Text>
      </View>
    </Sheet>
  );
}
