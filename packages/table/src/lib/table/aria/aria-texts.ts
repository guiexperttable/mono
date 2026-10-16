import { AriaTextsIf } from "./aria-texts.if";
import { SortState } from "../data/common/sort-state.type";

/**
 * The English default texts for screen readers (see {@link AriaTextsIf}).
 *
 * The table uses `AriaTexts.create(tableOptions.ariaTexts)`: your functions replace the defaults one by one.
 *
 * @example
 * const texts = AriaTexts.create({ copied: (n: number) => `${n} Zellen kopiert` });
 * texts.copied(3);       // "3 Zellen kopiert"
 * texts.filtered(42);    // "42 rows" (default)
 *
 * @since 1.1.91
 * @category Accessibility
 */
export class AriaTexts implements AriaTextsIf {

  /**
   * The default texts, overridden by the given functions.
   *
   * @param {Partial<AriaTextsIf>} [overrides] - functions that replace the English defaults (e.g. `tableOptions.ariaTexts`)
   * @returns {AriaTextsIf} a complete set of texts
   */
  static create(overrides?: Partial<AriaTextsIf>): AriaTextsIf {
    const texts = new AriaTexts();
    if (overrides) {
      for (const key of Object.keys(overrides) as (keyof AriaTextsIf)[]) {
        const fn = overrides[key];
        if (typeof fn === "function") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (texts as any)[key] = fn;
        }
      }
    }
    return texts;
  }

  sorted(columnLabel: string, sortState: SortState): string {
    if (sortState === "asc") return `Sorted by ${columnLabel}, ascending`;
    if (sortState === "desc") return `Sorted by ${columnLabel}, descending`;
    return `Sorting of ${columnLabel} removed`;
  }

  filtered(rowCount: number): string {
    if (rowCount === 0) return "No rows";
    return rowCount === 1 ? "1 row" : `${rowCount} rows`;
  }

  copied(cellCount: number): string {
    return cellCount === 1 ? "1 cell copied" : `${cellCount} cells copied`;
  }

  allSelected(): string {
    return "All cells selected";
  }

  selectionCleared(): string {
    return "Selection cleared";
  }

  selectRow(rowNumber: number): string {
    return `Select row ${rowNumber}`;
  }

  selectAllRows(): string {
    return "Select all rows";
  }

  expandGroup(groupLabel: string): string {
    return groupLabel ? `Expand group ${groupLabel}` : "Expand group";
  }

  collapseGroup(groupLabel: string): string {
    return groupLabel ? `Collapse group ${groupLabel}` : "Collapse group";
  }

  rowDragStarted(rowCount: number): string {
    return rowCount === 1 ? "Dragging 1 row. Press Escape to cancel." : `Dragging ${rowCount} rows. Press Escape to cancel.`;
  }

  rowMoved(position: number, rowCount: number): string {
    return `Row moved to position ${position} of ${rowCount}`;
  }

  rowMoveNotPossible(): string {
    return "Rows cannot be moved while the table is sorted or filtered";
  }

  rowDragCancelled(): string {
    return "Drag cancelled";
  }

  cellsFilled(cellCount: number): string {
    return cellCount === 1 ? "1 cell filled" : `${cellCount} cells filled`;
  }

  detailExpanded(): string {
    return "Details expanded";
  }

  detailCollapsed(): string {
    return "Details collapsed";
  }

  fillTooLarge(maxCells: number): string {
    return `Too many cells to fill (at most ${maxCells})`;
  }

  pendingChanges(pendingCount: number): string {
    if (pendingCount === 0) return "No unsaved changes";
    return pendingCount === 1 ? "1 change not saved" : `${pendingCount} changes not saved`;
  }

  changesCommitted(cellCount: number): string {
    return cellCount === 1 ? "1 change saved" : `${cellCount} changes saved`;
  }

  changesDiscarded(): string {
    return "Changes discarded";
  }

  commitBlocked(invalidCount: number): string {
    return invalidCount === 1 ? "1 invalid value – nothing saved" : `${invalidCount} invalid values – nothing saved`;
  }

  invalidValue(message: string): string {
    return message ? `Invalid value: ${message}` : "Invalid value";
  }

  editingStarted(columnLabel: string): string {
    return columnLabel ? `Editing ${columnLabel}` : "Editing";
  }

  readOnlyCell(): string {
    return "Read only";
  }

  cellsCleared(cellCount: number): string {
    return cellCount === 1 ? "1 cell cleared" : `${cellCount} cells cleared`;
  }

  clearTooLarge(maxCells: number): string {
    return `Too many cells to clear (at most ${maxCells})`;
  }

  rangeSelected(rowCount: number, columnCount: number): string {
    const rows = rowCount === 1 ? "1 row" : `${rowCount} rows`;
    const columns = columnCount === 1 ? "1 column" : `${columnCount} columns`;
    return `${rows}, ${columns} selected`;
  }

  rowSelected(rowCount: number): string {
    return rowCount === 1 ? "Row selected" : `${rowCount} rows selected`;
  }

  columnSelected(columnCount: number): string {
    return columnCount === 1 ? "Column selected" : `${columnCount} columns selected`;
  }

  gridEditingHint(): string {
    return "Type to edit a cell, Enter to edit or commit, Escape to cancel. Tab in the last column leaves the table.";
  }
}
