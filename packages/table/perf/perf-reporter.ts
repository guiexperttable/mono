// Stage 3 of the performance checks (prompt 021): absolute times as a TREND – a warning, never red.
//
// Collects the results the scenarios attach to their task meta (perf/measure.ts `report`), writes
// perf/results/latest.json (git-ignored) and compares each median with perf/baseline.json of the same platform:
//   +50 % or more → warning: a console table locally, `::warning::` annotations and a table in $GITHUB_STEP_SUMMARY in
//   GitHub Actions. `pnpm --filter @guiexpert/table perf:baseline` takes latest.json as the new baseline of the platform.
//
// Platform key: `<os>-ci` in CI (GITHUB_ACTIONS), `<os>-local` otherwise (os = linux | macos | windows) – the CI
// baseline is created on the CI runner, never on a developer machine.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Reporter, TestModule } from 'vitest/node';

/** One measured variant of a scenario (same shape as `PerfResultIf` in measure.ts). */
interface PerfResult {
  scenario: string;
  variant: string;
  n: number;
  median: number;
  p95: number;
  min: number;
}

interface ResultsFile {
  platform: string;
  createdAt: string;
  commit: string;
  node: string;
  results: PerfResult[];
}

interface BaselineFile {
  /** platform → "scenario | variant" → median in ms */
  platforms: Record<string, { createdAt: string; commit: string; medians: Record<string, number> }>;
}

/** A median this much above the baseline (factor) is reported as a warning. */
export const TREND_WARNING_FACTOR = 1.5;
/** Below this many ms a difference is noise (timer resolution), no warning. */
export const TREND_MIN_DIFF_MS = 0.3;

const perfDir = dirname(fileURLToPath(import.meta.url));
export const resultsFile = join(perfDir, 'results', 'latest.json');
export const baselineFile = join(perfDir, 'baseline.json');

export function platformKey(): string {
  const os = process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : 'linux';
  return `${os}-${process.env['GITHUB_ACTIONS'] ? 'ci' : 'local'}`;
}

export const resultKey = (r: Pick<PerfResult, 'scenario' | 'variant'>) => `${r.scenario} | ${r.variant}`;

function gitCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
}

export class PerfReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
    const results: PerfResult[] = [];
    for (const module of testModules) {
      for (const test of module.children.allTests()) {
        const perf = (test.meta() as { perf?: PerfResult[] }).perf;
        if (perf) results.push(...perf);
      }
    }
    if (!results.length) {
      return;
    }
    const file: ResultsFile = {
      platform: platformKey(), createdAt: new Date().toISOString(), commit: gitCommit(), node: process.version, results,
    };
    mkdirSync(dirname(resultsFile), { recursive: true });
    writeFileSync(resultsFile, JSON.stringify(file, null, 2) + '\n');
    this.compare(file);
  }

  private compare(file: ResultsFile): void {
    const baseline: BaselineFile = existsSync(baselineFile)
      ? JSON.parse(readFileSync(baselineFile, 'utf8')) : { platforms: {} };
    const base = baseline.platforms[file.platform];
    const rows = file.results.map(r => {
      const before = base?.medians[resultKey(r)];
      const factor = before ? r.median / before : undefined;
      const warn = before !== undefined && factor !== undefined && factor >= TREND_WARNING_FACTOR
        && r.median - before >= TREND_MIN_DIFF_MS;
      return { r, before, factor, warn };
    });

    const fmt = (ms: number | undefined) => ms === undefined ? '–' : ms.toFixed(3);
    const lines = [
      `perf trend (${file.platform}, baseline: ${base ? base.commit + ' ' + base.createdAt.slice(0, 10) : 'none'})`,
      ...rows.map(({ r, before, factor, warn }) =>
        `${warn ? '⚠ ' : '  '}${resultKey(r).padEnd(52)} n=${String(r.n).padStart(10)}  median ${fmt(r.median).padStart(8)} ms`
        + `  p95 ${fmt(r.p95).padStart(8)} ms  baseline ${fmt(before).padStart(8)} ms`
        + (factor ? `  ×${factor.toFixed(2)}` : '')),
    ];
    console.log('\n' + lines.join('\n') + `\n(results: ${resultsFile})\n`);

    if (process.env['GITHUB_ACTIONS']) {
      for (const { r, before, factor } of rows.filter(x => x.warn)) {
        console.log(`::warning title=Performance trend::${resultKey(r)}: median ${fmt(r.median)} ms, `
          + `baseline ${fmt(before)} ms (×${factor!.toFixed(2)})`);
      }
      const summary = process.env['GITHUB_STEP_SUMMARY'];
      if (summary) {
        appendFileSync(summary, [
          `### Performance trend (${file.platform})`, '',
          `Baseline: ${base ? `${base.commit} (${base.createdAt.slice(0, 10)})` : 'none – create it with `perf:baseline` from this artifact'}`, '',
          '| | Scenario | n | median ms | p95 ms | baseline ms | factor |',
          '|---|---|---:|---:|---:|---:|---:|',
          ...rows.map(({ r, before, factor, warn }) =>
            `| ${warn ? '⚠' : ''} | ${resultKey(r)} | ${r.n} | ${fmt(r.median)} | ${fmt(r.p95)} | ${fmt(before)} | `
            + `${factor ? factor.toFixed(2) : '–'} |`),
          '',
        ].join('\n'));
      }
    }
  }
}
