/**
 * Undo and redo ({@link TableOptionsIf.undo}). `undo: true` uses the defaults of {@link UndoOptions}; an object
 * overrides single values.
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   editing: true,
 *   undo: { maxSteps: 50, onConflict: "overwrite" },
 * };
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface UndoOptionsIf {
  /** Steps kept; the oldest is dropped. Default `100`. */
  maxSteps: number;
  /**
   * Cells kept over all steps (the oldest steps are dropped). A single change with more cells empties the history
   * and is announced – it cannot be undone. Default `1_000_000`.
   */
  maxCells: number;
  /**
   * A cell changed by something else since the step (live data, `updateCells`): `"skip"` leaves it and announces it
   * (default, safe), `"overwrite"` writes anyway.
   */
  onConflict: "skip" | "overwrite";
  /** Record `api.applyCellChanges(…)` with source `"api"` too. Default `false` (per call: `{ undoable: true }`). */
  recordApiChanges: boolean;
}
