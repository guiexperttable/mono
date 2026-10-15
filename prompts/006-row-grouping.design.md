# Design 006 – Row Grouping

> Prompt: `prompts/006-row-grouping.md` · Branch `feat/row-grouping` · Zielversion **1.1.94** (`since`; `packages/table/package.json`
> steht auf 1.1.93, 005 erscheint ebenfalls mit 1.1.94) · Stand 15.10.2026. Voraussetzung 005 (Aggregation) ist auf `main`.
> **Selbständig umgesetzt** (Auftrag „bitte … selbstständig arbeiten“, 15.10.2026, wie bei 004/005): Claude hat die
> Empfehlungen aus § 2 übernommen, ohne die Freigabe abzuwarten. Jede Entscheidung ist begründet und lässt sich vor dem
> Merge noch ändern.

---

## 1. Bausteine

| Baustein | wofür im Row Grouping | Befund | Änderung |
|---|---|---|---|
| `AreaModelTree` | Body mit auf-/zuklappbaren Gruppen | Pipeline alle Zeilen → sichtbar → Filter, `keep` markiert Treffer auch unter zugeklappten Knoten, `doSort`/`sort` sortieren Geschwister in place, `getLeafRows()` (005), `getConstantRowHeight` | **passt**: `AreaModelRowGroups extends AreaModelTree` (Gruppen = `TreeRow` mit einer `RowGroup` als `data`, Detailzeilen = `TreeRow` mit dem Original-Objekt). `rows` ist `readonly` → Umgruppieren tauscht den Inhalt des Arrays aus (Identität bleibt) |
| `TreeRow` / `TreeRowIf`, `TreeRowService.flattenTree` | Zeilen | passt unverändert | – |
| `TreeFactory` | Muster für die Fabrik | `buildTreeRows(data, options)`, `TreeFactoryOptions.expanded: boolean \| fn` | neue `RowGroupFactory.createTableModel(…)`, `expanded` wie dort (+ Ebene als Zahl) |
| `isAreaModelTree` / `isTreeRow` | Erkennung | prüfen `type` | Unterklasse behält `type = "AreaModelTree"` (alle Baum-Pfade – Pfeil, Klick, ARIA, Zustand, Footer – greifen unverändert), neu: `isAreaModelRowGroups` (Feld `kind`), `isRowGroup`, `isGroupRow` |
| Renderer der Baumspalte (`RenderScope.addAndRenderCellDiv` → `ConvenienceDomService.addColumnDiv`) | Pfeil + Einrückung + Label | Pfeil in der ersten Datenspalte (`getTreeArrowColumnIndex`, hinter Zeilennummer/Checkbox), Einrückung über `ge-table-tree-deep-N`, Text über `domService.createText` (**escaped**) | passt: die Gruppenspalte steht genau dort; Label ohne Renderer → Textknoten |
| Checkbox-Baum `TreeCheckboxModel` | Gruppe anhaken | Eltern anhaken = alle Nachfahren, Eltern „semi“ bei gemischten Kindern | passt; beim Umgruppieren neues Modell über den neuen Zeilen, angehakte **Detailzeilen** bleiben angehakt (über das Objekt) |
| Persistenz (`TableStateService.idOfRow`) | Auf-/Zu-Zustand | Id = eigenes `getRowId(data)` bzw. `data.id`/`uuid` | **erweitern**: für Gruppen immer `RowGroup.id` (stabiler Gruppenpfad), unabhängig von `getRowId` |
| Footer `AreaModelAggregateFooter` (005) | Gesamtzeile | liest bei einem Baum `getLeafRows()` = gefilterte Detailzeilen, Cache-Signal = Wurzel-Array | passt ohne Änderung (Fabrik-Option `footerAggregates`) |
| Aggregatoren (005) | Gruppenwerte | `init/add/merge/result`, `merge` ändert `b` nie, `aggregateStates` (ein Durchlauf) | passt; Gruppe = `merge` der Untergruppen, Blattgruppe = ein Durchlauf über ihre Zeilen |
| `AreaModelIf.invalidateDerivedValues?()` (005) | Neuberechnung | ohne Hinweis, *was* sich geändert hat | **erweitern (additiv)**: optionaler Parameter `change?: DerivedValuesChangeIf` (`area`, `rowIndices`) – Editieren und `updateCells` geben ihn mit; dann rechnet die Gruppierung nur den Pfad zur Wurzel neu |
| `TableScope.updateModelValueAfterEdit` | Editieren | ruft `repaint()` – ändert sich dabei die Zeilenzahl (Zeile wechselt die Gruppe), stimmt die Scrollhöhe nicht | **erweitern**: ändert sich die Zeilenzahl → `repaintHard()`; ebenso `updateCells` |
| `RenderScope.updateCells` ohne `repaintAll` | Live-Daten | zeichnet die geänderten Zellen + Footer nach | **erweitern**: auch die gerenderten Gruppenzeilen |
| `RenderScope.applyCellAria` | ARIA | `rowheader` für Zeilennummern und das Footer-Label | **erweitern**: das Label einer Gruppenzeile ist `rowheader` |
| Editieren (`ColumnDef.editable`, `setValue` mit `editInputPipe`) | Detailzeilen | passt | Gruppenzeilen nie editierbar (`isEditable`) |
| Export (`downloadExcel`, `copyToClipboard`) | Sicht exportieren | `getValueAt` der angezeigten Zeilen | passt: Gruppenzeile = Label + rohe Aggregate (Zahlen bleiben Zahlen), Detailzeile = Werte, Gruppenspalte leer |
| `TableModel.setColumnVisible` | gruppierte Spalten ausblenden | passt (Breite 0, alte Breite bleibt) | – |
| `TableApi.expandAll` / `collapseAll` / `setRowExpanded` | Auf-/Zuklappen | passt | – |

