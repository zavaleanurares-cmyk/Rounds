import React from 'react';
import { Pressable, View, ActivityIndicator, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Text } from './Text';
import { Glass } from './Glass';
import { Glow } from './Glow';
import { Icon, type IconName } from './Icon';
import { color, gradient, radius, space, geometry } from '@/design/tokens';

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
}: ButtonProps) {
  const height = compact ? 44 : 56;
  const press = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        <Pressable
          onPress={press}
          disabled={disabled || loading}
          accessibilityRole="button"
          accessibilityLabel={title}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: Boolean(disabled) }}
          style={({ pressed }) => [container, { transform: [{ scale: pressed ? 0.985 : 1 }] }]}
        >
          <LinearGradient
            colors={gradient.tintPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', inset: 0, borderRadius: radius.button }}
          />
          {label}
        </Pressable>
      </Glow>
    );
  }

  if (kind === 'glass') {
    return (
      <Pressable
        onPress={press}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [{ width: full ? '100%' : undefined, opacity: pressed ? 0.85 : 1 }, style]}
      >
        <Glass radius={radius.button}>
          <View style={container}>{label}</View>
        </Glass>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={press}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        container,
        {
          backgroundColor: kind === 'destructive' ? 'rgba(255,69,58,0.12)' : color.surface.secondary,
          borderWidth: 1,
          borderColor: kind === 'destructive' ? 'rgba(255,69,58,0.28)' : color.separator,
          opacity: pressed ? 0.85 : disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {label}
    </Pressable>
  );
}
