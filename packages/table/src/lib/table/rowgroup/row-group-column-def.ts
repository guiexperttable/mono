import { ColumnDef } from "../data/tablemodel/column/column-def";
import { Size } from "../data/common/size";
import { AreaObjectMap } from "../data/common/area-map";
import { TrueFn } from "../data/common/boolean-function";
import type { RowGroupColumnOptionsIf } from "./row-group-column-options.if";

/**
 * The group column of a row grouping: arrows, indentation and the group labels (`"Nord (3)"`). Created by
 * {@link RowGroupFactory.createTableModel}; the column is sortable (by group key) and not editable. Its property is
 * {@link RowGroupColumnDef.PROPERTY} – sort and state refer to it like to any column.
 *
 * @example
 * const tableModel = RowGroupFactory.createTableModel<Sale>({ rows: sales, columnDefs, groupBy: ["region"] });
 * const groupColumn = tableModel.getColumnDefs()?.find(isRowGroupColumnDef);
 *
 * @since 1.1.94
 * @category Row grouping
 */
export class RowGroupColumnDef extends ColumnDef {

  /** The property of the group column. */
  static readonly PROPERTY = "RowGroupColumn";

  /** Marker for {@link isRowGroupColumnDef} (works across copies of the core). */
  readonly type = "RowGroupColumnDef";

  /** The options with defaults. */
  readonly options: RowGroupColumnOptionsIf;

  /** True if the header follows the grouping (no own `headerLabel`). */
  readonly autoHeaderLabel: boolean;

  constructor(options: Partial<RowGroupColumnOptionsIf> = {}) {
    const full: RowGroupColumnOptionsIf = {
      width: new Size(220, "px"),
      showCount: true,
      fixed: true,
      ...options,
    };
    super(
      RowGroupColumnDef.PROPERTY,
      full.headerLabel ?? "Group",
      full.width,
      new AreaObjectMap<string[]>(["ge-table-row-group-column-header"], ["ge-table-row-group-column"], []),
      new AreaObjectMap(),
      new Size(60, "px"),
      new Size(2000, "px"),
      TrueFn
    );
    this.options = full;
    this.autoHeaderLabel = options.headerLabel === undefined;
  }
}
