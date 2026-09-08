/**
 * Emits the public site — home, privacy, terms — from src/content/legal.ts.
 *
 * Google's OAuth consent screen requires three links on a domain you own: an
 * app homepage, a privacy policy and terms of service, each a real HTML page
 * (not a PDF, not an iframe), with the policy linked prominently from the home
 * page. This produces all three.
 *
 * Generated rather than hand-written for the same reason tokens/ is: the app
 * already renders these documents from `src/content/legal.ts`, and a legal text
 * that exists in two places will eventually disagree with itself. A privacy
 * policy that contradicts the one in the app is worse than not having one.
 *
 *   node scripts/build-legal.mjs                 # refuses while [DRAFT] remains
 *   node scripts/build-legal.mjs --allow-draft   # builds anyway, brackets marked
 *
 * The refusal is the point. Every unresolved bracket is a fact only a person
 * can supply, and publishing "[DRAFT — registered address]" to the open web
 * fails Google's "clearly associated with your application, not a template"
 * requirement — besides being read by users.
 */
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ALLOW_DRAFT = process.argv.includes('--allow-draft');
const OUT = 'site';

/* ---------------------------------------------------------------- content */

const bundle = (entry) =>
  execSync(`npx esbuild ${entry} --bundle --format=esm --platform=neutral`, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

const load = async (entry) =>
  import('data:text/javascript;base64,' + Buffer.from(bundle(entry)).toString('base64'));

const { legalDoc, LEGAL_UPDATED_AT } = await load('src/content/legal.ts');
const { color } = await load('src/design/tokens.ts');

const privacy = legalDoc('privacy', 'en');
const terms = legalDoc('terms', 'en');

/* ------------------------------------------------------------------ drafts */

const brackets = (doc) =>
  doc.sections.flatMap((s) =>
    (s.body.match(/\[DRAFT[^\]]*\]/g) ?? []).map((m) => ({ heading: s.heading, marker: m }))
  );

const unresolved = [...brackets(privacy), ...brackets(terms)];

/* -------------------------------------------------------------------- html */

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Unresolved brackets are made impossible to miss rather than quietly pretty. */
const withMarkers = (body) =>
  esc(body).replace(/\[DRAFT[^\]]*\]/g, (m) => `<mark class="draft">${m}</mark>`);

const updated = new Date(LEGAL_UPDATED_AT).toLocaleDateString('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const CSS = `
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:${color.bg.primary};color:${color.label.primary};
  font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  -webkit-font-smoothing:antialiased}
.wrap{max-width:44rem;margin:0 auto;padding:3rem 1.5rem 6rem}
header{display:flex;align-items:center;gap:.85rem;margin-bottom:3.5rem}
header img{width:44px;height:44px;border-radius:12px}
header b{font-size:1.05rem;letter-spacing:.02em}
h1{font-size:2rem;line-height:1.2;margin:0 0 .4rem;letter-spacing:-.02em}
.updated{color:${color.label.tertiary};font-size:.875rem;margin:0 0 3rem}
h2{font-size:1.0625rem;margin:2.75rem 0 .6rem;letter-spacing:-.01em}
p{margin:0 0 1rem;color:${color.label.secondary}}
a{color:${color.brand.primary}}
nav{margin-top:4rem;padding-top:1.5rem;border-top:1px solid ${color.separator};
  font-size:.875rem;display:flex;gap:1.25rem;flex-wrap:wrap}
