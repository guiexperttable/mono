import type { RowDragService } from "./row-drag/row-drag-service";
import type { BatchEditService } from "./batch-edit/batch-edit-service";
import type { FillHandleService } from "./fill/fill-handle-service";
import type { CellEditorService } from "./sheet-editing/cell-editor-service";
import { TableOverlayChange } from "./overlay/table-overlay";
import { EleScope } from './ele-scope';
import { TableModelIf } from './data/tablemodel/table-model.if';
import { AddColumnDivPara, ConvenienceDomService } from './service/convenience-dom.service';
import { TableOptionsIf } from './data/options/table-options.if';
import { CellRange } from './data/common/cell-range';
import { RendererCleanupFnType } from './renderer/renderer-cleanup-fn.type';
import { AreaIdent } from './data/tablemodel/area-ident.type';
import { SideIdent } from './data/side-ident.type';
import { DivScope } from './data/div-scope.type';
import type { AreaModelTree } from './data/tablemodel/areamodel/area-model-tree';
import type { DerivedValuesChangeIf } from './data/tablemodel/areamodel/derived-values-change.if';
import { AreaModelIf } from './data/tablemodel/areamodel/area-model.if';
import { ArgsAdjustColumnsToRowParentParams } from './data/common/args-adjust-columns-to-row-parent-params';
import { ArgsRenderCellDiv } from './data/common/args-render-cell-div';
import { TreeArrowType } from './data/common/tree-arrow.type';
import { TreeRow } from './data/common/tree-row';
import { StoreStateScrollPosService } from './service/store-state-scroll-pos.service';
import { GeMouseEvent } from './data/common/event/ge-mouse-event';
import { GeoData } from './data/geo-data';
import { CellRendererIf } from './renderer/cell-render.if';
import { SelectionModelIf } from './selection/selection-model.if';
import { SelectionModel } from './selection/selection-model';
import { GetT } from './data/common/get-t';
import { FocusModelIf } from './focus/focus-model.if';
import { FocusModel } from './focus/focus-model';
import { ColAndRowspanModel } from './data/tablemodel/areamodel/col-and-rowspan-model';
import { AreaObjectMapType } from './data/common/area-map.type';
import { AreaObjectMap } from './data/common/area-map';
import { TableCellUpdateEventIf } from './data/common/event/input/table-cell-update-event.if';
import { isAreaModelAggregateFooter, isAreaModelRowGroups, isAreaModelTree, isCheckboxCellRenderer, isRowNumberColumnDef, isTreeRow } from './instanceof-workaround';
import { getLeadingRowNumberColumnCount } from './data/common/row-number-columns';
import type { RowNumberColumnDef } from './data/common/row-number-column-def';
import { AriaGridInfo } from './aria/aria-grid-info';
import { TreeAriaInfo, TreeAriaModel } from './aria/tree-aria-info';
import { AriaTexts } from './aria/aria-texts';
import { AriaTextsIf } from './aria/aria-texts.if';
import { RowLayout } from './row-layout/row-layout';
import type { MasterDetailService } from './master-detail/master-detail-service';


/**
 * Represents a cell in the ArgsRender.
 * @interface
 */
interface ArgsRenderCell {
  areaModel: AreaModelIf;
  areaIdent: AreaIdent;
  sideIdent: SideIdent;
  rowIndex: number;
  columnIndex: number;
  left: number;
  top: number;
  width: number;
  height: number;
  parent: HTMLDivElement;
  cellSelected: boolean;
  lastRowOfModel: boolean;
  gammaRange: boolean;
}

/**
 * Represents the arguments passed to the renderHeaderCellResizeHandle method.
 * @interface
 */
interface ArgsRenderHeaderCellResizeHandle {
  rowIndex: number;
  columnIndex: number;
  cellLeft: number;
  cellTop: number;
  cellWidth: number;
  cellHeight: number;
  parent: HTMLDivElement;
}


/** @category Internals */
export class RenderScope extends EleScope {

  public firstVisibleRowIndex = -1;
  public lastVisibleRowIndex = -1;
  public firstFullVisibleRowIndex = -1;
  public lastFullVisibleRowIndex = -1;
  public displayedRowCount = 0;

  public pixelLimitForFullVisible = 5;
  public loggingActive = false;

  protected dragging = false;
  protected editing = false;
  protected storedColumnWidths: number[] = [];
  /** @deprecated since 1.1.92 – no longer used, see {@link TableStateService}. */
  protected storeScrollPosStateService?: StoreStateScrollPosService;
  protected getSelectionModel?: GetT<SelectionModelIf>;
  protected getFocusModel?: GetT<FocusModelIf>;
  protected scrollLeft = 0;
  protected scrollViewportLeft = 0;
  protected scrollFactorY = 0;
  protected scrollFactorX = 0;
  protected readonly cleanupFunctions: {
    header: (RendererCleanupFnType)[],
    body: (RendererCleanupFnType)[],
    footer: (RendererCleanupFnType)[],
  } = {
    header: [],
    body: [],
    footer: []
  };
  protected tree = false;
  protected colAndRowspanModels: AreaObjectMapType<ColAndRowspanModel> = new AreaObjectMap<ColAndRowspanModel>();
  protected draggingTargetColumnIndex = -1;
  protected mouseEvent?: GeMouseEvent;
  /** Content pixels scrolled out at the top, i.e. the offset that is actually rendered (see adjustBody). */
  protected contentScrollTop = 0;
  /** Exact content position requested by scrollToPixel() for a capped scroll height (see TableScope). */
  protected pendingContentScroll?: { scrollTop: number; contentTop: number };
  /** Area heights read once at the start of adjustAfterScrolling() (before the DOM is modified). */
  protected areaHeightsOfRenderPass?: { [key in AreaIdent]?: number };

  protected debounceTimeout?: ReturnType<typeof setTimeout> | null;
  private editorRenderer?: CellRendererIf;
  private editorRendererColumn?: number;
  private editorRendererRow?: number;
  private removables: HTMLDivElement[] = [];

  /** Texts for screen readers (English defaults + `tableOptions.ariaTexts`). @since 1.1.91 */
  readonly ariaTexts: AriaTextsIf;
  /** Row/column numbers of the current render pass (see {@link getAriaGridInfo}). */
  private ariaGridInfo?: AriaGridInfo;
  private readonly treeAriaInfo = new TreeAriaInfo();
  /** The cell that has the keyboard focus in this render pass (→ `aria-activedescendant`). */
  private ariaFocusedCell?: { element: HTMLDivElement, area: AreaIdent, rowIndex: number, columnIndex: number };
  /** `aria-selected` on body cells ("cell") or rows ("row") – from the type of the selection model. */
  private ariaSelectionKind: 'none' | 'cell' | 'row' = 'none';
  /** Span cells rendered in their row this pass – drawBigCell() draws them again on top (screen readers: once). */
  private renderedSpanCells = new Set<string>();
  /**
   * The header cell with the keyboard focus (row, column of the cell's origin) – set by the arrow-up key in the
   * first body row, see `TableScope`. `undefined`: the focus is in the body ({@link FocusModelIf}).
   */
  protected headerFocus?: [number, number];

  /**
   * Row drag of this table (drag handles, pointer and keyboard drag) – created by {@link TableScope}.
   * @since 1.1.95
   */
  rowDragService?: RowDragService;

  /**
   * Batch edit of this table (pending values, shown in the cells) – created by {@link TableScope}.
   * @since 1.1.96
   */
  batchEditService?: BatchEditService;

  /**
   * Fill handle of this table – created by {@link TableScope}.
   * @since 1.1.96
   */
  fillHandleService?: FillHandleService;

  /**
   * Excel-style editing of this table (the editor above the cell) – created by {@link TableScope} with
   * `tableOptions.editing`.
   * @since 1.1.99
   */
  cellEditorService?: CellEditorService;

  /**
   * The text of the open in-cell editor (`getEditRenderer`): the cell is rebuilt on every repaint, the text and
   * the caret are put back (before 1.1.99 the typed text was lost when the table scrolled or repainted).
   */
  private editorDraft?: { rowIndex: number; columnIndex: number; value: string; start: number | null; end: number | null };

  /**
   * Master/detail of this table (detail rows below master rows) – created by {@link TableScope} with
   * `tableOptions.masterDetail`.
   * @since 1.1.97
   */
  masterDetailService?: MasterDetailService;

  /** Positions of the body rows (prefix sums of the heights + detail rows), see {@link getBodyRowLayout}. */
  private readonly bodyRowLayout = new RowLayout();
  private bodyRowLayoutDirty = true;
  private bodyRowLayoutModel?: AreaModelIf;

  constructor(
    hostElement: HTMLDivElement,
    tableModel: TableModelIf,
    dom: ConvenienceDomService,
    tableOptions: TableOptionsIf
  ) {
    super(hostElement, tableModel, dom, tableOptions);
    this.ariaTexts = AriaTexts.create(tableOptions?.ariaTexts);

    // Selection model: table model → table options → an own model of THIS table.
    // (Before 1.1.90 the default was one module-wide SelectionModel/FocusModel shared by all tables.)
    if (this.tableModel.getSelectionModel?.()) {
      this.getSelectionModel = () => this.tableModel.getSelectionModel();
    } else if (this.tableOptions?.getSelectionModel) {
      this.getSelectionModel = this.tableOptions.getSelectionModel;
    } else {
      const ownSelectionModel = new SelectionModel();
      this.getSelectionModel = () => ownSelectionModel;
    }

    if (this.tableOptions?.getFocusModel) {
      this.getFocusModel = this.tableOptions.getFocusModel;
    } else {
      const ownFocusModel = new FocusModel("cell");
      this.getFocusModel = () => ownFocusModel;
    }
    if (isAreaModelTree(tableModel.getAreaModel('body'))) {
      this.tree = true;
    }
    const aereaIds: AreaIdent[] = ['header', 'body', 'footer'];
    aereaIds.forEach(
      areaIdent => {
        this.colAndRowspanModels[areaIdent] = new ColAndRowspanModel(tableModel, tableModel.getAreaModel(areaIdent));
        this.colAndRowspanModels[areaIdent]?.init();
      }
    );
  }


  /**
   * The DOM service of this table (all DOM access of the table goes through it).
   *
   * @returns {ConvenienceDomService} the service
   * @since 1.1.95
   */
  getDomService(): ConvenienceDomService {
    return this.dom;
  }

  /**
   * The visible body in client (viewport) coordinates – including fixed west/east columns, without the scroll bar –
   * and the content pixels scrolled out at its top. Row drag computes the row under the pointer with it.
   *
   * @returns {{ top: number, height: number, left: number, width: number, contentScrollTop: number }} the geometry
   * @since 1.1.95
   */
  getBodyViewport(): { top: number; height: number; left: number; width: number; contentScrollTop: number } {
    const host = this.hostElement;
    const rect = host.getBoundingClientRect();
    return {
      top: rect.top + host.clientTop + this.tableModel.getPadding().top,
      height: this.areaBodyCenterGeo.height,
      left: rect.left + host.clientLeft,
      width: this.scrollViewport.clientWidth,
      contentScrollTop: this.contentScrollTop
    };
  }

  /**
   * The rectangle of a body cell in host coordinates (relative to the padding box of the host) – computed from the
   * row and column positions, also for cells that are not rendered – and the visible part of its area (`clip…`: the
   * body between header and footer, horizontally the fixed west/east area or the scrollable center).
   *
   * @param {number} rowIndex - display index
   * @param {number} columnIndex - model index
   * @returns {{ left: number, top: number, width: number, height: number, clipLeft: number, clipRight: number, clipTop: number, clipBottom: number }} the geometry
   * @since 1.1.96
   */
  getBodyCellRectInHost(rowIndex: number, columnIndex: number): {
    left: number; top: number; width: number; height: number;
    clipLeft: number; clipRight: number; clipTop: number; clipBottom: number;
  } {
    const tableModel = this.tableModel;
    const body = tableModel.getBodyModel();
    const padding = tableModel.getPadding();
    const hostWidth = this.hostElement.clientWidth;
    const hostHeight = this.hostElement.clientHeight;
    const top = padding.top + this.getBodyRowTop(rowIndex) - this.contentScrollTop;
    const left = this.getColumnLeftInHost(columnIndex, tableModel.getXPosByColumnIndex(columnIndex));
    const columnCount = tableModel.getColumnCount();
    const fixedLeft = tableModel.getFixedLeftColumnCount();
    const fixedRight = tableModel.getFixedRightColumnCount();
    let clipLeft = padding.left;
    let clipRight = hostWidth - padding.right;
    if (columnIndex < fixedLeft) {
      clipLeft = 0;
      clipRight = padding.left;
    } else if (fixedRight > 0 && columnIndex >= columnCount - fixedRight) {
      clipLeft = hostWidth - padding.right;
      clipRight = hostWidth;
    }
    return {
      left, top,
      width: tableModel.getColumnWidth(columnIndex),
      height: body.getRowHeight(rowIndex),
      clipLeft, clipRight,
      clipTop: padding.top,
      clipBottom: hostHeight - padding.bottom
    };
  }

