#!/usr/bin/env node
/**
 * Does the generated Xcode project actually contain the widget extension?
 *
 * A document that tells you to check something is weaker than a command that
 * checks it, and this is the check for the failure this repository already had:
 * `withRoundsNative.js` described a target in a property nothing read, every
 * prebuild produced a project with one native target, and the JS suite, the
 * typecheck, `store:check` and every Linux CI job passed anyway.
 *
 * The trap is one step further in. A widget extension that is created but never
 * *embedded* produces a perfectly green build and an installed app with no
 * widgets in it, so the assertion that matters is not "the target exists" but
 * "the app target has a copy-files phase with dstSubfolderSpec 13 and the
 * .appex is in it". 13 is PlugIns. The phase's *name* is decoration — Xcode
 * calls it "Embed App Extensions", the `xcode` package calls it "Copy Files" —
 * so this asserts the number.
 *
 * Runs on Linux, in seconds, with no Xcode and no Apple Developer account:
 *
 *   npx expo prebuild --platform ios --no-install --clean
 *   node scripts/verify-ios-target.mjs
 *
 * The macOS `ios / widgets` job then proves the same thing the expensive way,
 * against the built product. This exists so the cheap check fails first, and
 * says which part is missing rather than "no PlugIns directory".
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const xcode = require('xcode');
const { WIDGET_EXTENSION } = require('../modules/rounds-native/plugin/withRoundsNative.js');

const PROJECT = 'ios/ROUNDS.xcodeproj/project.pbxproj';
const failures = [];
const fail = (what) => failures.push(what);
const unquote = (v) => (typeof v === 'string' ? v.replace(/^"|"$/g, '') : v);

if (!existsSync(PROJECT)) {
  console.error(
    `${PROJECT} does not exist. Run: npx expo prebuild --platform ios --no-install --clean`
  );
  process.exit(2);
}

const proj = xcode.project(PROJECT).parseSync();
const objects = proj.hash.project.objects;
const name = WIDGET_EXTENSION.name;

/* ---------------------------------------------------------------- targets */

const targets = Object.entries(proj.pbxNativeTargetSection())
  .filter(([key, t]) => !key.endsWith('_comment') && t.name)
  .map(([key, t]) => ({ key, name: unquote(t.name), target: t }));

const ext = targets.find((t) => t.name === name);
const app = targets.find((t) => t.name !== name);

if (!ext) {
  fail(
    `no native target named ${name}. The Live Activity, the three widget families and the ` +
      'Control Center control are not in this project — see docs/ios-widget-target.md.'
  );
}
if (!app) fail('no app target in the project at all.');
if (targets.length !== 2) {
  fail(`expected exactly 2 native targets (the app and ${name}), found ${targets.length}: ` +
    targets.map((t) => t.name).join(', '));
}

