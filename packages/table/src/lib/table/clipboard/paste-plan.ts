import { CellRange } from "../data/common/cell-range";

/**
 * Input of {@link computePastePlan}: what is pasted and where. All rows are **displayed** rows (display order after
 * sorting and filtering), columns are model indices; `shownColumns` lists the visible columns in display order –
 * hidden columns are skipped and not counted (like the fill handle).
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface PasteRequestIf<V = unknown> {
  /** The pasted cells (rows of values, at least one row and one column). */
  matrix: ReadonlyArray<ReadonlyArray<V>>;
  /** First row of the target (display index). */
  anchorRow: number;
  /** First column of the target (model index, must be in `shownColumns`). */
  anchorColumn: number;
  /** The visible columns (model indices) in display order. */
  shownColumns: ReadonlyArray<number>;
  /** Number of displayed body rows. */
  rowCount: number;
  /**
   * The selected target in rows × shown columns (from the anchor), if a range is selected: an integer multiple of
   * the matrix tiles it (Excel), a single value fills it.
   */
  selection?: { rows: number; columns: number };
  /** True if rows may be added below the last row (`pasteAddsRows`). */
  canAddRows?: boolean;
  /** `false` skips a target cell (not editable, calculated, group row); it still counts for the layout. */
  isWritable?: (rowIndex: number, columnIndex: number) => boolean;
}

/**
 * Result of {@link computePastePlan}.
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export interface PastePlanIf<V = unknown> {
  /** The cells to write: display row (may be ≥ `rowCount` for added rows), model column, value. */
  cells: { rowIndex: number; columnIndex: number; value: V }[];
  /** The covered target (display rows, model columns from the first to the last shown column). */
  range: CellRange;
  /** Target cells left out because they are not writable. */
  skipped: number;
  /** Cells cut off at the last column (or the last row without `canAddRows`). */
  clipped: number;
  /** Rows to add below the last row before writing (`canAddRows`). */
  addRows: number;
}

/**
 * Where pasted cells go, like Excel: from the anchor, once – or tiled over a selected range that is an integer
 * multiple of the matrix, a single value into every cell of the selected range; cut off at the last column (and at
 * the last row unless rows may be added); cells that are not writable are skipped. DOM-free.
 *
 * @param {PasteRequestIf<V>} req - matrix, target and table size
 * @returns {PastePlanIf<V>} the cells to write
 *
 * @example
 * const plan = computePastePlan({ matrix: [["x"]], anchorRow: 1, anchorColumn: 2, shownColumns: [0, 1, 2, 3],
 *   rowCount: 10, selection: { rows: 3, columns: 1 } });
 * plan.cells.length;   // 3 – rows 1…3 of column 2
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function computePastePlan<V>(req: PasteRequestIf<V>): PastePlanIf<V> {
  const { matrix, anchorRow, shownColumns, rowCount } = req;
  const mRows = matrix.length;
  const mCols = matrix.reduce((max, r) => Math.max(max, r.length), 0);
  const startShown = shownColumns.indexOf(req.anchorColumn);
  const empty: PastePlanIf<V> = {
    cells: [], range: new CellRange(anchorRow, req.anchorColumn, anchorRow, req.anchorColumn), skipped: 0, clipped: 0,
    addRows: 0,
  };
  if (!mRows || !mCols || startShown < 0 || anchorRow < 0) {
    return empty;
  }
  const { rows, columns: cols } = getPasteSize(mRows, mCols, req.selection);
  const availableColumns = shownColumns.length - startShown;
  const usedCols = Math.min(cols, availableColumns);
  let clipped = (cols - usedCols) * rows;
  const availableRows = rowCount - anchorRow;
  let usedRows = rows;
  let addRows = 0;
  if (rows > availableRows) {
    if (req.canAddRows) {
      addRows = rows - Math.max(0, availableRows);
    } else {
      usedRows = Math.max(0, availableRows);
      clipped += (rows - usedRows) * usedCols;
    }
  }
  const cells: PastePlanIf<V>["cells"] = [];
  let skipped = 0;
  for (let dr = 0; dr < usedRows; dr++) {
    const rowIndex = anchorRow + dr;
    const source = matrix[dr % mRows];
    for (let dc = 0; dc < usedCols; dc++) {
      const columnIndex = shownColumns[startShown + dc];
      if (rowIndex < rowCount && req.isWritable && !req.isWritable(rowIndex, columnIndex)) {
        skipped++;
        continue;
      }
      const value = source[dc % mCols] ?? ("" as unknown as V);
      cells.push({ rowIndex, columnIndex, value });
    }
  }
  if (!usedRows || !usedCols) {
    return { ...empty, clipped };
  }
  return {
    cells,
    range: new CellRange(anchorRow, req.anchorColumn, anchorRow + usedRows - 1, shownColumns[startShown + usedCols - 1]),
    skipped,
    clipped,
    addRows,
  };
}

/**
 * The size a paste covers before cutting off: the matrix – or the selected range if the matrix is a single value or
 * fits into it an integer number of times (tiling, Excel).
 *
 * @param {number} matrixRows - rows of the pasted cells
 * @param {number} matrixColumns - columns of the pasted cells
 * @param {{ rows: number, columns: number }} [selection] - the selected range (rows × shown columns)
 * @returns {{ rows: number, columns: number }} the covered size
 *
 * @example
 * getPasteSize(2, 1, { rows: 6, columns: 1 });   // { rows: 6, columns: 1 } – three times
 * getPasteSize(2, 1, { rows: 5, columns: 1 });   // { rows: 2, columns: 1 } – once
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function getPasteSize(matrixRows: number, matrixColumns: number,
                             selection?: { rows: number; columns: number }): { rows: number; columns: number } {
  if (selection && (selection.rows > 1 || selection.columns > 1) && matrixRows > 0 && matrixColumns > 0) {
    if ((matrixRows === 1 && matrixColumns === 1)
      || (selection.rows % matrixRows === 0 && selection.columns % matrixColumns === 0)) {
      return { rows: selection.rows, columns: selection.columns };
    }
  }
  return { rows: matrixRows, columns: matrixColumns };
}
