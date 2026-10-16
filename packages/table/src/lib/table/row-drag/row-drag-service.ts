import type { TableScope } from "../table-scope";
import type { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { RowDropTargetIf } from "./row-drop-target.if";
import type { RowDragOptionsIf } from "./row-drag-options.if";
import type { AriaTextsIf } from "../aria/aria-texts.if";
import { RowDragOptions } from "./row-drag-options";
import { GeRowDragEvent, GeRowDragEventType, GeRowDragSource } from "../data/common/event/ge-row-drag-event";
import { calcMoveToIndex, findRowIndexAtY, normalizeRowIndices } from "./move-rows";
import { isAreaModelPivot, isAreaModelRowGroups, isAreaModelTree, isGroupRow, isTreeRow } from "../instanceof-workaround";
import { CellRange } from "../data/common/cell-range";
import { AriaTexts } from "../aria/aria-texts";

/**
 * Whether a body cell shows a drag handle: `"none"`, `"enabled"`, or `"disabled"` (managed drag while the table is
 * sorted or filtered).
 *
 * @category Row drag
 * @since 1.1.95
 */
export type RowDragHandleState = "none" | "enabled" | "disabled";

/** The attribute value of a drag handle (`data-ge-action`). */
const DRAG_ROW_ACTION = "drag-row";

interface PendingDrag {
  pointerId: number;
  startX: number;
  startY: number;
  rowIndex: number;
}

interface DragSession {
  source: GeRowDragSource;
  rowIndices: number[];
  rows: any[];
  target?: RowDropTargetIf;
  outside: boolean;
  lastEvent?: PointerEvent;
  autoScrollSpeed: number;
  /** the dragged rows as a set: asked for every rendered cell (a big selection must stay cheap) */
  rowSet: Set<number>;
  /** options of this drag (read once) */
  options: RowDragOptionsIf;
  /** fractional scroll bar pixels not yet applied (capped scroll heights scroll < 1 px per frame) */
  scrollRemainder: number;
  lastFrameTime?: number;
}

/**
 * Row drag of one table (`tableScope.rowDragService`): drag handles ({@link ColumnDefIf.rowDrag}), pointer drag with
 * ghost, drop marker and auto-scroll, the keyboard alternative (`MOVE_ROW_UP` / `MOVE_ROW_DOWN`) and the managed move.
 * Use {@link TableApi.moveRows}, {@link TableApi.isRowDragging} and {@link TableApi.cancelRowDrag} instead.
 *
 * Pointer Events (mouse, touch, pen) – only on the drag handle; its `pointerdown` is prevented, so the mouse handler
 * of the table (range selection, column drag) never sees it.
 *
 * @category Internals
 * @since 1.1.95
 */
export class RowDragService {

  private pending?: PendingDrag;
  private session?: DragSession;
  private sessionAbortController?: AbortController;
  private ghost?: HTMLDivElement;
  private indicator?: HTMLDivElement;
  private autoScrollFrame = 0;
  private suppressClick = false;
  private warnedUnsupported = false;

  constructor(private readonly tableScope: TableScope) {
    const signal = tableScope.listenerAbortController.signal;
    tableScope.hostElement.addEventListener("pointerdown", (evt: PointerEvent) => this.onPointerDown(evt), { signal });
    // the click after a real drag: the mouse handler must not move focus and selection (capture phase, before it)
    tableScope.hostElement.addEventListener("click", (evt: MouseEvent) => this.onClickCapture(evt), { capture: true, signal });
    // a double click on a grip is no double click on the cell (it would open the editor of an editable column)
    tableScope.hostElement.addEventListener("dblclick", (evt: MouseEvent) => {
      if (evt.target instanceof Element && evt.target.closest(`[data-ge-action="${DRAG_ROW_ACTION}"]`)) {
        evt.stopPropagation();
      }
    }, { capture: true, signal });
  }

  /** The options of this table ({@link TableOptionsIf.rowDragOptions} + defaults). */
  get options(): RowDragOptionsIf {
    return RowDragOptions.create(this.tableScope.tableOptions.rowDragOptions);
  }

  /** true while rows are dragged with the pointer. */
  isDragging(): boolean {
    return !!this.session;
  }

  /** true if the row is one of the dragged rows (it is painted dimmed). */
  isDragSourceRow(rowIndex: number): boolean {
    return !!this.session && this.session.rowSet.has(rowIndex);
  }

  /**
   * Why a managed drag is not possible right now: `"sorted"` (a column has the sort state asc/desc), `"filtered"`
   * (a filter hides rows) – `undefined` if it is possible or the drag is unmanaged.
   */
  getBlockReason(): "sorted" | "filtered" | undefined {
    if (!this.isManaged()) {
      return undefined;
    }
    if (this.isSorted()) {
      return "sorted";
    }
    const body = this.tableScope.tableModel.getBodyModel();
    const all = body.getUnfilteredRowCount?.();
    if (all !== undefined && all > body.getRowCount()) {
      return "filtered";
    }
    return undefined;
  }

  /**
   * The drag handle of a body cell: none (no `rowDrag`, a group or pivot row, a managed drag the model cannot do),
   * enabled or disabled (managed + sorted/filtered).
   */
  getHandleState(rowIndex: number, columnDef: ColumnDefIf | undefined, areaModel: AreaModelIf): RowDragHandleState {
    const rowDrag = columnDef?.rowDrag;
    if (!rowDrag || isAreaModelPivot(areaModel)) {
      return "none";
    }
    const row = areaModel.getRowByIndex(rowIndex);
    if (isGroupRow(row)) {
      return "none";
    }
    if (typeof rowDrag === "function" && !rowDrag(row, rowIndex)) {
      return "none";
    }
    if (this.isManaged() && !this.canModelMove(areaModel)) {
      if (!this.warnedUnsupported) {
        this.warnedUnsupported = true;
        console.warn("GuiExpert Table: rowDrag is set, but the body model cannot move rows (no moveRows(), or row " +
          "grouping / pivot). Use rowDragOptions: { managed: false } and move the rows yourself.");
      }
      return "none";
    }
    return this.getBlockReason() ? "disabled" : "enabled";
  }

  /**
   * Adds the drag handle to a rendered body cell (called by the render pass for columns with `rowDrag`).
   *
   * @param {HTMLDivElement} cell - the cell div
   * @param {RowDragHandleState} state - from {@link getHandleState}
   */
  decorateCell(cell: HTMLDivElement, state: RowDragHandleState): void {
    if (state === "none") {
      return;
    }
    const dom = this.tableScope.getDomService().domService;
    const handle = dom.createElement<HTMLSpanElement>("span");
    dom.addClass(handle, "ge-table-row-drag-handle");
    if (state === "disabled") {
      dom.addClass(handle, "ge-table-row-drag-handle-disabled");
    }
    dom.setAttribute(handle, "data-ge-action", DRAG_ROW_ACTION);
    dom.setAttribute(handle, "aria-hidden", "true"); // keyboard alternative: Ctrl+Alt+Up/Down (aria-keyshortcuts)
    dom.appendChild(cell, handle);
    dom.addClass(cell, "ge-table-row-drag-cell");
    dom.setAttribute(cell, "aria-keyshortcuts", "Control+Alt+ArrowUp Control+Alt+ArrowDown");
  }

  // ---------------------------------------------------------------- pointer

  private onPointerDown(evt: PointerEvent): void {
    if (this.session || this.pending || (evt.pointerType === "mouse" && evt.button !== 0)) {
      return;
    }
    const target = evt.target instanceof Element ? evt.target : null;
    const handle = target?.closest(`[data-ge-action="${DRAG_ROW_ACTION}"]`);
    if (!handle || !this.tableScope.hostElement.contains(handle) || this.tableScope.tableOverlay.isEventBlocked(evt)
      || this.tableScope.isEditing()) {
      return; // an open editor is bound to its row index – no drag while editing
    }
    // no compatibility mouse events (range selection, column drag), no text selection, no native drag
    evt.preventDefault();
    const rowIndex = Number(handle.closest("[data-row-index]")?.getAttribute("data-row-index"));
    if (!Number.isInteger(rowIndex) || rowIndex < 0) {
      return;
    }
    if (handle.classList.contains("ge-table-row-drag-handle-disabled")) {
      this.announceNotPossible();
      return;
    }
    this.pending = { pointerId: evt.pointerId, startX: evt.clientX, startY: evt.clientY, rowIndex };
    this.listenToDocument();
  }

  private listenToDocument(): void {
    this.sessionAbortController = new AbortController();
    const signal = this.sessionAbortController.signal;
    const doc = this.tableScope.hostElement.ownerDocument;
    doc.addEventListener("pointermove", (evt: PointerEvent) => this.onPointerMove(evt), { signal });
    doc.addEventListener("pointerup", (evt: PointerEvent) => this.onPointerUp(evt), { signal });
    doc.addEventListener("pointercancel", (evt: PointerEvent) => this.onPointerCancel(evt), { signal });
    doc.addEventListener("keydown", (evt: KeyboardEvent) => this.onKeyDown(evt), { capture: true, signal });
    // wheel or scroll bar during a drag: the rows under the pointer change
    this.tableScope.scrollViewport.addEventListener("scroll", () => {
      if (this.session?.lastEvent && !this.autoScrollFrame) {
        this.updateTarget(this.session.lastEvent);
      }
    }, { signal });
  }

  private onPointerMove(evt: PointerEvent): void {
    if (!this.pending || evt.pointerId !== this.pending.pointerId) {
      return;
    }
    if (!this.session) {
      const dx = evt.clientX - this.pending.startX;
      const dy = evt.clientY - this.pending.startY;
      if (Math.hypot(dx, dy) < this.options.dragThresholdInPx) {
        return;
      }
      if (!this.startPointerDrag(evt)) {
        return;
      }
    }
    evt.preventDefault();
    if (this.session) {            // a listener may have cancelled it
      this.updateTarget(evt);
    }
  }

  private onPointerUp(evt: PointerEvent): void {
    if (!this.pending || evt.pointerId !== this.pending.pointerId) {
      return;
    }
    if (!this.session) {
      this.stopListening(); // a click on the handle – nothing was dragged
      return;
    }
    this.updateTarget(evt);
    this.suppressClick = true;
    setTimeout(() => this.suppressClick = false, 0); // only the click of THIS pointerup
    if (this.session) {            // a listener of the move event may have cancelled it
      this.drop(evt);
    }
  }

  private onPointerCancel(evt: PointerEvent): void {
    if (this.pending && evt.pointerId === this.pending.pointerId) {
      this.cancel(evt);
    }
  }

  private onKeyDown(evt: KeyboardEvent): void {
    if (evt.key === "Escape" && (this.session || this.pending)) {
      evt.preventDefault();
      evt.stopPropagation();
      this.cancel(evt);
    }
  }

  private onClickCapture(evt: MouseEvent): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  /** Starts the drag after the threshold – false if the listener vetoed it. */
  private startPointerDrag(evt: PointerEvent): boolean {
    const pending = this.pending!;
    const rowIndices = this.getDragRowIndices(pending.rowIndex);
    const rows = this.getRows(rowIndices);
    const start = this.createEvent("start", "pointer", rows, rowIndices, undefined, false, evt);
    this.tableScope.getEventListener().onRowDragStart?.(start);
    if (start.defaultPrevented || this.pending !== pending) {   // vetoed, or cancelled/destroyed by the listener
      this.stopListening();
      return false;
    }
    this.session = {
      source: "pointer", rowIndices, rows, outside: false, autoScrollSpeed: 0, rowSet: new Set(rowIndices),
      options: this.options, scrollRemainder: 0
    };
    this.createDragElements(rows);
    this.tableScope.repaint(); // dims the dragged rows
    this.tableScope.announce(this.texts().rowDragStarted!(rows.length));
    return true;
  }

  /** Computes the drop target from the pointer position, reports a change, moves ghost and marker, auto-scrolls. */
  private updateTarget(evt: PointerEvent): void {
    const session = this.session!; // only called during a drag
    session.lastEvent = evt;
    const { target, outside } = this.computeTarget(evt.clientX, evt.clientY);
    let valid = target && this.isValidTarget(session.rowIndices, target) ? target : undefined;
    const changed = !sameTarget(valid, session.target) || outside !== session.outside;
    if (changed) {
      const move = this.createEvent("move", "pointer", session.rows, session.rowIndices, valid, outside, evt);
      this.tableScope.getEventListener().onRowDragMove?.(move);
      if (this.session !== session) {
        return;                    // the listener cancelled the drag (or destroyed the table)
      }
      if (move.defaultPrevented) {
        valid = undefined;
      }
    }
    session.target = valid;
    session.outside = outside;
    this.renderDragElements(evt);
    session.autoScrollSpeed = outside ? 0 : this.calcAutoScrollSpeed(evt.clientY);
    if (session.autoScrollSpeed && !this.autoScrollFrame) {
      this.autoScrollFrame = requestAnimationFrame(() => this.autoScrollStep());
    } else if (!session.autoScrollSpeed) {
      session.lastFrameTime = undefined;
      session.scrollRemainder = 0;
    }
  }

  private autoScrollStep(): void {
    this.autoScrollFrame = 0;
    const session = this.session;
    if (!session || !session.autoScrollSpeed) {
      return;
    }
    const viewport = this.tableScope.scrollViewport;
    const before = viewport.scrollTop;
    // speed per 60 Hz frame, scaled by the real frame time (120 Hz screens are not twice as fast);
    // fractions are kept: a capped scroll height moves the scroll bar < 1 px per frame
    const now = performance.now();
    const frames = session.lastFrameTime ? Math.min(4, (now - session.lastFrameTime) / (1000 / 60)) : 1;
    session.lastFrameTime = now;
    const delta = session.autoScrollSpeed * frames * this.tableScope.getScrollerToContentRatioY() + session.scrollRemainder;
    const step = Math.trunc(delta);
    session.scrollRemainder = delta - step;
    viewport.scrollTop = before + step;
    if (viewport.scrollTop !== before) {
      this.tableScope.adjustAfterScrolling(); // render now – the rows under the pointer changed
    }
    // the rows under the pointer changed: new target; schedules the next step while the pointer stays in the zone
    this.updateTarget(session.lastEvent!);
  }

  /**
   * Speed in px per frame (negative = up): a quadratic ramp inside the zone at the top/bottom edge of the body, full
   * speed above (header) and below (footer) the body.
   */
  private calcAutoScrollSpeed(clientY: number): number {
    const { autoScrollZoneInPx: zone, autoScrollMaxSpeedInPx: max } = this.session!.options;
    if (zone <= 0 || max <= 0) {
      return 0;
    }
    const body = this.tableScope.getBodyViewport();
    const fromTop = clientY - body.top;
    const fromBottom = body.top + body.height - clientY;
    const speed = (depth: number) => Math.max(1, Math.round(max * Math.min(1, depth / zone) ** 2));
    if (fromTop < zone) {
      return -speed(zone - fromTop);
    }
    if (fromBottom < zone) {
      return speed(zone - fromBottom);
    }
    return 0;
  }

  /** The row under the pointer and the position (before/after/inside) – computed, not read from the DOM. */
  private computeTarget(clientX: number, clientY: number): { target?: RowDropTargetIf; outside: boolean } {
    const hostRect = this.tableScope.hostElement.getBoundingClientRect();
    if (clientX < hostRect.left || clientX > hostRect.right || clientY < hostRect.top || clientY > hostRect.bottom) {
      return { outside: true };
    }
    const body = this.tableScope.tableModel.getBodyModel();
    const rowCount = body.getRowCount();
    if (rowCount < 1) {
      return { outside: false };
    }
    const viewport = this.tableScope.getBodyViewport();
    const y = Math.min(Math.max(clientY, viewport.top), viewport.top + Math.max(0, viewport.height - 1));
    const contentY = y - viewport.top + viewport.contentScrollTop;
    const rowIndex = findRowIndexAtY(contentY, rowCount, i => body.getYPosByRowIndex(i), body.getConstantRowHeight?.());
    const rowTop = body.getYPosByRowIndex(rowIndex);
    const height = Math.max(1, body.getRowHeight(rowIndex));
    const ratio = Math.min(1, Math.max(0, (contentY - rowTop) / height));
    let position: RowDropTargetIf["position"];
    const tree = isAreaModelTree(body);
    if (tree && (this.session?.options ?? this.options).treeDropInside) {
      position = ratio < 0.25 ? "before" : ratio > 0.75 ? "after" : "inside";
    } else {
      position = ratio < 0.5 ? "before" : "after";
    }
    if (tree && position === "after" && rowIndex + 1 < rowCount) {
      // below an expanded node the next row is its first child: drop in front of it (that is where the marker is) –
      // "after the node" would land behind its whole subtree
      const row = body.getRowByIndex(rowIndex);
      const next = body.getRowByIndex(rowIndex + 1);
      if (next?.parent && next.parent === row) {
        return { target: { rowIndex: rowIndex + 1, position: "before" }, outside: false };
      }
    }
    return { target: { rowIndex, position }, outside: false };
  }

  private isValidTarget(rowIndices: number[], target: RowDropTargetIf): boolean {
    if (!this.isManaged()) {
      return true;
    }
    const body = this.tableScope.tableModel.getBodyModel();
    return !!body.moveRows && (body.canMoveRows ? body.canMoveRows(rowIndices, target) : true);
  }

  private drop(evt: PointerEvent): void {
    const session = this.session!;
    const target = session.outside ? undefined : session.target;
    const end = this.createEvent("end", session.source, session.rows, session.rowIndices, target, session.outside, evt);
    this.stopListening();
    const toIndex = target && this.isManaged() ? this.moveRows(session.rowIndices, target, true) : -1;
    if (toIndex > -1) {
      end.moved = true;
      end.toIndex = toIndex;
    } else {
      this.tableScope.repaint(); // nothing moved: the dragged rows are no longer dimmed
    }
    this.tableScope.getEventListener().onRowDragEnd?.(end);
  }

  /**
   * Cancels a running drag (Escape, `pointercancel`, {@link TableApi.cancelRowDrag}, destroy): `onRowDragEnd` with the
   * type `"cancel"`, nothing is moved.
   */
  cancel(originalEvent?: PointerEvent | KeyboardEvent): void {
    const session = this.session;
    this.stopListening();
    if (session) {
      this.tableScope.repaint(); // the dragged rows are no longer dimmed (also on destroy: called before it)
      this.tableScope.announce(this.texts().rowDragCancelled!());
      const evt = this.createEvent("cancel", session.source, session.rows, session.rowIndices, undefined, session.outside, originalEvent);
      this.tableScope.getEventListener().onRowDragEnd?.(evt);
    }
  }

  /** Ends the pointer session: listeners, ghost, marker, auto-scroll. */
  private stopListening(): void {
    this.sessionAbortController?.abort();
    this.sessionAbortController = undefined;
    this.pending = undefined;
    this.session = undefined;
    if (this.autoScrollFrame) {
      cancelAnimationFrame(this.autoScrollFrame);
      this.autoScrollFrame = 0;
    }
    this.ghost?.remove();
    this.indicator?.remove();
    this.ghost = undefined;
    this.indicator = undefined;
    const host = this.tableScope.hostElement;
    host.classList.remove("ge-table-row-drag-active", "ge-table-row-drag-invalid");
  }

  /** Releases everything (TableScope.destroy). A running drag is cancelled. */
  destroy(): void {
    this.cancel();
  }

  // ---------------------------------------------------------------- ghost and drop marker

  private createDragElements(rows: any[]): void {
    const dom = this.tableScope.getDomService();
    const host = this.tableScope.hostElement;
    this.ghost = dom.setAriaHidden(dom.createDivWithClass("ge-table-row-drag-ghost", host));
    // text only – never HTML from the data
    this.ghost.textContent = this.getGhostText(rows);
    this.indicator = dom.setAriaHidden(dom.createDivWithClass("ge-table-row-drop-indicator", host));
    host.classList.add("ge-table-row-drag-active");
  }

  private getGhostText(rows: any[]): string {
    const own = this.session!.options.ghostText;
    if (own) {
      return String(own(rows) ?? "");
    }
    const rowIndex = this.session!.rowIndices[0]; // the session is set before the ghost is created
    const body = this.tableScope.tableModel.getBodyModel();
    const column = this.getHandleColumnIndex(rowIndex);
    const text = column > -1 ? body.getTextValueAt(rowIndex, column) : "";
    const label = text || `Row ${rowIndex + 1}`;
    return rows.length > 1 ? `${label} (+${rows.length - 1})` : label;
  }

  private renderDragElements(evt: PointerEvent): void {
    const session = this.session!;       // only called during a drag, after createDragElements()
    const ghost = this.ghost!;
    const indicator = this.indicator!;
    const host = this.tableScope.hostElement;
    const hostRect = host.getBoundingClientRect();
    ghost.style.left = `${evt.clientX - hostRect.left - host.clientLeft + 12}px`;
    ghost.style.top = `${evt.clientY - hostRect.top - host.clientTop + 8}px`;
    host.classList.toggle("ge-table-row-drag-invalid", !session.target && !session.outside);

    const target = session.target;
    const viewport = this.tableScope.getBodyViewport();
    if (!target) {
      indicator.style.display = "none";
      return;
    }
    const body = this.tableScope.tableModel.getBodyModel();
    const rowTop = body.getYPosByRowIndex(target.rowIndex);
    const height = body.getRowHeight(target.rowIndex);
    const offsetTop = viewport.top - hostRect.top - host.clientTop; // body top inside the host
    const inside = target.position === "inside";
    const y = offsetTop + rowTop - viewport.contentScrollTop + (target.position === "after" ? height : 0);
    const top = inside ? y : y - 1;
    const lineHeight = inside ? height : 2;
    // only inside the body (a marker over the header or footer would be confusing)
    const visible = top + lineHeight >= offsetTop && top <= offsetTop + viewport.height;
    indicator.classList.toggle("ge-table-row-drop-indicator-inside", inside);
    Object.assign(indicator.style, {
      display: visible ? "block" : "none",
      left: `${viewport.left - hostRect.left - host.clientLeft}px`,
      width: `${this.getMarkerWidth(viewport.width)}px`,
      top: `${top}px`,
      height: `${lineHeight}px`
    });
  }

  /** The rows' width (fixed columns + center columns), at most the visible width – the marker ends with the rows. */
  private getMarkerWidth(viewportWidth: number): number {
    const tableModel = this.tableScope.tableModel;
    const padding = tableModel.getPadding();
    const rowsWidth = padding.left + tableModel.getContentWidthInPixel() + padding.right;
    return rowsWidth > 0 ? Math.min(viewportWidth, rowsWidth) : viewportWidth;
  }

  // ---------------------------------------------------------------- moving

  /**
   * Moves rows in the model (managed), repaints, keeps focus and selection on the moved rows and announces the new
   * position.
   *
   * @param {number[]} rowIndices - display indices
   * @param {RowDropTargetIf} target - drop target
   * @param {boolean} reselect - select the moved rows again (multi-row drag)
   * @returns {number} the new display index of the first moved row, -1 if nothing moved
   */
  moveRows(rowIndices: number[], target: RowDropTargetIf, reselect = true): number {
    const scope = this.tableScope;
    const body = scope.tableModel.getBodyModel();
    const indices = normalizeRowIndices(rowIndices, body.getRowCount());
    if (!indices.length || !body.moveRows || this.isSorted() || (body.canMoveRows && !body.canMoveRows(indices, target))) {
      return -1; // a sorted view has no order of its own to change (the sort would be lost silently)
    }
    const tree = isAreaModelTree(body);
    const flatToIndex = calcMoveToIndex(indices, target);
    const contiguous = indices[indices.length - 1] - indices[0] === indices.length - 1;
    if (!tree && contiguous && flatToIndex === indices[0]) {
      return -1; // dropped where the rows are: nothing to move
    }
    const rows = tree ? indices.map(i => body.getRowByIndex(i)) : [];
    if (!body.moveRows(indices, target)) {
      return -1;
    }
    scope.afterRowsMoved();
    const newIndices = tree ? this.findDisplayIndices(body, rows) : [];
    let first = tree ? -1 : flatToIndex;
    for (const i of newIndices) {
      if (first < 0 || i < first) first = i;
    }

    const sm = scope.selectionModel();
    if (sm && sm.hasSelection()) {
      sm.clear();
      if (reselect && indices.length > 1) {
        const lastColumn = scope.tableModel.getColumnCount() - 1;
        if (tree) {
          newIndices.forEach(i => sm.addSelection(new CellRange(i, 0, i, lastColumn)));
        } else {
          sm.addSelection(new CellRange(flatToIndex, 0, flatToIndex + indices.length - 1, lastColumn)); // one block
        }
      }
    }
    const fm = scope.focusModel();
    if (fm && first > -1) {
      const [, column] = fm.getFocus();
      fm.setFocus(first, column > -1 ? column : Math.max(0, this.getHandleColumnIndex(first)));
    }
    scope.repaintHard();
    if (first > -1) {
      scope.ensureRowIsVisible(first);
    }
    scope.stateService.markDirty("selection");
    scope.announce(this.texts().rowMoved!(first + 1, body.getRowCount()));
    return first;
  }

  private findDisplayIndices(body: AreaModelIf, rows: any[]): number[] {
    const wanted = new Set(rows);
    const ret: number[] = [];
    const n = body.getRowCount();
    for (let i = 0; i < n && ret.length < wanted.size; i++) {
      if (wanted.has(body.getRowByIndex(i))) {
        ret.push(i);
      }
    }
    return ret;
  }

  // ---------------------------------------------------------------- keyboard

  /**
   * `MOVE_ROW_UP` / `MOVE_ROW_DOWN`: moves the focused row (or the selected rows, if it is one of them) one position.
   * Trees: among the siblings.
   *
   * @param {-1 | 1} direction - up or down
   * @returns {boolean} true if the key was used (a row with a drag handle has the focus)
   */
  moveByKeyboard(direction: -1 | 1): boolean {
    const scope = this.tableScope;
    if (this.session || scope.isEditing()) {
      return false;
    }
    const fm = scope.focusModel();
    const body = scope.tableModel.getBodyModel();
    const [focusRow] = fm?.getFocus() ?? [-1, -1];
    const handleColumn = focusRow < 0 || focusRow >= body.getRowCount() ? -1 : this.getHandleColumnIndex(focusRow);
    if (handleColumn < 0) {
      return false;
    }
    if (this.getHandleStateOfRow(focusRow, handleColumn) === "disabled") {
      this.announceNotPossible();
      return true;
    }
    const tree = isAreaModelTree(body);
    const rowIndices = tree ? [focusRow] : this.getDragRowIndices(focusRow);
    const target = tree
      ? this.getTreeKeyboardTarget(body, focusRow, direction)
      : this.getFlatKeyboardTarget(rowIndices, direction, body.getRowCount());
    if (!target) {
      return true; // first/last position – nothing to do
    }
    const rows = this.getRows(rowIndices);
    const start = this.createEvent("start", "keyboard", rows, rowIndices, undefined, false);
    scope.getEventListener().onRowDragStart?.(start);
    if (start.defaultPrevented) {
      return true;
    }
    const move = this.createEvent("move", "keyboard", rows, rowIndices, target, false);
    scope.getEventListener().onRowDragMove?.(move);
    const valid = !move.defaultPrevented && this.isValidTarget(rowIndices, target);
    const end = this.createEvent("end", "keyboard", rows, rowIndices, valid ? target : undefined, false);
    if (valid && this.isManaged()) {
      const toIndex = this.moveRows(rowIndices, target, true);
      end.moved = toIndex > -1;
      if (end.moved) {
        end.toIndex = toIndex;
      }
    }
    scope.getEventListener().onRowDragEnd?.(end);
    return true;
  }

  private getFlatKeyboardTarget(rowIndices: number[], direction: -1 | 1, rowCount: number): RowDropTargetIf | undefined {
    if (direction < 0) {
      const first = rowIndices[0];
      return first > 0 ? { rowIndex: first - 1, position: "before" } : undefined;
    }
    const last = rowIndices[rowIndices.length - 1];
    return last < rowCount - 1 ? { rowIndex: last + 1, position: "after" } : undefined;
  }

  private getTreeKeyboardTarget(body: AreaModelIf, rowIndex: number, direction: -1 | 1): RowDropTargetIf | undefined {
    const row = body.getRowByIndex(rowIndex);
    const roots: any[] = (body as any).rows ?? [];
    const siblings: any[] = row?.parent ? (row.parent.children ?? []) : roots;
    const sibling = siblings[siblings.indexOf(row) + direction];
    if (!sibling) {
      return undefined;
    }
    const [index] = this.findDisplayIndices(body, [sibling]);
    return index === undefined ? undefined : { rowIndex: index, position: direction < 0 ? "before" : "after" };
  }

  // ---------------------------------------------------------------- helpers

  /** The dragged rows for a grabbed row: all rows with a selection if it is one of them (multiRow), else this one. */
  getDragRowIndices(rowIndex: number): number[] {
    const rowCount = this.tableScope.tableModel.getBodyModel().getRowCount();
    const sm = this.tableScope.selectionModel();
    if (this.options.multiRow && sm?.hasSelection()) {
      const selected = normalizeRowIndices(sm.getMergedRowIndices(rowCount), rowCount);
      if (selected.includes(rowIndex)) {
        return selected;
      }
    }
    return [rowIndex];
  }

  private getRows(rowIndices: number[]): any[] {
    const body = this.tableScope.tableModel.getBodyModel();
    const grouped = isAreaModelRowGroups(body);
    return rowIndices.map(i => {
      const row = body.getRowByIndex(i);
      // row grouping: the detail rows are internal tree rows – the app gets its own objects
      return grouped && isTreeRow(row) && !isGroupRow(row) ? row.data : row;
    });
  }

  /** Index of the first column whose drag handle is shown for the row, -1 if none. */
  private getHandleColumnIndex(rowIndex: number): number {
    const tableModel = this.tableScope.tableModel;
    const body = tableModel.getBodyModel();
    const n = tableModel.getColumnCount();
    for (let c = 0; c < n; c++) {
      const def = tableModel.getColumnDef(c);
      if (def?.rowDrag && this.getHandleState(rowIndex, def, body) !== "none") {
        return c;
      }
    }
    return -1;
  }

  /** The state of the handle of a row that has one (see {@link getHandleColumnIndex}). */
  private getHandleStateOfRow(rowIndex: number, column: number): RowDragHandleState {
    const tableModel = this.tableScope.tableModel;
    return this.getHandleState(rowIndex, tableModel.getColumnDef(column), tableModel.getBodyModel());
  }

  /** true if a column has the sort state asc or desc (the header shows the arrow). */
  private isSorted(): boolean {
    return !!this.tableScope.tableModel.getColumnDefs?.()?.some(def => def.sortState === "asc" || def.sortState === "desc");
  }

  private isManaged(): boolean {
    return this.tableScope.tableOptions.rowDragOptions?.managed !== false;
  }

  private canModelMove(areaModel: AreaModelIf): boolean {
    // row grouping and pivot never move rows themselves (their canMoveRows is always false)
    return !!areaModel.moveRows && !isAreaModelRowGroups(areaModel) && !isAreaModelPivot(areaModel);
  }

  private createEvent(type: GeRowDragEventType, source: GeRowDragSource, rows: any[], rowIndices: number[],
                      target: RowDropTargetIf | undefined, outside: boolean,
                      originalEvent?: PointerEvent | KeyboardEvent): GeRowDragEvent {
    const tree = isAreaModelTree(this.tableScope.tableModel.getBodyModel());
    const toIndex = target && !tree ? calcMoveToIndex(rowIndices, target) : -1;
    return new GeRowDragEvent(type, source, rows, [...rowIndices], target ? { ...target } : undefined, toIndex,
      outside, this.isManaged(), originalEvent);
  }

  private announceNotPossible(): void {
    this.tableScope.announce(this.texts().rowMoveNotPossible!());
  }

  private texts(): Required<AriaTextsIf> {
    // AriaTexts.create() fills all defaults – an own AriaTextsIf implementation may lack the optional row drag texts
    const texts = this.tableScope.ariaTexts as Partial<AriaTextsIf>;
    const defaults = new AriaTexts();
    return {
      rowDragStarted: (n: number) => (texts.rowDragStarted ?? defaults.rowDragStarted).call(texts, n),
      rowMoved: (p: number, n: number) => (texts.rowMoved ?? defaults.rowMoved).call(texts, p, n),
      rowMoveNotPossible: () => (texts.rowMoveNotPossible ?? defaults.rowMoveNotPossible).call(texts),
      rowDragCancelled: () => (texts.rowDragCancelled ?? defaults.rowDragCancelled).call(texts)
    } as Required<AriaTextsIf>;
  }
}

function sameTarget(a: RowDropTargetIf | undefined, b: RowDropTargetIf | undefined): boolean {
  return a === b || (!!a && !!b && a.rowIndex === b.rowIndex && a.position === b.position);
}
