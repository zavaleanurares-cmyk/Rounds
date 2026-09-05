import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Screen, Card, Text, Button, Icon, EmptyState } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

/** S-09 · Trusted contacts. Up to three — more than that and nobody feels responsible. */
export default function TrustedContacts() {
  const { safety, addTrustedContact, removeTrustedContact } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const full = safety.contacts.length >= 3;

  return (
    <Screen title="Trusted contacts" subtitle="Up to three. They're only contacted if you don't answer." back mood="safety">
      {safety.contacts.length === 0 ? (
        <EmptyState icon="person.2" title="Nobody yet" body="Pick people who'd actually pick up at 3am. They aren't told they're on the list until something happens." />
      ) : (
        <Card>
          {safety.contacts.map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.m }}>
              <Icon name="person.crop.circle" size={22} color={color.label.secondary} />
              <View style={{ flex: 1 }}>
                <Text variant="body">{c.name}</Text>
                <Text variant="footnote" tone="tertiary">{c.phone}</Text>
              </View>
              <Pressable onPress={() => removeTrustedContact(c.id)} hitSlop={10} accessibilityLabel={`Remove ${c.name}`}>
                <Icon name="trash" size={17} color={color.safety} />
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      {!full ? (
        <Card>
          <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
          <View style={{ height: space.m }} />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <View style={{ marginTop: space.m }}>
            <Button
              title="Add contact"
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
        <Text variant="footnote" tone="quaternary" center>Three is the maximum.</Text>
      )}
    </Screen>
  );
}
