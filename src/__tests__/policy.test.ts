import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Policy tests.
 *
 * The non-negotiables in the brief are rules a person has to remember every
 * time they touch a file. These assert them instead, so breaking one is a red
 * test rather than something nobody notices until review.
 */

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const APP = walk('app');
const SRC = walk('src');
const read = (p: string) => readFileSync(p, 'utf8');

/**
 * Comments are where the rules are EXPLAINED, so they say things like "no
 * paywall, ever" and "never the ‰ estimate". Assert against the code.
 */
const code = (p: string) =>
  read(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

describe('safety is free forever', () => {
  const safetyFiles = [...APP, ...SRC].filter(
    (p) => p.includes('safety') || p.includes('Winddown')
  );

  it('finds the safety screens', () => {
    expect(safetyFiles.length).toBeGreaterThanOrEqual(3);
  });

  it('never reads entitlement', () => {
    for (const file of safetyFiles) {
      const src = code(file);
      expect(src).not.toMatch(/\bplus\b\s*[?&]/);
      expect(src).not.toContain('subscribed');
      expect(src).not.toContain('entitled');
      expect(src).not.toContain('paywall');
    }
  });
});

describe('the estimate stays where it belongs', () => {
  it('never appears on an outward-facing surface', () => {
    // Share cards, the widget payload, the Live Activity state and the native
    // bridge all carry the state word and the count — never the number.
    const outward = [
      'app/share/[sessionId].tsx',
      'src/native/index.ts',
      'src/hooks/useSystemSurfaces.ts',
    ];
    for (const file of outward) {
      const src = code(file);
      expect(src).not.toMatch(/bacAt\s*\(/);
      expect(src).not.toMatch(/‰/);
    }
  });

  it('is suppressed in the slow-down state by the component, not by callers', () => {
    const src = read('src/ui/PaceRing.tsx');
    expect(src).toMatch(/state === 'slow_down'\)\s*return null/);
  });
});

describe('no feed, no drinking leaderboard, no drinking streak', () => {
  it('has no Feed route', () => {
    expect(APP.some((p) => /feed/i.test(p))).toBe(false);
  });

  it('ranks crews on nights and places, never on volume', () => {
    const crew = code('app/crew/[slug].tsx');
    // The board's row shape IS the rule: what it can sort on is what it ranks on.
    const board = crew.match(/const board = \[[\s\S]*?\]\.sort/)?.[0] ?? '';
    expect(board).toBeTruthy();
    expect(board).toMatch(/nights/);
    expect(board).toMatch(/venues/);
    expect(board).not.toMatch(/drinks|units|ethanol|totalG/);
  });

  it('computes only dry streaks', () => {
    const stats = code('src/domain/stats.ts');
    expect(stats).toContain('dryStreak');
    expect(stats).not.toMatch(/drinkingStreak|nightsInARow/);
  });

  /**
   * The XP model is the place where a gamified app quietly starts paying people
   * to drink. These assertions are on the SOURCE, not on a computed number, so
   * a term that multiplies by anything alcohol-shaped fails the build even if
   * it happens to score zero for the fixtures in progress.test.ts.
   */
  it('the XP terms never touch a quantity of alcohol', () => {
    const progress = code('src/domain/progress.ts');
    const breakdown = progress.match(/const breakdown = \{[\s\S]*?\};/)?.[0] ?? '';
    expect(breakdown).toBeTruthy();
    expect(breakdown).not.toMatch(/ethanol|totalG|units|abv|volumeMl|drinks\b/i);
  });

  it('no achievement is worded as a reward for drinking', () => {
    const progress = read('src/domain/progress.ts');
    const defs = progress.match(/export const ACHIEVEMENTS[\s\S]*?\] as const;/)?.[0] ?? '';
    expect(defs).toBeTruthy();
    // "Drink every…", "most", "biggest", "fastest" — the shapes a volume badge
    // would have to take.
    expect(defs).not.toMatch(/\bmost\b|\bbiggest\b|\bfastest\b|\bmarathon\b|\bbinge\b/i);
  });
});

describe('there are no emoji in the app', () => {
  it('holds across every source file', () => {
    const offenders: string[] = [];
    for (const file of [...APP, ...SRC]) {
      if (file.includes('__tests__')) continue;
      if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(code(file))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

describe('the log sheet has no network dependency', () => {
  it('never awaits anything on the way to a log', () => {
    const sheet = code('app/log/index.tsx');
    expect(sheet).not.toContain('await ');
    expect(sheet).not.toContain('fetch(');
    expect(sheet).not.toMatch(/paywall|subscribed/);
  });
});

describe('one write path', () => {
  it('is the only place logs are enqueued', () => {
    const enqueuers = [...SRC, ...APP]
      .filter((p) => !p.includes('__tests__'))
      .filter((p) => code(p).includes('logQueue.enqueue'));
    expect(enqueuers.map((p) => p.replace(/\\/g, '/'))).toEqual(['src/data/store.tsx']);
  });

  it('mints client UUIDs rather than letting the server do it', () => {
    const store = code('src/data/store.tsx');
    expect(store).toMatch(/id: draft\.id \?\? uuid\(\)/);
  });
});
