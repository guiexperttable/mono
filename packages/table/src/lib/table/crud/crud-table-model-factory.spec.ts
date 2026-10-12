import { describe, it, expect, vi } from 'vitest';
import {
  ActionEvent,
  ActionsCellRenderer,
  AreaModelObjectArrayWithColumndefs,
  ColumnDef,
  CrudOptions,
  CrudTableModelFactory,
  SelectionModel,
  TableOptions,
  px80,
} from '@guiexpert/table';
import type { CreateTableModelPara, TableModelAndOptionsIf } from '@guiexpert/table';

interface Person {
  id: number;
  name: string;
  address: { city: string };
}

const people = (): Person[] => [
  { id: 1, name: 'Alexander', address: { city: 'Rome' } },
  { id: 22, name: 'Bo', address: { city: 'Berlin' } },
];

/** CrudOptions whose list request is answered from memory (no fetch). */
const crudOptionsWith = (rows: unknown[]) => {
  const options = new CrudOptions();
  const list = Promise.resolve(rows);
  options.fetchList = <T>() => list as Promise<T[]>;
  return { options, list };
};

/** Runs createTableModel and resolves with the callback argument. */
const createModel = async (rows: unknown[], p: Partial<CreateTableModelPara> = {}, configure?: (o: CrudOptions) => void) => {
  const factory = new CrudTableModelFactory();
  const { options } = crudOptionsWith(rows);
  configure?.(options);
  const mo = await new Promise<TableModelAndOptionsIf>(resolve => factory.createTableModel(options, p, resolve));
  return { factory, options, mo, tm: mo.tableModel };
};

const headerLabels = (mo: TableModelAndOptionsIf) => {
  const tm = mo.tableModel;
  return Array.from({ length: tm.getColumnCount() }, (_, c) => tm.getAreaModel('header').getValueAt(0, c));
};

