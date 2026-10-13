// Chapter 31 – edit quantity and status right in the table (double-click, or F2 on the focused cell).
// #region editing
import { type ColumnDefIf, SelectCellRenderer, TrueFn, ValueLabel, editInputPipeForNumber } from "@guiexpert/table";
import type { Order } from "./shared/orders";

export function applyOrderEditing(columns: ColumnDefIf[]): void {
  const column = (property: keyof Order) => columns.find(c => c.property === property)!;

  const quantity = column("quantity");
  quantity.editable = TrueFn;
  quantity.editInputPipe = editInputPipeForNumber;             // the input text becomes a number

  const status = column("status");
  status.editable = TrueFn;
  status.getEditRenderer = () => new SelectCellRenderer(       // a <select> instead of a text input
    ["open", "paid", "shipped", "cancelled"].map(s => new ValueLabel(s, s)));
}

/** After an edit: recalculate the derived value. */
export function recalcOrder(order: Order): void {
  order.total = Math.round(order.quantity * order.price * 100) / 100;
}
// #endregion editing

// #region events
import { EventAdapter, type GeModelChangeEvent } from "@guiexpert/table";

class EditEvents extends EventAdapter {
  constructor(private readonly onEdited: (rowIndex: number, columnIndex: number) => void) {
    super();
  }
  override onModelChanged(evt: GeModelChangeEvent): void {     // after every edit
    for (const cell of evt.cells) this.onEdited(cell.rowIndex, cell.columnIndex);
  }
}
// #endregion events

import { type AreaModelObjectArray, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { OrderTotalsFooterModel } from "./shared/order-totals-footer";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const columns = createOrderColumns({ renderers: true });
  applyOrderEditing(columns);
  const tableModel = TableFactory.createTableModel({
    rows: createOrders(10_000), columnDefs: columns,
    footerAreaModel: new OrderTotalsFooterModel(() => tableModel.getBodyModel() as AreaModelObjectArray<Order>, columns)
  });
  // #region wire
  const events = new EditEvents((row, col) => {
    const order = tableModel.getBodyModel().getRowByIndex(row) as Order;
    recalcOrder(order);                                                     // total = quantity × price
    (tableModel.getAreaModel("footer") as OrderTotalsFooterModel).invalidate();   // footer: sum again
    tableApi.repaint();
    ctx.info(`#${order.id}: ${tableModel.getColumnDef(col)?.property} changed → total ${fmt(order.total)} €`); // @hide
  });
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), { ...new TableOptions() }, events); // @show: const tableScope = new TableScope(host, tableModel, new SimpleDomService(), options, events);
  scope.firstInit(); // @show: tableScope.firstInit();
  const tableApi = scope.getApi(); // @show: const tableApi = tableScope.getApi();
  // #endregion wire
  ctx.info("double-click a quantity or a status");
  return () => scope.destroy();
}
