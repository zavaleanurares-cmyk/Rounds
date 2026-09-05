import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Aurora, Glass, Text, Icon, Chip, Card, Button, Avatar, TAB_BAR_CLEARANCE, DrinkGlyph,
} from '@/ui';
import { useStore } from '@/data/store';
import { useLocation } from '@/hooks/useLocation';
import { findVenues, distanceM, formatDistance } from '@/services/venues';
import { capabilities } from '@/services/optional';
import { VenueMap } from '@/features/discover/VenueMap';
import type { Venue } from '@/domain/types';
import { byId } from '@/domain/catalog';
import { color, radius, space, geometry } from '@/design/tokens';

/**
 * D-01 · Map.
 *
 * A real map where one is available (`react-native-maps`, which Expo Go
 * bundles), and a projected pin field where one is not — a browser, or a device
 * without Google Play services. Both render the same venue rows, the same peek
 * sheet and the same filter chips, so the screen is never a different screen.
 *
 * Location denial is not a dead end: search and a city-level map. Android's
 * "approximate only" is its own state, and the friends layer says so rather
 * than vanishing.
 */
export default function Discover() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { people, logs, venues: localVenues, mergeVenues } = useStore();
  const { status, coords, request } = useLocation(true);

  const [peek, setPeek] = useState<Venue | null>(null);
  const [layers, setLayers] = useState({ friends: true, been: true, open: false });
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const [found, setFound] = useState<Venue[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    findVenues({ lat: coords.lat, lng: coords.lng, radiusM: 1800 })
      .then(({ venues, stale: isStale }) => {
        if (!alive) return;
        setFound(venues);
        setStale(isStale);
        mergeVenues(venues);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [coords.lat, coords.lng]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mergeVenues is
  // stable via the store's ref; listing it re-fired this on every mutation.

  const visited = useMemo(
    () => new Set(logs.map((l) => l.venueId).filter(Boolean) as string[]),
    [logs]
  );

  const shown = useMemo(() => {
    const all = found.length > 0 ? found : localVenues;
    return all
      .filter((v) => (layers.been ? true : !visited.has(v.id)))
      .map((v) => ({
        venue: v,
        distance:
          v.lat != null && v.lng != null
            ? distanceM(coords, { lat: v.lat, lng: v.lng })
            : null,
      }))
      .sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9))
      .slice(0, 40);
  }, [found, localVenues, layers.been, visited, coords]);

  const liveFriends = people.filter((p) => p.liveNow && p.status === 'friend');
  const usualAt = (venueId: string) => {
    const mine = logs.filter((l) => l.venueId === venueId && !l.deleted);
    const counts = new Map<string, number>();
    mine.forEach((l) => counts.set(l.drinkId, (counts.get(l.drinkId) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? byId(top[0]) ?? null : null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      <Aurora mood="calm" intensity={capabilities().map ? 0.28 : 0.7} />

      <VenueMap
        center={coords}
        venues={shown}
        visited={visited}
        selectedId={peek?.id ?? null}
        onSelect={setPeek}
        topInset={insets.top}
      />

      {/* glass search toolbar */}
      <View style={{ position: 'absolute', top: insets.top + space.sm, left: geometry.screenMargin, right: geometry.screenMargin, gap: space.m }}>
        <Pressable onPress={() => router.push('/venue/search')} accessibilityRole="search" accessibilityLabel="Search venues">
          <Glass radius={radius.control}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, height: 48, paddingHorizontal: space.md }}>
              <Icon name="magnifyingglass" size={18} color={color.label.secondary} />
              <Text variant="body" tone="tertiary" style={{ flex: 1 }}>Search bars and clubs</Text>
              {loading ? <ActivityIndicator size="small" color={color.label.tertiary} /> : null}
            </View>
          </Glass>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip label="Friends out" compact selected={layers.friends} onPress={() => setLayers((l) => ({ ...l, friends: !l.friends }))} />
          <Chip label="Been here" compact selected={layers.been} onPress={() => setLayers((l) => ({ ...l, been: !l.been }))} />
          <Chip label="Open now" compact selected={layers.open} onPress={() => setLayers((l) => ({ ...l, open: !l.open }))} />
        </View>
        {stale ? (
          <Text variant="caption1" color={color.warning}>
            Showing places you've seen before — we couldn't reach the venue service.
          </Text>
        ) : null}
      </View>

      {/* recentre */}
      <Pressable
        onPress={() => void request()}
        accessibilityRole="button"
        accessibilityLabel="Find me"
        style={{ position: 'absolute', right: geometry.screenMargin, top: insets.top + 118 }}
      >
        <Glass radius={20}>
          <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="location" size={18} color={status === 'granted' ? color.brand.tintLight : color.label.primary} />
          </View>
        </Glass>
      </Pressable>

      {/* the bottom slot: denial notice, then peek, then friends */}
      <View style={{ position: 'absolute', left: geometry.screenMargin, right: geometry.screenMargin, bottom: TAB_BAR_CLEARANCE + insets.bottom }}>
        {peek ? (
          <Card aurora accent={color.brand.tint}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.m }}>
              <View style={{ flex: 1 }}>
                <Text variant="title3">{peek.name}</Text>
                <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>
                  {[peek.category, peek.area, peek.priceBand ? '€'.repeat(peek.priceBand) : null]
                    .filter(Boolean)
                    .join(' · ')}
                  {peek.lat != null && status !== 'approximate'
                    ? ` · ${formatDistance(distanceM(coords, { lat: peek.lat, lng: peek.lng! }))}`
                    : ''}
                </Text>
              </View>
              {usualAt(peek.id) ? <DrinkGlyph drink={usualAt(peek.id)!} size={30} /> : null}
              <Pressable onPress={() => setPeek(null)} hitSlop={10} accessibilityLabel="Close">
                <Icon name="xmark" size={16} color={color.label.tertiary} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.md }}>
              <View style={{ flex: 1 }}>
                <Button title="Start here" compact onPress={() => router.push({ pathname: '/session/start', params: { venueId: peek.id } })} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Details" kind="glass" compact onPress={() => router.push(`/venue/${peek.id}` as never)} />
              </View>
            </View>
          </Card>
        ) : status === 'denied' || status === 'unavailable' ? (
          <Card>
            <Text variant="headline">Location is off</Text>
            <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
              That's fine — search for the place by name instead. Everything else in ROUNDS works
              exactly the same.
            </Text>
            <View style={{ marginTop: space.m, flexDirection: 'row', gap: space.m }}>
              <View style={{ flex: 1 }}>
                <Button title="Search venues" kind="glass" compact onPress={() => router.push('/venue/search')} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Try again" kind="plain" compact onPress={() => void request()} />
              </View>
            </View>
          </Card>
        ) : layers.friends && liveFriends.length > 0 ? (
          <Card aurora accent={color.pace.steady}>
            <Text variant="sectionHeader" tone="tertiary">OUT RIGHT NOW</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm }}>
              {liveFriends.map((f) => <Avatar key={f.id} name={f.displayName} size={34} live />)}
              <Text variant="footnote" tone="secondary" style={{ flex: 1, marginLeft: space.xs }}>
                {liveFriends.map((f) => f.displayName.split(' ')[0]).join(', ')}
                {status === 'approximate' ? ' · nearby' : ''}
              </Text>
            </View>
            {status === 'approximate' ? (
              <Text variant="caption1" tone="quaternary" style={{ marginTop: space.sm }}>
                Approximate location only, so distances are hidden.
              </Text>
            ) : null}
          </Card>
        ) : null}
      </View>
    </View>
  );
}
