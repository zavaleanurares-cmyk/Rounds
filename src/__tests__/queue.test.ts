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
    q.enqueue({ id: 'a', op: 'insert_log', payload: { x: 1 } });
    // The item is already in the queue before any await.
    expect(q.state().pending).toBe(1);
  });

  it('is idempotent by client UUID — replaying the same id does not duplicate', async () => {
    const q = new LogQueue();
    await q.load();
    q.setOnline(false);
    q.enqueue({ id: 'same', op: 'insert_log', payload: { v: 1 } });
    q.enqueue({ id: 'same', op: 'insert_log', payload: { v: 2 } });
    expect(q.peek()).toHaveLength(1);
    expect((q.peek()[0].payload as { v: number }).v).toBe(2);
  });

  it('treats different ops on the same row as separate work', async () => {
    const q = new LogQueue();
    await q.load();
    q.setOnline(false);
    q.enqueue({ id: 'row', op: 'insert_log', payload: {} });
    q.enqueue({ id: 'row', op: 'delete_log', payload: {} });
    expect(q.peek()).toHaveLength(2);
  });

  it('drains in order when online', async () => {
    const q = new LogQueue();
    await q.load();
    const seen: string[] = [];
    q.setSyncer(async (item: QueueItem) => void seen.push(item.id));
    q.enqueue({ id: '1', op: 'insert_log', payload: {} });
    q.enqueue({ id: '2', op: 'insert_log', payload: {} });
    q.enqueue({ id: '3', op: 'insert_log', payload: {} });
    await flushMicrotasks();
    await q.flush();
    expect(seen).toEqual(['1', '2', '3']);
    expect(q.state().pending).toBe(0);
  });

  it('holds everything while offline and drains when the network returns', async () => {
    const q = new LogQueue();
    await q.load();
    const synced: string[] = [];
    q.setSyncer(async (item) => void synced.push(item.id));
    q.setOnline(false);
    q.enqueue({ id: 'x', op: 'insert_log', payload: {} });
    q.enqueue({ id: 'y', op: 'insert_log', payload: {} });
    expect(synced).toHaveLength(0);
    expect(q.state().pending).toBe(2);

    q.setOnline(true);
    await flushMicrotasks();
    await q.flush();
    expect(synced).toEqual(['x', 'y']);
  });

  it('stops draining on a failure so ordering is preserved', async () => {
    const q = new LogQueue();
    await q.load();
    let calls = 0;
    q.setSyncer(async (item) => {
      calls++;
      if (item.id === 'bad') throw new Error('500');
    });
    q.setOnline(false);
    q.enqueue({ id: 'bad', op: 'insert_log', payload: {} });
    q.enqueue({ id: 'good', op: 'insert_log', payload: {} });
    q.setOnline(true);
    await q.flush();
    // 'good' must not overtake 'bad'.
    expect(q.peek().map((i) => i.id)).toEqual(['bad', 'good']);
    expect(calls).toBe(1);
  });

  it('gives up on a permanently failing row rather than blocking every later write', async () => {
    const q = new LogQueue();
    await q.load();
    q.setSyncer(async () => {
      throw new Error('nope');
    });
    q.enqueue({ id: 'cursed', op: 'insert_log', payload: {} });
    for (let i = 0; i < 10; i++) await q.flush();
    expect(q.peek().find((i) => i.id === 'cursed')).toBeUndefined();
  });

  it('survives a restart with its pending writes intact', async () => {
    const first = new LogQueue();
    await first.load();
    first.setOnline(false);
    first.enqueue({ id: 'persisted', op: 'insert_log', payload: { v: 7 } });
    await flushMicrotasks();

    // A cold start reads the same storage.
    const second = new LogQueue();
    await second.load();
    expect(second.peek().map((i) => i.id)).toEqual(['persisted']);
  });

  it('notifies subscribers of pending count and online state', async () => {
    const q = new LogQueue();
    await q.load();
    const states: number[] = [];
    const unsub = q.subscribe((s) => states.push(s.pending));
    q.setOnline(false);
    q.enqueue({ id: 'n', op: 'insert_log', payload: {} });
    expect(states[states.length - 1]).toBe(1);
    unsub();
  });
});
