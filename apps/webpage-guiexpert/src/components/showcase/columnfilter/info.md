---
layout: ../../../layouts/DemoCodeLayout.astro
---

Source of demo: [columnfilter/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/columnfilter/run.astro).

Model and 200,000-row dataset: [createColumnFilterModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createColumnFilterModel.ts).

Built-in column filters over **200,000 rows**: a persistent filter row below the header (`filterRow: true`), a per-column
filter menu with operators and a virtualized Excel-style unique-value checklist (`columnFilterMenu: true`), and a column
chooser popup (`tableApi.showColumnChooser(button)`) — all in the MIT-licensed core with zero runtime dependencies.

```ts title="Enable filter row, Excel value checklist and column chooser"
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  filterRow: true,          // persistent inputs below the header
  columnFilterMenu: true,   // funnel button + virtualized value checklist
};

listener.onFilterChanged = evt => {
  statusEl.textContent = `${evt.rowCount} / ${evt.unfilteredRowCount} rows`;
};

columnsBtn.addEventListener("click", () => tableApi.showColumnChooser(columnsBtn));
```

- **Filter-row shorthand:** `>50000`, `10000..50000`, `=Berlin`, `!=APAC`, `^Ac`, `""` (blanks), `2025-01..2025-06`, plus a tri-state boolean select.
- **Excel-style value checklist:** virtualized list of distinct values cascading across other active filters; supports async `ColumnDef.filter.getValues` for server-side datasets.
- **Column chooser:** searchable checkbox list anchored to any button; lock essential columns with `ColumnDef.hideable: false`.
- **Plain-HTML status bar:** the table stays lean without built-in status bar chrome — wire record count, filter row toggle, Columns chooser, Clear filters and Fullscreen in a few lines of HTML.
- **Top-layer popups:** uses `popover="manual"` (with automatic fallback) so menus render cleanly in fullscreen mode and inside `overflow: hidden` containers.

Docs: [instructions.md 6.28](https://github.com/guiexperttable/mono/blob/main/instructions.md) · API:
[TableOptionsIf.filterRow](/api/interfaces/TableOptionsIf.html#filterRow),
[TableOptionsIf.columnFilterMenu](/api/interfaces/TableOptionsIf.html#columnFilterMenu),
[TableApi.setColumnFilter](/api/classes/TableApi.html#setColumnFilter),
[TableApi.showColumnChooser](/api/classes/TableApi.html#showColumnChooser).
