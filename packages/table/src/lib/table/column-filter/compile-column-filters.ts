import type { ColumnFilterConditionIf, ColumnFilterIf, ColumnFiltersMap } from "./column-filter.if";
import type { ColumnFilterType } from "./column-filter-type.type";

/**
 * Returns `true` if a cell value is treated as blank by column filters (`null`, `undefined`, `""`, `NaN`, or an
 * invalid `Date`). `0` and `false` are **not** blank.
 *
 * @example
 * isBlankFilterValue(null); // true
 * isBlankFilterValue(0);    // false
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function isBlankFilterValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") {
    return true;
  }
  if (typeof value === "number" && Number.isNaN(value)) {
    return true;
  }
  if (value instanceof Date && Number.isNaN(value.getTime())) {
    return true;
  }
  return false;
}

/**
 * Stable, type-preserving key for a cell value used by set filters (`values`) and distinct-value collection.
 * Preserves `1 !== "1"` and `true !== "true"`; all blank values share the key `"blank"`.
 *
 * @example
 * filterValueKey(1) !== filterValueKey("1"); // true
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function filterValueKey(value: unknown): string {
  if (isBlankFilterValue(value)) {
    return "blank";
  }
  if (typeof value === "number") {
    return `n:${Object.is(value, -0) ? 0 : value}`;
  }
  if (typeof value === "string") {
    return `s:${value}`;
  }
  if (typeof value === "boolean") {
    return value ? "b:true" : "b:false";
  }
  if (value instanceof Date) {
    return `d:${value.getTime()}`;
  }
  return `o:${String(value)}`;
}

const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T ])/;

/** Converts a `Date` or ISO date string (`"YYYY-MM-DD..."`) into a UTC day timestamp for calendar-day comparisons. */
export function toDateDayKey(value: unknown): number | undefined {
  if (value instanceof Date) {
    const t = value.getTime();
    if (Number.isNaN(t)) {
      return undefined;
    }
    return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  }
  if (typeof value === "string") {
    const m = ISO_DATE_PREFIX.exec(value.trim());
    if (!m) {
      return undefined;
    }
    const y = +m[1];
    const mo = +m[2];
    const d = +m[3];
    const check = new Date(Date.UTC(y, mo - 1, d));
    if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
      return undefined;
    }
    return check.getTime();
  }
  return undefined;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }
  return undefined;
}

/** Options for {@link compileSingleColumnFilter}. */
export interface CompileColumnFilterOptionsIf {
  /** Case-sensitive text matching (default `false`). */
  caseSensitive?: boolean;
}

