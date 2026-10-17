import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";

/**
 * Writes a value directly into a row object – for a commit of a row that a filter hides (no display index, so no
 * `setValue`). The value has passed the `editInputPipe` already.
 *
 * @param {unknown} row - the row object (or array)
 * @param {ColumnDefIf | undefined} columnDef - the column
 * @param {number} columnIndex - its index (arrays)
 * @param {unknown} value - the value
 * @returns {boolean} true if written
 * @internal
 */
export function writeRowValue(row: unknown, columnDef: ColumnDefIf | undefined, columnIndex: number, value: unknown): boolean {
  if (row === null || typeof row !== "object") {
    return false;
  }
  if (Array.isArray(row)) {
    row[columnIndex] = value;
    return true;
  }
  if (!columnDef?.property) {
    return false;
  }
  if (columnDef.valueGetter) {
    return !!columnDef.valueSetter && columnDef.valueSetter(row, value) !== false;
  }
  const path = columnDef.property.split(".");
  let target: any = row;
  for (let i = 0; i < path.length - 1; i++) {
    target = target?.[path[i]];
    if (target === null || typeof target !== "object") {
      return false;
    }
  }
  target[path[path.length - 1]] = value;
  return true;
}
