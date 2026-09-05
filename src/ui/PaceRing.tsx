import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, G } from 'react-native-svg';
import { Bloom } from './Bloom';
import { Text } from './Text';
import { color, paceColor, paceGradient, paceWord, type PaceState } from '@/design/tokens';
import type { PaceResult } from '@/domain/pace';
import { paceAccessibilityLabel } from '@/domain/pace';
import { useStore } from '@/data/store';

/**
 * The pace ring.
 *
 * Six segments = tonight's intended pace; filled = drinks logged. A matching
 * radial bloom sits behind it so the colour reads as emitted light.
 *
 * THE STATE WORD IS THE PRIMARY READOUT. The ‰ estimate is a separate, smaller
 * element that the screen owns — it is deliberately not part of this component,
 * so it can never be accidentally promoted into the hero.
 */
export interface PaceRingProps {
  result: PaceResult;
  size?: number;
  subtitle?: string;
}

export function PaceRing({ result, size = 220, subtitle }: PaceRingProps) {
  const state: PaceState = result.state;
  const stroke = 10;
  const r = size / 2 - stroke / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const segments = result.segments;
  const gapDeg = 5;
  const segDeg = 360 / segments - gapDeg;
  const segLen = (segDeg / 360) * circumference;
  const gapLen = (gapDeg / 360) * circumference;
  const id = React.useId();
  const [from, to] = paceGradient[state];

  // The chord available inside the ring, not the ring's full width. Barlow
  // Condensed runs ~0.46em per character including the tracking, and "SLOW DOWN"
  // is the word that has to fit — the state word is the primary readout, so it
  // is never allowed to truncate.
  const chord = (size - stroke * 2) * 0.86;
  const wordSize = Math.min(size * 0.2, chord / (paceWord[state].length * 0.58));

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={paceAccessibilityLabel(result)}
    >
      <Bloom size={size * 1.35} color={paceColor[state]} opacity={0.35} />
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </SvgGradient>
        </Defs>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          {Array.from({ length: segments }).map((_, i) => {
            const filled = i < result.filled;
            // Each segment is one dash on its own circle, rotated into place by
            // an offset along the circumference. Drawn as an arc rather than a
            // path so the round caps land correctly at both ends.
            return (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                stroke={filled ? `url(#${id})` : 'rgba(255,255,255,0.10)'}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${segLen} ${circumference - segLen}`}
                strokeDashoffset={-(gapLen / 2) - (circumference / segments) * i}
              />
            );
          })}
        </G>
      </Svg>
      <View style={{ alignItems: 'center', width: chord }}>
        <Text
          variant="numericPace"
          color={paceColor[state]}
          center
          numberOfLines={1}
          style={{ fontSize: wordSize, lineHeight: wordSize * 1.06, letterSpacing: wordSize * 0.02 }}
        >
          {paceWord[state]}
        </Text>
        {subtitle ? (
          <Text variant="subheadline" tone="secondary" center style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * The ‰ estimate. Separate on purpose.
 *
 * Rules baked in here rather than left to each screen:
 *  · never larger than `iOS/Subheadline`, always `label/tertiary`
 *  · the disclaimer sits directly beneath it, never elsewhere
 *  · SUPPRESSED ENTIRELY in the slow_down state — at that point the only useful
 *    instruction is "slow down", and a number invites negotiation
 *  · never rendered near a transport affordance, on a share card, or in any
 *    social surface (callers enforce placement; this enforces the rest)
 */
export function PaceEstimate({ bac, state }: { bac: number; state: PaceState }) {
  // Suppressed entirely when the app is telling someone to slow down, and off
  // unless they asked for it at all. Both checks live HERE rather than in the
  // callers, so a new placement cannot forget one.
  const { settings } = useStore();
  if (state === 'slow_down' || !settings.showEstimate) return null;
  return (
    <View style={{ alignItems: 'center', marginTop: 10 }}>
      <Text variant="subheadline" tone="tertiary">
        Estimate ≈ {bac.toFixed(2)}‰
      </Text>
      <Text variant="footnote" tone="quaternary" center style={{ marginTop: 2, maxWidth: 300 }}>
        Pacing estimate. Never use this to decide whether to drive.
      </Text>
    </View>
  );
}

export const paceRingColor = (s: PaceState) => paceColor[s];
export const paceRingSurface = color.surface.primary;
