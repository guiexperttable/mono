import { describe, it, expect } from 'vitest';
import {
  AreaObjectMap,
  ColumnDef,
  FalseFn,
  InputCellRenderer,
  Size,
  TrueFn,
  allRight,
  bodyLeft,
  px80,
  px200,
} from '@guiexpert/table';
import type { CellRendererIf, SortState } from '@guiexpert/table';

const stubRenderer = (): CellRendererIf => ({ render: () => undefined });

describe('ColumnDef', () => {

  describe('constructor', () => {
    it('stores property and header label', () => {
      const def = new ColumnDef('customer', 'Customer');
      expect(def.property).toBe('customer');
      expect(def.headerLabel).toBe('Customer');
    });

    it('defaults to a width of 100px with minWidth and maxWidth of 100px', () => {
      const def = new ColumnDef('a', 'A');
      expect(def.width).toEqual(new Size(100, 'px'));
      expect(def.minWidth).toEqual(new Size(100, 'px'));
      expect(def.maxWidth).toEqual(new Size(100, 'px'));
    });

    it('defaults to empty class and renderer maps', () => {
      const def = new ColumnDef('a', 'A');
      expect(def.classes).toEqual(new AreaObjectMap<string[]>());
      expect(def.rendererMap).toEqual(new AreaObjectMap<CellRendererIf>());
      expect(def.rendererMap.body).toBeUndefined();
    });

    it('has no sorting, editing or edit renderer by default', () => {
      const def = new ColumnDef('a', 'A');
      expect(def.sortable).toBeUndefined();
      expect(def.sortComparator).toBeUndefined();
      expect(def.sortState).toBeUndefined();
      expect(def.sortStatesOrder).toBeUndefined();
      expect(def.sortIconVisible).toBeUndefined();
      expect(def.editable).toBeUndefined();
      expect(def.getEditRenderer).toBeUndefined();
      expect(def.editInputPipe).toBeUndefined();
    });

    it('is visible by default and isVisible() follows the visible field', () => {
      const def = new ColumnDef('a', 'A');
      expect(def.visible).toBe(true);
      expect(def.isVisible()).toBe(true);
      def.visible = false;
      expect(def.isVisible()).toBe(false);
    });

    it('takes width and CSS classes (e.g. the alignment constants)', () => {
      const def = new ColumnDef('total', 'Total', px80, allRight);
      expect(def.width).toBe(px80);
      expect(def.classes.header).toEqual(['ge-table-text-align-right']);
      expect(def.classes.body).toEqual(['ge-table-text-align-right']);
      expect(def.classes.footer).toEqual(['ge-table-text-align-right']);
      expect(new ColumnDef('city', 'City', px200, bodyLeft).classes.body).toEqual(['ge-table-text-align-left']);
    });

    it('keeps minWidth and maxWidth for a px width', () => {
      const def = new ColumnDef('a', 'A', px200, undefined, undefined, new Size(50, 'px'), new Size(300, 'px'));
      expect(def.minWidth).toEqual(new Size(50, 'px'));
      expect(def.maxWidth).toEqual(new Size(300, 'px'));
    });

    it('uses minWidth 0px and maxWidth 100000px for a % or weight width without explicit limits', () => {
      for (const width of [new Size(10, '%'), new Size(1, 'weight')]) {
        const def = new ColumnDef('a', 'A', width);
        expect(def.minWidth).toEqual(new Size(0, 'px'));
        expect(def.maxWidth).toEqual(new Size(100000, 'px'));
      }
    });

    // BUG: the constructor overwrites minWidth/maxWidth for every non-px width, although ColumnDefIf documents them as the limits for % widths.
    it.fails('keeps an explicit minWidth and maxWidth for a % width', () => {
      const def = new ColumnDef('a', 'A', new Size(10, '%'), undefined, undefined, new Size(50, 'px'), new Size(300, 'px'));
      expect(def.minWidth).toEqual(new Size(50, 'px'));
      expect(def.maxWidth).toEqual(new Size(300, 'px'));
    });
  });

  describe('ColumnDef.bodyRenderer', () => {
    it('creates a renderer map with only a body renderer', () => {
      const r = stubRenderer();
      const map = ColumnDef.bodyRenderer(r);
      expect(map).toBeInstanceOf(AreaObjectMap);
      expect(map.header).toBeUndefined();
      expect(map.body).toBe(r);
      expect(map.footer).toBeUndefined();
    });
  });

  describe('ColumnDef.create', () => {
    it('returns a ColumnDef', () => {
      expect(ColumnDef.create({})).toBeInstanceOf(ColumnDef);
    });

    it('defaults: empty property and label, 100px width and limits', () => {
      const def = ColumnDef.create({});
      expect(def.property).toBe('');
      expect(def.headerLabel).toBe('');
      expect(def.width).toEqual(new Size(100, 'px'));
      expect(def.minWidth).toEqual(new Size(100, 'px'));
      expect(def.maxWidth).toEqual(new Size(100, 'px'));
    });

    it('defaults: not editable, visible, not sortable, no sort icon', () => {
      const def = ColumnDef.create({});
      expect(def.editable?.()).toBe(false);
      expect(def.isVisible?.()).toBe(true);
      expect(def.sortable).toBeUndefined();
      expect(def.sortIconVisible).toBeUndefined();
      expect(def.sortComparator).toBeUndefined();
      expect(def.sortState).toBeUndefined();
    });

    it('takes property, label and width', () => {
      const def = ColumnDef.create({ property: 'price', headerLabel: 'Price', width: px80 });
      expect(def.property).toBe('price');
      expect(def.headerLabel).toBe('Price');
      expect(def.width).toBe(px80);
    });

    it('fills the renderer map from header/body/footer renderers', () => {
      const h = stubRenderer();
      const b = stubRenderer();
      const f = stubRenderer();
      const def = ColumnDef.create({ headerRenderer: h, bodyRenderer: b, footerRenderer: f });
      expect(def.rendererMap.header).toBe(h);
      expect(def.rendererMap.body).toBe(b);
      expect(def.rendererMap.footer).toBe(f);
    });

    it('fills the class map from header/body/footer classes', () => {
      const def = ColumnDef.create({ headerClasses: ['h'], bodyClasses: ['b1', 'b2'], footerClasses: ['f'] });
      expect(def.classes).toEqual({ header: ['h'], body: ['b1', 'b2'], footer: ['f'] });
    });

    it('lets the sort icon follow sortable', () => {
      const def = ColumnDef.create({ sortable: TrueFn });
      expect(def.sortable).toBe(TrueFn);
      expect(def.sortIconVisible).toBe(TrueFn);
    });

    it('takes an explicit sortIconVisible', () => {
      const def = ColumnDef.create({ sortable: TrueFn, sortIconVisible: FalseFn });
      expect(def.sortIconVisible).toBe(FalseFn);
    });

    it('passes sortComparator, sortState and sortStatesOrder', () => {
      const comparator = (a: number, b: number) => a - b;
      const order: SortState[] = ['desc', 'asc', ''];
      const def = ColumnDef.create({ sortComparator: comparator, sortState: 'desc', sortStatesOrder: order });
      expect(def.sortComparator).toBe(comparator);
      expect(def.sortState).toBe('desc');
      expect(def.sortStatesOrder).toBe(order);
    });

    it('passes editable, isVisible, getEditRenderer and editInputPipe', () => {
      const getEditRenderer = () => new InputCellRenderer();
      const pipe = (v: any) => v;
      const def = ColumnDef.create({ editable: TrueFn, isVisible: FalseFn, getEditRenderer, editInputPipe: pipe });
      expect(def.editable).toBe(TrueFn);
      expect(def.isVisible).toBe(FalseFn);
      expect(def.getEditRenderer).toBe(getEditRenderer);
      expect(def.editInputPipe).toBe(pipe);
    });

    it('passes minWidth and maxWidth for a px width', () => {
      const def = ColumnDef.create({ width: px200, minWidth: new Size(150, 'px'), maxWidth: new Size(250, 'px') });
      expect(def.minWidth).toEqual(new Size(150, 'px'));
      expect(def.maxWidth).toEqual(new Size(250, 'px'));
    });

    it('ignores the visible field (isVisible is TrueFn instead of reading "visible")', () => {
      // NOTE: unlike the constructor, create() sets isVisible = TrueFn – setting `visible = false` afterwards has no effect.
      const def = ColumnDef.create({ property: 'a' }) as ColumnDef;
      def.visible = false;
      expect(def.isVisible()).toBe(true);
    });
  });
});
