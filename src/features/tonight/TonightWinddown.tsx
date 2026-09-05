import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Aurora, Text, MoodFace, MOODS, MOOD_LABEL } from '@/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/data/store';
import type { Mood, Session } from '@/domain/types';
import { color, geometry, radius, space } from '@/design/tokens';

/**
 * T-04 · Tonight · Wind-down.
 *
 * Near-black, three targets only, type two steps up, touch targets ≥64pt. This
 * screen is rendered to someone drunk and tired, so everything that could be
 * deferred to the morning has been.
 */
export function TonightWinddown({ session }: { session: Session }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { endSession, sessions } = useStore();
  const live = sessions.find((s) => s.endedAt === null);

  const setMood = (mood: Mood) => {
    endSession(session.id, { mood, safeHome: false });
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      <Aurora mood="night" intensity={0.35} dimmed />
      <View
        style={{
          flex: 1,
          paddingHorizontal: geometry.screenMargin,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text variant="title1" style={{ fontSize: 32, lineHeight: 38 }}>How was it?</Text>
          <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.xl }}>
            {MOODS.map((m) => (
              <Pressable
                key={m}
                onPress={() => setMood(m)}
                accessibilityRole="button"
                accessibilityLabel={MOOD_LABEL[m]}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 88,
                  borderRadius: radius.card,
                  backgroundColor: color.surface.primary,
                  borderWidth: 1,
                  borderColor: color.card.rim,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <MoodFace mood={m} size={34} active />
                <Text variant="footnote" tone="secondary">{MOOD_LABEL[m]}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: space.md }}>
          <BigTarget
            label="I'm home safe"
            tint={color.pace.steady}
            onPress={() => {
              endSession(session.id, { mood: session.mood, safeHome: true });
              router.replace('/(tabs)/tonight');
            }}
          />
          <BigTarget
            label={live ? 'End the night' : 'See the night'}
            tint={color.label.secondary}
            onPress={() =>
              live
                ? router.push(`/session/${live.id}/end` as never)
                : router.push(`/session/${session.id}` as never)
            }
          />
        </View>
      </View>
    </View>
  );
}

function BigTarget({ label, tint, onPress }: { label: string; tint: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minHeight: 72,
        borderRadius: radius.button,
        borderWidth: 1.5,
        borderColor: tint,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text variant="title3" color={tint}>{label}</Text>
    </Pressable>
  );
}
