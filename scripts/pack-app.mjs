#!/usr/bin/env node
/**
 * Packs the whole web export into ONE self-contained HTML document.
 *
 * The point is a link somebody can open on a phone and actually use — not a
 * screenshot of the app, and not a dev server they have to run. Everything the
 * bundle needs goes inline: the JavaScript, the font, the ten sound cues and
 * the handful of navigation icons, each as a data URI, because the page that
 * hosts this has no server behind it and cannot fetch a sibling file.
 *
 *   npm run web:export && node scripts/pack-app.mjs   →  /tmp/rounds-app.html
 *
 * Output is the app alone. `scripts/build-tester.mjs` is what wraps it in a
 * phone.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
if (!existsSync(DIST)) {
  console.error('No dist/. Run `npx expo export --platform web` first.');
  process.exit(1);
}

const MIME = {
  '.js': 'text/javascript', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav', '.ico': 'image/x-icon', '.json': 'application/json',
};

/** Every file under dist/assets, keyed by the URL the bundle asks for. */
function assetMap() {
  const map = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else map.set('/' + full.slice(DIST.length + 1), full);
    }
  };
  walk(join(DIST, 'assets'));
  return map;
}

const dataUri = (file) => {
  const mime = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
  return `data:${mime};base64,${readFileSync(file).toString('base64')}`;
};

const html = readFileSync(join(DIST, 'index.html'), 'utf8');

/* The bundle, and any second chunk the export split out. */
const scripts = [...html.matchAll(/<script src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
if (scripts.length === 0) {
  console.error('No <script src> found in dist/index.html — export shape changed.');
  process.exit(1);
}

const assets = assetMap();
let inlinedAssets = 0;

let js = scripts
  .map((src) => readFileSync(join(DIST, src.replace(/^\//, '')), 'utf8'))
  .join('\n;\n');

/**
 * Asset paths appear in the bundle as ordinary string literals, so swapping
 * them for data URIs is a string replace. Longest first: one asset's path can
 * be a prefix of another's (`icon.png` and `icon@2x.png`), and replacing the
 * short one first would corrupt the long one.
 */
for (const url of [...assets.keys()].sort((a, b) => b.length - a.length)) {
  const needle = JSON.stringify(url);
  if (!js.includes(needle)) continue;
  js = js.split(needle).join(JSON.stringify(dataUri(assets.get(url))));
  inlinedAssets += 1;
}

const leftovers = [...js.matchAll(/"\/assets\/[^"]+"/g)].map((m) => m[0]);
if (leftovers.length) {
  console.warn(`  warning: ${leftovers.length} asset reference(s) not inlined:`);
  [...new Set(leftovers)].slice(0, 5).forEach((l) => console.warn(`    ${l}`));
}

/**
 * `</script>` anywhere inside the bundle would close the tag early. Splitting
 * the literal is the standard escape and changes nothing at runtime.
 */
js = js.split('</script>').join('<\\/script>');

const reset = html.match(/<style id="expo-reset">([\s\S]*?)<\/style>/)?.[1] ?? '';

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">
<meta name="theme-color" content="#06070B">
<title>ROUNDS</title>
<style>${reset}
  html, body { background: #06070B; margin: 0; }
</style>
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>`;

writeFileSync('/tmp/rounds-app.html', out);
console.log(
  `packed ${scripts.length} script(s) + ${inlinedAssets} asset(s) → /tmp/rounds-app.html ` +
  `(${(Buffer.byteLength(out) / 1048576).toFixed(1)} MB)`
);
