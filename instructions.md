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

Events are dispatched as bubbling `CustomEvent`s with the payload in `detail`: `tableReady`, `mouseClicked`,
`mouseMoved`, `contextmenu`, `mouseDragging`, `mouseDraggingEnd`, `checkboxChanged`, `modelChanged`,
`selectionChanged`, `focusChanged`, `scroll`.

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

export function SimpleTable() {
  return (
    <div class="table-div">
      <GuiexpertTable
        tableModel={tableModel}
        tableOptions={new TableOptions()}
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

export function SimpleTable() {
  return (
    <div class="table-div">
      <GuiexpertTable
        tableModel={generateSimpleModel(1000, 100)}
        tableOptions={new TableOptions()}
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

### 5.4 Footer with totals of the displayed rows

`footerData` (5.3) is static text. A footer that follows filter and sorting is a small area model that computes its
cells from the rows the body currently shows (`getFilteredRows()` = after `externalFilterFunction`, in display order).
The footer is repainted with every `externalFilterChanged()`, `sort()` and `repaint()`:

```ts
import { AreaModel, AreaModelObjectArray, ColumnDef, TableFactory, TableOptions, TableOptionsIf, px120 } from "@guiexpert/table";

interface OrderIf { id: number; city: string; total: number; }

class OrderTotalsFooterModel extends AreaModel {
  constructor(private readonly getBody: () => AreaModelObjectArray<OrderIf>) {
    super();
    this.areaIdent = "footer";
  }
  override getRowCount(): number { return 1; }
  override getRowHeight(_rowIndex: number): number { return 34; }
  override getValueAt(_rowIndex: number, columnIndex: number): any {
    const rows = this.getBody().getFilteredRows();          // only the rows that pass the filter
    if (columnIndex === 1) return rows.length + " orders";
    if (columnIndex === 2) return rows.reduce((sum, o) => sum + o.total, 0);
    return "Σ";
  }
}

let city = "";
const orders: OrderIf[] = [{ id: 1, city: "Berlin", total: 20 }, { id: 2, city: "Hamburg", total: 10 }];
const tableOptions: TableOptionsIf = { ...new TableOptions(), externalFilterFunction: (o: OrderIf) => !city || o.city === city };
const tableModel = TableFactory.createTableModel({
  rows: orders,
  columnDefs: [new ColumnDef("id", "ID", px120), new ColumnDef("city", "City", px120), new ColumnDef("total", "Total", px120)],
  tableOptions,
  footerAreaModel: new OrderTotalsFooterModel(() => tableModel.getBodyModel() as AreaModelObjectArray<OrderIf>)
});
```

`tableApi.downloadExcel()` exports this footer row as well (6.10).

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
import { AreaIdent, AreaModelIf, CellRendererIf, DomServiceIf, RendererCleanupFnType } from "@guiexpert/table";

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
    cellDiv.innerHTML = `<span style="color:${color}">●</span> ${cellValue}`;
    return undefined;   // optionally return a cleanup function (called before the cell is re-rendered)
  }
}
```

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

Programmatically: `tableApi.sort((a, b) => a.age - b.age)` or `tableApi.reSort()` (re-apply the current sorting,
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

- Mouse: click = focus, shift-click = range from the last click, Ctrl/⌘-click = add a cell (mode `"multi"`),
  drag over body cells = range (type `"range"`, since 1.1.88).
- Events: `selectionChanged` (payload `SelectionModelIf`) and `focusChanged` (payload `FocusModelIf`).
- API: `tableApi.clearSelection()`, `tableApi.setSelectionModel(new SelectionModel("cell", "single"))`,
  `tableApi.getSelectionModel()`.
- Keyboard shortcuts (copy, select all, navigation, start editing) – see `tableApi.getShortcutActionMapping()`;
  override with `tableOptions.shortcutActionIdMapping` or disable with `shortcutActionsDisabled: true`.
  Action ids: `COPY_2_CLIPBOARD`, `START_EDITING`, `TOGGLE_SELECTION`, `SELECT_ALL`, `DESELECT_ALL`,
  `NAVIGATE_LEFT/RIGHT/UP/DOWN`; trigger them with `tableApi.triggerAction("SELECT_ALL")`.

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

const tableModel = TableFactory.createTableModel({
  rows: tree,                                                          // TreeRow[] → tree area model
  columnDefs: [new ColumnDef("lastName", "Last Name", px220), new ColumnDef("preName", "Pre Name", px120)]
});
```

Row checkboxes in a tree: set `showCheckboxWihoutExtraColumn: true` in the options (checkbox inside the first
column) and listen to `checkboxChanged`. Arrow icons are configured with `tableOptions.treeOptions`.
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

Editing starts with a double click or the `START_EDITING` shortcut; changes are written into the row objects and
reported via `modelChanged`.

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
- Numbers stay numbers in Excel; dates are written as ISO text. Since 1.1.86 the files carry valid CRC-32 checksums,
  row numbers and sheet dimensions (older versions wrote CRC 0 and a fixed range `A1:B3`, which strict readers reject).

### 6.11 Persisting state

```ts
import { AutoRestoreOptions, TableOptions } from "@guiexpert/table";

const tableOptions = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<any>(),
    getStorageKeyFn: () => "my-person-table",        // key in localStorage
    autoRestoreScrollPosition: true,
    autoRestoreSortingState: true,
    autoRestoreCollapsedExpandedState: true          // tree tables
  }
};
```

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

---

## 7. Not available yet

To avoid surprises – these are **not** implemented in the current releases:

- `tableApi.setColumnVisible()`, `setHeaderVisible()`, `setFooterVisible()` exist but are empty stubs.
  To hide a column, give its column definition `isVisible: () => false` (width becomes 0).
- No built-in filter UI, context menu, pagination or row drag & drop – build them with the events
  (`contextmenu`, `mouseClicked`) and `externalFilterFunction`.
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
