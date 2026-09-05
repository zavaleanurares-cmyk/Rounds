import React, { useMemo, useRef } from 'react';
import { View, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, Bloom, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { capabilities, optional } from '@/services/optional';
import { summariseNights } from '@/domain/stats';
import { useT, useFormat } from '@/i18n';
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
  const t = useT();
  const f = useFormat();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { sessions, logs, venues } = useStore();
  const session = sessions.find((s) => s.id === sessionId);
  const cardRef = useRef<View>(null);

  const summary = useMemo(
    () => summariseNights(logs.filter((l) => l.sessionId === sessionId))[0],
    [logs, sessionId]
  );

  if (!session) {
    return <Screen title={t('ui.share')} back><EmptyState title={t('stats.shareEmptyTitle')} body={t('stats.shareEmptyBody')} icon="square.and.arrow.up" /></Screen>;
  }

  const venue = venues.find((v) => v.id === session.venueId);
  const accent = color.night[session.accentIndex % 4];
  const duration = (session.endedAt ?? Date.now()) - session.startedAt;
  const places = summary?.venueIds.length ?? 1;

  /**
   * Actually exports the card.
   *
   * The view below has been rendered at 1:1 and marked `collapsable={false}`
   * since the first version, with a ref attached — and nothing ever captured
   * it. `react-native-view-shot` is a dependency, probed in `optional.ts` and
   * surfaced as `capabilities().shareCard`, which nothing read. So the thing
   * somebody previewed full-screen was never produced, and Share sent a
   * sentence of text instead.
   *
   * Text is still the fallback, and stays the whole story on web and in any
   * build without the native module: a share sheet that opens with something
   * beats a button that fails.
   */
  const share = async () => {
    const text = t('stats.shareMessage', {
      venue: venue?.name ?? t('stats.aNightOut'),
      duration: f.duration(duration),
      count: places,
    });

    if (capabilities().shareCard && cardRef.current) {
      try {
        const ViewShot = optional<typeof import('react-native-view-shot')>(() =>
          require('react-native-view-shot')
        );
        const uri = await ViewShot?.captureRef(cardRef, { format: 'png', quality: 0.95 });
        if (uri) {
          // `Share.share` takes a url on iOS and a message on Android, so the
          // image goes in both and the text stays as the caption.
          await Share.share({ message: text, url: uri });
          return;
        }
      } catch {
        // A capture that fails must not swallow the share.
      }
    }

    await Share.share({ message: text });
  };

  return (
    <Screen
      title={t('stats.shareTitle')}
      back
      mood="night"
      accent={accent}
      footer={
        <Button
          title={t('ui.share')}
          icon="square.and.arrow.up"
          onPress={() => void share()}
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
        <Text variant="largeTitle" style={{ marginTop: space.sm }}>{venue?.name ?? t('stats.aNightOut')}</Text>
        <Text variant="body" tone="secondary" style={{ marginTop: space.xs }}>
          {t('stats.shareDate', { weekday: f.weekday(session.startedAt), date: f.dayLong(session.startedAt) })}
        </Text>
        <View style={{ flexDirection: 'row', gap: space.xl, marginTop: space.lg }}>
          <View>
            <Text variant="numericMedium" color={accent}>{f.duration(duration)}</Text>
            <Text variant="caption1" tone="tertiary">{t('stats.outCaption')}</Text>
          </View>
          <View>
            <Text variant="numericMedium" color={accent}>{f.number(places, 0)}</Text>
            <Text variant="caption1" tone="tertiary">{t('stats.placeUnit', { count: places })}</Text>
          </View>
        </View>
      </View>

      <Card>
        <Text variant="footnote" tone="tertiary">
          {t('stats.shareNote')}
        </Text>
      </Card>
    </Screen>
  );
}
