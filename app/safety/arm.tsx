import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Chip, Card } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * S-10 · Arm safe arrival. The message is ALWAYS previewable before arming —
 * nobody should discover what their friends were sent after the fact.
 */
export default function ArmCheck() {
  const router = useRouter();
  const t = useT();
  const { armSafeArrival, safety, profile } = useStore();
  const [hours, setHours] = useState(2);
  const firstName = profile?.displayName?.split(' ')[0];
  const [message, setMessage] = useState(
    firstName === undefined
      ? t('safety.messageDefaultNoName')
      : t('safety.messageDefault', { name: firstName })
  );

  return (
    <Sheet
      title={t('safety.armCheckIn')}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('safety.checkOnMeIn', { count: hours })}
          onPress={() => {
            armSafeArrival({
              deadlineAt: Date.now() + hours * 3600000,
              message,
              contactIds: safety.contacts.map((c) => c.id),
            });
            router.back();
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Text variant="sectionHeader" tone="tertiary">{t('safety.when')}</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[1, 2, 3, 4].map((h) => (
            <Chip key={h} label={t('safety.hours', { count: h })} selected={hours === h} onPress={() => setHours(h)} />
          ))}
        </View>

        <Field label={t('safety.messageLabel')} value={message} onChangeText={setMessage} multiline autoCapitalize="sentences" />

        <Card>
          <Text variant="footnote" tone="secondary">
            {t('safety.gracePeriod')}{' '}
            {safety.contacts.length > 0
              ? t('safety.onlyThenNamed', { names: safety.contacts.map((c) => c.name).join(', ') })
              : t('safety.onlyThen')}
          </Text>
          {safety.contacts.length === 0 ? (
            <Text variant="footnote" color={color.warning} style={{ marginTop: space.sm }}>
              {t('safety.noContactsWarning')}
            </Text>
          ) : null}
        </Card>
      </View>
    </Sheet>
  );
}
