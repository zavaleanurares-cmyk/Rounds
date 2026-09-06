import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
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
    const board = crew.match(/const board = members[\s\S]*?\n\n/)?.[0] ?? '';
    expect(board).toBeTruthy();
    expect(board).toMatch(/nights/);
    expect(board).not.toMatch(/drinks|units|ethanol|totalG/);
    // And nothing invented alongside it. `venues: 6` and `quests: 3` sat here
    // as literals for a long time, under a header that described them as real.
    expect(board).not.toMatch(/venues|quests/);
    expect(board).not.toMatch(/:\s*\d+\b/);
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
      f === 'src/services/analytics.ts' || // event names, never rendered
      // The billing copy has to live in a catalogue like all other copy, and a
      // catalogue file is not a screen — nothing renders it while the routes
      // that would redirect. The assertions below still prove that.
      /^src\/i18n\/locales\/\w+\/billing\.ts$/.test(f)
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

describe('the app is not write-only', () => {
  /**
   * The bug this guards against, in full:
   *
   * The schema had 24 tables with RLS policies the matrix proved correct, and
   * the client wrote to three of them. Friends, crews, plans, trusted contacts
   * and the armed safe-arrival check lived in AsyncStorage on one device.
   * `run_safety_escalation` ran every minute against an empty table, so the
   * escalation the whole feature exists for could never fire for a real user.
   * Nothing failed. Nothing logged. It just silently did not happen.
   *
   * These assertions are structural because that is the only way to catch it:
   * a behavioural test of the escalation passes fine when the table is empty.
   */

  const store = code('src/data/store.tsx');
  const queue = code('src/data/queue.ts');
  const remote = code('src/data/remote.ts');

  /** Every op the queue declares. */
  const OPS = [...queue.matchAll(/^\s*\|\s*'(\w+)'/gm)].map((m) => m[1]);

  it('declares a meaningful number of ops', () => {
    expect(OPS.length).toBeGreaterThan(20);
  });

  it('every declared op has a writer', () => {
    const missing = OPS.filter((op) => !remote.includes(`case '${op}'`));
    expect(missing).toEqual([]);
  });

  it('every declared op is actually enqueued somewhere', () => {
    // An op nobody sends is a table nobody syncs — which is exactly the state
    // this whole change was fixing.
    // No exceptions any more. An op nobody sends is a table nobody syncs,
    // which is the state this whole change was fixing — the two that used to
    // sit here, delete_crew_member and leave_session, now have screens.
    const unused = OPS.filter((op) => !store.includes(`op: '${op}'`));
    expect(unused).toEqual([]);
  });

  /**
   * The specific ops without which the safety feature is decorative. Named one
   * by one, because a count would pass while the important one was missing.
   */
  it('safety reaches the server', () => {
    for (const op of ['arm_check', 'resolve_check', 'upsert_contact', 'delete_contact']) {
      expect({ op, enqueued: store.includes(`op: '${op}'`) }).toEqual({ op, enqueued: true });
    }
  });

  it('an armed check carries the contacts it named', () => {
    // Not just that it syncs — that it syncs WHO. The server escalates to
    // every contact on the account when this is absent, which would message
    // somebody the user deliberately left off the list.
    const armBlock = store.match(/op: 'arm_check'[\s\S]{0,600}?\}\);/)?.[0] ?? '';
    expect(armBlock).toBeTruthy();
    expect(armBlock).toContain('contactIds');
  });

  /**
   * Rules that live in a `security definer` function are only rules while the
   * client actually calls it.
   *
   * Both of these were regressions I introduced. The queue grew a writer per
   * table, and two of those tables already had an RPC in front of them holding
   * a rule no policy expresses:
   *
   *  · `request_friendship` caps an account at 25 sent requests a day. The
   *    insert policy only checks that the requester is you, so a direct insert
   *    passed and the cap simply stopped existing. (Self-friending was still
   *    refused, by a CHECK constraint — noisily, as a write that failed eight
   *    times and was dropped.)
   *  · `resolve_safe_arrival` marks the check resolved AND deletes the unsent
   *    `outbound` safety rows staged for it. A direct update to `resolved_at`
   *    did the first half, leaving an SMS in the outbox addressed to a trusted
   *    contact of somebody who had already pressed "I'm safe".
   *
   * Asserted structurally, because both bypasses are silent: the write
   * succeeds, and the missing half is a rule not applied rather than an error.
   */
  it('sends friend requests through the RPC, never straight into the table', () => {
    expect(remote).toContain("rpc('request_friendship'");
    // Accepting is still a direct update — RLS scopes that one to the
    // addressee — so the check is specifically that nothing INSERTS a
    // friendship row.
    const friendshipWrites = [...remote.matchAll(/from\('friendships'\)\s*\.\s*(\w+)/g)].map(
      (m) => m[1]
    );
    expect(friendshipWrites).not.toContain('insert');
    expect(friendshipWrites).not.toContain('upsert');
    expect(OPS).toContain('request_friendship');
    expect(OPS).not.toContain('upsert_friendship');
  });

  it('resolves a safe-arrival check through the RPC, so the unsent SMS is cancelled', () => {
    expect(remote).toContain("rpc('resolve_safe_arrival'");
    const checkWrites = [...remote.matchAll(/from\('safe_arrival_checks'\)\s*\.\s*(\w+)/g)].map(
      (m) => m[1]
    );
    // Arming still upserts the row; resolving must not update it.
    expect(checkWrites).not.toContain('update');
  });

  it('tells the sender when a request was declined rather than sent', () => {
    // The RPC answers with a word instead of raising, so the queue counts a
    // refused request as a successful write. Without the report the optimistic
    // "pending" row stays on screen describing a request that does not exist.
    expect(remote).toContain('friendRequestReporter');
    expect(store).toContain('setFriendRequestReporter');
    expect(store).toContain('friendRequestOutcome');
  });

  it('signing back in cancels a pending deletion, because the screen says it does', () => {
    // The copy is explicit: "sign back in within 30 days and nothing has been
    // lost." The cron reads `deletion_requested_at`; only this RPC clears it.
    // Without the call the promise is false and the account still goes.
    expect(remote).toContain("rpc('cancel_account_deletion')");
    expect(store).toContain('remote.cancelAccountDeletion()');
    const copy = read('src/i18n/locales/en/settings.ts');
    expect(copy).toContain('sign back in within 30 days');
  });

  it('you can find somebody you do not already know', () => {
    // The search screen filtered the local `people` array: friends, pending
    // requests and crew-mates this device already had. A stranger's exact
    // handle returned "No one with that username", which was false — they were
    // there, behind an RPC nothing called. The Add Friend flow existed end to
    // end and could not be started.
    expect(remote).toContain("rpc('search_profiles'");
    const screen = code('app/people/search.tsx');
    expect(screen).toContain('searchPeople');
    // And not by filtering what is already here.
    expect(screen).not.toMatch(/people\.filter\([\s\S]{0,200}username/);
  });

  it('live locations are read, not only written', () => {
    // Written every two minutes, read by nothing. The live room showed a grey
    // rectangle with a pin icon in it — a picture of a map — while the rows sat
    // in a table whose policy exists to let exactly those people read them.
    const share = code('src/services/locationShare.ts');
    expect(share).toContain("from('session_locations')");
    expect(share).toContain('readSessionLocations');
    expect(code('app/live/[code]/index.tsx')).toContain('readSessionLocations');
  });

  it('the live roster shows no drink counts it could not know', () => {
    // `read your own logs` is the only select policy on consumption_logs, so
    // another person's pace and count are unfetchable, not merely unfetched.
    // The roster rendered every friend as "steady · 3 drinks": a number no data
    // could ever have produced, on the screen where people look at each other.
    const room = code('app/live/[code]/index.tsx');
    expect(room).not.toMatch(/drinks=\{\d+\}/);
    expect(room).not.toMatch(/tint=\{color\.pace\.steady\}/);
  });

  it('one location switch, not two, and the one in the room is not a decoration', () => {
    const room = code('app/live/[code]/index.tsx');
    expect(room).toContain('shareLocationFor');
    // It used to flip a local boolean: the label changed, the pin turned blue,
    // and nothing was ever sent.
    expect(room).not.toContain('setSharingLocation');
  });

  /**
   * Every switch the app offers has to reach something.
   *
   * A settings screen is a set of promises, and six of them were kept nowhere:
   * `modules.social` ("ROUNDS is entirely private"), `contactMatching`,
   * `locationSharingDefault`, `nightDimming` and four of the six notification
   * categories were written to state, sometimes synced, and read by nothing.
   * Written as a table because the failure mode is per-switch and a single
   * assertion would pass while one of them rotted.
   */
  it('no settings switch is write-only', () => {
    const ALL = [...APP, ...SRC].map(code).join('\n');
    const readers: Record<string, RegExp> = {
      // the social module: the tab, the route guard and the night's visibility
      'modules.social': /modules\?\.social|useSocial\(\)/,
      // gates the address-book read itself
      contactMatching: /settings\.contactMatching/,
      // decides whether a night starts sharing
      locationSharingDefault: /settings\.locationSharingDefault/,
      // the aurora, app-wide, through Screen
      nightDimming: /settings\.nightDimming/,
    };
    for (const [name, reader] of Object.entries(readers)) {
      expect({ name, read: reader.test(ALL) }).toEqual({ name, read: true });
    }
  });

  it('the notification switches reach the thing that sends', () => {
    // Every message this product sends is composed and delivered server-side,
    // so a preference that never leaves the phone cannot be honoured. Four of
    // the six governed nothing at all.
    expect(store).toContain('notificationPrefs');
    expect(remote).toContain('notification_prefs');
    const prefs = readFileSync('supabase/migrations/00038_notification_prefs.sql', 'utf8');
    expect(prefs).toContain('notification_prefs');
    expect(prefs).toContain('may_notify');
    // …and three categories are never gated by one: a safe-arrival escalation
    // is not a notification anybody opted into, and the silent Live Activity
    // refresh fires once per drink per participant — charging those against a
    // three-a-week cap silences the account for a week after one shared night.
    expect(prefs).toMatch(/p_category in \('safety', 'system', 'live'\) then true/);
    expect(prefs).toMatch(/not in \('safety', 'system', 'live'\)/);
  });

  it('the server knows which language to write in', () => {
    // Four locales in the app, one hard-coded English in every job. The
    // safe-arrival check-in was the worst of it: the message that has to be
    // understood at 3am, in the wrong language.
    const strings = readFileSync('supabase/migrations/00037_server_strings.sql', 'utf8');
    expect(strings).toContain('public.say(');
    for (const locale of ['fr', 'ro', 'es']) {
      expect(strings).toContain(`'safety.check.title', '${locale}'`);
    }
    expect(strings).not.toMatch(/'title',\s*'Are you home\?'/);
    expect(store).toContain('locale');
  });

  it('the private half of the profile is written, not only read', () => {
    // profiles_private holds weight, sex, the module switches and the intents.
    // The sign-up trigger creates the row with defaults and sync_pull returns
    // it, so the first pull after onboarding reset all four on the device — the
    // weight the pace model runs on, and the switch that decides whether the
    // app is social at all.
    expect(OPS).toContain('upsert_private_profile');
    expect(remote).toContain("from('profiles_private')");
    expect(store).toContain("op: 'upsert_private_profile'");
  });

  it('telling other people something goes through a function, never a row', () => {
    // `notifications` has no insert policy, deliberately: "anyone may write to
    // anyone's inbox" is a spam feature.
    expect(remote).toContain("rpc('notify_night_started'");
    expect(remote).toContain("rpc('ask_for_round'");
    const writes = [...remote.matchAll(/from\('notifications'\)\s*\.\s*(\w+)/g)].map((m) => m[1]);
    expect(writes).not.toContain('insert');
    expect(writes).not.toContain('upsert');
    // And the two screens that promised it actually ask.
    expect(code('app/session/start.tsx')).toContain('notify:');
    expect(code('app/log/round.tsx')).toContain('askForRound');
  });

  it('the home address field keeps what is typed into it', () => {
    // `onChangeText={() => {}}` — every keystroke discarded, so Ride home
    // always opened Uber with no destination.
    const screen = code('app/settings/safety.tsx');
    expect(screen).toContain('setHomeAddress');
    expect(screen).not.toMatch(/onChangeText=\{\(\) => \{\}\}/);
    expect(store).toContain('setHomeAddress(address)');
  });

  it('being findable can be undone', () => {
    // An opt-in with no opt-out is not an opt-in. `stopBeingFindable` existed
    // from the start and was imported by nothing.
    expect(code('app/people/contacts.tsx')).toContain('stopBeingFindable');
  });

  it('the invite page carries no invented evening', () => {
    // It shipped with the demo seed in it: "Friday, properly", "21:30 · Roots",
    // and three avatars reading AM/TU/MP — Ana Marin, Tudor and Mihai P. from
    // the seed file — on every real invite anybody sent, OG tags included.
    // Comments stripped: the page's own note explains what used to be there
    // and quotes it, which is documentation rather than content.
    const invite = readFileSync('public/n.html', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    for (const fake of ['Friday, properly', 'Roots', '>AM<', '>TU<', '>MP<']) {
      expect({ fake, present: invite.includes(fake) }).toEqual({ fake, present: false });
    }
    expect(invite).toContain('invite_preview');
    // Every marker must have something that substitutes it, and every one must
    // degrade to real copy if nothing did. A link preview showing the literal
    // string {{OG_TITLE}} is the failure this page's own comment says cannot
    // happen — and could, because the fallback only rewrote the visible half.
    const markers = [...invite.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
    expect(markers.length).toBeGreaterThan(0);
    const fn = readFileSync('supabase/functions/invite/index.ts', 'utf8');
    const builder = readFileSync('scripts/build-invite.mjs', 'utf8');
    for (const marker of new Set(markers)) {
      const substituted = fn.includes(`{{${marker}}}`) || builder.includes(`{{${marker}}}`);
      expect({ marker, substituted }).toEqual({ marker, substituted: true });
    }
    // …and the page repairs the OG tags itself when neither ran.
    expect(invite).toContain('ogTitle');
    expect(invite).toMatch(/indexOf\('\{\{'\)/);
    // And no names on a page anybody with the link can open.
    expect(invite).not.toMatch(/displayName|avatar/);
  });

  it('the nicotine module can record something', () => {
    // It was a shell: two literal zeros on the dashboard, a "Log nicotine"
    // button that opened the drinks sheet, no nicotine category to log into,
    // and a `nicotine_free` goal with no branch in goalProgress — so its ring
    // read 0% whatever anybody did.
    const screen = code('app/nicotine.tsx');
    expect(screen).toContain('logNicotine');
    expect(screen).not.toMatch(/f\.number\(0, 0\)/);
    expect(store).toContain('logNicotine(productId)');
    expect(code('src/domain/stats.ts')).toContain("goal.type === 'nicotine_free'");
    // And nothing nicotine ever carries ethanol, which is what keeps every
    // alcohol total right without a filter anybody has to remember.
    const nic = code('src/domain/nicotine.ts');
    expect(nic).toMatch(/ml: 0,\s*\n\s*abv: 0,/);
  });

  /**
   * The one number this module must never invent.
   *
   * EU Directive 2014/40 Article 13(1)(a) forbids printing nicotine content on
   * a cigarette pack, and recital 25 gives the reason: the figures "proved to
   * be misleading as [they lead] consumers to believe that certain cigarettes
   * are less harmful than others". A per-brand milligram table in this app
   * would rebuild exactly what the Directive removed from the packaging — and
   * it is an easy, well-meant thing for somebody to add later, which is why it
   * is asserted rather than only explained.
   */
  it('carries no per-cigarette nicotine figure, and says why on screen', () => {
    const nic = read('src/domain/nicotine.ts');
    const products = nic.slice(nic.indexOf('export const SMOKED'), nic.indexOf('export const NICOTINE_PRODUCTS'));
    expect(products).toBeTruthy();
    // Every smoked product's strength is null. Not "small", not "estimated".
    expect(products).not.toMatch(/format: '(cigarette|rolled|heated|vape)',\s*mg: (?!null)/);
    // And the database refuses one, so a future client cannot send it either.
    const mg = readFileSync('supabase/migrations/00047_nicotine_mg.sql', 'utf8');
    expect(mg).toMatch(/category = 'nicotine' and nicotine_mg > 0 and nicotine_mg <= 20/);
    // The screen states the reason, so the absence cannot be mistaken for a gap.
    expect(read('src/i18n/locales/en/stats.ts')).toContain('stats.noYieldNote');
  });

  it('lists no pouch stronger than the law allows', () => {
    // Romanian Law 64/2024 caps a pouch at 20 mg. Stronger products exist and
    // cannot legally be sold here, so listing them would be listing contraband.
    const nic = read('src/domain/nicotine.ts');
    const strengths = [...nic.matchAll(/format: 'pouch', mg: ([\d.]+)/g)].map((m) => Number(m[1]));
    expect(strengths.length).toBeGreaterThan(15);
    expect(Math.max(...strengths)).toBeLessThanOrEqual(20);
  });

  /**
   * The social route list cannot quietly fall behind the app.
   *
   * `modules.social` promises that the app becomes entirely private. Hiding the
   * Circle tab hides a button; the routes stay registered and reachable by deep
   * link, notification href, QR code and back stack, so the guard is a LIST, and
   * a list is only as good as the thing that notices when a route is missing
   * from it. The first version of `SOCIAL_ROUTE_PREFIXES` claimed a test like
   * this existed and none did — and it had already missed `/(tabs)/circle`,
   * which is the href the server writes into people's inboxes.
   *
   * Every top-level route is either guarded or listed here as deliberately not
   * social. Adding a route to `app/` and neither is a failure.
   */
  it('every route is either social-guarded or deliberately not', () => {
    const NOT_SOCIAL = [
      '(auth)', '(onboarding)', '(tabs)', 'achievements', 'dev', 'insights',
      'legal', 'log', 'morning', 'nicotine', 'nights', 'passport', 'paywall',
      'profile', 'report', 'safety', 'session', 'settings', 'venue',
      'wellbeing', 'wrapped',
    ];
    const guard = read('src/hooks/useSocial.ts');
    const routes = readdirSync('app')
      .filter((e) => !e.startsWith('+') && !e.startsWith('_') && e !== 'index.tsx')
      .map((e) => e.replace(/\.tsx$/, ''));

    const unclassified = routes.filter(
      (r) => !NOT_SOCIAL.includes(r) && !guard.includes(`'/${r}'`)
    );
    expect(unclassified).toEqual([]);

    // And the tab that IS the social half is guarded, not merely un-buttoned.
    expect(guard).toContain("'/(tabs)/circle'");
  });

  /**
   * Every job this schema defines is scheduled somewhere.
   *
   * All of them were written, tested and left unscheduled: the `cron.schedule`
   * calls sat as comments so the file would apply to a bare Postgres, and the
   * consequence in production was that `run_safety_escalation` never ran at
   * all. The safe-arrival check that the whole safety feature exists for
   * silently never fired, and nothing anywhere said so.
   */
  it('every queue job is scheduled, and the drain is written down', () => {
    const schedules = readFileSync('supabase/migrations/00049_schedules.sql', 'utf8');
    const jobs = [
      'run_safety_escalation',
      'queue_morning_recaps',
      'queue_weekly_recaps',
      'queue_plan_reminders',
      'purge_expired_locations',
      'purge_deleted_accounts',
    ];
    for (const job of jobs) {
      expect({ job, scheduled: schedules.includes(job) }).toEqual({ job, scheduled: true });
    }
    // And it must degrade rather than fail where pg_cron is absent, or the
    // whole SQL suite stops running on a laptop.
    expect(schedules).toContain("pg_extension where extname = 'pg_cron'");

    // The drain is an edge function and cannot be scheduled from SQL, so the
    // one thing everything else depends on has to be documented instead.
    const deploy = readFileSync('docs/deploy.md', 'utf8');
    expect(deploy).toContain('send-outbound');
    expect(deploy).toContain('drain-outbound');
  });

  /**
   * `alter type ... add value` cannot be used in the transaction that adds it.
   *
   * It applied cleanly in 00043 because that file contains nothing else. The
   * next person to add an enum value and use it in the same migration gets a
   * failure at deploy time against a real database, which the test suite —
   * where each file is its own autocommitting psql run — would not have caught.
   */
  it('no migration both adds an enum value and uses it', () => {
    const dir = 'supabase/migrations';
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql'))) {
      const sql = readFileSync(join(dir, file), 'utf8');
      const added = [...sql.matchAll(/alter type [\w.]+ add value (?:if not exists )?'(\w+)'/gi)]
        .map((m) => m[1]);
      if (added.length === 0) continue;
      for (const value of added) {
        // Any other mention of the literal in the same file is a use of it.
        const uses = sql.split(`'${value}'`).length - 1;
        expect({ file, value, mentions: uses }).toEqual({ file, value, mentions: 1 });
      }
    }
  });

  it('no device can run a scheduler job', () => {
    /**
     * These are `security definer` and they write rows into other people's
     * queues. Supabase's default privileges grant execute to `authenticated` on
     * every new function, so a job that does not revoke is callable by anybody
     * signed in — which is how the two newest ones shipped, inheriting a
     * pattern from three older ones that had the same hole.
     *
     * Asserted here rather than in the SQL matrix: that file grants execute on
     * ALL functions to `authenticated` to set its scene, retroactively, so a
     * privilege check there would pass whatever the migrations did.
     */
    const sql = readdirSync('supabase/migrations')
      .map((f) => readFileSync(join('supabase/migrations', f), 'utf8'))
      .join('\n');
    const jobs = [
      'queue_weekly_recaps()',
      'queue_plan_reminders()',
      'queue_morning_recaps()',
      'run_safety_escalation()',
      'purge_expired_locations()',
      'purge_deleted_accounts()',
      'purge_sent_outbound()',
    ];
    for (const job of jobs) {
      const revoked = sql.includes(`revoke all on function public.${job} from public, authenticated, anon;`);
      expect({ job, revoked }).toEqual({ job, revoked: true });
    }
  });

  it('the sign-in screen renders without a Google client id', () => {
    /**
     * `useIdTokenAuthRequest` does not return null when it is unconfigured — it
     * THROWS during render: "Client Id property `webClientId` must be defined".
     * So a web build with no Google client id rendered a blank white page on
     * the first screen a new user ever sees, and every route test passed
     * because none of them opened it.
     *
     * The hook must therefore not be called at all when Google is not
     * configured for this platform, which is safe only because that is a
     * module-scope constant read from the environment.
     */
    const auth = code('src/services/auth.ts');
    expect(auth).toContain('GOOGLE_CONFIGURED');
    expect(auth).toMatch(/if \(!GOOGLE_CONFIGURED\) return \{ ready: false \};/);
    // The call itself is also wrapped, because this costs a whole screen.
    const hook = auth.slice(auth.indexOf('export function useGoogleAuthRequest'));
    expect(hook).toContain('try {');
    expect(hook).toContain('useIdTokenAuthRequest');
  });

  it('reserves header space by measuring the title, not by assuming one line', () => {
    /**
     * The header computes how much room to leave for the title. That
     * computation hard-coded one line of large title plus 22pt of subtitle, so
     * the moment titles were allowed to wrap — which they had to be, because
     * "When were you born?" was rendering as "When were you bor…" — the block
     * grew, the reservation did not, and the second line sat on top of the
     * content beneath it.
     *
     * Any constant is wrong for some combination of title, subtitle, type scale
     * and width. Measuring is the only version that stays right.
     */
    const screen = code('src/ui/Screen.tsx');
    expect(screen).toContain('onLayout');
    expect(screen).toContain('setTitleH');
    expect(screen).toMatch(/const expandedHeight = largeTitle \? titleTop \+ titleBlock/);
    // And the reservation must not go back to counting lines itself.
    expect(screen).not.toMatch(/titleTop \+ LARGE \* TITLE_LINE \+ \(subtitle \? 22 : 0\)/);
  });

  it('the native module is actually in the repository', () => {
    /**
     * `.gitignore` had `ios/` and `android/` unanchored, and a pattern without a
     * leading slash matches a directory at ANY depth — so it was also matching
     * `modules/rounds-native/ios/` and `.../android/`. Eight Swift files, the
     * podspec, the Gradle build and six Kotlin files had never been committed.
     *
     * Nothing would have reported it. The tests pass, the web build passes, the
     * typecheck passes — the omission only surfaces the first time somebody
     * clones and runs `expo prebuild`, and finds an app with no Live Activity,
     * no widgets, no App Intents, no Control Center control and no tile.
     *
     * Caught by diffing a clone of the repo against the working tree, which is
     * the only way to see what tracking is missing rather than what it has.
     */
    const tracked = execSync('git ls-files modules/rounds-native', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);

    // The two entry points the Expo module config names, and the surfaces.
    for (const file of [
      'modules/rounds-native/ios/RoundsNativeModule.swift',
      'modules/rounds-native/ios/RoundsLiveActivityView.swift',
      'modules/rounds-native/ios/RoundsWidgets.swift',
      'modules/rounds-native/ios/RoundsIntents.swift',
      'modules/rounds-native/ios/RoundsControl.swift',
      'modules/rounds-native/ios/RoundsNative.podspec',
      'modules/rounds-native/android/build.gradle',
      'modules/rounds-native/android/src/main/java/app/rounds/nativemodule/RoundsNativeModule.kt',
      'modules/rounds-native/android/src/main/java/app/rounds/nativemodule/RoundsWidget.kt',
      'modules/rounds-native/android/src/main/java/app/rounds/nativemodule/RoundsTileService.kt',
      'modules/rounds-native/plugin/withRoundsNative.js',
    ]) {
      expect({ file, tracked: tracked.includes(file) }).toEqual({ file, tracked: true });
    }

    // And the ignore patterns stay anchored to the root, where the prebuild
    // output they exist for actually appears.
    const ignore = readFileSync('.gitignore', 'utf8');
    expect(ignore).toMatch(/^\/ios\/$/m);
    expect(ignore).toMatch(/^\/android\/$/m);
    expect(ignore).not.toMatch(/^ios\/$/m);
    expect(ignore).not.toMatch(/^android\/$/m);
  });

  it('a device registers for push, or nothing can be delivered to it', () => {
    // push_tokens was empty for every real account: registerForPush existed and
    // was never called, so even stage one of the escalation had nowhere to go.
    expect(store).toContain('push.registerForPush()');
  });

  it('pulls, and only after the queue has drained', () => {
    expect(store).toContain('remote.pull(');
    // The ordering is the whole design: pulling with writes still pending
    // overwrites local changes that have not reached the server yet.
    const sync = store.match(/const syncNow = useCallback\([\s\S]*?\n  \}, \[\]\);/)?.[0] ?? '';
    expect(sync).toBeTruthy();
    const flushAt = sync.indexOf('logQueue.flush()');
    const guardAt = sync.indexOf('pending > 0');
    const pullAt = sync.indexOf('remote.pull(');
    expect(flushAt).toBeGreaterThan(-1);
    expect(guardAt).toBeGreaterThan(flushAt);
    expect(pullAt).toBeGreaterThan(guardAt);
  });

  it('refuses to sync demo data', () => {
    // Fake friends on a real account is worse than a dropped write.
    expect(queue).toContain('isSyncable');
  });
});

