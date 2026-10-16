import { toPhysicalScrollLeft } from "./rtl/rtl-util";
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
import { RowDragService } from './row-drag/row-drag-service';
import { BatchEditService, PendingInputIf } from './batch-edit/batch-edit-service';
import { FillHandleService } from './fill/fill-handle-service';
import { MasterDetailService } from './master-detail/master-detail-service';
import { GeDetailEvent, GeDetailEventSource } from './data/common/event/ge-detail-event';
import { FillHandleOptions } from './fill/fill-handle-options';
import type { FillHandleOptionsIf } from './fill/fill-handle-options.if';
import type { CellChangeIf, CellChangeSource } from './batch-edit/cell-change.if';
import type { CellValueChangeIf } from './batch-edit/cell-value-change.if';
import type { FillDirection } from './fill/fill-direction.type';
import type { FillMode } from './fill/fill-series';
import { computeFillChanges, getFillRange } from './fill/compute-fill-changes';
import { CellRange } from './data/common/cell-range';
import { AriaTexts } from './aria/aria-texts';
import type { AriaTextsIf } from './aria/aria-texts.if';
import { EditingOptions } from './sheet-editing/editing-options';
import type { EditingOptionsIf } from './sheet-editing/editing-options.if';
import { CellEditorService } from './sheet-editing/cell-editor-service';
import type { CellEditMode } from './sheet-editing/cell-editor.if';
import { editingShortcutLayer } from './sheet-editing/editing-keymap';
import { clipboardShortcutLayer } from './clipboard/clipboard-keymap';
import { ClipboardOptions } from './clipboard/clipboard-options';
import type { ClipboardOptionsIf } from './clipboard/clipboard-options.if';
import { ClipboardService } from './clipboard/clipboard-service';
import { undoShortcutLayer } from './undo/undo-keymap';
import { UndoOptions } from './undo/undo-options';
import type { UndoOptionsIf } from './undo/undo-options.if';
import { UndoService } from './undo/undo-service';
import type { PendingSnapshotIf } from './undo/pending-changes-undoable';
import { isSameCellValue } from './batch-edit/pending-cell-changes';
import { findDataEdge } from './sheet-editing/sheet-navigation';
import type { ShortcutActionIdMapping } from './action/shortcut-actionid-mapping.type';
import { GeEditEvent } from './data/common/event/ge-edit-event';
import { createEventListenerHub } from './event-listener-hub';


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
  static actionsBlockedWhileLoading: ActionId[] = ['START_EDITING', 'TOGGLE_SELECTION', 'ACTIVATE_CELL', 'MOVE_ROW_UP', 'MOVE_ROW_DOWN', 'FILL_DOWN', 'FILL_RIGHT', 'CLEAR_CELLS', 'CLEAR_AND_EDIT', 'CUT_2_CLIPBOARD', 'PASTE_FROM_CLIPBOARD', 'UNDO', 'REDO'];
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
  /** Excel-style editing (`tableOptions.editing`), `undefined` = off. @since 1.1.99 */
  private readonly editingOptions?: EditingOptionsIf = EditingOptions.create(this.tableOptions?.editing);
  /** Listeners of {@link TableApi.subscribe}. @since 1.1.99 */
  private readonly subscribers = new Set<Partial<EventListenerIf>>();
  /** Copy, cut and paste (`tableOptions.clipboard`), `undefined` = off. @since 1.1.99 */
  private readonly clipboardOptions?: ClipboardOptionsIf = ClipboardOptions.create(this.tableOptions?.clipboard);
  /** Copy, cut and paste: with the option keys and events, otherwise created for the API. @since 1.1.99 */
  clipboardService?: ClipboardService;
  /** Undo and redo (`tableOptions.undo`), `undefined` = off. @since 1.1.99 */
  private readonly undoOptions?: UndoOptionsIf = UndoOptions.create(this.tableOptions?.undo);
  /** Undo and redo: records the changes of the write path (only with the option). @since 1.1.99 */
  undoService?: UndoService;
  /** The key event the {@link ShortcutService} is handling right now (`undefined` for `triggerAction`). @since 1.1.99 */
  shortcutKeyEvent?: KeyboardEvent;

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

    // the constructor's listener plus the listeners of TableApi.subscribe() (since 1.1.99)
    this.eventListener = createEventListenerHub(eventListener ?? new EventAdapter(), this.subscribers);
    this.stateService = new TableStateService(this);
    this.mouseHandler = new MouseHandler(this);
    this.inputHandler = new InputHandler(this);
    this.resizeHandler = new ResizeHandler(this, tableOptions.resizeEventDebounceDelay);

    this.shortcutService = new ShortcutService(this);
    this.rowDragService = new RowDragService(this);
    this.batchEditService = new BatchEditService(this);
    this.fillHandleService = new FillHandleService(this);
    if (this.editingOptions) {
      // Excel-style editing (since 1.1.99): the editor above the cell, typing to edit
      this.cellEditorService = new CellEditorService(this, this.editingOptions);
      const body = tableModel.getBodyModel();
      if (this.editingOptions.defaultEditable && 'defaultEditable' in body) {
        (body as { defaultEditable: boolean }).defaultEditable = true; // AbstractAreaModel and its subclasses
      }
      this.setHostAriaAttribute('aria-description', this.getSheetTexts().gridEditingHint());
    }
    if (this.clipboardOptions) {
      this.clipboardService = new ClipboardService(this, this.clipboardOptions, true); // since 1.1.99
    }
    if (this.undoOptions) {
      this.undoService = new UndoService(this, this.undoOptions); // since 1.1.99
    }
    if (tableOptions?.masterDetail) {
      this.masterDetailService = new MasterDetailService(this,
        (host, model, options, listener) => new TableScope(host, model, new SimpleDomService(),
          // a nested table without an own direction takes the direction of this table (since 1.1.98) – the app's
          // options object itself stays the nested table's options (later changes, e.g. externalFilterFunction, count)
          this.nestedTableOptions(options),
          listener ?? new EventAdapter()));
      if (this.masterDetailService.isActive()) {
        // the detail rows are a row group between body and footer (screen readers)
        const owned = (hostElement.getAttribute('aria-owns') ?? '').split(' ').filter(Boolean);
        const footer = owned.findIndex(id => id.startsWith(this.ariaIds.rowGroup('footer', 'west')));
        owned.splice(footer < 0 ? owned.length : footer, 0, this.ariaIds.detailRowGroup());
        this.setHostAriaAttribute('aria-owns', owned.join(' '));
        // expandable rows (aria-expanded) belong to a treegrid – a grid row must not have aria-expanded
        this.setHostAriaAttribute('role', 'treegrid');
      }
    }
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

  /**
   * The options of a nested table (master/detail `ctx.createTable()`): as given; without an own `direction` in a
   * right-to-left table an object that reads everything else from the given options (prototype) and adds `"rtl"`.
   */
  private nestedTableOptions(options?: TableOptionsIf): TableOptionsIf {
    if (!options) {
      return { ...new TableOptions(), direction: this.direction };
    }
    if (options.direction !== undefined || !this.isRtl()) {
      return options;
    }
    return Object.assign(Object.create(options) as TableOptionsIf, { direction: this.direction });
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
      // a detail row (master/detail) may fill the body: then the row at the top of the view
      const row = this.firstFullVisibleRowIndex >= 0 ? this.firstFullVisibleRowIndex
        : Math.max(0, this.getBodyRowIndexAtY(this.contentScrollTop));
      this.setFocusCell(row, this.getFirstShownColumnIndex());
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
    if (actionId === 'FILL_DOWN' || actionId === 'FILL_RIGHT') {
      // fill handle, keyboard alternative (since 1.1.96) – only with tableOptions.fillHandle and a selected range
      return !this.headerFocus && this.fillByKeyboard(actionId === 'FILL_DOWN' ? 'down' : 'right');
    }
    const sheetAction = this.onSheetAction(actionId);
    if (sheetAction !== undefined) {
      return sheetAction; // Excel-style editing (since 1.1.99)
    }
    if (actionId === 'MOVE_ROW_UP' || actionId === 'MOVE_ROW_DOWN') {
      // row drag, keyboard alternative (since 1.1.95) – only in the body
      return !this.headerFocus && !!this.rowDragService?.moveByKeyboard(actionId === 'MOVE_ROW_UP' ? -1 : 1);
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
            this.startEditing(rowIdx, colIdx, 'edit', 'end'); // F2: caret at the end (Excel)
          }
        }
        return true;
      }
    }
    if (this.undoService && (actionId === 'UNDO' || actionId === 'REDO')) {
      if (actionId === 'UNDO') {
        this.undoService.undo();
      } else {
        this.undoService.redo();
      }
      return true; // also with nothing to undo: the browser's undo has nothing to do on the grid
    }
    if (this.clipboardService && this.clipboardOptions
      && (actionId === 'COPY_2_CLIPBOARD' || actionId === 'CUT_2_CLIPBOARD' || actionId === 'PASTE_FROM_CLIPBOARD')) {
      const kind = actionId === 'COPY_2_CLIPBOARD' ? 'copy' : actionId === 'CUT_2_CLIPBOARD' ? 'cut' : 'paste';
      if (this.shortcutKeyEvent) {
        if (this.clipboardService.arm(kind) || kind !== 'copy') {
          return false; // not consumed: the browser fires its clipboard event (into the hidden text field)
        }
      } else if (kind !== 'copy' || Object.getPrototypeOf(this.copyService) === CopyService.prototype) {
        void this.clipboardService.runWithoutKey(kind); // triggerAction (a menu): the asynchronous clipboard API
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

  // ------------------------------------------------------------------- Excel-style editing (since 1.1.99)

  /**
   * The options of Excel-style editing ({@link TableOptionsIf.editing}), `undefined` if it is off.
   *
   * @returns {EditingOptionsIf | undefined} complete options
   * @since 1.1.99
   */
  getEditingOptions(): EditingOptionsIf | undefined {
    return this.editingOptions;
  }

  /**
   * Shortcut layers of switched-on features, applied over the system mapping (see {@link ShortcutService}).
   *
   * @param {boolean} mac - macOS keys
   * @returns {ShortcutActionIdMapping[]} the layers (none without Excel-style editing)
   * @since 1.1.99
   */
  getShortcutLayers(mac: boolean): ShortcutActionIdMapping[] {
    const layers: ShortcutActionIdMapping[] = [];
    const editing = this.editingOptions;
    if (this.clipboardOptions) {
      layers.push(clipboardShortcutLayer(mac));
    }
    if (this.undoOptions) {
      layers.push(undoShortcutLayer(mac));
    }
    if (!editing) {
      return layers;
    }
    const layer = editingShortcutLayer(mac);
    if (!editing.tabMoves) {
      delete layer['tab'];
      delete layer['shift+tab'];
    }
    if (!editing.clearKeys) {
      delete layer['delete'];
      delete layer['backspace'];
    }
    return [layer, ...layers];
  }

  /**
   * Adds a listener next to the one given to the constructor (see {@link TableApi.subscribe}).
   *
   * @param {Partial<EventListenerIf>} listener - the events of interest
   * @returns {() => void} removes the listener again
   * @since 1.1.99
   */
  subscribe(listener: Partial<EventListenerIf>): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  /**
   * Opens the cell editor of a body cell: the editor above the cell (Excel-style editing) or – for columns with an
   * own `getEditRenderer`, and without `tableOptions.editing` – the editor inside the cell.
   *
   * @param {number} rowIndex - display row index
   * @param {number} columnIndex - model column index
   * @param {CellEditMode} [mode="edit"] - "edit" (F2, Enter, double click) or "enter" (typing)
   * @param {"all" | "end"} [textSelection] - select the text or put the caret at the end (default: the option)
   * @returns {boolean} true if an editor is open
   * @since 1.1.99
   */
  startEditing(rowIndex: number, columnIndex: number, mode: CellEditMode = 'edit', textSelection?: 'all' | 'end'): boolean {
    if (this.cellEditorService?.handlesColumn(columnIndex)) {
      return this.cellEditorService.start(rowIndex, columnIndex, { mode, textSelection });
    }
    if (!this.tableModel.getBodyModel().isEditable(rowIndex, columnIndex)) {
      return false;
    }
    this.clearSelection();
    this.initRenderEditor(rowIndex, columnIndex);
    const open = this.getInCellEditorCell();
    if (open) {
      this.eventListener.onEditingChanged?.(new GeEditEvent('start', rowIndex, columnIndex, mode));
    }
    return !!open;
  }

  /** True if a new editor may open now: no header focus, no blocking overlay, no running drag or fill. @since 1.1.99 */
  canStartEditing(): boolean {
    return !this.isDestroyed() && !this.headerFocus && !this.tableOverlay.isBlocking()
      && !this.rowDragService?.isDragging() && !this.fillHandleService?.isFilling() && !this.editing;
  }

  /**
   * The value a body cell shows: a pending value of a batch edit, otherwise the model value.
   *
   * @param {number} rowIndex - display row index
   * @param {number} columnIndex - model column index
   * @returns {unknown} the value
   * @since 1.1.99
   */
  getShownCellValue(rowIndex: number, columnIndex: number): unknown {
    return this.batchEditService
      ? this.batchEditService.getShownValue(rowIndex, columnIndex)
      : this.tableModel.getBodyModel().getValueAt(rowIndex, columnIndex);
  }

  /** The body cell with the keyboard focus, `undefined` if there is none (or the header has the focus). @since 1.1.99 */
  getActiveBodyCell(): [number, number] | undefined {
    const fm = this.focusModel();
    if (!fm || this.headerFocus) {
      return undefined;
    }
    const [row, col] = fm.getFocus();
    const rowCount = this.tableModel.getBodyModel().getRowCount();
    return row >= 0 && col >= 0 && row < rowCount && col < this.tableModel.getColumnCount() ? [row, col] : undefined;
  }

  /**
   * True if there is a shown column (no row number column) next to `columnIndex` in that direction – Tab uses it:
   * in the last column it leaves the table.
   *
   * @param {number} columnIndex - model column index
   * @param {number} direction - 1 or -1
   * @returns {boolean} true if Tab can move
   * @since 1.1.99
   */
  hasShownColumnBeside(columnIndex: number, direction: number): boolean {
    const next = this.getNextShownColumnIndex(columnIndex, direction, this.tableModel.getColumnCount());
    return next !== columnIndex && !isRowNumberColumnDef(this.tableModel.getColumnDef(next));
  }

  /**
   * Moves the keyboard focus from a cell by rows/columns (Excel-style editing: Enter, Tab and arrow keys after
   * committing); the selection follows with `collapseSelectionOnNavigate`.
   *
   * @param {number} rowIndex - start row
   * @param {number} columnIndex - start column
   * @param {number} dRow - rows
   * @param {number} dColumn - columns (hidden columns are skipped)
   * @returns {boolean} true if a focus model exists
   * @since 1.1.99
   */
  moveActiveCell(rowIndex: number, columnIndex: number, dRow: number, dColumn: number): boolean {
    const fm = this.focusModel();
    if (!fm) {
      return false;
    }
    if (!fm.hasFocus(rowIndex, columnIndex)) {
      fm.setFocus(rowIndex, columnIndex);
    }
    return this.changeFocusCell(dColumn, dRow);
  }

  /**
   * The selected body cells (shown columns, inside the table) – `undefined` if there are more than `maxCells`.
   *
   * @param {number} maxCells - upper limit
   * @returns {Array<[number, number]> | undefined} row and column per cell; none without selection
   * @since 1.1.99
   */
  getSelectedBodyCells(maxCells: number): Array<[number, number]> | undefined {
    return this.collectSelectedBodyCells(maxCells);
  }

  /**
   * The body cells of the selection (or of `given` ranges): clamped to the table, shown columns without row number
   * column, each cell once – `undefined` if there are more than `maxCells` (checked before the cells are visited).
   */
  private collectSelectedBodyCells(maxCells: number, given?: CellRange[]): Array<[number, number]> | undefined {
    const sm = this.selectionModel();
    if (!given && !sm?.hasSelection() && !sm?.isAllSelected()) {
      return [];
    }
    const rowCount = this.tableModel.getBodyModel().getRowCount();
    const columnCount = this.tableModel.getColumnCount();
    const ranges = given ?? (sm!.isAllSelected() ? [new CellRange(0, 0, rowCount - 1, columnCount - 1)] : sm!.getRanges());
    const shown = (c: number) => this.tableModel.getColumnWidth(c) > 0
      && !isRowNumberColumnDef(this.tableModel.getColumnDef(c));
    const ret: Array<[number, number]> = [];
    const seen = ranges.length > 1 ? new Set<number>() : undefined;
    for (const range of ranges) {
      const r1 = Math.max(0, range.r1);
      const r2 = Math.min(rowCount - 1, range.r2);
      const c1 = Math.max(0, range.c1);
      const c2 = Math.min(columnCount - 1, range.c2);
      if (r2 >= r1 && c2 >= c1 && (r2 - r1 + 1) * (c2 - c1 + 1) > maxCells) {
        return undefined;
      }
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          if (!shown(c) || (!given && !sm!.isSelected(r, c))) continue;
          if (seen) {
            const key = r * columnCount + c;
            if (seen.has(key)) continue;
            seen.add(key);
          }
          ret.push([r, c]);
          if (ret.length > maxCells) return undefined;
        }
      }
    }
    return ret;
  }

  /**
   * Clears body cells (Delete in Excel-style editing): editable cells get `ColumnDef.emptyValue` (default
   * `EditingOptionsIf.emptyValue`, `""`), cells that are already empty are left alone; **one** `onModelChanged` with
   * the source `"clear"`. Without `ranges`: the selected cells, or the focused cell.
   *
   * @param {CellRange[]} [ranges] - body ranges (display indices)
   * @returns {number} the number of cleared cells; `-1` if more than `maxClearCells`
   * @since 1.1.99
   */
  clearCells(ranges?: CellRange[]): number {
    const max = this.editingOptions?.maxClearCells ?? CopyService.maxCopyCells;
    const cells = this.collectSelectedBodyCells(max, ranges);
    if (!cells) {
      this.announce(this.getSheetTexts().clearTooLarge(max));
      return -1;
    }
    if (!cells.length && !ranges) {
      const active = this.getActiveBodyCell();
      if (active) cells.push(active);
    }
    const body = this.tableModel.getBodyModel();
    const empty = (v: unknown) => v === null || v === undefined || v === '';
    const changes: CellValueChangeIf[] = [];
    for (const [r, c] of cells) {
      if (r < 0 || c < 0 || r >= body.getRowCount() || c >= this.tableModel.getColumnCount()) continue;
      if (!body.isEditable(r, c) || empty(this.getShownCellValue(r, c))) continue;
      const def = this.tableModel.getColumnDef(c);
      const value = def?.emptyValue !== undefined ? def.emptyValue : (this.editingOptions?.emptyValue ?? '');
      changes.push({ rowIndex: r, column: c, value });
    }
    const written = changes.length ? this.applyCellChanges(changes, 'clear') : [];
    this.announce(this.getSheetTexts().cellsCleared(written.length));
    return written.length;
  }

  /**
   * Writes the value of the editor above the cell (Excel-style editing): into one cell, or – Ctrl/⌘+Enter – into
   * several; batch edit: marks it. Used by {@link CellEditorService}.
   *
   * @param {Array<[number, number]>} cells - display row and model column per cell
   * @param {unknown} value - the editor value (it runs through `editInputPipe` and `validate`)
   * @param {boolean} deferRepaint - repaint after the current mouse click
   * @returns {{ written: number, invalid: number, message?: string }} what happened
   * @since 1.1.99
   */
  commitCellEditor(cells: Array<[number, number]>, value: unknown, deferRepaint: boolean): { written: number; invalid: number; message?: string } {
    const changes = cells.map(([rowIndex, column]) => ({ rowIndex, column, value }));
    const resolved = this.resolveCellChanges(changes, cells.length > 1);
    if (!resolved.length) {
      return { written: 0, invalid: 0 };
    }
    if (this.batchEditService?.isActive()) {
      this.markPending(resolved.map(c => ({ rowIndex: c.rowIndex, column: c.columnIndex, value: c.value })), true);
      if (deferRepaint) {
        this.debounceRepaint();
      } else {
        this.repaint();
      }
      return { written: resolved.length, invalid: 0 }; // invalid pending values are marked, not refused
    }
    const result = this.writeCellsInternal(resolved, 'edit', { deferRepaint });
    return { written: result.changes.length, invalid: result.invalid, message: result.message };
  }

  /**
   * Space on a cell with a `true`/`false` value (Excel-style editing): writes the opposite value.
   *
   * @param {number} rowIndex - display row index
   * @param {number} columnIndex - model column index
   * @since 1.1.99
   */
  toggleBooleanCell(rowIndex: number, columnIndex: number): void {
    this.applyCellChanges([{ rowIndex, column: columnIndex, value: !this.getShownCellValue(rowIndex, columnIndex) }], 'edit');
  }

  /** The texts of Excel-style editing (own functions of `tableOptions.ariaTexts`, otherwise English). @since 1.1.99 */
  getSheetTexts(): Required<Pick<AriaTextsIf, 'editingStarted' | 'readOnlyCell' | 'cellsCleared' | 'clearTooLarge' |
    'rangeSelected' | 'rowSelected' | 'columnSelected' | 'gridEditingHint' | 'cellsPasted' | 'pasteTooLarge' |
    'copyTooLarge' | 'cutMarked' | 'copiedLastRangeOnly'>> {
    const texts = (this.ariaTexts ?? {}) as Partial<AriaTextsIf>;
    const defaults = new AriaTexts();
    return {
      editingStarted: (l: string) => (texts.editingStarted ?? defaults.editingStarted).call(texts, l),
      readOnlyCell: () => (texts.readOnlyCell ?? defaults.readOnlyCell).call(texts),
      cellsCleared: (n: number) => (texts.cellsCleared ?? defaults.cellsCleared).call(texts, n),
      clearTooLarge: (n: number) => (texts.clearTooLarge ?? defaults.clearTooLarge).call(texts, n),
      rangeSelected: (r: number, c: number) => (texts.rangeSelected ?? defaults.rangeSelected).call(texts, r, c),
      rowSelected: (n: number) => (texts.rowSelected ?? defaults.rowSelected).call(texts, n),
      columnSelected: (n: number) => (texts.columnSelected ?? defaults.columnSelected).call(texts, n),
      gridEditingHint: () => (texts.gridEditingHint ?? defaults.gridEditingHint).call(texts),
      cellsPasted: (n: number, s: number) => (texts.cellsPasted ?? defaults.cellsPasted).call(texts, n, s),
      pasteTooLarge: (n: number) => (texts.pasteTooLarge ?? defaults.pasteTooLarge).call(texts, n),
      copyTooLarge: (n: number) => (texts.copyTooLarge ?? defaults.copyTooLarge).call(texts, n),
      cutMarked: (n: number) => (texts.cutMarked ?? defaults.cutMarked).call(texts, n),
      copiedLastRangeOnly: () => (texts.copiedLastRangeOnly ?? defaults.copiedLastRangeOnly).call(texts),
    };
  }

  /** The keys of Excel-style editing that are ActionIds (Tab, Shift+arrows, Ctrl+arrows, Delete …). */
  private onSheetAction(actionId: ActionId): boolean | undefined {
    const editing = this.editingOptions;
    if (!editing) {
      return undefined;
    }
    switch (actionId) {
      case 'NAVIGATE_NEXT_CELL':
      case 'NAVIGATE_PREVIOUS_CELL': {
        const cell = this.getActiveBodyCell();
        const dir = actionId === 'NAVIGATE_NEXT_CELL' ? 1 : -1;
        if (!cell || this.isEditing() || !this.hasShownColumnBeside(cell[1], dir)) {
          return false; // the last (first) column: Tab leaves the table – no keyboard trap
        }
        if (dir > 0 && this.masterDetailService?.hasTabTarget(cell[0])) {
          return false; // an open detail row: Tab goes into it (master/detail)
        }
        return this.moveActiveCell(cell[0], cell[1], 0, dir);
      }
      case 'EXTEND_SELECTION_UP':
      case 'EXTEND_SELECTION_DOWN':
      case 'EXTEND_SELECTION_LEFT':
      case 'EXTEND_SELECTION_RIGHT':
      case 'EXTEND_SELECTION_ROW_START':
      case 'EXTEND_SELECTION_ROW_END':
      case 'EXTEND_SELECTION_PAGE_UP':
      case 'EXTEND_SELECTION_PAGE_DOWN': {
        const from = this.getSelectionExtent();
        if (!from || this.isEditing()) {
          return false;
        }
        const [r, c] = from;
        const rowCount = this.tableModel.getBodyModel().getRowCount();
        const columnCount = this.tableModel.getColumnCount();
        const page = Math.max(1, this.displayedRowCount - 1);
        const targets: Partial<Record<ActionId, [number, number]>> = {
          EXTEND_SELECTION_UP: [Math.max(0, r - 1), c],
          EXTEND_SELECTION_DOWN: [Math.min(rowCount - 1, r + 1), c],
          EXTEND_SELECTION_LEFT: [r, this.getNextShownColumnIndex(c, -1, columnCount)],
          EXTEND_SELECTION_RIGHT: [r, this.getNextShownColumnIndex(c, 1, columnCount)],
          EXTEND_SELECTION_ROW_START: [r, this.getFirstShownDataColumnIndex()],
          EXTEND_SELECTION_ROW_END: [r, this.getLastShownColumnIndex()],
          EXTEND_SELECTION_PAGE_UP: [Math.max(0, r - page), c],
          EXTEND_SELECTION_PAGE_DOWN: [Math.min(rowCount - 1, r + page), c],
        };
        const [tr, tc] = targets[actionId]!;
        return this.extendSelectionTo(tr, isRowNumberColumnDef(this.tableModel.getColumnDef(tc)) ? c : tc);
      }
      case 'NAVIGATE_DATA_EDGE_UP':
      case 'NAVIGATE_DATA_EDGE_DOWN':
      case 'NAVIGATE_DATA_EDGE_LEFT':
      case 'NAVIGATE_DATA_EDGE_RIGHT': {
        const cell = this.getActiveBodyCell();
        if (!cell || this.isEditing()) {
          return false;
        }
        const [tr, tc] = this.dataEdge(cell, actionId);
        return this.setFocusCell(tr, tc);
      }
      case 'EXTEND_TO_DATA_EDGE_UP':
      case 'EXTEND_TO_DATA_EDGE_DOWN':
      case 'EXTEND_TO_DATA_EDGE_LEFT':
      case 'EXTEND_TO_DATA_EDGE_RIGHT': {
        const from = this.getSelectionExtent();
        if (!from || this.isEditing()) {
          return false;
        }
        const [tr, tc] = this.dataEdge(from, actionId);
        return this.extendSelectionTo(tr, tc);
      }
      case 'SELECT_ROW':
      case 'SELECT_COLUMN':
        return this.selectWholeRowsOrColumns(actionId === 'SELECT_ROW');
      case 'CLEAR_CELLS':
        if (!editing.clearKeys || this.isEditing() || this.headerFocus) return false;
        this.clearCells();
        return true;
      case 'CLEAR_AND_EDIT': {
        if (!editing.clearKeys || this.isEditing() || this.headerFocus) return false;
        const cell = this.getActiveBodyCell();
        const selected = this.collectSelectedBodyCells(1); // undefined: more than one cell – clear like Delete
        if (cell && selected
          && this.cellEditorService?.handlesColumn(cell[1]) && this.tableModel.getBodyModel().isEditable(cell[0], cell[1])) {
          // Excel: Backspace empties the active cell in the editor – Escape keeps the old value
          this.cellEditorService.start(cell[0], cell[1], { mode: 'enter', typedText: '' });
          return true;
        }
        this.clearCells();
        return true;
      }
      default:
        return undefined;
    }
  }

  /** The moving corner of the selected range (Shift+arrows), the active cell if there is none. */
  private getSelectionExtent(): [number, number] | undefined {
    if (this.headerFocus) {
      return undefined; // the header has the focus: nothing to extend
    }
    return this.selectionService.getExtent() ?? this.getActiveBodyCell();
  }

  /** The first shown column that is no row number column. */
  private getFirstShownDataColumnIndex(): number {
    const first = this.getFirstShownColumnIndex();
    return isRowNumberColumnDef(this.tableModel.getColumnDef(first))
      ? this.getNextShownColumnIndex(first, 1, this.tableModel.getColumnCount()) : first;
  }

  /** Ctrl+arrow: Excel's edge of the data block from a cell (shown columns, no row number column). */
  private dataEdge(from: [number, number], actionId: ActionId): [number, number] {
    const dRow = actionId.endsWith('_UP') ? -1 : actionId.endsWith('_DOWN') ? 1 : 0;
    const dCol = actionId.endsWith('_LEFT') ? -1 : actionId.endsWith('_RIGHT') ? 1 : 0;
    const empty = (r: number, c: number) => {
      const v = this.getShownCellValue(r, c);
      return v === null || v === undefined || v === '';
    };
    return findDataEdge(empty, this.tableModel.getBodyModel().getRowCount(), this.tableModel.getColumnCount(),
      from[0], from[1], dRow, dCol,
      c => this.tableModel.getColumnWidth(c) > 0 && !isRowNumberColumnDef(this.tableModel.getColumnDef(c)));
  }

  /** Shift+arrows: the range from the anchor to `(row, column)`, scrolled into view and announced. */
  private extendSelectionTo(rowIndex: number, columnIndex: number): boolean {
    const range = this.selectionService.extendTo(rowIndex, columnIndex);
    if (!range) {
      return false;
    }
    this.ensureColumnIsVisible(columnIndex);
    this.ensureRowIsVisible(rowIndex);
    this.repaint();
    let columns = 0;
    for (let c = range.c1; c <= range.c2; c++) {
      if (this.tableModel.getColumnWidth(c) > 0) columns++;
    }
    this.announce(this.getSheetTexts().rangeSelected(range.r2 - range.r1 + 1, columns));
    return true;
  }

  /** Shift+Space / Ctrl+Space: the rows (columns) of the last range or of the active cell. */
  private selectWholeRowsOrColumns(rows: boolean): boolean {
    const sm = this.selectionModel();
    const cell = this.getActiveBodyCell();
    if (!sm || !cell || this.isEditing() || (sm as unknown as { selectionType?: string }).selectionType !== 'range') {
      return false;
    }
    const ranges = sm.getRanges();
    const last = ranges.length ? ranges[ranges.length - 1] : CellRange.singleCell(cell[0], cell[1]);
    const range = rows
      ? new CellRange(last.r1, 0, last.r2, Number.MAX_SAFE_INTEGER)
      : new CellRange(0, last.c1, Number.MAX_SAFE_INTEGER, last.c2);
    this.holdSelectionEvents(() => {
      sm.clear();
      sm.addSelection(range);
      this.onSelectionChanged(sm);
    });
    this.repaint();
    const texts = this.getSheetTexts();
    this.announce(rows ? texts.rowSelected(last.r2 - last.r1 + 1) : texts.columnSelected(last.c2 - last.c1 + 1));
    return true;
  }

  /**
   * The event listener of this table (the one given to the constructor, or an empty {@link EventAdapter}).
   *
   * @returns {EventListenerIf} the listener
   * @since 1.1.95
   */
  getEventListener(): EventListenerIf {
    return this.eventListener;
  }

  /**
   * Called after rows were moved in the body model (row drag, {@link TableApi.moveRows}): drops derived values
   * (totals, „Show values as“) and forgets a sort function of `tableApi.sort(fn)` – the moved order wins.
   * The caller repaints.
   *
   * @since 1.1.95
   */
  afterRowsMoved(): void {
    this.lastSortCompareFn = undefined;
    this.invalidateAggregates();
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
    this.afterActiveCellMoved(rowIndex, columnIndex);
    this.repaint();
    return true;
  }

  /** Excel-style editing: the keyboard moved the active cell – it becomes the selection and the anchor. */
  private afterActiveCellMoved(rowIndex: number, columnIndex: number): void {
    if (this.editingOptions?.collapseSelectionOnNavigate) {
      this.selectionService.collapseTo(rowIndex, columnIndex);
    }
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
      default: {
        if (row < 0 || col < 0) {
          return false;
        }
        if (this.activateBodyCell(row, col)) {
          return true;
        }
        // Excel-style editing (since 1.1.99): Enter edits (Google Sheets) or moves down (Excel)
        const editing = this.editingOptions;
        if (!editing) {
          return false;
        }
        if (editing.enterKey === 'moveDown') {
          return this.moveActiveCell(row, col, 1, 0);
        }
        if (this.tableModel.getBodyModel().isEditable(row, col)) {
          return this.startEditing(row, col, 'edit');
        }
        return false;
      }
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
    if (this.masterDetailService?.isMasterAt(rowIndex)) {
      return this.toggleDetail(rowIndex, 'keyboard'); // master/detail (since 1.1.97)
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
    const cell = this.getInCellEditorCell();
    if (cell) {
      this.eventListener.onEditingChanged?.(new GeEditEvent('cancel', cell[0], cell[1], 'edit'));
    }
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

  /**
   * Writes the text of a cell editor (called by the input handler on "change"). Batch edit: the value is marked as
   * pending instead. Uses {@link applyCellChanges} – one `onModelChanged` per edit, as before.
   *
   * @param {AreaIdent} areaIdent - only `"body"` is edited
   * @param {number} rowIndex - display index
   * @param {number} columnIndex - model index
   * @param {string} value - the text of the editor
   */
  updateModelValueAfterEdit(areaIdent: AreaIdent, rowIndex: number, columnIndex: number, value: string) {
    if (areaIdent !== 'body') {
      return;
    }
    if (this.getInCellEditorCell()) {
      this.eventListener.onEditingChanged?.(new GeEditEvent('commit', rowIndex, columnIndex, 'edit', value));
    }
    const closeEditor = () => {
      this.resetEditorRenderer();
    };
    if (this.batchEditService?.isActive()) {
      closeEditor();
      this.markPending([{ rowIndex, column: columnIndex, value }], false);
      this.repaint();
      this.hostElement.focus();
      return;
    }
    const result = this.writeCellsInternal([{ rowIndex, columnIndex, value }], 'edit', { beforeRepaint: closeEditor });
    if (result.changes.length || result.invalid) {
      if (!result.changes.length) {
        closeEditor();   // an invalid value: not written, the editor closes (announced)
        this.repaint();
      }
      this.hostElement.focus();
    }
  }

  /**
   * The one place that changes body cells (editor, fill handle, batch commit, {@link TableApi.applyCellChanges}):
   * skips cells that are not editable (`editable`, calculated columns without `valueSetter`, group/pivot rows),
   * applies `editInputPipe` and {@link ColumnDefIf.validate}, then writes – or, in a batch edit, marks the values as
   * pending. Writing reports **one** `onModelChanged` with all cells; derived values (totals, calculated columns) are
   * recomputed and the table repaints.
   *
   * @param {CellValueChangeIf[]} changes - cells and values (column as index or property)
   * @param {CellChangeSource} [source="api"] - reported in the event
   * @returns {CellChangeIf[]} the written (or, in a batch edit, newly pending) cells
   * @since 1.1.96
   */
  applyCellChanges(changes: CellValueChangeIf[], source: CellChangeSource = 'api', opts: { undoable?: boolean } = {}): CellChangeIf[] {
    const cells = this.resolveCellChanges(changes);
    if (!cells.length) {
      return [];
    }
    if (this.batchEditService?.isActive()) {
      const ret = this.markPending(cells.map(c => ({ rowIndex: c.rowIndex, column: c.columnIndex, value: c.value })), true,
        false, source, opts.undoable);
      this.repaint();
      return ret;
    }
    return this.writeCellsInternal(cells, source, { undoable: opts.undoable }).changes;
  }

  /**
   * Writes cell values directly (no batch edit) – used by {@link applyCellChanges} and the batch commit.
   *
   * @param {{ rowIndex: number, columnIndex: number, value: unknown }[]} cells - resolved cells (display/model indices)
   * @param {CellChangeSource} source - reported in the event
   * @param {{ extraChanges?: CellChangeIf[], skipValidation?: boolean }} [opts] - changes written elsewhere (reported
   *        in the same event), no validation (commit: already checked)
   * @returns {CellChangeIf[]} the written cells (including `extraChanges`)
   * @since 1.1.96
   */
  writeCells(cells: { rowIndex: number; columnIndex: number; value: unknown }[], source: CellChangeSource,
             opts: { extraChanges?: CellChangeIf[]; skipValidation?: boolean } = {}): CellChangeIf[] {
    return this.writeCellsInternal(cells, source, opts).changes;
  }

  private writeCellsInternal(
    cells: { rowIndex: number; columnIndex: number; value: unknown }[],
    source: CellChangeSource,
    opts: { extraChanges?: CellChangeIf[]; skipValidation?: boolean; beforeRepaint?: () => void; deferRepaint?: boolean;
      raw?: boolean; undoable?: boolean }
  ): { changes: CellChangeIf[]; invalid: number; message?: string } {
    const body = this.tableModel.getBodyModel();
    const rowCountBefore = body.getRowCount();
    const buildsBefore = isAreaModelRowGroups(body) ? body.getBuildCount() : 0;
    const changes: CellChangeIf[] = [];
    let invalid = 0;
    let firstMessage = '';
    const apply = () => {
      for (const { rowIndex, columnIndex, value } of cells) {
        if (!opts.skipValidation) {
          const error = this.validateCellValue(rowIndex, columnIndex,
            opts.raw ? value : this.pipeCellValue(rowIndex, columnIndex, value));
          if (error) {
            invalid++;
            firstMessage = firstMessage || error;
            continue;
          }
        }
        const oldValue = body.getValueAt(rowIndex, columnIndex);
        if (opts.raw ? this.setRawValue(rowIndex, columnIndex, value) : body.setValue(rowIndex, columnIndex, value)) {
          changes.push({
            row: this.rowObjectOf(rowIndex),
            rowIndex,
            columnIndex,
            property: this.batchEditService!.propertyOf(columnIndex),
            oldValue,
            newValue: body.getValueAt(rowIndex, columnIndex)
          });
        }
      }
    };
    // a row grouping moves rows with a changed grouped value only after the last cell (the indices stay valid)
    if (isAreaModelRowGroups(body)) {
      body.batch(apply);
    } else {
      apply();
    }
    if (invalid) {
      this.announce(this.getEditTexts().invalidValue(firstMessage));
    }
    const all = opts.extraChanges?.length ? [...changes, ...opts.extraChanges] : changes;
    if (!all.length) {
      return { changes: all, invalid, message: firstMessage || undefined };
    }
    this.undoService?.record(all, source, opts.undoable); // one step per write (since 1.1.99)
    opts.beforeRepaint?.();
    // only body rows changed: models may recompute less (a row grouping only the groups of these rows)
    const derived: DerivedValuesChangeIf | undefined = opts.extraChanges?.length
      ? undefined
      : { area: 'body', rowIndices: changes.map(c => c.rowIndex) };
    this.invalidateAggregates(derived);
    const moved = isAreaModelRowGroups(body) && body.getBuildCount() !== buildsBefore;
    if (moved || body.getRowCount() !== rowCountBefore || source === 'commit') {
      this.repaintHard(); // e.g. a grouped value changed: the row moved to another group
    } else if (opts.deferRepaint) {
      this.debounceRepaint(); // a mouse click commits: repaint after it (the mouse handler holds it until mouseup)
    } else {
      this.repaint();
    }
    // values the app derives in onModelChanged (and repaints) are counted by the next repaint
    this.invalidateAggregates(derived);
    // writes of onModelChanged handlers (derived values) belong to this undo step (since 1.1.99)
    this.undoService?.beginFold();
    try {
      if (source === 'edit' && all.length === 1) {
        // the same event as before 1.1.96 (createSingle) – plus the change
        const evt = GeModelChangeEvent.createSingle(all[0].rowIndex, all[0].columnIndex);
        evt.changes = all;
        evt.source = source;
        this.eventListener.onModelChanged?.(evt);
      } else {
        this.eventListener.onModelChanged?.(GeModelChangeEvent.createForChanges(all, source));
      }
    } finally {
      this.undoService?.endFold();
    }
    return { changes: all, invalid, message: firstMessage || undefined };
  }

  /**
   * Writes a value without the column's `editInputPipe` (values copied inside the table are already converted – a pipe
   * that expects text could break them). All area models apply the pipe in `setValue`, so it is left out for the call.
   */
  private setRawValue(rowIndex: number, columnIndex: number, value: unknown): boolean {
    const body = this.tableModel.getBodyModel();
    const def = this.tableModel.getColumnDef(columnIndex);
    const pipe = def?.editInputPipe;
    if (!def || !pipe || Object.isFrozen(def)) {
      return body.setValue(rowIndex, columnIndex, value); // a frozen column definition: with its pipe
    }
    def.editInputPipe = undefined;
    try {
      return body.setValue(rowIndex, columnIndex, value);
    } finally {
      def.editInputPipe = pipe;
    }
  }

  /**
   * Writes pasted cells (copy, cut and paste): like {@link applyCellChanges} – not editable cells skipped, `validate`,
   * batch edit marks – with **one** `onModelChanged`; `raw` = values copied inside the table (no `editInputPipe`).
   *
   * @param {CellValueChangeIf[]} changes - target cells (and emptied cut cells)
   * @param {CellChangeSource} source - `"paste"` or `"cut"`
   * @param {boolean} raw - true: without `editInputPipe`
   * @returns {CellChangeIf[]} the written (batch edit: newly pending) cells
   * @since 1.1.99
   */
  writePastedCells(changes: CellValueChangeIf[], source: CellChangeSource, raw: boolean): CellChangeIf[] {
    const cells = this.resolveCellChanges(changes);
    if (!cells.length) {
      return [];
    }
    if (this.batchEditService?.isActive()) {
      const ret = this.markPending(cells.map(c => ({ rowIndex: c.rowIndex, column: c.columnIndex, value: c.value })), true, raw, source);
      this.repaint();
      return ret;
    }
    return this.writeCellsInternal(cells, source, { raw }).changes;
  }

  /**
   * Selects a body range (after pasting): its first cell becomes the active cell and the anchor.
   *
   * @param {CellRange} range - display rows, model columns
   * @since 1.1.99
   */
  selectBodyRange(range: CellRange): void {
    const fm = this.focusModel();
    if (fm) {
      this.headerFocus = undefined;
      fm.setFocus(range.r1, range.c1);
    }
    this.selectionService.collapseTo(range.r1, range.c1); // range and cell selections (others: unchanged)
    if (range.r2 !== range.r1 || range.c2 !== range.c1) {
      this.selectionService.extendTo(range.r2, range.c2); // range selections only
    }
    this.repaint();
  }

  /**
   * The message of the column's `validate` for a value that would be pasted, `undefined` if it is valid.
   *
   * @param {number} rowIndex - display row
   * @param {number} columnIndex - model column
   * @param {unknown} value - the value
   * @param {boolean} raw - true: without `editInputPipe`
   * @returns {string | undefined} the message
   * @since 1.1.99
   */
  checkPastedValue(rowIndex: number, columnIndex: number, value: unknown, raw: boolean): string | undefined {
    return this.validateCellValue(rowIndex, columnIndex, raw ? value : this.pipeCellValue(rowIndex, columnIndex, value));
  }

  /** True while a batch edit collects changes. @since 1.1.99 */
  isBatchEditActive(): boolean {
    return !!this.batchEditService?.isActive();
  }

  /** The options of undo and redo ({@link TableOptionsIf.undo}), `undefined` if it is off. @since 1.1.99 */
  getUndoOptions(): UndoOptionsIf | undefined {
    return this.undoOptions;
  }

  /**
   * Writes the values of an undo or redo: without `editInputPipe` (the values were piped already) and validation, only
   * editable cells; cells of hidden rows (`hidden`, written into their objects already) in the same event; no new
   * step.
   *
   * @param {{ rowIndex: number, columnIndex: number, value: unknown }[]} cells - shown cells
   * @param {CellChangeIf[]} hidden - cells of rows a filter hides
   * @param {"undo" | "redo"} source - reported in the event
   * @returns {CellChangeIf[]} the written cells (including `hidden`)
   * @since 1.1.99
   */
  writeUndoCells(cells: { rowIndex: number; columnIndex: number; value: unknown }[], hidden: CellChangeIf[],
                 source: 'undo' | 'redo'): CellChangeIf[] {
    if (!cells.length && !hidden.length) {
      return [];
    }
    const body = this.tableModel.getBodyModel();
    if (this.batchEditService?.isActive()) {
      // a batch edit runs: undo marks the old values (cancel takes them back); hidden rows can't be marked
      const ret = cells.length ? this.markPending(cells.map(c => ({ rowIndex: c.rowIndex, column: c.columnIndex, value: c.value })),
        true, true, source) : [];
      this.repaint();
      return ret;
    }
    const ret = this.writeCellsInternal(cells, source, { raw: true, skipValidation: true, extraChanges: hidden }).changes;
    if (hidden.length && isAreaModelRowGroups(body)) {
      body.regroup(); // values written past setValue may belong to another group now
      this.invalidateAggregates();
      this.repaintHard();
    }
    return ret;
  }

  /** The texts of undo and redo (own functions of `tableOptions.ariaTexts`, otherwise English). @since 1.1.99 */
  getUndoTexts(): Required<Pick<AriaTextsIf, 'undone' | 'redone' | 'nothingToUndo' | 'nothingToRedo' | 'undoSkipped' |
    'undoHistoryCleared'>> {
    const texts = (this.ariaTexts ?? {}) as Partial<AriaTextsIf>;
    const defaults = new AriaTexts();
    return {
      undone: (l: string, n: number) => (texts.undone ?? defaults.undone).call(texts, l, n),
      redone: (l: string, n: number) => (texts.redone ?? defaults.redone).call(texts, l, n),
      nothingToUndo: () => (texts.nothingToUndo ?? defaults.nothingToUndo).call(texts),
      nothingToRedo: () => (texts.nothingToRedo ?? defaults.nothingToRedo).call(texts),
      undoSkipped: (n: number) => (texts.undoSkipped ?? defaults.undoSkipped).call(texts, n),
      undoHistoryCleared: (n: number) => (texts.undoHistoryCleared ?? defaults.undoHistoryCleared).call(texts, n),
    };
  }

  /** True while an overlay blocks the table ("Loading…"). @since 1.1.99 */
  isOverlayBlocking(): boolean {
    return this.tableOverlay.isBlocking();
  }

  /** Rows were added at the end of the body (pasting with `pasteAddsRows`): derived values are recomputed. @since 1.1.99 */
  rowsAppended(): void {
    this.invalidateAggregates();
  }

  /** True for a tree, a row grouping or a pivot table in the body (rows cannot simply be appended). @since 1.1.99 */
  isRowGroupingOrTree(): boolean {
    const body = this.tableModel.getBodyModel();
    return isAreaModelTree(body) || isAreaModelRowGroups(body) || isPivotTableModel(this.tableModel);
  }

  /**
   * The clipboard service for the API ({@link TableApi.pasteText}, {@link TableApi.getSelectionAsText}): the one of
   * the option, otherwise one with the defaults that does not listen to keys or events.
   *
   * @returns {ClipboardService} the service
   * @since 1.1.99
   */
  getClipboardService(): ClipboardService {
    if (!this.clipboardService) {
      this.clipboardService = new ClipboardService(this, ClipboardOptions.create(true)!, false);
    }
    return this.clipboardService;
  }

  /** Marks values as pending (batch edit): pipe, validation, then the batch edit service. */
  private markPending(changes: CellValueChangeIf[], resolved: boolean, raw = false,
                      source: CellChangeSource = 'edit', undoable?: boolean): CellChangeIf[] {
    const cells = resolved
      ? changes.map(c => ({ rowIndex: c.rowIndex, columnIndex: c.column as number, value: c.value }))
      : this.resolveCellChanges(changes, false);
    const batch = this.batchEditService!;
    // undo (since 1.1.99): the pending state of the cells before …
    const snapshots: PendingSnapshotIf[] | undefined = this.undoService
      ? cells.map(({ rowIndex, columnIndex }) => {
        const rowKey = batch.rowKeyOf(rowIndex);
        const property = batch.propertyOf(columnIndex);
        const before = batch.getPendingEntry(rowKey, property);
        return { rowKey, property, before: before ? { ...before } : undefined };
      })
      : undefined;
    const inputs: PendingInputIf[] = cells.map(({ rowIndex, columnIndex, value }) => {
      const piped = raw ? value : this.pipeCellValue(rowIndex, columnIndex, value);
      const error = this.validateCellValue(rowIndex, columnIndex, piped);
      return { rowIndex, columnIndex, value: piped, rawValue: value, ...(error ? { error } : {}) };
    });
    const ret = batch.addPending(inputs);
    if (snapshots && ret.length) {
      // … and after: one step for the cells whose pending state changed
      for (const snapshot of snapshots) {
        const after = batch.getPendingEntry(snapshot.rowKey, snapshot.property);
        snapshot.after = after ? { ...after } : undefined;
      }
      this.undoService!.recordPending(snapshots.filter(s => (!s.before !== !s.after)
        || (!!s.before && !!s.after && !isSameCellValue(s.before.newValue, s.after.newValue))), source, undoable);
    }
    return ret;
  }

  /**
   * Column property → index, range check, editable check (not for the editor: it was opened on an editable cell).
   */
  private resolveCellChanges(changes: CellValueChangeIf[], checkEditable = true): { rowIndex: number; columnIndex: number; value: unknown }[] {
    const body = this.tableModel.getBodyModel();
    const rowCount = body.getRowCount();
    const columnCount = this.tableModel.getColumnCount();
    const columnDefs = this.tableModel.getColumnDefs?.() ?? [];
    const ret: { rowIndex: number; columnIndex: number; value: unknown }[] = [];
    for (const change of changes) {
      const columnIndex = typeof change.column === 'number'
        ? change.column
        : columnDefs.findIndex(def => def.property === change.column);
      const rowIndex = change.rowIndex;
      if (!(rowIndex >= 0 && rowIndex < rowCount && columnIndex >= 0 && columnIndex < columnCount)) {
        continue;
      }
      if (checkEditable && !body.isEditable(rowIndex, columnIndex)) {
        continue; // H5: not editable, calculated without valueSetter, group or pivot rows
      }
      ret.push({ rowIndex, columnIndex, value: change.value });
    }
    return ret;
  }

  /** The value after the column's `editInputPipe` (as `setValue` will store it). */
  private pipeCellValue(rowIndex: number, columnIndex: number, value: unknown): unknown {
    const pipe = this.tableModel.getColumnDef(columnIndex)?.editInputPipe;
    return pipe ? pipe(value, rowIndex, columnIndex) : value;
  }

  /** The message of {@link ColumnDefIf.validate} – `undefined` if valid or without validator. */
  private validateCellValue(rowIndex: number, columnIndex: number, value: unknown): string | undefined {
    const validate = this.tableModel.getColumnDef(columnIndex)?.validate;
    if (!validate) {
      return undefined;
    }
    const message = validate(value, this.rowObjectOf(rowIndex));
    return message ? String(message) : undefined;
  }

  /** The row object of a body row for events: the data of a `TreeRow`, `undefined` without objects. */
  private rowObjectOf(rowIndex: number): unknown {
    const row = this.tableModel.getBodyModel().getRowByIndex(rowIndex);
    return isTreeRow(row) ? (row as TreeRowIf<any>).data : row;
  }

  /**
   * The options of the fill handle, `undefined` if it is off ({@link TableOptionsIf.fillHandle}).
   *
   * @returns {FillHandleOptionsIf | undefined} complete options
   * @since 1.1.96
   */
  getFillHandleOptions(): FillHandleOptionsIf | undefined {
    return FillHandleOptions.create(this.tableOptions.fillHandle);
  }

  /**
   * Fills cells next to a range (fill handle, Ctrl/⌘+D, {@link TableApi.fillRange}): computes the values
   * ({@link computeFillChanges}, shown values – a batch edit's pending values count), writes them with
   * {@link applyCellChanges} and selects source and filled cells.
   *
   * @param {CellRange} source - the source range (body display indices)
   * @param {FillDirection} direction - down, up, right or left
   * @param {number} count - rows or columns to fill (clamped to the table)
   * @param {FillMode} [mode="auto"] - series or copy
   * @param {CellRange} [selectAfter] - the selection afterwards (default: source and filled cells)
   * @returns {number} the number of filled (or, in a batch edit, marked) cells; `-1` if refused (too many cells)
   * @since 1.1.96
   */
  fillRange(source: CellRange, direction: FillDirection, count: number, mode: FillMode = 'auto', selectAfter?: CellRange): number {
    const options = this.getFillHandleOptions() ?? FillHandleOptions.create(true)!;
    const body = this.tableModel.getBodyModel();
    const rowCount = body.getRowCount();
    const columnCount = this.tableModel.getColumnCount();
    const src = this.normalizeRange(source, rowCount, columnCount);
    if (!src || count < 1) {
      return 0;
    }
    const room = direction === 'down' ? rowCount - 1 - src.r2
      : direction === 'up' ? src.r1
        : direction === 'right' ? columnCount - 1 - src.c2
          : src.c1;
    const n = Math.min(count, room);
    if (n < 1) {
      return 0;
    }
    const lines = direction === 'down' || direction === 'up' ? src.c2 - src.c1 + 1 : src.r2 - src.r1 + 1;
    if (n * lines > options.maxCells) {
      this.announce(this.getEditTexts().fillTooLarge(options.maxCells));
      return -1;
    }
    const batch = this.batchEditService!;
    const changes = computeFillChanges({
      source: src, direction, count: n, mode,
      getValue: (r, c) => batch.getShownValue(r, c),
      isFillable: (r, c) => this.tableModel.getColumnWidth(c) > 0 && body.isEditable(r, c),
      fillValue: options.fillValue,
      getCellInfo: (r, c) => ({ row: this.rowObjectOf(r), property: this.tableModel.getColumnDef(c)?.property ?? '' })
    });
    const applied = this.applyCellChanges(changes, 'fill');
    const sm = this.selectionModel();
    if (sm) {
      this.holdSelectionEvents(() => {
        sm.clear();
        sm.addSelection(selectAfter ?? getFillRange(src, direction, n));
        this.onSelectionChanged(sm);
      });
    }
    this.repaint();
    this.announce(this.getEditTexts().cellsFilled(applied.length));
    return applied.length;
  }

  /** The last selected range, clamped to the body (`undefined` without one). */
  getFillSourceRange(): CellRange | undefined {
    const sm = this.selectionModel();
    if (!sm || (sm as { selectionType?: string }).selectionType !== 'range' || sm.isAllSelected()) {
      return undefined;
    }
    const ranges = sm.getRanges();
    if (!ranges.length) {
      return undefined;
    }
    return this.normalizeRange(ranges[ranges.length - 1], this.tableModel.getBodyModel().getRowCount(),
      this.tableModel.getColumnCount());
  }

  private normalizeRange(range: CellRange, rowCount: number, columnCount: number): CellRange | undefined {
    const r1 = Math.max(0, Math.min(range.r1, range.r2));
    const r2 = Math.min(rowCount - 1, Math.max(range.r1, range.r2));
    const c1 = Math.max(0, Math.min(range.c1, range.c2));
    const c2 = Math.min(columnCount - 1, Math.max(range.c1, range.c2));
    return r1 <= r2 && c1 <= c2 ? new CellRange(r1, c1, r2, c2) : undefined;
  }

  /**
   * Ctrl/⌘+D (down) and Ctrl/⌘+R (right): the first row (column) of the selected range is copied into the rest; a
   * range of one row (column) gets the cell above (left of) it – like a spreadsheet.
   *
   * @param {"down" | "right"} direction - the key
   * @returns {boolean} true if the key was used (the browser's own action – bookmark, reload – is prevented then)
   */
  private fillByKeyboard(direction: 'down' | 'right'): boolean {
    const options = this.getFillHandleOptions();
    const vertical = direction === 'down';
    if (!options || this.isEditing() || this.fillHandleService?.isFilling()
      || options.direction === (vertical ? 'horizontal' : 'vertical')) {
      return false;
    }
    const range = this.getFillSourceRange();
    if (!range) {
      return false;
    }
    const span = vertical ? range.r2 - range.r1 : range.c2 - range.c1;
    if (span > 0) {
      const src = vertical ? new CellRange(range.r1, range.c1, range.r1, range.c2) : new CellRange(range.r1, range.c1, range.r2, range.c1);
      this.fillRange(src, direction, span, 'copy');
    } else if (vertical ? range.r1 > 0 : range.c1 > 0) {
      const src = vertical
        ? new CellRange(range.r1 - 1, range.c1, range.r1 - 1, range.c2)
        : new CellRange(range.r1, range.c1 - 1, range.r2, range.c1 - 1);
      this.fillRange(src, direction, 1, 'copy', range);   // the range stays what it was (the source is not selected)
    }
    return true;
  }

  /**
   * Sets `aria-keyshortcuts` of the host (the fill handle's keyboard alternative); removed again by {@link destroy}.
   *
   * @param {string | undefined} value - e.g. `"Control+D Control+R"`; `undefined` restores the value before
   * @since 1.1.96
   */
  setHostKeyShortcuts(value: string | undefined): void {
    if (value === undefined) {
      this.restoreHostAriaAttribute('aria-keyshortcuts');   // the app's own value (or none) again
    } else {
      this.setHostAriaAttribute('aria-keyshortcuts', value);
    }
  }

  /**
   * The texts of fill and batch edit with defaults (an own {@link AriaTextsIf} implementation may lack them).
   *
   * @returns the texts
   * @since 1.1.96
   */
  getEditTexts(): Required<Pick<AriaTextsIf, 'cellsFilled' | 'fillTooLarge' | 'pendingChanges' | 'changesCommitted' |
    'changesDiscarded' | 'commitBlocked' | 'invalidValue'>> {
    const texts = this.ariaTexts as Partial<AriaTextsIf>;
    const defaults = new AriaTexts();
    return {
      cellsFilled: (n: number) => (texts.cellsFilled ?? defaults.cellsFilled).call(texts, n),
      fillTooLarge: (n: number) => (texts.fillTooLarge ?? defaults.fillTooLarge).call(texts, n),
      pendingChanges: (n: number) => (texts.pendingChanges ?? defaults.pendingChanges).call(texts, n),
      changesCommitted: (n: number) => (texts.changesCommitted ?? defaults.changesCommitted).call(texts, n),
      changesDiscarded: () => (texts.changesDiscarded ?? defaults.changesDiscarded).call(texts),
      commitBlocked: (n: number) => (texts.commitBlocked ?? defaults.commitBlocked).call(texts, n),
      invalidValue: (m: string) => (texts.invalidValue ?? defaults.invalidValue).call(texts, m)
    };
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
    try {
      this.rowDragService?.destroy(); // a running row drag: "cancel" event, ghost and marker removed
    } catch (e) {
      console.error(e);
    }
    this.fillHandleService?.destroy(); // a running fill: cancelled, handle and preview removed
    this.cellEditorService?.destroy(); // the editor above the cell (since 1.1.99)
    this.clipboardService?.destroy(); // hidden text field and cut frame (since 1.1.99)
    this.subscribers.clear();
    try {
      this.masterDetailService?.destroy(); // detail contents: renderer cleanups, nested tables destroyed
    } catch (e) {
      console.error(e);
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

  // ------------------------------------------------------------------------------- master/detail (since 1.1.97)

  /**
   * True if a DOM event comes from a detail row (master/detail) – e.g. from a nested table. The mouse, keyboard and
   * pointer handlers of this table ignore such events.
   *
   * @param {Event} evt - an event while it is dispatched
   * @returns {boolean} whether it comes from the detail layer
   * @since 1.1.97
   */
  isEventInDetail(evt: Event): boolean {
    return !!this.masterDetailService?.isInLayer(evt);
  }

  /**
   * Expands or collapses the detail row of a master row (see {@link TableApi.setDetailExpanded}).
   *
   * @param {number | object} rowOrIndex - display index or row object
   * @param {boolean} expanded - the new state
   * @param {GeDetailEventSource} [source] - what changed it
   * @returns {boolean} false if nothing changed
   * @since 1.1.97
   */
  setDetailExpanded(rowOrIndex: unknown, expanded: boolean, source: GeDetailEventSource = 'api'): boolean {
    return !!this.masterDetailService?.setExpanded(rowOrIndex, expanded, source);
  }

  /**
   * Toggles the detail row of a master row (see {@link TableApi.toggleDetail}).
   *
   * @param {number | object} rowOrIndex - display index or row object
   * @param {GeDetailEventSource} [source] - what changed it
   * @returns {boolean} false if it is no master row
   * @since 1.1.97
   */
  toggleDetail(rowOrIndex: unknown, source: GeDetailEventSource = 'api'): boolean {
    const service = this.masterDetailService;
    return !!service && service.setExpanded(rowOrIndex, !service.isExpanded(rowOrIndex), source);
  }

  /**
   * Called by {@link MasterDetailService} after detail rows were expanded or collapsed: new row positions and scroll
   * height, repaint, event, announcement, table state.
   *
   * @param {unknown} row - the master row (`undefined` for several rows)
   * @param {number} rowIndex - its display index (-1 for several rows or a row that is not shown)
   * @param {boolean} expanded - the new state
   * @param {GeDetailEventSource} source - what changed it
   * @param {boolean} [emit] - false: no event (several rows at once)
   * @param {boolean} [layoutUpdated] - true: the row layout was already updated for this one row
   * @since 1.1.97
   */
  onDetailToggled(row: unknown, rowIndex: number, expanded: boolean, source: GeDetailEventSource, emit = true,
                  layoutUpdated = false): void {
    if (!layoutUpdated) {
      this.invalidateRowLayout();
    }
    this.resetSizeOfWrapperDiv();
    this.repaint();
    if (emit) {
      this.eventListener.onDetailExpandedChanged?.(new GeDetailEvent(row, rowIndex, expanded, source));
    }
    if (source === 'mouse' || source === 'keyboard') {
      const text = expanded ? this.ariaTexts.detailExpanded?.() : this.ariaTexts.detailCollapsed?.();
      if (text) {
        this.announce(text);
      }
    }
    this.stateService.markDirty('details');
  }

  /**
   * Called by {@link MasterDetailService} after a detail row with `detailHeight: "auto"` got a new height: new scroll
   * height and repaint (the rows below move).
   *
   * @since 1.1.97
   */
  onDetailHeightChanged(): void {
    if (this.destroyed) {
      return;
    }
    this.resetSizeOfWrapperDiv();
    this.adjustAfterScrolling();
  }

  /**
   * The focus came back from a detail row (Shift+Tab): its master row gets the focus (same column).
   *
   * @param {number} rowIndex - display index of the master row
   * @since 1.1.97
   */
  /**
   * A detail row that holds the keyboard focus goes away (collapsed, destroyed, scrolled out of view): the host takes
   * the focus and the master row becomes the focused row – without a repaint (the caller repaints).
   *
   * @param {number} rowIndex - display index of the master row (-1: only the host)
   * @since 1.1.97
   */
  takeFocusFromDetail(rowIndex: number): void {
    const fm = this.focusModel();
    if (fm && rowIndex >= 0) {
      const col = fm.getFocus()[1];
      this.headerFocus = undefined;
      fm.setFocus(rowIndex, col >= 0 ? col : this.getFirstShownColumnIndex());
    }
    this.hostElement.focus({ preventScroll: true });
  }

  focusDetailMaster(rowIndex: number): void {
    const fm = this.focusModel();
    if (!fm || rowIndex < 0) {
      return;
    }
    const col = fm.getFocus()[1];
    this.setFocusCell(rowIndex, col >= 0 ? col : this.getFirstShownColumnIndex());
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
        // body: with the heights of open detail rows above (master/detail)
        ret.rowTop = ret.areaIdent === 'body' ? this.getBodyRowTop(ret.rowIndex) : am.getYPosByRowIndex(ret.rowIndex);
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
      // clientLeft: a vertical scroll bar on the left (right-to-left) – 0 in left-to-right
      const x = evt.clientX - viewportRect.left;
      const onScrollBar = evt.clientY - viewportRect.top >= this.scrollViewport.clientHeight
        || x < this.scrollViewport.clientLeft
        || x >= this.scrollViewport.clientLeft + this.scrollViewport.clientWidth;
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
    this.fillHandleService?.update(); // the handle follows the selected range (scroll, selection, editor)
    this.cellEditorService?.update(); // the editor follows its cell (Excel-style editing, since 1.1.99)
    this.clipboardService?.update(); // the frame of cut cells (since 1.1.99)
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
      this.scrollViewport.scrollTo(toPhysicalScrollLeft(px, this.isRtl()), scrollTop);
      this.pendingContentScroll = { scrollTop: this.scrollViewport.scrollTop, contentTop };
      this.adjustAfterScrolling(); // render the exact position now (a scroll event may not fire)
      return;
    }
    this.scrollViewport.scrollTo(toPhysicalScrollLeft(px, this.isRtl()), py);
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
    const py = this.getBodyRowTop(indexY); // with the heights of open detail rows above (master/detail)
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
      return this.getViewportScrollLeft(); // fixed east column (always visible), -1, NaN or out of range
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
          this.afterActiveCellMoved(newRowIdx, newColIdx);
          this.repaint();
        } else if (this.editingOptions?.collapseSelectionOnNavigate) {
          this.afterActiveCellMoved(newRowIdx, newColIdx); // at the edge: an arrow key still ends a range (Excel)
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
    // right-to-left: the handle is on the left edge – dragging to the left makes the column wider
    const dx = this.isRtl() ? -mouseEvent.draggingX : mouseEvent.draggingX;
    this.tableModel.setColumnWidth(this.mouseStartColumnIndex, this.mouseStartWidth + dx);
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
    if (this.hasBodyRowExtras()) {
      // open detail rows (master/detail): rows have no common height – compare pixels (a detail may fill the body)
      const top = this.getBodyRowTop(rowIndex);
      const bottom = top + this.tableModel.getRowHeight('body', rowIndex);
      const viewTop = this.contentScrollTop;
      const viewHeight = this.areaBodyCenterGeo.height;
      if (top < viewTop) {
        this.scrollToPixel(this.getViewportScrollLeft(), top);
        return true;
      }
      if (bottom > viewTop + viewHeight) {
        this.scrollToPixel(this.getViewportScrollLeft(), bottom - viewHeight);
        return true;
      }
      return false;
    }
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
    const offset = Math.min(1, Math.max(0, this.getViewportScrollLeft() / scrollerRange)) * contentRange;
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
    this.setViewportScrollLeft(target === left ? Math.floor(scrollLeft) : Math.ceil(scrollLeft));
    this.adjustAfterScrolling(); // render the new position now (a scroll event may not fire)
    return true;
  }


}