describe('CrudTableModelFactory', () => {

  describe('createTableModel', () => {
    it('passes the loaded rows to the body model', async () => {
      const { tm, factory } = await createModel(people());
      expect(tm.getBodyModel()).toBeInstanceOf(AreaModelObjectArrayWithColumndefs);
      expect(factory.bodyModel).toBe(tm.getBodyModel());
      expect(factory.tableModel).toBe(tm);
      expect(tm.getBodyModel().getRowCount()).toBe(2);
      expect(tm.getBodyModel().getValueAt(1, 1)).toBe('Bo');
    });

    it('derives the columns from the (flattened) properties of the first row', async () => {
      const { mo, tm } = await createModel(people());
      expect(tm.getColumnDefs()!.map(d => d.property)).toEqual(['id', 'name', 'address.city', 'id']);
      expect(headerLabels(mo)).toEqual(['ID', 'NAME', 'ADDRESS.CITY', 'Actions']);
      expect(tm.getBodyModel().getValueAt(0, 2)).toBe('Rome');
    });

    it('adds an "Actions" column with an ActionsCellRenderer (300px)', async () => {
      const { tm } = await createModel(people());
      const actions = tm.getColumnDefs()![3]!;
      expect(actions.headerLabel).toBe('Actions');
      expect(actions.width.value).toBe(300);
      expect(actions.rendererMap.body).toBeInstanceOf(ActionsCellRenderer);
    });

    it('adds no action column with autoAddActionColumn = false', async () => {
      const { tm } = await createModel(people(), {}, o => { o.autoAddActionColumn = false; });
      expect(tm.getColumnCount()).toBe(3);
    });

    it('calculates the column widths from the longest text (value or property name)', async () => {
      // charCountToWidth = chars * 10 + 10, limited to 50 … 450
      const { tm } = await createModel(people(), {}, o => { o.autoAddActionColumn = false; });
      expect(tm.getColumnDefs()!.map(d => d.width.value)).toEqual([50, 100, 130]);
    });

    it('limits the calculated widths to maxWidth', async () => {
      const { tm } = await createModel([{ text: 'x'.repeat(100) }], {}, o => { o.autoAddActionColumn = false; });
      expect(tm.getColumnDefs()![0]!.width.value).toBe(450);
    });

    it('uses 200px for every column without autoCalc', async () => {
      const { tm } = await createModel(people(), {}, o => {
        o.autoAddActionColumn = false;
        o.columnWidths.autoCalc = false;
      });
      expect(tm.getColumnDefs()!.map(d => d.width.value)).toEqual([200, 200, 200]);
    });

    it('uses given column definitions (and overwrites their widths with the calculated ones)', async () => {
      // NOTE: with columnWidths.autoCalc (default) the widths of the caller's ColumnDefs are replaced.
      const defs = [new ColumnDef('name', 'Name', px80)];
      const { tm } = await createModel(people(), { columnDefs: defs }, o => { o.autoAddActionColumn = false; });
      expect(tm.getColumnDefs()).toBe(defs);
      expect(defs[0]!.width.value).toBe(100);
      expect(tm.getBodyModel().getValueAt(0, 0)).toBe('Alexander');
    });

    it('creates a row selection model ("row", "multi") for options and table model', async () => {
      const { mo, tm, factory } = await createModel(people());
      const sm = mo.tableOptions.getSelectionModel?.();
      expect(sm).toBeInstanceOf(SelectionModel);
      expect(tm.getSelectionModel()).toBe(sm);
      expect(factory.tableOptions).toBe(mo.tableOptions);
    });

    it('merges the given table options and switches off the column hover', async () => {
      const { mo } = await createModel(people(), { tableOptions: { ...new TableOptions(), hoverRowVisible: false, hoverColumnVisible: true } });
      expect(mo.tableOptions.hoverRowVisible).toBe(false);
      expect(mo.tableOptions.hoverColumnVisible).toBe(false);
    });

    it('fixes the action column on the right for more than 6 columns', async () => {
      const wide = [{ a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 }];
      const { tm } = await createModel(wide);
      expect(tm.getColumnCount()).toBe(7);
      expect(tm.getFixedRightColumnCount()).toBe(1);
      const { tm: narrow } = await createModel(people());
      expect(narrow.getFixedRightColumnCount()).toBe(0);
    });

    it('does not call the callback for an empty list', async () => {
      // NOTE: the caller is never informed that the list was empty (no table model is created).
      const factory = new CrudTableModelFactory();
      const { options, list } = crudOptionsWith([]);
      const callback = vi.fn();
      factory.createTableModel(options, {}, callback);
      await list;
      await Promise.resolve();
      expect(callback).not.toHaveBeenCalled();
      expect(factory.tableModel).toBeUndefined();
    });

    it('stores the crud options and the action listener', async () => {
      const factory = new CrudTableModelFactory();
      const { options } = crudOptionsWith(people());
      const listener = vi.fn();
      await new Promise<TableModelAndOptionsIf>(resolve => factory.createTableModel(options, {}, resolve, listener));
      expect(factory.crudOptions).toBe(options);
      expect(factory.listenActionEvent).toBe(listener);
    });
  });

  describe('onActionEvent', () => {
    it('DELETE: calls deleteItem with the id, removes the row and notifies the listener', async () => {
      const factory = new CrudTableModelFactory();
      const { options } = crudOptionsWith(people());
      const deleted = Promise.resolve({});
      const deleteItem = vi.fn(() => deleted);
      options.deleteItem = deleteItem;
      const listener = vi.fn();
      await new Promise<TableModelAndOptionsIf>(resolve => factory.createTableModel(options, {}, resolve, listener));

      const evt = new ActionEvent('DELETE', 'body', factory.bodyModel!, 0, 3, 1);
      factory.onActionEvent(evt);
      await deleted;

      expect(listener).toHaveBeenCalledWith(evt);
      expect(deleteItem).toHaveBeenCalledWith(options, 1);
      expect(factory.bodyModel!.getAllRows().map((r: Person) => r.id)).toEqual([22]);
      expect(factory.bodyModel!.getRowCount()).toBe(1);
    });

    it('calls the listener also for unknown actions', () => {
      const factory = new CrudTableModelFactory();
      const listener = vi.fn();
      factory.listenActionEvent = listener;
      const evt = new ActionEvent('SOMETHING', 'body', undefined as any, 0, 0, 1);
      factory.onActionEvent(evt);
      expect(listener).toHaveBeenCalledWith(evt);
    });

    it('openDialogForCreate does nothing before a table model exists', () => {
      const factory = new CrudTableModelFactory();
      const listener = vi.fn();
      factory.listenActionEvent = listener;
      factory.openDialogForCreate();
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
