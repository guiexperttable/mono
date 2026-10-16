import type { TableScope } from "../table-scope";
import type { FillHandleOptionsIf } from "./fill-handle-options.if";
import type { FillDirection } from "./fill-direction.type";
import { CellRange } from "../data/common/cell-range";
import { getFillRange } from "./compute-fill-changes";

/** The attribute value of the fill handle (`data-ge-action`). */
const FILL_HANDLE_ACTION = "fill-handle";

interface PendingFill {
  pointerId: number;
  startX: number;
  startY: number;
  source: CellRange;
}

interface FillSession {
  source: CellRange;
  options: FillHandleOptionsIf;
  direction?: FillDirection;
  count: number;
  lastEvent?: PointerEvent;
  speedX: number;
  speedY: number;
  remainderX: number;
  remainderY: number;
  lastFrameTime?: number;
}

/**
 * The fill handle of one table (`tableScope.fillHandleService`): the square at the bottom right corner of the selected
 * range, the pointer drag with preview and auto-scroll, Escape. The values come from {@link TableScope.fillRange}.
 * Use {@link TableApi.fillRange}, {@link TableApi.isFilling} and {@link TableApi.cancelFill} instead.
 *
 * Pointer Events (mouse, touch, pen) only on the handle; its `pointerdown` is prevented, so the mouse handler of the
 * table (range selection, column drag) never sees it.
 *
 * @category Internals
 * @since 1.1.96
 */
export class FillHandleService {

  private handle?: HTMLDivElement;
  private preview?: HTMLDivElement;
  private pending?: PendingFill;
  private session?: FillSession;
  private sessionAbortController?: AbortController;
  private autoScrollFrame = 0;
  private suppressClick = false;
  private shortcutsSet = false;

  constructor(private readonly tableScope: TableScope) {
    const signal = tableScope.listenerAbortController.signal;
    tableScope.hostElement.addEventListener("pointerdown", (evt: PointerEvent) => this.onPointerDown(evt), { signal });
    // the click after a fill (or on the handle): the mouse handler must not change focus and selection
    tableScope.hostElement.addEventListener("click", (evt: MouseEvent) => this.onClickCapture(evt), { capture: true, signal });
    tableScope.hostElement.addEventListener("dblclick", (evt: MouseEvent) => {
      if (this.isHandle(evt.target)) {
        evt.stopPropagation();
      }
    }, { capture: true, signal });
  }

  /** true while the handle is dragged. */
  isFilling(): boolean {
    return !!this.session;
  }

  /**
   * Places the handle at the bottom right corner of the last selected range (called after every render pass) – or
   * hides it: no fill handle option, no range, the corner scrolled out, an open editor, a blocking overlay.
   */
  update(): void {
    const scope = this.tableScope;
    const options = scope.getFillHandleOptions();
    if (!options) {
      this.removeHandle();
      if (this.shortcutsSet) {                 // the fill handle was switched off at runtime
        this.shortcutsSet = false;
        this.tableScope.setHostKeyShortcuts(undefined);
      }
      return;
    }
    this.updateHostShortcuts(options);
    const range = this.session?.source ?? scope.getFillSourceRange();
    const rect = range && !scope.isEditing() && !scope.tableOverlay.isBlocking() && !scope.rowDragService?.isDragging()
      ? this.getCornerOf(range)
      : undefined;
    if (!rect) {
      if (this.handle) this.handle.style.display = "none";
      return;
    }
    const handle = this.ensureHandle();
    handle.style.display = "block";
    handle.style.left = `${rect.x}px`;
    handle.style.top = `${rect.y}px`;
    if (this.session) {
      this.renderPreview();
    }
  }

  /** The handle's position (the corner of the range) in host coordinates – `undefined` if it is not visible. */
  private getCornerOf(range: CellRange): { x: number; y: number } | undefined {
    const scope = this.tableScope;
    let column = range.c2;
    while (column > range.c1 && scope.tableModel.getColumnWidth(column) <= 0) {
      column--; // a hidden last column: the corner of the last shown one
    }
    if (scope.tableModel.getColumnWidth(column) <= 0) {
      return undefined;
    }
    const r = scope.getBodyCellRectInHost(range.r2, column);
    const x = r.left + r.width;
    const y = r.top + r.height;
    const visible = x >= r.clipLeft && x <= r.clipRight + 0.5 && y >= r.clipTop && y <= r.clipBottom + 0.5;
    return visible ? { x, y } : undefined;
  }

  private ensureHandle(): HTMLDivElement {
    if (!this.handle || !this.handle.isConnected) {
      const dom = this.tableScope.getDomService();
      this.handle = dom.setAriaHidden(dom.createDivWithClass("ge-table-fill-handle", this.tableScope.hostElement));
      dom.domService.setAttribute(this.handle, "data-ge-action", FILL_HANDLE_ACTION);
    }
    return this.handle;
  }

