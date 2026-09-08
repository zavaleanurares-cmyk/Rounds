import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
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
 *
 * THE BODY SCROLLS, and it scrolls here rather than in each screen.
 *
 * This container clips — `overflow: 'hidden'` and `maxHeight: '92%'` — and for
 * a long time nothing inside it scrolled. `log/edit/[logId]` rendered all 165
 * drink chips straight into it, so most of the picker AND the price field and
 * time chips below it could not be reached at all; `log/index` hand-rolled its
 * own `<ScrollView style={{ maxHeight: 540 }}>`, a device-independent constant
 * that overflows 92% of an SE-sized screen once the handle, title and bottom
 * inset are counted. Sixteen screens use this component and each was one
 * forgotten wrapper away from the same bug.
 *
 * `flexShrink: 1` rather than `flex: 1`: the sheet must still hug its content
 * when the content is short — a two-field sheet should not become a
 * full-height panel — and only give way once it would exceed the clip.
 *
 * The footer stays OUTSIDE the scroller on purpose. Save and Delete are why
 * the sheet is open; they do not scroll away.
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
        <ScrollView
          style={{ flexShrink: 1 }}
          contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: space.md }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>{footer}</View> : null}
      </View>
    </View>
  );
}
