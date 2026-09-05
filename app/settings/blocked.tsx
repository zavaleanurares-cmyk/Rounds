import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Button, Avatar, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/** S-11 · Blocked users — a store blocker for both App Store and Play. */
export default function Blocked() {
  const t = useT();
  const { blocked, people, unblockUser } = useStore();
  const list = people.filter((p) => blocked.includes(p.id));

  return (
    <Screen title={t('settings.blockedTitle')} back mood="night">
      {list.length === 0 ? (
        <EmptyState icon="hand.raised" title={t('settings.blockedEmptyTitle')} body={t('settings.blockedEmptyBody')} />
      ) : (
        <Card>
          {list.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
              <Avatar name={p.displayName} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{p.displayName}</Text>
                <Text variant="footnote" tone="tertiary">{t('settings.handle', { username: p.username })}</Text>
              </View>
              <Button title={t('settings.unblock')} kind="glass" compact full={false} onPress={() => unblockUser(p.id)} />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}
