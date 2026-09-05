import React from 'react';
import { View } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { TabBar, type TabItem } from '@/ui';
import { color } from '@/design/tokens';

const ITEMS: TabItem[] = [
  { key: 'tonight', label: 'Tonight', icon: 'moon.stars', href: '/(tabs)/tonight' },
  { key: 'discover', label: 'Discover', icon: 'map', href: '/(tabs)/discover' },
  { key: 'circle', label: 'Circle', icon: 'person.2', href: '/(tabs)/circle' },
  { key: 'you', label: 'You', icon: 'person.crop.circle', href: '/(tabs)/you' },
];

/**
 * Four tabs and a raised Log FAB. The Feed tab is deliberately absent — a
 * polling stream of friends' drink logs is low-signal content with a brutal cold
 * start and a moderation queue attached to it. Circle replaces it with something
 * actionable that contains no user-generated content at all.
 */
export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const activeKey = ITEMS.find((i) => pathname.includes(i.key))?.key ?? 'tonight';

  return (
    <View style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      <Tabs
        screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' }, sceneStyle: { backgroundColor: color.bg.canvas } }}
      >
        <Tabs.Screen name="tonight" />
        <Tabs.Screen name="discover" />
        <Tabs.Screen name="circle" />
        <Tabs.Screen name="you" />
      </Tabs>
      <TabBar
        items={ITEMS}
        activeKey={activeKey}
        onSelect={(item) => router.replace(item.href as never)}
        onLog={() => router.push('/log')}
      />
    </View>
  );
}
