import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aurora, Text, Button, Card } from '@/ui';
import { useStore } from '@/data/store';
import { summariseNights, formatMoney, plural } from '@/domain/stats';
import { color, geometry, space } from '@/design/tokens';
import { UpgradeSlide } from '@/features/billing/UpgradeSlide';

/**
 * Y-12 · Wrapped.
 *
 * Leads with exploration and wellbeing. Reports volume plainly and NEVER ranks
 * the user against anyone. Two slides are marked `paid`; while billing is
 * hidden nothing is withheld and every slide shows.
 */
export default function Wrapped() {
  const router = useRouter();
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

  const slides = [
    { title: plural(nights.length, 'night'), body: `You went out ${plural(nights.length, 'time')} in ${y}.`, tint: color.night[0] },
    { title: plural(venueCount, 'place'), body: topVenue ? `${topVenue} saw more of you than anywhere else.` : 'You kept it varied.', tint: color.night[1] },
    { title: formatMoney(spend, profile?.currency ?? 'EUR'), body: 'What the year cost, across every round you logged.', tint: color.night[3] },
    { title: `${dry} quiet nights`, body: 'The ones you did not go out are part of the picture too.', tint: color.pace.steady, paid: true },
    { title: plural(nights.reduce((s, n) => s + n.drinks, 0), 'drink'), body: 'Plainly, without a chart and without a comparison to anyone else.', tint: color.brand.tint, paid: true },
  ];

  const slide = slides[index];
  // `paid` is kept on the slide definitions so the split survives, but nothing
  // is withheld while billing is hidden — see BILLING_VISIBLE.
  const locked = Boolean(slide.paid) && !plus;

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: color.bg.canvas }}
      onPress={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
      accessibilityLabel="Next slide"
    >
      <Aurora mood={index % 2 ? 'warm' : 'default'} accent={slide.tint} />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + space.lg,
          paddingHorizontal: geometry.screenMargin,
          paddingBottom: insets.bottom + space.lg,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= index ? '#fff' : 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </View>

        {locked ? (
          <UpgradeSlide />
        ) : (
          <View>
            <Text variant="caption2" tone="tertiary" style={{ letterSpacing: 3 }}>ROUNDS {y}</Text>
            <Text variant="largeTitle" style={{ fontSize: 44, lineHeight: 50, marginTop: space.m }}>{slide.title}</Text>
            <Text variant="body" tone="secondary" style={{ marginTop: space.m, maxWidth: 300 }}>{slide.body}</Text>
          </View>
        )}

        <View style={{ gap: space.m }}>
          <Text variant="footnote" tone="quaternary" center>Tap to continue</Text>
          <Button title="Close" kind="glass" onPress={() => router.back()} />
        </View>
      </View>
    </Pressable>
  );
}
