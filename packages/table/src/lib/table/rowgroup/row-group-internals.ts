import type { RowGroupField, RowGroupFieldIf } from "./row-group-field.type";
import { createValueGetter } from "../aggregation/create-value-getter";

// Not exported from index.ts: shared by groupRows, AreaModelRowGroups and RowGroupFactory.

/** A level of a grouping, resolved for a pass over the rows. */
export interface ResolvedRowGroupField<T = any> {
  name: string;
  /** the given label (undefined: the factory takes the column header) */
  label?: string;
  /** the property path, undefined for a function */
  path?: string;
  getKey: (row: T) => unknown;
  format?: (key: unknown) => string;
  /** the order of the groups (empty keys last) */
  compare: (a: unknown, b: unknown) => number;
}

/** The key of the group of empty keys (`null`, `undefined`, `""`). */
export const EMPTY_GROUP_KEY = null;

/** `null`, `undefined` and `""` form one group. */
export function isEmptyGroupKey(key: unknown): boolean {
  return key === null || key === undefined || key === "";
}

const COLLATOR = new Intl.Collator("en", { numeric: true });

function typeRank(v: unknown): number {
  if (typeof v === "number" || typeof v === "bigint") return 0;
  if (v instanceof Date) return 1;
  if (typeof v === "boolean") return 2;
  if (typeof v === "string") return 3;
  return 4;
}

/**
 * The natural order of two non-empty group keys: numbers, dates (by time), booleans (false first), text (natural,
 * "A2" before "A10"); keys of different types by type in this order.
 */
export function compareGroupKeys(a: unknown, b: unknown): number {
  const ra = typeRank(a);
  const rb = typeRank(b);
  if (ra !== rb) return ra - rb;
  switch (ra) {
    case 0: {
      const na = a as number | bigint;
      const nb = b as number | bigint;
      // NaN last
      const aNaN = typeof na === "number" && Number.isNaN(na);
      const bNaN = typeof nb === "number" && Number.isNaN(nb);
      if (aNaN || bNaN) return aNaN === bNaN ? 0 : aNaN ? 1 : -1;
      return na < nb ? -1 : na > nb ? 1 : 0;
    }
    case 1: {
      const ta = (a as Date).getTime();
      const tb = (b as Date).getTime();
      return (Number.isNaN(ta) ? Infinity : ta) - (Number.isNaN(tb) ? Infinity : tb) || 0;
    }
    case 2:
      return (a ? 1 : 0) - (b ? 1 : 0);
    case 3:
      return COLLATOR.compare(a as string, b as string);
    default:
      return COLLATOR.compare(String(a), String(b));
  }
}

/** A comparison with empty keys last (in both directions). */
function withEmptyLast(compare: (a: unknown, b: unknown) => number): (a: unknown, b: unknown) => number {
  return (a, b) => {
    const ea = isEmptyGroupKey(a);
    const eb = isEmptyGroupKey(b);
    if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1;
    return compare(a, b);
  };
}

export function resolveRowGroupField<T>(field: RowGroupField<T>, level: number): ResolvedRowGroupField<T> {
  const full: RowGroupFieldIf<T> = (typeof field === "string" || typeof field === "function") ? { value: field } : field;
  if (!full || (typeof full.value !== "string" && typeof full.value !== "function")) {
    throw new Error(`Row grouping: level ${level} has no value (a property path or a function).`);
  }
  const path = typeof full.value === "string" ? full.value : undefined;
  const order = full.order ?? "asc";
  let compare: (a: unknown, b: unknown) => number;
  if (order === "asc") {
    compare = withEmptyLast(compareGroupKeys);
  } else if (order === "desc") {
    compare = withEmptyLast((a, b) => compareGroupKeys(b, a));
  } else if (typeof order === "function") {
    compare = withEmptyLast(order);
  } else {
    compare = withEmptyLast(() => 0); // "insertion": the sort is stable – only the empty group moves to the end
  }
  return {
    name: full.name ?? path ?? `level${level}`,
    label: full.label,
    path,
    getKey: createValueGetter<T>(full.value),
    format: full.format,
    compare,
  };
}

export function resolveRowGroupFields<T>(groupBy: RowGroupField<T>[] | undefined): ResolvedRowGroupField<T>[] {
  return (groupBy ?? []).map((field, level) => resolveRowGroupField(field, level));
}

const objectIds = new WeakMap<object, number>();
let nextObjectId = 1;

/** The key as text with its type – part of the group id (`1` and `"1"` differ, dates by time). */
export function typedGroupKey(key: unknown): string {
  if (isEmptyGroupKey(key)) return "empty";
  switch (typeof key) {
    case "string": return "s:" + key;
    case "number": return "n:" + String(key);
    case "boolean": return "b:" + key;
    case "bigint": return "i:" + String(key);
    case "symbol": return "y:" + (key.description ?? "");
    case "function":
    case "object": {
      if (key instanceof Date) return "d:" + key.getTime();
      let id = objectIds.get(key as object);
      if (id === undefined) {
        id = nextObjectId++;
        objectIds.set(key as object, id);
      }
      return "o:" + id;
    }
    default: return "u:" + String(key);
  }
}

/** The default text of a group key. */
export function defaultGroupKeyLabel(key: unknown, emptyLabel: string): string {
  if (isEmptyGroupKey(key)) return emptyLabel;
  if (key instanceof Date) return Number.isNaN(key.getTime()) ? "Invalid Date" : key.toLocaleDateString("en-US");
  return String(key);
}

/** The level labels of a grouping, e.g. for the header of the group column. */
export function rowGroupLevelLabels<T>(fields: ResolvedRowGroupField<T>[], headerOf: (path: string) => string | undefined): string[] {
  return fields.map(field => field.label ?? (field.path !== undefined ? headerOf(field.path) : undefined) ?? field.name);
}
