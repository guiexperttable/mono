import { describe, it, expect } from 'vitest';
import { CellGroupExt, CellgroupFactory, ColumnDef } from '@guiexpert/table';
import type { CellGroupIf } from '@guiexpert/table';

const groups = (): CellGroupIf[] => [
  { data: 'Order', children: [{ data: 'ID', property: 'id' }, { data: 'Date', property: 'date' }] },
  {
    data: 'Customer', toggle: true, children: [
      { data: 'Customer', property: 'customer', visibility: 'always' },
      { data: 'City', property: 'city' },
    ],
  },
];

const label = (cell: CellGroupExt | null | undefined) => cell === null ? 'null' : cell === undefined ? 'undef' : String(cell.data);

describe('CellgroupFactory', () => {

  describe('buildColumnDefs', () => {
    it('creates one ColumnDef per leaf with a property, in depth-first order', () => {
      const defs = CellgroupFactory.buildColumnDefs(groups());
      expect(defs.map(d => d.property)).toEqual(['id', 'date', 'customer', 'city']);
      expect(defs.map(d => d.headerLabel)).toEqual(['ID', 'Date', 'Customer', 'City']);
      expect(defs.every(d => d instanceof ColumnDef)).toBe(true);
    });

    it('uses the property as header label if the group has no data', () => {
      const defs = CellgroupFactory.buildColumnDefs([{ data: '', property: 'x' }]);
      expect(defs[0]!.headerLabel).toBe('x');
    });

    it('also creates a column for a group that has a property and children', () => {
      const defs = CellgroupFactory.buildColumnDefs([{ data: 'P', property: 'p', children: [{ data: 'X', property: 'x' }] }]);
      expect(defs.map(d => d.property)).toEqual(['p', 'x']);
    });

    it('appends to a given array', () => {
      const ret = [new ColumnDef('first', 'First')];
      const defs = CellgroupFactory.buildColumnDefs([{ data: 'A', property: 'a' }], ret);
      expect(defs).toBe(ret);
      expect(defs.map(d => d.property)).toEqual(['first', 'a']);
    });

    it('plain CellGroupIf objects give always visible columns', () => {
      const g = groups();
      g[1]!.closed = true;
      const defs = CellgroupFactory.buildColumnDefs(g);
      expect(defs.map(d => d.isVisible?.())).toEqual([true, true, true, true]);
    });

    it('CellGroupExt nodes give columns whose visibility follows the collapsed state', () => {
      const exts = CellgroupFactory.buildGroupExts(groups());
      const defs = CellgroupFactory.buildColumnDefs(exts);
      expect(defs.map(d => d.isVisible?.())).toEqual([true, true, true, true]);
      exts[1]!.closed = true;
      expect(defs.map(d => d.isVisible?.())).toEqual([true, true, true, false]);
    });
  });

  describe('buildGroupExts', () => {
    const exts = CellgroupFactory.buildGroupExts(groups());

    it('wraps every node in a CellGroupExt', () => {
      expect(exts.length).toBe(2);
      expect(exts[0]).toBeInstanceOf(CellGroupExt);
      expect(exts[0]!.children![1]).toBeInstanceOf(CellGroupExt);
    });

    it('sets row index (depth), child index and parent', () => {
      const date = exts[0]!.children![1]!;
      expect(exts[1]!.rowIndex).toBe(0);
      expect(exts[1]!.childIndex).toBe(1);
      expect(exts[1]!.parent).toBeUndefined();
      expect(date.rowIndex).toBe(1);
      expect(date.childIndex).toBe(1);
      expect(date.parent).toBe(exts[0]);
    });

    it('links left and right neighbours on the same level', () => {
      expect(exts[0]!.rightNeighbour).toBe(exts[1]);
      expect(exts[1]!.leftNeighbour).toBe(exts[0]);
      expect(exts[0]!.leftNeighbour).toBeUndefined();
      expect(exts[1]!.rightNeighbour).toBeUndefined();
      const [id, date] = exts[0]!.children!;
      expect(id!.rightNeighbour).toBe(date);
    });

    it('copies data, property, toggle, closed and visibility', () => {
      const customer = exts[1]!;
      expect(customer.data).toBe('Customer');
      expect(customer.toggle).toBe(true);
      expect(customer.closed).toBe(false);
      expect(customer.children![0]!.visibility).toBe('always');
      expect(customer.children![0]!.property).toBe('customer');
    });
  });

  describe('flattenGroupExts', () => {
    it('lists all nodes depth-first (pre-order)', () => {
      const flat = CellgroupFactory.flattenGroupExts(CellgroupFactory.buildGroupExts(groups()));
      expect(flat.map(e => e.data)).toEqual(['Order', 'ID', 'Date', 'Customer', 'Customer', 'City']);
    });
  });

  describe('buildArrayOfArrays', () => {
    it('places groups in the first row and leaves below, null for spanned cells', () => {
      const flat = CellgroupFactory.flattenGroupExts(CellgroupFactory.buildGroupExts(groups()));
      const arr = CellgroupFactory.buildArrayOfArrays(flat, [[], []]);
      expect(arr.map(row => row.map(label))).toEqual([
        ['Order', 'null', 'Customer', 'null'],
        ['ID', 'Date', 'Customer', 'City'],
      ]);
    });

    it('reserves an own column for a group with a property and children (undefined below it)', () => {
      const flat = CellgroupFactory.flattenGroupExts(CellgroupFactory.buildGroupExts([
        { data: 'P', property: 'p', children: [{ data: 'X', property: 'x' }] },
        { data: 'Q', property: 'q' },
      ]));
      const arr = CellgroupFactory.buildArrayOfArrays(flat, [[], []]);
      expect(arr.map(row => row.map(label))).toEqual([
        ['P', 'null', 'Q'],
        ['undef', 'X', 'null'],
      ]);
    });
  });

  describe('iterateThrowColumns', () => {
    it('writes one debug line per node', () => {
      const sb: string[] = [];
      CellgroupFactory.iterateThrowColumns(sb, CellgroupFactory.buildGroupExts([{ data: 'G', children: [{ data: 'A', property: 'a' }] }]));
      expect(sb).toEqual(['G    rowIndex:0', 'A    rowIndex:1']);
    });
  });
});
