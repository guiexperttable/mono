// Undo and redo: other models, hidden rows, batch conflicts, write-row-value (prompt 013 stage 3).
import { afterEach, describe, expect, it } from 'vitest';
import {
  CellRange,
  ColumnDef,
  FocusModel,
  SelectionModel,
  TableFactory,
  TreeFactory,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type { TableOptionsIf } from '@guiexpert/table';
import { writeRowValue } from '../batch-edit/write-row-value';
import { destroyAllTables, mountTable, nextFrame } from '../../../../test-utils/mount-table';

afterEach(destroyAllTables);

const options = (extra: Partial<TableOptionsIf> = {}): Partial<TableOptionsIf> => {
  const fm = new FocusModel('cell');
  const sm = new SelectionModel('range', 'multi');
  return { getFocusModel: () => fm, getSelectionModel: () => sm, undo: true, ...extra };
};

describe('other models', () => {

  it('an array of arrays: rows are arrays (objects) – sorted in between, undone at the right row', async () => {
    const rows = [['b', 2], ['a', 1], ['c', 3]];
    const t = mountTable(TableFactory.createTableModel({
      rows, columnDefs: [
        ColumnDef.create({ property: '0', headerLabel: 'A', width: px100, editable: TrueFn }),
        ColumnDef.create({ property: '1', headerLabel: 'B', width: px100, editable: TrueFn }),
      ],
    } as never), { tableOptions: options() });
    await nextFrame();
    t.api.applyCellChanges([{ rowIndex: 0, column: 1, value: 20 }], 'edit');
    expect(rows[0][1]).toBe(20);
    t.api.undo();
    expect(rows[0][1]).toBe(2);
  });

  it('an array of arrays hidden by a filter is undone too', async () => {
    const rows = [['a', 1], ['b', 2]];
    const columnDefs = [
      ColumnDef.create({ property: '0', headerLabel: 'A', width: px100, editable: TrueFn }),
      ColumnDef.create({ property: '1', headerLabel: 'B', width: px100, editable: TrueFn }),
    ];
    const t = mountTable(TableFactory.createTableModel({ rows, columnDefs } as never), { tableOptions: options() });
    await nextFrame();
    t.api.applyCellChanges([{ rowIndex: 1, column: 1, value: 20 }, { rowIndex: 1, column: 0, value: 'B' }], 'edit');
    t.scope.tableOptions.externalFilterFunction = (r: unknown[]) => r[0] === 'a';
    t.api.externalFilterChanged();
    await nextFrame();
    t.api.undo();
    expect(rows[1]).toEqual(['b', 2]);
  });

  it('a nested property, a calculated column with valueSetter (hidden row), and the hidden-row conflict', async () => {
    interface R { id: number; info: { city: string }; price: number }
    const rows: R[] = [{ id: 1, info: { city: 'Rome' }, price: 10 }, { id: 2, info: { city: 'Oslo' }, price: 20 }];
    const t = mountTable(TableFactory.createTableModel({
      rows, columnDefs: [
        ColumnDef.create({ property: 'id', headerLabel: 'Id', width: px100 }),
        ColumnDef.create({ property: 'info.city', headerLabel: 'City', width: px100, editable: TrueFn }),
        ColumnDef.create({ property: 'gross', headerLabel: 'Gross', width: px100, editable: TrueFn,
          valueGetter: (r: R) => r.price * 2, valueSetter: (r: R, v: unknown) => { r.price = Number(v) / 2; } }),
      ],
    }), { tableOptions: options() });
    await nextFrame();
    t.api.applyCellChanges([{ rowIndex: 0, column: 1, value: 'Paris' }, { rowIndex: 0, column: 2, value: 50 },
      { rowIndex: 1, column: 1, value: 'Bern' }], 'edit');
    expect([rows[0].info.city, rows[0].price, rows[1].info.city]).toEqual(['Paris', 25, 'Bern']);
    t.scope.tableOptions.externalFilterFunction = (r: R) => r.id === 99; // everything hidden
    t.api.externalFilterChanged();
    rows[1].info.city = 'changed meanwhile';
    await nextFrame();
    t.api.undo();
    expect([rows[0].info.city, rows[0].price, rows[1].info.city]).toEqual(['Rome', 10, 'changed meanwhile']);
    t.api.redo();
    expect([rows[0].info.city, rows[0].price]).toEqual(['Paris', 25]);
  });

  it('a model without row objects: undone by index', async () => {
    const rows = [{ v: 'a' }, { v: 'b' }];
    const t = mountTable(TableFactory.createTableModel({
      rows, columnDefs: [ColumnDef.create({ property: 'v', headerLabel: 'V', width: px100, editable: TrueFn })],
    }), { tableOptions: options() });
    await nextFrame();
    rows[1].v = 'B'; // what an own AreaModel without row objects reports: row undefined, the index
    t.scope.undoService!.record([{ row: undefined, rowIndex: 1, columnIndex: 0, property: 'v', oldValue: 'b', newValue: 'B' }], 'edit');
    t.scope.undoService!.record([{ row: undefined, rowIndex: 9, columnIndex: 0, property: 'v', oldValue: 'x', newValue: 'y' }], 'edit');
    t.api.undo(); // row 9 does not exist: skipped
    expect(t.api.getUndoState()?.size).toBe(1);
    t.api.undo();
    expect(rows[1].v).toBe('b');
  });
});

describe('batch edit conflicts', () => {

  it('a pending value changed meanwhile is skipped; "overwrite" writes anyway', async () => {
    const rows = [{ v: 'a' }, { v: 'b' }];
    const columnDefs = [ColumnDef.create({ property: 'v', headerLabel: 'V', width: px100, editable: TrueFn })];
    const t = mountTable(TableFactory.createTableModel({ rows, columnDefs }), { tableOptions: options({ batchEdit: true }) });
    await nextFrame();
    t.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'x' }], 'edit');
    t.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'y' }], 'edit', { undoable: false });
    t.api.undo(); // pending is "y", the step expects "x": skipped
    expect(t.api.getPendingChanges().map(c => c.newValue)).toEqual(['y']);
    destroyAllTables();
    const rows2 = [{ v: 'a' }];
    const o = mountTable(TableFactory.createTableModel({ rows: rows2, columnDefs: [ColumnDef.create({ property: 'v', headerLabel: 'V', width: px100, editable: TrueFn })] }),
      { tableOptions: options({ batchEdit: true, undo: { onConflict: 'overwrite' } }) });
    await nextFrame();
    o.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'x' }], 'edit');
    o.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'y' }], 'edit', { undoable: false });
    o.api.undo();
    expect(o.api.hasPendingChanges()).toBe(false);
    o.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'z' }]); // "api": not recorded
    expect(o.api.canUndo()).toBe(false);
  });

  it('a group of fill and paste is undone in reverse order and selects both ranges', async () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({ v: `r${i}` }));
    const t = mountTable(TableFactory.createTableModel({ rows, columnDefs: [ColumnDef.create({ property: 'v', headerLabel: 'V', width: px100, editable: TrueFn })] }),
      { tableOptions: options() });
    await nextFrame();
    t.api.batchUndoable('Both', () => {
      t.api.fillRange(new CellRange(0, 0, 0, 0), 'down', 2, 'copy');
      t.api.pasteText('p', [8, 0]);
    });
    expect(rows.map(r => r.v)).toEqual(['r0', 'r0', 'r0', 'r3', 'r4', 'r5', 'r6', 'r7', 'p', 'r9']);
    t.api.undo();
    expect(rows.map(r => r.v)).toEqual(Array.from({ length: 10 }, (_, i) => `r${i}`));
    expect(t.api.getSelectionModel()?.getRanges().at(-1)).toMatchObject({ r1: 1, r2: 8 });
  });
});

