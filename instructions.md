# GuiExpert Table – Developer Guide

How to display large tabular data sets in web applications with `@guiexpert/table` and its framework wrappers.

> **Source of truth:** every API used in this guide exists in the source code of
> [guiexperttable/mono](https://github.com/guiexperttable/mono) (version 1.1.x). If something here and the code disagree,
> the code wins – see also the generated API docs at https://gui.expert/api.

---

## 1. Packages

| Package | Use it for | Peer dependency |
|---|---|---|
| `@guiexpert/table` | Core – framework-free, **zero runtime dependencies**. Always required. | – |
| `@guiexpert/angular-table` | Angular 14 – 22 (major version = Angular major, e.g. `^22.0.0`) | `@angular/core`, `@angular/common` |
| `@guiexpert/react-table` | React 18 / 19 | `react`, `react-dom` |
| `@guiexpert/preact-table` | Preact 10 | `preact` |
| `@guiexpert/solid-table` | Solid 1 | `solid-js` |
| `@guiexpert/svelte-table` | Svelte 4 (Svelte 5: not yet) | `svelte` |
| `@guiexpert/vue3-table` | Vue 3 | `vue` |
| `@guiexpert/webcomponent-table` | Custom Element for plain JS/TS or any other framework | – |
| `@guiexpert/demo-table-models` | Ready-made demo models (large data set, heatmap, tree, …) – handy for prototypes | – |

All wrappers are thin: they create a `TableScope` on a host `<div>`, forward the events of the core and hand you
a `TableApi` once the table is ready. Everything else (models, options, renderers) comes from `@guiexpert/table`.

---

## 2. Installation

```bash
npm install @guiexpert/table @guiexpert/<framework>-table
# or
pnpm add @guiexpert/table @guiexpert/<framework>-table
```

`<framework>` is one of `angular`, `react`, `preact`, `solid`, `svelte`, `vue3`, `webcomponent`.
Plain JS/TS projects only need `@guiexpert/table`.

### 2.1 Stylesheet

The core package ships its styles (colors as CSS variables, helper classes such as `ge-table-text-align-left`) in
`css/main.css`:

- **Angular** – nothing to do: `@guiexpert/angular-table` ships the complete styles inside its component
  (all Angular majors built from the mono repo; older 14 – 16 releases import `node_modules/@guiexpert/table/css/main.css`).
- **Any HTML page** – load it from the npm CDN:
  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@guiexpert/table/css/main.css" />
  ```
- **Bundlers (Vite, webpack)** – `import "@guiexpert/table/css/main.css";` (from version 1.1.85; older versions only
  export `"."` – there copy the file or import it via a relative path to `node_modules/@guiexpert/table/css/main.css`).

### 2.2 The container needs a height

The table fills its host element (width and height 100 %). Give the element around it a fixed or flex height,
otherwise you will see nothing:

```css
.table-div {
  height: 500px;   /* or: flex: 1; height: calc(100vh - 120px); ... */
  width: 100%;
}
```

---

## 3. Core concepts

| Concept | Type | Purpose |
|---|---|---|
| Table model | `TableModelIf` | Holds the header, body and footer area models, the column definitions, column widths and the number of fixed columns. Usually created with `TableFactory.createTableModel(...)`. |
| Area model | `AreaModelIf` | Delivers the cells of one area (`"header" \| "body" \| "footer"`): `getRowCount()`, `getValueAt(row, col)`, `getRowHeight(row)`, `getCellRenderer(...)`, `getRowspanAt(...)`, … Extend `AreaModel` to feed the table from any data source. |
| Column definition | `ColumnDefIf` / `ColumnDef` | Property, header label, width, CSS classes, renderers, sorting, editing per column. |
| Options | `TableOptionsIf` / `TableOptions` | Visual and behavioral options (row heights, hover, borders, resizing, dragging, filter function, selection model, …). |
| Scope / API | `TableScope` / `TableApi` | `TableScope` renders the table into a `<div>`. `TableApi` (`tableScope.getApi()` or the `tableReady` event of a wrapper) is the public API for scrolling, repainting, sorting, filtering, selection, export. |

The layout consists of 3 × 3 areas: `header` / `body` / `footer`, each split into `west` (fixed left columns),
`center` (scrollable) and `east` (fixed right columns). Only the visible rows and columns are rendered
(vertical **and** horizontal virtual scrolling), which is why millions of rows stay smooth.

Typical options object – always start from the defaults:

```ts
import { TableOptions, TableOptionsIf } from "@guiexpert/table";

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  hoverColumnVisible: false,
  columnsResizable: true,
  columnsDraggable: true,
  defaultRowHeights: { header: 34, body: 34, footer: 0 }
};
```

Important `TableOptionsIf` fields: `defaultRowHeights`, `hoverRowVisible`, `hoverColumnVisible`,
`columnsResizable`, `columnsDraggable`, `columnResizeHandleWidthInPx`, `verticalBorderVisible`,
`horizontalBorderVisible`, `headerSeparatorBorderVisible`, `footerSeparatorBorderVisible`,
`fixedWestSeparatorBorderVisible`, `fixedEastSeparatorBorderVisible`, `tableTopBorderVisible`,
`tableBottomBorderVisible`, `overflowX`, `overflowY`, `treeOptions`, `headerGroupOptions`,
`showCheckboxWihoutExtraColumn`, `externalFilterFunction`, `sortedOptions`, `sortOrder`, `autoRestoreOptions`,
`getEditRenderer`, `getSelectionModel`, `getFocusModel`, `shortcutActionIdMapping`, `shortcutActionsDisabled`,
`resizeEventDebounceDelay`.

---

## 4. Quick start per framework

All examples display the same model: 1,000 rows × 100 columns from `@guiexpert/demo-table-models`.

### 4.1 Plain JS / TS (core only)

```ts
import { EventAdapter, SimpleDomService, TableOptions, TableScope } from "@guiexpert/table";
import { generateSimpleModel } from "@guiexpert/demo-table-models";

const hostDiv = document.querySelector(".table-div") as HTMLDivElement;
const tableModel = generateSimpleModel(1000, 100);

const tableScope = new TableScope(
  hostDiv,
  tableModel,
  new SimpleDomService(),
  { ...new TableOptions() },
  new EventAdapter()          // or your own EventListenerIf implementation
);
tableScope.firstInit();

const tableApi = tableScope.getApi();
tableApi.scrollToIndex(0, 500);   // column 0, row 500
```

To receive events, extend `EventAdapter` and override e.g. `onMouseClicked(evt: GeMouseEvent)`.

To replace the table (new model) or remove it from the page, release it first with `tableApi.destroy()`
(since 1.1.86): it removes all DOM listeners incl. the window resize listener, stops the resize observer and calls
the cleanup functions of the cell renderers. The framework wrappers do this automatically.

### 4.2 Web Component

```ts
import { TableModelAndOptions, TableOptions } from "@guiexpert/table";
import { GuiexpertTable } from "@guiexpert/webcomponent-table";
import { generateSimpleModel } from "@guiexpert/demo-table-models";

// The package does not register the element itself – choose your tag name:
customElements.define("guiexpert-table", GuiexpertTable);

const ele = document.querySelector("guiexpert-table") as GuiexpertTable;
ele.addEventListener("tableReady", (e) => console.info("api", (e as CustomEvent).detail));
ele.addEventListener("mouseClicked", (e) => console.info("click", (e as CustomEvent).detail));

ele.data = new TableModelAndOptions(generateSimpleModel(1000, 100), new TableOptions());
```

```html
<div class="table-div">
  <guiexpert-table></guiexpert-table>
</div>
```

Events are dispatched on the element as bubbling `CustomEvent`s with the payload in `detail`: `tableReady`,
`mouseClicked`, `mouseMoved`, `mouseDragging`, `mouseDraggingEnd`, `checkboxChanged`, `modelChanged`,
`selectionChanged`, `focusChanged`, `scroll` – and `contextmenu`, which does not bubble (a listener on the element also
gets the browser's own `contextmenu` event: check `e instanceof CustomEvent`).
Since 1.1.91: a new `el.data` re-creates the table; removing the element destroys the table, inserting it again
re-creates it (`tableReady` again); data set before the element is in the document is shown when it is inserted.

### 4.3 React

```tsx
import { GuiexpertTable } from "@guiexpert/react-table";
import { GeMouseEvent, TableApi, TableOptions } from "@guiexpert/table";
import { generateSimpleModel } from "@guiexpert/demo-table-models";

