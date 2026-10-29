import { Component } from "@angular/core";
import { RowGroupField, TableApi, TableOptionsIf } from "@guiexpert/table";
import { createRowGroupModelAndOptions, SalesOrderIf } from "@guiexpert/demo-table-models";

/**
 * Row grouping (since @guiexpert/table 1.1.94): 50,000 orders grouped by country › city with sums, an average and a
 * total row. The select regroups at runtime (`tableApi.setRowGroupBy` – no new model, no rebuild of the component),
 * the filter works on the orders: groups, sums and the total row follow it.
 */
@Component({
  selector: "demo-rowgroup",
  templateUrl: "./demo-rowgroup.component.html",
  styleUrls: ["./demo-rowgroup.component.css"],
})
export class DemoRowgroupComponent {

  private filterText = "";
  private tableApi?: TableApi;

  private readonly modelAndOptions = createRowGroupModelAndOptions(50_000, ["country", "city"], 1);
  readonly tableModel = this.modelAndOptions.tableModel;
  readonly tableOptions: TableOptionsIf = {
    ...this.modelAndOptions.tableOptions,
    externalFilterFunction: (o: SalesOrderIf) =>
      !this.filterText || `${o.country} ${o.city} ${o.product} ${o.category}`.toLowerCase().includes(this.filterText),
  };

  onTableReady(api: TableApi): void {
    this.tableApi = api;
  }

  /** "country,city" → levels; "" = flat (with the total row). */
  regroup(value: string): void {
    const levels: RowGroupField<SalesOrderIf>[] = value ? value.split(",") : [];
    this.tableApi?.setRowGroupBy(levels);
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
}
