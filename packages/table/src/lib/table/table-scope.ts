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
import { StoreStateScrollPosService } from './service/store-state-scroll-pos.service';
import { StoreStateCollapsedExpandService } from './service/store-state-collapsed-expand.service';
import { StoreStateSortingService } from './service/store-state-sorting.service';
import { RenderScope } from './render-scope';
import { SortItem } from './data/common/sort-item';
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
import { isAreaModelTree } from './instanceof-workaround';
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

  public storeStateCollapsedExpandService?: StoreStateCollapsedExpandService;
  public storeSortingService?: StoreStateSortingService;

  protected selectionService: SelectionService = new SelectionService(this);
  protected keyEvent?: GeKeyEvent;
  private api = new TableApi(this);

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

    if (!eventListener) {
      this.eventListener = new EventAdapter();
    }
    if (this.tableOptions?.autoRestoreOptions) {
      const autoRestoreOptions = this.tableOptions.autoRestoreOptions;
      const keyFn = autoRestoreOptions.getStorageKeyFn;
      if (keyFn) {
        if (autoRestoreOptions.autoRestoreScrollPosition) {
          this.storeScrollPosStateService = new StoreStateScrollPosService(keyFn);
        }
        if (autoRestoreOptions.autoRestoreCollapsedExpandedState) {
          this.storeStateCollapsedExpandService = new StoreStateCollapsedExpandService(keyFn);
        }
        if (autoRestoreOptions.autoRestoreSortingState) {
          this.storeSortingService = new StoreStateSortingService(keyFn);
        }
      }
    }
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
        .then(txt => this.copyService.copyContent(txt))
        .catch(reason => console.warn('GuiExpert Table – copy to clipboard failed:', reason));
    }
    return false;
  }

  updateModelValueAfterEdit(areaIdent: AreaIdent, rowIndex: number, columnIndex: number, value: string) {
    if (areaIdent === 'body') {
      const bodyAreaModel = this.tableModel.getAreaModel(areaIdent);
      const ok: boolean = bodyAreaModel.setValue(rowIndex, columnIndex, value);
      if (ok) {
        this.resetEditorRenderer();
        this.repaint();
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
    this.tableModel.init();
    if (this.tableOptions?.externalFilterFunction) {
      this.externalFilterChanged(false);
    }
    this.autoRestoreCollapsedExpandedState();
    this.autoRestoreSortingState();
    this.resetSizeOfWrapperDiv();
    this.adjustContainersAndRows();
    this.autoRestoreScrollPosition();

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
    this.destroyed = true;
    this.listenerAbortController.abort();
    this.resizeHandler.disconnect();
    const sm = this.getSelectionModel ? this.getSelectionModel() : undefined;
    sm?.removeEventSelectionChangedListener(this);
    const fm = this.getFocusModel ? this.getFocusModel() : undefined;
    fm?.removeEventFocusChangedListener(this);
    this.disposeRendering();
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
      const target = mouseEvent.target as HTMLElement;
      [ret.areaIdent, ret.sideIdent] = this.getAreaAndSideIdentByAttr(target);
      ret.rowIndex = this.getNumberByAttr(target, 'data-row-index');
      ret.columnIndex = this.getNumberByAttr(target, 'data-col-index');
      ret.action = this.getStringByAttr(target, 'data-ge-action');

      // const bodyY = mouseEvent.clientY - this.hostElement.offsetTop - this.areaHeaderCenter.parent.clientHeight;
      // const bodyX = mouseEvent.clientX - this.hostElement.offsetLeft - this.areaBodyWestGeo.width;

      if (ret.areaIdent) {
        const am = this.tableModel.getAreaModel(ret.areaIdent);
        ret.rowTop = am.getYPosByRowIndex(ret.rowIndex);
      }
      ret.columnLeft = this.tableModel.getXPosByColumnIndex(ret.columnIndex);

      if (mouseEvent.ctrlKey && mouseEvent.altKey) {
        const bodyY = mouseEvent.clientY - this.hostElement.offsetTop - this.areaHeaderCenter.parent.clientHeight;
        const bodyX = mouseEvent.clientX - this.hostElement.offsetLeft - this.areaBodyWestGeo.width;
        this.debugOnce(bodyX, bodyY);
      }
    }
    return ret;
  }

  /**
   * Handles the mouse down event.
   *
   * @param {GeMouseEvent} mouseEvent - The mouse event object.
   * @return {void}
   */
  onMouseDown(mouseEvent: GeMouseEvent) {
    this.selectionService.onMouseDown();
    if (mouseEvent.columnIndex > -1 && mouseEvent.action && ['resize-column', 'drag-column'].includes(mouseEvent.action)) {

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

      this.draggingTargetColumnIndex = mouseEvent.columnIndex;
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
        this.adjustDraggingColumn(mouseEvent, startMouseEvent.columnIndex, this.firstDraggingRendering);
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

    } else if (this.mouseStartAction === 'drag-column') {
      this.hideDraggingColumn();
      this.repaint();
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
      this.repaintHard(); // the row count changed → recalc the scroll height, not only the visible rows
      this.storeStateCollapsedExpandService?.collapsedStateAll(expand);
    }
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
    this.eventListener.onCheckboxChanged?.(selectedRows ? selectedRows : []);
  }

  /**
   * Handle mouse click events.
   *
   * @param {GeMouseEvent} evt - The mouse click event.
   * @param {GeMouseEvent | undefined} previousEvt - The previous mouse click event, if any.
   * @returns {void}
   */
  onMouseClicked(evt: GeMouseEvent, previousEvt: GeMouseEvent | undefined): boolean {
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

  onSelectionChanged(sm: SelectionModelIf) {
    this.eventListener.onSelectionChanged?.(sm);
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
      this.scrollViewport.scrollTo(0, 0);
      this.tableModel.recalcHeightAndPadding();
      this.resetSizeOfWrapperDiv();
      this.repaint();
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
      this.lastSortCompareFn = undefined;
      this.tableModel.getColumnDefs()?.forEach(cd => cd.sortState = '');
      colDef.sortState = newState;
    }
    this.repaint();
    this.storeSortingService?.setSortItems([sortItem]);
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
    if (this.isScrollHeightCapped()) {
      // py is a content position; the (capped) scroll bar is scaled
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
    // this.repaint();
    this.firstInit();

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
        const newColIdx = Math.min(Math.max(colIdx + dx, 0), columnCount - 1);
        if (newRowIdx !== rowIdx || newColIdx !== colIdx) {
          fm.setFocus(newRowIdx, newColIdx);
          this.ensureRowIsVisible(newRowIdx);
          this.repaint();
        }
        return true;
      }
    }
    return false;
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

  private debugOnce(bodyX: number, bodyY: number) {
    console.clear();
    console.info('this.hostElement.offsetTop', this.hostElement.offsetTop); // pageY of table tag
    console.info('this.hostElement.scrollHeight', this.hostElement.scrollHeight); // height of visible scroll area
    console.info('this.scrollViewportTop', this.scrollTop); // amount of px scrolled to top (initial : 0)
    console.info('this.areaHeaderCenter.parent.clientHeight', this.areaHeaderCenter.parent.clientHeight);
    console.info('bodyY', bodyY);
    console.info('bodyX', bodyX);
    console.info('rows', this.firstVisibleRowIndex);
    console.info('');
    console.info('this.tableModel', this.tableModel);
    console.info('');
    console.info('this.mouseMoveEvent.clientX', this.mouseHandler.mouseEvent?.clientX);
    console.info('this.hostElement.offsetLeft', this.hostElement.offsetLeft);
    console.info('this.areaBodyWestGeo.width', this.areaBodyWestGeo.width);
  }

  /**
   * Restores the scroll position of the table if auto restore options are enabled.
   *
   *
   * @returns {void}
   */
  private autoRestoreScrollPosition() {
    if (this.tableOptions?.autoRestoreOptions && this.storeScrollPosStateService) {
      const autoRestoreOptions = this.tableOptions.autoRestoreOptions;
      if (autoRestoreOptions.autoRestoreScrollPosition) {
        const scrollOffset = this.storeScrollPosStateService.getScrollOffset();
        if (scrollOffset) {
          this.scrollViewport.scrollTo(...scrollOffset);
        }
      }
    }
  }

  /**
   * Automatically restores the sorting state of the table.
   *
   * @private
   * @function autoRestoreSortingState
   * @memberof ClassName
   *
   * @description
   * This method checks if the autoRestoreSortingState option is enabled in the tableOptions.
   * If enabled, it uses the storeSortingService to retrieve the sort items array.
   * If there are sort items present, it applies them to the table's body model using the doSort method.
   *
   * @returns {void}
   */
  private autoRestoreSortingState() {
    if (this.tableOptions?.autoRestoreOptions?.autoRestoreSortingState && this.storeSortingService) {
      const sortItems = this.storeSortingService.getSortItems();
      if (sortItems?.length) {
        const areaModel = this.tableModel.getBodyModel();
        areaModel.doSort(sortItems);
        // the header icons must show the restored order (not the sortState of the column definitions)
        const columnDefs = this.tableModel.getColumnDefs();
        if (columnDefs) {
          columnDefs.forEach(cd => cd.sortState = '');
          sortItems.forEach(item => {
            const cd = columnDefs[item.columnIndex];
            if (cd) cd.sortState = item.sortState;
          });
        }
      }
    }
  }

  /**
   * Restores the collapsed/expanded state of the rows in the table based on the autoRestoreOptions
   * specified in the tableOptions. This method is private and should not be called directly.
   *
   * @private
   */
  private autoRestoreCollapsedExpandedState() {
    const service = this.storeStateCollapsedExpandService;
    const autoRestoreOptions = this.tableOptions?.autoRestoreOptions;
    const getRowId = autoRestoreOptions?.getRowId;
    if (!service || !getRowId || !autoRestoreOptions?.autoRestoreCollapsedExpandedState) return;
    if (!service.hasStoredState()) return; // nothing stored yet → keep the initial state of the rows

    const areaModel = this.tableModel.getAreaModel('body');
    if (isAreaModelTree(areaModel)) {
      const amtr: AreaModelTree<any> = areaModel as AreaModelTree<any>;
      const state = service.collapsedExpandedStateGet();
      // walk ALL rows (not only the visible ones) – otherwise nested rows of collapsed parents are never restored
      const restore = (rows: TreeRowIf<any>[] | undefined) => rows?.forEach(row => {
        if (state.allExpanded) {
          row.expanded = true;
        } else if (state.allCollapsed) {
          row.expanded = false;
        } else {
          const included = service.collapsedExpandedStateIncludes(getRowId(row.data));
          row.expanded = state.mode === 'expanded' ? included : !included;
        }
        restore(row.children);
      });
      restore(amtr.rows);
      amtr.recalcVisibleTreeRows();
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
    this.recalcWrappers(); // area heights → scroll viewport and body height, repaint
  }

  autoResizeColumns(recalcWrappers: boolean= true) {
    // Resize columns
    const columnWidthes = this.calcAutoColumnWidths();
    for (let i = 0; i < columnWidthes.length; i++) {
      const columnWidth = columnWidthes[i];
      this.tableModel.setColumnWidth(i, columnWidth);
    }
    if (recalcWrappers) this.recalcWrappers();
  }

  recalcWrappers(){
    this.tableModel.recalcPadding();
    this.resetSizeOfWrapperDiv();
    this.adjustContainersAndRows();
  }

  reSort() {
    let sortItems = this.storeSortingService?.getSortItems()??[];
    this.tableModel.doSort(sortItems);
    this.repaint();
  }

  sort(compareFn: (a: any, b: any) => number) {
    this.tableModel.sort(compareFn);
    this.lastSortCompareFn = compareFn;
    this.tableModel.getColumnDefs()?.forEach(cd => cd.sortState = ''); // the header icons no longer apply
    this.repaint(); // without it the new order only appeared after the next scroll
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


}


