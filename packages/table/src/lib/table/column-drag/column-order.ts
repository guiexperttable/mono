/**
 * DOM-free order rules of a column drag (prompt 022): columns with `movable: false` are fixed places – the movable
 * columns fill the other places –, and a column stays in its area (fixed west, center, fixed east).
 *
 * Not exported from the package: internals of {@link TableScope} and {@link TableStateService}.
 */

/**
 * The `changeColumnOrder(from, to)` calls that move the column at `from` to the index `to` while every locked column
 * keeps its index. Without a locked column between `from` and `to` this is the single move `[[from, to]]`.
 *
 * @param movable - per column: `false` = locked (fixed place)
 * @param from - current index of the dragged column
 * @param to - index the dragged column should get
 * @returns the moves in order, `[]` for `from === to`, `undefined` if the move is not allowed (a locked source or
 *          target, an index out of range)
 */
export function planColumnMove(movable: boolean[], from: number, to: number): [number, number][] | undefined {
  const count = movable.length;
  if (from < 0 || to < 0 || from >= count || to >= count || !movable[from] || !movable[to]) {
    return undefined;
  }
  if (from === to) {
    return [];
  }
  // the target order: the movable columns in their new order, filled into the places of the movable columns
  const places: number[] = [];
  const movables: number[] = [];
  for (let i = 0; i < count; i++) {
    if (movable[i]) {
      places.push(i);
      movables.push(i);
    }
  }
  movables.splice(places.indexOf(from), 1);
  movables.splice(places.indexOf(to), 0, from);
  const target = Array.from({ length: count }, (_, i) => i);
  places.forEach((place, k) => { target[place] = movables[k]; });

  // the main move, then put back what it pushed out of place (only locked columns between from and to)
  const moves: [number, number][] = [[from, to]];
  const current = target.map((_, i) => i);
  moveItem(current, from, to);
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  for (let i = lo; i <= hi; i++) {
    const at = current.indexOf(target[i]);
    if (at !== i) {
      moves.push([at, i]);
      moveItem(current, at, i);
    }
  }
  return moves;
}

/**
 * Limits a drop index to the area of the dragged column: a fixed west column stays west, a center column in the
 * center, a fixed east column east (before 1.1.110 a drag over the border silently changed which column was fixed).
 *
 * @param from - index of the dragged column
 * @param to - index under the mouse
 * @param count - number of columns
 * @param fixedLeft - `fixedLeftColumnCount`
 * @param fixedRight - `fixedRightColumnCount`
 * @returns `to` within the area of `from`
 */
export function clampToColumnArea(from: number, to: number, count: number, fixedLeft: number, fixedRight: number): number {
  const eastStart = Math.max(fixedLeft, count - fixedRight);
  let lo = 0;
  let hi = count - 1;
  if (from < fixedLeft) {
    hi = fixedLeft - 1;
  } else if (from >= eastStart) {
    lo = eastStart;
  } else {
    lo = fixedLeft;
    hi = eastStart - 1;
  }
  return Math.min(Math.max(to, lo), hi);
}

/**
 * A column order to apply (e.g. from a stored state) with the locked columns at their current index.
 *
 * @param target - the wanted order (properties)
 * @param current - the order now (properties)
 * @param locked - properties of the locked columns (`movable: false`)
 * @returns the order to apply
 */
export function orderKeepingLocked(target: string[], current: string[], locked: Set<string>): string[] {
  if (!locked.size) {
    return target;
  }
  const ret = target.filter(p => !locked.has(p));
  current.forEach((property, index) => {
    if (locked.has(property)) {
      ret.splice(Math.min(index, ret.length), 0, property);
    }
  });
  return ret;
}

function moveItem<T>(items: T[], from: number, to: number): void {
  const [item] = items.splice(from, 1);
  items.splice(to, 0, item);
}
