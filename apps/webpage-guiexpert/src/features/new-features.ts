/**
 * The features added in October 2026 (prompts 001 – 012, releases 1.1.91 – 1.1.98) – one list for
 * the page /whats-new/, the "What's new" section of the home page and the feature finder of the training.
 *
 * Every snippet is checked against the real API (see `snippets` in scripts/check-feature-snippets.mjs):
 * keep them ≤ 15 lines and use only names that exist in @guiexpert/table.
 * `api` names are resolved against the typedoc index at build time (src/training/api.ts) – a renamed
 * symbol breaks the build instead of producing a dead link.
 */

export type AgGridTier = "community" | "enterprise" | "partly";

export interface NewFeature {
  /** anchor on /whats-new/ */
  id: string;
  /** number of the work order in prompts/ */
  prompt: string;
  since: string;
  title: string;
  /** mdi icon name */
  icon: string;
  /** the problem in one sentence */
  problem: string;
  /** what you get, short bullet points */
  points: string[];
  /** ≤ 15 lines, compiles against the API */
  snippet: string;
  /** folder below /showcase/ */
  showcase: { name: string; title: string };
  /** training chapter (and section) */
  training: { slug: string; hash?: string; label: string };
  /** API symbols, e.g. "TableApi.announce" */
  api: string[];
  /** where ag-Grid has this feature (ag-grid.com, October 2026) */
  agGrid: AgGridTier;
  agGridNote?: string;
}

