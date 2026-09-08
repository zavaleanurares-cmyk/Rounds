/**
 * Grid clustering for the map.
 *
 * Discover used to hand the map `.slice(0, 40)` and nothing else — with bars
 * only, forty pins in a city centre was already a wall, and adding
 * restaurants and cafés makes it unreadable. Truncating is the worst of the
 * options: it silently drops real places, and which forty you get depends on
 * the order a provider happened to return them in.
 *
 * A grid, not k-means or a quadtree. It is O(n), stable — the same input
 * always produces the same output, so pins do not shuffle between renders —
 * and at the scale of one screen of venues the quality difference is
 * invisible. A cluster's position is the mean of its members, so it sits over
 * them rather than at the corner of an arbitrary cell.
 */
export interface Clusterable {
  id: string;
  lat: number | null;
  lng: number | null;
}

export interface Cluster<T extends Clusterable> {
  /** Stable across renders: derived from the cell, not from the members. */
  key: string;
  lat: number;
  lng: number;
  items: T[];
}

/**
 * `cellDeg` is the grid size in degrees, so the caller decides how aggressive
 * clustering is from the current zoom. Anything without coordinates is dropped
 * — a hand-added venue has no lat/lng and cannot be placed on a map, which is
 * a real case and not a defect.
 */
export function clusterByGrid<T extends Clusterable>(items: T[], cellDeg: number): Cluster<T>[] {
  if (!(cellDeg > 0)) throw new Error('cluster: cellDeg must be positive');

  const cells = new Map<string, T[]>();
  for (const item of items) {
    if (item.lat === null || item.lng === null) continue;
    if (!Number.isFinite(item.lat) || !Number.isFinite(item.lng)) continue;
    const key = `${Math.floor(item.lat / cellDeg)}:${Math.floor(item.lng / cellDeg)}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(item);
    else cells.set(key, [item]);
  }

  const out: Cluster<T>[] = [];
  for (const [key, group] of cells) {
    let lat = 0;
    let lng = 0;
    for (const g of group) {
      lat += g.lat as number;
      lng += g.lng as number;
    }
    out.push({ key, lat: lat / group.length, lng: lng / group.length, items: group });
  }
  // Sorted so render order is deterministic rather than Map insertion order,
  // which follows whatever sequence the provider replied in.
  out.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return out;
}

/**
 * Degrees per grid cell for a given latitude span on screen.
 *
 * Roughly six cells across the visible height, which keeps clusters big enough
 * to be worth tapping and small enough that a cluster is somewhere you could
 * walk between. Below the floor the grid is finer than pins are wide and
 * clustering stops doing anything useful, so it stops.
 */
export function cellForSpan(latitudeDelta: number): number {
  return Math.max(latitudeDelta / 6, 0.00015);
}
