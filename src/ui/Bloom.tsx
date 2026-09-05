import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';

/**
 * A bloom — light source one and two of the three-light rule.
 *
 * Figma cannot blur a fill, so a bloom is an ellipse with a three-stop radial
 * falloff. That is deliberately what we reproduce here rather than a shadow:
 * shadows do not tint the pixels beneath them, and the whole point is that the
 * colour is emitted, not painted.
 */
export interface BloomProps {
  size: number;
  color: string;
  /** Peak opacity at the centre. */
  opacity?: number;
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
  style?: ViewStyle;
}

export function Bloom({ size, color, opacity = 0.55, left, top, right, bottom, style }: BloomProps) {
  const id = React.useId();
  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', width: size, height: size, left, top, right, bottom }, style]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="55%" stopColor={color} stopOpacity={opacity * 0.35} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={size / 2} cy={size / 2} rx={size / 2} ry={size / 2} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
