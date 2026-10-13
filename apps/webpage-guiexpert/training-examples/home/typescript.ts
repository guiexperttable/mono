import { EventAdapter, GeMouseEvent, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import "@guiexpert/table/css/main.css";
import { orders } from "./orders";

const tableModel = TableFactory.createTableModel({
  rows: orders,
  properties: ["id", "customer", "city", "total"]
});

class Events extends EventAdapter {                // override only the events you need
  override onMouseClicked(evt: GeMouseEvent): void { console.info("row", evt.rowIndex); }
}

const host = document.querySelector<HTMLDivElement>("#orders")!;   // <div id="orders" style="height: 500px">
const tableScope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new Events());
tableScope.firstInit();
const tableApi = tableScope.getApi();               // scroll, sort, filter, export …