  /**
   * The body cell at a point in host coordinates, clamped to the body (a point above the body = row 0, right of the
   * columns = the last column …) – computed, not read from the DOM.
   *
   * @param {number} x - x relative to the host's padding box
   * @param {number} y - y relative to the host's padding box
   * @returns {[number, number]} row and column index, `[-1, -1]` without rows or columns
   * @since 1.1.96
   */
  getBodyCellAtHostPoint(x: number, y: number): [number, number] {
    const tableModel = this.tableModel;
    const body = tableModel.getBodyModel();
    const rowCount = body.getRowCount();
    const columnCount = tableModel.getColumnCount();
    if (rowCount < 1 || columnCount < 1) {
      return [-1, -1];
    }
    const padding = tableModel.getPadding();
    const hostWidth = this.hostElement.clientWidth;
    const bodyHeight = this.hostElement.clientHeight - padding.top - padding.bottom;
    const contentY = Math.min(Math.max(y - padding.top, 0), Math.max(0, bodyHeight - 1)) + this.contentScrollTop;
    const rowIndex = this.getBodyRowIndexAtY(contentY);

    const fixedLeft = tableModel.getFixedLeftColumnCount();
    const fixedRight = tableModel.getFixedRightColumnCount();
    let first: number;
    let last: number;
    let absX: number;
    if (fixedLeft > 0 && x < padding.left) {
      [first, last, absX] = [0, fixedLeft - 1, x];
    } else if (fixedRight > 0 && x >= hostWidth - padding.right) {
      const firstEast = columnCount - fixedRight;
      [first, last, absX] = [firstEast, columnCount - 1, x - (hostWidth - padding.right) + tableModel.getXPosByColumnIndex(firstEast)];
    } else {
      const centerRight = hostWidth - padding.right;
      const cx = Math.min(Math.max(x, padding.left), Math.max(padding.left, centerRight - 1));
      [first, last, absX] = [fixedLeft, columnCount - fixedRight - 1, cx + this.getContentScrollLeft()];
    }
    let columnIndex = last;
    for (let c = first; c <= last; c++) {
      if (absX < tableModel.getXPosByColumnIndex(c) + tableModel.getColumnWidth(c)) {
        columnIndex = c;
        break;
      }
    }
    return [rowIndex, Math.min(columnCount - 1, Math.max(first, columnIndex))];
  }

  /**
   * The positions of the body rows: prefix sums of the row heights (O(log n) lookups also for variable heights) plus
   * the heights of open detail rows. Built lazily – again after {@link invalidateRowLayout}, a new body model or
   * another row count.
   *
   * @returns {RowLayout} the layout of the body rows
   * @since 1.1.97
   */
  getBodyRowLayout(): RowLayout {
    const body = this.tableModel.getBodyModel();
    const rowCount = body.getRowCount();
    const layout = this.bodyRowLayout;
    if (this.bodyRowLayoutDirty || this.bodyRowLayoutModel !== body || layout.getRowCount() !== rowCount) {
      this.bodyRowLayoutDirty = false;
      this.bodyRowLayoutModel = body;
      const tableModel = this.tableModel;
      layout.setRows(rowCount, i => tableModel.getRowHeight('body', i), body.getConstantRowHeight?.());
      const extras = this.masterDetailService?.computeExtras();
      layout.setExtras(extras?.rowIndices ?? [], extras?.heights ?? []);
    }
    return layout;
  }

  /**
   * Marks the positions of the body rows as outdated (rows filtered, sorted, edited, added or removed, a detail row
   * opened or closed) – they are computed again on the next access.
   *
   * @since 1.1.97
   */
  invalidateRowLayout(): void {
    this.bodyRowLayoutDirty = true;
  }

  /**
   * Sets the height of the detail row behind one body row in the current row layout without building it again
   * (a detail row was expanded or collapsed). Does nothing if the layout is outdated anyway.
   *
   * @param {number} rowIndex - display index of the master row
   * @param {number} height - the detail height, 0 = none
   * @returns {boolean} true if the layout was updated, false if it is outdated (it is built again on the next access)
   * @since 1.1.97
   */
  setBodyRowExtra(rowIndex: number, height: number): boolean {
    const body = this.tableModel.getBodyModel();
    if (this.bodyRowLayoutDirty || this.bodyRowLayoutModel !== body
      || this.bodyRowLayout.getRowCount() !== body.getRowCount()) {
      return false;
    }
    this.bodyRowLayout.setExtra(rowIndex, height);
    return true;
  }

  /** True if open detail rows take space between the body rows. */
  protected hasBodyRowExtras(): boolean {
    return !!this.masterDetailService?.hasExpanded() && this.getBodyRowLayout().getExtraCount() > 0;
  }

  /**
   * The top of a body row in content pixels: {@link AreaModelIf.getYPosByRowIndex} plus the heights of the open detail
   * rows above it (master/detail).
   *
   * @param {number} rowIndex - display index
   * @returns {number} px from the top of the first body row
   * @since 1.1.97
   */
  getBodyRowTop(rowIndex: number): number {
    // with open detail rows from the prefix sums (O(1), consistent with getBodyRowIndexAtY); without them unchanged
    return this.hasBodyRowExtras()
      ? this.getBodyRowLayout().getTop(rowIndex)
      : this.tableModel.getBodyModel().getYPosByRowIndex(rowIndex);
  }

  /**
   * The body row at a content position (a position in an open detail row belongs to its master row). Above the rows:
   * 0, below: the last row, without rows: -1.
   *
   * @param {number} contentY - px from the top of the first body row
   * @returns {number} display index
   * @since 1.1.97
   */
  getBodyRowIndexAtY(contentY: number): number {
    return this.getBodyRowLayout().findIndexAt(contentY);
  }

  /**
   * Scroll bar pixels per content pixel: 1, below 1 for a capped scroll height ({@link isScrollHeightCapped}).
   *
   * @returns {number} the factor for `scrollTop` changes
   * @since 1.1.95
   */
  getScrollerToContentRatioY(): number {
    if (!this.isScrollHeightCapped()) {
      return 1;
    }
    const contentRange = this.getContentScrollRangeY();
    const scrollerRange = this.getScrollerRangeY();
    return contentRange > 0 && scrollerRange > 0 ? scrollerRange / contentRange : 1;
  }

  isEditing() {
    return this.editing || !!this.cellEditorService?.isOpen();
  }

  /**
   * The cell of the open editor inside a cell (`getEditRenderer`, the way before Excel-style editing).
   *
   * @returns {[number, number] | undefined} display row and model column, `undefined` without such an editor
   * @since 1.1.99
   */
  getInCellEditorCell(): [number, number] | undefined {
    return this.editing && this.editorRenderer && (this.editorRendererRow ?? -1) >= 0
      ? [this.editorRendererRow!, this.editorRendererColumn!] : undefined;
  }

  /**
   * Remembers the text of the open in-cell editor (called on every input, see {@link InputHandler}) so that a
   * repaint keeps it.
   *
   * @param {number} rowIndex - display row index of the edited cell
   * @param {number} columnIndex - model column index
   * @param {HTMLInputElement | HTMLTextAreaElement} input - the editor element
   * @since 1.1.99
   */
  setEditorDraft(rowIndex: number, columnIndex: number, input: HTMLInputElement | HTMLTextAreaElement): void {
    if (this.editing && this.editorRendererRow === rowIndex && this.editorRendererColumn === columnIndex) {
      let start: number | null = null;
      let end: number | null = null;
      try {
        start = input.selectionStart;
        end = input.selectionEnd;
      } catch {
        // input types without a selection
      }
      this.editorDraft = { rowIndex, columnIndex, value: input.value, start, end };
    }
  }


  /**
   * Resets the editor renderer by clearing its values and state.
   *
   * @function resetEditorRenderer
   * @memberof ClassName
   *
   * @returns {void}
   */
  resetEditorRenderer() {
    this.editorRenderer = undefined;
    this.editorRendererRow = -1;
    this.editorRendererColumn = -1;
    this.editing = false;
    this.editorDraft = undefined;
  }

  /**
   * Clears the selection in the component.
   *
   * @param {boolean} rerender - Indicates whether to rerender the component after clearing the selection. Default value is false.
   *
   * @return {void}
   */
  clearSelection(rerender: boolean = false) {
    if (this.getSelectionModel) {
      const sm = this.getSelectionModel();
      sm?.clear();
      if (rerender) {
        this.repaint();
      }
    }
  }

  /**
   * Initializes and renders the editor for a specified row and column index.
   *
   * @param {number} rowIdx - The index of the row.
   * @param {number} colIdx - The index of the column.
   */
  initRenderEditor(rowIdx: number, colIdx: number) {
    let rnFn = this.tableModel.getColumnDef(colIdx)?.getEditRenderer;
    if (!rnFn) {
      rnFn = this.tableOptions.getEditRenderer;
    }

    if (rnFn) {
      this.editorRenderer = rnFn(rowIdx, colIdx);

      if (this.editorRenderer) {
        this.editorRendererRow = rowIdx;
        this.editorRendererColumn = colIdx;
        this.editing = true;
        this.repaint();
        // request focus:
        const input = this.hostElement.querySelector('input.ge-table-cell-editor-input') as HTMLInputElement;
        if (input) {
          input.focus();
        }

      } else {
        this.resetEditorRenderer();
      }
    }
  }


  /**
   * Adjusts the content after scrolling and initiates a repaint of the component.
   *
   * @return {void}
   */
  repaint() {
    this.adjustAfterScrolling();
  }

  /**
   * Drops cached, derived values of the area models ({@link AreaModelIf.invalidateDerivedValues}, e.g. the totals of an
   * {@link AreaModelAggregateFooter}) – called where data may have changed (filter, sorting, editing, `updateCells`,
   * the public `tableApi.repaint()` / `repaintHard()`), not on scrolling.
   *
   * @param {DerivedValuesChangeIf} [change] - the changed rows of an edit or `updateCells()` (models may recompute less)
   * @since 1.1.94
   */
  invalidateAggregates(change?: DerivedValuesChangeIf): void {
    if (!change) {
      // filtered, sorted, moved, rows replaced …: other rows (heights, open detail rows) at the indices. Value changes of
      // known rows (an edit, updateCells – `change` given) keep the positions: no O(n) rebuild per live-data tick.
      this.invalidateRowLayout();
    }
    for (const areaIdent of ['header', 'body', 'footer'] as const) {
      this.tableModel.getAreaModel(areaIdent)?.invalidateDerivedValues?.(change);
    }
  }


  /**
   * Repaints the UI by resetting the size of the wrapper div,
   * adjusting the containers and rows, and performing additional adjustments
   * after scrolling.
   *
   * @return {void} This method does not return any value.
   */
  repaintHard() {
    // rows were added/removed (setRows, filter, tree toggle …): the col-/rowspan ranges must match the new rows
    for (const areaIdent of ['header', 'body', 'footer'] as const) {
      this.colAndRowspanModels[areaIdent]?.initIfRowCountChanged();
    }
    this.tableModel.recalcHeightAndPadding();
    this.invalidateRowLayout();
    this.resetSizeOfWrapperDiv();
    this.adjustContainersAndRows();
    this.adjustAfterScrolling();
  }

  /**
   * Recalculates the column widths of the table (% and weight columns depend on the available width) and repaints.
   *
   * @param {number} [clientWidth] - The (new) width of the host element, e.g. from a ResizeObserver.
   *                                 Default: its current width.
   *
   * @return {undefined}
   */
  recalcColumnWidths(clientWidth?: number) {
    // The scroll viewport may still have the size from before a host resize (it is resized in repaintHard()),
    // so the width is taken from the host, not from the viewport.
    const widthInPixel = this.getAvailableColumnWidth(clientWidth);
    if (widthInPixel > 0) {
      this.tableModel.setParentWidth(widthInPixel);
    }
    this.tableModel.init();
    this.repaintHard();
  }

  /**
   * The width that % and weight columns share: host width minus the fixed west columns and a vertical scroll bar.
   *
   * @param {number} [hostWidth] - the width of the host element (default: its current client width)
   * @returns {number} the width in px (0 if the host has no width yet, e.g. while it is hidden)
   */
  protected getAvailableColumnWidth(hostWidth: number = this.hostElement.clientWidth): number {
    const verticalScrollBarWidth = Math.max(0, this.scrollViewport.offsetWidth - this.scrollViewport.clientWidth);
    return Math.max(0, hostWidth - this.tableModel.getPadding().left - verticalScrollBarWidth);
  }


