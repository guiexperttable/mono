// Chapter 19 – TableOptions: start with all defaults, change only what you need.
// #region options
import { TableOptions, type TableOptionsIf } from "@guiexpert/table";

export function createOrderTableOptions(): TableOptionsIf {
  return {
    ...new TableOptions(),                                    // all defaults …
    hoverRowVisible: true,                                    // … highlight the row under the mouse
    hoverColumnVisible: false,                                // … but not the column
    columnsResizable: true,                                   // drag the column border
    columnsDraggable: true,                                   // drag a header to move the column
    verticalBorderVisible: false,                             // calmer look: only horizontal lines
    defaultRowHeights: { header: 40, body: 30, footer: 36 }   // read by the TableFactory models
  };
}
// #endregion options

import { EventAdapter, SimpleDomService, TableFactory, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  let scope: TableScope | undefined;
  let useOwn = true;
  const flags: Partial<TableOptionsIf> = {};

  function build(): void {
    scope?.destroy();
    ctx.host.replaceChildren();
    // #region model
    const options = { ...createOrderTableOptions(), ...flags }; // @show: const options = createOrderTableOptions();
    const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs: createOrderColumns(), tableOptions: options }); // @show: const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, tableOptions: options }); // row heights
    // #endregion model
    const opts = useOwn ? options : { ...new TableOptions() };
    const model = useOwn ? tableModel : TableFactory.createTableModel({ rows: orders, columnDefs: createOrderColumns() });
    scope = new TableScope(ctx.host, model, new SimpleDomService(), opts, new EventAdapter());
    scope.firstInit();
    ctx.info(useOwn ? "own options" : "only defaults: new TableOptions()");
  }

  const own = ctx.toggle("own options", true, on => { useOwn = on; build(); });
  ctx.toggle("vertical borders", false, on => { flags.verticalBorderVisible = on; own.checked = useOwn = true; build(); });
  ctx.toggle("hover column", false, on => { flags.hoverColumnVisible = on; own.checked = useOwn = true; build(); });
  // #region autosize
  ctx.button("auto-size columns", () => scope?.getApi().autoResizeColumns()); // @show: autoSizeButton.addEventListener("click", () => tableApi.autoResizeColumns());
  // #endregion autosize
  build();
  return () => scope?.destroy();
}
