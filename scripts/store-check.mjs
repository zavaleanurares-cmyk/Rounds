#!/usr/bin/env node
/**
 * Store submission preflight.
 *
 * Two lists, and the difference between them is the point.
 *
 *   CHECKED   — things this repo can prove. A wrong answer here is a rejection
 *               and a two-week delay, and every one of them is verifiable from
 *               the source, so it is verified rather than remembered.
 *   BLOCKED   — things that need an Apple Developer or Play Console account,
 *               a signing key, or a live domain. These are NOT stubbed and not
 *               faked: a fake answer that passes a check is worse than no
 *               check, because it removes the reminder without doing the work.
 *
 * Run: npm run store:check
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const read = (p) => readFileSync(p, 'utf8');
const has = (p) => existsSync(p);

const results = [];
const check = (name, fn, detail = '') => {
  let ok = false;
  let err = '';
  try {
    ok = fn() === true;
  } catch (e) {
    err = e.message;
  }
  results.push({ name, ok, detail: err || detail });
};

/* ------------------------------------------------------ store limits */
// App Store Connect and Play Console both truncate silently. A subtitle cut off
// mid-word is the first thing a person sees — and it is worse in a language the
// person shipping the build cannot read, so every locale is checked, not just
// en-US. Locales are DISCOVERED rather than listed: adding store/metadata/de-DE/
// and forgetting to register it here would silently ship an unchecked listing.
const METADATA = 'store/metadata';

// Per-file limits, keyed by basename because they are the same in every locale.
const FILE_LIMITS = {
  'name.txt': 30,
  'subtitle.txt': 30,
  'promotional_text.txt': 170,
  'keywords.txt': 100,
  'description.txt': 4000,
  'short_description.txt': 80,
  'release_notes.txt': 500,
};

// Not a locale: the App Review notes, which have their own limit and no
// translations — a reviewer reads them in English.
const NOT_A_LOCALE = new Set(['review']);

const locales = readdirSync(METADATA, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !NOT_A_LOCALE.has(e.name))
  .map((e) => e.name)
  .sort();

check('store/metadata contains at least the en-US listing', () => {
  if (!locales.includes('en-US')) throw new Error('en-US is missing');
  return true;
});

for (const locale of locales) {
  for (const [file, limit] of Object.entries(FILE_LIMITS)) {
    check(`${locale} · ${file} exists and fits in ${limit} characters`, () => {
      const path = join(METADATA, locale, file);
      if (!has(path)) throw new Error(`missing from ${locale}`);
      // .length counts UTF-16 code units, which is what both stores count for
      // everything in the Latin-1/Latin-Extended range these listings live in.
      // An accented character is one character, not two bytes.
      const body = read(path).trim();
      if (body.length === 0) throw new Error(`empty in ${locale}`);
      if (body.length > limit) {
        throw new Error(`${locale}: ${body.length} characters, limit is ${limit}`);
      }
      return true;
    });
  }
}

// The review notes are checked on their own: one file, one limit, no locale.
check('review notes exist and fit in 4000 characters', () => {
  const body = read('store/metadata/review/notes.txt').trim();
  if (body.length === 0) throw new Error('empty');
  if (body.length > 4000) throw new Error(`${body.length} characters, limit is 4000`);
  return true;
});

// A locale missing a file is caught above; a locale carrying a file the others
// do not have is a typo'd filename that no store will ever read.
check('no locale carries a file the listing does not use', () => {
  const known = new Set(Object.keys(FILE_LIMITS));
  const strays = [];
  for (const locale of locales) {
    for (const entry of readdirSync(join(METADATA, locale))) {
      if (!known.has(entry)) strays.push(`${locale}/${entry}`);
    }
  }
  if (strays.length) throw new Error(strays.join(', '));
  return true;
});

check('the app name is the same brand in every locale', () => {
  const wrong = locales
    .map((l) => [l, read(join(METADATA, l, 'name.txt')).trim()])
    .filter(([, name]) => name !== 'ROUNDS');
  if (wrong.length) throw new Error(wrong.map(([l, n]) => `${l} says "${n}"`).join(', '));
  return true;
});

