import { TableOverlayChange } from "./overlay/table-overlay";
import { GeOverlayKind } from "./overlay/ge-overlay-kind.type";
/* eslint @typescript-eslint/no-explicit-any: "off" */

import { TableModelIf } from './data/tablemodel/table-model.if';
import { AreaIdent } from './data/tablemodel/area-ident.type';
import { GeMouseEvent } from './data/common/event/ge-mouse-event';
import { DomServiceIf } from './service/dom-service.if';
import { ConvenienceDomService } from './service/convenience-dom.service';
import { TableOptionsIf } from './data/options/table-options.if';
import { MouseHandler } from './mouse-handler';
import { EventListenerIf } from './event-listener.if';
import { TableApi } from './table-api';
import { SortState } from './data/common/sort-state.type';
import { AreaModelTree } from './data/tablemodel/areamodel/area-model-tree';
import { StoreStateCollapsedExpandService } from './service/store-state-collapsed-expand.service';
import { StoreStateSortingService } from './service/store-state-sorting.service';
import { RenderScope } from './render-scope';
import { SortItem } from './data/common/sort-item';
import { TableStateService } from './state/table-state.service';
import { GeStateChangeEvent } from './data/common/event/ge-state-change-event';
import { InputHandler } from './input-handler';
import { GeModelChangeEvent } from './data/common/event/ge-model-change-event';
import { GeScrollEvent } from './data/common/event/ge-scroll-event';
import { SelectionService } from './selection/selection-service';
import { GeKeyEvent } from './data/common/event/ge-key-event';
import { OnActionTriggeredIf } from './action/on-action-triggered.if';
import { ActionId } from './action/action-id.type';
import { ShortcutService } from './action/shortcut.service';
import { EventAdapter } from './event-adapter';
import { SimpleDomService } from './service/simple-dom-service';
import { TableOptions } from './data/options/table-options';
import { TreeRowIf } from './data/common/tree-row-if';
import { isAreaModelRowGroups, isAreaModelTree, isCheckboxCellRenderer, isPivotTableModel, isRowNumberColumnDef, isTreeRow } from './instanceof-workaround';
import type { PivotConfigIf } from './pivot/pivot-config.if';
import type { DerivedValuesChangeIf } from './data/tablemodel/areamodel/derived-values-change.if';
import type { RowGroupField } from './rowgroup/row-group-field.type';
import { updateRowGroupLayout } from './rowgroup/row-group-layout';
import { LicenseManager } from './license-manager';
import { SelectionModel } from './selection/selection-model';
import { CopyService } from './service/copy-service';
import { CopyServiceIf } from './service/copy-service.if';
import { MouseTargetData } from './data/event/mouse-target-data';
import { AreaModelCellGroups } from './data/tablemodel/areamodel/area-model-cell-groups';
import { SelectionModelIf } from './selection/selection-model.if';
import { FocusModelIf } from './focus/focus-model.if';
import { EventFocusChangedListenerIf } from './focus/event-focus-changed-listener.if';
import { EventSelectionChangedListenerIf } from './selection/event-selection-changed-listener.if';
import { ResizeHandler } from './resize-handler';
import { ExcelService } from './service/excel-service';
import { ExcelServiceIf } from './service/excel-service.if';
import { ColumnDefIf } from './data/tablemodel/column/column-def.if';
import { LiveAnnouncer } from './aria/live-announcer';
import { CellGroupExt } from './data/tablemodel/cellgroup/cell-group-ext';


/**
 * Creates and runs one table in a host element – the core that every framework wrapper uses.
 *
 * It connects the four building blocks: host element, {@link TableModelIf table model}, {@link TableOptionsIf options}
 * and an {@link EventListenerIf event listener}, renders only the visible cells (virtual scrolling in both
 * directions) and handles mouse, keyboard, selection, sorting and editing. Talk to the table through
 * {@link getApi} – the {@link TableApi}.
 *
 * The host element needs a height: the table fills it.
 *
 * @example
 * import "@guiexpert/table/css/main.css";
 * import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
 *
 * const host = document.querySelector<HTMLDivElement>(".table-div")!;   // CSS: .table-div { height: 500px }
 * const tableModel = TableFactory.createTableModel({ rows: orders });
 * const tableScope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
 * tableScope.firstInit();
 * const tableApi = tableScope.getApi();
 *
 * // later: remove the table (route change, new model)
 * tableScope.destroy();
 *
 * @see Training: [Your first table in plain TypeScript](https://gui.expert/training/first-table/)
 *
 * @category Table & API
 */
export class TableScope extends RenderScope implements OnActionTriggeredIf, EventFocusChangedListenerIf, EventSelectionChangedListenerIf {

  public licenseManager = LicenseManager.getInstance();
  /**
   * Signal for all DOM listeners of this table (host element, scroll viewport, window).
   * {@link destroy} aborts it, which removes every listener at once.
   */
  public readonly listenerAbortController = new AbortController();
  private destroyed = false;
  public mouseHandler: MouseHandler;
  public inputHandler: InputHandler;
  public resizeHandler: ResizeHandler;
  public shortcutService: ShortcutService;

  /** @deprecated since 1.1.92 – always `undefined`; the state is kept by {@link stateService}. */
  public storeStateCollapsedExpandService?: StoreStateCollapsedExpandService;
  /** @deprecated since 1.1.92 – always `undefined`; the state is kept by {@link stateService}. */
  public storeSortingService?: StoreStateSortingService;
  /**
   * Collects, applies, stores and reports the state of this table (column layout, sorting, scroll, tree, checked
   * and selected rows …). Use {@link TableApi.getState} / {@link TableApi.applyState}.
   * @since 1.1.92
   */
  public readonly stateService: TableStateService;

  protected selectionService: SelectionService = new SelectionService(this);
  protected keyEvent?: GeKeyEvent;
  private api = new TableApi(this);

  /**
   * The live region of this table: screen readers speak its messages (sorting, filter, copy …).
   * Use {@link TableApi.announce} for own messages.
   * @since 1.1.91
   */
  readonly liveAnnouncer: LiveAnnouncer;
  /** Keyboard actions ignored while a blocking loading overlay is shown ({@link OverlayOptionsIf.blockInteractionWhileLoading}). */
  static actionsBlockedWhileLoading: ActionId[] = ['START_EDITING', 'TOGGLE_SELECTION', 'ACTIVATE_CELL'];
  /** Delay of the "42 rows" announcement after a filter change (typing in a filter field: one announcement). */
  static filterAnnouncementDelayInMs = 400;
  /** The text announced when the loading overlay appeared (dropped if loading ends before it is spoken). */
  private lastLoadingAnnouncement?: string;
  /** firstInit() has finished: announcements are made from now on (not for the initial filter). */
  private initialized = false;

  private mouseStartAction = '';
  private mouseStartWidth = -1;
  private mouseStartColumnIndex = -1;

  private dragFrom = -1;
  private dragTo = -1;
  private lastDragFrom = -1;
  private lastDragTo = -1;
  private firstDraggingRendering = true;
  /** Last comparator passed to `sort()`; re-applied after filtering. Cleared by a header sort. */
  private lastSortCompareFn?: (a: any, b: any) => number;

  constructor(
    hostElement: HTMLDivElement,
    tableModel: TableModelIf,
    domService: DomServiceIf,
    tableOptions: TableOptionsIf,
    protected readonly eventListener: EventListenerIf,
    public readonly copyService: CopyServiceIf = new CopyService(),
    public readonly excelService: ExcelServiceIf = new ExcelService(),
  ) {
    super(hostElement, tableModel, new ConvenienceDomService(domService), tableOptions);
    tableModel.setTableScope(this);
    this.liveAnnouncer = new LiveAnnouncer(hostElement.ownerDocument, this.ariaIds.liveRegion(), domService);

    if (!eventListener) {
      this.eventListener = new EventAdapter();
    }
    this.stateService = new TableStateService(this);
    this.mouseHandler = new MouseHandler(this);
    this.inputHandler = new InputHandler(this);
    this.resizeHandler = new ResizeHandler(this, tableOptions.resizeEventDebounceDelay);

    this.shortcutService = new ShortcutService(this);
    this.shortcutService.addListener(this.selectionService);

    const sm = this.getSelectionModel ? this.getSelectionModel() : undefined;
    if (sm) {
      sm.addEventSelectionChangedListener(this);
    }
    const fm = this.getFocusModel ? this.getFocusModel() : undefined;
    if (fm) {
      fm.addEventFocusChangedListener(this);
    }
    // Keyboard users who tab into the table start on a cell (WAI-ARIA grid pattern) – not on a mouse click
    // (that sets the focus cell itself) and not on a programmatic host.focus() (no side effect for apps).
    const signal = this.listenerAbortController.signal;
    hostElement.ownerDocument?.addEventListener('keydown', (evt: KeyboardEvent) => {
      if (evt.key === 'Tab') this.lastTabKeyTime = Date.now();
    }, { capture: true, signal });
    hostElement.addEventListener('focus', () => this.onHostKeyboardFocus(), { signal });
    // A click on a body cell or the scroll bar would focus the scroll viewport (tabindex -1) – the grid (host)
    // must keep the focus, otherwise screen readers lose aria-activedescendant.
    this.scrollViewport.addEventListener('focus', () => this.hostElement.focus({ preventScroll: true }), { signal });
  }

