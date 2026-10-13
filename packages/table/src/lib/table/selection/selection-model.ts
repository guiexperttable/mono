import { CellRange } from "../data/common/cell-range";
import { ExtendedSelectionType, SelectionMode } from './selection.type';
import { SelectionModelIf } from "./selection-model.if";
import { EventSelectionChangedListenerIf } from './event-selection-changed-listener.if';
//import { AvoidDoubleExecution } from '../../common/decorator/avoid-double-execution.decorator';


/**
 * `SelectionModel` is a class that manages the various modes and types of selections within a grid.
 * It supports basic modes like single cell, row, column, and range selections, as well as advanced mode like negative ranges.
 * Events related to selections, such as changes to a selection, are propagated to listeners through the EventSelectionChangedListener interface.
 *
 * The class extends `SelectionModelIf` interface and defines additional methods and fields specific to its functionality.
 *
 * @property {ExtendedSelectionType} selectionType - The type of selection being used. It's of type ExtendedSelectionType. Default: "none"
 * @property {SelectionMode} selectionMode - The mode of selection being used. It's of type SelectionMode. Default: "single"
 * @property {Array} ranges - This contains all the current selected cell ranges in the grid.
 * @property {Array} negativeRanges - This contains all the current negative cell ranges in the grid.
 * @property {boolean} allSelected - This is a flag to indicate whether all cells in the grid are selected or not.
 * @property {boolean} silent - This is a flag to suppress the firing of selection change events.
 * @property {Array} listenerArr - This contains all the listeners for selection change events.
 *
 * @method constructor(selectionType?: ExtendedSelectionType, selectionMode?: SelectionMode) - Constructs a new instance of the SelectionModel class.
 * @method getEventSelectionChangedListeners(): EventSelectionChangedListenerIf[] - Returns the array of registered event selection changed listeners.
 * @method addEventSelectionChangedListener(listener: EventSelectionChangedListenerIf): void - Adds an event selection changed listener to the array.
 * @method removeEventSelectionChangedListener(listener: EventSelectionChangedListenerIf): void - Removes a specific event selection changed listener if it exists.
 * @method fireChangeEvent(): void - Fires a change event on each registered listener when a selection change occurs. Does nothing if the silent property is true.
 * @method firstClick(rowIndex: number, columnIndex: number): void - Initiates a selection operation at the specified coordinates. The nature of the operation is determined by the current selection type and mode.
 * @method getSelectionCount(rowIndex: number, columnIndex: number): number - Returns the selection count of current ranges
 * @method isInNegativeRange(rowIndex: number, columnIndex: number): boolean - Verifies if any point (cell) is in negative range or not.
 * @method getRanges() - Returns the selection ranges
 * @method clear(): void - Clears all selections in all ranges and resets allSelected and negativeRanges arrays.
 * @method hasSelection(): boolean - Checks whether there is any selection. Returns true if yes, false if no.
 * @method hasNoSelection(): boolean - Checks whether there is no selection. Returns true if yes, false if no.
 * @method getMergedRowIndices(rowCount?: number): number[] - Gets the sorted indices of all rows with at least one selected cell.
 * @method selectAll(): void - Selects all selectable entities (also cells that were deselected before).
 * @method isAllSelected() - Checks if all selectable entities are selected.
 * @method addSelection(range: CellRange): void - Adds a certain range to the selection (selects removed cells again).
 * @method removeSelection(range: CellRange): void - Removes a certain range from the selection.
 * @method togglePoint(row: number, col: number): void - Toggles the selection state of a point at the specified row and column in a grid.
 * @method isSelected(row: number, col: number): boolean - Checks if a specific cell in a grid is selected.
 * @method addRange(range: CellRange): void - Adds a range of cells to the selection.
 *
 * @category Selection & focus
 */
export class SelectionModel implements SelectionModelIf {

  protected ranges: CellRange[] = [];
  protected negativeRanges: CellRange[] = [];
  protected allSelected: boolean = false;

  protected silent = false;

  private listenerArr: EventSelectionChangedListenerIf[] = [];

  constructor(
    public selectionType: ExtendedSelectionType = "none",
    public selectionMode: SelectionMode = "single"
  ) {
  }

  getEventSelectionChangedListeners(): EventSelectionChangedListenerIf[]{
    return this.listenerArr;
  }

  addEventSelectionChangedListener(listener: EventSelectionChangedListenerIf): void {
    if (!this.listenerArr.includes(listener)) {
      this.listenerArr.push(listener);
    }
  }

  removeEventSelectionChangedListener(listener: EventSelectionChangedListenerIf): void {
    const index = this.listenerArr.indexOf(listener, 0);
    if (index > -1) {
      this.listenerArr.splice(index, 1);
    }
  }

  //@AvoidDoubleExecution(100)
  fireChangeEvent() {
    if (!this.silent) {
      this.listenerArr.forEach(l => l.onSelectionChanged(this));
    }
  }

  firstClick(rowIndex: number, columnIndex: number): void {
     if (this.selectionType === 'row') {
       this.addRange(CellRange.singleRow(rowIndex));
     } else if (this.selectionType === 'column') {
       this.addRange(CellRange.singleColumn(columnIndex));
     }
  }

