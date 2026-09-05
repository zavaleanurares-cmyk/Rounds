/**
 * The venue provider.
 *
 * User-created venues produce garbage — misspellings, duplicates, places that
 * closed in 2019 — so real venues come from a provider and are cached into the
 * `venues` table by `provider_id`. This is the seam.
 *
 * Two implementations behind one interface:
 *   · Nominatim/OSM — free, no key, works today, good enough for a beta
 *   · Google Places / MapKit — swap in for launch by setting the key
 *
 * Everything is cached locally, because a bar-finder that needs a round trip to
 * show you the place you are standing in is a bar-finder nobody uses.
 */
import type { Venue } from '@/domain/types';
import { readJson, writeJson } from '@/data/storage';

const CACHE_KEY = 'rounds.venues.cache.v1';
const CACHE_TTL = 7 * 86400000; // a week; bars do not move
/** A miss is cached briefly so a bad response can't pin a location to nothing. */
const EMPTY_TTL = 10 * 60000;
/**
 * React Native's fetch has NO default timeout. Captive-portal wifi in a bar
 * routinely leaves a socket half-open, and the promise then never settles —
 * the spinner spins forever and the "we couldn't reach the venue service"
 * notice never appears, because the code that would set it never runs.
 */
const REQUEST_TIMEOUT = 8000;

async function fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

interface CacheEntry {
  at: number;
  venues: Venue[];
}

export interface VenueQuery {
  lat?: number;
  lng?: number;
  term?: string;
  radiusM?: number;
}

const CATEGORY_MAP: Record<string, string> = {
  bar: 'Bar',
  pub: 'Pub',
  nightclub: 'Club',
  biergarten: 'Beer garden',
  restaurant: 'Restaurant',
  cafe: 'Café',
  wine_bar: 'Wine bar',
};

function cacheKeyFor(q: VenueQuery): string {
  return q.term
    ? `t:${q.term.toLowerCase().trim()}`
    : `g:${q.lat?.toFixed(3)},${q.lng?.toFixed(3)}`;
}

async function readCache(key: string): Promise<Venue[] | null> {
  const all = await readJson<Record<string, CacheEntry>>(CACHE_KEY, {});
  const hit = all[key];
  if (!hit) return null;
  // An empty result expires in minutes, not a week. Otherwise one throttled
  // Overpass response — which returns 200 with no elements — pins that whole
  // area to zero pins for seven days, with no retry and no error shown.
  const ttl = hit.venues.length === 0 ? EMPTY_TTL : CACHE_TTL;
  if (Date.now() - hit.at > ttl) return null;
  return hit.venues;
}

async function writeCache(key: string, venues: Venue[]): Promise<void> {
  const all = await readJson<Record<string, CacheEntry>>(CACHE_KEY, {});
  all[key] = { at: Date.now(), venues };
  // Bounded: a user who searches a lot should not fill their disk with bars.
  const keys = Object.keys(all);
  if (keys.length > 60) delete all[keys[0]];
  await writeJson(CACHE_KEY, all);
}

/** Google Places, when a key is present. */
async function searchGoogle(q: VenueQuery): Promise<Venue[] | null> {
  const key = process.env.EXPO_PUBLIC_PLACES_KEY;
  if (!key) return null;
  const body = q.term
    ? { textQuery: `${q.term} bar`, maxResultCount: 20 }
    : {
        includedTypes: ['bar', 'night_club', 'pub'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: q.lat, longitude: q.lng },
            radius: q.radiusM ?? 1500,
          },
        },
      };
  const url = q.term
    ? 'https://places.googleapis.com/v1/places:searchText'
    : 'https://places.googleapis.com/v1/places:searchNearby';

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.location,places.primaryType,places.priceLevel,places.shortFormattedAddress',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`places ${res.status}`);
  const json = (await res.json()) as { places?: Array<Record<string, any>> };
  return (json.places ?? []).map((p) => ({
    id: `g:${p.id}`,
    providerId: p.id,
    name: p.displayName?.text ?? 'Somewhere',
    area: p.shortFormattedAddress ?? null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
    priceBand: priceBandFrom(p.priceLevel),
    category: CATEGORY_MAP[p.primaryType] ?? 'Bar',
  }));
}