  /**
   * Adjusts the table after scrolling. This method performs various adjustments
   * to the table's appearance and behavior after a scroll event occurs.
   */
  override adjustAfterScrolling() {
    if (!this.adjustingRowNumberWidth && this.adjustRowNumberColumnWidth()) {
      // the fixed west area got wider or narrower: new geometry first (it renders the table again – once: the flag
      // stops a second width change in the nested pass)
      this.adjustingRowNumberWidth = true;
      try {
        if (this.tableModel.getColumnDefs?.()?.some(def => def.width?.unit === 'weight' || def.width?.unit === '%')) {
          // % and weight columns share the width left of the fixed columns – it changed
          this.tableModel.recalcPadding();
          const available = this.getAvailableColumnWidth();
          if (available > 0) {
            this.tableModel.setParentWidth(available);
            this.tableModel.init();
          }
        }
        this.tableModel.recalcPadding();
        this.resetSizeOfWrapperDiv();
        this.adjustContainersAndRows();
      } finally {
        this.adjustingRowNumberWidth = false;
      }
      return;
    }
    for (const cleaning of this.removables) {
      cleaning.remove();
    }
    this.hideHoverRow();
    this.hideHoverColumn();

    this.scrollTop = this.scrollViewport.scrollTop;
    this.scrollLeft = this.getViewportScrollLeft(); // from the start (right-to-left: 0 at the right, see 1.1.98)
    this.scrollViewportLeft = this.scrollLeft; // read once per render pass (was read for every row)

    this.scrollFactorY = this.scrollTop / (this.scrollViewport.scrollHeight - this.scrollViewport.clientHeight);
    this.scrollFactorX = this.scrollLeft / (this.scrollViewport.scrollWidth - this.scrollViewport.clientWidth);

    if (isNaN(this.scrollFactorY)) {
      this.scrollFactorY = 0;
    }
    // scrollToPixel() on a capped scroll height: the scroll bar has a coarser resolution than the content,
    // so we render exactly the requested content position as long as the scroll bar was not moved.
    if (this.pendingContentScroll) {
      const range = this.getContentScrollRangeY();
      if (Math.abs(this.scrollTop - this.pendingContentScroll.scrollTop) <= 1 && range > 0) {
        this.scrollFactorY = Math.min(1, Math.max(0, this.pendingContentScroll.contentTop / range));
      } else {
        this.pendingContentScroll = undefined;
      }
    }
    if (isNaN(this.scrollFactorX)) {
      this.scrollFactorX = 0;
    }

    // Read all geometry BEFORE the DOM is modified: every layout read after a modification forces a
    // synchronous layout of the whole table (before: ~5 forced layouts per scroll frame, now 1).
    const hostWidth = this.hostElement.clientWidth;
    const hostHeight = this.hostElement.clientHeight;
    const westWidth = this.areaBodyWest.child.clientWidth;
    const headerHeight = this.areaHeaderCenter.child.clientHeight;
    this.areaHeightsOfRenderPass = {
      body: this.areaBodyCenter.child.clientHeight,
      footer: this.areaFooterCenter.child.clientHeight,
      header: headerHeight
    };
    this.ariaGridInfo = AriaGridInfo.create(this.tableModel);
    this.ariaSelectionKind = this.getAriaSelectionKind();
    this.ariaFocusedCell = undefined;
    this.renderedSpanCells.clear();
    try {
      this.adjustBody();
      this.adjustArea('footer');
      this.adjustArea('header');
    } finally {
      this.areaHeightsOfRenderPass = undefined;
    }
    this.updateHostAria();

    if (this.tableOptions.tableTopBorderVisible) {
      this.removables.push(this.dom.addHorizontalBorder(
        new GeoData(0, hostWidth, 1, 0),
        this.hostElement,
        'ge-table-border'));
    }
    if (this.tableOptions.tableBottomBorderVisible) {
      this.removables.push(this.dom.addHorizontalBorder(
        new GeoData(0, hostWidth, 1, hostHeight - 1),
        this.hostElement,
        'ge-table-border'));
    }
    // The border between east and center in  header/body/footer (full height):
    if (this.tableModel.getFixedLeftColumnCount() > 0) {
      this.removables.push(this.dom.addVerticalBorder(
        new GeoData(westWidth, 1, hostHeight, 0),
        this.hostElement,
        'ge-table-body-west-vertical-border'));
    }
    // The border between header and body (full width), not for a hidden header (setHeaderVisible):
    if (this.tableModel.isHeaderVisibe()) {
      this.removables.push(this.dom.addHorizontalBorder(
        new GeoData(0, hostWidth, 1, headerHeight),
        this.hostElement,
        'ge-table-body-west-vertical-border'));
    }
    this.updateOverlay(); // "no rows" after setRows / filter / tree toggle; one comparison when nothing changed
    if (this.rowNumberWidth?.approximate && !this.rowNumberRemeasureScheduled && this.findRowNumberLabel()) {
      // the row number width was measured before a number cell existed: measure again with its font, once
      this.rowNumberRemeasureScheduled = true;
      requestAnimationFrame(() => {
        if (this.hostElement.isConnected) this.repaint();
      });
    }
    this.afterRenderPass();
  }

  /**
   * Called at the end of every render pass (scroll, repaint). {@link TableScope} marks the scroll position of the
   * table state as changed here (stored and reported debounced, see {@link TableStateService}).
   *
   * @since 1.1.92
   */
  protected afterRenderPass(): void {
    // overwritten in TableScope
  }

  /**
   * Shows the overlay that fits the body now (see {@link TableOverlay.update}) and reports a change to
   * {@link onOverlayChanged}.
   *
   * @since 1.1.92
   */
  protected override updateOverlay(): void {
    const overlay = this.tableOverlay;
    if (!overlay) {
      return; // called while the EleScope constructor runs
    }
    const body = this.tableModel.getBodyModel();
    const rowCount = body.getRowCount();
    const unfilteredRowCount = rowCount === 0 ? body.getUnfilteredRowCount?.() : undefined;
    const change = overlay.update(rowCount, unfilteredRowCount);
    if (change) {
      this.onOverlayChanged(change);
    }
  }

  /**
   * Called after the shown overlay changed (ARIA in {@link TableScope}).
   *
   * @param {TableOverlayChange} _change - previous and new overlay, its text
   * @since 1.1.92
   */
  protected onOverlayChanged(_change: TableOverlayChange): void {
    // overwritten in TableScope
  }


  /**
   * Marks the scroll position as changed (it is stored with the table state, see {@link TableStateService}).
   *
   * @deprecated since 1.1.92 – the table does this after every render pass.
   *
   * @return {void}
   */
  checkForScrollPosSaving() {
    this.afterRenderPass();
  }

  /**
   * Updates the cells in the table with the provided values and optionally repaints all cells.
   *
   * @param {TableCellUpdateEventIf[]} events - The array of events containing information about the cells to update.
   * @param {boolean} repaintAll - Optional. If true, repaints all cells after updating. Defaults to false.
   *
   * @returns {void}
   */
  updateCells(
    events: TableCellUpdateEventIf[],
    repaintAll: boolean = false) {

    const bodyModel = this.tableModel.getBodyModel();
    const rowCountBefore = bodyModel.getRowCount();
    const apply = () => events.forEach(evt => {
        this.tableModel
          .getAreaModel(evt.area)
          .setValue(evt.rowIndex, evt.columnIndex, evt.value);
        if (!repaintAll) {
          this.rerenderCellContent(evt);
        }
      }
    );
    // a row grouping moves rows with a changed grouped value only after the last event (the indices stay valid)
    const regrouped = isAreaModelRowGroups(bodyModel) ? bodyModel.batch(apply) : (apply(), false);
    if (regrouped) {
      this.invalidateAggregates();
      this.repaintHard();             // rows moved to other groups: labels, counts and positions changed
      return;
    }
    if (events.length) {
      // only rows of one area changed: models may recompute less (a row grouping only the groups of these rows)
      const area = events[0].area;
      this.invalidateAggregates(events.every(evt => evt.area === area)
        ? { area, rowIndices: events.map(evt => evt.rowIndex) }
        : undefined);
    }
    if (events.length && bodyModel.getRowCount() !== rowCountBefore) {
      this.repaintHard(); // e.g. a grouped value changed: the row moved to another group
    } else if (repaintAll) {
      this.repaint();
    } else if (events.length) {
      this.rerenderDerivedFooterCells(events);
      this.rerenderGroupRowCells();
      this.rerenderCalculatedCells();
    }
  }

  /**
   * After `updateCells()` without a repaint: draws the rendered cells of calculated and „Show values as“ columns of
   * the body again (they depend on the changed cells, e.g. `total = price * quantity` or a share of the total).
   */
  protected rerenderCalculatedCells(): void {
    const bodyModel = this.tableModel.getBodyModel() as AreaModelIf & { hasDerivedColumns?: () => boolean; isDerivedProperty?: (p: string) => boolean };
    if (!bodyModel.hasDerivedColumns?.()) {
      return;
    }
    const derived = new Map<number, boolean>();
    const cells = this.hostElement.querySelectorAll<HTMLDivElement>('div.ge-table-col-div[data-area="body"][data-row-index][data-col-index]');
    cells.forEach(cell => {
      const rowIndex = Number(cell.getAttribute('data-row-index'));
      const columnIndex = Number(cell.getAttribute('data-col-index'));
      if (!derived.has(columnIndex)) {
        const property = this.tableModel.getColumnDef(columnIndex)?.property;
        derived.set(columnIndex, property !== undefined && !!bodyModel.isDerivedProperty?.(property));
      }
      if (!derived.get(columnIndex)) return;
      this.rerenderCellContent({
        area: 'body', rowIndex, columnIndex, value: bodyModel.getValueAt(rowIndex, columnIndex) ?? ''
      } as TableCellUpdateEventIf);
    });
  }

  /**
   * After `updateCells()` without a repaint: draws the rendered aggregate cells of the group rows of a row grouping
   * again (they follow the changed rows; labels and counts don't change – a moved row repaints the whole table).
   */
  protected rerenderGroupRowCells(): void {
    const bodyModel = this.tableModel.getBodyModel();
    if (!isAreaModelRowGroups(bodyModel)) {
      return;
    }
    const cells = this.hostElement.querySelectorAll<HTMLDivElement>('div.ge-table-col-div[data-area="body"][data-row-index][data-col-index]');
    cells.forEach(cell => {
      const rowIndex = Number(cell.getAttribute('data-row-index'));
      const columnIndex = Number(cell.getAttribute('data-col-index'));
      // only the aggregates (the label cell keeps its arrow; counts change only if rows move → repaintHard above)
      if (!bodyModel.isGroupRowIndex(rowIndex) || !bodyModel.getCellRenderer(rowIndex, columnIndex)) return;
      this.rerenderCellContent({
        area: 'body', rowIndex, columnIndex, value: bodyModel.getValueAt(rowIndex, columnIndex)
      } as TableCellUpdateEventIf);
    });
  }

  /**
   * After `updateCells()` without a repaint: draws the rendered cells of a footer with cached totals again (only if the
   * footer implements {@link AreaModelIf.invalidateDerivedValues}, and not if the events changed the footer itself).
   */
  protected rerenderDerivedFooterCells(events: TableCellUpdateEventIf[]): void {
    const footerModel = this.tableModel.getAreaModel('footer');
    if (!footerModel?.invalidateDerivedValues || events.every(evt => evt.area === 'footer')) {
      return;
    }
    const cells = this.hostElement.querySelectorAll<HTMLDivElement>('div.ge-table-col-div[data-area="footer"][data-row-index][data-col-index]');
    cells.forEach(cell => {
      const rowIndex = Number(cell.getAttribute('data-row-index'));
      const columnIndex = Number(cell.getAttribute('data-col-index'));
      this.rerenderCellContent({
        area: 'footer', rowIndex, columnIndex, value: footerModel.getValueAt(rowIndex, columnIndex)
      } as TableCellUpdateEventIf);
    });
  }

  /**
   * Rerenders the content of a table cell based on the given parameters.
   *
   * @param {TableCellUpdateEventIf} area - The area of the table.
   * @param {number} rowIndex - The index of the row.
   * @param {number} columnIndex - The index of the column.
   * @param {any} value - The new value to be displayed in the cell.
   * @param {string[]} cssClasses - An array of CSS classes to be applied to the cell.
   */
  public rerenderCellContent(
    { area, rowIndex, columnIndex, value, cssClasses }: TableCellUpdateEventIf
  ) {
    const areaModel = this.tableModel.getAreaModel(area);
    const selector = 'div[data-col-index="' + columnIndex + '"][data-row-index="' + rowIndex + '"][data-area="' + area + '"]';
    const cell = this.hostElement.querySelector(selector) as HTMLDivElement; // this table only (several tables on a page)

    if (cell) {
      let fn: RendererCleanupFnType | undefined = undefined;
      const editor = area === 'body' && this.editorRenderer && this.editorRendererRow === rowIndex && this.editorRendererColumn === columnIndex;
      let cellRenderer;
      if (editor) {
        cellRenderer = this.editorRenderer;
      } else {
        cellRenderer = areaModel.getCellRenderer(rowIndex, columnIndex);
      }

      cell.innerText = '';
      this.applyCssClasses(cell, cssClasses);
      if (cellRenderer) {
        fn = cellRenderer.render(cell, rowIndex, columnIndex, area, areaModel, value, this.dom.domService);
        if (fn) {
          this.cleanupFunctions[area].push(fn);
        }
      } else {
        const text = `${value}`;
        this.dom.addLabelDiv(cell, text, false, rowIndex, columnIndex, area);
      }
      const classes = areaModel.getCustomClassesAt(rowIndex, columnIndex);
      if (classes.length) {
        this.dom.addClasses(classes, cell);
      }
      const styles = areaModel.getCustomStyleAt(rowIndex, columnIndex);
      if (styles) {
        for (const css in styles) {
          this.dom.domService.setStyle(cell, css, styles[css]); // own styles of the app: as given (no RTL mirroring)
        }
      }
    }
  }

  public getFirstVisibleRowIndex() {
    return this.firstVisibleRowIndex;
  }

  public getLastVisibleRowIndex() {
    return this.lastVisibleRowIndex;
  }

  public getFirstFullVisibleRowIndex() {
    return this.firstFullVisibleRowIndex;
  }

  public getLastFullVisibleRowIndex() {
    return this.lastFullVisibleRowIndex;
  }

  public getDisplayedRowCount() {
    return this.displayedRowCount;
  }

  /**
   * Stores the widths of all columns in the table.
   *
   * @protected
   * @function storeColumnWidths
   * @returns {void}
   */
  protected storeColumnWidths() {
    const columnDefs = this.tableModel.getColumnDefs();
    if (columnDefs?.length) {
      this.storedColumnWidths = columnDefs.map((_cd, idx) => this.tableModel.getColumnWidth(idx));
    }
  }

  protected getAreaAndSideIdentByAttr(srcElement: HTMLElement): [AreaIdent | undefined, SideIdent | undefined] {
    if (srcElement) {
      const dataArea = this.getStringByAttr(srcElement, 'data-area');
      const dataSide = this.getStringByAttr(srcElement, 'data-side');
      if (dataSide && dataArea) {
        return [dataArea, dataSide] as [AreaIdent, SideIdent];
      }
    }
    return [undefined, undefined];
  }

  /**
   * Retrieves the specified area from the grid layout.
   *
   * @param {string} areaIdent - The identifier for the area ('header', 'body', or 'footer').
   * @param {string} sideIdent - The identifier for the side of the area ('west', 'center', or 'east').
   * @protected
   * @returns {HTMLElement} - The requested area element.
   * @throws {Error} - If the area identifier or side identifier is incorrect.
   */
  protected getArea(areaIdent: AreaIdent, sideIdent: SideIdent): DivScope {
    if (areaIdent === 'header') {
      if (sideIdent === 'west') return this.areaHeaderWest;
      if (sideIdent === 'center') return this.areaHeaderCenter;
      if (sideIdent === 'east') return this.areaHeaderEast;
    } else if (areaIdent === 'body') {
      if (sideIdent === 'west') return this.areaBodyWest;
      if (sideIdent === 'center') return this.areaBodyCenter;
      if (sideIdent === 'east') return this.areaBodyEast;
    } else if (areaIdent === 'footer') {
      if (sideIdent === 'west') return this.areaFooterWest;
      if (sideIdent === 'center') return this.areaFooterCenter;
      if (sideIdent === 'east') return this.areaFooterEast;
    }
    throw Error(`Wrong area identifier: row:${areaIdent}, col:${sideIdent}`);
  }

