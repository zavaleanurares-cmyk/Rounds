import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen, Card, Text, EmptyState, Icon, Enter, useCountUp, ProgressBar } from '@/ui';
import { useStore } from '@/data/store';
import { venueKind } from '@/domain/venueKind';
import { Stamp } from '@/features/passport/Stamp';
import { color, motion, radius, space } from '@/design/tokens';
import { useT, useFormat } from '@/i18n';

/**
 * D-05 / Y-11 · Bar passport.
 *
 * One stamp per venue per night — exploration, never volume. Five drinks in one
 * bar is one stamp, and that is exactly the point.
 *
 * The rule above is the reason this screen can be as loud as it likes. Every
 * number on it goes up by going somewhere, so making it feel good to look at
 * pushes a person toward a different bar rather than a fourth round in the one
 * they are in. The previous version was a single card of identical dashed
 * rectangles: correct, and so flat that the mechanic it was showcasing looked
 * like an audit log. It was also the only screen in the app you could not put
 * anything of your own into.
 *
 * So: a cover page that counts itself up, stamps that carry the colour of the
 * kind of place and sit at their own angle, and a photo and a line per stamp
 * that live only on this device.
 */
export default function Passport() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { logs, venues, stamps: notes } = useStore();

  const stamps = useMemo(() => {
    const m = new Map<string, Set<string>>();
    logs.forEach((l) => {
      if (l.deleted || !l.venueId) return;
      if (!m.has(l.venueId)) m.set(l.venueId, new Set());
      m.get(l.venueId)!.add(l.nightKey);
    });
    return [...m.entries()]
      .map(([venueId, nights]) => ({ venueId, count: nights.size }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  const total = stamps.reduce((s, x) => s + x.count, 0);

  /**
   * Kinds collected, out of five. The one "completion" figure on the page, and
   * it is deliberately the only thing here shaped like a target: five kinds is
   * reachable in a week by anybody, in any city, without drinking more than
   * they would have anyway — a café counts.
   */
  const kinds = useMemo(() => {
    const set = new Set<string>();
    stamps.forEach((s) => {
      const v = venues.find((x) => x.id === s.venueId);
      if (v) set.add(venueKind(v.category));
    });
    return set;
  }, [stamps, venues]);

  const decorated = stamps.filter((s) => notes[s.venueId]).length;

  // Hooks before the early return: an empty passport must not change the hook
  // order, and `useCountUp` is a hook.
  const placesText = useCountUp(stamps.length);
  const stampsText = useCountUp(total);
  const kindsText = useCountUp(kinds.size);

  if (stamps.length === 0) {
    return (
      <Screen title={t('stats.passport')} back mood="calm">
        <EmptyState
          icon="location"
          title={t('stats.passportEmptyTitle')}
          body={t('stats.passportEmptyBody')}
          actionLabel={t('stats.findSomewhere')}
          onAction={() => router.push('/(tabs)/discover')}
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={t('stats.passport')}
      subtitle={t('stats.passportSubtitle', {
        places: t('stats.places', { count: stamps.length }),
        stamps: t('stats.stampsCount', { count: total }),
      })}
      back
      mood="calm"
    >
      {/* The cover page.

          Three figures that ease up to themselves on arrival rather than
          appearing already-final. The count-up is not a flourish here: the
          numbers are small — a real passport has eleven places in it, not
          eleven thousand — and a small number that lands instantly reads as
          nothing having happened. */}
      <Enter from="scale">
        <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
          <LinearGradient
            colors={['rgba(59,130,246,0.30)', 'rgba(139,92,246,0.22)', 'rgba(10,12,20,0.5)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: space.lg, gap: space.md }}
          >
            <View style={{ flexDirection: 'row' }}>
              {[
                { value: placesText, label: t('stats.coverPlaces') },
                { value: stampsText, label: t('stats.coverStamps') },
                { value: kindsText, label: t('stats.coverKinds') },
              ].map((s) => (
                <View key={s.label} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                  <Text variant="largeTitle">{s.value}</Text>
                  <Text variant="caption2" tone="tertiary" center>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={{ gap: space.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="caption1" tone="secondary">{t('stats.kindsTitle')}</Text>
                <Text variant="caption1" tone="tertiary">{`${kinds.size}/5`}</Text>
              </View>
              <ProgressBar value={kinds.size / 5} />
              <Text variant="caption2" tone="quaternary">
                {kinds.size === 5 ? t('stats.kindsAll') : t('stats.kindsHint')}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </Enter>

      {/* The stamps.

          `Stagger` caps at eight, so a long passport arrives in a wave rather
          than a queue, and the wave is over before anybody could scroll past
          it. */}
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.m, rowGap: space.lg, paddingVertical: space.xs }}>
          {/* `Enter` per stamp rather than a `Stagger` wrapper: Stagger wraps
              each child in a view of its own, and the stamp's `31%` width is a
              percentage OF that wrapper — which has no width in a wrapping
              flex row, so every tile would have collapsed. The width lives on
              the animated wrapper and the stamp fills it.

              30%, not a third: three tiles plus two 12pt gaps have to fit a
              326pt card on a 390pt phone, and 31% overflowed it by a single
              point — which wraps the third stamp onto its own row and turns a
              passport into two columns. Measured in a browser, not reasoned
              about. */}
          {stamps.map((s, i) => {
            const v = venues.find((x) => x.id === s.venueId);
            return (
              <Enter key={s.venueId} from="scale" delay={Math.min(i, 8) * motion.stagger} style={{ width: '30%' }}>
                <Stamp
                  index={i}
                  venueId={s.venueId}
                  name={v?.name ?? t('stats.somewhere')}
                  kind={venueKind(v?.category)}
                  count={s.count}
                  stamp={notes[s.venueId]}
                  onPress={() => router.push(`/stamp/${s.venueId}` as never)}
                />
              </Enter>
            );
          })}
        </View>
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, justifyContent: 'center' }}>
        <Icon name="photo" size={13} color={color.label.quaternary} />
        <Text variant="footnote" tone="quaternary">
          {decorated > 0
            ? t('stats.stampsDecorated', { count: decorated })
            : t('stats.stampsAddYours')}
        </Text>
      </View>

      <Text variant="footnote" tone="quaternary" center>{t('stats.passportNote')}</Text>
    </Screen>
  );
}
