import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Aurora, Glass, Text, Icon, Chip, Card, Button, Avatar, TAB_BAR_CLEARANCE, DrinkGlyph,
} from '@/ui';
import { useStore } from '@/data/store';
import { useT, useI18n, type Locale } from '@/i18n';
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
  const t = useT();
  const { locale } = useI18n();
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

  /**
   * Whether "Open now" can be answered at all.
   *
   * The chip used to be there always and filter nothing: `layers.open` was
   * written and never read, and there was no opening-hours field on a venue for
   * it to read. Google Places answers it; the OpenStreetMap fallback carries
   * opening hours as free text this app does not parse. So the chip appears
   * only when the answer exists — a filter that cannot filter is worse than no
   * filter, and hiding it is more honest than showing one that lies.
   */
  const canAnswerOpen = useMemo(
    () => (found.length > 0 ? found : localVenues).some((v) => typeof v.openNow === 'boolean'),
    [found, localVenues]
  );

  const shown = useMemo(() => {
    const all = found.length > 0 ? found : localVenues;
    return all
      .filter((v) => (layers.been ? true : !visited.has(v.id)))
      // Strict when the filter is on: an unknown is not an open door.
      .filter((v) => (layers.open && canAnswerOpen ? v.openNow === true : true))
      .map((v) => ({
        venue: v,
        distance:
          v.lat != null && v.lng != null
            ? distanceM(coords, { lat: v.lat, lng: v.lng })
            : null,
      }))
      .sort((a, b) => (a.distance ?? 1e9) - (b.distance ?? 1e9))
      .slice(0, 40);
  }, [found, localVenues, layers.been, layers.open, canAnswerOpen, visited, coords]);

  const liveFriends = people.filter((p) => p.liveNow && p.status === 'friend');
  const friendNames = liveFriends.map((f) => f.displayName.split(' ')[0]).join(', ');
  const peekMetaText = peek ? peekMeta(peek) : '';
  const peekDistanceText = peek ? peekDistance(peek, coords, status, locale) : null;
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
        <Pressable onPress={() => router.push('/venue/search')} accessibilityRole="search" accessibilityLabel={t('discover.searchVenues')}>
          <Glass radius={radius.control}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, height: 48, paddingHorizontal: space.md }}>
              <Icon name="magnifyingglass" size={18} color={color.label.secondary} />
              <Text variant="body" tone="tertiary" style={{ flex: 1 }}>{t('discover.searchPlaceholder')}</Text>
              {loading ? <ActivityIndicator size="small" color={color.label.tertiary} /> : null}
            </View>
          </Glass>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip label={t('discover.filterFriends')} compact selected={layers.friends} onPress={() => setLayers((l) => ({ ...l, friends: !l.friends }))} />
          <Chip label={t('discover.filterBeen')} compact selected={layers.been} onPress={() => setLayers((l) => ({ ...l, been: !l.been }))} />
          {canAnswerOpen ? (
            <Chip label={t('discover.filterOpen')} compact selected={layers.open} onPress={() => setLayers((l) => ({ ...l, open: !l.open }))} />
          ) : null}
        </View>
        {stale ? (
          <Text variant="caption1" color={color.warning}>{t('discover.stale')}</Text>
        ) : null}
      </View>

      {/* recentre */}
      <Pressable
        onPress={() => void request()}
        accessibilityRole="button"
        accessibilityLabel={t('discover.findMe')}
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
                  {peekDistanceText !== null
                    ? t('discover.peekMetaDistance', { meta: peekMetaText, distance: peekDistanceText })
                    : peekMetaText}
                </Text>
              </View>
              {usualAt(peek.id) ? <DrinkGlyph drink={usualAt(peek.id)!} size={30} /> : null}
              <Pressable onPress={() => setPeek(null)} hitSlop={10} accessibilityLabel={t('ui.close')}>
                <Icon name="xmark" size={16} color={color.label.tertiary} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.md }}>
              <View style={{ flex: 1 }}>
                <Button title={t('discover.startHere')} compact onPress={() => router.push({ pathname: '/session/start', params: { venueId: peek.id } })} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={t('discover.details')} kind="glass" compact onPress={() => router.push(`/venue/${peek.id}` as never)} />
              </View>
            </View>
          </Card>
        ) : status === 'denied' || status === 'unavailable' ? (
          <Card>
            <Text variant="headline">{t('discover.locationOffTitle')}</Text>
            <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
              {t('discover.locationOffBody')}
            </Text>
            <View style={{ marginTop: space.m, flexDirection: 'row', gap: space.m }}>
              <View style={{ flex: 1 }}>
                <Button title={t('discover.searchVenues')} kind="glass" compact onPress={() => router.push('/venue/search')} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={t('ui.retry')} kind="plain" compact onPress={() => void request()} />
              </View>
            </View>
          </Card>
        ) : layers.friends && liveFriends.length > 0 ? (
          <Card aurora accent={color.pace.steady}>
            <Text variant="sectionHeader" tone="tertiary">{t('discover.outRightNow')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm }}>
              {liveFriends.map((f) => <Avatar key={f.id} name={f.displayName} size={34} live />)}
              <Text variant="footnote" tone="secondary" style={{ flex: 1, marginLeft: space.xs }}>
                {status === 'approximate'
                  ? t('discover.friendsNearby', { names: friendNames })
                  : friendNames}
              </Text>
            </View>
            {status === 'approximate' ? (
              <Text variant="caption1" tone="quaternary" style={{ marginTop: space.sm }}>
                {t('discover.approximate')}
              </Text>
            ) : null}
          </Card>
        ) : null}
      </View>
    </View>
  );
}

/** Category, area and price band — venue data, joined, never translated. */
function peekMeta(venue: Venue): string {
  return [venue.category, venue.area, venue.priceBand ? '€'.repeat(venue.priceBand) : null]
    .filter(Boolean)
    .join(' · ');
}

/** Null when there is no coordinate, or when location is approximate. */
function peekDistance(
  venue: Venue,
  coords: { lat: number; lng: number },
  status: string,
  locale: Locale
): string | null {
  if (venue.lat == null || status === 'approximate') return null;
  return formatDistance(distanceM(coords, { lat: venue.lat, lng: venue.lng! }), locale);
}
