import { TableScope } from "./table-scope";
import { TreeRow } from "./data/common/tree-row";
import { AreaIdent, getAreaIdentByString } from "./data/tablemodel/area-ident.type";
import { GeMouseEvent } from "./data/common/event/ge-mouse-event";
import { MouseTargetData } from "./data/event/mouse-target-data";
import {TreeRowIf} from "./data/common/tree-row-if";
import {isTreeRow} from "./instanceof-workaround";
import { SideIdent } from "./data/side-ident.type";
import type { RowIndexShift } from "./live-append/row-index-shift";

/**
 * The cell pressed by the last mousedown (prompt 018): if a render replaces its element before the mouseup, the
 * browser sends no "click" – the handler reports the click for this cell itself.
 */
interface PressedCell {
  /** the pressed element (detached after a render) */
  target: Element;
  areaIdent: AreaIdent;
  sideIdent?: SideIdent;
  rowIdx: number;
  colIdx: number;
  action: string | null;
  /** the row object at the time of the mousedown (body) – it is followed when rows are added or removed */
  row: unknown;
  /** true if the area model returns the same object for a row each time (only then the row is followed) */
  stableRow: boolean;
  clientX: number;
  clientY: number;
}

/** A cell given explicitly instead of being read from the event target (the target was replaced by a render). */
interface ClickCell {
  areaIdent: AreaIdent;
  sideIdent?: SideIdent;
  rowIdx: number;
  colIdx: number;
  action: string | null;
}

/**
 * Class representing a MouseHandler.
 * @class
 *
 * @category Internals
 */
export class MouseHandler {


  /**
   * Programmatic clicks (`element.click()`, `event.detail === 0`): two clicks on the same cell within this delay (ms)
   * count as a double click. Real mouse clicks use the click count of the browser (`event.detail`), i.e. the
   * double-click speed of the operating system.
   *
   * @type {number}
   */
  doubleClickDelay = 500;

  /**
   * A render between mousedown and mouseup replaces the pressed cell, and the browser sends no "click" (both must hit
   * the same element). The handler then reports the click itself for the pressed cell – if the mouse moved at most
   * this many pixels (screen coordinates) between mousedown and mouseup. Since 1.1.108.
   *
   * @type {number}
   */
  clickMoveTolerance = 4;

  mouseEvent?: MouseEvent;
  startMouseEvent?: GeMouseEvent;
  geMouseEvent?: GeMouseEvent;
  geMouseEventOld?: GeMouseEvent;

  private lastClickedCellKey = '';
  /** The cell of the last left-button mousedown (see {@link PressedCell}). */
  private pressedCell?: PressedCell;
  /** Counts native "click" / "dblclick" events: a report of a lost click is dropped if the browser sent one after all. */
  private nativeClickCount = 0;
  private nativeDblClickCount = 0;
  /** Timer of a pending report of a lost click (cleared by destroy via the abort signal). */
  private lostClickTimer?: ReturnType<typeof setTimeout>;
  /** The second click of a double click that was already reported (clickCount 2) – its "dblclick" is not. */
  private reportedDoubleClick?: { time: number; cellKey: string };
  private mouseDown = false;
  private repaintAfterMouseUp = false;
  private dragging = false;
  /** Counts the drags: a frame callback of a drag that is over (a new one started) does nothing. */
  private dragGeneration = 0;
  /** The end of the last drag, until its frame ran – a new mousedown handles it at once (see {@link flushDraggingEnd}). */
  private pendingDraggingEnd?: { evt: MouseEvent; start?: GeMouseEvent; frameId: number };

