// Formula performance (prompt 008, F17): 1 million rows with a formula column – compiled once, evaluated only for
// the visible cells; sorting computes every row once; an aggregate (SUM) is computed once and cached.
//
//   pnpm --filter @guiexpert/table bench
//
// Plain tests that print the median of a few runs – no time assertions (CI machines vary).
import { describe, expect, it } from 'vitest';
import { AreaModelObjectArray, ColumnDef, SortItem, TableFactory, compileFormula } from '@guiexpert/table';
import { seededRandom } from '../test-utils/grouping-fixtures';

interface Row { price: number; quantity: number }

const random = seededRandom(17);
const rows: Row[] = Array.from({ length: 1_000_000 }, () => ({
  price: Math.round(random() * 100_000) / 100, quantity: 1 + Math.floor(random() * 20),
}));

function measure(name: string, fn: () => unknown, runs = 5): number {
  fn(); // warm-up
  const times = Array.from({ length: runs }, () => {
    const start = performance.now();
    fn();
    return performance.now() - start;
  }).sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  console.log(`${name}: ${median.toFixed(1)} ms (median of ${runs})`);
  return median;
}

describe('F17 – 1,000,000 rows with a formula column', () => {
  it('compile once, evaluate visible rows, sort, aggregate', () => {
    measure('compileFormula', () => compileFormula('ROUND([price] * [quantity] * 1.19, 2)'), 50);
    const columnDefs = [
      ColumnDef.create({ property: 'price' }),
      ColumnDef.create({ property: 'quantity' }),
      ColumnDef.create({ property: 'gross', formula: 'ROUND([price] * [quantity] * 1.19, 2)' }),
      ColumnDef.create({ property: 'share', formula: '[gross] / SUM([gross])' }),
    ];
    const model = TableFactory.createTableModel({ rows, columnDefs });
    const body = model.getBodyModel() as AreaModelObjectArray<Row>;
    // one screen: 40 rows × 4 columns
    measure('render 40 visible rows', () => {
      for (let r = 0; r < 40; r++) for (let c = 0; c < 4; c++) body.getValueAt(r, c);
    }, 20);
    measure('evaluate the formula for all 1M rows', () => {
      for (let r = 0; r < rows.length; r++) body.getValueAt(r, 2);
    }, 3);
    measure('SUM([gross]) over 1M rows (cache miss)', () => {
      body.invalidateDerivedValues();
      return body.getValueAt(0, 3);
    }, 3);
    measure('share of the next row (cache hit)', () => body.getValueAt(1, 3), 20);
    measure('sort 1M rows by the formula column', () => body.doSort([new SortItem(2, 'desc')]), 3);
    expect(body.getValueAt(0, 2)).toBeGreaterThanOrEqual(body.getValueAt(1, 2) as number);
  });
});
