// Column filters (prompt 023) in the performance checks of prompt 021:
// 1. appendRows with an active column filter still scales flat O(k) for k new rows (100k → 2M rows).
// 2. setColumnFilter (single pass O(n)): reported for trend tracking across 100k → 1M rows.
import { afterEach, describe, expect, it } from 'vitest';
import { ColumnDef, DefaultRowHeights, TableFactory, px100 } from '@guiexpert/table';
import { destroyAllTables, mountTable } from '../test-utils/mount-table';
import { expectScalesFlat, measure, nextFrame, report } from './measure';
import type { Measurement } from './measure';

afterEach(() => destroyAllTables());

interface Account { id: number; region: string; seats: number }
const REGIONS = ['EMEA', 'AMER', 'APAC', 'LATAM'];
let nextId = 0;

function makeRows(count: number): Account[] {
  const out: Account[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const id = nextId++;
    out[i] = { id, region: REGIONS[id & 3], seats: (id % 100) + 1 };
  }
  return out;
}

async function mountAccounts(n: number) {
  const model = TableFactory.createTableModel({
    rows: makeRows(n),
    columnDefs: [
      ColumnDef.create({ property: 'id', headerLabel: 'ID', width: px100 }),
      ColumnDef.create({ property: 'region', headerLabel: 'Region', width: px100 }),
      ColumnDef.create({ property: 'seats', headerLabel: 'Seats', width: px100 }),
    ],
    defaultRowHeights: new DefaultRowHeights(34, 20, 34),
  });
  const t = mountTable(model, { width: 1000, height: 600, tableOptions: { resizeEventDebounceDelay: 10 } });
  await nextFrame();
  await new Promise(resolve => setTimeout(resolve, 40));
  await nextFrame();
  return t;
}

describe('column filters (prompt 023)', () => {
  it('appendRows with active column filter stays flat: 100,000 → 2,000,000 rows', async ({ task }) => {
    const result: Record<string, { n: number; m: Measurement }> = {};
    for (const [variant, n] of [['small', 100_000], ['large', 2_000_000]] as const) {
      const t = await mountAccounts(n);
      t.api.setColumnFilters({
        region: { values: ['EMEA', 'AMER', 'APAC'] },
        seats: { condition: { operator: 'greaterThan', value: 25 } },
      });
      await nextFrame();
      result[variant] = {
        n,
        m: await measure(() => {
          t.api.appendRows(makeRows(500), { maxRows: n, follow: 'auto' });
        }),
      };
      t.destroy();
    }
    report(task, 'appendRows 500/update with column filters', result);
    expectScalesFlat(result['small'].m, result['large'].m);
  });

  it('setColumnFilter (single pass O(n)): 100,000 → 1,000,000 rows – reported for trend', async ({ task }) => {
    const result: Record<string, { n: number; m: Measurement }> = {};
    for (const [variant, n] of [['small', 100_000], ['large', 1_000_000]] as const) {
      const t = await mountAccounts(n);
      let toggle = false;
      result[variant] = {
        n,
        m: await measure(() => {
          toggle = !toggle;
          t.api.setColumnFilters({
            region: { values: toggle ? ['EMEA', 'APAC'] : ['AMER', 'LATAM'] },
            seats: { condition: { operator: 'greaterThan', value: 40 } },
          });
        }, { runs: 9 }),
      };
      t.destroy();
    }
    report(task, 'setColumnFilters (2 columns, single pass)', result);
    expect(result['large'].m.median).toBeGreaterThan(0);
  });
});
