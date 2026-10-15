# Design 007 – Pivot-Tabellen

> Prompt: `prompts/007-pivot.md` · Branch `feat/pivot` · Zielversion **1.1.94** (`since`; `packages/table/package.json`
> steht auf 1.1.93, 005 und 006 erscheinen ebenfalls mit 1.1.94) · Stand 15.10.2026. Voraussetzungen 005 (Aggregation)
> und 006 (Row Grouping) sind auf `main`.
> **Selbständig umgesetzt** (Auftrag „arbeite selbständig an prompts/007-pivot.md“, 15.10.2026, wie bei 004–006):
> Claude hat die Empfehlungen aus § 2 übernommen, ohne die Freigabe abzuwarten. Jede Entscheidung ist begründet und
> lässt sich vor dem Merge noch ändern.

---

## 1. Bausteine

| Baustein | wofür im Pivot | Befund | Änderung |
|---|---|---|---|
| Aggregatoren (005: `AggregatorIf` `init/add/merge/result`, `Aggregators`, `getAggregator`, `formatAggregateValue`) | Zellwerte, Zwischen- und Gesamtsummen | `merge` ändert `b` nie, `avg` = `{ sum, count }` → Fall 3 stimmt per Konstruktion | **passt** unverändert |
| `resolveAggregateSpec` / `createValueGetter` (005, intern) | Wertfelder (Pfad oder Funktion) | passt | – |
| `groupRowsResolved` (006, intern) | Zeilenschlüssel **und** Spaltenschlüssel | ein Durchlauf, verschachtelte `Map`s, leere Schlüssel = eine Gruppe am Ende, `Date` nach Zeit, `1` ≠ `'1'`, Blätter mit Quellindizes | **passt**: zweimal aufgerufen (Zeilen, Spalten) |
| `RowGroup` (006) | Zeilen- und Spaltenknoten (`key`, `label`, `path`, `id`, `children`, `getRows()`) | `results`/`count` sind für Pivot nicht sinnvoll (eine Zeile hat viele Werte) | **passt**: Pivot hängt die Zellzustände an eigene Strukturen, `RowGroup` bleibt Schlüssel- und Hierarchieträger |
| `RowGroupField` / `RowGroupFieldIf` (006) | `rowFields`, `columnFields` (Pfad, Funktion, `label`, `format`, `order`) | genau die nötige Form (Quartal aus Datum, Monate in Kalenderreihenfolge) | **passt** – gleiche Konfiguration wie Row Grouping |
| `AreaModelTree` | Body mit auf-/zuklappbaren Gruppen | Pipeline alle → sichtbar → Filter, `doSort`/`sort` je Ebene | **passt**: `AreaModelPivot extends AreaModelTree` (`type` bleibt `"AreaModelTree"`, Erkennung über `kind`) |
| `RowGroupColumnDef` (006) | Spalte mit Pfeil + Label | Property `"RowGroupColumn"`, fixiert, Kopf aus Ebenennamen | **passt**: wird wiederverwendet (`showCount` Default `false` im Pivot) |
| `AreaModelCellGroups` + `CellGroupIf` (Header-Gruppen) | mehrstufige Header (Jahr › Monat, Monat › Wert) | Spannweiten, Toggle (`visibility: "always"` bleibt beim Zuklappen sichtbar), Ids für den Zustand; `groups` ist `readonly`, Neuaufbau nur über den Konstruktor | **erweitern (additiv)**: `setGroups(groups)` – baut Gruppen und Spalten neu (für `setPivotConfig`) |
| `TableModel` | Spalten, Fixierung | `columnCount` geschützt, `fixedLeft/RightColumnCount` `readonly`, Zugriff überall über Getter | **Unterklasse** `PivotTableModel` (Getter überschrieben, Spalten austauschbar) – an `TableModel` ändert sich nichts |
| Footer `AreaModelAggregateFooter` (005) | Gesamtzeile | aggregiert die Zeilen der Sicht – für Pivot falsch (`avg` der Pivot-Zeilen ≠ `avg` der Quellzeilen) | **nicht verwendet**: eigener `AreaModelPivotFooter` liest die Gesamtsummen der Engine |
| `RenderScope.applyCellAria` | `rowheader` für Labels | Sonderfälle für Zeilennummer, Footer-Label, Gruppenlabel | **erweitern (additiv)**: optionales `AreaModelIf.isRowHeaderCell?(rowIndex, columnIndex)` – Pivot-Body und -Footer nutzen es |
| Filter (`externalFilterFunction`, `api.externalFilterChanged()`) | Quellfilter | wie in 006: Prädikat bekommt die **Quellobjekte** | **passt** (s. § 2.7) |
| Sortierung (`doSort`, `api.sort`) | Gruppen nach Schlüssel oder nach Zellwert | `AreaModelTree.doSort` sortiert Geschwister | **passt**: eigenes `doSort` mit Pivot-Vergleich |
| Export (`downloadExcel`, `copyToClipboard`) | Pivot-Sicht | liest `getValueAt` aller Areas; Header-Gruppen als `CellGroupExt` (`toString()` = Label) | **passt** ohne Zusatzarbeit (Browser-Test) |
| Persistenz (`TableStateService`) | auf-/zugeklappte Zeilen, Header-Gruppen, Spaltenbreiten | Gruppen-Id = `RowGroup.id`, Header-Gruppen über `CellGroupIf.id`, Spalten über die Property | **passt** (stabile Properties, § 2.4) |
| `TableScope.headerGroupsChanged()` (`firstInit()`) | Neuaufbau nach Spaltenänderung | baut das Layout neu, Listener bleiben | **passt** als Muster für `setPivotConfig` |

