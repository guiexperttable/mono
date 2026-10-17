// Chapter 40 – a spreadsheet (since 1.1.99): one call builds letters, row numbers, a sparse body and the options
// (Excel-style editing, clipboard, undo, cell formulas, fill handle); a formula bar, insert/delete rows, Excel export.
import {
  EventAdapter, FormulaBar, SimpleDomService, SpreadsheetFactory, TableScope,
  type GeUndoEvent, type TableApi
} from "@guiexpert/table";
import { type DemoContext } from "./shared/demo";

export default function (ctx: DemoContext) {
  // #region data
  const data: unknown[][] = [
    ["Item", "Jan", "Feb", "Mar", "Total"],
    ["Rent", 950, 950, 950, "=SUM(B2:D2)"],
    ["Food", 410, 385, 432, "=SUM(B3:D3)"],
    ["Transport", 89, 89, 120, "=SUM(B4:D4)"],
    ["Fun", 120, 60, 210, "=SUM(B5:D5)"],
    ["Sum", "=SUM(B2:B5)", "=SUM(C2:C5)", "=SUM(D2:D5)", "=SUM(E2:E5)"],
    ["Rent %", "=ROUND(B2/B6*100,1)", "=ROUND(C2/C6*100,1)", "=ROUND(D2/D6*100,1)", "=ROUND(E2/E6*100,1)"]
  ];
  // #endregion data
  // #region sheet
  const { tableModel, tableOptions } = SpreadsheetFactory.create({
    data,                // inputs: numbers, texts and formulas ("=…")
    rowCount: 1_000,     // 1,000 rows × A–Z – only the filled cells cost memory
    columnWidth: 110
  });
  const listener = new EventAdapter();
  listener.onUndoStackChanged = (evt: GeUndoEvent) => { undo.disabled = !evt.canUndo; };
  const scope = new TableScope(ctx.host, tableModel, new SimpleDomService(), tableOptions, listener);
  scope.firstInit();
  const api: TableApi = scope.getApi();
  // #endregion sheet
  // #region formula-bar
  const barHost = document.createElement("div");                // above the table
  ctx.host.before(barHost);
  const bar = new FormulaBar(barHost, api);                      // address box + the formula of the active cell
  // #endregion formula-bar
  // #region structure
  const rowOfActiveCell = () => {
    const [row, col] = api.getActiveCell() ?? [0, 1];
    const address = api.getCellAddress(row, Math.max(col, 1)) ?? "A1";        // "B3" – also when sorted
    return Number(address.replace(/^[A-Z]+/, "")) - 1;
  };
  ctx.button("insert row", () => api.insertRows(rowOfActiveCell(), 1));   // =SUM(B2:B5) → =SUM(B2:B6)
  ctx.button("delete row", () => api.deleteRows(rowOfActiveCell(), 1));
  const undo = ctx.button("undo", () => api.undo());
  undo.disabled = true;
  ctx.button("Excel", () => api.downloadExcel("budget.xlsx", "", { cellFormulas: true }));  // real formulas
  // #endregion structure
  ctx.info("select B3, type 500 and Enter – the sums follow");
  return () => {
    bar.destroy();
    barHost.remove();
    scope.destroy();
  };
}
