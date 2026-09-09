import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Aurora, Bloom, Text, Button, Enter, ProgressBar, useCountUp } from '@/ui';
import { useStore } from '@/data/store';
import { summariseNights } from '@/domain/stats';
import { useT, useFormat } from '@/i18n';
import { color, geometry, space } from '@/design/tokens';
import { UpgradeSlide } from '@/features/billing/UpgradeSlide';

/**
 * Y-12 · Wrapped.
 *
 * Leads with exploration and wellbeing. Reports volume plainly and NEVER ranks
 * the user against anyone. Two slides are marked `paid`; while billing is
 * hidden nothing is withheld and every slide shows.
 *
 * ── The number counts ───────────────────────────────────────────────────────
 *
 * This is the most shareable screen in the app and it was the stillest: a
 * finished figure on a dark gradient, most of the height empty, five slides
 * that differed only in their accent. A year-in-review is the one place where
 * the arrival of the number IS the content — nobody screenshots a table.
 *
 * So each slide's figure eases up from zero, and it does so THROUGH the
 * translation rather than beside it: `t('stats.wrappedNights', { count })` is
 * called with the animated value, so the plural rule runs on every frame and
 * the line reads "1 night" before it reads "26 nights". That is why this
 * needed no new strings and works in all four languages, Romanian's three-way
 * plural included.
 *
 * The slide is keyed on its index, so tapping through remounts the block and
 * every entrance and count-up replays. Without the key the second slide would
 * simply appear, already finished, which is the state the whole screen was in.
 */
