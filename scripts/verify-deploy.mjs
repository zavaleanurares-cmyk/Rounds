#!/usr/bin/env node
/**
 * Deployment preflight — run this against a REAL project, after deploying.
 *
 * docs/deploy.md describes six steps and warns, correctly, that the important
 * ones are silent when skipped: `pg_cron` missing means migration 00049 applies,
 * prints a notice and schedules nothing; an unscheduled drain means every
 * message the product composes sits in `outbound` forever. In both cases the
 * app looks completely fine and the safety escalation never reaches anybody.
 *
 * A document that tells you to check something is weaker than a command that
 * checks it. This is the command.
 *
 *   SUPABASE_DB_URL=postgresql://... npm run verify:deploy
 *
 * Optionally also set SUPABASE_URL and SUPABASE_ANON_KEY to check the edge
 * functions and the public API from outside.
 *
 * Exit code is 0 only when every BLOCKER passes. Warnings do not fail the run:
 * a project with nothing in `outbound` yet is not broken, it is new.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

const DB = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';
const API = (process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const ANON = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!DB) {
  console.error(
    '\nSUPABASE_DB_URL is not set.\n\n' +
      '  Supabase dashboard -> Project Settings -> Database -> Connection string -> URI\n' +
      '  SUPABASE_DB_URL=postgresql://... npm run verify:deploy\n\n' +
      'Nothing was checked, so nothing is known to work.\n'
  );
  process.exit(2);
}

/** The seven jobs migration 00049 schedules, read from the migration itself so
 *  this list cannot drift from it the way docs/deploy.md's did. */
