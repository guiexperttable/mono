import type { TableOptionsIf } from "../data/options/table-options.if";
import type { DefaultRowHeightsIf } from "../data/options/default-row-heights.if";
import type { GetT } from "../data/common/get-t";
import type { SelectionModelIf } from "../selection/selection-model.if";
import type { RowNumberOptionsIf } from "../data/common/row-number-options.if";
import type { SizeIf } from "../data/common/size.if";
import type { RowGroupColumnOptionsIf } from "../rowgroup/row-group-column-options.if";
import type { PivotConfigIf } from "../pivot/pivot-config.if";

/**
 * Parameters of {@link PivotFactory.createTableModel}: the rows, the pivot ({@link PivotConfigIf}) and the look of the
 * table.
 *
 * @example
 * const para: PivotTableModelParaIf<Sale> = {
 *   rows: sales,
 *   rowFields: ["region", "produkt"],
 *   columnFields: [{ value: "monat", order: "insertion" }],
 *   values: ["umsatz"],
 *   emptyText: "–",
 *   valueColumnWidth: px80
 * };
 * const tableModel = PivotFactory.createTableModel(para);
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Pivot
 */
export interface PivotTableModelParaIf<T = any> extends PivotConfigIf<T> {
  /** The source rows (not changed). */
  rows: T[];
  /** The group column (arrows and row labels): header, width, `showCount` (default false), own label, fixed (default true). */
  groupColumn?: Partial<RowGroupColumnOptionsIf<T>>;
  /** The width of a value column. Default 100 px. */
  valueColumnWidth?: SizeIf;
  /** Row numbers in front of the group column (counted per displayed row). */
  rowNumbersVisible?: boolean | Partial<RowNumberOptionsIf>;
  /** Options of the table (row heights, selection model …). */
  tableOptions?: TableOptionsIf;
  /** Row heights of header, body and footer. Default: `tableOptions.defaultRowHeights`. */
  defaultRowHeights?: DefaultRowHeightsIf;
  /** Selection model factory. Default: `tableOptions.getSelectionModel`. */
  getSelectionModel?: GetT<SelectionModelIf>;
}
