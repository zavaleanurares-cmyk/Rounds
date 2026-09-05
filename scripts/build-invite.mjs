#!/usr/bin/env node
/**
 * Substitutes the invite page's static-fallback configuration.
 *
 * `public/n.html` is rendered two ways. The edge function fills its `{{TITLE}}`
 * and `{{OG_*}}` markers per request, which is what a link preview in a group
 * chat needs — a crawler does not run JavaScript. Served as a plain static file
 * instead, the page asks the same RPC from the browser, and for that it needs
 * the project URL and the anon key.
 *
 * It used to read `document.body.dataset.api` from a `<body>` that had no such
 * attribute and nothing that set one, so the fallback the file documented could
 * not run. This is the missing half.
 *
 * The anon key is public by design — it is shipped in every copy of the app and
 * grants exactly what RLS allows, which for this page is one function returning
 * a title, a time, a venue and a count. It is not a secret being leaked; it is
 * the same key the client bundle already carries.
 *
 *   node scripts/build-invite.mjs [outDir]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const SOURCE = 'public/n.html';
const outDir = process.argv[2] ?? 'dist';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const html = readFileSync(SOURCE, 'utf8')
  .replaceAll('{{SUPABASE_URL}}', url)
  .replaceAll('{{SUPABASE_ANON_KEY}}', key);

const target = join(outDir, 'n.html');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, html);

if (!url || !key) {
  // Not a failure: a build with no backend configured produces a page that
  // shows the neutral copy, which is the honest thing for it to show.
  console.log(`build-invite: wrote ${target} with no backend configured`);
} else {
  console.log(`build-invite: wrote ${target}`);
}
