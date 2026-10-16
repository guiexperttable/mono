import type { RowDropTargetIf } from "./row-drop-target.if";
import type { TreeRowIf } from "../data/common/tree-row-if";

/**
 * Sorted, unique row indices inside `0 … rowCount - 1` (the order of the dragged rows is their display order).
 *
 * @param {number[]} rowIndices - any indices, e.g. from a selection
 * @param {number} rowCount - number of rows
 * @returns {number[]} a new, ascending array
 *
 * @example
 * normalizeRowIndices([5, 2, 2, 99, -1], 10);   // [2, 5]
 *
 * @category Row drag
 * @since 1.1.95
 */
export function normalizeRowIndices(rowIndices: readonly number[], rowCount: number): number[] {
  if (isNormalized(rowIndices, rowCount)) {
    return rowIndices as number[]; // the common case (already normalized, e.g. a big selection): no copy, no sort
  }
  return Array.from(new Set(rowIndices))
    .filter(i => Number.isInteger(i) && i >= 0 && i < rowCount)
    .sort((a, b) => a - b);
}

function isNormalized(rowIndices: readonly number[], rowCount: number): boolean {
  let last = -1;
  for (const i of rowIndices) {
    if (!Number.isInteger(i) || i <= last || i >= rowCount) return false;
    last = i;
  }
  return true;
}

/**
 * The index in front of which the rows are inserted (before the move): `"after"` row 7 = in front of row 8.
 * `"inside"` counts like `"after"` (flat lists have no children).
 *
 * @param {RowDropTargetIf} target - the drop target
 * @returns {number} the insert position, 0 … rowCount
 *
 * @example
 * getInsertBeforeIndex({ rowIndex: 7, position: "after" });    // 8
 *
 * @category Row drag
 * @since 1.1.95
 */
export function getInsertBeforeIndex(target: RowDropTargetIf): number {
  return target.position === "before" ? target.rowIndex : target.rowIndex + 1;
}

/**
 * The index of the first moved row after a move in a flat list: the insert position minus the moved rows in front
 * of it. A target inside the moved rows (or right next to them) returns their current index – nothing changes.
 *
 * @param {number[]} rowIndices - ascending, unique row indices ({@link normalizeRowIndices})
 * @param {RowDropTargetIf} target - the drop target
 * @returns {number} the new index of the first moved row, -1 without rows
 *
 * @example
 * // D1: row 3 (index 2) dropped between row 7 and 8 → it is row 7 (index 6) afterwards
 * calcMoveToIndex([2], { rowIndex: 6, position: "after" });   // 6
 *
 * @category Row drag
 * @since 1.1.95
 */
export function calcMoveToIndex(rowIndices: readonly number[], target: RowDropTargetIf): number {
  if (!rowIndices.length) {
    return -1;
  }
  const insertBefore = getInsertBeforeIndex(target);
  return insertBefore - rowIndices.filter(i => i < insertBefore).length;
}

/**
 * Moves items of an array **in place** (like `Array.prototype.sort`): the items at `indices` keep their order and are
 * inserted in front of `insertBefore` (an index of the array before the move, `array.length` = at the end).
 *
 * @param {T[]} array - the array to change
 * @param {number[]} indices - ascending, unique indices ({@link normalizeRowIndices})
 * @param {number} insertBefore - 0 … array.length
 * @returns {number} the new index of the first moved item (-1 if nothing was given)
 *
 * @example
 * const list = ["a", "b", "c", "d", "e"];
 * moveArrayItems(list, [1, 3], 5);   // 3
 * list;                              // ["a", "c", "e", "b", "d"]
 *
 * @category Row drag
 * @since 1.1.95
 */
