import type { CellEditMode } from "../../../sheet-editing/cell-editor.if";

/**
 * What happened to the cell editor: `"start"` (opened), `"input"` (its text changed – Excel-style editing only),
 * `"commit"` (closed with the input written or – batch edit – marked), `"cancel"` (closed without writing).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export type GeEditEventType = "start" | "input" | "commit" | "cancel";

/**
 * Reported by {@link EventListenerIf.onEditingChanged}: the cell editor opened, its text changed, it committed or
 * it was cancelled – e.g. to show the input in an own formula bar or to disable buttons while editing.
 *
 * @example
 * const listener = new EventAdapter();
 * listener.onEditingChanged = (evt: GeEditEvent) => {
 *   hint.textContent = evt.type === "start" ? `Editing row ${evt.rowIndex + 1}` : "";
 * };
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export class GeEditEvent {

  constructor(
    /** What happened. */
    public readonly type: GeEditEventType,
    /** Display row index of the edited body cell. */
    public readonly rowIndex: number,
    /** Model column index. */
    public readonly columnIndex: number,
    /** "enter" (opened by typing) or "edit" (F2, Enter, double click). */
    public readonly mode: CellEditMode,
    /** The text of the editor (`"input"` and `"commit"`). */
    public readonly input?: string
  ) {
  }
}
