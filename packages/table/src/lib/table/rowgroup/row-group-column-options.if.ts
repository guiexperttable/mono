import type { SizeIf } from "../data/common/size.if";
import type { RowGroupIf } from "./row-group.if";

/**
 * Options of the group column ({@link RowGroupColumnDef}) – the column with the arrows and the group labels.
 *
 * @example
 * RowGroupFactory.createTableModel<Sale>({
 *   rows: sales, columnDefs, groupBy: ["region"],
 *   groupColumn: { headerLabel: "Region", width: px160, label: g => `${g.label} – ${g.count} sales` }
 * });
 *
 * @since 1.1.94
 * @category Row grouping
 */
export interface RowGroupColumnOptionsIf<T = any> {
  /** The header text. Default: the names of the levels, e.g. `"Region › Produkt"` (follows {@link TableApi.setRowGroupBy}). */
  headerLabel?: string;
  /** The width. Default 220 px. */
  width: SizeIf;
  /** Show the number of rows behind the key: `"Nord (3)"`. Default true. */
  showCount: boolean;
  /** An own label of a group row (text, never HTML). Default: `"<key> (<count>)"`. */
  label?: (group: RowGroupIf<T>) => string;
  /** Fix the column on the left (it comes behind row numbers and the checkbox column). Default true. */
  fixed: boolean;
}
