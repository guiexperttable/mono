// Public API surface of @guiexpert/table.
//
// The snapshot below lists every runtime export of src/index.ts. A removed or renamed export is a breaking change
// for users and turns this test red.
// Added a new export on purpose? → run `pnpm exec vitest run -u src/index.spec.ts` and review the snapshot diff
// (src/__snapshots__/index.spec.ts.snap) before committing it.
//
// Type-only exports (interfaces, type aliases) do not exist at runtime and are therefore not in the snapshot.
import { describe, expect, it } from 'vitest';
import * as api from '@guiexpert/table';
import {
  AutoRestoreOptions,
  ChunkData,
  CoverGridFactory,
  CoverGridTableModel,
  HeaderGroupOptions,
  InputCellRenderer,
  RequestChunk,
  SortedOptions,
  TableModel,
  TableOptions,
  TreeOptions,
} from '@guiexpert/table';
import type { ChunkDataIf, RequestChunkIf, TableModelIf, TableOptionsIf } from '@guiexpert/table';

describe('public API (src/index.ts)', () => {

  it('exports exactly the known set of runtime symbols', async () => {
    const mod = await import('@guiexpert/table');
    expect(Object.keys(mod).sort()).toMatchSnapshot();
  });

  it('has no undefined exports (e.g. from a circular import)', () => {
    const undefinedExports = Object.entries(api).filter(([, v]) => v === undefined).map(([k]) => k);
    expect(undefinedExports).toEqual([]);
  });
});

// Typos in public APIs must not be renamed silently – that would break users (CLAUDE.md §5).
// A rename needs an alias + @deprecated; these tests make sure the old names keep working.
describe('public typo APIs keep existing', () => {

  it('TableModel.prototype.isHeaderVisibe (sic)', () => {
    expect(typeof TableModel.prototype.isHeaderVisibe).toBe('function');
  });

  it('TableModel.prototype.isFooterVisibe (sic)', () => {
    expect(typeof TableModel.prototype.isFooterVisibe).toBe('function');
  });

  it('TableModelIf declares isHeaderVisibe / isFooterVisibe (sic)', () => {
    // compile-time check: fails `pnpm test:types` when the interface member is renamed
    const check = (m: TableModelIf): [boolean, boolean] => [m.isHeaderVisibe(), m.isFooterVisibe()];
    expect(typeof check).toBe('function');
  });

  it('CoverGridTableModel.prototype.isHeaderVisibe / isFooterVisibe (sic)', () => {
    expect(typeof CoverGridTableModel.prototype.isHeaderVisibe).toBe('function');
    expect(typeof CoverGridTableModel.prototype.isFooterVisibe).toBe('function');
  });

  it('TableOptions has the field showCheckboxWihoutExtraColumn (sic), default false', () => {
    const options: TableOptionsIf = new TableOptions();
    expect(options).toHaveProperty('showCheckboxWihoutExtraColumn', false);
    expect(options.showCheckboxWihoutExtraColumn).toBe(false);
  });

  it('CoverGridFactory.createCoverGrisDefaultOptions (sic)', () => {
    expect(typeof CoverGridFactory.createCoverGrisDefaultOptions).toBe('function');
    const options = CoverGridFactory.createCoverGrisDefaultOptions(120);
    expect(options.defaultRowHeights).toEqual({ header: 0, body: 120, footer: 0 });
  });

  it('RequestChunk has the field emmitDataKey (sic) as first constructor parameter', () => {
    const chunk: RequestChunkIf = new RequestChunk('data-key', 'cancel-key', 'q1', 'f', 's', 0, 9);
    expect(chunk.emmitDataKey).toBe('data-key');
    expect(chunk.emmitCancelKey).toBe('cancel-key');
    expect(chunk).toMatchObject({ queryId: 'q1', filter: 'f', sorting: 's', startIndex: 0, endIndex: 9 });
  });

  it('ChunkData passes emmitDataKey (sic) through to RequestChunk', () => {
    const chunk: ChunkDataIf<string> = new ChunkData<string>('data-key', 'cancel-key', 'q1', 'f', 's', 0, 1, ['a', 'b']);
    expect(chunk).toBeInstanceOf(RequestChunk);
    expect(chunk.emmitDataKey).toBe('data-key');
    expect(chunk.rows).toEqual(['a', 'b']);
  });
});

