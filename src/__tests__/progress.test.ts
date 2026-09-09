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
      // The copy is a catalogue key now, resolved at the render site.
      expect(a.nameKey.length).toBeGreaterThan(0);
      expect(a.hintKey.length).toBeGreaterThan(0);
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

  /**
   * The times are built in LOCAL time, and that is the whole fix.
   *
   * `early-home` reads `new Date(endedAt).getHours()`, which is local. This
   * test used to build its two nights with `Date.UTC` and then try to stay
   * timezone-independent by asserting only that at least one of them counted,
   * with a bail-out if the two happened to land on the same hour. Neither
   * guard survives a real offset: in UTC+3, 01:30 UTC is 04:30 and 03:30 UTC
   * is 06:30, so the hours differ, the bail-out does not fire, and NEITHER
   * night is before two — `a || b` is false and the test fails.
   *
   * It went unnoticed because CI runs in UTC and so does every container this
   * repository has been checked in. It first went red on a laptop in Romania,
   * which is the only machine that has ever run it at a real offset.
   *
   * Local input against a local rule is timezone-independent by construction,
   * and it lets the assertion say what the rule actually is — 01:30 counts,
   * 03:30 does not — instead of the much weaker "one of these two".
   */
  it('"home before two" means the clock, not the length of the night', () => {
    const early = mkSession({ endedAt: new Date(2026, 4, 2, 1, 30).getTime() });
    const late = mkSession({ endedAt: new Date(2026, 4, 2, 3, 30).getTime() });
    const three = (s: Session) => [s, mkSession({ ...s, id: 'b' }), mkSession({ ...s, id: 'c' })];

    expect(evaluate({ ...empty, sessions: three(early) }).earned.has('early-home')).toBe(true);
    expect(evaluate({ ...empty, sessions: three(late) }).earned.has('early-home')).toBe(false);
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

describe('every achievement can say how far along it is', () => {
  /**
   * The achievements screen leads with "nearly there", which is only possible
   * because `towards` carries a have/need pair for every id. A missing key
   * renders as a silently blank row rather than an error, which is the class
   * of bug this repository keeps finding by hand — so assert the two lists are
   * the same list.
   */
  it('towards covers exactly the achievement table', () => {
    const p = evaluate(empty);

    expect([...p.towards.keys()].sort()).toEqual(ACHIEVEMENTS.map((a) => a.id).sort());
  });

  it('have never exceeds need, however much has happened', () => {
    // Forty venues is 40, and "Ten venues" is a bar that stops at ten.
    const logs = Array.from({ length: 40 }, (_, i) =>
      mkLog({ id: `x${i}`, venueId: `v${i}` })
    );
    const p = evaluate({ ...empty, logs });

    p.towards.forEach(({ have, need }, id) => {
      expect(have).toBeLessThanOrEqual(need);
      expect(have).toBeGreaterThanOrEqual(0);
      expect(need).toBeGreaterThan(0);
      if (p.earned.has(id)) expect(have).toBe(need);
    });
  });

  it('an earned achievement is always full, and a full one always earned', () => {
    const logs = Array.from({ length: 12 }, (_, i) => mkLog({ id: `y${i}`, venueId: `v${i}` }));
    const p = evaluate({ ...empty, logs });

    p.towards.forEach(({ have, need }, id) => {
      expect(p.earned.has(id)).toBe(have >= need);
    });
  });
});
