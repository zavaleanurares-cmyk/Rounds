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
    expect(store).toContain('logNicotine(drinkId)');
    expect(code('src/domain/stats.ts')).toContain("goal.type === 'nicotine_free'");
    // And nothing nicotine ever carries ethanol, which is what keeps every
    // alcohol total right without a filter anybody has to remember.
    const nic = code('src/domain/nicotine.ts');
    expect(nic).toMatch(/ml: 0,\s*\n\s*abv: 0,/);
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
