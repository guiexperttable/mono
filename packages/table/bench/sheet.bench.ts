// Cell formula engine (prompt 013 stage 4, S18): loading, incremental recalculation, a whole-column range, the
// running-sum case. Prints medians – no time assertions (CI machines vary). Targets (design § 6.4, estimates):
// 20 000 formulas load < 150 ms; a change with 10 000 dependents < 30 ms; SUM(A:A) over 1 million rows < 50 ms.
//
//   pnpm --filter @guiexpert/table bench
import { describe, expect, it } from 'vitest';
import { SheetEngine } from '@guiexpert/table';

function measure(name: string, fn: () => unknown, runs = 5): number {
  fn();
  const times = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  }).sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  console.log(`${name}: ${median.toFixed(1)} ms (median of ${runs})`);
  return median;
}

function heap(): number {
  const g = globalThis as { gc?: () => void };
  g.gc?.();
  return process.memoryUsage().heapUsed;
}

describe('S18 – sheet engine', () => {
  it('1000 × 26 cells with 20 000 formulas: load', () => {
    const data: unknown[][] = Array.from({ length: 1000 }, (_, r) => Array.from({ length: 26 }, (_, c) => {
      if (c < 6) return r * 26 + c;
      const col = String.fromCharCode(65 + (c % 6));
      return c % 5 === 0 ? `=SUM(${col}1:${col}${r + 1})` : `=${col}${r + 1}*2+${String.fromCharCode(65 + c - 1)}${r + 1}`;
    }));
    const before = heap();
    let engine!: SheetEngine;
    measure('load 20 000 formulas', () => { engine = SheetEngine.fromArrays(data); }, 3);
    const bytes = (heap() - before) / engine.getFormulaCount();
    console.log(`memory ≈ ${Math.round(bytes)} bytes per formula cell (${engine.getFormulaCount()} formulas)`);
    expect(engine.getFormulaCount()).toBe(20_000);
  });

  it('a change with 10 000 dependents', () => {
    const data: unknown[][] = [[1]];
    for (let i = 1; i <= 10_000; i++) data.push([`=$A$1*${i}`]);
    const engine = SheetEngine.fromArrays(data);
    let v = 1;
    measure('change with 10 000 dependents', () => {
      data[0][0] = ++v;
      engine.inputsChanged([[0, 0]]);
    });
    expect(engine.getValue(10_000, 0)).toBe(v * 10_000);
  });

  it('SUM(A:A) over 1 million rows: one range node', () => {
    const data: unknown[][] = Array.from({ length: 1_000_000 }, (_, i) => [i % 100, null]);
    data[0][1] = '=SUM(A:A)';
    const engine = SheetEngine.fromArrays(data);
    measure('SUM(A:A) after a change (1 000 000 rows)', () => {
      data[500_000][0] = Math.random();
      engine.inputsChanged([[500_000, 0]]);
    });
  });

  it('running sum =SUM($B$2:B2) over 10 000 rows (O(n²), known expensive form)', () => {
    const data: unknown[][] = Array.from({ length: 10_001 }, (_, r) => [null, r, r === 0 ? null : `=SUM($B$2:B${r + 1})`]);
    let engine!: SheetEngine;
    measure('load the running sum', () => { engine = SheetEngine.fromArrays(data); }, 1);
    measure('change B2 (10 000 sums depend on it)', () => {
      data[1][1] = Math.random();
      engine.inputsChanged([[1, 1]]);
    }, 1);
  });
});
