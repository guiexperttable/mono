import { EventFocusChangedListenerIf } from './event-focus-changed-listener.if';
import type { RowIndexShift } from '../live-append/row-index-shift';

/**
 * The focused cell of a table (moved by click and arrow keys; F2 edits it). The implementation is {@link FocusModel};
 * changes are reported to {@link EventListenerIf.onFocusChanged}.
 *
 * @example
 * override onFocusChanged(model: FocusModelIf): void {
 *   const [row, col] = model.getFocus();
 *   console.log(`focus on row ${row}, column ${col}`);
 * }
 *
 * @category Selection & focus
 */
export interface FocusModelIf {

  /** The registered listeners. */
  getEventFocusChangedListeners(): EventFocusChangedListenerIf[];
  /** Get notified when the focus moves. */
  addEventFocusChangedListener(listener: EventFocusChangedListenerIf): void;
  /** Stop notifications. */
  removeEventFocusChangedListener(listener: EventFocusChangedListenerIf): void;

  /** No cell has the focus afterwards. */
  clear(): void;

  /** Moves the focus to a body cell. */
  setFocus(rowIndex: number, columnIndex: number): void;

  /** Has this cell the focus? */
  hasFocus(rowIndex: number, columnIndex: number): boolean;

  /** `[rowIndex, columnIndex]` of the focused cell (-1 if none). */
  getFocus(): [number, number];

  /** Did the focus change since {@link clearChanged}? */
  hasChanged(): boolean;

  /** Resets {@link hasChanged}. */
  clearChanged(): void;

  /**
   * Optional (live data, since 1.1.108): the focused row moves along when rows were removed at the start or
   * inserted (`tableApi.appendRows()`). Same row: no event. Focused row removed: the next remaining row gets the
   * focus (with an event).
   *
   * @param {RowIndexShift} shift - how the display indices move
   * @example
   * focusModel.adjustForRowChanges?.(new RowIndexShift([0], []));
   */
  adjustForRowChanges?(shift: RowIndexShift): void;
}
