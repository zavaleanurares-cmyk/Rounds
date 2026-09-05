import React, { useMemo, useState } from 'react';
import { View, Pressable, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { feedback } from '@/services/feedback';
import { Sheet, Text, Button, Chip, Segmented, Icon, useToast, DrinkGlyph } from '@/ui';
import { useStore } from '@/data/store';
import { CATALOG, WATER, byId, searchDrinks, CATEGORY_LABEL, CATEGORY_ORDER } from '@/domain/catalog';
import { formatUnits } from '@/domain/units';
import type { Drink, DrinkCategory } from '@/domain/types';
import { useT, useFormat, useI18n } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

const SIZES = [
  { value: 'small', factor: 0.6 },
  { value: 'regular', factor: 1 },
  { value: 'large', factor: 1.4 },
] as const;

const SIZE_LABEL = {
  small: 'log.sizeSmall',
  regular: 'log.sizeRegular',
  large: 'log.sizeLarge',
} as const;

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
  const t = useT();
  const f = useFormat();
  const { locale } = useI18n();
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
      () =>
        toast.show({
          message: t('log.drinkLogged', { drink: scaled.name }),
          actionLabel: t('ui.undo'),
          onAction: () => store.undoLast(),
        }),
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
      accessibilityHint={t('log.drinkHint', {
        volume: drink.volumeMl,
        abv: drink.abv,
        units: formatUnits(drink.ethanolG, system, locale),
      })}
    />
  );

  return (
    <Sheet title={t('log.title')} onClose={() => router.back()}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 540 }} keyboardShouldPersistTaps="handled">
        {/* the one-tap path */}
        {lastLog ? (
          <Button
            title={t('log.sameAgain', { drink: lastLog.drinkName })}
            icon="arrow.clockwise"
            onPress={() => {
              const d = byId(lastLog.drinkId);
              if (d) commit(d, false);
            }}
            accessibilityHint={t('log.sameAgainHint')}
          />
        ) : (
          <Button title={t('log.logWater')} icon="drop" onPress={() => commit(WATER, false)} />
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
              placeholder={t('log.searchPlaceholder')}
              placeholderTextColor={color.label.quaternary}
              autoCapitalize="none"
              accessibilityLabel={t('log.searchLabel')}
              style={{ flex: 1, color: color.label.primary, fontSize: 17 }}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel={t('log.clearSearch')}>
                <Icon name="xmark" size={15} color={color.label.tertiary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {query.length > 0 ? (
          <View style={{ marginTop: space.md }}>
            {results.length === 0 ? (
              <View style={{ gap: space.m, paddingVertical: space.m }}>
                <Text variant="subheadline" tone="tertiary">{t('log.noResults', { query })}</Text>
                <Button title={t('log.addCustom')} kind="glass" compact onPress={() => router.replace('/log/custom')} />
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
                      {t('log.drinkMeta', {
                        volume: drink.volumeMl,
                        abv: drink.abv,
                        units: formatUnits(drink.ethanolG, system, locale),
                      })}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        ) : (
          <>
            <Section title={t('log.yourUsual')} />
            <Row>{favourites.map((d) => drinkChip(d))}</Row>

            {venue ? (
              <>
                <Section title={t('log.popularAt', { venue: venue.name.toUpperCase() })} />
                <Row>{popular.map((d) => drinkChip(d))}</Row>
              </>
            ) : null}

            <Section title={t('log.sizeAndPrice')} />
            <Segmented
              label={t('log.sizeLabel')}
              value={size}
              onChange={setSize}
              options={SIZES.map((x) => ({ value: x.value, label: t(SIZE_LABEL[x.value]) }))}
            />
            <View style={{ flexDirection: 'row', gap: space.m, marginTop: space.m, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder={t('log.priceOptional')}
                  placeholderTextColor={color.label.quaternary}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  accessibilityLabel={t('log.priceLabel')}
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
                accessibilityLabel={t('log.timeLabel', { time: f.clock(at) })}
                style={{
                  height: 48, paddingHorizontal: space.md, borderRadius: radius.control,
                  backgroundColor: color.surface.secondary, borderWidth: 1, borderColor: color.separator,
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                }}
              >
                <Icon name="clock" size={16} color={color.label.secondary} />
                <Text variant="subheadline" tone="secondary">{f.clock(at)}</Text>
              </Pressable>
            </View>

            <Section title={t('log.browse')} />
            <Row>
              {CATEGORY_ORDER.map((cat) => (
                <Chip
                  key={cat}
                  label={t(CATEGORY_LABEL[cat])}
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
              <Button title={t('log.somethingElse')} kind="plain" icon="plus" onPress={() => router.replace('/log/custom')} />
              <Button title={t('log.buyingARound')} kind="plain" icon="person.2" onPress={() => router.replace('/log/round')} />
            </View>
          </>
        )}

        <Text variant="footnote" tone="quaternary" center style={{ marginBottom: space.lg, marginTop: space.m }}>
          {t('log.savedLocally')}
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
