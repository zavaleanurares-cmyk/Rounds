import React, { useMemo, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aurora, Card, Text, Button, Chip, Icon, StatTile, EmptyState, MoodFace, MOODS, MOOD_LABEL } from '@/ui';
import { useStore } from '@/data/store';
import { summariseNights, estimateMissedDrinks, hangoverForecast } from '@/domain/stats';
import { CATALOG } from '@/domain/catalog';
import type { Mood } from '@/domain/types';
import { useT, useFormat } from '@/i18n';
import { color, geometry, radius, space } from '@/design/tokens';

/**
 * The mood words live in one place — `MOOD_LABEL` — so the sheet that captures
 * a mood and the screen that shows it back cannot disagree.
 */
const FEELING_LABEL = MOOD_LABEL;

/** The forecast band, as it reads inside the sentence that quotes it. */
const BAND_LABEL = {
  fine: 'morning.bandFine',
  tender: 'morning.bandTender',
  rough: 'morning.bandRough',
} as const;

/**
 * Y-04 · Morning after — the second most important screen in the app.
 *
 * Five cards in this order, and the order is the argument: the emotional hook
 * BEFORE any metric, then the gap-filling, then how you actually feel, then the
 * numbers, then exactly one next line.
 *
 * Card 2 is the critical one. Drunk logging is lossy. Without a way to fix it the
 * next morning, every downstream number is wrong and the user quietly stops
 * trusting the pace ring — which is the whole product.
 *
 * Low brightness, high legibility. This is read at 10am, in bed.
 */
