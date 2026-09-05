import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Text, Avatar, Icon } from '@/ui';
import { useT } from '@/i18n';
import type { LivePoint } from '@/services/locationShare';
import { color, radius, space } from '@/design/tokens';

const HEIGHT = 150;

export interface LiveMapProps {
  points: LivePoint[];
  /** userId → name, for the initials on each dot. */
  nameFor: (userId: string) => string;
  meId: string | null;
  width: number;
  /** Shown instead of the dots when there is nothing to plot. */
  empty: string;
}

/**
 * Where everybody is, projected onto the room's own ground.
 *
 * Deliberately not `react-native-maps`. This panel sits inside a card in a
 * scrolling screen, on a phone at 1am; a second native map view costs memory
 * and a tile download, steals the scroll gesture, and — the part that decides
 * it — would put the street somebody is standing on into a screenshot. The
 * question this panel answers is "are they still together, or has half the
 * group moved on", and relative positions answer it without ever drawing a
 * street.
 *
 * The bounds auto-fit with a floor, so two people in the same bar are not
 * flung to opposite corners by a projection that scales twenty metres to the
 * full width.
 */
export function LiveMap({ points, nameFor, meId, width, empty }: LiveMapProps) {
  const t = useT();

  const dots = useMemo(() => {
    if (points.length === 0) return [];
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    // ~500m at the equator. Below this the group is in one place, and saying so
    // is the honest answer — spreading them across the panel would invent a
    // separation that is not there.
    const FLOOR = 0.0045;
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const midLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const spanLat = Math.max(Math.max(...lats) - Math.min(...lats), FLOOR);
    const spanLng = Math.max(Math.max(...lngs) - Math.min(...lngs), FLOOR);
    const inset = 34;
    return points.map((p) => ({
      ...p,
      x: ((p.lng - (midLng - spanLng / 2)) / spanLng) * (width - inset * 2) + inset,
      y: (1 - (p.lat - (midLat - spanLat / 2)) / spanLat) * (HEIGHT - inset * 2) + inset,
    }));
  }, [points, width]);

  return (
    <View
      style={{
        height: HEIGHT,
        borderRadius: radius.control,
        backgroundColor: color.surface.secondary,
        marginTop: space.m,
        overflow: 'hidden',
      }}
      accessibilityLabel={
        dots.length ? t('live.mapLabel', { count: dots.length }) : empty
      }
    >
      {dots.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm }}>
          <Icon name="location" size={22} color={color.label.quaternary} />
          <Text variant="footnote" tone="tertiary" center style={{ maxWidth: 250 }}>
            {empty}
          </Text>
        </View>
      ) : (
        dots.map((d) => {
          const mine = d.userId === meId;
          return (
            <View
              key={d.userId}
              style={{
                position: 'absolute',
                left: d.x - 17,
                top: d.y - 17,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  borderRadius: 19,
                  padding: 2,
                  backgroundColor: mine ? color.brand.tint : 'transparent',
                  borderWidth: mine ? 0 : 2,
                  borderColor: color.separator,
                }}
              >
                <Avatar name={nameFor(d.userId)} size={30} />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
