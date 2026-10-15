// Pivot performance (prompt 007, design § 2.10): 1 million source rows – target < 1 s in Node.
//
//   pnpm --filter @guiexpert/table bench
//
// Plain tests that print the median of a few runs – no time assertions (CI machines vary). Outside src/ on purpose:
// not part of the coverage and never in the npm package.
import { describe, expect, it } from 'vitest';
import { PivotFactory, pivotRows } from '@guiexpert/table';
import type { PivotConfigIf } from '@guiexpert/table';
import { seededRandom } from '../test-utils/grouping-fixtures';

interface Row { country: string; city: string; year: number; quarter: number; quantity: number; total: number }

const random = seededRandom(42);
const rows: Row[] = Array.from({ length: 1_000_000 }, () => {
  const c = Math.floor(random() * 20);
  return {
    country: `Country ${c}`, city: `City ${c}-${Math.floor(random() * 25)}`,
    year: 2020 + Math.floor(random() * 6), quarter: 1 + Math.floor(random() * 4),
    quantity: Math.floor(random() * 10), total: random() * 1000,
  };
});

function measure(name: string, fn: () => unknown, runs = 5): void {
  fn(); // warm-up
  const times = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  }).sort((a, b) => a - b);
  console.log(`${name}: median ${times[Math.floor(runs / 2)].toFixed(0)} ms (min ${times[0].toFixed(0)}, max ${times[runs - 1].toFixed(0)})`);
}

describe('1,000,000 source rows', () => {
  it('measures', () => {
    const oneByOne: PivotConfigIf<Row> = { rowFields: ['country'], columnFields: ['year'], values: ['total'] };
    const full: PivotConfigIf<Row> = {
      rowFields: ['country', 'city'], columnFields: ['year', 'quarter'],
      values: ['total', { value: 'quantity', aggregator: 'avg' }],
    };
    measure('pivotRows: country × year, sum (20 × 6)', () => pivotRows(rows, oneByOne).getValue());
    measure('pivotRows: country › city × year › quarter, sum + avg (520 × 30 cells)', () => pivotRows(rows, full).getValue());
    const result = pivotRows(rows, full);
    measure('compute again with a filter (half of the rows)', () => result.compute(i => rows[i].quantity < 5), 3);
    measure('PivotFactory.createTableModel (full)', () => PivotFactory.createTableModel<Row>({ rows, ...full }), 3);
    expect(pivotRows(rows, oneByOne).rowGroups).toHaveLength(20);
  }, 300_000);
});