  constructor(
    protected tableScope: TableScope
  ) {
    // All listeners are removed at once by TableScope.destroy() (abort signal).
    const signal = this.tableScope.listenerAbortController.signal;
    this.tableScope.hostElement.addEventListener("click", this.onHostElementClicked.bind(this), { signal });
    this.tableScope.hostElement.addEventListener("dblclick", this.onHostElementDblClicked.bind(this), { signal });
    this.tableScope.hostElement.addEventListener("mousedown", this.onMouseDown.bind(this), { signal });
    this.tableScope.hostElement.addEventListener("mousemove", this.onMouseMove.bind(this), { signal });
    this.tableScope.hostElement.addEventListener("mouseup", this.onMouseUp.bind(this), { signal });
    this.tableScope.hostElement.addEventListener("contextmenu", this.onContextmenu.bind(this), { signal });
    signal.addEventListener("abort", () => clearTimeout(this.lostClickTimer));

    // @ts-ignore
    this.tableScope.hostElement['_MouseHandler'] = 'true';

    this.tableScope.scrollViewport.addEventListener("scroll", () => this.tableScope.onViewportScroll(), { signal });
    this.tableScope.scrollViewport.addEventListener("wheel", this.tableScope.onWheel.bind(this.tableScope), { passive: false, signal });

    [window, this.tableScope.hostElement].forEach(
      ele => ele.addEventListener("resize", this.tableScope.adjustContainersAndRows.bind(this.tableScope), { signal })
    );
  }


  /**
   * Handles the "contextmenu" event.
   *
   * @private
   * @param {MouseEvent} evt - The mouse event object.
   * @return {void}
   */
  private onContextmenu(evt: MouseEvent) {
    if (this.isBlocked(evt)) {
      return;
    }
    if (!(evt instanceof MouseEvent)) {
      // a "contextmenu" CustomEvent of a wrapper (Solid dispatches its events on the host div) – no right click;
      // before, it was taken for a second right click within 50 ms and stopped (it never reached the listeners)
      return;
    }
    // Ctrl+click on macOS opens the context menu – the browser sends no click, so neither must the lost-click report
    this.pressedCell = undefined;
    this.mouseEvent = evt;
    const mouseMoveEvent = this.tableScope.createGeMouseEvent(this.mouseEvent);
    this.tableScope.contextmenu(mouseMoveEvent);
  };

  private lastClicked = 0;
  /**
   * Handles the click event on the host element.
   *
   * @param {MouseEvent} event - The click event.
   *
   * @return {void}
   */
  private onHostElementClicked(event: MouseEvent) {
    this.nativeClickCount++;
    if (this.isBlocked(event)) {
      return;
    }
    this.handleClick(event, this.tableScope.getMouseEventTarget(event)); // a footer cell below the scroll viewport
  }

  /**
   * Handles a click: on `eventTarget`, or – if `cell` is given – on that cell (a click the browser did not send
   * because a render replaced the pressed element; `eventTarget` is then the detached pressed element).
   */
  private handleClick(event: MouseEvent, eventTarget: EventTarget | null, cell?: ClickCell) {
    const now = Date.now();
    const cellKey = cell ? this.toCellKey(cell) : this.getCellKey(eventTarget);
    // The second click of a double click: the browser counts the clicks (event.detail, OS double-click speed).
    // Programmatic clicks (element.click(), detail 0): two clicks on the SAME cell within doubleClickDelay.
    const secondClick = event.detail >= 2
      || (event.detail === 0 && now - this.lastClicked < this.doubleClickDelay && cellKey === this.lastClickedCellKey);
    this.lastClicked = now;
    this.lastClickedCellKey = cellKey;

    const mouseTargetData: MouseTargetData = new MouseTargetData(eventTarget, this.tableScope);
    if (cell) {
      this.applyCell(mouseTargetData, cell);
    }
    const geMouseEvent = cell ? this.createCellEvent(event, cell) : undefined;
    if (secondClick) {
      this.reportedDoubleClick = { time: now, cellKey };
    }
    if (secondClick && !this.isClickAction(mouseTargetData)) {
      // reported with clickCount 2 – focus and selection were handled by the first click; the "dblclick" event that
      // follows sorts / edits / toggles and is not reported again (a double click arrived three times before, and a
      // Ctrl+double click toggled the selection on/off/on).
      // A click on a checkbox, an arrow or a toggle icon always does its job: two quick clicks = two toggles.
      this.publishGeMouseEvent(event, 2, geMouseEvent, eventTarget);
      return;
    }

    if (mouseTargetData.action === 'toggleExpandCollapseAll') {
      this.tableScope.toggleExpandCollapseAll(!this.tableScope.allExpanded);
      event.preventDefault();
      event.stopPropagation();

    } else if (mouseTargetData.action === 'toggle-detail') {
      // the expand icon of a master row (master/detail, since 1.1.97)
      this.tableScope.toggleDetail(mouseTargetData.rowIdx, 'mouse');
      event.preventDefault();
      event.stopPropagation();

    } else if (mouseTargetData.action === 'toggleHeaderGroup'){
      this.tableScope.toggleHeaderGroup(mouseTargetData);
      event.preventDefault();
      event.stopPropagation();

    } else if (mouseTargetData.inputType === 'checkbox' && mouseTargetData.areaIdent){
      this.tableScope.toggleRowCheckbox(mouseTargetData.rowIdx, mouseTargetData.colIdx, mouseTargetData.areaIdent);
      event.preventDefault();
      event.stopPropagation();

    } else if (isTreeRow(mouseTargetData.row) && mouseTargetData.areaModel) {
      const altClickOnFirstCol = mouseTargetData.colIdx === this.getArrowColumnIndex() && event.altKey;
      const clickOnArrow = mouseTargetData.className.includes("ge-table-tree-arrow-div");

      if (altClickOnFirstCol || clickOnArrow) {
        // toggle collapsed/expanded:
        event.preventDefault();
        event.stopPropagation();
        const tr: TreeRowIf<any> = mouseTargetData.row as TreeRow<any>;
        this.tableScope.setTreeRowExpanded(tr, !tr.expanded);
      }
    }

    if (mouseTargetData.areaIdent === "body") {
      // fires onFocusChanged once, and only if the focus moves (a clear() before it fired twice per click)
      this.tableScope.focusModel()?.setFocus(mouseTargetData.rowIdx, mouseTargetData.colIdx);
    }

    this.publishGeMouseEvent(event, secondClick ? 2 : 1, geMouseEvent, eventTarget);
  };