  getSelectionCount(rowIndex: number, columnIndex: number): number {
    let count = 0;
    for (const range of this.ranges) {
      if (range.isInRange(rowIndex, columnIndex)) {
        count++;
      }
    }
    if (this.allSelected) {
      count++;
    }
    if (this.isInNegativeRange(rowIndex, columnIndex)) {
      count = 0;
    }
    return count;
  }

  isInNegativeRange(rowIndex: number, columnIndex: number): boolean {
    for (const range of this.negativeRanges) {
      if (range.isInRange(rowIndex, columnIndex)) {
        return true;
      }
    }
    return false;
  }

  getRanges() {
    return this.ranges;
  }

  clear(): void {
    this.ranges = [];
    this.negativeRanges = [];
    this.allSelected = false;
    this.fireChangeEvent();
  }

  hasSelection(): boolean {
    return this.allSelected || !!this.ranges.length;
  }

  hasNoSelection(): boolean {
    return !this.hasSelection();
  }

  /**
   * The indices of all rows that contain at least one selected cell, sorted ascending and without duplicates.
   * A row whose selected cells were all removed again ({@link removeSelection}) is left out.
   *
   * Ranges that cover all rows (selection type `"column"`, {@link CellRange.singleColumn}: `r2 = Number.MAX_SAFE_INTEGER`)
   * and {@link selectAll} can only be resolved with `rowCount`. Without it they are skipped (before, such a range
   * made this method loop forever) – pass the number of (displayed) body rows to get them, too.
   *
   * @param {number} [rowCount] - number of body rows; rows `>= rowCount` are left out, and "all rows"
   *   (column ranges, {@link selectAll}) becomes `0 … rowCount - 1`
   * @returns {number[]} row indices, sorted ascending
   *
   * @example
   * const rowCount = tableModel.getBodyModel().getRowCount();
   * const rowIndices = selectionModel.getMergedRowIndices(rowCount);   // e.g. [1, 2, 5]
   * console.log(`${rowIndices.length} rows with selected cells`);
   */
  getMergedRowIndices(rowCount?: number) : number[] {
    const maxRow = rowCount === undefined ? undefined : rowCount - 1;
    const candidates = [...this.ranges];
    if (this.allSelected && maxRow !== undefined) {
      candidates.push(new CellRange(0, 0, maxRow, Number.MAX_SAFE_INTEGER));
    }
    const mergedRowIndices = new Set<number>();
    for (const range of candidates) {
      const r1 = Math.max(range.r1, 0);
      const r2 = maxRow === undefined ? range.r2 : Math.min(range.r2, maxRow);
      if (maxRow === undefined && !(r2 < Number.MAX_SAFE_INTEGER)) {
        continue; // all rows – can't be listed without rowCount
      }
      const negatives = this.negativeRanges.filter(n => SelectionModel.intersects(n, range));
      for (let r = r1; r <= r2; r++) {
        if (!mergedRowIndices.has(r)
          && (!negatives.length || !SelectionModel.coversColumns(negatives, r, range.c1, range.c2))) {
          mergedRowIndices.add(r);
        }
      }
    }
    return Array.from(mergedRowIndices).sort((a, b) => a - b);
  }

  /**
   * Selects all cells. Cells that were deselected before ({@link removeSelection}) are selected again;
   * removing cells afterwards cuts holes into "all selected".
   */
  selectAll() {
    this.allSelected = true;
    this.negativeRanges = [];
    this.fireChangeEvent();
  }

  isAllSelected() {
    return this.allSelected;
  }

  /**
   * Adds a rectangle to the selection (adjusted to the selection type: whole rows for `"row"`, whole columns for
   * `"column"`, the first cell for `"cell"`). Cells of the rectangle that were deselected before
   * ({@link removeSelection}) are selected again – the last operation wins.
   *
   * @param {CellRange} range - the cells to select (adjusted in place to the selection type)
   */
  addSelection(range: CellRange): void {
    this.addRange(range);
    this.fireChangeEvent();
  }

  /**
   * Deselects a rectangle (stored as a "negative" range, so it also cuts holes into {@link selectAll}).
   * For selection type `"row"` all rows `r1 … r2` are removed, for `"column"` all columns `c1 … c2`.
   * A following {@link addSelection} / {@link togglePoint} of these cells selects them again.
   *
   * @param {CellRange} range - the cells to deselect
   */
  removeSelection(range: CellRange): void {
    if (this.selectionType === "none") {
      return; // skip!
    }
    let r = range;
    if (this.selectionType === "row") {
      r = new CellRange(range.r1, 0, range.r2, Number.MAX_SAFE_INTEGER);
    } else if (this.selectionType === "column") {
      r = new CellRange(0, range.c1, Number.MAX_SAFE_INTEGER, range.c2);
    }
    this.negativeRanges.push(r);
    this.fireChangeEvent();
  }

