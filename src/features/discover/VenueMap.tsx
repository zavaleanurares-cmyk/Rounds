import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, Pressable, useWindowDimensions, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Text, Icon } from '@/ui';
import { capabilities, optional } from '@/services/optional';
import { useT } from '@/i18n';
import type { Venue } from '@/domain/types';
import { venueKind, type VenueKind } from '@/domain/venueKind';
import { clusterByGrid, cellForSpan } from '@/domain/cluster';
import { color } from '@/design/tokens';
import { MAP_STYLE } from './mapStyle';

export interface MapVenue {
  venue: Venue;
  distance: number | null;
}

export interface VenueMapProps {
  center: { lat: number; lng: number };
  venues: MapVenue[];
  visited: Set<string>;
  selectedId: string | null;
  /**
   * `null` closes the peek. Tapping the map to dismiss is how every map app
   * works, and this one used to offer only the small × on the card — a target
   * you have to aim for, on a screen used one-handed, at night, by somebody
   * who has been drinking.
   */
  onSelect: (v: Venue | null) => void;
  topInset: number;
  /**
   * Bumped every time "find me" is pressed, and part of the camera effect's
   * dependency list.
   *
   * Without it that effect only fires when `center` changes, so pressing the
   * button while already standing at `center` moved nothing — and standing
   * where the map is already pointed is the normal case for somebody checking
   * that the button works. Recentring is a command, not a consequence of the
   * coordinates happening to differ.
   */
  focusKey?: number;
  /** Where the device actually is, which is not always where the map is. */
  me?: { lat: number; lng: number } | null;
  /**
   * Fired when the camera settles somewhere new, with the area now on screen.
   *
   * The venue fetch used to be keyed on `center` alone — your GPS fix or a
   * hand-picked city — so panning the map moved the camera over a fixed set of
   * pins and nothing was ever asked about where you had panned TO. Wander to
   * the next town and the map was empty, correctly reporting the bars near a
   * place you were no longer looking at.
   */
  onArea?: (area: { lat: number; lng: number; radiusM: number }) => void;
}

/**
 * The map surface.
 *
 * `react-native-maps` where it exists — which includes Expo Go, so a tester
 * scanning a QR code gets the real thing. Where it does not (a browser, a
 * device without Play services) the same venues are projected onto the aurora
 * ground instead. Same pins, same peek, same filters: the screen above this one
 * does not branch.
 */
export function VenueMap(props: VenueMapProps) {
  return capabilities().map ? <NativeMap {...props} /> : <ProjectedMap {...props} />;
}

/* -------------------------------------------------------------- the real one */

