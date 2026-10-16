/**
 * Vertical positions of the body rows: the row heights as prefix sums plus optional extra heights behind single rows
 * (the detail rows of master/detail). DOM-free; the table keeps one instance for its body
 * ({@link RenderScope.getBodyRowTop}, {@link RenderScope.getBodyRowIndexAtY}).
 *
 * - Constant row height: positions are computed (`i * h`), no array.
 * - Variable row heights: a `Float64Array` of `rowCount + 1` prefix sums, built lazily on the first access after
 *   {@link setRows} – then {@link getTop} is O(1) and {@link findIndexAt} O(log n) (before 1.1.97 the table summed the
 *   heights of all rows above the viewport in every scroll frame).
 * - Extras: sorted row indices with their extra heights and the prefix sums of the extras (O(log k) per lookup,
 *   k = number of extras). Changing one extra height ({@link setExtraHeight}) costs O(k), not O(n).
 *
 * The slot of a row is the row plus its extra height below it: `getTop(i + 1) = getTop(i) + getRowHeight(i) +
 * getExtraHeight(i)`.
 *
 * @example
 * const layout = new RowLayout();
 * layout.setRows(1000, i => i % 2 ? 30 : 50);       // variable heights
 * layout.setExtras([12, 40], [180, 240]);            // details behind rows 12 and 40
 * const top = layout.getTop(41);                     // top of row 41 below both details
 * const row = layout.findIndexAt(5000);              // the row whose slot contains y = 5000
 *
 * @category Internals
 * @since 1.1.97
 */
export class RowLayout {

  private rowCount = 0;
  private constantHeight?: number;
  private heightOf: (rowIndex: number) => number = () => 0;
  private prefix?: Float64Array;

  private extraIndices = new Int32Array(0);
  private extraHeights = new Float64Array(0);
  private extraPrefix = new Float64Array(1);

  /**
   * Sets the rows. Prefix sums of variable heights are built lazily on the first access.
   * Extras behind rows that no longer exist are dropped.
   *
   * @param {number} rowCount - number of rows
   * @param {(rowIndex: number) => number} heightOf - height of a row (called only for variable heights)
   * @param {number} [constantHeight] - the height of every row, if they are all equal (`AreaModelIf.getConstantRowHeight`)
   */
  setRows(rowCount: number, heightOf: (rowIndex: number) => number, constantHeight?: number): void {
    this.rowCount = Math.max(0, Math.floor(rowCount) || 0);
    this.heightOf = heightOf;
    this.constantHeight = constantHeight !== undefined && constantHeight > 0 ? constantHeight : undefined;
    this.prefix = undefined;
    if (this.extraIndices.length && this.extraIndices[this.extraIndices.length - 1] >= this.rowCount) {
      const keep: number[] = [];
      const heights: number[] = [];
      this.extraIndices.forEach((index, k) => {
        if (index < this.rowCount) {
          keep.push(index);
          heights.push(this.extraHeights[k]);
        }
      });
      this.setExtras(keep, heights);
    }
  }

  /**
   * Sets the extra heights (e.g. detail rows) behind rows. Unsorted input is fine; heights of the same row add up;
   * indices outside the rows and heights ≤ 0 are ignored. Replaces all previous extras.
   *
   * @param {ArrayLike<number>} rowIndices - the rows with an extra height below them
   * @param {ArrayLike<number>} heights - the extra heights (same order as `rowIndices`)
   */
  setExtras(rowIndices: ArrayLike<number>, heights: ArrayLike<number>): void {
    const map = new Map<number, number>();
    for (let k = 0; k < rowIndices.length; k++) {
      const index = rowIndices[k];
      const height = heights[k];
      if (index >= 0 && index < this.rowCount && height > 0) {
        map.set(index, (map.get(index) ?? 0) + height);
      }
    }
    const indices = Int32Array.from(map.keys()).sort();
    this.extraIndices = indices;
    this.extraHeights = Float64Array.from(indices, index => map.get(index)!);
    this.rebuildExtraPrefix();
  }

  /**
   * Changes the extra height behind one row that already has one (see {@link setExtras}).
   *
   * @param {number} rowIndex - the row
   * @param {number} height - the new extra height (> 0)
   * @returns {boolean} false if the row has no extra or the height did not change
   */
  setExtraHeight(rowIndex: number, height: number): boolean {
    const k = this.findExtra(rowIndex);
    if (k < 0 || !(height > 0) || this.extraHeights[k] === height) {
      return false;
    }
    this.extraHeights[k] = height;
    this.rebuildExtraPrefix();
    return true;
  }