**Breaking Changes:** keine. Neue Dateien/Klassen, ein optionaler Parameter an einer optionalen Methode
(`invalidateDerivedValues?(change?)`), zwei neue API-Methoden (`setRowGroupBy`, `getRowGroupBy`), drei neue
`is…`-Funktionen. Verhaltensänderungen nur dort, wo vorher etwas falsch war (Zeilenzahl ändert sich beim Editieren →
jetzt `repaintHard`).

## 2. Entscheidungen

### 2.1 Engine und Pivot (Frage 1, 15) → `src/lib/table/rowgroup/`, DOM-frei

```ts
// rowgroup/row-group-field.type.ts
export type RowGroupField<T = any> = ValueAccessor<T> | RowGroupFieldIf<T>;
export interface RowGroupFieldIf<T = any> {
  value: ValueAccessor<T>;                     // "region", "address.city" oder (o) => o.date.getFullYear()
  name?: string;                               // Id der Ebene (Gruppen-Id, Zustand); Default: der Pfad bzw. "level<N>"
  label?: string;                              // Name der Ebene (Kopf der Gruppenspalte); Default: Header der Spalte mit dieser Property
  format?: (key: unknown) => string;           // Label eines Schlüssels; Default: Text, Date → Datum, leer → emptyLabel
  order?: "asc" | "desc" | "insertion" | ((a: unknown, b: unknown) => number);  // Default "asc", leere Schlüssel zuletzt
}

// rowgroup/row-group.ts – eine Gruppe (auch das `data` der Gruppenzeile)
export class RowGroup<T = any> implements RowGroupIf<T> {
  readonly type = "RowGroup";
  key: unknown; level: number; field: string; id: string; label: string;
  path: readonly unknown[]; parent?: RowGroup<T>; children: RowGroup<T>[];
  count: number;                     // Detailzeilen (nach Filter)
  results: Record<string, unknown>;  // Aggregate (nach Filter)
  getRows(filtered?: boolean): T[];  // alle Detailzeilen (rekursiv)
}

// rowgroup/group-rows.ts
groupRows<T>(rows: ArrayLike<T>, groupBy: RowGroupField<T>[], options?: GroupRowsOptionsIf): RowGroup<T>[];
aggregateRowGroups<T>(groups: RowGroup<T>[], aggregations: AggregateSpecMap<T>, accept?: (sourceIndex: number) => boolean): Record<string, unknown>;
```

