import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Card, Text, Button, Icon, Avatar } from '@/ui';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * C-04 · Contact match.
 *
 * Numbers are hashed on-device with a salt (`expo-crypto`) and only the hashes
 * are sent. The screen says so, because a permission prompt with no explanation
 * is how you lose the permission and the trust in one go.
 */
export default function ContactMatch() {
  const router = useRouter();
  const t = useT();
  const { people, addFriend } = useStore();
  const [granted, setGranted] = useState(false);
  const candidates = people.filter((p) => p.status === 'none');

  return (
    <Sheet title={t('social.contactsTitle')} onClose={() => router.back()}>
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Card>
          <View style={{ flexDirection: 'row', gap: space.m }}>
            <Icon name="lock" size={20} color={color.brand.tintLight} />
            <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
              {t('social.contactsPrivacy')}
            </Text>
          </View>
        </Card>

        {!granted ? (
          <Button title={t('social.matchContacts')} onPress={() => setGranted(true)} />
        ) : candidates.length === 0 ? (
          <Text variant="subheadline" tone="tertiary">{t('social.contactsNone')}</Text>
        ) : (
          candidates.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Avatar name={p.displayName} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{p.displayName}</Text>
                <Text variant="footnote" tone="tertiary">{t('social.handle', { username: p.username })}</Text>
              </View>
              <Button title={t('social.add')} kind="glass" compact full={false} onPress={() => addFriend(p.id)} />
            </View>
          ))
        )}
      </View>
    </Sheet>
  );
}
