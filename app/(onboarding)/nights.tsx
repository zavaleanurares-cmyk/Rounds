import React, { useMemo, useState } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Aurora, Text, Button, DrinkGlyph, Enter, usePressScale, useCountUp } from '@/ui';
import { useStore } from '@/data/store';
import { byId } from '@/domain/catalog';
import { priorGrams } from '@/domain/baseline';
import { gramsToUnits } from '@/domain/units';
import type { Drink } from '@/domain/types';
import { useT } from '@/i18n';
import { color, geometry, radius, space } from '@/design/tokens';

/**
 * O-04 · A typical night, in two numbers.
 *
 * The second half of the prior. The previous screen gave us WHICH drink, which
 * is where the ethanol comes from; this gives us HOW MANY, and the product of
 * the two is what the pace ring compares against until real nights outweigh it.
 * `domain/baseline.ts` has the full argument and the decay.
 *
 * ── Two decisions that shape the screen ─────────────────────────────────────
 *
 * **It shows its own working.** As you move the counter the line underneath
 * says what that comes to in units, drawn with the glasses you just picked.
 * Nobody knows what "about 6 units" means in the abstract; everybody knows what
 * four pints looks like. Showing the arithmetic also makes the estimate
 * checkable, which matters because the app is about to use it.
 *
 * **Nothing here is a target, and the copy is careful about that.** This asks
 * what a normal night IS, not what it should be. An onboarding question that
 * reads as "how much do you want to drink" would be setting a goal, and goals
 * belong in Wellbeing where they can be changed and where nothing rewards
 * hitting a high one.
 *
 * Skipping is a first-class answer. Without it the app behaves exactly as it
 * did before this screen existed — the population fallback — and says so
 * wherever it matters.
 */
export default function Nights() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useStore();
  const params = useLocalSearchParams<{ usual?: string }>();

  const usualIds = useMemo(
    () => (params.usual ?? '').split(',').filter(Boolean),
    [params.usual]
  );
  const usualDrinks = useMemo(
    () => usualIds.map((id) => byId(id)).filter((d): d is Drink => Boolean(d)),
    [usualIds]
  );

  const [drinks, setDrinks] = useState(3);
  const [nights, setNights] = useState(4);

  const grams = useMemo(
    () => priorGrams({ usualDrinkIds: usualIds, drinksPerNight: drinks, nightsPerMonth: nights }),
    [usualIds, drinks, nights]
  );
  const units = grams === null ? null : gramsToUnits(grams, profile?.unitSystem ?? 'EU');
  const unitsText = useCountUp(units ?? 0, { digits: 1 });

  const finish = (withBaseline: boolean) => {
    updateProfile({
      baseline: withBaseline && usualIds.length > 0
        ? { usualDrinkIds: usualIds, drinksPerNight: drinks, nightsPerMonth: nights }
        : null,
    });
    router.push('/(onboarding)/done');
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.bg.canvas }}>
      <Aurora mood="default" />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + space.xl,
          paddingHorizontal: geometry.screenMargin,
          paddingBottom: insets.bottom + space.lg,
          gap: space.lg,
        }}
      >
        <Enter from="below">
          <Text variant="largeTitle">{t('onboarding.nightsTitle')}</Text>
          <Text variant="body" tone="secondary" style={{ marginTop: space.sm }}>
            {t('onboarding.nightsSubtitle')}
          </Text>
        </Enter>

        <View style={{ flex: 1, justifyContent: 'center', gap: space.xl }}>
          <Enter from="scale" delay={80}>
            <Counter
              label={t('onboarding.nightsDrinks')}
              value={drinks}
              min={1}
              max={12}
              onChange={setDrinks}
            />
          </Enter>

          {/* The working, shown. One glass per drink, up to a row's worth. */}
          {usualDrinks.length > 0 ? (
            <Enter from="below" delay={160}>
              <View style={{ alignItems: 'center', gap: space.m }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, minHeight: 44 }}>
                  {Array.from({ length: Math.min(drinks, 8) }).map((_, i) => (
                    <DrinkGlyph key={i} drink={usualDrinks[i % usualDrinks.length]} size={30} />
                  ))}
                  {drinks > 8 ? (
                    <Text variant="footnote" tone="tertiary" style={{ alignSelf: 'center' }}>
                      {`+${drinks - 8}`}
                    </Text>
                  ) : null}
                </View>
                {units !== null ? (
                  <Text variant="footnote" tone="secondary">
                    {t('onboarding.nightsUnits', { units: unitsText })}
                  </Text>
                ) : null}
              </View>
            </Enter>
          ) : null}

          <Enter from="scale" delay={240}>
            <Counter
              label={t('onboarding.nightsPerMonth')}
              value={nights}
              min={1}
              max={20}
              onChange={setNights}
            />
          </Enter>
        </View>

        <Text variant="caption1" tone="quaternary" center>{t('onboarding.nightsNote')}</Text>

        <View style={{ gap: space.sm }}>
          <Button title={t('onboarding.continue')} onPress={() => finish(true)} />
          <Button title={t('onboarding.nightsSkip')} kind="plain" onPress={() => finish(false)} />
        </View>
      </View>
    </View>
  );
}

/**
 * A number with two big targets either side.
 *
 * A slider would be smaller to build and worse to use: this runs 1–12, so a
 * slider asks for pixel accuracy to change a value by one, one-handed. Steppers
 * are exact, and at 56pt they are comfortably above the minimum.
 */
function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={{ alignItems: 'center', gap: space.m }}>
      <Text variant="sectionHeader" tone="tertiary">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Step icon="−" disabled={value <= min} onPress={() => onChange(Math.max(min, value - 1))} label={label} />
        <Text variant="largeTitle" style={{ fontSize: 52, lineHeight: 58, minWidth: 74, textAlign: 'center' }}>
          {String(value)}
        </Text>
        <Step icon="+" disabled={value >= max} onPress={() => onChange(Math.min(max, value + 1))} label={label} />
      </View>
    </View>
  );
}

function Step({
  icon,
  disabled,
  onPress,
  label,
}: {
  icon: string;
  disabled: boolean;
  onPress: () => void;
  label: string;
}) {
  const { style, handlers } = usePressScale(0.88);
  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        {...handlers}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${icon === '+' ? 'plus' : 'minus'} ${label}`}
        style={{
          width: 56,
          height: 56,
          borderRadius: radius.card,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderWidth: 1,
          borderColor: color.separator,
          opacity: disabled ? 0.3 : 1,
        }}
      >
        <Text variant="title1" tone="primary">{icon}</Text>
      </Pressable>
    </Animated.View>
  );
}
