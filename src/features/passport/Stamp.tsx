import React, { useMemo } from 'react';
import { View, Pressable, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Icon } from '@/ui';
import { usePressScale } from '@/ui';
import type { VenueKind } from '@/domain/venueKind';
import type { Stamp as StampData } from '@/domain/types';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * One passport stamp.
 *
 * The old one was a dashed blue rectangle with a wineglass in it, repeated
 * however many times you had been out — the same shape, the same colour and
 * the same glyph for a dive bar, a wine cellar and a café. A wall of identical
 * tiles is not a collection; a collection is a thing you can look at and pick
 * your favourite out of, and every tile being the same is what made this
 * screen feel like a spreadsheet of places rather than a record of nights.
 *
 * Three things carry the difference now, and none of them is decoration for
 * its own sake:
 *
 *  · **Colour is the kind of place.** The same five-way split the map pins
 *    already use, so a wine bar looks the same here as it did when you tapped
 *    it, and the page reads as a spread of colours rather than a grid.
 *  · **Rotation is the venue.** A real ink stamp is never straight. The angle
 *    is derived from the venue id, so it is stable across renders and every
 *    place has its own tilt — the page looks hand-made and does not shuffle
 *    itself when the list re-sorts.
 *  · **Your photo replaces the artwork.** A stamp with a picture behind it is
 *    the only thing on this screen that nobody else's passport can have.
 */

const KIND_ICON: Record<VenueKind, 'wineglass' | 'moon.stars' | 'fork.knife' | 'cup'> = {
  bar: 'wineglass',
  club: 'moon.stars',
  wine: 'wineglass',
  restaurant: 'fork.knife',
  cafe: 'cup',
};

/**
 * A second, darker tone per kind so each stamp is a gradient rather than a
 * flat fill. Derived here rather than added to the token file because it is
 * this screen's treatment of an existing colour, not a new colour.
 */
const DEEP: Record<VenueKind, string> = {
  bar: '#0B2A5E',
  club: '#2A1259',
  wine: '#4A0E22',
  restaurant: '#4A2A0E',
  cafe: '#0C3A1A',
};

/** Stable per venue: same id, same tilt, every render, on every device. */
function tiltOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 1000;
  // −4°…+4°, and never exactly zero — a grid of stamps at 0° is the grid this
  // is replacing.
  return ((h % 80) - 40) / 10 || 2.5;
}

export interface StampProps {
  venueId: string;
  name: string;
  kind: VenueKind;
  /** Nights here. Never drinks — the passport counts visits by design. */
  count: number;
  stamp?: StampData;
  onPress: () => void;
  /** Index in the grid, for the staggered entrance. */
  index: number;
}

export function Stamp({ venueId, name, kind, count, stamp, onPress }: StampProps) {
  const t = useT();
  const tint = color.venue[kind];
  const { style: pressStyle, handlers } = usePressScale(0.93);
  const tilt = useMemo(() => tiltOf(venueId), [venueId]);
  const photo = stamp?.photoUri ?? null;

  return (
    <Pressable
      onPress={onPress}
      {...handlers}
      accessibilityRole="button"
      // The count is on screen as a badge and in the label as words: a screen
      // reader announcing eleven identical "Enigma" tiles is the same wall of
      // sameness the visual design just stopped being.
      accessibilityLabel={t('stats.stampLabel', { venue: name, count })}
      style={{ width: '100%' }}
    >
      {/* One Animated.View carries both transforms: the press scale composes
          with the tilt instead of fighting it, and a nested plain View would
          have dropped the Animated value on the floor. */}
      <Animated.View
        style={{ transform: [{ rotate: `${tilt}deg` }, ...pressStyle.transform] }}
      >
          <View
            style={{
              aspectRatio: 0.82,
              borderRadius: radius.card,
              overflow: 'hidden',
              borderWidth: 1.5,
              borderColor: `${tint}88`,
              backgroundColor: DEEP[kind],
            }}
          >
            {photo ? (
              <Image
                source={{ uri: photo }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <LinearGradient
                colors={[`${tint}66`, DEEP[kind]]}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0.9, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            )}

            {/* Legibility floor. A photograph can be any brightness, and the
                name has to survive a white wall as well as a dark room. */}
            {photo ? (
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.82)']}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            ) : null}

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xs, gap: 4 }}>
              {photo ? null : <Icon name={KIND_ICON[kind]} size={22} color="#fff" />}
              <Text variant="caption2" center numberOfLines={2} style={{ paddingHorizontal: 2 }}>
                {name}
              </Text>
            </View>

            {/* The count rides in the corner as a minted badge rather than a
                line of text under the tile: it is the one number here, and a
                grid of centred captions made every tile look like a form. */}
            {count > 1 ? (
              <View
                style={{
                  position: 'absolute', top: 5, right: 5,
                  minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9,
                  backgroundColor: tint, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text variant="caption2" style={{ fontWeight: '700' }}>{`×${count}`}</Text>
              </View>
            ) : null}

            {stamp?.note ? (
              <View style={{ position: 'absolute', bottom: 5, left: 5 }}>
                <Icon name="bubble.left" size={11} color="rgba(255,255,255,0.8)" />
              </View>
            ) : null}
          </View>
      </Animated.View>
    </Pressable>
  );
}