  private removeHandle(): void {
    this.handle?.remove();
    this.handle = undefined;
  }

  /** Keyboard alternative on the grid: Ctrl/⌘+D, Ctrl/⌘+R (only directions the options allow). */
  private updateHostShortcuts(options: FillHandleOptionsIf): void {
    const mac = typeof navigator !== "undefined" && navigator.platform.indexOf("Mac") > -1;
    const mod = mac ? "Meta" : "Control";
    const keys: string[] = [];
    if (options.direction !== "horizontal") keys.push(`${mod}+D`);
    if (options.direction !== "vertical") keys.push(`${mod}+R`);
    this.tableScope.setHostKeyShortcuts(keys.join(" "));
    this.shortcutsSet = true;
  }

  // ---------------------------------------------------------------- pointer

  private isHandle(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest(`[data-ge-action="${FILL_HANDLE_ACTION}"]`)
      && this.tableScope.hostElement.contains(target);
  }

  private onPointerDown(evt: PointerEvent): void {
    if (this.session || this.pending || (evt.pointerType === "mouse" && evt.button !== 0) || !this.isHandle(evt.target)) {
      return;
    }
    // no compatibility mouse events (range selection), no text selection
    evt.preventDefault();
    const source = this.tableScope.getFillSourceRange();
    if (!source || this.tableScope.isEditing()) {
      return;
    }
    this.pending = { pointerId: evt.pointerId, startX: evt.clientX, startY: evt.clientY, source };
    this.listenToDocument();
  }