function priceBandFrom(level?: string): 1 | 2 | 3 | null {
  switch (level) {
    case 'PRICE_LEVEL_INEXPENSIVE': return 1;
    case 'PRICE_LEVEL_MODERATE': return 2;
    case 'PRICE_LEVEL_EXPENSIVE':
    case 'PRICE_LEVEL_VERY_EXPENSIVE': return 3;
    default: return null;
  }
}

/**
 * OpenStreetMap via Overpass. No key, no billing, no account — which is what
 * makes the app testable by anyone the moment they clone it.
 */
async function searchOsm(q: VenueQuery): Promise<Venue[]> {
  const radius = q.radiusM ?? 1500;
  const filter = '["amenity"~"bar|pub|nightclub|biergarten"]';
  const query = q.term
    ? `[out:json][timeout:12];node${filter}["name"~"${escapeOverpass(q.term)}",i](${bbox(q)});out 25;`
    : `[out:json][timeout:12];node${filter}(around:${radius},${q.lat},${q.lng});out 30;`;

  const res = await fetchWithTimeout('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`overpass ${res.status}`);
  const json = (await res.json()) as { elements?: Array<Record<string, any>> };

  return (json.elements ?? [])
    .filter((e) => e.tags?.name)
    .map((e) => ({
      id: `osm:${e.id}`,
      providerId: String(e.id),
      name: e.tags.name as string,
      area: (e.tags['addr:city'] as string) ?? (e.tags['addr:street'] as string) ?? null,
      lat: e.lat ?? null,
      lng: e.lon ?? null,
      priceBand: null,
      category: CATEGORY_MAP[e.tags.amenity as string] ?? 'Bar',
    }));
}

function escapeOverpass(s: string): string {
  return s.replace(/["\\]/g, '');
}

function bbox(q: VenueQuery): string {
  const lat = q.lat ?? 46.77;
  const lng = q.lng ?? 23.59;
  const d = 0.09; // ~10km
  return `${lat - d},${lng - d},${lat + d},${lng + d}`;
}

/**
 * Nearby or by name. Cache first, provider second, and on failure the caller
 * still gets whatever was cached — a bar-finder that shows nothing because a
 * third-party API is having a bad afternoon is worse than a stale one.
 */
export async function findVenues(q: VenueQuery): Promise<{ venues: Venue[]; stale: boolean }> {
  const key = cacheKeyFor(q);
  const cached = await readCache(key);
  if (cached) return { venues: cached, stale: false };

  try {
    // Google first when a key exists, OSM otherwise — AND OSM as the fallback
    // when Google throws or legitimately returns nothing. `??` only caught the
    // no-key case, so a 429 from Places skipped OSM entirely.
    let fromProvider = await searchGoogle(q).catch(() => null);
    if (!fromProvider || fromProvider.length === 0) fromProvider = await searchOsm(q);
    const deduped = dedupe(fromProvider);
    await writeCache(key, deduped);
    return { venues: deduped, stale: false };
  } catch {
    const anyCached = await readJson<Record<string, CacheEntry>>(CACHE_KEY, {});
    const fallback = Object.values(anyCached).flatMap((e) => e.venues);
    return { venues: dedupe(fallback).slice(0, 30), stale: true };
  }
}

/** The provider returns the same pub twice more often than you would think. */
function dedupe(venues: Venue[]): Venue[] {
  const seen = new Map<string, Venue>();
  for (const v of venues) {
    const k = `${v.name.toLowerCase()}|${v.lat?.toFixed(3)}|${v.lng?.toFixed(3)}`;
    if (!seen.has(k)) seen.set(k, v);
  }
  return [...seen.values()];
}

export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatDistance(m: number): string {
  return m < 950 ? `${Math.round(m / 10) * 10}m` : `${(m / 1000).toFixed(1)}km`;
}
