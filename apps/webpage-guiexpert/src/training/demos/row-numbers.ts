// Chapter 18 – row numbers like in a spreadsheet: one flag, a fixed "#" column in front (since 1.1.93).
import {
  EventAdapter, FocusModel, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope,
  type TableModelIf, type TableOptionsIf
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext, fmt } from "./shared/demo";

// #region model
function createNumberedModel(orders: Order[], original: boolean): TableModelIf {
  return TableFactory.createTableModel({
    rows: orders,
    columnDefs: createOrderColumns(),
    rowNumbersVisible: {
      mode: original ? "original" : "display",   // "display": 1, 2, 3 … of the view
      format: n => n.toLocaleString("en-US")      // 100,000
    }
  });
}
// #endregion model

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  let search = "";
  let original = false;
  let scope: TableScope | undefined;

  const create = () => {
    scope?.destroy();
    const tableModel = createNumberedModel(orders, original);
    // #region selection
    const selectionModel = new SelectionModel("range", "multi"); // a click on a number selects the whole row
    const tableOptions: TableOptionsIf = {
      ...new TableOptions(),
      getSelectionModel: () => selectionModel,
      getFocusModel: () => new FocusModel("cell"),
      externalFilterFunction: (o: Order) => !search || o.city.toLowerCase().includes(search)
    };
    // #endregion selection
    scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
    scope.firstInit();
    ctx.info(`${fmt(tableModel.getBodyModel().getRowCount())} orders – click a number, Shift-click another`);
  };

  create();
  ctx.button("sort by total ↓", () => scope?.getApi().sort((a: Order, b: Order) => b.total - a.total));
  ctx.toggle("original numbers", false, checked => { original = checked; create(); });
  ctx.search("city …", value => {
    search = value.trim().toLowerCase();
    scope?.getApi().externalFilterChanged();
    ctx.info(`${fmt(scope?.getApi().getTableModel().getBodyModel().getRowCount() ?? 0)} orders shown`);
  });
  return () => scope?.destroy();
}
