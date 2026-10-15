# Design 005 – Aggregation und Gesamtzeile

> Prompt: `prompts/005-aggregation-gesamtzeile.md` · Branch `feat/aggregation` · Zielversion **1.1.94** (`since`)
> Stand 15.10.2026. Abhängigkeit 001 (ARIA) ist auf `main` (Beschriftung der Gesamtzeile als `rowheader`).
> **Selbständig umgesetzt** (Auftrag „arbeite … selbständig“, 15.10.2026): Claude hat die Empfehlungen aus § 2
> übernommen, ohne die Freigabe abzuwarten. Jede Entscheidung ist unten begründet und lässt sich vor dem Merge noch
> ändern.

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `instructions.md` §5.4, Training `shared/order-totals-footer.ts` | Vorbild | eigenes `AreaModel`, liest `getFilteredRows()`, Spalten über die **Property**, Footer-Renderer der Spalte, Cache je Filterergebnis, `invalidate()` von Hand | wird zur eingebauten Klasse `AreaModelAggregateFooter`; die Demo stellt darauf um (Akzeptanztest) |
| `AreaModel` (Basisklasse) | Footer-Modell | Defaults für alles, `areaIdent` | passt: `AreaModelAggregateFooter extends AreaModel` |
| `AreaModelObjectArray.getFilteredRows()` / `getAllRows()` | Datenquelle flach | gefilterte Zeilen in Anzeige-Reihenfolge; `doSort`/`sort` sortieren **dasselbe Array** in place, Filter und `setRows` erzeugen ein neues | passt; Cache-Schlüssel Array + Länge reicht für Filter/`setRows`, Sortieren und Editieren brauchen eine Invalidierung (§ 2.5) |
| `AreaModelTree` | Datenquelle Baum | sichtbare Zeilen hängen vom Auf-/Zuklappen ab; `keep` markiert Filtertreffer (auch unter zugeklappten Knoten) | **erweitern**: `getLeafRows(filtered = true)` (additiv) – Blätter, die der Filter behält, unabhängig vom Aufklappen |
| eigene `AreaModel`s, `AreaModelArrayOfArrays` | Datenquelle sonst | keine Zeilenobjekte | Werte über `getValueAt(r, Spalte der Property)` (§ 2.4) |
| `TableModel.changeColumnOrder` | Spalten ziehen | verschiebt das **gemeinsame** `columnDefs`-Array in place | passt: der Footer liest `columnDefs[c].property` bei jeder Abfrage, braucht kein eigenes `changeColumnOrder` |
| `RenderScope.addAndRenderCellDiv` | Anzeige | ohne Renderer `${getValueAt}` → `76.66666666666667` | Footer liefert einen Renderer (Spalten-Footer-Renderer, sonst `AggregateCellRenderer` mit `getTextValueAt`) |
| `RenderScope.applyCellAria` | ARIA | `rowheader` nur für Zeilennummern | **erweitern**: Beschriftungszelle der Gesamtzeile → `rowheader` |
| `TableScope` (`externalFilterChanged`, `sortByColumn`, `sort`, `reSort`, `applySortItems`, `updateModelValueAfterEdit`), `RenderScope.updateCells`, `TableApi.repaint/repaintHard` | Invalidierung | keine | **erweitern**: `invalidateAggregates()` ruft das neue optionale `AreaModelIf.invalidateDerivedValues?()` aller drei Modelle |
| `AreaModelIf` | Invalidierung | – | `invalidateDerivedValues?(): void` – **optional, additiv** (spezifischer Name: ein vorhandenes `invalidate()` eigener Modelle soll nicht plötzlich aufgerufen werden) |
| `TableApi.downloadExcel` | Export | exportiert `getValueAt` aller Areas | passt: Footer liefert Zahlen (Excel kann damit rechnen) und die Beschriftung als Text |
| `ExcelService` | Formeln? | schreibt nur Zahlen und `inlineStr`, **keine Formeln** | keine Änderung (§ 2.8) |
| `SelectionModel` (`hasSelection`, `isAllSelected`, `getRanges`, `isSelected`), `CopyService.maxCopyCells` | Auswahl-Summen | Bounding-Box + `isSelected` je Zelle, Kappung 1 Mio. Zellen | gleiches Muster in `SelectionAggregator` |
| `TableFactory.createTableModel` | Komfort | `footerData` (statisch) oder `footerAreaModel` | **erweitern**: `footerAggregates` (additiv) |
| `instanceof-workaround.ts` | Erkennung | – | `isAreaModelAggregateFooter()` |