  /** "area:row:column" of a cell given explicitly (same format as {@link getCellKey}). */
  private toCellKey(cell: ClickCell): string {
    return cell.areaIdent + ':' + cell.rowIdx + ':' + cell.colIdx;
  }

  /** Target data of a replaced element: area, row and column come from the pressed cell (current row index). */
  private applyCell(mouseTargetData: MouseTargetData, cell: ClickCell) {
    mouseTargetData.areaIdent = cell.areaIdent;
    mouseTargetData.areaModel = this.tableScope.tableModel.getAreaModel(cell.areaIdent);
    mouseTargetData.rowIdx = cell.rowIdx;
    mouseTargetData.colIdx = cell.colIdx;
    mouseTargetData.row = mouseTargetData.areaModel.getRowByIndex(cell.rowIdx);
  }

  private createCellEvent(event: MouseEvent, cell: ClickCell): GeMouseEvent {
    return this.tableScope.createGeMouseEventForCell(event, {
      areaIdent: cell.areaIdent,
      sideIdent: cell.sideIdent,
      rowIndex: cell.rowIdx,
      columnIndex: cell.colIdx,
      action: cell.action,
    });
  }

  /** "area:row:column" of the cell of an event target ('' outside of a cell). */
  private getCellKey(eventTarget: EventTarget | null): string {
    const target = eventTarget instanceof Element ? eventTarget : null;
    return target?.closest?.('[data-col-index]')
      ? ['data-area', 'data-row-index', 'data-col-index']
        .map(key => target.closest('[' + key + ']')?.getAttribute(key) ?? '').join(':')
      : '';
  }

  /** A click that triggers an action on its own: row checkbox, tree arrow, "expand/collapse all", header group toggle. */
  private isClickAction(mouseTargetData: MouseTargetData): boolean {
    return mouseTargetData.action === 'toggleExpandCollapseAll'
      || mouseTargetData.action === 'toggleHeaderGroup'
      || mouseTargetData.action === 'toggle-detail'
      || (mouseTargetData.inputType === 'checkbox' && !!mouseTargetData.areaIdent)
      || mouseTargetData.className.includes('ge-table-tree-arrow-div');
  }


