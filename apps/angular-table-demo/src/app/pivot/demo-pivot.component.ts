import { ChangeDetectorRef, Component } from "@angular/core";
import { GeMouseEvent, PivotTableModel, RowGroupField, TableApi, TableOptionsIf } from "@guiexpert/table";
import { createPivotModelAndOptions, PivotOrderIf, pivotQuarter, pivotYear } from "@guiexpert/demo-table-models";

/**
 * Pivot table (since @guiexpert/table 1.1.94): 50,000 orders – country › city × year › quarter, revenue and number of
 * orders, year totals, total column and total row. The select pivots again at runtime (`tableApi.setPivotConfig` – no
 * new model), the filter works on the orders (before the aggregation), a click shows the orders behind a cell.
 */
@Component({
  selector: "demo-pivot",
  templateUrl: "./demo-pivot.component.html",
  styleUrls: ["./demo-pivot.component.css"],
})
export class DemoPivotComponent {

  drillText = "Click a cell to see how many orders are behind it.";

  private filterText = "";
  private tableApi?: TableApi;

  private readonly modelAndOptions = createPivotModelAndOptions(50_000, [pivotYear, pivotQuarter], 0);
  readonly tableModel = this.modelAndOptions.tableModel as PivotTableModel<PivotOrderIf>;
  readonly tableOptions: TableOptionsIf = {
    ...this.modelAndOptions.tableOptions,
    externalFilterFunction: (o: PivotOrderIf) =>
      !this.filterText || `${o.country} ${o.city} ${o.product} ${o.category}`.toLowerCase().includes(this.filterText),
  };

  constructor(private readonly cdr: ChangeDetectorRef) {
  }

  onTableReady(api: TableApi): void {
    this.tableApi = api;
  }

  /** "year,quarter" → column fields; year and quarter are functions of the order date. */
  repivot(value: string): void {
    const fields: RowGroupField<PivotOrderIf>[] = value
      ? value.split(",").map(f => f === "year" ? pivotYear : f === "quarter" ? pivotQuarter : f)
      : [];
    this.tableApi?.setPivotConfig({ columnFields: fields });
  }

  filter(text: string): void {
    this.filterText = text.trim().toLowerCase();
    this.tableApi?.externalFilterChanged();
  }

  expandAll(): void {
    this.tableApi?.expandAll();
  }

  collapseAll(): void {
    this.tableApi?.collapseAll();
  }

  /** Drill-down: the orders behind the clicked cell. The table runs outside Angular's zone → detectChanges(). */
  onMouseClicked(evt: GeMouseEvent): void {
    if (evt.areaIdent !== "body" || evt.rowIndex < 0) return;
    const body = this.tableModel.getPivotBody();
    const rows = body.getCellSourceRows(evt.rowIndex, evt.columnIndex);
    const label = body.getRowGroup(evt.rowIndex)?.label ?? "Total";
    const column = body.getColumnInfo(evt.columnIndex)?.column?.label ?? "all columns";
    this.drillText = `${label}, ${column}: ${rows.length.toLocaleString("en-US")} orders`;
    this.cdr.detectChanges();
  }
}
