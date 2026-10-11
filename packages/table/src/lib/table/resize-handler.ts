import { TableScope } from "./table-scope";
import { debounce } from '../common/debounce';

/**
 * Class representing a ResizeHandler.
 * @class
 * @classdesc Handles resizing of elements and calls a callback function on resize. These calls will be debounced with 500 ms.
 */
export class ResizeHandler {

  private readonly resizeObserver: ResizeObserver;
  private disconnected = false;

  constructor(
    protected tableScope: TableScope,
    protected debounceDelay: number = 500
  ) {
    this.resizeObserver = new ResizeObserver(debounce(this.handleResize.bind(this), debounceDelay));
    this.resizeObserver.observe(this.tableScope.hostElement);
  }

  /**
   * Stops observing the host element. Called by {@link TableScope.destroy}.
   */
  disconnect(): void {
    this.disconnected = true;
    this.resizeObserver.disconnect();
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