  /**
   * Handles the double click event on the host element.
   * This method is private.
   *
   * @param {MouseEvent} event - The double click event.
   */
  private onHostElementDblClicked(event: MouseEvent) {
    this.nativeDblClickCount++;
    if (this.isBlocked(event)) {
      return;
    }
    this.handleDblClick(event, this.tableScope.getMouseEventTarget(event));
  }

  /** Handles a double click on `eventTarget`, or on `cell` (see {@link handleClick}). */
  private handleDblClick(event: MouseEvent, eventTarget: EventTarget | null, cell?: ClickCell) {
    this.lastClicked = Date.now();
    // created BEFORE sorting/editing: they repaint, the target element is detached afterwards (area/side unknown)
    const geMouseEvent = cell ? this.createCellEvent(event, cell) : this.tableScope.createGeMouseEvent(event);
    const targetData = new MouseTargetData(eventTarget, this.tableScope);

    if (eventTarget instanceof HTMLElement && !this.isClickAction(targetData)) {
      // the target may be an element inside the cell (renderer, component) → look up the cell attributes
      const target = (eventTarget.closest("[data-col-index]") ?? eventTarget) as HTMLElement;
      const area = cell ? cell.areaIdent : target.closest("[data-area]")?.getAttribute("data-area") ?? null;
      const areaIdent: AreaIdent = getAreaIdentByString(area);
      const rowIdx = cell ? cell.rowIdx : Number(target.closest("[data-row-index]")?.getAttribute("data-row-index"));
      const colIdx = cell ? cell.colIdx : Number(target.getAttribute("data-col-index"));
      const areaModel = this.tableScope.tableModel.getAreaModel(areaIdent);

      if (area && areaIdent === "header") {
        const letters = (areaModel as { isColumnLetterRow?: (r: number) => boolean }).isColumnLetterRow?.(rowIdx);
        if (this.tableScope.tableModel.isSortable(colIdx) && !letters) { // a column letter selects, it doesn't sort
          this.tableScope.clearSelection();
          this.tableScope.onHeaderDblClicked(event, rowIdx, colIdx);
        }

      } else if (cell || target.getAttribute("data-row-index")) {
        const row = areaModel.getRowByIndex(rowIdx);

        if (area && areaIdent === "body") {
          if (areaModel.isEditable(rowIdx, colIdx)) {
            // the editor above the cell (Excel-style editing, since 1.1.99) or inside it (clears the selection)
            this.tableScope.startEditing(rowIdx, colIdx, "edit");
          }
        }

        if (isTreeRow(row)) {
          if (colIdx === this.getArrowColumnIndex()) {
            // toggle collapsed/expanded:
            event.preventDefault();
            event.stopPropagation();
            const tr: TreeRowIf<any> = row as TreeRow<any>;
            this.tableScope.setTreeRowExpanded(tr, !tr.expanded);
          }
        }
      }
    }

    // usually already reported by its second click (clickCount 2) – only a "dblclick" without one is reported here
    const reported = this.reportedDoubleClick;
    const cellKey = cell ? this.toCellKey(cell) : this.getCellKey(eventTarget);
    if (!reported || Date.now() - reported.time > this.doubleClickDelay || reported.cellKey !== cellKey) {
      this.publishGeMouseEvent(event, 2, geMouseEvent);
    }
    this.reportedDoubleClick = undefined;
  };


  /**
   * Publishes a GeMouseEvent.
   *
   * @param {MouseEvent} event - The MouseEvent to publish.
   * @param {number} clickCount - The number of clicks for the GeMouseEvent.
   *
   * @return {void}
   */
  private publishGeMouseEvent(event: MouseEvent, clickCount: number, geMouseEvent?: GeMouseEvent,
                              target: EventTarget | null = event.target) {
    this.mouseEvent = event;
    this.geMouseEventOld = this.geMouseEvent?.clone();
    this.geMouseEvent = geMouseEvent ?? this.tableScope.createGeMouseEvent(event);
    if (this.geMouseEvent) {
      this.geMouseEvent.clickCount = clickCount;
    }

    const dirty = this.tableScope.onMouseClicked(this.geMouseEvent, this.geMouseEventOld);
    this.tableScope.publishGeMouseEvent(this.geMouseEvent);
    if (dirty && !this.isInteractiveCellElement(target)) {
      // paint the new focus and selection (before, a click only became visible with the next scroll).
      // Deferred: a synchronous repaint replaces the clicked cell, and the browser then sends the following
      // "dblclick" to the detached element – double-click editing would no longer work.
      this.tableScope.debounceRepaint();
    }
  }


