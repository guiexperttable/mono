// Chapter 15 – a header is an area model too: a multi-row header with groups you can collapse.
// #region groups
import {
  AreaModelCellGroups, AreaModelObjectArrayWithColumndefs, type CellGroupIf, CellgroupFactory,
  EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope, px80, px110, px120, px160
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";

const groups: CellGroupIf[] = [
  { data: "Order", children: [{ data: "ID", property: "id" }, { data: "Date", property: "date" }] },
  { data: "Customer", toggle: true, children: [                        // toggle → collapsible (❯)
    { data: "Customer", property: "customer", visibility: "always" },  // stays when collapsed
    { data: "Country", property: "country" },
    { data: "City", property: "city" }] },
  { data: "Product", toggle: true, children: [
    { data: "Product", property: "product", visibility: "always" },
    { data: "Category", property: "category" }] },
  { data: "Amount", children: [
    { data: "Qty", property: "quantity" }, { data: "Price", property: "price" }, { data: "Total", property: "total" }] }
];
// #endregion groups

import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  // #region model
  const columnDefs = CellgroupFactory.buildColumnDefs(CellgroupFactory.buildGroupExts(groups));
  for (const def of columnDefs) {                      // the default width is 100 px
    def.width = ["customer", "product"].includes(def.property) ? px160 : def.property === "id" ? px80 : def.property === "date" ? px120 : px110;
  }
  const header = new AreaModelCellGroups("header", groups, columnDefs, 34);
  const body = new AreaModelObjectArrayWithColumndefs<Order>("body", createOrders(10_000), columnDefs, 34);
  const tableModel = TableFactory.createTableModel({ headerAreaModel: header, bodyAreaModel: body, columnDefs });

  const host = ctx.host; // @show: const host = document.querySelector<HTMLDivElement>(".table-div")!;
  const scope = new TableScope(host, tableModel, new SimpleDomService(), { ...new TableOptions() }, new EventAdapter()); // @show: new TableScope(host, tableModel, new SimpleDomService(), { ...new TableOptions() }, new EventAdapter())
  scope.firstInit(); // @show:   .firstInit();
  // #endregion model
  ctx.info("click ❯ in “Customer” or “Product” to collapse the group");
  return () => scope.destroy();
}
