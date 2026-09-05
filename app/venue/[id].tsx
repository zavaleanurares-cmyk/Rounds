import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, StatTile, EmptyState, Avatar } from '@/ui';
import { useStore } from '@/data/store';
import { formatMoney, formatClock } from '@/domain/stats';
import { color, space } from '@/design/tokens';

/** D-02 · Venue detail — dominated by YOUR history here, not by their photos. */
export default function VenueDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { venues, logs, sessions, profile, people } = useStore();
  const venue = venues.find((v) => v.id === id);

  const mine = useMemo(() => logs.filter((l) => l.venueId === id && !l.deleted), [logs, id]);
  const visits = useMemo(() => new Set(mine.map((l) => l.nightKey)).size, [mine]);
  const spend = mine.reduce((s, l) => s + (l.priceMinor ?? 0), 0);
  const usual = useMemo(() => {
    const counts = new Map<string, number>();
    mine.forEach((l) => counts.set(l.drinkName, (counts.get(l.drinkName) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [mine]);
  const lastVisit = mine.length ? Math.max(...mine.map((l) => l.at)) : null;

  if (!venue) return <Screen title="Venue" back><EmptyState title="Not found" body="No such venue." /></Screen>;

  return (
    <Screen
      title={venue.name}
      subtitle={`${venue.category} · ${venue.area}`}
      back
      mood="calm"
      footer={<Button title="Start a night here" onPress={() => router.push('/session/start')} />}
    >
      {visits === 0 ? (
        <EmptyState
          icon="location"
          title="You haven't been here"
          body="Once you log a night here, this fills in with what you drink, what it costs you, and when you last came."
        />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: space.m }}>
            <StatTile label="Visits" value={String(visits)} icon="calendar" />
            <StatTile
              label="Typical spend"
              value={formatMoney(Math.round(spend / Math.max(1, visits)), profile?.currency ?? 'EUR')}
              tint={color.pace.quick}
              icon="creditcard"
            />
          </View>
          <Card>
            <Text variant="sectionHeader" tone="tertiary">YOUR HISTORY HERE</Text>
            <View style={{ marginTop: space.m, gap: space.sm }}>
              <Text variant="subheadline" tone="secondary">
                Usual: <Text variant="subheadline">{usual ?? '—'}</Text>
              </Text>
              <Text variant="subheadline" tone="secondary">
                Last visit:{' '}
                <Text variant="subheadline">
                  {lastVisit ? new Date(lastVisit).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ', ' + formatClock(lastVisit) : '—'}
                </Text>
              </Text>
              <Text variant="subheadline" tone="secondary">
                Total here: <Text variant="subheadline">{formatMoney(spend, profile?.currency ?? 'EUR')}</Text>
              </Text>
            </View>
          </Card>
        </>
      )}

      <Card>
        <Text variant="sectionHeader" tone="tertiary">WHO'S BEEN</Text>
        <Text variant="footnote" tone="quaternary" style={{ marginTop: 2 }}>Friends only. Never strangers.</Text>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.m }}>
          {people.filter((p) => p.status === 'friend').slice(0, 5).map((p) => (
            <Avatar key={p.id} name={p.displayName} size={34} />
          ))}
        </View>
      </Card>

      <Text variant="footnote" tone="quaternary" center>
        {sessions.filter((s) => s.venueId === id).length} nights recorded here.
      </Text>
    </Screen>
  );
}