  /**
   * True if the click went to a form control, button, link or editable element inside the table (e.g. rendered by
   * a custom cell renderer or the cell editor). Such a click must not repaint: the repaint re-creates the cells,
   * the element would lose the focus and the user's input.
   */
  private isInteractiveCellElement(target: EventTarget | null): boolean {
    const element = target instanceof Element ? target : null;
    const interactive = element?.closest(
      'input, select, textarea, button, a[href], [contenteditable]:not([contenteditable="false"])');
    return !!interactive && this.tableScope.hostElement.contains(interactive);
  }

  private getArrowColumnIndex(): number {
    const rowCheckboxVisible = this.tableScope.tableModel.isRowCheckboxVisible();
    // behind a RowNumberColumnDef (since 1.1.93) the arrow sits one column further right
    return this.tableScope.getFirstDataColumnIndex() + (rowCheckboxVisible ? 1 : 0);
  }


  private onMouseDown(evt: MouseEvent) {
    if (this.isBlocked(evt)) {
      return;
    }
    // A click repaint must not happen between mousedown and mouseup/click/dblclick: it would replace the pressed cell
    // element, and the browser would not see a click (or double click) on it. Hold it back until mouseup.
    if (this.tableScope.cancelPendingRepaint()) {
      this.repaintAfterMouseUp = true;
    }
    // A render through the API (live data: repaint/repaintHard/scrollToPixel) can't be held back like the own repaint
    // above – remember the pressed cell, the click is reported for it should the browser send none (see onMouseUp).
    this.pressedCell = evt.button === 0 ? this.readPressedCell(evt) : undefined;

    if (!this.dragging) {
      this.mouseEvent = evt;
      // read the pressed cell first: handling the end of the previous drag repaints and replaces the elements
      this.startMouseEvent = this.tableScope.createGeMouseEvent(this.mouseEvent);
      // The end of the previous drag must be handled before this one starts: its frame may come later on a busy
      // machine and would reset the start of this drag (before 1.1.106 a quick second column resize was lost).
      this.flushDraggingEnd();
      this.tableScope.onMouseDown(this.startMouseEvent);
      this.mouseDown = true;
      // a mouseup outside the host (an app menu under the pointer, a drag out of the table) must end the press too –
      // otherwise isButtonDown() stays true and live data stops following (review of 019)
      const signal = this.tableScope.listenerAbortController.signal;
      document.addEventListener('mouseup', e => this.onDocumentMouseUp(e), { once: true, signal });
    }
  }

  /** A mouseup that did not reach the host (released outside the table). */
  private onDocumentMouseUp(evt: MouseEvent) {
    if (this.mouseDown && !this.tableScope.hostElement.contains(evt.target as Node | null)) {
      this.onMouseUp(evt);
    }
  }

  /**
   * Live data (since 1.1.108): a drag in progress (range selection) keeps its start row when rows were removed at the
   * start or inserted.
   *
   * @param {RowIndexShift} shift - how the display indices move
   */
  adjustForRowChanges(shift: RowIndexShift): void {
    const start = this.startMouseEvent;
    if (this.mouseDown && start && start.areaIdent === 'body' && start.rowIndex >= 0) {
      start.rowIndex = Math.max(0, shift.mapIndexOrNext(start.rowIndex));
    }
  }


  private onMouseMove(evt: MouseEvent) {
    if (!this.mouseDown && this.tableScope.isEventInDetail?.(evt)) {
      this.tableScope.hideHover?.(); // over a detail row (master/detail): no stale hover of the master row
      return;
    }
    if (!this.mouseDown && this.isBlocked(evt)) {
      return; // no hover under a loading overlay; a running drag (started in the header) keeps following the mouse
    }
    this.mouseEvent = evt;
    if (this.mouseDown) {
      if (!this.dragging) {
        this.dragging = true;
        this.tableScope.setDragging(true);
      }
      const generation = this.dragGeneration;
      requestAnimationFrame(() => {
        if (generation === this.dragGeneration) this.mouseDraggingOnFrame();
      });
    } else {
      requestAnimationFrame(this.mouseMoveOnFrame.bind(this));
    }
  }


