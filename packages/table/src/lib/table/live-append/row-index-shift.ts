/**
 * How the display indices of the body rows move when rows are removed and inserted in one step (live data:
 * `tableApi.appendRows()` / `rowsAppended()`, since 1.1.108) – so selection, focus and anchor stay at the same rows
 * instead of being cleared. DOM-free.
 *
 * Order: first the `removed` rows leave (indices **before** the step), then the `inserted` rows come in (indices
 * **after** the step). An old row keeps its relative order.
 *
 * @example
 * // 2 rows dropped at the start (ring buffer), 3 appended at the end of 10 → 11 rows
 * const shift = new RowIndexShift([0, 1], [8, 9, 10]);
 * shift.mapIndex(5);        // 3
 * shift.mapIndex(1);        // -1 (removed)
 *
 * @example
 * // sorted: one row inserted at display index 2 (between the old rows 1 and 2)
 * const shift = new RowIndexShift([], [2]);
 * shift.mapRange(0, 4);     // [[0, 1], [3, 5]] – the new row splits the range (it is not selected)
 *
 * @category Live data
 * @since 1.1.108
 */
export class RowIndexShift {

  private readonly removed: ArrayLike<number>;
  private readonly inserted: ArrayLike<number>;
  /** inserted[j] - j: the number of old rows in front of the inserted row j (non-decreasing) */
  private readonly insertBefore: Int32Array;

  /**
   * @param {ArrayLike<number>} removed - display indices before the step of the removed rows, ascending, unique
   * @param {ArrayLike<number>} inserted - display indices after the step of the inserted rows, ascending, unique
   */
  constructor(removed: ArrayLike<number> = [], inserted: ArrayLike<number> = []) {
    this.removed = removed;
    this.inserted = inserted;
    this.insertBefore = new Int32Array(inserted.length);
    for (let j = 0; j < inserted.length; j++) {
      this.insertBefore[j] = inserted[j] - j;
    }
  }

  /** True if nothing moves (no row removed, none inserted). */
  isEmpty(): boolean {
    return this.removed.length === 0 && this.inserted.length === 0;
  }

  /** Number of removed rows. */
  getRemovedCount(): number {
    return this.removed.length;
  }

  /** Number of inserted rows. */
  getInsertedCount(): number {
    return this.inserted.length;
  }

  /**
   * True if a row at an old display index `<= index` is removed or a row is inserted in front of the old row `index`
   * (i.e. the rows `0 … index` are not the same as before).
   *
   * @param {number} index - an old display index
   * @returns {boolean} true if the rows up to this index changed
   */
  touchesUpTo(index: number): boolean {
    if (this.removed.length && this.removed[0] <= index) {
      return true;
    }
    return this.insertBefore.length > 0 && this.insertBefore[0] <= index;
  }

  /**
   * The new display index of an old one.
   *
   * @param {number} index - display index before the step
   * @returns {number} the index after the step, -1 if the row was removed (or `index` is negative)
   */
  mapIndex(index: number): number {
    if (index < 0) {
      return -1;
    }
    const removedBefore = lowerBound(this.removed, index);
    if (removedBefore < this.removed.length && this.removed[removedBefore] === index) {
      return -1;
    }
    const kept = index - removedBefore;
    return kept + upperBound(this.insertBefore, kept);
  }

  /**
   * The display index after the step of the first remaining row at or after an old index – for a position that
   * must stay on a row (e.g. the first visible row) when that row itself was removed.
   *
   * @param {number} index - display index before the step
   * @returns {number} the index after the step (the end if no old row at or after `index` remains)
   */
  mapIndexOrNext(index: number): number {
    // the old rows in front of `index` that remain = the kept index of the first remaining row at or after it
    const kept = Math.max(0, index - lowerBound(this.removed, index));
    return kept + upperBound(this.insertBefore, kept);
  }

  /**
   * The new ranges of an old range of rows `lo … hi` (inclusive): removed rows leave it, inserted rows inside split
   * it (they are not part of it). `hi = Number.MAX_SAFE_INTEGER` (whole columns) stays open at the end.
   *
   * @param {number} lo - first row of the range before the step
   * @param {number} hi - last row of the range before the step (inclusive)
   * @returns {[number, number][]} the pieces after the step, ascending, `[]` if all its rows were removed
   */
  mapRange(lo: number, hi: number): [number, number][] {
    if (lo > hi) {
      [lo, hi] = [hi, lo];
    }
    const open = hi >= Number.MAX_SAFE_INTEGER;
    // after removing: the remaining rows of the range are the kept indices kLo … kHi
    const kLo = lo - lowerBound(this.removed, lo);
    const kHi = open ? Number.MAX_SAFE_INTEGER : hi - lowerBound(this.removed, hi + 1);
    if (kHi < kLo) {
      return [];
    }
    // inserting: a row j comes in front of the kept row insertBefore[j]; inside the range when kLo < it ≤ kHi
    const pieces: [number, number][] = [];
    let start = kLo;
    let shift = upperBound(this.insertBefore, kLo);
    for (let j = shift; j < this.insertBefore.length && this.insertBefore[j] <= kHi; j++) {
      const before = this.insertBefore[j];
      if (before > start) {
        pieces.push([start + shift, before - 1 + shift]);
        start = before;
      }
      shift++;
    }
    pieces.push([start + shift, open ? Number.MAX_SAFE_INTEGER : kHi + shift]);
    return pieces;
  }

}

/** Number of values `< x` in an ascending array. */
function lowerBound(arr: ArrayLike<number>, x: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < x) lo = mid + 1; else hi = mid;
  }
  return lo;
}

/** Number of values `<= x` in an ascending array. */
function upperBound(arr: ArrayLike<number>, x: number): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= x) lo = mid + 1; else hi = mid;
  }
  return lo;
}
