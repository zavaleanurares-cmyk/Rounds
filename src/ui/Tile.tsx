import React from 'react';
import { Animated, View, Pressable } from 'react-native';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { usePressScale, useCountUp } from './Motion';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * Tiles compress when you press them, like the buttons do.
 *
 * They used to dim to 80% opacity instead, which is the fallback every
 * Pressable gets for free and reads as "this control is temporarily disabled"
 * rather than as "I felt that". `Button` already used `usePressScale`; these
 * two are the most-tapped things on the You and Tonight tabs and were the
 * conspicuous places where the app did not answer a finger.
 *
 * Same spring as everywhere else, from the same hook, so nothing here invents
 * its own feel — and it respects Reduce Motion, which an opacity change did
 * not bother to.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StatTile({
  label,
  value,
  countTo,
  format,
  caption,
  tint = color.brand.tintLight,
  icon,
  onPress,
}: {
  label: string;
  value: string;
  /**
   * The number behind `value`, when there is one.
   *
   * Given both, the tile eases from zero to `countTo` and renders each frame
   * through `format`; `value` is what it settles on and what a screen reader
   * is told, so the accessible answer is never a half-counted number. Without
   * it the tile is exactly what it was — plenty of tiles show a duration or a
   * word, and a word cannot count.
   */
  countTo?: number;
  format?: (n: number) => string;
  caption?: string;
  tint?: string;
  icon?: IconName;
  onPress?: () => void;
}) {
  const t = useT();
  const counted = useCountUp(countTo ?? 0, { digits: 2 });
  const shown = countTo !== undefined && format ? format(Number(counted)) : value;
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
      <Text
        variant="numericMedium"
        color={tint}
        numberOfLines={1}
        adjustsFontSizeToFit
        accessibilityLabel={value}
      >
        {shown}
      </Text>
      {caption ? <Text variant="caption1" tone="tertiary" numberOfLines={2}>{caption}</Text> : null}
    </View>
  );
  if (!onPress) return body;
  return <PressableTile onPress={onPress} label={t('ui.tileLabel', { label, value })}>{body}</PressableTile>;
}

function PressableTile({
  onPress,
  label,
  children,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const { style, handlers } = usePressScale(0.97);
  return (
    <AnimatedPressable
      onPress={onPress}
      {...handlers}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </AnimatedPressable>
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
  const { style, handlers } = usePressScale(0.94);
  return (
    <AnimatedPressable
      onPress={onPress}
      {...handlers}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[{
        // A quarter of the row, wrapping — not `flex: 1`, which divides the
        // row by however many tiles happen to be in it and clips their labels
        // the moment a fifth is added. See the note at the call site in
        // `app/(tabs)/you.tsx`.
        flexBasis: '22%',
        flexGrow: 1,
        minHeight: 76,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: space.m,
        borderRadius: radius.card,
        backgroundColor: color.surface.primary,
        borderWidth: 1,
        borderColor: color.card.rim,
      }, style]}
    >
      <Icon name={icon} size={20} color={tint} />
      <Text variant="caption1" tone="secondary" center numberOfLines={1}>{label}</Text>
    </AnimatedPressable>
  );
}