  /** Time of the last Tab key press on the page (the host is focused right after it). */
  private lastTabKeyTime = 0;

  /**
   * The host got the keyboard focus (Tab): without a focus cell the first shown cell of the first visible row
   * gets the focus, so screen readers announce a cell (`aria-activedescendant`).
   */
  private onHostKeyboardFocus() {
    const keyboard = Date.now() - this.lastTabKeyTime < 1000;
    const fm = this.focusModel();
    if (!keyboard || !fm || this.headerFocus || this.isEditing()) {
      return;
    }
    const [row, col] = fm.getFocus();
    const rowCount = this.tableModel.getBodyModel().getRowCount();
    if ((row < 0 || col < 0) && rowCount > 0 && this.tableModel.getColumnCount() > 0) {
      this.setFocusCell(Math.max(0, this.firstFullVisibleRowIndex), this.getFirstShownColumnIndex());
    } else if (rowCount < 1 && this.getAriaGridInfo().headerRowCount > 0 && this.tableModel.getColumnCount() > 0) {
      // no rows (empty table, nothing matches the filter): the header is what keyboard users can reach
      this.setHeaderFocus(this.getAriaGridInfo().headerRowCount - 1, this.getFirstShownColumnIndex());
    }
  }

  /**
   * Creates a TableScope instance.
   *
   * @param {HTMLDivElement} hostElement - The HTML div element that will contain the table.
   * @param {TableModelIf} tableModel - The table model object.
   * @param {TableOptionsIf} [tableOptions=new TableOptions()] - The optional table options object.
   * @param {EventListenerIf} [eventListener=new EventAdapter()] - The optional event listener object.
   * @param {DomServiceIf} [domService=new SimpleDomService()] - The optional DOM service object.
   * @param {CopyServiceIf} [copyService=new CopyService()] - The optional copy service object.
   *
   * @return {TableScope} - The newly created TableScope instance.
   */
  static create(hostElement: HTMLDivElement, tableModel: TableModelIf, tableOptions: TableOptionsIf = new TableOptions(), eventListener: EventListenerIf = new EventAdapter(), domService: DomServiceIf = new SimpleDomService(), copyService: CopyServiceIf = new CopyService()): TableScope {
    return new TableScope(hostElement, tableModel, domService, tableOptions, eventListener, copyService);
  }

  /**
   * Triggers an action based on the provided actionId.
   *
   * This function can be invoked manually via the table API or by keyboard shortcuts.
   *
   * @param {ActionId} actionId - The identifier of the action to be triggered.
   * @return {boolean} - Returns true if the action was triggered successfully, false otherwise.
   */
  onActionTriggered(actionId: ActionId): boolean {
    if (!this.headerFocus && this.tableOverlay.isBlocking() && TableScope.actionsBlockedWhileLoading.includes(actionId)) {
      return true; // a blocking "Loading…" over the body: no editing, no toggling (navigation, copying, header still work)
    }
    if (this.headerFocus) {
      const consumed = this.onHeaderAction(actionId);
      if (consumed !== undefined) {
        return consumed;
      }
    }
    if (actionId === 'NAVIGATE_UP' && this.moveFocusIntoHeader()) {
      return true;
    }
    const bodyNavigation = this.onBodyNavigation(actionId);
    if (bodyNavigation !== undefined) {
      return bodyNavigation;
    }
    if (actionId === 'NAVIGATE_DOWN') {
      if (this.changeFocusCell(0, 1)) {
        return true;
      }
    }
    if (actionId === 'NAVIGATE_UP') {
      if (this.changeFocusCell(0, -1)) {
        return true;
      }
    }
    if (actionId === 'NAVIGATE_LEFT') {
      if (this.changeFocusCell(-1, 0)) {
        return true;
      }
    }
    if (actionId === 'NAVIGATE_RIGHT') {
      if (this.changeFocusCell(1, 0)) {
        return true;
      }
    }
    if (actionId === 'START_EDITING') {
      if (this.getFocusModel) {
        const fm = this.getFocusModel();
        if (fm) {
          const [rowIdx, colIdx] = fm.getFocus();
          if (this.tableModel.getBodyModel().isEditable(rowIdx, colIdx)) {
            this.clearSelection();
            this.initRenderEditor(rowIdx, colIdx);
          }
        }
        return true;
      }
    }
    if (actionId === 'COPY_2_CLIPBOARD') {
      const sm = this.getSelectionModel ? this.getSelectionModel() : undefined;
      const fm = this.getFocusModel ? this.getFocusModel() : undefined;
      this.copyService
        .createContent(this.tableModel, sm, fm)
        .then(txt => this.copyService.copyContent(txt).then(() => this.announceCopied(txt)))
        .catch(reason => console.warn('GuiExpert Table – copy to clipboard failed:', reason));
    }
    return false;
  }

  /**
   * Speaks a message to screen reader users (polite live region, see {@link LiveAnnouncer}).
   *
   * @param {string} text - plain text, e.g. "Orders loaded"
   * @param {number} [delayInMs] - wait before the text is written (default {@link LiveAnnouncer.defaultDelayInMs})
   * @since 1.1.91
   */
  announce(text: string, delayInMs?: number): void {
    if (text && !this.isDestroyed()) {
      this.liveAnnouncer.announce(text, delayInMs);
    }
  }

  /**
   * Shows the loading overlay over the body (see {@link TableApi.showLoadingOverlay}).
   *
   * @param {string} [text] - text for this overlay, default {@link OverlayOptionsIf.loadingText}
   * @since 1.1.92
   */
  showLoadingOverlay(text?: string): void {
    this.tableOverlay.showLoading(text);
  }

  /**
   * Shows the "no rows" overlay (see {@link TableApi.showNoRowsOverlay}).
   *
   * @param {string} [text] - text for this overlay, default {@link OverlayOptionsIf.noRowsText}
   * @since 1.1.92
   */
  showNoRowsOverlay(text?: string): void {
    this.tableOverlay.showNoRows(text);
  }

  /**
   * Ends an overlay shown by the API (see {@link TableApi.hideOverlay}).
   *
   * @since 1.1.92
   */
  hideOverlay(): void {
    this.tableOverlay.hide();
  }

  /**
   * The overlay shown now (see {@link TableApi.getOverlayState}).
   *
   * @since 1.1.92
   */
  getOverlayState(): GeOverlayKind {
    return this.tableOverlay.getState();
  }

  /**
   * Screen readers: `aria-busy` while loading, the loading text is spoken; "no rows" is spoken when it appears
   * after the start (not for the initially empty table). "No matching rows" is not spoken: the filter
   * announcement ({@link AriaTextsIf.filtered}) already says it.
   */
  protected override onOverlayChanged(change: TableOverlayChange): void {
    if (this.isDestroyed()) {
      return;
    }
    if (change.kind === "loading") {
      this.setHostAriaAttribute("aria-busy", "true");
      if (this.tableOverlay.isBlocking()) {
        this.hideHoverRow(); // no hover under the layer (mouse moves on it are ignored)
        this.hideHoverColumn();
      }
    } else if (change.previous === "loading") {
      this.restoreHostAriaAttribute("aria-busy");
      this.liveAnnouncer.cancel(this.lastLoadingAnnouncement); // loading ended before "Loading…" was spoken
    }
    if (change.kind === "loading") {
      this.lastLoadingAnnouncement = change.text;
    }
    if (change.kind === "loading" || (change.kind === "noRows" && this.initialized)) {
      this.announce(change.text);
    }
  }

  /** "12 cells copied" – the selected cells of the shown columns (without a selection: the focused cell). */
  announceCopied(_text?: string): void {
    this.announce(this.ariaTexts.copied(this.countCopiedCells()));
  }

