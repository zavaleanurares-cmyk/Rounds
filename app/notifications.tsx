import React, { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, EmptyState, Icon } from '@/ui';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import { color, space } from '@/design/tokens';

/** C-13 · Notification inbox, grouped by day. */
export default function Notifications() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { notifications, markNotificationsRead } = useStore();

  // Runs once, on mount. Keying this on `markNotificationsRead` was an infinite
  // loop: marking read re-rendered the provider, which handed this effect a new
  // function, which re-ran it.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(markNotificationsRead, 600);
    return () => clearTimeout(t);
  }, []);

  const groups = notifications.reduce<Record<string, typeof notifications>>((acc, n) => {
    const key = new Date(n.at).toDateString();
    (acc[key] ??= []).push(n);
    return acc;
  }, {});

  if (notifications.length === 0) {
    return (
      <Screen title={t('notifications.title')} back mood="calm">
        <EmptyState icon="bell" title={t('notifications.emptyTitle')} body={t('notifications.emptyBody')} />
      </Screen>
    );
  }

  return (
    <Screen title={t('notifications.title')} back mood="calm">
      {Object.entries(groups).map(([day, items]) => (
        <View key={day} style={{ gap: space.sm }}>
          <Text variant="sectionHeader" tone="tertiary">
            {day === new Date().toDateString() ? t('notifications.today') : f.dayShort(items[0].at).toUpperCase()}
          </Text>
          <Card>
            {/*
              Every row carries an href — `/live/<code>` for a night that
              started, `/plan/<id>` for a plan — computed on the server,
              synced, unpacked into `AppNotification.href`, and then rendered as
              an inert View. Tapping "A night just started" did nothing at all,
              on the one screen whose entire job is to be tapped.
            */}
            {items.map((n, i) => (
              <Pressable
                key={n.id}
                onPress={n.href ? () => router.push(n.href as never) : undefined}
                accessibilityRole={n.href ? 'button' : undefined}
                accessibilityLabel={`${n.title}. ${n.body}`}
                style={{
                  flexDirection: 'row',
                  gap: space.m,
                  paddingVertical: space.m,
                  borderBottomWidth: i === items.length - 1 ? 0 : 1,
                  borderBottomColor: color.separator,
                }}
              >
                <Icon
                  name={n.kind === 'plan' ? 'calendar' : n.kind === 'safety' ? 'checkmark.shield' : n.kind === 'morning' ? 'moon.stars' : 'person.2'}
                  size={18}
                  color={n.read ? color.label.tertiary : color.brand.tintLight}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="body" tone={n.read ? 'secondary' : 'primary'}>{n.title}</Text>
                  <Text variant="footnote" tone="tertiary">{n.body}</Text>
                </View>
                {n.href ? <Icon name="chevron.right" size={14} color={color.label.quaternary} /> : null}
              </Pressable>
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}
