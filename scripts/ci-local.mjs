#!/usr/bin/env node
// The GitHub pipeline, locally – run it before a release (`pnpm ci:local`). Stops at the first red step.
//
// Mirrors .github/workflows/ci.yml, test-core.yml, test-wrappers.yml and the build steps of npm-publish.yml, plus
// `pnpm build:all` (the demo apps type-check the core sources with stricter settings – 1.1.110 was released although
// apps/vue3-multi-demo did not build). On a Mac the browser tests are those of the macOS job.
//
// What it can't catch: an outage of GitHub Actions, a test that only fails on the slower CI runners, the Linux job
// on a Mac. Coverage is left out (it runs the unit and browser tests a second time).
//
//   pnpm ci:local            all steps (~2.5 min on an M-series Mac)
//   pnpm ci:local --from 5   start at step 5 (after a fix)
import { spawnSync } from 'node:child_process';

const STEPS = [
  ['lockfile is up to date (CI: pnpm install --frozen-lockfile)', 'pnpm install --frozen-lockfile'],
  ['versions are consistent (publish: version:check)', 'pnpm version:check'],
  ['build everything: core, libraries, Angular 14 – 22, demo apps, website (build:all)', 'pnpm build:all'],
  ['type check of specs and test-utils (test-core)', 'pnpm --filter @guiexpert/table test:types'],
  ['JSDoc examples compile (test-core: docs:check)', 'pnpm --filter @guiexpert/table docs:check'],
  ['llms.txt snippets compile (test-core: check:llms)', 'pnpm check:llms'],
  ['unit tests (test-core)', 'pnpm --filter @guiexpert/table test:unit'],
  ['browser tests, Chromium (test-core, Linux + macOS job)', 'pnpm --filter @guiexpert/table test:browser'],
  ['performance ratios (test-core: test:perf)', 'pnpm --filter @guiexpert/table test:perf'],
  ['wrapper tests incl. Angular 22 (test-wrappers)', 'pnpm test:wrappers'],
];

const fromArg = process.argv.indexOf('--from');
const from = fromArg > -1 ? Math.max(1, Number(process.argv[fromArg + 1]) || 1) : 1;
const results = [];
const started = Date.now();

for (let i = from - 1; i < STEPS.length; i++) {
  const [title, command] = STEPS[i];
  console.log(`\n▶ ${i + 1}/${STEPS.length} ${title}\n  $ ${command}\n`);
  const t0 = Date.now();
  const { status } = spawnSync(command, { stdio: 'inherit', shell: true });
  const seconds = Math.round((Date.now() - t0) / 1000);
  results.push(`${status === 0 ? '✓' : '✗'} ${i + 1}. ${title} (${seconds} s)`);
  if (status !== 0) {
    console.error(`\n${results.join('\n')}\n\n✗ step ${i + 1} is red – the pipeline would be red, too. Fix it, then:`
      + ` pnpm ci:local --from ${i + 1}\n`);
    process.exit(status ?? 1);
  }
}
console.log(`\n${results.join('\n')}\n\n✓ all green locally (${Math.round((Date.now() - started) / 1000)} s)`
  + ' – the pipeline should be green, too (unless GitHub Actions has an outage: https://www.githubstatus.com)\n');