describe('TableOptions defaults', () => {
  const o = new TableOptions();

  it('overflowX / overflowY are "auto"', () => {
    expect(o.overflowX).toBe('auto');
    expect(o.overflowY).toBe('auto');
  });

  it('all borders and separators are visible', () => {
    expect(o.horizontalBorderVisible).toBe(true);
    expect(o.verticalBorderVisible).toBe(true);
    expect(o.footerSeparatorBorderVisible).toBe(true);
    expect(o.headerSeparatorBorderVisible).toBe(true);
    expect(o.fixedEastSeparatorBorderVisible).toBe(true);
    expect(o.fixedWestSeparatorBorderVisible).toBe(true);
    expect(o.tableTopBorderVisible).toBe(true);
    expect(o.tableBottomBorderVisible).toBe(true);
  });

  it('vertical separators in header and footer are off', () => {
    expect(o.headerVerticalSeparator).toBe(false);
    expect(o.footerVerticalSeparator).toBe(false);
  });

  it('row and column hover are visible', () => {
    expect(o.hoverRowVisible).toBe(true);
    expect(o.hoverColumnVisible).toBe(true);
  });

  it('columns are resizable (4 px handle) and draggable', () => {
    expect(o.columnsResizable).toBe(true);
    expect(o.columnsDraggable).toBe(true);
    expect(o.columnResizeHandleWidthInPx).toBe(4);
  });

  it('default row heights are 34 / 34 / 34 px', () => {
    expect(o.defaultRowHeights).toEqual({ header: 34, body: 34, footer: 34 });
  });

  it('every instance gets its own defaultRowHeights object', () => {
    const a = new TableOptions();
    const b = new TableOptions();
    expect(a.defaultRowHeights).not.toBe(b.defaultRowHeights);
    a.defaultRowHeights.body = 99;
    expect(b.defaultRowHeights.body).toBe(34);
  });

  it('headerToggleExpandCollapseIcons is false', () => {
    expect(o.headerToggleExpandCollapseIcons).toBe(false);
  });

  it('checkbox without extra column is off', () => {
    expect(o.showCheckboxWihoutExtraColumn).toBe(false);
  });

  it('has no external filter function', () => {
    expect(o.externalFilterFunction).toBeUndefined();
  });

  it('sort order cycles asc → desc (no unsorted state)', () => {
    expect(o.sortOrder).toEqual(['asc', 'desc']);
  });

  it('shortcuts are enabled and use the built-in OS mapping (no own mapping)', () => {
    expect(o.shortcutActionsDisabled).toBe(false);
    expect(o.shortcutActionIdMapping).toBeUndefined();
  });

  it('resize events are debounced by 500 ms', () => {
    expect(o.resizeEventDebounceDelay).toBe(500);
  });

  it('autoRestoreOptions is not set (nothing is persisted)', () => {
    expect((o as TableOptionsIf).autoRestoreOptions).toBeUndefined();
  });

  it('selection and focus model getters are not set (every table creates its own)', () => {
    expect(o.getSelectionModel).toBeUndefined();
    expect(o.getFocusModel).toBeUndefined();
  });

  it('the default edit renderer is a new InputCellRenderer per call', () => {
    expect(o.getEditRenderer).toBeTypeOf('function');
    const r1 = o.getEditRenderer!(0, 0);
    const r2 = o.getEditRenderer!(1, 1);
    expect(r1).toBeInstanceOf(InputCellRenderer);
    expect(r1).not.toBe(r2);
  });

  it('treeOptions: arrow icons and their CSS classes', () => {
    expect(o.treeOptions).toBeInstanceOf(TreeOptions);
    expect(o.treeOptions.arrowExpanded).toEqual({
      content: '>',
      style: 'transform: rotate(90deg) translate(66%, -66%); transform-origin: 0 0;',
      classes: ['gt-table-tree-arrow-expanded'],
    });
    // NOTE: the collapsed arrow uses the prefix "ge-" while all other tree icon classes use "gt-".
    expect(o.treeOptions.arrowCollapsed).toEqual({ content: '>', style: '', classes: ['ge-table-tree-arrow-collapsed'] });
    expect(o.treeOptions.arrowPlaceholder).toEqual({ content: '>', style: 'color:transparent;', classes: ['gt-table-tree-arrow-hidden'] });
    expect(o.treeOptions.arrowExpandCollapseAll).toEqual({ content: '↕', style: '', classes: ['gt-table-tree-arrow-expanded-all'] });
  });

  it('headerGroupOptions: expanded / collapsed icons', () => {
    expect(o.headerGroupOptions).toBeInstanceOf(HeaderGroupOptions);
    expect(o.headerGroupOptions.iconExpanded).toEqual({ content: '❯', style: '', classes: ['gt-table-icon-expanded'] });
    expect(o.headerGroupOptions.iconCollapsed).toEqual({
      content: '❯',
      style: 'transform: rotate(180deg) translate(-100%, -100%); transform-origin: 0 0;',
      classes: ['ge-table-icon-collapsed'],
    });
  });

  it('sortedOptions: ↑ / ↓ icons and a transparent placeholder', () => {
    expect(o.sortedOptions).toBeInstanceOf(SortedOptions);
    expect(o.sortedOptions.iconAsc).toEqual({ content: '↑', style: '', classes: ['ge-header-sorted-asc'] });
    expect(o.sortedOptions.iconDesc).toEqual({ content: '↓', style: '', classes: ['ge-header-sorted-desc'] });
    expect(o.sortedOptions.iconPlaceholder).toEqual({ content: '↑', style: 'color:transparent;', classes: [] });
  });

  it('can be spread into a TableOptionsIf (documented usage pattern)', () => {
    const opts: TableOptionsIf = { ...new TableOptions(), hoverColumnVisible: false };
    expect(opts.hoverColumnVisible).toBe(false);
    expect(opts.hoverRowVisible).toBe(true);
    expect(opts.defaultRowHeights).toEqual({ header: 34, body: 34, footer: 34 });
  });
});

