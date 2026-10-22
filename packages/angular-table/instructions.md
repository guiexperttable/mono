# GuiExpert Table for Angular (14 – 22 and later)

How to use `@guiexpert/table` and `@guiexpert/angular-table` in Angular applications. The major version of
`@guiexpert/angular-table` equals your Angular major (`@guiexpert/angular-table@^22.0.0` for Angular 22, `^17.0.0` for
Angular 17, …). The examples use current Angular syntax: `@if` needs Angular 17+, self-closing component tags 15.1+;
on older versions use `*ngIf` and explicit closing tags.

> **Source of truth:** every API used here exists in the source code of the
> [mono repo](https://github.com/guiexperttable/mono): `packages/angular-table/src` (Angular wrapper) and
> `packages/table/src` (core).
> The framework-independent guide with all core features is
> [instructions.md](https://github.com/guiexperttable/mono/blob/main/instructions.md);
> working Angular examples are in [apps/angular-table-demo](https://github.com/guiexperttable/mono/tree/main/apps/angular-table-demo).

---

## 1. Installation

```bash
npm install @guiexpert/table @guiexpert/angular-table@^<your Angular major>.0.0
```

No extra stylesheet is needed: the component (all versions built from the mono repo) ships the complete styles of the core library (CSS variables and
`ge-table-*` classes, `ViewEncapsulation.None`). Override colors in your global `styles.css` (see section 13).

The table fills its host element – give it a height:

```css
.table-div {
  display: block;
  height: 500px;
  width: 100%;
}
```

---

## 2. The component

`@guiexpert/angular-table` exports a **standalone** component:

| | |
|---|---|
| Class | `TableComponent` |
| Selector | `guiexpert-table` |
| Change detection | `OnPush`; rendering runs outside the Angular zone (`NgZone.runOutsideAngular`) |
| Inputs | `tableModel: TableModelIf` (required), `tableOptions: TableOptionsIf` (default `new TableOptions()`), `debounceMouseClickDelay: number` (default 150 ms), `loading: boolean` (default `false`, since 1.1.92: loading overlay, no re-creation) |
| Outputs | `tableReady` (`TableApi`), `mouseClicked`, `mouseMoved`, `contextMenu` (since 1.1.101; `contextmenu` deprecated), `mouseDragging`, `mouseDraggingEnded` (`GeMouseEvent`), `checkboxChanged` (`any[]`), `modelChanged` (`GeModelChangeEvent`), `selectionChanged` (`SelectionModelIf`), `focusChanged` (`FocusModelIf`), `scroll` (`GeScrollEvent`), `stateChanged` (`GeStateChangeEvent`, since 1.1.92), `rowDragStart`, `rowDragMove`, `rowDragEnd` (`GeRowDragEvent`, since 1.1.95 – row drag, instructions.md 6.16), `batchEditChanged` (`GeBatchEditEvent`, since 1.1.96), `detailExpandedChanged` (`GeDetailEvent`, since 1.1.97 – master/detail, instructions.md 6.18), `editingChanged` (`GeEditEvent`, since 1.1.99), `undoStackChanged` (`GeUndoEvent`, since 1.1.99) |

> **Use `(contextMenu)`, not `(contextmenu)`.** Angular binds an output named like a DOM event to the output **and**
> to the native event of the host element – the right click bubbles out of the table, so a `(contextmenu)` handler
> first gets the native `MouseEvent`, then the `GeMouseEvent`. Since 1.1.101 `TableComponent` has the output
> `contextMenu` (capital M, exactly one `GeMouseEvent`, like the signal component in section 14); `contextmenu` stays
> for compatibility and is `@deprecated`. With an older version skip the first call
> (`if (evt instanceof MouseEvent) return;`).

**Angular 22 and later:** a second, signal-native component `TableSignalComponent` (`<guiexpert-table-signal>`):
`input()`, `output()`, the `TableApi` as a signal (`[(tableApi)]`), zoneless-ready – section 14.

Other exports: `RenderWrapperFactory` (Angular components as cell renderers), `ComponentRendererIf<T>`,
`RendererWrapper`, `DomService`, since 1.1.97 `DetailRenderWrapperFactory`, `DetailComponentRendererIf<T>` and
`DetailRendererWrapper` (Angular components as detail rows, section 11).

> Since 1.1.86 (`@guiexpert/angular-table@NN.1.86`) a **new `tableModel` or `tableOptions` object** re-creates the table
> (`ngOnChanges`; the previous table is released with `TableApi.destroy()`, also in `ngOnDestroy`), and `tableReady`
> fires again with the new API. Works with plain properties and signals (`[tableModel]="model()"`).
> To change the data *within* a model, modify it and call `tableApi.repaint()`; to filter, use
> `externalFilterFunction` + `tableApi.externalFilterChanged()` (section 8).
> Up to 1.1.85 the input was read only once in `ngOnInit`.

---

## 3. First table

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
  // 1,000 rows x 100 columns
  tableModel: TableModelIf = generateSimpleModel(1000, 100);

  onTableReady(api: TableApi) {
    api.scrollToIndex(0, 500);   // column 0, row 500
  }
}
```

In NgModule-based applications add `TableComponent` to the `imports` array of the module.

---

## 4. Array of objects (loaded via HTTP)

```ts
import { Component, OnInit, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TableComponent } from "@guiexpert/angular-table";
import { TableFactory, TableModelIf, TableOptions, TableOptionsIf } from "@guiexpert/table";

interface PersonIf { id: number; firstName: string; lastName: string; email: string; ipAddress: string; }

@Component({
  selector: "app-person-table",
  standalone: true,
  imports: [TableComponent],
  template: `
    @if (tableModel) {
      <guiexpert-table class="table-div" [tableModel]="tableModel" [tableOptions]="tableOptions" />
    }
  `
})
export class PersonTableComponent implements OnInit {
  private readonly http = inject(HttpClient);

  tableModel?: TableModelIf;
  tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    defaultRowHeights: { header: 34, body: 34, footer: 0 }
  };

  ngOnInit(): void {
    this.http.get<PersonIf[]>("/assets/persons.json").subscribe(rows => {
      this.tableModel = TableFactory.createTableModel({
        rows,
        properties: ["id", "firstName", "lastName", "email", "ipAddress"],
        defaultRowHeights: this.tableOptions.defaultRowHeights
      });
    });
  }
}
```

**With a loading overlay (since 1.1.92):** create the (empty) model at once and let the `loading` input show the
spinner – the table is not re-created when `loading` changes; an empty answer shows "No rows to show" by itself.

```ts
import { Component, OnInit, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TableComponent } from "@guiexpert/angular-table";
import { TableApi, TableFactory, TableOptions } from "@guiexpert/table";

interface PersonIf { id: number; firstName: string; lastName: string; }

@Component({
  selector: "app-person-loading-table",
  standalone: true,
  imports: [TableComponent],
  template: `<guiexpert-table class="table-div" [tableModel]="tableModel" [tableOptions]="tableOptions"
                [loading]="loading" (tableReady)="tableApi = $event" />`
})
export class PersonLoadingTableComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly tableModel = TableFactory.createTableModel({ rows: [] as PersonIf[], properties: ["id", "firstName", "lastName"] });
  readonly tableOptions = { ...new TableOptions(), overlayOptions: { noRowsText: "No persons" } };
  loading = true;
  tableApi?: TableApi;

  ngOnInit(): void {
    this.http.get<PersonIf[]>("/assets/persons.json").subscribe(rows => {
      this.tableApi?.setRows(rows);
      this.tableApi?.repaintHard();
      this.loading = false;
    });
  }
}
```

Texts, delay and own content: `tableOptions.overlayOptions` (see the developer guide, section 6.15).

---

## 5. Column definitions, fixed columns, built-in renderers

```ts
import {
  ColumnDef, ColumnDefIf, MaleFemaleToIconCellRenderer, Renderer, TableFactory, TableModelIf,
  TrueFn, allRight, bodyLeft, px60, px120, px150, px250
} from "@guiexpert/table";

