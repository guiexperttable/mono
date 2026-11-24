import type { ColumnFilterType } from "./column-filter-type.type";
import { isBlankFilterValue, toDateDayKey } from "./compile-column-filters";

/**
 * Infers the {@link ColumnFilterType} of a column from up to `sampleSize` non-blank values (`"number"`, `"date"`,
 * `"boolean"`, or `"text"` for strings, mixed types, or empty data).
 *
 * @example
 * inferColumnFilterType([10, 20, null], (v: unknown) => v); // "number"
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function inferColumnFilterType<T = any>(
  rows: readonly T[],
  getValue: (row: T) => unknown,
  sampleSize = 100,
): ColumnFilterType {
  let detected: ColumnFilterType | undefined;
  let seen = 0;

  for (let i = 0; i < rows.length && seen < sampleSize; i++) {
    const v = getValue(rows[i]);
    if (isBlankFilterValue(v)) {
      continue;
    }
    seen++;
    let kind: ColumnFilterType;
    if (typeof v === "number") {
      kind = "number";
    } else if (typeof v === "boolean") {
      kind = "boolean";
    } else if (v instanceof Date) {
      kind = "date";
    } else if (typeof v === "string" && toDateDayKey(v) !== undefined) {
      kind = "date";
    } else {
      return "text";
    }
    if (detected === undefined) {
      detected = kind;
    } else if (detected !== kind) {
      return "text";
    }
  }

  return detected ?? "text";
}