function compileCondition(
  condition: ColumnFilterConditionIf,
  type: ColumnFilterType,
  caseSensitive: boolean,
): (value: unknown) => boolean {
  const op = condition.operator;
  if (op === "blank") {
    return isBlankFilterValue;
  }
  if (op === "notBlank") {
    return (v: unknown) => !isBlankFilterValue(v);
  }

  const noValue = isBlankFilterValue(condition.value);
  if (op === "between") {
    // one bound only: "from" resp. "up to" (a filter that is shown as active must not let everything pass)
    const noValueTo = isBlankFilterValue(condition.valueTo);
    if (noValue && noValueTo) {
      return () => true;
    }
    if (noValueTo) {
      return compileCondition({ operator: "greaterOrEqual", value: condition.value }, type, caseSensitive);
    }
    if (noValue) {
      return compileCondition({ operator: "lessOrEqual", value: condition.valueTo }, type, caseSensitive);
    }
  } else if (noValue && (op === "equals" || op === "notEquals")) {
    // "equals nothing" = blank (Number(null) would be 0)
    return op === "equals" ? isBlankFilterValue : (v: unknown) => !isBlankFilterValue(v);
  }

  const isNumericOp =
    op === "lessThan" || op === "lessOrEqual" || op === "greaterThan" || op === "greaterOrEqual" || op === "between";
  if (type === "number" || (isNumericOp && typeof condition.value === "number")) {
    const target = typeof condition.value === "number" ? condition.value : Number(condition.value);
    if (Number.isNaN(target)) {
      return () => true;
    }
    switch (op) {
      case "equals":
        return (v: unknown) => typeof v === "number" && v === target;
      case "notEquals":
        return (v: unknown) => typeof v !== "number" || Number.isNaN(v) || v !== target;
      case "lessThan":
        return (v: unknown) => { const n = toFiniteNumber(v); return n !== undefined && n < target; };
      case "lessOrEqual":
        return (v: unknown) => { const n = toFiniteNumber(v); return n !== undefined && n <= target; };
      case "greaterThan":
        return (v: unknown) => { const n = toFiniteNumber(v); return n !== undefined && n > target; };
      case "greaterOrEqual":
        return (v: unknown) => { const n = toFiniteNumber(v); return n !== undefined && n >= target; };
      case "between": {
        const rawTo = typeof condition.valueTo === "number" ? condition.valueTo : Number(condition.valueTo);
        if (Number.isNaN(rawTo)) {
          return () => true;
        }
        const lo = Math.min(target, rawTo);
        const hi = Math.max(target, rawTo);
        return (v: unknown) => { const n = toFiniteNumber(v); return n !== undefined && n >= lo && n <= hi; };
      }
      default:
        break;
    }
  }

  if (type === "date" || (condition.value instanceof Date && (isNumericOp || op === "equals" || op === "notEquals"))) {
    const targetDay = toDateDayKey(condition.value);
    if (targetDay === undefined) {
      return () => true;
    }
    switch (op) {
      case "equals":
        return (v: unknown) => toDateDayKey(v) === targetDay;
      case "notEquals":
        return (v: unknown) => toDateDayKey(v) !== targetDay;
      case "lessThan":
        return (v: unknown) => { const d = toDateDayKey(v); return d !== undefined && d < targetDay; };
      case "lessOrEqual":
        return (v: unknown) => { const d = toDateDayKey(v); return d !== undefined && d <= targetDay; };
      case "greaterThan":
        return (v: unknown) => { const d = toDateDayKey(v); return d !== undefined && d > targetDay; };
      case "greaterOrEqual":
        return (v: unknown) => { const d = toDateDayKey(v); return d !== undefined && d >= targetDay; };
      case "between": {
        const toDay = toDateDayKey(condition.valueTo);
        if (toDay === undefined) {
          return () => true;
        }
        const lo = Math.min(targetDay, toDay);
        const hi = Math.max(targetDay, toDay);
        return (v: unknown) => { const d = toDateDayKey(v); return d !== undefined && d >= lo && d <= hi; };
      }
      default:
        break;
    }
  }

  if (type === "boolean") {
    const target = Boolean(condition.value);
    if (op === "equals") {
      return (v: unknown) => typeof v === "boolean" && v === target;
    }
    if (op === "notEquals") {
      return (v: unknown) => typeof v !== "boolean" || v !== target;
    }
  }

  // Text comparison (also fallback for text operators on non-text types)
  const rawNeedle = condition.value === null || condition.value === undefined ? "" : String(condition.value);
  const needle = caseSensitive ? rawNeedle : rawNeedle.toLowerCase();
  const toText = caseSensitive
    ? (v: unknown) => (v === null || v === undefined ? "" : String(v))
    : (v: unknown) => (v === null || v === undefined ? "" : String(v).toLowerCase());

  switch (op) {
    case "contains":
      return (v: unknown) => !isBlankFilterValue(v) && toText(v).includes(needle);
    case "startsWith":
      return (v: unknown) => !isBlankFilterValue(v) && toText(v).startsWith(needle);
    case "endsWith":
      return (v: unknown) => !isBlankFilterValue(v) && toText(v).endsWith(needle);
    case "equals":
      return (v: unknown) => !isBlankFilterValue(v) && toText(v) === needle;
    case "notEquals":
      return (v: unknown) => isBlankFilterValue(v) || toText(v) !== needle;
    case "lessThan":
      return (v: unknown) => !isBlankFilterValue(v) && toText(v) < needle;
    case "lessOrEqual":
      return (v: unknown) => !isBlankFilterValue(v) && toText(v) <= needle;
    case "greaterThan":
      return (v: unknown) => !isBlankFilterValue(v) && toText(v) > needle;
    case "greaterOrEqual":
      return (v: unknown) => !isBlankFilterValue(v) && toText(v) >= needle;
    case "between": {
      const rawTo = condition.valueTo === null || condition.valueTo === undefined ? "" : String(condition.valueTo);
      const needleTo = caseSensitive ? rawTo : rawTo.toLowerCase();
      const lo = needle <= needleTo ? needle : needleTo;
      const hi = needle <= needleTo ? needleTo : needle;
      return (v: unknown) => {
        if (isBlankFilterValue(v)) return false;
        const s = toText(v);
        return s >= lo && s <= hi;
      };
    }
    default:
      return () => true;
  }
}

/**
 * Fast zero-allocation map/set key for a cell value: JS `Set`/`Map` already distinguishes `1 !== "1"` and
 * `true !== "true"` via SameValueZero without string allocation. Only blanks coalesce to `null`, and `Date`
 * instances use a timestamp key so equal dates match across object instances.
 */
const DATE_KEY_TAG = "\u0000d:";
export function fastFilterSetKey(value: unknown): unknown {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return Number.isNaN(value) ? null : value === 0 ? 0 : value;
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? null : `${DATE_KEY_TAG}${t}`;
  }
  return value;
}