function createModel(rows: any[]): TableModelIf {
  const columnDefs: ColumnDefIf[] = [
    new ColumnDef("firstName", "First Name", px120),
    new ColumnDef("lastName", "Last Name", px120),
    new ColumnDef("gender", "Gender", px60, undefined,
      Renderer.bodyRenderer(new MaleFemaleToIconCellRenderer())),
    new ColumnDef("email", "Email", px250, bodyLeft),
    ColumnDef.create({ property: "balance", headerLabel: "Balance", width: px150, sortable: TrueFn }),
    new ColumnDef("latitude", "Latitude", px120, allRight)
  ];
  return TableFactory.createTableModel({
    rows,
    columnDefs,
    fixedLeftColumnCount: 2,     // first two columns stay visible
    fixedRightColumnCount: 1     // last column stays visible
  });
}
```

---

## 6. Angular components as cell renderers

A renderer component implements `ComponentRendererIf<T>`:

```ts
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ComponentRendererIf } from "@guiexpert/angular-table";
import { AreaIdent, AreaModelIf, RendererCleanupFnType } from "@guiexpert/table";

@Component({
  selector: "app-email-renderer",
  standalone: true,
  template: `<a [href]="'mailto:' + email">{{ email }}</a>`,
  styles: [`:host { display: block; width: 100%; height: 100%; }`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailRendererComponent<T> implements ComponentRendererIf<T> {
  email = "";

  setData(
    _rowIndex: number,
    _columnIndex: number,
    _areaIdent: AreaIdent,
    _areaModel: AreaModelIf,
    cellValue: any): RendererCleanupFnType | undefined {
    this.email = cellValue;
    return undefined;
  }
}
```

Create the renderer with `RenderWrapperFactory`:

```ts
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { RenderWrapperFactory, TableComponent } from "@guiexpert/angular-table";
import { ColumnDef, TableFactory, TableModelIf, px120, px250 } from "@guiexpert/table";
import { EmailRendererComponent } from "./email-renderer.component";

@Component({
  selector: "app-renderer-table",
  standalone: true,
  imports: [TableComponent],
  template: `<guiexpert-table class="table-div" [tableModel]="tableModel" />`
})
export class RendererTableComponent {
  private readonly rwf = inject(RenderWrapperFactory);
  private readonly cdr = inject(ChangeDetectorRef);

  tableModel: TableModelIf = TableFactory.createTableModel({
    rows: [{ name: "Ann", email: "ann@example.com" }],
    columnDefs: [
      new ColumnDef("name", "Name", px120),
      ColumnDef.create({
        property: "email",
        headerLabel: "Email",
        width: px250,
        bodyRenderer: this.rwf.create(EmailRendererComponent, this.cdr)
      })
    ]
  });
}
```

Renderers built without Angular (implementing `CellRendererIf` from `@guiexpert/table`) are faster and work as
well – see the core guide.

---

## 7. Sorting

```ts
import { ColumnDef, TrueFn, px120 } from "@guiexpert/table";

const ageColumn = ColumnDef.create({
  property: "age",
  headerLabel: "Age",
  width: px120,
  sortable: TrueFn,                                   // click on the header sorts
  sortComparator: (a: number, b: number) => a - b,   // optional
  sortState: "asc"                                    // optional initial state
});
```

Programmatically: `tableApi.sort((a, b) => a.age - b.age)` or `tableApi.reSort()`.

---

## 8. Filtering

```ts
import { Component } from "@angular/core";
import { TableComponent } from "@guiexpert/angular-table";
import { TableApi, TableFactory, TableModelIf, TableOptions, TableOptionsIf } from "@guiexpert/table";

@Component({
  selector: "app-filter-table",
  standalone: true,
  imports: [TableComponent],
  template: `
    <input placeholder="Search..." (input)="onSearch($any($event.target).value)" />
    <guiexpert-table class="table-div"
      [tableModel]="tableModel" [tableOptions]="tableOptions"
      (tableReady)="tableApi = $event" />
  `
})
export class FilterTableComponent {
  tableApi?: TableApi;
  private searchText = "";

  tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    externalFilterFunction: (row: any) =>
      !this.searchText || JSON.stringify(row).toLowerCase().includes(this.searchText)
  };

  tableModel: TableModelIf = TableFactory.createTableModel({
    rows: [{ name: "Ann" }, { name: "Bob" }],
    tableOptions: this.tableOptions
  });

  onSearch(value: string) {
    this.searchText = value.toLowerCase();
    this.tableApi?.externalFilterChanged();
  }
}
```

(Real demo: `angular-table-demo/src/app/filter/idfilter` – filtering by a slider.)

---

## 9. Selection and keyboard

```ts
import { SelectionModel, TableOptions, TableOptionsIf } from "@guiexpert/table";

const selectionModel = new SelectionModel("row", "multi");   // "none" | "cell" | "row" | "column" | "range"

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => selectionModel
};
```

```html
<guiexpert-table
  class="table-div"
  [tableModel]="tableModel"
  [tableOptions]="tableOptions"
  (selectionChanged)="onSelectionChanged($event)"
  (focusChanged)="onFocusChanged($event)"
  (tableReady)="tableApi = $event" />
```

`tableApi.clearSelection()`, `tableApi.setSelectionModel(new SelectionModel("cell", "single"))`,
`tableApi.getShortcutActionMapping()`, `tableApi.triggerAction("SELECT_ALL")`, `tableApi.copyToClipboard()`.

**Screen readers (since 1.1.91):** the table is a WAI-ARIA grid – give it a name in the options; everything else
(roles, row/column numbers, focus, announcements, keyboard: arrows, Home/End, Page Up/Down, Enter, header focus) works
without code. Details and the rules for own cell components: `instructions.md` 6.14 in the repository root.

```ts
import { TableOptions, TableOptionsIf } from "@guiexpert/table";

const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  ariaLabelledBy: "orders-title",                 // <h2 id="orders-title">Orders</h2> above the table
  ariaTexts: { filtered: (rowCount: number) => `${rowCount} Zeilen` },
};
```

An Angular cell component (`RenderWrapperFactory`) is rendered into a cell with `role="gridcell"`: icons need an
`aria-label` (`role="img"`), buttons a name, and no `tabindex` of their own. The wrapper's `DomService` sets and
removes attributes through `Renderer2`.

---

## 10. Mouse events

```html
<guiexpert-table
  class="table-div"
  [tableModel]="tableModel"
  [debounceMouseClickDelay]="166"
  (mouseClicked)="onMouseClicked($event)"
  (mouseMoved)="onMouseMoved($event)"
  (contextMenu)="onContextMenu($event)" />