- **Ein Durchlauf** über die Quellzeilen, **verschachtelte `Map`s** je Ebene (Schlüssel = der Wert selbst – keine
  String-Schlüssel mit Trennzeichen, also keine Kollision `'a|b'` vs. `'a'`+`'|b'`; `1` und `'1'` sind verschiedene
  Gruppen). `null`, `undefined` und `''` bilden **zusammen eine** Gruppe (Schlüssel `null`, Label `emptyLabel`, Default
  `"(empty)"`), die immer am Ende steht – auch bei `order: "insertion"`. `Date` wird über den Zeitpunkt zusammengefasst
  (zwei `Date`-Objekte desselben Zeitpunkts = eine Gruppe), `NaN` ist eine Gruppe.
- Blattgruppen merken sich **Indizes** in die Quellzeilen (nicht die Objekte): Filterergebnis und Detail-Zeilen hängen
  über den Index zusammen, 1 Mio. Zeilen kosten ein `number[]`.
- **Aggregate**: Blattgruppe = `aggregateStates` (005) über ihre (gefilterten) Zeilen; jede höhere Gruppe = `init()` +
  `merge` der Kind-Zustände (`merge` ändert `b` nie) → R3 (`avg`) stimmt: Nord = 270 / 3 = 90, nicht (110 + 50) / 2.
  Gesamt = `merge` der Wurzeln. Die Zustände bleiben an der Gruppe (intern), damit Editieren nur den Pfad neu rechnet.
- **Gruppen-Id** (stabil, Grundlage der Persistenz): `"rowgroup:" + JSON.stringify([[name, typisierter Schlüssel], …])`
  mit Typ-Präfix (`s:Nord`, `n:1`, `d:<ms>`, `empty`) → gleiche Daten = gleiche Id, `1`/`'1'` verschieden. Objekt- und
  Symbol-Schlüssel bekommen eine Id je Seitenaufruf (nicht speicherbar).
- **`first`/`last`** folgen – wie in der Gesamtzeile aus 005 – der **Sicht**: Gruppen in ihrer Reihenfolge, Zeilen einer
  Gruppe in Quellreihenfolge bzw. nach dem Sortieren in Anzeigereihenfolge (`syncGroupOrder` ordnet `children` und die
  Quellindizes der Blätter nach jedem Sortieren nach und rechnet neu). Für Pivot (007) heißt das: Kreuzsummen von
  `first`/`last` hängen von der Merge-Richtung ab – dort eine feste Reihenfolge (Zeilen- vor Spaltenrichtung) festlegen.
- **Pivot (007)** nutzt dieselbe Engine zweimal: `groupRows(rows, rowFields)` für die Zeilen und
  `groupRows(rows, columnFields)` für die Spaltenschlüssel (Reihenfolge, Labels, Ids = Spalten-Properties); die Zellen
  sind Zustände je (Blatt-Zeilengruppe × Blatt-Spaltengruppe), höhere Ebenen per `merge` in beide Richtungen. Skizze:

  ```ts
  // 007, sinngemäß
  aggregateCrossGroups<T>(rowGroups: RowGroup<T>[], columnGroups: RowGroup<T>[], value: AggregateSpec<T>)
    : (rowGroup: RowGroup<T>, columnGroup?: RowGroup<T>) => unknown;   // Zelle, Zeilen-/Spaltensumme, Gesamt
  ```
  Dafür reichen die öffentlichen Bausteine `groupRows`, `RowGroup.path/id/getRows()` und die Aggregatoren aus 005.
- **Fabrik** (Frage 15): neue `RowGroupFactory` (wie `TreeFactory`/`CoverGridFactory`), nicht `TreeFactory.buildGroupedRows`
  – das Ergebnis ist ein ganzes Tabellenmodell (Gruppenspalte, ausgeblendete Spalten, Footer), keine Zeilenliste.

### 2.2 Eingabe (Frage 2) → Fabrik-Konfiguration, **kein** `ColumnDef`-Feld

