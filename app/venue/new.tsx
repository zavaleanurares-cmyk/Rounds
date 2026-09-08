import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Button, Text, Segmented, useToast } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { currentCoords } from '@/services/locationShare';
import type { VenueKind } from '@/domain/venueKind';
import { useT } from '@/i18n';
import { color, space } from '@/design/tokens';

/**
 * D-04 · Add a place.
 *
 * It used to take a name and an area and nothing else, and set `lat`/`lng` to
 * null unconditionally — so a place you added yourself could never appear on
 * the map you added it from. It also never reached the server at all: the sync
 * omitted `created_by`, the insert policy requires it, and every hand-added
 * venue was rejected silently on every attempt. See 00051.
 *
 * Two additions, both of which exist to make the row usable rather than to
 * decorate the form: a kind, so the pin is not a wineglass on a café, and the
 * option to pin it where you are standing.
 */

/** Stored as the same English labels both providers produce, never localised. */
const KIND_LABEL: Record<VenueKind, string> = {
  bar: 'Bar',
  club: 'Club',
  wine: 'Wine bar',
  restaurant: 'Restaurant',
  cafe: 'Café',
};

export default function AddVenue() {
  const router = useRouter();
  const toast = useToast();
  const t = useT();
  const { addVenue } = useStore();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [kind, setKind] = useState<VenueKind>('bar');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationRefused, setLocationRefused] = useState(false);

  const pin = async () => {
    setLocating(true);
    const point = await currentCoords();
    setLocating(false);
    if (point) {
      setCoords(point);
      setLocationRefused(false);
    } else {
      // Not an error dialog. Location is optional here and the venue saves
      // either way — it just will not be on the map.
      setLocationRefused(true);
    }
  };

  return (
    <Sheet
      title={t('discover.addPlaceTitle')}
      onClose={() => router.back()}
      footer={
        <Button
          title={t('discover.addIt')}
          disabled={name.trim().length < 2}
          onPress={() => {
            const venue = addVenue({
              name,
              area,
              category: KIND_LABEL[kind],
              lat: coords?.lat ?? null,
              lng: coords?.lng ?? null,
            });
            router.replace(`/venue/${venue.id}` as never);
            setTimeout(() => toast.show({ message: t('discover.venueAdded', { name: venue.name }) }), 160);
          }}
        />
      }
    >
      <View style={{ gap: space.m, paddingBottom: space.md }}>
        <Field label={t('discover.venueName')} value={name} onChangeText={setName} autoCapitalize="words" />
        <Field label={t('discover.venueArea')} value={area} onChangeText={setArea} autoCapitalize="words" />

        <Segmented
          label={t('discover.venueCategory')}
          value={kind}
          onChange={setKind}
          options={[
            { value: 'bar', label: t('discover.kindBar') },
            { value: 'club', label: t('discover.kindClub') },
            { value: 'wine', label: t('discover.kindWine') },
            { value: 'restaurant', label: t('discover.kindRestaurant') },
            { value: 'cafe', label: t('discover.kindCafe') },
          ]}
        />

        <Button
          title={coords ? t('discover.locationCaptured') : t('discover.useMyLocation')}
          kind="glass"
          icon={coords ? 'checkmark' : 'location'}
          disabled={locating || coords !== null}
          onPress={pin}
        />
        {locationRefused ? (
          <Text variant="footnote" tone="tertiary">{t('discover.locationUnavailable')}</Text>
        ) : null}

        <Text variant="footnote" tone="quaternary">{t('discover.addPlaceNote')}</Text>
      </View>
    </Sheet>
  );
}
