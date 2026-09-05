import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen, Card, Text, DrinkGlyph, Segmented } from '@/ui';
import { CATALOG, CATEGORY_LABEL, CATEGORY_ORDER } from '@/domain/catalog';
import { IBA_FAMILY_LABEL } from '@/domain/cocktails';
import { formatUnits } from '@/domain/units';
import { useStore } from '@/data/store';
import { color, space } from '@/design/tokens';

/**
 * The drink sheet — every glyph in the catalogue on one screen.
 *
 * This is a design reference, not a product screen: it is the fastest way to
 * see that a Negroni and a Boulevardier are actually distinguishable, and to
 * catch a glass that renders wrong before it ships inside a chip somewhere.
 */
export default function DrinkSheet() {
  const { profile } = useStore();
  const system = profile?.unitSystem ?? 'EU';
  const [size, setSize] = useState<'small' | 'large'>('small');
  const px = size === 'small' ? 30 : 56;

  const groups = CATEGORY_ORDER.map((cat) => ({
    key: cat,
    label: CATEGORY_LABEL[cat],
    items: CATALOG.filter((x) => x.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <Screen title="Every drink" subtitle={`${CATALOG.length} drawn, none of them an emoji`} back mood="night">
      <Segmented
        label="Size"
        value={size}
        onChange={setSize}
        options={[
          { value: 'small', label: 'As shown in chips' },
          { value: 'large', label: 'Large' },
        ]}
      />

      {groups.map((group) => {
        const families: Array<{ label: string; items: typeof group.items }> =
          group.key === 'cocktail'
            ? [
                ...(['unforgettable', 'contemporary', 'newera'] as const).map((f) => ({
                  label: IBA_FAMILY_LABEL[f] as string,
                  items: group.items.filter((x) => x.family === f),
                })),
                { label: 'Everyday', items: group.items.filter((x) => !x.family) },
              ]
            : [{ label: '', items: group.items }];

        return (
          <View key={group.key} style={{ gap: space.m }}>
            <Text variant="sectionHeader" tone="tertiary">
              {group.label.toUpperCase()} · {group.items.length}
            </Text>
            {families.filter((f) => f.items.length > 0).map((fam) => (
              <Card key={fam.label || group.key}>
                {fam.label ? (
                  <Text variant="caption1" color={color.brand.tintLight} style={{ marginBottom: space.m }}>
                    {fam.label}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.m }}>
                  {fam.items.map((drink) => (
                    <View
                      key={drink.id}
                      style={{ width: px + 44, alignItems: 'center', gap: 4 }}
                      accessible
                      accessibilityLabel={`${drink.name}, ${drink.volumeMl} millilitres at ${drink.abv} percent`}
                    >
                      <DrinkGlyph drink={drink} size={px} />
                      <Text variant="caption2" tone="secondary" center numberOfLines={2}>{drink.name}</Text>
                      <Text variant="caption2" tone="quaternary" center>
                        {formatUnits(drink.ethanolG, system).replace('≈ ', '')}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ))}
          </View>
        );
      })}
    </Screen>
  );
}