  /**
   * Adjusts the body of the table.
   *
   * @protected
   * @return {void}
   */
  /**
   * Rounds a pixel offset to whole device pixels. The scroll offsets are derived from a scroll factor and are
   * fractional; rows and cells placed at fractional positions render blurry text and 1px borders.
   *
   * @param {number} px - offset in CSS pixels
   * @returns {number} offset snapped to the device pixel grid
   * @protected
   */
  protected snapToDevicePixel(px: number): number {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    return Math.round(px * dpr) / dpr;
  }

  /**
   * True if the table content is taller than {@link EleScope.maxScrollHeightInPx}; then the scroll bar is
   * scaled and scrollTop is no longer a content pixel position.
   */
  isScrollHeightCapped(): boolean {
    return this.getBodyContentHeight() + 1 > EleScope.maxScrollHeightInPx;
  }

  /**
   * The model's content height plus the heights of open detail rows (master/detail).
   *
   * @returns {number} px
   * @since 1.1.97
   */
  /** The detail layer (master/detail) covers the visible body. @since 1.1.97 */
  protected override adjustDetailLayerBounds(left: number, top: number, width: number, height: number): void {
    this.masterDetailService?.setBounds(left, top, width, height);
  }

  protected override getBodyContentHeight(): number {
    const height = this.tableModel.getContentHeightInPixel();
    return this.masterDetailService?.hasExpanded() ? height + this.getBodyRowLayout().getExtraTotal() : height;
  }

  /** Scrollable range of the content in content pixels (content height minus visible body height). */
  protected getContentScrollRangeY(): number {
    return this.getBodyContentHeight() - this.areaBodyCenterGeo.height;
  }

  /** Scrollable range of the scroll viewport in scroll bar pixels. */
  protected getScrollerRangeY(): number {
    return this.scrollViewport.scrollHeight - this.scrollViewport.clientHeight;
  }

  /**
   * Mouse wheel on a capped scroll height: scale the wheel delta, so one wheel step still moves the content
   * by the usual amount of pixels (otherwise it would jump many rows). No-op for normal tables.
   *
   * @param {WheelEvent} evt - the wheel event of the scroll viewport
   */
  onWheel(evt: WheelEvent) {
    if (evt.ctrlKey || !this.isScrollHeightCapped()) {
      return;
    }
    const contentRange = this.getContentScrollRangeY();
    const scrollerRange = this.getScrollerRangeY();
    if (contentRange <= 0 || scrollerRange <= 0) {
      return;
    }
    const ratio = scrollerRange / contentRange;
    const unit = evt.deltaMode === 1 ? 16 : evt.deltaMode === 2 ? this.scrollViewport.clientHeight : 1;
    evt.preventDefault();
    if (evt.deltaY) {
      this.scrollViewport.scrollTop += evt.deltaY * unit * ratio;
    }
    if (evt.deltaX) {
      this.scrollViewport.scrollLeft += evt.deltaX * unit;
    }
  }

  protected adjustBody() {
    const virtualRowDivTopF1 = this.areaBodyCenterGeo.height - this.getBodyContentHeight();
    const virtualRowDivTop = this.snapToDevicePixel(this.scrollFactorY * virtualRowDivTopF1);
    this.contentScrollTop = -virtualRowDivTop;

    this.dom.setStyle(this.contentDiv, 'top', `${this.scrollTop}px`);
    // inside a render pass scrollLeft was read before any DOM write; otherwise read it live
    const scrollLeft = this.areaHeightsOfRenderPass ? this.scrollLeft : this.getViewportScrollLeft();
    this.dom.setStyle(this.contentDiv, 'left', `${scrollLeft}px`);

    this.adjustArea('body', virtualRowDivTop);
  }

  /**
   * Returns a number value extracted from the specified attribute of the source element.
   *
   * @param {HTMLElement} srcElement - The source element from which to extract the attribute value.
   * @param {string} key - The attribute key to extract the value from.
   * @returns {number} - The extracted number value, or -1 if the attribute was not found or not a valid number.
   * @protected
   */
  protected getNumberByAttr(srcElement: HTMLElement, key: string): number {
    if (srcElement) {
      const attr = srcElement.closest('[' + key + ']')?.getAttribute(key);
      if (attr) return Number(attr);
    }
    return -1;
  }


  /**
   * Retrieves the value of the specified attribute from the nearest ancestor element that has the attribute.
   *
   * @param {HTMLElement} srcElement - The source element from which to start searching for the nearest ancestor element.
   * @param {string} key - The name of the attribute to retrieve.
   * @returns {string} The value of the specified attribute, or an empty string if the attribute is not found.
   * @protected
   */
  protected getStringByAttr(srcElement: HTMLElement, key: string): string {
    if (srcElement) {
      const attr = srcElement.closest('[' + key + ']')?.getAttribute(key);
      if (attr) return attr;
    }
    return '';
  }


  /**
   * Adjusts the layout and positioning of the specified area in the table.
   * This method is used internally and should not be called directly.
   *
   * @param {AreaIdent} areaIdent - The identifier of the area to adjust (e.g. header, body, footer).
   * @param {number} [yStart=0] - The starting y-position for the layout adjustments.
   * @protected
   */
  protected adjustArea(areaIdent: AreaIdent, yStart: number = 0) {
    const westArea = this.getArea(areaIdent, 'west');
    const centerArea = this.getArea(areaIdent, 'center');
    const eastArea = this.getArea(areaIdent, 'east');
    const divHeight = this.areaHeightsOfRenderPass?.[areaIdent] ?? centerArea.child.clientHeight;

    westArea.child.innerText = '';
    centerArea.child.innerText = '';
    eastArea.child.innerText = '';
    const left = 0;
    const width = this.areaBodyCenterGeo.width;
    const padding = this.tableModel.getPadding();
    const areaModel = this.tableModel.getAreaModel(areaIdent);
    const rowCount = areaModel.getRowCount();

    while (this.cleanupFunctions[areaIdent].length) {
      const fn = this.cleanupFunctions[areaIdent].shift();
      if (fn) {
        fn();
      }
    }
    // A hidden header/footer (TableApi.setHeaderVisible / setFooterVisible) has the height 0 – render no rows,
    // otherwise the first row would overflow its 0 px area.
    if ((areaIdent === 'header' && !this.tableModel.isHeaderVisibe())
      || (areaIdent === 'footer' && !this.tableModel.isFooterVisibe())) {
      this.updateRowGroupRoles(westArea, centerArea, eastArea);
      return;
    }
    let y = yStart;

    const columnCount = this.tableModel.getColumnCount();
    const fixedRightColumnCount = this.tableModel.getFixedRightColumnCount();
    const fixedLeftColumnCount = this.tableModel.getFixedLeftColumnCount();

    if (areaIdent === 'body') {
      this.firstVisibleRowIndex = -1;
      this.firstFullVisibleRowIndex = -1;
      this.lastVisibleRowIndex = -1;
      this.lastFullVisibleRowIndex = -1;
    }


    // Skip the rows above the viewport. Body: the first visible row from the prefix sums of the row heights
    // (O(log n), also for variable heights and open detail rows – since 1.1.97). Header/footer: computed directly
    // with a constant row height, otherwise by iterating the (few) rows.
    let startIndex = 0;
    const layout = areaIdent === 'body' ? this.getBodyRowLayout() : undefined;
    const withDetails = !!layout && layout.getExtraCount() > 0;
    const visibleDetails: number[] = []; // rowIndex, top, height – triples of the open detail rows in view
    if (layout) {
      this.masterDetailService?.startRenderPass();
      if (y < 0 && rowCount > 0) {
        startIndex = layout.findIndexAt(-y);
        y = y + layout.getTop(startIndex);
      }
    } else {
      const constantRowHeight = areaModel.getConstantRowHeight?.();
      if (constantRowHeight !== undefined && constantRowHeight > 0 && y < 0) {
        startIndex = Math.min(rowCount, Math.floor(-y / constantRowHeight));
        // floating point guard: the row before startIndex must not be visible
        while (startIndex > 0 && y + startIndex * constantRowHeight > 0) {
          startIndex--;
        }
        y = y + startIndex * constantRowHeight;
      }
    }

    for (let index = startIndex; index < rowCount; index++) {
      const top = y;
      const lastRowOfModel = index === rowCount - 1;
      const height = this.tableModel.getRowHeight(areaIdent, index);
      const detailHeight = withDetails ? layout!.getExtraHeight(index) : 0;
      if (detailHeight > 0 && top + height + detailHeight > 0) {
        visibleDetails.push(index, top + height, detailHeight);
      }

      if (top + height > 0) {

        // It's not scrolled out on top. Visible!
        if (areaIdent === 'body') {
          if (this.firstVisibleRowIndex === -1) {
            this.firstVisibleRowIndex = index;
            this.firstFullVisibleRowIndex = top < -this.pixelLimitForFullVisible ? (this.firstVisibleRowIndex + 1) : this.firstVisibleRowIndex;
          }
        }

        // center -------------------------------------------
        let geo = { left, width, height, top, index };
        let rowDiv = this.dom.addRowDiv(centerArea, geo, index, areaIdent, 'center');
        this.applyRowAria(rowDiv, areaIdent, areaModel, index);
        const rowDivs = [rowDiv];
        const centerStartCol = fixedLeftColumnCount;

        this.adjustColumnsToRowParent({
          areaIdent,
          sideIdent: 'center',
          areaModel,
          geo,
          parent: rowDiv,
          rowIndex: index,
          columnIndexStart: centerStartCol,
          columnIndexEnd: columnCount - fixedRightColumnCount - 1,
          verticalFixed: false,
          lastRowOfModel
        });

        // west -------------------------------------------
        if (padding.left > 0) {
          geo = { left, width: this.areaBodyWestGeo.width, height, top, index };
          rowDiv = this.dom.addRowDiv(westArea, geo, index, areaIdent, 'west');
          this.applyRowAria(rowDiv, areaIdent, areaModel, index);
          rowDivs.push(rowDiv);
          this.adjustColumnsToRowParent({
            areaIdent,
            sideIdent: 'west',
            areaModel,
            geo,
            parent: rowDiv,
            rowIndex: index,
            columnIndexStart: 0,
            columnIndexEnd: centerStartCol - 1,
            verticalFixed: true,
            lastRowOfModel
          });
        }

        // east -------------------------------------------
        if (padding.right > 0) {
          geo = { left, width: this.areaBodyEastGeo.width, height, top, index };
          rowDiv = this.dom.addRowDiv(eastArea, geo, index, areaIdent, 'east');
          this.applyRowAria(rowDiv, areaIdent, areaModel, index);
          this.adjustColumnsToRowParent({
            areaIdent,
            sideIdent: 'east',
            areaModel,
            geo,
            parent: rowDiv,
            rowIndex: index,
            columnIndexStart: columnCount - fixedRightColumnCount,
            columnIndexEnd: columnCount - 1,
            verticalFixed: true,
            lastRowOfModel
          });
        }

        // "collapse / expand all" event handler action attribute – above the tree arrows, i.e. in the header cell of
        // the arrow column (before: always at x = 16 of the last row div – over the header checkbox of a
        // CheckboxColumnDef, in the east area with fixed right columns, not moving with horizontal scrolling)
        const arrowHeaderCell = areaIdent === 'header' && this.tree && index === rowCount - 1
          ? this.findCellDiv(rowDivs, this.getTreeArrowColumnIndex())
          : undefined;
        if (arrowHeaderCell?.parentElement) {
          const iconLeft = this.dom.getInlineStart(arrowHeaderCell) + 16;
          const div =
            this.dom.applyStyle(
              this.dom.setAttribute(
                this.dom.addDiv(arrowHeaderCell.parentElement as HTMLDivElement, new GeoData(iconLeft, 20, 20, 8)), // aria-hidden
                'data-ge-action', 'toggleExpandCollapseAll'
              ),
              { 'cursor': 'pointer' }
            );
          const treeOptionsArrow = this.tableOptions.treeOptions.arrowExpandCollapseAll;
          if (treeOptionsArrow) {
            const textElement = this.dom.domService.createText(treeOptionsArrow.content);
            this.dom.domService.appendChild(div, textElement);
            if (treeOptionsArrow.style) {
              this.dom.applyStyleString(div, treeOptionsArrow.style);
            }
          }
        }

      }
      y = y + height + detailHeight;

      if (y > divHeight) {
        if (areaIdent === 'body') {
          // the row itself (without its detail row) decides whether it is fully visible
          const rowBottom = y - detailHeight;
          if (rowBottom <= 0 && this.firstVisibleRowIndex === -1) {
            // only the detail row of a master above the viewport is visible (it fills the body): no row is visible
            this.displayedRowCount = 0;
          } else {
            this.lastVisibleRowIndex = index;
            this.lastFullVisibleRowIndex = ((divHeight - rowBottom) < -this.pixelLimitForFullVisible) ? index - 1 : index;
            this.displayedRowCount = this.lastFullVisibleRowIndex - this.firstFullVisibleRowIndex + 1;
          }
        }
        break;
      }
    } // for
    if (layout) {
      this.masterDetailService?.layoutVisible(visibleDetails);
    }

    // The loop ended without leaving the viewport (end of table reached or all rows fit):
    if (areaIdent === 'body' && this.firstVisibleRowIndex > -1 && this.lastVisibleRowIndex === -1) {
      this.lastVisibleRowIndex = rowCount - 1;
      this.lastFullVisibleRowIndex = rowCount - 1;
      this.displayedRowCount = this.lastFullVisibleRowIndex - this.firstFullVisibleRowIndex + 1;
    }

    if (this.loggingActive && areaIdent === 'body') {
      console.log('render scope: this.firstVisibleRowIndex <- ' + this.firstVisibleRowIndex
        + '\nrender scope: this.firstFullVisibleRowIndex <- ' + this.firstFullVisibleRowIndex
        + '\nrender scope: this.lastVisibleRowIndex <- ' + this.lastVisibleRowIndex
        + '\nrender scope: this.lastFullVisibleRowIndex <- ' + this.lastFullVisibleRowIndex); // TODO del
    }

    // The row div cache reuses the divs of rows that stay visible – forget the rows that were not rendered in this
    // pass (otherwise every row ever scrolled into view stays referenced with all its cells).
    this.pruneRowDivCache(westArea);
    this.pruneRowDivCache(centerArea);
    this.pruneRowDivCache(eastArea);

    // We draw the big colspan and rowspan cells at the end.
    // This fixes the 'half cutted big cell' problem:
    if (this.colAndRowspanModels && this.colAndRowspanModels[areaIdent]) {
      // draw col/rowspan cells again:
      const ranges = this.colAndRowspanModels[areaIdent]?.getRanges() ?? [];
      if (ranges.length) {

        for (const range of ranges) {
          if (range.r1 >= rowCount || range.c1 >= columnCount) {
            continue; // stale range (rows removed without repaintHard) – its row no longer exists
          }
          let xStart = 0;
          let child: HTMLDivElement = centerArea.child;
          let sideIdent: SideIdent = 'center';
          if (range.c1 < fixedLeftColumnCount) {
            // West:
            child = westArea.child;
            sideIdent = 'west';
          } else if (fixedRightColumnCount > 0 && range.c1 >= columnCount - fixedRightColumnCount) {
            // East:
            child = eastArea.child;
            sideIdent = 'east';
          } else {
            // Center:
            const virtualRowDivLeftF1 = this.areaBodyCenterGeo.width - this.tableModel.getContentWidthInPixel();
            xStart = this.snapToDevicePixel(this.scrollFactorX * virtualRowDivLeftF1) - this.areaBodyWestGeo.width;
            sideIdent = 'center';
          }
          this.drawBigCell(range, xStart, yStart, areaModel, child, sideIdent);
        }
      }
    }
    this.updateRowGroupRoles(westArea, centerArea, eastArea);
  }

