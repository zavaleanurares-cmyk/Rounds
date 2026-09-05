import React, { useMemo, useRef, useEffect, useState } from 'react';
import { View, Pressable, useWindowDimensions, StyleSheet, Platform } from 'react-native';
import { Text, Icon } from '@/ui';
import { capabilities, optional } from '@/services/optional';
import type { Venue } from '@/domain/types';
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
  onSelect: (v: Venue) => void;
  topInset: number;
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

function NativeMap({ center, venues, visited, selectedId, onSelect, topInset }: VenueMapProps) {
  const Maps = optional(() => require('react-native-maps'));
  const ref = useRef<any>(null);
  const [ready, setReady] = useState(false);

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
  }, [ready, center.lat, center.lng]);

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

  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      provider={provider}
      onMapReady={() => setReady(true)}
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
      {venues.map(({ venue }) => {
        if (venue.lat == null || venue.lng == null) return null;
        const been = visited.has(venue.id);
        const selected = venue.id === selectedId;
        return (
          <Marker
            key={venue.id}
            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
            onPress={() => onSelect(venue)}
            tracksViewChanges={false}
            accessibilityLabel={`${venue.name}${been ? ', you have been here' : ''}`}
          >
            <Pin name={venue.name} been={been} selected={selected} />
          </Marker>
        );
      })}
    </MapView>
  );
}

/* ------------------------------------------------------------ the fallback */

function ProjectedMap({ center, venues, visited, selectedId, onSelect, topInset }: VenueMapProps) {
  const { width, height } = useWindowDimensions();

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

  const top = topInset + 150;
  const usableH = height - top - 230;

  const project = (lat: number, lng: number) => ({
    x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - 90) + 45,
    y: (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * usableH + top,
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {venues.map(({ venue }) => {
        if (venue.lat == null || venue.lng == null) return null;
        const p = project(venue.lat, venue.lng);
        return (
          <Pressable
            key={venue.id}
            onPress={() => onSelect(venue)}
            accessibilityRole="button"
            accessibilityLabel={venue.name}
            style={{ position: 'absolute', left: p.x - 30, top: p.y - 22, width: 60, alignItems: 'center' }}
          >
            <Pin name={venue.name} been={visited.has(venue.id)} selected={venue.id === selectedId} />
          </Pressable>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------- pin */

function Pin({ name, been, selected }: { name: string; been: boolean; selected: boolean }) {
  return (
    <View style={{ alignItems: 'center', width: 76 }}>
      <View
        style={{
          width: selected ? 34 : 28,
          height: selected ? 34 : 28,
          borderRadius: 17,
          backgroundColor: been ? color.brand.tint : color.surface.tertiary,
          borderWidth: 2,
          borderColor: selected ? '#fff' : been ? color.brand.tintLight : color.separator,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.5,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Icon name="wineglass" size={selected ? 15 : 13} color={been ? '#fff' : color.label.secondary} />
      </View>
      <Text
        variant="caption2"
        tone={selected ? 'primary' : 'secondary'}
        numberOfLines={1}
        center
        style={{ marginTop: 3 }}
      >
        {name}
      </Text>
    </View>
  );
}
