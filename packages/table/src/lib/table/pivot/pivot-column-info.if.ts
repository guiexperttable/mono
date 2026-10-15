import type { RowGroupIf } from "../rowgroup/row-group.if";
import type { PivotValueInfoIf } from "./pivot-value.type";

/**
 * What a value column of a pivot table shows ({@link AreaModelPivot.getColumnInfo}): the values of one column key
 * (`"value"`), the subtotal of a column group (`"subtotal"`, with {@link PivotConfigIf.columnSubtotals}) or the
 * total over all column keys (`"total"`).
 *
 * @example
 * const info = pivotModel.getPivotBody().getColumnInfo(columnIndex);
 * if (info?.kind === "value") console.log(info.column?.path, info.value.name);   // ["Jan"], "sum(umsatz)"
 *
 * @since 1.1.94
 * @category Pivot
 */
export interface PivotColumnInfoIf {
  /** `"value"` – one column key, `"subtotal"` – a column group, `"total"` – all columns. */
  readonly kind: "value" | "subtotal" | "total";
  /** The column key (lowest level) or column group; undefined for the total. */
  readonly column?: RowGroupIf;
  /** The value shown in the column. */
  readonly value: PivotValueInfoIf;
  /** The index of the value in {@link PivotConfigIf.values}. */
  readonly valueIndex: number;
}