export const NEW_FEATURES: NewFeature[] = [
  {
    id: "accessibility", prompt: "001", since: "1.1.91", icon: "mdi:account-voice",
    title: "Screen readers and keyboard",
    problem: "A virtual grid only has the visible rows in the DOM – a screen reader would hear 30 rows of a million, " +
      "and a table without keyboard support fails WCAG 2.1 AA and the BFSG.",
    points: [
      "WAI-ARIA grid / treegrid: row and column count of all rows, row headers, sort state",
      "keyboard: arrows, Home/End, Page ↑/↓, Ctrl+Home, Enter, F2, header focus – the table is one tab stop",
      "announcements for sorting, filtering, selection and copying – texts in your language",
      "tested with axe-core in CI – automated checks of the WAI-ARIA grid pattern"
    ],
    snippet: `const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  ariaLabelledBy: "orders-title",           // the visible heading names the grid
  ariaTexts: {                              // what the screen reader says – in your language
    sorted: (column, state) => state ? \`Sortiert nach \${column}\` : "Unsortiert",
    filtered: rowCount => \`\${rowCount} Zeilen\`
  }
};
tableApi.announce("12 new orders arrived"); // your own announcement`,
    showcase: { name: "accessibility", title: "Accessible order table" },
    training: { slug: "accessibility", label: "Chapter 35 · Accessibility" },
    api: ["TableOptionsIf.ariaLabelledBy", "TableOptionsIf.ariaTexts", "AriaTextsIf", "TableApi.announce"],
    agGrid: "community"
  },
  {
    id: "overlays", prompt: "002", since: "1.1.92", icon: "mdi:progress-clock",
    title: "Loading and “no rows” overlays",
    problem: "While data is loading, an empty table looks broken; after a filter without hits it looks like an error.",
    points: [
      "“Loading…” with a pure CSS spinner – no image, no library",
      "“No rows to show” and “No matching rows” appear by themselves",
      "blocks clicks while loading (optional), screen readers hear it (aria-busy)",
      "a loading prop in every framework wrapper"
    ],
    snippet: `tableApi.showLoadingOverlay();                      // CSS spinner + "Loading…"
const orders: Order[] = await fetch("/api/orders").then(r => r.json());
tableApi.setRows(orders);
tableApi.repaintHard();
tableApi.hideOverlay();         // 0 rows → "No rows to show" by itself,
                                // a filter without hits → "No matching rows"
// React, Vue, Svelte, Angular …: <GuiexpertTable loading={isLoading} … />`,
    showcase: { name: "overlays", title: "Loading & empty states" },
    training: { slug: "live-data", hash: "overlays", label: "Chapter 32 · Loading and empty tables" },
    api: ["TableApi.showLoadingOverlay", "TableApi.hideOverlay", "TableApi.getOverlayState", "TableOptionsIf.overlayOptions"],
    agGrid: "community"
  },
  {
    id: "state", prompt: "003", since: "1.1.92", icon: "mdi:content-save-cog",
    title: "Remember the state – or save it on your server",
    problem: "Users resize, move and hide columns, sort, scroll and select – and after a reload everything is gone.",
    points: [
      "column order, widths and visibility, sorting, scroll position, open tree nodes, checked and selected rows",
      "rows by id, columns by property – never by index, so it survives new data",
      "localStorage with one option, or JSON for your server: getState(), applyState(), onStateChanged"
    ],
    snippet: `const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<Order>(),
    getStorageKeyFn: () => "orders",              // localStorage["orderstableState"]
    getRowId: (order: Order) => order.id,
    autoRestoreColumnLayout: true,                // order, widths, hidden columns
    autoRestoreSortingState: true,
    autoRestoreSelectedState: true
  }
};
const json = tableApi.getState();                 // or: send it to your server
tableApi.applyState(json);`,
    showcase: { name: "state", title: "Persisted layout" },
    training: { slug: "persist-state", label: "Chapter 33 · Persist state" },
    api: ["AutoRestoreOptions", "TableApi.getState", "TableApi.applyState", "TableApi.resetState", "EventListenerIf.onStateChanged"],
    agGrid: "community"
  },
  {
    id: "row-numbers", prompt: "004", since: "1.1.93", icon: "mdi:format-list-numbered",
    title: "Row numbers like in a spreadsheet",
    problem: "“Look at row 1,284” only works if there are row numbers – and they must fit 2,000,000.",
    points: [
      "a fixed “#” column in front, the width follows the largest number",
      "numbers of the current view or of the original order",
      "click a number to select the row, click “#” to select all"
    ],
    snippet: `const tableModel = TableFactory.createTableModel({
  rows: orders,
  rowNumbersVisible: true    // or { mode: "original", format: n => n.toLocaleString() }
});`,
    showcase: { name: "rownumbers", title: "Row numbers" },
    training: { slug: "fixed-columns", hash: "row-numbers", label: "Chapter 18 · Row numbers" },
    api: ["CreateTableModelPara.rowNumbersVisible", "RowNumberOptionsIf", "RowNumberColumnDef"],
    agGrid: "enterprise"
  },
  {
    id: "totals", prompt: "005", since: "1.1.94", icon: "mdi:sigma",
    title: "Total rows and a status bar for the selection",
    problem: "Every business table needs a sum at the bottom – and it has to be right after filtering.",
    points: [
      "sum, count, avg, min, max, countDistinct, first, last – or your own aggregator",
      "the footer follows filter, sorting and edits",
      "count, sum and average of the selected cells for a status bar"
    ],
    snippet: `const tableModel = TableFactory.createTableModel({
  rows: orders,
  footerAggregates: { quantity: "sum", total: "sum" }     // follows filter and sorting
});
const { count, sum, avg } = tableApi.getSelectionAggregates();   // the selected cells`,
    showcase: { name: "aggregation", title: "Totals & aggregation" },
    training: { slug: "footer-totals", hash: "built-in", label: "Chapter 16 · Totals in one option" },
    api: ["CreateTableModelPara.footerAggregates", "Aggregators", "TableApi.getSelectionAggregates", "AreaModelAggregateFooter"],
    agGrid: "enterprise"
  },
  {
    id: "row-grouping", prompt: "006", since: "1.1.94", icon: "mdi:file-tree",
    title: "Row grouping with subtotals",
    problem: "50,000 orders are a list – revenue per country and city is an answer.",
    points: [
      "any number of levels, by field or by a computed key",
      "subtotals per group and a total row – averages computed correctly over all levels",
      "filter, sort by aggregate, regroup at runtime"
    ],
    snippet: `const tableModel = RowGroupFactory.createTableModel({
  rows: orders,
  groupBy: ["country", "city"],
  aggregations: { quantity: "sum", total: "sum" }
});
tableApi.setRowGroupBy(["category"]);      // regroup at runtime`,
    showcase: { name: "rowgrouping", title: "Row grouping" },
    training: { slug: "row-grouping", label: "Chapter 36 · Row grouping" },
    api: ["RowGroupFactory.createTableModel", "TableApi.setRowGroupBy", "AreaModelRowGroups"],
    agGrid: "enterprise"
  },
  {
    id: "pivot", prompt: "007", since: "1.1.94", icon: "mdi:table-pivot",
    title: "Pivot tables",
    problem: "Countries in the rows, years and quarters in the columns, revenue in the cells – with subtotals and totals.",
    points: [
      "row fields, column fields and several values per cell",
      "multi-row header made from the data, collapsible column groups",
      "total column and total row from the source rows, pivot again at runtime"
    ],
    snippet: `const tableModel = PivotFactory.createTableModel({
  rows: orders,
  rowFields: ["country", "city"],
  columnFields: ["year"],
  values: ["total"]                          // sum of the revenue per cell
});
tableApi.setPivotConfig({ columnFields: ["category"] });   // pivot again`,
    showcase: { name: "pivot", title: "Pivot table" },
    training: { slug: "pivot-tables", label: "Chapter 37 · Pivot tables" },
    api: ["PivotFactory.createTableModel", "PivotConfigIf", "TableApi.setPivotConfig"],
    agGrid: "enterprise"
  },
  {
    id: "formulas", prompt: "008", since: "1.1.95", icon: "mdi:function-variant",
    title: "Calculated columns, “Show values as”, formulas",
    problem: "Net, VAT, gross, share of the total, rank – computed without changing your data, and still sortable, " +
      "filterable and exportable.",
    points: [
      "valueGetter: one place – sorting, copy, Excel and totals use the computed value",
      "show values as: % of column, parent or grand total (row total in pivots), running total, difference, rank",
      "formulas typed by users: “ROUND([price] * [quantity] * 1.19, 2)” – own parser, no eval (CSP-safe)",
      "error values like #DIV/0! instead of exceptions"
    ],
    snippet: `const columnDefs = [
  ColumnDef.create({ property: "product", headerLabel: "Product" }),
  ColumnDef.create({ property: "net", headerLabel: "Net",
    valueGetter: (o: Item) => o.price * o.quantity }),
  ColumnDef.create({ property: "gross", headerLabel: "Gross",
    formula: "ROUND([net] * 1.19, 2)" }),
  ColumnDef.create({ property: "share", headerLabel: "Share",
    valueGetter: (o: Item) => o.price * o.quantity, showValuesAs: "percentOfColumnTotal" })
];
tableApi.setColumnFormula("gross", "ROUND([net] * 1.07, 2)");   // from an input field`,
    showcase: { name: "formulas", title: "Formulas & calculated columns" },
    training: { slug: "formulas", label: "Chapter 39 · Calculated columns & formulas" },
    api: ["ColumnDefIf.valueGetter", "ColumnDefIf.showValuesAs", "ColumnDefIf.formula", "TableApi.setColumnFormula", "compileFormula"],
    agGrid: "partly",
    agGridNote: "valueGetter: Community · formulas, show values as: Enterprise"
  },
  {
    id: "row-drag", prompt: "009", since: "1.1.95", icon: "mdi:drag-vertical",
    title: "Drag rows into order",
    problem: "Priorities, playlists, agendas – users want to put rows in order by hand, also on touch screens and with " +
      "the keyboard.",
    points: [
      "a grip per row: mouse, touch and pen (Pointer Events), ghost, drop marker, auto-scroll",
      "several selected rows at once, trees (before, after, inside)",
      "keyboard: Ctrl+Alt+↑/↓ with an announcement",
      "the table moves the rows – or you get only the events"
    ],
    snippet: `const tableModel = TableFactory.createTableModel({ rows: tasks, rowDrag: true });
listener.onRowDragEnd = (evt: GeRowDragEvent<Task>) => {
  if (evt.moved) save(tasks);          // tasks is already in the new order
};`,
    showcase: { name: "rowdrag", title: "Row drag" },
    training: { slug: "events-and-context-menu", hash: "row-drag", label: "Chapter 23 · Dragging rows into order" },
    api: ["CreateTableModelPara.rowDrag", "ColumnDefIf.rowDrag", "GeRowDragEvent", "TableApi.moveRows"],
    agGrid: "community"
  },
  {
    id: "fill-batch", prompt: "010", since: "1.1.96", icon: "mdi:table-edit",
    title: "Fill handle and batch edit",
    problem: "Spreadsheet users drag a corner to continue 1, 2, 3 … – and want to review their changes before saving them.",
    points: [
      "drag the fill handle: copy values or continue series (numbers, dates, “Item 9” → “Item 10”), Ctrl/⌘+D, Ctrl/⌘+R",
      "batch edit: changes are marked, then committed or discarded together",
      "validation per column, one change event with old and new values for your server"
    ],
    snippet: `const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => new SelectionModel("range", "multi"),
  fillHandle: true,                           // drag the corner of the selection
  batchEdit: true                             // collect changes, mark them
};
saveButton.onclick = async () => {
  await sendToServer(tableApi.getPendingChanges());
  tableApi.commitBatchEdit();                 // or cancelBatchEdit()
};`,
    showcase: { name: "batchedit", title: "Fill handle & batch edit" },
    training: { slug: "inline-editing", hash: "fill-batch", label: "Chapter 31 · Fill handle and batch edit" },
    api: ["TableOptionsIf.fillHandle", "TableOptionsIf.batchEdit", "TableApi.getPendingChanges", "TableApi.commitBatchEdit", "ColumnDefIf.validate"],
    agGrid: "enterprise"
  },
  {
    id: "master-detail", prompt: "011", since: "1.1.97", icon: "mdi:arrow-expand-vertical",
    title: "Master/detail",
    problem: "An order has items, a customer has contacts – open a row and show them right below it, without leaving the table.",
    points: [
      "any content over the full width: a second table, a form, a framework component",
      "works with virtual scrolling and 100,000 rows; the detail keeps its state while you scroll",
      "fixed or measured height, Enter / Tab on the keyboard, treegrid for screen readers"
    ],
    snippet: `const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  masterDetail: {
    detailHeight: 180,
    detailRenderer: (container, order: Order, ctx) => {
      ctx.createTable({ tableModel: TableFactory.createTableModel({ rows: order.items }) });
    }
  }
};
tableApi.setDetailExpanded(0, true);`,
    showcase: { name: "masterdetail", title: "Master/detail" },
    training: { slug: "master-detail", label: "Chapter 38 · Master/detail" },
    api: ["TableOptionsIf.masterDetail", "MasterDetailOptionsIf", "DetailRenderContextIf.createTable", "TableApi.setDetailExpanded"],
    agGrid: "enterprise"
  },
  {
    id: "rtl", prompt: "012", since: "1.1.98", icon: "mdi:format-textdirection-r-to-l",
    title: "Right-to-left: Arabic, Hebrew, Persian",
    problem: "In Arabic and Hebrew the first column is on the right – and so are scrolling, fixed columns and the arrow keys.",
    points: [
      "one option mirrors everything: columns, scrolling, fixed columns, tree, resize, fill handle, row drag, details",
      "arrow keys in reading direction, a right-to-left Excel sheet",
      "\"auto\" follows <html dir=\"rtl\">; left-to-right stays unchanged"
    ],
    snippet: `const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  direction: "rtl"            // or "auto": from <html dir="rtl">
};`,
    showcase: { name: "rtl", title: "Right-to-left" },
    training: { slug: "theming-dark-mode", hash: "rtl", label: "Chapter 28 · Right-to-left" },
    api: ["TableOptionsIf.direction", "TableApi.getDirection"],
    agGrid: "community"
  }
];

/** ag-Grid tier as a short, neutral text. */
export function agGridLabel(f: NewFeature): string {
  if (f.agGridNote) return `ag-Grid: ${f.agGridNote}`;
  return f.agGrid === "enterprise" ? "ag-Grid: Enterprise feature" : "ag-Grid: also in Community";
}

export const trainingHref = (f: NewFeature) => `/training/${f.training.slug}/${f.training.hash ? "#" + f.training.hash : ""}`;
export const showcaseHref = (f: NewFeature) => `/showcase/${f.showcase.name}/run/`;
