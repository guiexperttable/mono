// AreaModelIf.getUnfilteredRowCount (since 1.1.91): tells "no rows at all" from "nothing matches the filter".
import { describe, expect, it } from 'vitest';
import { AreaModelArrayOfArrays, ColumnDef, CoverGridBodyModel, TableFactory, TreeFactory, px100 } from '@guiexpert/table';
import type { AreaModelIf, CellRendererIf } from '@guiexpert/table';

const renderer: CellRendererIf = { render: () => undefined };

interface Node { id: number; name: string; children?: Node[] }

describe('getUnfilteredRowCount', () => {

  it('AreaModelObjectArray: all rows, independent of the external filter', () => {
    const rows = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }];
    const model = TableFactory.createTableModel({ rows, properties: ['id', 'name'] });
    const body: AreaModelIf = model.getBodyModel();
    expect(body.getUnfilteredRowCount?.()).toBe(3);

    model.externalFilterChanged(() => false);
    expect(body.getRowCount()).toBe(0);
    expect(body.getUnfilteredRowCount?.()).toBe(3);
  });

  it('AreaModelObjectArray without rows → 0', () => {
    const model = TableFactory.createTableModel({ rows: [], properties: ['id', 'name'] });
    expect(model.getBodyModel().getUnfilteredRowCount?.()).toBe(0);
  });

  it('AreaModelTree: the displayed rows without the filter (collapsed children do not count)', () => {
    const nodes: Node[] = [
      { id: 1, name: 'A', children: [{ id: 11, name: 'A1' }] },
      { id: 2, name: 'B' },
    ];
    const rows = TreeFactory.buildTreeRows(nodes, { expanded: true });
    const model = TableFactory.createTableModel({
      rows, columnDefs: [ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100 })],
    });
    const body: AreaModelIf = model.getBodyModel();
    expect(body.getRowCount()).toBe(3);
    expect(body.getUnfilteredRowCount?.()).toBe(3);

    model.externalFilterChanged(() => false);
    expect(body.getRowCount()).toBe(0);
    expect(body.getUnfilteredRowCount?.()).toBe(3);
  });

  it('AreaModelArrayOfArrays: all rows, independent of the external filter', () => {
    const body = new AreaModelArrayOfArrays('body', [[1, 'a'], [2, 'b']], 30);
    body.externalFilterChanged(() => false);
    expect(body.getRowCount()).toBe(0);
    expect(body.getUnfilteredRowCount()).toBe(2);
  });

  it('CoverGridBodyModel: > 0 with items, 0 without', () => {
    const grid = new CoverGridBodyModel<{ id: number }>([{ id: 1 }, { id: 2 }, { id: 3 }], renderer);
    grid.externalFilterChanged(() => false);
    expect(grid.getRowCount()).toBe(0);
    expect(grid.getUnfilteredRowCount()).toBeGreaterThan(0);
    expect(new CoverGridBodyModel<{ id: number }>([], renderer).getUnfilteredRowCount()).toBe(0);
  });
});
