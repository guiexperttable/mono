import type { ColumnFilterConditionIf, ColumnFilterIf, ColumnFiltersMap } from "./column-filter.if";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function serializeScalar(value: unknown): unknown {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return undefined;
    }
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }
  return value;
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  return value;
}

/**
 * Normalizes a {@link ColumnFilterIf}: returns `undefined` when neither `condition` nor `values` is set.
 * An empty `values: []` array is kept (it means "match nothing").
 *
 * @example
 * normalizeColumnFilter({});           // undefined
 * normalizeColumnFilter({ values: [] }); // { values: [] }
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function normalizeColumnFilter(filter: ColumnFilterIf | undefined): ColumnFilterIf | undefined {
  if (!filter || typeof filter !== "object") {
    return undefined;
  }
  const hasCondition = filter.condition !== undefined && typeof filter.condition?.operator === "string";
  const hasValues = Array.isArray(filter.values);
  if (!hasCondition && !hasValues) {
    return undefined;
  }
  const out: ColumnFilterIf = {};
  if (hasCondition) {
    const c: ColumnFilterConditionIf = { operator: filter.condition!.operator };
    if (filter.condition!.value !== undefined) {
      c.value = filter.condition!.value;
    }
    if (filter.condition!.valueTo !== undefined) {
      c.valueTo = filter.condition!.valueTo;
    }
    out.condition = c;
  }
  if (hasValues) {
    out.values = filter.values!.slice();
  }
  return out;
}

/**
 * Serializes a {@link ColumnFiltersMap} to plain JSON (converting `Date` values to ISO `"YYYY-MM-DD"` strings and
 * dropping empty entries).
 *
 * @example
 * serializeColumnFilters({ created: { condition: { operator: "equals", value: new Date(2026, 4, 10) } } });
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function serializeColumnFilters(filters: ColumnFiltersMap): ColumnFiltersMap {
  const out: ColumnFiltersMap = {};
  const keys = Object.keys(filters);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const norm = normalizeColumnFilter(filters[key]);
    if (!norm) {
      continue;
    }
    const serialized: ColumnFilterIf = {};
    if (norm.condition) {
      const c: ColumnFilterConditionIf = { operator: norm.condition.operator };
      if (norm.condition.value !== undefined) {
        c.value = serializeScalar(norm.condition.value);
      }
      if (norm.condition.valueTo !== undefined) {
        c.valueTo = serializeScalar(norm.condition.valueTo);
      }
      serialized.condition = c;
    }
    if (norm.values !== undefined) {
      // values keep the time (a value list compares points in time, a condition compares days)
      serialized.values = norm.values.map(serializeValue);
    }
    out[key] = serialized;
  }
  return out;
}

/**
 * Restores a {@link ColumnFiltersMap} from stored JSON, dropping invalid entries and (when `validProperties` is
 * given) ignoring unknown column properties.
 *
 * @example
 * deserializeColumnFilters({ region: { values: ["EMEA"] }, gone: { values: ["x"] } }, new Set(["region"]));
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function deserializeColumnFilters(
  raw: unknown,
  validProperties?: ReadonlySet<string>,
): ColumnFiltersMap {
  const out: ColumnFiltersMap = {};
  if (!raw || typeof raw !== "object") {
    return out;
  }
  const obj = raw as Record<string, unknown>;
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (validProperties && !validProperties.has(key)) {
      continue;
    }
    const norm = normalizeColumnFilter(obj[key] as ColumnFilterIf | undefined);
    if (norm) {
      out[key] = norm;
    }
  }
  return out;
}

/**
 * Returns `true` when two {@link ColumnFiltersMap} objects represent the exact same filters.
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function areColumnFiltersEqual(a: ColumnFiltersMap, b: ColumnFiltersMap): boolean {
  const sa = serializeColumnFilters(a);
  const sb = serializeColumnFilters(b);
  const keysA = Object.keys(sa).sort();
  const keysB = Object.keys(sb).sort();
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    const k = keysA[i];
    if (k !== keysB[i]) {
      return false;
    }
    if (JSON.stringify(sa[k]) !== JSON.stringify(sb[k])) {
      return false;
    }
  }
  return true;
}