```

```ts
import { GeMouseEvent } from "@guiexpert/table";

export class MouseEventsDemo {   // the component class of the template above
  onMouseClicked(evt: GeMouseEvent) {
    console.info(evt.rowIndex, evt.columnIndex, evt.areaIdent, evt.clickCount);
  }
  onMouseMoved(evt: GeMouseEvent) {
    console.info(evt.rowIndex, evt.columnIndex);
  }
  onContextMenu(evt: GeMouseEvent) {      // `contextMenu` since 1.1.101 (section 2)
    evt.originalEvent?.preventDefault();  // no browser menu
    console.info("context menu on row", evt.rowIndex);
  }
}
```

`mouseClicked` is emitted inside the Angular zone; `mouseMoved`, `scroll` and the other events are emitted outside
of it – call `ChangeDetectorRef.detectChanges()` (or set a signal) if the template has to react.

---

## 11. Tree table with checkboxes

```ts
import { ColumnDef, TableFactory, TableOptions, TableOptionsIf, TreeFactory, px120, px220 } from "@guiexpert/table";

interface PersonIf { lastName: string; preName: string; friends?: PersonIf[]; }

const data: PersonIf[] = [
  { lastName: "Miller", preName: "Ann", friends: [{ lastName: "Smith", preName: "Bob" }] }
];