  /** The number of cells a copy takes: selected cells of shown columns (like CopyService), otherwise 1 (focus). */
  private countCopiedCells(): number {
    const sm = this.selectionModel();
    if (!sm?.hasSelection()) {
      return 1;
    }
    const rowCount = this.tableModel.getBodyModel().getRowCount();
    const columnCount = this.tableModel.getColumnCount();
    const shown = (c: number) => this.tableModel.getColumnDef(c)?.isVisible?.() !== false;
    let shownColumns = 0;
    for (let c = 0; c < columnCount; c++) if (shown(c)) shownColumns++;
    if (sm.isAllSelected()) {
      return rowCount * shownColumns;
    }
    const ranges = sm.getRanges();
    if (!ranges.length) {
      return 1;
    }
    const r1 = Math.max(0, Math.min(...ranges.map(r => r.r1)));
    const r2 = Math.min(rowCount - 1, Math.max(...ranges.map(r => r.r2)));
    const c1 = Math.max(0, Math.min(...ranges.map(r => r.c1)));
    const c2 = Math.min(columnCount - 1, Math.max(...ranges.map(r => r.c2)));
    if ((r2 - r1 + 1) * (c2 - c1 + 1) > CopyService.maxCopyCells) {
      return 0; // not copied (too many cells)
    }
    let n = 0;
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (shown(c) && sm.isSelected(r, c)) n++;
      }
    }
    return n;
  }

  /**
   * The header cell with the keyboard focus (arrow up in the first body row moves the focus into the header).
   *
   * @returns {[number, number] | undefined} header row and column index of the cell, `undefined` if the focus is in the body
   * @since 1.1.91
   */
  getHeaderFocus(): [number, number] | undefined {
    return this.headerFocus ? [this.headerFocus[0], this.headerFocus[1]] : undefined;
  }

  /** Moves the body focus to a cell, scrolls it into view and repaints (also leaves the header). */
  private setFocusCell(rowIndex: number, columnIndex: number): boolean {
    const fm = this.focusModel();
    if (!fm) {
      return false;
    }
    this.headerFocus = undefined;
    fm.setFocus(rowIndex, columnIndex);
    this.ensureColumnIsVisible(columnIndex); // first: ensureRowIsVisible() keeps the horizontal position
    this.ensureRowIsVisible(rowIndex);
    this.repaint();
    return true;
  }

  private getFirstShownColumnIndex(): number {
    return this.getNextShownColumnIndex(-1, 1, this.tableModel.getColumnCount());
  }

  private getLastShownColumnIndex(): number {
    const count = this.tableModel.getColumnCount();
    return this.getNextShownColumnIndex(count, -1, count);
  }

  /** Home, End, Ctrl+Home, Ctrl+End, Page Up/Down and Enter in the body; `undefined` = not such an action. */
  private onBodyNavigation(actionId: ActionId): boolean | undefined {
    const fm = this.focusModel();
    const pageActions: ActionId[] = ['NAVIGATE_ROW_START', 'NAVIGATE_ROW_END', 'NAVIGATE_FIRST_CELL',
      'NAVIGATE_LAST_CELL', 'NAVIGATE_PAGE_UP', 'NAVIGATE_PAGE_DOWN', 'ACTIVATE_CELL'];
    if (!pageActions.includes(actionId)) {
      return undefined;
    }
    if (!fm || this.isEditing()) {
      return false;
    }
    const rowCount = this.tableModel.getBodyModel().getRowCount();
    if (rowCount < 1 || this.tableModel.getColumnCount() < 1) {
      return false;
    }
    const [row, col] = fm.getFocus();
    const currentRow = Math.min(Math.max(row, 0), rowCount - 1);
    const currentCol = col < 0 ? this.getFirstShownColumnIndex() : col;
    const page = Math.max(1, this.displayedRowCount - 1);
    switch (actionId) {
      case 'NAVIGATE_ROW_START':
        return this.setFocusCell(currentRow, this.getFirstShownColumnIndex());
      case 'NAVIGATE_ROW_END':
        return this.setFocusCell(currentRow, this.getLastShownColumnIndex());
      case 'NAVIGATE_FIRST_CELL':
        return this.setFocusCell(0, this.getFirstShownColumnIndex());
      case 'NAVIGATE_LAST_CELL':
        return this.setFocusCell(rowCount - 1, this.getLastShownColumnIndex());
      case 'NAVIGATE_PAGE_UP':
        return this.setFocusCell(Math.max(0, currentRow - page), currentCol);
      case 'NAVIGATE_PAGE_DOWN':
        return this.setFocusCell(Math.min(rowCount - 1, currentRow + page), currentCol);
      default:
        return row < 0 || col < 0 ? false : this.activateBodyCell(row, col);
    }
  }

  /** Enter on a body cell: toggles its row checkbox, otherwise expands/collapses its tree row. */
  private activateBodyCell(rowIndex: number, columnIndex: number): boolean {
    const bodyModel = this.tableModel.getBodyModel();
    const checkboxCell = bodyModel.isRowCheckable(rowIndex) && (
      (this.tableOptions.showCheckboxWihoutExtraColumn && columnIndex === this.getFirstDataColumnIndex())
      || isCheckboxCellRenderer(bodyModel.getCellRenderer(rowIndex, columnIndex)));
    if (checkboxCell) {
      this.toggleRowCheckbox(rowIndex, columnIndex, 'body');
      return true;
    }
    const row = bodyModel.getRowByIndex(rowIndex);
    if (isTreeRow(row) && isAreaModelTree(bodyModel)
      && (bodyModel as AreaModelTree<any>).hasDisplayedChildren(row as TreeRowIf<any>)) {
      const tr = row as TreeRowIf<any>;
      return this.setTreeRowExpanded(tr, !tr.expanded);
    }
    return false;
  }

  /** Arrow up in the first body row: the focus moves to the lowest header row (same column). */
  private moveFocusIntoHeader(): boolean {
    const fm = this.focusModel();
    if (!fm || this.isEditing() || this.headerFocus) {
      return false;
    }
    const [row, col] = fm.getFocus();
    const headerRows = this.getAriaGridInfo().headerRowCount;
    const noRows = this.tableModel.getBodyModel().getRowCount() < 1;
    if ((row !== 0 && !noRows) || headerRows < 1 || this.tableModel.getColumnCount() < 1) {
      return false;
    }
    this.setHeaderFocus(headerRows - 1, col < 0 ? this.getFirstShownColumnIndex() : col);
    return true;
  }

  /** Focuses a header cell – the origin of a span cell that covers (row, column) – and repaints. */
  private setHeaderFocus(rowIndex: number, columnIndex: number) {
    const range = this.colAndRowspanModels.header?.getRanges()
      .find(r => r.isInRange(rowIndex, columnIndex));
    this.headerFocus = range ? [range.r1, range.c1] : [rowIndex, columnIndex];
    this.ensureColumnIsVisible(this.headerFocus[1]);
    this.repaint();
  }

  /**
   * Keys while a header cell has the focus. Returns `undefined` for actions that work as in the body (copy,
   * select all …) – they leave the header focus as it is.
   */
  private onHeaderAction(actionId: ActionId): boolean | undefined {
    const [row, col] = this.headerFocus!;
    const headerModel = this.tableModel.getAreaModel('header');
    const headerRows = this.getAriaGridInfo().headerRowCount;
    const columnCount = this.tableModel.getColumnCount();
    const colspan = Math.max(1, headerModel.getColspanAt(row, col) || 1);
    const rowspan = Math.max(1, headerModel.getRowspanAt(row, col) || 1);
    switch (actionId) {
      case 'NAVIGATE_LEFT': {
        const c = this.getNextShownColumnIndex(col, -1, columnCount);
        if (c !== col) this.setHeaderFocus(row, c);
        return true;
      }
      case 'NAVIGATE_RIGHT': {
        const c = this.getNextShownColumnIndex(col + colspan - 1, 1, columnCount);
        if (c > col + colspan - 1) this.setHeaderFocus(row, c);
        return true;
      }
      case 'NAVIGATE_ROW_START':
        this.setHeaderFocus(row, this.getFirstShownColumnIndex());
        return true;
      case 'NAVIGATE_ROW_END':
        this.setHeaderFocus(row, this.getLastShownColumnIndex());
        return true;
      case 'NAVIGATE_UP':
        if (row > 0) this.setHeaderFocus(row - 1, col);
        return true;
      case 'NAVIGATE_DOWN': {
        if (row + rowspan < headerRows) {
          this.setHeaderFocus(row + rowspan, col);
          return true;
        }
        const rowCount = this.tableModel.getBodyModel().getRowCount();
        if (rowCount < 1) {
          return true; // no body rows: stay in the header
        }
        return this.setFocusCell(Math.max(0, this.firstFullVisibleRowIndex), col);
      }
      case 'NAVIGATE_FIRST_CELL':
      case 'NAVIGATE_LAST_CELL':
      case 'NAVIGATE_PAGE_UP':
      case 'NAVIGATE_PAGE_DOWN':
        this.headerFocus = undefined; // continue in the body
        return undefined;
      case 'ACTIVATE_CELL':
        return this.activateHeaderCell(row, col, rowspan, headerRows);
      case 'START_EDITING':
      case 'TOGGLE_SELECTION':
        return true; // nothing to edit or select in the header – and not the body cell behind it
      default:
        return undefined;
    }
  }

  /** Enter on a header cell: a group with a toggle opens/closes, a sortable (lowest) header cell sorts. */
  private activateHeaderCell(row: number, col: number, rowspan: number, headerRows: number): boolean {
    const headerModel = this.tableModel.getAreaModel('header');
    const value = headerModel.getValueAt(row, col) as CellGroupExt | undefined;
    if (value && typeof value === 'object' && value.toggle && value.visibility !== 'always'
      && 'toggleHeaderGroup' in headerModel) {
      const target = new MouseTargetData(null, this);
      target.rowIdx = row;
      target.colIdx = col;
      target.areaIdent = 'header';
      target.areaModel = headerModel;
      this.toggleHeaderGroup(target);
      this.setHeaderFocus(row, col);
      return true;
    }
    const columnDef = this.tableModel.getColumnDef(col);
    if (row + rowspan >= headerRows && columnDef?.sortable?.()) {
      this.sortByColumn(col);
      return true;
    }
    return false;
  }

  /**
   * Closes the cell editor without changing the model (Escape in the editor).
   *
   * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} [editor] - the editor element: its value is reset
   *        first, so the blur caused by closing does not commit the typed text ("change" event)
   */
  cancelEditing(editor?: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
    if (editor instanceof HTMLSelectElement) {
      const defaultOption = Array.from(editor.options).find(o => o.defaultSelected);
      editor.selectedIndex = defaultOption ? defaultOption.index : -1;
    } else if (editor) {
      editor.value = editor.defaultValue;
    }
    this.resetEditorRenderer();
    this.hostElement.focus(); // keyboard navigation continues (the editor loses the focus without a change)
    this.repaint();
  }

  updateModelValueAfterEdit(areaIdent: AreaIdent, rowIndex: number, columnIndex: number, value: string) {
    if (areaIdent === 'body') {
      const bodyAreaModel = this.tableModel.getAreaModel(areaIdent);
      const rowCountBefore = bodyAreaModel.getRowCount();
      const buildsBefore = isAreaModelRowGroups(bodyAreaModel) ? bodyAreaModel.getBuildCount() : 0;
      const ok: boolean = bodyAreaModel.setValue(rowIndex, columnIndex, value);
      if (ok) {
        this.resetEditorRenderer();
        // one row changed: models may recompute less (a row grouping only the groups of this row)
        const change: DerivedValuesChangeIf = { area: 'body', rowIndices: [rowIndex] };
        this.invalidateAggregates(change);
        const moved = isAreaModelRowGroups(bodyAreaModel) && bodyAreaModel.getBuildCount() !== buildsBefore;
        if (moved || bodyAreaModel.getRowCount() !== rowCountBefore) {
          this.repaintHard(); // e.g. a grouped value changed: the row moved to another group
        } else {
          this.repaint();
        }
        // values the app derives in onModelChanged (and repaints) are counted by the next repaint
        this.invalidateAggregates(change);
        this.eventListener.onModelChanged?.(GeModelChangeEvent.createSingle(rowIndex, columnIndex));
        this.hostElement.focus();
      }
    }
  }

  /**
   * Retrieves the TableApi object.
   *
   * @return {TableApi} The TableApi object.
   */
  getApi(): TableApi {
    return this.api;
  }


  /**
   * Initializes the table. Called by the table component.
   *
   * @function firstInit
   * @memberof TableScope
   *
   * @returns {TableScope} This instance of the table scope.
   */
  firstInit(): TableScope {
    // % and weight columns: start with the real width of the host (the model's default is 400 px – the
    // ResizeObserver corrects it only ≥ 500 ms later)
    const availableWidth = this.getAvailableColumnWidth();
    if (availableWidth > 0) {
      this.tableModel.setParentWidth(availableWidth);
    }
    // the restore of the state (autoRestoreOptions, initialState) runs in the first firstInit() only
    this.stateService.initBeforeModel();
    this.tableModel.init();
    this.stateService.initAfterModel();
    if (this.tableOptions?.externalFilterFunction) {
      this.externalFilterChanged(false);
    }
    this.stateService.initAfterFilter();
    this.resetSizeOfWrapperDiv();
    this.adjustContainersAndRows();
    this.stateService.initAfterLayout();
    // the live region must exist before its first message – screen readers often miss a region inserted with text
    this.liveAnnouncer.getElement();
    this.initialized = true;

    return this;
  }

  /**
   * Releases the table: removes all DOM listeners (host element, scroll viewport, window resize),
   * stops the resize observer, unregisters from the selection and focus model, calls the cleanup
   * functions of all cell renderers and clears the host element.
   *
   * Call it before you create a new `TableScope` for the same host element (e.g. when a framework
   * wrapper receives a new table model) or when the table is removed from the page.
   * Calling it twice is harmless.
   *
   * @example
   * const scope = new TableScope(hostDiv, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
   * scope.firstInit();
   * // later, e.g. when a new model arrives:
   * scope.destroy();
   * new TableScope(hostDiv, newTableModel, new SimpleDomService(), new TableOptions(), new EventAdapter()).firstInit();
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }
    try {
      this.stateService.destroy(); // stores and reports a pending change
    } catch (e) {
      console.error(e);            // an own onStateChanged / getRowId threw – release the table anyway
    }
    this.destroyed = true;
    this.listenerAbortController.abort();
    this.resizeHandler.disconnect();
    const sm = this.getSelectionModel ? this.getSelectionModel() : undefined;
    sm?.removeEventSelectionChangedListener(this);
    const fm = this.getFocusModel ? this.getFocusModel() : undefined;
    fm?.removeEventFocusChangedListener(this);
    this.disposeRendering();
    this.tableOverlay.destroy();
    this.liveAnnouncer.destroy();
    this.removeHostAria();
    this.hostElement.innerText = "";
  }

  /**
   * Returns `true` once {@link destroy} has been called.
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * Creates a GeMouseEvent object based on a MouseEvent.
   *
   * @param {MouseEvent} mouseEvent - The MouseEvent object to create the GeMouseEvent from.
   * @return {GeMouseEvent} - The created GeMouseEvent object.
   */
  createGeMouseEvent(mouseEvent: MouseEvent): GeMouseEvent {
    const ret: GeMouseEvent = new GeMouseEvent();
    ret.originalEvent = mouseEvent;

    if (mouseEvent) {
      const target = this.getMouseEventTarget(mouseEvent) as HTMLElement;
      [ret.areaIdent, ret.sideIdent] = this.getAreaAndSideIdentByAttr(target);
      ret.rowIndex = this.getNumberByAttr(target, 'data-row-index');
      ret.columnIndex = this.getNumberByAttr(target, 'data-col-index');
      ret.action = this.getStringByAttr(target, 'data-ge-action');

      if (ret.areaIdent) {
        const am = this.tableModel.getAreaModel(ret.areaIdent);
        ret.rowTop = am.getYPosByRowIndex(ret.rowIndex);
      }
      ret.columnLeft = this.tableModel.getXPosByColumnIndex(ret.columnIndex);
    }
    return ret;
  }

  /**
   * The element a mouse event belongs to – usually `evt.target`. The scroll viewport lies above the footer areas (its
   * horizontal scroll bar must stay usable), so a mouse event on a footer cell arrives at the viewport: then the footer
   * element below the mouse pointer is returned (not on the scroll bar itself).
   *
   * @param {MouseEvent} evt - a mouse event on the host element
   * @returns {EventTarget | null} the target element
   */
  getMouseEventTarget(evt: MouseEvent): EventTarget | null {
    const target = evt.target;
    if ((target === this.scrollViewport || target === this.contentWrapperDiv || target === this.contentDiv)
      && this.tableModel.getPadding().bottom > 0) {
      const viewportRect = this.scrollViewport.getBoundingClientRect();
      const onScrollBar = evt.clientY - viewportRect.top >= this.scrollViewport.clientHeight
        || evt.clientX - viewportRect.left >= this.scrollViewport.clientWidth;
      const root = this.hostElement.getRootNode() as Document | ShadowRoot;
      if (!onScrollBar && root.elementsFromPoint) {
        const footerElement = root.elementsFromPoint(evt.clientX, evt.clientY)
          .find(e => this.hostElement.contains(e) && e.closest('.ge-table-footer'));
        if (footerElement) {
          return footerElement;
        }
      }
    }
    return target;
  }

  /**
   * Handles the mouse down event.
   *
   * @param {GeMouseEvent} mouseEvent - The mouse event object.
   * @return {void}
   */
  onMouseDown(mouseEvent: GeMouseEvent) {
    this.selectionService.onMouseDown();
    if (mouseEvent.columnIndex > -1 && mouseEvent.action && ['resize-column', 'drag-column'].includes(mouseEvent.action)
      && !isRowNumberColumnDef(this.tableModel.getColumnDef(mouseEvent.columnIndex))) { // the row numbers stay

      this.mouseStartWidth = this.tableModel.getColumnWidth(mouseEvent.columnIndex);
      this.mouseStartAction = mouseEvent.action;
      this.mouseStartColumnIndex = mouseEvent.columnIndex;

      if (this.mouseStartAction === 'drag-column') {
        this.firstDraggingRendering = true;
        this.dragFrom = this.mouseStartColumnIndex;
      }
    }
  }

  /**
   * Handles mouse dragging on the frame.
   *
   * @param {GeMouseEvent} mouseEvent - The mouse event object.
   * @param startMouseEvent
   */
  mouseDraggingOnFrame(mouseEvent: GeMouseEvent, startMouseEvent: GeMouseEvent | undefined) {
    this.eventListener.onMouseDragging?.(mouseEvent);
    this.mouseEvent = mouseEvent;

    if (this.mouseStartColumnIndex > -1 && this.mouseStartAction === 'resize-column' && this.tableOptions.columnsResizable) {
      this.resizeColumn(mouseEvent);

    } else if (!this.mouseStartAction && this.selectionService.onMouseDragging(mouseEvent, startMouseEvent)) {
      this.repaint(); // drag selection (selection type "range")

    } else if (this.mouseStartAction === 'drag-column' && mouseEvent.columnIndex > -1 && this.tableOptions.columnsDraggable) {

      // no column in front of the row numbers (RowNumberColumnDef, since 1.1.93)
      this.draggingTargetColumnIndex = Math.max(mouseEvent.columnIndex, this.getFirstDataColumnIndex());
      this.dragTo = this.draggingTargetColumnIndex;

      if (this.dragFrom > -1 && this.dragTo > -1 && this.dragFrom !== this.dragTo) {
        if (!(this.lastDragFrom === this.dragTo && this.lastDragTo === this.dragFrom)) {
          this.tableModel.changeColumnOrder(this.dragFrom, this.dragTo);
          this.lastDragFrom = this.dragFrom;
          this.lastDragTo = this.dragTo;
          this.dragFrom = this.dragTo;
          this.resetSizeOfWrapperDiv();
          this.adjustContainersAndRows();
        }
      }
      if (startMouseEvent) {
        // dragFrom = the CURRENT index of the dragged column – it may already have been moved by this first move
        // (a fast drag); the start index would then show the column that took its place
        this.adjustDraggingColumn(mouseEvent, this.dragFrom, this.firstDraggingRendering);
        this.firstDraggingRendering = false;
      }
      this.repaint();
    }
  }

  /**
   * Handles the end of mouse dragging event on a frame.
   *
   * @param {GeMouseEvent} mouseEvent - The mouse event object.
   *
   * @returns {void}
   */
  mouseDraggingEndOnFrame(mouseEvent: GeMouseEvent) {
    this.eventListener.onMouseDraggingEnd?.(mouseEvent);
    this.draggingTargetColumnIndex = -1;

    if (this.mouseStartAction === 'resize-column') {
      this.resizeColumn(mouseEvent);
      this.stateService.markDirty('columns');

    } else if (this.mouseStartAction === 'drag-column') {
      this.hideDraggingColumn();
      this.repaint();
      this.stateService.markDirty('columns');
      this.stateService.markDirty('selection'); // column indices of the selection moved
    }
    this.mouseStartWidth = -1;
    this.mouseStartColumnIndex = -1;
    this.dragFrom = -1;
    this.dragTo = -1;
    this.firstDraggingRendering = true;
    this.mouseStartAction = '';
  }

  /**
   * Handles the mouse move event.
   *
   * @param {GeMouseEvent} mouseMoveEvent - The mouse move event object.
   * @return {void}
   */
  mouseMove(mouseMoveEvent: GeMouseEvent) {
    this.eventListener.onMouseMoved?.(mouseMoveEvent);
    this.adjustHoverRows(mouseMoveEvent);
    this.adjustHoverColumns(mouseMoveEvent);
  }

  private lastContextmenu = Date.now();
  /**
   * Triggers the context menu event based on the mouse move event.
   *
   * @param {GeMouseEvent} mouseMoveEvent - The mouse move event object.
   * @return {void}
   */
  contextmenu(mouseMoveEvent: GeMouseEvent) {
    const now = Date.now();

    if ((now - this.lastContextmenu) < 50) {
      this.lastContextmenu = now;
      mouseMoveEvent.originalEvent?.preventDefault();
      mouseMoveEvent.originalEvent?.stopImmediatePropagation();
      return; // skipped
    }

    this.lastContextmenu = now;
    this.eventListener.onContextmenu?.(mouseMoveEvent);
  }

  /**
   * Toggles the expand or collapse state of all items in the body area model.
   *
   * @param {boolean} [expand=true] - Whether to expand or collapse all items. Default is true.
   *
   * @return {void}
   */
  toggleExpandCollapseAll(expand: boolean = true) {
    const bodyAreaModel = this.tableModel.getBodyModel();
    if (isAreaModelTree(bodyAreaModel)) {
      const amt: AreaModelTree<any> = bodyAreaModel as AreaModelTree<any>;
      amt.toggleExpandCollapseAll(expand);
      this.allExpanded = expand;
      this.repaintHard(); // the row count changed → recalc the scroll height, not only the visible rows
      this.stateService.markDirty('tree');
    }
  }

  /** The last "expand / collapse all" state – the header icon toggles it. */
  allExpanded = true;

  /**
   * Expands or collapses one row of a tree table, repaints, and remembers the state (`autoRestoreOptions`).
   *
   * @param {TreeRowIf<any>} row - a tree row of the body model
   * @param {boolean} expanded - the new state
   * @returns {boolean} false if the body is no tree or the state was already set
   */
  setTreeRowExpanded(row: TreeRowIf<any>, expanded: boolean): boolean {
    const bodyAreaModel = this.tableModel.getBodyModel();
    if (!isAreaModelTree(bodyAreaModel) || row.expanded === expanded) {
      return false;
    }
    row.expanded = expanded;
    (bodyAreaModel as AreaModelTree<any>).recalcVisibleTreeRows(false); // the filter result does not change
    this.repaintHard(); // the row count changed
    this.stateService.markDirty('tree');
    return true;
  }

  /**
   * Groups the rows of a row grouping by other levels (see {@link TableApi.setRowGroupBy}).
   *
   * @param {RowGroupField[]} groupBy - the new levels, top first
   * @returns {boolean} false if the body is no row grouping
   */
  setRowGroupBy(groupBy: RowGroupField[]): boolean {
    const body = this.tableModel.getBodyModel();
    if (!isAreaModelRowGroups(body)) {
      return false;
    }
    body.setGroupBy(groupBy);   // keeps expanded groups, filter, sorting and checked rows
    updateRowGroupLayout(this.tableModel);
    this.invalidateAggregates();
    this.tableModel.recalcPadding();
    this.repaintHard();
    this.stateService.markDirty('tree');
    this.stateService.markDirty('columns');
    return true;
  }

  /**
   * Pivots a pivot table again (see {@link TableApi.setPivotConfig}): new columns, header and totals in the same model,
   * then the layout of the table is built again. Sorting and selection are reset (the columns are different).
   *
   * @param {Partial<PivotConfigIf>} changes - the changed parts of the configuration
   * @param {unknown[]} [rows] - new source rows
   * @returns {boolean} false if the table model is no pivot table
   * @since 1.1.94
   */
  setPivotConfig(changes: Partial<PivotConfigIf>, rows?: unknown[]): boolean {
    const model = this.tableModel;
    if (!isPivotTableModel(model)) {
      return false;
    }
    model.setPivotConfig(changes, rows);   // throws for an invalid configuration – before anything changes
    // the column indices change: sorting, selection and focus refer to the old columns
    (model.getColumnDefs() ?? []).forEach(def => def.sortState = undefined);
    this.lastSortCompareFn = undefined;
    this.clearSelection();
    (this.getFocusModel ? this.getFocusModel() : undefined)?.clear();
    for (const areaIdent of ['header', 'body', 'footer'] as const) {
      this.colAndRowspanModels[areaIdent]?.init();
    }
    this.invalidateAggregates();
    this.firstInit();
    this.repaintHard();
    this.stateService.markDirty('columns');
    this.stateService.markDirty('sort');
    this.stateService.markDirty('tree');
    this.stateService.markDirty('headerGroups');
    return true;
  }

  /**
   * Toggles the checkbox state of a specific row in a table.
   *
   * @param {number} rowIdx - The index of the row to toggle the checkbox state.
   * @param {number} _colIdx - The index of the column. This parameter is unused.
   * @param {AreaIdent} areaIdent - The identifier of the table area.
   *
   * @return {void} - This method does not return anything.
   */
  toggleRowCheckbox(rowIdx: number, _colIdx: number, areaIdent: AreaIdent) {
    const areaModel = this.tableModel.getAreaModel(areaIdent);
    const state = areaModel.isRowChecked(rowIdx);
    const unsel = (state === undefined || state === 'semi' || state === 'none');
    areaModel.setRowChecked(rowIdx, unsel);
    this.repaint(); // TODO repaint cell only
    const selectedRows = areaModel.rowSelectionModel?.getCheckedRows();
    // a copy: the model changes its array with the next click (a listener that keeps it would see the change)
    this.eventListener.onCheckboxChanged?.(selectedRows ? selectedRows.slice() : []);
    this.stateService.markDirty('checked');
  }

  /**
   * Handle mouse click events.
   *
   * @param {GeMouseEvent} evt - The mouse click event.
   * @param {GeMouseEvent | undefined} previousEvt - The previous mouse click event, if any.
   * @returns {void}
   */
  onMouseClicked(evt: GeMouseEvent, previousEvt: GeMouseEvent | undefined): boolean {
    this.headerFocus = undefined; // the mouse sets the (body) focus
    if (evt.clickCount > 1) {
      // a double click: the first click did focus and selection, the dblclick handler sorts/edits/toggles
      // (resetting the editor here would close the editor the double click just opened)
      return false;
    }
    let dirty = this.selectionService.onMouseClicked(evt, previousEvt);
    if (!dirty) {
      if (this.getFocusModel) {
        this.resetEditorRenderer();
        const fm = this.getFocusModel();
        if (fm) {
          dirty = fm.hasChanged();
          fm.clearChanged();
        }
      }
    }
    return dirty;
  }

  debounceRepaint() {
    this.debounce(this.repaint.bind(this), 1);
  }

  /**
   * Cancels a repaint scheduled by {@link debounceRepaint}.
   *
   * @returns true if a repaint was pending
   */
  cancelPendingRepaint(): boolean {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
      return true;
    }
    return false;
  }

  publishGeMouseEvent(evt: GeMouseEvent) {
    this.eventListener.onMouseClicked?.(evt);
  }

  onFocusChanged(sm: FocusModelIf) {
    this.eventListener.onFocusChanged?.(sm);
  }

  /**
   * Reports a changed state to the event listener (called by {@link TableStateService}).
   * @since 1.1.92
   */
  stateChanged(evt: GeStateChangeEvent): void {
    this.eventListener.onStateChanged?.(evt);
  }

  protected override afterRenderPass(): void {
    this.stateService?.rendered(); // undefined while the constructor of the super class renders
  }

  onSelectionChanged(sm: SelectionModelIf) {
    this.stateService?.markDirty('selection');
    if (this.selectionEventsHeld > 0) {
      this.heldSelectionModel = sm; // reported once at the end of holdSelectionEvents()
      return;
    }
    this.eventListener.onSelectionChanged?.(sm);
  }

  private selectionEventsHeld = 0;
  private heldSelectionModel?: SelectionModelIf;

  /**
   * Runs `fn` and reports all selection changes made in it as ONE `onSelectionChanged` event (a click used to fire
   * up to three: `clear()`, adding the new range and the selection service itself).
   *
   * @param {() => void} fn - code that changes the selection model
   */
  holdSelectionEvents(fn: () => void): void {
    this.selectionEventsHeld++;
    try {
      fn();
    } finally {
      this.selectionEventsHeld--;
      if (this.selectionEventsHeld === 0 && this.heldSelectionModel) {
        const sm = this.heldSelectionModel;
        this.heldSelectionModel = undefined;
        this.eventListener.onSelectionChanged?.(sm);
      }
    }
  }



  /**
   * Updates the table (repaint) when an external filter is changed.
   *
   * @param {boolean} clearSelection - Indicates whether to clear the selection model or not. Default value is true.
   * @return {void}
   */
  externalFilterChanged(clearSelection: boolean = true) {
    const predictFn = this.tableOptions.externalFilterFunction;
    if (predictFn) {
      if (clearSelection) {
        this.clearSelectionModel();
      }
      this.tableModel.externalFilterChanged(predictFn);
      this.reapplySorting(); // filtering starts from the unsorted rows
      this.invalidateAggregates();
      this.scrollViewport.scrollTo(0, 0);
      this.tableModel.recalcHeightAndPadding();
      this.resetSizeOfWrapperDiv();
      this.repaint();
      if (this.initialized) {
        const rowCount = this.tableModel.getBodyModel().getRowCount();
        this.announce(this.ariaTexts.filtered(rowCount), TableScope.filterAnnouncementDelayInMs);
      }
    }
  }

  /**
   * Handle the double click event on the table header.
   *
   * @param {MouseEvent} event - The mouse event that triggered the double click.
   * @param {number} _rowIdx - The row index of the header.
   * @param {number} colIdx - The column index of the header.
   *
   * @return {void}
   */
  onHeaderDblClicked(event: MouseEvent, _rowIdx: number, colIdx: number) {
    const colDef = this.tableModel.getColumnDef(colIdx);
    if (colDef?.sortable && colDef.sortable()) {
      event.preventDefault();
      event.stopPropagation();
      this.sortByColumn(colIdx);
    }
  }

  /**
   * Sorts the body by one column – the same as a double click on its header (header icon, filter and
   * auto-restore included). Without `sortState` the next state of the column's sort order is used
   * (asc → desc → asc …).
   *
   * @param {number | string} column - column index or property, e.g. 10 or "total"
   * @param {SortState} [sortState] - "asc", "desc" or "" (unsorted icon, rows keep their current order)
   * @returns {boolean} false if the column does not exist
   */
  sortByColumn(column: number | string, sortState?: SortState): boolean {
    const colIdx = typeof column === "number"
      ? column
      : (this.tableModel.getColumnDefs() ?? []).findIndex(cd => cd.property === column);
    const colDef = this.tableModel.getColumnDef(colIdx);
    if (!colDef) {
      return false;
    }
    const states: SortState[] = colDef.sortStatesOrder ? colDef.sortStatesOrder : this.tableOptions.sortOrder;
    const currentState: SortState = colDef.sortState ?? '';
    const newState: SortState = sortState ?? states[(states.indexOf(currentState) + 1) % states.length];

    const sortItem = new SortItem(colIdx, newState);
    const done = this.tableModel.doSort([sortItem]);
    if (done) {
      this.invalidateAggregates(); // sorted in place: first/last
      this.lastSortCompareFn = undefined;
      this.tableModel.getColumnDefs()?.forEach(cd => cd.sortState = '');
      colDef.sortState = newState;
    }
    this.repaint();
    if (done) {
      this.stateService.sortedByColumn(newState ? colDef.property : undefined);
    }
    if (done) {
      this.announce(this.ariaTexts.sorted(this.getColumnAriaLabel(colIdx), newState));
    }
    return true;
  }


  /**
   * Scrolls the viewport to the specified pixel coordinates.
   *
   * @param {number} px - The horizontal pixel coordinate to scroll to.
   * @param {number} py - The vertical pixel coordinate to scroll to.
   *
   * @return {void}
   */
  scrollToPixel(px: number, py: number) {
    // py is a content position. The scroll bar range differs from the content range – always with a capped scroll
    // height, but also slightly without: the scroll content is 1 px higher than the rows, the scroll viewport
    // includes the footer and the horizontal scroll bar. scrollTop = py would leave the target row a few pixels off.
    const contentRange = this.getContentScrollRangeY();
    const scrollerRange = this.getScrollerRangeY();
    if (contentRange > 0 && scrollerRange > 0) {
      const contentTop = Math.min(contentRange, Math.max(0, py));
      const scrollTop = contentTop / contentRange * scrollerRange;
      this.scrollViewport.scrollTo(px, scrollTop);
      this.pendingContentScroll = { scrollTop: this.scrollViewport.scrollTop, contentTop };
      this.adjustAfterScrolling(); // render the exact position now (a scroll event may not fire)
      return;
    }
    this.scrollViewport.scrollTo(px, py);
  }

  /**
   * Scrolls to a column and a row: the row becomes the first row of the viewport, the column the first column of the
   * scrollable center area (as far as the scroll range allows).
   *
   * A fixed west column scrolls back to the start (x = 0, like before columns were supported). A fixed east column,
   * `-1` or any other index outside the column range keeps the current horizontal position.
   *
   * @param {number} indexX - The column index (model index over west + center + east), `-1` = keep the horizontal position.
   * @param {number} indexY - The row index of the body.
   * @return {void}
   */
  scrollToIndex(indexX: number, indexY: number) {
    const bodyAreaModel = this.tableModel.getAreaModel('body');
    const py = bodyAreaModel.getYPosByRowIndex(indexY);
    this.scrollToPixel(this.getScrollLeftForColumnIndex(indexX), py);
  }

  /**
   * The horizontal scroll position (`scrollLeft` of the scroll viewport) that shows a column as the first column of
   * the scrollable center area, clamped to the scroll range.
   * A fixed west column returns 0 (start); fixed east columns and indices outside the columns return the current position.
   *
   * @param {number} columnIndex - model column index (west + center + east)
   * @returns {number} scrollLeft in scroll bar pixels
   */
  protected getScrollLeftForColumnIndex(columnIndex: number): number {
    const viewport = this.scrollViewport;
    const firstCenterColumn = this.tableModel.getFixedLeftColumnCount();
    const lastCenterColumn = this.tableModel.getColumnCount() - this.tableModel.getFixedRightColumnCount() - 1;
    if (columnIndex >= 0 && columnIndex < firstCenterColumn) {
      return 0; // fixed west column: back to the start – as scrollToIndex(0, y) always did
    }
    if (!(columnIndex >= firstCenterColumn && columnIndex <= lastCenterColumn)) {
      return viewport.scrollLeft; // fixed east column (always visible), -1, NaN or out of range
    }
    let contentLeft = 0; // hidden columns have width 0
    for (let c = firstCenterColumn; c < columnIndex; c++) {
      contentLeft += this.tableModel.getColumnWidth(c);
    }
    // The rendering maps scrollLeft linearly onto the content (scrollFactorX, see adjustColumnsToRowParent):
    // content offset = scrollLeft / scrollerRange * contentRange. The two ranges differ by the east area and
    // the vertical scroll bar.
    const contentRange = this.tableModel.getContentWidthInPixel() - this.areaBodyCenterGeo.width;
    const scrollerRange = viewport.scrollWidth - viewport.clientWidth;
    if (contentRange <= 0 || scrollerRange <= 0) {
      return 0; // all center columns fit
    }
    return Math.min(1, contentLeft / contentRange) * scrollerRange;
  }

  override adjustAfterScrolling() {
    super.adjustAfterScrolling();
    const viewport = this.scrollViewport;
    this.eventListener.onScroll?.(new GeScrollEvent(
      this.scrollTop,
      this.scrollLeft,
      viewport.scrollHeight,
      viewport.scrollWidth,
      viewport.clientHeight,
      viewport.clientWidth,
      this.scrollFactorY,
      this.scrollFactorX,
    ));
  }

  /**
   * Sets the selection model for the table.
   *
   * @param {SelectionModel} sm - The selection model to be set.
   * @param {boolean} rerender - Optional parameter indicating whether to rerender the table after setting the selection model. Default value is false.
   *
   * @return {void} - This method does not return any value.
   */
  setSelectionModel(sm: SelectionModel, rerender: boolean = false) {
    // the table listens to its selection model (onSelectionChanged) – move the listener to the new model
    this.selectionModel()?.removeEventSelectionChangedListener(this);
    sm.addEventSelectionChangedListener(this);
    const getSm = () => sm;
    this.tableOptions.getSelectionModel = getSm;
    this.getSelectionModel = getSm;
    this.selectionService.getSelectionModel = getSm;
    if (rerender) {
      this.repaint();
    }
  }

  toggleHeaderGroup(mouseTargetData: MouseTargetData) {
    const headerAreaModel = this.tableModel.getAreaModel('header') as AreaModelCellGroups;

    if ('columnDefs' in this.tableModel) {
      this.tableModel.columnDefs = headerAreaModel.toggleHeaderGroup(mouseTargetData);
    }
    this.headerGroupsChanged();
  }

  /**
   * Collapses or expands a header group by its id ({@link TableApi.setHeaderGroupCollapsed}).
   *
   * @param {string} id - {@link CellGroupIf.id} or the path of the labels, e.g. `"Customer"`
   * @param {boolean} collapsed - true = collapse
   * @returns {boolean} false if the header has no such group
   * @since 1.1.92
   */
  setHeaderGroupCollapsed(id: string, collapsed: boolean): boolean {
    const header = this.tableModel.getAreaModel('header') as Partial<AreaModelCellGroups>;
    const columnDefs = header.setGroupClosed?.(id, collapsed);
    if (!columnDefs) {
      return false;
    }
    if ('columnDefs' in this.tableModel) {
      this.tableModel.columnDefs = columnDefs;
    }
    this.headerGroupsChanged();
    return true;
  }

  /**
   * Rebuilds the layout after a header group was collapsed or expanded (other columns are shown) and marks the
   * state as changed.
   * @since 1.1.92
   */
  headerGroupsChanged(): void {
    this.firstInit();
    this.stateService.markDirty('headerGroups');
    this.stateService.markDirty('columns');

    // this.tableModel.recalcPadding();
    // this.resetSizeOfWrapperDiv();
    // this.adjustContainersAndRows();
    //
    // console.info('this.tableModel.getColumnCount()', this.tableModel.getColumnCount());
    // const columnDefs = this.tableModel.getColumnDefs();
    // if (columnDefs) {
    //   console.info('this.tableModel.getColumnDefs()', columnDefs);
    //   for (const cd of columnDefs) {
    //     if (cd?.isVisible) console.info(cd.isVisible(), cd);
    //   }
    // }

    // this.adjustColumnsToRowParent({
    //   areaIdent: 'header',
    //   sideIdent: 'left',
    //   areaModel: headerAreaModel,
    //   geo: this.tableModel.getAreaGeo('header', 'left'),
    //   parent: this.tableModel.getAreaParent('header', 'left'),
    //   rowIndex: mouseTargetData.rowIndex,
    //   columnIndexStart: mouseTargetData.columnIndex,
    //   columnIndexEnd: mouseTargetData.columnIndex,
    //   verticalFixed: true,
    //   lastRowOfModel: false
    // });
    // console.info('_______-headerAreaModel', headerAreaModel);
    // console.info('_______-mouseTargetData', mouseTargetData);
  }

  /**
   * Retrieves the selection model.
   * @returns {SelectionModelIf | undefined} The selection model if available, otherwise undefined.
   */
  selectionModel(): SelectionModelIf | undefined {
    if (this?.getSelectionModel) {
      return this.getSelectionModel();
    }
    return undefined;
  }

  /**
   * Retrieves the focus model.
   *
   * @returns {FocusModelIf | undefined} The focus model if it exists, or undefined otherwise.
   */
  focusModel(): FocusModelIf | undefined {
    if (this?.getFocusModel) {
      return this.getFocusModel();
    }
    return undefined;
  }

  setDragging(dragging: boolean) {
    this.dragging = dragging;
    if (this.dragging) {
      this.storeColumnWidths();
      this.lastDragFrom = -1;
      this.lastDragTo = -1;
    } else {
      this.storedColumnWidths = [];
    }
  }

  /**
   * Changes the focus cell using the specified deltas (keyboard navigation).
   * The new focus stays inside the body (first/last row and column) and the focused row is scrolled into view.
   * `onFocusChanged` is fired by the focus model itself (TableScope listens to it).
   *
   * @param {number} dx - The delta for the column index.
   * @param {number} dy - The delta for the row index.
   * @return {boolean} - True if the key was handled (a focus model exists and the table is not editing), false otherwise.
   */
  private changeFocusCell(dx: number, dy: number): boolean {
    if (!this.isEditing() && this.getFocusModel) {
      const fm = this.getFocusModel();
      if (fm) {
        const rowCount = this.tableModel.getBodyModel().getRowCount();
        const columnCount = this.tableModel.getColumnCount();
        if (rowCount < 1 || columnCount < 1) {
          return false;
        }
        const [rowIdx, colIdx] = fm.getFocus();
        const newRowIdx = Math.min(Math.max(rowIdx + dy, 0), rowCount - 1);
        const newColIdx = this.getNextShownColumnIndex(colIdx, dx, columnCount);
        if (newRowIdx !== rowIdx || newColIdx !== colIdx) {
          fm.setFocus(newRowIdx, newColIdx);
          this.ensureColumnIsVisible(newColIdx); // first: ensureRowIsVisible() keeps the horizontal position
          this.ensureRowIsVisible(newRowIdx);
          this.repaint();
        }
        return true;
      }
    }
    return false;
  }

  /**
   * The column index `dx` steps from `colIdx`, skipping hidden columns (width 0, e.g. `setColumnVisible(…, false)`).
   * Stays inside the columns; if there is no shown column in that direction, the focus stays where it is.
   */
  private getNextShownColumnIndex(colIdx: number, dx: number, columnCount: number): number {
    if (!dx) {
      const col = Math.min(Math.max(colIdx, 0), columnCount - 1);
      if (colIdx < 0 && this.tableModel.getColumnWidth(col) <= 0) {
        // no focus yet (-1): the first shown column instead of a hidden one
        return this.getNextShownColumnIndex(-1, 1, columnCount);
      }
      return col;
    }
    const step = dx > 0 ? 1 : -1;
    let ret = colIdx;
    let c = colIdx;
    for (let n = Math.abs(dx); n > 0; n--) {
      c += step;
      while (c >= 0 && c < columnCount && this.tableModel.getColumnWidth(c) <= 0) {
        c += step;
      }
      if (c < 0 || c >= columnCount) {
        break;
      }
      ret = c;
    }
    return Math.min(Math.max(ret, 0), columnCount - 1);
  }

  /**
   * Resizes the column based on the mouse event.
   *
   * @param {GeMouseEvent} mouseEvent - The mouse event that triggered the resize.
   */
  private resizeColumn(mouseEvent: GeMouseEvent) {
    this.tableModel.setColumnWidth(this.mouseStartColumnIndex, this.mouseStartWidth + mouseEvent.draggingX);
    this.tableModel.recalcPadding();
    this.resetSizeOfWrapperDiv();
    this.adjustContainersAndRows();
  }

  /**
   * Clears the selection model, if available.
   *
   * @return {void}
   */
  private clearSelectionModel() {
    if (this.getSelectionModel) {
      this.getSelectionModel()?.clear();
    }
  }

  /**
   * Calculates a width per column that fits the widest text of header, body and footer.
   *
   * The text is measured with the font and padding of a rendered cell label (canvas `measureText`),
   * so dates, numbers and long names are no longer cut off. To stay fast with millions of rows, the body
   * is scanned once by character length and only the longest candidates per column are measured.
   * Without a canvas (e.g. in tests) it falls back to 8 px per character.
   *
   * @returns {number[]} one width in px per column (at least 50 px)
   */
  calcAutoColumnWidths(): number[] {
    const bodyModel = this.tableModel.getBodyModel();
    const columnCount = this.tableModel.getColumnCount();

    if (!bodyModel) {
      console.warn('Body model is not available.');
      return [];
    }

    // 1. candidates: per column the texts with (almost) the greatest character length
    const maxCandidates = 30;
    const candidates: Set<string>[] = Array.from({length: columnCount}, () => new Set<string>());
    const maxLength = new Array(columnCount).fill(0);
    const collect = (area: AreaIdent) => {
      const model = this.tableModel.getAreaModel(area);
      const rowCount = model?.getRowCount() ?? 0;
      for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < columnCount; c++) {
          const text = model.getTextValueAt?.(r, c) || (model.getValueAt(r, c)?.toString() ?? '');
          const length = text.length;
          if (length > maxLength[c]) {
            maxLength[c] = length;
            candidates[c].forEach(t => { if (t.length < length - 2) candidates[c].delete(t); });
          }
          if (length >= maxLength[c] - 2 && candidates[c].size < maxCandidates) candidates[c].add(text);
        }
      }
    };
    collect('header');
    collect('body');
    collect('footer');

    // 2. measure the candidates with the font and padding of a real cell label
    const label = this.hostElement.querySelector('.ge-table-label') as HTMLElement | null;
    const style = getComputedStyle(label ?? this.hostElement);
    const padding = label ? (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0) : 20;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = document.createElement('canvas').getContext('2d');
    } catch (_e) {
      ctx = null;
    }
    if (ctx) ctx.font = style.font || `${style.fontSize} ${style.fontFamily}`;
    const measure = (text: string) => ctx ? ctx.measureText(text).width : text.length * 8;

    return candidates.map(texts => {
      let px = 0;
      texts.forEach(t => { px = Math.max(px, measure(t)); });
      return Math.max(Math.ceil(px + padding + 2), 50);
    });
  }


  setColumnWidth(columnIndex: number, width: number): void{
    this.tableModel.setColumnWidth(columnIndex, width);
    this.stateService.markDirty('columns');
  }

  /**
   * Shows or hides a column and repaints (see {@link TableApi.setColumnVisible}).
   *
   * @param {number | string | ColumnDefIf} column - column index, property or column definition
   * @param {boolean} visible - false hides the column
   * @returns {boolean} false if the column has no column definition (or the table model can't hide columns)
   */
  setColumnVisible(column: number | string | ColumnDefIf, visible: boolean): boolean {
    if (!this.tableModel.setColumnVisible?.(column, visible)) {
      return false;
    }
    this.recalcWrappers(); // content width, wrapper div, fixed areas, repaint
    this.stateService.markDirty('columns');
    return true;
  }

  /**
   * Shows or hides the header and repaints (see {@link TableApi.setHeaderVisible}).
   *
   * @param {boolean} visible - false hides the header
   */
  setHeaderVisible(visible: boolean): void {
    this.setAreaVisible('header', visible);
  }

  /**
   * Shows or hides the footer and repaints (see {@link TableApi.setFooterVisible}).
   *
   * @param {boolean} visible - false hides the footer
   */
  setFooterVisible(visible: boolean): void {
    this.setAreaVisible('footer', visible);
  }

  private setAreaVisible(area: 'header' | 'footer', visible: boolean): void {
    const tableModel = this.tableModel;
    const setter = area === 'header' ? tableModel.setHeaderVisible : tableModel.setFooterVisible;
    if (!setter) {
      console.warn(`set${area === 'header' ? 'Header' : 'Footer'}Visible() needs a table model with this method (e.g. TableModel), this one has none:`, tableModel);
      return;
    }
    setter.call(tableModel, visible);
    if (area === 'header' && !visible) {
      this.headerFocus = undefined; // a hidden header cannot have the focus
    }
    this.recalcWrappers(); // area heights → scroll viewport and body height, repaint
  }

  autoResizeColumns(recalcWrappers: boolean= true) {
    // Resize columns
    const columnWidthes = this.calcAutoColumnWidths();
    for (let i = 0; i < columnWidthes.length; i++) {
      if (isRowNumberColumnDef(this.tableModel.getColumnDef(i))) continue; // its width follows the numbers
      const columnWidth = columnWidthes[i];
      this.tableModel.setColumnWidth(i, columnWidth);
    }
    if (recalcWrappers) this.recalcWrappers();
    this.stateService.markDirty('columns');
  }

  recalcWrappers(){
    this.tableModel.recalcPadding();
    this.resetSizeOfWrapperDiv();
    this.adjustContainersAndRows();
  }

  reSort() {
    // the current sort order: the last sort(fn), otherwise the columns with a sortState (header icons) – before only
    // the items stored by autoRestoreOptions were used, so reSort() did nothing without them
    this.reapplySorting();
    this.invalidateAggregates();
    this.repaint();
  }

  sort(compareFn: (a: any, b: any) => number) {
    this.tableModel.sort(compareFn);
    this.invalidateAggregates();
    this.lastSortCompareFn = compareFn;
    this.tableModel.getColumnDefs()?.forEach(cd => cd.sortState = ''); // the header icons no longer apply
    this.repaint(); // without it the new order only appeared after the next scroll
    this.stateService.sortedByColumn(undefined); // an own comparator can't be stored
  }

  /**
   * Sorts the body by the given items (first = primary key) and sets the header icons – used to apply a stored
   * state. Does not repaint.
   *
   * @param {SortItem[]} sortItems - column index and sort state per sorted column; `[]` only clears the icons
   * @since 1.1.92
   */
  applySortItems(sortItems: SortItem[]): void {
    const columnDefs = this.tableModel.getColumnDefs();
    columnDefs?.forEach(cd => cd.sortState = '');
    sortItems.forEach(item => {
      const cd = columnDefs?.[item.columnIndex];
      if (cd) cd.sortState = item.sortState;
    });
    if (sortItems.length) {
      this.lastSortCompareFn = undefined;
      this.tableModel.doSort(sortItems);
      this.invalidateAggregates();
    }
  }

  /**
   * Sorts the (freshly filtered) body rows again, so a filter keeps the current order:
   * the last `sort(compareFn)` call, otherwise the columns with a `sortState` (header icons).
   */
  protected reapplySorting() {
    if (this.lastSortCompareFn) {
      this.tableModel.sort(this.lastSortCompareFn);
      return;
    }
    const sortItems: SortItem[] = [];
    this.tableModel.getColumnDefs()?.forEach((cd, index) => {
      if (cd.sortState) sortItems.push(new SortItem(index, cd.sortState));
    });
    if (sortItems.length) {
      this.tableModel.doSort(sortItems);
    }
  }




  /**
   * Ensures that a specific row is visible in the viewport by scrolling if necessary.
   * This method checks if the target row is within the currently visible range and
   * adjusts the scroll position if it's not visible.
   *
   * The method performs the following:
   * 1. Checks if the row is above the current viewport (before first visible row)
   * 2. Checks if the row is below the current viewport (after last visible row)
   * 3. Scrolls to make the row visible if needed – vertically only, the horizontal position is kept
   *
   * @param {number} rowIndex - The index of the row to make visible
   * @returns {boolean} Returns true if scrolling was needed and performed, false if the row was already visible
   *
   * @example
   * // Ensure row 5 is visible in the viewport
   * tableScope.ensureRowIsVisible(5);
   *
   * @throws {Error} Implicitly may throw if rowIndex is not a number or if required properties are undefined
   *
   * @see {@link scrollToIndex} - The underlying method used for scrolling
   * @see {@link getDisplayedRowCount} - Related method for getting visible row count
   */
  ensureRowIsVisible(rowIndex:number):boolean {
    const firstVisibleRowIndex = this.getFirstFullVisibleRowIndex();
    const lastVisibleRowIndex = this.getLastFullVisibleRowIndex();
    const displayedRowCount = this.getDisplayedRowCount();

    // column -1: keep the horizontal position (column 0 would scroll back to the first column)
    if (rowIndex < firstVisibleRowIndex) {
      this.scrollToIndex(-1, rowIndex);
      return true;
    }
    if (rowIndex > lastVisibleRowIndex) {
      this.scrollToIndex(-1, rowIndex - displayedRowCount + 1);
      return true;
    }
    return false;
  }

  /**
   * Ensures that a column of the scrollable center area is fully visible by scrolling horizontally if necessary –
   * the counterpart of {@link ensureRowIsVisible}. A column left of the viewport becomes the first visible column,
   * a column right of it the last one (a column wider than the viewport: the first). The vertical position is kept.
   *
   * Fixed west/east columns are always visible: nothing to do.
   *
   * @param {number} columnIndex - model column index (west + center + east)
   * @returns {boolean} true if the table was scrolled, false if the column was already visible (or is fixed / hidden / out of range)
   *
   * @example
   * tableScope.ensureColumnIsVisible(12);
   */
  ensureColumnIsVisible(columnIndex: number): boolean {
    const firstCenterColumn = this.tableModel.getFixedLeftColumnCount();
    const lastCenterColumn = this.tableModel.getColumnCount() - this.tableModel.getFixedRightColumnCount() - 1;
    if (!(columnIndex >= firstCenterColumn && columnIndex <= lastCenterColumn)) {
      return false;
    }
    const width = this.tableModel.getColumnWidth(columnIndex);
    const viewport = this.scrollViewport;
    const viewWidth = this.areaBodyCenterGeo.width;
    const contentRange = this.tableModel.getContentWidthInPixel() - viewWidth;
    const scrollerRange = viewport.scrollWidth - viewport.clientWidth;
    if (width <= 0 || contentRange <= 0 || scrollerRange <= 0) {
      return false; // hidden, or all center columns fit
    }
    let left = 0;
    for (let c = firstCenterColumn; c < columnIndex; c++) {
      left += this.tableModel.getColumnWidth(c);
    }
    // the same linear mapping as the rendering (scrollFactorX, see adjustColumnsToRowParent)
    const offset = Math.min(1, Math.max(0, viewport.scrollLeft / scrollerRange)) * contentRange;
    let target: number;
    if (left < offset - 0.5) {
      target = left;
    } else if (left + width > offset + viewWidth + 0.5) {
      target = width > viewWidth ? left : left + width - viewWidth;
    } else {
      return false;
    }
    const scrollLeft = Math.min(1, Math.max(0, target / contentRange)) * scrollerRange;
    // scrollLeft is rounded by the browser – round towards the side that must be fully visible
    viewport.scrollLeft = target === left ? Math.floor(scrollLeft) : Math.ceil(scrollLeft);
    this.adjustAfterScrolling(); // render the new position now (a scroll event may not fire)
    return true;
  }


}