```ts
export interface RowGroupTableModelParaIf<T = any> {
  rows: T[];
  groupBy: RowGroupField<T>[];                     // eine oder mehrere Ebenen
  columnDefs?: ColumnDefIf[];                      // Default: Schlüssel der ersten Zeile
  aggregations?: AggregateSpecMap<T>;              // Schlüssel = Property der Spalte: { umsatz: "sum" }
  footerAggregates?: boolean | AggregateFooterConfig<T>;  // Default: true, wenn aggregations da sind (gleiche Specs)
  groupColumn?: Partial<RowGroupColumnOptionsIf<T>>;
  hideGroupedColumns?: boolean;                    // Default true
  expanded?: boolean | number | ((group: RowGroup<T>) => boolean);  // Default true; Zahl = bis Ebene N offen (0 = alle zu)
  emptyLabel?: string;                             // Default "(empty)"
  // durchgereicht an TableFactory.createTableModel:
  tableOptions?, fixedLeftColumnCount?, fixedRightColumnCount?, rowNumbersVisible?, rowCheckboxVisible?, defaultRowHeights?, getSelectionModel?
}
RowGroupFactory.createTableModel<T>(para: RowGroupTableModelParaIf<T>): TableModelIf;
```

Generik: `createTableModel<Sale>({ groupBy: ["region"] … })` – Accessor-Funktionen sind getypt (`(s: Sale) => …`);
Pfade bleiben `string` (wie `ValueAccessor` in 005, Pfade mit `.` lassen sich nicht sinnvoll als `keyof` typisieren).
Begründung gegen `ColumnDef.aggregate`: wie in 005 § 2.6 – `ColumnDef`s werden zwischen Tabellen geteilt, und dieselbe
Spalte soll im flachen und im gruppierten Modell funktionieren. Die Aggregationen gelten für Gruppenzeilen **und** (Default)
die Gesamtzeile.

### 2.3 Ausgabe (Frage 3) → `TableModelIf` mit `AreaModelRowGroups` als Body

```ts
export class AreaModelRowGroups<T = any> extends AreaModelTree<any> {
  readonly kind = "AreaModelRowGroups";
  constructor(rows: T[], columnDefs: ColumnDefIf[], options: RowGroupModelOptionsIf<T>, defaultRowHeight?: number);
  getSourceRows(): T[];                          setRows(rows: T[]): void;
  getGroupBy(): RowGroupField<T>[];              setGroupBy(groupBy: RowGroupField<T>[]): void;   // Zustand bleibt
  getGroups(): RowGroup<T>[];                    findGroup(path: unknown[]): RowGroup<T> | undefined;
  getRowGroup(rowIndex: number): RowGroup<T> | undefined;  // Gruppenzeile → Gruppe, Detailzeile → undefined
  getDetailRow(rowIndex: number): T | undefined;
  getTotals(): Record<string, unknown>;          // Gesamt über die gefilterten Zeilen
  expandToLevel(level: number): void;            regroup(): void;   // nach Änderungen an Gruppierfeldern
}
```

`kind` statt eines neuen `type`: Eine Gruppierung **ist** ein Baum. Mit `type = "AreaModelTree"` laufen Pfeil, Klick,
Tastatur (Enter), `expandAll`, ARIA (`treegrid`, `aria-level`), Persistenz und der Footer aus 005 ohne eine einzige
Sonderregel – auch fremder Code, der `isAreaModelTree` prüft. Erkennung über Paketgrenzen: `isAreaModelRowGroups(model)`,
`isGroupRow(treeRow)`, `isRowGroup(data)`.

### 2.4 Gruppenspalte (Frage 4) → (a) eigene Spalte, fixiert, gruppierte Spalten ausgeblendet

`RowGroupColumnDef` (Property `"RowGroupColumn"`, wie `"RowNumberColumn"`/`"CheckboxColumn"`) steht hinter
Zeilennummer und Checkbox-Spalte und wird mit fixiert (`fixedLeftColumnCount` + 1). Pfeil und Einrückung kommen aus
dem Baum (`ge-table-tree-deep-N`). Label `"Nord (3)"` – Anzahl = Detailzeilen nach Filter, abschaltbar (`showCount`),
eigene `label`-Funktion möglich. Kopf: Namen der Ebenen, `"Region › Produkt"` (oder `headerLabel`). Die gruppierten
Spalten (Pfad-Felder mit passender Spalte) werden ausgeblendet (`hideGroupedColumns: true`) – die Werte stehen schon in
der Gruppenspalte; beim Umgruppieren kommen sie wieder. Begründung: (b) „Label in der gruppierten Spalte“ funktioniert
nicht mit Accessoren (Jahr aus Datum hat keine Spalte) und verschiebt die Einrückung beim Umgruppieren; (a) ist das
Standard-Layout von ag-Grid („single group column“) und Excel.

