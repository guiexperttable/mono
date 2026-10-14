// AreaModelIf.getUnfilteredRowCount (since 1.1.91): tells "no rows at all" from "nothing matches the filter".
import { describe, expect, it } from 'vitest';
import { ColumnDef, TableFactory, TreeFactory, px100 } from '@guiexpert/table';
import type { AreaModelIf } from '@guiexpert/table';

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
});