  /**
   * Row and column numbers for screen readers of the current render pass (computed at its start).
   *
   * @returns {AriaGridInfo} the counts
   * @since 1.1.91
   */
  getAriaGridInfo(): AriaGridInfo {
    if (!this.ariaGridInfo) {
      this.ariaGridInfo = AriaGridInfo.create(this.tableModel);
    }
    return this.ariaGridInfo;
  }

  /** `role="row"` and `aria-rowindex`; body rows of a tree: level, position, expanded; row selection: selected. */
  protected applyRowAria(rowDiv: HTMLDivElement, areaIdent: AreaIdent, areaModel: AreaModelIf, rowIndex: number, rowState = true) {
    const ds = this.dom.domService;
    ds.setAttribute(rowDiv, 'role', 'row');
    ds.setAttribute(rowDiv, 'aria-rowindex', `${this.getAriaGridInfo().rowIndex(areaIdent, rowIndex)}`);
    if (areaIdent !== 'body' || !rowState) {
      return;
    }
    if (this.tree && isAreaModelTree(areaModel)) {
      const info = this.treeAriaInfo.get(areaModel as unknown as TreeAriaModel, rowIndex);
      if (info) {
        ds.setAttribute(rowDiv, 'aria-level', `${info.level}`);
        ds.setAttribute(rowDiv, 'aria-setsize', `${info.setSize}`);
        ds.setAttribute(rowDiv, 'aria-posinset', `${info.posInSet}`);
        if (info.expanded === undefined) {
          this.dom.removeAttribute(rowDiv, 'aria-expanded'); // the row div is reused for another row
        } else {
          ds.setAttribute(rowDiv, 'aria-expanded', `${info.expanded}`);
        }
      }
    }
    if (this.masterDetailService?.isActive()) {
      // master/detail (since 1.1.97): master rows are expandable
      if (this.masterDetailService.isMasterAt(rowIndex)) {
        ds.setAttribute(rowDiv, 'aria-expanded', `${this.masterDetailService.isExpandedAt(rowIndex)}`);
      } else if (rowDiv.hasAttribute('aria-expanded')) {
        this.dom.removeAttribute(rowDiv, 'aria-expanded'); // the row div is reused for another row
      }
    }
    if (this.ariaSelectionKind === 'row') {
      const sm = this.getSelectionModel?.();
      ds.setAttribute(rowDiv, 'aria-selected', sm && sm.getSelectionCount(rowIndex, 0) > 0 ? 'true' : 'false');
    } else if (rowDiv.hasAttribute('aria-selected')) {
      this.dom.removeAttribute(rowDiv, 'aria-selected'); // the selection type was changed at runtime
    }
  }

  /**
   * `role`, `aria-colindex`, spans and `aria-sort` of a cell.
   *
   * @returns {[number, number]} rowspan and colspan of the cell (≥ 1)
   */
  protected applyCellAria(cell: HTMLDivElement, areaIdent: AreaIdent, areaModel: AreaModelIf, rowIndex: number, columnIndex: number): [number, number] {
    const ds = this.dom.domService;
    const info = this.getAriaGridInfo();
    const header = areaIdent === 'header';
    // the numbers of a RowNumberColumnDef name their rows (screen readers announce them with the row)
    const rowHeader = (areaIdent === 'body' && isRowNumberColumnDef(this.tableModel.getColumnDef(columnIndex)))
      // the label of a total row ("6 rows") names its row
      || (areaIdent === 'footer' && isAreaModelAggregateFooter(areaModel) && areaModel.isLabelCell(rowIndex, columnIndex))
      // the label of a group row ("Nord (3)") names its row
      || (areaIdent === 'body' && isAreaModelRowGroups(areaModel) && areaModel.isGroupLabelCell(rowIndex, columnIndex))
      // a model that names its label cells (e.g. a pivot table)
      || (!header && !!areaModel.isRowHeaderCell?.(rowIndex, columnIndex));
    ds.setAttribute(cell, 'role', header ? 'columnheader' : rowHeader ? 'rowheader' : 'gridcell');
    const colIndex = info.colIndex(columnIndex);
    if (colIndex > 0) {
      ds.setAttribute(cell, 'aria-colindex', `${colIndex}`);
    }
    const rowspan = Math.max(1, areaModel.getRowspanAt(rowIndex, columnIndex) || 1);
    const colspan = Math.max(1, areaModel.getColspanAt(rowIndex, columnIndex) || 1);
    if (colspan > 1) {
      ds.setAttribute(cell, 'aria-colspan', `${info.colSpan(columnIndex, colspan)}`);
    }
    if (rowspan > 1) {
      ds.setAttribute(cell, 'aria-rowspan', `${rowspan}`);
    }
    if (rowspan > 1 || colspan > 1) {
      this.renderedSpanCells.add(`${areaIdent}:${rowIndex}:${columnIndex}`);
    }
    // aria-sort: on the lowest header cell of a sortable column
    if (header && rowIndex + rowspan >= info.headerRowCount && colspan === 1) {
      const columnDef = this.tableModel.getColumnDef(columnIndex);
      if (columnDef?.sortable?.()) {
        const state = columnDef.sortState;
        ds.setAttribute(cell, 'aria-sort', state === 'asc' ? 'ascending' : state === 'desc' ? 'descending' : 'none');
      }
    }
    return [rowspan, colspan];
  }

  /** An empty row group has role "presentation" (a rowgroup needs rows) – changed only when it changes. */
  private updateRowGroupRoles(...scopes: DivScope[]) {
    for (const scope of scopes) {
      // a row whose cells are all covered by a span cell of a row above (e.g. the second header row of a fixed column
      // under a grouped header) has no cell: no row for screen readers (a row needs cells)
      let rows = 0;
      for (const rowDiv of Array.from(scope.child.children)) {
        if (!rowDiv.classList.contains('ge-table-row-div') || rowDiv.classList.contains('ge-table-span-row')) {
          if (rowDiv.getAttribute('role') === 'row') rows++;
          continue;
        }
        if (rowDiv.querySelector(':scope > [role="gridcell"], :scope > [role="columnheader"], :scope > [role="rowheader"]')) {
          rows++;
        } else if (rowDiv.getAttribute('role') === 'row') {
          this.dom.domService.setAttribute(rowDiv as HTMLElement, 'role', 'presentation');
          this.dom.removeAttribute(rowDiv as HTMLElement, 'aria-rowindex');
        }
      }
      const role = scope.child.firstElementChild && rows ? 'rowgroup' : 'presentation';
      if (scope.child.getAttribute('role') !== role) {
        this.dom.domService.setAttribute(scope.child, 'role', role);
      }
    }
  }

  /** Writes an attribute of the host only if it changed (every write may notify screen readers). */
  private setHostAttribute(key: string, value: string | undefined) {
    this.setHostAriaAttribute(key, value);
  }

  /** Counts, multi selection and the active cell on the host – at the end of every render pass. */
  private updateHostAria() {
    const info = this.getAriaGridInfo();
    this.setHostAttribute('aria-rowcount', `${info.rowCount}`);
    this.setHostAttribute('aria-colcount', `${info.colCount}`);
    const sm = this.getSelectionModel?.() as unknown as { selectionType?: string, selectionMode?: string } | undefined;
    const multi = this.ariaSelectionKind !== 'none' && sm?.selectionMode === 'multi';
    this.setHostAttribute('aria-multiselectable', multi ? 'true' : undefined);

    const focused = this.ariaFocusedCell;
    if (focused) {
      const id = this.ariaIds.cell(focused.area, focused.rowIndex, focused.columnIndex);
      this.dom.domService.setAttribute(focused.element, 'id', id);
      this.setHostAttribute('aria-activedescendant', id);
    } else {
      this.setHostAttribute('aria-activedescendant', undefined); // never a reference to a missing element
    }
  }

  /**
   * Remembers the focused cell of this pass. A cell drawn twice (header groups: in its row and again by
   * drawBigCell, that copy is aria-hidden) keeps the first, visible-to-screen-readers element.
   */
  private setAriaFocusedCell(element: HTMLDivElement, area: AreaIdent, rowIndex: number, columnIndex: number) {
    const f = this.ariaFocusedCell;
    if (f && f.area === area && f.rowIndex === rowIndex && f.columnIndex === columnIndex) {
      return;
    }
    this.ariaFocusedCell = { element, area, rowIndex, columnIndex };
  }

  /** "row" for a row selection model, "none" for type "none" (or no model), otherwise "cell". */
  private getAriaSelectionKind(): 'none' | 'cell' | 'row' {
    const sm = this.getSelectionModel?.() as unknown as { selectionType?: string } | undefined;
    if (!sm) {
      return 'none';
    }
    const type = sm.selectionType;
    if (type === 'none') {
      return 'none';
    }
    return type === 'row' ? 'row' : 'cell';
  }

  /**
   * The label of a column for screen readers: the header label of its column definition, otherwise the text of the
   * lowest header row, otherwise the property.
   *
   * @param {number} columnIndex - model column index
   * @returns {string} e.g. "Total"
   * @since 1.1.91
   */
  getColumnAriaLabel(columnIndex: number): string {
    const columnDef = this.tableModel.getColumnDef(columnIndex);
    if (columnDef?.headerLabel) {
      return `${columnDef.headerLabel}`;
    }
    const headerModel = this.tableModel.getAreaModel('header');
    const headerRows = headerModel?.getRowCount() ?? 0;
    if (headerRows > 0) {
      const value: unknown = headerModel.getValueAt(headerRows - 1, columnIndex);
      const text = value && typeof value === 'object' && 'data' in value ? (value as { data: unknown }).data : value; // CellGroupExt
      if ((typeof text === 'string' && text.trim()) || typeof text === 'number') {
        return `${text}`;
      }
    }
    return columnDef?.property || `Column ${columnIndex + 1}`;
  }

  /** Name of a row checkbox: "Select row 5" (body) resp. "Select all rows" (header). */
  protected getCheckboxAriaLabel(areaIdent: AreaIdent, rowIndex: number): string {
    return areaIdent === 'header' ? this.ariaTexts.selectAllRows() : this.ariaTexts.selectRow(rowIndex + 1);
  }

  /** Gives a form control a name, unless the renderer gave it one. */
  private labelControl(control: HTMLElement, label: string) {
    if (label && !control.hasAttribute('aria-label') && !control.hasAttribute('aria-labelledby')) {
      this.dom.domService.setAttribute(control, 'aria-label', label);
    }
  }

  /**
   * Names for controls of built-in renderers: row checkboxes ({@link CheckboxColumnDef}), boolean property
   * checkboxes and – with own `ariaTexts` – header group toggles. Cheap class checks first: most cells have none.
   */
  private labelRendererControls(cell: HTMLDivElement, cellRenderer: CellRendererIf, areaIdent: AreaIdent, rowIndex: number, columnIndex: number) {
    if (isCheckboxCellRenderer(cellRenderer) || cell.classList.contains('ge-table-row-checkbox-div')) {
      const input = cell.querySelector<HTMLInputElement>('input.ge-table-row-checkbox');
      if (input) {
        this.labelControl(input, this.getCheckboxAriaLabel(areaIdent, rowIndex));
        return;
      }
      const propertyCheckbox = cell.querySelector<HTMLInputElement>('input.ge-input-checkbox');
      if (propertyCheckbox) {
        this.labelControl(propertyCheckbox, this.getColumnAriaLabel(columnIndex));
      }
      return;
    }
    const ownTexts = this.tableOptions.ariaTexts;
    if (areaIdent === 'header' && (ownTexts?.expandGroup || ownTexts?.collapseGroup)) {
      const toggle = cell.querySelector<HTMLElement>('.ge-table-toggle-icon-div[role="button"]');
      if (toggle) {
        const label = toggle.getAttribute('data-ge-group-label') ?? '';
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        this.dom.domService.setAttribute(toggle, 'aria-label',
          expanded ? this.ariaTexts.collapseGroup(label) : this.ariaTexts.expandGroup(label));
      }
    }
  }

