import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Sheet, Text, Icon, Button } from '@/ui';
import { Field } from '@/features/forms/Field';
import { useStore } from '@/data/store';
import { useLocation } from '@/hooks/useLocation';
import { findVenues, distanceM, formatDistance } from '@/services/venues';
import type { Venue } from '@/domain/types';
import { color, space } from '@/design/tokens';

/**
 * D-03 · Venue search.
 *
 * Searches the provider AND the local cache, and is the fallback whenever
 * location is denied — which is why it is a real search rather than a filter
 * over whatever happened to be nearby.
 */
export default function VenueSearch() {
  const router = useRouter();
  const { venues: known, mergeVenues } = useStore();
  const { coords } = useLocation();
  const [q, setQ] = useState('');
  const [remote, setRemote] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setRemote([]);
      return;
    }
    let alive = true;
    setLoading(true);
    // 350ms debounce: fast enough to feel live, slow enough not to hammer a
    // free API on every keystroke.
    const id = setTimeout(() => {
      findVenues({ term, lat: coords.lat, lng: coords.lng })
        .then(({ venues }) => {
          if (!alive) return;
          setRemote(venues);
          mergeVenues(venues);
        })
        .finally(() => alive && setLoading(false));
    }, 350);
    return () => { alive = false; clearTimeout(id); setLoading(false); };
  }, [q, coords.lat, coords.lng]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mergeVenues is
  // stable via the store's ref; listing it re-fired this on every mutation.

  const results = useMemo(() => {
    const term = q.toLowerCase().trim();
    const local = term ? known.filter((v) => v.name.toLowerCase().includes(term)) : known.slice(0, 12);
    const seen = new Set(local.map((v) => v.id));
    return [...local, ...remote.filter((v) => !seen.has(v.id))].slice(0, 30);
  }, [known, remote, q]);

  return (
    <Sheet title="Find a place" onClose={() => router.back()}>
      <View style={{ gap: space.m, paddingBottom: space.md }}>
        <Field label="Search" value={q} onChangeText={setQ} placeholder="Enigma, Roots…" autoCapitalize="words" />

        {loading ? (
          <View style={{ paddingVertical: space.m, alignItems: 'center' }}>
            <ActivityIndicator color={color.label.tertiary} />
          </View>
        ) : null}

        {results.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => router.replace(`/venue/${v.id}` as never)}
            accessibilityRole="button"
            accessibilityLabel={v.name}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: space.m,
              paddingVertical: space.m, opacity: pressed ? 0.7 : 1,
            })}
          >
            <Icon name="wineglass" size={18} color={color.label.secondary} />
            <View style={{ flex: 1 }}>
              <Text variant="body">{v.name}</Text>
              <Text variant="footnote" tone="tertiary">
                {[v.category, v.area].filter(Boolean).join(' · ')}
                {v.lat != null ? ` · ${formatDistance(distanceM(coords, { lat: v.lat, lng: v.lng! }))}` : ''}
              </Text>
            </View>
            <Icon name="chevron.right" size={15} color={color.label.quaternary} />
          </Pressable>
        ))}

        {q.trim().length > 1 && !loading && results.length === 0 ? (
          <View style={{ gap: space.m, paddingTop: space.m }}>
            <Text variant="subheadline" tone="tertiary">Nothing called "{q}" near you.</Text>
            <Button title="Add it yourself" kind="glass" compact onPress={() => router.replace('/venue/new')} />
          </View>
        ) : null}
      </View>
    </Sheet>
  );
}
