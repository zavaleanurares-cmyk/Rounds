import React, { useCallback, useRef } from 'react';
import {
  View, ScrollView, Pressable, Animated, type ViewStyle, type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Aurora, type AuroraMood } from './Aurora';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { Glass } from './Glass';
import { OfflinePill } from './States';
import { useNightDimming } from '@/hooks/useNightDimming';
import { useT } from '@/i18n';
import { useStore } from '@/data/store';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { color, space, geometry, type as typeRamp } from '@/design/tokens';

export interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  /** Large title that collapses smoothly on scroll. */
  largeTitle?: boolean;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: { icon: IconName; onPress: () => void; label: string } | null;
  mood?: AuroraMood;
  accent?: string;
  dimmed?: boolean;
  scroll?: boolean;
  /** Extra bottom padding so the floating tab bar never covers content. */
  tabBarSpace?: boolean;
  contentStyle?: ViewStyle;
  footer?: React.ReactNode;
}

export const TAB_BAR_CLEARANCE = geometry.tabBar.height + geometry.tabBar.aboveSafeArea + space.lg;

const LARGE = typeRamp.largeTitle.fontSize;
const SMALL = typeRamp.headline.fontSize;
/** How far you scroll before the title has finished collapsing. */
const COLLAPSE = 64;
/** Line-height multiplier the large title is laid out with. */
const TITLE_LINE = 1.2;

/**
 * The screen scaffold.
 *
 * The header is FIXED and the title collapses by interpolating a scroll value —
 * it is not mounted and unmounted at a threshold. Two reasons that matters:
 *
 *  · Swapping the title between two elements changed the header's height, which
 *    changed the ScrollView's content offset, which could re-cross the
 *    threshold — the title flickering while you dragged.
 *  · The right-hand action (Settings, Share) lived inside that moving block, so
 *    it jumped around and sometimes scrolled away. It now sits in a fixed layer
 *    and never moves.
 *  · A fixed header needs something behind it. The backdrop fades in as you
 *    scroll and shrinks to the height of the action row, so the collapsed title
 *    sits on an opaque bar instead of letting content slide through it.
 */
