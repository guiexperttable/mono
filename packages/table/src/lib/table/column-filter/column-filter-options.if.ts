import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { ColumnFilterOperator } from "./column-filter-operator.type";
import type { ColumnFilterType } from "./column-filter-type.type";
import type { ColumnFiltersMap } from "./column-filter.if";

/**
 * One item in the distinct-values checklist of a column filter menu.
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterValueItemIf {
  /** Raw cell value stored in {@link ColumnFilterIf.values}. */
  value: unknown;
  /** Display label (defaults to the formatted value, or `(Blanks)` for blank values). */
  label?: string;
  /** Optional number of matching rows for this value. */
  count?: number;
}

/**
 * Context passed to {@link ColumnFilterColumnOptionsIf.getValues} when a filter menu requests its distinct values.
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterValuesContextIf {
  /** Model column index. */
  columnIndex: number;
  /** Column definition, if any. */
  columnDef: ColumnDefIf | undefined;
  /** Column property (or `"#<index>"`). */
  property: string;
  /** Current search text entered in the filter menu. */
  search: string;
  /** Configured maximum number of distinct values. */
  maxValues: number;
  /** Active filters of all other columns. */
  otherFilters: ColumnFiltersMap;
}

/**
 * Per-column configuration of {@link ColumnDefIf.filter}.
 *
 * @example
 * ColumnDef.create({
 *   property: "total",
 *   headerLabel: "Total",
 *   filter: { type: "number", placeholder: "> 100" }
 * });
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterColumnOptionsIf {
  /** Explicit column filter type (inferred from data when omitted). */
  type?: ColumnFilterType;
  /** Custom value getter for filtering this column (defaults to `getRowValue` / `valueGetter` / cell formulas). */
  valueGetter?: (row: any) => unknown;
  /** Case sensitivity for text comparisons on this column (defaults to `tableOptions.columnFilter.caseSensitive`). */
  caseSensitive?: boolean;
  /** Placeholder text in the filter row input of this column. */
  placeholder?: string;
  /** Custom or server-side distinct values provider for the filter menu. */
  getValues?: (ctx: ColumnFilterValuesContextIf) => ColumnFilterValueItemIf[] | Promise<ColumnFilterValueItemIf[]>;
}

/**
 * Value of {@link ColumnDefIf.filter}: `false` disables filtering for the column, `true` enables it with inferred
 * type, a {@link ColumnFilterType} picks the type, or an object configures details.
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export type ColumnFilterColumnOption = boolean | ColumnFilterType | Partial<ColumnFilterColumnOptionsIf>;

/**
 * Configuration of the persistent filter row below the column titles ({@link TableOptionsIf.filterRow}).
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   filterRow: { debounce: 150, height: 34, clearButtonVisible: true }
 * };
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface FilterRowOptionsIf {
  /** Initial visibility of the filter row. Default `true` once `filterRow` is enabled. */
  visible: boolean;
  /** Debounce delay in milliseconds while typing (`0` applies immediately). Default `200`. */
  debounce: number;
  /** Placeholder shown in filter inputs (defaults to `columnFilterTexts.searchPlaceholder`). */
  placeholder?: string;
  /** Height of the filter row in pixels. Default `34`. */
  height: number;
  /** Show a small clear (`×`) button when a column filter input is non-empty or active. Default `true`. */
  clearButtonVisible: boolean;
  /** Below this column width (px) a compact button is shown instead of a cramped input. Default `44`. */
  minInputWidthInPx: number;
}

/**
 * Configuration of the per-column filter menu popup ({@link TableOptionsIf.columnFilterMenu}).
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   columnFilterMenu: { showCondition: true, showValues: true, applyOnChange: false, maxValues: 10_000 }
 * };
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterMenuOptionsIf {
  /** Show the operator selector and condition input(s). Default `true`. */
  showCondition: boolean;
  /** Show the searchable distinct-values checkbox list. Default `true`. */
  showValues: boolean;
  /** Apply changes immediately instead of waiting for the OK button. Default `false`. */
  applyOnChange: boolean;
  /** Maximum distinct values collected for the checklist (defaults to `columnFilter.maxValues`, `10_000`). */
  maxValues: number;
}

/**
 * Global options for built-in column filtering ({@link TableOptionsIf.columnFilter}).
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   columnFilter: { managed: false } // server-side filtering via onFilterChanged
 * };
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterOptionsIf {
  /**
   * `true` (default): the table filters the body rows itself.
   * `false`: the table only keeps the filter state, updates its UI and fires {@link EventListenerIf.onFilterChanged}
   * (for server-side filtering).
   */
  managed: boolean;
  /** Case-sensitive text comparisons. Default `false`. */
  caseSensitive: boolean;
  /** BCP 47 locale used when parsing numbers and dates from filter input (default: browser locale). */
  locale?: string;
  /** Maximum distinct values collected for a column filter menu. Default `10_000`. */
  maxValues: number;
}

/**
 * Localizable UI labels of the filter row, filter menu and column chooser ({@link TableOptionsIf.columnFilterTexts}).
 *
 * @example
 * const tableOptions: TableOptionsIf = {
 *   ...new TableOptions(),
 *   columnFilterTexts: { searchPlaceholder: "Suchen", ok: "Übernehmen", cancel: "Abbrechen", clear: "Zurücksetzen" }
 * };
 *
 * @category Sorting & filtering
 * @since 1.1.114
 */
export interface ColumnFilterTextsIf {
  searchPlaceholder: string;
  searchValuesPlaceholder: string;
  selectAll: string;
  blanks: string;
  ok: string;
  cancel: string;
  clear: string;
  andLabel: string;
  selectedValuesCount: (count: number) => string;
  valuesTruncated: (max: number) => string;
  noValues: string;
  columnsTitle: string;
  searchColumnsPlaceholder: string;
  operators: Record<ColumnFilterOperator, string>;
}
