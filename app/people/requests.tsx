import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, Avatar, Button, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { space } from '@/design/tokens';

/** C-12 · Friend requests. */
export default function Requests() {
  const t = useT();
  const { people, respondToRequest } = useStore();
  const incoming = people.filter((p) => p.status === 'pending_in');
  const sent = people.filter((p) => p.status === 'pending_out');

  return (
    <Screen title={t('social.requestsTitle')} back mood="calm">
      {incoming.length === 0 && sent.length === 0 ? (
        <EmptyState icon="person.2" title={t('social.requestsEmptyTitle')} body={t('social.requestsEmptyBody')} />
      ) : null}

      {incoming.length > 0 ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('social.incoming')}</Text>
          {incoming.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
              <Avatar name={p.displayName} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{p.displayName}</Text>
                <Text variant="footnote" tone="tertiary">{t('social.handle', { username: p.username })}</Text>
              </View>
              <Button title={t('social.accept')} compact full={false} onPress={() => respondToRequest(p.id, true)} />
              <Button title={t('social.decline')} kind="plain" compact full={false} onPress={() => respondToRequest(p.id, false)} />
            </View>
          ))}
        </Card>
      ) : null}

      {sent.length > 0 ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('social.sentHeader')}</Text>
          {sent.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
              <Avatar name={p.displayName} size={34} />
              <Text variant="body" style={{ flex: 1 }}>{p.displayName}</Text>
              <Button title={t('ui.cancel')} kind="plain" compact full={false} onPress={() => respondToRequest(p.id, false)} />
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}