for (const locale of locales) {
  check(`${locale} · keywords are comma-separated with no spaces after commas`, () => {
    const kw = read(join(METADATA, locale, 'keywords.txt')).trim();
    if (/,\s/.test(kw)) {
      throw new Error(`${locale}: a space after a comma wastes a character each time`);
    }
    if (/,,|^,|,$/.test(kw)) throw new Error(`${locale}: empty keyword`);
    return true;
  });
}

/* --------------------------------------------- the line that must survive */
// Rule 4 of docs/i18n-glossary.md. Every description ends by saying the pace
// figure can be wrong and must never decide whether you drive, and that safety
// is free. A translation that softens or drops either line is the one mistake
// in this directory that could actually hurt someone, so it is asserted rather
// than trusted — per locale, because a regex cannot read a language it has not
// been taught. A new locale with no entry here FAILS: registering the two
// phrases is part of adding the locale.
const DISCLAIMER = {
  'en-US': [/never use it to decide whether to drive/i, /safety features are free forever/i],
  'fr-FR': [/ne t'en sers jamais pour décider si tu peux conduire/i, /gratuites pour toujours/i],
  'ro-RO': [/nu o folosi niciodată ca să decizi dacă poți conduce/i, /gratuite pentru totdeauna/i],
  'es-ES': [/no la uses nunca para decidir si conduces/i, /gratis para siempre/i],
};

for (const locale of locales) {
  check(`${locale} · description keeps the driving line and the free-forever line`, () => {
    const patterns = DISCLAIMER[locale];
    if (!patterns) {
      throw new Error(`${locale}: no disclaimer wording registered in store-check.mjs`);
    }
    const body = read(join(METADATA, locale, 'description.txt'));
    const [drive, free] = patterns;
    if (!drive.test(body)) throw new Error(`${locale}: the driving line is missing or reworded`);
    if (!free.test(body)) throw new Error(`${locale}: the free-forever line is missing`);
    return true;
  });
}

// Romanian's comma-below diacritics render as different letters in several
// fonts, and the Turkish cedillas are one keyboard layout away.
check('Romanian uses comma-below diacritics, never the Turkish cedillas', () => {
  if (!locales.includes('ro-RO')) return true;
  const offenders = Object.keys(FILE_LIMITS).filter((f) =>
    /[\u015F\u015E\u0163\u0162]/.test(read(join(METADATA, 'ro-RO', f)))
  );
  if (offenders.length) throw new Error(`cedilla in ${offenders.join(', ')}`);
  return true;
});

/* -------------------------------------------------- the review answers */
check('the review notes say the estimate is never on an outward surface', () => {
  const notes = read('store/metadata/review/notes.txt');
  return /never appears on a shareable card/i.test(notes) && /computed on-device/i.test(notes);
});

check('the review notes match the app: nothing is for sale while billing is hidden', () => {
  const flags = read('src/config/flags.ts');
  const notes = read('store/metadata/review/notes.txt');
  if (!/BILLING_VISIBLE = false/.test(flags)) return true; // billing is on; different notes apply
  if (!/nothing for sale|no in-app purchase/i.test(notes)) {
    throw new Error('billing is hidden but the review notes do not say so');
  }
  if (/subscription is|ROUNDS\+ costs/i.test(notes)) throw new Error('notes describe a paid tier');
  return true;
});

check('the review notes name a demo account', () => /demo@/.test(read('store/metadata/review/notes.txt')));

/* ------------------------------------------------------- the manifests */
check('the iOS privacy manifest exists', () => has('ios-config/PrivacyInfo.xcprivacy'));

check('the privacy manifest declares no tracking', () => {
  const x = read('ios-config/PrivacyInfo.xcprivacy');
  return /<key>NSPrivacyTracking<\/key>\s*<false\/>/.test(x);
});

check('the privacy manifest does not declare health data as collected', () => {
  // Body basics never leave the device. Declaring them collected would be
  // wrong AND would contradict the Privacy Policy.
  const x = read('ios-config/PrivacyInfo.xcprivacy');
  return !/NSPrivacyCollectedDataTypeHealth/.test(x);
});

check('prebuild copies the privacy manifest rather than trusting a human to', () => {
  const plugin = read('modules/rounds-native/plugin/withRoundsNative.js');
  return /PrivacyInfo\.xcprivacy/.test(plugin) && /copyFileSync/.test(plugin);
});

/* ------------------------------------------------------- app.config.ts */
const cfg = read('app.config.ts');

check('background location is blocked, not merely unused', () =>
  /blockedPermissions:\s*\['android\.permission\.ACCESS_BACKGROUND_LOCATION'\]/.test(cfg));

check('the foreground service is declared specialUse with a subtype string', () => {
  const plugin = read('modules/rounds-native/plugin/withRoundsNative.js');
  return (
    /'android:foregroundServiceType': 'specialUse'/.test(plugin) &&
    /PROPERTY_SPECIAL_USE_FGS_SUBTYPE/.test(plugin)
  );
});

check('every iOS permission string explains itself', () => {
  const strings = [...cfg.matchAll(/NS\w+UsageDescription:\s*\n?\s*'([^']+)'/g)].map((m) => m[1]);
  if (strings.length < 4) throw new Error(`only found ${strings.length} usage descriptions`);
  const lazy = strings.filter((s) => s.length < 25 || /^(To use|Required|Needed)/i.test(s));
  if (lazy.length) throw new Error(`too thin: ${lazy.join(' | ')}`);
  return true;
});

check('encryption is declared exempt', () => /ITSAppUsesNonExemptEncryption: false/.test(cfg));

/* --------------------------------------------------------- deep links */
check('the universal-links file is served without a .json extension', () =>
  has('public/.well-known/apple-app-site-association') &&
  !has('public/.well-known/apple-app-site-association.json'));

check('assetlinks.json is present', () => has('public/.well-known/assetlinks.json'));

check('the link paths match the routes the app actually handles', () => {
  const aasa = JSON.parse(
    read('public/.well-known/apple-app-site-association').replace(/"_comment":.*?,\n/s, '')
  );
  const paths = aasa.applinks.details[0].components.map((c) => c['/']);
  for (const p of ['/n/*', '/p/*', '/c/*']) {
    if (!paths.includes(p)) throw new Error(`missing ${p}`);
  }
  return true;
});

/* ------------------------------------------------------------- legal */
check('the legal documents are still marked as drafts (they must be settled first)', () => {
  const legal = read('src/content/legal.ts');
  return /\[DRAFT/.test(legal);
}, 'expected while drafting — this flips to a BLOCKER below');

/* ------------------------------------------------------------ output */
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));
let failed = 0;

