import { SelectionModel } from './selection-model';
import { CellRange } from '../data/common/cell-range';
import { ObjectArrayHolderIf } from '../data/tablemodel/areamodel/object-array-holder.if';


/**
 * Class representing a multi-row selection model.
 * @extends SelectionModel
 *
 * @category Selection & focus
 */
export class MultiRowsSelectionModel<T> extends SelectionModel {

  constructor(
    public model: ObjectArrayHolderIf<T>
  ) {
    super('row', 'multi');
  }

  /**
   * Retrieves the selected rows from an array of all table rows.
   * The selection holds row indices of the displayed rows – pass the displayed (filtered, sorted) rows.
   *
   * @param {T[]} allrows - The array of all rows from the table model.
   * @returns {T[]} - The selected rows from the given array (the array itself if everything is selected).
   */
  getSelectedRowItems(allrows: T[]): T[] {
    if (this.isAllSelected() && !this.negativeRanges.length) {
      return allrows;
    }
    const selectedRowIds = new Set(this.getMergedRowIndices(allrows.length));
    return allrows.filter((_r, i) => selectedRowIds.has(i));
  };

  /**
   * Selects the specified row.
   *
   * @param {number} rowIndex - The index of the row to be selected.
   */
  selectRow(rowIndex: number) {
    this.addRange(CellRange.singleRow(rowIndex));
  }

  /**
   * Unselects the specified row.
   *
   * @param {number} rowIndex - The index of the row to be unselected.
   * @return {void}
   */
  unselectRow(rowIndex: number) {
    this.removeSelection(CellRange.singleRow(rowIndex));
  }

  /**
   * Toggles the selection of items based on current selection state.
   */
  toggleSelection() {
    if (this.isAllSelected()) {
      this.clear();

    } else if (this.hasNoSelection()) {
      this.selectAll();

    } else {
      const arr = this.model.getAllRows();
      this.silent = true;
      for (let i = 0; i < arr.length; i++) {
        this.toggleRow(i);
      }
      this.silent = false;
      this.fireChangeEvent();
    }
  }

  /**
   * Toggles the selection of filtered rows.
   * If all rows are currently selected, clears the selection.
   * If no rows are currently selected, selects all filtered rows.
   * Otherwise, toggles the selection of all filtered rows.
   *
   * @return {void}
   */
  toggleFilteredRowsSelection() {
    if (this.isAllSelected()) {
      this.clear();

    } else if (this.hasNoSelection()) {
      const arr = this.model.getFilteredRows();
      this.silent = true;
      for (let i = 0; i < arr.length; i++) {
        this.selectRow(i);
      }
      this.silent = false;
      this.fireChangeEvent();

    } else {
      const arr = this.model.getFilteredRows();
      this.silent = true;
      for (let i = 0; i < arr.length; i++) {
        this.toggleRow(i);
      }
      this.silent = false;
      this.fireChangeEvent();
    }
  }

  /**
   * Toggles the selection state of a row. A row that was toggled off can be toggled on again.
   *
   * @param {number} rowIndex - The index of the row to toggle.
   *
   * @return {void}
   */
  toggleRow(rowIndex: number) {
    if (this.isSelected(rowIndex, 0)) {
      this.unselectRow(rowIndex);
    } else if (this.reselectPoint(rowIndex, 0)) {
      this.fireChangeEvent();
    } else {
      this.selectRow(rowIndex);
    }
  }
}
