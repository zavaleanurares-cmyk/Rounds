import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Text, Button, Card, Icon, MoodFace, MOODS, MOOD_LABEL } from '@/ui';
import { useStore } from '@/data/store';
import { estimateMissedDrinks } from '@/domain/stats';
import type { Mood } from '@/domain/types';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/** T-07 · End night. Mood, got-home, and a gap prompt when log density is low. */
export default function EndNight() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions, logs, endSession } = useStore();
  const session = sessions.find((s) => s.id === id);
  const [mood, setMood] = useState<Mood | null>(null);
  const [safeHome, setSafeHome] = useState(false);

  const missed = useMemo(() => (session ? estimateMissedDrinks(session, logs) : 0), [session, logs]);

  if (!session) {
    return (
      <Sheet title={t('session.notFoundTitle')} onClose={() => router.back()}>
        <Text variant="subheadline" tone="secondary">{t('session.alreadyEnded')}</Text>
      </Sheet>
    );
  }

  return (
    <Sheet
      title={t('session.endTitle')}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('session.endIt')}
          onPress={() => {
            endSession(session.id, { mood, safeHome });
            router.replace(`/session/${session.id}` as never);
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Text variant="sectionHeader" tone="tertiary">{t('session.howWasIt')}</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {MOODS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setMood(m)}
              accessibilityRole="button"
              accessibilityState={{ selected: mood === m }}
              accessibilityLabel={t(MOOD_LABEL[m])}
              style={{
                flex: 1,
                minHeight: 72,
                borderRadius: radius.card,
                borderWidth: 1.5,
                borderColor: mood === m ? color.brand.tint : color.separator,
                backgroundColor: color.surface.secondary,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <MoodFace mood={m} size={30} active={mood === m} />
              <Text variant="caption2" tone="secondary">{t(MOOD_LABEL[m])}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setSafeHome((s) => !s)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: safeHome }}
          accessibilityLabel={t('session.gotHomeSafe')}
        >
          <Card accent={safeHome ? color.pace.steady : null}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Icon name="checkmark.shield" size={22} color={safeHome ? color.pace.steady : color.label.tertiary} />
              <Text variant="headline" style={{ flex: 1 }}>{t('session.gotHomeSafe')}</Text>
              <Icon name={safeHome ? 'checkmark' : 'plus'} size={18} color={safeHome ? color.pace.steady : color.label.quaternary} />
            </View>
          </Card>
        </Pressable>

        {missed > 0 ? (
          <Card>
            <Text variant="headline">{t('session.anythingForgot')}</Text>
            <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
              {t('session.gapsBody', {
                count: logs.filter((l) => l.sessionId === session.id && !l.deleted).length,
              })}
            </Text>
            <View style={{ marginTop: space.m }}>
              {/*
                Closing the sheet IS doing it in the morning: the morning-after
                screen is what opens next time, and it carries the same gaps.
                The button did nothing at all before.
              */}
              <Button
                title={t('session.doItInMorning')}
                kind="plain"
                compact
                onPress={() => router.replace('/(tabs)/tonight')}
              />
            </View>
          </Card>
        ) : null}
      </View>
    </Sheet>
  );
}
