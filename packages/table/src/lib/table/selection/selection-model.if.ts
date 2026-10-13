import { CellRange } from "../data/common/cell-range";
import { EventSelectionChangedListenerIf } from './event-selection-changed-listener.if';

/**
 * What is selected in a table – a list of rectangles ({@link CellRange}). The implementation is {@link SelectionModel};
 * every table gets its own, or you pass one via {@link TableOptionsIf.getSelectionModel}.
 * Changes are reported to {@link EventListenerIf.onSelectionChanged}.
 *
 * @example
 * override onSelectionChanged(model: SelectionModelIf): void {
 *   const ranges = model.getRanges().filter(r => !r.gammaRange);     // skip special ranges
 *   const cells = ranges.reduce((n, r) => n + (r.r2 - r.r1 + 1) * (r.c2 - r.c1 + 1), 0);
 *   console.log(`${cells} cells selected`);
 * }
 *
 * @see Training: [Select cells, rows and ranges – and copy them](https://gui.expert/training/selection-and-copy/)
 *
 * @category Selection & focus
 */
export interface SelectionModelIf {

  /** The registered listeners (the table registers itself). */
  getEventSelectionChangedListeners(): EventSelectionChangedListenerIf[];
  /** Get notified on every change of the selection. */
  addEventSelectionChangedListener(listener: EventSelectionChangedListenerIf): void;
  /** Stop notifications. */
  removeEventSelectionChangedListener(listener: EventSelectionChangedListenerIf): void;



  /**
   * Toggles the selection state of a point at the specified row and column in a grid.
   *
   * @param {number} row - The row index of the point to toggle.
   * @param {number} col - The column index of the point to toggle.
   * @return {void}
   */
  togglePoint(row: number, col: number): void;

  /**
   * Checks if a specific cell in a grid is selected.
   *
   * @param {number} row - The row index of the cell to check.
   * @param {number} col - The column index of the cell to check.
   * @returns {boolean} - Returns true if the cell is selected, otherwise false.
   */
  isSelected(row: number, col: number): boolean;

  /**
   * Returns an array of CellRange objects representing the selections.
   *
   * @return {CellRange[]} Array of CellRange objects representing the ranges.
   */
  getRanges(): CellRange[];

  /**
   * The indices of all rows that contain at least one selected cell, sorted ascending.
   *
   * Ranges that cover all rows (selection type `"column"`) and {@link selectAll} need `rowCount` to be listed;
   * without it they are skipped. Implementations written before `rowCount` existed may ignore it.
   *
   * @param rowCount - number of body rows (optional): limits the result to `0 … rowCount - 1`
   *
   * @example
   * const sm = tableApi.getSelectionModel();
   * const rowIndices = sm?.getMergedRowIndices(tableModel.getBodyModel().getRowCount()) ?? [];
   */
  getMergedRowIndices(rowCount?: number) : number[];

  /** Removes the whole selection. */
  clear(): void;

  /** Is anything selected? */
  hasSelection(): boolean;

  /** Is nothing selected? */
  hasNoSelection(): boolean;

  /**
   * Adds a rectangle to the selection, e.g. `new CellRange(0, 0, 9, 3)` (rows 0–9, columns 0–3).
   * Cells removed before ({@link removeSelection}) are selected again – the last operation wins.
   */
  addSelection(range: CellRange): void;

  /** Removes a rectangle from the selection (also from "all selected"); a later {@link addSelection} selects it again. */
  removeSelection(range: CellRange): void;

  /** In how many selected ranges is this cell (0 = not selected)? */
  getSelectionCount(rowIndex: number, columnIndex: number): number;

  /** Selects all cells (⌘/Ctrl+A) – also those removed from the selection before. */
  selectAll(): void;

  /** Was everything selected with {@link selectAll}? */
  isAllSelected(): boolean;

  /** Called by the table on a click: starts a selection at this cell, depending on selection type and mode. */
  firstClick(rowIndex: number, columnIndex: number): void;
}
