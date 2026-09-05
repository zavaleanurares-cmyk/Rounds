import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { color } from '@/design/tokens';

const PALETTE = ['#3B82F6', '#8B5CF6', '#F43F5E', '#FB923C', '#30D158', '#38BDF8'];

function hueFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return PALETTE[h % PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Skipping the avatar picker generates a coloured monogram — never a grey blob. */
export function Avatar({
  name,
  size = 34,
  live,
}: {
  name: string;
  size?: 24 | 28 | 34 | 46 | number;
  live?: boolean;
}) {
  const bg = hueFor(name);
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{ fontSize: size * 0.38, fontWeight: '600', lineHeight: size * 0.46 }}
          color="#fff"
          accessibilityElementsHidden
        >
          {initials(name)}
        </Text>
      </View>
      {live ? (
        <View
          accessibilityLabel="out right now"
          style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            backgroundColor: color.success,
            borderWidth: 2,
            borderColor: color.bg.canvas,
          }}
        />
      ) : null}
    </View>
  );
}

export function AvatarStack({ names, size = 28, max = 4 }: { names: string[]; size?: number; max?: number }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityLabel={`${names.length} people`}>
      {shown.map((n, i) => (
        <View key={n + i} style={{ marginLeft: i === 0 ? 0 : -size * 0.32 }}>
          <View style={{ borderRadius: size, borderWidth: 2, borderColor: color.surface.primary }}>
            <Avatar name={n} size={size} />
          </View>
        </View>
      ))}
      {extra > 0 ? (
        <Text variant="footnote" tone="tertiary" style={{ marginLeft: 8 }}>
          +{extra}
        </Text>
      ) : null}
    </View>
  );
}