```ts
export interface RowGroupColumnOptionsIf<T = any> {
  headerLabel?: string;             // Default: "Region › Produkt"
  width: SizeIf;                    // Default px220
  showCount: boolean;               // Default true → "Nord (3)"
  label?: (group: RowGroup<T>) => string;   // eigenes Label (Text – nie HTML)
  fixed: boolean;                   // Default true
}
```

### 2.5 Gruppenzeilen (Frage 5)

- Spalten ohne Aggregation bleiben leer (kein Body-Renderer der Spalte – ein Fortschrittsbalken oder eine Checkbox
  in einer Gruppenzeile wäre falsch). Aggregate: Zellwert = rohes Ergebnis (Excel), Text = `format` der Spec, sonst
  `formatAggregateValue` (005), gezeichnet vom `AggregateCellRenderer` (Textknoten).
- CSS: Zellen `ge-table-row-group`, `ge-table-row-group-level-N`, Label `ge-table-row-group-label`, Aggregate
  `ge-table-row-group-aggregate` (rechtsbündig, `tabular-nums`); Variablen `--ge-table-row-group-bg`,
  `--ge-table-row-group-text`, `--ge-table-row-group-label-font-weight` in light **und** dark.

### 2.6 Gesamtzeile (Frage 6) → Footer aus 005

`footerAggregates` (Default: die `aggregations`) baut einen `AreaModelAggregateFooter`; bei einem Baum aggregiert er
die gefilterten **Blätter** = Detailzeilen. `false` schaltet ihn ab, eine eigene Konfiguration (Label, mehrere Zeilen)
geht wie in 005 durch.

### 2.7 Auf- und Zuklappen (Frage 7)

`expanded` wie in `TreeFactory` (Default `true`, wie dort und wie R1/R2), dazu eine **Zahl**: Gruppen bis Ebene N offen
(`0` = alle zu, ag-Grid `groupDefaultExpanded`). Alle auf/zu: `tableApi.expandAll()/collapseAll()` (gibt es).
`model.expandToLevel(n)` + `repaintHard()`. Persistenz über `RowGroup.id` (§ 2.1) mit `autoRestoreOptions`
(`autoRestoreCollapsedExpandedState`). Umgruppieren behält den Zustand unveränderter Pfade.

### 2.8 Sortierung (Frage 8, R5) → eigenes `doSort`

`treeSortWith` sortiert schon je Ebene; nur der Vergleich ist neu:
- Spalte mit Aggregation → Gruppen nach Aggregat, Detailzeilen nach ihrem Wert (R5: Nord 270 vor Süd 180; in Nord 120, 100, 50).
- Gruppenspalte → Gruppen nach Schlüssel (mit `order` der Ebene), Detailzeilen unverändert.
- Spalte = Gruppierfeld einer Ebene → diese Ebene nach Schlüssel. Sonst bleiben Gruppen stehen (stabil), Detailzeilen sortiert.
- `api.sort(fn)` sortiert die **Detailzeilen** mit derselben Funktion wie in der flachen Tabelle (`fn(a, b)` bekommt die Objekte).
- Die letzte Sortierung merkt sich das Modell und wendet sie nach Umgruppieren/Neuaufbau wieder an.

### 2.9 Filter (Frage 9, R4) → Prädikat bekommt das **Objekt**, Aggregate folgen dem Filter

- `externalFilterFunction` bekommt wie in der flachen Tabelle das Original-Objekt (`(sale) => sale.monat === "Jan"`),
  nie eine Gruppe – dieselbe Funktion funktioniert flach und gruppiert. Index und Array = Position in den Quellzeilen.
