import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { color, radius, space } from '@/design/tokens';

export function StatTile({
  label,
  value,
  caption,
  tint = color.brand.tintLight,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  caption?: string;
  tint?: string;
  icon?: IconName;
  onPress?: () => void;
}) {
  const body = (
    <View
      style={{
        flex: 1,
        padding: space.md,
        borderRadius: radius.card,
        backgroundColor: color.surface.primary,
        borderWidth: 1,
        borderColor: color.card.rim,
        gap: 4,
        minHeight: 96,
        justifyContent: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon ? <Icon name={icon} size={14} color={tint} /> : null}
        <Text variant="caption1" tone="tertiary">{label}</Text>
      </View>
      <Text variant="numericMedium" color={tint} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {caption ? <Text variant="caption1" tone="tertiary" numberOfLines={2}>{caption}</Text> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.8 : 1 })}
    >
      {body}
    </Pressable>
  );
}

export function QuickAction({
  label,
  icon,
  onPress,
  tint = color.label.primary,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 76,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: space.m,
        borderRadius: radius.card,
        backgroundColor: color.surface.primary,
        borderWidth: 1,
        borderColor: color.card.rim,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name={icon} size={20} color={tint} />
      <Text variant="caption1" tone="secondary" center numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}
