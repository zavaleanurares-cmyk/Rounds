import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { Mood } from '@/domain/types';
import { color } from '@/design/tokens';

/**
 * The four moods, drawn.
 *
 * Emoji were the obvious choice and the wrong one: 😄 renders as a different
 * face on every platform, cannot take the app's palette, and — the part that
 * matters here — this control is tapped at 3am by someone tired, on a dimmed
 * screen. A drawn face can be given the contrast and the size that situation
 * needs; a system emoji is whatever the OS decides.
 *
 * The colour carries the same meaning as the pace ring, so the scale reads the
 * same way everywhere in the app.
 */
export const MOOD_TINT: Record<Mood, string> = {
  great: color.pace.steady,
  good: color.brand.tintLight,
  rough: color.pace.quick,
  bad: color.safety,
};

export const MOOD_LABEL: Record<Mood, string> = {
  great: 'Great',
  good: 'Good',
  rough: 'Rough',
  bad: 'Bad',
};

export function MoodFace({
  mood,
  size = 34,
  active,
}: {
  mood: Mood;
  size?: number;
  active?: boolean;
}) {
  const id = React.useId();
  const tint = MOOD_TINT[mood];
  const stroke = active ? tint : color.label.secondary;
  const w = size / 12;

  const line = {
    stroke,
    strokeWidth: w,
    strokeLinecap: 'round' as const,
    fill: 'none',
  };

  // The mouth is the whole expression; the eyes only change for "bad".
  const mouth: Record<Mood, string> = {
    great: 'M15 27 Q24 36 33 27',
    good: 'M16 28 Q24 32.5 32 28',
    rough: 'M16 31 Q24 27.5 32 31',
    bad: 'M16 32.5 Q24 25 32 32.5',
  };

  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="42%" r="58%">
            <Stop offset="0" stopColor={tint} stopOpacity={active ? 0.28 : 0.1} />
            <Stop offset="1" stopColor={tint} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={24} cy={24} r={22} fill={`url(#${id})`} />
        <Circle cx={24} cy={24} r={19} stroke={stroke} strokeWidth={w} fill="none" opacity={active ? 1 : 0.55} />
        {mood === 'bad' ? (
          <>
            <Path {...line} d="M15 16 L21 20" />
            <Path {...line} d="M33 16 L27 20" />
          </>
        ) : (
          <>
            <Circle cx={17.5} cy={19.5} r={w * 1.15} fill={stroke} />
            <Circle cx={30.5} cy={19.5} r={w * 1.15} fill={stroke} />
          </>
        )}
        <Path {...line} d={mouth[mood]} />
      </Svg>
    </View>
  );
}

export const MOODS: Mood[] = ['great', 'good', 'rough', 'bad'];
