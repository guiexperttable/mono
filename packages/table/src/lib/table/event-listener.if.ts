import { GeMouseEvent } from "./data/common/event/ge-mouse-event";
import { GeModelChangeEvent } from "./data/common/event/ge-model-change-event";
import { GeScrollEvent } from "./data/common/event/ge-scroll-event";
import { GeStateChangeEvent } from "./data/common/event/ge-state-change-event";
import { SelectionModelIf } from './selection/selection-model.if';
import { FocusModelIf } from './focus/focus-model.if';
import { EventFocusChangedListenerIf } from './focus/event-focus-changed-listener.if';
import { EventSelectionChangedListenerIf } from './selection/event-selection-changed-listener.if';

/**
 * Receives the events of a table – the fifth argument of `new TableScope(…)`.
 * Extend {@link EventAdapter} and override only the methods you need.
 *
 * In the framework wrappers the same events arrive as callback props (`mouseClicked`, `selectionChanged` …),
 * Vue events, Angular outputs or bubbling `CustomEvent`s of the Web Component.
 *
 * @example
 * class OrderEvents extends EventAdapter {
 *   override onMouseClicked(evt: GeMouseEvent): void {
 *     if (evt.areaIdent === "body" && evt.clickCount === 2) {
 *       const order = tableModel.getBodyModel().getRowByIndex(evt.rowIndex);   // displayed row → object
 *       console.log("double-click on", order);
 *     }
 *   }
 *   override onSelectionChanged(model: SelectionModelIf): void {
 *     console.log(model.getRanges());
 *   }
 * }
 * new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new OrderEvents()).firstInit();
 *
 * @see Training: [Events and a context menu of your own](https://gui.expert/training/events-and-context-menu/)
 *
 * @category Events
 */
export interface EventListenerIf extends EventFocusChangedListenerIf, EventSelectionChangedListenerIf {

  /** Right-click on the table. Call `evt.originalEvent?.preventDefault()` to suppress the browser menu (e.g. for an own menu). */
  onContextmenu(evt: GeMouseEvent): void;

  /** The mouse moved over the table (cell under the mouse in `evt`). Called often – keep it cheap. */
  onMouseMoved(evt: GeMouseEvent): void;

  /** A drag with the mouse ended (column resize, column move or range selection). */
  onMouseDraggingEnd(evt: GeMouseEvent): void;

  /** The mouse is being dragged; `evt.draggingX` / `evt.draggingY` hold the distance. */
  onMouseDragging(evt: GeMouseEvent): void;

  /**
   * A click on the table. A double-click on the same cell is reported again with `clickCount === 2`
   * (after the first click with `clickCount === 1`).
   */
  onMouseClicked(evt: GeMouseEvent): void;

  /** Checked rows changed (row checkboxes, tree checkboxes) – the argument holds all checked rows. */
  onCheckboxChanged(evt: any[]): void;

  /** Cells were edited – `evt.cells` holds row and column index of each; the new value is already in the model (your row object). */
  onModelChanged(evt: GeModelChangeEvent): void;

  /** The table was scrolled. */
  onScroll(evt: GeScrollEvent): void;

  /** The selection changed – read it from {@link SelectionModelIf.getRanges}. */
  onSelectionChanged(model: SelectionModelIf): void;

  /** The focused cell changed – read it from {@link FocusModelIf.getFocus}. */
  onFocusChanged(model: FocusModelIf): void;

  /**
   * The state of the table changed (column layout, sorting, scroll position, tree, checked or selected rows,
   * header groups, custom data) – reported once after the changes settled, see {@link GeStateChangeEvent}.
   * Save `evt.state` e.g. on your server and pass it back as {@link TableOptionsIf.initialState}.
   * @since 1.1.92
   */
  onStateChanged?(evt: GeStateChangeEvent): void;
}
