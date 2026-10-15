#!/usr/bin/env node
/**
 * Publishes all npm packages of the mono repo (used by .github/workflows/npm-publish.yml, also usable locally).
 * Does NOT build – run "pnpm build:libs && pnpm build:angular" first.
 *
 *   node scripts/publish.mjs --dry-run                 show what would be published
 *   node scripts/publish.mjs                           publish everything that is not on npm yet
 *   node scripts/publish.mjs --only table,react-table,ng22
 *
 * - Libraries (packages/*): "pnpm pack" (replaces "workspace:^" with the real core version, packs publishConfig.directory)
 *   and "npm publish <tarball>" with dist-tag "latest". The core is published first.
 * - Angular (angular-builds/ngNN/dist): "npm publish <dir>" with dist-tag aNN, "latest" for the newest major.
 * - Versions that already exist on npm are skipped, so a failed run can simply be restarted.
 * - A failed "npm publish" is retried (up to 3 attempts, with a pause) – e.g. TLOG_CREATE_ENTRY_ERROR (409) of the
 *   Sigstore transparency log, which npm reports when its own retry finds the first, already written entry. Each
 *   attempt signs anew, so the retry does not collide. Before a retry the registry is asked whether the version
 *   arrived after all. A package that still fails does not stop the others; the script exits with 1 at the end.
 * - In GitHub Actions the npm CLI (>= 11.5.1) authenticates via OIDC (trusted publishing) and adds provenance.
 *   Locally it uses your npm login (~/.npmrc).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || /^(1|true)$/i.test(process.env.DRY_RUN ?? "");
function argValue(flag) {
  const eq = args.find(a => a.startsWith(flag + "="));
  if (eq) return eq.slice(flag.length + 1);
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] ?? "" : undefined;
}
const only = (argValue("--only") ?? process.env.ONLY ?? "").split(",").map(s => s.trim()).filter(Boolean);

const LIBS = ["table", "demo-table-models", "react-table", "preact-table", "solid-table", "svelte-table", "vue3-table", "webcomponent-table"];
const NG = readdirSync(join(root, "angular-builds")).filter(n => /^ng\d+$/.test(n))
  .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));
const newestNg = NG[NG.length - 1];

for (const o of only) {
  if (!LIBS.includes(o) && !NG.includes(o)) { console.error(`Unknown package in --only: ${o} (valid: ${[...LIBS, ...NG].join(", ")})`); process.exit(1); }
}
const selected = id => only.length === 0 || only.includes(id);

const run = (cmd, cmdArgs, cwd = root) => execFileSync(cmd, cmdArgs, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
const readJson = f => JSON.parse(readFileSync(f, "utf8"));

function isPublished(name, version) {
  try {
    const out = execFileSync("npm", ["view", `${name}@${version}`, "version"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return out.trim() === version;
  } catch {
    return false; // E404: package or version unknown
  }
}

/**
 * GitHub Actions only: verify npm trusted publishing for every selected package BEFORE anything is published.
 * npm itself only logs a failed OIDC token exchange at "verbose" level and then fails with a misleading
 * "E404 Not Found - PUT …". Here we do the same exchange npm does and report the registry's answer per package.
 * The short-lived tokens returned by the registry are discarded and never printed.
 */
async function checkTrustedPublishing(names) {
  if (!process.env.GITHUB_ACTIONS) return;
  const reqUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL, reqToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!reqUrl || !reqToken) {
    throw new Error('No OIDC token available – the workflow needs "permissions: id-token: write".');
  }
  const url = new URL(reqUrl);
  url.searchParams.append("audience", "npm:registry.npmjs.org");
  const idRes = await fetch(url, { headers: { Authorization: `Bearer ${reqToken}`, Accept: "application/json" } });
  const idToken = idRes.ok ? (await idRes.json()).value : undefined;
  if (!idToken) throw new Error(`Could not get an OIDC token from GitHub (HTTP ${idRes.status}).`);
  try {
    const claims = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8"));
    console.log(`OIDC identity: repository=${claims.repository} workflow_ref=${claims.workflow_ref} ref=${claims.ref} environment=${claims.environment ?? "(none)"}`);
  } catch { /* informational only */ }

  const failures = [];
  for (const name of [...new Set(names)]) {
    const res = await fetch(`https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${name.replace("/", "%2f")}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}`, Accept: "application/json" }
    });
    let message = `HTTP ${res.status}`;
    try { const body = await res.json(); if (!res.ok) message += ` – ${body.message ?? body.error ?? JSON.stringify(body)}`; } catch { /* no JSON body */ }
    console.log(`  trusted publishing ${res.ok ? "ok    " : "FAILED"} ${name}${res.ok ? "" : `  (${message})`}`);
    if (!res.ok) failures.push(name);
  }
  if (failures.length) {
    throw new Error(`npm trusted publishing is not set up (correctly) for: ${failures.join(", ")}.\n` +
      `On npmjs.com → package → Settings → Trusted Publisher → GitHub Actions: user "guiexperttable", ` +
      `repository "mono", workflow filename "npm-publish.yml", environment empty. See RELEASING.md.`);
  }
}