const tableModel = generateSimpleModel(1000, 100);   // create once, outside render
const tableOptions = new TableOptions();

export function SimpleTable() {
  return (
    <div className="table-div">
      <GuiexpertTable
        tableModel={tableModel}
        tableOptions={tableOptions}
        tableReady={(api: TableApi) => console.info("ready", api)}
        mouseClicked={(evt: GeMouseEvent) => console.info(evt.rowIndex, evt.columnIndex)}
      />
    </div>
  );
}
```

Callback props: `tableReady`, `mouseClicked`, `mouseMoved`, `contextmenu`, `mouseDragging`, `mouseDraggingEnd`,
`checkboxChanged`, `modelChanged`, `selectionChanged`, `focusChanged`, `scroll`, plus `licenseKey`.

Since 1.1.86 a **new `tableModel` or `tableOptions` object re-creates the table** (the previous one is released with
`TableApi.destroy()`, also on unmount and in `StrictMode`). Keep both stable – create them outside the component or
with `useMemo` – otherwise the table is rebuilt on every render. Callback props may change freely:

```tsx
import { GuiexpertTable } from "@guiexpert/react-table";
import { TableFactory, TableOptions } from "@guiexpert/table";
import { useMemo, useState } from "react";

interface PersonIf { name: string; city: string; }

export function PersonTable({ persons }: { persons: PersonIf[] }) {
  const [city, setCity] = useState("");
  const tableOptions = useMemo(() => new TableOptions(), []);
  const tableModel = useMemo(() => TableFactory.createTableModel({
    rows: city ? persons.filter(p => p.city === city) : persons,
    properties: ["name", "city"]
  }), [persons, city]);                                  // new model → table is rebuilt

  return (
    <div className="table-div">
      <button onClick={() => setCity(city ? "" : "Berlin")}>Berlin only</button>
      <GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} />
    </div>
  );
}
```

For filtering *within* the same model `externalFilterFunction` + `tableApi.externalFilterChanged()` (6.3) is
cheaper – it keeps scroll position logic, selection model and column widths.

### 4.4 Vue 3

```vue
<template>
  <div class="table-div">
    <GuiexpertTable
      :tableModel="tableModel"
      :tableOptions="tableOptions"
      @tableReady="onTableReady"
      @mouseClicked="onMouseClicked"
    />
  </div>
</template>

<script lang="ts" setup>
import { GuiexpertTable } from "@guiexpert/vue3-table";
import { GeMouseEvent, TableApi, TableOptions } from "@guiexpert/table";
import { generateSimpleModel } from "@guiexpert/demo-table-models";

const tableModel = generateSimpleModel(1000, 100);
const tableOptions = new TableOptions();

function onTableReady(api: TableApi) { console.info("ready", api); }
function onMouseClicked(evt: GeMouseEvent) { console.info(evt.rowIndex, evt.columnIndex); }
</script>
```

A new `tableModel` or `tableOptions` object re-creates the table (since 1.1.91; the old one is destroyed, `tableReady`
fires again). Keep the model in a plain constant or a `shallowRef` – a deep `ref()` would wrap it in a reactive proxy.

Alternatively register it globally with the default export plugin:
`app.use(GuiexpertTablePlugin)` (`import GuiexpertTablePlugin from "@guiexpert/vue3-table"`).
Props: `tableModel`, `tableOptions`, `debounceMouseClickDelay` (default 150 ms, `0` = every click immediately; since
1.1.85), `licenseKey`. Events: `tableReady`, `mouseClicked`, `mouseMoved`, `contextmenu`, `mouseDragging`,
`mouseDraggingEnd`, `checkboxChanged`, `modelChanged`, `selectionChanged`, `focusChanged`, `scroll`.

### 4.5 Svelte (4 and 5)

Since 1.1.86 `@guiexpert/svelte-table` ships the component as **Svelte source**: it is compiled by your own Svelte
compiler and works with **Svelte 4 and Svelte 5**. Events are available as `on:…` (payload in `e.detail`) and as
callback props `onTableReady`, `onMouseClicked`, … (payload directly – use these in Svelte 5 runes mode).
A new `tableModel` / `tableOptions` object re-creates the table.

```svelte
<script lang="ts">
  import { GuiexpertTable } from "@guiexpert/svelte-table";
  import { TableOptions } from "@guiexpert/table";
  import { generateSimpleModel } from "@guiexpert/demo-table-models";

  const tableModel = generateSimpleModel(1000, 100);
  const tableOptions = new TableOptions();
</script>

<div class="table-div">
  <GuiexpertTable
    {tableModel}
    {tableOptions}
    on:tableReady={(e) => console.info("ready", e.detail)}
    on:mouseClicked={(e) => console.info("click", e.detail)} />
</div>
```

Svelte 5 (runes mode):

```svelte
<script lang="ts">
  import { GuiexpertTable } from "@guiexpert/svelte-table";
  import { type GeMouseEvent, type TableApi, TableFactory } from "@guiexpert/table";

  let rowCount = $state(1000);
  const tableModel = $derived(TableFactory.createTableModel({
    rows: Array.from({ length: rowCount }, (_, i) => ({ id: i, name: "Row " + i }))
  }));
</script>

<button onclick={() => rowCount = 10}>10 rows</button>
<div class="table-div">
  <GuiexpertTable
    {tableModel}
    onTableReady={(api: TableApi) => console.info("ready", api)}
    onMouseClicked={(evt: GeMouseEvent) => console.info(evt.rowIndex)} />
</div>
```

Cell renderers with Svelte components: `new ComponentRendererWrapper(MyCell)` – uses `mount()`/`unmount()` under
Svelte 5 and the component class under Svelte 4.

### 4.6 Preact

Same callback props as React:

```tsx
import { GuiexpertTable } from "@guiexpert/preact-table";
import { TableOptions } from "@guiexpert/table";
import { generateSimpleModel } from "@guiexpert/demo-table-models";

const tableModel = generateSimpleModel(1000, 100);
const tableOptions = new TableOptions();   // create once – a new object re-creates the table (since 1.1.91)

export function SimpleTable() {
  return (
    <div class="table-div">
      <GuiexpertTable
        tableModel={tableModel}
        tableOptions={tableOptions}
        mouseClicked={(evt) => console.info(evt)} />
    </div>
  );
}
```

### 4.7 Solid

Same callback props as React (since 1.1.85; additionally every event is dispatched as bubbling DOM `CustomEvent`
on the container, as in earlier versions):

```tsx
import { GuiexpertTable } from "@guiexpert/solid-table";
import { TableOptions } from "@guiexpert/table";
import { generateSimpleModel } from "@guiexpert/demo-table-models";

const tableModel = generateSimpleModel(1000, 100);
const tableOptions = new TableOptions();

export function SimpleTable() {
  return (
    <div class="table-div">
      <GuiexpertTable
        tableModel={tableModel}
        tableOptions={tableOptions}
        tableReady={(api) => console.info("ready", api)}
        mouseClicked={(evt) => console.info(evt)} />
    </div>
  );
}
```

### 4.8 Angular

```ts
import { Component } from "@angular/core";
import { TableComponent } from "@guiexpert/angular-table";
import { TableApi, TableModelIf } from "@guiexpert/table";
import { generateSimpleModel } from "@guiexpert/demo-table-models";

@Component({
  selector: "app-simple-table",
  standalone: true,
  imports: [TableComponent],
  template: `
    <guiexpert-table
      class="table-div"
      [tableModel]="tableModel"
      (tableReady)="onTableReady($event)"></guiexpert-table>
  `
})
export class SimpleTableComponent {
  tableModel: TableModelIf = generateSimpleModel(1000, 100);

  onTableReady(api: TableApi) { console.info("ready", api); }
}
```

`TableComponent` is standalone (selector `guiexpert-table`). In NgModule-based apps add it to the `imports` of the
module. Since 1.1.86 a new `tableModel` / `tableOptions` object (e.g. from a signal) re-creates the table
(`ngOnChanges`), and the table is released in `ngOnDestroy`. The full Angular guide is [`packages/angular-table/instructions.md`](packages/angular-table/instructions.md).

---

## 5. Creating table models

### 5.1 Array of objects (most common)

```ts
import { TableFactory, TableModelIf } from "@guiexpert/table";

interface PersonIf { id: number; firstName: string; lastName: string; email: string; }

