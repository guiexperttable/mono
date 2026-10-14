# Anleitung: `@guiexpert/angular-table` und `@guiexpert/table` in Angular

Diese Demo-App (Angular 17, NgModule-basiert) zeigt alle wichtigen Funktionen der GuiExpert Table.
Jede Demo liegt in einem eigenen Ordner unter `src/app/` – der Code dort ist die verlässliche Referenz.

> Ausführliche, framework-unabhängige Doku: [`instructions.md`](../../instructions.md) (Mono-Repo-Root),
> Angular-Doku (14–22): [`packages/angular-table/instructions.md`](../../packages/angular-table/instructions.md), API: https://gui.expert/api

## Demo-Übersicht

| Route | Ordner | Thema |
|---|---|---|
| `/demo/simple` | `simple/` | Erste Tabelle, Array von Arrays (`generateSimpleModel`) |
| `/demo/objectarray` | `objectarray/` | Array von Objekten per HTTP (`TableFactory.createTableModel({ rows, properties })`) |
| `/demo/columndef` | `columndef/` | Spaltendefinitionen, Breiten, Ausrichtung |
| `/demo/headerdblclick` | `sorting/headerdblclick/` | Sortieren, Angular-Komponente als Renderer |
| `/demo/idfilter` | `filter/idfilter/` | Filtern mit `externalFilterFunction` + Slider |
| `/demo/cellselection` | `cellselection/` | Selektion (`SelectionModel`), Fokus, Shortcuts |
| `/demo/componentrenderer` | `componentrenderer/` | Angular-Komponenten in Zellen (`RenderWrapperFactory`) |
| `/demo/rowandcolspan` | `rowandcolspan/` | Row- und Colspan über eigenes Area-Model |
| `/demo/cellgroup` | `cellgroup/` | Mehrzeilige, auf-/zuklappbare Header-Gruppen |
| `/demo/tablecheckbox`, `/demo/treecheckbox` | `checkbox/` | Checkboxen in Tabelle und Baum |
| `/demo/todo` | `todo/` | Inline-Editing (Input, Select, Datum, Checkbox) |
| `/demo/mouseevent` | `mouseevent/` | Maus-Events (`mouseClicked`, `mouseMoved`, `contextmenu`) |
| `/demo/multisize` | `multisize/` | Unterschiedliche Spaltenbreiten/Zeilenhöhen |
| `/demo/style`, `/demo/ultra` | `style/` | Look & Feel, 1024 × 1024 Farbzellen |
| `/demo/covergrid` | `covergrid/` | Kachel-Ansicht (Cover-Grid) |
| `/demo/olympic` | `olympic/` | Reales Daten-Beispiel |
| `/demo/chunksocket` | `chunksocket/` | Daten-Chunks über Socket (experimentell) |

Starten (im Mono-Repo-Root): `pnpm i` und danach `pnpm serve:angular-table-demo` → http://localhost:4200

## Installation in eigenen Projekten

```bash
npm install @guiexpert/table @guiexpert/angular-table@^17.0.0
```

Die Major-Version von `@guiexpert/angular-table` entspricht der Angular-Version (14 … 22).
Ein extra Stylesheet ist nicht nötig: Die Komponente bringt das komplette CSS der Core-Bibliothek mit
(CSS-Variablen `--ge-table-*` und Klassen `ge-table-*`); Farben überschreibt man in der globalen `styles.css`.

## Komponente einbinden

`TableComponent` ist eine **Standalone-Komponente** (Selektor `guiexpert-table`). In NgModule-Apps wird sie in die
`imports` des Moduls aufgenommen – so wie in `simple/demo-simple.module.ts`:

```ts
import { NgModule } from "@angular/core";
import { NgIf } from "@angular/common";
import { TableComponent } from "@guiexpert/angular-table";
import { DemoSimpleComponent } from "./demo-simple.component";

@NgModule({
  declarations: [DemoSimpleComponent],
  imports: [TableComponent, NgIf]
})
export class DemoSimpleModule {}
```

## Beispiel 1: Array von Arrays

```ts
import { Component } from "@angular/core";
import { TableModelIf } from "@guiexpert/table";
import { generateSimpleModel } from "@guiexpert/demo-table-models";

@Component({
  selector: "demo-simple",
  templateUrl: "./demo-simple.component.html",
  styleUrls: ["./demo-simple.component.css"]
})
export class DemoSimpleComponent {
  tableModel: TableModelIf = generateSimpleModel(1000, 100);   // 1.000 Zeilen × 100 Spalten
}
```

```html
<guiexpert-table *ngIf="tableModel" [tableModel]="tableModel" class="table-div"></guiexpert-table>
```

```css
.table-div {
  display: block;
  height: 500px;   /* Pflicht: Die Tabelle füllt ihren Container */
  width: 100%;
}
```

## Beispiel 2: Array von Objekten

