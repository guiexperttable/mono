import type { TableModelIf } from "../data/tablemodel/table-model.if";
import type { SelectionModelIf } from "./selection-model.if";
import type { SelectionAggregatesIf } from "../aggregation/selection-aggregates.if";
import { CellRange } from "../data/common/cell-range";
import { isCheckboxColumnDef, isRowNumberColumnDef } from "../instanceof-workaround";
import { Aggregators } from "../aggregation/aggregators";

/**
 * Computes count, sum, average, minimum and maximum of the selected body cells ({@link SelectionAggregatesIf}) – what
 * {@link TableApi.getSelectionAggregates} returns, e.g. for a status bar under the table.
 *
 * Counted are the selected cells of the visible data columns (no row numbers, no checkbox column); the numbers are the
 * cell values (`getValueAt`) of type `number`. Negative ranges (Ctrl/⌘-click) are respected. A selection whose ranges
 * cover more than {@link maxCells} cells is not computed (`capped: true`).
 *
 * @example
 * SelectionAggregator.maxCells = 5_000_000;            // allow bigger selections
 * const a = new SelectionAggregator().aggregate(tableModel, selectionModel);
 *
 * @since 1.1.94
 * @category Aggregation
 */
export class SelectionAggregator {

  /**
   * Upper limit for the cells of the selected ranges (Ctrl+A on millions of rows). Like
   * {@link CopyService.maxCopyCells}: above it nothing is computed.
   *
   * @example
   * SelectionAggregator.maxCells = 2_000_000;
   */
  public static maxCells = 1_000_000;

  /**
   * @param {TableModelIf} tableModel - the table model (body rows, columns, visibility)
   * @param {SelectionModelIf | undefined} selectionModel - the selection; none → all zero
   * @returns {SelectionAggregatesIf} the aggregates of the selected cells
   */
  aggregate(tableModel: TableModelIf, selectionModel: SelectionModelIf | undefined): SelectionAggregatesIf {
    const result: SelectionAggregatesIf = {
      count: 0, numericCount: 0, sum: 0, avg: undefined, min: undefined, max: undefined, capped: false,
    };
    if (!selectionModel?.hasSelection()) {
      return result;
    }
    const bodyModel = tableModel.getBodyModel();
    const rowCount = bodyModel.getRowCount();
    const columnCount = tableModel.getColumnCount();
    // the cells of the visible data columns per range, clipped to the body (Ctrl+A: one range over everything)
    const ranges = (selectionModel.isAllSelected()
      ? [new CellRange(0, 0, rowCount - 1, columnCount - 1)]
      : selectionModel.getRanges())
      .map(range => ({
        r1: Math.max(0, Math.min(range.r1, range.r2)),
        r2: Math.min(rowCount - 1, Math.max(range.r1, range.r2)),
        columns: this.dataColumns(tableModel, Math.max(0, Math.min(range.c1, range.c2)), Math.min(columnCount - 1, Math.max(range.c1, range.c2)))
      }))
      .filter(range => range.r2 >= range.r1 && range.columns.length);
    // the cap counts cells of the ranges (an upper bound: overlaps count twice) – not of their bounding box
    const cellCount = ranges.reduce((sum, range) => sum + (range.r2 - range.r1 + 1) * range.columns.length, 0);
    if (cellCount > SelectionAggregator.maxCells) {
      result.capped = true;
      return result;
    }
    const { sum, min, max } = Aggregators;
    let sumState = sum.init(), minState = min.init(), maxState = max.init();
    ranges.forEach((range, i) => {
      const earlier = ranges.slice(0, i);
      for (let r = range.r1; r <= range.r2; r++) {
        for (const c of range.columns) {
          // overlapping ranges: a cell counts in its first range only; negative ranges via isSelected
          if (earlier.length && earlier.some(o => r >= o.r1 && r <= o.r2 && o.columns.includes(c))) continue;
          if (!selectionModel.isSelected(r, c)) continue;
          result.count++;
          const value = bodyModel.getValueAt(r, c);
          if (typeof value === "number" && !Number.isNaN(value)) {
            result.numericCount++;
            sumState = sum.add(sumState, value);
            minState = min.add(minState, value);
            maxState = max.add(maxState, value);
          }
        }
      }
    });
    if (result.numericCount) {
      result.sum = sum.result(sumState) as number;
      result.avg = result.sum / result.numericCount;
      result.min = min.result(minState) as number;
      result.max = max.result(maxState) as number;
    }
    return result;
  }

  /** The visible data columns between c1 and c2 (no hidden, row number or checkbox columns). */
  private dataColumns(tableModel: TableModelIf, c1: number, c2: number): number[] {
    const columns: number[] = [];
    for (let c = c1; c <= c2; c++) {
      const columnDef = tableModel.getColumnDef(c);
      if (columnDef?.isVisible?.() === false || isRowNumberColumnDef(columnDef) || isCheckboxColumnDef(columnDef)) continue;
      columns.push(c);
    }
    return columns;
  }
}
