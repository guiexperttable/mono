import type { ColumnDefIf } from "../data/tablemodel/column/column-def.if";
import type { PivotTableModelParaIf } from "./pivot-table-model-para.if";
import type { PivotConfigIf } from "../pivot/pivot-config.if";
import { DefaultRowHeights } from "../data/options/default-row-heights";
import { RowNumberColumnDef } from "../data/common/row-number-column-def";
import { AreaModelPivotHeader } from "../pivot/area-model-pivot-header";
import { AreaModelPivot } from "../data/tablemodel/areamodel/area-model-pivot";
import { AreaModelPivotFooter } from "../data/tablemodel/areamodel/area-model-pivot-footer";
import { RowGroupColumnDef } from "../rowgroup/row-group-column-def";
import { PivotTableModel } from "../pivot/pivot-table-model";
import { buildPivotLayout, pivotGroupHeaderLabel } from "../pivot/pivot-layout";

/**
 * Creates pivot tables: rows grouped by row fields (a hierarchy with subtotals), the values of column fields as
 * columns (several fields = a multi-row header), aggregated values in the cells, total column and total row.
 * MIT-licensed, no dependencies – at ag-Grid this is an Enterprise feature.
 *
 * The configuration has the form of a row grouping ({@link RowGroupFactory}): fields are property paths, functions
 * (e.g. the quarter of a date) or {@link RowGroupFieldIf} with label, format and order; values use the aggregators of
 * {@link Aggregators} (`sum`, `avg`, `count` …) or your own {@link AggregatorIf}. Subtotals and totals are merged from
 * aggregation states – an average is always the average of the rows.
 *
 * Filter with `externalFilterFunction` (it gets your source objects, before the aggregation), sort by clicking a value
 * column, export with `downloadExcel()`, and pivot again at runtime with {@link TableApi.setPivotConfig}.
 *
 * @example
 * // case 1: regions × months, sum of umsatz, total column and total row
 * const tableModel = PivotFactory.createTableModel<Sale>({
 *   rows: sales,
 *   rowFields: ["region"],
 *   columnFields: [{ value: "monat", order: "insertion" }],
 *   values: ["umsatz"]
 * });
 * // Region | Jan | Feb | Total
 * // Nord   | 150 | 120 |   270
 * // Süd    |  80 | 100 |   180
 * // Total  | 230 | 220 |   450
 *
 * @example
 * // countries › cities × years, revenue, all groups closed; pivot by another field with a select
 * const tableModel = PivotFactory.createTableModel<Order>({
 *   rows: orders,
 *   rowFields: ["country", "city"],
 *   columnFields: [{ name: "year", label: "Year", value: o => new Date(o.date).getFullYear() }],
 *   values: [{ value: "total", label: "Revenue" }],
 *   expanded: 0
 * });
 * select.addEventListener("change", () => tableApi.setPivotConfig({ columnFields: [select.value] }));
 *
 * @see [Live demo: pivot tables](https://gui.expert/showcase/pivot/run/) · Training: [Pivot tables](https://gui.expert/training/pivot-tables/)
 *
 * @since 1.1.94
 * @category Pivot
 */
export class PivotFactory {

  /**
   * Creates the table model of a pivot table (see the class description).
   *
   * @param {PivotTableModelParaIf<T>} p - rows, row fields, column fields, values, options
   * @returns {PivotTableModel<T>} the table model – a {@link TableModelIf}
   *
   * @example
   * // case 3: the average – Jan total is 230 / 3 = 76.67, not the mean of the region averages (77.5)
   * const tableModel = PivotFactory.createTableModel<Sale>({
   *   rows: sales, rowFields: ["region"], columnFields: ["monat"],
   *   values: [{ value: "umsatz", aggregator: "avg" }]
   * });
   */
  static createTableModel<T = any>(p: PivotTableModelParaIf<T>): PivotTableModel<T> {
    const defaultRowHeights = p.defaultRowHeights ?? p.tableOptions?.defaultRowHeights ?? new DefaultRowHeights();
    const config = PivotFactory.toConfig(p);

    const leading: ColumnDefIf[] = [];
    if (p.rowNumbersVisible) {
      leading.push(new RowNumberColumnDef(p.rowNumbersVisible === true ? {} : p.rowNumbersVisible));
    }
    const groupColumnOptions = { showCount: false, ...(p.groupColumn ?? {}) };
    const groupColumn = new RowGroupColumnDef(groupColumnOptions);
    if (groupColumn.autoHeaderLabel) {
      groupColumn.headerLabel = pivotGroupHeaderLabel(config.rowFields ?? []);
    }
    leading.push(groupColumn);
    const fixedLeftColumnCount = groupColumn.options.fixed ? leading.length : leading.length - 1;

    const body = new AreaModelPivot<T>(p.rows ?? [], config, groupColumn.options, defaultRowHeights.body);
    const layout = buildPivotLayout(body.getResult(), config, leading, { valueWidth: p.valueColumnWidth });
    const header = new AreaModelPivotHeader("header", layout.cellGroups, layout.columnDefs, defaultRowHeights.header,
      p.tableOptions?.headerGroupOptions);
    layout.columnDefs = header.setGroups(layout.cellGroups, layout.columnDefs);
    body.setColumnDefs(layout.columnDefs);
    const footer = new AreaModelPivotFooter<T>(body, defaultRowHeights.footer);

    const getSelectionModel = p.getSelectionModel ?? p.tableOptions?.getSelectionModel ?? (() => undefined);
    return new PivotTableModel<T>(header, body, footer, leading, layout.columnDefs, layout.fixedRightColumnCount,
      fixedLeftColumnCount, defaultRowHeights, getSelectionModel, p.valueColumnWidth);
  }

  /** The pivot part of the parameters. */
  private static toConfig<T>(p: PivotTableModelParaIf<T>): PivotConfigIf<T> {
    return {
      rowFields: p.rowFields ?? [],
      columnFields: p.columnFields ?? [],
      values: p.values,
      subtotals: p.subtotals,
      columnSubtotals: p.columnSubtotals,
      totalColumn: p.totalColumn,
      totalRow: p.totalRow,
      maxColumns: p.maxColumns,
      expanded: p.expanded,
      emptyLabel: p.emptyLabel,
      emptyText: p.emptyText,
      totalLabel: p.totalLabel,
    };
  }
}
