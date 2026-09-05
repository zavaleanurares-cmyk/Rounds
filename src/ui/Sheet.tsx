import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Text } from './Text';
import { useT } from '@/i18n';
import { color, radius, space, blur } from '@/design/tokens';

/**
 * Bottom sheet chrome. On Android the system back gesture dismisses it, which
 * expo-router handles by popping the modal route — so there is nothing to do
 * here beyond making the backdrop tappable.
 */
export function Sheet({
  children,
  title,
  subtitle,
  onClose,
  footer,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  footer?: React.ReactNode;
}) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const close = onClose ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/tonight')));

  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <Pressable style={{ flex: 1 }} onPress={close} accessibilityLabel={t('ui.dismiss')} accessibilityRole="button" />
      <View
        style={{
          borderTopLeftRadius: radius.sheet,
          borderTopRightRadius: radius.sheet,
          overflow: 'hidden',
          backgroundColor: color.bg.elevated,
          borderTopWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
          paddingBottom: Math.max(insets.bottom, space.md),
          maxHeight: '92%',
        }}
      >
        <BlurView intensity={blur.sheet} tint="dark" style={{ position: 'absolute', inset: 0 }} />
        <View style={{ alignItems: 'center', paddingTop: space.m }}>
          <View style={{ width: 38, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)' }} />
        </View>
        {title ? (
          <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
            <Text variant="title2">{title}</Text>
            {subtitle ? (
              <Text variant="subheadline" tone="secondary" style={{ marginTop: 2 }}>{subtitle}</Text>
            ) : null}
          </View>
        ) : null}
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>{children}</View>
        {footer ? <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>{footer}</View> : null}
      </View>
    </View>
  );
}