- Gruppen ohne Treffer verschwinden, Treffer unter zugeklappten Gruppen zählen (Baum-Pipeline). Aggregate und Anzahl
  im Label rechnen über die **gefilterten** Zeilen (R4: Nord 150, Süd 80, Gesamt 230) – wie die Gesamtzeile.
- Neuberechnung **lazy**: Filter, Sortierung und `invalidateDerivedValues()` markieren, gerechnet wird beim nächsten
  Lesen einer Gruppenzeile – einmal je Änderung, nie je Repaint/Scroll.

### 2.10 Umgruppieren (Frage 10) → `tableApi.setRowGroupBy([...])`

```ts
tableApi.setRowGroupBy(["produkt"]);   // false, wenn der Body keine Gruppierung ist
tableApi.getRowGroupBy();              // ["produkt"]
```

Kein neues Modell (das wäre in allen Wrappern ein Neuaufbau). `setRowGroupBy` = `model.setGroupBy` (Neuaufbau der
Gruppen in O(n), Auf-/Zu-Zustand unveränderter Pfade, Filter, Sortierung und angehakte Detailzeilen bleiben) +
Spaltenlayout (`RowGroupFactory.updateLayout`: gruppierte Spalten aus/ein, Kopf der Gruppenspalte) + Summen verwerfen +
`repaintHard` + Zustand merken. Eine Gruppenleiste per Drag & Drop ist **nicht** Teil davon; sie braucht nur diese
eine Methode (die Demos nutzen ein `<select>`).

### 2.11 Editieren und Live-Daten (Frage 11)

- Wert einer Detailzeile geändert (`setValue`, Editor, `updateCells`) → die Zustände der Blattgruppe werden neu
  berechnet und die Vorfahren neu gemergt – **nur der Pfad zur Wurzel**. Die Tabelle gibt dafür bei Edit und
  `updateCells` einen Hinweis `invalidateDerivedValues({ area: "body", rowIndices })` mit.
- Gruppierfeld geändert → die Zeile **wandert** in ihre neue Gruppe (Neuaufbau mit erhaltenem Zustand; die Tabelle
  zeichnet bei geänderter Zeilenzahl hart neu). Daten von außen geändert → `tableApi.repaint()` (alle Summen) bzw.
  `model.regroup()` + `repaintHard()`, wenn sich Gruppierfelder geändert haben.
- Gruppenzeilen sind nie editierbar.

### 2.12 Selektion, Checkboxen, Export (Frage 12)

- Checkbox: Gruppe anhaken = alle Detailzeilen (Baum-Verhalten, `TreeCheckboxModel`), halb angehakt bei gemischten.
  Angehakte Objekte: `model.getCheckedRows()` (nur Detailzeilen).
- Selektion: Gruppenzeilen sind normale Zeilen der Sicht (Zellen/Zeilen/Bereiche).
- Copy/Excel: Gruppenzeile = Label in der Gruppenspalte (ohne Einrückungszeichen) und rohe Aggregate (Zahlen bleiben
  Zahlen), Detailzeilen ihre Werte. Ausgeblendete (gruppierte) Spalten lässt der Excel-Export weg wie jede ausgeblendete
  Spalte – ihr Wert steht im Gruppenlabel. Excel-Gliederung (Outline) kann der eigene Writer nicht: offener Punkt in `TODO.md`.

### 2.13 Performance (Frage 13)

Ziel 1 Mio. Zeilen, 2 Ebenen, 3 Aggregate < 1 s (Node) – Bench `packages/table/bench/row-group.bench.ts` (außerhalb von
`src/`, nicht in der Coverage). Ergebnis: § 4. Konstante Zeilenhöhe bleibt (`getConstantRowHeight` des Baums).

### 2.14 Sicherheit (Frage 14)

Schlüssel, Labels und der Kopf der Gruppenspalte kommen aus Daten bzw. Optionen und landen **nur als Text** im DOM
(Label ohne Renderer → `createText`, Aggregate → `AggregateCellRenderer` → Textknoten). Browser-Test mit
`<img src="x" onerror=…>` als Gruppenschlüssel und als `label`.