**Breaking Changes:** keine. Neue Dateien/Klassen, `AreaModelCellGroups.groups` nicht mehr `readonly` + neue Methode
`setGroups`, ein optionales Interface-Member (`isRowHeaderCell?`), zwei neue API-Methoden (`setPivotConfig`,
`getPivotConfig`), zwei neue `is…`-Funktionen (`isAreaModelPivot`, `isPivotTableModel`).

## 2. Entscheidungen

### 2.1 Eingabe (Frage 1) → Konfiguration wie Row Grouping, Felder = `RowGroupField<T>`, mehrere Werte

```ts
// pivot/pivot-value.type.ts
export type PivotValue<T = any> = ValueAccessor<T> | PivotValueIf<T>;   // "umsatz" = Summe von umsatz
export interface PivotValueIf<T = any> {
  value: ValueAccessor<T>;               // "umsatz", "address.zip" oder (o) => o.quantity * o.price
  aggregator?: AggregatorRef;            // Default "sum" – Name aus 005 oder eigener AggregatorIf
  name?: string;                         // Id (Spalten-Property, Zugriff); Default "sum(umsatz)"
  label?: string;                        // Kopf der Wertspalten; Default = name
  format?: (result: unknown) => string;  // Text; Excel bekommt die Zahl. Default formatAggregateValue
}

// pivot/pivot-config.if.ts
export interface PivotConfigIf<T = any> {
  rowFields: RowGroupField<T>[];         // ≈ groupBy aus 006 – gleiche Form (Pfad, Funktion, label/format/order)
  columnFields?: RowGroupField<T>[];     // Werte werden zu Spalten; mehrere = mehrstufiger Header. Default []
  values: PivotValue<T>[];               // ≥ 1
  subtotals?: boolean;                   // Werte in den Gruppenzeilen (Zwischensummen). Default true
  columnSubtotals?: boolean;             // je Spaltengruppe eine Summenspalte (+ zuklappbar). Default: ≥ 2 Spaltenfelder
  totalColumn?: boolean | "fixed";       // Gesamtspalte(n) rechts. Default "fixed" (fixiert)
  totalRow?: boolean;                    // Gesamtzeile im Footer. Default true
  maxColumns?: number;                   // Obergrenze der Spaltenschlüssel (Blätter). Default 1000
  expanded?: RowGroupExpanded<T>;        // wie 006. Default true
  emptyLabel?: string;                   // Label leerer Schlüssel. Default "(empty)"
  emptyText?: string;                    // Text einer Kombination ohne Daten. Default "" (Wert bleibt undefined)
  totalLabel?: string;                   // "Total" (Kopf der Gesamtspalte, Label der Gesamtzeile, Suffix der Summenspalten)
}
```