export const treeOptions: TableOptionsIf = {
  ...new TableOptions(),
  showCheckboxWihoutExtraColumn: true     // checkbox inside the first column
};

export const treeModel = TableFactory.createTableModel({
  rows: TreeFactory.buildTreeRows<PersonIf>(data, "friends"),
  columnDefs: [new ColumnDef("lastName", "Last Name", px220), new ColumnDef("preName", "Pre Name", px120)],
  tableOptions: treeOptions
});
```

```html
<guiexpert-table class="table-div" [tableModel]="treeModel" [tableOptions]="treeOptions"
  (checkboxChanged)="onCheckboxChanged($event)" />
```

### Row grouping (since 1.1.94)

Flat rows grouped by properties, with aggregates per group and a total row (details: `instructions.md` 5.6). Regroup with
the `TableApi` from `(tableReady)` – the table keeps its state, no new model:

```ts
import { Component } from "@angular/core";
import { TableComponent } from "@guiexpert/angular-table";
import { ColumnDef, RowGroupFactory, TableApi, px120 } from "@guiexpert/table";

interface Sale { region: string; produkt: string; monat: string; umsatz: number; }

@Component({
  selector: "app-row-grouping",
  standalone: true,
  imports: [TableComponent],
  template: `
    <select (change)="regroup($any($event.target).value)">
      <option value="region">Region</option><option value="region,produkt">Region › Produkt</option>
    </select>
    <guiexpert-table class="table-div" [tableModel]="tableModel" (tableReady)="api = $event" />`
})
export class RowGroupingComponent {
  api?: TableApi;
  readonly tableModel = RowGroupFactory.createTableModel<Sale>({
    rows: [{ region: "Nord", produkt: "A", monat: "Jan", umsatz: 100 }, { region: "Süd", produkt: "B", monat: "Feb", umsatz: 70 }],
    columnDefs: ["region", "produkt", "monat", "umsatz"].map(p => new ColumnDef(p, p, px120)),
    groupBy: ["region"],
    aggregations: { umsatz: "sum" }
  });