function createPersonModel(rows: PersonIf[]): TableModelIf {
  return TableFactory.createTableModel({
    rows,
    properties: ["id", "firstName", "lastName", "email"],   // column order; header label = property.toUpperCase()
    defaultRowHeights: { header: 34, body: 34, footer: 0 }
  });
}
```

Without `properties` and `columnDefs`, the keys of the first row become the columns.
Nested properties work with dot notation in column definitions, e.g. `"address.city"`.

### 5.2 Column definitions

```ts
import {
  ColumnDef, ColumnDefIf, Renderer, MaleFemaleToIconCellRenderer,
  TableFactory, TrueFn, bodyLeft, allRight, px60, px120, px200, px250
} from "@guiexpert/table";

const columnDefs: ColumnDefIf[] = [
  new ColumnDef("firstName", "First Name", px120),                        // property, label, width
  new ColumnDef("email", "Email", px250, bodyLeft),                       // + CSS classes per area
  new ColumnDef("gender", "Gender", px60, undefined,
    Renderer.bodyRenderer(new MaleFemaleToIconCellRenderer())),           // + renderer per area
  ColumnDef.create({                                                      // named parameters
    property: "balance",
    headerLabel: "Balance",
    width: px200,
    headerClasses: ["ge-table-text-align-right"],
    bodyClasses: ["ge-table-text-align-right"],
    sortable: TrueFn
  })
];

const tableModel = TableFactory.createTableModel({
  rows: [],
  columnDefs,
  fixedLeftColumnCount: 1,      // first column stays visible while scrolling horizontally
  fixedRightColumnCount: 0
});
```

Width constants `px0 … px500` (and `new Size(n, "px")`), alignment helpers `bodyLeft`, `bodyCenter`, `bodyRight`,
`allLeft`, `allCenter`, `allRight`, boolean helpers `TrueFn` / `FalseFn`.
`ColumnDef.create(...)` accepts: `property`, `headerLabel`, `width`, `minWidth`, `maxWidth`, `headerRenderer`,
`bodyRenderer`, `footerRenderer`, `headerClasses`, `bodyClasses`, `footerClasses`, `sortable`, `sortIconVisible`,
`sortComparator`, `sortState`, `sortStatesOrder`, `editable`, `isVisible`, `getEditRenderer`, `editInputPipe`.

#### Row numbers (since 1.1.93)

Running row numbers (1, 2, 3 …) like the row headers of a spreadsheet – one flag:

```ts
import { TableFactory, ColumnDef, ColumnDefIf, px120 } from "@guiexpert/table";

interface OrderIf { id: number; customer: string; total: number; }
declare const orders: OrderIf[];

const orderColumns: ColumnDefIf[] = [new ColumnDef("customer", "Customer", px120), new ColumnDef("total", "Total", px120)];

const tableModel = TableFactory.createTableModel({
  rows: orders,
  columnDefs: orderColumns,
  rowNumbersVisible: true          // or options: { mode: "original", format: n => n.toLocaleString("en-US") }
});
```

The flag puts a `RowNumberColumnDef` in front of the columns and fixes it on the left (`fixedLeftColumnCount` + 1).
What you get:

- header `#`, numbers right aligned with digits of equal width; the width follows the largest number (also after
  `setRows` + `repaintHard()`, filtering, expanding tree rows) – `"2000000"` fits;
- `mode: "display"` (default): 1, 2, 3 … of the current view, also after sorting and filtering;
  `mode: "original"`: the position in the unsorted, unfiltered rows – the number stays with its row;
- `format: n => …` for the text (default without thousands separators), `headerLabel` (default `"#"`),
  `minWidthInPx` (default 36);
- a click on a number selects the row (selection type `"row"` and `"range"`; Shift extends, Ctrl/⌘ toggles), a click
  on `#` selects all;
- not sortable, not editable, no resize handle, can't be dragged; `autoResizeColumns()` leaves it alone;
- not in `copyToClipboard()` / `downloadExcel()` – unless `exported: true` (Excel gets numbers with the default
  `format`, texts with your own); Ctrl+C on a focused number without selection copies that number;
- screen readers: the number cells are row headers (`role="rowheader"`);
- tree tables: the visible rows are numbered; the tree arrow stays in the first data column;
- `mode: "original"` keeps a `Map` row → position (for 2 million rows some ten MB); `overridingColumnWidth` gives the
  number column the same width as all others.

**Column indices shift by one.** The row numbers are a real column (like a `CheckboxColumnDef`): with
`rowNumbersVisible: true` the column `"total"` has the index 2, not 1 – in events (`GeMouseEvent.columnIndex`),
`getValueAt`, `scrollToIndex`, the selection. Use properties where you can:

```ts
import type { TableApi } from "@guiexpert/table";
declare const tableApi: TableApi;

const totalColumn = tableApi.getColumnIndex("total");     // 2 with row numbers, 1 without
tableApi.setColumnVisible("customer", false);              // by property – no index needed
```

With a checkbox column, or with your own area models, put the column definition in yourself – **as the first column**,
counted in `fixedLeftColumnCount` (the flag is ignored with `bodyData` or own area models, because their columns would
shift). The order is always: row numbers, checkbox, data columns.

```ts
import { CheckboxColumnDef, ColumnDef, ColumnDefIf, RowNumberColumnDef, TableFactory } from "@guiexpert/table";

interface TaskIf { title: string; }
declare const tasks: TaskIf[];

const columnDefs: ColumnDefIf[] = [new RowNumberColumnDef(), new CheckboxColumnDef(), new ColumnDef("title", "Title")];
const tableModel = TableFactory.createTableModel({ rows: tasks, columnDefs, fixedLeftColumnCount: 2 });
```

Look: CSS classes `ge-table-row-number` (body), `ge-table-row-number-header`, `ge-table-row-number-footer`, variables
`--ge-table-row-number-bg` and `--ge-table-row-number-color` (light and dark).

### 5.3 Array of arrays

```ts
import { TableFactory } from "@guiexpert/table";

const tableModel = TableFactory.createTableModel({
  headerData: [["Name", "City", "Age"]],             // one or more header rows
  bodyData: [
    ["Anna", "Berlin", 34],
    ["Ben", "Hamburg", 28]
  ],
  footerData: [["", "Total", "62"]],          // header/footer cells are strings
  columnSizes: [200, 150, 80]
});
```

### 5.4 Footer with totals of the displayed rows (built in since 1.1.94)

`footerData` (5.3) is static text. A footer that follows filter and sorting is one option of the factory – the keys
are the properties of the columns, the values the aggregators (`"sum"`, `"count"`, `"avg"`, `"min"`, `"max"`,
`"countDistinct"`, `"first"`, `"last"` or your own `AggregatorIf`):

```ts
import { ColumnDef, TableFactory, TableOptions, TableOptionsIf, px120 } from "@guiexpert/table";

interface OrderIf { id: number; city: string; quantity: number; total: number; }

let city = "";
const orders: OrderIf[] = [{ id: 1, city: "Berlin", quantity: 2, total: 20 }, { id: 2, city: "Hamburg", quantity: 1, total: 10 }];
const tableOptions: TableOptionsIf = { ...new TableOptions(), externalFilterFunction: (o: OrderIf) => !city || o.city === city };
const tableModel = TableFactory.createTableModel({
  rows: orders,
  columnDefs: [new ColumnDef("id", "ID", px120), new ColumnDef("city", "City", px120),
    new ColumnDef("quantity", "Qty", px120), new ColumnDef("total", "Total", px120)],
  tableOptions,
  footerAggregates: { quantity: "sum", total: "sum" }      // footer: "2 rows" | | 3 | 30
});
```

- **Data**: the rows the body shows (after `externalFilterFunction`); in a tree all leaves the filter keeps, expanded
  or not (in a row grouping, 5.6, its rows – the factory adds this footer for you); with `bodyData` or an own body
  model every row via `getValueAt` of the column. `source: "all"` ignores the filter, `getRows` sets an own source.
- **Label**: `"2 rows"` in the first data column without an aggregate (screen readers announce it as row header);
  `labelProperty` picks the column, `label` per row sets the text (string or `(rowCount, results) => string`).
- **Cells**: the value is the raw result – Excel gets numbers (`downloadExcel()` exports the footer, 6.10), a footer
  renderer of the column (`rendererMap.footer`) gets the number. Without one the text is formatted: at most two
  decimals with thousands separators (`"1,234.5"`), or `format` of the spec.