**Breaking Changes:** keine. Neue Dateien und Klassen, ein optionales Interface-Member, eine neue Fabrik-Option, zwei
neue API-Methoden (`getSelectionAggregates`, `AreaModelTree.getLeafRows`). `TableApi.repaint()` und
`repaintHard()` verwerfen zusätzlich die Summen-Caches (ohne Aggregat-Footer: keine Wirkung).

## 2. Entscheidungen

### 2.1 Aggregator-Interface (Frage 1) – gemeinsamer Kern für 006/007/008

```ts
// aggregation/aggregator.if.ts
export interface AggregatorIf<S = any, R = unknown> {
  readonly name: string;                 // "sum", "avg" … oder ein eigener Name
  init(): S;                             // Zustand der leeren Menge
  add(state: S, value: unknown): S;      // einen Wert aufnehmen (darf state ändern und zurückgeben)
  merge(a: S, b: S): S;                  // zwei Teilergebnisse vereinen (darf a ändern und zurückgeben)
  result(state: S): R;                   // Ergebnis
}
// aggregation/aggregator-name.type.ts
export type AggregatorName = "sum" | "count" | "avg" | "min" | "max" | "countDistinct" | "first" | "last";
export type AggregatorRef = AggregatorName | AggregatorIf;
```

- Eingebaut als Objekte in `Aggregators` (`Aggregators.sum` …), Auflösung über `getAggregator(ref)` (unbekannter
  Name → `Error` mit Liste der Namen).
- **Zustand statt Zahl**: `avg` merkt sich `{ sum, count }`, `merge` addiert beide → G4 ist korrekt (75, nicht Mittel
  der Mittel). Genau das braucht 006 (Gruppe = merge der Untergruppen) und 007 (Pivot-Zellen).
- `sum`/`avg` summieren mit **Neumaier-Kompensation** (`{ sum, c }`): 0,1 + 0,2 + … bleibt sauber, und das Ergebnis hängt
  praktisch nicht von der Aufteilung ab (wichtig für `merge`).
- `add`/`merge` dürfen den Zustand verändern (keine Allokation je Zeile bei Millionen Zeilen); wer Zustände
  wiederverwenden will, ruft `init()` neu.
- Ablage `src/lib/table/aggregation/` – DOM-frei, keine Abhängigkeit auf Area-Modelle.

### 2.2 Werte holen (Frage 2) → Property-Pfad **oder** Accessor, generisch

```ts
export type ValueAccessor<T = any> = string | ((row: T) => unknown);   // "address.city" | (o) => o.price * o.qty
export interface AggregateSpecIf<T = any> {
  aggregator: AggregatorRef;
  value?: ValueAccessor<T>;                       // Default: der Schlüssel als Property-Pfad
  format?: (result: unknown) => string;           // Anzeige im Footer (nicht Excel)
}
export type AggregateSpec<T = any> = AggregatorRef | AggregateSpecIf<T>;
export type AggregateSpecMap<T = any> = Record<string, AggregateSpec<T>>;

aggregate<T>(rows: ArrayLike<T>, value: ValueAccessor<T>, aggregator: AggregatorRef): unknown;
aggregateColumns<T>(rows: ArrayLike<T>, specs: AggregateSpecMap<T>): Record<string, unknown>;  // ein Durchlauf
createValueGetter<T>(value: ValueAccessor<T>): (row: T) => unknown;
```

