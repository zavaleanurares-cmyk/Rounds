/**
 * What kind of place this is, for the map.
 *
 * The providers disagree about wording — Google says `wine_bar`, OSM says
 * `amenity=bar` plus `drink:wine=yes`, and `CATEGORY_MAP` in the venue service
 * turns both into a human label. The map needs something narrower and stable:
 * five kinds, each with its own glyph, so a restaurant does not read as a bar
 * at a glance.
 *
 * Kept in the domain rather than in the map component because two screens ask
 * the same question (the pin and the venue header) and the answer should not
 * be written twice.
 */
export type VenueKind = 'bar' | 'club' | 'restaurant' | 'cafe' | 'wine';

/**
 * Matched on the human label, which is what a `Venue` actually carries, and
 * case-insensitively because a hand-added venue's category is whatever
 * somebody typed.
 *
 * Unknown falls back to `bar`. This map exists to find places to drink, so an
 * unrecognised category is more likely a bar than a café, and a wineglass on
 * something unexpected is a smaller error than a coffee cup on a pub.
 */
export function venueKind(category: string | null | undefined): VenueKind {
  const c = (category ?? '').trim().toLowerCase();
  if (!c) return 'bar';
  if (c.includes('club')) return 'club';
  if (c.includes('wine')) return 'wine';
  if (c.includes('restaurant')) return 'restaurant';
  if (c.includes('caf') || c.includes('coffee')) return 'cafe'; // café / cafe / Kaffee
  return 'bar';
}
