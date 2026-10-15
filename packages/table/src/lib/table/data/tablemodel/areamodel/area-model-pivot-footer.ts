import { AreaModel } from "./area-model";
import type { HasDefaultRowHeightIf } from "./has-default-row-height-if";
import type { CellRendererIf } from "../../../renderer/cell-render.if";
import type { AreaModelPivot } from "./area-model-pivot";
import { RowGroupColumnDef } from "../../../rowgroup/row-group-column-def";
import { formatAggregateValue } from "../../../aggregation/aggregate";
import { AggregateCellRenderer } from "../../../renderer/aggregate-cell-renderer";
import { DEFAULT_TOTAL_LABEL } from "../../../pivot/pivot-internals";
import { formatShowValuesAs } from "../../../calc/show-values-as";

/**
 * The total row of a pivot table: the label `"Total"` in the group column and the column totals (cells, subtotals,
 * grand total) of the {@link AreaModelPivot}. The totals come from the source rows (merged states), never from the
 * displayed rows – an average stays the average of all rows. Created by {@link PivotFactory.createTableModel}
 * (`totalRow: false` → no row).
 *
 * @example
 * const footer = tableModel.getAreaModel("footer") as AreaModelPivotFooter;
 * footer.getValueAt(0, pivotModel.getPivotBody().getColumnIndex([]));   // 450 – the grand total
 *
 * @since 1.1.94
 * @category Pivot
 */
export class AreaModelPivotFooter<T = any> extends AreaModel implements HasDefaultRowHeightIf {

  /** Marker (works across copies of the core). */
  readonly type = "AreaModelPivotFooter";

  private readonly textRenderer = new AggregateCellRenderer();

  /**
   * @param {AreaModelPivot<T>} body - the pivot body (its columns and totals)
   * @param {number} [defaultRowHeight=34] - row height in px
   */
  constructor(private readonly body: AreaModelPivot<T>, public defaultRowHeight: number = 34) {
    super();
    this.areaIdent = "footer";
  }

  /** 1 – or 0 with `totalRow: false` or without row fields (the body shows the total then). */
  override getRowCount(): number {
    const config = this.body.getConfig();
    return config.totalRow === false || !(config.rowFields?.length) ? 0 : 1;
  }

  override getRowHeight(_rowIndex: number): number {
    return this.defaultRowHeight;
  }

  override getConstantRowHeight(): number | undefined {
    return this.defaultRowHeight;
  }

  override getValueAt(rowIndex: number, columnIndex: number): any {
    if (rowIndex !== 0) {
      return "";
    }
    if (this.isRowHeaderCell(rowIndex, columnIndex)) {
      return this.body.getConfig().totalLabel ?? DEFAULT_TOTAL_LABEL;
    }
    const info = this.body.getColumnInfo(columnIndex);
    if (!info) {
      return "";
    }
    return this.body.getShownValue(undefined, info);
  }

  override getTextValueAt(rowIndex: number, columnIndex: number): string {
    const info = this.body.getColumnInfo(columnIndex);
    const value = this.getValueAt(rowIndex, columnIndex);
    if (!info) {
      return value === undefined || value === null ? "" : `${value}`;
    }
    if (value === undefined) {
      return this.body.getConfig().emptyText ?? "";
    }
    if (info.value.showValuesAs) {
      return formatShowValuesAs(value, info.value.showValuesAs);
    }
    return info.value.format ? info.value.format(value) : formatAggregateValue(value);
  }

  override getCellRenderer(_rowIndex: number, columnIndex: number): CellRendererIf | undefined {
    return this.body.getColumnInfo(columnIndex) || this.isLabelColumn(columnIndex) ? this.textRenderer : undefined;
  }

  override getCustomClassesAt(rowIndex: number, columnIndex: number): string[] {
    if (this.isLabelColumn(columnIndex)) {
      return ["ge-table-pivot-total", "ge-table-pivot-label"];
    }
    const info = this.body.getColumnInfo(columnIndex);
    if (!info) {
      return [];
    }
    const ret = ["ge-table-pivot-value", "ge-table-pivot-total"];
    if (this.getValueAt(rowIndex, columnIndex) === undefined) ret.push("ge-table-pivot-empty");
    return ret;
  }

  /**
   * True for the label cell ("Total") – the table gives it `role="rowheader"`.
   *
   * @param {number} rowIndex - footer row
   * @param {number} columnIndex - column index
   * @returns {boolean} true for the group column of the total row
   */
  isRowHeaderCell(rowIndex: number, columnIndex: number): boolean {
    return rowIndex === 0 && this.isLabelColumn(columnIndex);
  }

  private isLabelColumn(columnIndex: number): boolean {
    return this.body.getPropertyAt(columnIndex) === RowGroupColumnDef.PROPERTY;
  }
}