Berechnete Spalten (008): der Accessor deckt sie heute ab. Kommt in 008 ein `ColumnDef.valueGetter`, löst der Footer
einen Schlüssel ohne `value` zuerst darüber auf (eine Stelle: `AreaModelAggregateFooter.getValueGetter(key)`).

### 2.3 Ungültige Werte (Frage 3, G6) → wie Excel: Text und Leeres ignorieren

| Aggregator | gültig | leer (G5) |
|---|---|---|
| `sum` | `typeof v === "number"` und nicht `NaN` | `0` |
| `avg` | wie `sum`; Nenner = Anzahl **gültiger** Werte | `undefined` |
| `min` / `max` | Zahlen (nicht `NaN`) und gültige `Date` (Ergebnis ist der Wert selbst, Vergleich über `valueOf`) | `undefined` |
| `count` | **jede Zeile** (der Wert spielt keine Rolle – braucht keine Spalte) | `0` |
| `countDistinct` | alles außer `null`/`undefined`; `Date` nach Zeitpunkt | `0` |
| `first` / `last` | Wert der ersten/letzten Zeile der Sicht, wie er ist (auch `null`) | `undefined` |

- Ziffern als Text (`"12"`) zählen **nicht** (wie Excels `SUMME` über einen Bereich). Wer Text-Zahlen hat:
  `value: o => Number(o.amount)`. Begründung: stilles Umwandeln würde `"1e3"`, `" 12 "`, `"0x1A"` mitzählen.
- `NaN` wird ignoriert (sonst wäre jede Summe `NaN`), `±Infinity` zählt (ist eine Zahl; Excel kennt es nicht, JS schon).
- G6 mit `umsatz = [100, null, undefined, '', 'abc', NaN]` → `sum` 100, `count` 6, `avg` 100, `min`/`max` 100,
  `countDistinct` 4 (`100, '', 'abc', NaN`).

### 2.4 Footer-Modell (Frage 4) → `AreaModelAggregateFooter`

```ts
export interface AggregateFooterRowIf<T = any> {
  aggregates: AggregateSpecMap<T>;                                       // Schlüssel = Property der Spalte
  label?: string | ((rowCount: number, results: Record<string, unknown>) => string);
}
export interface AggregateFooterOptionsIf<T = any> {
  rows: AggregateFooterRowIf<T>[];          // eine Gesamtzeile je Eintrag (G8)
  labelProperty?: string;                   // Spalte der Beschriftung; Default: erste Datenspalte ohne Aggregat
  rowHeight?: number;                       // Default 34 (Fabrik: defaultRowHeights.footer)
  source?: "filtered" | "all";              // Default "filtered" (folgt dem Filter)
  getRows?: (bodyModel: AreaModelIf) => ArrayLike<T>;   // eigene Datenquelle
}
export class AreaModelAggregateFooter<T = any> extends AreaModel {
  readonly type = "AreaModelAggregateFooter";
  constructor(body: AreaModelIf | (() => AreaModelIf), columnDefs: ColumnDefIf[],
              options: AggregateSpecMap<T> | AggregateFooterRowIf<T>[] | AggregateFooterOptionsIf<T>);
  getResults(rowIndex?: number): Record<string, unknown>;   // für eigene Anzeigen (Statusleiste, Titel …)
  getAggregationRowCount(): number;
  invalidateDerivedValues(): void;
  isLabelCell(rowIndex: number, columnIndex: number): boolean;
}
```

- **Datenquelle**: `getRows` › flach `getFilteredRows()` (bzw. `getAllRows()` bei `source: "all"`) › Baum
  `getLeafRows()` (Blätter, die der Filter behält – **nicht** die sichtbaren Zeilen: Zuklappen ändert die Summe
  nicht, Elternzeilen werden nicht doppelt gezählt) › sonst Zeilenindex 0 … `getRowCount()-1`, Wert über
  `getValueAt(r, Spalte der Property)`, Accessor-Funktionen bekommen `getRowByIndex(r)`.
