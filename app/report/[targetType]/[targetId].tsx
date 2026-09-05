import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, Icon } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import type { Report } from '@/domain/types';
import { useT, type MessageKey } from '@/i18n';
import { color, space } from '@/design/tokens';

const REASONS: Array<{ value: Report['reason']; label: MessageKey }> = [
  { value: 'harassment', label: 'stats.reasonHarassment' },
  { value: 'spam', label: 'stats.reasonSpam' },
  { value: 'impersonation', label: 'stats.reasonImpersonation' },
  { value: 'inappropriate', label: 'stats.reasonInappropriate' },
  { value: 'safety', label: 'stats.reasonSafety' },
  { value: 'other', label: 'stats.reasonOther' },
];

/**
 * S-15 · Report — a store blocker for both App Store and Play.
 *
 * The confirmation tells the user what actually happens next and offers to block
 * in the same flow, because "report" without "and I never want to see them
 * again" is only half of what they wanted.
 */
export default function ReportScreen() {
  const router = useRouter();
  const t = useT();
  const { targetType, targetId } = useLocalSearchParams<{ targetType: string; targetId: string }>();
  const store = useStore();
  const [reason, setReason] = useState<Report['reason'] | null>(null);
  const [detail, setDetail] = useState('');
  const [sent, setSent] = useState(false);
  const person = store.people.find((p) => p.id === targetId);

  if (sent) {
    return (
      <Screen title={t('stats.reportedTitle')} back mood="safety">
        <Card aurora>
          <Icon name="checkmark.shield" size={28} color={color.success} />
          <Text variant="title3" style={{ marginTop: space.m }}>{t('stats.reportThankYou')}</Text>
          <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
            {t('stats.reportThankYouBody')}
          </Text>
        </Card>
        {person && !store.blocked.includes(person.id) ? (
          <Button
            title={t('stats.reportAlsoBlock', { name: person.displayName })}
            kind="destructive"
            icon="hand.raised"
            onPress={() => {
              store.blockUser(person.id);
              router.replace('/(tabs)/circle');
            }}
          />
        ) : null}
        <Button title={t('ui.done')} kind="glass" onPress={() => router.replace('/(tabs)/circle')} />
      </Screen>
    );
  }

  return (
    <Screen
      title={t('stats.reportTitle')}
      subtitle={person ? person.displayName : `${targetType}`}
      back
      mood="safety"
      footer={
        <Button
          title={t('stats.sendReport')}
          disabled={!reason}
          onPress={() => {
            store.reportTarget({
              targetType: (targetType as Report['targetType']) ?? 'user',
              targetId: targetId ?? '',
              reason: reason!,
              detail: detail.trim(),
            });
            setSent(true);
          }}
        />
      }
    >
      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('stats.whatHappened')}</Text>
        <View style={{ marginTop: space.m }}>
          {REASONS.map((r, i) => (
            <Pressable
              key={r.value}
              onPress={() => setReason(r.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: reason === r.value }}
              accessibilityLabel={t(r.label)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.m,
                minHeight: 48,
                borderBottomWidth: i === REASONS.length - 1 ? 0 : 1,
                borderBottomColor: color.separator,
              }}
            >
              <Icon name={reason === r.value ? 'checkmark' : 'plus'} size={16} color={reason === r.value ? color.brand.tintLight : color.label.quaternary} />
              <Text variant="body" style={{ flex: 1 }}>{t(r.label)}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Field label={t('stats.reportDetail')} value={detail} onChangeText={setDetail} multiline autoCapitalize="sentences" />
      </Card>
    </Screen>
  );
}
