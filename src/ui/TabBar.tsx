import React from 'react';
import { Animated, View, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { feedback } from '@/services/feedback';
import { usePressScale } from './Motion';
import { Glass } from './Glass';
import { Glow } from './Glow';
import { Bloom } from './Bloom';
import { Text } from './Text';
import { Icon, type IconName } from './Icon';
import { useT } from '@/i18n';
import { color, gradient, radius, space, geometry } from '@/design/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TabItem {
  key: string;
  label: string;
  icon: IconName;
  href: string;
}

/**
 * `Tab Bar / Floating Glass + Log FAB`.
 *
 * Glass capsule, 370×62, 16pt from each edge. Four tabs split 2/2 around a raised
 * 60pt primary action that overlaps the bar by 14pt and sits on its own radial
 * bloom. Active tab: tint-light icon on a soft tinted pill.
 *
 * On Android the capsule respects the gesture inset and gains 12pt on 3-button
 * navigation — same visual, different inset.
 */
export function TabBar({
  items,
  activeKey,
  onSelect,
  onLog,
}: {
  items: TabItem[];
  activeKey: string;
  onSelect: (item: TabItem) => void;
  onLog: () => void;
}) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const threeButtonNav = Platform.OS === 'android' && insets.bottom < 16;
  const bottom = Math.max(insets.bottom, 12) + (threeButtonNav ? 12 : 0);
  const left = items.slice(0, 2);
  const rightItems = items.slice(2, 4);
  const fab = usePressScale(0.92);

  const tab = (item: TabItem) => {
    const active = item.key === activeKey;
    return (
      <Pressable
        key={item.key}
        onPress={() => {
          feedback('tap');
          onSelect(item);
        }}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.label}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: geometry.minTouch }}
      >
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: radius.control,
            backgroundColor: active ? 'rgba(59,130,246,0.20)' : 'transparent',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Icon name={item.icon} size={20} color={active ? color.brand.tintLight : color.label.secondary} />
          <Text variant="caption2" color={active ? color.brand.tintLight : color.label.tertiary}>
            {item.label}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom, alignItems: 'center' }}
    >
      <View pointerEvents="box-none" style={{ width: '100%', maxWidth: 420, paddingHorizontal: geometry.tabBar.inset }}>
        <View pointerEvents="box-none" style={{ alignItems: 'center' }}>
          <Bloom size={geometry.fab.bloom} color={color.brand.tint} opacity={0.32} top={-26} />
        </View>
        <Glass radius={radius.capsule} style={{ height: geometry.tabBar.height }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', height: geometry.tabBar.height }}>
            {left.map(tab)}
            <View style={{ width: geometry.fab.size + space.m }} />
            {rightItems.map(tab)}
          </View>
        </Glass>

        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: -geometry.fab.raise,
            alignItems: 'center',
          }}
        >
          <Glow color={color.brand.tint} radius={geometry.fab.size / 2}>
            <AnimatedPressable
              onPress={() => {
                feedback('tap');
                onLog();
              }}
              {...fab.handlers}
              accessibilityRole="button"
              accessibilityLabel={t('ui.logDrink')}
              accessibilityHint={t('ui.logDrinkHint')}
              style={[fab.style, {
                width: geometry.fab.size,
                height: geometry.fab.size,
                borderRadius: geometry.fab.size / 2,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }]}
            >
              <LinearGradient
                colors={gradient.tintPrimary}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{ position: 'absolute', inset: 0 }}
              />
              <Icon name="plus" size={26} color="#fff" strokeWidth={2.2} />
            </AnimatedPressable>
          </Glow>
        </View>
      </View>
    </View>
  );
}