- **Felder:** Pfad **oder** Accessor (Quartal aus Datum) – das ist `RowGroupField` aus 006 (`ValueAccessor` + `label`,
  `format`, `order`). Anwender können `groupBy` 1 : 1 als `rowFields` übernehmen. Generik `create<T>` typisiert die
  Accessoren; Pfade bleiben `string` (wie 005/006).
- **Werte:** immer eine Liste (`values`). Kurzform `"umsatz"` = Summe – damit ist der Ein-Wert-Fall so kurz wie
  `valueField` + `aggregate`, und es gibt nur **eine** Schreibweise. Bei mehreren Werten bekommt jeder Spaltenschlüssel
  Unterspalten (`Jan › sum(umsatz)`, `Jan › count`).
- **Aggregationen:** die aus 005, unverändert (`sum`, `count`, `avg`, `min`, `max`, `countDistinct`, `first`, `last` oder
  ein eigener `AggregatorIf`). Nicht-Zahlen bei `sum`/`avg` werden ignoriert (Regel aus 005, Text wird nie umgewandelt).

### 2.2 Engine (Frage 10, 12) → `src/lib/table/pivot/`, DOM-frei

```ts
pivotRows<T>(rows: ArrayLike<T>, config: PivotConfigIf<T>, accept?: (sourceIndex: number) => boolean): PivotResult<T>;

class PivotResult<T> {
  readonly rowGroups: RowGroup<T>[];        // Zeilenhierarchie (Top-Ebene)
  readonly columnGroups: RowGroup<T>[];     // Spaltenhierarchie (Top-Ebene)
  readonly columnLeaves: RowGroup<T>[];     // Spaltenschlüssel der untersten Ebene (nach maxColumns)
  readonly values: ResolvedPivotValueIf[];  // name, label, aggregator, format
  readonly truncated: boolean;              // maxColumns überschritten
  getValue(row?: RowGroup<T>, column?: RowGroup<T>, value?: number | string): unknown;  // undefined = keine Daten
  getCount(row?: RowGroup<T>, column?: RowGroup<T>): number;
  getSourceRows(row?: RowGroup<T>, column?: RowGroup<T>): T[];                       // Drill-down
}
```

- `row`/`column` weglassen = Gesamt in dieser Richtung: `getValue(nord)` = Zeilensumme Nord, `getValue(undefined, jan)` =
  Spaltensumme Jan, `getValue()` = Gesamtsumme.
- **Ablauf:** `groupRowsResolved` für die Zeilen- und für die Spaltenfelder (Reihenfolge, Labels, Ids aus 006). Ein
  `Int32Array` ordnet jeder Quellzeile ihr Spaltenblatt zu. Dann **ein Durchlauf** über die Quellzeilen jedes
  Zeilenblatts: `add` in die Zelle (Zeilenblatt × Spaltenblatt) und in die Zeilensumme. Darüber nur `merge`:
  Spaltengruppen = Merge ihrer Kinder (in Spaltenrichtung), höhere Zeilengruppen und die Gesamtzeile = Merge der
  Kind-Zeilen (in Zeilenrichtung). Feste Reihenfolge: **erst Spalten-, dann Zeilenrichtung**, Kinder in Anzeigereihenfolge
  – das legt `first`/`last` eindeutig fest (§ 4 aus 006).
- **Sparse:** Zellen liegen je Zeilenknoten in einer `Map<Spaltenknoten, Zustand>`; eine Kombination ohne Daten hat
  keinen Eintrag → `undefined` (**nicht 0**). Speicher = belegte Kombinationen, nicht Zeilen × Spalten.