  regroup(value: string) {
    this.api?.setRowGroupBy(value.split(","));
  }
}
```

### Pivot tables (since 1.1.94)

Rows grouped by row fields, the values of column fields as columns, aggregated cells, total column and total row
(details: `instructions.md` 5.7). Pivot again with the `TableApi` from `(tableReady)` – same model, same table:

```ts
import { Component } from "@angular/core";
import { TableComponent } from "@guiexpert/angular-table";
import { PivotFactory, TableApi } from "@guiexpert/table";

interface Sale { region: string; produkt: string; monat: string; umsatz: number; }

@Component({
  selector: "app-pivot",
  standalone: true,
  imports: [TableComponent],
  template: `
    <select (change)="pivot($any($event.target).value)">
      <option value="monat">Month</option><option value="produkt">Product</option>
    </select>
    <guiexpert-table class="table-div" [tableModel]="tableModel" (tableReady)="api = $event" />`
})
export class PivotComponent {
  api?: TableApi;
  readonly tableModel = PivotFactory.createTableModel<Sale>({
    rows: [{ region: "Nord", produkt: "A", monat: "Jan", umsatz: 100 }, { region: "Süd", produkt: "B", monat: "Feb", umsatz: 70 }],
    rowFields: ["region"],
    columnFields: ["monat"],
    values: ["umsatz"]
  });

  pivot(field: string) {
    this.api?.setPivotConfig({ columnFields: [field] });
  }
}
```

---

### Master/detail (since 1.1.97)

Expand a row and show an Angular component over the full width below it – e.g. the items of an order in a second
`guiexpert-table`. The component implements `DetailComponentRendererIf` and is created once, when the detail row becomes
visible; it keeps its state while scrolling and is destroyed when the row is collapsed (core guide 6.18).

```ts
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DetailComponentRendererIf, DetailRenderWrapperFactory, TableComponent } from "@guiexpert/angular-table";
import { DetailRenderContextIf, TableFactory, TableModelIf, TableOptions, TableOptionsIf } from "@guiexpert/table";

interface Order { id: number; customer: string; items: { sku: string; qty: number }[] }

