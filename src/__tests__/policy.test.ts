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
    // Both conditions live in the component, so a new placement cannot forget
    // one of them.
    expect(src).toMatch(/state === 'slow_down'[\s\S]{0,60}return null/);
  });

  it('is off unless the user asked for it, and the default is off', () => {
    const ring = read('src/ui/PaceRing.tsx');
    expect(ring).toMatch(/!settings\.showEstimate[\s\S]{0,40}return null/);
    const store = code('src/data/store.tsx');
    // In DEFAULT_SETTINGS, not merely declared on the type.
    const defaults = store.match(/const DEFAULT_SETTINGS[\s\S]*?\};/)?.[0] ?? '';
    expect(defaults).toMatch(/showEstimate:\s*false/);
  });

  /**
   * The Live Activity fan-out is a NEW outward path: a payload that leaves one
   * person's phone, crosses a server and lands on somebody else's Lock Screen.
   * It is the single easiest place in the product to leak the estimate, so the
   * assertions below cover every hop of it — the trigger that builds the row,
   * the worker that sends it, the client that registers the token, and the
   * handler that applies the result.
   */
  describe('and never crosses the Live Activity fan-out', () => {
    const FANOUT = [
      'supabase/migrations/00029_live_activity_push.sql',
      'supabase/functions/send-outbound/index.ts',
      'supabase/functions/_shared/apns.ts',
      'src/services/liveActivity.ts',
    ];

    it('no hop of it mentions the estimate', () => {
      for (const file of FANOUT) {
        const src = readFileSync(file, 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^\s*(?:\/\/|--).*$/gm, '');
        expect(src).not.toMatch(/bacAt|promille|‰/);
        expect(src).not.toMatch(/\bpaceState\b|\bpaceWord\b/);
      }
    });

    it('the enqueued payload is a closed list of shared facts', () => {
      const sql = readFileSync('supabase/migrations/00029_live_activity_push.sql', 'utf8');
      const build = sql.match(/jsonb_build_object\([\s\S]*?\)\n/)?.[0] ?? '';
      expect(build).toBeTruthy();
      const keys = [...build.matchAll(/'([a-zA-Z]+)',/g)].map((m) => m[1]).sort();
      // Adding a key here is a deliberate act, and changing this list is the
      // review step that goes with it.
      expect(keys).toEqual(['at', 'byUserId', 'drinks', 'lastDrink', 'sessionId', 'token']);
    });

    it('the APNs content state carries the same closed list', () => {
      const src = read('supabase/functions/send-outbound/index.ts');
      const body = src.match(/sendLiveActivityUpdate\(cfg, token, \{[\s\S]*?\}\)/)?.[0] ?? '';
      expect(body).toBeTruthy();
      const keys = [...body.matchAll(/^\s*([a-zA-Z]+):/gm)].map((m) => m[1]).sort();
      expect(keys).toEqual(['drinks', 'lastDrink', 'updatedAt']);
    });

    it('the Android handler keeps the local pace rather than taking one from a push', () => {
      const src = read('src/hooks/useSystemSurfaces.ts');
      const handler = src.match(/onLiveHudPush\(\(payload\) => \{[\s\S]*?\}\);/)?.[0] ?? '';
      expect(handler).toBeTruthy();
      // Only these two fields may come off the wire.
      expect(handler).toMatch(/drinks:/);
      expect(handler).toMatch(/lastDrinkName:/);
      expect(handler).not.toMatch(/paceState|paceWord/);
    });

    it('nothing sends to APNs inline — it all goes through the outbound queue', () => {
      const sql = read('supabase/migrations/00029_live_activity_push.sql');
      // The trigger writes rows and makes no network call of any kind.
      expect(sql).toMatch(/insert into public\.outbound/);
      expect(sql).not.toMatch(/http_post|net\.http|pg_net|curl/i);
    });
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

describe('billing is hidden', () => {
  /**
   * The rule: while BILLING_VISIBLE is false, a user cannot reach a price, a
   * tier name, or a purchase — by tapping, by deep link, or by typing a URL.
   *
   * These assertions are structural rather than behavioural on purpose. The
   * whole point of hiding billing behind one flag is that the code stays; a
   * test that only checked "does the paywall render" would pass just as
   * happily with an upsell button still sitting in Settings.
   */

  /** Everything that is allowed to talk about money. */
  const BILLING_OWNED = (p: string) => {
    const f = p.replace(/\\/g, '/');
    return (
      f.startsWith('src/features/billing/') ||
      f === 'src/services/purchases.ts' ||
      f === 'src/config/flags.ts' ||
      f === 'src/content/legal.ts' ||   // the terms have to describe the thing
      f === 'src/services/analytics.ts' // event names, never rendered
    );
  };

  const ROUTE_SHIMS = ['app/paywall.tsx', 'app/settings/subscription.tsx'];

  it('the flag is off', () => {
    const flags = read('src/config/flags.ts');
    expect(flags).toMatch(/export const BILLING_VISIBLE = false;/);
  });

  it('no price appears anywhere a user can reach', () => {
    const offenders: string[] = [];
    for (const file of [...APP, ...SRC]) {
      if (file.includes('__tests__') || BILLING_OWNED(file)) continue;
      // €4.99, $9, 34.99 EUR, "9.99/mo"
      if (/[€$£]\s?\d|\d+[.,]\d{2}\s*(?:€|EUR|USD|GBP)|\/\s?(?:mo|month|yr|year)\b/.test(code(file))) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no tier name appears anywhere a user can reach', () => {
    const offenders: string[] = [];
    for (const file of [...APP, ...SRC]) {
      if (file.includes('__tests__') || BILLING_OWNED(file)) continue;
      if (/ROUNDS\s?\+|ROUNDS plus|Crew Pass/i.test(code(file))) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });

  it('nothing routes to the paywall except the billing feature itself', () => {
    const offenders: string[] = [];
    for (const file of [...APP, ...SRC]) {
      if (file.includes('__tests__') || BILLING_OWNED(file)) continue;
      if (ROUTE_SHIMS.includes(file.replace(/\\/g, '/'))) continue;
      if (/(?:push|replace|navigate)\(\s*['"`]\/(?:paywall|settings\/subscription)/.test(code(file))) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('both billing routes redirect while the flag is off', () => {
    for (const shim of ROUTE_SHIMS) {
      const src = code(shim);
      expect(src).toContain('BILLING_VISIBLE');
      // The guard must come first, so the screen never mounts and never fires
      // its analytics or loads products.
      expect(src).toMatch(/if \(!BILLING_VISIBLE\) return <Redirect/);
    }
  });

  it('the Settings list has no subscription row', () => {
    const settings = code('app/settings/index.tsx');
    expect(settings).not.toMatch(/Subscription/i);
  });

  it('everything gated on entitlement behaves as unlocked', () => {
    const store = code('src/data/store.tsx');
    // `plus` must short-circuit to true, not merely default to it.
    expect(store).toMatch(/plus:\s*!BILLING_VISIBLE \|\|/);
  });

  it('the store adapter is never configured while billing is hidden', () => {
    const store = code('src/data/store.tsx');
    const effect = store.match(/void purchases\.configure[\s\S]{0,200}/)?.[0] ?? '';
    expect(effect).toBeTruthy();
    // The guard sits above the call in the same effect.
    const before = store.slice(0, store.indexOf('void purchases.configure'));
    expect(before.slice(-400)).toContain('if (!BILLING_VISIBLE) return;');
  });

  it('the subscriptions table, its migration and its RLS are all still there', () => {
    const files = readdirSync('supabase/migrations');
    const sql = files.map((f) => readFileSync(join('supabase/migrations', f), 'utf8')).join('\n');
    expect(sql).toMatch(/create table if not exists public\.subscriptions/);
    // And the client still has no way to grant itself one.
    expect(sql).not.toMatch(/create policy[^;]*on public\.subscriptions[^;]*for (?:insert|update|all)/i);
  });

  it('the purchases interface is still present, unimplemented', () => {
    const purchases = read('src/services/purchases.ts');
    expect(purchases).toMatch(/export (?:async )?function purchase/);
    expect(purchases).toMatch(/export (?:async )?function restore/);
    expect(purchases).toMatch(/export type ProductId/);
  });
});
