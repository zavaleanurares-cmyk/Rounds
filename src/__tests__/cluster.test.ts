import { clusterByGrid, cellForSpan } from '@/domain/cluster';
import { venueKind } from '@/domain/venueKind';

const at = (id: string, lat: number, lng: number) => ({ id, lat, lng });

describe('grid clustering', () => {
  it('puts two venues in the same cell into one cluster', () => {
    const out = clusterByGrid([at('a', 46.7701, 23.5901), at('b', 46.7702, 23.5902)], 0.01);
    expect(out).toHaveLength(1);
    expect(out[0].items.map((i) => i.id).sort()).toEqual(['a', 'b']);
  });

  it('keeps venues in different cells apart', () => {
    const out = clusterByGrid([at('a', 46.77, 23.59), at('b', 46.99, 23.99)], 0.01);
    expect(out).toHaveLength(2);
  });

  it('places a cluster at the mean of its members, not at a cell corner', () => {
    const out = clusterByGrid([at('a', 46.70, 23.50), at('b', 46.76, 23.56)], 1);
    expect(out[0].lat).toBeCloseTo(46.73, 6);
    expect(out[0].lng).toBeCloseTo(23.53, 6);
  });

  it('drops venues with no coordinates rather than placing them at 0,0', () => {
    // A hand-added venue has no lat/lng. The Gulf of Guinea is not where it is.
    const out = clusterByGrid(
      [at('a', 46.77, 23.59), { id: 'hand', lat: null, lng: null }],
      0.01
    );
    expect(out.flatMap((c) => c.items.map((i) => i.id))).toEqual(['a']);
  });

  it('is stable: the same input gives the same order', () => {
    const items = [at('c', 46.9, 23.9), at('a', 46.7, 23.5), at('b', 46.8, 23.7)];
    const first = clusterByGrid(items, 0.05).map((c) => c.key);
    const shuffled = [items[2], items[0], items[1]];
    expect(clusterByGrid(shuffled, 0.05).map((c) => c.key)).toEqual(first);
  });

  it('refuses a non-positive cell rather than dividing by zero', () => {
    expect(() => clusterByGrid([at('a', 1, 1)], 0)).toThrow();
  });

  it('never loses a venue', () => {
    const many = Array.from({ length: 200 }, (_, i) =>
      at(String(i), 46.7 + (i % 20) * 0.004, 23.5 + Math.floor(i / 20) * 0.004)
    );
    const total = clusterByGrid(many, 0.01).reduce((n, c) => n + c.items.length, 0);
    expect(total).toBe(200);
  });

  it('has a floor, so zooming in does not produce a pointless grid', () => {
    // `toBeGreaterThan(0)` was the first version of this, and it survived
    // deleting the floor entirely — a span divided by six is still greater
    // than zero. Assert the floor itself.
    const FLOOR = 0.00015;
    expect(cellForSpan(0.000001)).toBe(FLOOR);
    expect(cellForSpan(0.0001)).toBe(FLOOR);
    // and above the floor it tracks the span
    expect(cellForSpan(0.6)).toBeCloseTo(0.1, 6);
  });
});

describe('venue kinds', () => {
  it('reads the labels both providers produce', () => {
    expect(venueKind('Club')).toBe('club');
    expect(venueKind('Wine bar')).toBe('wine');
    expect(venueKind('Restaurant')).toBe('restaurant');
    expect(venueKind('Café')).toBe('cafe');
    expect(venueKind('Cafe')).toBe('cafe');
    expect(venueKind('Pub')).toBe('bar');
    expect(venueKind('Beer garden')).toBe('bar');
  });

  it('falls back to bar for anything unknown, including a hand-typed category', () => {
    // A wineglass on something unexpected is a smaller error than a coffee cup
    // on a pub, in an app for finding places to drink.
    expect(venueKind(null)).toBe('bar');
    expect(venueKind('')).toBe('bar');
    expect(venueKind('   ')).toBe('bar');
    expect(venueKind("Bogdan's place")).toBe('bar');
  });

  it('is case-insensitive, because hand-added categories are whatever was typed', () => {
    expect(venueKind('NIGHTCLUB')).toBe('club');
    expect(venueKind('  restaurant  ')).toBe('restaurant');
  });
});