- Verschachtelte `Map`s statt String-Schlüssel mit Trennzeichen (aus 006): `'a|b'` vs. `'a'` + `'|b'` kollidiert nicht.
- Die Zeilensumme (Gesamtspalte) zählt **alle** Zeilen der Gruppe, auch die von gekappten Spalten (§ 2.4) – Summen
  stimmen immer.

### 2.3 Ausgabe (Frage 2) → `PivotTableModel` (ein `TableModelIf`) mit Metadaten am Body

```ts
PivotFactory.createTableModel<T>(para: PivotTableModelParaIf<T>): PivotTableModel<T>;

class PivotTableModel<T> extends TableModel {        // ist ein TableModelIf – alle Wrapper nehmen es
  readonly kind = "PivotTableModel";
  getPivotConfig(): PivotConfigIf<T>;
  setPivotConfig(changes: Partial<PivotConfigIf<T>>, rows?: T[]): void;   // baut Spalten/Header/Body/Footer neu (s. 2.7)
  getPivotBody(): AreaModelPivot<T>;          // neue Zeilen: setPivotConfig(changes, rows)
}

class AreaModelPivot<T> extends AreaModelTree<RowGroup<T>> {
  readonly kind = "AreaModelPivot";
  getResult(): PivotResult<T>;                                     // Spalten-/Zeilenschlüssel, Werte, truncated
  getRowGroup(rowIndex): RowGroup<T> | undefined;
  getColumnInfo(columnIndex): PivotColumnInfoIf | undefined;       // { kind: "value" | "subtotal" | "total", column?, value }
  getCellSourceRows(rowIndex, columnIndex): T[];                   // Drill-down einer Zelle
  getColumnProperty(columnPath: unknown[], value?: number | string): string | undefined;   // für sortByColumn …
}
```

Empfehlung `TableModelIf` + Metadaten am Modell statt eines getrennten `PivotResult`-Rückgabewerts: Wrapper,
`tableApi.getTableModel()` und alle Beispiele bleiben gleich; wer Drill-down will, holt den Body
(`model.getPivotBody()`), und die DOM-freie Engine `pivotRows()` gibt es zusätzlich für Rechnen ohne Tabelle.

### 2.4 Spalten (Frage 4)

- **Reihenfolge:** `order` des Spaltenfelds (aus 006: `"asc"` Default, `"desc"`, `"insertion"`, eigener Comparator – z. B.
  Monate in Kalenderreihenfolge). Leere Schlüssel immer zuletzt.
- **Mehrstufiger Header** (`AreaModelCellGroups`): eine Header-Zeile je Spaltenfeld + eine für die Wertnamen, wenn es
  mehrere Werte gibt. Die Gruppenspalte und die Gesamtspalte reichen über alle Zeilen. Ein Feld + ein Wert = eine
  Header-Zeile (`Jan`, `Feb`, `Total`).
- **Summenspalten:** `columnSubtotals` (Default bei ≥ 2 Spaltenfeldern) hängt hinter jede Spaltengruppe eine Spalte
  `2026 Total` (`visibility: "always"`); die Gruppe bekommt dann einen Toggle: zugeklappt bleibt nur die Summenspalte
  (ag-Grid-Muster). Breiten bleiben beim Zuklappen (die `ColumnDef`s werden wiederverwendet). Ohne Summenspalte gibt es
  keinen Toggle (eine zugeklappte Gruppe hätte keine Spalte mehr).
- **Labels:** `format` des Felds bzw. Default-Text aus 006; Wertkopf = `label` bzw. `name` (`"sum(umsatz)"`). Alles nur als
  **Text** im DOM (Header-Renderer escaped, Werte über Textknoten).
- **Properties** (stabil, Grundlage von Zustand, `getColumnIndex`, Sortierung): `pivot:` + JSON aus typisierten Schlüsseln
  des Spaltenpfads + Wertname, z. B. `pivot:["s:Jan","sum(umsatz)"]`; Summenspalte `pivot:subtotal:[…]`, Gesamtspalte
  `pivot:total:["sum(umsatz)"]`. Bequem über `body.getColumnProperty(["Jan"])`.
