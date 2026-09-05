import { LogQueue, type QueueItem } from '@/data/queue';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    getItem: jest.fn(async (k: string) => store.get(k) ?? null),
    setItem: jest.fn(async (k: string, v: string) => void store.set(k, v)),
    removeItem: jest.fn(async (k: string) => void store.delete(k)),
  };
});

const flushMicrotasks = () => new Promise((r) => setTimeout(r, 0));

/**
 * Ids that look like the real thing. Every row in this schema is keyed by a
 * UUID, and the queue refuses anything else — see the demo-data test at the
 * bottom of this file — so a fixture keyed 'a' is not testing the real path.
 */
const ID = {
  a: '00000001-0000-4000-8000-000000000000',
  b: '00000002-0000-4000-8000-000000000000',
  c: '00000003-0000-4000-8000-000000000000',
  same: '00000004-0000-4000-8000-000000000000',
  session: '00000005-0000-4000-8000-000000000000',
  row: '00000006-0000-4000-8000-000000000000',
  n1: '00000007-0000-4000-8000-000000000000',
  n2: '00000008-0000-4000-8000-000000000000',
  n3: '00000009-0000-4000-8000-000000000000',
  bad: '0000000a-0000-4000-8000-000000000000',
  good: '0000000b-0000-4000-8000-000000000000',
  cursed: '0000000c-0000-4000-8000-000000000000',
  persisted: '0000000d-0000-4000-8000-000000000000',
  n: '0000000e-0000-4000-8000-000000000000',
};

// Each test gets a fresh device. (That the queue survives a restart at all is
// covered by its own test below.)
beforeEach(async () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  await AsyncStorage.removeItem('rounds.queue.v1');
});

