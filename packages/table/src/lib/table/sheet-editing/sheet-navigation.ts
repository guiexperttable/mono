/**
 * The target of Ctrl+arrow (⌘+arrow on macOS) in Excel-style editing – Excel's rule for jumping to the edge of the
 * data: if the cell next to the start is empty, the next filled cell in that direction (or the last cell); if it is
 * filled, the last filled cell of that block. Empty = `null`, `undefined` or `""` (not `0`, not `false`).
 * DOM-free; hidden columns (`isShownColumn` → `false`) are skipped.
 *
 * @param {(row: number, column: number) => boolean} isEmpty - true for an empty cell
 * @param {number} rowCount - rows (display order)
 * @param {number} columnCount - columns (model indices)
 * @param {number} row - start row
 * @param {number} column - start column
 * @param {number} dRow - -1, 0 or 1
 * @param {number} dColumn - -1, 0 or 1
 * @param {(column: number) => boolean} [isShownColumn] - false for a hidden column
 * @returns {[number, number]} the target cell (the start if there is nothing to move to)
 *
 * @example
 * const data = [[1], [2], [""], [""], [5]];
 * const isEmpty = (r: number, c: number) => data[r][c] === "";
 * findDataEdge(isEmpty, 5, 1, 0, 0, 1, 0);   // [1, 0] – end of the block 1, 2
 * findDataEdge(isEmpty, 5, 1, 1, 0, 1, 0);   // [4, 0] – next filled cell
 *
 * @category Spreadsheet
 * @since 1.1.99
 */
export function findDataEdge(
  isEmpty: (row: number, column: number) => boolean,
  rowCount: number,
  columnCount: number,
  row: number,
  column: number,
  dRow: number,
  dColumn: number,
  isShownColumn: (column: number) => boolean = () => true
): [number, number] {
  const step = (r: number, c: number): [number, number] | undefined => {
    const nr = r + dRow;
    let nc = c + dColumn;
    while (dColumn !== 0 && nc >= 0 && nc < columnCount && !isShownColumn(nc)) {
      nc += dColumn;
    }
    return nr >= 0 && nr < rowCount && nc >= 0 && nc < columnCount ? [nr, nc] : undefined;
  };
  let next = step(row, column);
  if (!next) {
    return [row, column];
  }
  if (!isEmpty(row, column) && !isEmpty(next[0], next[1])) {
    // inside a block: to its last filled cell
    let last = next;
    for (let n = step(last[0], last[1]); n && !isEmpty(n[0], n[1]); n = step(n[0], n[1])) {
      last = n;
    }
    return last;
  }
  // at the edge of a block or in empty cells: to the next filled cell, otherwise to the last cell
  let last = next;
  while (isEmpty(next[0], next[1])) {
    const n = step(next[0], next[1]);
    if (!n) {
      return last;
    }
    last = next = n;
  }
  return next;
}

