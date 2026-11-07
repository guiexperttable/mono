// The scroll height follows the rows the table draws (prompt 017, part B).
// Before 1.1.107 TableModel.getAreaHeight() took `defaultRowHeights[area]` first – TableFactory always sets it (34 px) –
// while the rows were drawn with the heights of the area model (`getConstantRowHeight()` / `getRowHeight(i)`).
// An own AreaModel with 20 px rows: a scroll bar without overflow (15 rows = 511 px scroll height), a wrong thumb, and
// scrollFactorY, scrollToPixel, the wheel scaling and the capped height worked with a range that was too large.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AreaModel, AreaModelObjectArray, ColumnDef, PivotFactory, RowGroupFactory, TableFactory, TreeFactory, px100 } from '@guiexpert/table';
import type { TableModelIf } from '@guiexpert/table';
import {
  createRows,
  DIRECTIONS,
  destroyAllTables,
  mountTable as mountTableBase,
  nextFrame,
  renderedRows,
} from '../../../test-utils/mount-table';
import type { MountOptions } from '../../../test-utils/mount-table';
import { createSales } from '../../../test-utils/grouping-fixtures';
import { createOrderModel, createOrders } from '../../../test-utils/master-detail-fixtures';

let direction: 'ltr' | 'rtl' = 'ltr';
const mountTable = (model: TableModelIf, opts: MountOptions = {}) =>
  mountTableBase(model, { ...opts, tableOptions: { direction, ...opts.tableOptions } });

/** A body with its own row heights: constant (with getConstantRowHeight) or from a function (without). */
class OwnHeightBody extends AreaModel {
  constructor(private readonly rowCount: number, private readonly heightOf: number | ((i: number) => number)) {
    super();
    this.areaIdent = 'body';
  }

  override getRowCount(): number {
    return this.rowCount;
  }

  override getRowHeight(rowIndex: number): number {
    return typeof this.heightOf === 'number' ? this.heightOf : this.heightOf(rowIndex);
  }

  override getConstantRowHeight(): number | undefined {
    return typeof this.heightOf === 'number' ? this.heightOf : undefined;
  }

  override getValueAt(row: number, col: number): any {
    return `r${row}c${col}`;
  }
}

/** A header with two rows of 50 px. */
class TallHeader extends AreaModel {
  constructor() {
    super();
    this.areaIdent = 'header';
  }

  override getRowCount(): number {
    return 2;
  }

  override getRowHeight(_rowIndex: number): number {
    return 50;
  }

  override getValueAt(row: number, col: number): any {
    return `H${row}/${col}`;
  }
}

const columnDefs = () => Array.from({ length: 2 }, (_, i) => new ColumnDef('c' + i, 'C' + i, px100));

/** Factory without `defaultRowHeights` – so the default 34 / 34 / 34. */
async function mountOwn(body: AreaModel, opts: MountOptions & { header?: AreaModel } = {}) {
  const tableModel = TableFactory.createTableModel({ bodyAreaModel: body, headerAreaModel: opts.header, columnDefs: columnDefs() });
  expect(tableModel.getRowHeight('body', 0)).not.toBe(34);
  const table = mountTable(tableModel, { width: 800, height: 500, ...opts });
  await nextFrame();
  return table;
}

const viewportOf = (host: HTMLElement) => host.querySelector<HTMLElement>('.ge-table-scroll-viewport')!;

afterEach(destroyAllTables);