describe('LogQueue', () => {
  it('accepts a write synchronously and never blocks the caller', async () => {
    const q = new LogQueue();
    await q.load();
    q.setSyncer(async () => new Promise(() => {})); // never resolves
    q.enqueue({ id: ID.a, op: 'insert_log', payload: { x: 1 } });
    // The item is already in the queue before any await.
    expect(q.state().pending).toBe(1);
  });

  it('is idempotent by client UUID — replaying the same id does not duplicate', async () => {
    const q = new LogQueue();
    await q.load();
    q.setOnline(false);
    q.enqueue({ id: ID.same, op: 'insert_log', payload: { v: 1 } });
    q.enqueue({ id: ID.same, op: 'insert_log', payload: { v: 2 } });
    expect(q.peek()).toHaveLength(1);
    expect((q.peek()[0].payload as { v: number }).v).toBe(2);
  });

  it('treats different ops on the same row as separate work', async () => {
    const q = new LogQueue();
    await q.load();
    q.setOnline(false);
    q.enqueue({ id: ID.row, op: 'insert_log', payload: {} });
    q.enqueue({ id: ID.row, op: 'delete_log', payload: {} });
    expect(q.peek()).toHaveLength(2);
  });

  it('drains in order when online', async () => {
    const q = new LogQueue();
    await q.load();
    const seen: string[] = [];
    q.setSyncer(async (item: QueueItem) => void seen.push(item.id));
    q.enqueue({ id: ID.n1, op: 'insert_log', payload: {} });
    q.enqueue({ id: ID.n2, op: 'insert_log', payload: {} });
    q.enqueue({ id: ID.n3, op: 'insert_log', payload: {} });
    await flushMicrotasks();
    await q.flush();
    expect(seen).toEqual([ID.n1, ID.n2, ID.n3]);
    expect(q.state().pending).toBe(0);
  });

  it('holds everything while offline and drains when the network returns', async () => {
    const q = new LogQueue();
    await q.load();
    const synced: string[] = [];
    q.setSyncer(async (item) => void synced.push(item.id));
    q.setOnline(false);
    q.enqueue({ id: ID.a, op: 'insert_log', payload: {} });
    q.enqueue({ id: ID.b, op: 'insert_log', payload: {} });
    expect(synced).toHaveLength(0);
    expect(q.state().pending).toBe(2);

    q.setOnline(true);
    await flushMicrotasks();
    await q.flush();
    expect(synced).toEqual([ID.a, ID.b]);
  });

  it('stops draining on a failure so ordering is preserved', async () => {
    const q = new LogQueue();
    await q.load();
    let calls = 0;
    q.setSyncer(async (item) => {
      calls++;
      if (item.id === ID.bad) throw new Error('500');
    });
    q.setOnline(false);
    q.enqueue({ id: ID.bad, op: 'insert_log', payload: {} });
    q.enqueue({ id: ID.good, op: 'insert_log', payload: {} });
    q.setOnline(true);
    await q.flush();
    // 'good' must not overtake 'bad'.
    expect(q.peek().map((i) => i.id)).toEqual([ID.bad, ID.good]);
    expect(calls).toBe(1);
  });

  it('gives up on a permanently failing row rather than blocking every later write', async () => {
    const q = new LogQueue();
    await q.load();
    q.setSyncer(async () => {
      throw new Error('nope');
    });
    q.enqueue({ id: ID.cursed, op: 'insert_log', payload: {} });
    for (let i = 0; i < 10; i++) await q.flush();
    expect(q.peek().find((i) => i.id === 'cursed')).toBeUndefined();
  });

  it('survives a restart with its pending writes intact', async () => {
    const first = new LogQueue();
    await first.load();
    first.setOnline(false);
    first.enqueue({ id: ID.persisted, op: 'insert_log', payload: { v: 7 } });
    await flushMicrotasks();

    // A cold start reads the same storage.
    const second = new LogQueue();
    await second.load();
    expect(second.peek().map((i) => i.id)).toEqual([ID.persisted]);
  });

  it('notifies subscribers of pending count and online state', async () => {
    const q = new LogQueue();
    await q.load();
    const states: number[] = [];
    const unsub = q.subscribe((s) => states.push(s.pending));
    q.setOnline(false);
    q.enqueue({ id: ID.n, op: 'insert_log', payload: {} });
    expect(states[states.length - 1]).toBe(1);
    unsub();
  });

  /**
   * Demo data must never leave the device.
   *
   * Settings › Demo data fills the app with a cast of people whose ids are
   * `p1`, `c1`, `v1`. Loading it does not enqueue anything — it dispatches
   * straight into state — but INTERACTING with it does: RSVP to the demo plan,
   * block the demo friend, vote on the demo venue, and those go through the
   * real store actions.
   *
   * Fake friends and fake crews appearing on somebody's real account is a much
   * worse outcome than a write being dropped, so the queue refuses anything not
   * keyed by a UUID.
   */
  describe('refuses to sync demo data', () => {
    // A fresh device per call: the queue persists, so two checks in one test
    // would otherwise see each other's rows.
    const enqueued = async (id: string) => {
      await require('@react-native-async-storage/async-storage').removeItem('rounds.queue.v1');
      const q = new LogQueue();
      await q.load();
      q.setOnline(false);
      q.enqueue({ id, op: 'insert_log', payload: {} });
      return q.state().pending;
    };

    it('drops the demo fixtures', async () => {
      for (const id of ['p1', 'c1', 'v1', 'plan1', 'me', 'vineri']) {
        expect({ id, pending: await enqueued(id) }).toEqual({ id, pending: 0 });
      }
    });

    it('drops a composite key with a demo half', async () => {
      // `${crewId}:${userId}` — a real crew, a demo member, still not syncable.
      expect(await enqueued(`${ID.a}:p1`)).toBe(0);
      expect(await enqueued(`c1:${ID.a}`)).toBe(0);
    });

    it('accepts a real row, and a real composite key', async () => {
      expect(await enqueued(ID.a)).toBe(1);
      expect(await enqueued(`${ID.a}:${ID.b}`)).toBe(1);
    });

    it('is not fooled by something merely uuid-shaped', async () => {
      // Right shape, wrong alphabet: g, h, i, j are not hex.
      expect(await enqueued('gggggggg-hhhh-4iii-8jjj-kkkkkkkkkkkk')).toBe(0);
      expect(await enqueued('11111111111111111111111111111111')).toBe(0);
    });
  });
});