- **Spalten über die Property**, nicht die Position (Spalten ziehen, Zeilennummern, Checkbox ändern nichts).
- **Anzeige**: Zellwert = rohes Ergebnis (Zahl → Excel rechnet weiter). Text über `getTextValueAt`: `format` der Spec,
  sonst Default (Zahl `toLocaleString("en-US", { maximumFractionDigits: 2 })` → `"76.67"`, `"1,234.5"`; `Date` →
  `toLocaleDateString("en-US")`; `undefined` → leer). Renderer: Footer-Renderer der Spalte (`rendererMap.footer`, bekommt
  den rohen Wert), sonst `AggregateCellRenderer` (Text als Textknoten → G12).
- **Beschriftung (G7/G8)**: Default `"6 rows"` (`"1 row"`); bei mehreren Zeilen, deren Aggregate alle denselben
  eingebauten Namen haben, dessen Wort (`"Sum"`, `"Average"`, `"Min"`, `"Max"`, `"Count"`, `"Distinct"`, `"First"`,
  `"Last"`). Spalte: `labelProperty`, sonst die erste Datenspalte (nach Zeilennummer/Checkbox) ohne Aggregat in dieser
  Zeile; hat jede Spalte ein Aggregat, gibt es keine Beschriftung.
- **Cache (G10)**: je Footer ein Ergebnis für alle Zeilen, ein Durchlauf über die Daten. Gültig, solange Quell-Array
  (Identität + Länge; Baum: Wurzel-Array, `getRows`: nur Invalidierung) gleich ist und kein `invalidateDerivedValues()` kam. Die Zeilen werden erst bei einem Cache-Fehlschlag geholt (der Baum wird nur dann durchlaufen). Scrollen rechnet nie neu.
- CSS: Wertzellen `ge-table-footer-aggregate` (rechtsbündig, `tabular-nums`), Beschriftung `ge-table-footer-label`
  (halbfett). Keine neuen Farben → keine neuen Variablen.
- ARIA: Beschriftungszelle `role="rowheader"` (der Screenreader sagt bei „Total: 450“ die Zeile „6 rows“ mit an).

### 2.5 Invalidierung (Frage 5) → automatisch an den Stellen, die die Tabelle kennt; `repaint()` für alles andere

`TableScope.invalidateAggregates()` ruft `invalidateDerivedValues?.()` an Header-, Body- und Footer-Modell. Aufgerufen bei:
Filter (`externalFilterChanged`), Sortieren (`sortByColumn`, `sort`, `reSort`, `applySortItems` – das Array wird in
place sortiert: `first`/`last`), Editieren (`updateModelValueAfterEdit`: vor dem Repaint **und** vor `onModelChanged`,
damit abgeleitete Werte, die die Anwendung im Callback nachrechnet, beim nächsten Repaint stimmen), `updateCells`
(ohne `repaintAll` werden die Footer-Zellen zusätzlich neu gezeichnet), **öffentliches** `api.repaint()` und
`api.repaintHard()`.

Nicht bei internem Repaint (Klick, Hover, Scrollen) → G10. Daten, die die Anwendung direkt im Zeilenobjekt ändert
(Live-Daten), sind nach `api.repaint()` richtig – dieselbe Regel wie für die Zellen selbst. `setRows`/`addRows`/
`removeRows` erzeugen ein neues Array → Cache-Schlüssel ändert sich ohnehin.

### 2.6 Komfort (Frage 6) → Fabrik-Option, **kein** `ColumnDef`-Feld

```ts
TableFactory.createTableModel({ rows, columnDefs, footerAggregates: { total: "sum", quantity: "sum" } });
```