  private listenToDocument(): void {
    this.sessionAbortController = new AbortController();
    const signal = this.sessionAbortController.signal;
    const doc = this.tableScope.hostElement.ownerDocument;
    doc.addEventListener("pointermove", (evt: PointerEvent) => this.onPointerMove(evt), { signal });
    doc.addEventListener("pointerup", (evt: PointerEvent) => this.onPointerUp(evt), { signal });
    doc.addEventListener("pointercancel", (evt: PointerEvent) => {
      if (this.pending && evt.pointerId === this.pending.pointerId) this.cancel();
    }, { signal });
    doc.addEventListener("keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Escape" && (this.session || this.pending)) {
        evt.preventDefault();
        evt.stopPropagation();
        this.cancel();
      }
    }, { capture: true, signal });
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
      const options = this.tableScope.getFillHandleOptions();
      if (!options) {
        this.stopListening();
        return;
      }
      if (Math.hypot(evt.clientX - this.pending.startX, evt.clientY - this.pending.startY) < options.dragThresholdInPx) {
        return;
      }
      this.session = {
        source: this.pending.source, options, count: 0, speedX: 0, speedY: 0, remainderX: 0, remainderY: 0
      };
      const dom = this.tableScope.getDomService();
      this.preview = dom.setAriaHidden(dom.createDivWithClass("ge-table-fill-preview", this.tableScope.hostElement));
      this.tableScope.hostElement.classList.add("ge-table-fill-active");
    }
    evt.preventDefault();
    this.updateTarget(evt);
  }

  private onPointerUp(evt: PointerEvent): void {
    if (!this.pending || evt.pointerId !== this.pending.pointerId) {
      return;
    }
    const session = this.session;
    if (!session) {
      this.stopListening(); // a click on the handle – nothing filled
      this.suppressNextClick();
      return;
    }
    this.updateTarget(evt);
    this.suppressNextClick();
    const { source, direction, count } = session;
    this.stopListening();
    if (direction && count > 0 && !this.tableScope.tableOverlay.isBlocking() && !this.tableScope.isEditing()) {
      // ⌥/Alt (or Ctrl, like Excel on Windows) switches between series and copy
      this.tableScope.fillRange(source, direction, count, evt.altKey || evt.ctrlKey ? "alternate" : "auto");
    } else {
      this.tableScope.repaint();
    }
  }

  private suppressNextClick(): void {
    this.suppressClick = true;
    setTimeout(() => this.suppressClick = false, 0); // only the click of THIS pointerup
  }

  private onClickCapture(evt: MouseEvent): void {
    if (this.suppressClick || this.isHandle(evt.target)) {
      this.suppressClick = false;
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  /** Target cell under the pointer → direction and count; preview; auto-scroll. */
  private updateTarget(evt: PointerEvent): void {
    const session = this.session!;
    session.lastEvent = evt;
    const scope = this.tableScope;
    const host = scope.hostElement;
    const hostRect = host.getBoundingClientRect();
    const x = evt.clientX - hostRect.left - host.clientLeft;
    const y = evt.clientY - hostRect.top - host.clientTop;
    const [row, column] = scope.getBodyCellAtHostPoint(x, y);
    const src = session.source;
    const dRows = row > src.r2 ? row - src.r2 : row < src.r1 ? row - src.r1 : 0;
    const dCols = column > src.c2 ? column - src.c2 : column < src.c1 ? column - src.c1 : 0;
    const allowed = session.options.direction;
    const vertical = allowed === "vertical" || (allowed === "both" && Math.abs(dRows) >= Math.abs(dCols));
    const delta = vertical ? dRows : dCols;
    session.direction = delta === 0 ? undefined
      : vertical ? (delta > 0 ? "down" : "up") : (delta > 0 ? "right" : "left");
    session.count = Math.abs(delta);
    this.renderPreview();
    this.updateAutoScroll(x, y);
  }

  private renderPreview(): void {
    const session = this.session;
    const preview = this.preview;
    if (!session || !preview) {
      return;
    }
    const range = session.direction ? getFillRange(session.source, session.direction, session.count) : session.source;
    const scope = this.tableScope;
    const topLeft = scope.getBodyCellRectInHost(range.r1, range.c1);
    const bottomRight = scope.getBodyCellRectInHost(range.r2, range.c2);
    // only the visible part of the body (the rows above/below may be scrolled out)
    const top = Math.max(topLeft.top, topLeft.clipTop);
    const bottom = Math.min(bottomRight.top + bottomRight.height, bottomRight.clipBottom);
    const left = Math.max(topLeft.left, topLeft.clipLeft);
    const right = Math.min(bottomRight.left + bottomRight.width, bottomRight.clipRight);
    Object.assign(preview.style, {
      display: bottom > top && right > left ? "block" : "none",
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.max(0, right - left)}px`,
      height: `${Math.max(0, bottom - top)}px`
    });
  }

  // ---------------------------------------------------------------- auto-scroll

  private updateAutoScroll(x: number, y: number): void {
    const session = this.session!;
    const { autoScrollZoneInPx: zone, autoScrollMaxSpeedInPx: max } = session.options;
    const scope = this.tableScope;
    const padding = scope.tableModel.getPadding();
    const host = scope.hostElement;
    const ramp = (depth: number) => Math.max(1, Math.round(max * Math.min(1, depth / zone) ** 2));
    const top = padding.top;
    const bottom = host.clientHeight - padding.bottom;
    const left = padding.left;
    const right = host.clientWidth - padding.right;
    session.speedY = zone <= 0 || max <= 0 ? 0
      : y < top + zone ? -ramp(top + zone - y) : y > bottom - zone ? ramp(y - (bottom - zone)) : 0;
    session.speedX = zone <= 0 || max <= 0 ? 0
      : x < left + zone && x >= left - zone ? -ramp(left + zone - x) : x > right - zone ? ramp(x - (right - zone)) : 0;
    if ((session.speedX || session.speedY) && !this.autoScrollFrame) {
      this.autoScrollFrame = requestAnimationFrame(() => this.autoScrollStep());
    } else if (!session.speedX && !session.speedY) {
      session.lastFrameTime = undefined;
      session.remainderX = 0;
      session.remainderY = 0;
    }
  }

  private autoScrollStep(): void {
    this.autoScrollFrame = 0;
    const session = this.session;
    if (!session || (!session.speedX && !session.speedY)) {
      return;
    }
    const viewport = this.tableScope.scrollViewport;
    const now = performance.now();
    const frames = session.lastFrameTime ? Math.min(4, (now - session.lastFrameTime) / (1000 / 60)) : 1;
    session.lastFrameTime = now;
    const dy = session.speedY * frames * this.tableScope.getScrollerToContentRatioY() + session.remainderY;
    const dx = session.speedX * frames + session.remainderX;
    const stepY = Math.trunc(dy);
    const stepX = Math.trunc(dx);
    session.remainderY = dy - stepY;
    session.remainderX = dx - stepX;
    const beforeTop = viewport.scrollTop;
    const beforeLeft = viewport.scrollLeft;
    viewport.scrollTop = beforeTop + stepY;
    viewport.scrollLeft = beforeLeft + stepX;
    if (viewport.scrollTop !== beforeTop || viewport.scrollLeft !== beforeLeft) {
      this.tableScope.adjustAfterScrolling(); // render now – the cells under the pointer changed
    }
    this.updateTarget(session.lastEvent!);
  }

  // ---------------------------------------------------------------- end

  /** Cancels a running fill (Escape, `pointercancel`, {@link TableApi.cancelFill}): nothing is changed. */
  cancel(): void {
    const running = !!this.session;
    this.stopListening();
    if (running) {
      this.tableScope.repaint();
    }
  }

  private stopListening(): void {
    this.sessionAbortController?.abort();
    this.sessionAbortController = undefined;
    this.pending = undefined;
    this.session = undefined;
    if (this.autoScrollFrame) {
      cancelAnimationFrame(this.autoScrollFrame);
      this.autoScrollFrame = 0;
    }
    this.preview?.remove();
    this.preview = undefined;
    this.tableScope.hostElement.classList.remove("ge-table-fill-active");
  }

  /** Releases everything (TableScope.destroy). */
  destroy(): void {
    this.stopListening();
    this.removeHandle();
  }
}
