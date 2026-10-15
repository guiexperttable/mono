import type { TableModelIf } from "../data/tablemodel/table-model.if";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import { isAreaModelRowGroups, isRowGroupColumnDef } from "../instanceof-workaround";
import { resolveRowGroupFields, rowGroupLevelLabels } from "./row-group-internals";
import type { RowGroupField } from "./row-group-field.type";

// Not exported from index.ts: used by RowGroupFactory and TableScope.setRowGroupBy.

/** The header text of the group column for these levels, e.g. "Region › Produkt". */
export function rowGroupHeaderLabel(groupBy: RowGroupField[], columnDefs: ColumnDefIf[]): string {
  const labels = rowGroupLevelLabels(resolveRowGroupFields(groupBy),
    path => columnDefs.find(def => def.property === path && !isRowGroupColumnDef(def))?.headerLabel);
  return labels.length ? labels.join(" › ") : "Group";
}

/**
 * Adapts the columns of a row grouping to its current levels: hides the columns of the grouped properties (and shows
 * the ones it hid before that are no longer grouped) and sets the header of the group column.
 *
 * @returns true if the body is a row grouping
 */
export function updateRowGroupLayout(tableModel: TableModelIf): boolean {
  const body = tableModel.getBodyModel();
  if (!isAreaModelRowGroups(body)) {
    return false;
  }
  const columnDefs = tableModel.getColumnDefs() ?? [];
  const groupBy = body.getGroupBy();

  // grouped columns: hidden (their values are in the group column)
  const wanted = body.options.hideGroupedColumns === false ? [] : resolveRowGroupFields(groupBy)
    .map(field => field.path)
    .filter((path): path is string => path !== undefined
      && columnDefs.some(def => def.property === path && !isRowGroupColumnDef(def)));
  // only the columns the grouping hid come back – a column that was hidden before (isVisible: FalseFn) stays hidden
  const hidden = body.hiddenColumnProperties.filter(property => wanted.includes(property));
  for (const property of body.hiddenColumnProperties) {
    if (!wanted.includes(property)) tableModel.setColumnVisible?.(property, true);
  }
  for (const property of wanted) {
    if (hidden.includes(property) || !isVisible(columnDefs, property)) continue;
    tableModel.setColumnVisible?.(property, false);
    hidden.push(property);
  }
  body.hiddenColumnProperties = hidden;

  // the header of the group column
  const columnIndex = columnDefs.findIndex(isRowGroupColumnDef);
  const groupColumn = columnDefs[columnIndex];
  if (groupColumn && isRowGroupColumnDef(groupColumn) && groupColumn.autoHeaderLabel) {
    const label = rowGroupHeaderLabel(groupBy, columnDefs);
    groupColumn.headerLabel = label;
    const header = tableModel.getAreaModel("header");
    const lastHeaderRow = header.getRowCount() - 1;
    if (lastHeaderRow >= 0 && header.getValueAt(lastHeaderRow, columnIndex) !== label) {
      header.setValue(lastHeaderRow, columnIndex, label);
    }
  }
  return true;
}

function isVisible(columnDefs: ColumnDefIf[], property: string): boolean {
  return columnDefs.find(def => def.property === property)?.isVisible?.() !== false;
}