`footerAggregates: AggregateSpecMap | AggregateFooterRowIf[] | AggregateFooterOptionsIf` baut einen
`AreaModelAggregateFooter` über dem Body (Zeilenhöhe `defaultRowHeights.footer`). Gründe gegen ein `ColumnDef`-Feld: der
Footer ist eine Sache der Tabelle, nicht der Spalte; mehrere Gesamtzeilen (G8) passen nicht in ein Feld je Spalte;
`ColumnDef`s werden oft zwischen Tabellen geteilt (Training `createOrderColumns`). Mit eigenem `footerAreaModel` wird die
Option ignoriert (Warnung); sie hat Vorrang vor `footerData` (Warnung). Funktioniert auch mit `rowNumbersVisible`
(Spalten über die Property).

### 2.7 Auswahl-Aggregate (Frage 7, G11)

```ts
export interface SelectionAggregatesIf {
  count: number;          // markierte Zellen (sichtbare Datenspalten; ohne Zeilennummer/Checkbox)
  numericCount: number;   // davon Zahlen
  sum: number;            // 0 ohne Zahlen
  avg?: number; min?: number; max?: number;
  capped: boolean;        // mehr als SelectionAggregator.maxCells Zellen: nichts gerechnet (alles 0/undefined)
}
tableApi.getSelectionAggregates(): SelectionAggregatesIf;
SelectionAggregator.maxCells = 1_000_000;   // wie CopyService.maxCopyCells
```

Bounding-Box der Bereiche (bzw. alles bei `selectAll`), je Zelle `isSelected` → negative Bereiche und Strg-Klick passen.
Werte über `getValueAt` (roh). Über der Kappung wird **nichts** gerechnet statt einer Teilsumme (eine falsche Summe wäre
schlimmer als keine). Statusleiste in plain HTML: `onSelectionChanged` → `getSelectionAggregates()` → `textContent`
(Beispiel in `instructions.md` und JSDoc). Nur Body.

### 2.8 Excel (Frage 8) → weiterhin Werte

Der eigene XLSX-Writer kennt keine Formeln (`<f>`). Werte bleiben: Zahlen als Zahlen, die Beschriftung als Text – die
Datei zeigt dasselbe wie die Tabelle. Formeln (`=SUBTOTAL(109, D2:D101)`) wären möglich, brauchen aber Formelzellen im
Writer und die Abbildung Spalte → Excel-Spalte; offener Punkt in `TODO.md`.

## 3. Beispiele (video-tauglich)

```ts
// G1/G3/G7 – eine Zeile Konfiguration; folgt Filter und Sortierung
const tableModel = TableFactory.createTableModel({
  rows: orders, columnDefs,
  footerAggregates: { quantity: "sum", total: "sum" }
});
// Footer: "100,000 rows" | … | 549,812 | 27,481,033.5   – Filter "berlin" → "6,512 rows" …
```

```ts
// G8 – zwei Gesamtzeilen mit eigener Beschriftung
footerAggregates: [
  { label: "Sum", aggregates: { quantity: "sum", total: "sum" } },
  { label: n => `Ø of ${n}`, aggregates: { quantity: "avg", total: { aggregator: "avg", format: v => `${(v as number).toFixed(2)} €` } } }
]
```

```ts
// G1/G4 – Helfer ohne Tabelle (auch für 006/007)
aggregateColumns(rows, { umsatz: "sum", region: "countDistinct", avg: { value: "umsatz", aggregator: "avg" } });
// → { umsatz: 450, region: 2, avg: 75 }
const avg = Aggregators.avg;
avg.result(avg.merge(nord, sued));   // 75 – nicht (90 + 60) / 2
```

```ts
// G11 – Statusleiste für die Auswahl
tableOptions.getSelectionModel = () => new SelectionModel("range", "multi");
eventListener.onSelectionChanged = () => {
  const a = tableApi.getSelectionAggregates();
  statusBar.textContent = a.numericCount ? `Count ${a.count} · Sum ${a.sum} · Avg ${a.avg?.toFixed(2)}` : "";
};
```

## 4. Phasen 4–9 (Entscheidung)

