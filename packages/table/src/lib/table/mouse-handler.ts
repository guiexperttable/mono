import { TableScope } from "./table-scope";
import { TreeRow } from "./data/common/tree-row";
import { AreaIdent, getAreaIdentByString } from "./data/tablemodel/area-ident.type";
import { GeMouseEvent } from "./data/common/event/ge-mouse-event";
import { MouseTargetData } from "./data/event/mouse-target-data";
import {TreeRowIf} from "./data/common/tree-row-if";
import {isTreeRow} from "./instanceof-workaround";

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

  mouseEvent?: MouseEvent;
  startMouseEvent?: GeMouseEvent;
  geMouseEvent?: GeMouseEvent;
  geMouseEventOld?: GeMouseEvent;

  private lastClickedCellKey = '';
  /** The second click of a double click that was already reported (clickCount 2) – its "dblclick" is not. */
  private reportedDoubleClick?: { time: number; cellKey: string };
  private mouseDown = false;
  private repaintAfterMouseUp = false;
  private dragging = false;

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

    // @ts-ignore
    this.tableScope.hostElement['_MouseHandler'] = 'true';

    this.tableScope.scrollViewport.addEventListener("scroll", this.tableScope.adjustAfterScrolling.bind(this.tableScope), { signal });
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
    if (!(evt instanceof MouseEvent)) {
      // a "contextmenu" CustomEvent of a wrapper (Solid dispatches its events on the host div) – no right click;
      // before, it was taken for a second right click within 50 ms and stopped (it never reached the listeners)
      return;
    }
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
    const now = Date.now();
    const eventTarget = this.tableScope.getMouseEventTarget(event); // a footer cell below the scroll viewport
    const cellKey = this.getCellKey(eventTarget);
    // The second click of a double click: the browser counts the clicks (event.detail, OS double-click speed).
    // Programmatic clicks (element.click(), detail 0): two clicks on the SAME cell within doubleClickDelay.
    const secondClick = event.detail >= 2
      || (event.detail === 0 && now - this.lastClicked < this.doubleClickDelay && cellKey === this.lastClickedCellKey);
    this.lastClicked = now;
    this.lastClickedCellKey = cellKey;

    const mouseTargetData: MouseTargetData = new MouseTargetData(eventTarget, this.tableScope);
    if (secondClick) {
      this.reportedDoubleClick = { time: now, cellKey };
    }
    if (secondClick && !this.isClickAction(mouseTargetData)) {
      // reported with clickCount 2 – focus and selection were handled by the first click; the "dblclick" event that
      // follows sorts / edits / toggles and is not reported again (a double click arrived three times before, and a
      // Ctrl+double click toggled the selection on/off/on).
      // A click on a checkbox, an arrow or a toggle icon always does its job: two quick clicks = two toggles.
      this.publishGeMouseEvent(event, 2);
      return;
    }

    if (mouseTargetData.action === 'toggleExpandCollapseAll') {
      this.tableScope.toggleExpandCollapseAll(!this.tableScope.allExpanded);
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

    this.publishGeMouseEvent(event, secondClick ? 2 : 1);
  };

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
    this.lastClicked = Date.now();
    const eventTarget = this.tableScope.getMouseEventTarget(event);
    // created BEFORE sorting/editing: they repaint, the target element is detached afterwards (area/side unknown)
    const geMouseEvent = this.tableScope.createGeMouseEvent(event);

    if (eventTarget instanceof HTMLElement && !this.isClickAction(new MouseTargetData(eventTarget, this.tableScope))) {
      // the target may be an element inside the cell (renderer, component) → look up the cell attributes
      const target = (eventTarget.closest("[data-col-index]") ?? eventTarget) as HTMLElement;
      const area = target.closest("[data-area]")?.getAttribute("data-area") ?? null;
      const areaIdent: AreaIdent = getAreaIdentByString(area);
      const rowIdx = Number(target.closest("[data-row-index]")?.getAttribute("data-row-index"));
      const colIdx = Number(target.getAttribute("data-col-index"));
      const areaModel = this.tableScope.tableModel.getAreaModel(areaIdent);

      if (area && areaIdent === "header") {
        if (this.tableScope.tableModel.isSortable(colIdx)) {
          this.tableScope.clearSelection();
          this.tableScope.onHeaderDblClicked(event, rowIdx, colIdx);
        }

      } else if (target.getAttribute("data-row-index")) {
        const row = areaModel.getRowByIndex(rowIdx);

        if (area && areaIdent === "body") {
          if (areaModel.isEditable(rowIdx, colIdx)) {
            this.tableScope.clearSelection();
            this.tableScope.initRenderEditor(rowIdx, colIdx);
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
    if (!reported || Date.now() - reported.time > this.doubleClickDelay || reported.cellKey !== this.getCellKey(eventTarget)) {
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
  private publishGeMouseEvent(event: MouseEvent, clickCount: number, geMouseEvent?: GeMouseEvent) {
    this.mouseEvent = event;
    this.geMouseEventOld = this.geMouseEvent?.clone();
    this.geMouseEvent = geMouseEvent ?? this.tableScope.createGeMouseEvent(event);
    if (this.geMouseEvent) {
      this.geMouseEvent.clickCount = clickCount;
    }

    const dirty = this.tableScope.onMouseClicked(this.geMouseEvent, this.geMouseEventOld);
    this.tableScope.publishGeMouseEvent(this.geMouseEvent);
    if (dirty && !this.isInteractiveCellElement(event.target)) {
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
    return rowCheckboxVisible ? 1 : 0;
  }


  private onMouseDown(evt: MouseEvent) {
    // A click repaint must not happen between mousedown and mouseup/click/dblclick: it would replace the pressed cell
    // element, and the browser would not see a click (or double click) on it. Hold it back until mouseup.
    if (this.tableScope.cancelPendingRepaint()) {
      this.repaintAfterMouseUp = true;
    }

    if (!this.dragging) {
      this.mouseEvent = evt;
      this.startMouseEvent = this.tableScope.createGeMouseEvent(this.mouseEvent);
      this.tableScope.onMouseDown(this.startMouseEvent);
      this.mouseDown = true;
    }
  }


  private onMouseMove(evt: MouseEvent) {
    this.mouseEvent = evt;
    if (this.mouseDown) {
      if (!this.dragging) {
        this.dragging = true;
        this.tableScope.setDragging(true);
      }
      requestAnimationFrame(this.mouseDraggingOnFrame.bind(this));
    } else {
      requestAnimationFrame(this.mouseMoveOnFrame.bind(this));
    }
  }


  private onMouseUp(evt: MouseEvent) {
    this.mouseEvent = evt;
    if (this.repaintAfterMouseUp) {
      // deferred: "click" and "dblclick" of this mouseup are dispatched first
      this.repaintAfterMouseUp = false;
      this.tableScope.debounceRepaint();
    }
    if (this.dragging) {
      requestAnimationFrame(this.mouseDraggingEndOnFrame.bind(this));
    }
    this.mouseDown = false;
    this.dragging = false;
    this.tableScope.setDragging(false);
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

  private mouseDraggingEndOnFrame() {
    if (this.mouseEvent) {
      const mouseEvent = this.tableScope.createGeMouseEvent(this.mouseEvent);
      if (this.startMouseEvent?.originalEvent) {
        mouseEvent.draggingX = this.mouseEvent.clientX - this.startMouseEvent.originalEvent.clientX;
        mouseEvent.draggingY = this.mouseEvent.clientY - this.startMouseEvent.originalEvent.clientY;
      }
      this.tableScope.mouseDraggingEndOnFrame(mouseEvent);
    }
  }


  private mouseMoveOnFrame() {
    if (this.mouseEvent) {
      const mouseMoveEvent = this.tableScope.createGeMouseEvent(this.mouseEvent);
      this.tableScope.mouseMove(mouseMoveEvent);
    }
  }


}