  /** The cell div of a column among the children of the given row divs. */
  private findCellDiv(rowDivs: HTMLDivElement[], columnIndex: number): HTMLDivElement | undefined {
    for (const rowDiv of rowDivs) {
      const cell = rowDiv.querySelector<HTMLDivElement>(`:scope > .ge-table-col-div[data-col-index="${columnIndex}"]`);
      if (cell) {
        return cell;
      }
    }
    return undefined;
  }

  /** Removes the cached row divs that are no longer in the area (see `ConvenienceDomService.addRowDiv`). */
  private pruneRowDivCache(divScope: DivScope) {
    const cache = divScope.cache;
    for (const key in cache) {
      if (cache[key].parentNode !== divScope.child) {
        delete cache[key];
      }
    }
  }

  /**
   * Draws big cells (rowspan and or colspan) in body/center
   * @param range CellRange
   * @param xStart X position in pixel for top left corner
   * @param yStart Y position in pixel for top left corner
   * @param areaModel AreaModelIf
   * @param parentDiv Parent div as HTMLDivElement
   * @param sideIdent SideIdent (west,center,east)
   * @protected
   */
  protected drawBigCell(
    range: CellRange,
    xStart: number,
    yStart: number,
    areaModel: AreaModelIf,
    parentDiv: HTMLDivElement,
    sideIdent: SideIdent) {

    // body: from the prefix sums (O(log n) – before 1.1.97 the heights of all rows above were summed for every span)
    const y1 = yStart + (areaModel.areaIdent === 'body'
      ? this.getBodyRowLayout().getTop(range.r1)
      : this.getRowHeights(0, range.r1 - 1, areaModel).reduce((a, b) => a + b, 0));

    const columnCount = this.tableModel.getColumnCount();
    const fixedRightColumnCount = this.tableModel.getFixedRightColumnCount();
    let firstColIdx = 0;
    if (fixedRightColumnCount > 0 && range.c1 >= columnCount - fixedRightColumnCount) {
      // We are on the (fixed) east side, so we have to fix firstColIdx:
      firstColIdx = columnCount - fixedRightColumnCount;
    }
    const x1 = xStart + this.getColumnWidths(firstColIdx, range.c1 - 1).reduce((a, b) => a + b, 0);

    const h = this.getRowHeights(range.r1, range.r2, areaModel).reduce((a, b) => a + b, 0);
    const w = this.getColumnWidths(range.c1, range.c2).reduce((a, b) => a + b, 0);

    let cellSelected = false;
    const selectionModel = this.getSelectionModel ? this.getSelectionModel() : undefined;
    if (selectionModel) {
      const count = selectionModel.getSelectionCount(range.r1, range.c1);
      cellSelected = count > 0;
    }
    // Screen readers: a cell must be in a row – the big cell gets a row of its own (0 × 0 px, the cell is positioned
    // relative to the area like before). Was the cell already rendered in its row (header groups), this one is a
    // visual duplicate and hidden from screen readers.
    const areaIdent = areaModel.areaIdent;
    const spanRow = this.dom.applyStyle(
      this.dom.createDivWithClass('ge-table-span-row', parentDiv),
      { position: 'absolute', left: '0', top: '0', width: '0', height: '0', overflow: 'visible' });
    if (this.renderedSpanCells.has(`${areaIdent}:${range.r1}:${range.c1}`)) {
      this.dom.setAriaHidden(spanRow);
    } else {
      this.applyRowAria(spanRow, areaIdent, areaModel, range.r1, false);
    }
    parentDiv = spanRow;

    if (range.gammaRange) {
      // TODO render hierarchy cell
      // console.info('TODO here', range);

      this.renderCell({
        areaModel,
        areaIdent: areaModel.areaIdent,
        sideIdent,
        rowIndex: range.r1,
        columnIndex: range.c1,
        left: x1,
        top: y1,
        width: w,
        height: h,
        parent: parentDiv,
        cellSelected,
        lastRowOfModel: true,
        gammaRange: range.gammaRange
      });
    } else {

      this.renderCell({
        areaModel,
        areaIdent: areaModel.areaIdent,
        sideIdent,
        rowIndex: range.r1,
        columnIndex: range.c1,
        left: x1,
        top: y1,
        width: w,
        height: h,
        parent: parentDiv,
        cellSelected,
        lastRowOfModel: true,
        gammaRange: range.gammaRange
      });
    }

    if (areaModel.areaIdent === 'header' && this.tableOptions.columnsResizable && this.isColumnResizable(range.c1)) {
      this.renderHeaderCellResizeHandle({
        rowIndex: range.r1,
        columnIndex: range.c1,
        cellLeft: x1,
        cellTop: y1,
        cellWidth: w,
        cellHeight: h,
        parent: parentDiv
      });
    }
  }

  /**
   * Finds the row index of an important rowspan cell in a given area model.
   *
   * @param {AreaModelIf} areaModel - The area model to search in.
   * @param {number} rowIndex - The current row index.
   * @param {number} colIndex - The current column index.
   * @returns {number} - The row index of the important rowspan cell, or -1 if not found.
   * @protected
   */
  protected findRowOfImportantRowspanCell(areaModel: AreaModelIf, rowIndex: number, colIndex: number): number {
    const maxRowspan = areaModel.getMaxRowspan();
    for (let r = rowIndex - 1; r > -1; r--) {
      const rowspan = areaModel.getRowspanAt(r, colIndex);
      if (rowspan > 1 && r + rowspan + 1 >= rowIndex) {
        return r;
      }
      if (rowIndex - r > maxRowspan) {
        return -1;
      }
    }
    return -1;
  }

  /**
   * Adjusts the columns to fit the width of the row's parent element.
   *
   * @param {ArgsAdjustColumnsToRowParentParams} params - The parameters for adjusting the columns.
   * @protected
   * @return {void}
   */
  protected adjustColumnsToRowParent(
    {
      areaIdent,
      sideIdent,
      areaModel,
      geo,
      parent,
      rowIndex,
      columnIndexStart,
      columnIndexEnd,
      verticalFixed = false,
      lastRowOfModel = false
    }: ArgsAdjustColumnsToRowParentParams
  ): void {

    // if (areaIdent==='header'){
    //   console.info('################## rowIndex:' + rowIndex)
    //   console.info('##################')
    // }

    // Note: do not read layout properties (scrollLeft, clientWidth, …) here – this method runs for every row
    // after new cells were appended, so each read would force a synchronous layout (layout thrashing).
    let virtualRowDivLeft = 0;
    if (!verticalFixed) {
      const virtualRowDivLeftF1 = (this.areaBodyCenterGeo.width) - this.tableModel.getContentWidthInPixel();
      virtualRowDivLeft = this.snapToDevicePixel(this.scrollFactorX * virtualRowDivLeftF1);
    }

    const top = 0;
    const renderSelection = !!(areaIdent === 'body' && sideIdent);

    let x = virtualRowDivLeft;
    for (let index = columnIndexStart; index <= columnIndexEnd; index++) {
      const left = x;
      const w = this.tableModel.getColumnWidth(index);
      if (w > 0 && left + w > 0) {
        // Visible! Render cell div:

        // calc height:
        let height = geo.height;
        const rowspan = areaModel.getRowspanAt(rowIndex, index);
        const colspan = areaModel.getColspanAt(rowIndex, index);
        // if (areaIdent==='header') {
        //   console.info(rowIndex+'/'+index, rowspan+'_'+colspan)
        // }

        if (rowspan > 1) {
          height = this.getRowHeights(rowIndex, rowIndex + rowspan - 1, areaModel).reduce((a, b) => a + b, 0);
        }

        let width = w;
        if (colspan > 1) {
          width = this.getColumnWidths(index, index + colspan - 1).reduce((a, b) => a + b, 0);
        }

        let skip = false;
        if (this.colAndRowspanModels && this.colAndRowspanModels[areaIdent]) {
          if (this.colAndRowspanModels[areaIdent]?.isInRange(rowIndex, index)) {
            skip = true; // for the body area we don't want to render the small single cells
          }
        }

        if (this.draggingTargetColumnIndex === index
          && areaIdent !== 'header') {
          // For a running drag and drop action:
          this.renderDragTargetDiv(parent, left, top, width, height);
          const geo1 = { left, top, width, height };
          this.dom.addColumnBorderDivs(this.tableOptions, parent, geo1, areaIdent, sideIdent);

        } else {
          const cellSelected = this.renderSelectedBackgroundDiv(skip, renderSelection, sideIdent, areaModel, rowIndex, index, parent, left, top, width, height);

          const gammaCells = 'gammaCells' in areaModel;
          if (gammaCells && areaModel.getValueAt(rowIndex, index)) {
            skip = false;
          }
          if (!skip) {
            this.renderCell({
              areaModel,
              areaIdent,
              sideIdent,
              rowIndex,
              columnIndex: index,
              left,
              top,
              width,
              height,
              parent,
              cellSelected,
              lastRowOfModel,
              gammaRange: true
            });
          }
          if (areaIdent === 'header' && this.tableOptions.columnsResizable && this.isColumnResizable(index)) {
            this.renderHeaderCellResizeHandle({
              rowIndex: rowIndex,
              columnIndex: index,
              cellLeft: left,
              cellTop: top,
              cellWidth: width,
              cellHeight: height,
              parent: parent
            });
          }
        }
      }

      x = x + w;
      if (x > this.areaBodyCenterGeo.width) {
        break;
      }
    }
    // Right vertical border:
    if (this.tableOptions.verticalBorderVisible) {
      this.dom.addVerticalBorder(new GeoData(x - 1, 1, geo.height, 0), parent);
    }
  }


  /**
   * Retrieves the column index of the tree arrow column in the table.
   *
   * @protected
   *
   * @returns {number} The column index of the tree arrow column: the first data column (0, behind a row number
   *                column 1), one more with a visible row checkbox column.
   */
  protected getTreeArrowColumnIndex(): number {
    // behind a RowNumberColumnDef (since 1.1.93) everything moves one column to the right
    const offset = this.getFirstDataColumnIndex();
    if (this.tableOptions.showCheckboxWihoutExtraColumn) {
      return offset;
    }
    if (this.tableModel.isRowCheckboxVisible()) {
      return offset + 1;
    }
    return offset;
  }

  /**
   * Index of the first column that is not a row number column: 1 behind a {@link RowNumberColumnDef}, otherwise 0.
   * The checkbox of `showCheckboxWihoutExtraColumn` and the tree arrow are bound to it.
   *
   * @returns {number} 0 or 1
   * @since 1.1.93
   */
  getFirstDataColumnIndex(): number {
    return getLeadingRowNumberColumnCount(this.tableModel.getColumnDefs?.());
  }

  /** false for a row number column: it has no resize handle (its width follows the numbers). */
  protected isColumnResizable(columnIndex: number): boolean {
    return !isRowNumberColumnDef(this.tableModel.getColumnDef(columnIndex));
  }

  /**
   * The last measured text of the row number column and its width (measured again only when the text changes).
   * `approximate`: measured with the font of the host before a number cell existed – measured again with the font of
   * a rendered number cell in the next render pass.
   */
  private rowNumberWidth?: { text: string; width: number; approximate: boolean };
  /** true while the containers are adjusted to a new row number width (no second change in that nested pass). */
  private adjustingRowNumberWidth = false;
  /** the approximate first width is measured again once (see adjustAfterScrolling). */
  private rowNumberRemeasureScheduled = false;

  /**
   * Fits the width of a leading row number column ({@link RowNumberColumnDef}) to its largest number. Cheap on every
   * render pass: only the text of the largest number is compared; it is measured (canvas) only when it changed.
   *
   * @returns {boolean} true if the width changed (the containers must be adjusted)
   * @since 1.1.93
   */
  protected adjustRowNumberColumnWidth(): boolean {
    if (!this.getFirstDataColumnIndex()) {
      return false;
    }
    if ((this.tableModel as { overridingColumnWidth?: number }).overridingColumnWidth! > -1) {
      return false; // one width for all columns (overridingColumnWidth) – the row numbers get it, too
    }
    const columnDef = this.tableModel.getColumnDef(0) as RowNumberColumnDef;
    const text = columnDef.getWidestText(this.tableModel.getBodyModel());
    const cached = this.rowNumberWidth;
    let width = cached?.text === text ? cached.width : -1;
    if (width < 0 || (cached?.approximate && this.findRowNumberLabel())) {
      const [measured, approximate] = this.measureRowNumberText(text);
      width = Math.max(columnDef.options.minWidthInPx, measured);
      this.rowNumberWidth = { text, width, approximate };
    }
    if (this.tableModel.getColumnWidth(0) === width || this.tableModel.isColumnVisible?.(0) === false) {
      return false;
    }
    this.tableModel.setColumnWidth(0, width);
    return this.tableModel.getColumnWidth(0) === width; // false if the model did not take it (no endless re-render)
  }

  /** A rendered label of a number cell – its font and padding are what the numbers need. */
  private findRowNumberLabel(): HTMLElement | null {
    return this.hostElement.querySelector<HTMLElement>('.ge-table-row-number .ge-table-label');
  }

