import React from 'react';
import { View, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Card, Text, Button } from '@/ui';
import { useStore } from '@/data/store';
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = useStore().plans.find((p) => p.id === id);
  const url = `https://rounds.app/p/${id}`;

  return (
    <Sheet
      title="Invite"
      onClose={() => router.back()}
      footer={<Button title="Share the link" icon="square.and.arrow.up" onPress={() => void Share.share({ message: `${plan?.title ?? 'A plan'} — ${url}` })} />}
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Card aurora>
          <Text variant="sectionHeader" tone="tertiary">THEY'LL SEE</Text>
          <Text variant="title3" style={{ marginTop: space.xs }}>{plan?.title}</Text>
          <Text variant="subheadline" tone="secondary">
            {plan ? new Date(plan.startsAt).toLocaleString(undefined, { weekday: 'long', hour: '2-digit', minute: '2-digit' }) : ''} ·{' '}
            {plan?.invitees.filter((i) => i.rsvp === 'yes').length ?? 0} in
          </Text>
          <Text variant="footnote" tone="quaternary" style={{ marginTop: space.m }}>{url}</Text>
        </Card>
        <Text variant="footnote" tone="tertiary">
          People without the app get a real page, not a store redirect. They can RSVP from it.
        </Text>
      </View>
    </Sheet>
  );
}
