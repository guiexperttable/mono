/**
 * The training "GuiExpert Table – step by step" (https://gui.expert/training/).
 *
 * One chapter per episode of the 60-second video series. The demo repository has one git tag per
 * episode (`ep-001` … `ep-038`), so every chapter can link to the exact code state of its episode.
 * New chapters are appended in part 8 ("advanced") – inserting them would shift all later numbers, tags and links.
 *
 * `api` entries are checked against the typedoc index at build time (see ApiLink.astro):
 * a renamed class or method breaks the build instead of producing a dead link.
 */

export type PartId = "foundations" | "start" | "frameworks" | "model" | "data" | "look" | "interaction" | "advanced";

export interface Part {
  id: PartId;
  no: number;
  title: string;
  lead: string;
}

export interface ShowcaseRef {
  /** folder name below /showcase/ */
  name: string;
  title: string;
}

export interface Chapter {
  /** URL: /training/<slug>/ */
  slug: string;
  no: number;
  part: PartId;
  title: string;
  /** short title for the sidebar */
  nav: string;
  /** one sentence: the problem this chapter solves */
  lead: string;
  /** what you can do after the chapter */
  learn: string[];
  minutes: number;
  /** episode number of the video series (= git tag ep-NNN of the demo repository) */
  episode: number;
  /** API symbols used in this chapter: "TableApi", "TableApi.sortByColumn", "TableOptionsIf.externalFilterFunction" */
  api: string[];
  showcases?: ShowcaseRef[];
  /** minimum version of @guiexpert/table for everything shown */
  since?: string;
}

export const DEMO_REPO = "https://github.com/krocon/guiexpert-table-step-by-step-demo";
export const MONO_REPO = "https://github.com/guiexperttable/mono";

export const demoTagUrl = (episode: number) => `${DEMO_REPO}/tree/ep-${String(episode).padStart(3, "0")}`;
export const chapterUrl = (slug: string) => `/training/${slug}/`;
export const showcaseUrl = (name: string) => `/showcase/${name}/run/`;

export const PARTS: Part[] = [
  { id: "foundations", no: 1, title: "Foundations", lead: "Why big tables are hard – and the trick every fast grid uses." },
  { id: "start", no: 2, title: "Getting started", lead: "Install the package and render 100,000 rows in a few lines." },
  { id: "frameworks", no: 3, title: "Frameworks", lead: "One model, one core – React, Vue, Angular, Svelte, Solid, Preact." },
  { id: "model", no: 4, title: "The table model", lead: "Header, body and footer models, columns, fixed columns, millions of rows." },
  { id: "data", no: 5, title: "Options & data", lead: "Options, sorting, filtering, selection, events and Excel export." },
  { id: "look", no: 6, title: "Look & feel", lead: "Renderers, components, heatmaps, themes, spans and trees." },
  { id: "interaction", no: 7, title: "Interaction & state", lead: "Editing, live data and a table that remembers its state." },
  { id: "advanced", no: 8, title: "Beyond the basics", lead: "Features added after the course: accessibility and more." }
];