const selectedNames = [
  ...LIBS.filter(selected).map(id => readJson(join(root, "packages", id, "package.json")).name),
  ...(NG.some(selected) ? ["@guiexpert/angular-table"] : [])
];
try {
  await checkTrustedPublishing(selectedNames);
} catch (e) {
  console.error(`\n✖ ${e.message}`);
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "ge-publish-"));
const results = [];
const MAX_ATTEMPTS = 3;
const RETRY_PAUSE_MS = 15_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function publish(id, name, version, target, tag, checked = false) {
  if (!checked && isPublished(name, version)) {
    results.push([id, `${name}@${version}`, "already on npm – skipped"]);
    return;
  }
  const npmArgs = ["publish", target, "--access", "public", "--tag", tag];
  if (dryRun) npmArgs.push("--dry-run");
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`\n▶ ${name}@${version} (tag ${tag})${dryRun ? " [dry-run]" : ""}${attempt > 1 ? ` – attempt ${attempt}/${MAX_ATTEMPTS}` : ""}`);
    const { status } = spawnSync("npm", npmArgs, { cwd: root, stdio: "inherit" });
    if (status === 0) {
      results.push([id, `${name}@${version}`, dryRun ? `dry-run ok (tag ${tag})` : `published (tag ${tag})${attempt > 1 ? `, attempt ${attempt}` : ""}`]);
      return;
    }
    if (!dryRun) {
      await sleep(attempt * 5_000); // the registry needs a moment until a new version is visible
      if (isPublished(name, version)) {
        console.log(`  ${name}@${version} is on npm although "npm publish" failed – counted as published.`);
        results.push([id, `${name}@${version}`, `published (tag ${tag}), npm reported an error`]);
        return;
      }
    }
    if (attempt < MAX_ATTEMPTS) {
      console.log(`  "npm publish" failed (exit ${status}) – retrying in ${RETRY_PAUSE_MS / 1000} s …`);
      await sleep(RETRY_PAUSE_MS);
    }
  }
  results.push([id, `${name}@${version}`, `FAILED after ${MAX_ATTEMPTS} attempts`]);
}

for (const id of LIBS.filter(selected)) {
  const dir = join(root, "packages", id);
  const pkg = readJson(join(dir, "package.json"));
  const distDir = join(dir, pkg.publishConfig?.directory ?? ".");
  if (!existsSync(join(distDir, "package.json"))) throw new Error(`${id}: ${distDir}/package.json missing – build first (pnpm build:libs).`);
  if (isPublished(pkg.name, pkg.version)) { results.push([id, `${pkg.name}@${pkg.version}`, "already on npm – skipped"]); continue; }
  const before = new Set(readdirSync(tmp));
  run("pnpm", ["pack", "--pack-destination", tmp], dir);
  const tgz = readdirSync(tmp).find(f => f.endsWith(".tgz") && !before.has(f));
  if (!tgz) throw new Error(`${id}: pnpm pack produced no tarball`);
  await publish(id, pkg.name, pkg.version, join(tmp, tgz), "latest", true);
}

for (const id of NG.filter(selected)) {
  const dist = join(root, "angular-builds", id, "dist");
  if (!existsSync(join(dist, "package.json"))) throw new Error(`${id}: ${dist}/package.json missing – build first (pnpm build:angular).`);
  const pkg = readJson(join(dist, "package.json"));
  await publish(id, pkg.name, pkg.version, dist, id === newestNg ? "latest" : `a${id.slice(2)}`);
}

const failed = results.filter(([, , status]) => status.startsWith("FAILED"));
console.log(`\n${dryRun ? "DRY RUN – nothing was published." : failed.length ? "Done – with errors." : "Done."}`);
console.table(results.map(([id, pkg, status]) => ({ id, package: pkg, status })));
if (failed.length) {
  console.error(`\n✖ Not published: ${failed.map(([, pkg]) => pkg).join(", ")}. Run the workflow again (manually, ` +
    `dry_run off, on the release tag) – packages already on npm are skipped.`);
  process.exit(1);
}