describe.each(DIRECTIONS)('%s', dir => {
  beforeEach(() => { direction = dir; });

  describe('scroll height from the area model (20 px rows, defaultRowHeights 34)', () => {

    it('15 rows in a 500 px host: no vertical scroll bar, content = 15 × 20 (+1 for the last line)', async () => {
      const { host, scope } = await mountOwn(new OwnHeightBody(15, 20));
      const viewport = viewportOf(host);
      expect(scope.tableModel.getContentHeightInPixel()).toBe(15 * 20);
      expect(viewport.scrollHeight).toBeLessThanOrEqual(viewport.clientHeight);
      expect(renderedRows(host).length).toBe(15);
    });

    it('3000 rows: scrollHeight = 3000 × 20 + 1, scrollToPixel(0, content range) shows the last row fully', async () => {
      const { host, scope, api } = await mountOwn(new OwnHeightBody(3000, 20));
      const viewport = viewportOf(host);
      expect(viewport.scrollHeight).toBe(3000 * 20 + 1);
      expect(scope.tableModel.getContentHeightInPixel()).toBe(3000 * 20);
      api.scrollToPixel(0, 3000 * 20); // clamped to the content range (content height − visible body)
      await nextFrame();
      expect(api.getLastFullVisibleRowIndex()).toBe(2999);
      expect(viewport.scrollTop).toBeCloseTo(viewport.scrollHeight - viewport.clientHeight, 0);
    });

    it('a capped scroll height (1,000,000 × 20 px): the thumb at the end shows the last row, in the middle row ~500,000', async () => {
      const { host, api } = await mountOwn(new OwnHeightBody(1_000_000, 20));
      const viewport = viewportOf(host);
      viewport.scrollTop = viewport.scrollHeight; // like dragging the thumb to the end
      viewport.dispatchEvent(new Event('scroll'));
      await nextFrame();
      expect(api.getLastFullVisibleRowIndex()).toBe(999_999);

      viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
      viewport.dispatchEvent(new Event('scroll'));
      await nextFrame();
      expect(Math.abs(api.getFirstVisibleRowIndex() - 500_000)).toBeLessThan(100);
    });

    it('variable heights without getConstantRowHeight (20 / 40): content = the sum, like the row layout', async () => {
      const { host, scope, api } = await mountOwn(new OwnHeightBody(3000, i => i % 2 ? 40 : 20));
      const viewport = viewportOf(host);
      expect(scope.tableModel.getContentHeightInPixel()).toBe(1500 * 60);
      expect(viewport.scrollHeight).toBe(1500 * 60 + 1);
      api.scrollToIndex(0, 2999);
      await nextFrame();
      expect(api.getLastFullVisibleRowIndex()).toBe(2999);
    });

    it('a header of its own (2 rows × 50 px): the header takes 100 px, not 2 × 34', async () => {
      const { host, scope } = await mountOwn(new OwnHeightBody(15, 20), { header: new TallHeader() });
      expect(scope.tableModel.getPadding().top).toBe(100);
      const header = host.querySelector<HTMLElement>('.ge-table-header-center')!;
      expect(header.getBoundingClientRect().height).toBe(100);
    });

    it('content exactly as high as the body: 1 px to scroll – also without horizontal borders', async () => {
      // NOTE: the line below the last row is drawn below the row (top + height) whatever horizontalBorderVisible says,
      // and the focus frame is 1 px higher than its cell – the scroll content is 1 px higher than the rows to show both
      // (prompt 017 asked to drop the +1 without lines; checked: it is needed). Host 434 = header 34 + 20 rows × 20 px.
      for (const horizontalBorderVisible of [true, false]) {
        const t = await mountOwn(new OwnHeightBody(20, 20), { height: 434, tableOptions: { horizontalBorderVisible } });
        const viewport = viewportOf(t.host);
        expect(viewport.scrollHeight, String(horizontalBorderVisible)).toBe(viewport.clientHeight + 1);
        t.destroy();
      }
    });
  });

  describe('row positions of a built-in model whose subclass overrides getRowHeight() (20 / 40)', () => {
    // Before 1.1.107: AbstractAreaModel.getYPosByRowIndex() was defaultRowHeight × rowIndex and ignored the overridden
    // heights – scrollToIndex() / ensureRowIsVisible() landed beside the row (the rows were drawn with 20 / 40 px).
    class AlternatingRows extends AreaModelObjectArray<{ id: number; name: string; value: number }> {
      override getRowHeight(rowIndex: number): number {
        return rowIndex % 2 ? 40 : 20;
      }
    }

    async function mountAlternating() {
      const defs = ['id', 'name'].map(property => ColumnDef.create({ property, headerLabel: property, width: px100 }));
      const body = new AlternatingRows('body', createRows(3000), 34, defs);
      const tableModel = TableFactory.createTableModel({ bodyAreaModel: body, columnDefs: defs });
      const table = mountTable(tableModel, { width: 800, height: 500 });
      await nextFrame();
      return table;
    }

    it('scrollToIndex(0, 1001) shows row 1001 at the top', async () => {
      const { api } = await mountAlternating();
      api.scrollToIndex(0, 1001);
      await nextFrame();
      expect(api.getFirstVisibleRowIndex()).toBe(1001);
      expect(api.getFirstFullVisibleRowIndex()).toBe(1001);
    });

    it('ensureRowIsVisible(2000) makes row 2000 fully visible', async () => {
      const { api } = await mountAlternating();
      api.ensureRowIsVisible(2000);
      await nextFrame();
      expect(api.getFirstFullVisibleRowIndex()).toBeLessThanOrEqual(2000);
      expect(api.getLastFullVisibleRowIndex()).toBeGreaterThanOrEqual(2000);
    });

    it('the scroll height is the sum of the heights', async () => {
      const { host } = await mountAlternating();
      expect(viewportOf(host).scrollHeight).toBe(1500 * 60 + 1);
    });
  });

  describe('built-in models with their default heights: scroll height unchanged (values before 1.1.107)', () => {
    async function measure(model: TableModelIf, opts: MountOptions = {}) {
      const t = mountTable(model, opts);
      await nextFrame();
      const viewport = viewportOf(t.host);
      const padding = t.scope.tableModel.getPadding();
      return [viewport.scrollHeight, padding.top, padding.bottom, t.scope.tableModel.getContentHeightInPixel()];
    }

    it('object array (100 rows) with and without a totals footer', async () => {
      expect(await measure(TableFactory.createTableModel({ rows: createRows(100), properties: ['id', 'name', 'value'] })))
        .toEqual([3401, 34, 0, 3400]);
      expect(await measure(TableFactory.createTableModel({ rows: createRows(100), properties: ['id', 'name', 'value'], footerAggregates: { value: 'sum' } })))
        .toEqual([3401, 34, 34, 3400]);
    });

    it('bodyData (array of arrays, 40 rows)', async () => {
      expect(await measure(TableFactory.createTableModel({ bodyData: Array.from({ length: 40 }, (_, r) => [r, 'x' + r]), columnSizes: [100, 100] })))
        .toEqual([1361, 0, 0, 1360]);
    });

    it('tree (20 expanded parents with one child each)', async () => {
      const nodes = Array.from({ length: 20 }, (_, i) => ({ id: i, name: 'n' + i, children: [{ id: 100 + i, name: 'c' + i }] }));
      expect(await measure(TableFactory.createTableModel({ rows: TreeFactory.buildTreeRows(nodes, { expanded: true }), properties: ['id', 'name'] })))
        .toEqual([1361, 34, 0, 1360]);
    });

    it('row groups and pivot', async () => {
      const groups = RowGroupFactory.createTableModel({
        rows: createSales(), groupBy: ['region', 'produkt'], aggregations: { umsatz: 'sum' },
        columnDefs: [ColumnDef.create({ property: 'region', headerLabel: 'R' }), ColumnDef.create({ property: 'umsatz', headerLabel: 'U' })],
      });
      expect(await measure(groups)).toEqual([466, 34, 34, 408]);
      const pivot = PivotFactory.createTableModel({ rows: createSales(), rowFields: ['region', 'produkt'], columnFields: ['monat'], values: ['umsatz'] });
      expect(await measure(pivot)).toEqual([466, 34, 34, 204]);
    });

    it('master/detail: one open detail row (150 px) adds to the scroll height', async () => {
      const t = mountTable(createOrderModel(createOrders(50)), {
        tableOptions: { masterDetail: { detailRenderer: el => { el.textContent = 'detail'; }, detailHeight: 150 } },
      });
      await nextFrame();
      t.api.setDetailExpanded(t.scope.tableModel.getBodyModel().getRowByIndex(2), true);
      await nextFrame();
      expect(viewportOf(t.host).scrollHeight).toBe(50 * 34 + 150 + 1);
      expect(t.scope.tableModel.getContentHeightInPixel()).toBe(50 * 34);
    });
  });
});
