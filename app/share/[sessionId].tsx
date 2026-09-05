import React, { useMemo, useRef } from 'react';
import { View, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, Bloom, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { summariseNights, formatDuration } from '@/domain/stats';
import { color, radius, space } from '@/design/tokens';

/**
 * C-08 · Share night card.
 *
 * In production this view is rendered off-screen and exported with
 * `react-native-view-shot`; the layout below IS that view, shown at 1:1 so what
 * you preview is what you export.
 *
 * NEVER include the pace estimate on any outward-facing card. It leads with
 * venues, hours and people — the parts of a night that are actually worth
 * showing someone.
 */
export default function ShareCard() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { sessions, logs, venues } = useStore();
  const session = sessions.find((s) => s.id === sessionId);
  const cardRef = useRef<View>(null);

  const summary = useMemo(
    () => summariseNights(logs.filter((l) => l.sessionId === sessionId))[0],
    [logs, sessionId]
  );

  if (!session) {
    return <Screen title="Share" back><EmptyState title="Nothing to share" body="That night isn't on this device." icon="square.and.arrow.up" /></Screen>;
  }

  const venue = venues.find((v) => v.id === session.venueId);
  const accent = color.night[session.accentIndex % 4];
  const duration = (session.endedAt ?? Date.now()) - session.startedAt;

  return (
    <Screen
      title="Share this night"
      back
      mood="night"
      accent={accent}
      footer={
        <Button
          title="Share"
          icon="square.and.arrow.up"
          onPress={() =>
            void Share.share({
              message: `${venue?.name ?? 'A night out'} · ${formatDuration(duration)} · ${
                summary?.venueIds.length ?? 1
              } ${(summary?.venueIds.length ?? 1) === 1 ? 'venue' : 'venues'} — ROUNDS`,
            })
          }
        />
      }
    >
      {/* the exported view, at 1:1 */}
      <View
        ref={cardRef}
        collapsable={false}
        style={{
          aspectRatio: 9 / 16,
          borderRadius: radius.cardLg,
          overflow: 'hidden',
          backgroundColor: color.bg.canvas,
          borderWidth: 1,
          borderColor: color.card.rim,
          justifyContent: 'flex-end',
          padding: space.lg,
        }}
      >
        <Bloom size={340} color={accent} opacity={0.55} left={-90} top={-70} />
        <Bloom size={260} color="#8B5CF6" opacity={0.35} right={-70} top={140} />
        <Text variant="caption2" tone="tertiary" style={{ letterSpacing: 3 }}>ROUNDS</Text>
        <Text variant="largeTitle" style={{ marginTop: space.sm }}>{venue?.name ?? 'A night out'}</Text>
        <Text variant="body" tone="secondary" style={{ marginTop: space.xs }}>
          {new Date(session.startedAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <View style={{ flexDirection: 'row', gap: space.xl, marginTop: space.lg }}>
          <View>
            <Text variant="numericMedium" color={accent}>{formatDuration(duration)}</Text>
            <Text variant="caption1" tone="tertiary">out</Text>
          </View>
          <View>
            <Text variant="numericMedium" color={accent}>{summary?.venueIds.length ?? 1}</Text>
            <Text variant="caption1" tone="tertiary">{(summary?.venueIds.length ?? 1) === 1 ? 'place' : 'places'}</Text>
          </View>
        </View>
      </View>

      <Card>
        <Text variant="footnote" tone="tertiary">
          Your pace, your estimate and what you drank are never on a share card. Venues, hours and
          people only.
        </Text>
      </Card>
    </Screen>
  );
}