const EXPECTED_JOBS = [
  ...new Set(
    readFileSync('supabase/migrations/00049_schedules.sql', 'utf8')
      .matchAll(/cron\.schedule\(\s*'([a-z-]+)'/g)
  ),
].map((m) => m[1]).sort();

const results = [];
const record = (level, name, ok, detail) => results.push({ level, name, ok, detail });
const blocker = (name, ok, detail) => record('BLOCKER', name, ok, detail);
const warn = (name, ok, detail) => record('warning', name, ok, detail);

/** One round trip, one value back. Errors become null rather than throwing, so
 *  a single failed check never hides the rest of the report. */
function q(sql) {
  try {
    return execFileSync('psql', [DB, '-tAX', '-c', sql], {
      encoding: 'utf8',
      timeout: 20000,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (e) {
    const msg = (e.stderr || e.message || '').toString().trim().split('\n')[0];
    return { error: msg || 'query failed' };
  }
}

/* ---------------------------------------------------------- connection */
const version = q('select current_setting($$server_version_num$$)');
if (version?.error) {
  console.error(`\nCould not reach the database: ${version.error}\n`);
  console.error('Check SUPABASE_DB_URL, and that psql is installed.\n');
  process.exit(2);
}
blocker('The database is reachable', true, `server_version_num ${version}`);

/* ------------------------------------------------------- the migrations */
// A count is not proof, but the newest object is: 00050 is the last migration
// in the tree, so if its work is absent the push did not finish.
const migrationFiles = readdirSync('supabase/migrations').filter((f) => f.endsWith('.sql')).sort();
const latest = migrationFiles[migrationFiles.length - 1];
const tables = q(
  "select count(*) from information_schema.tables where table_schema = 'public'"
);
blocker(
  'The schema is deployed',
  !tables?.error && Number(tables) > 20,
  tables?.error ?? `${tables} tables in public, ${migrationFiles.length} migrations in the tree (latest ${latest})`
);

const outboundExists = q(
  "select to_regclass('public.outbound') is not null"
);
blocker(
  'public.outbound exists',
  outboundExists === 't',
  outboundExists === 't' ? '' : 'run `supabase db push` — without this nothing can be queued at all'
);

/* ------------------------------------------------------------ pg_cron */
const cron = q("select count(*) from pg_extension where extname = 'pg_cron'");
const cronOn = !cron?.error && Number(cron) === 1;
blocker(
  'pg_cron is installed',
  cronOn,
  cronOn
    ? ''
    : 'NOTHING is scheduled. 00049 applied, printed a notice and scheduled no jobs — including the safety escalation. Run `create extension pg_cron;` then re-run `supabase db push`.'
);

/* ------------------------------------------------- the seven cron jobs */
if (cronOn) {
  const got = q("select string_agg(jobname, ' ' order by jobname) from cron.job");
  const scheduled = new Set((got?.error ? '' : got).split(/\s+/).filter(Boolean));
  for (const job of EXPECTED_JOBS) {
    blocker(
      `  job: ${job}`,
      scheduled.has(job),
      scheduled.has(job) ? '' : 'not scheduled — see docs/deploy.md §1'
    );
  }

  /* -------------------------------------------- the drain (deploy.md §2) */
  // The one docs/deploy.md calls "the step everything else depends on".
  // send-outbound is an edge function, so no migration can schedule it, so
  // there is no version of this that gets done by pushing the database.
  const drain = [...scheduled].find((j) => /drain|outbound-send|send-outbound/.test(j));
  blocker(
    'The outbound drain is scheduled',
    Boolean(drain),
    drain
      ? `as '${drain}'`
      : 'EVERY message composed by the jobs above will sit in public.outbound forever, the safety SMS included. docs/deploy.md §2 has the pg_net job.'
  );

  const net = q("select count(*) from pg_extension where extname = 'pg_net'");
  warn(
    'pg_net is installed',
    !net?.error && Number(net) === 1,
    'only needed if the drain is scheduled from SQL rather than the dashboard'
  );
}

/* ------------------------------------------------ is the drain running? */
const drainState = q(
  `select count(*) filter (where sent_at is null) || ' ' ||
          count(*) filter (where sent_at is not null) || ' ' ||
          coalesce(max(send_after)::text, 'never')
     from public.outbound`
);
if (!drainState?.error) {
  const [waiting, sent, newest] = drainState.split(' ');
  const stuck = Number(waiting) > 0 && Number(sent) === 0;
  warn(
    'The drain has actually delivered something',
    !stuck,
    stuck
      ? `${waiting} waiting and 0 ever sent — the drain is scheduled but not working. Check the function logs.`
      : `${waiting} waiting, ${sent} sent, newest send_after ${newest}`
  );
  const err = q('select last_error from public.outbound where last_error is not null order by id desc limit 1');
  if (!err?.error && err) warn('No recent delivery error', false, `most recent: ${err}`);
}

/* --------------------------------------------------- the edge functions */
// verify_jwt is false for `invite` (supabase/config.toml), so it answers
// unauthenticated. A 404 here means the function was never deployed.
if (API) {
  for (const fn of ['invite', 'send-outbound']) {
    let status = 0;
    try {
      status = Number(
        execFileSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '-m', '15', `${API}/functions/v1/${fn}`], {
          encoding: 'utf8',
        }).trim()
      );
    } catch {
      status = 0;
    }
    // 401 is a pass for a function that requires a JWT: it answered.
    warn(
      `Edge function deployed: ${fn}`,
      status !== 0 && status !== 404,
      status === 404
        ? 'not deployed — `supabase functions deploy ' + fn + '`'
        : `HTTP ${status || 'no response'}`
    );
  }
} else {
  warn('Edge functions', true, 'skipped — set SUPABASE_URL to check them');
}

/* ------------------------------------------------------- the app's keys */
warn(
  'The app has its two public values',
  Boolean(API && ANON),
  API && ANON ? '' : 'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY — see docs/deploy.md §4'
);

/* -------------------------------------------------------------- output */
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
let failed = 0;
let warned = 0;

console.log('\nBLOCKERS — a failure here means a feature is silently dead\n');
for (const r of results.filter((r) => r.level === 'BLOCKER')) {
  if (!r.ok) failed++;
  console.log(`  ${r.ok ? 'ok  ' : 'FAIL'}  ${pad(r.name, 40)}${r.detail ? '  ' + r.detail : ''}`);
}

const warnings = results.filter((r) => r.level === 'warning');
if (warnings.length) {
  console.log('\nWARNINGS — worth reading, not necessarily wrong\n');
  for (const r of warnings) {
    if (!r.ok) warned++;
    console.log(`  ${r.ok ? 'ok  ' : '??  '}  ${pad(r.name, 40)}${r.detail ? '  ' + r.detail : ''}`);
  }
}

const blockers = results.filter((r) => r.level === 'BLOCKER').length;
console.log(
  `\n${blockers - failed}/${blockers} blockers passed` +
    (warned ? `, ${warned} warning${warned === 1 ? '' : 's'}` : '') +
    '.\n'
);

if (failed) {
  console.log('This deployment is not finished. docs/deploy.md has the fix for each.\n');
}
process.exit(failed > 0 ? 1 : 0);