console.log('\nCHECKED — verifiable from this repo\n');
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`  ${r.ok ? 'ok  ' : 'FAIL'}  ${pad(r.name, 62)}${r.detail ? '  ' + r.detail : ''}`);
}

/**
 * Everything below needs an account, a key or a live domain. Each says what it
 * needs and who can do it, because "blocked" without that is just a to-do
 * nobody can action.
 */
const BLOCKED = [
  ['Apple Developer account + App ID', 'app.rounds.client must be registered; TEAMID then replaces the placeholder in apple-app-site-association'],
  ['App Store Connect app record', 'needed before any build can be uploaded, and before the 17+ rating can be set'],
  ['APNs auth key (.p8)', 'APNS_KEY_ID, APNS_TEAM_ID and APNS_PRIVATE_KEY — without these the Live Activity fan-out cannot send'],
  ['Play Console app + signing', 'assetlinks.json needs the upload key AND the Play App Signing fingerprint; both placeholders are still in the file'],
  ['FCM server key', 'Android push delivery'],
  ['specialUse demo video', 'Play requires a recording of the ongoing notification and its two actions'],
  ['Live rounds.app domain', 'both .well-known files must be served over HTTPS, the AASA as application/json with no extension'],
  ['Support and marketing URLs', 'both are required fields in App Store Connect'],
  ['Demo account on a real project', 'demo@rounds.app / 123456 must work on a clean install against the production database'],
  ['Legal review', 'the [DRAFT] markers in src/content/legal.ts must be settled by counsel — this is the one that cannot be worked around'],
  ['Screenshots on real devices', 'scripts/store-shots.mjs renders the six from the web build at store dimensions; final ones should come from a device'],
];

console.log('\nBLOCKED — needs a developer account, a key, or a live domain\n');
for (const [what, why] of BLOCKED) console.log(`  ..    ${pad(what, 40)}${why}`);

console.log(
  `\n${results.length - failed}/${results.length} checked, ${BLOCKED.length} blocked on accounts.\n`
);

process.exit(failed > 0 ? 1 : 0);
