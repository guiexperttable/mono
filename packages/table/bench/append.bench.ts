// Live data (prompt 019): appending to the body model – before (`addRows`: copy all rows into a new array, setRows
// copies again, filter/sort of all rows) vs. `appendRows` (in place, filter/order only for the new rows).
//
//   pnpm --filter @guiexpert/table bench
//
// Plain tests that print the median of a few runs – no time assertions (CI machines vary).
import { describe, expect, it } from 'vitest';
import { AreaModelObjectArray, ColumnDef, SortItem, px100 } from '@guiexpert/table';

interface Line { id: number; level: string; text: string }
const LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
let nextId = 0;
const lines = (count: number): Line[] => Array.from({ length: count }, () => {
  const id = nextId++;
  return { id, level: LEVELS[id % 4], text: 'line ' + id };
});
const columns = ['id', 'level', 'text'].map(p => new ColumnDef(p, p, px100));
const filter = (r: Line) => r.level !== 'DEBUG';

function measure(name: string, fn: () => unknown, runs = 7): number {
  fn();
  const times = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  }).sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  console.log(`${name}: ${median.toFixed(3)} ms (median of ${runs})`);
  return median;
}

describe('appendRows vs. addRows (model only, no rendering)', () => {
  for (const n of [1_000_000, 10_000_000]) {
    for (const k of [50, 500, 5_000]) {
      it(`${n.toLocaleString('en')} rows, +${k} per update`, () => {
        const m = new AreaModelObjectArray<Line>('body', lines(n), 20, columns);
        const before = measure(`  before (copy + filter all) n=${n} k=${k}`, () => {
          m.setRows([...m.getAllRows(), ...lines(k)]);
          m.externalFilterChanged(filter);
        }, 3);
        const unsorted = measure(`  appendRows unsorted, filtered, ring buffer n=${n} k=${k}`,
          () => m.appendRows(lines(k), { filter, maxRows: n }));
        const items = [new SortItem(1, 'asc' as const)];
        m.doSort(items);
        const sorted = measure(`  appendRows sorted n=${n} k=${k}`,
          () => m.appendRows(lines(k), { compare: m.createSortComparator(items), maxRows: n }));
        expect(unsorted).toBeGreaterThanOrEqual(0);
        expect(before + sorted).toBeGreaterThan(0);
      });
    }
  }
});