- **`maxColumns`** (Default 1000 Spaltenschlüssel der untersten Ebene): Optionen Fehler / Kappen / „Sonstige“.
  **Empfehlung Kappen + `console.warn` + `result.truncated`**: ein Fehler macht eine Seite mit Anwender-Konfiguration
  unbenutzbar; „Sonstige“ verfälscht die Spaltenlogik (eigene Spalte mit gemischten Schlüsseln). Gesamtspalte,
  Summenspalten und Gesamtzeile rechnen trotzdem über **alle** Zeilen (gekappte Schlüssel werden berechnet, nur nicht als
  Spalte gezeigt) – nichts fehlt in den Summen, nur Spalten in der Mitte.

### 2.5 Zeilen (Frage 3)

- **Baum** (`AreaModelTree`) ab einem Zeilenfeld: ein Feld = flache Liste (keine Pfeile, Blätter ohne Kinder), mehrere
  Felder = Hierarchie mit Pfeil und Einrückung (wie 006). Kein Detail: Pivot zeigt **keine** Quellzeilen.
- **Zwischensummen:** in der Gruppenzeile selbst (Fall 2, ag-Grid-Default); `subtotals: false` lässt die Gruppenzeilen leer.
  Zwischensummen **unten** (eigene Zeile) sind nicht Teil dieses Prompts (`TODO.md`).
- **Ohne Zeilenfelder** (`rowFields: []`): eine einzige Zeile „Total“ im Body, kein Footer.
- **Sortierung:** Gruppen nach Schlüssel (`order` des Felds) zu Beginn. Header-Klick auf eine Wertspalte → Geschwister
  jeder Ebene nach dem Zellwert (leere Zellen zuletzt), auf die Gruppenspalte → nach Schlüssel. `api.sort(fn)` vergleicht
  zwei `RowGroupIf`.
- **Auf-/Zuklappen:** `expanded` wie 006 (`true`, `false`, Ebene als Zahl, Funktion), `expandAll()`/`collapseAll()`,
  Persistenz über `RowGroup.id`.

### 2.6 Summen und Leeres (Frage 5, 6)

- Gesamtspalte(n) rechts, **fixiert** (Default `"fixed"`), Gesamtzeile im Footer (`totalRow`), Gesamtsumme = rechte
  untere Footer-Zelle; alles einzeln abschaltbar (`totalColumn: false | true`, `totalRow: false`, `subtotals: false`).
- Fehlende Kombination: Zellwert `undefined` (Excel: leere Zelle), Anzeige `emptyText` (Default `""`, z. B. `"–"`).
- Leere Schlüssel (`null`/`undefined`/`''`) bilden eine Gruppe mit `emptyLabel` (006-Regel) – für Zeilen **und** Spalten.

### 2.7 Filter und Neuberechnung (Frage 7, 11) → Quellfilter + `tableApi.setPivotConfig()`

- `externalFilterFunction` bekommt – wie in 006 – das **Quellobjekt**: `(sale) => sale.monat === "Jan"` wirkt **vor**
  der Aggregation, alle Zellen und Summen folgen. Dieselbe Funktion funktioniert flach, gruppiert und pivotiert. Ein
  Filter auf fertige Pivot-Zeilen („nur Regionen > 200“) wäre eine zweite Semantik derselben Option – er geht über
  `subtotals` + Sortierung bzw. eine eigene Vorfilterung der Quelle; nicht Teil dieses Prompts.
- Spalten folgen dem Filter **nicht** (stabile Spaltenliste, keine Neuanordnung beim Tippen): Spaltenschlüssel kommen
  immer aus **allen** Quellzeilen, Spalten ohne Treffer bleiben leer.
