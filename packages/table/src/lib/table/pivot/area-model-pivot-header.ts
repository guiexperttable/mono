import { AreaModelCellGroups } from "../data/tablemodel/areamodel/area-model-cell-groups";
import type { CellGroupExt } from "../data/tablemodel/cellgroup/cell-group-ext";

// Not exported from index.ts: the grouped header of a pivot table (its public type is AreaModelCellGroups).

/**
 * The header of a pivot table: header groups with classes for the labels – column groups (`2026`, `Jan`) start at the
 * left of their span (a wide group stays readable), column labels (`Q1`, `Revenue`) sit above their numbers.
 */
export class AreaModelPivotHeader extends AreaModelCellGroups {

  override getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
    const cell = this.getValueAt(rowIndex, columnIndex) as CellGroupExt | null | undefined;
    if (!cell) {
      return [];
    }
    return cell.ownColumn() ? ["ge-table-pivot-header-column"] : ["ge-table-pivot-header-group"];
  }
}