  /**
   * Width in px of a row number text: with the font and padding of a rendered number cell label; before the first
   * number cell exists with the font of the host and 6 px padding on each side (then `approximate` is true).
   * Digits are measured as "0" (tabular figures: all digits are as wide as the widest).
   *
   * @returns {[number, boolean]} the width and whether it is approximate
   */
  protected measureRowNumberText(text: string): [number, boolean] {
    const label = this.findRowNumberLabel();
    const style = getComputedStyle(label ?? this.hostElement);
    const padding = label
      ? (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0)
      : 2 * 6;                                       // .ge-table-row-number .ge-table-label { padding-inline: 6px }
    const extra = padding + 4;                       // cell borders and rounding
    const widestDigits = text.replace(/[0-9]/g, '0');
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = document.createElement('canvas').getContext('2d');
    } catch (_e) {
      ctx = null;
    }
    if (!ctx) {
      return [Math.ceil(text.length * 8 + extra), !label];
    }
    ctx.font = style.font || `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return [Math.ceil(ctx.measureText(widestDigits).width + extra), !label];
  }


  protected addAndRenderCellDiv(
    {
      areaModel,
      areaIdent,
      sideIdent,
      rowIndex,
      index,
      left,
      width,
      height,
      top,
      parent,
      lastRowOfModel
    }: ArgsRenderCellDiv): [HTMLDivElement, RendererCleanupFnType | undefined] {

    // the editor belongs to the body only (header row 0 has the same row index as body row 0)
    const editor = areaIdent === 'body' && this.editorRenderer && this.editorRendererRow === rowIndex && this.editorRendererColumn === index;
    const columnDef = this.tableModel.getColumnDef(index);
    // row numbers come from the column definition – also for own area models without renderers
    const rowNumberColumn = isRowNumberColumnDef(columnDef);
    const cellRenderer = (editor)
      ? this.editorRenderer
      : (rowNumberColumn && areaIdent === 'body' ? columnDef.rendererMap.body : undefined)
        ?? areaModel.getCellRenderer(rowIndex, index);
    const geo = { left, width, height, top, index };
    const rowObject = areaModel.getRowByIndex(rowIndex);
    let treeArrow: TreeArrowType = 'none';

    const arrowIndexOk = index === this.getTreeArrowColumnIndex();

    if (arrowIndexOk && isTreeRow(rowObject)) {
      const tr = rowObject as TreeRow<any>;
      // with a filter: no arrow if none of the children is shown (AreaModelTree.hasDisplayedChildren)
      const hasChildren = 'hasDisplayedChildren' in areaModel && typeof areaModel.hasDisplayedChildren === 'function'
        ? (areaModel as AreaModelTree<any>).hasDisplayedChildren(tr)
        : !!tr.children?.length;
      if (hasChildren) {
        if (tr.expanded) {
          treeArrow = 'expanded';
        } else {
          treeArrow = 'collapsed';
        }
      } else {
        treeArrow = 'hidden';
      }
    }

    let sortState = undefined;
    if (areaIdent === 'header') {
      if (!columnDef?.sortIconVisible || columnDef?.sortIconVisible()) {
        sortState = columnDef?.sortState;
      }
    }

    // batch edit: a pending value is shown instead of the model value (since 1.1.96)
    const pending = areaIdent === 'body' && this.batchEditService?.hasPending()
      ? this.batchEditService.getPendingAt(rowIndex, index)
      : undefined;
    const val = pending ? pending.newValue : areaModel.getValueAt(rowIndex, index);
    // undefined/null → empty cell (e.g. parent rows of a tree); the footer of a row number column stays empty
    const text = cellRenderer || (rowNumberColumn && areaIdent === 'footer') ? '' : `${val ?? ''}`;
    const checkedType = areaModel.isRowChecked(rowIndex);
    const firstDataColumnIndex = this.getFirstDataColumnIndex();
    const checkboxAriaLabel = (this.tableOptions.showCheckboxWihoutExtraColumn && index === firstDataColumnIndex && checkedType)
      ? this.getCheckboxAriaLabel(areaIdent, rowIndex)
      : undefined;
    const cell = this.dom.addColumnDiv(
      {
        parent,
        geo,
        rowIndex,
        columnIndex: index,
        areaIdent,
        sideIdent,
        text,
        treeArrow,
        tableOptions: this.tableOptions,
        checkedType,
        sortState,
        checkboxAriaLabel,
        firstDataColumnIndex
      });
    const [rowspan, colspan] = this.applyCellAria(cell, areaIdent, areaModel, rowIndex, index);

    const tooltip = pending?.error || areaModel.getTooltipAt(rowIndex, index);
    if (tooltip) {
      this.dom.setAttribute(cell, 'title', tooltip);
    }
    if (pending) {
      this.dom.addClass('ge-table-cell-pending', cell);
      if (pending.error) {
        this.dom.addClass('ge-table-cell-invalid', cell);
        this.dom.setAttribute(cell, 'aria-invalid', 'true');
      }
    }

    if (columnDef && columnDef.classes[areaIdent]) {
      this.dom.addClasses(columnDef.classes[areaIdent], cell);
    }

    let fn: RendererCleanupFnType | undefined = undefined;
    if (cellRenderer) {
      fn = cellRenderer.render(cell, rowIndex, index, areaIdent, areaModel, val, this.dom.domService);
      if (editor) {
        // the cell is rebuilt on every repaint (e.g. after the click events of the double click) –
        // give the new input/select the focus, otherwise typing goes nowhere
        const input = cell.querySelector('input, select') as HTMLInputElement | HTMLSelectElement | null;
        if (input) {
          this.labelControl(input, this.getColumnAriaLabel(index)); // screen readers: "Total, edit text"
          const draft = this.editorDraft;
          if (draft && draft.rowIndex === rowIndex && draft.columnIndex === index && input instanceof HTMLInputElement) {
            input.value = draft.value; // the text typed before this repaint (since 1.1.99)
            // a value set by code fires no "change" – InputHandler commits it on Enter / leaving the field
            this.dom.setAttribute(input as unknown as HTMLDivElement, 'data-ge-restored', 'true');
          }
          if (!input.contains(document.activeElement)) input.focus();
          if (draft && draft.rowIndex === rowIndex && draft.columnIndex === index && input instanceof HTMLInputElement
            && draft.start !== null && draft.end !== null) {
            try {
              input.setSelectionRange(draft.start, draft.end);
            } catch {
              // input types without a selection
            }
          }
        }
      } else {
        this.labelRendererControls(cell, cellRenderer, areaIdent, rowIndex, index);
      }
    }

    const classes = areaModel.getCustomClassesAt(rowIndex, index);
    if (classes.length) {
      this.dom.addClasses(classes, cell);
    }
    if (areaIdent === 'body' && this.cellEditorService && !rowNumberColumn) {
      // Excel-style editing (since 1.1.99): read-only cells say so; the edited cell owns the editor above it
      if (!areaModel.isEditable(rowIndex, index)) {
        this.dom.setAttribute(cell, 'aria-readonly', 'true');
      }
      const editorId = this.cellEditorService.getOwnedEditorId(rowIndex, index);
      if (editorId) {
        this.dom.setAttribute(cell, 'aria-owns', editorId);
      }
    }

    this.dom.addColumnBorderDivs(this.tableOptions, parent, geo, areaIdent, sideIdent);
    if (lastRowOfModel) {
      this.dom.addHorizontalBorder({ left, width, height, top: top + height }, parent);
    }
    if (this.getFocusModel && areaIdent === 'body' && !this.headerFocus) {
      const fm = this.getFocusModel();
      if (fm?.hasFocus(rowIndex, index)) {
        this.dom.addFocusBorderDivs(parent, geo, {});
        this.setAriaFocusedCell(cell, areaIdent, rowIndex, index);
      } else if (fm && (rowspan > 1 || colspan > 1)) {
        const [fr, fc] = fm.getFocus();
        if (fr >= rowIndex && fr < rowIndex + rowspan && fc >= index && fc < index + colspan) {
          this.setAriaFocusedCell(cell, areaIdent, rowIndex, index);
        }
      }
    } else if (areaIdent === 'header' && this.headerFocus
      && this.headerFocus[0] === rowIndex && this.headerFocus[1] === index) {
      this.dom.addFocusBorderDivs(parent, geo, {});
      this.setAriaFocusedCell(cell, areaIdent, rowIndex, index);
    }
    if (areaIdent === 'header' && !rowNumberColumn) {
      this.dom.setAttribute(cell, 'data-ge-action', 'drag-column'); // the row numbers stay in front
    }
    if (areaIdent === 'body' && this.masterDetailService?.isActive()) {
      this.masterDetailService.decorateCell(cell, rowIndex, index); // the expand icon of a master row (since 1.1.97)
    }
    if (areaIdent === 'body' && this.rowDragService && !editor) {
      if (columnDef?.rowDrag) {
        this.rowDragService.decorateCell(cell, this.rowDragService.getHandleState(rowIndex, columnDef, areaModel));
      }
      if (this.rowDragService.isDragSourceRow(rowIndex)) {
        this.dom.addClass('ge-table-row-dragging', cell);
      }
    }

    const styles = areaModel.getCustomStyleAt(rowIndex, index);
    if (styles) {
      for (const css in styles) {
        this.dom.domService.setStyle(cell, css, styles[css]); // own styles of the app: as given (no RTL mirroring)
      }
    }
    return [cell, fn];
  }

  /**
   * Applies CSS classes to an HTML element.
   *
   * @param {HTMLDivElement} ele - The HTML element to which CSS classes will be applied.
   * @param {Object.<string, boolean>} cssClasses - An object containing CSS class names as keys and boolean values indicating whether to apply or remove the class.
   * @protected
   */
  protected applyCssClasses(ele: HTMLDivElement, cssClasses: { [key: string]: boolean } = {}) {
    if (ele) {
      Object.entries(cssClasses)
        .forEach(([key, value]) => {
          if (value) {
            this.dom.addClass(key, ele);
          } else {
            this.dom.removeClass(key, ele);
          }
        });
    }
  }

  /**
   * Retrieves the column widths of a table within a specified range.
   *
   * @param {number} startIndex - The index of the first column to retrieve the width of.
   * @param {number} endIndex - The index of the last column to retrieve the width of.
   *
   * @return {number[]} An array containing the widths of the columns within the specified range.
   */
  protected getColumnWidths(startIndex: number, endIndex: number): number[] {
    const ret: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      ret.push(this.tableModel.getColumnWidth(i));
    }
    return ret;
  }

  /**
   * Retrieves the heights of rows within a specified range.
   *
   * @param {number} startIndex - The index of the first row in the range.
   * @param {number} endIndex - The index of the last row in the range.
   * @param {AreaModelIf} areaModel - The area model.
   * @return {number[]} - An array containing the heights of the rows within the specified range.
   */
  protected getRowHeights(startIndex: number, endIndex: number, areaModel: AreaModelIf): number[] {
    const ret: number[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      ret.push(areaModel.getRowHeight(i));
    }
    return ret;
  }

  /**
   * Adjusts the position and size of the hover row based on the mouse move event.
   *
   * @param {GeMouseEvent} mouseMoveEvent - The mouse move event.
   *
   * @return {void}
   */
  protected adjustHoverRows(mouseMoveEvent: GeMouseEvent) {
    // only body rows: the hover row is positioned in the body (a header row 0 was drawn on body row 0)
    if (this.tableOptions.hoverRowVisible && mouseMoveEvent.rowIndex > -1 && mouseMoveEvent.areaIdent === 'body') {
      const width = this.hostElement.clientWidth;
      const rowHeight = this.tableModel.getAreaModel('body').getRowHeight(mouseMoveEvent.rowIndex);
      // Always the rendered content offset, never scrollTop: the scroll bar range (viewport incl. footer, wrapper + 1 px,
      // capped height) differs from the content range – with a footer the hover row drifted the further one scrolled.
      const scrolledOut = this.contentScrollTop;
      const top = mouseMoveEvent.rowTop + this.areaHeaderCenter.parent.clientHeight - scrolledOut;
      this.dom.applyStyle(this.hoverRow, {
        'left': '0',
        'top': top + 'px',
        'width': width + 'px',
        'height': rowHeight + 'px',
        'display': 'block'
      });
    } else {
      this.hideHoverRow();
    }
  }

  /**
   * Hides the hover row by applying 'display: none' style to it.
   *
   * @protected
   * @function
   * @name hideHoverRow
   * @memberof ClassName
   *
   * @returns {void}
   */
  /**
   * Hides the hover row and column – e.g. while the pointer is over a detail row (master/detail).
   *
   * @since 1.1.97
   */
  hideHover(): void {
    this.hideHoverRow();
    this.hideHoverColumn();
  }

  protected hideHoverRow() {
    this.dom.applyStyle(this.hoverRow, {
      'display': 'none'
    });
  }

  /**
   * Adjusts the position and size of the hover column based on the mouse move event.
   *
   * @param {GeMouseEvent} mouseMoveEvent - The mouse move event object.
   */
  protected adjustHoverColumns(mouseMoveEvent: GeMouseEvent) {
    if (this.tableOptions.hoverColumnVisible && mouseMoveEvent.rowIndex > -1) {
      const height = this.hostElement.clientHeight;
      const width = this.tableModel.getColumnWidth(mouseMoveEvent.columnIndex);
      const left = this.getColumnLeftInHost(mouseMoveEvent.columnIndex, mouseMoveEvent.columnLeft);
      this.dom.applyStyle(this.hoverColumn, {
        'left': (left) + 'px',
        'top': '0px',
        'width': width + 'px',
        'height': height + 'px',
        'display': 'block'
      });
    } else {
      this.hideHoverColumn();
    }
  }


  /**
   * The x position of a column relative to the host element: fixed west and east columns do not scroll.
   *
   * @param {number} columnIndex - model index of the column
   * @param {number} columnLeft - x position of the column over all columns (`getXPosByColumnIndex`)
   * @returns {number} the left position in px
   */
  protected getColumnLeftInHost(columnIndex: number, columnLeft: number): number {
    const columnCount = this.tableModel.getColumnCount();
    const fixedLeft = this.tableModel.getFixedLeftColumnCount();
    const fixedRight = this.tableModel.getFixedRightColumnCount();
    if (columnIndex < fixedLeft) {
      return columnLeft;
    }
    if (fixedRight > 0 && columnIndex >= columnCount - fixedRight) {
      const firstEastColumnLeft = this.tableModel.getXPosByColumnIndex(columnCount - fixedRight);
      return this.areaBodyEastGeo.left + columnLeft - firstEastColumnLeft;
    }
    // center: the rendered content offset, not scrollLeft – the scroll bar range differs from the content range
    // (east columns, vertical scroll bar), so the hover column drifted with horizontal scrolling
    return columnLeft - this.getContentScrollLeft();
  }

  /**
   * Content pixels of the center columns scrolled out on the left – the offset that is actually rendered
   * (see adjustColumnsToRowParent), the horizontal counterpart of `contentScrollTop`.
   */
  protected getContentScrollLeft(): number {
    const virtualRowDivLeftF1 = this.areaBodyCenterGeo.width - this.tableModel.getContentWidthInPixel();
    return -this.snapToDevicePixel(this.scrollFactorX * virtualRowDivLeftF1);
  }

  /**
   * Hide hover column.
   *
   * This method hides the hover column by applying a style of 'display: none'
   * to the element representing the hover column.
   *
   * @protected
   * @memberof ClassName
   */
  protected hideHoverColumn() {
    this.dom.applyStyle(this.hoverColumn, {
      'display': 'none'
    });
  }

  /**
   * Executes a function after a specified delay, ensuring that the function is called only once within that delay period.
   *
   * @param {() => void} fn - The function to be executed.
   * @param {number} [delay=1000] - The delay in milliseconds before executing the function.
   *
   * @return {undefined}
   */
  /**
   * Cancels a pending debounced rendering and calls all renderer cleanup functions
   * (e.g. unmounts framework components rendered into cells). Used by {@link TableScope.destroy}.
   */
  protected disposeRendering(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    for (const areaIdent of ["header", "body", "footer"] as const) {
      while (this.cleanupFunctions[areaIdent].length) {
        const fn = this.cleanupFunctions[areaIdent].shift();
        if (fn) {
          fn();
        }
      }
    }
  }

  protected debounce(fn: () => void, delay: number = 1000) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(() => {
      this.debounceTimeout = null;
      fn.call(this);
    }, delay);
  }


  /**
   * Adjusts the dragging column during a mouse move event.
   *
   * @param {GeMouseEvent} mouseMoveEvent - The mouse move event.
   * @param {number} sourceColumnIndex - The index of the source column.
   * @param {boolean} firstDraggingRendering - Indicates if it's the first rendering of the dragging column.
   */
  protected adjustDraggingColumn(
    mouseMoveEvent: GeMouseEvent,
    sourceColumnIndex: number,
    firstDraggingRendering: boolean
  ) {
    if (this.dragging) {
      const height = this.hostElement.clientHeight;
      // sourceColumnIndex is the current index of the dragged column (it moves while dragging)
      const width = this.tableModel.getColumnWidth(sourceColumnIndex);

      if (mouseMoveEvent.originalEvent?.clientX) {
        // right-to-left: x in the host from its right edge (LTR kept as before – pixel for pixel, see TODO.md)
        const left = (this.isRtl()
          ? this.clientXToHostX(mouseMoveEvent.originalEvent.clientX)
          : mouseMoveEvent.originalEvent.clientX) - width / 2;
        const top = 0;
        const geo: GeoData = { left, width, height, top, index: sourceColumnIndex };
        this.dom.applyStyle(this.draggingColumn, {
          'background': 'rgba(128,128,128,0.2)',
          'display': 'block',
          'overflow': 'hidden' // the rows of the ghost must not spill out below the table
        });
        this.dom.applyStyleInPx(this.draggingColumn, geo);
        if (firstDraggingRendering) {
          // render dragging column:
          this.renderContentOfDraggingColumn(geo);
        }
      }
    } else {
      this.hideDraggingColumn();
    }
  }

  /**
   * Renders the content of a dragging column.
   *
   * @param {GeoData} columnGeo - The geographic data of the column.
   *
   * @returns {number} The y-coordinate of the rendered content.
   */
  protected renderContentOfDraggingColumn(columnGeo: GeoData) {
    const y = this.renderContentOfDraggingColumnForArea(columnGeo, 'header', 0);
    // only the rows visible in the body, at their current position (before: ALL body rows from the top –
    // millions of divs for a large table)
    const firstRow = Math.max(0, this.firstVisibleRowIndex);
    const firstRowTop = y + this.getBodyRowTop(firstRow) - this.contentScrollTop;
    this.renderContentOfDraggingColumnForArea(columnGeo, 'body', firstRowTop, firstRow, this.hostElement.clientHeight);
    // we refrain from rendering the footer:
    // y = this. renderContentOfDraggingColumnForArea(columnGeo, 'footer', y);
  }

  /**
   * Renders the content of the dragging column for a specific area.
   *
   * @param {GeoData} columnGeo - The geometry data of the dragging column.
   * @param {AreaIdent} areaIdent - The identifier of the area.
   * @param {number} [y=0] - The starting y-position.
   * @return {number} The final y-position after rendering all the content.
   */
  protected renderContentOfDraggingColumnForArea(
    columnGeo: GeoData,
    areaIdent: AreaIdent,
    y: number = 0,
    firstRowIndex: number = 0,
    maxY: number = Number.POSITIVE_INFINITY
  ): number {

    const sideIdent = 'center';
    const areaModel = this.tableModel.getAreaModel(areaIdent);
    const rowCount = areaModel?.getRowCount();
    if (rowCount) {
      const columnIndex = columnGeo.index ?? 0;
      const parent = this.draggingColumn;

      for (let rowIndex = firstRowIndex; rowIndex < rowCount && y < maxY; rowIndex++) {
        const top = y;
        const height = areaModel.getRowHeight(rowIndex);
        const geo = { left: 0, width: columnGeo.width, height, top, index: rowIndex };
        const val = areaModel.getValueAt(rowIndex, columnIndex);
        const cellRenderer = areaModel.getCellRenderer(rowIndex, columnIndex);
        const text = cellRenderer ? '' : `${val ?? ''}`; // undefined/null → empty cell (e.g. parent rows of a tree)
        const para: AddColumnDivPara = {
          parent,
          geo,
          rowIndex,
          columnIndex,
          areaIdent,
          sideIdent,
          text
        };
        const cell = this.dom.addColumnDiv(para);

        let fn: RendererCleanupFnType | undefined = undefined;
        if (cellRenderer) {
          fn = cellRenderer.render(cell, rowIndex, columnIndex, areaIdent, areaModel, val, this.dom.domService);
          if (fn) {
            this.cleanupFunctions[areaIdent].push(fn);
          }
        }

        const classes = areaModel.getCustomClassesAt(rowIndex, columnIndex);
        if (classes.length) {
          this.dom.addClasses(classes, cell);
        }
        const columnDef = this.tableModel.getColumnDef(columnIndex);
        if (columnDef && columnDef.classes[areaIdent]) {
          this.dom.addClasses(columnDef.classes[areaIdent], cell);
        }

        // unnecessary, as the horizontal borders of the table are visible due to the semi-transparent background of the column:
        this.dom.addColumnBorderDivs(this.tableOptions, parent, geo, areaIdent, sideIdent);

        const styles = areaModel.getCustomStyleAt(rowIndex, columnIndex);
        if (styles) {
          for (const css in styles) {
            this.dom.domService.setStyle(cell, css, styles[css]); // own styles of the app: as given (no RTL mirroring)
          }
        }
        y = y + height;
      }
    }
    return y;
  }

  /**
   * Hides the dragging column by applying a 'display: none' style to it.
   * This method is protected and can only be accessed within the class.
   *
   * @return {void}
   */
  protected hideDraggingColumn() {
    this.dom.applyStyle(this.draggingColumn, {
      'display': 'none'
    });
  }


  /**
   * Renders a draggable target div element.
   *
   * @param {HTMLDivElement} parent - The parent element where the target div will be appended to.
   * @param {number} left - The left position of the target div in pixels.
   * @param {number} top - The top position of the target div in pixels.
   * @param {number} width - The width of the target div in pixels.
   * @param {number} height - The height of the target div in pixels.
   * @return {HTMLDivElement} - The rendered draggable target div element.
   */
  private renderDragTargetDiv(parent: HTMLDivElement, left: number, top: number, width: number, height: number): HTMLDivElement {
    const div = this.dom.applyStylePosistionAbsolute(
      this.dom.setAriaHidden(this.dom.createDivWithClass('ge-table-drop-zone', parent))
    );
    this.dom.setStyle(div, 'left', `${left}px`);
    this.dom.setStyle(div, 'top', `${top}px`);
    this.dom.setStyle(div, 'width', `${width}px`);
    this.dom.setStyle(div, 'height', `${height}px`);
    return div;
  }


  /**
   * Render selected background div.
   *
   * @private
   * @param {boolean} skip - Whether to skip rendering.
   * @param {boolean} renderSelection - Whether to render the selection.
   * @param {SideIdent} sideIdent - The side identifier.
   * @param {AreaModelIf} areaModel - The area model.
   * @param {number} rowIndex - The row index.
   * @param {number} index - The index.
   * @param {HTMLDivElement} parent - The parent div element.
   * @param {number} left - The left position.
   * @param {number} top - The top position.
   * @param {number} width - The width of the div.
   * @param {number} height - The height of the div.
   * @returns {boolean} - Whether the cell is selected.
   */
  private renderSelectedBackgroundDiv(
    skip: boolean,
    renderSelection: boolean,
    sideIdent: SideIdent,
    areaModel: AreaModelIf,
    rowIndex: number,
    index: number,
    parent: HTMLDivElement,
    left: number, top: number, width: number, height: number) {
    let cellSelected = false;
    if (!skip && renderSelection && areaModel.isSelectable(rowIndex, index)) {
      if (this.getSelectionModel) {
        const selectionModel = this.getSelectionModel();
        if (selectionModel) {
          const count = selectionModel.getSelectionCount(rowIndex, index);
          cellSelected = count > 0;
          for (let i = 0; i < count; i++) {
            const div = this.dom.applyStylePosistionAbsolute(
              // ge-table-body-west-selected-range
              this.dom.setAriaHidden(this.dom.createDivWithClass(`ge-table-${areaModel.areaIdent}-${sideIdent}-selected-range`, parent))
            );
            this.dom.setStyle(div, 'left', `${left}px`);
            this.dom.setStyle(div, 'top', `${top}px`);
            this.dom.setStyle(div, 'width', `${width}px`);
            this.dom.setStyle(div, 'height', `${height}px`);
          }
        }
      }
    }
    return cellSelected;
  }

  /**
   * Renders a cell in the grid.
   *
   * @param {ArgsRenderCell} args - The arguments for rendering the cell.
   * @param {AreaModel} args.areaModel - The area model of the grid.
   * @param {string} args.areaIdent - The identifier of the area.
   * @param {string} args.sideIdent - The identifier of the side.
   * @param {number} args.rowIndex - The index of the row.
   * @param {number} args.columnIndex - The index of the column.
   * @param {number} args.left - The left position of the cell.
   * @param {number} args.top - The top position of the cell.
   * @param {number} args.width - The width of the cell.
   * @param {number} args.height - The height of the cell.
   * @param {HTMLElement} args.parent - The parent element of the cell.
   * @param {boolean} args.cellSelected - Indicates if the cell is selected.
   * @param {boolean} args.lastRowOfModel - Indicates if the cell is in the last row of the model.
   *
   * @returns {void}
   */
  private renderCell(
    {
      areaModel,
      areaIdent,
      sideIdent,
      rowIndex,
      columnIndex,
      left,
      top,
      width,
      height,
      parent,
      cellSelected,
      lastRowOfModel
    }: ArgsRenderCell
  ) {
    const [div, fn] = this.addAndRenderCellDiv({
      areaModel,
      areaIdent,
      sideIdent,
      rowIndex,
      index: columnIndex,
      left,
      width,
      height,
      top,
      parent,
      lastRowOfModel
    });
    if (cellSelected) {
      this.dom.addClass(`ge-table-${areaIdent}-${sideIdent}-selected-range`, div);
    }
    if (areaIdent === 'body' && this.ariaSelectionKind === 'cell') {
      this.dom.domService.setAttribute(div, 'aria-selected', cellSelected ? 'true' : 'false');
    }
    if (fn) {
      this.cleanupFunctions[areaIdent].push(fn);
    }
  }


  /**
   * Render the header cell resize handle.
   *
   * @param {ArgsRenderHeaderCellResizeHandle} args - The arguments for rendering the handle.
   * @param {number} args.rowIndex - The index of the row.
   * @param {number} args.columnIndex - The index of the column.
   * @param {number} args.cellLeft - The left position of the cell.
   * @param {number} args.cellTop - The top position of the cell.
   * @param {number} args.cellWidth - The width of the cell.
   * @param {number} args.cellHeight - The height of the cell.
   * @param {HTMLElement} args.parent - The parent element to append the handle to.
   *
   * @return {void}
   */
  private renderHeaderCellResizeHandle(
    { rowIndex, columnIndex, cellLeft, cellTop, cellWidth, cellHeight, parent }: ArgsRenderHeaderCellResizeHandle
  ) {

    const domService = this.dom.domService;
    const handleWidth = this.tableOptions.columnResizeHandleWidthInPx ?? 2;

    const div = domService.createElement<HTMLDivElement>('div');
    domService.setAttribute(div, 'data-col-index', `${columnIndex}`);
    domService.setAttribute(div, 'data-row-index', `${rowIndex}`);
    domService.setAttribute(div, 'data-area', 'header');
    domService.setAttribute(div, 'data-ge-action', 'resize-column');
    // domService.setAttribute(div, 'data-ge-action', 'column-resize');
    domService.addClass(div, `ge-table-column-resize-handle`);
    domService.setAttribute(div, 'aria-hidden', 'true'); // mouse only
    domService.setStyle(div, 'display', 'clip');
    domService.setStyle(div, 'position', 'absolute');
    domService.setStyle(div, 'cursor', 'col-resize');
    // at the end of the cell (right-to-left: its left edge) – the DOM service mirrors "left"
    this.dom.setStyle(div, 'left', `${(cellLeft + cellWidth - handleWidth)}px`);
    domService.setStyle(div, 'top', `${cellTop}px`);
    domService.setStyle(div, 'width', `${handleWidth}px`);
    domService.setStyle(div, 'height', `${cellHeight}px`);
    domService.appendChild(parent, div);
  }


}

