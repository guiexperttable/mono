import { ColumnDefIf } from "../tablemodel/column/column-def.if";
import { isRowNumberColumnDef } from "../../instanceof-workaround";

/**
 * 1 if the first column is a {@link RowNumberColumnDef}, otherwise 0 – the offset of the built-in columns that are
 * bound to "the first column": the {@link CheckboxColumnDef}, the tree arrow and the checkbox of
 * `showCheckboxWihoutExtraColumn` sit at this index (behind the row numbers).
 *
 * @param {ColumnDefIf[] | undefined} columnDefs - the column definitions of the table model
 * @returns {0 | 1} the number of leading row number columns
 *
 * @example
 * const firstDataColumn = getLeadingRowNumberColumnCount(tableModel.getColumnDefs());
 *
 * @since 1.1.93
 * @category Row numbers
 */
export function getLeadingRowNumberColumnCount(columnDefs: ColumnDefIf[] | undefined): 0 | 1 {
  return columnDefs?.length && isRowNumberColumnDef(columnDefs[0]) ? 1 : 0;
}
