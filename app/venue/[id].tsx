import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Text, Button, StatTile, EmptyState, Avatar, DrinkGlyph } from '@/ui';
import { useStore } from '@/data/store';
import { venueVisitors } from '@/data/remote';
import { venueKind } from '@/domain/venueKind';
import { byId } from '@/domain/catalog';
import { Stamp } from '@/features/passport/Stamp';
import { useT, useFormat } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * D-02 · Venue detail — dominated by YOUR history here, not by their photos.
 *
 * This screen used to be the one place a venue had no identity. The map gives
 * every place a colour and a glyph for its kind, and the passport now stamps
 * it in the same colour — and then you tapped through to the venue itself and
 * got two grey tiles and three lines of text, the same for a nightclub and a
 * café. So the kind's colour leads here too, the usual drink is drawn rather
 * than named, and your own stamp for this place sits at the top where you can
 * tap it and put a photo on it.
 */
export default function VenueDetail() {
  const router = useRouter();
  const t = useT();
  const f = useFormat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { venues, logs, sessions, profile, people, stamps } = useStore();
  const venue = venues.find((v) => v.id === id);

  const mine = useMemo(() => logs.filter((l) => l.venueId === id && !l.deleted), [logs, id]);
  const visits = useMemo(() => new Set(mine.map((l) => l.nightKey)).size, [mine]);
  const spend = mine.reduce((s, l) => s + (l.priceMinor ?? 0), 0);
  /**
   * The usual, as the drink rather than its name — the catalogue entry, so it
   * can be drawn. Counted by id for the same reason: two logs of the same
   * drink under different display names are the same drink.
   */
  const usualDrink = useMemo(() => {
    const counts = new Map<string, number>();
    mine.forEach((l) => counts.set(l.drinkId, (counts.get(l.drinkId) ?? 0) + 1));
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return top ? byId(top) ?? null : null;
  }, [mine]);
  const usual = usualDrink?.name ?? mine[mine.length - 1]?.drinkName ?? null;
  const lastVisit = mine.length ? Math.max(...mine.map((l) => l.at)) : null;

  /**
   * Who else has been here — asked, not guessed.
   *
   * `null` means "we could not ask" (no backend, or the call failed), which the
   * card says out loud rather than rendering as "nobody": those are different
   * answers and only one of them is about this venue.
   */
  const [visitorIds, setVisitorIds] = useState<string[] | null>(null);
  useEffect(() => {
    if (!id) return;
    let alive = true;
    void venueVisitors(id).then((found) => {
      if (alive) setVisitorIds(found);
    });
    return () => {
      alive = false;
    };
  }, [id]);
  const visitors = useMemo(
    () => (visitorIds === null ? null : people.filter((p) => visitorIds.includes(p.id))),
    [visitorIds, people]
  );

  if (!venue) return <Screen title={t('discover.venueFallbackTitle')} back><EmptyState title={t('discover.venueNotFound')} body={t('discover.venueNotFoundBody')} /></Screen>;

  return (
    <Screen
      title={venue.name}
      // Both are null on a hand-added venue, and this used to render the
      // literal string "null · null" as the subtitle of the screen you land on
      // straight after adding one.
      subtitle={[venue.category, venue.area].filter(Boolean).join(' · ') || undefined}
      back
      mood="calm"
      // The kind's colour reaches the aurora, so the whole screen is tinted
      // like the pin you tapped to get here.
      accent={color.venue[venueKind(venue.category)]}
      // `venueId`, which the peek card on the map passes and this screen did
      // not — so starting a night from the venue's own screen was the one path
      // that forgot which venue you were at.
      footer={
        <Button
          title={t('discover.startNightHere')}
          onPress={() => router.push(`/session/start?venueId=${venue.id}` as never)}
        />
      }
      stagger
    >
      {visits === 0 ? (
        <EmptyState
          icon="location"
          title={t('discover.notVisitedTitle')}
          body={t('discover.notVisitedBody')}
        />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: space.m }}>
            <StatTile
              label={t('discover.visits')}
              value={String(visits)}
              countTo={visits}
              format={(n) => String(Math.round(n))}
              tint={color.venue[venueKind(venue.category)]}
              icon="calendar"
            />
            <StatTile
              label={t('discover.typicalSpend')}
              value={f.money(Math.round(spend / Math.max(1, visits)), profile?.currency ?? 'EUR')}
              tint={color.pace.quick}
              icon="creditcard"
            />
          </View>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}>
              {/* Your stamp for this place, the same object the passport
                  shows, tappable to the same editor. It is the shortest path
                  from "I am at this bar" to a photo on the stamp — the
                  passport is a page you visit, this is where you actually
                  are. */}
              <View style={{ width: 84 }}>
                <Stamp
                  index={0}
                  venueId={venue.id}
                  name={venue.name}
                  kind={venueKind(venue.category)}
                  count={visits}
                  stamp={stamps[venue.id]}
                  onPress={() => router.push(`/stamp/${venue.id}` as never)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="sectionHeader" tone="tertiary">{t('discover.yourHistoryHere')}</Text>
                <View style={{ marginTop: space.m, gap: space.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                    {usualDrink ? <DrinkGlyph drink={usualDrink} size={26} /> : null}
                    <Text variant="subheadline" tone="secondary" style={{ flex: 1 }}>
                      {t('discover.usualLabel')} <Text variant="subheadline">{usual ?? '—'}</Text>
                    </Text>
                  </View>
                  <Text variant="subheadline" tone="secondary">
                    {t('discover.lastVisitLabel')}{' '}
                    <Text variant="subheadline">
                      {lastVisit ? t('discover.dateAtTime', { date: f.dayCompact(lastVisit), time: f.clock(lastVisit) }) : '—'}
                    </Text>
                  </Text>
                  <Text variant="subheadline" tone="secondary">
                    {t('discover.totalHereLabel')} <Text variant="subheadline">{f.money(spend, profile?.currency ?? 'EUR')}</Text>
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </>
      )}

      <Card>
        <Text variant="sectionHeader" tone="tertiary">{t('discover.whosBeen')}</Text>
        <Text variant="footnote" tone="quaternary" style={{ marginTop: 2 }}>{t('discover.friendsOnly')}</Text>
        {/*
          This used to be `people.filter(friend).slice(0, 5)` — the first five
          friends in the local list, with no reference to the venue, so every
          bar in the app showed the same five faces including bars nobody had
          been to. The server answers it now, scoped by each night's own
          visibility.
        */}
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.m }}>
          {visitors === null ? (
            <Text variant="footnote" tone="quaternary">{t('discover.whosBeenUnknown')}</Text>
          ) : visitors.length === 0 ? (
            <Text variant="footnote" tone="quaternary">{t('discover.whosBeenNobody')}</Text>
          ) : (
            visitors.map((v) => (
              <Avatar
                key={v.id}
                name={v.displayName}
                url={v.avatarUrl}
                size={34}
              />
            ))
          )}
        </View>
      </Card>

      <Text variant="footnote" tone="quaternary" center>
        {t('discover.nightsRecorded', { count: sessions.filter((s) => s.venueId === id).length })}
      </Text>
    </Screen>
  );
}