@Component({
  selector: "app-order-items",
  standalone: true,
  imports: [TableComponent],
  template: `<guiexpert-table style="display:block; height:160px" [tableModel]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderItemsComponent implements DetailComponentRendererIf<Order> {
  items?: TableModelIf;

  setDetail(order: Order, _context: DetailRenderContextIf<Order>): void {
    this.items = TableFactory.createTableModel({ rows: order.items, properties: ["sku", "qty"] });
  }
}

@Component({
  selector: "app-orders",
  standalone: true,
  imports: [TableComponent],
  template: `<guiexpert-table class="table-div" [tableModel]="tableModel" [tableOptions]="tableOptions"
                              (detailExpandedChanged)="opened = $event.expanded" />`
})
export class OrdersComponent {
  opened = false;
  tableModel: TableModelIf = TableFactory.createTableModel({
    rows: [{ id: 1, customer: "Ann", items: [{ sku: "A-1", qty: 2 }] }] as Order[],
    properties: ["id", "customer"]
  });
  tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    masterDetail: { detailHeight: 180, detailRenderer: inject(DetailRenderWrapperFactory).create(OrderItemsComponent) }
  };
}
```

## 12. Inline editing

```ts
import {
  CheckboxBooleanPropertyCellRenderer, ColumnDef, DateToLocaleDateCellRenderer, SelectCellRenderer,
  ValueLabel, editInputPipeForNumber, px50, px200
} from "@guiexpert/table";

const columnDefs = [
  ColumnDef.create({ property: "done", headerLabel: " ", width: px50,
    bodyRenderer: new CheckboxBooleanPropertyCellRenderer<any>("done") }),
  ColumnDef.create({ property: "title", headerLabel: "Title", width: px200, editable: () => true }),
  ColumnDef.create({ property: "flagId", headerLabel: "Flag", width: px200, editable: () => true,
    editInputPipe: editInputPipeForNumber }),
  ColumnDef.create({ property: "dueDate", headerLabel: "Due Date", width: px200, editable: () => true,
    bodyRenderer: new DateToLocaleDateCellRenderer() }),
  ColumnDef.create({ property: "priority", headerLabel: "Priority", width: px200, editable: () => true,
    getEditRenderer: () => new SelectCellRenderer([
      new ValueLabel("low", "Low"), new ValueLabel("high", "High")
    ]) })
];
```

Editing starts with a double click or the `START_EDITING` shortcut; listen to `(modelChanged)`.
(Real demo: `angular-table-demo/src/app/todo`.)

---

## 13. Live updates, export, persistence, look & feel

```ts
import { AutoRestoreOptions, TableApi, TableCellUpdateEvent, TableOptions } from "@guiexpert/table";

// Live update of single cells (only these cells are re-rendered):
export function updatePrice(api: TableApi, row: number, col: number, value: number) {
  api.updateCells([new TableCellUpdateEvent("body", row, col, value)]);
}

// Excel export (no extra library):
export function exportExcel(api: TableApi) {
  api.downloadExcel("export.xlsx", "Me");   // current view: filtered + sorted rows, header and footer
}

// Restore scroll position, sorting and column layout from localStorage
// (all flags and the state API with (stateChanged): instructions.md 6.11):
export const persistentOptions = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<any>(),
    getStorageKeyFn: () => "my-table",
    autoRestoreScrollPosition: true,
    autoRestoreSortingState: true,
    autoRestoreColumnLayout: true   // widths, order, visibility (since 1.1.92)
  }
};
```

Colors are CSS variables (`--ge-table-*`, light/dark via `html[data-theme]`), e.g. in `src/styles.css`:

```css
html {
  --ge-table-header-center-bg: #1e293b;
  --ge-table-header-center-text: #f8fafc;
  --ge-table-hover-row-bg: rgba(54, 187, 108, 0.12);
}
```

---

## 14. Signal component (Angular 22 and later)

Since 1.1.100 (`@guiexpert/angular-table@22.1.100`) the packages for **Angular 22 and every later major** contain a
second component next to `TableComponent`: `TableSignalComponent`, selector `guiexpert-table-signal`. It is built with
signal inputs (`input()`), signal outputs (`output()`) and `effect()` instead of `ngOnChanges` – no RxJS, works with
and without Zone.js. The packages for Angular 14 – 21 are unchanged.

```ts
import { Component, computed, effect, signal } from "@angular/core";
import { TableSignalComponent } from "@guiexpert/angular-table";
import { TableApi, TableFactory } from "@guiexpert/table";

@Component({
  selector: "app-orders",
  imports: [TableSignalComponent],
  template: `
    <guiexpert-table-signal class="table-div" [tableModel]="model" [(tableApi)]="api" />
    <button [disabled]="!ready()" (click)="api()?.downloadExcel('orders.xlsx', 'me')">Excel</button>`
})
export class OrdersComponent {
  readonly model = TableFactory.createTableModel({
    rows: [{ id: 1, customer: "Acme", total: 120 }], properties: ["id", "customer", "total"]
  });
  readonly api = signal<TableApi | undefined>(undefined);
  readonly ready = computed(() => !!this.api());

  constructor() {
    effect(() => this.api()?.scrollToIndex(0, 0));  // runs once the table exists
  }
}
```

| | `TableSignalComponent` |
|---|---|
| Selector | `guiexpert-table-signal` (standalone, `OnPush`, same stylesheet as `TableComponent`) |
| Inputs (`input()`) | `tableModel: TableModelIf \| undefined`, `tableOptions: TableOptionsIf` (default `new TableOptions()`), `loading: boolean` (default `false`), `debounceMouseClickDelay: number` (default 150 ms, `0` = synchronous, read at click time) |
| The API as a signal (`model()`) | `tableApi: TableApi \| undefined` – two-way binding `[(tableApi)]="api"`, event form `(tableApiChange)`, or `viewChild(TableSignalComponent)?.tableApi()` |
| Outputs (`output()`) | `mouseClicked`, `mouseMoved`, `mouseDragging`, `mouseDraggingEnded`, **`contextMenu`** (`GeMouseEvent`), `scroll` (`GeScrollEvent`), `modelChanged`, `selectionChanged`, `focusChanged`, `checkboxChanged`, `stateChanged`, `rowDragStart`, `rowDragMove`, `rowDragEnd`, `batchEditChanged`, `detailExpandedChanged`, `editingChanged`, `undoStackChanged` – the same events as `TableComponent` |

Rules:

- **`tableApi`** is set when the table is built, switches **directly** to the new API when a new `tableModel` or
  `tableOptions` value re-creates the table (no `undefined` in between – an `effect` on it runs once per table), and
  becomes `undefined` when the component is destroyed. It is set by the table: a value written from outside is
  replaced (with a warning in dev mode). Bind it to a **signal** – a plain field can cause
  `ExpressionChangedAfterItHasBeenChecked` when the parent template reads it.
- **No `tableReady` output:** the API comes only as the signal `tableApi` – `(tableApiChange)="…"` is the event form
  (it also reports `undefined` when the component is destroyed).
- **`contextMenu`** (capital M) instead of `contextmenu`: no second call with the native event (section 2). `scroll`
  keeps its name: Angular binds the host's native `scroll` event as well, but `scroll` does not bubble and the host
  element itself never scrolls (the table scrolls inside), so only `GeScrollEvent`s arrive – unless you make the host
  element scrollable with your own CSS.
- **Change detection:** the table runs outside the Angular zone, so the events of the table – mouse, keyboard,
  scroll, drag, editing (also `mouseClicked`, unlike `TableComponent`) – reach your handler outside the zone. Events
  caused by your own API calls come where you call them, `tableApiChange` comes from change detection. Write a
  **signal** in a handler – that schedules change detection with and without Zone.js. A handler that sets a plain
  field calls `ChangeDetectorRef.markForCheck()` itself.
- **Zoneless:** works with `provideZonelessChangeDetection()`; no Zone.js needed.
- **SSR:** on the server no table is created (no DOM access); it is built in the browser.
- `loading`, renderer wrappers (`RenderWrapperFactory`, `DetailRenderWrapperFactory`) and all table options work as
  with `TableComponent`.

Switching from `TableComponent`:

| `TableComponent` (`<guiexpert-table>`) | `TableSignalComponent` (`<guiexpert-table-signal>`) |
|---|---|
| `(tableReady)="api = $event"` + field `api?: TableApi` | `[(tableApi)]="api"` + `api = signal<TableApi \| undefined>(undefined)`, or `(tableApiChange)="…"` |
| `(contextMenu)="…"` (since 1.1.101; deprecated `(contextmenu)` fires twice, section 2) | `(contextMenu)="…"` |
| `mouseClicked` inside the Angular zone | table events (also `mouseClicked`) outside the zone – write signals |
| Angular 14 – 22+ | Angular 22+ |

---

## 15. Not available yet

- No built-in filter UI, context menu or pagination (row drag: core guide 6.16).
- Master/detail only for flat tables (no detail rows below tree nodes, group rows or pivot rows).
- No drag & drop group panel or pivot field list (row grouping and pivot tables themselves: section 11).

## License

**Current releases: MIT License.** Free to use, modify and distribute – also in commercial and proprietary
applications. **Future releases: possible dual licensing** – versions already released under MIT remain MIT.
Details: https://gui.expert/license/
