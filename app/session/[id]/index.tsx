import React, { useMemo, useState } from 'react';
import { View, Pressable, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, StatTile, Icon, Avatar, EmptyState, Segmented, DrinkGlyph } from '@/ui';
import { byId } from '@/domain/catalog';
import { CUSTOM_ART } from '@/domain/art';
import { useStore } from '@/data/store';
import { summariseNights } from '@/domain/stats';
import { bacAt } from '@/domain/pace';
import { gramsToUnits, UNIT_LABEL } from '@/domain/units';
import { useT, useFormat } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * T-08 · Night detail.
 *
 * "Regret Shield" — flipping visibility to private — takes effect immediately
 * and is one tap from here, because the moment somebody wants it is not the
 * moment to make them navigate.
 */
export default function NightDetail() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const { sessions, logs, venues, profile, people } = store;
  const session = sessions.find((s) => s.id === id);
  const [tab, setTab] = useState<'timeline' | 'pace'>('timeline');

  const sessionLogs = useMemo(
    () => logs.filter((l) => l.sessionId === id && !l.deleted).sort((a, b) => a.at - b.at),
    [logs, id]
  );
  const summary = useMemo(
    () => (session ? summariseNights(sessionLogs)[0] : null),
    [sessionLogs, session]
  );

  const venue = venues.find((v) => v.id === session?.venueId);
  const duration = session ? (session.endedAt ?? Date.now()) - session.startedAt : 0;
  const units = gramsToUnits(summary?.totalG ?? 0, profile?.unitSystem ?? 'EU');
  const accent = color.night[(session?.accentIndex ?? 0) % 4];

  // The pace curve is computed here and shown here only. It never leaves this
  // screen — no share card, no social surface.
  //
  // It sits ABOVE the not-found guard on purpose: a hook after a conditional
  // return changes the hook count when the session disappears mid-view (a data
  // wipe, a sign-out), and React throws "rendered fewer hooks than expected" —
  // a hard crash, not a warning.
  const curve = useMemo(() => {
    const points: Array<{ at: number; bac: number }> = [];
    if (!session) return points;
    const step = Math.max(10 * 60000, duration / 24);
    for (let t = session.startedAt; t <= (session.endedAt ?? Date.now()); t += step) {
      points.push({
        at: t,
        bac: bacAt(
          sessionLogs.map((l) => ({ at: l.at, ethanolG: l.ethanolG })),
          { weightKg: profile?.weightKg ?? null, sex: profile?.sex ?? null },
          t
        ),
      });
    }
    return points;
  }, [sessionLogs, session, duration, profile]);
  const peak = Math.max(0.001, ...curve.map((c) => c.bac));

  if (!session) {
    return (
      <Screen title={t('session.nightTitle')} back mood="night">
        <EmptyState title={t('session.notFoundTitle')} body={t('session.notFoundBody')} icon="moon.stars" />
      </Screen>
    );
  }

  return (
    <Screen
      title={venue?.name ?? session.title ?? t('session.aNightOut')}
      subtitle={t('session.nightDate', {
        weekday: f.weekday(session.startedAt),
        date: f.dayLong(session.startedAt),
      })}
      back
      mood="night"
      accent={accent}
      right={{
        icon: 'square.and.arrow.up',
        label: t('session.shareLabel'),
        onPress: () => {
          // Never include the estimate on anything outward-facing.
          void Share.share({
            message: t('session.shareMessage', {
              place: venue?.name ?? t('session.aNightOut'),
              duration: f.duration(duration),
              count: summary?.venueIds.length ?? 1,
            }),
          });
        },
      }}
    >
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label={t('session.outFor')} value={f.duration(duration)} tint={accent} icon="clock" />
        <StatTile
          label={t('session.drinks')}
          value={String(summary?.drinks ?? 0)}
          caption={t('session.unitsCaption', {
            units: f.number(units, 1),
            unit: t(UNIT_LABEL[profile?.unitSystem ?? 'EU']),
          })}
          icon="wineglass"
        />
      </View>
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label={t('session.water')} value={String(summary?.waters ?? 0)} tint={color.brand.tintLight} icon="drop" />
        <StatTile
          label={t('session.spend')}
          value={f.money(summary?.spendMinor ?? 0, profile?.currency ?? 'EUR')}
          tint={color.pace.quick}
          icon="creditcard"
        />
      </View>

      <Segmented
        label={t('session.viewLabel')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'timeline', label: t('session.tabTimeline') },
          { value: 'pace', label: t('session.tabPace') },
        ]}
      />

      {tab === 'timeline' ? (
        <Card>
          {sessionLogs.length === 0 ? (
            <Text variant="subheadline" tone="tertiary">{t('session.timelineEmpty')}</Text>
          ) : (
            sessionLogs.map((l, i) => (
              <Pressable
                key={l.id}
                onPress={() => router.push(`/log/edit/${l.id}` as never)}
                accessibilityRole="button"
                accessibilityLabel={t('session.logRowLabel', { drink: l.drinkName, time: f.clock(l.at) })}
                style={{ flexDirection: 'row', gap: space.m, paddingVertical: space.sm }}
              >
                <Text variant="footnote" tone="tertiary" style={{ width: 46 }}>{f.clock(l.at)}</Text>
                <View
                  style={{
                    width: 2,
                    backgroundColor: i === sessionLogs.length - 1 ? 'transparent' : color.separator,
                    marginRight: space.sm,
                  }}
                />
                <DrinkGlyph drink={byId(l.drinkId) ?? { art: CUSTOM_ART[l.category] }} size={20} />
                <Text variant="subheadline" style={{ flex: 1 }}>{l.drinkName}</Text>
                {l.priceMinor ? (
                  <Text variant="footnote" tone="tertiary">{f.money(l.priceMinor, l.currency)}</Text>
                ) : null}
              </Pressable>
            ))
          )}
        </Card>
      ) : (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('session.paceHeader')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 90, marginTop: space.m }}>
            {curve.map((c, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: Math.max(3, (c.bac / peak) * 88),
                  borderRadius: 2,
                  backgroundColor: accent,
                  opacity: 0.5 + (c.bac / peak) * 0.5,
                }}
              />
            ))}
          </View>
          <Text variant="footnote" tone="quaternary" style={{ marginTop: space.sm }}>
            {t('session.paceNote')}
          </Text>
        </Card>
      )}

      {session.visibility !== 'private' ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">{t('session.whoWasThere')}</Text>
          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.m, flexWrap: 'wrap' }}>
            {people.filter((p) => p.status === 'friend').slice(0, 4).map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/people/${p.id}` as never)} accessibilityLabel={p.displayName}>
                <Avatar name={p.displayName} size={40} />
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}

      <View style={{ gap: space.m }}>
        <Button title={t('session.editNight')} kind="glass" icon="slider.horizontal.3" onPress={() => router.push(`/session/${session.id}/edit` as never)} />
        {session.visibility !== 'private' ? (
          <Pressable
            onPress={() => store.updateSessionVisibility(session.id, 'private')}
            accessibilityRole="button"
            accessibilityLabel={t('session.makePrivateLabel')}
            accessibilityHint={t('session.makePrivateHint')}
            style={{
              minHeight: 52,
              borderRadius: radius.button,
              borderWidth: 1,
              borderColor: color.separator,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: space.sm,
            }}
          >
            <Icon name="eye.slash" size={18} color={color.label.secondary} />
            <Text variant="subheadline" tone="secondary">{t('session.makePrivate')}</Text>
          </Pressable>
        ) : (
          <Text variant="footnote" tone="quaternary" center>{t('session.isPrivate')}</Text>
        )}
      </View>
      {Platform.OS === 'web' ? null : null}
    </Screen>
  );
}
