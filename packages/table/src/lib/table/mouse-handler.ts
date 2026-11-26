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
  /** The button of the press as a bit of `MouseEvent.buttons` (left 1, right 2, middle 4) – see {@link isPressLost}. */
  private pressButtons = 0;
  /** The listeners of the current press at the document and the window (mouseup, lost press) – aborted when it ends. */
  private pressAbort?: AbortController;
  /** `onMouseDragging` was reported for the current press – only then {@link releaseMouse} reports the end. */
  private dragReported = false;

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
    signal.addEventListener("abort", () => {
      clearTimeout(this.lostClickTimer);
      // the table is gone: a press in progress is over, without any event
      this.pressAbort?.abort();
      this.pressAbort = undefined;
      this.pressedCell = undefined;
      this.mouseDown = false;
      this.dragging = false;
    });

    // @ts-ignore
    this.tableScope.hostElement['_MouseHandler'] = 'true';

    this.tableScope.scrollViewport.addEventListener("scroll", () => this.tableScope.onViewportScroll(), { signal });
    this.tableScope.scrollViewport.addEventListener("wheel", this.tableScope.onWheel.bind(this.tableScope), { passive: false, signal });
    // the fixed columns lie next to the viewport – the wheel there scrolls the table, too (found by the E2E tests, 026)
    this.tableScope.getFixedBodyAreaElements().forEach(
      ele => ele.addEventListener("wheel", evt => this.tableScope.onFixedAreaWheel(evt), { passive: false, signal })
    );

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
      // read the clicked cell BEFORE the listener of the app runs (it may render, sort, filter)
      const checkLostDblClick = cell ? undefined : this.prepareLostDblClickCheck(event, eventTarget);
      this.publishGeMouseEvent(event, 2, geMouseEvent, eventTarget);
      checkLostDblClick?.();
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

    } else if (mouseTargetData.action === 'filter-column') {
      this.tableScope.toggleColumnFilterMenu(mouseTargetData.colIdx);
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

    if (mouseTargetData.areaIdent === "body" && this.tableScope.canFocusBodyCell(mouseTargetData.rowIdx, mouseTargetData.colIdx)) {
      // fires onFocusChanged once, and only if the focus moves (a clear() before it fired twice per click)
      // (not for an empty tile behind the last item of a cover grid, since 1.1.115)
      this.tableScope.focusModel()?.setFocus(mouseTargetData.rowIdx, mouseTargetData.colIdx);
    }

    this.publishGeMouseEvent(event, secondClick ? 2 : 1, geMouseEvent, eventTarget);
  };

  /**
   * After the second click of a double click was reported: an app that renders in its click handler (it marks the
   * clicked cell or tile with `repaint()`) replaces the clicked element – the browser then sends "dblclick" to the
   * detached element and it never reaches the host: no editor, no `onCellActivated`. Then the double click is
   * handled for the clicked cell – once this task is through and only if no native "dblclick" came (since 1.1.115).
   *
   * Call it before the click is reported; the returned function starts the check afterwards.
   */
  private prepareLostDblClickCheck(event: MouseEvent, eventTarget: EventTarget | null): (() => void) | undefined {
    const clicked = this.tableScope.createGeMouseEvent(event);
    if (event.detail !== 2 || !(eventTarget instanceof Element) || !clicked || !clicked.areaIdent
      || clicked.rowIndex < 0 || clicked.columnIndex < 0) {
      // a programmatic click or the third click of a triple click (no "dblclick" follows), or not on a cell
      return undefined;
    }
    const areaIdent = clicked.areaIdent;
    const cell: ClickCell = {
      areaIdent, sideIdent: clicked.sideIdent, rowIdx: clicked.rowIndex, colIdx: clicked.columnIndex,
      action: clicked.action,
    };
    // what the click meant: the handler of the app may also sort, filter or remove rows – the double click belongs
    // to the row resp. the tile, not to the index
    const areaModel = this.tableScope.tableModel.getAreaModel(areaIdent);
    const row = areaIdent === 'body' ? this.rowAt(areaModel, cell.rowIdx) : undefined;
    const stableRow = typeof row === 'object' && row !== null && this.rowAt(areaModel, cell.rowIdx) === row;
    const tile = areaIdent === 'body' && this.tableScope.getTileLayout()
      ? areaModel.getValueAt(cell.rowIdx, cell.colIdx) : undefined;
    return () => this.checkLostDblClick(event, eventTarget, cell, row, stableRow, tile);
  }

  private checkLostDblClick(event: MouseEvent, eventTarget: Element, cell: ClickCell, row: unknown,
                            stableRow: boolean, tile: unknown) {
    const areaIdent = cell.areaIdent;
    const dblClicks = this.nativeDblClickCount;
    // "dblclick" is dispatched in the same task as "click" – a timeout runs after it
    setTimeout(() => {
      if (this.nativeDblClickCount !== dblClicks || eventTarget.isConnected || this.tableScope.isDestroyed()
        || this.isBlocked(event)) {
        return; // the browser's own "dblclick" arrived (or will be handled as always)
      }
      if (tile !== undefined) {
        const tiles = this.tableScope.getTileLayout();
        const index = tiles ? tiles.indexOfTile(tile) : -1;
        if (!tiles || index < 0) {
          return; // the item is gone
        }
        const perRow = Math.max(1, tiles.getTilesPerRow());
        cell.rowIdx = Math.floor(index / perRow);
        cell.colIdx = index % perRow;
      } else {
        cell.rowIdx = this.resolveRowIndex({
          target: eventTarget, areaIdent, sideIdent: cell.sideIdent, rowIdx: cell.rowIdx, colIdx: cell.colIdx,
          action: cell.action, row, stableRow, clientX: event.clientX, clientY: event.clientY,
        });
        if (cell.rowIdx < 0) {
          return; // the row is gone
        }
      }
      this.handleDblClick(event, eventTarget, cell);
    }, 0);
  }

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
      || mouseTargetData.action === 'filter-column'
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
    let activate: [number, number] | undefined;
    // a double click on the resize handle fits the width – it does not sort or edit (prompt 022)
    const resizeHandle = (cell ? cell.action : targetData.action) === 'resize-column';
    if (resizeHandle) {
      const colIdx = cell ? cell.colIdx
        : Number((eventTarget instanceof Element ? eventTarget.closest('[data-col-index]') : null)?.getAttribute('data-col-index') ?? -1);
      this.tableScope.autoResizeColumnByUser(colIdx, event);
    }

    if (!resizeHandle && eventTarget instanceof HTMLElement && !this.isClickAction(targetData)) {
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
        let handled = false;

        if (area && areaIdent === "body") {
          if (areaModel.isEditable(rowIdx, colIdx)) {
            // the editor above the cell (Excel-style editing, since 1.1.99) or inside it (clears the selection)
            this.tableScope.startEditing(rowIdx, colIdx, "edit");
            handled = true;
          }
        }

        if (isTreeRow(row)) {
          if (colIdx === this.getArrowColumnIndex()) {
            // toggle collapsed/expanded:
            event.preventDefault();
            event.stopPropagation();
            const tr: TreeRowIf<any> = row as TreeRow<any>;
            this.tableScope.setTreeRowExpanded(tr, !tr.expanded);
            handled = true;
          }
        }

        // nothing else to do: the double click "opens" the cell (since 1.1.115) – not on a handle inside it
        const action = cell ? cell.action : targetData.action;
        if (!handled && area && areaIdent === "body" && !action && !this.tableScope.isEditing()
          && !this.isInteractiveCellElement(eventTarget)) { // a button, link or input of a renderer keeps its clicks
          activate = [rowIdx, colIdx];
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
    if (activate) {
      this.tableScope.activateCell(activate[0], activate[1], 'mouse', event); // after onMouseClicked (clickCount 2)
    }
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
    const blocked = this.isBlocked(evt);
    // the button of the press goes down again, or it is not held any more: its mouseup never arrived (1.1.119)
    const stale = this.isStalePress(evt);
    // Read what is pressed BEFORE anything renders: ending a stale press (a cancelled column drag) or the previous
    // drag repaints and replaces the elements. The click is reported for this cell should the browser send none –
    // also after a render through the API (live data: repaint/repaintHard/scrollToPixel), see onMouseUp.
    const pressedCell = !blocked && evt.button === 0 ? this.readPressedCell(evt) : undefined;
    const start = !blocked && (stale || !this.dragging) ? this.tableScope.createGeMouseEvent(evt) : undefined;
    if (stale) {
      this.releaseMouse(evt);
      if (this.tableScope.isDestroyed()) {
        return; // a listener of the end destroyed the table
      }
    }
    if (blocked) {
      return;
    }
    // A click repaint must not happen between mousedown and mouseup/click/dblclick: it would replace the pressed cell
    // element, and the browser would not see a click (or double click) on it. Hold it back until mouseup.
    if (this.tableScope.cancelPendingRepaint()) {
      this.repaintAfterMouseUp = true;
    }
    this.pressedCell = pressedCell;

    if (start) {
      this.mouseEvent = evt;
      this.startMouseEvent = start;
      // The end of the previous drag must be handled before this one starts: its frame may come later on a busy
      // machine and would reset the start of this drag (before 1.1.106 a quick second column resize was lost).
      this.flushDraggingEnd();
      this.tableScope.onMouseDown(this.startMouseEvent);
      this.mouseDown = true;
      this.dragReported = false;
      this.pressButtons = MouseHandler.buttonsOf(evt);
      this.listenToPress();
    }
  }

  /** True if a mousedown shows that the press of the table is over: the same button again, or its button is not held. */
  private isStalePress(evt: MouseEvent): boolean {
    return this.mouseDown && (MouseHandler.buttonsOf(evt) === this.pressButtons || this.isPressLost(evt));
  }

  /** The bit of `MouseEvent.buttons` for the button of a mousedown (`button` 0 → 1, 1 → 4, 2 → 2, 3 → 8, 4 → 16). */
  private static buttonsOf(evt: MouseEvent): number {
    return [1, 4, 2, 8, 16][evt.button] ?? 1;
  }

  /**
   * True if the table is pressed but the button of the press is not held any more: the mouseup never reached the
   * page – a native drag out of the window (Tauri, Electron), an HTML5 drag, a system dialog (since 1.1.119).
   */
  private isPressLost(evt: MouseEvent): boolean {
    return this.mouseDown && (evt.buttons & this.pressButtons) === 0;
  }

  /**
   * Listens at the document and the window while the button is held: for the mouseup outside of the host, and for
   * everything that tells that no mouseup will come ({@link releaseMouse}). {@link endPressListeners} removes them.
   */
  private listenToPress() {
    this.pressAbort?.abort();
    const press = new AbortController();
    this.pressAbort = press;
    const signal = press.signal;
    const doc = this.tableScope.hostElement.ownerDocument ?? document;
    // a mouseup outside the host (an app menu under the pointer, a drag out of the table) must end the press too –
    // otherwise isButtonDown() stays true and live data stops following (review of 019)
    doc.addEventListener('mouseup', e => this.onDocumentMouseUp(e), { signal });
    // The mouseup may never come (1.1.119). Any mouse movement in the document without the button of the press …
    doc.addEventListener('mousemove', e => {
      if (this.isPressLost(e)) this.releaseMouse(e);
    }, { capture: true, signal });
    // … a press somewhere else in the page (in the host: onMouseDown) …
    doc.addEventListener('mousedown', e => {
      if (!this.tableScope.hostElement.contains(e.target as Node | null) && this.isStalePress(e)) this.releaseMouse(e);
    }, { capture: true, signal });
    // … the browser taking the pointer away (not a finger: touch sends its mouse events after the touch ended) …
    doc.addEventListener('pointercancel', e => {
      if (e.pointerType !== 'touch') this.releaseMouse(e);
    }, { signal });
    // … an HTML5 drag starting (no mouse events until it ends). A prevented dragstart starts none: whether it was
    // prevented is known once all listeners ran (an app may do it at the window) …
    doc.addEventListener('dragstart', e => setTimeout(() => {
      if (this.pressAbort === press && !e.defaultPrevented) this.releaseMouse(e);
    }, 0), { signal });
    // … or the window losing the focus (a system dialog, another app; not the focus going into an iframe of the
    // page – the document still has it then) end it.
    doc.defaultView?.addEventListener('blur', e => {
      if (!doc.hasFocus()) this.releaseMouse(e);
    }, { signal });
  }

  private endPressListeners() {
    this.pressAbort?.abort();
    this.pressAbort = undefined;
  }

  /** A mouseup that did not reach the host (released outside the table). */
  private onDocumentMouseUp(evt: MouseEvent) {
    if (this.mouseDown && !this.tableScope.hostElement.contains(evt.target as Node | null)) {
      this.onMouseUp(evt);
    }
  }

  /**
   * Ends the press without a mouseup ({@link TableApi.releaseMouse}): the table is not pressed any more. Nothing is
   * dropped – a running column resize or move is cancelled like with Escape (old width resp. order, end with type
   * `"cancel"`), a range selection stays as it is, no click is reported. `onMouseDraggingEnd` is called once if
   * `onMouseDragging` was (with the last position of the press). Without a press nothing happens.
   *
   * Called by the table itself as soon as it notices that the button is not held any more: a mouse movement in the
   * document without the button, `pointercancel`, an HTML5 `dragstart` that is not prevented, the window losing the
   * focus, the next mousedown of that button.
   *
   * @param {Event} [originalEvent] - the event that told it (passed on to the column event)
   * @returns {boolean} true if a press was ended
   * @since 1.1.119
   */
  releaseMouse(originalEvent?: Event): boolean {
    if (!this.mouseDown || this.tableScope.isDestroyed()) {
      return false;
    }
    const dragging = this.dragging && this.dragReported; // a drag whose first frame did not run was never reported
    const last = this.mouseEvent;       // the mousedown or the last movement with the button held
    const start = this.startMouseEvent;
    // the state first: a listener may call releaseMouse() again, press anew or destroy the table
    this.mouseDown = false;
    this.dragging = false;
    this.pressedCell = undefined;       // a lost mouseup is no click
    this.dragGeneration++;              // drag frames that did not run yet are outdated
    this.endPressListeners();
    this.tableScope.setDragging(false);
    if (this.repaintAfterMouseUp) {
      this.repaintAfterMouseUp = false; // the repaint of the last click was held back for this press
      this.tableScope.debounceRepaint();
    }
    let endEvent: GeMouseEvent | undefined;
    if (dragging && last) {
      endEvent = this.tableScope.createGeMouseEvent(last);
      if (start?.originalEvent) {
        endEvent.draggingX = last.clientX - start.originalEvent.clientX;
        endEvent.draggingY = last.clientY - start.originalEvent.clientY;
      }
    }
    this.tableScope.mousePressLost(endEvent, originalEvent);
    return true;
  }

  /**
   * Live data (since 1.1.108): a drag in progress (range selection) keeps its start row when rows were removed at the
   * start or inserted.
   *
   * @param {RowIndexShift} shift - how the display indices move
   */
  adjustForRowChanges(shift: RowIndexShift): void {
    const start = this.startMouseEvent;
    // also after mouseup while the end of the drag is pending: a drag frame queued before the mouseup still runs and
    // reads the start row (range selection sets the focus to it) – unshifted it pointed one update away
    if ((this.mouseDown || this.pendingDraggingEnd) && start && start.areaIdent === 'body' && start.rowIndex >= 0) {
      start.rowIndex = Math.max(0, shift.mapIndexOrNext(start.rowIndex));
    }
  }


  private onMouseMove(evt: MouseEvent) {
    // (a movement without the button of the press was handled before by the document listener of the press, see
    // listenToPress: the press is over then and this movement is a hover – since 1.1.119)
    if (!this.mouseDown && (this.tableScope.isEventInDetail?.(evt) || this.tableScope.isEventInFilterUI?.(evt))) {
      this.tableScope.hideHover?.(); // over a detail row or filter UI: no stale hover of body/header cells
      return;
    }
    if (!this.mouseDown && this.isBlocked(evt)) {
      return; // no hover under a loading overlay; a running drag (started in the header) keeps following the mouse
    }
    if (this.mouseDown && !this.dragging) {
      const down = this.startMouseEvent?.originalEvent;
      if (down && down.clientX === evt.clientX && down.clientY === evt.clientY) {
        // no movement: the browser sends a mousemove when a render replaced the element under the pointer (live data)
        // – that is no drag (it started a range selection to another line and swallowed the click; since 1.1.112)
        return;
      }
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
    if (!this.mouseDown && (this.tableScope.isEventInDetail?.(evt) || this.tableScope.isEventInFilterUI?.(evt))) {
      return; // a click in a detail row or filter UI
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
    this.endPressListeners();
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
      this.dragReported = true;
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
   * Since 1.1.119 a press also ends without a mouseup, as soon as the table notices that the button is not held any
   * more (see {@link releaseMouse}).
   *
   * @returns {boolean} true between mousedown and mouseup
   */
  isButtonDown(): boolean {
    return this.mouseDown;
  }

  /** A mouse event on a blocking loading overlay ({@link TableOverlay.isEventBlocked}): the table ignores it. */
  private isBlocked(evt: Event): boolean {
    // also events from a detail row (master/detail) or column filter UI (filter row / popup): they belong there
    return (this.tableScope.tableOverlay?.isEventBlocked(evt) ?? false)
      || !!this.tableScope.isEventInDetail?.(evt)
      || !!this.tableScope.isEventInFilterUI?.(evt);
  }
}
