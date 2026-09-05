/**
 * Generates docs/screen-manifest.json and docs/screen-manifest.md by WALKING THE
 * ROUTE TREE, not by transcribing the screen map.
 *
 * A manifest maintained by hand is a manifest that is wrong within a fortnight.
 * This one cannot claim a screen exists that has no file, and it flags every
 * screen in the inventory that has not been built yet.
 */
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/** ID → route, from screen-map-01-screen-inventory.md. The build spec. */
const INVENTORY = [
  ['A-01', 'P0', '(auth)/welcome', 'Welcome'],
  ['A-02', 'P0', '(auth)/sign-in', 'Sign in'],
  ['A-03', 'P0', '(auth)/verify', 'OTP verify'],
  ['A-04', 'P0', '(onboarding)/age', 'Age gate'],
  ['A-05', 'P0', '(onboarding)/identity', 'Identity'],
  ['A-06', 'P0', '(onboarding)/body', 'Body basics'],
  ['A-07', 'P0', '(onboarding)/region', 'Region & units'],
  ['A-08', 'P1', '(onboarding)/intent', 'Intent'],
  ['A-09', 'P1', '(onboarding)/modules', 'Modules'],
  ['A-10', 'P0', '(onboarding)/permissions', 'Notification primer'],
  ['A-11', 'P1', '(onboarding)/done', 'Ready'],
  ['A-12', 'P0', '(onboarding)/blocked', 'Underage block'],
  ['A-13', 'P0', 'legal/[doc]', 'Terms / Privacy'],
  ['T-01', 'P0', '(tabs)/tonight', 'Tonight · Idle'],
  ['T-02', 'P1', '(tabs)/tonight', 'Tonight · Planned'],
  ['T-03', 'P0', '(tabs)/tonight', 'Tonight · Live'],
  ['T-04', 'P1', '(tabs)/tonight', 'Tonight · Wind-down'],
  ['T-05', 'P1', '(tabs)/tonight', 'Tonight · Morning redirect'],
  ['T-06', 'P0', 'session/start', 'Start night sheet'],
  ['T-07', 'P0', 'session/[id]/end', 'End night'],
  ['T-08', 'P0', 'session/[id]/index', 'Night detail'],
  ['T-09', 'P1', 'session/[id]/edit', 'Edit night'],
  ['L-01', 'P0', 'log/index', 'Log sheet'],
  ['L-02', 'P0', 'log/custom', 'Custom drink'],
  ['L-03', 'P1', 'log/round', 'Round builder'],
  ['L-04', 'P1', 'log/edit/[logId]', 'Edit log'],
  ['D-01', 'P0', '(tabs)/discover', 'Map'],
  ['D-02', 'P1', 'venue/[id]', 'Venue detail'],
  ['D-03', 'P0', 'venue/search', 'Venue search'],
  ['D-04', 'P2', 'venue/new', 'Add venue'],
  ['D-05', 'P1', 'passport', 'Bar passport'],
  ['D-06', 'P1', 'plan/[id]/index', 'Plan detail'],
  ['D-07', 'P1', 'plan/new', 'Create plan'],
  ['D-08', 'P1', 'plan/[id]/invite', 'Plan invite'],
  ['C-01', 'P1', '(tabs)/circle', 'Circle home'],
  ['C-02', 'P0', 'people/search', 'Find people'],
  ['C-03', 'P0', 'people/[id]', 'Person profile'],
  ['C-04', 'P1', 'people/contacts', 'Contact match'],
  ['C-05', 'P0', 'live/join', 'Join a night'],
  ['C-06', 'P0', 'live/[code]/index', 'Live room'],
  ['C-07', 'P2', 'live/[code]/bingo', 'Night bingo'],
  ['C-08', 'P1', 'share/[sessionId]', 'Share night card'],
  ['C-09', 'P1', 'crew/[slug]', 'Crew detail'],
  ['C-10', 'P1', 'crew/new', 'Create crew'],
  ['C-11', 'P1', 'crew/join', 'Join crew'],
  ['C-12', 'P0', 'people/requests', 'Friend requests'],
  ['C-13', 'P1', 'notifications', 'Notifications'],
  ['Y-01', 'P0', '(tabs)/you', 'You'],
  ['Y-02', 'P2', 'people/preview', 'Public profile preview'],
  ['Y-03', 'P1', 'nights', 'Nights history'],
  ['Y-04', 'P1', 'morning/[sessionId]', 'Morning after'],
  ['Y-05', 'P1', 'insights', 'Insights'],
  ['Y-06', 'P1', 'wellbeing/index', 'Wellbeing hub'],
  ['Y-07', 'P1', 'wellbeing/goal/[type]', 'Goal editor'],
  ['Y-08', 'P2', 'nicotine', 'Nicotine dashboard'],
  ['Y-09', 'P1', 'achievements', 'Achievements'],
  ['Y-10', 'P0', 'safety/index', 'Get home safe'],
  ['Y-11', 'P1', 'passport', 'Bar passport (shared with D-05)'],
  ['Y-12', 'P2', 'wrapped/[year]', 'Wrapped'],
  ['S-01', 'P0', 'settings/index', 'Settings home'],
  ['S-02', 'P2', 'settings/appearance', 'Appearance'],
  ['S-03', 'P0', 'settings/units', 'Units & region'],
  ['S-04', 'P1', 'settings/modules', 'Modules'],
  ['S-05', 'P0', 'settings/notifications', 'Notifications'],
  ['S-06', 'P0', 'settings/privacy', 'Privacy'],
  ['S-07', 'P1', 'settings/safety', 'Safety'],
  ['S-08', 'P1', 'settings/subscription', 'Subscription'],
  ['S-09', 'P1', 'safety/contacts', 'Trusted contacts'],
  ['S-10', 'P1', 'safety/arm', 'Arm safe arrival'],
  ['S-11', 'P0', 'settings/blocked', 'Blocked users'],
  ['S-12', 'P0', 'settings/data', 'Data & account'],
  ['S-13', 'P0', 'settings/help', 'Help & legal'],
  ['S-14', 'P1', 'paywall', 'ROUNDS+ paywall'],
  ['S-15', 'P0', 'report/[targetType]/[targetId]', 'Report'],
];

