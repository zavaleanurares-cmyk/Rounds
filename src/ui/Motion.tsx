import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, View, type ViewStyle } from 'react-native';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { motion } from '@/design/tokens';

/**
 * The motion primitives.
 *
 * Three rules hold everywhere in this file:
 *
 *  1. Reduce Motion is not "a shorter animation". It is no animation: the
 *     component mounts in its final state, on the first frame, with no timer
 *     and no interpolation. Anything else still moves the screen.
 *  2. Nothing here animates layout. Everything is transform and opacity, so it
 *     can run on the native driver and cannot reflow the page under a finger.
 *  3. An entrance plays once. These components deliberately do not re-run when
 *     their props change — a list that re-animates on every store update is the
 *     single most common way a "delightful" app becomes an unusable one.
 */

/** `useNativeDriver` is unavailable on web for some props; centralised here. */
const NATIVE = true;

export interface EnterProps {
  children: React.ReactNode;
  /** Milliseconds to wait before starting. Use `index * motion.stagger`. */
  delay?: number;
  /** How the element arrives. */
  from?: 'below' | 'above' | 'scale' | 'fade';
  distance?: number;
  style?: ViewStyle;
}

/** A single element arriving. Plays once, on mount. */
export function Enter({ children, delay = 0, from = 'below', distance = 14, style }: EnterProps) {
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(reduce ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) {
      progress.setValue(1);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: motion.base,
      delay,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: NATIVE,
    });
    anim.start();
    return () => anim.stop();
    // Deliberately mount-only: see rule 3 above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduce) return <View style={style}>{children}</View>;

  const transform: any[] = [];
  if (from === 'below') transform.push({ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) });
  if (from === 'above') transform.push({ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-distance, 0] }) });
  if (from === 'scale') transform.push({ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) });

  return <Animated.View style={[style, { opacity: progress, transform }]}>{children}</Animated.View>;
}

/**
 * Wraps each child in an `Enter` with an increasing delay.
 *
 * Capped at eight, because past that the last item arrives so late it reads as
 * the screen being slow rather than as a flourish.
 */
export function Stagger({
  children,
  from = 'below',
  step = motion.stagger,
  delay = 0,
}: {
  children: React.ReactNode;
  from?: EnterProps['from'];
  step?: number;
  delay?: number;
}) {
  const items = React.Children.toArray(children);
  return (
    <>
      {items.map((child, i) => (
        <Enter key={i} delay={delay + Math.min(i, 8) * step} from={from}>
          {child}
        </Enter>
      ))}
    </>
  );
}

/**
 * A value that eases to its new number instead of jumping.
 *
 * Returns a string, already formatted, so callers do not have to deal with an
 * Animated node — this is for figures inside ordinary `Text`.
 */
export function useCountUp(value: number, { digits = 0, duration = motion.slow }: { digits?: number; duration?: number } = {}) {
  const reduce = useReduceMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduce || from.current === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = Date.now();
    const a = from.current;
    const b = value;
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      // easeOutCubic — fast first, so the final digits settle rather than crawl.
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(a + (b - a) * eased);
      if (t >= 1) {
        clearInterval(id);
        from.current = b;
      }
    }, 32);
    return () => clearInterval(id);
  }, [value, reduce, duration]);

  return shown.toFixed(digits);
}

/**
 * A pressable's press-down scale. Returns a style and the two handlers.
 *
 * This exists so every tappable thing in the app compresses by the same amount
 * with the same spring, rather than each screen inventing its own.
 */
export function usePressScale(to = 0.96) {
  const reduce = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const handlers = useMemo(
    () => ({
      onPressIn: () => {
        if (reduce) return;
        Animated.spring(scale, { toValue: to, useNativeDriver: NATIVE, ...motion.spring.pop }).start();
      },
      onPressOut: () => {
        if (reduce) return;
        Animated.spring(scale, { toValue: 1, useNativeDriver: NATIVE, ...motion.spring.settle }).start();
      },
    }),
    [reduce, scale, to]
  );
  return { style: { transform: [{ scale }] }, handlers };
}

/**
 * A slow, continuous pulse. Used for the live dot and the pace ring while a
 * session is running — the one thing in the app that is allowed to loop.
 */
export function usePulse({ min = 0.55, max = 1, duration = 1800 }: { min?: number; max?: number; duration?: number } = {}) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(max)).current;
  useEffect(() => {
    if (reduce) {
      v.setValue(max);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: min, duration: duration / 2, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE }),
        Animated.timing(v, { toValue: max, duration: duration / 2, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, v, min, max, duration]);
  return v;
}

/**
 * Drives a 0→1 Animated value once, on demand. The celebration overlay and the
 * XP bar both hang off this.
 */
export function useReveal(active: boolean, { duration = motion.slow, delay = 0 }: { duration?: number; delay?: number } = {}) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(active && reduce ? 1 : 0)).current;
  useEffect(() => {
    if (reduce) {
      v.setValue(active ? 1 : 0);
      return;
    }
    const anim = Animated.timing(v, {
      toValue: active ? 1 : 0,
      duration,
      delay: active ? delay : 0,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: NATIVE,
    });
    anim.start();
    return () => anim.stop();
  }, [active, reduce, v, duration, delay]);
  return v;
}
