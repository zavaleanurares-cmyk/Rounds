import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sheet, Text, Button, Card, Icon, MoodFace, MOODS, MOOD_LABEL } from '@/ui';
import { useStore } from '@/data/store';
import { estimateMissedDrinks } from '@/domain/stats';
import type { Mood } from '@/domain/types';
import { color, radius, space } from '@/design/tokens';

/** T-07 · End night. Mood, got-home, and a gap prompt when log density is low. */
export default function EndNight() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sessions, logs, endSession } = useStore();
  const session = sessions.find((s) => s.id === id);
  const [mood, setMood] = useState<Mood | null>(null);
  const [safeHome, setSafeHome] = useState(false);

  const missed = useMemo(() => (session ? estimateMissedDrinks(session, logs) : 0), [session, logs]);

  if (!session) {
    return (
      <Sheet title="Not found" onClose={() => router.back()}>
        <Text variant="subheadline" tone="secondary">That night has already ended.</Text>
      </Sheet>
    );
  }

  return (
    <Sheet
      title="End the night"
      onClose={() => router.back()}
      footer={
        <Button
          title="End it"
          onPress={() => {
            endSession(session.id, { mood, safeHome });
            router.replace(`/session/${session.id}` as never);
          }}
        />
      }
    >
      <View style={{ gap: space.md, paddingBottom: space.md }}>
        <Text variant="sectionHeader" tone="tertiary">HOW WAS IT</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {MOODS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setMood(m)}
              accessibilityRole="button"
              accessibilityState={{ selected: mood === m }}
              accessibilityLabel={MOOD_LABEL[m]}
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
              <Text variant="caption2" tone="secondary">{MOOD_LABEL[m]}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => setSafeHome((s) => !s)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: safeHome }}
          accessibilityLabel="Did you get home safe?"
        >
          <Card accent={safeHome ? color.pace.steady : null}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Icon name="checkmark.shield" size={22} color={safeHome ? color.pace.steady : color.label.tertiary} />
              <Text variant="headline" style={{ flex: 1 }}>Did you get home safe?</Text>
              <Icon name={safeHome ? 'checkmark' : 'plus'} size={18} color={safeHome ? color.pace.steady : color.label.quaternary} />
            </View>
          </Card>
        </Pressable>

        {missed > 0 ? (
          <Card>
            <Text variant="headline">Anything you forgot?</Text>
            <Text variant="subheadline" tone="secondary" style={{ marginTop: space.xs }}>
              You were out a while for {logs.filter((l) => l.sessionId === session.id && !l.deleted).length} logs.
              You can fill the gaps now, or in the morning when it's easier.
            </Text>
            <View style={{ marginTop: space.m }}>
              <Button title="I'll do it in the morning" kind="plain" compact onPress={() => {}} />
            </View>
          </Card>
        ) : null}
      </View>
    </Sheet>
  );
}
