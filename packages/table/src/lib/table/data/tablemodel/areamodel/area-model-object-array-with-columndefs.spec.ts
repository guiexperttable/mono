import { describe, it, expect } from 'vitest';
import {
  AreaModelObjectArray,
  AreaModelObjectArrayWithColumndefs,
  ColumnDef,
  SortItem,
  px100,
} from '@guiexpert/table';
import type { ColumnDefIf } from '@guiexpert/table';

interface Person {
  id: number;
  name: string;
  age: number;
}

const rows = (): Person[] => [
  { id: 1, name: 'John', age: 30 },
  { id: 2, name: 'Jane', age: 25 },
];

const defs = (): ColumnDefIf[] => [
  new ColumnDef('id', 'ID', px100),
  new ColumnDef('name', 'Name', px100),
  new ColumnDef('age', 'Age', px100),
];

describe('AreaModelObjectArrayWithColumndefs', () => {

  it('is an AreaModelObjectArray', () => {
    const model = new AreaModelObjectArrayWithColumndefs<Person>('body', rows(), defs(), 30);
    expect(model).toBeInstanceOf(AreaModelObjectArray);
  });

  it('takes the column definitions as third and the row height as fourth constructor parameter', () => {
    const model = new AreaModelObjectArrayWithColumndefs<Person>('body', rows(), defs(), 42);
    expect(model.areaIdent).toBe('body');
    expect(model.defaultRowHeight).toBe(42);
    expect(model.getRowHeight(0)).toBe(42);
    expect(model.getConstantRowHeight()).toBe(42);
    expect(model.getValueAt(1, 1)).toBe('Jane');
    expect(model.getValueAt(1, 2)).toBe(25);
  });

  it('behaves like the parent class with the parameters in the other order', () => {
    const a = new AreaModelObjectArrayWithColumndefs<Person>('body', rows(), defs(), 30);
    const b = new AreaModelObjectArray<Person>('body', rows(), 30, defs());
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        expect(a.getValueAt(r, c)).toEqual(b.getValueAt(r, c));
      }
    }
    expect(a.getYPosByRowIndex(1)).toBe(b.getYPosByRowIndex(1));
  });

  it('uses the default CSS classes for selected and focused rows', () => {
    const model = new AreaModelObjectArrayWithColumndefs<Person>('body', rows(), defs(), 30);
    expect(model.selectedRowClass).toBe('ge-selected-row');
    expect(model.focusedRowClass).toBe('ge-focused-row');
  });

  it('passes custom CSS classes for selected and focused rows to the parent', () => {
    const model = new AreaModelObjectArrayWithColumndefs<any>('body', [{ id: 1, selected: true }], defs(), 30, 'my-sel', 'my-focus');
    expect(model.selectedRowClass).toBe('my-sel');
    expect(model.focusedRowClass).toBe('my-focus');
    expect(model.getCustomClassesAt(0, 0)).toEqual(['my-sel', 'my-focus']);
  });

  it('sorts and filters like the parent class', () => {
    const model = new AreaModelObjectArrayWithColumndefs<Person>('body', rows(), defs(), 30);
    model.doSort([new SortItem(2, 'asc')]);
    expect(model.getFilteredRows().map(r => r.name)).toEqual(['Jane', 'John']);
    model.externalFilterChanged((r: Person) => r.id === 1);
    expect(model.getRowCount()).toBe(1);
    expect(model.getAllRows().length).toBe(2);
  });
});
