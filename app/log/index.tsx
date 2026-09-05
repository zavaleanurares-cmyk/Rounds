import React, { useMemo, useState } from 'react';
import { View, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { feedback } from '@/services/feedback';
import { Sheet, Text, Button, Chip, Segmented, Icon, useToast, DrinkGlyph } from '@/ui';
import { useStore } from '@/data/store';
import { CATALOG, WATER, byId, searchDrinks, CATEGORY_LABEL, CATEGORY_ORDER } from '@/domain/catalog';
import { formatClock } from '@/domain/stats';
import { formatUnits } from '@/domain/units';
import type { Drink, DrinkCategory } from '@/domain/types';
import { color, radius, space } from '@/design/tokens';

const SIZES = [
  { value: 'small', label: 'Small', factor: 0.6 },
  { value: 'regular', label: 'Regular', factor: 1 },
  { value: 'large', label: 'Large', factor: 1.4 },
] as const;

/**
 * L-01 · Log sheet. The most-used screen in the app.
 *
 * Median interaction must be ONE TAP, and that constraint survives a 165-drink
 * catalogue only because the catalogue is never what you see first: "Same again"
 * is the primary, your four usuals are one tap under it, and everything else is
 * behind search or a category. Nobody scrolls a hundred cocktails at 1am.
 *
 * No paywall. No upsell. No network dependency. Ever.
 */
export default function LogSheet() {
  const router = useRouter();
  const toast = useToast();
  const store = useStore();
  const { lastLog, favourites, profile, venues, activeSession } = store;
  const [size, setSize] = useState<(typeof SIZES)[number]['value']>('regular');
  const [price, setPrice] = useState('');
  const [at, setAt] = useState(() => Date.now());
  const [query, setQuery] = useState('');
  const [browse, setBrowse] = useState<DrinkCategory | null>(null);

  const venue = venues.find((v) => v.id === activeSession?.venueId);
  const priceMinor = price ? Math.round(parseFloat(price.replace(',', '.')) * 100) : null;
  const factor = SIZES.find((s) => s.value === size)!.factor;
  const system = profile?.unitSystem ?? 'EU';

  const results = useMemo(() => searchDrinks(query), [query]);
  const popular = useMemo(
    () => ['beer-pint', 'gin-tonic', 'aperol-spritz', 'negroni'].map(byId).filter(Boolean) as Drink[],
    []
  );
  const browsing = useMemo(
    () => (browse ? CATALOG.filter((x) => x.category === browse) : []),
    [browse]
  );

  const commit = (drink: Drink, scale = true) => {
    const scaled: Drink =
      scale && drink.category !== 'water' && factor !== 1
        ? { ...drink, volumeMl: Math.round(drink.volumeMl * factor), ethanolG: drink.ethanolG * factor }
        : drink;
    feedback('log');
    store.addLog({ drink: scaled, priceMinor: drink.category === 'water' ? 0 : priceMinor, at });
    router.back();
    // The undo toast is what makes closing optimistically safe.
    setTimeout(
      () => toast.show({ message: `${scaled.name} logged`, actionLabel: 'Undo', onAction: () => store.undoLast() }),
      120
    );
  };

  const drinkChip = (drink: Drink, compact?: boolean) => (
    <Chip
      key={drink.id}
      label={drink.name}
      compact={compact}
      glyph={<DrinkGlyph drink={drink} size={compact ? 18 : 22} />}
      onPress={() => commit(drink)}
      accessibilityHint={`${drink.volumeMl}ml at ${drink.abv}%, ${formatUnits(drink.ethanolG, system)}`}
    />
  );

  return (
    <Sheet title="Log a drink" onClose={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 540 }} keyboardShouldPersistTaps="handled">
        {/* the one-tap path */}
        {lastLog ? (
          <Button
            title={`Same again · ${lastLog.drinkName}`}
            icon="arrow.clockwise"
            onPress={() => {
              const d = byId(lastLog.drinkId);
              if (d) commit(d, false);
            }}
            accessibilityHint="Logs the same drink as last time, immediately"
          />
        ) : (
          <Button title="Log water" icon="drop" onPress={() => commit(WATER, false)} />
        )}

        {/* search across all 165 */}
        <View style={{ marginTop: space.md }}>
          <View
            style={{
              flexDirection: 'row', alignItems: 'center', gap: space.m, height: 48,
              paddingHorizontal: space.md, borderRadius: radius.control,
              backgroundColor: color.surface.secondary, borderWidth: 1, borderColor: color.separator,
            }}
          >
            <Icon name="magnifyingglass" size={17} color={color.label.tertiary} />
            <TextInput
              value={query}
              onChangeText={(t) => { setQuery(t); setBrowse(null); }}
              placeholder="Negroni, IPA, pălincă…"
              placeholderTextColor={color.label.quaternary}
              autoCapitalize="none"
              accessibilityLabel="Search drinks"
              style={{ flex: 1, color: color.label.primary, fontSize: 17 }}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
                <Icon name="xmark" size={15} color={color.label.tertiary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {query.length > 0 ? (
          <View style={{ marginTop: space.md }}>
            {results.length === 0 ? (
              <View style={{ gap: space.m, paddingVertical: space.m }}>
                <Text variant="subheadline" tone="tertiary">Nothing called "{query}".</Text>
                <Button title="Add it as a custom drink" kind="glass" compact onPress={() => router.replace('/log/custom')} />
              </View>
            ) : (
              results.map((drink) => (
                <Pressable
                  key={drink.id}
                  onPress={() => commit(drink)}
                  accessibilityRole="button"
                  accessibilityLabel={drink.name}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: space.md,
                    paddingVertical: space.sm, opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <DrinkGlyph drink={drink} size={26} />
                  <View style={{ flex: 1 }}>
                    <Text variant="body">{drink.name}</Text>
                    <Text variant="footnote" tone="tertiary">
                      {drink.volumeMl}ml · {drink.abv}% · {formatUnits(drink.ethanolG, system)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        ) : (
          <>
            <Section title="YOUR USUAL" />
            <Row>{favourites.map((d) => drinkChip(d))}</Row>

            {venue ? (
              <>
                <Section title={`POPULAR AT ${venue.name.toUpperCase()}`} />
                <Row>{popular.map((d) => drinkChip(d))}</Row>
              </>
            ) : null}

            <Section title="SIZE & PRICE" />
            <Segmented
              label="Size"
              value={size}
              onChange={setSize}
              options={SIZES.map((x) => ({ value: x.value, label: x.label }))}
            />
            <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.m, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="Price (optional)"
                  placeholderTextColor={color.label.quaternary}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  accessibilityLabel="Price"
                  style={{
                    height: 48, borderRadius: radius.control, backgroundColor: color.surface.secondary,
                    borderWidth: 1, borderColor: color.separator, paddingHorizontal: space.md,
                    color: color.label.primary, fontSize: 17,
                  }}
                />
              </View>
              <Pressable
                onPress={() => setAt((v) => (Date.now() - v > 60000 ? Date.now() : Date.now() - 30 * 60000))}
                accessibilityRole="button"
                accessibilityLabel={`Time: ${formatClock(at)}. Tap to move back half an hour.`}
                style={{
                  height: 48, paddingHorizontal: space.md, borderRadius: radius.control,
                  backgroundColor: color.surface.secondary, borderWidth: 1, borderColor: color.separator,
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                }}
              >
                <Icon name="clock" size={16} color={color.label.secondary} />
                <Text variant="subheadline" tone="secondary">{formatClock(at)}</Text>
              </Pressable>
            </View>

            <Section title="BROWSE" />
            <Row>
              {CATEGORY_ORDER.map((cat) => (
                <Chip
                  key={cat}
                  label={CATEGORY_LABEL[cat]}
                  compact
                  selected={browse === cat}
                  onPress={() => setBrowse((b) => (b === cat ? null : cat))}
                />
              ))}
            </Row>

            {browse ? (
              <View style={{ marginTop: space.m, flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {browsing.map((d) => drinkChip(d, true))}
              </View>
            ) : null}

            <View style={{ gap: space.m, marginTop: space.lg, marginBottom: space.md }}>
              <Button title="Something else" kind="plain" icon="plus" onPress={() => router.replace('/log/custom')} />
              <Button title="Buying a round" kind="plain" icon="person.2" onPress={() => router.replace('/log/round')} />
            </View>
          </>
        )}

        <Text variant="footnote" tone="quaternary" center style={{ marginBottom: space.lg, marginTop: space.m }}>
          Saved on this phone first. Nothing here waits for a network.
        </Text>
      </ScrollView>
    </Sheet>
  );
}

function Section({ title }: { title: string }) {
  return (
    <Text variant="sectionHeader" tone="tertiary" style={{ marginTop: space.lg, marginBottom: space.sm }}>
      {title}
    </Text>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{children}</View>;
}
