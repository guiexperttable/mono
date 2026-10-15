import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { TableOptionsIf } from "../data/options/table-options.if";
import type { DefaultRowHeightsIf } from "../data/options/default-row-heights.if";
import type { GetT } from "../data/common/get-t";
import type { SelectionModelIf } from "../selection/selection-model.if";
import type { RowNumberOptionsIf } from "../data/common/row-number-options.if";
import type { AggregateSpecMap } from "../aggregation/aggregate-spec.if";
import type { AggregateFooterConfig } from "../data/tablemodel/areamodel/aggregate-footer-options.if";
import type { RowGroupField } from "../rowgroup/row-group-field.type";
import type { RowGroupColumnOptionsIf } from "../rowgroup/row-group-column-options.if";
import type { RowGroupExpanded } from "../rowgroup/row-group-model-options.if";

/**
 * Parameters of {@link RowGroupFactory.createTableModel}.
 *
 * @example
 * const para: RowGroupTableModelParaIf<Sale> = {
 *   rows: sales,
 *   columnDefs,
 *   groupBy: ["region", "produkt"],
 *   aggregations: { umsatz: "sum" },
 *   expanded: 1                      // regions open, products closed
 * };
 * const tableModel = RowGroupFactory.createTableModel(para);
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Row grouping
 */
export interface RowGroupTableModelParaIf<T = any> {
  /** The flat rows (not changed). */
  rows: T[];
  /** The levels, top first: property paths (`"region"`), functions (`o => o.date.getFullYear()`) or {@link RowGroupFieldIf}. */
  groupBy: RowGroupField<T>[];
  /** The columns. Default: one per key of the first row. The group column is added in front of them. */
  columnDefs?: ColumnDefIf[];
  /** Aggregates in the group rows; the key is the property of the column (`{ umsatz: "sum" }`, see {@link AggregateSpecMap}). */
  aggregations?: AggregateSpecMap<T>;
  /**
   * The total row: `true` = the `aggregations`, `false` = none, or an own configuration ({@link AggregateFooterConfig}).
   * Default: `true` if there are aggregations.
   */
  footerAggregates?: boolean | AggregateFooterConfig<T>;
  /** The group column: header, width, count, own label, fixed. */
  groupColumn?: Partial<RowGroupColumnOptionsIf<T>>;
  /** Hide the columns of the grouped properties. Default true. */
  hideGroupedColumns?: boolean;
  /** Expanded groups: `true` (default), `false`, open levels as a number (`0` = all closed) or a function per group. */
  expanded?: RowGroupExpanded<T>;
  /** The label of the group of empty keys (`null`, `undefined`, `""`). Default `"(empty)"`. */
  emptyLabel?: string;
  /** Options of the table (row heights, selection model, filter …). */
  tableOptions?: TableOptionsIf;
  /** Columns fixed on the left besides the group column (which is fixed by itself). Default 0. */
  fixedLeftColumnCount?: number;
  /** Columns fixed on the right. Default 0. */
  fixedRightColumnCount?: number;
  /** Row numbers in front of all columns (counted per displayed row, group rows included). */
  rowNumbersVisible?: boolean | Partial<RowNumberOptionsIf>;
  /** Set with a {@link CheckboxColumnDef} in `columnDefs` (default: detected). */
  rowCheckboxVisible?: boolean;
  /** Row heights of header, body and footer. Default: `tableOptions.defaultRowHeights`. */
  defaultRowHeights?: DefaultRowHeightsIf;
  /** Selection model factory. Default: `tableOptions.getSelectionModel`. */
  getSelectionModel?: GetT<SelectionModelIf>;
}