### 2.15 Doku-Kategorie (Frage 16)

Neue Kategorie **„Row grouping“** in `typedoc.json` direkt hinter „Aggregation“ (005 hat „Aggregation“ gewählt; eine
gemeinsame Kategorie würde 005 umsortieren). Pivot (007) kommt dahinter.

### 2.16 Training, Demo-Repo, Video (Frage 17)

| Phase | Entscheidung |
|---|---|
| 5 Demo | `createRowGroupModel(…)` in `demo-table-models` (Bestellungen, fester Seed, Land › Stadt, Summen), `apps/table-demo/row-grouping.html` (Umschalter). Angular-Demo: Route folgt nach dem Release (nutzt npm-Pakete) – Hinweis in `apps/angular-table-demo/instructions.md` |
| 6 Website | Showcase `rowgrouping`; Feature-Liste; `why.astro`: Zeile „Row grouping / pivot“ aufteilen („Row grouping“ ✔, „Pivot tables“ –); `build-buy-or-guiexpert`, `checklist` (Gruppenleiste per Drag & Drop fehlt weiter), `tree-table` (Hinweis); **kein Deploy** |
| 7 Training | **Option A**: neues Kapitel **36 `row-grouping`** in Teil 8 („Beyond the basics“), hinten angehängt – keine Umnummerierung. Pivot folgt als 37 |
| 8 Demo-Repo | **Option A**: neue Folge `ep-036` im bestehenden Repo `krocon/guiexpert-table-step-by-step-demo`. Das Repo nutzt die npm-Pakete → Commit/Tag erst **nach** dem Release 1.1.94 und nur nach Freigabe; hier nichts angelegt |
| 9 Video | `videos/07-row-grouping/` – „Row Grouping in 60 Sekunden – ohne Enterprise-Lizenz“ |

## 3. Beispiele (video-tauglich)

```ts
// R1 – nach Region, Summe Umsatz (+ Gesamtzeile)
const tableModel = RowGroupFactory.createTableModel<Sale>({
  rows: sales, columnDefs,
  groupBy: ["region"],
  aggregations: { umsatz: "sum" }
});
// ▾ Nord (3) … 270 | A Jan 100 | B Jan 50 | A Feb 120 | ▾ Süd (3) … 180 | … | Footer "6 rows" … 450
```

```ts
// R2 – zwei Ebenen
groupBy: ["region", "produkt"], aggregations: { umsatz: "sum" }
// ▾ Nord (3) 270 | ▾ A (2) 220 | Jan 100 | Feb 120 | ▾ B (1) 50 | … | ▾ Süd (3) 180 | ▾ A (2) 110 | ▾ B (1) 70 | Gesamt 450
```

```ts
// R3 – Mittelwert: aus Summe + Anzahl, nie aus fertigen Gruppenwerten
groupBy: ["region", "produkt"], aggregations: { umsatz: "avg" }
// Nord: A 110, B 50, Nord 90 (nicht 80) · Süd: A 55, B 70, Süd 60 (nicht 62.5) · Gesamt 75
```

```ts
// R4 – Filter: dieselbe Funktion wie in der flachen Tabelle
tableOptions.externalFilterFunction = (sale: Sale) => sale.monat === "Jan";
tableApi.externalFilterChanged();
// Nord (2) 150 · Süd (1) 80 · Gesamt 230
```

```ts
// R5 – Klick auf "Umsatz" (absteigend) oder per Code
tableApi.sortByColumn(tableApi.getColumnIndex("umsatz"), "desc");
// Nord 270 vor Süd 180; in Nord: 120, 100, 50
```

```ts
// Accessor – Jahr › Monat aus einem Datum
groupBy: [
  { name: "year", label: "Year", value: (o: Order) => o.date.getFullYear(), order: "desc" },
  { name: "month", label: "Month", value: (o: Order) => o.date.getMonth(), format: m => MONTHS[m as number] }
]
```

