// Chapter 28 – theming and dark mode with CSS variables.
// theming.css is loaded by LiveDemo.astro (component CSS is bundled into the page)
import {
  type AreaModelObjectArray, EventAdapter, SelectionModel, SimpleDomService, TableFactory, TableOptions, TableScope
} from "@guiexpert/table";
import { createOrders, type Order } from "./shared/orders";
import { createOrderColumns } from "./shared/order-columns";
import { OrderTotalsFooterModel } from "./shared/order-totals-footer";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  const columns = createOrderColumns({ renderers: true });
  const tableModel = TableFactory.createTableModel({
    rows: createOrders(100_000), columnDefs: columns,
    footerAreaModel: new OrderTotalsFooterModel(() => tableModel.getBodyModel() as AreaModelObjectArray<Order>, columns)
  });
  const selectionModel = new SelectionModel("range", "multi");
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(),
    { ...new TableOptions(), getSelectionModel: () => selectionModel }, new EventAdapter());
  scope.firstInit();

  ctx.root.classList.add("brand-table");
  ctx.toggle("brand theme", true, on => ctx.root.classList.toggle("brand-table", on));
  // #region switch
  // light / dark: one attribute on <html> – the built-in variables of both themes are already there
  const setTheme = (theme: "light" | "dark") => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { /* private mode */ }
  };
  ctx.button("light / dark", () => // @show: themeButton.addEventListener("click", () =>
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  // #endregion switch
  ctx.info("drag to select a range – the selection colour is themed too");
  return () => scope.destroy();
}
