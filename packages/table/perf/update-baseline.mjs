#!/usr/bin/env node
// Takes perf/results/latest.json (written by `test:perf`) as the new baseline of its platform in perf/baseline.json.
//
//   pnpm --filter @guiexpert/table perf:baseline                 the local latest.json
//   pnpm --filter @guiexpert/table perf:baseline path/latest.json   e.g. from the CI artifact `perf-results`
//
// The CI baselines (linux-ci, macos-ci) come from CI runs only – download the artifact, run this, commit the diff.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const perfDir = dirname(fileURLToPath(import.meta.url));
const source = resolve(process.argv[2] ?? join(perfDir, 'results', 'latest.json'));
const target = join(perfDir, 'baseline.json');

if (!existsSync(source)) {
  console.error(`No results at ${source} – run \`pnpm --filter @guiexpert/table test:perf\` first.`);
  process.exit(1);
}
const latest = JSON.parse(readFileSync(source, 'utf8'));
const baseline = existsSync(target) ? JSON.parse(readFileSync(target, 'utf8')) : { platforms: {} };
const medians = {};
for (const r of latest.results) {
  medians[`${r.scenario} | ${r.variant}`] = Math.round(r.median * 1000) / 1000;
}
baseline.platforms[latest.platform] = { createdAt: latest.createdAt, commit: latest.commit, medians };
writeFileSync(target, JSON.stringify(baseline, null, 2) + '\n');
console.log(`Baseline "${latest.platform}" updated from ${source} (${latest.results.length} values, commit ${latest.commit}).`);
