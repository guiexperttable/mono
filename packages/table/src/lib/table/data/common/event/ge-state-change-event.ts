import { TableStateIf, TableStatePart } from "../../../state/table-state.if";

/**
 * The state of a table changed ({@link EventListenerIf.onStateChanged}): a column was resized, moved, hidden,
 * the table was sorted, scrolled, a node expanded, a row checked or selected … Reported once after the changes
 * settled ({@link TableOptionsIf.stateChangedDebounceDelay}, default 300 ms) and only if a part really changed;
 * not while the table is built.
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onStateChanged = (evt: GeStateChangeEvent) => {
 *   if (!evt.changedParts.includes("scroll")) {               // e.g. ignore pure scrolling
 *     void fetch("/api/prefs/orders", { method: "PUT", body: JSON.stringify(evt.state) });
 *   }
 * };
 *
 * @category State
 * @since 1.1.92
 */
export class GeStateChangeEvent {

  constructor(
    /** The whole state of the table now (all parts). */
    public readonly state: TableStateIf,
    /** The parts that changed since the last event. */
    public readonly changedParts: TableStatePart[]
  ) {
  }
}