- **Neu pivotieren ohne neues Modell:** `tableApi.setPivotConfig({ columnFields: ["jahr"] })` – Optionen
  (a) neues Modell (in allen Wrappern ein Neuaufbau: Scrollposition, Fokus, Listener weg) oder (b) Umbau im Modell.
  **Empfehlung (b):** `PivotTableModel.setPivotConfig` baut Spalten, Header (`AreaModelCellGroups.setGroups`), Body und
  Footer **in denselben Objekten** neu; `TableScope.setPivotConfig` setzt Sortierung und Selektion zurück (Indizes
  passen nicht mehr), baut die Span-Modelle neu und ruft `firstInit()` (wie beim Zuklappen einer Header-Gruppe).
  Auf-/Zu-Zustand gleicher Zeilenpfade, Filter und Spaltenbreiten gleicher Properties bleiben. Damit braucht eine
  spätere Drag-&-Drop-Feldliste (Frage 11, außerhalb des Scopes) nur diese eine Methode.
- Daten von außen geändert: `tableApi.repaint()` (ruft `invalidateDerivedValues()` → Neuberechnung mit denselben
  Schlüsseln; ein Filter wird bei geänderter Zeilenzahl neu angewendet); neue Schlüssel oder neue Zeilen →
  `tableApi.setPivotConfig({}, rows)`.
- Pivot-Zellen sind **nicht editierbar** (berechnete Werte).

### 2.8 Darstellung (Frage 8)

- Wertzellen: `AggregateCellRenderer` (Textknoten, rechtsbündig, `tabular-nums`) mit `format` des Werts bzw.
  `formatAggregateValue` (005, z. B. `76.67`).
- CSS-Klassen: `ge-table-pivot-value` (jede Wertzelle), `ge-table-pivot-subtotal` (Gruppenzeilen und Summenspalten),
  `ge-table-pivot-total` (Gesamtspalte und Footer), `ge-table-pivot-label` (Label in der Gruppenspalte),
  `ge-table-pivot-empty` (keine Daten), `ge-table-pivot-level-N`; Header: `ge-table-pivot-header`.
- CSS-Variablen in light **und** dark: `--ge-table-pivot-subtotal-bg`, `--ge-table-pivot-total-bg`,
  `--ge-table-pivot-total-font-weight`, `--ge-table-pivot-empty-text`. Logische CSS-Eigenschaften (RTL, Prompt 012).

### 2.9 Sicherheit (Frage 9)

Zeilen- und Spaltenschlüssel, Labels und Wertnamen kommen aus Daten bzw. Optionen. Body-Label: Textknoten
(`createText`), Werte: `AggregateCellRenderer`, Header: `CellGroupExtCellRenderer` mit `escapeHtml`. Browser-Test mit
`<img src="x" onerror=…>` als Zeilen- **und** als Spaltenschlüssel.

### 2.10 Performance (Frage 10)

Ziel 1 Mio. Quellzeilen < 1 s (Node), Bench `packages/table/bench/pivot.bench.ts` (außerhalb von `src/`, nicht in der
Coverage). Ergebnis: § 4.

### 2.11 Ablage und Doku-Kategorie (Frage 12)

`src/lib/table/pivot/` (Engine, Typen, Spalten-Infos, `PivotTableModel`), `factory/pivot-factory.ts`,
`data/tablemodel/areamodel/area-model-pivot.ts` und `…-pivot-footer.ts`. Neue typedoc-Kategorie **„Pivot“** direkt
hinter „Row grouping“ (wie 006 hinter „Aggregation“).

### 2.12 Training, Demo-Repo, Video (Frage 13)

