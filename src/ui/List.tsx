import React from 'react';
import { View, Pressable, Switch, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { color, space, radius, geometry } from '@/design/tokens';

/** `List Row / Navigation` — pushes somewhere. */
export function NavRow({
  title,
  subtitle,
  icon,
  value,
  onPress,
  destructive,
  last,
  accessibilityHint,
  selected,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
  accessibilityHint?: string;
  /**
   * A row that PICKS something rather than going somewhere: shows a drawn tick
   * instead of a chevron, and tells a screen reader it is selected. There are
   * no glyph ticks in this app — see the emoji policy test.
   */
  selected?: boolean;
}) {
  const tint = destructive ? color.safety : color.label.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={selected === undefined ? 'button' : 'radio'}
      accessibilityState={selected === undefined ? undefined : { selected }}
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [rowStyle(last), { opacity: pressed ? 0.7 : 1 }]}
    >
      {icon ? <Icon name={icon} size={20} color={destructive ? color.safety : color.label.secondary} /> : null}
      <View style={{ flex: 1 }}>
        <Text variant="body" color={tint}>{title}</Text>
        {subtitle ? (
          <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>
      {value ? <Text variant="subheadline" tone="tertiary">{value}</Text> : null}
      {selected === true ? (
        <Icon name="checkmark" size={17} color={color.brand.tintLight} />
      ) : selected === false ? (
        <View style={{ width: 17 }} />
      ) : onPress ? (
        <Icon name="chevron.right" size={16} color={color.label.quaternary} />
      ) : null}
    </Pressable>
  );
}

/** `List Row / Value` — read-only. */
export function ValueRow({ title, value, last }: { title: string; value: string; last?: boolean }) {
  return (
    <View style={rowStyle(last)}>
      <Text variant="body" style={{ flex: 1 }}>{title}</Text>
      <Text variant="body" tone="secondary">{value}</Text>
    </View>
  );
}

/** `List Row / Toggle`. */
export function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
  disabled,
  disabledNote,
  last,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  /** Why it is disabled — stated inline, never left as a dead switch. */
  disabledNote?: string;
  last?: boolean;
}) {
  return (
    <View style={rowStyle(last)}>
      <View style={{ flex: 1 }}>
        <Text variant="body">{title}</Text>
        {subtitle ? <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>{subtitle}</Text> : null}
        {disabled && disabledNote ? (
          <Text variant="footnote" color={color.warning} style={{ marginTop: 4 }}>{disabledNote}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: color.surface.tertiary, true: color.brand.tint }}
        thumbColor="#fff"
        accessibilityLabel={title}
      />
    </View>
  );
}

function rowStyle(last?: boolean): ViewStyle {
  return {
    minHeight: geometry.minTouch + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.m,
    paddingVertical: space.m,
    paddingHorizontal: space.md,
    borderBottomWidth: last ? 0 : 1,
    borderBottomColor: color.separator,
  };
}

/** A grouped list — the container every row above expects. */
export function Group({ title, children, style }: { title?: string; children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[{ marginBottom: space.lg }, style]}>
      {title ? (
        <Text variant="sectionHeader" tone="tertiary" style={{ marginBottom: space.sm, marginLeft: space.xs }}>
          {title}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: color.surface.primary,
          borderRadius: radius.card,
          borderWidth: 1,
          borderColor: color.card.rim,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </View>
  );
}