describe('writeRowValue', () => {
  it('arrays, nested paths, calculated columns, nothing to write', () => {
    const arr = ['a', 'b'];
    expect(writeRowValue(arr, undefined, 1, 'B')).toBe(true);
    expect(arr).toEqual(['a', 'B']);
    expect(writeRowValue(null, undefined, 0, 1)).toBe(false);
    expect(writeRowValue({}, undefined, 0, 1)).toBe(false);
    const o = { a: { b: 1 }, c: null as unknown };
    expect(writeRowValue(o, ColumnDef.create({ property: 'a.b' }), 0, 2)).toBe(true);
    expect(o.a.b).toBe(2);
    expect(writeRowValue(o, ColumnDef.create({ property: 'c.d' }), 0, 2)).toBe(false);
    expect(writeRowValue(o, ColumnDef.create({ property: 'x', valueGetter: () => 1 }), 0, 2)).toBe(false);
    expect(writeRowValue(o, ColumnDef.create({ property: 'x', valueGetter: () => 1, valueSetter: () => false }), 0, 2)).toBe(false);
  });
});

describe('review fixes (stage 3)', () => {

  const mountSimple = async (extra: Partial<TableOptionsIf> = {}) => {
    const rows = Array.from({ length: 5 }, (_, i) => ({ v: `r${i}`, w: '' }));
    const listener = { onModelChanged: undefined as undefined | ((e: { source?: string; changes?: { rowIndex: number; columnIndex: number }[] }) => void) };
    const t = mountTable(TableFactory.createTableModel({
      rows, columnDefs: [
        ColumnDef.create({ property: 'v', headerLabel: 'V', width: px100, editable: TrueFn }),
        ColumnDef.create({ property: 'w', headerLabel: 'W', width: px100, editable: TrueFn }),
      ],
    }), { tableOptions: options(extra), eventListener: listener as never });
    await nextFrame();
    return { ...t, rows, listener };
  };

  it('a handler that derives values in onModelChanged: one step; undo does not record and keeps redo', async () => {
    const t = await mountSimple();
    t.listener.onModelChanged = e => {
      if (e.source === 'edit' && e.changes![0].columnIndex === 0) {
        const r = e.changes![0].rowIndex;
        t.api.applyCellChanges([{ rowIndex: r, column: 1, value: 'derived' }], 'edit');
      }
    };
    t.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'x' }], 'edit');
    expect([t.rows[0].v, t.rows[0].w]).toEqual(['x', 'derived']);
    expect(t.api.getUndoState()?.size).toBe(1);
    t.api.undo();
    expect([t.rows[0].v, t.rows[0].w]).toEqual(['r0', '']);
    expect(t.api.canRedo()).toBe(true);
    t.api.redo();
    expect([t.rows[0].v, t.rows[0].w]).toEqual(['x', 'derived']);
  });

  it('undo while a started batch edit runs marks the old values (cancel keeps the model)', async () => {
    const t = await mountSimple();
    t.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'x' }], 'edit');
    t.api.startBatchEdit();
    t.api.undo();
    expect(t.rows[0].v).toBe('x');
    expect(t.api.getPendingChanges().map(c => c.newValue)).toEqual(['r0']);
    t.api.cancelBatchEdit();
    expect(t.rows[0].v).toBe('x');
  });

  it('a hidden row of a column that became read only is not written back', async () => {
    const t = await mountSimple();
    t.api.applyCellChanges([{ rowIndex: 1, column: 0, value: 'x' }], 'edit');
    t.scope.tableOptions.externalFilterFunction = (r: { v: string }) => r.v !== 'x';
    t.api.externalFilterChanged();
    t.scope.tableModel.getColumnDef(0)!.editable = () => false;
    t.api.undo();
    expect(t.rows[1].v).toBe('x');
  });

  it('batchUndoable: a throwing fn records nothing; clear() inside drops the collected steps', async () => {
    const t = await mountSimple();
    expect(() => t.api.batchUndoable('G', () => {
      t.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'x' }], 'edit');
      throw new Error('no');
    })).toThrow('no');
    expect(t.api.canUndo()).toBe(false);
    t.api.batchUndoable('G', () => {
      t.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'y' }], 'edit');
      t.api.clearUndoHistory();
    });
    expect(t.api.canUndo()).toBe(false);
  });

  it('getUndoState after setRows: the history is gone', async () => {
    const t = await mountSimple();
    t.api.applyCellChanges([{ rowIndex: 0, column: 0, value: 'x' }], 'edit');
    (t.scope.tableModel.getBodyModel() as unknown as { setRows: (r: unknown[]) => void }).setRows([{ v: 'n', w: '' }]);
    expect(t.api.getUndoState()?.canUndo).toBe(false);
  });
});

describe('trees', () => {
  it('a node inside a collapsed parent is set back; setRows of the tree empties the history', async () => {
    interface Node { id: number; name: string; children?: Node[] }
    const nodes: Node[] = [{ id: 1, name: 'A', children: [{ id: 11, name: 'A1' }] }, { id: 2, name: 'B' }];
    const rows = TreeFactory.buildTreeRows(nodes, { expanded: true });
    const t = mountTable(TableFactory.createTableModel({
      rows, columnDefs: [ColumnDef.create({ property: 'name', headerLabel: 'Name', width: px100, editable: TrueFn })],
    }), { tableOptions: options() });
    await nextFrame();
    t.api.applyCellChanges([{ rowIndex: 1, column: 0, value: 'child' }], 'edit');
    expect(nodes[0].children![0].name).toBe('child');
    t.api.collapseAll();
    await nextFrame();
    t.api.undo();
    expect(nodes[0].children![0].name).toBe('A1');
    t.api.redo();
    (t.scope.tableModel.getBodyModel() as unknown as { rows: unknown[] }).rows = [...rows];
    expect(t.api.canUndo()).toBe(false);
  });
});