| Phase | Entscheidung |
|---|---|
| 5 Demo | `createPivotModel(…)` in `demo-table-models` (Bestellungen, fester Seed, Land › Stadt × Jahr › Quartal, Summe + Anzahl), `apps/table-demo/pivot.html` (Umschalter Spaltenfeld). Angular-Demo: Route nach dem Release (nutzt npm-Pakete) – Hinweis in `apps/angular-table-demo/instructions.md` |
| 6 Website | Showcase `pivot`; Feature-Liste; `why.astro`: Zeile „Pivot tables“ ✔ (ag-Grid: Enterprise); `build-buy-or-guiexpert`, `checklist` („kein Pivot“ korrigiert, Drag-&-Drop-Feldliste fehlt weiter); **kein Deploy** |
| 7 Training | **Option A**: neues Kapitel **37 `pivot-tables`** in Teil 8 („Beyond the basics“) direkt nach `row-grouping` (36) – keine Umnummerierung |
| 8 Demo-Repo | **Option A**: Folge `ep-037` im bestehenden Repo `krocon/guiexpert-table-step-by-step-demo`. Das Repo nutzt die npm-Pakete → Commit/Tag erst **nach** dem Release 1.1.94 und nur nach Freigabe; hier nichts angelegt |
| 9 Video | `videos/08-pivot-ohne-enterprise/` – „Pivot-Tabelle in 60 Sekunden – ohne Enterprise-Lizenz“ |

## 3. Beispiele (video-tauglich)

```ts
// Fall 1 – Zeilen region, Spalten monat, Summe umsatz
const tableModel = PivotFactory.createTableModel<Sale>({
  rows: sales,
  rowFields: ["region"],
  columnFields: [{ value: "monat", order: "insertion" }],   // Jan vor Feb
  values: ["umsatz"]                                       // = Summe
});
// Region | Jan | Feb | Total
// Nord   | 150 | 120 | 270
// Süd    |  80 | 100 | 180
// Total  | 230 | 220 | 450   (Footer)
```

```ts
// Fall 2 – Hierarchie mit Zwischensummen
rowFields: ["region", "produkt"], columnFields: [{ value: "monat", order: "insertion" }], values: ["umsatz"],
emptyText: "–"
// ▾ Nord 150 120 270 ·   A 100 120 220 ·   B 50 – 50 · ▾ Süd 80 100 180 ·   A 80 30 110 ·   B – 70 70 · Total 230 220 450
```

```ts
// Fall 3 – Mittelwert: aus Summe + Anzahl, nie aus fertigen Zellen
values: [{ value: "umsatz", aggregator: "avg" }]
// Jan: Nord 75 · Süd 80 · Total 76.67 (230 / 3) – nicht 77.5
```

```ts
// Zwei Spaltenfelder – Jahr › Quartal aus einem Datum, Jahressummen, Jahre zuklappbar
columnFields: [
  { name: "year", label: "Year", value: (o: Order) => new Date(o.date).getFullYear() },
  { name: "quarter", label: "Quarter", value: (o: Order) => Math.floor(new Date(o.date).getMonth() / 3) + 1,
    format: q => `Q${q}` }
]
// Header: 2025 (Q1 Q2 Q3 Q4 | 2025 Total) 2026 (…) | Total
```

```ts
// Zwei Wertfelder – Unterspalten je Monat
values: [{ value: "umsatz", label: "Sum" }, { value: "umsatz", aggregator: "count", label: "Count" }]
// Header: Jan (Sum Count) Feb (Sum Count) Total (Sum Count) · Nord: 150 2 | 120 1 | 270 3
```

```ts
// 🎬 Video-Snippet „Pivot-Tabelle in 60 Sekunden – ohne Enterprise-Lizenz“
const tableModel = PivotFactory.createTableModel<Order>({
  rows: orders,                                   // 50.000 Bestellungen
  rowFields: ["country", "city"],
  columnFields: [{ value: o => new Date(o.date).getFullYear(), label: "Year" }],
  values: [{ value: "total", label: "Revenue" }],
  expanded: 0
});
select.onchange = () => tableApi.setPivotConfig({ columnFields: [select.value] });   // neu pivotieren
```

## 4. Messung, Funde, Review

### Messung (`pnpm --filter @guiexpert/table bench`, Container mit 2 vCPU, Node 22, `bench/pivot.bench.ts`)

