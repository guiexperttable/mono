# GuiExpert Table for Angular (14 – 22)

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
| Outputs | `tableReady` (`TableApi`), `mouseClicked`, `mouseMoved`, `contextmenu`, `mouseDragging`, `mouseDraggingEnded` (`GeMouseEvent`), `checkboxChanged` (`any[]`), `modelChanged` (`GeModelChangeEvent`), `selectionChanged` (`SelectionModelIf`), `focusChanged` (`FocusModelIf`), `scroll` (`GeScrollEvent`), `stateChanged` (`GeStateChangeEvent`, since 1.1.92) |

Other exports: `RenderWrapperFactory` (Angular components as cell renderers), `ComponentRendererIf<T>`,
`RendererWrapper`, `DomService`.

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
  (contextmenu)="onContextmenu($event)" />
```

```ts
import { GeMouseEvent } from "@guiexpert/table";

export class MouseEventsDemo {   // the component class of the template above
  onMouseClicked(evt: GeMouseEvent) {
    console.info(evt.rowIndex, evt.columnIndex, evt.areaIdent, evt.clickCount);
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

---

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

## 14. Not available yet

- No built-in filter UI, context menu, pagination or row drag & drop.

## License

**Current releases: MIT License.** Free to use, modify and distribute – also in commercial and proprietary
applications. **Future releases: possible dual licensing** – versions already released under MIT remain MIT.
Details: https://gui.expert/license/
