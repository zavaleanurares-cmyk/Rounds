import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { color, gradient, radius } from '@/design/tokens';

export function ProgressBar({
  value,
  tint = color.brand.tint,
  height = 6,
  label,
}: {
  value: number;
  tint?: string;
  height?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}
    >
      <View style={{ width: `${pct * 100}%`, height: '100%' }}>
        <LinearGradient
          colors={[tint, tint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius: height }}
        />
      </View>
    </View>
  );
}

export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  tint = color.brand.tint,
  caption,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tint?: string;
  caption?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, value));
  const r = size / 2 - stroke / 2;
  const c = 2 * Math.PI * r;
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tint}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {caption ? (
        <Text variant="numericSmall" color={tint}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

/** An 8-bar sparkline. Deliberately unlabelled — the number above it is the point. */
export function Sparkline({
  values,
  height = 34,
  tint = color.brand.tintLight,
}: {
  values: number[];
  height?: number;
  tint?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height }} accessibilityElementsHidden>
      {values.map((v, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: Math.max(3, (v / max) * height),
            borderRadius: 3,
            backgroundColor: i === values.length - 1 ? tint : 'rgba(124,179,255,0.32)',
          }}
        />
      ))}
    </View>
  );
}

export const gradients = gradient;
export const cardRadius = radius.card;
