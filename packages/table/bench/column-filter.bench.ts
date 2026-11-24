// Column filter performance (prompt 023): 2,000,000 rows – single-pass predicate & distinct-values collection.
//
//   pnpm --filter @guiexpert/table bench
import { describe, expect, it } from 'vitest';
import {
  collectDistinctValues,
  compileColumnFilterPredicate,
  type ColumnFiltersMap,
} from '@guiexpert/table';

interface Account {
  id: number;
  region: string;
  plan: string;
  seats: number;
}

const REGIONS = ['EMEA', 'AMER', 'APAC', 'LATAM'];
const PLANS = ['Starter', 'Pro', 'Business', 'Enterprise'];
const N = 2_000_000;
const rows: Account[] = new Array(N);
for (let i = 0; i < N; i++) {
  rows[i] = {
    id: i,
    region: REGIONS[i & 3],
    plan: PLANS[(i >>> 2) & 3],
    seats: (i % 200) + 1,
  };
}

function measure(name: string, fn: () => unknown, runs = 5): void {
  fn(); // warm-up
  const times = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  }).sort((a, b) => a - b);
  console.log(`${name}: median ${times[Math.floor(runs / 2)].toFixed(1)} ms (min ${times[0].toFixed(1)}, max ${times[runs - 1].toFixed(1)})`);
}

describe('2,000,000 rows column filter & distinct values', () => {
  it('measures', () => {
    const filters: ColumnFiltersMap = {
      region: { values: ['EMEA', 'APAC'] },
      seats: { condition: { operator: 'greaterThan', value: 40 } },
    };
    const pred = compileColumnFilterPredicate<Account>(filters, [
      { property: 'region', type: 'text', getValue: r => r.region },
      { property: 'seats', type: 'number', getValue: r => r.seats },
    ])!;
    let matched = 0;
    measure('single-pass filter (2 columns, 2M rows)', () => {
      matched = rows.filter(pred).length;
    });
    measure('collectDistinctValues low-cardinality (4 values, 2M rows)', () => {
      return collectDistinctValues(rows, r => r.region, { maxValues: 10_000 });
    });
    measure('collectDistinctValues high-cardinality capped (10k / 2M rows)', () => {
      return collectDistinctValues(rows, r => r.id, { maxValues: 10_000 });
    });
    expect(matched).toBe(800_000);
  }, 120_000);
});
