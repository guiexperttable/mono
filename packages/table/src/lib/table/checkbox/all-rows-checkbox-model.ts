import { CheckedType } from "../data/common/checked-type";
import { AreaModelIf } from "../data/tablemodel/areamodel/area-model.if";
import { CheckboxModelIf } from "./checkbox-model.if";

/**
 * Checkbox model of the HEADER checkbox of a `CheckboxColumnDef`: it stands for all (filtered) rows of the body.
 * - `isRowChecked()`: `"full"` if every body row is checked, `"semi"` if some are, `"none"` otherwise;
 * - `checkRow(_, true)` checks all body rows, `checkRow(_, false)` unchecks all;
 * - `getCheckedRows()` = the checked rows of the body (reported by `onCheckboxChanged`).
 *
 * Set by `TableModel` for a `CheckboxColumnDef` in column 0 (internal, not exported).
 */
export class AllRowsCheckboxModel<T> implements CheckboxModelIf<T> {

  // isRowChecked() runs with every header render (every scroll frame) – cache the result of the full check
  private cache?: { checkedRows: T[]; checkedCount: number; rowCount: number; state: CheckedType };

  constructor(private readonly bodyAreaModel: AreaModelIf) {
  }

  getCheckedRows(): T[] {
    return this.bodyAreaModel.rowSelectionModel?.getCheckedRows() ?? [];
  }

  setCheckedRows(rows: T[]): void {
    this.bodyAreaModel.rowSelectionModel?.setCheckedRows(rows);
  }

  addCheckedRows(rows: T[]): void {
    this.bodyAreaModel.rowSelectionModel?.addCheckedRows(rows);
  }

  checkRow(_row: T, check: boolean): void {
    this.checkAll(check ? this.getBodyRows() : []);
  }

  isRowChecked(_row: T): CheckedType {
    const checkedRows = this.getCheckedRows();
    const rowCount = this.bodyAreaModel.getRowCount();
    if (!checkedRows.length || !rowCount) {
      return "none";
    }
    if (checkedRows.length < rowCount) {
      return "semi"; // not enough checked rows for "all" – no need to look at the rows
    }
    const c = this.cache;
    if (c && c.checkedRows === checkedRows && c.checkedCount === checkedRows.length && c.rowCount === rowCount) {
      return c.state;
    }
    const checked = new Set(checkedRows);
    let state: CheckedType = "full";
    for (let i = 0; i < rowCount; i++) {
      if (!checked.has(this.bodyAreaModel.getRowByIndex(i))) {
        state = "semi";
        break;
      }
    }
    this.cache = { checkedRows, checkedCount: checkedRows.length, rowCount, state };
    return state;
  }

  /**
   * Checks the given rows of the body in addition to the checked ones; an empty array unchecks all rows.
   *
   * @param {T[]} rows - the rows to check (`[]` = uncheck all)
   */
  checkAll(rows: T[]): void {
    const model = this.bodyAreaModel.rowSelectionModel;
    if (!model) {
      return;
    }
    if (!rows.length) {
      model.setCheckedRows([]);
      return;
    }
    // a Set: CheckboxModel.addCheckedRows() is O(n²) for many rows
    const checked = new Set(model.getCheckedRows());
    rows.forEach(row => checked.add(row));
    model.setCheckedRows(Array.from(checked));
  }

  private getBodyRows(): T[] {
    const rowCount = this.bodyAreaModel.getRowCount();
    const rows: T[] = new Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
      rows[i] = this.bodyAreaModel.getRowByIndex(i);
    }
    return rows;
  }
}
