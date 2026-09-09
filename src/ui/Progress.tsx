import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/** `strokeDasharray` is an SVG prop, so the ring needs its own animated Circle. */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './Text';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { color, gradient, motion, radius } from '@/design/tokens';

/**
 * Bars and rings fill from empty, once, when they arrive.
 *
 * Every one of these used to render at its final value on the first frame,
 * which is the difference between a chart and a picture of a chart. Filling is
 * not decoration here: it is the only thing that tells you the bar is a
 * quantity rather than a shape, and it makes a small number — five stamps,
 * three of five kinds — feel like it moved, which is the whole complaint about
 * these screens.
 *
 * Width and height are animated rather than transform, which rules out the
 * native driver. That is acceptable for exactly this: these are single
 * elements, they animate once on mount, and scaling a rounded bar horizontally
 * would stretch its end caps into ellipses.
 */
function useFill(target: number, delay = 0) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(reduce ? target : 0)).current;
  useEffect(() => {
    if (reduce) {
      v.setValue(target);
      return;
    }
    const a = Animated.timing(v, {
      toValue: target,
      duration: motion.slow,
      delay,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [target, reduce, v, delay]);
  return v;
}

export function ProgressBar({
  value,
  tint = color.brand.tint,
  height = 6,
  label,
  delay = 0,
}: {
  value: number;
  tint?: string;
  height?: number;
  label?: string;
  /** Milliseconds before the fill starts, for staggering a column of bars. */
  delay?: number;
}) {
  const pct = Math.max(0, Math.min(1, value));
  const fill = useFill(pct, delay);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}
    >
      <Animated.View
        style={{
          width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          height: '100%',
        }}
      >
        <LinearGradient
          colors={[tint, tint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, borderRadius: height }}
        />
      </Animated.View>
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
  const sweep = useFill(pct);
  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tint}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          // Sweeps round from twelve o'clock instead of appearing complete.
          strokeDasharray={sweep.interpolate({
            inputRange: [0, 1],
            outputRange: [`0 ${c}`, `${c} ${c}`],
          })}
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
        <Bar
          key={i}
          to={Math.max(3, (v / max) * height)}
          delay={i * 40}
          tint={i === values.length - 1 ? tint : 'rgba(124,179,255,0.32)'}
        />
      ))}
    </View>
  );
}

/**
 * One bar of a chart, growing from the baseline.
 *
 * Exported because two screens draw their own bar rows rather than using
 * `Sparkline` — Insights' by-day chart has labels under each column — and they
 * should not each reimplement the growth.
 */
export function Bar({
  to,
  tint,
  delay = 0,
  radius: r = 3,
}: {
  to: number;
  tint: string;
  delay?: number;
  radius?: number;
}) {
  const h = useFill(to, delay);
  return <Animated.View style={{ flex: 1, height: h, borderRadius: r, backgroundColor: tint }} />;
}

export const gradients = gradient;
export const cardRadius = radius.card;
