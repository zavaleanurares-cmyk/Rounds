#!/usr/bin/env node
/**
 * Renders the six store screenshots from the web build.
 *
 * These are for the listing draft and for reviewing the framing — the final
 * ones should come off real devices, because a web render is not the same
 * pixels and Apple will notice a status bar that is not iOS's. What this buys
 * is that the six are always current: change a screen and re-run, rather than
 * shipping a listing that shows an interface from two months ago.
 *
 * Sizes are the ones both stores actually require:
 *   6.9" iPhone   1320 x 2868   (App Store, required)     440 x 956 @3x
 *   6.5" iPhone   1242 x 2688   (App Store, required)     414 x 896 @3x
 *   Play phone    1080 x 1920                             360 x 640 @3x
 *
 *   node scripts/store-shots.mjs [baseUrl]
 * Expects the web export to be served (npx expo export --platform web && npx serve -s dist).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = 'store/screenshots';

/** The six, in the order the listing shows them. The first two decide it. */
const SHOTS = [
  // Needs a night actually running, or this shows the idle state and the pace
  // ring — the thing the listing is selling — never appears.
  { name: '1-tonight-live', route: '/tonight', caption: 'Tonight · live', needsLiveNight: true },
  { name: '2-log-sheet', route: '/log', caption: 'One tap to log' },
  { name: '3-morning-after', route: '/nights', caption: 'The morning after' },
  { name: '4-get-home-safe', route: '/safety', caption: 'Get home safe' },
  { name: '5-you', route: '/you', caption: 'Where it went' },
  { name: '6-circle', route: '/circle', caption: 'Out right now' },
];

/**
 * The store sizes, expressed as the DEVICE's own logical viewport and scale
 * rather than as a pixel target.
 *
 * This matters more than it looks. Laying out at 402pt and scaling by 3.28 to
 * reach 1320px gives 2867 rather than 2868 — a rounding error that both stores
 * reject outright — and it also renders a layout no real device ever shows.
 * Using each device's actual points and its actual @3x factor makes the
 * arithmetic exact AND makes the screenshot honest.
 */
const SIZES = [
  { id: 'ios-6.9', css: { width: 440, height: 956 }, scale: 3 },  // 1320 x 2868
  { id: 'ios-6.5', css: { width: 414, height: 896 }, scale: 3 },  // 1242 x 2688
  { id: 'android', css: { width: 360, height: 640 }, scale: 3 },  // 1080 x 1920
];

/**
 * Seeds a signed-in account with history, so no screenshot is of an empty
 * state. A store listing showing "Nothing to show yet" is a listing nobody
 * downloads.
 */
const seed = () => {
  localStorage.setItem(
    'rounds.auth.v1',
    JSON.stringify({
      status: 'signed_in', userId: 'me', email: 'demo@rounds.app', pendingEmail: null,
      pendingHref: null, ageVerified: true, underageBlocked: false,
    })
  );
  localStorage.setItem(
    'rounds.profile.v1',
    JSON.stringify({
      id: 'me', displayName: 'Rareș Z', username: 'raresz', avatarUrl: null, level: 6,
      unitSystem: 'EU', currency: 'RON', weightKg: 78, sex: 'male', dob: '1996-03-11',
      region: 'RO', onboarded: true, privateAccount: false, defaultVisibility: 'friends',
      bio: 'Out most Fridays. Home before two, usually.', avatarTint: 2,
      homeCity: 'Bucharest', signatureDrinkId: 'negroni',
      modules: { nicotine: false, social: true }, intent: ['social'], createdAt: Date.now(),
    })
  );
  localStorage.setItem('rounds.wants-demo', '1');
};

/**
 * Starts a night and logs a few drinks, so the pace ring has something to show.
 * Idempotent: if a night is already running, starting again is a no-op.
 */
async function startNight(page) {
  await page.goto(BASE + '/session/start');
  await page.waitForTimeout(1500);
  await page.getByText('Start', { exact: true }).click({ force: true });
  await page.waitForTimeout(1600);

  for (let i = 0; i < 3; i++) {
    await page.goto(BASE + '/log');
    await page.waitForTimeout(1200);
    // "Same again" is the first chip once there is any history, and the seed
    // above gives the account fourteen weeks of it. Naming a specific drink
    // here would break the moment the demo data changed.
    await page.getByRole('button', { name: /^Same again/ }).first().click({ force: true });
    await page.waitForTimeout(1100);
  }

  // Assert rather than hope. The hero screenshot is the pace ring with a night
  // running; if the logs did not land it silently becomes "nothing logged yet",
  // which is the one frame this listing cannot afford to lead with.
  const live = await page.evaluate(() => {
    const sessions = JSON.parse(localStorage.getItem('rounds.sessions.v1') || '[]');
    const logs = JSON.parse(localStorage.getItem('rounds.logs.v1') || '[]');
    const open = sessions.find((s) => s.endedAt === null);
    return { open: Boolean(open), inSession: open ? logs.filter((l) => l.sessionId === open.id && !l.deleted).length : 0 };
  });
  if (!live.open) throw new Error('no live night after starting one');
  if (live.inSession < 3) {
    throw new Error(`the live night has ${live.inSession} drinks; the hero shot needs the pace ring populated`);
  }
}

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let count = 0;

for (const size of SIZES) {
  const page = await browser.newPage({ viewport: size.css, deviceScaleFactor: size.scale });

  await page.goto(BASE);
  await page.evaluate(seed);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  for (const shot of SHOTS) {
    if (shot.needsLiveNight) await startNight(page);
    await page.goto(BASE + shot.route);
    await page.waitForTimeout(1800);

    /**
     * The listing is an outward-facing surface and the same rule applies to it
     * as to a share card: no ‰ figure, ever. This is checked rather than
     * remembered because the failure is silent — a screenshot with a number on
     * it looks fine until somebody at Apple reads it as a claim.
     */
    const text = await page.locator('body').innerText();
    if (/‰/.test(text) || /Estimate ≈/.test(text)) {
      throw new Error(
        `${shot.name} shows the ‰ estimate. It is opt-in and off by default, so this means ` +
          'the seed turned it on or a screen started rendering it unconditionally. Fix that ' +
          'rather than cropping the screenshot.'
      );
    }
    // A store screenshot of an empty state is a listing nobody downloads.
    if (/Nothing to show yet|Nothing here yet/.test(text)) {
      console.warn(`  warning: ${size.id}-${shot.name} is an empty state`);
    }

    await page.screenshot({ path: `${OUT}/${size.id}-${shot.name}.png` });
    count++;
  }
  await page.close();
}

await browser.close();
console.log(`${count} screenshots written to ${OUT}/`);
console.log('For submission, retake these on real devices — a web render is close, not identical.');
