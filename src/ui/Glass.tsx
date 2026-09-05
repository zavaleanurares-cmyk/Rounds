import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { color, blur as blurToken, elevation, radius } from '@/design/tokens';

/**
 * Liquid Glass — the FUNCTIONAL layer only: tab bar, toolbars, floating buttons,
 * sheets. Never glass on glass, never glass on a card.
 *
 * There is no native glass primitive, so it is assembled the same way the Figma
 * file assembles it: background blur + a gradient rim stroke + an inner top
 * highlight + an inner bottom shade + a drop shadow.
 */
export interface GlassProps {
  children?: React.ReactNode;
  radius?: number;
  intensity?: number;
  style?: ViewStyle | ViewStyle[];
  /** Turn the rim off for full-bleed sheets that meet the screen edge. */
  rim?: boolean;
}

export function Glass({ children, radius: r = radius.control, intensity = blurToken.glass, style, rim = true }: GlassProps) {
  return (
    <View style={[{ borderRadius: r }, elevation.glass, style]}>
      <View style={{ borderRadius: r, overflow: 'hidden' }}>
        <BlurView
          intensity={intensity}
          tint="dark"
          style={StyleSheet.absoluteFill}
          // Web has no real backdrop blur in RNW; the gradient fill carries it.
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
        />
        {/* dark base — glass is a dark material, not a white one */}
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,12,18,0.55)' }]} />
        <LinearGradient
          colors={[color.glass.fillFrom, color.glass.fillTo]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* inner top highlight — the one light source glass gets */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderTopWidth: 1, borderTopColor: color.glass.innerHighlight, borderRadius: r, opacity: 0.5 },
          ]}
        />
        {/* inner bottom shade */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderBottomWidth: 1, borderBottomColor: color.glass.innerShade, borderRadius: r },
          ]}
        />
        {children}
      </View>
      {rim ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: r, borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)' },
          ]}
        />
      ) : null}
    </View>
  );
}
