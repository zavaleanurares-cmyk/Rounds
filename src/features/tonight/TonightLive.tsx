import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { feedback } from '@/services/feedback';
import {
  Screen, Card, Text, PaceRing, PaceEstimate, Icon, Avatar, Glass, useToast, Button, DrinkGlyph,
} from '@/ui';
import { useStore } from '@/data/store';
import { useT, useFormat } from '@/i18n';
import { byId } from '@/domain/catalog';
import { CUSTOM_ART } from '@/domain/art';
import { useTick } from '@/hooks/useTick';
import { paceState, bacAt, weekdayMedian, shouldPromptWater } from '@/domain/pace';
import { summariseNights } from '@/domain/stats';
import type { Session } from '@/domain/types';
import { color, paceColor, space, radius } from '@/design/tokens';

/**
 * T-03 · Tonight · Live — the hero screen.
 *
 * Ordering is deliberate: venue and elapsed, then the pace ring, then the
 * estimate and its disclaimer, then three quick actions, then who you're with,
 * then the strip of what you've logged. The most-glanced thing is highest; the
 * number that invites misuse is small, low, and disappears when it matters.
 */
export function TonightLive({ session }: { session: Session }) {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const toast = useToast();
  const store = useStore();
  const { logs, profile, venues, people } = store;
  const tick = useTick(60_000); // the estimate recomputes every 60s, not every frame
  const [waterDismissed, setWaterDismissed] = useState(false);

  const sessionLogs = useMemo(
    () => logs.filter((l) => l.sessionId === session.id && !l.deleted),
    [logs, session.id]
  );
  const paceLogs = useMemo(
    () => sessionLogs.map((l) => ({ at: l.at, ethanolG: l.ethanolG, isWater: l.category === 'water' })),
    [sessionLogs]
  );

  /**
   * `now` must never lag behind the newest log. The model ignores anything
   * stamped after `now`, so a clock that only advances every 60 seconds means a
   * drink you just logged does not move the ring until the next tick — on the
   * one screen where the feedback has to be instant. Recompute on the tick AND
   * on every new log.
   */
  const now = useMemo(() => Math.max(tick, Date.now()), [tick, sessionLogs.length]);

  const median = useMemo(() => {
    const nights = summariseNights(logs.filter((l) => l.sessionId !== session.id));
    return weekdayMedian(nights.map((n) => ({ weekday: n.weekday, totalG: n.totalG })), new Date(session.startedAt).getDay());
  }, [logs, session]);

  const pace = useMemo(
    () => paceState({ logs: paceLogs, weekdayMedianG: median, startedAt: session.startedAt, now }),
    [paceLogs, median, session.startedAt, now]
  );
  const bac = useMemo(
    () => bacAt(paceLogs, { weightKg: profile?.weightKg ?? null, sex: profile?.sex ?? null }, now),
    [paceLogs, profile, now]
  );

  const spend = sessionLogs.reduce((s, l) => s + (l.priceMinor ?? 0), 0);
  const venue = venues.find((v) => v.id === session.venueId);
  const hour = new Date(now).getHours();
  const lateNight = hour >= 1 && hour < 6; // after 01:00 dim and promote safety
  const showWater = !waterDismissed && shouldPromptWater(paceLogs, now);
  const liveWith = people.filter((p) => p.liveNow && p.status === 'friend');

  const quickLog = (kind: 'water' | 'again') => {
    feedback('log');
    const log = kind === 'water' ? store.logWater() : store.repeatLast();
    if (!log) {
      toast.show({ message: t('tonight.nothingToRepeat') });
      return;
    }
    toast.show({
      message: t('tonight.drinkLogged', { drink: log.drinkName }),
      actionLabel: t('ui.undo'),
      onAction: () => store.undoLast(),
    });
  };

  return (
    <Screen
      title=""
      largeTitle={false}
      mood={pace.state === 'slow_down' ? 'safety' : pace.state === 'quick' ? 'warm' : 'default'}
      accent={paceColor[pace.state]}
      dimmed={lateNight}
      tabBarSpace
      contentStyle={{ gap: space.md }}
    >
      {/* venue · elapsed · end */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
        <View style={{ flex: 1 }}>
          <Text variant="headline" numberOfLines={1}>{venue?.name ?? session.title ?? t('tonight.out')}</Text>
          <Text variant="subheadline" tone="secondary">
            {t('tonight.elapsed', {
              duration: f.duration(now - session.startedAt),
              time: f.clock(session.startedAt),
            })}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push(`/session/${session.id}/end` as never)}
          accessibilityRole="button"
          accessibilityLabel={t('tonight.endNight')}
          hitSlop={8}
        >
          <Glass radius={radius.control}>
            <View style={{ paddingHorizontal: space.md, height: 38, justifyContent: 'center' }}>
              <Text variant="subheadline">{t('tonight.end')}</Text>
            </View>
          </Glass>
        </Pressable>
      </View>

      {/* the hero */}
      <View style={{ alignItems: 'center', marginTop: space.sm }}>
        <PaceRing
          result={pace}
          subtitle={
            pace.drinks === 0
              ? t('tonight.paceNothingYet')
              : pace.minutesSinceLast !== null
                ? t('tonight.paceDrinksLast', {
                    count: pace.drinks,
                    minutes: pace.minutesSinceLast,
                  })
                : t('tonight.paceDrinks', { count: pace.drinks })
          }
        />
        <PaceEstimate bac={bac} state={pace.state} />
      </View>

      {showWater ? (
        <Card accent={color.brand.tintLight}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Icon name="drop" size={22} color={color.brand.tintLight} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{t('tonight.waterTitle')}</Text>
              <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
                {t('tonight.waterBody')}
              </Text>
            </View>
            <Pressable onPress={() => setWaterDismissed(true)} hitSlop={10} accessibilityLabel={t('ui.dismiss')}>
              <Icon name="xmark" size={16} color={color.label.quaternary} />
            </Pressable>
          </View>
          <View style={{ marginTop: space.m }}>
            <Button title={t('tonight.logWater')} kind="glass" compact onPress={() => quickLog('water')} />
          </View>
        </Card>
      ) : null}

      {/* three quick actions */}
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <Quick icon="drop" label={t('tonight.quickWater')} onPress={() => quickLog('water')} />
        <Quick icon="arrow.clockwise" label={t('tonight.quickSameAgain')} onPress={() => quickLog('again')} />
        <Quick
          icon="car"
          label={t('tonight.quickRideHome')}
          tint={lateNight ? color.safety : undefined}
          onPress={() => router.push('/safety')}
        />
      </View>

      {lateNight ? (
        <Card accent={color.safety}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Icon name="checkmark.shield" size={20} color={color.safety} />
            <Text variant="subheadline" style={{ flex: 1 }}>{t('tonight.lateNight')}</Text>
            <Pressable onPress={() => router.push('/safety')} accessibilityLabel={t('tonight.openSafety')} hitSlop={8}>
              <Icon name="chevron.right" size={16} color={color.label.tertiary} />
            </Pressable>
          </View>
        </Card>
      ) : null}

      {session.visibility !== 'private' && liveWith.length > 0 ? (
        <Card
          onPress={() => session.joinCode && router.push(`/live/${session.joinCode}` as never)}
          accessibilityLabel={t('tonight.liveWithLabel')}
        >
          <Text variant="sectionHeader" tone="tertiary">{t('tonight.liveWith')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm }}>
            {liveWith.map((p) => (
              <Avatar key={p.id} name={p.displayName} size={34} live />
            ))}
            <Text variant="footnote" tone="tertiary" style={{ marginLeft: space.xs }}>
              {t('tonight.joinCode', { code: session.joinCode ?? '' })}
            </Text>
          </View>
        </Card>
      ) : null}

      {/* tonight strip */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="sectionHeader" tone="tertiary" style={{ flex: 1 }}>{t('tonight.tonight')}</Text>
          {spend > 0 ? (
            <Text variant="footnote" tone="secondary">
              {f.money(spend, profile?.currency ?? 'EUR')}
            </Text>
          ) : null}
        </View>
        {sessionLogs.length === 0 ? (
          <Text variant="subheadline" tone="tertiary" style={{ marginTop: space.m }}>
            {t('tonight.nothingYet')}
          </Text>
        ) : (
          <View style={{ marginTop: space.sm }}>
            {[...sessionLogs].reverse().slice(0, 8).map((l) => (
              <Pressable
                key={l.id}
                onPress={() => router.push(`/log/edit/${l.id}` as never)}
                accessibilityRole="button"
                accessibilityLabel={t('tonight.logRowLabel', { drink: l.drinkName, time: f.clock(l.at) })}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, paddingVertical: space.sm }}
              >
                <DrinkGlyph drink={byId(l.drinkId) ?? { art: CUSTOM_ART[l.category] }} size={20} />
                <Text variant="subheadline" style={{ flex: 1 }} numberOfLines={1}>{l.drinkName}</Text>
                {l.priceMinor ? (
                  <Text variant="footnote" tone="tertiary">
                    {f.money(l.priceMinor, l.currency)}
                  </Text>
                ) : null}
                <Text variant="footnote" tone="tertiary">{f.clock(l.at)}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function Quick({
  icon,
  label,
  onPress,
  tint,
}: {
  icon: 'drop' | 'arrow.clockwise' | 'car';
  label: string;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.8 : 1 })}
    >
      <Glass radius={radius.card}>
        <View style={{ alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: space.md, minHeight: 76 }}>
          <Icon name={icon} size={22} color={tint ?? color.label.primary} />
          <Text variant="caption1" color={tint ?? color.label.secondary}>{label}</Text>
        </View>
      </Glass>
    </Pressable>
  );
}
