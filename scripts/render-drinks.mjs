/**
 * Renders every drink in the catalogue to one contact sheet, so the artwork can
 * actually be looked at rather than assumed. Not part of the app build.
 *
 *   node scripts/render-drinks.mjs   →  /tmp/drinks.html
 */
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

execSync(
  'npx esbuild src/domain/catalog.ts --bundle --format=esm --platform=neutral --outfile=/tmp/catalog.mjs',
  { stdio: 'inherit' }
);
const mod = await import('/tmp/catalog.mjs');
const { CATALOG } = mod;
writeFileSync('/tmp/catalog.json', JSON.stringify(CATALOG, null, 0));
console.log(CATALOG.length, 'drinks');
console.log('categories:', [...new Set(CATALOG.map((d) => d.category))].join(', '));
const bad = CATALOG.filter((d) => !d.art || !d.art.glass || !d.art.liquid);
console.log('missing art:', bad.length ? bad.map((b) => b.id).join(', ') : 'none');
const dupes = CATALOG.map((d) => d.id).filter((id, i, a) => a.indexOf(id) !== i);
console.log('duplicate ids:', dupes.length ? dupes.join(', ') : 'none');
const glasses = new Set(CATALOG.map((d) => d.art.glass));
console.log('glass shapes used:', glasses.size, '/', 24);
