import type { TableModelIf } from "../data/tablemodel/table-model.if";
import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { AggregateFooterConfig } from "../data/tablemodel/areamodel/aggregate-footer-options.if";
import type { RowGroupTableModelParaIf } from "./row-group-table-model-para.if";
import { TableFactory } from "./table-factory";
import { ColumnDef } from "../data/tablemodel/column/column-def";
import { px200 } from "../data/common/sizes";
import { DefaultRowHeights } from "../data/options/default-row-heights";
import { RowNumberColumnDef } from "../data/common/row-number-column-def";
import { AreaModelRowGroups } from "../data/tablemodel/areamodel/area-model-row-groups";
import { RowGroupColumnDef } from "../rowgroup/row-group-column-def";
import { rowGroupHeaderLabel, updateRowGroupLayout } from "../rowgroup/row-group-layout";
import { TreeCheckboxModel } from "../checkbox/tree-checkbox-model";
import { isCheckboxColumnDef, isRowNumberColumnDef } from "../instanceof-workaround";

/**
 * Creates a table model that groups flat rows: one row per group with an arrow, a label (`"Nord (3)"`) and
 * aggregates per column, below it the sub-groups or the original rows – plus a total row. MIT-licensed, no
 * dependencies, built on the tree table ({@link AreaModelRowGroups}).
 *
 * What the factory does:
 * - puts a {@link RowGroupColumnDef} (arrows, labels) behind row numbers and checkbox column and fixes it on the left;
 * - hides the columns of grouped properties (`hideGroupedColumns`), their values are in the group column;
 * - builds the body ({@link AreaModelRowGroups}) and a total row from the `aggregations` ({@link AreaModelAggregateFooter}).
 *
 * Regroup at runtime with {@link TableApi.setRowGroupBy}; filter, sort, edit and export as in any table.
 *
 * @example
 * // R1: sales by region, sum of umsatz, total row
 * const tableModel = RowGroupFactory.createTableModel<Sale>({
 *   rows: sales,
 *   columnDefs,
 *   groupBy: ["region"],
 *   aggregations: { umsatz: "sum" }
 * });
 * // ▾ Nord (3) … 270 · A Jan 100 · B Jan 50 · A Feb 120 · ▾ Süd (3) … 180 · … · footer "6 rows" … 450
 *
 * @example
 * // two levels, all groups closed, regroup with a select
 * const tableModel = RowGroupFactory.createTableModel<Order>({
 *   rows: orders, columnDefs, groupBy: ["country", "city"],
 *   aggregations: { quantity: "sum", total: "sum" }, expanded: 0
 * });
 * select.addEventListener("change", () => tableApi.setRowGroupBy(select.value.split(",")));
 *
 * @see [Live demo: row grouping](https://gui.expert/showcase/rowgrouping/run/) · Training: [Row grouping](https://gui.expert/training/row-grouping/)
 *
 * @since 1.1.94
 * @category Row grouping
 */
export class RowGroupFactory {

  /**
   * Creates the table model of a row grouping (see the class description).
   *
   * @param {RowGroupTableModelParaIf<T>} p - rows, levels, columns, aggregations, options
   * @returns {TableModelIf} the table model – its body is an {@link AreaModelRowGroups}
   *
   * @example
   * const tableModel = RowGroupFactory.createTableModel<Sale>({
   *   rows: sales, columnDefs, groupBy: ["region", "produkt"], aggregations: { umsatz: "avg" }
   * });
   * const body = tableModel.getBodyModel() as AreaModelRowGroups<Sale>;
   * body.getGroups()[0].results.umsatz;   // 90 – Nord, the average of its three rows
   */
  static createTableModel<T = any>(p: RowGroupTableModelParaIf<T>): TableModelIf {
    const rows = p.rows ?? [];
    let columnDefs: ColumnDefIf[] = p.columnDefs
      ? [...p.columnDefs]
      : rows.length ? Object.keys(rows[0] as object).map(key => new ColumnDef(key, key.toUpperCase(), px200)) : [];
    const defaultRowHeights = p.defaultRowHeights ?? p.tableOptions?.defaultRowHeights ?? new DefaultRowHeights();
    let fixedLeftColumnCount = p.fixedLeftColumnCount ?? 0;

    // row numbers first (TableFactory would ignore the flag with an own body model)
    if (p.rowNumbersVisible && !isRowNumberColumnDef(columnDefs[0])) {
      columnDefs = [new RowNumberColumnDef(p.rowNumbersVisible === true ? {} : p.rowNumbersVisible), ...columnDefs];
      fixedLeftColumnCount++;
    }
    // the group column: behind row numbers and checkbox column
    let leading = isRowNumberColumnDef(columnDefs[0]) ? 1 : 0;
    const hasCheckboxColumn = isCheckboxColumnDef(columnDefs[leading]);
    if (hasCheckboxColumn) leading++;
    const groupColumn = new RowGroupColumnDef(p.groupColumn ?? {});
    if (groupColumn.autoHeaderLabel) {
      groupColumn.headerLabel = rowGroupHeaderLabel(p.groupBy ?? [], columnDefs);
    }
    columnDefs.splice(leading, 0, groupColumn);
    if (groupColumn.options.fixed) {
      fixedLeftColumnCount = Math.max(fixedLeftColumnCount, leading) + 1;
    }

    const body = new AreaModelRowGroups<T>(rows, columnDefs, {
      groupBy: p.groupBy ?? [],
      aggregations: p.aggregations,
      expanded: p.expanded,
      emptyLabel: p.emptyLabel,
      groupColumn: groupColumn.options,
      hideGroupedColumns: p.hideGroupedColumns,
    }, defaultRowHeights.body);
    if (hasCheckboxColumn || p.tableOptions?.showCheckboxWihoutExtraColumn) {
      body.rowSelectionModel = new TreeCheckboxModel(body.rows);
    }

    const tableModel = TableFactory.createTableModel({
      columnDefs,
      bodyAreaModel: body,
      footerAggregates: RowGroupFactory.footerConfig(p),
      fixedLeftColumnCount,
      fixedRightColumnCount: p.fixedRightColumnCount ?? 0,
      rowCheckboxVisible: p.rowCheckboxVisible ?? hasCheckboxColumn,
      defaultRowHeights,
      getSelectionModel: p.getSelectionModel,
      tableOptions: p.tableOptions,
    });
    updateRowGroupLayout(tableModel);
    return tableModel;
  }

  /**
   * Hides the columns of the grouped properties (and shows the ones that are no longer grouped) and sets the header of
   * the group column – after `body.setGroupBy(…)`. {@link TableApi.setRowGroupBy} calls it for you.
   *
   * @param {TableModelIf} tableModel - a table model of {@link createTableModel}
   * @returns {boolean} false if the body is no row grouping
   *
   * @example
   * const body = tableModel.getBodyModel() as AreaModelRowGroups<Sale>;
   * body.setGroupBy(["produkt"]);
   * RowGroupFactory.updateLayout(tableModel);
   * tableApi.recalcWrappers();
   * tableApi.repaintHard();
   */
  static updateLayout(tableModel: TableModelIf): boolean {
    return updateRowGroupLayout(tableModel);
  }

  private static footerConfig<T>(p: RowGroupTableModelParaIf<T>): AggregateFooterConfig<T> | undefined {
    const footer = p.footerAggregates;
    if (footer === false) {
      return undefined;
    }
    if (footer === undefined || footer === true) {
      return p.aggregations && Object.keys(p.aggregations).length ? p.aggregations : undefined;
    }
    return footer;
  }
}