export function moveArrayItems<T>(array: T[], indices: readonly number[], insertBefore: number): number {
  const valid = normalizeRowIndices(indices, array.length);
  if (!valid.length) {
    return -1;
  }
  const before = Math.min(Math.max(0, insertBefore), array.length);
  // one pass, no spread (hundreds of thousands of moved rows must not hit the argument limit), O(n)
  const moved = new Uint8Array(array.length);
  valid.forEach(i => moved[i] = 1);
  const items: T[] = new Array(valid.length);
  valid.forEach((i, k) => items[k] = array[i]);
  const rest: T[] = [];
  let newIndex = -1;
  for (let i = 0; i <= array.length; i++) {
    if (i === before) newIndex = rest.length;
    if (i < array.length && !moved[i]) rest.push(array[i]);
  }
  let w = 0;
  for (let i = 0; i < newIndex; i++) array[w++] = rest[i];
  for (const item of items) array[w++] = item;
  for (let i = newIndex; i < rest.length; i++) array[w++] = rest[i];
  return newIndex;
}

/**
 * The dragged tree rows without the ones that travel with an ancestor (a child of a dragged node moves with it).
 *
 * @param {TreeRowIf<S>[]} rows - dragged rows in display order
 * @returns {TreeRowIf<S>[]} the topmost dragged rows, same order
 *
 * @category Row drag
 * @since 1.1.95
 */
export function getTopmostTreeRows<S>(rows: readonly TreeRowIf<S>[]): TreeRowIf<S>[] {
  const set = new Set(rows);
  return rows.filter(row => {
    for (let p = row.parent; p; p = p.parent) {
      if (set.has(p)) return false;
    }
    return true;
  });
}

/**
 * True if the tree rows can be dropped at the target row: the target is none of the dragged rows and no descendant
 * of them (a node cannot become its own child – no cycle).
 *
 * @param {TreeRowIf<S>[]} rows - dragged rows
 * @param {TreeRowIf<S>} targetRow - the row under the drop marker
 * @returns {boolean} false for a cycle
 *
 * @example
 * const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
 * const node = treeModel.rows[0];
 * canMoveTreeRows([node], node.children?.[0]);   // false – into its own child
 *
 * @category Row drag
 * @since 1.1.95
 */
export function canMoveTreeRows<S>(rows: readonly TreeRowIf<S>[], targetRow: TreeRowIf<S> | undefined): boolean {
  if (!targetRow || !rows.length) {
    return false;
  }
  const set = new Set(rows);
  for (let r: TreeRowIf<S> | undefined = targetRow; r; r = r.parent) {
    if (set.has(r)) return false;
  }
  return true;
}

/**
 * Moves tree rows **in place**: in front of / behind `targetRow` (siblings, same parent) or `"inside"` it (last
 * children; the target is expanded). Children travel with their parent; `parent` and `deep` are updated.
 *
 * @param {TreeRowIf<S>[]} roots - the top-level rows (e.g. `AreaModelTree.rows`)
 * @param {TreeRowIf<S>[]} rows - dragged rows in display order
 * @param {TreeRowIf<S>} targetRow - the row under the drop marker
 * @param {"before" | "after" | "inside"} position - where to drop
 * @returns {boolean} false if nothing was moved (cycle, no rows)
 *
 * @example
 * const treeModel = tableModel.getBodyModel() as AreaModelTree<OrderNode>;
 * moveTreeRows(treeModel.rows, [treeModel.rows[2]], treeModel.rows[0], "inside");   // 3rd root → child of the 1st
 * treeModel.recalcVisibleTreeRows();
 *
 * @category Row drag
 * @since 1.1.95
 */
export function moveTreeRows<S>(
  roots: TreeRowIf<S>[],
  rows: readonly TreeRowIf<S>[],
  targetRow: TreeRowIf<S>,
  position: RowDropTargetIf["position"]
): boolean {
  const moving = getTopmostTreeRows(rows);
  if (!canMoveTreeRows(moving, targetRow)) {
    return false;
  }
  for (const row of moving) {
    const siblings = row.parent ? row.parent.children : roots;
    const i = siblings?.indexOf(row) ?? -1;
    if (siblings && i > -1) {
      siblings.splice(i, 1);
    }
  }
  let parent: TreeRowIf<S> | undefined;
  let destination: TreeRowIf<S>[];
  let index: number;
  if (position === "inside") {
    parent = targetRow;
    targetRow.children = targetRow.children ?? [];
    destination = targetRow.children;
    index = destination.length;
    targetRow.expanded = true;
  } else {
    parent = targetRow.parent;
    destination = parent ? (parent.children ?? (parent.children = [])) : roots;
    index = destination.indexOf(targetRow) + (position === "after" ? 1 : 0);
  }
  destination.splice(index, 0, ...moving);
  for (const row of moving) {
    row.parent = parent;
    setDeep(row, parent ? parent.deep + 1 : 0);
  }
  return true;
}

