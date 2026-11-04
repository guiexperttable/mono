# Reddit post – GuiExpert Table (English)

Suggested subreddits: r/javascript, r/webdev, r/typescript, r/Angular2, r/reactjs, r/sveltejs, r/vuejs.
Check each sub's self-promotion rules first (r/javascript: "Showoff Saturday"; r/webdev: "Showoff Saturday" flair).
Post as text post, not link post – Reddit trusts text posts with code more.

---

## Title (pick one)

- I built a framework-agnostic data grid that renders 2 million rows smoothly – zero dependencies, MIT
- Show-off: an open-source data table with row grouping, pivot and Excel-style editing – no enterprise license
- One table core for Angular, React, Vue, Svelte, Solid, Preact and plain JS – 2M rows, 0 runtime deps, MIT

---

## Body

Hi all,

I'm Marc, a solo developer, and for the last few years I've been building **GuiExpert Table** – a data grid for the browser. I'd love some honest feedback from people who deal with big tables.

**Why I built it**

Every project I worked on hit the same wall: lots of rows, a specific framework, and the features we needed (grouping, pivot, copy & paste from Excel) sitting behind a commercial license in the grid we used. So I wrote one core in TypeScript and kept the framework part as thin as possible.

**What it is**

- **Fast with large data** – vertical *and* horizontal virtual scrolling. The "Large dataset" demo renders 2,000,000 rows; only the visible cells are in the DOM.
- **One core, every framework** – Angular 14–22 (incl. a signal-based, zoneless component for 22), React, Vue 3, Svelte 4/5, Solid, Preact, a Web Component and plain JS/TS.
- **Zero runtime dependencies** – even the Excel (XLSX) export is a small built-in writer.
- **Full control over HTML/CSS** – theming via CSS variables, light/dark mode, your own cell renderers or framework components as cells.
- **MIT-licensed** – free for commercial use too.

**Features that usually cost extra elsewhere**

Row grouping with aggregates, pivot tables, a totals row, master/detail rows (nested tables), fill handle and batch editing, clipboard copy & paste with Excel, undo/redo, cell formulas with A1 references (`=SUM(B2:B10)`), and even a spreadsheet mode. Plus row drag & drop, right-to-left layout, state persistence (column order, widths, sort, scroll) and keyboard + screen reader support (WAI-ARIA grid, axe-tested).

**What it looks like in code (plain TS)**

```ts
import { SimpleDomService, EventAdapter, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

const rows = [
  { id: 1, name: "Ada", city: "London" },
  { id: 2, name: "Linus", city: "Helsinki" }
];

const tableModel = TableFactory.createTableModel({
  rows,
  properties: ["id", "name", "city"],
  rowNumbersVisible: true
});

const scope = new TableScope(document.querySelector(".table-div") as HTMLDivElement,
  tableModel, new SimpleDomService(), { ...new TableOptions() }, new EventAdapter());
scope.firstInit();
```

The React/Vue/Angular/… wrappers take the same `tableModel` and `tableOptions` as props.

**Links**

- Website, live showcases and a free 40-chapter training: https://gui.expert
- Source: https://github.com/guiexperttable/mono
- npm: `npm i @guiexpert/table` (+ `@guiexpert/react-table`, `@guiexpert/vue3-table`, `@guiexpert/angular-table`, …)

**What I'd like to know**

- What's the one thing that keeps you on your current grid (or makes you hate it)?
- Anything missing that would block you from trying it? (Server-side row model is on my list.)

Thanks for reading – happy to answer anything in the comments.

---

## Notes for posting

- Stay in the comments for the first 1–2 hours; answer ag-Grid comparisons factually (row drag and RTL are also in ag-Grid Community – don't claim those as "enterprise only").
- No prices, no "forever free" promises (possible dual license for future releases).
- A short GIF of the 2M-row showcase scrolling helps a lot on r/webdev and r/javascript.
