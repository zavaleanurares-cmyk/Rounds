import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Bloom } from './Bloom';
import { color } from '@/design/tokens';

export type AuroraMood = 'default' | 'calm' | 'warm' | 'safety' | 'night';

/**
 * Light source one: the large blooms on the screen background.
 *
 * `mood` is not decoration — Tonight's blooms follow the pace state, the safety
 * screen goes red, and the wind-down screen goes almost black. The screen tells
 * you where you are before you read a word of it.
 */
export function Aurora({
  mood = 'default',
  accent,
  intensity = 1,
  dimmed,
}: {
  mood?: AuroraMood;
  accent?: string;
  intensity?: number;
  dimmed?: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const w = Math.min(width, 520);
  const primary = accent ?? color.brand.tint;

  const palettes: Record<AuroraMood, Array<[string, number]>> = {
    default: [[primary, 0.5], ['#8B5CF6', 0.4], ['#1D4ED8', 0.3]],
    calm: [[primary, 0.38], ['#38BDF8', 0.3], ['#1D4ED8', 0.24]],
    warm: [['#FB923C', 0.4], ['#F43F5E', 0.32], [primary, 0.26]],
    safety: [['#FF453A', 0.42], ['#F43F5E', 0.3], ['#8B5CF6', 0.2]],
    night: [[primary, 0.22], ['#8B5CF6', 0.18], ['#1D4ED8', 0.14]],
  };
  const [a, b, c] = palettes[mood];
  const k = (dimmed ? 0.35 : 1) * intensity;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color.bg.canvas }]}>
      <Bloom size={w * 1.5} color={a[0]} opacity={a[1] * k} left={-w * 0.55} top={-height * 0.12} />
      <Bloom size={w * 1.2} color={b[0]} opacity={b[1] * k} right={-w * 0.4} top={height * 0.04} />
      <Bloom size={w * 1.3} color={c[0]} opacity={c[1] * k} left={-w * 0.2} top={height * 0.55} />
    </View>
  );
}
