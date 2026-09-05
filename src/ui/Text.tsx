import React from 'react';
import { Text as RNText, type TextProps, type TextStyle, StyleSheet } from 'react-native';
import { color, type as typeRamp, font } from '@/design/tokens';

export type TypeVariant = keyof typeof typeRamp;
export type LabelTone = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

export interface RTextProps extends TextProps {
  variant?: TypeVariant;
  tone?: LabelTone;
  /** Overrides `tone`. Use only for pace / accent colour. */
  color?: string;
  center?: boolean;
}

const NUMERIC = new Set(['numericPace', 'numericLarge', 'numericMedium', 'numericSmall']);

/**
 * Every text node references a style from the ramp. A loose fontSize is a defect
 * unless it is a deliberate display size, in which case add it to the ramp.
 */
export function Text({
  variant = 'body',
  tone = 'primary',
  color: colorOverride,
  center,
  style,
  ...rest
}: RTextProps) {
  const base = typeRamp[variant] as TextStyle;
  const family = NUMERIC.has(variant) ? font.numeric : font.body;
  return (
    <RNText
      {...rest}
      style={StyleSheet.flatten([
        base,
        family ? { fontFamily: family } : null,
        { color: colorOverride ?? color.label[tone] },
        center ? { textAlign: 'center' } : null,
        style,
      ])}
      // Cap scaling rather than clip: the numeric hero layouts break first.
      maxFontSizeMultiplier={NUMERIC.has(variant) ? 1.4 : 2.2}
    />
  );
}
