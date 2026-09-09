import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Screen, Card, Text, Icon, DrinkGlyph, Chip, Enter, useCountUp, ProgressBar, EmptyState,
} from '@/ui';
import { useStore } from '@/data/store';
import { collectionOf, type Card as CollectionCard } from '@/domain/collection';
import { CATEGORY_LABEL } from '@/domain/catalog';
import type { Drink, DrinkCategory } from '@/domain/types';
import { useT, useFormat } from '@/i18n';
import { color, motion, radius, space } from '@/design/tokens';

/**
 * Y-12 · The collection.
 *
 * A card per drink in the catalogue, turned over the first time you log it.
 * 165 of them, and the whole thing can be finished by somebody who has one of
 * each and never a second.
 *
 * ── Why this is allowed to exist ────────────────────────────────────────────
 *
 * The mechanic that gets rejected under App Store Guideline 1.4.3 is the one
 * that pays out for *drinking more*. This one cannot: `collectionOf` is a
 * function of the SET of distinct drink ids, and a serving that is not your
 * first of that drink changes nothing on this screen. The fortieth pint of
 * lager scores exactly what the first one did.
 *
 * That is not a technicality — it inverts the incentive. The cheapest way to
 * advance is one glass of something you have not had and then stop, which is
 * the behaviour of somebody tasting rather than drinking. And eight of the
 * cards are water and soft drinks, so a person who never drinks alcohol can
 * still fill two complete sets. `collection.test.ts` executes both claims, and
 * the load-bearing one is mutation-tested.
 *
 * A locked card shows its silhouette and its name. Hiding the name would make
 * this a guessing game about a bar menu, which is the mechanic that turns a
 * collection into a checklist somebody feels obliged to clear.
 */
export default function Collection() {
  const t = useT();
  const f = useFormat();
  const { logs, venues } = useStore();
  const [filter, setFilter] = useState<DrinkCategory | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const collection = useMemo(() => collectionOf(logs), [logs]);
  const foundText = useCountUp(collection.found);

  const sets = filter ? collection.sets.filter((s) => s.category === filter) : collection.sets;

  if (collection.found === 0) {
    return (
      <Screen title={t('stats.collection')} back mood="calm">
        <EmptyState
          icon="sparkles"
          title={t('stats.collectionEmptyTitle')}
          body={t('stats.collectionEmptyBody')}
        />
      </Screen>
    );
  }

  return (
    <Screen
      title={t('stats.collection')}
      subtitle={t('stats.collectionSubtitle', {
        found: f.number(collection.found, 0),
        total: f.number(collection.total, 0),
      })}
      back
      mood="calm"
    >
      <Enter from="scale">
        <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
          <LinearGradient
            colors={['rgba(244,63,94,0.26)', 'rgba(251,146,60,0.18)', 'rgba(10,12,20,0.55)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: space.lg, gap: space.md }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
              <Text variant="largeTitle">{foundText}</Text>
              <Text variant="title3" tone="tertiary" style={{ paddingBottom: 4 }}>
                {`/ ${collection.total}`}
              </Text>
            </View>
            <ProgressBar value={collection.found / collection.total} tint={color.venue.wine} />
            <Text variant="footnote" tone="secondary">
              {collection.newThisMonth > 0
                ? t('stats.collectionNewThisMonth', { count: collection.newThisMonth })
                : t('stats.collectionNoneThisMonth')}
            </Text>
            {/*
              Said on the screen, not only in a test. Somebody who sees a
              collection in a drinking app is entitled to wonder what it is
              nudging them toward, and the answer is unusual enough to be worth
              printing where they will read it.
            */}
            <Text variant="caption2" tone="tertiary">{t('stats.collectionRule')}</Text>
          </LinearGradient>
        </View>
      </Enter>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        <Chip label={t('stats.collectionAll')} compact selected={filter === null} onPress={() => setFilter(null)} />
        {collection.sets.map((s) => (
          <Chip
            key={s.category}
            label={t(CATEGORY_LABEL[s.category])}
            compact
            selected={filter === s.category}
            onPress={() => setFilter(filter === s.category ? null : s.category)}
          />
        ))}
      </View>

      {sets.map((set) => {
        const complete = set.found.length === set.all.length;
        return (
          <Card key={set.category}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Text variant="sectionHeader" tone="tertiary" style={{ flex: 1 }}>
                {t(CATEGORY_LABEL[set.category])}
              </Text>
              {complete ? <Icon name="checkmark" size={13} color={color.pace.steady} /> : null}
              <Text variant="caption1" tone={complete ? 'secondary' : 'quaternary'}>
                {`${set.found.length}/${set.all.length}`}
              </Text>
            </View>

            <View style={{ marginTop: space.sm }}>
              <ProgressBar
                value={set.fraction}
                height={4}
                tint={complete ? color.pace.steady : color.brand.tint}
              />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.m, rowGap: space.md, marginTop: space.md }}>
              {set.all.map((drink, i) => {
                const card = collection.cards.get(drink.id);
                return (
                  <Enter
                    key={drink.id}
                    from="scale"
                    delay={Math.min(i, 8) * motion.stagger}
                    style={{ width: '22%' }}
                  >
                    <DrinkCardTile
                      drink={drink}
                      card={card}
                      venueName={
                        card?.firstVenueId
                          ? venues.find((v) => v.id === card.firstVenueId)?.name ?? null
                          : null
                      }
                      expanded={open === drink.id}
                      onPress={() => setOpen(open === drink.id ? null : drink.id)}
                      dayLong={f.dayLong}
                      t={t}
                    />
                  </Enter>
                );
              })}
            </View>
          </Card>
        );
      })}

      <Text variant="footnote" tone="quaternary" center>{t('stats.collectionNote')}</Text>
    </Screen>
  );
}

