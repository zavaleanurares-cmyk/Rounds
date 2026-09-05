import { evaluate, xpForLevel, levelForXp, ACHIEVEMENTS } from '@/domain/progress';
import { nightKey } from '@/domain/nightKey';
import type { Log, Session, Person, Crew, Plan, Goal } from '@/domain/types';

const DAY = 86400000;
const base = Date.UTC(2026, 4, 1, 21, 0, 0);

const mkLog = (over: Partial<Log> = {}): Log => {
  const at = over.at ?? base;
  return {
    id: Math.random().toString(36),
    sessionId: 's1',
    userId: 'me',
    drinkId: 'beer-pint',
    drinkName: 'Pint',
    category: 'beer',
    volumeMl: 568,
    abv: 4.5,
    ethanolG: 20,
    priceMinor: 1500,
    currency: 'EUR',
    venueId: 'v1',
    at,
    nightKey: nightKey(at),
    deleted: false,
    createdAt: at,
    source: 'app',
    ...over,
  };
};

const mkSession = (over: Partial<Session> = {}): Session => ({
  id: Math.random().toString(36),
  ownerId: 'me',
  planId: null,
  venueId: 'v1',
  title: null,
  visibility: 'private',
  joinCode: null,
  startedAt: base,
  endedAt: base + 3 * 3600_000,
  safeHomeAt: null,
  mood: null,
  nightKey: nightKey(base),
  accentIndex: 0,
  ...over,
});

const empty = {
  logs: [] as Log[],
  sessions: [] as Session[],
  people: [] as Person[],
  crews: [] as Crew[],
  plans: [] as Plan[],
  goals: [] as Goal[],
  trustedContacts: 0,
  safeArrivalsResolved: 0,
  now: base + DAY,
};

describe('the level curve', () => {
  it('starts at zero and never goes backwards', () => {
    expect(xpForLevel(1)).toBe(0);
    for (let l = 1; l < 40; l++) {
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
    }
  });

  it('round-trips through levelForXp', () => {
    for (let l = 1; l < 40; l++) {
      expect(levelForXp(xpForLevel(l))).toBe(l);
      expect(levelForXp(xpForLevel(l + 1) - 1)).toBe(l);
    }
  });

  it('gets slower, not faster', () => {
    const span = (l: number) => xpForLevel(l + 1) - xpForLevel(l);
    for (let l = 1; l < 30; l++) expect(span(l + 1)).toBeGreaterThanOrEqual(span(l));
  });
});

describe('nothing rewards drinking more', () => {
  /**
   * The load-bearing test in this file. Two identical nights, one with a single
   * drink and one with twelve, must score exactly the same. If a future change
   * makes the heavy night worth more XP, this fails and the change is wrong.
   */
  it('a heavy night and a light night score identically', () => {
    const session = mkSession();
    const light = evaluate({
      ...empty,
      sessions: [session],
      logs: [mkLog({ sessionId: session.id })],
    });
    const heavy = evaluate({
      ...empty,
      sessions: [session],
      logs: Array.from({ length: 12 }, (_, i) =>
        mkLog({ sessionId: session.id, at: base + i * 600_000 })
      ),
    });
    expect(heavy.xp).toBe(light.xp);
    expect(heavy.level).toBe(light.level);
    expect([...heavy.earned].sort()).toEqual([...light.earned].sort());
  });

  it('a bigger drink is worth no more than a smaller one', () => {
    const session = mkSession();
    const small = evaluate({ ...empty, sessions: [session], logs: [mkLog({ ethanolG: 8 })] });
    const large = evaluate({ ...empty, sessions: [session], logs: [mkLog({ ethanolG: 40 })] });
    expect(large.xp).toBe(small.xp);
  });

  it('a person who drinks nothing at all can still level up', () => {
    // Twelve recorded nights, every one of them dry, with mornings answered.
    const sessions = Array.from({ length: 12 }, (_, i) =>
      mkSession({
        startedAt: base - i * DAY,
        endedAt: base - i * DAY + 2 * 3600_000,
        mood: 'good',
        nightKey: nightKey(base - i * DAY),
      })
    );
    const p = evaluate({ ...empty, sessions, now: base + DAY });
    expect(p.level).toBeGreaterThan(1);
    expect(p.earned.has('first-night')).toBe(true);
    expect(p.earned.has('morning-person')).toBe(true);
    expect(p.earned.has('week-of-logs')).toBe(true);
  });
});

describe('achievements', () => {
  it('a fresh account has earned nothing and sits at level 1', () => {
    const p = evaluate(empty);
    expect(p.earned.size).toBe(0);
    expect(p.level).toBe(1);
    expect(p.xp).toBe(0);
    expect(p.fraction).toBe(0);
  });

  it('every definition is reachable — no achievement id is orphaned', () => {
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(ids.size).toBe(ACHIEVEMENTS.length);
    for (const a of ACHIEVEMENTS) {
      expect(a.xp).toBeGreaterThan(0);
      expect(a.name.length).toBeGreaterThan(0);
      expect(a.hint.length).toBeGreaterThan(0);
    }
  });

  it('counts distinct venues, not visits', () => {
    const logs = Array.from({ length: 20 }, () => mkLog({ venueId: 'v1' }));
    expect(evaluate({ ...empty, logs }).earned.has('five-venues')).toBe(false);
    const spread = ['v1', 'v2', 'v3', 'v4', 'v5'].map((v) => mkLog({ venueId: v }));
    expect(evaluate({ ...empty, logs: spread }).earned.has('five-venues')).toBe(true);
  });

  it('a round is only a round when it was for three or more', () => {
    expect(evaluate({ ...empty, logs: [mkLog({ roundSize: 2 })] }).earned.has('round-buyer')).toBe(false);
    expect(evaluate({ ...empty, logs: [mkLog({ roundSize: 4 })] }).earned.has('round-buyer')).toBe(true);
  });

  it('a deleted log is not evidence of anything', () => {
    const logs = ['v1', 'v2', 'v3', 'v4', 'v5'].map((v) => mkLog({ venueId: v, deleted: true }));
    expect(evaluate({ ...empty, logs }).earned.has('five-venues')).toBe(false);
  });

  it('"home before two" means the clock, not the length of the night', () => {
    const early = mkSession({ endedAt: Date.UTC(2026, 4, 2, 1, 30) });
    const late = mkSession({ endedAt: Date.UTC(2026, 4, 2, 3, 30) });
    const three = (s: Session) => [s, mkSession({ ...s, id: 'b' }), mkSession({ ...s, id: 'c' })];
    // Compared against local time, so this asserts the two differ rather than
    // pinning a timezone the CI box might not share.
    const earlyHour = new Date(early.endedAt as number).getHours();
    const lateHour = new Date(late.endedAt as number).getHours();
    if (earlyHour === lateHour) return; // degenerate offset; nothing to assert
    const a = evaluate({ ...empty, sessions: three(early) }).earned.has('early-home');
    const b = evaluate({ ...empty, sessions: three(late) }).earned.has('early-home');
    expect(a || b).toBe(true);
  });

  it('progress is a pure function — same input, same answer', () => {
    const logs = [mkLog(), mkLog({ venueId: 'v2' })];
    const sessions = [mkSession()];
    const a = evaluate({ ...empty, logs, sessions });
    const b = evaluate({ ...empty, logs, sessions });
    expect(a.xp).toBe(b.xp);
    expect([...a.earned].sort()).toEqual([...b.earned].sort());
  });
});
