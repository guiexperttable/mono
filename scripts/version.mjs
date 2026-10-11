#!/usr/bin/env node
/**
 * One version scheme for the whole mono repo (replaces the per-package patch.js scripts and ../package.js).
 *
 *   node scripts/version.mjs check     list all versions, report mismatches (default)
 *   node scripts/version.mjs sync      propagate the core version to all packages
 *   node scripts/version.mjs patch     bump core patch (1.1.84 -> 1.1.85) and propagate
 *   node scripts/version.mjs minor     bump core minor (1.1.84 -> 1.2.0) and propagate
 *
 * Rules (core = packages/table):
 *   - framework wrappers keep their framework major and take minor.patch from the core
 *       @guiexpert/react-table 18.x.y, preact 10.x.y, solid 1.x.y, svelte 5.x.y (runs on Svelte 4 and 5), vue3 3.x.y, webcomponent 1.x.y
 *       angular-builds/ngNN (+ lib/package.json = @guiexpert/angular-table)  NN.x.y
 *   - everything else (core, demo-table-models, apps, root) gets the full core version.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cmd = process.argv[2] ?? "check";

const WRAPPER_MAJORS = {
  "@guiexpert/react-table": 18,
  "@guiexpert/preact-table": 10,
  "@guiexpert/solid-table": 1,
  "@guiexpert/svelte-table": 5,
  "@guiexpert/vue3-table": 3,
  "@guiexpert/webcomponent-table": 1
};

function listPackageFiles() {
  const files = [join(root, "package.json")];
  for (const dir of ["packages", "apps"]) {
    for (const d of readdirSync(join(root, dir))) {
      const f = join(root, dir, d, "package.json");
      if (existsSync(f)) files.push(f);
    }
  }
  for (const d of readdirSync(join(root, "angular-builds")).filter(n => /^ng\d+$/.test(n))) {
    files.push(join(root, "angular-builds", d, "package.json"));
    files.push(join(root, "angular-builds", d, "lib", "package.json"));
  }
  return files;
}

function majorFor(file, pkg) {
  const m = relative(root, file).match(/^angular-builds\/ng(\d+)\//);
  if (m) return Number(m[1]);
  return WRAPPER_MAJORS[pkg.name];
}

const corePath = join(root, "packages/table/package.json");
let coreVersion = JSON.parse(readFileSync(corePath, "utf8")).version;
let [cMajor, cMinor, cPatch] = coreVersion.split(".").map(Number);

if (cmd === "patch") cPatch++;
else if (cmd === "minor") { cMinor++; cPatch = 0; }
else if (!["check", "sync"].includes(cmd)) {
  console.error("Usage: node scripts/version.mjs [check|sync|patch|minor]");
  process.exit(1);
}
coreVersion = `${cMajor}.${cMinor}.${cPatch}`;

let mismatches = 0;
for (const file of listPackageFiles()) {
  const raw = readFileSync(file, "utf8");
  const pkg = JSON.parse(raw);
  const major = majorFor(file, pkg);
  const expected = major === undefined ? coreVersion : `${major}.${cMinor}.${cPatch}`;
  const rel = relative(root, file);
  // published Angular manifests (angular-builds/ngNN/lib/package.json) pin the core as a plain semver range
  const corePeer = pkg.peerDependencies?.["@guiexpert/table"];
  const expectedPeer = `^${coreVersion}`;
  const peerOk = corePeer === undefined || corePeer.startsWith("workspace:") || corePeer === expectedPeer;
  if (pkg.version === expected && peerOk) {
    if (cmd === "check") console.log(`  ok   ${expected.padEnd(9)} ${rel}`);
    continue;
  }
  if (cmd === "check") {
    mismatches++;
    const peerInfo = peerOk ? "" : `, peer @guiexpert/table ${corePeer} (expected ${expectedPeer})`;
    console.log(`  DIFF ${String(pkg.version).padEnd(9)} ${rel}  (expected ${expected}${peerInfo})`);
  } else {
    // replace only the first "version" field to keep the file formatting intact
    let out = raw.replace(/("version"\s*:\s*")[^"]*(")/, `$1${expected}$2`);
    if (!peerOk) out = out.replace(/("@guiexpert\/table"\s*:\s*")[^"]*(")/, `$1${expectedPeer}$2`);
    writeFileSync(file, out);
    console.log(`  set  ${expected.padEnd(9)} ${rel}${peerOk ? "" : `  (peer @guiexpert/table ${expectedPeer})`}`);
  }
}
if (cmd === "check") {
  console.log(mismatches ? `\n${mismatches} mismatch(es) – run "pnpm version:sync" or "node scripts/version.mjs sync".` : "\nAll versions consistent.");
  process.exitCode = mismatches ? 1 : 0;
}
