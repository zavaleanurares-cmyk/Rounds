import { chromium } from 'playwright';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Every route file under app/, as a URL. */
function routes(dir = 'app', prefix = '') {
  const out = [];
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) {
      out.push(...routes(full, `${prefix}/${e.replace(/^\(.*\)$/, '')}`));
    } else if (e.endsWith('.tsx') && !e.startsWith('_') && !e.startsWith('+')) {
      const name = e.replace(/\.tsx$/, '');
      const path = `${prefix}/${name === 'index' ? '' : name}`.replace(/\/+/g, '/');
      out.push(path.replace(/\/$/, '') || '/');
    }
  }
  return out;
}

const all = [...new Set(routes())]
  // Dynamic segments need a real id; substitute a plausible one so the screen
  // renders its "not found" state rather than crashing on a missing param.
  .map((r) => r.replace(/\[\w+\]/g, 'x'))
  .filter((r) => !r.startsWith('/dev'));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const problems = [];
page.on('pageerror', (e) => problems.push(`  page error: ${String(e).split('\n')[0]}`));
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`  console: ${m.text().slice(0, 160)}`);
});

let checked = 0;
for (const route of all) {
  problems.length = 0;
  await page.goto(`http://localhost:8099${route}`, { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForTimeout(220);
  const text = (await page.innerText('body').catch(() => '')).trim();
  checked += 1;
  const blank = text.length < 2;
  if (problems.length || blank) {
    console.log(`FAIL ${route}${blank ? '  (rendered nothing)' : ''}`);
    problems.slice(0, 2).forEach((p) => console.log(p));
  }
}
console.log(`\n${checked} routes checked`);
await browser.close();
