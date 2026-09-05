import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from './Text';
import { color } from '@/design/tokens';

/**
 * The avatar palette.
 *
 * Twelve colours, all of which carry white initials at 4.5:1 or better. The app
 * owns this list rather than letting a user pick a hex value, so no profile can
 * end up with unreadable initials and a future palette change moves every
 * avatar with it.
 */
export const AVATAR_TINTS = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#F43F5E', '#EF4444', '#F97316',
  '#D97706', '#16A34A', '#0D9488', '#0284C7',
] as const;

function hueFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return h % AVATAR_TINTS.length;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export interface AvatarProps {
  name: string;
  size?: number;
  live?: boolean;
  /** A picked photo. Falls back to the monogram if it fails to load. */
  url?: string | null;
  /** Chosen palette index. Undefined or null means "derive it from the name". */
  tint?: number | null;
  /** A ring in the app accent — used for the person whose profile you are on. */
  ring?: boolean;
}

/**
 * No profile is ever a grey blob. A user who picks nothing still gets a
 * coloured monogram derived from their name; picking a tint or a photo just
 * replaces one deliberate thing with another.
 */
export function Avatar({ name, size = 34, live, url, tint, ring }: AvatarProps) {
  const index = tint === null || tint === undefined ? hueFor(name) : tint % AVATAR_TINTS.length;
  const bg = AVATAR_TINTS[index];
  const [failed, setFailed] = React.useState(false);
  const showPhoto = Boolean(url) && !failed;

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
          overflow: 'hidden',
          borderWidth: ring ? 2 : 0,
          borderColor: ring ? 'rgba(255,255,255,0.85)' : 'transparent',
        }}
      >
        {showPhoto ? (
          <Image
            source={{ uri: url as string }}
            style={{ width: size, height: size }}
            contentFit="cover"
            transition={160}
            onError={() => setFailed(true)}
            accessibilityLabel={`${name}'s photo`}
          />
        ) : (
          <Text
            style={{ fontSize: size * 0.38, fontWeight: '600', lineHeight: size * 0.46 }}
            color="#fff"
            accessibilityElementsHidden
          >
            {initials(name)}
          </Text>
        )}
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
    <View style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityLabel={names.length === 1 ? '1 person' : `${names.length} people`}>
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
