import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { glow } from '@/design/tokens';

/**
 * Glow/Primary is two stacked shadows: a tight bright core and a wide soft halo.
 * React Native gives one shadow per view, so a glow is two nested views.
 *
 * Reserved for the single tinted control on a screen. Tint carries meaning; if
 * two things glow, neither does.
 */
export function Glow({
  color,
  radius,
  children,
  style,
}: {
  color: string;
  radius: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          shadowColor: color,
          shadowOpacity: glow.halo.opacity,
          shadowRadius: glow.halo.radius,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
        style,
      ]}
    >
      <View
        style={{
          borderRadius: radius,
          shadowColor: color,
          shadowOpacity: glow.core.opacity,
          shadowRadius: glow.core.radius,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        {children}
      </View>
    </View>
  );
}
