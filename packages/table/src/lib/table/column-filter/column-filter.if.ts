import type { ColumnFilterOperator } from "./column-filter-operator.type";

/**
 * A single comparison condition of a {@link ColumnFilterIf}.
 *
 * @example
 * const cond: ColumnFilterConditionIf = { operator: "between", value: 10, valueTo: 50 };
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterConditionIf {
  /** Comparison operator. */
  operator: ColumnFilterOperator;
  /** Value to compare against (omitted for `"blank"` and `"notBlank"`). Dates accept `Date` or ISO text `"YYYY-MM-DD"`. */
  value?: unknown;
  /** Upper bound for `"between"` (inclusive; swapped bounds are normalized). */
  valueTo?: unknown;
}

/**
 * Filter state of one column ({@link TableApi.setColumnFilter}, {@link TableStateIf.filters}).
 * When both `condition` and `values` are present, a row must satisfy both (AND).
 *
 * @example
 * const filter: ColumnFilterIf = {
 *   condition: { operator: "greaterThan", value: 40 }
 * };
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterIf {
  /** Comparison condition from the filter row, the filter menu, or the API. */
  condition?: ColumnFilterConditionIf;
  /** Allowed distinct values (set filter): omitted = all values allowed, `[]` = matches no rows. */
  values?: unknown[];
}

/**
 * Active column filters indexed by column property (or `"#<index>"` for array-of-arrays tables without column definitions).
 *
 * @example
 * const filters: ColumnFiltersMap = {
 *   region: { values: ["EMEA", "APAC"] },
 *   seats: { condition: { operator: "greaterOrEqual", value: 20 } }
 * };
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export type ColumnFiltersMap = Record<string, ColumnFilterIf>;