nav a{color:${color.label.tertiary};text-decoration:none}
nav a:hover{color:${color.label.primary}}
.draft{background:#F59E0B;color:#000;padding:.05em .3em;border-radius:3px;font-weight:600}
.lede{font-size:1.25rem;line-height:1.5;color:${color.label.primary};margin:0 0 1.5rem}
.hero{margin:0 0 3rem}
.hero h1{font-size:2.5rem;margin-bottom:1.25rem}
.card{border:1px solid ${color.separator};border-radius:14px;padding:1.25rem 1.4rem;margin:0 0 1rem}
.card h3{margin:0 0 .35rem;font-size:1rem}
.card p{margin:0;font-size:.9375rem}
.note{color:${color.label.secondary};font-size:.875rem;margin-top:2rem}
`;

const page = (title, bodyHtml, { nav = true } = {}) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · ROUNDS</title>
<link rel="icon" href="icon-120.png">
<style>${CSS}</style>
</head>
<body>
<div class="wrap">
<header><img src="icon-120.png" alt=""><b>ROUNDS</b></header>
${bodyHtml}
${
  nav
    ? `<nav>
  <a href="index.html">Home</a>
  <a href="privacy.html">Privacy Policy</a>
  <a href="terms.html">Terms of Service</a>
  <a href="mailto:privacy@rounds.app">privacy@rounds.app</a>
</nav>`
    : ''
}
</div>
</body>
</html>
`;

const legalPage = (doc) =>
  page(
    doc.title,
    `<h1>${esc(doc.title)}</h1>
<p class="updated">Last updated ${esc(updated)}</p>
${doc.sections
  .map((s) => `<h2>${esc(s.heading)}</h2>\n<p>${withMarkers(s.body)}</p>`)
  .join('\n')}`
  );

/**
 * The home page exists because Google requires one and requires the policy to
 * be reachable from it. It says what the app is and nothing it cannot support:
 * no store badges while it is not in a store, no download button that does not
 * download, and no figure anywhere — the pace estimate is a state, never a
 * number, and that rule holds in marketing exactly as it holds in the app.
 */
const home = page(
  'ROUNDS',
  `<div class="hero">
<h1>Keep your pace. Get home.</h1>
<p class="lede">ROUNDS keeps track of how the night is going, helps your group
stay together, and gets you home. The next morning it shows you what happened.</p>
</div>

<div class="card">
  <h3>It tells you how you are doing, not a number</h3>
  <p>The pace estimate is a state — steady, easing off, slow down — never a
  reading to act on. It is worked out on your phone and never leaves it.</p>
</div>
<div class="card">
  <h3>Safety is free, always</h3>
  <p>Getting home, trusted contacts and the safe-arrival check are free forever
  and never sit behind a paywall, during a night or at any other time.</p>
</div>
<div class="card">
  <h3>No feed, no leaderboard</h3>
  <p>Nothing about your drinking is shared unless you share it, and there is
  nothing in ROUNDS that rewards drinking more.</p>
</div>

<h2>Contact</h2>
<p>General: <a href="mailto:hello@rounds.app">hello@rounds.app</a><br>
Privacy and data requests: <a href="mailto:privacy@rounds.app">privacy@rounds.app</a></p>

<h2>Legal</h2>
<p><a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms of Service</a></p>

<p class="note">ROUNDS is not a medical device and not a breathalyser. It cannot
tell you whether you are fit to drive. If you have been drinking, do not drive.</p>`
);

/* ------------------------------------------------------------------- write */

if (unresolved.length && !ALLOW_DRAFT) {
  console.error(`\n${unresolved.length} unresolved [DRAFT] marker(s). Not written.\n`);
  for (const { heading, marker } of unresolved) {
    console.error(`  ${heading}\n    ${marker}\n`);
  }
  console.error('Fill them in src/content/legal.ts (and the three translations),');
  console.error('or pass --allow-draft to build a marked-up copy for counsel.\n');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/index.html`, home);
writeFileSync(`${OUT}/privacy.html`, legalPage(privacy));
writeFileSync(`${OUT}/terms.html`, legalPage(terms));
if (existsSync('assets/icon-120.png')) copyFileSync('assets/icon-120.png', `${OUT}/icon-120.png`);

console.log(`Wrote ${OUT}/index.html, ${OUT}/privacy.html, ${OUT}/terms.html, ${OUT}/icon-120.png`);
if (unresolved.length) {
  console.log(`\n⚠  ${unresolved.length} [DRAFT] marker(s) rendered in place — NOT for publication.`);
}
