import { ColumnDef } from "../data/tablemodel/column/column-def";
import { AreaObjectMap } from "../data/common/area-map";
import { TrueFn } from "../data/common/boolean-function";
import { Size } from "../data/common/size";
import type { SizeIf } from "../data/common/size.if";
import type { PivotColumnInfoIf } from "./pivot-column-info.if";

/**
 * A value column of a pivot table – created by {@link PivotFactory} (you don't create them yourself). Its property is
 * stable for the same column key and value (`pivot:[["monat","s:Jan"],"sum(umsatz)"]`), so widths and sorting are
 * remembered like for any column; {@link AreaModelPivot.getColumnProperty} builds it for you.
 *
 * @example
 * const columns = tableModel.getColumnDefs()?.filter(isPivotColumnDef) ?? [];
 * columns.map(c => c.pivot.kind);   // ["value", "value", "total"]
 *
 * @since 1.1.94
 * @category Pivot
 */
export class PivotColumnDef extends ColumnDef {

  /** Marker for {@link isPivotColumnDef} (works across copies of the core). */
  readonly type = "PivotColumnDef";

  /**
   * @param {string} property - the stable property
   * @param {string} headerLabel - the label in the lowest header row
   * @param {PivotColumnInfoIf} pivot - what the column shows
   * @param {SizeIf} [width] - the width (default 100 px)
   */
  constructor(property: string, headerLabel: string, readonly pivot: PivotColumnInfoIf, width: SizeIf = new Size(100, "px")) {
    super(
      property,
      headerLabel,
      width,
      new AreaObjectMap<string[]>(["ge-table-pivot-header", `ge-table-pivot-header-${pivot.kind}`], [], []),
      new AreaObjectMap(),
      new Size(40, "px"),
      new Size(2000, "px"),
      TrueFn
    );
  }
}