- **Recomputing**: once per change, never while scrolling. The table recomputes after filter, sorting, editing,
  `updateCells()` and `tableApi.repaint()` / `repaintHard()` – after changing row objects yourself call
  `tableApi.repaint()`, as for the cells.
- Invalid values: `sum`/`avg`/`min`/`max` use numbers only (`null`, `""`, `"abc"`, `NaN` are ignored; text is not
  converted – use `value: o => Number(o.amount)`), `count` counts rows, an empty set gives `sum` 0 and `avg`
  `undefined` (empty cell).

Several total rows, own labels and formats, computed values:

```ts
import { AggregateFooterConfig, formatAggregateValue } from "@guiexpert/table";

interface Order { customer: string; quantity: number; price: number; total: number; }

const footerAggregates: AggregateFooterConfig<Order> = {
  labelProperty: "customer",
  rows: [
    { label: "Sum", aggregates: { quantity: "sum", total: "sum" } },
    { label: (rowCount: number) => `Ø of ${rowCount}`, aggregates: {
        quantity: "avg",
        total: { aggregator: "avg", format: v => `${formatAggregateValue(v)} €` } } },
    { label: "Largest order", aggregates: { total: { aggregator: "max", value: o => o.quantity * o.price } } }
  ]
};
```

The same aggregators work without a table – one pass over the rows, results by key:

```ts
import { Aggregators, aggregate, aggregateColumns } from "@guiexpert/table";

const sales = [{ region: "North", amount: 100 }, { region: "South", amount: 80 }, { region: "North", amount: 120 }];
aggregate(sales, "amount", "sum");                                         // 300
aggregateColumns(sales, { amount: "avg", region: "countDistinct" });       // { amount: 100, region: 2 }
const avg = Aggregators.avg;                                               // partial results merge correctly:
const north = [100, 120].reduce((s, v) => avg.add(s, v), avg.init());
const south = [80].reduce((s, v) => avg.add(s, v), avg.init());
avg.result(avg.merge(north, south));                                       // 100 – not the mean of 110 and 80
```

Read the results of the footer (e.g. for a title): `(tableModel.getAreaModel("footer") as AreaModelAggregateFooter).getResults()`.

**Your own footer model** – for layouts the built-in one doesn't cover (e.g. text that spans several columns): extend
`AreaModel` and compute the cells from the rows the body currently shows (`getFilteredRows()` = after
`externalFilterFunction`, in display order). Cache the sums yourself and drop the cache in `invalidateDerivedValues()` – the table
calls it after filter, sorting, editing and `tableApi.repaint()`:

```ts
import { AreaModel, AreaModelObjectArray, aggregateColumns } from "@guiexpert/table";

interface OrderIf { id: number; city: string; total: number; }

class OrderTotalsFooterModel extends AreaModel {
  private totals?: Record<string, unknown>;
  constructor(private readonly getBody: () => AreaModelObjectArray<OrderIf>) {
    super();
    this.areaIdent = "footer";
  }
  invalidateDerivedValues(): void { this.totals = undefined; }   // called by the table (since 1.1.94)
  override getRowCount(): number { return 1; }
  override getRowHeight(_rowIndex: number): number { return 34; }
  override getValueAt(_rowIndex: number, columnIndex: number): any {
    const rows = this.getBody().getFilteredRows();          // only the rows that pass the filter
    this.totals ??= aggregateColumns(rows, { total: "sum" });
    if (columnIndex === 1) return rows.length + " orders";
    if (columnIndex === 2) return this.totals["total"];
    return "Σ";
  }
}
```

Pass it as `footerAreaModel: new OrderTotalsFooterModel(() => tableModel.getBodyModel() as AreaModelObjectArray<OrderIf>)`.

### 5.5 Millions of rows: your own area model

You do not need to hold the data in an array. Extend `AreaModel` and compute the cells on demand – the table only
asks for the visible ones:

```ts
import { AreaModel, ColumnDef, TableFactory, px120, px200 } from "@guiexpert/table";

class MillionRowsModel extends AreaModel {
  constructor(private readonly rowCount: number) { super(); }

  override getRowCount(): number { return this.rowCount; }
  override getRowHeight(_rowIndex: number): number { return 34; }
  override getConstantRowHeight(): number | undefined { return 34; }   // since 1.1.85: constant-time scrolling
  override getYPosByRowIndex(rowIndex: number): number { return rowIndex * 34; }  // used by scrollToIndex()
  override getValueAt(rowIndex: number, columnIndex: number): string | number {
    return columnIndex === 0 ? "id" + rowIndex : rowIndex * 3;
  }
}

const tableModel = TableFactory.createTableModel({
  bodyAreaModel: new MillionRowsModel(2_000_000),
  columnDefs: [new ColumnDef("id", "ID", px120), new ColumnDef("value", "Value", px200)]
});
```