  private onMouseUp(evt: MouseEvent) {
    const pressed = this.pressedCell;
    this.pressedCell = undefined;
    if (!this.mouseDown && this.tableScope.isEventInDetail?.(evt)) {
      return; // a click in a detail row (master/detail)
    }
    this.mouseEvent = evt;
    if (pressed && evt.button === 0) {
      this.checkLostClick(pressed, evt);
    }
    if (this.repaintAfterMouseUp) {
      // deferred: "click" and "dblclick" of this mouseup are dispatched first
      this.repaintAfterMouseUp = false;
      this.tableScope.debounceRepaint();
    }
    if (this.dragging) {
      // the end with its own events: a new drag may change mouseEvent / startMouseEvent before the frame runs
      const pending = { evt, start: this.startMouseEvent, frameId: 0 };
      pending.frameId = requestAnimationFrame(() => this.flushDraggingEnd());
      this.pendingDraggingEnd = pending;
    }
    this.mouseDown = false;
    this.dragging = false;
    this.tableScope.setDragging(false);
  }


  /** The cell under a mousedown, or undefined outside of a cell. */
  private readPressedCell(evt: MouseEvent): PressedCell | undefined {
    const eventTarget = this.tableScope.getMouseEventTarget(evt);
    const target = eventTarget instanceof Element ? eventTarget : null;
    const cellElement = target?.closest?.('[data-col-index]');
    const areaIdent = cellElement?.closest('[data-area]')?.getAttribute('data-area');
    const rowAttr = cellElement?.closest('[data-row-index]')?.getAttribute('data-row-index');
    if (!target || !cellElement || !areaIdent || rowAttr === null || rowAttr === undefined) {
      return undefined;
    }
    const geMouseEvent = this.tableScope.createGeMouseEvent(evt);
    const rowIdx = Number(rowAttr);
    const colIdx = Number(cellElement.getAttribute('data-col-index'));
    const area = getAreaIdentByString(areaIdent);
    let row: unknown;
    let stableRow = false;
    if (area === 'body') {
      const areaModel = this.tableScope.tableModel.getBodyModel();
      row = this.rowAt(areaModel, rowIdx);
      // only a model that returns the same object each time can be followed (a model may create rows on the fly)
      stableRow = typeof row === 'object' && row !== null && this.rowAt(areaModel, rowIdx) === row;
    }
    return {
      target, areaIdent: area, sideIdent: geMouseEvent.sideIdent, rowIdx, colIdx, action: geMouseEvent.action,
      row, stableRow, clientX: evt.clientX, clientY: evt.clientY,
    };
  }

  /**
   * After a mouseup: if a render replaced the pressed element, the browser sends no "click" (nor "dblclick"). Then the
   * click is reported for the pressed cell – once this task is through and only if no native click came after all.
   */
  private checkLostClick(pressed: PressedCell, evt: MouseEvent) {
    if (pressed.target.isConnected) {
      return; // the element is still there: the browser decides (as always)
    }
    const dx = evt.clientX - pressed.clientX;
    const dy = evt.clientY - pressed.clientY;
    if (dx * dx + dy * dy > this.clickMoveTolerance * this.clickMoveTolerance) {
      return; // a drag, not a click
    }
    const clicks = this.nativeClickCount;
    const dblClicks = this.nativeDblClickCount;
    clearTimeout(this.lostClickTimer);
    // "click" and "dblclick" are dispatched in the same task as the mouseup – a timeout runs after them
    this.lostClickTimer = setTimeout(() => {
      this.lostClickTimer = undefined;
      if (this.nativeClickCount !== clicks || this.tableScope.isDestroyed() || this.isBlocked(evt)) {
        return;
      }
      const rowIdx = this.resolveRowIndex(pressed);
      if (rowIdx < 0) {
        return; // the pressed row is gone (removed, replaced): no click for a different row
      }
      const cell: ClickCell = {
        areaIdent: pressed.areaIdent, sideIdent: pressed.sideIdent, rowIdx, colIdx: pressed.colIdx, action: pressed.action,
      };
      this.handleClick(evt, pressed.target, cell);
      if (evt.detail === 2 && this.nativeDblClickCount === dblClicks) {
        this.handleDblClick(evt, pressed.target, cell);
      }
    }, 0);
  }

