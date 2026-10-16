// Chapter 23 – section "Dragging rows into order" (since 1.1.95): a drag handle in the customer column, the table moves
// the rows (managed) and reports the drop; buttons move the focused row (the alternative without dragging).
import {
  EventAdapter, FocusModel, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope,
  type GeRowDragEvent, type TableApi, type TableOptionsIf
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext } from "./shared/demo";

const KEEP = ["id", "customer", "city", "product", "total"];

export default function (ctx: DemoContext) {
  const orders = createOrders(1_000);
  const columns = createOrderColumns().filter(c => KEEP.includes(c.property));
  // #region model
  const customer = columns.find(c => c.property === "customer")!;
  customer.rowDrag = true;                       // the grip (factory shortcut: rowDrag: true)
  const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs: columns });
  // #endregion model
  const focusModel = new FocusModel("cell");
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getFocusModel: () => focusModel,
    getSelectionModel: () => new SelectionModel("row", "multi")
  };
  // #region events
  const listener = new EventAdapter();
  listener.onRowDragEnd = (evt: GeRowDragEvent<Order>) => {
    if (evt.moved) {                                        // orders has the new order – save it here
      ctx.info(`order ${evt.rows[0].id} → position ${evt.toIndex + 1}`);
    } else if (evt.type === "cancel") {
      ctx.info("cancelled (Escape)");
    }
  };
  // #endregion events
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  const api: TableApi = scope.getApi();
  focusModel.setFocus(2, 1);
  api.repaint();
  ctx.info("drag a grip ⠿ in the customer column");

  // #region buttons
  ctx.button("move up", () => api.triggerAction("MOVE_ROW_UP"));      // like Ctrl+Alt+↑ on the focused row
  ctx.button("move down", () => api.triggerAction("MOVE_ROW_DOWN"));  // like Ctrl+Alt+↓
  // #endregion buttons
  return () => scope.destroy();
}