export const CHAPTERS: Chapter[] = [
  // ── Part 1 ──────────────────────────────────────────────────────────────────────────────
  {
    slug: "why-big-tables-freeze", no: 1, part: "foundations", episode: 1, minutes: 5,
    title: "Why big tables freeze the browser", nav: "Why big tables freeze",
    lead: "One <tr> per row works for 100 rows. For 100,000 rows it blocks the browser for minutes.",
    learn: ["measure what a plain HTML table costs", "understand why time grows faster than the row count",
      "know what a data grid has to do besides drawing"],
    api: []
  },
  {
    slug: "virtual-scrolling", no: 2, part: "foundations", episode: 2, minutes: 6,
    title: "Virtual scrolling: draw only what you see", nav: "Virtual scrolling",
    lead: "The trick behind every fast data grid – built by hand in about 20 lines.",
    learn: ["build a vertical virtual scroller yourself", "see why the DOM size no longer depends on the data",
      "know the limits of the simple approach"],
    api: ["AreaModelIf.getConstantRowHeight", "TableApi.getFirstVisibleRowIndex"],
    showcases: [{ name: "large", title: "Large dataset" }, { name: "fps", title: "Render speed" }]
  },
  {
    slug: "build-buy-or-guiexpert", no: 3, part: "foundations", episode: 3, minutes: 4,
    title: "Build it yourself, ag-Grid or GuiExpert Table?", nav: "Build, buy or GuiExpert?",
    lead: "A sober comparison – what you get, what you don't, and a rule of thumb.",
    learn: ["compare licence, features and frameworks", "decide which tool fits your project"],
    api: []
  },
  // ── Part 2 ──────────────────────────────────────────────────────────────────────────────
  {
    slug: "installation", no: 4, part: "start", episode: 4, minutes: 3,
    title: "Installation in two minutes", nav: "Installation",
    lead: "One package, one stylesheet, one container with a height.",
    learn: ["install @guiexpert/table", "load the stylesheet (bundler or CDN)", "avoid the classic \"empty table\" mistake"],
    api: []
  },
  {
    slug: "first-table", no: 5, part: "start", episode: 5, minutes: 6,
    title: "Your first table in plain TypeScript", nav: "First table",
    lead: "Four building blocks – host element, model, options, TableScope – and 100,000 rows are on screen.",
    learn: ["create a table from an array of objects", "know the four building blocks", "scroll from code with the TableApi"],
    api: ["TableScope", "TableScope.firstInit", "TableScope.getApi", "TableFactory.createTableModel", "TableOptions",
      "SimpleDomService", "EventAdapter", "TableApi.scrollToIndex"],
    showcases: [{ name: "order", title: "Order table" }]
  },
  {
    slug: "web-component-and-cdn", no: 6, part: "start", episode: 6, minutes: 5,
    title: "Without a framework: Web Component and CDN", nav: "Web Component & CDN",
    lead: "The table as a custom element – in any HTML page, even without npm and a build step.",
    learn: ["use <guiexpert-table> in a plain page", "listen to bubbling CustomEvents", "load everything from a CDN"],
    api: ["TableApi", "TableOptions", "TableFactory.createTableModel"]
  },
  // ── Part 3 ──────────────────────────────────────────────────────────────────────────────
  {
    slug: "react", no: 7, part: "frameworks", episode: 7, minutes: 5,
    title: "GuiExpert Table in React", nav: "React",
    lead: "The same model, rendered by the React wrapper – with stable props via useMemo.",
    learn: ["render <GuiexpertTable> in React", "keep model and options stable", "react to events with callback props"],
    api: ["TableApi", "GeMouseEvent", "TableOptions"], since: "1.1.88"
  },
  {
    slug: "vue", no: 8, part: "frameworks", episode: 8, minutes: 4,
    title: "GuiExpert Table in Vue 3", nav: "Vue 3",
    lead: "Plain objects as props, Vue events for everything the table reports.",
    learn: ["render <GuiexpertTable> in Vue 3", "handle @tableReady and @mouseClicked", "register the component globally"],
    api: ["TableApi", "GeMouseEvent", "TableOptions"]
  },
  {
    slug: "angular", no: 9, part: "frameworks", episode: 9, minutes: 5,
    title: "GuiExpert Table in Angular 14 to 22", nav: "Angular 14–22",
    lead: "One source, nine builds: the package major follows your Angular major.",
    learn: ["pick the right package version", "use the standalone TableComponent", "rebuild the table from a signal"],
    api: ["TableApi", "GeMouseEvent", "TableOptions"]
  },
  {
    slug: "one-model-every-framework", no: 10, part: "frameworks", episode: 10, minutes: 4,
    title: "One model, every framework", nav: "Svelte, Solid, Preact",
    lead: "Svelte 4/5, Solid and Preact – the model stays the same, only the event syntax changes.",
    learn: ["compare the event syntax of all wrappers", "use Svelte 5 callback props", "avoid two Solid runtimes"],
    api: ["TableModelIf", "EventListenerIf"]
  },
  // ── Part 4 ──────────────────────────────────────────────────────────────────────────────
  {
    slug: "table-model-areas", no: 11, part: "model", episode: 11, minutes: 5,
    title: "The TableModel: three times three areas", nav: "TableModel & areas",
    lead: "Header, body, footer – each split into west, center and east. The model only answers questions.",
    learn: ["know the nine areas of a table", "ask an area model for row count and values", "understand why the model is lazy"],
    api: ["TableModelIf", "TableModelIf.getAreaModel", "AreaModelIf", "AreaModelIf.getRowCount", "AreaModelIf.getValueAt",
      "AreaIdent", "SideIdent"]
  },
  {
    slug: "array-to-table-model", no: 12, part: "model", episode: 12, minutes: 4,
    title: "Array<T> → TableModel", nav: "Array<T> → model",
    lead: "Turn typed objects into a table – choose and order the columns, let the compiler check the names.",
    learn: ["use TableFactory.createTableModel with rows and properties", "type the property list",
      "know the other factory methods"],
    api: ["TableFactory.createTableModel", "CreateTableModelPara", "TableFactory.buildByTypedRows", "AreaModelObjectArray"]
  },
  {
    slug: "column-definitions", no: 13, part: "model", episode: 13, minutes: 6,
    title: "Columns with ColumnDef", nav: "ColumnDef",
    lead: "Header label, width, alignment, visibility – one ColumnDef per column.",
    learn: ["create columns with new ColumnDef() and ColumnDef.create()", "align and size columns",
      "hide a column"],
    api: ["ColumnDef", "ColumnDef.create", "ColumnDefIf", "ColumnDefIf.isVisible", "ColumnDefIf.minWidth", "Size",
      "TableFactory.buildByTypedRows"]
  },
  {
    slug: "array-of-arrays", no: 14, part: "model", episode: 14, minutes: 4,
    title: "Array of arrays: header, body and footer as data", nav: "Array of arrays",
    lead: "No objects needed – CSV rows go straight into the table.",
    learn: ["feed headerData, bodyData and footerData", "set widths with columnSizes", "load a CSV file"],
    api: ["CreateTableModelPara.headerData", "CreateTableModelPara.bodyData", "CreateTableModelPara.footerData",
      "CreateTableModelPara.columnSizes", "AreaModelArrayOfArrays"],
    showcases: [{ name: "arrayofarrays", title: "Array of arrays" }]
  },
  {
    slug: "header-groups", no: 15, part: "model", episode: 15, minutes: 5,
    title: "Header models: multi-row and grouped", nav: "Header groups",
    lead: "Group columns under a common header – and let users collapse the groups.",
    learn: ["describe header groups with CellGroupIf", "make groups collapsible", "build a multi-row header from data"],
    api: ["AreaModelCellGroups", "CellGroupIf", "CellgroupFactory.buildColumnDefs", "CellgroupFactory.buildGroupExts",
      "AreaModelObjectArrayWithColumndefs"],
    since: "1.1.88"
  },
  {
    slug: "footer-totals", no: 16, part: "model", episode: 16, minutes: 5,
    title: "Footer models: totals and key figures", nav: "Footer totals",
    lead: "A footer that sums up exactly the rows you see – and follows filter and sorting.",
    learn: ["write a footer area model", "sum the filtered rows only once", "find columns by property",
      "since 1.1.94: totals in one option, sums of the selection"],
    api: ["AreaModel", "AreaModelObjectArray.getFilteredRows", "CreateTableModelPara.footerAreaModel",
      "TableModelIf.getBodyModel", "CreateTableModelPara.footerAggregates", "AreaModelAggregateFooter",
      "aggregateColumns", "TableApi.getSelectionAggregates"],
    showcases: [{ name: "aggregation", title: "Totals & aggregation" }]
  },
  {
    slug: "custom-area-model", no: 17, part: "model", episode: 17, minutes: 6,
    title: "Own AreaModel: two million rows without an array", nav: "Own AreaModel",
    lead: "The table only asks for visible cells – so a model can compute values on demand.",
    learn: ["extend AreaModel", "make scrolling O(1) with getConstantRowHeight()", "load data page by page from a server"],
    api: ["AreaModel", "AreaModelIf.getRowCount", "AreaModelIf.getValueAt", "AreaModelIf.getRowHeight",
      "AreaModelIf.getConstantRowHeight", "CreateTableModelPara.bodyAreaModel", "TableApi.ensureRowIsVisible"],
    showcases: [{ name: "large", title: "Large dataset" }, { name: "fps", title: "Render speed" }],
    since: "1.1.85"
  },
  {
    slug: "fixed-columns", no: 18, part: "model", episode: 18, minutes: 4,
    title: "Fix columns on the left and right", nav: "Fixed columns",
    lead: "ID stays on the left, Total on the right – 40 columns scroll in between.",
    learn: ["fix columns in the model", "know west, center and east", "see horizontal virtual scrolling at work"],
    api: ["CreateTableModelPara.fixedLeftColumnCount", "CreateTableModelPara.fixedRightColumnCount",
      "TableModelIf.getFixedLeftColumnCount", "TableModelIf.getFixedRightColumnCount",
      "CreateTableModelPara.rowNumbersVisible", "RowNumberColumnDef", "TableApi.getColumnIndex"],
    showcases: [{ name: "large", title: "Large dataset" }]
  },
  // ── Part 5 ──────────────────────────────────────────────────────────────────────────────
  {
    slug: "table-options", no: 19, part: "data", episode: 19, minutes: 5,
    title: "TableOptions: behaviour and look", nav: "TableOptions",
    lead: "Start with all defaults, change only what you need.",
    learn: ["create options with the spread pattern", "switch hover, borders, resizing, dragging", "auto-size the columns"],
    api: ["TableOptions", "TableOptionsIf", "TableOptionsIf.defaultRowHeights", "TableOptionsIf.hoverColumnVisible",
      "TableOptionsIf.columnsResizable", "TableOptionsIf.columnsDraggable", "TableApi.autoResizeColumns"],
    since: "1.1.88"
  },
  {
    slug: "sorting", no: 20, part: "data", episode: 20, minutes: 6,
    title: "Sorting: double-click and own comparators", nav: "Sorting",
    lead: "Locale-aware names, a workflow order for status – and sorting from your own button.",
    learn: ["make columns sortable", "write a sortComparator", "sort from code with sortByColumn() and sort()"],
    api: ["ColumnDefIf.sortable", "ColumnDefIf.sortComparator", "ColumnDefIf.sortState", "SortItem",
      "TableModelIf.doSort", "TableApi.sortByColumn", "TableApi.sort", "TableApi.reSort"],
    since: "1.1.90"
  },
  {
    slug: "filtering", no: 21, part: "data", episode: 21, minutes: 5,
    title: "Filtering with a live search", nav: "Filtering",
    lead: "The filter UI is yours – the table only asks: show this row?",
    learn: ["set an externalFilterFunction", "trigger the filter on input", "combine several criteria"],
    api: ["TableOptionsIf.externalFilterFunction", "TableApi.externalFilterChanged", "TableApi.getBodyModel"],
    showcases: [{ name: "idfilter", title: "Slider filter" }],
    since: "1.1.88"
  },
  {
    slug: "selection-and-copy", no: 22, part: "data", episode: 22, minutes: 5,
    title: "Select cells, rows and ranges – and copy them", nav: "Selection & copy",
    lead: "One selection model per table: cells, rows, columns or ranges, with mouse and keyboard.",
    learn: ["choose a selection type", "react to selection changes", "copy the selection to the clipboard"],
    api: ["SelectionModel", "SelectionType", "SelectionMode", "TableOptionsIf.getSelectionModel",
      "EventListenerIf.onSelectionChanged", "SelectionModelIf.getRanges", "TableApi.copyToClipboard"],
    since: "1.1.88"
  },
  {
    slug: "events-and-context-menu", no: 23, part: "data", episode: 23, minutes: 6,
    title: "Events and a context menu of your own", nav: "Events & context menu",
    lead: "Override only the events you need – and build a context menu that looks exactly like your app.",
    learn: ["extend EventAdapter", "tell single from double clicks", "map a displayed row back to your object",
      "let users drag rows into order (since 1.1.95)"],
    api: ["EventAdapter", "EventListenerIf", "EventListenerIf.onMouseClicked", "EventListenerIf.onContextmenu",
      "GeMouseEvent", "AreaModelIf.getRowByIndex", "ColumnDefIf.rowDrag", "EventListenerIf.onRowDragEnd", "GeRowDragEvent",
      "TableApi.moveRows"],
    showcases: [{ name: "mouseevents", title: "Mouse events" }, { name: "rowdrag", title: "Row drag" }]
  },
  {
    slug: "excel-export", no: 24, part: "data", episode: 24, minutes: 4,
    title: "Excel export without a library", nav: "Excel export",
    lead: "The core writes real .xlsx files – the current view or any data you like.",
    learn: ["export what the table shows", "export all rows with your own columns", "know what ends up in the file"],
    api: ["TableApi.downloadExcel", "ExcelService", "ExcelService.downloadExcel", "ExcelService.createExcelBlob",
      "AreaModelObjectArray.getAllRows"],
    showcases: [{ name: "downloadexcel", title: "Download Excel" }],
    since: "1.1.90"
  },
  // ── Part 6 ──────────────────────────────────────────────────────────────────────────────
  {
    slug: "cell-renderers", no: 25, part: "look", episode: 25, minutes: 6,
    title: "Style cells with cell renderers", nav: "Cell renderers",
    lead: "A renderer decides how a cell looks – the value stays the same for sorting, filter, copy and Excel.",
    learn: ["use the built-in renderers", "write an own CellRendererIf", "render the footer differently"],
    api: ["CellRendererIf", "CellRendererIf.render", "DomServiceIf", "ColumnDefIf.rendererMap",
      "DateToLocaleDateCellRenderer", "NumberCellProgressBarCellRenderer", "StarRatingCellRenderer",
      "RendererCleanupFnType"],
    showcases: [{ name: "large", title: "Large dataset (renderers)" }, { name: "order", title: "Order table" }]
  },
  {
    slug: "framework-components", no: 26, part: "look", episode: 26, minutes: 5,
    title: "Framework components as cells", nav: "Components as cells",
    lead: "A real React or Angular component per cell – created only for visible cells.",
    learn: ["wrap a React component as renderer", "implement ComponentRendererIf in Angular", "know the lifecycle"],
    api: ["CellRendererIf", "ColumnDef.create"]
  },
  {
    slug: "heatmap", no: 27, part: "look", episode: 27, minutes: 5,
    title: "Heatmaps and conditional formatting", nav: "Heatmap",
    lead: "The colour comes from the value – computed only for visible cells.",
    learn: ["style cells with getCustomStyleAt", "add classes with getCustomClassesAt", "use the colour gradient helpers"],
    api: ["AreaModelIf.getCustomStyleAt", "AreaModelIf.getCustomClassesAt", "GeCssColorUtil", "ThreeColorGradientArg",
      "ColorRgb", "AreaModelArrayOfArrays"],
    showcases: [{ name: "heatmap1", title: "Heatmap" }, { name: "heatmap2", title: "Seattle heatmap" }]
  },
  {
    slug: "theming-dark-mode", no: 28, part: "look", episode: 28, minutes: 5,
    title: "Theming and dark mode with CSS variables", nav: "Theming & dark mode",
    lead: "Everything is a CSS variable – light and dark are built in, your brand is a few lines away.",
    learn: ["override --ge-table-* variables", "switch light and dark", "scope a theme to one table",
      "mirror the table for Arabic and Hebrew (since 1.1.98)"],
    api: ["CssVars", "TableOptionsIf.direction", "TableApi.getDirection"],
    showcases: [{ name: "laf", title: "Look and feel" }, { name: "rtl", title: "Right-to-left" }]
  },
  {
    slug: "rowspan-colspan", no: 29, part: "look", episode: 29, minutes: 5,
    title: "Rowspan and colspan: a timetable", nav: "Rowspan & colspan",
    lead: "Connected cells come from the model – double periods span rows, breaks span the week.",
    learn: ["return spans from getRowspanAt / getColspanAt", "colour cells by class", "know how spans render"],
    api: ["AreaModelIf.getRowspanAt", "AreaModelIf.getColspanAt", "AreaModelIf.getCustomClassesAt", "AreaModelArrayOfArrays"],
    showcases: [{ name: "timetable", title: "Timetable" }]
  },
  {
    slug: "tree-table", no: 30, part: "look", episode: 30, minutes: 6,
    title: "Tree table with checkboxes", nav: "Tree table",
    lead: "Country → customer → order: group your data into a tree and let users check rows.",
    learn: ["build tree rows with TreeFactory", "start collapsed", "react to checked rows"],
    api: ["TreeFactory.buildTreeRows", "TreeRow", "AreaModelTree", "TableOptionsIf.showCheckboxWihoutExtraColumn",
      "EventListenerIf.onCheckboxChanged"],
    showcases: [{ name: "treetable", title: "Tree table" }, { name: "treetablecheckbox", title: "Tree table with checkboxes" }],
    since: "1.1.90"
  },
  // ── Part 7 ──────────────────────────────────────────────────────────────────────────────
  {
    slug: "inline-editing", no: 31, part: "interaction", episode: 31, minutes: 6,
    title: "Inline editing", nav: "Inline editing",
    lead: "Change quantity and status right in the table – and recalculate what depends on them.",
    learn: ["make a column editable", "convert input with editInputPipe", "use a select editor", "react to changes",
      "fill cells with the fill handle and collect changes until saving (since 1.1.96)"],
    api: ["ColumnDefIf.editable", "ColumnDefIf.editInputPipe", "ColumnDefIf.getEditRenderer", "SelectCellRenderer",
      "ValueLabel", "EventListenerIf.onModelChanged", "GeModelChangeEvent", "TableApi.repaint",
      "TableOptionsIf.fillHandle", "TableOptionsIf.batchEdit", "ColumnDefIf.validate", "TableApi.commitBatchEdit",
      "TableApi.getPendingChanges"],
    showcases: [{ name: "batchedit", title: "Fill handle & batch edit" }],
    since: "1.1.89"
  },
  {
    slug: "live-data", no: 32, part: "interaction", episode: 32, minutes: 5,
    title: "Live data without rebuilding the table", nav: "Live data",
    lead: "1,500 cell updates per second – only the changed, visible cells are redrawn.",
    learn: ["update single cells with updateCells()", "flash a cell with CSS classes", "keep permanent colours in the model",
      "show a loading spinner and empty states (since 1.1.92)"],
    api: ["TableApi.updateCells", "TableCellUpdateEvent", "TableApi.repaint", "TableApi.showLoadingOverlay",
      "TableApi.hideOverlay", "OverlayOptionsIf"],
    showcases: [{ name: "crypto", title: "Crypto ticker" }],
    since: "1.1.89"
  },
  {
    slug: "persist-state", no: 33, part: "interaction", episode: 33, minutes: 4,
    title: "Remember the state: sorting, scroll position, open nodes", nav: "Persist state",
    lead: "After a reload everything looks like before – one localStorage key per table, or your server.",
    learn: ["switch on autoRestoreOptions", "remember expanded tree nodes", "choose a storage key",
      "remember the column layout, checked and selected rows (since 1.1.92)", "save the state on your server (since 1.1.92)"],
    api: ["AutoRestoreOptions", "AutoRestoreOptionsIf", "TableOptionsIf.autoRestoreOptions", "TableApi.getState",
      "TableApi.applyState", "TableApi.resetState", "TableOptionsIf.initialState", "GeStateChangeEvent", "TableStateIf"],
    since: "1.1.89"
  },
  {
    slug: "checklist", no: 34, part: "interaction", episode: 34, minutes: 4,
    title: "Finale: when GuiExpert Table – and when not", nav: "Checklist & finale",
    lead: "A checklist for your own table and an honest list of what is not built in.",
    learn: ["plan a table step by step", "know the strengths", "know when to pick something else"],
    api: ["TableApi", "TableOptions", "TableFactory", "ColumnDef"]
  },
  // ── Part 8 ──────────────────────────────────────────────────────────────────────────────
  {
    slug: "accessibility", no: 35, part: "advanced", episode: 35, minutes: 5,
    title: "Accessible tables: keyboard and screen readers", nav: "Accessibility",
    lead: "A screen reader hears “row 5 of 1,001, Total, 243.20” – and every key of the WAI-ARIA grid works.",
    learn: ["name the table for screen readers", "know the keys of the grid", "announce sorting, filter and copy – also in German",
      "write cell renderers that screen readers understand"],
    api: ["TableOptionsIf.ariaLabelledBy", "TableOptionsIf.ariaLabel", "TableOptionsIf.ariaTexts", "AriaTextsIf", "AriaTexts",
      "TableApi.announce", "TableApi.getHeaderFocus", "LiveAnnouncer", "ActionId"],
    since: "1.1.91"
  },
  {
    slug: "row-grouping", no: 36, part: "advanced", episode: 36, minutes: 6,
    title: "Row grouping: totals per country, city or month", nav: "Row grouping",
    lead: "100,000 flat orders, one factory call – grouped by country and city, with sums per group and a total row.",
    learn: ["group flat rows by one or more columns or computed keys", "show sums, averages and counts per group",
      "know why an average of groups is not the average of averages", "regroup at runtime without a new model",
      "filter, sort and edit grouped rows"],
    api: ["RowGroupFactory", "RowGroupFactory.createTableModel", "RowGroupTableModelParaIf", "RowGroupFieldIf",
      "AreaModelRowGroups", "AreaModelRowGroups.getGroups", "RowGroupIf", "TableApi.setRowGroupBy", "TableApi.expandAll",
      "TableApi.collapseAll", "groupRows", "aggregateRowGroups", "isGroupRow"],
    showcases: [{ name: "rowgrouping", title: "Row grouping" }],
    since: "1.1.94"
  },
  {
    slug: "pivot-tables", no: 37, part: "advanced", episode: 37, minutes: 6,
    title: "Pivot tables: countries × quarters in one call", nav: "Pivot tables",
    lead: "100,000 flat orders become revenue per country, city, year and quarter – with subtotals, totals and a header made from the data.",
    learn: ["tell a pivot table from a transposition and from row grouping", "turn the values of a field into columns",
      "show several values per cell and computed keys like quarters", "know why totals are computed from the rows, not from the cells",
      "filter, sort, drill down and pivot again at runtime"],
    api: ["PivotFactory", "PivotFactory.createTableModel", "PivotTableModelParaIf", "PivotConfigIf", "PivotValueIf",
      "PivotTableModel", "AreaModelPivot", "AreaModelPivot.getCellSourceRows", "AreaModelPivot.getResult", "PivotResult",
      "PivotResult.getValue", "pivotRows", "TableApi.setPivotConfig", "RowGroupFieldIf"],
    showcases: [{ name: "pivot", title: "Pivot table" }],
    since: "1.1.94"
  },
  {
    slug: "master-detail", no: 38, part: "advanced", episode: 38, minutes: 5,
    title: "Master/detail: an order and its items", nav: "Master/detail",
    lead: "100,000 orders – open one and its items appear right below it as a second table, also while you scroll far away and back.",
    learn: ["show a detail row with any content below a row", "nest a second GuiExpert table without leaks",
      "choose a fixed or a measured height", "know why the detail survives scrolling and sorting",
      "use the keyboard, events and framework components"],
    api: ["TableOptionsIf.masterDetail", "MasterDetailOptionsIf", "DetailRenderContextIf", "DetailRenderContextIf.createTable",
      "TableApi.setDetailExpanded", "TableApi.toggleDetail", "TableApi.collapseAllDetails", "TableApi.getExpandedDetailRows",
      "EventListenerIf.onDetailExpandedChanged", "GeDetailEvent", "RowLayout"],
    showcases: [{ name: "masterdetail", title: "Master/detail" }],
    since: "1.1.97"
  }
];

export function chapterBySlug(slug: string): Chapter {
  const chapter = CHAPTERS.find(c => c.slug === slug);
  if (!chapter) throw new Error(`Unknown training chapter "${slug}"`);
  return chapter;
}

export function partOf(chapter: Chapter): Part {
  return PARTS.find(p => p.id === chapter.part)!;
}

export function chaptersOf(part: PartId): Chapter[] {
  return CHAPTERS.filter(c => c.part === part);
}

export function neighbours(chapter: Chapter): { prev?: Chapter; next?: Chapter } {
  const i = CHAPTERS.indexOf(chapter);
  return { prev: CHAPTERS[i - 1], next: CHAPTERS[i + 1] };
}

export const pad = (n: number) => String(n).padStart(2, "0");
