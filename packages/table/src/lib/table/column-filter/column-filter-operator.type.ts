/**
 * Comparison operators for a {@link ColumnFilterConditionIf}.
 *
 * - Text: `"contains"`, `"startsWith"`, `"endsWith"`, `"equals"`, `"notEquals"`, `"blank"`, `"notBlank"`.
 * - Number / Date: `"equals"`, `"notEquals"`, `"lessThan"`, `"lessOrEqual"`, `"greaterThan"`, `"greaterOrEqual"`,
 *   `"between"`, `"blank"`, `"notBlank"`.
 * - Boolean: `"equals"`, `"notEquals"`, `"blank"`, `"notBlank"`.
 *
 * @example
 * const op: ColumnFilterOperator = "greaterThan";
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export type ColumnFilterOperator =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "notEquals"
  | "lessThan"
  | "lessOrEqual"
  | "greaterThan"
  | "greaterOrEqual"
  | "between"
  | "blank"
  | "notBlank";
