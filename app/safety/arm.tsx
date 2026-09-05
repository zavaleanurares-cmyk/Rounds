import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Button, Chip, Card } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

/**
 * S-10 · Arm safe arrival. The message is ALWAYS previewable before arming —
 * nobody should discover what their friends were sent after the fact.
 */
export default function ArmCheck() {
  const router = useRouter();
  const { armSafeArrival, safety, profile } = useStore();
  const [hours, setHours] = useState(2);
  const [message, setMessage] = useState(
    `${profile?.displayName?.split(' ')[0] ?? 'Your friend'} asked ROUNDS to check they got home and hasn't answered. Last seen out tonight.`
  );

  return (
    <Sheet
      title="Arm a check-in"
      onClose={() => router.back()}
      footer={
        <Button
          title={`Check on me in ${hours}h`}
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
        <Text variant="sectionHeader" tone="tertiary">WHEN</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {[1, 2, 3, 4].map((h) => (
            <Chip key={h} label={`${h}h`} selected={hours === h} onPress={() => setHours(h)} />
          ))}
        </View>

        <Field label="What they'd be sent" value={message} onChangeText={setMessage} multiline autoCapitalize="sentences" />

        <Card>
          <Text variant="footnote" tone="secondary">
            At the deadline you get a notification with a fifteen-minute grace period. Only if that
            goes unanswered do{' '}
            {safety.contacts.length > 0
              ? safety.contacts.map((c) => c.name).join(', ')
              : 'your trusted contacts'}{' '}
            hear anything.
          </Text>
          {safety.contacts.length === 0 ? (
            <Text variant="footnote" color={color.warning} style={{ marginTop: space.sm }}>
              You haven't added any trusted contacts yet — add one so this can actually reach
              someone.
            </Text>
          ) : null}
        </Card>
      </View>
    </Sheet>
  );
}
