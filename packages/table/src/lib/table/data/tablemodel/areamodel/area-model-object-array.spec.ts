import { describe, it, expect, beforeEach } from 'vitest';
import {
  AreaModelObjectArray,
  AreaObjectMap,
  CheckboxModel,
  ColumnDef,
  FalseFn,
  SortItem,
  TreeRow,
  TrueFn,
  px100,
} from '@guiexpert/table';
import type { CellRendererIf, ColumnDefIf, ValueRowSortComparator } from '@guiexpert/table';

interface Person {
  id: number;
  name: string;
  age: number;
  selected?: boolean;
}

const people = (): Person[] => [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
  { id: 3, name: 'Bob', age: 40 },
];

const defs = (): ColumnDefIf[] => [
  new ColumnDef('id', 'ID', px100),
  new ColumnDef('name', 'Name', px100),
  new ColumnDef('age', 'Age', px100),
];

const createModel = (rows: Person[] = people(), columnDefs: ColumnDefIf[] = defs(), rowHeight = 30) =>
  new AreaModelObjectArray<Person>('body', rows, rowHeight, columnDefs);

const names = (model: AreaModelObjectArray<Person>) => model.getFilteredRows().map(r => r.name);

/** A cell renderer stub – the model only stores and returns it. */
const stubRenderer = (): CellRendererIf => ({ render: () => undefined });