| Phase | Umfang |
|---|---|
| 4 Doku | JSDoc + `docs:check`, `instructions.md` §5.4 neu (eingebaute Lösung zuerst, eigenes Modell als Erweiterung), neuer Abschnitt Auswahl-Statusleiste, READMEs, `llms.txt` (beide), `CLAUDE.md`, `TODO.md` |
| 5 Demo | `apps/table-demo/aggregation.html` (Aufnahme-Seite: Filter, zwei Gesamtzeilen, Statusleiste). Keine neue Fabrik in `demo-table-models` (eine Option). Angular-Demo entfällt bis zur Kopplung an lokale Builds |
| 6 Website | Feature-Liste; `why.astro` prüfen (ag-Grid: Enterprise); Showcase: keiner neu – Training-Demo zeigt es |
| 7 Training | Kapitel 16 `footer-totals` um die eingebaute Lösung ergänzen (`<Callout type="version">`), Demo `shared/order-totals-footer.ts` bleibt als „so funktioniert es innen“ (Tag `ep-016` zeigt den alten Code), `footer-totals.ts` zeigt die eingebaute Variante + Statusleiste; kein neues Kapitel |
| 8 Demo-Repo | entfällt (kein neues Kapitel, keine neue Folge) |
| 9 Video | `videos/06-summenzeile/` – „Summenzeile in einer Zeile Code (ohne Enterprise-Lizenz)“ |

## 5. Abschluss-Review (separater Agent, 15.10.2026) und Korrekturen

Ein Agent, der den Code nicht geschrieben hat, hat den Diff gelesen (Schwerpunkte: Rechenkorrektheit, Cache und
Invalidierung, Eignung für 006/007) und Funde mit Skripten belegt. Bestätigt: Neumaier-Summe und `merge` (200.000
zufällige Aufteilungen, auch Auslöschung bei 1e15/1e16), `avg`-`merge` = ein Durchlauf, Escaping, ARIA, Export-Snapshot
nur mit Zugängen, keine Neuberechnung beim Scrollen für Objekt-Arrays. Korrekturen (je zuerst ein roter Test):

| Fund | Korrektur |
|---|---|
| Baum: `getLeafRows()` (O(n)) lief bei **jedem** Zellzugriff vor der Cache-Prüfung – G10 für Bäume verletzt | Quelle liefert Signal + Länge billig, die Zeilen erst beim Cache-Fehlschlag; Signal = Wurzel-Array (Auf-/Zuklappen rechnet nicht neu, Filter/Sortierung invalidieren über die Tabelle) |
| `getRows`, das ein neues Array liefert, wurde nie gecacht | `getRows` nur beim Fehlschlag, danach bis `invalidateDerivedValues()` |
| `merge` von `min`/`max`/`first`/`last` gab `b` zurück (Aliasing: ein späteres `add` änderte den Kind-Zustand) | `merge` ändert nur `a` und gibt `a` zurück, `b` bleibt unverändert – als Vertrag in `AggregatorIf` dokumentiert (wichtig für 006) |
| CRUD-Edit (`Object.assign` + internes `repaint`) ließ die Summen veraltet | `CrudTableModelFactory` ruft `invalidateAggregates()` bei Edit, Add, Delete |
| Hook-Name `invalidate?()` hätte vorhandene gleichnamige Methoden eigener Modelle aufgerufen | umbenannt in `invalidateDerivedValues?()` (vor dem ersten Release) |
| Kappung der Auswahl-Aggregate über die Bounding-Box (2 Zellen weit auseinander → `capped`) | Zellen je Bereich zählen; nur die Bereiche durchlaufen (Überlappungen einmal) |

Nicht geändert (in `TODO.md`): zwei Invalidierungen je Edit (die zweite ist Absicht – abgeleitete Werte aus
`onModelChanged`), Auswahl-Aggregate im Baum zählen sichtbare Zeilen (der Footer Blätter), `footerAggregates` mit
`bodyData` ohne `columnDefs` warnt nicht, eigener Aggregator mit Feld `aggregator` würde als Spec gelesen, `min`/`max`
über gemischte Zahlen und Daten.
