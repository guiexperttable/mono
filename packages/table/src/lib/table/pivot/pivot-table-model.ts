import { TableModel } from "../data/tablemodel/table-model";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { DefaultRowHeightsIf } from "../data/options/default-row-heights.if";
import type { GetT } from "../data/common/get-t";
import type { SelectionModelIf } from "../selection/selection-model.if";
import type { AreaModelCellGroups } from "../data/tablemodel/areamodel/area-model-cell-groups";
import type { AreaModelPivot } from "../data/tablemodel/areamodel/area-model-pivot";
import type { AreaModelPivotFooter } from "../data/tablemodel/areamodel/area-model-pivot-footer";
import type { SizeIf } from "../data/common/size.if";
import type { PivotConfigIf } from "./pivot-config.if";
import { buildPivotLayout, pivotGroupHeaderLabel } from "./pivot-layout";
import { isPivotColumnDef, isRowGroupColumnDef } from "../instanceof-workaround";
import { isApiColumnVisible, setApiColumnVisibility } from "../data/tablemodel/column/column-visibility";

/**
 * The table model of a pivot table – a {@link TableModel} (all wrappers take it) whose columns follow the pivot: a
 * group column, one column per column key × value, subtotal and total columns, a grouped header and a total row.
 * Created by {@link PivotFactory.createTableModel}.
 *
 * Pivot again at runtime – other fields, values or rows – with {@link TableApi.setPivotConfig}: the same model and the
 * same table get new columns (no new model, so no rebuild in the framework wrappers).
 *
 * @example
 * const tableModel = PivotFactory.createTableModel<Sale>({
 *   rows: sales, rowFields: ["region"], columnFields: ["monat"], values: ["umsatz"]
 * });
 * tableModel.getPivotBody().getResult().getValue();   // 450
 * tableModel.getPivotConfig().columnFields;           // ["monat"]
 *
 * @typeParam T - the row type
 * @since 1.1.94
 * @category Pivot
 */
export class PivotTableModel<T = any> extends TableModel {

  /** Marker for {@link isPivotTableModel} (works across copies of the core). */
  readonly kind = "PivotTableModel";

  private pivotFixedRightColumnCount: number;

  /**
   * Use {@link PivotFactory.createTableModel}.
   *
   * @param {AreaModelCellGroups} header - the grouped header
   * @param {AreaModelPivot<T>} body - the pivot body
   * @param {AreaModelPivotFooter<T>} footer - the total row
   * @param {ColumnDefIf[]} leadingColumnDefs - the columns in front of the values (row numbers, group column)
   * @param {ColumnDefIf[]} columnDefs - all columns (leading columns, value columns, total columns)
   * @param {number} fixedRightColumnCount - the fixed total columns on the right
   * @param {number} fixedLeftColumnCount - fixed columns on the left (the leading columns)
   * @param {DefaultRowHeightsIf} defaultRowHeights - row heights
   * @param {GetT<SelectionModelIf>} getSelectionModel - selection model factory
   * @param {SizeIf} [valueWidth] - the width of new value columns
   */
  constructor(
    header: AreaModelCellGroups,
    body: AreaModelPivot<T>,
    footer: AreaModelPivotFooter<T>,
    private readonly leadingColumnDefs: ColumnDefIf[],
    columnDefs: ColumnDefIf[],
    fixedRightColumnCount: number,
    fixedLeftColumnCount: number,
    defaultRowHeights: DefaultRowHeightsIf,
    getSelectionModel: GetT<SelectionModelIf>,
    private readonly valueWidth?: SizeIf
  ) {
    super(header, body, footer, fixedLeftColumnCount, fixedRightColumnCount, false, defaultRowHeights,
      columnDefs, [], -1, 0, 400, getSelectionModel);
    this.pivotFixedRightColumnCount = fixedRightColumnCount;
  }

  override getFixedRightColumnCount(): number {
    return this.pivotFixedRightColumnCount;
  }

  /**
   * The body: cells, row groups, drill-down ({@link AreaModelPivot.getCellSourceRows}) and the {@link PivotResult}.
   *
   * @returns {AreaModelPivot<T>} the body model
   *
   * @example
   * const pivotBody = pivotModel.getPivotBody();
   * pivotBody.getResult().columnLeaves.map(c => c.label);   // ["Feb", "Jan"]
   */
  getPivotBody(): AreaModelPivot<T> {
    return this.bodyAreaModel as AreaModelPivot<T>;
  }

  /**
   * The current configuration.
   *
   * @returns {PivotConfigIf<T>} a copy
   *
   * @example
   * pivotModel.getPivotConfig().rowFields;   // ["region"]
   */
  getPivotConfig(): PivotConfigIf<T> {
    return this.getPivotBody().getConfig();
  }

  /**
   * Pivots again with a changed configuration and/or new rows: new keys, columns, header and totals in this model.
   * Prefer {@link TableApi.setPivotConfig} – it also lays the table out again; after this method alone the table
   * must be laid out by you.
   *
   * @param {Partial<PivotConfigIf<T>>} changes - the changed parts, e.g. `{ columnFields: ["jahr"] }`
   * @param {T[]} [rows] - new source rows (default: the current ones)
   *
   * @example
   * pivotModel.setPivotConfig({ values: [{ value: "umsatz", aggregator: "avg" }] });
   */
  setPivotConfig(changes: Partial<PivotConfigIf<T>>, rows?: T[]): void {
    const body = this.getPivotBody();
    const config: PivotConfigIf<T> = { ...body.getConfig(), ...changes };
    body.configure(config, rows);
    this.relayout();
  }

  /** Columns and header for the current pivot of the body. */
  private relayout(): void {
    const body = this.getPivotBody();
    const header = this.headerAreaModel as AreaModelCellGroups;
    const config = body.getConfig();
    const groupColumn = this.leadingColumnDefs.find(isRowGroupColumnDef);
    if (groupColumn?.autoHeaderLabel) {
      groupColumn.headerLabel = pivotGroupHeaderLabel(config.rowFields ?? []);
    }
    const closedIds = new Set(header.getToggleGroupStates().filter(s => s.closed).map(s => s.id));
    const pivotColumns = this.columnDefs.filter(isPivotColumnDef);
    const widths = new Map(pivotColumns.map(def => [def.property, def.width] as const));
    const hidden = new Set(pivotColumns.filter(def => !isApiColumnVisible(def)).map(def => def.property));
    const layout = buildPivotLayout(body.getResult(), config, this.leadingColumnDefs,
      { valueWidth: this.valueWidth, closedIds, widths });
    const columnDefs = header.setGroups(layout.cellGroups, layout.columnDefs);
    // columns hidden with setColumnVisible() stay hidden (by property)
    columnDefs.filter(def => hidden.has(def.property)).forEach(def => setApiColumnVisibility(def, false));
    this.columnDefs = columnDefs;
    this.columnCount = columnDefs.length;
    this.columnSizes = [];
    this.pivotFixedRightColumnCount = layout.fixedRightColumnCount;
    body.setColumnDefs(columnDefs);
  }
}
