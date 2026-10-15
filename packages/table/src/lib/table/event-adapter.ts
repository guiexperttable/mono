import { GeModelChangeEvent } from "./data/common/event/ge-model-change-event";
import { GeMouseEvent } from "./data/common/event/ge-mouse-event";
import { GeScrollEvent } from "./data/common/event/ge-scroll-event";
import { EventListenerIf } from "./event-listener.if";
import { SelectionModelIf } from './selection/selection-model.if';
import { FocusModelIf } from './focus/focus-model.if';
import { GeStateChangeEvent } from "./data/common/event/ge-state-change-event";

/**
 * Empty implementation of {@link EventListenerIf} – extend it and override only the events you need.
 *
 * @example
 * class TreeEvents extends EventAdapter {
 *   override onCheckboxChanged(rows: any[]): void {
 *     console.log(`${rows.length} rows checked`);
 *   }
 * }
 *
 * @see Training: [Events and a context menu of your own](https://gui.expert/training/events-and-context-menu/)
 *
 * @category Events
 */
export class EventAdapter implements EventListenerIf {

  onCheckboxChanged(_evt: any[]): void {
  }

  onContextmenu(_evt: GeMouseEvent): void {
  }

  onModelChanged(_evt: GeModelChangeEvent): void {
  }

  onMouseClicked(_evt: GeMouseEvent): void {
  }

  onMouseDragging(_evt: GeMouseEvent): void {
  }

  onMouseDraggingEnd(_evt: GeMouseEvent): void {
  }

  onMouseMoved(_evt: GeMouseEvent): void {
  }

  onScroll(_evt: GeScrollEvent): void {
  }

  onSelectionChanged(_model: SelectionModelIf): void {
  }

  onFocusChanged(_model: FocusModelIf): void {
  }

  /** @since 1.1.92 */
  onStateChanged(_evt: GeStateChangeEvent): void {
  }

}
