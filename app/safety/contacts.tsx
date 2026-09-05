import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Screen, Card, Text, Button, Icon, EmptyState } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/** S-09 · Trusted contacts. Up to three — more than that and nobody feels responsible. */
export default function TrustedContacts() {
  const t = useT();
  const { safety, addTrustedContact, removeTrustedContact } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const full = safety.contacts.length >= 3;

  return (
    <Screen title={t('safety.contactsTitle')} subtitle={t('safety.contactsSubtitle')} back mood="safety">
      {safety.contacts.length === 0 ? (
        <EmptyState icon="person.2" title={t('safety.contactsEmptyTitle')} body={t('safety.contactsEmptyBody')} />
      ) : (
        <Card>
          {safety.contacts.map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
              <Icon name="person.crop.circle" size={22} color={color.label.secondary} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{c.name}</Text>
                <Text variant="footnote" tone="tertiary">{c.phone}</Text>
              </View>
              <Pressable onPress={() => removeTrustedContact(c.id)} hitSlop={10} accessibilityLabel={t('safety.removeContact', { name: c.name })}>
                <Icon name="trash" size={17} color={color.safety} />
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      {!full ? (
        <Card>
          <Field label={t('safety.contactName')} value={name} onChangeText={setName} autoCapitalize="words" />
          <View style={{ height: space.m }} />
          <Field label={t('safety.contactPhone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <View style={{ marginTop: space.m }}>
            <Button
              title={t('safety.addContact')}
              disabled={name.trim().length < 2 || phone.trim().length < 6}
              onPress={() => {
                addTrustedContact({ name: name.trim(), phone: phone.trim() });
                setName('');
                setPhone('');
              }}
            />
          </View>
        </Card>
      ) : (
        <Text variant="footnote" tone="quaternary" center>{t('safety.threeMax')}</Text>
      )}
    </Screen>
  );
}
