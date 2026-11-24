import type { ColumnFilterValueItemIf } from "./column-filter-options.if";
import { fastFilterSetKey, isBlankFilterValue } from "./compile-column-filters";

/** Options for {@link collectDistinctValues}. */
export interface CollectDistinctValuesOptionsIf {
  /** Maximum distinct values to collect before truncating (default `10_000`). */
  maxValues?: number;
  /** Case-insensitive substring filter applied to item labels during collection. */
  search?: string;
  /** Label for blank values (`null`, `undefined`, `""`, `NaN`). Default `"(Blanks)"`. */
  blanksLabel?: string;
  /** Optional custom formatter for non-blank values. */
  formatValue?: (value: unknown) => string;
}

/** Result of {@link collectDistinctValues}. */
export interface DistinctValuesResultIf {
  items: ColumnFilterValueItemIf[];
  truncated: boolean;
}

function defaultFormatValue(value: unknown): string {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

function typeOrder(value: unknown): number {
  if (isBlankFilterValue(value)) return 99;
  if (typeof value === "number") return 0;
  if (value instanceof Date) return 1;
  if (typeof value === "boolean") return 2;
  return 3;
}

function compareItems(a: ColumnFilterValueItemIf, b: ColumnFilterValueItemIf): number {
  const ta = typeOrder(a.value);
  const tb = typeOrder(b.value);
  if (ta !== tb) {
    return ta - tb;
  }
  if (ta === 99) {
    return 0;
  }
  if (ta === 0) {
    return (a.value as number) - (b.value as number);
  }
  if (ta === 1) {
    return (a.value as Date).getTime() - (b.value as Date).getTime();
  }
  if (ta === 2) {
    return Number(a.value) - Number(b.value);
  }
  const la = a.label ?? String(a.value);
  const lb = b.label ?? String(b.value);
  return la < lb ? -1 : la > lb ? 1 : 0;
}

/**
 * Collects distinct values of one column in a single pass with a `Map` (preserving `1 !== "1"`), natural sorting
 * (numbers numerically, dates chronologically, blanks last), optional substring search, and a `maxValues` cap.
 *
 * @example
 * const res = collectDistinctValues([{ r: "EMEA" }, { r: "APAC" }, { r: "EMEA" }], (x: { r: string }) => x.r);
 * res.items.map(i => i.value); // ["APAC", "EMEA"]
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function collectDistinctValues<T = any>(
  rows: readonly T[],
  getValue: (row: T) => unknown,
  options: CollectDistinctValuesOptionsIf = {},
): DistinctValuesResultIf {
  const maxValues = options.maxValues ?? 10_000;
  const blanksLabel = options.blanksLabel ?? "(Blanks)";
  const format = options.formatValue ?? defaultFormatValue;
  const search = options.search?.trim().toLowerCase() ?? "";

  const map = new Map<unknown, ColumnFilterValueItemIf>();
  let truncated = false;

  for (let i = 0; i < rows.length; i++) {
    const raw = getValue(rows[i]);
    const key = fastFilterSetKey(raw);
    const existing = map.get(key);
    if (existing) {
      existing.count = (existing.count ?? 0) + 1;
      continue;
    }
    if (!search && map.size >= maxValues) {
      truncated = true;
      continue;
    }
    const blank = key === null;
    const label = blank ? blanksLabel : format(raw);
    if (search && !label.toLowerCase().includes(search)) {
      continue;
    }
    if (map.size >= maxValues) {
      truncated = true;
      continue;
    }
    map.set(key, { value: blank ? null : raw, label, count: 1 });
  }

  const items = Array.from(map.values());
  items.sort(compareItems);
  return { items, truncated };
}