```ts
import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TableFactory, TableModelIf, TableOptions, TableOptionsIf } from "@guiexpert/table";

interface SimplePersonIf { id: number; firstName: string; lastName: string; email: string; gender: string; ipAddress: string; }

@Component({
  selector: "demo-objectarray",
  templateUrl: "./demo-objectarray.component.html"
})
export class DemoObjectarrayComponent implements OnInit {
  tableModel?: TableModelIf;
  tableOptions: TableOptionsIf = {
    ...new TableOptions(),
    hoverColumnVisible: false,
    defaultRowHeights: { header: 34, body: 34, footer: 0 }
  };

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<SimplePersonIf[]>("/assets/demodata/persons1000.json").subscribe(rows => {
      this.tableModel = TableFactory.createTableModel({
        rows,
        properties: ["id", "firstName", "lastName", "email", "gender", "ipAddress"],
        defaultRowHeights: this.tableOptions.defaultRowHeights
      });
    });
  }
}
```

```html
<guiexpert-table *ngIf="tableModel" [tableModel]="tableModel" [tableOptions]="tableOptions" class="table-div">
</guiexpert-table>
```

## Spalten, Renderer, fixierte Spalten

```ts
import { ColumnDef, ColumnDefIf, TableFactory, px50, px120, px150, px250 } from "@guiexpert/table";

const columnDefs: ColumnDefIf[] = [
  new ColumnDef("firstName", "First Name", px120),
  new ColumnDef("lastName", "Last Name"),
  ColumnDef.create({ property: "email", width: px250, bodyClasses: ["ge-table-text-align-left"] }),
  new ColumnDef("ipAddress", "IP", px150),
  new ColumnDef("id", "ID", px50)
];

const tableModel = TableFactory.createTableModel({
  rows: [],
  columnDefs,
  fixedLeftColumnCount: 2      // die ersten zwei Spalten bleiben beim horizontalen Scrollen stehen
});
```

Eigene Zellinhalte: `CellRendererIf` aus `@guiexpert/table` implementieren (schnell, ohne Angular) oder eine
Angular-Komponente mit `ComponentRendererIf<T>` über `RenderWrapperFactory.create(MyComponent, cdr)` einbinden –
siehe `componentrenderer/`.

## Wichtige Ein- und Ausgaben von `<guiexpert-table>`

| Input | Bedeutung |
|---|---|
| `tableModel` | `TableModelIf` – Daten, Spalten, fixierte Spalten |
| `tableOptions` | `TableOptionsIf` – z. B. `defaultRowHeights`, `hoverRowVisible`, `columnsResizable`, `columnsDraggable`, `externalFilterFunction`, `getSelectionModel`, `autoRestoreOptions` |
| `debounceMouseClickDelay` | Entprellung von `mouseClicked` in ms (Standard 150) |

| Output | Payload |
|---|---|
| `tableReady` | `TableApi` (z. B. `scrollToIndex`, `externalFilterChanged`, `repaint`, `clearSelection`, `copyToClipboard`, `downloadExcel`, `updateCells`) |
| `mouseClicked`, `mouseMoved`, `contextmenu`, `mouseDragging`, `mouseDraggingEnded` | `GeMouseEvent` (`rowIndex`, `columnIndex`, `areaIdent`, `clickCount`) |
| `selectionChanged` / `focusChanged` | `SelectionModelIf` / `FocusModelIf` |
| `checkboxChanged` | `any[]` |
| `modelChanged` | `GeModelChangeEvent` |
| `scroll` | `GeScrollEvent` |

Hinweis: Die Tabelle wird einmalig in `ngOnInit` aufgebaut. Ein später geändertes `tableModel` wird nicht
übernommen – deshalb wird die Komponente in den Demos per `*ngIf` erst erzeugt, wenn die Daten da sind.

## Barrierefreiheit (ab `@guiexpert/table` 1.1.91)

Die Tabelle ist ein WAI-ARIA-Grid (Screenreader, Tastatur: Pfeile, Pos1/Ende, Bild↑/↓, Enter, ↑ in den Header) – ohne
eigenen Code. Empfohlen ist ein Name über die Optionen, z. B. `ariaLabelledBy: "orders-title"` (ID einer Überschrift)
oder `ariaLabel: "Bestellungen"`; deutsche Ansagen über `ariaTexts`. Diese Demo nutzt noch die npm-Pakete
(`TODO.md`) – die Attribute erscheinen hier erst nach dem Release 1.1.91. Eine lauffähige Demo im Mono-Repo:
`pnpm serve:table-demo` → `http://localhost:4200/aria.html`. Details: `instructions.md` 6.14 im Repo-Root.

## Lizenz

**Aktuelle Releases: MIT-Lizenz** – kostenlos nutzbar, auch kommerziell. **Künftige Releases: mögliche
Dual-Lizenz**; bereits unter MIT veröffentlichte Versionen bleiben MIT. Details: https://gui.expert/license/
