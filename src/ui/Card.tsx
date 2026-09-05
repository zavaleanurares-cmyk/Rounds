import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bloom } from './Bloom';
import { color, radius as R, elevation, space } from '@/design/tokens';

/**
 * The content layer. Solid `surface/primary` — never glass.
 *
 * `Card.Aurora` is the signature: solid fill, two low-opacity radial blooms
 * CLIPPED inside it (light source two), a sheen overlay giving it one top-left
 * highlight (light source three), a 1px rim, and an optional 3pt accent bar
 * keyed to the night colour.
 */
export interface CardProps {
  children: React.ReactNode;
  aurora?: boolean;
  accent?: string | null;
  padding?: number;
  radius?: number;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Card({
  children,
  aurora = false,
  accent = null,
  padding = space.md,
  radius: r = R.card,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const body = (
    <View
      style={[
        {
          backgroundColor: color.surface.primary,
          borderRadius: r,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: color.card.rim,
        },
        elevation.card,
        style,
      ]}
    >
      {aurora ? (
        <>
          {/* light source two: blooms clipped inside the card */}
          <Bloom size={220} color={accent ?? color.brand.tint} opacity={0.30} left={-70} top={-90} />
          <Bloom size={180} color="#8B5CF6" opacity={0.22} right={-50} bottom={-60} />
          {/* light source three: one top-left sheen */}
          <LinearGradient
            colors={[color.card.sheenFrom, color.card.sheenTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.85, y: 0.9 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </>
      ) : null}

      <View style={{ padding, flexDirection: accent ? 'row' : 'column' }}>
        {accent ? (
          <View
            style={{
              width: 3,
              alignSelf: 'stretch',
              borderRadius: 2,
              backgroundColor: accent,
              marginRight: space.m,
            }}
          />
        ) : null}
        <View style={{ flex: accent ? 1 : undefined }}>{children}</View>
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1, transform: [{ scale: pressed ? 0.995 : 1 }] })}
    >
      {body}
    </Pressable>
  );
}
