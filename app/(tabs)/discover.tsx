import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Pressable, ActivityIndicator, Image } from 'react-native';
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
  const { people, logs, venues: localVenues, mergeVenues, settings, updateSettings } = useStore();
  const { status, coords: gpsCoords, request } = useLocation(true);
  /**
   * A hand-picked city wins over GPS. Somebody who has told the app where they
   * are has answered the question the permission was asking, and overriding
   * that with a refused-permission fallback would be the app arguing with them.
   */
  const homeCity = settings.homeCity;
  const coords = homeCity ? { lat: homeCity.lat, lng: homeCity.lng } : gpsCoords;

  /**
   * "Find me" is a command, and it had two ways of doing nothing.
   *
   * It called `request()` and stopped there. If a city had been picked, the
   * line above pins `coords` to that city forever, so a granted, accurate fix
   * was fetched and then discarded — the map stayed on Lisbon while the device
   * sat in Cluj. And with no city picked, `request()` returns the same
   * coordinates it already had, `center` does not change, and the camera
   * effect never re-runs, so nothing moves either.
   *
   * Pressing it now says three things at once: forget the pinned city, ask
   * again, and move the camera regardless of whether the numbers changed.
   */
  const [focusKey, setFocusKey] = useState(0);
  const findMe = async () => {
    if (homeCity) updateSettings({ homeCity: null });
    await request();
    setFocusKey((k) => k + 1);
  };

  const [peek, setPeek] = useState<Venue | null>(null);
  const [layers, setLayers] = useState({ friends: true, been: true, open: false });
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  /**
   * Everything fetched this session, keyed by id — not the result of the last
   * request.
   *
   * Replacing on each fetch meant panning away and back showed an empty map
   * until the request came round again, and two overlapping areas kept only
   * the second. Accumulating is what makes the map feel continuous while you
   * drag it.
   */
  const [found, setFound] = useState<Map<string, Venue>>(new Map());

  /**
   * The patch of world to ask about: wherever the map is looking, falling back
   * to your own position before the camera has reported anything.
   */
  const [area, setArea] = useState<{ lat: number; lng: number; radiusM: number } | null>(null);
  const query = area ?? { lat: coords.lat, lng: coords.lng, radiusM: 1800 };

  /**
   * Panning fires `onRegionChangeComplete` on every settle, so this is
   * debounced and ignores small moves — the cache is keyed to about 110m, and
   * without a floor a slow drag would queue a request per frame at a public,
   * rate-limited API that asks for restraint.
   */
  const onArea = useCallback((next: { lat: number; lng: number; radiusM: number }) => {
    setArea((prev) => {
      if (prev && distanceM(prev, next) < prev.radiusM * 0.4 && Math.abs(prev.radiusM - next.radiusM) < prev.radiusM * 0.4) {
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const timer = setTimeout(() => {
      findVenues({ lat: query.lat, lng: query.lng, radiusM: query.radiusM })
        .then(({ venues, stale: isStale }) => {
          if (!alive) return;
          setFound((prev) => {
            const next = new Map(prev);
            venues.forEach((v) => next.set(v.id, v));
            return next;
          });
          setStale(isStale);
          mergeVenues(venues);
        })
        .finally(() => alive && setLoading(false));
    }, 450);
    return () => { alive = false; clearTimeout(timer); };
  }, [query.lat, query.lng, query.radiusM]);
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
  const foundList = useMemo(() => [...found.values()], [found]);

  const canAnswerOpen = useMemo(
    () => (foundList.length > 0 ? foundList : localVenues).some((v) => typeof v.openNow === 'boolean'),
    [foundList, localVenues]
  );

  const shown = useMemo(() => {
    const all = foundList.length > 0 ? foundList : localVenues;
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
      // No cap. There was one at 40, then 120, then 600, and every one of them
      // silently dropped a real place somebody might have been looking for —
      // invisibly, because the nearest survive and the map always looks
      // plausible. The map clusters, so what limits the number of markers is
      // how far you are zoomed out, which is a bound you can see and change.
      ;
  }, [foundList, localVenues, layers.been, layers.open, canAnswerOpen, visited, coords]);

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
        focusKey={focusKey}
        me={status === 'granted' || status === 'approximate' ? gpsCoords : null}
        onArea={onArea}
      />

      {/* glass search toolbar */}
      <View style={{ position: 'absolute', top: insets.top + space.sm, left: geometry.screenMargin, right: geometry.screenMargin, gap: space.m }}>
        {/* Adding a place used to be reachable only from the zero-results
            state of the search sheet — you had to search for something that
            did not exist before the app would let you say it existed. It is a
            control on the map now, where you are standing when you notice the
            bar is missing. */}
        <Pressable onPress={() => router.push('/venue/search')} accessibilityRole="search" accessibilityLabel={t('discover.searchVenues')}>
          <Glass radius={radius.control}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, height: 48, paddingHorizontal: space.md }}>
              <Icon name="magnifyingglass" size={18} color={color.label.secondary} />
              <Text variant="body" tone="tertiary" style={{ flex: 1 }}>{t('discover.searchPlaceholder')}</Text>
              {loading ? <ActivityIndicator size="small" color={color.label.tertiary} /> : null}
              <Pressable
                onPress={() => router.push('/venue/new')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={t('discover.addPlaceTitle')}
              >
                <Icon name="plus" size={18} color={color.label.secondary} />
              </Pressable>
            </View>
          </Glass>
        </Pressable>
        {/*
          "Find me" lives in this row now.

          It was absolutely positioned at `insets.top + 118`, a constant chosen
          for a toolbar of a search field and one line of chips. Anything that
          made the toolbar taller — the "couldn't reach the venue service"
          warning wrapping to two lines, which is exactly when you most want to
          recentre — put the button on top of the text. In the row it cannot
          collide with anything, because flow layout is doing the arithmetic
          instead of me.
        */}
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <Chip label={t('discover.filterFriends')} compact selected={layers.friends} onPress={() => setLayers((l) => ({ ...l, friends: !l.friends }))} />
          <Chip label={t('discover.filterBeen')} compact selected={layers.been} onPress={() => setLayers((l) => ({ ...l, been: !l.been }))} />
          {canAnswerOpen ? (
            <Chip label={t('discover.filterOpen')} compact selected={layers.open} onPress={() => setLayers((l) => ({ ...l, open: !l.open }))} />
          ) : null}
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => void findMe()}
            accessibilityRole="button"
            accessibilityLabel={t('discover.findMe')}
            hitSlop={8}
          >
            <Glass radius={18}>
              <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="location" size={18} color={status === 'granted' ? color.brand.tintLight : color.label.primary} />
              </View>
            </Glass>
          </Pressable>
        </View>
        {stale ? (
          <Text variant="caption1" color={color.warning}>{t('discover.stale')}</Text>
        ) : null}
        {/*
          Say what this is, and say it in the toolbar rather than floating over
          the map at a fixed offset.

          Without a line of explanation a screen of drifting pins reads as a
          map that failed to load, which is exactly the conclusion a person
          draws. It used to be positioned absolutely inside the map layer and
          collided with whatever the toolbar happened to be that day.
        */}
        {!capabilities().map ? (
          <Text variant="caption1" tone="quaternary">{t('discover.mapProjected')}</Text>
        ) : null}
      </View>

      {/* the bottom slot: denial notice, then peek, then friends */}
      <View style={{ position: 'absolute', left: geometry.screenMargin, right: geometry.screenMargin, bottom: TAB_BAR_CLEARANCE + insets.bottom }}>
        {peek ? (
          <Card aurora accent={color.brand.tint}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.m }}>
              {/* Free, and usually absent. OSM carries `image` and
                  `wikimedia_commons` on a minority of venues — common on
                  landmarks, rare on bars — and it rides along in a response
                  already being fetched. So this is a nice surprise where it
                  exists rather than an empty frame everywhere it does not. */}
              {peek.photoUrl ? (
                <Image
                  source={{ uri: peek.photoUrl }}
                  style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: color.surface.tertiary }}
                  accessibilityIgnoresInvertColors
                />
              ) : null}
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
                <Button title={t('discover.changeCity')} kind="plain" compact onPress={() => router.push('/city')} />
              </View>
            </View>
            <View style={{ marginTop: space.sm }}>
              <Button title={t('ui.retry')} kind="plain" compact onPress={() => void findMe()} />
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
