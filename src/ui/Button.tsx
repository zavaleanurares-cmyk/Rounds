import React from 'react';
import { Animated, Pressable, View, ActivityIndicator, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { feedback, type Cue } from '@/services/feedback';
import { usePressScale } from './Motion';
import { Text } from './Text';
import { Glass } from './Glass';
import { Glow } from './Glow';
import { Icon, type IconName } from './Icon';
import { color, gradient, radius, space, geometry } from '@/design/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonKind = 'primary' | 'glass' | 'plain' | 'destructive';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  kind?: ButtonKind;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
  /**
   * Which cue this button fires. Defaults to a light tap; a button that means
   * something bigger (starting a night, closing one) names its own.
   */
  cue?: Cue;
}

/**
 * Primary is a 20pt rounded rectangle, not a capsule — it reads as a surface
 * rather than a chip. It carries `Gradient/Tint Primary` + `Glow/Primary`, and
 * there is at most ONE of it per screen. Glass is for secondary actions in the
 * functional layer; Plain sits inside content cards.
 */
export function Button({
  title,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  loading,
  full = true,
  compact,
  style,
  accessibilityHint,
  cue = 'tap',
}: ButtonProps) {
  const height = compact ? 44 : 56;
  const scale = usePressScale(0.97);
  const press = () => {
    if (disabled || loading) return;
    feedback(cue);
    onPress?.();
  };

  const label = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm }}>
      {loading ? (
        <ActivityIndicator color={color.label.primary} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={19} color={kind === 'destructive' ? color.safety : color.label.primary} /> : null}
          <Text
            variant="headline"
            color={kind === 'destructive' ? color.safety : color.label.primary}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  const container: ViewStyle = {
    height,
    minHeight: geometry.minTouch,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    width: full ? '100%' : undefined,
    opacity: disabled ? 0.4 : 1,
  };

  if (kind === 'primary') {
    return (
      <Glow color={color.brand.tint} radius={radius.button} style={[{ width: full ? '100%' : undefined }, style]}>
        <AnimatedPressable
          onPress={press}
          {...scale.handlers}
          disabled={disabled || loading}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: Boolean(disabled) }}
          style={[container, scale.style]}
        >
          <LinearGradient
            colors={gradient.tintPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', inset: 0, borderRadius: radius.button }}
          />
          {label}
        </AnimatedPressable>
      </Glow>
    );
  }

  if (kind === 'glass') {
    return (
      <AnimatedPressable
        onPress={press}
        {...scale.handlers}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={accessibilityHint}
        style={[{ width: full ? '100%' : undefined }, scale.style, style]}
      >
        <Glass radius={radius.button}>
          <View style={container}>{label}</View>
        </Glass>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={press}
      {...scale.handlers}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      style={[
        container,
        {
          backgroundColor: kind === 'destructive' ? 'rgba(255,69,58,0.12)' : color.surface.secondary,
          borderWidth: 1,
          borderColor: kind === 'destructive' ? 'rgba(255,69,58,0.28)' : color.separator,
          opacity: disabled ? 0.4 : 1,
        },
        scale.style,
        style,
      ]}
    >
      {label}
    </AnimatedPressable>
  );
}