/**
 * Key of a value in the value list of a **date** column: `Date` → time, date text (`"2026-01-15"`, ISO with time) →
 * its time, blank → `null`, everything else as is. Used on both sides (allowed values and cell values).
 *
 * @example
 * dateSetKey(new Date(0)) === dateSetKey("1970-01-01T00:00:00.000Z"); // true
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function dateSetKey(value: unknown): unknown {
  if (isBlankFilterValue(value)) {
    return null;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "string") {
    const t = Date.parse(value);
    return Number.isNaN(t) ? value : t;
  }
  return value;
}

/**
 * Compiles one {@link ColumnFilterIf} into a fast value predicate closure (no `eval`).
 * When both `condition` and `values` are present, both must match (AND).
 *
 * @example
 * const match = compileSingleColumnFilter({ condition: { operator: "greaterThan", value: 10 } }, "number");
 * match(15); // true
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function compileSingleColumnFilter(
  filter: ColumnFilterIf,
  type: ColumnFilterType = "text",
  options?: CompileColumnFilterOptionsIf,
): (value: unknown) => boolean {
  const caseSensitive = options?.caseSensitive ?? false;
  const condFn = filter.condition ? compileCondition(filter.condition, type, caseSensitive) : undefined;

  let setFn: ((value: unknown) => boolean) | undefined;
  if (filter.values !== undefined) {
    if (filter.values.length === 0) {
      return () => false;
    }
    const allowed = new Set<unknown>();
    let hasDate = false;
    for (let i = 0; i < filter.values.length; i++) {
      const v = filter.values[i];
      if (v instanceof Date) hasDate = true;
      allowed.add(fastFilterSetKey(v));
    }
    const allowsBlank = allowed.has(null);
    if (type === "date") {
      // Date objects, ISO texts of a saved state and ISO texts in the cells meet on one key: the point in time
      const allowedTimes = new Set<unknown>();
      for (let i = 0; i < filter.values.length; i++) {
        allowedTimes.add(dateSetKey(filter.values[i]));
      }
      setFn = (v: unknown) => allowedTimes.has(dateSetKey(v));
    } else if (!hasDate) {
      setFn = (v: unknown) => {
        if (v === null || v === undefined || v === "") return allowsBlank;
        if (typeof v === "number" && Number.isNaN(v)) return allowsBlank;
        return allowed.has(v);
      };
    } else {
      setFn = (v: unknown) => allowed.has(fastFilterSetKey(v));
    }
  }

  if (condFn && setFn) {
    return (v: unknown) => setFn!(v) && condFn(v);
  }
  return condFn ?? setFn ?? (() => true);
}

/**
 * Describes how to read and compare one column when compiling a multi-column predicate
 * ({@link compileColumnFilterPredicate}).
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterResolverIf<T = any> {
  property: string;
  type: ColumnFilterType;
  getValue: (row: T) => unknown;
  caseSensitive?: boolean;
}

/**
 * Compiles all active entries of a {@link ColumnFiltersMap} into a **single** row predicate closure (AND across
 * columns, single pass with zero per-row allocations). Returns `undefined` when no active column filters match the
 * given resolvers.
 *
 * @example
 * const pred = compileColumnFilterPredicate(
 *   { seats: { condition: { operator: "greaterThan", value: 40 } } },
 *   [{ property: "seats", type: "number", getValue: (r: { seats: number }) => r.seats }]
 * );
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export function compileColumnFilterPredicate<T = any>(
  filters: ColumnFiltersMap,
  resolvers: readonly ColumnFilterResolverIf<T>[],
  options?: CompileColumnFilterOptionsIf,
): ((row: T) => boolean) | undefined {
  const getters: Array<(row: T) => unknown> = [];
  const checks: Array<(value: unknown) => boolean> = [];

  for (let i = 0; i < resolvers.length; i++) {
    const res = resolvers[i];
    const filter = filters[res.property];
    if (!filter || (filter.condition === undefined && filter.values === undefined)) {
      continue;
    }
    getters.push(res.getValue);
    checks.push(
      compileSingleColumnFilter(filter, res.type, {
        caseSensitive: res.caseSensitive ?? options?.caseSensitive ?? false,
      }),
    );
  }

  const len = checks.length;
  if (len === 0) {
    return undefined;
  }
  if (len === 1) {
    const g0 = getters[0];
    const c0 = checks[0];
    return (row: T) => c0(g0(row));
  }
  return (row: T) => {
    for (let i = 0; i < len; i++) {
      if (!checks[i](getters[i](row))) {
        return false;
      }
    }
    return true;
  };
}