  /**
   * The current index of the pressed row: rows may have been added, removed or sorted in while the button was held.
   * -1 if the row is gone.
   */
  private resolveRowIndex(pressed: PressedCell): number {
    if (pressed.areaIdent !== 'body' || !pressed.stableRow) {
      return pressed.rowIdx;
    }
    const areaModel = this.tableScope.tableModel.getBodyModel();
    if (this.rowAt(areaModel, pressed.rowIdx) === pressed.row) {
      return pressed.rowIdx;
    }
    // search outwards from the old index (rows removed in front: the row moved up; inserted: down)
    const count = areaModel.getRowCount();
    for (let d = 1; d < count; d++) {
      const before = pressed.rowIdx - d;
      const after = pressed.rowIdx + d;
      if (before < 0 && after >= count) {
        break;
      }
      if (before >= 0 && this.rowAt(areaModel, before) === pressed.row) {
        return before;
      }
      if (after < count && this.rowAt(areaModel, after) === pressed.row) {
        return after;
      }
    }
    return -1;
  }

  private rowAt(areaModel: { getRowByIndex(i: number): unknown }, rowIdx: number): unknown {
    try {
      return areaModel.getRowByIndex(rowIdx);
    } catch {
      return undefined; // an own area model may throw outside of its rows
    }
  }

  private mouseDraggingOnFrame() {
    if (this.mouseEvent) {
      const mouseEvent = this.tableScope.createGeMouseEvent(this.mouseEvent);
      if (this.startMouseEvent?.originalEvent) {
        mouseEvent.draggingX = this.mouseEvent.clientX - this.startMouseEvent.originalEvent.clientX;
        mouseEvent.draggingY = this.mouseEvent.clientY - this.startMouseEvent.originalEvent.clientY;
      }
      this.tableScope.mouseDraggingOnFrame(mouseEvent, this.startMouseEvent);
    }
  }

  /** Handles the end of the last drag now (in its frame, or earlier when the next mousedown comes first). */
  private flushDraggingEnd() {
    const pending = this.pendingDraggingEnd;
    if (!pending) {
      return;
    }
    this.pendingDraggingEnd = undefined;
    cancelAnimationFrame(pending.frameId);
    this.dragGeneration++; // frame callbacks of this drag that did not run yet are outdated
    const mouseEvent = this.tableScope.createGeMouseEvent(pending.evt);
    if (pending.start?.originalEvent) {
      mouseEvent.draggingX = pending.evt.clientX - pending.start.originalEvent.clientX;
      mouseEvent.draggingY = pending.evt.clientY - pending.start.originalEvent.clientY;
    }
    this.tableScope.mouseDraggingEndOnFrame(mouseEvent);
  }


  private mouseMoveOnFrame() {
    if (this.mouseEvent) {
      const mouseMoveEvent = this.tableScope.createGeMouseEvent(this.mouseEvent);
      this.tableScope.mouseMove(mouseMoveEvent);
    }
  }



  /**
   * True while the mouse button is held in the table (a click or a drag in progress) – live data does not jump to
   * the end then (`tableApi.appendRows({ follow: "auto" })`, since 1.1.108).
   *
   * @returns {boolean} true between mousedown and mouseup
   */
  isButtonDown(): boolean {
    return this.mouseDown;
  }

  /** A mouse event on a blocking loading overlay ({@link TableOverlay.isEventBlocked}): the table ignores it. */
  private isBlocked(evt: Event): boolean {
    // also events from a detail row (master/detail, e.g. a nested table): they belong to the detail
    return (this.tableScope.tableOverlay?.isEventBlocked(evt) ?? false) || !!this.tableScope.isEventInDetail?.(evt);
  }
}