export default function MorningAfter() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const insets = useSafeAreaInsets();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const store = useStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  const [added, setAdded] = useState(0);
  const [feeling, setFeeling] = useState<Mood | null>(null);

  const logs = useMemo(
    () => store.logs.filter((l) => l.sessionId === sessionId && !l.deleted),
    [store.logs, sessionId]
  );
  const summary = useMemo(() => summariseNights(logs)[0], [logs]);
  const missed = useMemo(() => (session ? estimateMissedDrinks(session, store.logs) : 0), [session, store.logs]);
  const forecast = useMemo(() => hangoverForecast(summary), [summary]);
  const venue = store.venues.find((v) => v.id === session?.venueId);

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: color.bg.canvas, paddingTop: insets.top + 60, paddingHorizontal: geometry.screenMargin }}>
        <EmptyState title={t('morning.notFoundTitle')} body={t('morning.notFoundBody')} icon="moon.stars" />
      </View>
    );
  }

  const addMissed = (n: number) => {
    const drink = CATALOG.find((d) => d.id === logs[logs.length - 1]?.drinkId) ?? CATALOG[1];
    const end = session.endedAt ?? Date.now();
    for (let i = 0; i < n; i++) {
      store.addLog({
        drink,
        at: end - (i + 1) * 40 * 60000,
        venueId: session.venueId,
      });
    }
    setAdded((a) => a + n);
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      {/* dimmed on purpose — this is read in bed */}
      <Aurora mood="warm" intensity={0.45} dimmed />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.lg,
          paddingHorizontal: geometry.screenMargin,
          paddingBottom: insets.bottom + space.xxl,
          gap: space.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="sectionHeader" tone="tertiary" style={{ flex: 1 }}>{t('morning.header')}</Text>
          <Pressable onPress={() => router.replace('/(tabs)/tonight')} hitSlop={10} accessibilityLabel={t('ui.close')}>
            <Icon name="xmark" size={18} color={color.label.tertiary} />
          </Pressable>
        </View>

        {/* card 1 — last night. Emotional hook before metric. */}
        <Card aurora accent={color.night[session.accentIndex % 4]}>
          <Text variant="title1">{venue?.name ?? session.title ?? t('morning.lastNight')}</Text>
          <Text variant="body" tone="secondary" style={{ marginTop: space.xs }}>
            {t('morning.outAcross', {
              duration: f.duration((session.endedAt ?? 0) - session.startedAt),
              count: summary?.venueIds.length ?? 1,
            })}
            {session.safeHomeAt ? ` ${t('morning.homeAt', { time: f.clock(session.safeHomeAt) })}` : ''}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 46, marginTop: space.md }}>
            {logs.map((l) => (
              <View
                key={l.id}
                style={{
                  flex: 1,
                  height: Math.max(6, (l.ethanolG / 25) * 44),
                  borderRadius: 3,
                  backgroundColor: l.category === 'water' ? color.brand.tintLight : color.night[session.accentIndex % 4],
                  opacity: l.category === 'water' ? 0.6 : 1,
                }}
              />
            ))}
          </View>
        </Card>

        {/* card 2 — fill the gaps. The critical one. */}
        {missed - added > 0 ? (
          <Card accent={color.brand.tint}>
            <Text variant="sectionHeader" tone="tertiary">{t('morning.fillTheGaps')}</Text>
            <Text variant="headline" style={{ marginTop: space.xs }}>
              {t('morning.gapsHeadline', {
                duration: f.duration((session.endedAt ?? 0) - session.startedAt),
                count: logs.filter((l) => l.ethanolG > 0).length,
              })}
            </Text>
            <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
              {t('morning.gapsBody', { count: missed - added })}
            </Text>
            <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md, flexWrap: 'wrap' }}>
              <Chip label={t('morning.addN', { count: 1 })} onPress={() => addMissed(1)} />
              <Chip label={t('morning.addN', { count: 2 })} onPress={() => addMissed(2)} />
              <Chip label={t('morning.addN', { count: 3 })} onPress={() => addMissed(3)} />
              <Chip label={t('morning.nothingMore')} onPress={() => setAdded(missed)} />
              <Chip label={t('morning.letMeAddThem')} onPress={() => router.push(`/session/${session.id}/edit` as never)} />
            </View>
          </Card>
        ) : added > 0 ? (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Icon name="checkmark" size={20} color={color.success} />
              <Text variant="subheadline" style={{ flex: 1 }}>
                {t('morning.addedConfirm', { count: added })}
              </Text>
            </View>
          </Card>
        ) : null}

        {/* card 3 — how do you feel, against the forecast */}
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('morning.howDoYouFeel')}</Text>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.m }}>
            {MOODS.map((mood) => (
              <Pressable
                key={mood}
                onPress={() => {
                  setFeeling(mood);
                  store.endSession(session.id, { mood, safeHome: session.safeHomeAt !== null });
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: feeling === mood }}
                accessibilityLabel={t(FEELING_LABEL[mood])}
                style={{
                  flex: 1,
                  minHeight: 72,
                  borderRadius: radius.control,
                  borderWidth: 1.5,
                  borderColor: feeling === mood ? color.brand.tint : color.separator,
                  backgroundColor: color.surface.secondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <MoodFace mood={mood} size={28} active={feeling === mood} />
                <Text variant="caption2" tone="secondary">{t(FEELING_LABEL[mood])}</Text>
              </Pressable>
            ))}
          </View>
          {feeling ? (
            <Text variant="footnote" tone="tertiary" style={{ marginTop: space.m }}>
              {t('morning.weGuessed', { band: t(BAND_LABEL[forecast.band]) })}
            </Text>
          ) : null}
        </Card>

        {/* card 4 — numbers. Plain, no red. */}
        <View style={{ flexDirection: 'row', gap: space.m }}>
          <StatTile label={t('morning.drinks')} value={String(summary?.drinks ?? 0)} icon="wineglass" tint={color.label.primary} />
          <StatTile label={t('morning.water')} value={String(summary?.waters ?? 0)} icon="drop" tint={color.brand.tintLight} />
        </View>
        <View style={{ flexDirection: 'row', gap: space.m }}>
          <StatTile
            label={t('morning.spend')}
            value={f.money(summary?.spendMinor ?? 0, store.profile?.currency ?? 'EUR')}
            icon="creditcard"
            tint={color.pace.quick}
          />
          <StatTile label={t('morning.home')} value={session.safeHomeAt ? f.clock(session.safeHomeAt) : '—'} icon="house" />
        </View>

        {/* card 5 — exactly one next line. Never more. */}
        <Card>
          <Text variant="subheadline" tone="secondary">
            {(summary?.waters ?? 0) === 0
              ? t('morning.noWaterNote')
              : t('morning.dryNightsNote')}
          </Text>
        </Card>

        <View style={{ gap: space.m, marginTop: space.sm }}>
          <Button title={t('morning.seeTheFullNight')} kind="glass" onPress={() => router.replace(`/session/${session.id}` as never)} />
          <Button title={t('ui.done')} onPress={() => router.replace('/(tabs)/tonight')} />
        </View>
      </ScrollView>
    </View>
  );
}
