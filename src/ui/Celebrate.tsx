import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { Glow } from './Glow';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { useT } from '@/i18n';
import { color, motion, radius, space } from '@/design/tokens';

/**
 * The celebration.
 *
 * One overlay for every good moment — an achievement, a level, a streak — so
 * there is exactly one visual language for "well done" rather than three.
 *
 * The burst is drawn, not a particle library and not a GIF: twenty-four short
 * strokes on a circle, each with its own angle, length and delay. That keeps it
 * on the native driver, keeps it the app's own colours, and keeps the bundle
 * from growing by a megabyte for four seconds of confetti.
 *
 * Under Reduce Motion the burst is not shown at all — the card simply appears.
 * A "reduced" explosion is still an explosion.
 */

export interface CelebrationContent {
  kind: 'achievement' | 'level' | 'streak';
  title: string;
  body: string;
  icon: IconName;
  /** Shown small above the title — "ACHIEVEMENT", "LEVEL 6". */
  eyebrow: string;
}

const RAYS = 24;

function Burst({ progress, tint }: { progress: Animated.Value; tint: string }) {
  // Each ray gets a stable pseudo-random length and phase from its index, so
  // the burst looks scattered but is identical every time — a celebration that
  // is different on each viewing reads as a glitch.
  const rays = useMemo(
    () =>
      Array.from({ length: RAYS }, (_, i) => {
        const a = (i / RAYS) * Math.PI * 2;
        const jitter = ((i * 2654435761) % 1000) / 1000;
        return { a, len: 22 + jitter * 30, delay: jitter * 0.25, thin: jitter > 0.6 };
      }),
    []
  );

  return (
    <View style={{ position: 'absolute', width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
      {rays.map((r, i) => {
        const start = r.delay;
        const travel = progress.interpolate({
          inputRange: [0, start, Math.min(1, start + 0.6), 1],
          outputRange: [0, 0, 1, 1],
          extrapolate: 'clamp',
        });
        const opacity = progress.interpolate({
          inputRange: [0, start, start + 0.15, Math.min(1, start + 0.65), 1],
          outputRange: [0, 0, 1, 0, 0],
          extrapolate: 'clamp',
        });
        return (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              opacity,
              transform: [
                { rotate: `${(r.a * 180) / Math.PI}deg` },
                { translateY: travel.interpolate({ inputRange: [0, 1], outputRange: [-40, -40 - r.len] }) },
              ],
            }}
          >
            <View
              style={{
                width: r.thin ? 2 : 3,
                height: r.thin ? 10 : 14,
                borderRadius: 2,
                backgroundColor: i % 3 === 0 ? tint : i % 3 === 1 ? color.brand.tintLight : '#FFFFFF',
              }}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

/** The ring that sweeps once around the badge. */
function Sweep({ progress, tint }: { progress: Animated.Value; tint: string }) {
  const size = 96;
  const r = size / 2 - 3;
  const circumference = 2 * Math.PI * r;
  const AnimatedCircle = useMemo(() => Animated.createAnimatedComponent(Circle), []);
  const offset = progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [circumference, 0, 0] });
  return (
    <Svg width={size} height={size} style={{ position: 'absolute' }}>
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={tint}
        strokeWidth={2}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset as unknown as number}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}

export function Celebration({
  content,
  onDismiss,
}: {
  content: CelebrationContent | null;
  onDismiss: () => void;
}) {
  const t = useT();
  const reduce = useReduceMotion();
  const burst = useRef(new Animated.Value(0)).current;
  const card = useRef(new Animated.Value(0)).current;
  const visible = Boolean(content);

  useEffect(() => {
    if (!visible) {
      burst.setValue(0);
      card.setValue(0);
      return;
    }
    if (reduce) {
      card.setValue(1);
      return;
    }
    const anim = Animated.parallel([
      Animated.spring(card, { toValue: 1, useNativeDriver: true, ...motion.spring.pop }),
      Animated.timing(burst, {
        toValue: 1,
        duration: motion.celebrate,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [visible, reduce, burst, card]);

  if (!content) return null;

  const tint = content.kind === 'level' ? color.brand.tintLight : content.kind === 'streak' ? color.pace.easy : color.brand.tint;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={t('ui.dismiss')}
        style={{ flex: 1, backgroundColor: 'rgba(6,7,11,0.86)', alignItems: 'center', justifyContent: 'center', padding: space.lg }}
      >
        <Animated.View
          style={{
            alignItems: 'center',
            opacity: card,
            transform: [{ scale: card.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
          }}
        >
          <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
            {reduce ? null : <Burst progress={burst} tint={tint} />}
            <Glow color={tint} radius={48}>
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: color.surface.primary,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.10)',
                }}
              >
                {reduce ? null : <Sweep progress={burst} tint={tint} />}
                <Icon name={content.icon} size={34} color={tint} />
              </View>
            </Glow>
          </View>

          <Text variant="sectionHeader" tone="tertiary" style={{ marginTop: space.m }}>
            {content.eyebrow.toUpperCase()}
          </Text>
          <Text variant="title2" center style={{ marginTop: space.xs }}>
            {content.title}
          </Text>
          <Text variant="subheadline" tone="secondary" center style={{ marginTop: space.sm, maxWidth: 300 }}>
            {content.body}
          </Text>

          <View
            style={{
              marginTop: space.lg,
              paddingHorizontal: space.lg,
              paddingVertical: space.m,
              borderRadius: radius.control,
              backgroundColor: color.surface.secondary,
              borderWidth: 1,
              borderColor: color.separator,
            }}
          >
            <Text variant="headline">{t('ui.nice')}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

/** The XP bar. Fills to `fraction` once, on mount and whenever it grows. */
export function LevelBar({
  level,
  fraction,
  intoLevel,
  levelSpan,
}: {
  level: number;
  fraction: number;
  intoLevel: number;
  levelSpan: number;
}) {
  const t = useT();
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(reduce ? fraction : 0)).current;

  useEffect(() => {
    if (reduce) {
      v.setValue(fraction);
      return;
    }
    const anim = Animated.timing(v, {
      toValue: fraction,
      duration: motion.slow,
      delay: 120,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      // width cannot use the native driver
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [fraction, reduce, v]);

  return (
    <View accessibilityLabel={t('ui.levelProgress', { level, into: intoLevel, span: levelSpan })}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text variant="footnote" tone="secondary">{t('ui.level', { level })}</Text>
        <Text variant="footnote" tone="tertiary">
          {intoLevel} / {levelSpan}
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: 6,
            borderRadius: 3,
            backgroundColor: color.brand.tintLight,
            width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        />
      </View>
    </View>
  );
}