function setDeep<S>(row: TreeRowIf<S>, deep: number): void {
  row.deep = deep;
  for (const child of row.children ?? []) {
    setDeep(child, deep + 1);
  }
}

/**
 * Flat area models: true if the dragged rows can be moved – all rows are displayed (no filter hides one), the target
 * row exists and is not `"inside"`.
 *
 * @param {number} displayedCount - displayed rows (`getRowCount()`)
 * @param {number} allCount - all rows (`getUnfilteredRowCount()`)
 * @param {number[]} rowIndices - display indices of the dragged rows
 * @param {RowDropTargetIf} target - the drop target
 * @returns {boolean} true if a move is possible
 *
 * @category Row drag
 * @since 1.1.95
 */
export function canMoveFlatRows(displayedCount: number, allCount: number, rowIndices: readonly number[],
                                target: RowDropTargetIf): boolean {
  return displayedCount === allCount
    && target.position !== "inside"
    && Number.isInteger(target.rowIndex) && target.rowIndex >= 0 && target.rowIndex < displayedCount
    && normalizeRowIndices(rowIndices, displayedCount).length > 0;
}

/**
 * Flat area models: moves the rows in the displayed array and writes the new order back to the array of all rows –
 * both in place. Used by `AreaModelObjectArray` and `AreaModelArrayOfArrays`.
 *
 * @param {T[]} displayed - displayed rows (display order)
 * @param {T[]} all - all rows (same rows – no filter hides one)
 * @param {number[]} rowIndices - display indices of the dragged rows
 * @param {RowDropTargetIf} target - the drop target
 * @returns {boolean} true if moved
 *
 * @category Row drag
 * @since 1.1.95
 */
export function moveFlatRows<T>(displayed: T[], all: T[], rowIndices: readonly number[], target: RowDropTargetIf): boolean {
  if (!canMoveFlatRows(displayed.length, all.length, rowIndices, target)) {
    return false;
  }
  moveArrayItems(displayed, normalizeRowIndices(rowIndices, displayed.length), getInsertBeforeIndex(target));
  if (all !== displayed) {
    for (let i = 0; i < displayed.length; i++) {
      all[i] = displayed[i];
    }
  }
  return true;
}

/**
 * The row at a content position (y in px from the top of all body rows): constant row heights are computed directly,
 * variable ones by a binary search over the row tops. Positions above / below the rows give the first / last row.
 *
 * @param {number} contentY - y in content pixels
 * @param {number} rowCount - number of rows (> 0)
 * @param {(rowIndex: number) => number} getYPosByRowIndex - top of a row in content pixels (`AreaModelIf.getYPosByRowIndex`)
 * @param {number} [constantRowHeight] - the height of every row, if they are all equal (`AreaModelIf.getConstantRowHeight`)
 * @returns {number} the row index, 0 … rowCount - 1
 *
 * @example
 * const body = tableModel.getBodyModel();
 * const rowIndex = findRowIndexAtY(1234, body.getRowCount(), i => body.getYPosByRowIndex(i), body.getConstantRowHeight?.());
 *
 * @category Row drag
 * @since 1.1.95
 */
export function findRowIndexAtY(
  contentY: number,
  rowCount: number,
  getYPosByRowIndex: (rowIndex: number) => number,
  constantRowHeight?: number
): number {
  if (rowCount < 1) {
    return -1;
  }
  if (constantRowHeight && constantRowHeight > 0) {
    return Math.min(rowCount - 1, Math.max(0, Math.floor(contentY / constantRowHeight)));
  }
  let lo = 0;
  let hi = rowCount - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (getYPosByRowIndex(mid) <= contentY) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}
