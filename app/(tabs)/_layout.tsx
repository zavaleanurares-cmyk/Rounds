import React from 'react';
import { View } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { TabBar, type TabItem } from '@/ui';
import { useT, type MessageKey } from '@/i18n';
import { color } from '@/design/tokens';

const ITEMS: Array<Omit<TabItem, 'label'> & { labelKey: MessageKey }> = [
  { key: 'tonight', labelKey: 'common.tabTonight', icon: 'moon.stars', href: '/(tabs)/tonight' },
  { key: 'discover', labelKey: 'common.tabDiscover', icon: 'map', href: '/(tabs)/discover' },
  { key: 'circle', labelKey: 'common.tabCircle', icon: 'person.2', href: '/(tabs)/circle' },
  { key: 'you', labelKey: 'common.tabYou', icon: 'person.crop.circle', href: '/(tabs)/you' },
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
  const t = useT();
  const activeKey = ITEMS.find((i) => pathname.includes(i.key))?.key ?? 'tonight';
  const items = React.useMemo<TabItem[]>(
    () => ITEMS.map(({ labelKey, ...rest }) => ({ ...rest, label: t(labelKey) })),
    [t]
  );

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
        items={items}
        activeKey={activeKey}
        onSelect={(item) => router.replace(item.href as never)}
        onLog={() => router.push('/log')}
      />
    </View>
  );
}