export default function Wrapped() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const insets = useSafeAreaInsets();
  const { year } = useLocalSearchParams<{ year: string }>();
  const { logs, sessions, venues, profile, settings , plus } = useStore();
  const [index, setIndex] = useState(0);

  const y = Number(year) || new Date().getFullYear();
  const scoped = useMemo(() => logs.filter((l) => !l.deleted && new Date(l.at).getFullYear() === y), [logs, y]);
  const nights = useMemo(() => summariseNights(scoped), [scoped]);
  const venueCount = new Set(scoped.map((l) => l.venueId).filter(Boolean)).size;
  const spend = scoped.reduce((s, l) => s + (l.priceMinor ?? 0), 0);
  const dry = nights.filter((n) => n.totalG === 0).length;
  const topVenue = useMemo(() => {
    const m = new Map<string, number>();
    scoped.forEach((l) => l.venueId && m.set(l.venueId, (m.get(l.venueId) ?? 0) + 1));
    const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? venues.find((v) => v.id === top[0])?.name : null;
  }, [scoped, venues]);

  const drinks = nights.reduce((s, n) => s + n.drinks, 0);
  const currency = profile?.currency ?? 'EUR';
  /**
   * `to` is what the figure counts up to; `title` renders one frame of it.
   * Keeping them separate is what lets the plural rule re-run per frame
   * instead of the screen interpolating a finished string.
   */
  const slides = [
    {
      to: nights.length,
      title: (n: number) => t('stats.wrappedNights', { count: n }),
      body: t('stats.wrappedNightsBody', { count: nights.length, year: String(y) }),
      tint: color.night[0],
    },
    {
      to: venueCount,
      title: (n: number) => t('stats.places', { count: n }),
      body: topVenue ? t('stats.wrappedTopVenue', { venue: topVenue }) : t('stats.wrappedVaried'),
      tint: color.night[1],
    },
    {
      to: spend,
      title: (n: number) => f.money(n, currency),
      body: t('stats.wrappedSpendBody'),
      tint: color.night[3],
    },
    {
      to: dry,
      title: (n: number) => t('stats.wrappedQuietNights', { count: n }),
      body: t('stats.wrappedQuietBody'),
      tint: color.pace.steady,
      paid: true,
    },
    {
      to: drinks,
      title: (n: number) => t('stats.wrappedDrinks', { count: n }),
      body: t('stats.wrappedDrinksBody'),
      tint: color.brand.tint,
      paid: true,
    },
  ];

  const slide = slides[index];
  /**
   * Money counts in minor units and would tick through 8,999 values; a night
   * count would crawl if it took as long as a four-figure sum. `motion.slow`
   * doubled for the big one is the compromise, and the easing means the last
   * digits settle rather than grind.
   */
  const counted = useCountUp(slide.to, { duration: slide.to > 200 ? 1100 : 800 });
  // `paid` is kept on the slide definitions so the split survives, but nothing
  // is withheld while billing is hidden — see BILLING_VISIBLE.
  const locked = Boolean(slide.paid) && !plus;

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: color.bg.canvas }}
      onPress={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
      accessibilityLabel={t('stats.nextSlide')}
    >
      <Aurora mood={index % 2 ? 'warm' : 'default'} accent={slide.tint} />
      {/* Two blooms keyed on the slide, so the light itself changes colour as
          you tap through rather than the accent quietly swapping under a
          static layout. */}
      <Bloom key={`a${index}`} size={460} color={slide.tint} opacity={0.5} top={-120} left={-140} />
      <Bloom key={`b${index}`} size={380} color={slide.tint} opacity={0.32} bottom={-80} right={-120} />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + space.lg,
          paddingHorizontal: geometry.screenMargin,
          paddingBottom: insets.bottom + space.lg,
          justifyContent: 'space-between',
        }}
      >
        {/* The current segment fills rather than snapping, so the header
            reads as a story you are moving through. */}
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {slides.map((_, i) => (
            <View key={i} style={{ flex: 1 }}>
              {i === index ? (
                <ProgressBar key={`seg${index}`} value={1} height={3} tint="#fff" />
              ) : (
                <View
                  style={{
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: i < index ? '#fff' : 'rgba(255,255,255,0.2)',
                  }}
                />
              )}
            </View>
          ))}
        </View>

        {locked ? (
          <UpgradeSlide />
        ) : (
          // Keyed on the index: remounting is what replays the entrance and
          // restarts the count on every tap.
          //
          // Eyebrow, figure and body stay as one block, centred in what is
          // left between the progress bar and the footer. Two other layouts
          // were rendered and looked at first: `space-between` on the outer
          // container parked the block just above the middle with a third of
          // the screen empty under it, and pushing the body to the bottom of
          // the frame read as two fragments at opposite ends of a void rather
          // than as a composition.
          <View key={index} style={{ flex: 1, justifyContent: 'center' }}>
            <Enter from="below" distance={20}>
              <Text variant="caption2" tone="tertiary" style={{ letterSpacing: 3 }}>
                {t('stats.wrappedEyebrow', { year: String(y) })}
              </Text>
            </Enter>

            <Enter from="scale" delay={90}>
              <View style={{ marginTop: space.m }}>
                {/* A rule of the slide's own colour under the figure: it grows
                    with the count and gives the number something to stand on
                    in a composition that was otherwise a caption in a void. */}
                <Text variant="largeTitle" style={{ fontSize: 46, lineHeight: 52 }}>
                  {slide.title(Math.round(Number(counted)))}
                </Text>
                <View style={{ width: 92, marginTop: space.sm }}>
                  <ProgressBar key={`rule${index}`} value={1} height={4} tint={slide.tint} delay={120} />
                </View>
              </View>
            </Enter>

            <Enter from="below" delay={220}>
              <LinearGradient
                colors={[`${slide.tint}22`, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ marginTop: space.md, borderRadius: 14, paddingVertical: space.m, paddingHorizontal: space.md }}
              >
                <Text variant="body" tone="secondary" style={{ maxWidth: 300 }}>{slide.body}</Text>
              </LinearGradient>
            </Enter>
          </View>
        )}

        <View style={{ gap: space.m }}>
          <Text variant="footnote" tone="quaternary" center>{t('stats.tapToContinue')}</Text>
          <Button title={t('ui.close')} kind="glass" onPress={() => router.back()} />
        </View>
      </View>
    </Pressable>
  );
}
