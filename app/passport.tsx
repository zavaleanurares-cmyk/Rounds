import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, EmptyState, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { color, radius, space } from '@/design/tokens';
import { plural } from '@/domain/stats';

/**
 * D-05 / Y-11 · Bar passport.
 *
 * One stamp per venue per night — exploration, never volume. Five drinks in one
 * bar is one stamp, and that is exactly the point.
 */
export default function Passport() {
  const router = useRouter();
  const { logs, venues } = useStore();

  const stamps = useMemo(() => {
    const m = new Map<string, Set<string>>();
    logs.forEach((l) => {
      if (l.deleted || !l.venueId) return;
      if (!m.has(l.venueId)) m.set(l.venueId, new Set());
      m.get(l.venueId)!.add(l.nightKey);
    });
    return [...m.entries()]
      .map(([venueId, nights]) => ({ venueId, count: nights.size }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  if (stamps.length === 0) {
    return (
      <Screen title="Passport" back mood="calm">
        <EmptyState icon="location" title="No stamps yet" body="Every venue you log at earns one stamp per night. It fills up faster than you'd think." actionLabel="Find somewhere" onAction={() => router.push('/(tabs)/discover')} />
      </Screen>
    );
  }

  return (
    <Screen title="Passport" subtitle={`${plural(stamps.length, 'place')} · ${plural(stamps.reduce((s, x) => s + x.count, 0), 'stamp')}`} back mood="calm">
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.m }}>
          {stamps.map((s) => {
            const v = venues.find((x) => x.id === s.venueId);
            return (
              <View
                key={s.venueId}
                accessibilityLabel={`${v?.name}, ${s.count} ${s.count === 1 ? 'stamp' : 'stamps'}`}
                style={{
                  width: '30%',
                  aspectRatio: 0.86,
                  borderRadius: radius.card,
                  borderWidth: 1.5,
                  borderColor: 'rgba(124,179,255,0.35)',
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: space.sm,
                  backgroundColor: 'rgba(59,130,246,0.07)',
                }}
              >
                <Icon name="wineglass" size={20} color={color.brand.tintLight} />
                <Text variant="caption1" center numberOfLines={2}>{v?.name ?? 'Somewhere'}</Text>
                <Text variant="caption2" tone="tertiary">×{s.count}</Text>
              </View>
            );
          })}
        </View>
      </Card>
      <Text variant="footnote" tone="quaternary" center>One stamp per venue per night. Exploration, not volume.</Text>
    </Screen>
  );
}