/**
 * One card.
 *
 * Found: the drawn glyph in full colour, on a lit tile. Locked: the same glyph
 * at low opacity on an empty one, so the album reads as a shape you are
 * filling in rather than a list of things you have not done.
 *
 * Tapping a found card expands it in place with where and when — the two
 * details that make it yours rather than a catalogue entry. A locked card does
 * not expand: there is nothing to say about it that its own name does not
 * already say.
 */
function DrinkCardTile({
  drink,
  card,
  venueName,
  expanded,
  onPress,
  dayLong,
  t,
}: {
  drink: Drink;
  card: CollectionCard | undefined;
  venueName: string | null;
  expanded: boolean;
  onPress: () => void;
  dayLong: (at: number) => string;
  t: ReturnType<typeof useT>;
}) {
  const found = Boolean(card);
  return (
    <Pressable
      onPress={found ? onPress : undefined}
      accessibilityRole={found ? 'button' : 'image'}
      accessibilityLabel={found ? drink.name : t('stats.collectionLocked', { drink: drink.name })}
      style={{ alignItems: 'center', gap: 4 }}
    >
      <View
        style={{
          width: '100%',
          aspectRatio: 0.78,
          borderRadius: radius.control,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: found ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
          borderWidth: 1,
          borderColor: found ? 'rgba(255,255,255,0.22)' : color.separator,
          opacity: found ? 1 : 0.42,
        }}
      >
        <DrinkGlyph drink={drink} size={30} />
      </View>
      <Text variant="caption2" tone={found ? 'secondary' : 'quaternary'} center numberOfLines={2}>
        {drink.name}
      </Text>
      {expanded && card ? (
        <Text variant="caption2" tone="quaternary" center numberOfLines={3}>
          {venueName
            ? t('stats.collectionFirstAtVenue', { date: dayLong(card.firstAt), venue: venueName })
            : t('stats.collectionFirstOn', { date: dayLong(card.firstAt) })}
        </Text>
      ) : null}
    </Pressable>
  );
}
