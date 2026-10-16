// Chapter 31 – section "Fill handle and batch edit" (since 1.1.96): drag the square at the corner of the selection to
// fill quantities and dates, changes are collected (marked) until "save" writes them – or "discard" drops them.
import {
  CellRange, EventAdapter, FocusModel, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope,
  TrueFn, editInputPipeForNumber,
  type GeBatchEditEvent, type TableApi, type TableOptionsIf
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext } from "./shared/demo";

const KEEP = ["id", "date", "customer", "product", "quantity", "price"];

export default function (ctx: DemoContext) {
  const orders = createOrders(1_000);
  orders[0].quantity = 1;                                       // 1, 2 → the fill handle continues 3, 4, 5 …
  orders[1].quantity = 2;
  const columns = createOrderColumns().filter(c => KEEP.includes(c.property));
  // #region columns
  const column = (property: keyof Order) => columns.find(c => c.property === property)!;
  column("date").editable = TrueFn;                             // "2026-01-05" → "2026-01-06" when filled
  const quantity = column("quantity");
  quantity.editable = TrueFn;
  quantity.editInputPipe = editInputPipeForNumber;
  quantity.validate = (value: unknown) =>                       // a message = invalid (marked, blocks saving)
    Number.isInteger(value) && (value as number) > 0 ? undefined : "A quantity is a whole number > 0";
  // #endregion columns
  const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs: columns });
  const focusModel = new FocusModel("cell");
  // #region options
  const selectionModel = new SelectionModel("range", "multi");        // the fill handle needs a range selection
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    getFocusModel: () => focusModel,                                   // @hide
    fillHandle: true,                                                  // the square at the corner of the selection
    batchEdit: true                                                    // collect changes until commitBatchEdit()
  };
  // #endregion options
  // #region events
  const listener = new EventAdapter();
  listener.onBatchEditChanged = (evt: GeBatchEditEvent) => {
    ctx.info(evt.pendingCount
      ? `${evt.pendingCount} unsaved change(s)${evt.invalidCount ? `, ${evt.invalidCount} invalid` : ""}`
      : "no unsaved changes");
  };
  // #endregion events
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  const api: TableApi = scope.getApi();
  api.getSelectionModel()?.addSelection(new CellRange(0, 4, 1, 4));    // two quantities: the handle shows up
  api.repaint();
  ctx.info("drag the small square below the selection – ⌥/Alt switches series ↔ copy");

  // #region save
  ctx.button("save", () => {
    const changes = api.getPendingChanges()                     // row, property, old and new value
      .map(c => ({ id: (c.row as Order).id, field: c.property, value: c.newValue }));
    // await fetch("/api/orders", { method: "PATCH", body: JSON.stringify(changes) });
    if (!api.commitBatchEdit()) ctx.info("fix the red cells first");  // writes into orders
    else ctx.info(`saved ${changes.length} change(s)`);
  });
  ctx.button("discard", () => api.cancelBatchEdit());
  // #endregion save
  return () => scope.destroy();
}
