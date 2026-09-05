import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Text, Segmented, NavRow, Group, EmptyState } from '@/ui';
import { useStore } from '@/data/store';
import { summariseNights, formatDuration, formatMoney } from '@/domain/stats';
import { nightKey } from '@/domain/nightKey';
import { color, space } from '@/design/tokens';

/** Y-03 · Nights history. List and calendar heatmap. */
export default function Nights() {
  const router = useRouter();
  const { sessions, logs, venues, profile } = useStore();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const nights = useMemo(() => summariseNights(logs), [logs]);
  const ended = useMemo(
    () => sessions.filter((s) => s.endedAt).sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0)),
    [sessions]
  );

  if (ended.length === 0) {
    return (
      <Screen title="Nights" back mood="night">
        <EmptyState icon="moon.stars" title="No nights yet" body="Every night you record shows up here — where you went, who with, and what it cost." actionLabel="Start a night" onAction={() => router.push('/session/start')} />
      </Screen>
    );
  }

  return (
    <Screen title="Nights" subtitle={`${ended.length} recorded`} back mood="night">
      <Segmented
        label="View"
        value={view}
        onChange={setView}
        options={[
          { value: 'list', label: 'List' },
          { value: 'calendar', label: 'Calendar' },
        ]}
      />

      {view === 'list' ? (
        <Group>
          {ended.map((s, i) => {
            const n = nights.find((x) => x.key === s.nightKey);
            return (
              <NavRow
                key={s.id}
                title={venues.find((v) => v.id === s.venueId)?.name ?? s.title ?? 'A night out'}
                subtitle={`${new Date(s.startedAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatDuration((s.endedAt ?? 0) - s.startedAt)} · ${n?.drinks ?? 0} drinks · ${formatMoney(n?.spendMinor ?? 0, profile?.currency ?? 'EUR')}`}
                onPress={() => router.push(`/session/${s.id}` as never)}
                last={i === ended.length - 1}
              />
            );
          })}
        </Group>
      ) : (
        <Card>
          <Text variant="sectionHeader" tone="tertiary">LAST 12 WEEKS</Text>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: space.m }}>
            {Array.from({ length: 12 }).map((_, w) => (
              <View key={w} style={{ flex: 1, gap: 4 }}>
                {Array.from({ length: 7 }).map((__, d) => {
                  const day = new Date();
                  day.setDate(day.getDate() - ((11 - w) * 7 + (6 - d)) * 1);
                  // nightKey, not toISOString: the latter is UTC, and a night key
                  // is local with an 04:00 boundary. Every square was off outside UTC.
                  const key = nightKey(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 22));
                  const n = nights.find((x) => x.key === key);
                  const level = !n ? 0 : n.totalG < 20 ? 1 : n.totalG < 45 ? 2 : 3;
                  return (
                    <Pressable
                      key={d}
                      accessibilityLabel={key}
                      onPress={() => {
                        const s = ended.find((x) => x.nightKey === key);
                        if (s) router.push(`/session/${s.id}` as never);
                      }}
                      style={{
                        aspectRatio: 1,
                        borderRadius: 3,
                        backgroundColor: level === 0 ? 'rgba(255,255,255,0.05)' : `rgba(59,130,246,${0.25 + level * 0.22})`,
                      }}
                    />
                  );
                })}
              </View>
            ))}
          </View>
          <Text variant="footnote" tone="quaternary" style={{ marginTop: space.m }}>
            Empty squares are dry nights. Tap a filled one to open it.
          </Text>
        </Card>
      )}
    </Screen>
  );
}
