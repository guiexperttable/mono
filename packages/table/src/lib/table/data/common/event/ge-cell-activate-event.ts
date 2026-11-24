import type { AreaIdent } from "../../tablemodel/area-ident.type";

/**
 * What activated a cell: Enter (`"keyboard"`), a double click (`"mouse"`) or
 * `tableApi.triggerAction("ACTIVATE_CELL")` (`"api"`).
 *
 * @category Events
 * @since 1.1.115
 */
export type GeCellActivateSource = "keyboard" | "mouse" | "api";

/**
 * Reported by {@link EventListenerIf.onCellActivated}: the user "opens" a body cell – Enter on the focused cell or a
 * double click. One handler for keyboard and mouse: open the book of a cover grid, the order of a list.
 *
 * It is reported only if the gesture did nothing else: Enter first toggles a row checkbox, a detail row
 * (master/detail) or a tree node and, with Excel-style editing, edits or moves down; a double click first opens the
 * editor of an editable cell or toggles a tree node. Empty tiles of a cover grid report nothing, a double click on a
 * button, link or input inside a cell belongs to that control, and a held Enter key reports once.
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onCellActivated = (evt: GeCellActivateEvent) => {
 *   console.log(`open row ${evt.rowIndex} by ${evt.source}`, evt.row ?? evt.value);
 * };
 *
 * @category Events
 * @since 1.1.115
 */
export class GeCellActivateEvent<V = any, R = any> {

  constructor(
    /** The area of the cell – always `"body"`. */
    public readonly areaIdent: AreaIdent,
    /** Display row index of the cell. */
    public readonly rowIndex: number,
    /** Model column index of the cell. */
    public readonly columnIndex: number,
    /** The value of the cell (`getValueAt`) – in a cover grid the item of the tile. */
    public readonly value: V,
    /**
     * The row (`getRowByIndex`): the row object of a list (the row array of `bodyData` tables); in a tree, row
     * grouping or pivot a `TreeRow` (your object is `row.data`); `undefined` in a cover grid.
     */
    public readonly row: R,
    /** Enter, double click or the API. */
    public readonly source: GeCellActivateSource,
    /** The key or mouse event (not for `"api"`). */
    public readonly originalEvent?: KeyboardEvent | MouseEvent
  ) {
  }
}
