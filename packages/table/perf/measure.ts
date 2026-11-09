// Measuring in the page (prompt 021, stage 2): warm up, N runs, median / p95 / min – and the ratio check
// `expectScalesFlat(small, large)`: the same operation with a small and a large n, so the speed of the machine cancels
// out and only the complexity is checked.
//
//   const small = await measure(() => scrollRender(tSmall));
//   const large = await measure(() => scrollRender(tLarge));
//   expectScalesFlat(small, large);
//   report(task, 'scroll render, constant height', { small, large, n: [10_000, 10_000_000] });
import { expect } from 'vitest';

export interface MeasureOptions {
  /** runs before measuring (JIT, caches) – default 5 */
  warmup?: number;
  /** measured runs – default 21 (odd: a real median) */
  runs?: number;
  /** the operation is repeated this often per run (short operations get above the timer resolution) – default 1 */
  inner?: number;
  /** wait for a frame after each run (async work of the operation, layout) – default true */
  frame?: boolean;
}

export interface Measurement {
  /** median of the runs, ms per operation */
  median: number;
  p95: number;
  min: number;
  runs: number;
}

export function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/**
 * Measures the synchronous part of `op` (performance.now() around it). `op` may return a promise (e.g. a real click
 * through a Vitest command) – then the time until it resolves is measured.
 */
export async function measure(op: (run: number) => unknown, options: MeasureOptions = {}): Promise<Measurement> {
  const { warmup = 5, runs = 21, inner = 1, frame = true } = options;
  let run = 0;
  for (let i = 0; i < warmup; i++) {
    for (let k = 0; k < inner; k++) await op(run++);
    if (frame) await nextFrame();
  }
  const times: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    for (let k = 0; k < inner; k++) {
      const result = op(run++);
      if (result instanceof Promise) await result;
    }
    times.push((performance.now() - start) / inner);
    if (frame) await nextFrame();
  }
  return summarize(times);
}

/** Median, p95 and minimum of times in ms. */
export function summarize(times: number[]): Measurement {
  const sorted = [...times].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  return { median: at(0.5), p95: at(0.95), min: sorted[0], runs: sorted.length };
}

export interface ScaleLimits {
  /** large ≤ maxRatio × small – default 2 */
  maxRatio?: number;
  /**
   * Absolute slack in ms: below it, timer resolution and noise dominate (performance.now() is coarsened to 0.1 ms) –
   * large ≤ max(maxRatio × small, small + slackMs). Default 0.5 ms.
   */
  slackMs?: number;
}

/**
 * The operation scales flat: its median for the large n is at most `maxRatio` times the one for the small n (plus a
 * small absolute slack). O(1) / O(log n) operations pass, O(n) ones fail (n differs by 100 – 1000×).
 */
export function expectScalesFlat(small: Measurement, large: Measurement, limits: ScaleLimits = {}): void {
  const { maxRatio = 2, slackMs = 0.5 } = limits;
  const limit = Math.max(maxRatio * small.median, small.median + slackMs);
  expect(large.median, `median large n ${fmt(large.median)} ms ≤ ${fmt(limit)} ms `
    + `(small n ${fmt(small.median)} ms × ${maxRatio}, at least + ${slackMs} ms)`).toBeLessThanOrEqual(limit);
}

const fmt = (ms: number) => ms.toFixed(3);

/** One result line of a scenario for the trend (stage 3), read by perf/perf-reporter.ts from the task meta. */
export interface PerfResultIf {
  scenario: string;
  /** "small" | "large" (or another label) */
  variant: string;
  n: number;
  median: number;
  p95: number;
  min: number;
}

/** Attaches results to the test (task meta) – the perf reporter writes them to perf/results/latest.json. */
export function report(task: { meta: object }, scenario: string,
                       variants: Record<string, { n: number; m: Measurement }>): void {
  const results: PerfResultIf[] = Object.entries(variants).map(([variant, { n, m }]) => ({
    scenario, variant, n, median: m.median, p95: m.p95, min: m.min,
  }));
  const meta = task.meta as { perf?: PerfResultIf[] };
  meta.perf = [...(meta.perf ?? []), ...results];
}
