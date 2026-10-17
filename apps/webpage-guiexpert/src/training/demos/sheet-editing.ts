// Chapter 31 – section "Excel-style editing, paste and undo" (since 1.1.99): type over a cell, F2, Enter/Tab,
// Delete; copy and paste with Excel; undo and redo with buttons that follow the undo stack.
import {
  EventAdapter, FocusModel, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope, editInputPipeForNumber,
  type GeUndoEvent, type TableApi, type TableOptionsIf
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext } from "./shared/demo";

const KEEP = ["id", "customer", "product", "quantity", "price"];

export default function (ctx: DemoContext) {
  const orders = createOrders(1_000);
  const columns = createOrderColumns().filter(c => KEEP.includes(c.property));
  const column = (property: keyof Order) => columns.find(c => c.property === property)!;
  column("id").editable = () => false;                           // everything else is editable (defaultEditable)
  column("quantity").editInputPipe = editInputPipeForNumber;
  column("price").editInputPipe = editInputPipeForNumber;
  const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs: columns });
  const focusModel = new FocusModel("cell");
  // #region options
  const selectionModel = new SelectionModel("range", "multi");   // select a block to copy, paste, fill or clear
  const tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    getSelectionModel: () => selectionModel,
    getFocusModel: () => focusModel,                              // @hide
    editing: { defaultEditable: true },   // type to overwrite, F2 edits, Enter/Tab move, Delete clears
    clipboard: true,                      // Ctrl+C / Ctrl+X / Ctrl+V – also from and to Excel
    undo: true,                           // Ctrl+Z / Ctrl+Y – edits, paste, cut, fill, clear
    fillHandle: true                      // the square at the corner of the selection
  };
  // #endregion options
  // #region undo
  const undo = ctx.button("undo", () => api.undo());
  const redo = ctx.button("redo", () => api.redo());
  undo.disabled = redo.disabled = true;
  const listener = new EventAdapter();
  listener.onUndoStackChanged = (evt: GeUndoEvent) => {
    undo.disabled = !evt.canUndo;
    redo.disabled = !evt.canRedo;
    undo.title = evt.undoLabel ?? "";                             // e.g. "Paste"
  };
  // #endregion undo
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  const api: TableApi = scope.getApi();
  ctx.info("click a quantity and type – or paste a block from Excel");
  return () => scope.destroy();
}
