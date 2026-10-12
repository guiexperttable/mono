// Chapter 22 – select cells, rows, columns or ranges – and copy them.
// #region options
import { type ExtendedSelectionType, SelectionModel, TableOptions, type TableOptionsIf } from "@guiexpert/table";

function createOptions(type: ExtendedSelectionType): TableOptionsIf {
  const selectionModel = new SelectionModel(type, "multi");   // "cell" | "row" | "column" | "range"
  return { ...new TableOptions(), getSelectionModel: () => selectionModel };
}
// #endregion options

// #region events
import { EventAdapter, type SelectionModelIf } from "@guiexpert/table";

class SelectionEvents extends EventAdapter {
  constructor(private readonly show: (text: string) => void) {
    super();
  }
  override onSelectionChanged(model: SelectionModelIf): void {
    const ranges = model.getRanges().filter(r => !r.gammaRange);   // skip special ranges
    if (!ranges.length) return this.show("nothing selected");
    const cells = ranges.reduce((n, r) => n + (r.r2 - r.r1 + 1) * (r.c2 - r.c1 + 1), 0);
    this.show(`${cells} cells in ${ranges.length} range(s) · ⌘/Ctrl+C copies`);
  }
}
// #endregion events

import { SimpleDomService, TableFactory, TableScope } from "@guiexpert/table";
import { createOrders } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { type DemoContext, fmt } from "./shared/demo";

export default function (ctx: DemoContext) {
  const orders = createOrders(100_000);
  let scope: TableScope | undefined;
  const buttons: HTMLButtonElement[] = [];

  function build(type: ExtendedSelectionType, pressed: HTMLButtonElement): void {
    scope?.destroy();
    ctx.host.replaceChildren();
    buttons.forEach(b => b.toggleAttribute("aria-pressed", b === pressed));
    pressed.setAttribute("aria-pressed", "true");
    const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs: createOrderColumns() });
    scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), createOptions(type), new SelectionEvents(ctx.info));
    scope.firstInit();
    ctx.info(type === "range" ? "drag with the mouse · Shift+click · ⌘/Ctrl+click" : `selection type "${type}" – click`);
  }
  for (const type of ["range", "cell", "row", "column"] as ExtendedSelectionType[]) {
    buttons.push(ctx.button(type, b => build(type, b)));
  }
  // #region copy
  ctx.button("copy", async () => { // @show: copyButton.addEventListener("click", async () => {
    const text = await scope!.getApi().copyToClipboard(); // @show:   const text = await tableApi.copyToClipboard();   // tabs + newlines → Excel
    ctx.info(`copied ${fmt(text.split("\n").length)} lines – paste them into Excel`); // @show:   info.textContent = `copied ${text.split("\n").length} lines`;
  });
  // #endregion copy
  build("range", buttons[0]);
  return () => scope?.destroy();
}
