// Row grouping performance (prompt 006, design § 2.13): 1 million rows, 2 levels, 3 aggregates – target < 1 s in Node.
//
//   pnpm --filter @guiexpert/table bench
//
// Vitest 5 has no `bench()` any more: plain tests that print the median of a few runs – no time assertions (CI machines
// vary). Lives outside src/ on purpose: not part of the coverage and never in the npm package.
import { describe, expect, it } from 'vitest';
import { AreaModelRowGroups, aggregateRowGroups, groupRows } from '@guiexpert/table';
import { seededRandom } from '../test-utils/grouping-fixtures';

interface Row { country: string; city: string; quantity: number; total: number }

const random = seededRandom(42);
const rows: Row[] = Array.from({ length: 1_000_000 }, () => {
  const c = Math.floor(random() * 20);
  return { country: `Country ${c}`, city: `City ${c}-${Math.floor(random() * 25)}`, quantity: Math.floor(random() * 10), total: random() * 1000 };
});
const aggregations = { quantity: 'sum', total: 'sum', avgTotal: { aggregator: 'avg', value: 'total' } } as const;

function measure(name: string, fn: () => unknown, runs = 5): void {
  fn(); // warm-up
  const times = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  }).sort((a, b) => a - b);
  console.log(`${name}: median ${times[Math.floor(runs / 2)].toFixed(0)} ms (min ${times[0].toFixed(0)}, max ${times[runs - 1].toFixed(0)})`);
}

describe('1,000,000 rows, 2 levels, 3 aggregates', () => {
  it('measures', () => {
    measure('groupRows + aggregateRowGroups (engine)', () => aggregateRowGroups(groupRows(rows, ['country', 'city']), aggregations));
    measure('AreaModelRowGroups (groups, tree rows, aggregates)', () =>
      new AreaModelRowGroups<Row>(rows, [], { groupBy: ['country', 'city'], aggregations }).getTotals());
    measure('AreaModelRowGroups + filter (half of the rows)', () => {
      const model = new AreaModelRowGroups<Row>(rows, [], { groupBy: ['country', 'city'], aggregations, expanded: 0 });
      model.externalFilterChanged((r: Row) => r.quantity < 5);
      return model.getTotals();
    }, 3);
    expect(groupRows(rows, ['country'])).toHaveLength(20);
  }, 120_000);
});