function NativeMap({ center, venues, visited, selectedId, onSelect, topInset, focusKey = 0, onArea }: VenueMapProps) {
  const t = useT();
  const Maps = optional(() => require('react-native-maps'));
  const ref = useRef<any>(null);
  const [ready, setReady] = useState(false);
  // Matches `initialRegion` below, so the first frame clusters at the zoom the
  // map actually opens at rather than at a placeholder.
  const [span, setSpan] = useState(0.02);

  /**
   * The camera move has to wait for the map to be ready.
   *
   * On mount `center` is the city fallback, because location resolves a beat
   * later. `animateCamera` called before the native view exists is silently
   * dropped, so the map would sit on the fallback city while the pins were
   * somewhere else — which reads as "the map didn't load".
   */
  useEffect(() => {
    if (!ready) return;
    ref.current?.animateCamera?.(
      { center: { latitude: center.lat, longitude: center.lng }, zoom: 14.5 },
      { duration: 600 }
    );
  }, [ready, center.lat, center.lng, focusKey]);

  if (!Maps) return <ProjectedMap {...{ center, venues, visited, selectedId, onSelect, topInset }} />;
  const MapView = Maps.default;
  const { Marker, PROVIDER_GOOGLE } = Maps;

  /**
   * Google Maps on Android, Apple Maps on iOS.
   *
   * Forcing PROVIDER_GOOGLE on iOS requires the Google Maps SDK to be linked
   * and a key provided through react-native-maps' config plugin. Without both,
   * iOS renders an empty view over the aurora — a blank map, with no error.
   * Apple Maps needs neither, and `userInterfaceStyle="dark"` gives it the
   * night look that `customMapStyle` gives Google.
   */
  const provider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

  /**
   * Clustered at the current zoom, not at a fixed radius: two bars a street
   * apart should merge when the whole city is on screen and separate when it
   * is one street. `span` follows the camera, and until the map reports a
   * region it is the initial delta rather than a guess.
   */
  const clusters = useMemo(
    () => clusterByGrid(venues.map((v) => v.venue), cellForSpan(span)),
    [venues, span]
  );

  /**
   * Tapping a cluster frames what is inside it.
   *
   * It used to `animateCamera` to a fixed `zoom: 16.5`, which is a bug in one
   * direction and a dead end in the other. Past zoom 16.5 — which is normal
   * once you are looking at a street — tapping a cluster to open it ZOOMED YOU
   * OUT, so the thing you tapped got further away. And a cluster of three bars
   * in one building never separates at any fixed zoom, so those three were
   * unreachable however many times you tapped.
   *
   * `fitToCoordinates` frames the members' actual bounds instead, so one tap
   * always gets closer and always shows what was under the pin. When the
   * members share a point the bounds are degenerate and the map would zoom to
   * maximum, so a cluster that cannot be separated selects its first member
   * rather than pretending a fourth tap will help.
   */
  const openCluster = (c: { lat: number; lng: number; items: Venue[] }) => {
    const pts = c.items.filter((v) => v.lat != null && v.lng != null);
    const spread = pts.length > 1
      ? Math.max(
          Math.max(...pts.map((v) => v.lat!)) - Math.min(...pts.map((v) => v.lat!)),
          Math.max(...pts.map((v) => v.lng!)) - Math.min(...pts.map((v) => v.lng!))
        )
      : 0;

    // ~11m. Below that the venues are the same doorway and no zoom separates
    // them; there is nothing to open, so open the place itself.
    if (pts.length <= 1 || spread < 0.0001) {
      onSelect(pts[0] ?? c.items[0]);
      return;
    }

    ref.current?.fitToCoordinates?.(
      pts.map((v) => ({ latitude: v.lat as number, longitude: v.lng as number })),
      { edgePadding: { top: topInset + 170, right: 60, bottom: 240, left: 60 }, animated: true }
    );
  };

  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      provider={provider}
      onMapReady={() => setReady(true)}
      onPress={() => onSelect(null)}
      onRegionChangeComplete={(r: { latitude: number; longitude: number; latitudeDelta: number }) => {
        setSpan(r.latitudeDelta);
        // Half the visible height in metres, so the request covers roughly
        // what is on screen. Clamped: below ~700m a small pan asks again for
        // what it already has, and above ~14km Overpass starts timing out on
        // a bounding box that size.
        const radiusM = Math.round(Math.min(14000, Math.max(700, (r.latitudeDelta * 111_000) / 2)));
        onArea?.({ lat: r.latitude, lng: r.longitude, radiusM });
      }}
      // The night styling is not decoration: a white map at 1am in a dark app
      // is a flashbang, and this screen is used in exactly that situation.
      // Google-only; Apple Maps takes `userInterfaceStyle` below instead.
      customMapStyle={Platform.OS === 'android' ? MAP_STYLE : undefined}
      userInterfaceStyle="dark"
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      mapPadding={{ top: topInset + 120, right: 12, bottom: 200, left: 12 }}
      initialRegion={{
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }}
    >
      {clusters.map((c) => {
        // A cluster of one is a pin. Anything else is a count, and tapping it
        // zooms rather than guessing which of the places under it you meant.
        if (c.items.length === 1) {
          const venue = c.items[0];
          return (
            <VenuePin
              key={venue.id}
              Marker={Marker}
              venue={venue}
              lat={c.lat}
              lng={c.lng}
              been={visited.has(venue.id)}
              selected={venue.id === selectedId}
              onPress={() => onSelect(venue)}
              t={t}
            />
          );
        }
        const anyVisited = c.items.some((v) => visited.has(v.id));
        return (
          <Marker
            key={c.key}
            coordinate={{ latitude: c.lat, longitude: c.lng }}
            onPress={() => openCluster(c)}
            tracksViewChanges={false}
            accessibilityLabel={t('common.mapCluster', { count: c.items.length })}
          >
            <ClusterPin count={c.items.length} anyVisited={anyVisited} />
          </Marker>
        );
      })}
    </MapView>
  );
}