  /**
   * Sets, changes or (height ≤ 0) removes the extra height behind one row – O(k), the other extras stay.
   *
   * @param {number} rowIndex - the row (ignored outside the rows)
   * @param {number} height - the extra height, ≤ 0 removes it
   * @returns {boolean} true if something changed
   */
  setExtra(rowIndex: number, height: number): boolean {
    if (!(rowIndex >= 0 && rowIndex < this.rowCount)) {
      return false;
    }
    const k = this.findExtra(rowIndex);
    if (k >= 0) {
      if (height > 0) {
        return this.setExtraHeight(rowIndex, height);
      }
      const indices = Array.from(this.extraIndices);
      const heights = Array.from(this.extraHeights);
      indices.splice(k, 1);
      heights.splice(k, 1);
      this.extraIndices = Int32Array.from(indices);
      this.extraHeights = Float64Array.from(heights);
      this.rebuildExtraPrefix();
      return true;
    }
    if (!(height > 0)) {
      return false;
    }
    const at = this.countExtrasBelow(rowIndex);
    const indices = Array.from(this.extraIndices);
    const heights = Array.from(this.extraHeights);
    indices.splice(at, 0, rowIndex);
    heights.splice(at, 0, height);
    this.extraIndices = Int32Array.from(indices);
    this.extraHeights = Float64Array.from(heights);
    this.rebuildExtraPrefix();
    return true;
  }

  /** The number of rows. */
  getRowCount(): number {
    return this.rowCount;
  }

  /** The number of rows with an extra height. */
  getExtraCount(): number {
    return this.extraIndices.length;
  }

  /** True after the prefix sums of variable heights were built (never for constant heights). */
  hasPrefixSums(): boolean {
    return !!this.prefix;
  }

  /**
   * The height of a row (without its extra).
   *
   * @param {number} rowIndex - the row
   * @returns {number} the height in px
   */
  getRowHeight(rowIndex: number): number {
    if (this.constantHeight !== undefined) {
      return this.constantHeight;
    }
    const prefix = this.ensurePrefix();
    return rowIndex >= 0 && rowIndex < this.rowCount ? prefix[rowIndex + 1] - prefix[rowIndex] : 0;
  }

  /**
   * The extra height below a row (0 = none).
   *
   * @param {number} rowIndex - the row
   * @returns {number} the extra height in px
   */
  getExtraHeight(rowIndex: number): number {
    const k = this.findExtra(rowIndex);
    return k < 0 ? 0 : this.extraHeights[k];
  }

  /**
   * The sum of the extra heights of the rows above a row.
   *
   * @param {number} rowIndex - the row (`rowCount` = all extras)
   * @returns {number} px
   */
  getExtraBefore(rowIndex: number): number {
    return this.extraPrefix[this.countExtrasBelow(rowIndex)];
  }

  /** The sum of all extra heights. */
  getExtraTotal(): number {
    return this.extraPrefix[this.extraIndices.length];
  }

  /**
   * The top of a row: heights and extras of all rows above it. `getTop(rowCount)` = total height. The index is
   * clamped to `0 … rowCount`.
   *
   * @param {number} rowIndex - the row
   * @returns {number} px from the top of the first row
   */
  getTop(rowIndex: number): number {
    const i = Math.min(Math.max(0, Math.floor(rowIndex) || 0), this.rowCount);
    return this.getBaseTop(i) + this.extraPrefix[this.countExtrasBelow(i)];
  }

  /** The height of all rows and extras. */
  getTotalHeight(): number {
    return this.getTop(this.rowCount);
  }

  /**
   * The row whose slot (row + extra) contains `y`; rows of height 0 are skipped. Above the first row: 0, below the
   * last: the last row, without rows: -1. O(1) for constant heights without extras, otherwise O(log n).
   *
   * @param {number} y - px from the top of the first row
   * @returns {number} the row index
   */
  findIndexAt(y: number): number {
    const n = this.rowCount;
    if (n < 1) {
      return -1;
    }
    if (!(y > 0)) {
      return 0;
    }
    const h = this.constantHeight;
    if (h !== undefined && !this.extraIndices.length) {
      let i = Math.min(n - 1, Math.floor(y / h));
      while (i > 0 && i * h > y) i--;                 // floating point guards
      while (i < n - 1 && (i + 1) * h <= y) i++;
      return i;
    }
    // smallest i with getTop(i + 1) > y
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.getTop(mid + 1) > y) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    return lo;
  }

  private getBaseTop(i: number): number {
    if (this.constantHeight !== undefined) {
      return i * this.constantHeight;
    }
    return this.ensurePrefix()[i];
  }

  private ensurePrefix(): Float64Array {
    if (!this.prefix) {
      const n = this.rowCount;
      const prefix = new Float64Array(n + 1);
      let y = 0;
      for (let i = 0; i < n; i++) {
        y += this.heightOf(i) || 0;
        prefix[i + 1] = y;
      }
      this.prefix = prefix;
    }
    return this.prefix;
  }

  private rebuildExtraPrefix(): void {
    const k = this.extraIndices.length;
    const prefix = new Float64Array(k + 1);
    for (let j = 0; j < k; j++) {
      prefix[j + 1] = prefix[j] + this.extraHeights[j];
    }
    this.extraPrefix = prefix;
  }

  /** The number of extras behind rows with an index < rowIndex (lower bound). */
  private countExtrasBelow(rowIndex: number): number {
    const indices = this.extraIndices;
    let lo = 0;
    let hi = indices.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (indices[mid] < rowIndex) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  private findExtra(rowIndex: number): number {
    const k = this.countExtrasBelow(rowIndex);
    return k < this.extraIndices.length && this.extraIndices[k] === rowIndex ? k : -1;
  }
}