export function Screen({
  children,
  title,
  largeTitle = true,
  subtitle,
  back,
  onBack,
  right,
  mood = 'default',
  accent,
  dimmed,
  scroll = true,
  tabBarSpace,
  contentStyle,
  footer,
}: ScreenProps) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { queue } = useStore();
  const reduceMotion = useReduceMotion();
  /**
   * The default for `dimmed`, not an override: a screen that dims on purpose
   * (the morning recap, the winddown) still says so and still wins. This is
   * what makes "Dim after 1am" a setting rather than a stored boolean.
   */
  const nightDim = useNightDimming();

  const scrollY = useRef(new Animated.Value(0)).current;
  const showOffline = queue.pending > 0 && !queue.online;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.setValue(e.nativeEvent.contentOffset.y);
    },
    [scrollY]
  );

  const clamp = scrollY.interpolate({
    inputRange: [0, COLLAPSE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const hasHeader = Boolean(title);
  // Header geometry, all derived from one place so the backdrop, the title and
  // the ScrollView's top padding can never disagree with each other.
  const ROW = 44;
  const titleTop = ROW + space.xs;
  const titleCentre = titleTop + (LARGE * TITLE_LINE) / 2;
  const collapsedHeight = ROW + space.sm;
  const expandedHeight = largeTitle
    ? titleTop + LARGE * TITLE_LINE + (subtitle ? 22 : 0) + space.sm
    : collapsedHeight;
  const headerHeight = hasHeader ? expandedHeight : 0;
  // Collapsed, the title rides up into the action row. When there is a back
  // chevron it also slides right so it lands beside it rather than on top of it.
  const liftTo = ROW / 2 - titleCentre;
  const slideTo = back ? 36 + space.m : 0;

  // Reduce Motion collapses instantly rather than gliding, but the geometry is
  // identical either way — nothing is mounted or unmounted at a threshold.
  const at = (from: number, to: number) =>
    reduceMotion ? to : clamp.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

  const titleScale = at(1, SMALL / LARGE);
  const titleTranslateY = at(0, liftTo);
  const titleTranslateX = at(0, slideTo);
  const topInset = insets.top || geometry.safeArea.top / 2;
  // The backdrop reaches up through the status bar, so it carries the inset too.
  const backdropHeight = at(expandedHeight + topInset, collapsedHeight + topInset);
  const backdropOpacity = clamp.interpolate({ inputRange: [0, 0.35], outputRange: [0, 1], extrapolate: 'clamp' });
  const subtitleOpacity = clamp.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' });

  const body = (
    <View
      style={[
        {
          paddingHorizontal: geometry.screenMargin,
          paddingTop: hasHeader ? space.sm : 0,
          paddingBottom: tabBarSpace ? TAB_BAR_CLEARANCE + insets.bottom : space.xxl + insets.bottom,
          gap: space.md,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      <StatusBar style="light" />
      <Aurora mood={mood} accent={accent} dimmed={dimmed ?? nightDim} />

      <View style={{ flex: 1, paddingTop: topInset }}>
        {scroll ? (
          <Animated.ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingTop: headerHeight }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={onScroll}
          >
            {body}
          </Animated.ScrollView>
        ) : (
          <View style={{ flex: 1, paddingTop: headerHeight }}>{body}</View>
        )}

        {/* The fixed header layer. Nothing in here moves with the content. */}
        {hasHeader ? (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: topInset,
              left: 0,
              right: 0,
              paddingHorizontal: geometry.screenMargin,
            }}
          >
            {/* Backdrop. Sits behind everything in this layer, extends up
                through the status bar, and only appears once you have actually
                scrolled — at rest the aurora shows through unbroken. */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: -topInset,
                height: backdropHeight,
                opacity: backdropOpacity,
                backgroundColor: color.bg.canvas,
                borderBottomWidth: 1,
                borderBottomColor: color.separator,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: space.m }}>
              {back ? (
                <Pressable
                  onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/tonight')))}
                  accessibilityRole="button"
                  accessibilityLabel={t('ui.back')}
                  hitSlop={12}
                  style={({ pressed }) => ({
                    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Icon name="chevron.left" size={22} color={color.label.primary} />
                </Pressable>
              ) : null}

              <View
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm }}
                pointerEvents="none"
              >
                {largeTitle ? null : (
                  <Text variant="headline" numberOfLines={1}>{title}</Text>
                )}
                {showOffline ? <OfflinePill pending={queue.pending} /> : null}
              </View>

              {right ? (
                <Pressable
                  onPress={right.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={right.label}
                  hitSlop={12}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Glass radius={18}>
                    <View style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={right.icon} size={18} color={color.label.primary} />
                    </View>
                  </Glass>
                </Pressable>
              ) : null}
            </View>

            {largeTitle ? (
              <Animated.View
                pointerEvents="none"
                style={{
                  marginTop: space.xs,
                  // Keep clear of the right-hand action once the title has
                  // travelled up into the row.
                  paddingRight: right ? 44 : 0,
                  transform: [
                    { translateX: titleTranslateX },
                    { translateY: titleTranslateY },
                    { scale: titleScale },
                  ],
                  // Scale from the left edge so the title shrinks toward the
                  // back chevron rather than toward the middle of the screen.
                  transformOrigin: 'left center',
                }}
              >
                {/*
                  Two lines, not one.

                  `numberOfLines={1}` clipped every title longer than the
                  screen — "When were you born?" rendered as "When were you
                  bor…" on a 393pt iPhone, which is most of them. The collapsed
                  row above still gets one line, because that one has a fixed
                  44pt height and genuinely cannot grow.
                */}
                <Text variant="largeTitle" numberOfLines={2}>{title}</Text>
                {subtitle ? (
                  <Animated.View style={{ opacity: subtitleOpacity }}>
                    <Text variant="subheadline" tone="secondary" numberOfLines={2}>{subtitle}</Text>
                  </Animated.View>
                ) : null}
              </Animated.View>
            ) : null}

          </View>
        ) : null}

        {footer ? (
          <View
            style={{
              paddingHorizontal: geometry.screenMargin,
              paddingBottom: tabBarSpace
                ? TAB_BAR_CLEARANCE + insets.bottom - space.sm
                : Math.max(insets.bottom, space.md),
              paddingTop: space.m,
            }}
          >
            {footer}
          </View>
        ) : null}
      </View>
    </View>
  );
}
