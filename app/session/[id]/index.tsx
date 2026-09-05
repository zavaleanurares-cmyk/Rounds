import React, { useMemo, useState } from 'react';
import { View, Pressable, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, StatTile, Icon, Avatar, EmptyState, Segmented, DrinkGlyph } from '@/ui';
import { byId } from '@/domain/catalog';
import { CUSTOM_ART } from '@/domain/art';
import { useStore } from '@/data/store';
import { summariseNights, formatDuration, formatMoney, formatClock } from '@/domain/stats';
import { bacAt } from '@/domain/pace';
import { gramsToUnits, UNIT_LABEL } from '@/domain/units';
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
      <Screen title="Night" back mood="night">
        <EmptyState title="Not found" body="That night isn't on this device." icon="moon.stars" />
      </Screen>
    );
  }

  return (
    <Screen
      title={venue?.name ?? session.title ?? 'A night out'}
      subtitle={new Date(session.startedAt).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
      back
      mood="night"
      accent={accent}
      right={{
        icon: 'square.and.arrow.up',
        label: 'Share this night',
        onPress: () => {
          // Never include the estimate on anything outward-facing.
          void Share.share({
            message: `${venue?.name ?? 'A night out'} · ${formatDuration(duration)} · ${summary?.venueIds.length ?? 1} ${
              (summary?.venueIds.length ?? 1) === 1 ? 'venue' : 'venues'
            }`,
          });
        },
      }}
    >
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label="Out for" value={formatDuration(duration)} tint={accent} icon="clock" />
        <StatTile label="Drinks" value={String(summary?.drinks ?? 0)} caption={`${units.toFixed(1)} ${UNIT_LABEL[profile?.unitSystem ?? 'EU']}`} icon="wineglass" />
      </View>
      <View style={{ flexDirection: 'row', gap: space.m }}>
        <StatTile label="Water" value={String(summary?.waters ?? 0)} tint={color.brand.tintLight} icon="drop" />
        <StatTile
          label="Spend"
          value={formatMoney(summary?.spendMinor ?? 0, profile?.currency ?? 'EUR')}
          tint={color.pace.quick}
          icon="creditcard"
        />
      </View>

      <Segmented
        label="View"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'timeline', label: 'Timeline' },
          { value: 'pace', label: 'Pace curve' },
        ]}
      />

      {tab === 'timeline' ? (
        <Card>
          {sessionLogs.length === 0 ? (
            <Text variant="subheadline" tone="tertiary">Nothing was logged on this night.</Text>
          ) : (
            sessionLogs.map((l, i) => (
              <Pressable
                key={l.id}
                onPress={() => router.push(`/log/edit/${l.id}` as never)}
                accessibilityRole="button"
                accessibilityLabel={`${l.drinkName} at ${formatClock(l.at)}`}
                style={{ flexDirection: 'row', gap: space.m, paddingVertical: space.sm }}
              >
                <Text variant="footnote" tone="tertiary" style={{ width: 46 }}>{formatClock(l.at)}</Text>
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
                  <Text variant="footnote" tone="tertiary">{formatMoney(l.priceMinor, l.currency)}</Text>
                ) : null}
              </Pressable>
            ))
          )}
        </Card>
      ) : (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">PACE THROUGH THE NIGHT</Text>
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
            Shape only. Pacing estimate — never use it to decide whether to drive.
          </Text>
        </Card>
      )}

      {session.visibility !== 'private' ? (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">WHO WAS THERE</Text>
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
        <Button title="Edit this night" kind="glass" icon="slider.horizontal.3" onPress={() => router.push(`/session/${session.id}/edit` as never)} />
        {session.visibility !== 'private' ? (
          <Pressable
            onPress={() => store.updateSessionVisibility(session.id, 'private')}
            accessibilityRole="button"
            accessibilityLabel="Make this night private"
            accessibilityHint="Takes effect immediately"
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
            <Text variant="subheadline" tone="secondary">Make this private</Text>
          </Pressable>
        ) : (
          <Text variant="footnote" tone="quaternary" center>This night is private. Nobody else can see it.</Text>
        )}
      </View>
      {Platform.OS === 'web' ? null : null}
    </Screen>
  );
}
