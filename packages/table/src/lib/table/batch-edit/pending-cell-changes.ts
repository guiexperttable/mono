/**
 * One pending (not yet written) cell value of a batch edit – an entry of {@link PendingCellChanges}.
 *
 * @category Internals
 * @since 1.1.96
 */
export interface PendingCellIf {
  /** The key of the row: the row object (tree: the data of the `TreeRow`), or the row index for models without objects. */
  rowKey: unknown;
  /** The property of the column (`"#3"` for a column without property). */
  property: string;
  /** The value before the first change. */
  oldValue: unknown;
  /** The value shown (after the column's `editInputPipe`). */
  newValue: unknown;
  /** The value as entered (written with `setValue` on commit – the pipe runs there once). */
  rawValue: unknown;
  /** The message of {@link ColumnDefIf.validate}, if the value is invalid. */
  error?: string;
}

/**
 * What {@link PendingCellChanges.set} did: a new entry, a changed entry, an entry removed because the value is the
 * old one again (B8), or nothing (the value equals the old one and there was no entry).
 *
 * @category Internals
 * @since 1.1.96
 */
export type PendingChangeResult = "added" | "changed" | "removed" | "unchanged";

/**
 * True if two cell values are the same for a batch edit: `Object.is`, dates by time, a number and the text of the same
 * number (an editor without `editInputPipe` returns texts), and `null` / `undefined` / `""` as "empty".
 *
 * @param {unknown} a - one value
 * @param {unknown} b - another value
 * @returns {boolean} whether the cell would not change
 *
 * @example
 * isSameCellValue(5, "5");                                        // true
 * isSameCellValue(new Date(2026, 0, 1), new Date(2026, 0, 1));    // true
 * isSameCellValue(undefined, "");                                 // true
 *
 * @category Fill handle & batch edit
 * @since 1.1.96
 */
export function isSameCellValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  const empty = (v: unknown) => v === null || v === undefined || v === "";
  if (empty(a) || empty(b)) {
    return empty(a) && empty(b);
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime() || (isNaN(a.getTime()) && isNaN(b.getTime()));
  }
  if ((typeof a === "number" && typeof b === "string") || (typeof a === "string" && typeof b === "number")) {
    return String(a) === String(b);
  }
  return false;
}

/**
 * The pending values of a batch edit: per row (the row **object**, not its index – sorting and filtering don't
 * change the assignment) and property one entry with old and new value. DOM-free; the table keeps one in its
 * batch edit service.
 *
 * @example
 * const pending = new PendingCellChanges();
 * const row = { price: 10 };
 * pending.set(row, "price", 10, 12, "12");   // "added"
 * pending.set(row, "price", 12, 10, "10");   // "removed" – the old value again
 *
 * @category Internals
 * @since 1.1.96
 */
export class PendingCellChanges {

  private readonly rows = new Map<unknown, Map<string, PendingCellIf>>();
  private count = 0;

  /**
   * Sets the pending value of a cell. The old value of an existing entry stays (the value before the first change);
   * a value equal to it removes the entry (B8).
   *
   * @param {unknown} rowKey - the row object (or the row index for models without objects)
   * @param {string} property - the property of the column
   * @param {unknown} oldValue - the current value in the model (used for a new entry)
   * @param {unknown} newValue - the new value (after the pipe)
   * @param {unknown} rawValue - the value as entered
   * @param {string} [error] - validation message
   * @returns {PendingChangeResult} what happened
   */
  set(rowKey: unknown, property: string, oldValue: unknown, newValue: unknown, rawValue: unknown, error?: string): PendingChangeResult {
    let cells = this.rows.get(rowKey);
    const existing = cells?.get(property);
    const original = existing ? existing.oldValue : oldValue;
    if (isSameCellValue(original, newValue)) {
      if (existing) {
        cells!.delete(property);
        if (!cells!.size) {
          this.rows.delete(rowKey);
        }
        this.count--;
        return "removed";
      }
      return "unchanged";
    }
    if (!cells) {
      cells = new Map();
      this.rows.set(rowKey, cells);
    }
    cells.set(property, { rowKey, property, oldValue: original, newValue, rawValue, error: error || undefined });
    if (existing) {
      return "changed";
    }
    this.count++;
    return "added";
  }

  /**
   * The pending entry of a cell.
   *
   * @param {unknown} rowKey - the row object (or index)
   * @param {string} property - the property of the column
   * @returns {PendingCellIf | undefined} the entry, `undefined` if the cell is unchanged
   */
  get(rowKey: unknown, property: string): PendingCellIf | undefined {
    return this.count ? this.rows.get(rowKey)?.get(property) : undefined;
  }

  /**
   * Removes the entry of a cell.
   *
   * @param {unknown} rowKey - the row object (or index)
   * @param {string} property - the property of the column
   * @returns {boolean} true if there was an entry
   */
  remove(rowKey: unknown, property: string): boolean {
    const cells = this.rows.get(rowKey);
    if (!cells?.delete(property)) {
      return false;
    }
    if (!cells.size) {
      this.rows.delete(rowKey);
    }
    this.count--;
    return true;
  }

  /** @returns {boolean} true if the row has pending values */
  hasRow(rowKey: unknown): boolean {
    return this.rows.has(rowKey);
  }

  /** @returns {number} the number of pending cells */
  size(): number {
    return this.count;
  }

  /** @returns {boolean} true if nothing is pending */
  isEmpty(): boolean {
    return this.count === 0;
  }

  /** @returns {number} the number of pending cells with a validation message */
  invalidCount(): number {
    let n = 0;
    this.rows.forEach(cells => cells.forEach(cell => { if (cell.error) n++; }));
    return n;
  }

  /** @returns {PendingCellIf[]} all entries, in the order they were first changed */
  entries(): PendingCellIf[] {
    const ret: PendingCellIf[] = [];
    this.rows.forEach(cells => cells.forEach(cell => ret.push(cell)));
    return ret;
  }

  /** Forgets all entries. */
  clear(): void {
    this.rows.clear();
    this.count = 0;
  }
}