describe('AreaModelObjectArray', () => {

  describe('constructor', () => {
    it('stores area ident and default row height', () => {
      const model = createModel();
      expect(model.areaIdent).toBe('body');
      expect(model.defaultRowHeight).toBe(30);
    });

    it('uses the default CSS classes for selected and focused rows', () => {
      const model = createModel();
      expect(model.selectedRowClass).toBe('ge-selected-row');
      expect(model.focusedRowClass).toBe('ge-focused-row');
    });

    it('accepts custom CSS classes for selected and focused rows', () => {
      const model = new AreaModelObjectArray<Person>('body', people(), 30, defs(), 'my-sel', 'my-focus');
      expect(model.selectedRowClass).toBe('my-sel');
      expect(model.focusedRowClass).toBe('my-focus');
    });

    it('works without column definitions (all values are undefined)', () => {
      const model = new AreaModelObjectArray<Person>('body', people(), 30);
      expect(model.getRowCount()).toBe(3);
      expect(model.getValueAt(0, 0)).toBeUndefined();
    });

    it('keeps a reference to the given rows array (getAllRows) but filters/sorts a copy', () => {
      const rows = people();
      const model = createModel(rows);
      expect(model.getAllRows()).toBe(rows);
      expect(model.getFilteredRows()).not.toBe(rows);
      expect(model.getFilteredRows()).toEqual(rows);
    });
  });

  describe('getRowCount', () => {
    it('returns the number of rows', () => {
      expect(createModel().getRowCount()).toBe(3);
    });

    it('returns 0 for an empty array', () => {
      expect(createModel([]).getRowCount()).toBe(0);
    });

    it('counts only the rows that pass the external filter', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.age > 26);
      expect(model.getRowCount()).toBe(2);
    });
  });

  describe('getValueAt', () => {
    it('returns the property of the row object addressed by the column definition', () => {
      const model = createModel();
      expect(model.getValueAt(0, 0)).toBe(1);
      expect(model.getValueAt(0, 1)).toBe('John');
      expect(model.getValueAt(2, 2)).toBe(40);
    });

    it('returns an empty string for a row index out of range', () => {
      const model = createModel();
      expect(model.getValueAt(3, 0)).toBe('');
      expect(model.getValueAt(-1, 0)).toBe('');
    });

    it('returns undefined for a column index without column definition', () => {
      expect(createModel().getValueAt(0, 99)).toBeUndefined();
    });

    it('returns undefined for a property that the row does not have', () => {
      const model = createModel(people(), [new ColumnDef('unknown', 'Unknown')]);
      expect(model.getValueAt(0, 0)).toBeUndefined();
    });

    it('resolves nested property paths (dot notation)', () => {
      const rows = [
        { id: 1, person: { name: 'John', contact: { email: 'john@example.com' } } },
        { id: 2, person: { name: 'Jane', contact: { email: 'jane@example.com' } } },
      ];
      const model = new AreaModelObjectArray<any>('body', rows, 30, [
        new ColumnDef('id', 'ID'),
        new ColumnDef('person.name', 'Name'),
        new ColumnDef('person.contact.email', 'Email'),
      ]);
      expect(model.getValueAt(0, 1)).toBe('John');
      expect(model.getValueAt(1, 2)).toBe('jane@example.com');
    });

    it('returns undefined for a nested path whose intermediate object is missing', () => {
      const model = new AreaModelObjectArray<any>('body', [{ id: 1 }], 30, [new ColumnDef('person.name', 'Name')]);
      expect(model.getValueAt(0, 0)).toBeUndefined();
    });

    it('unwraps tree rows and reads the property from TreeRow.data', () => {
      const treeRow = new TreeRow<Person>({ id: 7, name: 'Tree', age: 1 }, true, undefined, undefined);
      const model = new AreaModelObjectArray<any>('body', [treeRow], 30, defs());
      expect(model.getValueAt(0, 1)).toBe('Tree');
    });

    it('reflects the current filter and sort order (view index, not data index)', () => {
      const model = createModel();
      model.doSort([new SortItem(2, 'desc')]);
      expect(model.getValueAt(0, 1)).toBe('Bob');
      model.externalFilterChanged((r: Person) => r.name.startsWith('J'));
      expect(model.getValueAt(0, 1)).toBe('John');
      expect(model.getValueAt(1, 1)).toBe('Jane');
    });
  });

  describe('getValueByT', () => {
    const model = createModel();

    it('reads a simple property', () => {
      expect(model.getValueByT({ id: 1, name: 'John', age: 30 }, 'name')).toBe('John');
    });

    it('reads a nested property', () => {
      const t: any = { contact: { email: 'john@example.com' } };
      expect(model.getValueByT(t, 'contact.email')).toBe('john@example.com');
    });

    it('returns undefined for a falsy object', () => {
      expect(model.getValueByT(undefined as any, 'name')).toBeUndefined();
      expect(model.getValueByT(null as any, 'name')).toBeUndefined();
    });

    it('returns undefined for an empty property', () => {
      expect(model.getValueByT({ id: 1, name: 'John', age: 30 }, '')).toBeUndefined();
    });

    it('returns null when an intermediate object of a nested path is null', () => {
      const t: any = { contact: null };
      expect(model.getValueByT(t, 'contact.email')).toBeNull();
    });

    it('returns the falsy intermediate value for a nested path through a falsy primitive', () => {
      // NOTE: 'count.value' on { count: 0 } yields 0 although "value" does not exist – the walk stops at the first falsy value.
      const t: any = { count: 0 };
      expect(model.getValueByT(t, 'count.value')).toBe(0);
    });
  });

  describe('getTextValueAt', () => {
    it('converts the value to a string', () => {
      const model = createModel();
      expect(model.getTextValueAt(0, 0)).toBe('1');
      expect(model.getTextValueAt(0, 1)).toBe('John');
    });

    it('returns an empty string for a row out of range', () => {
      expect(createModel().getTextValueAt(10, 0)).toBe('');
    });

    it('returns the string "undefined" for a missing property', () => {
      // NOTE: '' + undefined – copy/export would show the text "undefined" for empty cells.
      const model = createModel(people(), [new ColumnDef('unknown', 'Unknown')]);
      expect(model.getTextValueAt(0, 0)).toBe('undefined');
    });

    it('returns the string "null" for a null value', () => {
      // NOTE: '' + null – copy/export would show the text "null" for empty cells.
      const model = new AreaModelObjectArray<any>('body', [{ v: null }], 30, [new ColumnDef('v', 'V')]);
      expect(model.getTextValueAt(0, 0)).toBe('null');
    });
  });

  describe('doSort', () => {
    it('sorts numbers ascending', () => {
      const model = createModel();
      model.doSort([new SortItem(2, 'asc')]);
      expect(names(model)).toEqual(['Jane', 'John', 'Bob']);
    });

    it('sorts numbers descending', () => {
      const model = createModel();
      model.doSort([new SortItem(2, 'desc')]);
      expect(names(model)).toEqual(['Bob', 'John', 'Jane']);
    });

    it('sorts strings ascending and descending', () => {
      const model = createModel();
      model.doSort([new SortItem(1, 'asc')]);
      expect(names(model)).toEqual(['Bob', 'Jane', 'John']);
      model.doSort([new SortItem(1, 'desc')]);
      expect(names(model)).toEqual(['John', 'Jane', 'Bob']);
    });

    it('accepts plain object literals as sort items', () => {
      const model = createModel();
      model.doSort([{ columnIndex: 2, sortState: 'asc' }]);
      expect(names(model)).toEqual(['Jane', 'John', 'Bob']);
    });

    it('returns true', () => {
      expect(createModel().doSort([new SortItem(0, 'asc')])).toBe(true);
    });

    it('returns true and keeps the order for an empty sort item list', () => {
      const model = createModel();
      expect(model.doSort([])).toBe(true);
      expect(names(model)).toEqual(['John', 'Jane', 'Bob']);
    });

    it('keeps the current order for sortState "" (it does not restore the original order)', () => {
      // NOTE: "unsorted" is a no-op – after asc/desc the original data order is not restored.
      const model = createModel();
      model.doSort([new SortItem(2, 'desc')]);
      model.doSort([new SortItem(2, '')]);
      expect(names(model)).toEqual(['Bob', 'John', 'Jane']);
    });

    it('does not change the order of getAllRows()', () => {
      const model = createModel();
      model.doSort([new SortItem(2, 'desc')]);
      expect(model.getAllRows().map(r => r.name)).toEqual(['John', 'Jane', 'Bob']);
    });

    it('sorts by a nested property path', () => {
      const rows = [{ p: { n: 'c' } }, { p: { n: 'a' } }, { p: { n: 'b' } }];
      const model = new AreaModelObjectArray<any>('body', rows, 30, [new ColumnDef('p.n', 'N')]);
      model.doSort([new SortItem(0, 'asc')]);
      expect(model.getFilteredRows().map((r: any) => r.p.n)).toEqual(['a', 'b', 'c']);
    });

    it('sorts booleans: true before false for asc', () => {
      const rows = [{ b: false }, { b: true }, { b: false }];
      const model = new AreaModelObjectArray<any>('body', rows, 30, [new ColumnDef('b', 'B')]);
      model.doSort([new SortItem(0, 'asc')]);
      expect(model.getFilteredRows().map((r: any) => r.b)).toEqual([true, false, false]);
    });

    it('sorts dates chronologically', () => {
      const d1 = new Date(2020, 0, 1);
      const d2 = new Date(2021, 0, 1);
      const d3 = new Date(2019, 0, 1);
      const model = new AreaModelObjectArray<any>('body', [{ d: d1 }, { d: d2 }, { d: d3 }], 30, [new ColumnDef('d', 'D')]);
      model.doSort([new SortItem(0, 'asc')]);
      expect(model.getFilteredRows().map((r: any) => r.d)).toEqual([d3, d1, d2]);
    });

    // BUG: the JSDoc example reads "sort by name desc, then by age asc", but doSort() runs one stable sort per item,
    // so the LAST item becomes the primary key and earlier items only break ties.
    it.fails('sorts by the first sort item, the second one only breaks ties (JSDoc: "name desc, then age asc")', () => {
      const rows: Person[] = [
        { id: 1, name: 'A', age: 1 },
        { id: 2, name: 'B', age: 2 },
      ];
      const model = createModel(rows);
      model.doSort([new SortItem(1, 'desc'), new SortItem(2, 'asc')]);
      expect(model.getFilteredRows().map(r => r.id)).toEqual([2, 1]);
    });

    describe('with ColumnDef.sortComparator', () => {
      const lengthComparator: ValueRowSortComparator = (a: string, b: string) => a.length - b.length;

      const modelWithComparator = (comparator: ValueRowSortComparator) => {
        const rows: Person[] = [
          { id: 1, name: 'Alexander', age: 1 },
          { id: 2, name: 'Al', age: 2 },
          { id: 3, name: 'Alex', age: 3 },
        ];
        return createModel(rows, [
          new ColumnDef('id', 'ID'),
          ColumnDef.create({ property: 'name', headerLabel: 'Name', sortComparator: comparator }),
        ]);
      };

      it('uses the comparator for asc', () => {
        const model = modelWithComparator(lengthComparator);
        model.doSort([new SortItem(1, 'asc')]);
        expect(names(model)).toEqual(['Al', 'Alex', 'Alexander']);
      });

      it('inverts the comparator result for desc', () => {
        const model = modelWithComparator(lengthComparator);
        model.doSort([new SortItem(1, 'desc')]);
        expect(names(model)).toEqual(['Alexander', 'Alex', 'Al']);
      });

      it('passes both values, both rows and the direction factor to the comparator', () => {
        const calls: unknown[][] = [];
        const model = modelWithComparator((...args: unknown[]) => {
          calls.push(args);
          return 0;
        });
        model.doSort([new SortItem(1, 'desc')]);
        expect(calls.length).toBeGreaterThan(0);
        const [va, vb, ra, rb, f] = calls[0]!;
        expect(typeof va).toBe('string');
        expect(typeof vb).toBe('string');
        expect((ra as Person).name).toBe(va);
        expect((rb as Person).name).toBe(vb);
        expect(f).toBe(-1);
      });

      it('is not used for other columns', () => {
        let called = false;
        const model = modelWithComparator(() => {
          called = true;
          return 0;
        });
        model.doSort([new SortItem(0, 'desc')]);
        expect(called).toBe(false);
        expect(model.getFilteredRows().map(r => r.id)).toEqual([3, 2, 1]);
      });
    });
  });

  describe('sort(compareFn)', () => {
    it('sorts the filtered rows with a custom comparator', () => {
      const model = createModel();
      model.sort((a, b) => a.name.length - b.name.length);
      expect(names(model)).toEqual(['Bob', 'John', 'Jane']);
    });

    it('does not change the order of getAllRows()', () => {
      const model = createModel();
      model.sort((a, b) => b.id - a.id);
      expect(model.getAllRows().map(r => r.id)).toEqual([1, 2, 3]);
      expect(model.getFilteredRows().map(r => r.id)).toEqual([3, 2, 1]);
    });
  });

  describe('externalFilterChanged', () => {
    it('keeps only the rows matching the predicate', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.age > 26);
      expect(names(model)).toEqual(['John', 'Bob']);
    });

    it('does not modify getAllRows()', () => {
      const model = createModel();
      model.externalFilterChanged(() => false);
      expect(model.getRowCount()).toBe(0);
      expect(model.getAllRows().length).toBe(3);
    });

    it('can be cleared with a predicate that accepts every row', () => {
      const model = createModel();
      model.externalFilterChanged(() => false);
      model.externalFilterChanged(() => true);
      expect(model.getRowCount()).toBe(3);
    });

    it('always filters the original rows, not the previous filter result', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.name === 'John');
      model.externalFilterChanged((r: Person) => r.name === 'Bob');
      expect(names(model)).toEqual(['Bob']);
    });

    it('passes value, index and array like Array.prototype.filter', () => {
      const model = createModel();
      const indices: number[] = [];
      model.externalFilterChanged((_r: Person, index: number, arr: Person[]) => {
        indices.push(index);
        expect(arr).toBe(model.getAllRows());
        return true;
      });
      expect(indices).toEqual([0, 1, 2]);
    });

    it('sort after filter: sorts the filtered subset', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.age >= 30);
      model.doSort([new SortItem(2, 'desc')]);
      expect(names(model)).toEqual(['Bob', 'John']);
    });

    it('filter after sort: the sort order is lost (rows come back in data order)', () => {
      // NOTE: filtering rebuilds the view from the unsorted rows – callers (TableScope) have to re-sort afterwards.
      const model = createModel();
      model.doSort([new SortItem(2, 'desc')]);
      expect(names(model)).toEqual(['Bob', 'John', 'Jane']);
      model.externalFilterChanged(() => true);
      expect(names(model)).toEqual(['John', 'Jane', 'Bob']);
    });
  });

  describe('getFilteredRows / getAllRows', () => {
    it('getFilteredRows returns the current view', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.id !== 2);
      expect(model.getFilteredRows().map(r => r.id)).toEqual([1, 3]);
    });

    it('getAllRows returns all rows regardless of the filter', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.id !== 2);
      expect(model.getAllRows().map(r => r.id)).toEqual([1, 2, 3]);
    });
  });

  describe('setRows', () => {
    it('replaces the rows', () => {
      const model = createModel();
      model.setRows([{ id: 4, name: 'Alice', age: 35 }]);
      expect(model.getRowCount()).toBe(1);
      expect(model.getValueAt(0, 1)).toBe('Alice');
      expect(model.getAllRows().map(r => r.id)).toEqual([4]);
    });

    it('resets an active filter', () => {
      const model = createModel();
      model.externalFilterChanged(() => false);
      model.setRows(people());
      expect(model.getRowCount()).toBe(3);
    });
  });

  describe('filterRowsByPredict', () => {
    it('removes rows permanently from both all rows and filtered rows', () => {
      const model = createModel();
      model.filterRowsByPredict(r => r.age >= 30);
      expect(model.getAllRows().map(r => r.name)).toEqual(['John', 'Bob']);
      expect(names(model)).toEqual(['John', 'Bob']);
    });

    it('keeps an active external filter', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.name !== 'Bob');
      model.filterRowsByPredict(r => r.id !== 1);
      expect(names(model)).toEqual(['Jane']);
      expect(model.getAllRows().map(r => r.name)).toEqual(['Jane', 'Bob']);
    });

    it('does not mutate the array originally passed to the constructor', () => {
      const rows = people();
      const model = createModel(rows);
      model.filterRowsByPredict(() => false);
      expect(rows.length).toBe(3);
      expect(model.getAllRows()).not.toBe(rows);
    });
  });

  describe('find rows by criteria', () => {
    const byName = (criteria: Partial<Person>, row: Person) => row.name === criteria.name;

    it('findRowFromFilteredRowsByAllCriteria searches the filtered rows only', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.name !== 'Jane');
      expect(model.findRowFromFilteredRowsByAllCriteria({ name: 'John' }, byName)?.id).toBe(1);
      expect(model.findRowFromFilteredRowsByAllCriteria({ name: 'Jane' }, byName)).toBeUndefined();
    });

    it('findRowFromAllRowsByAllCriteria also finds filtered-out rows', () => {
      const model = createModel();
      model.externalFilterChanged((r: Person) => r.name !== 'Jane');
      expect(model.findRowFromAllRowsByAllCriteria({ name: 'Jane' }, byName)?.id).toBe(2);
      expect(model.findRowFromAllRowsByAllCriteria({ name: 'Nobody' }, byName)).toBeUndefined();
    });
  });

  describe('row heights and y positions', () => {
    it('getRowHeight returns the default row height for every row', () => {
      const model = createModel(people(), defs(), 42);
      expect(model.getRowHeight(0)).toBe(42);
      expect(model.getRowHeight(2)).toBe(42);
      expect(model.getRowHeight(999)).toBe(42);
    });

    it('getConstantRowHeight returns the default row height', () => {
      expect(createModel(people(), defs(), 42).getConstantRowHeight()).toBe(42);
    });

    it('getConstantRowHeight returns undefined for a default row height of 0 or less', () => {
      expect(createModel(people(), defs(), 0).getConstantRowHeight()).toBeUndefined();
      expect(createModel(people(), defs(), -1).getConstantRowHeight()).toBeUndefined();
    });

    it('getConstantRowHeight returns undefined if a subclass overrides getRowHeight', () => {
      class VariableHeights extends AreaModelObjectArray<Person> {
        override getRowHeight(rowIndex: number): number {
          return rowIndex === 0 ? 50 : 20;
        }
      }
      const model = new VariableHeights('body', people(), 20, defs());
      expect(model.getConstantRowHeight()).toBeUndefined();
    });

    it('getYPosByRowIndex is rowIndex * defaultRowHeight', () => {
      const model = createModel(people(), defs(), 30);
      expect(model.getYPosByRowIndex(0)).toBe(0);
      expect(model.getYPosByRowIndex(1)).toBe(30);
      expect(model.getYPosByRowIndex(2)).toBe(60);
    });

    it('getYPosByRowIndex is not 0 for rows below the first one (regression)', () => {
      const model = createModel(people(), defs(), 34);
      expect(model.getYPosByRowIndex(2)).toBe(68);
    });

    // BUG: AbstractAreaModel.getYPosByRowIndex uses defaultRowHeight * rowIndex whenever defaultRowHeight > 0 and ignores an overridden getRowHeight().
    it.fails('getYPosByRowIndex sums up the row heights if a subclass overrides getRowHeight', () => {
      class VariableHeights extends AreaModelObjectArray<Person> {
        override getRowHeight(rowIndex: number): number {
          return rowIndex === 0 ? 50 : 20;
        }
      }
      const model = new VariableHeights('body', people(), 20, defs());
      model.init();
      expect(model.getYPosByRowIndex(2)).toBe(50 + 20);
    });
  });

  describe('getRowByIndex', () => {
    it('returns the row object of the current view', () => {
      const model = createModel();
      model.doSort([new SortItem(0, 'desc')]);
      expect(model.getRowByIndex(0).id).toBe(3);
    });

    it('returns undefined for an index out of range', () => {
      expect(createModel().getRowByIndex(5)).toBeUndefined();
    });
  });

  describe('focused row', () => {
    it('is 0 by default', () => {
      const model = createModel();
      expect(model.getFocusedRowIndex()).toBe(0);
      expect(model._focusedRowIndex).toBe(0);
    });

    it('can be set and read', () => {
      const model = createModel();
      model.setFocusedRowIndex(2);
      expect(model.getFocusedRowIndex()).toBe(2);
    });
  });

  describe('getCustomClassesAt', () => {
    let model: AreaModelObjectArray<Person>;

    beforeEach(() => {
      model = createModel();
      model.setFocusedRowIndex(-1);
    });

    it('returns no classes for a normal row', () => {
      expect(model.getCustomClassesAt(1, 0)).toEqual([]);
    });

    it('adds the focused row class for the focused row only', () => {
      model.setFocusedRowIndex(1);
      expect(model.getCustomClassesAt(1, 0)).toEqual(['ge-focused-row']);
      expect(model.getCustomClassesAt(1, 2)).toEqual(['ge-focused-row']);
      expect(model.getCustomClassesAt(0, 0)).toEqual([]);
    });

    it('marks the first row as focused by default', () => {
      expect(createModel().getCustomClassesAt(0, 0)).toEqual(['ge-focused-row']);
    });

    it('adds the selected row class for rows with selected=true', () => {
      model.getRowByIndex(2).selected = true;
      expect(model.getCustomClassesAt(2, 0)).toEqual(['ge-selected-row']);
    });

    it('adds both classes in the order selected, focused', () => {
      model.getRowByIndex(1).selected = true;
      model.setFocusedRowIndex(1);
      expect(model.getCustomClassesAt(1, 0)).toEqual(['ge-selected-row', 'ge-focused-row']);
    });

    it('uses custom class names', () => {
      const custom = new AreaModelObjectArray<Person>('body', people(), 30, defs(), 'sel', 'foc');
      custom.getRowByIndex(0).selected = true;
      expect(custom.getCustomClassesAt(0, 0)).toEqual(['sel', 'foc']);
    });

    it('throws for a row index out of range', () => {
      // NOTE: getValueAt() tolerates an index out of range, getCustomClassesAt() crashes (row.selected of undefined).
      expect(() => model.getCustomClassesAt(10, 0)).toThrow(TypeError);
    });
  });

  describe('changeColumnOrder', () => {
    it('moves the column values', () => {
      const model = createModel();
      model.changeColumnOrder(0, 2);
      expect(model.getValueAt(0, 0)).toBe('John');
      expect(model.getValueAt(0, 1)).toBe(30);
      expect(model.getValueAt(0, 2)).toBe(1);
    });

    it('moves the cell renderers together with the values', () => {
      const r0 = stubRenderer();
      const r2 = stubRenderer();
      const model = createModel(people(), [
        new ColumnDef('id', 'ID', px100, undefined, new AreaObjectMap<CellRendererIf>(undefined, r0)),
        new ColumnDef('name', 'Name'),
        new ColumnDef('age', 'Age', px100, undefined, new AreaObjectMap<CellRendererIf>(undefined, r2)),
      ]);
      model.changeColumnOrder(2, 0);
      expect(model.getCellRenderer(0, 0)).toBe(r2);
      expect(model.getCellRenderer(0, 1)).toBe(r0);
      expect(model.getCellRenderer(0, 2)).toBeUndefined();
    });

    it('sorts by the moved column afterwards', () => {
      const model = createModel();
      model.changeColumnOrder(2, 0); // age is now column 0
      model.doSort([new SortItem(0, 'asc')]);
      expect(names(model)).toEqual(['Jane', 'John', 'Bob']);
    });
  });

  describe('getCellRenderer', () => {
    it('returns the renderer of the column for the area of the model', () => {
      const bodyRenderer = stubRenderer();
      const headerRenderer = stubRenderer();
      const model = createModel(people(), [
        new ColumnDef('id', 'ID', px100, undefined, new AreaObjectMap<CellRendererIf>(headerRenderer, bodyRenderer)),
      ]);
      expect(model.getCellRenderer(0, 0)).toBe(bodyRenderer);
    });

    it('returns undefined for a column without renderer or out of range', () => {
      const model = createModel();
      expect(model.getCellRenderer(0, 0)).toBeUndefined();
      expect(model.getCellRenderer(0, 99)).toBeUndefined();
    });
  });

  describe('defaults inherited from AbstractAreaModel', () => {
    const model = createModel();

    it('has no col- or rowspans', () => {
      expect(model.getColspanAt(0, 0)).toBe(0);
      expect(model.getRowspanAt(0, 0)).toBe(0);
    });

    it('allows col- and rowspans up to 31', () => {
      expect(model.getMaxColspan()).toBe(31);
      expect(model.getMaxRowspan()).toBe(31);
    });

    it('has no tooltip and no custom style', () => {
      expect(model.getTooltipAt(0, 0)).toBe('');
      expect(model.getCustomStyleAt(0, 0)).toBeUndefined();
    });

    it('is selectable', () => {
      expect(model.isSelectable(0, 0)).toBe(true);
    });

    it('is filterable only as body area', () => {
      expect(model.isFilterable()).toBe(true);
      expect(new AreaModelObjectArray<Person>('footer', people(), 30, defs()).isFilterable()).toBe(false);
    });
  });

  describe('editing', () => {
    it('isEditable follows ColumnDef.editable', () => {
      const model = createModel(people(), [
        ColumnDef.create({ property: 'id', editable: FalseFn }),
        ColumnDef.create({ property: 'name', editable: TrueFn }),
        new ColumnDef('age', 'Age'),
      ]);
      expect(model.isEditable(0, 0)).toBe(false);
      expect(model.isEditable(0, 1)).toBe(true);
      expect(model.isEditable(0, 2)).toBe(false);
      expect(model.isEditable(0, 99)).toBe(false);
    });

    it('setValue writes the property of the row of the current view', () => {
      const model = createModel();
      model.doSort([new SortItem(0, 'desc')]); // Bob is row 0
      expect(model.setValue(0, 1, 'Robert')).toBe(true);
      expect(model.getValueAt(0, 1)).toBe('Robert');
      expect(model.getAllRows()[2]!.name).toBe('Robert');
    });

    it('setValue writes nested properties', () => {
      const rows: any[] = [{ address: { city: 'Paris' } }];
      const model = new AreaModelObjectArray<any>('body', rows, 30, [new ColumnDef('address.city', 'City')]);
      expect(model.setValue(0, 0, 'Berlin')).toBe(true);
      expect(rows[0].address.city).toBe('Berlin');
    });

    it('setValue pipes the value through ColumnDef.editInputPipe', () => {
      const model = createModel(people(), [
        ColumnDef.create({ property: 'age', editInputPipe: (v: any) => Number(v) * 2 }),
      ]);
      model.setValue(1, 0, '21');
      expect(model.getValueAt(1, 0)).toBe(42);
    });

    // BUG: setPropertyValue writes the leaf value into the first missing/falsy path segment – row.address becomes 'Berlin'.
    it.fails('setValue on a nested path with a missing parent object does not overwrite the parent property', () => {
      const rows: any[] = [{ address: null }];
      const model = new AreaModelObjectArray<any>('body', rows, 30, [new ColumnDef('address.city', 'City')]);
      model.setValue(0, 0, 'Berlin');
      expect(rows[0].address).not.toBe('Berlin');
    });
  });

  describe('row checkboxes', () => {
    it('every row is checkable', () => {
      expect(createModel().isRowCheckable(0)).toBe(true);
    });

    it('isRowChecked is undefined without rowSelectionModel', () => {
      const model = createModel();
      expect(model.rowSelectionModel).toBeUndefined();
      expect(model.isRowChecked(0)).toBeUndefined();
    });

    it('setRowChecked is ignored without rowSelectionModel', () => {
      const model = createModel();
      expect(() => model.setRowChecked(0, true)).not.toThrow();
      expect(model.isRowChecked(0)).toBeUndefined();
    });

    it('uses the rowSelectionModel with the row objects of the current view', () => {
      const model = createModel();
      const checkboxModel = new CheckboxModel<Person>();
      model.rowSelectionModel = checkboxModel;
      expect(model.isRowChecked(1)).toBe('none');

      model.setRowChecked(1, true);
      expect(model.isRowChecked(1)).toBe('full');
      expect(checkboxModel.getCheckedRows().map(r => r.name)).toEqual(['Jane']);

      model.setRowChecked(1, false);
      expect(model.isRowChecked(1)).toBe('none');
      expect(checkboxModel.getCheckedRows()).toEqual([]);
    });

    it('the checked state follows the row object when the view is sorted', () => {
      const model = createModel();
      model.rowSelectionModel = new CheckboxModel<Person>();
      model.setRowChecked(0, true); // John
      model.doSort([new SortItem(1, 'asc')]); // Bob, Jane, John
      expect(model.isRowChecked(0)).toBe('none');
      expect(model.isRowChecked(2)).toBe('full');
    });
  });
});