if (ext) {
  if (unquote(ext.target.productType) !== 'com.apple.product-type.app-extension') {
    fail(`${name} is typed ${unquote(ext.target.productType)}, not com.apple.product-type.app-extension.`);
  }

  /* ------------------------------------------------- the embed, which is the point */

  const productRef = ext.target.productReference;
  const product = unquote(objects.PBXFileReference?.[productRef]?.path ?? '');
  if (product !== `${name}.appex`) {
    fail(`${name}'s product is "${product}", not ${name}.appex.`);
  }

  if (app) {
    const phases = (app.target.buildPhases ?? []).map((p) => p.value);
    const copyPhases = phases
      .map((uuid) => ({ uuid, phase: objects.PBXCopyFilesBuildPhase?.[uuid] }))
      .filter((p) => p.phase);

    const embed = copyPhases.find((p) => String(p.phase.dstSubfolderSpec) === '13');
    if (!embed) {
      fail(
        'the app target has no copy-files phase with dstSubfolderSpec 13 (PlugIns). ' +
          'The extension would build and never be embedded: a green build, and an ' +
          'installed app with no widgets.'
      );
    } else {
      const embedded = (embed.phase.files ?? []).map((f) => {
        const buildFile = objects.PBXBuildFile?.[f.value];
        return unquote(objects.PBXFileReference?.[buildFile?.fileRef]?.path ?? '');
      });
      if (!embedded.includes(`${name}.appex`)) {
        fail(
          `the PlugIns copy-files phase does not contain ${name}.appex (it has: ` +
            `${embedded.join(', ') || 'nothing'}).`
        );
      }
    }

    /* ------------------------------------------------------------ dependency */

    const dependsOnExt = (app.target.dependencies ?? []).some((d) => {
      const dep = objects.PBXTargetDependency?.[d.value];
      return dep && dep.target === ext.key;
    });
    if (!dependsOnExt) {
      fail(`the app target does not depend on ${name}, so building the app need not build it.`);
    }
  }

  /* ---------------------------------------------------------------- sources */

  const sourcesPhaseUuid = (ext.target.buildPhases ?? [])
    .map((p) => p.value)
    .find((uuid) => objects.PBXSourcesBuildPhase?.[uuid]);
  const compiled = (objects.PBXSourcesBuildPhase?.[sourcesPhaseUuid]?.files ?? []).map((f) => {
    const buildFile = objects.PBXBuildFile?.[f.value];
    const filePath = unquote(objects.PBXFileReference?.[buildFile?.fileRef]?.path ?? '');
    return filePath.split('/').pop();
  });

  for (const source of WIDGET_EXTENSION.sources) {
    if (!compiled.includes(source)) fail(`${name} does not compile ${source}.`);
  }

  /**
   * And each of those references points at a file that is really there.
   *
   * A reference resolves the way Xcode resolves it: a `"<group>"` file is its
   * own path with the path of every group above it in front. Comparing
   * basenames — which is all this script used to do — cannot see the difference
   * between `RoundsWidgets/x.swift` inside a group with no path and the same
   * reference inside a group whose path is already `RoundsWidgets`. The second
   * resolves to ios/RoundsWidgets/RoundsWidgets/x.swift, which does not exist,
   * and the build fails with "Build input files cannot be found" after five
   * minutes of compiling everything else first.
   */
  const parentOf = new Map();
  for (const [key, group] of Object.entries(objects.PBXGroup ?? {})) {
    if (key.endsWith('_comment')) continue;
    for (const child of group.children ?? []) parentOf.set(child.value, key);
  }
  const resolveRef = (fileRefUuid) => {
    const ref = objects.PBXFileReference?.[fileRefUuid];
    if (!ref || unquote(ref.sourceTree) !== '<group>') return null;
    const parts = [unquote(ref.path)];
    for (let cursor = parentOf.get(fileRefUuid); cursor; cursor = parentOf.get(cursor)) {
      const groupPath = objects.PBXGroup?.[cursor]?.path;
      if (groupPath) parts.unshift(unquote(groupPath));
    }
    return join('ios', ...parts);
  };

  for (const entryRef of objects.PBXSourcesBuildPhase?.[sourcesPhaseUuid]?.files ?? []) {
    const fileRef = objects.PBXBuildFile?.[entryRef.value]?.fileRef;
    const resolved = resolveRef(fileRef);
    if (resolved && !existsSync(resolved)) {
      fail(
        `${name} compiles ${unquote(objects.PBXFileReference[fileRef].path)}, which resolves to ` +
          `${resolved} — and there is no file there. Xcode reports this as "Build input files ` +
          'cannot be found", at the end of a five-minute build.'
      );
    }
  }
  const extra = compiled.filter((f) => !WIDGET_EXTENSION.sources.includes(f));
  if (extra.length) fail(`${name} compiles files that are not in its source list: ${extra.join(', ')}.`);

  // Without @main the extension has no executable entry point, and the five
  // surfaces are types nothing instantiates.
  const entry = `ios/${name}/RoundsWidgetBundle.swift`;
  if (!existsSync(entry)) {
    fail(`${entry} was not copied into the project.`);
  } else if (!/@main\s+struct \w+: WidgetBundle/.test(readFileSync(entry, 'utf8'))) {
    fail(`${entry} has no @main WidgetBundle.`);
  }

  /* ------------------------------------------------------- frameworks phase */

  const fwPhaseUuid = (ext.target.buildPhases ?? [])
    .map((p) => p.value)
    .find((uuid) => objects.PBXFrameworksBuildPhase?.[uuid]);
  const linked = (objects.PBXFrameworksBuildPhase?.[fwPhaseUuid]?.files ?? []).map((f) => {
    const buildFile = objects.PBXBuildFile?.[f.value];
    return unquote(objects.PBXFileReference?.[buildFile?.fileRef]?.path ?? '').split('/').pop();
  });
  for (const framework of WIDGET_EXTENSION.frameworks) {
    if (!linked.includes(`${framework}.framework`)) fail(`${name} does not link ${framework}.`);
  }

  /* --------------------------------------------------------- build settings */

  const lists = proj.pbxXCConfigurationList();
  const configurations = proj.pbxXCBuildConfigurationSection();
  const listKey = ext.target.buildConfigurationList;
  const configs = (lists?.[listKey]?.buildConfigurations ?? [])
    .map((c) => configurations[c.value])
    .filter(Boolean);

  if (!configs.length) fail(`${name} has no build configurations.`);

  const expected = {
    IPHONEOS_DEPLOYMENT_TARGET: WIDGET_EXTENSION.deploymentTarget,
    PRODUCT_BUNDLE_IDENTIFIER: `app.rounds.client${WIDGET_EXTENSION.bundleIdSuffix}`,
    INFOPLIST_FILE: `${name}/Info.plist`,
    CODE_SIGN_ENTITLEMENTS: `${name}/${name}.entitlements`,
    SKIP_INSTALL: 'YES',
  };
  for (const config of configs) {
    for (const [key, want] of Object.entries(expected)) {
      const got = unquote(config.buildSettings?.[key]);
      if (String(got) !== String(want)) {
        fail(`${name} ${config.name}: ${key} is ${got ?? 'unset'}, expected ${want}.`);
      }
    }
  }
}

/* --------------------------------------------------- the files on disk */

const plistPath = `ios/${name}/Info.plist`;
if (!existsSync(plistPath)) {
  fail(`${plistPath} is missing.`);
} else if (!readFileSync(plistPath, 'utf8').includes('com.apple.widgetkit-extension')) {
  fail(`${plistPath} does not declare NSExtensionPointIdentifier com.apple.widgetkit-extension.`);
}

const entitlementsPath = `ios/${name}/${name}.entitlements`;
const appGroup = WIDGET_EXTENSION.entitlements['com.apple.security.application-groups'][0];
if (!existsSync(entitlementsPath)) {
  fail(`${entitlementsPath} is missing.`);
} else if (!readFileSync(entitlementsPath, 'utf8').includes(appGroup)) {
  fail(`${entitlementsPath} does not entitle ${appGroup} — the surfaces would have nowhere to write.`);
}

/* -------------------------------------------------------------------- out */

if (failures.length) {
  console.error(`\nThe iOS widget extension target is not right (${failures.length}):\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error('\ndocs/ios-widget-target.md has the contract.\n');
  process.exit(1);
}

console.log(`${name}: target, ${WIDGET_EXTENSION.sources.length} sources, ` +
  `${WIDGET_EXTENSION.frameworks.length} frameworks, dependency and PlugIns embed — all present.`);
