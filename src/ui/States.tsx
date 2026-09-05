import React from 'react';
import { View, ActivityIndicator, Pressable } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Card } from './Card';
import { color, space, radius } from '@/design/tokens';

/**
 * The five states every screen owes: loading, empty, error, offline, populated.
 * They live here so no screen has to invent its own — and so "populated only"
 * is a visible omission rather than an easy default.
 */

/** Skeletons match the final layout. Never a centred spinner on a data screen. */
export function SkeletonBlock({ height = 80, radius: r = radius.card, style }: { height?: number; radius?: number; style?: object }) {
  return (
    <View
      accessibilityElementsHidden
      style={[
        { height, borderRadius: r, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: color.separator },
        style,
      ]}
    />
  );
}

export function SkeletonRow() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ height: 12, width: '55%', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <View style={{ height: 10, width: '32%', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.04)' }} />
      </View>
    </View>
  );
}

export function ScreenSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View accessibilityLabel="Loading" style={{ gap: space.m }}>
      <SkeletonBlock height={132} />
      <SkeletonBlock height={86} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </View>
  );
}

/** Empty is never a dead end: exactly one clear action. */
export function EmptyState({
  icon = 'sparkles',
  title,
  body,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card aurora padding={space.lg}>
      <View style={{ alignItems: 'center', gap: space.m, paddingVertical: space.sm }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        >
          <Icon name={icon} size={24} color={color.brand.tintLight} />
        </View>
        <Text variant="title3" center>{title}</Text>
        <Text variant="subheadline" tone="secondary" center style={{ maxWidth: 300 }}>{body}</Text>
        {actionLabel && onAction ? (
          <Button title={actionLabel} onPress={onAction} full={false} compact style={{ marginTop: space.xs }} />
        ) : null}
      </View>
    </Card>
  );
}

/** Plain language plus retry. Never a raw error string. */
export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <Card padding={space.lg}>
      <View style={{ alignItems: 'center', gap: space.m }}>
        <Icon name="exclamationmark.triangle" size={26} color={color.warning} />
        <Text variant="headline" center>That didn't load</Text>
        <Text variant="subheadline" tone="secondary" center>
          {message ?? "We couldn't reach ROUNDS just now. Your logs are safe on this phone."}
        </Text>
        {onRetry ? <Button title="Try again" kind="glass" onPress={onRetry} full={false} compact /> : null}
      </View>
    </Card>
  );
}

/** Cached data stays on screen; this is the only thing that changes. */
export function OfflinePill({ pending }: { pending: number }) {
  return (
    <View
      accessibilityLabel={pending > 0 ? `Offline, ${pending} logs waiting to sync` : 'Offline'}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        paddingHorizontal: space.m,
        paddingVertical: 6,
        borderRadius: radius.capsule,
        backgroundColor: 'rgba(255,159,10,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,159,10,0.3)',
      }}
    >
      <Icon name="bolt" size={13} color={color.warning} />
      <Text variant="caption1" color={color.warning}>
        {pending > 0 ? `Offline · ${pending} waiting` : 'Offline'}
      </Text>
    </View>
  );
}

export function Spinner() {
  return (
    <View style={{ paddingVertical: space.xxl, alignItems: 'center' }}>
      <ActivityIndicator color={color.brand.tintLight} />
    </View>
  );
}

export function InlineLink({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link" hitSlop={8}>
      <Text variant="subheadline" color={color.brand.tintLight}>{title}</Text>
    </Pressable>
  );
}
