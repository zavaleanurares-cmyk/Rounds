import React, { useMemo, useState } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Aurora, Text, Button, DrinkGlyph, Icon, Enter, usePressScale } from '@/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '@/data/store';
import { byId } from '@/domain/catalog';
import type { Drink } from '@/domain/types';
import { useT } from '@/i18n';
import { color, geometry, motion, radius, space } from '@/design/tokens';

/**
 * O-03 · What do you usually order?
 *
 * The one onboarding screen that is fun to use, and the only one whose answer
 * pays off before you leave it.
 *
 * ── Why this question, of all the ones we could ask ─────────────────────────
 *
 * It buys three things at once, which is what earns it a screen:
 *
 *  · **The log sheet is one tap on night one.** "YOUR USUAL" is normally
 *    computed from sixty days of history, so a new account got a hardcoded
 *    guess. Now it is what they just told us.
 *  · **The pace ring has a personal denominator.** Combined with the next
 *    screen's count, this becomes the prior in `domain/baseline.ts` — and it
 *    is the drink that makes it personal. Two people who both say "four" get
 *    different baselines if one drinks wine and the other doubles.
 *  · **The collection opens with cards already in it**, because these are
 *    drinks they will log.
 *
 * ── Why it looks like this ──────────────────────────────────────────────────
 *
 * Twelve drawn glasses, tapped to fill. The catalogue's art is the best thing
 * this app owns and no other screen shows it at size — the drink sheet renders
 * it at 30px in a chip. A grid of real glasses that light up is a screen
 * somebody enjoys, which matters here more than anywhere else: this is the
 * moment they decide the app was built by people who cared.
 *
 * Twelve, not 165. The full catalogue is a decision; twelve covers what most
 * people order and the thirteenth thing gets logged normally on the night.
 */

/** The twelve most-ordered shapes, chosen to span the categories, not to rank. */
const CHOICES = [
  'beer-pint', 'ipa', 'wine-red', 'wine-white',
  'prosecco', 'gin-tonic', 'aperol-spritz', 'negroni',
  'spirit-double', 'vodka-soda', 'tequila-shot', 'mocktail',
];

const MAX = 3;

export default function Usual() {
  const router = useRouter();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { updateProfile } = useStore();
  const [picked, setPicked] = useState<string[]>([]);

  const drinks = useMemo(
    () => CHOICES.map((id) => byId(id)).filter((d): d is Drink => Boolean(d)),
    []
  );

  const toggle = (id: string) => {
    setPicked((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        // Oldest out when a fourth is picked, rather than refusing the tap.
        // Refusing feels like a broken button; replacing feels like a choice.
        : [...prev, id].slice(-MAX)
    );
  };

  const next = () => {
    updateProfile({ signatureDrinkId: picked[0] ?? null });
    router.push({ pathname: '/(onboarding)/nights', params: { usual: picked.join(',') } });
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
        }}
      >
        <Enter from="below">
          <Text variant="largeTitle">{t('onboarding.usualTitle')}</Text>
          <Text variant="body" tone="secondary" style={{ marginTop: space.sm }}>
            {t('onboarding.usualSubtitle')}
          </Text>
        </Enter>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: space.m,
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          {drinks.map((d, i) => (
            <Enter key={d.id} from="scale" delay={Math.min(i, 8) * motion.stagger} style={{ width: '22%' }}>
              <DrinkChoice
                drink={d}
                picked={picked.includes(d.id)}
                order={picked.indexOf(d.id)}
                onPress={() => toggle(d.id)}
              />
            </Enter>
          ))}
        </View>

        <Text variant="footnote" tone="quaternary" center style={{ marginBottom: space.m }}>
          {picked.length === 0 ? t('onboarding.usualHint') : t('onboarding.usualPicked', { count: picked.length })}
        </Text>

        <Button
          title={picked.length === 0 ? t('onboarding.usualSkip') : t('onboarding.continue')}
          kind={picked.length === 0 ? 'glass' : 'primary'}
          onPress={next}
        />
      </View>
    </View>
  );
}

/**
 * One glass.
 *
 * Unpicked it is drawn at low opacity on nothing; picked it sits on a lit tile
 * with the brand ring and a number showing the order it was chosen in. The
 * number matters more than it looks: the first pick becomes the signature
 * drink shown on the profile, so the screen has to say that the order is
 * meaningful rather than leaving it as a hidden rule.
 */
function DrinkChoice({
  drink,
  picked,
  order,
  onPress,
}: {
  drink: Drink;
  picked: boolean;
  order: number;
  onPress: () => void;
}) {
  const { style, handlers } = usePressScale(0.9);
  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        {...handlers}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: picked }}
        accessibilityLabel={drink.name}
        style={{ alignItems: 'center', gap: 5 }}
      >
        <View
          style={{
            width: '100%',
            aspectRatio: 0.8,
            borderRadius: radius.card,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: picked ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.04)',
            borderWidth: picked ? 2 : 1,
            borderColor: picked ? color.brand.tintLight : color.separator,
            opacity: picked ? 1 : 0.6,
          }}
        >
          <DrinkGlyph drink={drink} size={38} />
          {picked ? (
            <View
              style={{
                position: 'absolute', top: 4, right: 4,
                width: 18, height: 18, borderRadius: 9,
                backgroundColor: color.brand.tint,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {order === 0 ? (
                <Icon name="star" size={10} color="#fff" />
              ) : (
                <Text variant="caption2" style={{ fontWeight: '700' }}>{String(order + 1)}</Text>
              )}
            </View>
          ) : null}
        </View>
        <Text variant="caption2" tone={picked ? 'secondary' : 'quaternary'} center numberOfLines={2}>
          {drink.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
