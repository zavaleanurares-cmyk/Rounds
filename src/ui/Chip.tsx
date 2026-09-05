import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Text';
import { color, radius, space, geometry } from '@/design/tokens';

export function Chip({
  label,
  selected,
  onPress,
  glyph,
  compact,
  accessibilityHint,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** A drawn mark — never an emoji. Usually a <DrinkGlyph>. */
  glyph?: React.ReactNode;
  compact?: boolean;
  accessibilityHint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => ({
        minHeight: compact ? 34 : geometry.minTouch,
        paddingHorizontal: compact ? space.m : space.md,
        justifyContent: 'center',
        borderRadius: radius.control,
        backgroundColor: selected ? 'rgba(59,130,246,0.22)' : color.surface.secondary,
        borderWidth: 1,
        borderColor: selected ? 'rgba(124,179,255,0.55)' : color.separator,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        {glyph}
        <Text variant={compact ? 'footnote' : 'subheadline'} color={selected ? color.brand.tintLight : color.label.primary}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        backgroundColor: color.surface.secondary,
        borderRadius: radius.control,
        padding: 3,
        borderWidth: 1,
        borderColor: color.separator,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            style={{
              flex: 1,
              minHeight: 38,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radius.control - 3,
              backgroundColor: active ? color.surface.tertiary : 'transparent',
            }}
          >
            <Text variant="subheadline" tone={active ? 'primary' : 'secondary'} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