/* ------------------------------------------------------------ the fallback */

function ProjectedMap({ center, venues, visited, selectedId, onSelect, topInset, me }: VenueMapProps) {
  const { width, height } = useWindowDimensions();
  const t = useT();
  const tDismiss = t('ui.close');

  const bounds = useMemo(() => {
    const pts = venues.filter((v) => v.venue.lat != null && v.venue.lng != null);
    if (pts.length === 0) {
      return { minLat: center.lat - 0.01, maxLat: center.lat + 0.01, minLng: center.lng - 0.014, maxLng: center.lng + 0.014 };
    }
    const lats = pts.map((v) => v.venue.lat!);
    const lngs = pts.map((v) => v.venue.lng!);
    const pad = 0.0035;
    return {
      minLat: Math.min(...lats) - pad, maxLat: Math.max(...lats) + pad,
      minLng: Math.min(...lngs) - pad, maxLng: Math.max(...lngs) + pad,
    };
  }, [venues, center]);

  // Below the toolbar, not behind it. The search field, the filter chips and
  // the "couldn't reach the venue service" line stack to about 130pt from the
  // top inset, and the caption below sat at +110 — printed straight through
  // the chips. Measured in a browser at 390pt.
  /**
   * Clustered, not truncated.
   *
   * This fallback has no zoom and no camera, so it cannot open a cluster the
   * way the real map does — but rendering every venue as its own absolutely
   * positioned view is not an option either now that a city returns thousands.
   * So it collapses co-located places to one pin, labelled with how many more
   * are there, and nothing is dropped: the count is on the pin.
   */
  const projected = useMemo(() => {
    const withCoords = venues.map((v) => v.venue).filter((v) => v.lat != null && v.lng != null);
    const cell = cellForSpan(Math.max(0.002, bounds.maxLat - bounds.minLat));
    return clusterByGrid(withCoords, cell).map((c) => ({ venue: c.items[0], extra: c.items.length - 1 }));
  }, [venues, bounds]);

  const top = topInset + 190;
  const usableH = height - top - 230;

  const project = (lat: number, lng: number) => ({
    x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - 90) + 45,
    y: (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * usableH + top,
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/*
        The same dismissal as the native map. Rendered first so every pin sits
        above it, and only while something is actually selected — an always-on
        transparent layer would swallow taps meant for the screen behind it.
      */}
      {selectedId ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => onSelect(null)}
          accessibilityLabel={tDismiss}
        />
      ) : null}
      {/*
        You are here.

        `showsUserLocation` is a react-native-maps prop, so the projected
        fallback had no blue dot at all — pressing "find me" in a browser or on
        a device without Play services recentred onto nothing visible, which is
        indistinguishable from a button that does not work.
      */}
      {me ? (() => {
        const p = project(me.lat, me.lng);
        return (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', left: p.x - 9, top: p.y - 9 }}
            accessibilityLabel={t('discover.findMe')}
          >
            <View style={{
              width: 18, height: 18, borderRadius: 9,
              backgroundColor: color.brand.tint, borderWidth: 3, borderColor: '#fff',
              shadowColor: color.brand.tint, shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
            }} />
          </View>
        );
      })() : null}
      {projected.map(({ venue, extra }) => {
        if (venue.lat == null || venue.lng == null) return null;
        const p = project(venue.lat, venue.lng);
        const been = visited.has(venue.id);
        const sel = venue.id === selectedId;
        const g = geometry(sel ? 'selected' : been ? 'been' : 'plain');
        return (
          <Pressable
            key={venue.id}
            onPress={() => onSelect(venue)}
            accessibilityRole="button"
            accessibilityLabel={venue.name}
            // Offset by the same tip the native anchor uses, so the browser
            // fallback marks the venue in the same place the real map does.
            style={{ position: 'absolute', left: p.x - g.boxW / 2, top: p.y - g.tipY, zIndex: sel ? 20 : been ? 10 : 1 }}
          >
            <Pin
              name={extra > 0 ? `${venue.name} +${extra}` : venue.name}
              kind={venueKind(venue.category)}
              been={been}
              selected={sel}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * One venue as a map marker.
 *
 * Its own component for two reasons, both of which were bugs.
 *
 * `tracksViewChanges={false}` is what keeps a map with three hundred pins on
 * it smooth — the marker is rasterised once and never re-rendered. It was set
 * unconditionally, so on Android selecting a pin changed the React tree and
 * the map kept showing the old bitmap: the pin you tapped never grew, never
 * got its ring, never showed its name. Tracking is turned back on for a beat
 * whenever the state changes, then off again.
 *
 * And the anchor. A marker is positioned by its top-left corner unless told
 * otherwise, and the old code corrected that with `{x: 0.5, y: 0.5}` — the
 * CENTRE of a box whose height changed when the name label appeared. So the
 * selected pin jumped, and every pin marked its venue with the middle of a
 * circle rather than with a point. `geometry()` says where the tip is; the
 * anchor is that, and the label slot is reserved whether or not it is filled
 * so the number does not move.
 */
function VenuePin({
  Marker,
  venue,
  lat,
  lng,
  been,
  selected,
  onPress,
  t,
}: {
  Marker: any;
  venue: Venue;
  lat: number;
  lng: number;
  been: boolean;
  selected: boolean;
  onPress: () => void;
  t: ReturnType<typeof useT>;
}) {
  /**
   * Tracked only when the state CHANGES, never on mount.
   *
   * Turning tracking on for the first render was fine when the map held forty
   * markers and is not fine now the result cap is gone: every pin in view
   * would rasterise itself for 450ms at once, which is exactly the stall
   * `tracksViewChanges={false}` exists to prevent. A pin's first frame is
   * already correct — it is only selection that needs a redraw.
   */
  const [tracking, setTracking] = useState(false);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setTracking(true);
    const id = setTimeout(() => setTracking(false), 450);
    return () => clearTimeout(id);
  }, [selected, been]);

  const g = geometry(selected ? 'selected' : been ? 'been' : 'plain');

  return (
    <Marker
      coordinate={{ latitude: lat, longitude: lng }}
      onPress={onPress}
      tracksViewChanges={tracking}
      anchor={{ x: 0.5, y: g.tipY / g.boxH }}
      // Selected draws over its neighbours instead of under them.
      zIndex={selected ? 20 : been ? 10 : 1}
      accessibilityLabel={been ? t('common.mapPinVisited', { name: venue.name }) : venue.name}
    >
      <Pin name={venue.name} kind={venueKind(venue.category)} been={been} selected={selected} />
    </Marker>
  );
}

/* ------------------------------------------------------------------- pin */

const KIND_ICON: Record<VenueKind, 'wineglass' | 'moon.stars' | 'fork.knife' | 'cup'> = {
  bar: 'wineglass',
  club: 'moon.stars',
  wine: 'wineglass',
  restaurant: 'fork.knife',
  cafe: 'cup',
};

/**
 * Pin geometry, in one place because four things have to agree about it: the
 * artwork, the touch padding, the marker's anchor and the projected map's
 * offset. They did not agree before, and the pin sat above its own venue.
 *
 * `r` is the head's radius. The tail runs from the head down to a point, and
 * that point — not the middle of the head — is what marks the place.
 */
const PIN = {
  plain: { r: 12, pad: 12 },
  been: { r: 15, pad: 11 },
  selected: { r: 19, pad: 10 },
} as const;

/** Reserved whether or not the name is showing, so the anchor never moves. */
const LABEL_H = 15;

function geometry(state: keyof typeof PIN) {
  const { r, pad } = PIN[state];
  const head = r * 2;
  const tail = r * 1.05;
  const art = head + tail;
  return {
    r,
    pad,
    art,
    /** The whole marker box, including the touch padding and the label slot. */
    boxW: head + pad * 2,
    boxH: art + pad * 2 + LABEL_H,
    /** Where the tip sits inside that box. */
    tipY: pad + art,
  };
}

/**
 * One pin: a head you can read and a point that marks the spot.
 *
 * The old one was a flat circle — 16px for a place you had not been, which is
 * a third of the 44pt minimum and reads as a speck on a dark map. Worse, a
 * circle has no point: it was centred on the venue, so the artwork covered the
 * thing it was pointing at and two nearby bars looked like one smudge.
 *
 * Three states, and size carries the hierarchy: somewhere you have been is
 * bigger than somewhere you have not, and the selected one is bigger again.
 * Colour carries the kind, matching the passport stamp and the venue screen,
 * so a wine bar is the same red in all three places.
 */
function Pin({
  name,
  kind,
  been,
  selected,
}: {
  name: string;
  kind: VenueKind;
  been: boolean;
  selected: boolean;
}) {
  const state = selected ? 'selected' : been ? 'been' : 'plain';
  const g = geometry(state);
  const tint = color.venue[kind];
  const cx = g.r;
  const cy = g.r;

  // Head plus a tail that narrows to a point. Drawn as one path so the outline
  // is continuous — a circle with a triangle under it shows a seam where the
  // two strokes meet.
  const path = [
    `M ${cx - g.r * 0.5} ${cy + g.r * 0.82}`,
    `L ${cx} ${g.art}`,
    `L ${cx + g.r * 0.5} ${cy + g.r * 0.82}`,
    'Z',
  ].join(' ');

  return (
    <View style={{ width: g.boxW, height: g.boxH, alignItems: 'center' }}>
      <View style={{ marginTop: g.pad, width: g.r * 2, height: g.art }}>
        <Svg width={g.r * 2} height={g.art}>
          {/* Tail first, so the head's stroke draws over where they join. */}
          <Path d={path} fill={been || selected ? tint : color.surface.tertiary} />
          <Circle
            cx={cx}
            cy={cy}
            r={g.r - 1.5}
            fill={been || selected ? tint : color.surface.tertiary}
            stroke={selected ? '#fff' : been ? 'rgba(255,255,255,0.8)' : tint}
            strokeWidth={selected ? 3 : 2}
          />
          {/* A highlight across the top of the head. Two flat circles side by
              side read as stickers; a lit one reads as an object. */}
          <Circle cx={cx} cy={cy - g.r * 0.34} r={g.r * 0.5} fill="rgba(255,255,255,0.16)" />
        </Svg>

        {g.r >= 13 ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, width: g.r * 2, height: g.r * 2, alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name={KIND_ICON[kind]} size={selected ? 16 : 13} color="#fff" />
          </View>
        ) : null}
      </View>

      {/* The slot is always here; only the text comes and goes. That is what
          keeps `tipY` constant, and the anchor with it. */}
      <View style={{ height: LABEL_H, justifyContent: 'center' }}>
        {selected ? (
          <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 7, backgroundColor: 'rgba(10,12,20,0.85)' }}>
            <Text variant="caption2" tone="primary" numberOfLines={1}>{name}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/**
 * A cluster: how many places are here, without saying which.
 *
 * Deliberately neutral in colour. A cluster of a bar, a café and a restaurant
 * has no single kind, and picking one — the first in the array, say — would be
 * a confident lie about what is under it.
 */
function ClusterPin({ count, anyVisited }: { count: number; anyVisited: boolean }) {
  const size = count > 20 ? 40 : count > 8 ? 34 : 30;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: anyVisited ? color.brand.tint : 'rgba(20,22,30,0.92)',
        borderWidth: 2,
        borderColor: anyVisited ? 'rgba(255,255,255,0.65)' : color.separator,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <Text variant="caption1" tone="primary">{String(count)}</Text>
    </View>
  );
}
