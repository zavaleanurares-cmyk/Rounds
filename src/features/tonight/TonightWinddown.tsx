import React from 'react';
import { Animated, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Aurora, Text, MoodFace, MOODS, MOOD_LABEL, Enter, usePressScale, TAB_BAR_CLEARANCE } from '@/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import type { Mood, Session } from '@/domain/types';
import { color, geometry, radius, space } from '@/design/tokens';

/**
 * T-04 · Tonight · Wind-down.
 *
 * Near-black, three targets only, type two steps up, touch targets ≥64pt. This
 * screen is rendered to someone drunk and tired, so everything that could be
 * deferred to the morning has been.
 *
 * It hand-rolls its layout rather than using `Screen`, and so it also
 * hand-rolled its bottom padding — `insets.bottom + 40`, which does not
 * account for the floating tab bar this route sits behind. "See the night",
 * the second of the two big targets, was drawn underneath it: a 72pt control
 * on a screen deliberately built around large ones, half-covered, on the tab
 * the app opens on. `TAB_BAR_CLEARANCE` is what every other screen uses and
 * what this one needed.
 */
export function TonightWinddown({ session }: { session: Session }) {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const insets = useSafeAreaInsets();
  const { endSession, sessions, venues, logs } = useStore();
  const live = sessions.find((s) => s.endedAt === null);
  const venue = venues.find((v) => v.id === session.venueId);
  const drinks = logs.filter(
    (l) => !l.deleted && l.nightKey === session.nightKey && l.category !== 'water' && l.category !== 'nicotine'
  ).length;

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
          paddingBottom: TAB_BAR_CLEARANCE + insets.bottom,
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text variant="title1" style={{ fontSize: 32, lineHeight: 38 }}>{t('tonight.howWasIt')}</Text>
          {/*
            What "it" was.

            The screen asked the question and never said what it was asking
            about — four faces under a bare "How was it?", on a phone held by
            somebody who has been out for six hours and may well have started
            two sessions. One dim, non-interactive line answers it. It is not a
            fourth target: the brief for this screen is three targets and large
            type, and reading is not a decision.
          */}
          <Text variant="subheadline" tone="tertiary" style={{ marginTop: space.sm }} numberOfLines={2}>
            {venue?.name ?? session.title ?? t('tonight.out')}
            {' · '}
            {t('tonight.elapsed', {
              duration: f.duration((session.endedAt ?? Date.now()) - session.startedAt),
              time: f.clock(session.startedAt),
            })}
          </Text>
          <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.xl }}>
            {MOODS.map((m, i) => (
              <Enter key={m} from="scale" delay={i * 60} style={{ flex: 1 }}>
                <MoodTarget mood={m} label={t(MOOD_LABEL[m])} onPress={() => setMood(m)} />
              </Enter>
            ))}
          </View>
        </View>

        {/*
          The middle third was empty on every phone. This is the night itself,
          drawn as one dot per drink — no number to read, no control to hit,
          just something to look at while deciding how it went. It uses the
          same dimmed treatment as the rest of the screen and disappears
          entirely on a night with nothing logged, which is a night with
          nothing to show.
        */}
        {drinks > 0 ? (
          <View style={{ alignItems: 'center', gap: space.md }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, maxWidth: 240 }}>
              {Array.from({ length: Math.min(drinks, 12) }).map((_, i) => (
                <Enter key={i} from="scale" delay={200 + i * 70}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: 'rgba(255,255,255,0.28)',
                    }}
                  />
                </Enter>
              ))}
            </View>
            <Text variant="footnote" tone="quaternary">
              {t('tonight.loggedTonight', { count: drinks })}
            </Text>
          </View>
        ) : null}

        <View style={{ gap: space.md }}>
          <BigTarget
            label={t('tonight.homeSafe')}
            tint={color.pace.steady}
            onPress={() => {
              endSession(session.id, { mood: session.mood, safeHome: true });
              router.replace('/(tabs)/tonight');
            }}
          />
          <BigTarget
            label={live ? t('tonight.endNight') : t('tonight.seeTheNight')}
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * One of the four faces.
 *
 * Its own component because it needs a hook, and a hook cannot be called
 * inside the `MOODS.map` above. Compresses harder than the rest of the app
 * (0.9) because this is the one screen designed for someone who is not
 * looking closely — the feedback has to be unmissable.
 */
function MoodTarget({ mood, label, onPress }: { mood: Mood; label: string; onPress: () => void }) {
  const { style, handlers } = usePressScale(0.9);
  return (
    <AnimatedPressable
      onPress={onPress}
      {...handlers}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[{
        minHeight: 88,
        borderRadius: radius.card,
        backgroundColor: color.surface.primary,
        borderWidth: 1,
        borderColor: color.card.rim,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }, style]}
    >
      <MoodFace mood={mood} size={34} active />
      <Text variant="footnote" tone="secondary">{label}</Text>
    </AnimatedPressable>
  );
}

function BigTarget({ label, tint, onPress }: { label: string; tint: string; onPress: () => void }) {
  const { style, handlers } = usePressScale(0.97);
  return (
    <AnimatedPressable
      onPress={onPress}
      {...handlers}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[{
        minHeight: 72,
        borderRadius: radius.button,
        borderWidth: 1.5,
        borderColor: tint,
        alignItems: 'center',
        justifyContent: 'center',
      }, style]}
    >
      <Text variant="title3" color={tint}>{label}</Text>
    </AnimatedPressable>
  );
}
