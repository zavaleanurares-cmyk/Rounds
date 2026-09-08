import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Icon, EmptyState, InlineLink } from '@/ui';
import { useStore } from '@/data/store';
import { searchCities, type PlaceHit } from '@/services/venues';
import { useT } from '@/i18n';
import { color, radius, space } from '@/design/tokens';

/**
 * D-0x · Pick the city the map opens on.
 *
 * The venue data was always worldwide — OpenStreetMap, no key, every city on
 * earth — but nothing could tell it where to look except the device's own
 * position, and the fallback for a refused permission is a single hard-coded
 * city. Somebody in Lisbon with location off got Cluj-Napoca and no way to say
 * otherwise, which reads as "this app only works in one place".
 *
 * Geocoding runs through Nominatim, the same project the venues come from, so a
 * city it can find is a city this app can then fill with bars.
 */
export default function CityPicker() {
  const router = useRouter();
  const t = useT();
  const { settings, updateSettings } = useStore();
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [searching, setSearching] = useState(false);

  /**
   * Debounced, because Nominatim's usage policy asks for restraint and because
   * a request per keystroke would return answers out of order — the "Lis" reply
   * landing after "Lisbon" and overwriting it.
   */
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let live = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      const found = await searchCities(q);
      if (live) {
        setHits(found);
        setSearching(false);
      }
    }, 400);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [term]);

  const choose = (hit: PlaceHit) => {
    updateSettings({ homeCity: { lat: hit.lat, lng: hit.lng, label: hit.label } });
    router.back();
  };

  return (
    <Screen title={t('discover.cityTitle')} back mood="calm" subtitle={t('discover.citySubtitle')}>
      <Card>
        <TextInput
          value={term}
          onChangeText={setTerm}
          placeholder={t('discover.cityPlaceholder')}
          placeholderTextColor={color.label.quaternary}
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
          accessibilityLabel={t('discover.cityTitle')}
          style={{
            height: 50,
            borderRadius: radius.control,
            backgroundColor: color.surface.secondary,
            borderWidth: 1,
            borderColor: color.separator,
            paddingHorizontal: space.md,
            color: color.label.primary,
            fontSize: 17,
          }}
        />

        {settings.homeCity ? (
          <View style={{ marginTop: space.m, flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Icon name="location" size={16} color={color.brand.tintLight} />
            <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
              {settings.homeCity.label}
            </Text>
            <InlineLink
              title={t('discover.cityUseMine')}
              onPress={() => {
                updateSettings({ homeCity: null });
                router.back();
              }}
            />
          </View>
        ) : null}
      </Card>

      {hits.length > 0 ? (
        <Card>
          {hits.map((hit, i) => (
            <Pressable
              key={`${hit.lat},${hit.lng}`}
              onPress={() => choose(hit)}
              accessibilityRole="button"
              accessibilityLabel={hit.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                paddingVertical: space.m,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: color.separator,
              }}
            >
              <Icon name="location" size={18} color={color.label.tertiary} />
              <Text variant="body" style={{ flex: 1 }}>{hit.label}</Text>
              <Icon name="chevron.right" size={14} color={color.label.quaternary} />
            </Pressable>
          ))}
        </Card>
      ) : term.trim().length >= 2 && !searching ? (
        <EmptyState icon="magnifyingglass" title={t('discover.cityNone')} body={t('discover.cityNoneBody')} />
      ) : null}
    </Screen>
  );
}