describe('AutoRestoreOptions defaults', () => {
  const o = new AutoRestoreOptions<{ id?: number; uuid?: string; name?: string }>();

  it('everything is off and there is no storage key function', () => {
    expect(o.autoRestoreSortingState).toBe(false);
    expect(o.autoRestoreCollapsedExpandedState).toBe(false);
    expect(o.autoRestoreScrollPosition).toBe(false);
    expect(o.autoRestoreCheckedState).toBe(false);
    expect(o.autoRestoreSelectedState).toBe(false);
    expect(o.getStorageKeyFn).toBeUndefined();
  });

  it('getRowId prefers "id", then "uuid", then the JSON of the row', () => {
    expect(o.getRowId({ id: 7, uuid: 'u' })).toBe(7);
    expect(o.getRowId({ uuid: 'u' })).toBe('u');
    expect(o.getRowId({ name: 'x' })).toBe('{"name":"x"}');
  });
});

describe('CoverGridFactory.createCoverGrisDefaultOptions', () => {

  it('switches off all borders and hover effects', () => {
    const o = CoverGridFactory.createCoverGrisDefaultOptions(200);
    expect(o).toMatchObject({
      horizontalBorderVisible: false,
      verticalBorderVisible: false,
      footerSeparatorBorderVisible: false,
      headerSeparatorBorderVisible: false,
      fixedEastSeparatorBorderVisible: false,
      fixedWestSeparatorBorderVisible: false,
      tableTopBorderVisible: false,
      tableBottomBorderVisible: false,
      hoverColumnVisible: false,
      hoverRowVisible: false,
    });
  });

  it('keeps the other TableOptions defaults', () => {
    const o = CoverGridFactory.createCoverGrisDefaultOptions(200);
    expect(o.columnsResizable).toBe(true);
    expect(o.sortOrder).toEqual(['asc', 'desc']);
  });

  it('remembers only the scroll position, under the key "CoverGrid" by default', () => {
    const o = CoverGridFactory.createCoverGrisDefaultOptions(200);
    expect(o.autoRestoreOptions).toMatchObject({
      autoRestoreCollapsedExpandedState: false,
      autoRestoreScrollPosition: true,
      autoRestoreSortingState: false,
      autoRestoreSelectedState: false,
      autoRestoreCheckedState: false,
    });
    expect(o.autoRestoreOptions?.getStorageKeyFn?.()).toBe('CoverGrid');
  });

  it('uses the given storage key function', () => {
    const o = CoverGridFactory.createCoverGrisDefaultOptions(200, () => 'covers');
    expect(o.autoRestoreOptions?.getStorageKeyFn?.()).toBe('covers');
  });
});
