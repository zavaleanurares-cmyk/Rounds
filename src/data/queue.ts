/**
 * The offline log queue.
 *
 * Every write path in the product — the log sheet, the widget, the Live Activity
 * button, the notification action, Siri, the watch — enqueues here and nothing
 * else. There is never a second write path.
 *
 * Idempotency is by construction, not by retry logic: the client mints the row's
 * UUID, so replaying the same enqueue is a no-op on the server. That is why a
 * flaky network at 1am cannot produce a duplicate drink.
 *
 * The UI never waits on this. `enqueue` returns synchronously with the row
 * already in local state; sync happens later and its failure surfaces only as
 * the offline pill.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Every write the client can make.
 *
 * The list is explicit rather than a generic `upsert:<table>` for one reason:
 * the policy test asserts that `src/data/store.tsx` is the ONLY place anything
 * is enqueued, and a named op makes it obvious at the call site what a store
 * action actually sends. A generic op would let a new table start syncing
 * without anybody reviewing what it sends.
 *
 * Anything absent from this list does not leave the device. That is a design
 * statement, not an omission: session_locations, session_messages and
 * session_reactions are live-only and go over realtime, and `events` is
 * fire-and-forget analytics.
 */
export type QueueOp =
  /* the night */
  | 'insert_log'
  | 'update_log'
  | 'delete_log'
  | 'upsert_session'
  | 'end_session'
  | 'join_session'
  | 'leave_session'
  /* the account */
  | 'upsert_profile'
  | 'upsert_goal'
  /* safety — the reason this list grew */
  | 'upsert_contact'
  | 'delete_contact'
  | 'arm_check'
  | 'resolve_check'
  /* people */
  | 'upsert_friendship'
  | 'delete_friendship'
  | 'insert_block'
  | 'delete_block'
  | 'insert_report'
  /* crews */
  | 'upsert_crew'
  | 'upsert_crew_member'
  | 'delete_crew_member'
  /* plans */
  | 'upsert_plan'
  | 'upsert_plan_invitee'
  | 'set_plan_vote'
  | 'clear_plan_vote'
  | 'add_plan_venue'
  /* places */
  | 'upsert_venue'
  /* inbox */
  | 'read_notification';

export interface QueueItem<T = unknown> {
  /** Client-generated UUID. The row's primary key, not a queue-local id. */
  id: string;
  op: QueueOp;
  payload: T;
  createdAt: number;
  attempts: number;
  lastError: string | null;
}

const STORAGE_KEY = 'rounds.queue.v1';
const MAX_ATTEMPTS = 8;

export type Syncer = (item: QueueItem) => Promise<void>;

type Listener = (state: QueueState) => void;

export interface QueueState {
  pending: number;
  syncing: boolean;
  online: boolean;
  lastSyncAt: number | null;
}

export class LogQueue {
  private items: QueueItem[] = [];
  private listeners = new Set<Listener>();
  private syncing = false;
  private online = true;
  private lastSyncAt: number | null = null;
  private loaded = false;
  private syncer: Syncer | null = null;

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      this.items = raw ? (JSON.parse(raw) as QueueItem[]) : [];
    } catch {
      this.items = [];
    }
    this.loaded = true;
    this.emit();
  }

  setSyncer(syncer: Syncer | null) {
    this.syncer = syncer;
  }

  setOnline(online: boolean) {
    if (this.online === online) return;
    this.online = online;
    this.emit();
    if (online) void this.flush();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state());
    return () => this.listeners.delete(listener);
  }

  state(): QueueState {
    return {
      pending: this.items.length,
      syncing: this.syncing,
      online: this.online,
      lastSyncAt: this.lastSyncAt,
    };
  }

  /**
   * Synchronous from the caller's point of view. Persisting and syncing are
   * both fire-and-forget — a log must never block on I/O.
   */
  /**
   * Demo data must never leave the device.
   *
   * `Settings › Demo data` fills the app with fourteen weeks of plausible
   * history and a cast of people with ids like `p1` and `c1`. That is fine
   * until somebody RSVPs to the demo plan or blocks the demo friend — those go
   * through the real store actions, which enqueue, and the row would land on
   * that person's actual account. Fake friends and fake crews appearing on a
   * real profile is a far worse outcome than a write being dropped.
   *
   * Every real row in this schema is keyed by a UUID, so the check is simply
   * whether the id looks like one. A synthetic composite key (`a:b`) is checked
   * part by part.
   */
  private isSyncable(id: string): boolean {
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return id.split(':').every((part) => UUID.test(part));
  }

  enqueue<T>(item: Omit<QueueItem<T>, 'createdAt' | 'attempts' | 'lastError'>): void {
    if (!this.isSyncable(item.id)) return;
    // Idempotent by client UUID: re-enqueueing the same id replaces, never duplicates.
    const existing = this.items.findIndex((q) => q.id === item.id && q.op === item.op);
    const record: QueueItem<T> = {
      ...item,
      createdAt: Date.now(),
      attempts: 0,
      lastError: null,
    };
    if (existing >= 0) this.items[existing] = record as QueueItem;
    else this.items.push(record as QueueItem);
    this.emit();
    void this.persist();
    void this.flush();
  }

  async flush(): Promise<void> {
    if (this.syncing || !this.online || !this.syncer || this.items.length === 0) return;
    this.syncing = true;
    this.emit();
    try {
      // Drain in order; a failing item stops the drain so ordering is preserved.
      while (this.items.length > 0) {
        const item = this.items[0];
        try {
          await this.syncer(item);
          this.items.shift();
          this.lastSyncAt = Date.now();
        } catch (err) {
          item.attempts += 1;
          item.lastError = err instanceof Error ? err.message : String(err);
          if (item.attempts >= MAX_ATTEMPTS) {
            // Give up on this row rather than blocking every later write forever.
            this.items.shift();
          }
          break;
        }
      }
    } finally {
      this.syncing = false;
      this.emit();
      void this.persist();
    }
  }

  /** Test / debug only. */
  peek(): readonly QueueItem[] {
    return this.items;
  }

  async clear(): Promise<void> {
    this.items = [];
    this.emit();
    await this.persist();
  }

  private emit() {
    const s = this.state();
    this.listeners.forEach((l) => l(s));
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // A full disk must not take the app down; the in-memory queue still works.
    }
  }
}

export const logQueue = new LogQueue();
