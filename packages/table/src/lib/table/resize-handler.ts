import { TableScope } from "./table-scope";

/**
 * Class representing a ResizeHandler.
 * @class
 * @classdesc Handles resizing of the host element and calls `TableScope.recalcColumnWidths` – debounced by
 * `resizeEventDebounceDelay` (500 ms). A cover grid that fills its width (`coverGridFill`, since 1.1.117) takes the
 * new size over at once: in the `ResizeObserver` callback (after the layout, before the paint – the same frame, at most
 * one callback and so one render per frame); a pending debounced call is dropped.
 *
 * @category Internals
 */
export class ResizeHandler {

  private readonly resizeObserver: ResizeObserver;
  private disconnected = false;
  private timer = 0;

  constructor(
    protected tableScope: TableScope,
    protected debounceDelay: number = 500
  ) {
    this.resizeObserver = new ResizeObserver(this.onResize.bind(this));
    this.resizeObserver.observe(this.tableScope.hostElement);
  }

  /**
   * Stops observing the host element. Called by {@link TableScope.destroy}.
   */
  disconnect(): void {
    this.disconnected = true;
    this.cancelPending();
    this.resizeObserver.disconnect();
  }

  private onResize(entries: ResizeObserverEntry[]): void {
    if (this.disconnected) {
      return;
    }
    this.cancelPending();
    if (this.tableScope.isCoverGridFillActive()) {
      this.handleResize(entries);
      return;
    }
    this.timer = window.setTimeout(() => {
      this.timer = 0;
      this.handleResize(entries);
    }, this.debounceDelay);
  }

  /** Drops a debounced call that has not run yet (e.g. a render that takes the width over anyway). */
  cancelPending(): void {
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = 0;
    }
  }

  private handleResize(entries: ResizeObserverEntry[]){
    if (this.disconnected) {
      return; // a debounced call may still arrive after destroy()
    }
    const entry = entries[0];
    const { width } = entry.contentRect;
    this.tableScope.recalcColumnWidths(width);
  }

}