The showcase *Large dataset* (https://gui.expert/showcase/large) does exactly this with 2 million rows
(`createLargeModelAndOptions` in `@guiexpert/demo-table-models`).

Tips for very large models:
- Return the row height from `getConstantRowHeight()` if all rows are equally high – the renderer then computes the
  first visible row directly instead of summing up the heights of all rows above it (2 million rows: rendering at the
  end of the table drops from ~29 ms to ~15 ms). The built-in models do this automatically.
- `scrollToIndex()` uses `getYPosByRowIndex()`. Since 1.1.85 the `AreaModel` default derives it from the row heights
  (O(1) with `getConstantRowHeight()`, otherwise O(n)); override it for huge models with variable row heights.

### 5.6 Row grouping with aggregation (since 1.1.94)

Flat rows grouped by one or more properties: every group is a row with an arrow, a label (`"Nord (3)"`) and the
aggregates of its rows per column; below it the sub-groups or the original rows; a total row in the footer. The columns
stay the columns of your data (unlike a pivot table). Built on the tree table, so expanding, `expandAll()`/`collapseAll()`,
keyboard, screen readers and `autoRestoreOptions` work as there.

```ts
import { ColumnDef, RowGroupFactory, px120 } from "@guiexpert/table";

interface Sale { region: string; produkt: string; monat: string; umsatz: number; }

const sales: Sale[] = [
  { region: "Nord", produkt: "A", monat: "Jan", umsatz: 100 }, { region: "Nord", produkt: "B", monat: "Jan", umsatz: 50 },
  { region: "Süd", produkt: "A", monat: "Jan", umsatz: 80 }, { region: "Nord", produkt: "A", monat: "Feb", umsatz: 120 },
  { region: "Süd", produkt: "B", monat: "Feb", umsatz: 70 }, { region: "Süd", produkt: "A", monat: "Feb", umsatz: 30 }
];
const tableModel = RowGroupFactory.createTableModel<Sale>({
  rows: sales,
  columnDefs: ["region", "produkt", "monat", "umsatz"].map(p => new ColumnDef(p, p, px120)),
  groupBy: ["region", "produkt"],          // levels, top first
  aggregations: { umsatz: "sum" }          // key = property of the column
});
// ▾ Nord (3)  … 270   ▾ A (2) … 220   Jan 100 · Feb 120   ▾ B (1) … 50 …   footer: "6 rows" … 450
```

What the factory does: a group column (arrows and labels, fixed on the left, behind row numbers and checkbox column)
with the header `"region › produkt"`, the grouped columns hidden (`hideGroupedColumns: false` keeps them), the body an
`AreaModelRowGroups`, a total row from the `aggregations` (`footerAggregates: false` removes it, or pass an own
configuration as in 5.4).

- **Levels**: property paths (`"address.city"`), functions (`o => new Date(o.date).getFullYear()`) or
  `{ value, name, label, format, order }`. Groups are ordered ascending (`order: "desc" | "insertion" | (a, b) => …`);
  `null`, `undefined` and `""` form one group `"(empty)"` (`emptyLabel`), always last; `1` and `"1"` are different groups.
- **Aggregates**: the aggregators of 5.4. Every group above the last level merges the states of its sub-groups – an
  average is the average of all rows (Nord: 270 / 3 = 90), never the average of averages. Formatted with `format` of the
  spec or two decimals; the cell value stays the number (Excel).
- **Expanded**: `expanded: true` (default), `false`, a number of open levels (`0` = all closed) or `(group) => boolean`.
- **Filter**: `externalFilterFunction` gets **your objects** – the same function as in the flat table. Groups without a
  match disappear; counts, aggregates and the total row follow the filter.
- **Sorting**: a click on an aggregated column sorts the groups by their aggregate and the rows by their value; on the
  group column the groups by key. `tableApi.sort((a, b) => …)` sorts the rows inside their groups (your objects).
- **Editing**: group rows are not editable. A changed value recomputes only the groups of that row; a changed grouped
  value moves the row into its new group. After changing data yourself: `tableApi.repaint()`; after changing grouped
  values: `body.regroup()` + `tableApi.repaintHard()`.
- **Export**: copy and Excel contain the group rows (label, raw aggregates) and the rows – hidden columns are left out.

Regroup at runtime – no new model, so no framework wrapper rebuilds the table; expanded groups, filter, sorting and
checked rows stay:

```ts
import { TableApi } from "@guiexpert/table";

declare const tableApi: TableApi;                 // from tableReady
const select = document.createElement("select");  // options "region", "produkt", "region,produkt", ""
select.addEventListener("change", () => tableApi.setRowGroupBy(select.value ? select.value.split(",") : []));
```

Read the groups (e.g. for a chart) – `getGroups()`, `findGroup(path)`, `getRowGroup(rowIndex)`, `getTotals()`:

```ts
import { AreaModelRowGroups, TableModelIf } from "@guiexpert/table";

declare const tableModel: TableModelIf;
const body = tableModel.getBodyModel() as AreaModelRowGroups<{ region: string; umsatz: number }>;
const perRegion = body.getGroups().map(g => ({ region: g.label, umsatz: g.results["umsatz"], rows: g.count }));
```

Without a table, the engine groups and aggregates any array: `groupRows(rows, ["region"])` +
`aggregateRowGroups(groups, { umsatz: "avg" })`.

Not included: a group panel to drag columns into (build it with `setRowGroupBy`), Excel outline levels, pivot tables.

---

## 6. Features

### 6.1 Cell renderers

Built-in renderers (all in `@guiexpert/table`): `NumberCellRenderer`, `PositiveAndNegativeNumberRenderer`,
`ProgressBarCellRenderer`, `NumberCellProgressBarCellRenderer`, `StarRatingCellRenderer`, `TrueFalseCellRenderer`,
`CheckboxBooleanPropertyCellRenderer`, `DateToLocaleDateCellRenderer`, `DateToIsoCellRenderer`,
`MaleFemaleToIconCellRenderer`, `SimpleArrayCellRenderer`, `ActionsCellRenderer`, edit renderers
`InputCellRenderer` and `SelectCellRenderer`.

Own renderer – implement `CellRendererIf`; you get the cell `<div>` and full control over its content:

```ts
import { AreaIdent, AreaModelIf, CellRendererIf, DomServiceIf, RendererCleanupFnType, escapeHtml } from "@guiexpert/table";

export class TrafficLightRenderer implements CellRendererIf {
  render(
    cellDiv: HTMLDivElement,
    _rowIndex: number,
    _columnIndex: number,
    _areaIdent: AreaIdent,
    _areaModel: AreaModelIf,
    cellValue: any,
    _domService: DomServiceIf): RendererCleanupFnType | undefined {
    const color = cellValue > 80 ? "#36BB6C" : cellValue > 40 ? "#f5b400" : "#e00034";
    cellDiv.innerHTML = `<span style="color:${color}">●</span> ${escapeHtml(cellValue)}`;
    return undefined;   // optionally return a cleanup function (called before the cell is re-rendered)
  }
}
```

Data written into `innerHTML` must go through `escapeHtml()` (or be set as text, e.g. `textContent`) – otherwise a
value like `<img src=x onerror=…>` from your server becomes markup and runs (HTML injection). The built-in renderers
and the CRUD dialogs escape their values.

Use it with `ColumnDef.create({ property: "score", headerLabel: "Score", bodyRenderer: new TrafficLightRenderer() })`
or per cell by overriding `getCellRenderer(rowIndex, columnIndex)` in your area model.

**Framework components as renderers**

| Framework | How |
|---|---|
| React / Preact / Solid / Svelte | `bodyRenderer: new ComponentRendererWrapper(MyComponent)` (import from the wrapper package). The component receives `rowIndex`, `columnIndex`, `areaIdent`, `areaModel`, `cellValue`. |
| Vue 3 | `new ComponentRendererWrapper(MyComponent, appContext)` – `appContext` from `getCurrentInstance()?.appContext`. |
| Angular | Inject `RenderWrapperFactory` and use `this.rwf.create(MyComponent, this.cdr)`; the component implements `ComponentRendererIf<T>` (`setData(rowIndex, columnIndex, areaIdent, areaModel, cellValue)`). |

### 6.2 Sorting

Columns are sortable by clicking the header when `sortable` returns `true`:

```ts
import { ColumnDef, TrueFn, px120 } from "@guiexpert/table";

const ageColumn = ColumnDef.create({
  property: "age",
  headerLabel: "Age",
  width: px120,
  sortable: TrueFn,
  sortComparator: (a: number, b: number) => a - b,   // optional, receives (valueA, valueB, rowA, rowB)
  sortState: "asc"                                     // optional initial state: "asc" | "desc" | ""
});
```

The user sorts with a **double click** on the column header (asc → desc → asc …). From code – e.g. from your own
button – use `tableApi.sortByColumn("age", "desc")` (since 1.1.90): same result as the double click, including the
header icon; without the second argument it toggles like the header.

Programmatically with a comparator: `tableApi.sort((a, b) => a.age - b.age)` or `tableApi.reSort()` (re-apply the current sorting,
e.g. after data changes); both repaint the table (since 1.1.86 – before, the new order only appeared after scrolling). Header sort icons are configured with `tableOptions.sortedOptions`.

### 6.3 Filtering

Filtering is done with an external filter function – the UI (input field, slider, …) is yours:

```ts
import { TableApi, TableOptions, TableOptionsIf } from "@guiexpert/table";

let searchText = "";
let tableApi: TableApi | undefined;          // from tableScope.getApi() or the tableReady event

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  externalFilterFunction: (row: any) =>
    !searchText || JSON.stringify(row).toLowerCase().includes(searchText)
};

function onSearchInput(value: string) {
  searchText = value.toLowerCase();
  tableApi?.externalFilterChanged();   // re-applies the filter, scrolls to top and repaints
}
```

The current sort order survives a filter change (since 1.1.88): the last `tableApi.sort(fn)` or the header sort
(columns with a `sortState`) is applied again to the filtered rows.

Showcases: *Input filter*, *ID filter* and *Slider filter* on https://gui.expert/showcase.

### 6.4 Selection, focus and keyboard

```ts
import { SelectionModel, TableOptions, TableOptionsIf } from "@guiexpert/table";

const selectionModel = new SelectionModel("row", "multi");   // type: "none" | "cell" | "row" | "column" | "range"
                                                              // mode: "single" | "multi"
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => selectionModel
};
```

- Without `getSelectionModel` / `getFocusModel` every table creates its **own** models (since 1.1.90; before, all
  tables without them shared one selection and focus). The default selection type is `"none"`.
- Mouse: click = focus (and a new selection), shift-click = range from the last click, Ctrl/⌘-click = toggle the
  cell (row/column for those types; mode `"multi"` keeps the rest of the selection), Ctrl/⌘+Alt-click = remove the
  cell, drag over body cells = range (type `"range"`, since 1.1.88).
- Ctrl/⌘+A selects all (not for type `"none"`), Ctrl/⌘+C then copies the displayed body – at most
  `CopyService.maxCopyCells` cells (default 1,000,000; larger selections are not copied).
- `selectionModel.getMergedRowIndices(rowCount)` returns the sorted indices of all rows with a selected cell (pass
  the row count when whole columns can be selected).
- Events: `selectionChanged` (payload `SelectionModelIf`) and `focusChanged` (payload `FocusModelIf`).
- API: `tableApi.clearSelection()`, `tableApi.setSelectionModel(new SelectionModel("cell", "single"))`,
  `tableApi.getSelectionModel()`.
- Since 1.1.94: `tableApi.getSelectionAggregates()` returns `{ count, numericCount, sum, avg, min, max, capped }` of the
  selected body cells (visible data columns; numbers only for sum/avg/min/max). Above
  `SelectionAggregator.maxCells` (default 1,000,000) nothing is computed (`capped: true`). A status bar like in a
  spreadsheet:

```ts
import { EventAdapter, SelectionModel, TableApi, formatAggregateValue } from "@guiexpert/table";

declare const tableApi: TableApi;                       // from tableReady / scope.getApi()
const statusBar = document.querySelector<HTMLDivElement>("#status")!;
const selectionModel = new SelectionModel("range", "multi");
const listener = new EventAdapter();                    // the eventListener of the table
listener.onSelectionChanged = () => {
  const a = tableApi.getSelectionAggregates();
  statusBar.textContent = a.capped ? "Selection too large"
    : a.numericCount ? `Count ${a.count} · Sum ${formatAggregateValue(a.sum)} · Average ${formatAggregateValue(a.avg)}`
    : a.count ? `Count ${a.count}` : "";
};
```

- Keyboard shortcuts (copy, select all, navigation, start editing) – see `tableApi.getShortcutActionMapping()`;
  override with `tableOptions.shortcutActionIdMapping` or disable with `shortcutActionsDisabled: true`.
  Action ids: `COPY_2_CLIPBOARD`, `START_EDITING`, `TOGGLE_SELECTION`, `SELECT_ALL`, `DESELECT_ALL`,
  `NAVIGATE_LEFT/RIGHT/UP/DOWN`, since 1.1.91 also `NAVIGATE_ROW_START/ROW_END/FIRST_CELL/LAST_CELL/PAGE_UP/PAGE_DOWN`
  and `ACTIVATE_CELL` (keys: 6.14); trigger them with `tableApi.triggerAction("SELECT_ALL")`.

### 6.5 Events

| Event | Payload | Notes |
|---|---|---|
| `tableReady` | `TableApi` | once, after the first render |
| `mouseClicked` | `GeMouseEvent` (`rowIndex`, `columnIndex`, `areaIdent`, `clickCount`, `originalEvent`) | debounced in Angular and Vue (`debounceMouseClickDelay`, default 150 ms) |
| `mouseMoved`, `contextmenu`, `mouseDragging`, `mouseDraggingEnd` | `GeMouseEvent` | Angular names the last one `mouseDraggingEnded` |
| `checkboxChanged` | `any[]` (checked rows) | tree/row checkboxes |
| `modelChanged` | `GeModelChangeEvent` | e.g. after inline editing |
| `selectionChanged` / `focusChanged` | `SelectionModelIf` / `FocusModelIf` | |
| `scroll` | `GeScrollEvent` | not forwarded by the React wrapper |

### 6.6 Tree table and checkboxes

```ts
import { TableFactory, TreeFactory, ColumnDef, px120, px220 } from "@guiexpert/table";

interface PersonIf { lastName: string; preName: string; friends?: PersonIf[]; }

const data: PersonIf[] = [
  { lastName: "Miller", preName: "Ann", friends: [{ lastName: "Smith", preName: "Bob" }] }
];

const tree = TreeFactory.buildTreeRows<PersonIf>(data, "friends");   // "friends" = children property
// start collapsed (since 1.1.90) – expanded: boolean or (row, deep) => boolean, default true:
// TreeFactory.buildTreeRows<PersonIf>(data, { childrenProperty: "friends", expanded: false });

const tableModel = TableFactory.createTableModel({
  rows: tree,                                                          // TreeRow[] → tree area model
  columnDefs: [new ColumnDef("lastName", "Last Name", px220), new ColumnDef("preName", "Pre Name", px120)]
});
```

Row checkboxes in a tree: set `showCheckboxWihoutExtraColumn: true` in the options (checkbox inside the first
column) and listen to `checkboxChanged`. Arrow icons are configured with `tableOptions.treeOptions`.

Filtering a tree (`externalFilterFunction` + `tableApi.externalFilterChanged()`): the function receives the `TreeRow`
(use `row.data`) and is checked for **every** node, also below collapsed nodes. A node is shown if it or one of its
descendants matches and all its parents are expanded – the ancestors of a match stay visible (a collapsed ancestor
stays collapsed). The filter stays active when nodes are expanded, collapsed or sorted (since 1.1.91).
Expanding from code: set `treeRow.expanded = true`, then `treeAreaModel.recalcVisibleTreeRows()` and
`tableApi.repaintHard()`.
Showcases: *Tree table*, *Tree table with row checkbox*.

### 6.7 Inline editing

```ts
import {
  ColumnDef, DateToLocaleDateCellRenderer, SelectCellRenderer, ValueLabel,
  editInputPipeForNumber, px200
} from "@guiexpert/table";

const columnDefs = [
  ColumnDef.create({ property: "title", headerLabel: "Title", width: px200, editable: () => true }),
  ColumnDef.create({ property: "amount", headerLabel: "Amount", width: px200, editable: () => true,
    editInputPipe: editInputPipeForNumber }),                       // converts the input to a number
  ColumnDef.create({ property: "dueDate", headerLabel: "Due", width: px200, editable: () => true,
    bodyRenderer: new DateToLocaleDateCellRenderer() }),
  ColumnDef.create({ property: "priority", headerLabel: "Priority", width: px200, editable: () => true,
    getEditRenderer: () => new SelectCellRenderer([
      new ValueLabel("low", "Low"), new ValueLabel("high", "High")
    ]) })
];
```

Editing starts with a double click or the `START_EDITING` shortcut (F2); changes are written into the row objects and
reported via `modelChanged`. Since 1.1.89 this also works on cells with a renderer or a framework component, the
editor keeps the focus, and table shortcuts are ignored while typing in it.

### 6.8 Rowspan and colspan

Override `getRowspanAt` / `getColspanAt` in your area model:

```ts
import { AreaModelArrayOfArrays } from "@guiexpert/table";

class SpanModel extends AreaModelArrayOfArrays<string> {
  override getRowspanAt(rowIndex: number, columnIndex: number): number {
    return rowIndex % 4 === 0 && columnIndex === 0 ? 4 : 0;
  }
  override getColspanAt(rowIndex: number, columnIndex: number): number {
    return rowIndex % 10 === 1 && columnIndex === 2 ? 3 : 0;
  }
}
// new SpanModel("body", data, 34) as bodyAreaModel in TableFactory.createTableModel(...)
```

Multi-row header groups (open/close-able) are built with `AreaModelCellGroups`; see
`createTeamHeadergroupModel()` in `@guiexpert/demo-table-models`.

### 6.9 Live data updates

```ts
import { TableApi, TableCellUpdateEvent } from "@guiexpert/table";

function onPriceTick(tableApi: TableApi, row: number, col: number, price: number) {
  tableApi.updateCells([
    new TableCellUpdateEvent("body", row, col, price, { "ge-table-color-error": price < 0 })
  ]);                                   // writes into the model and re-renders only this cell
}
```

`tableApi.updateCells([], true)` repaints everything. Showcases: *Render speed* (fps), *Time table*, *Crypto*.
A footer from `footerAggregates` (5.4) is recomputed after `updateCells()`; after changing row objects yourself call
`tableApi.repaint()`.

### 6.10 Export: clipboard and Excel

```ts
import { AreaModelObjectArray, ExcelService, TableApi } from "@guiexpert/table";

interface PersonIf { name: string; city: string; }

function exportTable(tableApi: TableApi) {
  tableApi.copyToClipboard();                         // selected cells (or the focused cell) as text, hidden columns skipped
  tableApi.downloadExcel("persons.xlsx", "Marc");     // what the table shows: header, body, footer – no extra library
}

function exportAllRows(tableApi: TableApi) {          // all rows, ignoring filter and sorting
  const body = tableApi.getBodyModel() as AreaModelObjectArray<PersonIf>;
  const matrix = [["Name", "City"], ...body.getAllRows().map(p => [p.name, p.city])];
  new ExcelService().downloadExcel(matrix, "all-persons.xlsx", "Marc");
}
```

- `downloadExcel()` exports **the current view**: only the rows that pass `externalFilterFunction`, in the current
  sort order, plus header and footer rows (values from `getValueAt`, i.e. raw values, not the rendered HTML).
  Hidden columns (`isVisible: () => false`) are left out (since 1.1.88).
- Any other data (all rows, other columns, a selection) → build a matrix and pass it to `ExcelService.downloadExcel()`.
- Since 1.1.90 the file is compressed (DEFLATE via the browser's `CompressionStream`, no library; ~10× smaller) and
  both `downloadExcel()` methods return a `Promise<void>`. `new ExcelService().createExcelBlob(matrix)` returns the
  file as a `Blob`, e.g. for an upload.
- Numbers stay numbers in Excel; dates are written as ISO text. Since 1.1.86 the files carry valid CRC-32 checksums,
  row numbers and sheet dimensions (older versions wrote CRC 0 and a fixed range `A1:B3`, which strict readers reject).

### 6.11 Persisting state: column layout, sorting, selection (since 1.1.92 complete)

**In `localStorage`** – switch on what the table should remember; one key per table:

```ts
import { AutoRestoreOptions, TableOptions } from "@guiexpert/table";
import type { TableOptionsIf } from "@guiexpert/table";

interface Order { id: number; customer: string; total: number }

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<Order>(),
    getStorageKeyFn: () => "orders",                 // stored as "orderstableState"
    getRowId: (order: Order) => order.id,            // rows (tree nodes) are stored by id
    autoRestoreColumnLayout: true,                   // widths, order, visibility (1.1.92)
    autoRestoreHeaderGroupState: true,               // collapsed header groups (1.1.92)
    autoRestoreSortingState: true,
    autoRestoreScrollPosition: true,
    autoRestoreCollapsedExpandedState: true,         // tree tables
    autoRestoreCheckedState: true,                   // checked rows (1.1.92)
    autoRestoreSelectedState: true                   // selection (1.1.92)
  }
};
```

| Flag | Remembers |
|---|---|
| `autoRestoreColumnLayout` | width (only of resized columns), order and visibility (`setColumnVisible`) – by property |
| `autoRestoreHeaderGroupState` | collapsed / expanded header groups (`CellGroupIf.id` or the label path, e.g. `"Customer"`) |
| `autoRestoreSortingState` | sorted columns – by property (before 1.1.92 by index: a moved column sorted the wrong column) |
| `autoRestoreScrollPosition` | scroll position plus the id of the first visible row (new rows above it are no problem) |
| `autoRestoreCollapsedExpandedState` | expanded tree nodes – by `getRowId` |
| `autoRestoreCheckedState` | checked rows – by `getRowId`, also when the data arrives in another order |
| `autoRestoreSelectedState` | selection: rows by id, columns by property; restored in the current row order |
| `autoRestoreCustomState` | your data from `tableApi.setCustomState(…)`, e.g. a filter text |

- Nothing is stored without `getStorageKeyFn` (the table warns once when a flag is set without it).
- `storage: sessionStorage` (or an own `StateStorageIf` with `getItem/setItem/removeItem`) instead of `localStorage`.
- The state is written once, 300 ms after the last change (`tableOptions.stateChangedDebounceDelay`), never per
  scroll frame. A blocked storage (private mode) does not break the table.
- Tables before 1.1.92 stored three keys (`<key>sortingState`, `<key>scrollState`, `<key>collapsedExpandedState`).
  They are read once (sort index → property of the default column order) and removed with the next save.
- Models without row objects (e.g. an own `AreaModel` for millions of rows): use
  `getRowId: (_row, rowIndex) => rowIndex`, otherwise checked and selected rows are not stored.
- **Privacy:** the state holds no cell values – only properties, widths, sort states and row ids. Ids can be personal
  data (an e-mail address as id). Rows without `id`/`uuid` and without an own `getRowId` are not stored (the table
  warns once) – before 1.1.92 the JSON of the whole row was used as id.
- `resetState()` and `sort: []` clear the sort icons, the rows keep their current order.

**State API – e.g. on your server per user.** `getState()` returns the same state as JSON, `applyState()` applies it,
`initialState` starts with it, `onStateChanged` reports every change (debounced, not while the table is built):

```ts
import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";
import type { GeStateChangeEvent, TableOptionsIf, TableStateIf } from "@guiexpert/table";

async function createOrderTable(host: HTMLDivElement, orders: object[]) {
  const saved = (await (await fetch("/api/prefs/orders")).json()) as TableStateIf | null;
  const tableOptions: TableOptionsIf = { ...new TableOptions(), initialState: saved ?? undefined };

  const listener = new EventAdapter();
  listener.onStateChanged = (evt: GeStateChangeEvent) => {
    void fetch("/api/prefs/orders", { method: "PUT", body: JSON.stringify(evt.state) });
  };
  const tableModel = TableFactory.createTableModel({ rows: orders, tableOptions });
  const api = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener).firstInit().getApi();

  api.getState(["columns", "sort"]);                                   // only some parts
  api.applyState({ sort: [{ property: "total", sortState: "desc" }] }); // missing parts stay as they are
  api.setHeaderGroupCollapsed("Customer", true);
  return api;                                                           // api.resetState(): back to the code
}
```

Framework wrappers report it as `stateChanged` (React/Preact/Solid callback prop, Vue `@stateChanged`, Svelte
`on:stateChanged` / `onStateChanged`, Angular `(stateChanged)`, Web Component `CustomEvent "stateChanged"`). A stored
state (`autoRestoreOptions`) wins over `initialState`, part by part.

### 6.12 Look & feel

All colors are CSS variables (light and dark theme via `html[data-theme="light" | "dark"]`). Override them in
your own stylesheet:

```css
html {
  --ge-table-bg: #fff;
  --ge-table-header-center-bg: #1e293b;
  --ge-table-header-center-text: #f8fafc;
  --ge-table-row-odd-bg: #f8fafc;          /* zebra rows */
  --ge-table-row-even-bg: #ffffff;
  --ge-table-hover-row-bg: rgba(54, 187, 108, 0.12);
  --ge-table-body-center-selected-range-bg: rgba(54, 187, 108, 0.25);
}
```

Per-cell styling: `getCustomClassesAt` / `getCustomStyleAt` in the area model, or CSS classes in the column
definition. Showcase: *Look and Feel* (https://gui.expert/showcase/laf).

### 6.13 Other useful API methods

`scrollToIndex(col, row)`, `scrollToPixel(x, y)`, `ensureRowIsVisible(row)`, `getFirstVisibleRowIndex()`,
`getLastVisibleRowIndex()`, `getDisplayedRowCount()`, `autoResizeColumns()`, `setColumnWidth(col, width)`,
`recalcColumnWidths()`, `repaint()`, `repaintHard()`, `getTableModel()`, `getBodyModel()`, `setLoggingActive(true)`,
`destroy()` (since 1.1.86 – releases listeners, observers and cell renderers before you drop or replace the table).

Since 1.1.91: `scrollToIndex(col, row)` also scrolls horizontally to the column (a fixed west column scrolls back to the
start, `-1` keeps the horizontal position); `setColumnVisible(column, visible)` (index, property or column definition;
showing it again restores the previous width), `isColumnVisible(column)`, `setHeaderVisible(visible)`,
`setFooterVisible(visible)`, `isHeaderVisible()`, `isFooterVisible()`, `ensureColumnIsVisible(col)` (scrolls
horizontally only if needed – the counterpart of `ensureRowIsVisible`; the arrow keys use both and skip hidden columns).

### 6.14 Accessibility: screen readers and keyboard (since 1.1.91)

The table follows the WAI-ARIA pattern **grid** (a tree body: **treegrid**) and is tested with axe-core
(WCAG 2.1 A/AA). Nothing to switch on – give the table a name and, if you like, your own texts:

```ts
import { TableOptions, TableOptionsIf } from "@guiexpert/table";

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  ariaLabelledBy: "orders-title",                    // id of a visible heading – or ariaLabel: "Orders"
  ariaDescribedBy: "orders-hint",                    // optional
  ariaTexts: {                                       // optional, English defaults (AriaTexts)
    filtered: (rowCount: number) => `${rowCount} Zeilen`,
    copied: (cellCount: number) => `${cellCount} Zellen kopiert`,
  },
};
```

**What screen readers get**

| | |
|---|---|
| Grid | `role="grid"`/`"treegrid"`, name, `aria-rowcount` (header + **all** body rows + footer – not only the rendered ones), `aria-colcount` (shown columns), `aria-multiselectable` for a `"multi"` selection model |
| Rows / cells | `role="row"` + `aria-rowindex`; `columnheader`/`gridcell` + `aria-colindex`, `aria-colspan`/`aria-rowspan`; fixed columns: the row divs of west, center and east share the `aria-rowindex` |
| Focus | the table is **one** tab stop; the focused cell is announced via `aria-activedescendant` (Tab into the table focuses the first visible cell) |
| Sorting | `aria-sort` on sortable headers; announcement "Sorted by Total, descending" |
| Selection | `aria-selected` on cells (cell/range/column selection) or rows (row selection) |
| Tree | `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` (with a filter only the shown siblings count) |
| Checkboxes | named "Select row 5" / "Select all rows"; partly checked = native `indeterminate` ("mixed") |
| Header groups | the toggle is a button "Collapse group Q1" with `aria-expanded` |
| Editor | the input is named after the column; Escape closes it and the focus returns to the table |
| Announcements | a polite live region (in `document.body`, removed by `destroy()`): sorting, filter result ("42 rows"), copy ("12 cells copied"), select all; own messages with `tableApi.announce("Orders loaded")`. Inside a modal dialog (`aria-modal="true"`) screen readers ignore it – use a live region of your own there |
| Decoration | borders, hover, focus frame, drag ghost, resize handles, icons: `aria-hidden="true"` |

**Keyboard** (WAI-ARIA grid; change it with `shortcutActionIdMapping`)

| Key | Action |
|---|---|
| ← → ↑ ↓ | move the focus cell (hidden columns are skipped); ↑ in the first row moves into the header, ↓ back |
| Home / End (macOS also ⌘← / ⌘→) | first / last cell of the row |
| Ctrl+Home / Ctrl+End (macOS also ⌘↑ / ⌘↓) | first cell of the first row / last cell of the last row |
| Page Up / Page Down | one page up / down |
| Enter | body: toggle the row checkbox, otherwise expand/collapse the tree row · header: open/close a group, otherwise sort |
| Space | toggle the selection of the focus cell |
| F2 / Escape | start / cancel editing |
| Ctrl/⌘+A, Ctrl+Shift+A, Ctrl/⌘+C | select all, clear, copy |

`tableApi.getHeaderFocus()` returns the header cell with the keyboard focus (the `FocusModel` holds the body focus only).

**Your own cell renderers and framework components**

- The cell div already has `role="gridcell"` – never change its role.
- Text in the cell is read. A purely visual statement (icon, bar, color) needs a text: `role="img"` + `aria-label`, or
  hidden text with the class `ge-table-sr-only`. The built-in progress bar, star, true/false and male/female renderers
  do this (texts via an optional constructor parameter, e.g. `new StarRatingCellRenderer("rating", n => n + " von 5")`).
- Controls (button, link, input) need a name (`aria-label`) and `tabindex="-1"` – the table is one tab stop (the
  built-in checkboxes and action buttons do this; keys pressed on a focused button or link belong to it).
- Never write data unescaped into `innerHTML` (`escapeHtml()`), also not into `aria-label="…"`.
- Tooltips (`getTooltipAt`) stay `title` attributes: screen readers read them as the cell's description; sighted
  keyboard users do not see them (known limitation).

**Focus and contrast:** the focused cell has a 2 px frame; the keyboard focus ring of the table is a 2 px outline.
Both use `--ge-table-focus-outline-color` (falls back to `--ge-table-focus-border`). The default light and dark themes
pass the axe contrast check (since 1.1.91 the light star and progress bar colors are darker: ≥ 3 : 1).

**Test protocol for your release** (screen readers cannot run in CI): NVDA + Firefox, NVDA + Chrome, JAWS + Chrome,
VoiceOver + Safari – tab into the table, arrow through cells (row/column numbers and headers are announced), sort with
Enter in the header, filter and copy (announcements), expand a tree node, open the editor with F2.

### 6.15 Loading and empty table: overlays (since 1.1.92)

Three overlays lie over the **body** (header and footer stay readable). They are plain HTML and CSS – the spinner is a
CSS animation, no image, no library:

| Overlay | When | Default text |
|---|---|---|
| `"loading"` | `tableApi.showLoadingOverlay()` until `tableApi.hideOverlay()` | `Loading…` |
| `"noRows"` | the body has no rows (automatic), or `tableApi.showNoRowsOverlay()` | `No rows to show` |
| `"noMatches"` | the body has rows, but `externalFilterFunction` hides all of them (automatic) | `No matching rows` |

Loading data with `fetch`:

```ts
import { EventAdapter, SimpleDomService, TableFactory, TableOptions, TableScope } from "@guiexpert/table";

interface Order { id: number; customer: string; total: number }

async function showOrders(host: HTMLDivElement) {
  const tableModel = TableFactory.createTableModel({ rows: [] as Order[], properties: ["id", "customer", "total"] });
  const tableScope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
  tableScope.firstInit();
  const tableApi = tableScope.getApi();

  tableApi.showLoadingOverlay();            // spinner + "Loading…", aria-busy on the table
  try {
    const orders: Order[] = await (await fetch("/api/orders")).json();
    tableApi.setRows(orders);
    tableApi.repaintHard();                 // the row count changed
  } finally {
    tableApi.hideOverlay();                 // 0 rows? "No rows to show" appears by itself
  }
}
```

- `tableApi.hideOverlay()` ends only what the API showed. "No rows to show" / "No matching rows" describe the body and
  stay as long as it is empty – switch them off with `overlayOptions: { autoNoRows: false }`.
- `tableApi.getOverlayState()` returns `"none"`, `"loading"`, `"noRows"` or `"noMatches"`.
- While loading, the table ignores mouse events and editing on the body (keyboard navigation, copying and the header
  still work; the page still gets the clicks, e.g. for "click outside closes the menu");
  `blockInteractionWhileLoading: false` keeps the table usable under a semi-transparent layer.
- "No matching rows" needs the optional `AreaModelIf.getUnfilteredRowCount()` (object arrays and trees have it). Own
  area models without it get "No rows to show".

Texts, delay and own content:

```ts
import type { GeOverlayKind, TableOptionsIf } from "@guiexpert/table";
import { TableOptions } from "@guiexpert/table";

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  overlayOptions: {
    loadingText: "Lädt…",
    noRowsText: "Keine Bestellungen",
    noMatchesText: "Keine Treffer",
    loadingDelayInMs: 200,                  // fast answers show no spinner at all
    getOverlayElement: (kind: GeOverlayKind, text: string) => {
      if (kind !== "noRows") return undefined; // built-in content for the others
      const div = document.createElement("div");
      div.textContent = `📭 ${text}`;
      return div;
    },
  },
};
```

Texts are always written as text (never as HTML). The overlay is `aria-hidden`; screen readers hear the texts through
the live region of the table (6.14), and the table has `aria-busy="true"` while loading. Put no buttons or links into
an own overlay element.

**Framework wrappers** have a `loading` prop that shows/hides the loading overlay **without** re-creating the table.
`loading={false}` only ends an overlay the prop showed – one your code shows with `tableApi.showLoadingOverlay()` (e.g. in
`tableReady`) stays until your `hideOverlay()`:

```tsx
<GuiexpertTable tableModel={tableModel} tableOptions={tableOptions} loading={isLoading} />   {/* React, Preact, Solid */}
```
```html
<GuiexpertTable :tableModel="tableModel" :loading="isLoading" />                      <!-- Vue 3 -->
<GuiexpertTable {tableModel} loading={isLoading} />                                   <!-- Svelte -->
<guiexpert-table [tableModel]="tableModel" [loading]="isLoading"></guiexpert-table>   <!-- Angular -->
<guiexpert-table loading></guiexpert-table>   <!-- Web Component: attribute or el.loading = true -->
```

**Look:** CSS variables `--ge-table-overlay-bg`, `--ge-table-overlay-color`, `--ge-table-spinner-color`,
`--ge-table-spinner-track-color`, `--ge-table-spinner-size` (light and dark theme); classes `.ge-table-overlay`,
`.ge-table-overlay-loading`, `.ge-table-overlay-no-rows`, `.ge-table-overlay-no-matches`, `.ge-table-spinner`,
`.ge-table-overlay-text`. With `prefers-reduced-motion: reduce` the spinner does not turn.

`CrudTableModelFactory` shows the loading overlay while its requests run (view, edit, clone, create, delete).

---

## 7. Not available yet

To avoid surprises – these are **not** implemented in the current releases:

- No built-in filter UI, context menu, pagination or row drag & drop – build them with the events
  (`contextmenu`, `mouseClicked`) and `externalFilterFunction`.
- No pivot tables and no drag & drop group panel – row grouping itself is built in (5.6), regroup with
  `tableApi.setRowGroupBy()`.
- No server-side row model yet; for huge remote data sets implement your own `AreaModel` (see 5.5).

---

## 8. Links

- Showcases: https://gui.expert/showcase
- Getting started per framework: https://gui.expert/getstarted
- API reference: https://gui.expert/api
- Source: https://github.com/guiexperttable

## License

**Current releases: MIT License.** All currently published versions are free to use, modify and distribute – also
in commercial and proprietary applications. **Future releases: possible dual licensing** – versions already released
under MIT remain MIT. Details: https://gui.expert/license/