  /**
   * Toggles the selection state of a cell (for selection type `"row"`/`"column"`: of its row/column).
   * A cell that was deselected inside a selected range (or after {@link selectAll}) gets selected again
   * without adding a second, overlapping range.
   *
   * @param {number} row - row index
   * @param {number} col - column index
   */
  togglePoint(row: number, col: number): void {
    if (this.getSelectionCount(row, col) > 0) {
      this.removeSelection(CellRange.singleCell(row, col));
    } else if (this.reselectPoint(row, col)) {
      this.fireChangeEvent();
    } else {
      this.addSelection(CellRange.singleCell(row, col));
    }
  }

  isSelected(row: number, col: number): boolean {
    return  this.getSelectionCount(row, col) > 0;
  }


  protected addRange(range: CellRange) {
    if (this.selectionType === "none") {
      return; // skip!
    }
    this.allSelected = false;
    if (this.selectionMode === "single") {
      // the new selection replaces the old one – including the cells removed from it
      this.ranges = [];
      this.negativeRanges = [];
    }
    this.adjustRangeToSelectionType(range);
    this.liftNegativeRanges(range);
    this.ranges.push(range);
    this.fireChangeEvent();
  }

  /**
   * Adjusts a range (in place) to the selection type: whole rows for `"row"`, whole columns for `"column"`,
   * the first cell for `"cell"`; `"range"` and `"none"` keep it as it is.
   *
   * @param {CellRange} range - the range to adjust
   * @returns {CellRange} the same range object
   */
  protected adjustRangeToSelectionType(range: CellRange): CellRange {
    if (this.selectionType === "row") {
      range.c1 = 0;
      range.c2 = Number.MAX_SAFE_INTEGER;
    } else if (this.selectionType === "column") {
      range.r1 = 0;
      range.r2 = Number.MAX_SAFE_INTEGER;
    } else if (this.selectionType === "cell") {
      range.r2 = range.r1;
      range.c2 = range.c1;
    } else if (this.selectionType === "range") {
      //
    }
    return range;
  }

  /**
   * Selects a deselected cell again ("toggle on") by lifting the negative ranges at this cell (for selection type
   * `"row"`/`"column"`: at its whole row/column) – only possible while the cell is still inside a selected range
   * or everything is selected. Fires no event.
   *
   * @param {number} row - row index
   * @param {number} col - column index
   * @returns {boolean} true if the cell is selected again, false if it has to be added as a new range
   */
  protected reselectPoint(row: number, col: number): boolean {
    if (this.selectionType === "none" || !this.isInNegativeRange(row, col)) {
      return false;
    }
    if (!this.allSelected && !this.ranges.some(r => r.isInRange(row, col))) {
      return false;
    }
    this.liftNegativeRanges(this.adjustRangeToSelectionType(CellRange.singleCell(row, col)));
    return true;
  }

  /**
   * Removes the cells of `range` from all negative ranges ("last operation wins": cells added after they were
   * removed are selected again). A negative range that overlaps `range` is split into up to four rectangles
   * (above, below, left and right of the overlap); unbounded ranges (`Number.MAX_SAFE_INTEGER`) work as well.
   *
   * @param {CellRange} range - the cells that are selected again
   */
  protected liftNegativeRanges(range: CellRange): void {
    if (!this.negativeRanges.length) {
      return;
    }
    const ret: CellRange[] = [];
    for (const n of this.negativeRanges) {
      const ir1 = Math.max(n.r1, range.r1);
      const ir2 = Math.min(n.r2, range.r2);
      const ic1 = Math.max(n.c1, range.c1);
      const ic2 = Math.min(n.c2, range.c2);
      if (ir1 > ir2 || ic1 > ic2) {
        ret.push(n); // no overlap
        continue;
      }
      if (n.r1 < ir1) ret.push(new CellRange(n.r1, n.c1, ir1 - 1, n.c2, n.gammaRange)); // above
      if (ir2 < n.r2) ret.push(new CellRange(ir2 + 1, n.c1, n.r2, n.c2, n.gammaRange)); // below
      if (n.c1 < ic1) ret.push(new CellRange(ir1, n.c1, ir2, ic1 - 1, n.gammaRange)); // left
      if (ic2 < n.c2) ret.push(new CellRange(ir1, ic2 + 1, ir2, n.c2, n.gammaRange)); // right
    }
    this.negativeRanges = ret;
  }

  private static intersects(a: CellRange, b: CellRange): boolean {
    return Math.max(a.r1, b.r1) <= Math.min(a.r2, b.r2)
      && Math.max(a.c1, b.c1) <= Math.min(a.c2, b.c2);
  }

  /** Are the columns c1 … c2 of this row completely covered by the given (negative) ranges? */
  private static coversColumns(ranges: CellRange[], row: number, c1: number, c2: number): boolean {
    const intervals = ranges
      .filter(r => r.r1 <= row && row <= r.r2 && r.c1 <= r.c2)
      .sort((a, b) => a.c1 - b.c1);
    let next = c1; // first column not covered yet
    for (const r of intervals) {
      if (r.c1 > next) {
        return false; // gap
      }
      if (r.c2 >= next) {
        next = r.c2 + 1;
      }
      if (next > c2) {
        return true;
      }
    }
    return next > c2;
  }

}