```ts
// 🎬 Video-Snippet „Row Grouping in 60 Sekunden – ohne Enterprise-Lizenz“
const tableModel = RowGroupFactory.createTableModel<Order>({
  rows: orders,                                // 50.000 Bestellungen
  columnDefs,
  groupBy: ["country", "city"],
  aggregations: { quantity: "sum", total: "sum" },
  expanded: 0                                  // alle Gruppen zu
});
select.onchange = () => tableApi.setRowGroupBy(select.value.split(","));   // umgruppieren zur Laufzeit
```

## 4. Messung, Funde, Review

### Messung (`pnpm --filter @guiexpert/table bench`, Container mit 2 vCPU, Node 22)

| 1 Mio. Zeilen, 2 Ebenen (20 × 25 Gruppen), 3 Aggregate | Median |
|---|---|
| Engine `groupRows` + `aggregateRowGroups` | **~0,64 s** (Ziel < 1 s ✔) |
| `AreaModelRowGroups` komplett (Gruppen + 1 Mio. `TreeRow`s + Aggregate) | ~1,2–1,4 s |
| dto. + Filter (halbe Zeilen) | ~1,2 s |

Das Modell liegt im Container über 1 s: je Datenzeile entsteht eine `TreeRow` (Baum-Pipeline) – auf einem
Desktop-Rechner (M-Klasse) etwa halb so lang; im Bench auf dem Mac nachmessen. Vitest 5 hat kein `bench()` mehr: die
Bench-Datei `bench/row-group.bench.ts` misst mit `performance.now()` (eigene Config `bench/vitest.bench.config.ts`,
Script `bench`), ohne Zeit-Assertions. Paketgröße `packages/table/dist`: 1.503.393 → 1.598.246 Byte, `index.js`
555.960 → 587.914 Byte (gzip 137.220 → 146.013).

### Funde in bestehendem Code

- Die Website nutzt für die Showcases eine eigene Kopie des Tabellen-CSS (`apps/webpage-guiexpert/src/styles/ge-table.css`).
  Dort fehlten auch die Footer-Klassen aus 005 (`ge-table-footer-aggregate`/`-label`) – nachgetragen, zusammen mit den
  Row-Grouping-Klassen. Auf Dauer sollte die Seite das CSS des Pakets laden (`TODO.md`).

### Abschluss-Review (separater Agent, 15.10.2026) und Korrekturen

Ein Agent, der den Code nicht geschrieben hat, hat den Diff mit Skripten und Browser-Tests geprüft. Bestätigt:
Aggregation über Ebenen (sum, avg, min, max, countDistinct), kein Kind-Zustand wird beim Merge verändert, Pfad-Neuberechnung
nach Edit = volle Neuberechnung, Filter + Sortierung + Umgruppieren + Zustand, Escaping, nur additive API-Änderungen,
Export-Snapshot nur Zugänge, Engine taugt für Pivot. Korrekturen (je mit Test):

| Fund | Korrektur |
|---|---|
| `updateCells` mit geändertem Gruppierfeld, gleiche Zeilenzahl: DOM veraltet (Labels, Zeilen an falscher Stelle) | Entscheidung über `getBuildCount()` statt Zeilenzahl → `repaintHard` |
| mehrere `updateCells`-Events: nach dem Umzug einer Zeile trafen spätere Events falsche Zeilen | `AreaModelRowGroups.batch(fn)`: Umzüge erst am Ende des Batches; `RenderScope.updateCells` nutzt es |
| `first`/`last` über Ebenen hingen von der Anzeige der Gruppen ab, die Blätter aber von der Quellreihenfolge | einheitlich „Sicht“ (s. § 2.1), nach Sortieren neu gerechnet |
| `order: "insertion"` ließ die leere Gruppe nicht ans Ende | auch hier am Ende (stabiler Sort) |
| `ensureAggregates` erzeugte je Zellzugriff eine Closure | erst nach der Prüfung „nichts zu tun“ |
| Ids von Objekt-/Symbol-Schlüsseln nur je Seitenaufruf stabil | dokumentiert (`RowGroupIf.id`) |

Offen (in `TODO.md`): blendet der Anwender eine gruppierte Spalte selbst aus, zeigt das Umgruppieren sie wieder an;
jedes `setValue` außerhalb eines Batches mit geändertem Gruppierfeld baut neu auf (O(n log n)).
