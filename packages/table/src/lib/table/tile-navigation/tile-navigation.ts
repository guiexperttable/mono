/**
 * A keyboard move in a grid of tiles ({@link TileLayoutIf}): the tiles are **one sequence** of items, so `previous`
 * and `next` wrap over the end of a row. `first`/`last` are the first and last item.
 *
 * @category Keyboard
 * @since 1.1.115
 */
export type TileNavigationAction = "previous" | "next" | "up" | "down" | "first" | "last" | "pageUp" | "pageDown";

/**
 * The geometry {@link navigateTiles} computes with.
 *
 * @category Keyboard
 * @since 1.1.115
 */
export interface TileNavigationLayoutIf {
  /** Number of shown items. */
  count: number;
  /** Tiles per row (values below 1 count as 1). */
  perRow: number;
  /** Rows of a page for `pageUp`/`pageDown` (values below 1 count as 1). */
  pageRows: number;
  /** Where a move starts without a focused item (default 0): the first item of the first visible row. */
  firstVisible?: number;
}

/**
 * The item a keyboard move in a grid of tiles leads to – index arithmetic only, O(1) for any number of items.
 *
 * - `previous` / `next`: one item back / forward, wrapping over the end of a row; the focus stays on the first and
 *   on the last item.
 * - `up` / `down`: one row, same column. `down` without an item below goes to the last item if there is an
 *   (incomplete) row below, otherwise the focus stays.
 * - `first` / `last`: the first / last item.
 * - `pageUp` / `pageDown`: `pageRows` rows, same column; beyond the start the same column of the first row, beyond
 *   the end the same column of the last row (the last item if that tile is empty).
 * - Without a focused item (`index` outside `0 … count - 1`) a move starts at `firstVisible`.
 *
 * @param {number} index - index of the focused item, `-1` if none
 * @param {TileNavigationAction} action - the move
 * @param {TileNavigationLayoutIf} layout - item count, tiles per row, rows per page
 * @returns {number} index of the target item (always inside the items), `-1` without items
 *
 * @example
 * // 5 items, 2 per row:  [0 1] [2 3] [4 ·]
 * const layout = { count: 5, perRow: 2, pageRows: 1 };
 * navigateTiles(1, "next", layout);   // 2 – wraps into the next row
 * navigateTiles(3, "down", layout);   // 4 – no item below: the last item
 * navigateTiles(4, "next", layout);   // 4 – stays on the last item
 *
 * @category Keyboard
 * @since 1.1.115
 */
export function navigateTiles(index: number, action: TileNavigationAction, layout: TileNavigationLayoutIf): number {
  const count = Math.floor(layout.count);
  if (!(count > 0)) {
    return -1;
  }
  const last = count - 1;
  if (action === "first") {
    return 0;
  }
  if (action === "last") {
    return last;
  }
  if (!(index >= 0 && index <= last)) {
    return Math.min(last, Math.max(0, Math.floor(layout.firstVisible ?? 0)));
  }
  const perRow = Math.max(1, Math.floor(layout.perRow) || 1);
  const pageRows = Math.max(1, Math.floor(layout.pageRows) || 1);
  const column = index % perRow;
  const lastRowStart = last - (last % perRow);
  /** the tile of this column in the last row, the last item if that tile is empty */
  const inLastRow = () => Math.min(last, lastRowStart + column);

  switch (action) {
    case "previous":
      return Math.max(0, index - 1);
    case "next":
      return Math.min(last, index + 1);
    case "up":
      return index - perRow >= 0 ? index - perRow : index;
    case "down":
      return index + perRow <= last ? index + perRow : (index < lastRowStart ? last : index);
    case "pageUp": {
      const target = index - pageRows * perRow;
      return target >= 0 ? target : column;
    }
    default: {
      const target = index + pageRows * perRow;
      return target <= last ? target : (index < lastRowStart ? inLastRow() : index);
    }
  }
}

/**
 * Row and column of a tile.
 *
 * @param {number} index - index of the item
 * @param {number} perRow - tiles per row (values below 1 count as 1)
 * @returns {[number, number]} `[rowIndex, columnIndex]`, `[-1, -1]` for a negative index
 *
 * @example
 * tileIndexToCell(4, 3);   // [1, 1]
 *
 * @category Keyboard
 * @since 1.1.115
 */
export function tileIndexToCell(index: number, perRow: number): [number, number] {
  if (!(index >= 0)) {
    return [-1, -1];
  }
  const n = Math.max(1, Math.floor(perRow) || 1);
  return [Math.floor(index / n), index % n];
}

/**
 * The index of the tile in a cell (`rowIndex * perRow + columnIndex`).
 *
 * @param {number} rowIndex - row of the cell
 * @param {number} columnIndex - column of the cell
 * @param {number} perRow - tiles per row (values below 1 count as 1)
 * @returns {number} the index, `-1` for a cell outside the grid (negative, or a column behind the row)
 *
 * @example
 * cellToTileIndex(1, 1, 3);   // 4
 *
 * @category Keyboard
 * @since 1.1.115
 */
export function cellToTileIndex(rowIndex: number, columnIndex: number, perRow: number): number {
  const n = Math.max(1, Math.floor(perRow) || 1);
  if (!(rowIndex >= 0) || !(columnIndex >= 0) || columnIndex >= n) {
    return -1;
  }
  return rowIndex * n + columnIndex;
}