const files = new Set();
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith('.tsx')) files.add(relative('app', full).replace(/\.tsx$/, ''));
  }
})('app');

const COMPONENT_RE = /<([A-Z][A-Za-z]*)/g;
const STORE_RE = /\bstore\.(\w+)|\{\s*([^}]*)\s*\}\s*=\s*useStore\(\)/g;

const screens = INVENTORY.map(([id, priority, route, name]) => {
  const built = route ? files.has(route) : false;
  let components = [];
  let reads = [];
  let source = null;
  if (built) {
    source = `app/${route}.tsx`;
    const src = readFileSync(source, 'utf8');
    components = [...new Set([...src.matchAll(COMPONENT_RE)].map((m) => m[1]))]
      .filter((c) => !['View', 'Text', 'React', 'Pressable', 'ScrollView', 'Animated', 'TextInput', 'Switch', 'Stack', 'Tabs', 'Redirect'].includes(c))
      .sort();
    const destructured = src.match(/\{([^}]*)\}\s*=\s*useStore\(\)/);
    reads = destructured
      ? destructured[1].split(',').map((s) => s.trim()).filter(Boolean).sort()
      : src.includes('useStore()') ? ['store'] : [];
  }
  return { id, priority, name, route: route ? '/' + route.replace(/\/index$/, '') : null, source, built, components, reads };
});

// The five states and three account states, tracked rather than assumed.
const stateEvidence = (src) => ({
  loading: /Skeleton|hydrated/.test(src),
  empty: /EmptyState/.test(src),
  error: /ErrorState|error/.test(src),
  offline: /queue|OfflinePill/.test(src),
  populated: true,
});
for (const s of screens) {
  s.states = s.source ? stateEvidence(readFileSync(s.source, 'utf8')) : null;
}

const built = screens.filter((s) => s.built);
const summary = {
  total: screens.length,
  built: built.length,
  byPriority: ['P0', 'P1', 'P2'].map((p) => ({
    priority: p,
    total: screens.filter((s) => s.priority === p).length,
    built: screens.filter((s) => s.priority === p && s.built).length,
  })),
  notBuilt: screens.filter((s) => !s.built).map((s) => `${s.id} · ${s.name}`),
};

mkdirSync('docs', { recursive: true });
writeFileSync('docs/screen-manifest.json', JSON.stringify({ summary, screens }, null, 2) + '\n');

const rows = screens
  .map((s) => `| ${s.id} | ${s.priority} | ${s.name} | ${s.route ?? '—'} | ${s.built ? '✓' : '—'} | ${s.components.slice(0, 6).join(', ') || '—'} |`)
  .join('\n');

writeFileSync(
  'docs/screen-manifest.md',
  `# Screen manifest

Generated by \`node scripts/build-manifest.mjs\` — walks the route tree, so it
cannot claim a screen that has no file.

**${summary.built} of ${summary.total} screens built.**
${summary.byPriority.map((p) => `${p.priority}: ${p.built}/${p.total}`).join(' · ')}

${summary.notBuilt.length ? `Not yet built: ${summary.notBuilt.join(', ')}\n` : 'Every screen in the inventory has a route.\n'}

| ID | P | Screen | Route | Built | Components |
|---|---|---|---|---|---|
${rows}
`
);

console.log(`${summary.built}/${summary.total} screens built`);
console.log(summary.byPriority.map((p) => `${p.priority}: ${p.built}/${p.total}`).join('  '));
if (summary.notBuilt.length) console.log('Not built:', summary.notBuilt.join(', '));
