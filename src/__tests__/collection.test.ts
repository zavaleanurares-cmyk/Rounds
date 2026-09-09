import { collectionOf, newCards, completedSets } from '@/domain/collection';
import { CATALOG, byId } from '@/domain/catalog';
import type { Log } from '@/domain/types';

/**
 * The album, and the one property it must never lose.
 *
 * A collection is a reward for drinking, and the only thing separating this
 * one from the mechanic app review exists to stop is that the quantity term is
 * absent from the maths. That is not a claim a comment can hold up. These
 * tests execute it: they take a set of logs, multiply the drinking, and assert
 * that every number the screen shows is byte-identical.
 *
 * If a future change makes a heavier night score higher, `heavier drinking
 * changes nothing` goes red. It is the test this file exists for; the rest are
 * scaffolding around it.
 */

let seq = 0;
const log = (drinkId: string, at: number, venueId: string | null = null): Log => {
  const d = byId(drinkId)!;
  return {
    id: `l${seq++}`,
    sessionId: null,
    userId: 'u',
    drinkId: d.id,
    drinkName: d.name,
    category: d.category,
    volumeMl: d.volumeMl,
    abv: d.abv,
    ethanolG: d.ethanolG,
    priceMinor: null,
    nicotineMg: null,
    at,
    nightKey: '2026-09-01',
    venueId,
    deleted: false,
  } as Log;
};

const T = Date.parse('2026-09-01T22:00:00Z');

describe('a card opens once, on the first serving', () => {
  it('counts distinct drinks, not drinks', () => {
    const one = collectionOf([log('beer-pint', T)]);
    const many = collectionOf(Array.from({ length: 12 }, (_, i) => log('beer-pint', T + i * 60_000)));

    expect(one.found).toBe(1);
    expect(many.found).toBe(1);
  });

  it('keeps the earliest time, whatever order the logs arrive in', () => {
    // Logs are not sorted anywhere on the way in, and an edited log can move
    // backwards in time. If the later one won, the card would look new again.
    const c = collectionOf([log('beer-pint', T + 5_000), log('beer-pint', T)]);

    expect(c.cards.get('beer-pint')!.firstAt).toBe(T);
  });

  it('a deleted log never opened a card', () => {
    const l = log('negroni', T);
    const c = collectionOf([{ ...l, deleted: true }]);

    expect(c.found).toBe(0);
  });
});

describe('heavier drinking changes nothing', () => {
  /**
   * The load-bearing test. `base` is a modest night — five different things,
   * one of each. `heavy` is the same five things drunk five times over, with a
   * sixth pint on top of every one of them.
   *
   * Every number either screen can show has to come out the same.
   */
  const ids = ['beer-pint', 'gin-tonic', 'wine-red', 'water', 'tequila-shot'];
  const base = ids.map((id, i) => log(id, T + i * 60_000));
  const heavy = ids.flatMap((id, i) =>
    Array.from({ length: 6 }, (_, k) => log(id, T + i * 60_000 + k * 5_000))
  );

  it('the same cards, the same count, the same fractions', () => {
    const a = collectionOf(base, T + 1000);
    const b = collectionOf(heavy, T + 1000);

    expect(b.found).toBe(a.found);
    expect(b.newThisMonth).toBe(a.newThisMonth);
    expect([...b.cards.keys()].sort()).toEqual([...a.cards.keys()].sort());
    expect(b.sets.map((s) => s.fraction)).toEqual(a.sets.map((s) => s.fraction));
  });

  it('and no serving after the first is ever a new card', () => {
    const before = collectionOf(base, T + 1000);
    const after = collectionOf([...base, ...heavy], T + 1000);

    expect(newCards(before, after)).toEqual([]);
  });

  /**
   * Mutation test for the two above.
   *
   * A green assertion proves nothing until you have watched it go red, and the
   * mutation these two are guarding against is "someone counts servings". So
   * count servings here, on the same inputs, and assert the numbers DO diverge
   * — which is what makes the equality above meaningful rather than a
   * tautology about two identical objects.
   */
  it('the two inputs really are different nights', () => {
    const servings = (ls: Log[]) => ls.filter((l) => !l.deleted).length;
    const ethanol = (ls: Log[]) => ls.reduce((s, l) => s + l.ethanolG, 0);

    expect(servings(heavy)).toBeGreaterThan(servings(base) * 5);
    expect(ethanol(heavy)).toBeGreaterThan(ethanol(base) * 5);
  });
});

describe('the album can be advanced sober', () => {
  /**
   * Not a nicety. An album whose only currency is alcohol is a drinking
   * leaderboard with extra steps, and the reason this one is defensible is
   * that a person who never drinks can still fill cards in it.
   */
  it('water and soft drinks are collectible', () => {
    const soft = CATALOG.filter((d) => d.category === 'water' || d.category === 'soft');
    expect(soft.length).toBeGreaterThan(4);

    const c = collectionOf(soft.map((d, i) => log(d.id, T + i * 60_000)));

    expect(c.found).toBe(soft.length);
    expect(completedSets(c)).toEqual(expect.arrayContaining(['water', 'soft']));
  });

  it('every catalogue drink except nicotine is reachable', () => {
    const all = CATALOG.filter((d) => d.category !== 'nicotine');
    const c = collectionOf(all.map((d, i) => log(d.id, T + i * 1000)));

    expect(c.found).toBe(c.total);
    expect(c.total).toBe(all.length);
    // Nothing in the album is unreachable — a card nobody can turn over is a
    // permanently incomplete set, and the screen shows a percentage.
    expect(c.sets.every((s) => s.fraction === 1)).toBe(true);
  });

  it('a nicotine log is not a card', () => {
    const c = collectionOf([log('beer-pint', T), { ...log('beer-pint', T), category: 'nicotine', drinkId: 'zyn-6' }]);
    expect(c.found).toBe(1);
  });
});

describe('newThisMonth is a window, not a total', () => {
  it('drops a card older than thirty days', () => {
    const old = T - 40 * 24 * 3600_000;
    const c = collectionOf([log('beer-pint', old), log('negroni', T)], T);

    expect(c.found).toBe(2);
    expect(c.newThisMonth).toBe(1);
  });
});