describe('the generated token files', () => {
  const tokens = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));

  it('never types a non-number as a duration', () => {
    // motion was emitted with a blanket $type: 'duration', so the spring
    // configs — objects of damping/stiffness/mass — went out claiming to be
    // durations. Nothing reading the file as DTCG could use that.
    for (const [name, token] of Object.entries<{ $type: string; $value: unknown }>(tokens.motion)) {
      if (token.$type === 'duration') {
        expect(typeof token.$value).toBe(`number`);
      } else {
        expect(name).toBe('spring');
        expect(token.$type).toBe('composite');
      }
    }
  });

  it('is in sync with src/design/tokens.ts', () => {
    // The CI job regenerates and diffs; this catches the same drift in the
    // suite, where it is one command instead of a red build ten minutes later.
    const src = readFileSync('src/design/tokens.ts', 'utf8');
    const block = src.match(/export const motion = \{[\s\S]*?\n\} as const;/)?.[0] ?? '';
    expect(block).toBeTruthy();
    const keys = [...block.matchAll(/^ {2}(\w+):/gm)].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(0);
    expect(Object.keys(tokens.motion).sort()).toEqual(keys.sort());
  });
});

describe('the native build', () => {
  const config = readFileSync('app.config.ts', 'utf8');
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

  it('declares expo-audio\'s peer dependency directly', () => {
    // expo-doctor: "Your app may crash outside of Expo Go without this
    // dependency. Native module peer dependencies must be installed directly."
    // It resolved transitively, so every JS check passed while a real build
    // would have shipped without it.
    expect(pkg.dependencies['expo-asset']).toBeTruthy();
    expect(pkg.dependencies['expo-asset']).toMatch(/^[~^]?57\./);
  });

  it('does not set edgeToEdgeEnabled', () => {
    // Android 16 makes edge-to-edge mandatory; the key is now rejected by the
    // plugin and prebuild warns on every run.
    expect(config).not.toMatch(/edgeToEdgeEnabled:\s*(true|false)/);
  });

  it('names every Android resource the manifest references', () => {
    // The plugin writes @xml/rounds_widget_info and @drawable/ic_notification
    // into the manifest. aapt2 fails the build on an unresolved reference, and
    // nothing in the JS suite builds Android — so this is the only place the
    // gap can show up before a build machine finds it.
    const plugin = readFileSync('modules/rounds-native/plugin/withRoundsNative.js', 'utf8');
    const refs = [...plugin.matchAll(/'@(xml|drawable)\/([a-z_]+)'/g)].map((m) => [m[1], m[2]]);
    expect(refs.length).toBeGreaterThan(0);
    for (const [kind, name] of refs) {
      const found =
        existsSync(`modules/rounds-native/android/src/main/res/${kind}/${name}.xml`) ||
        existsSync(`assets/android/${kind}/${name}.xml`) ||
        existsSync(`assets/android/${kind}/${name}.png`);
      expect([kind, name, found]).toEqual([kind, name, true]);
    }
  });

  it('lists every extension source, and the @main entry point among them', () => {
    // The source list used to live inside a property nothing read, so it could
    // drift from the directory without anyone noticing. A widget that is not in
    // the target does not exist, however well it compiles.
    //
    // RoundsWidgetBundle carries @main. A WidgetKit extension without one has no
    // executable entry point: the five surfaces are types nothing instantiates.
    const { WIDGET_EXTENSION } = require('../../modules/rounds-native/plugin/withRoundsNative.js');
    const onDisk = readdirSync('modules/rounds-native/ios').filter((f) => f.endsWith('.swift'));
    const listed: string[] = WIDGET_EXTENSION.sources;

    expect(listed).toContain('RoundsWidgetBundle.swift');
    expect(readFileSync('modules/rounds-native/ios/RoundsWidgetBundle.swift', 'utf8')).toMatch(
      /@main\s+struct \w+: WidgetBundle/
    );
    for (const f of listed) expect(onDisk).toContain(f);
    // RoundsNativeModule belongs to the app, not the extension.
    for (const f of onDisk) {
      if (f !== 'RoundsNativeModule.swift') expect(listed).toContain(f);
    }
  });

  it('does not silently produce an iOS build with no system surfaces', () => {
    // withXcodeProject assigned `__roundsTargets` and nothing ever read it, so
    // six Swift files — the Live Activity, three widget families and the
    // Control Center control — were never compiled into anything, and every
    // check in this repository passed anyway because none of them build iOS.
    //
    // Until the target is really created, prebuild must fail rather than hand
    // back an app that looks complete and has no widgets in it.
    const plugin = readFileSync('modules/rounds-native/plugin/withRoundsNative.js', 'utf8');
    expect(plugin).not.toMatch(/__roundsTargets\s*=/);
    const creates = /addTarget\(|PBXNativeTarget|apple-targets/.test(plugin);
    if (!creates) {
      expect(plugin).toMatch(/throw new Error\(/);
      expect(plugin).toContain('ROUNDS_ALLOW_NO_WIDGETS');
    }
  });
});

describe('the scheduled jobs are described consistently', () => {
  // 00049 is the source of truth. docs/deploy.md said "Expect six" and listed
  // six while the migration scheduled seven — purge-outbound was missing — so
  // anyone counting by hand against the doc would have concluded a correct
  // deployment was wrong, or an incomplete one was right.
  const migration = readFileSync('supabase/migrations/00049_schedules.sql', 'utf8');
  const jobs = [...new Set([...migration.matchAll(/cron\.schedule\(\s*'([a-z-]+)'/g)].map((m) => m[1]))].sort();

  it('schedules a known, non-empty set', () => {
    expect(jobs.length).toBeGreaterThan(0);
  });

  it('the supabase workflow expects exactly those jobs', () => {
    const wf = readFileSync('.github/workflows/supabase.yml', 'utf8');
    const line = wf.match(/expected="([^"]+)"/)?.[1] ?? '';
    expect(line.split(/\s+/).filter(Boolean).sort()).toEqual(jobs);
  });

  it('docs/deploy.md names exactly those jobs', () => {
    const deploy = readFileSync('docs/deploy.md', 'utf8');
    const para = deploy.match(/Expect \w+:([\s\S]*?)\.\n/)?.[1] ?? '';
    const named = [...new Set([...para.matchAll(/`([a-z-]+)`/g)].map((m) => m[1]))].sort();
    expect(named).toEqual(jobs);
  });

  it('verify:deploy reads the list from the migration rather than repeating it', () => {
    // A fourth hand-maintained copy of this list would drift like the third did.
    const script = readFileSync('scripts/verify-deploy.mjs', 'utf8');
    expect(script).toContain('00049_schedules.sql');
    for (const job of jobs) {
      expect(script.includes(`'${job}'`)).toBe(false);
    }
  });
});