| 1 Mio. Quellzeilen | Median |
|---|---|
| `pivotRows`: Land × Jahr, Summe (20 × 6) | **~0,6 s** (Ziel < 1 s ✔) |
| `pivotRows`: Land › Stadt × Jahr › Quartal, Summe + Mittelwert (520 Zeilen- × 30 Spaltenknoten) | ~0,95 s (Ziel knapp ✔) |
| dto. neu rechnen mit Filter (halbe Zeilen) | ~0,3 s |
| `PivotFactory.createTableModel` (voll) | ~1,0 s |

Den Großteil kosten die zwei `groupRows`-Durchläufe aus 006 (Zeilen- und Spaltenfelder); auf einem Mac etwa halb so lang
(dort nachmessen). Paketgröße `packages/table/dist`: 1.603.101 → 1.711.018 Byte, `index.js` 590.099 → 628.479 Byte
(gzip 146.656 → 156.511) – inkl. Row Grouping/Aggregation-Stand von `main`, Differenz = Pivot.

### Funde in bestehendem Code

- **ARIA**: Zeilen-Divs eines Bereichs, deren Zellen alle von einem Span darüber verdeckt werden (zweite Header-Zeile der
  fixierten Gruppenspalte unter Header-Gruppen), hatten `role="row"` ohne Zellen → axe `aria-required-children`.
  `RenderScope.updateRowGroupRoles` gibt solchen Zeilen jetzt `role="presentation"` (Test: `pivot.browser.spec.ts` „ARIA“).
- Header-Gruppen: ein Doppelklick auf eine Gruppenzelle („2026“) sortiert nach der ersten Spalte der Gruppe; eine
  zugeklappte Gruppe zeigt ihren Pfeil in der unteren Header-Zeile; Gruppenzellen werden doppelt gezeichnet (Span-Zeile).
  Allgemeines Verhalten von `AreaModelCellGroups`, nicht behoben – `TODO.md`.

### Abschluss-Review (separater Agent, 15.10.2026) und Korrekturen

Ein Agent, der den Code nicht geschrieben hat, hat den Diff geprüft, u. a. mit einem Zufallsvergleich (60 Seeds, 0–2 Zeilen-
× 0–2 Spaltenebenen, Filter, `maxColumns`, alle 8 Aggregatoren gegen eine naive Rechnung) und einem Aggregator, der den
`merge`-Vertrag überwacht. Bestätigt: Aggregation (auch Mittelwert über Ebenen), `merge` ändert nie `b`, Escaping (Header über
`escapeHtml`, Body/Footer als Textknoten), nur additive API-Änderungen, ARIA-Änderung, keine Listener-Lecks beim
Neu-Pivotieren, Website-/Video-Aussagen sachlich. Korrekturen (je mit Test):

| Fund | Korrektur |
|---|---|
| `setPivotConfig` mit ungültiger Konfiguration (`values: []`) übernahm sie trotzdem → jeder weitere Teilaufruf warf | `configure` baut das Ergebnis zuerst; `TableScope` setzt Sortierung/Selektion erst nach Erfolg zurück |
| Zeilen in place ergänzt + `repaint()`: Filter fiel still weg | Filter wird bei geänderter Zeilenzahl neu angewendet |
| Summenspalte einer teilweise gekappten Spaltengruppe zählte nur die gezeigten Schlüssel | alle Schlüssel werden berechnet, nur die ersten `maxColumns` als Spalten gezeigt |
| `getColumnProperty([])` ohne Gesamtspalte lieferte eine Property ohne Spalte | `undefined` |
| nach `setPivotConfig`: Fokus auf entfernter Spalte, `api.sort(fn)` blieb aktiv, per API ausgeblendete Spalten kamen wieder | Fokus und Sortierfunktion werden zurückgesetzt, Ausblendung per Property übernommen |
| `first`/`last`: Zeilensumme (Quellreihenfolge) ≠ Summenspalte (Schlüsselreihenfolge) | dokumentiert (JSDoc `PivotResult`) |
| instructions.md „a click … sorts“ | „a double click“ |

Offen (in `TODO.md`): mit Filter kündigt `setPivotConfig` die Zeilenzahl erneut an (über `firstInit()`), und es wird
zweimal gefiltert.
