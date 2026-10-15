# Design 004 – Zeilennummern

> Prompt: `prompts/004-zeilennummern.md` · Branch `feat/row-numbers` · Zielversion **1.1.93** (`since`)
> Stand 15.10.2026. Abhängigkeit 001 (ARIA) ist auf `main` (`role="rowheader"` passt in das Grid-Muster).
> **Selbständig umgesetzt** (Auftrag „arbeite … selbständig“, 15.10.2026): Claude hat die Empfehlungen aus § 2
> übernommen, ohne die Freigabe abzuwarten. Jede Entscheidung ist unten begründet und lässt sich vor dem Merge noch
> ändern.

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `CheckboxColumnDef` (`data/common/checkbox-column-def.ts`) | Vorbild | normale `ColumnDefIf`, Erkennung über `type` (`isCheckboxColumnDef`). **Der Anwender legt sie selbst** als `columnDefs[0]` an; `rowCheckboxVisible` fügt keine Spalte ein, sondern verschiebt nur den Baumpfeil auf Spalte 1 | passt; `RowNumberColumnDef` wird genauso gebaut |
| Index-0-Annahmen (`TableModel`-Konstruktor, `TableFactory.createTableModel`/`buildByTypedRows`, `RenderScope.getTreeArrowColumnIndex`, `MouseHandler.getArrowColumnIndex`, `TableScope.activateBodyCell`, `ConvenienceDomService.addColumnDiv`, `showCheckboxWihoutExtraColumn`) | Checkbox, Baumpfeil, Checkbox ohne Extraspalte | alle hart auf Spalte 0 | **erweitern**: Versatz `leadingRowNumberColumns(tableModel)` (0 oder 1). Ohne Nummernspalte ist er 0 → Verhalten unverändert |
| `AbstractAreaModel` | Renderer je Spalte | `cellRenderers = columnDefs.map(def => def.rendererMap[area])` | passt: der Renderer der Nummernspalte kommt aus der Spaltendefinition |
| `AreaModelObjectArray` | Zählweise | `getAllRows()` = Originalreihenfolge (Sortieren/Filtern ändern nur `filteredRows`) | passt für „original“ |
| `AreaModelTree` | Baum | kein `getAllRows()`; sichtbare Zeilen = `getRowCount()` | Baum zählt die sichtbaren Zeilen (§ 2.7) |
| `RenderScope.adjustAfterScrolling()` | Breite | läuft bei jedem Repaint/Scroll; `adjustContainersAndRows()` ruft es am Ende selbst auf | am Anfang Breite prüfen (Textlänge, O(1)); nur bei Änderung neu messen und Container anpassen |
| `RenderScope.applyCellAria()` | ARIA | `columnheader` / `gridcell` | Body-Zellen der Nummernspalte `rowheader` |
| `RenderScope` Resize-Griff + `data-ge-action="drag-column"`, `TableScope.mouseDraggingOnFrame()` | N9 | jede Header-Zelle ist ziehbar und hat einen Griff | Nummernspalte: kein Griff, kein Ziehen; keine andere Spalte vor sie (Ziel-Index ≥ Versatz) |
| `SelectionService.onMouseClicked()` | N6 | `row`: Klick wählt schon die Zeile; `range`: nur die Zelle; Header-Klick: nichts | `range`: Klick auf die Nummer = ganze Zeile, Shift = Zeilenbereich, Strg/⌘ = Zeile umschalten. Klick auf die Kopfzelle „#“ = alles wählen (`row`/`range`) |
| `CopyService.createContent`, `TableApi.downloadExcel` | N8 | exportieren alle sichtbaren Spalten | Nummernspalte überspringen; mit `exported: true` mit der angezeigten Nummer |
| `TableScope.autoResizeColumns()` | Breite | misst `getTextValueAt` (für die Nummernspalte `"undefined"`) | Nummernspalte auslassen (sie passt sich selbst an) |
| `TableFactory.createTableModel` / `CreateTableModelPara` | Komfort-Flag | – | `rowNumbersVisible?: boolean \| Partial<RowNumberOptionsIf>` – **additiv** |
| `TableApi` | Q5 | Spalten nur per Index oder (bei `setColumnVisible`) Property | neu `getColumnIndex(property)` – **additiv** |
| CSS | Aussehen | – | `.ge-table-row-number`, Variablen `--ge-table-row-number-bg`/`-color` (light, dark) |

**Breaking Changes:** keine. Neue Klassen, neue optionale Parameter, eine neue API-Methode. Der Versatz ist ohne
Nummernspalte 0.

## 2. Entscheidungen

### 2.1 Einschalten (Frage 1) → Spaltendefinition + Komfort-Flag in der Fabrik

| Option | Pro | Contra |
|---|---|---|
| Flag `rowNumbersVisible` im `TableModel` (wie `rowCheckboxVisible`) | eine Zeile | `TableModel`-Konstruktor hat 13 Positionsparameter; ein Flag im Modell müsste die Area-Modelle nachträglich umbauen |
| **`RowNumberColumnDef` + `isRowNumberColumnDef`** | gleiches Muster wie `CheckboxColumnDef`; funktioniert mit jedem Weg zum Modell (auch eigene Area-Modelle); Index sichtbar im Code | eine Zeile mehr |
| nur `RowNumberCellRenderer` für eine eigene Spalte | maximal frei | Anwender muss Breite, Fixierung, Export, ARIA selbst lösen |

**Empfehlung: `RowNumberColumnDef` als Baustein, `rowNumbersVisible` in `TableFactory.createTableModel` als
Komfort.** Das Flag stellt eine `RowNumberColumnDef` **vor** die Spalten und zählt sie in `fixedLeftColumnCount` mit.
`RowNumberCellRenderer` ist exportiert (die Spaltendefinition benutzt ihn), wird aber nicht als eigener Weg beworben.

Das Flag wirkt nur, wo die Fabrik die Modelle aus den Spaltendefinitionen baut: `rows` (Objekte oder Baum),
`headerData`/`footerData` (bekommen eine leere Zelle vorne). Mit `bodyData` oder eigenen Area-Modellen würde jede
Spalte um eins verrutschen – dort warnt die Fabrik (`console.warn`) und ignoriert das Flag; man setzt
`new RowNumberColumnDef()` selbst in die `columnDefs` und richtet die Modelle danach aus.

```ts
// data/common/row-number-options.if.ts
export type RowNumberMode = "display" | "original";
export interface RowNumberOptionsIf {
  mode: RowNumberMode;                      // "display" (Default) | "original"
  format: (rowNumber: number) => string;    // Default String(n) → "2000000"
  headerLabel: string;                      // Default "#"
  exported: boolean;                        // Copy + Excel; Default false
  minWidthInPx: number;                     // Default 36
}
// data/common/row-number-column-def.ts
export class RowNumberColumnDef implements ColumnDefIf {
  readonly type = "RowNumberColumnDef";
  property = "RowNumberColumn";
  readonly options: RowNumberOptionsIf;
  constructor(options?: Partial<RowNumberOptionsIf>);
  getRowNumber(rowIndex: number, bodyModel: AreaModelIf): number;       // 1-basiert
  getRowNumberText(rowIndex: number, bodyModel: AreaModelIf): string;  // format(getRowNumber(…))
  getWidestText(bodyModel: AreaModelIf): string;                       // format(größte Nummer) – für die Breite
}
// instanceof-workaround.ts
export function isRowNumberColumnDef(o: any): o is RowNumberColumnDef;
// CreateTableModelPara
rowNumbersVisible: boolean | Partial<RowNumberOptionsIf>;
// TableApi
getColumnIndex(property: string): number;   // -1, wenn es die Spalte nicht gibt
```

### 2.2 Zählweise (Frage 2) → Anzeige-Index, Option „original“

- `"display"` (Default, wie Excel/ag-Grid): Nummer = Zeilenindex der aktuellen Sicht + 1. Nach Sortierung und Filter
  wieder 1, 2, 3 … (N3, N4).
- `"original"`: Position in `getAllRows()` + 1 – bleibt beim Sortieren und Filtern an der Zeile (N3/N4 „Originalnummern“).
  Die Zuordnung Zeile → Position wird einmal als `Map` aufgebaut und neu erstellt, wenn sich `getAllRows()` (Array
  oder Länge) ändert; Kosten nur in diesem Modus (2 Mio. Zeilen ≈ einmalig 0,2 s). Modelle ohne `getAllRows()`
  (Baum, eigene Modelle) zählen wie `"display"`.
- Eigene Texte: `format(n)`, z. B. `n => n.toLocaleString("de-DE")`. Eine eigene Funktion `(row, displayIndex)` gibt es
  **nicht**: die Breite ließe sich ohne alle Zeilen nicht vorhersagen (§ 2.3). Wer das braucht, nimmt eine eigene
  Spalte mit eigenem Renderer.

### 2.3 Breite (Frage 3) → aus dem breitesten Text, gemessen mit `canvas.measureText`

Breite = `max(minWidthInPx, ceil(measure(format(größte Nummer)) + 2 × 6 px Innenabstand + 2))`. Größte Nummer:
`getRowCount()` (display) bzw. `getUnfilteredRowCount?.() ?? getRowCount()` (original). Schrift wie bei
`autoResizeColumns` (berechneter Stil des Hosts, Fallback 8 px pro Zeichen). Geprüft bei **jedem** Render-Durchgang
am Anfang von `adjustAfterScrolling()`: verglichen wird nur der Text (eine Zahl formatieren, O(1)); gemessen und die
Container angepasst nur, wenn er sich ändert (`setRows`, Filter, Baum auf-/zuklappen). Die Spalte wird damit beim
Filtern auf 42 Zeilen auch wieder schmaler. Der Anwender kann sie nicht mit der Maus verkleinern (N9).

### 2.4 Fixierung (Frage 4) → zählt in `fixedLeftColumnCount` mit

Die Nummernspalte ist eine echte Spalte am Index 0. Mit dem Flag erhöht die Fabrik `fixedLeftColumnCount` um 1
(`fixedLeftColumnCount: 1` des Anwenders → 2 Spalten links fest: Nummer + seine Spalte). Wer `RowNumberColumnDef`
selbst einsetzt, zählt sie selbst mit (Doku + JSDoc-Beispiel). Ohne Fixierung scrollt sie mit – erlaubt, aber nicht
empfohlen.

**Reihenfolge mit der Checkbox (N5): Nummer, dann Checkbox** (wie ein Tabellenblatt: Zeilenkopf ganz außen). Dafür
lesen alle Stellen mit hart kodierter Spalte 0 (Tabelle § 1) den Versatz `leadingRowNumberColumns()`: die
Checkbox-Spalte wird an Index 1 erkannt, der Baumpfeil sitzt an der ersten Datenspalte, `showCheckboxWihoutExtraColumn`
zeichnet die Checkbox in die erste Datenspalte. Eine Nummernspalte an anderer Stelle als 0 ist erlaubt, zählt aber
nicht als Versatz (dokumentiert).

### 2.5 Spaltenindex-Versatz (Frage 5) → ehrlich: echte Spalte, Index-API über Property

Die Checkbox-Spalte macht es heute genauso: sie ist Spalte 0, alle anderen rutschen um eins. Das ist für sie „gut
genug“, weil der Anwender sie selbst in `columnDefs` schreibt und den Index sieht. Beim Flag sieht er sie nicht –
deshalb:

| Option | Pro | Contra |
|---|---|---|
| virtuelle Spalte außerhalb der Indizes | Anwender-Indizes bleiben | eigene Geometrie, eigene Maus-/Tastatur-/ARIA-/Fokus-Logik in `RenderScope`, `MouseHandler`, `SelectionModel`, Export – groß und riskant (Umfang S!) |
| **echte Spalte + Doku + `api.getColumnIndex(property)`** | kleine Änderung, alle vorhandenen Mechaniken (Fixierung, Selektion, Fokus, ARIA-Spaltenzahl) funktionieren | Indizes verschieben sich um 1, wenn man das Flag einschaltet |

**Empfehlung: echte Spalte.** Die meisten Wege sind ohnehin indexfrei (`setColumnVisible("total")`,
`GeMouseEvent` → `tableModel.getColumnDef(i).property`, Zeilenobjekte statt Indizes in Filtern). Neu:
`api.getColumnIndex("total")`. Die Doku (instructions.md § 5.2, JSDoc des Flags) nennt den Versatz deutlich.

### 2.6 Formatierung (Frage 6)

Keine Tausendertrennzeichen per Default (`"2000000"`, wie Excel-Zeilenköpfe; eindeutig in jeder Sprache), über
`format` einschaltbar. CSS: rechtsbündig, `font-variant-numeric: tabular-nums`, eigene Hintergrund-/Textfarbe
(`--ge-table-row-number-bg` / `-color`, light und dark), Innenabstand 6 px (logische Eigenschaften `padding-inline`).

### 2.7 Baum und spätere Gruppenzeilen (Frage 7)

Baum (N7): **sichtbare Zeilen fortlaufend** (1, 2, 3 …), wie ein Tabellenblatt. Hierarchisch (1, 1.1, 1.2) kommt
nicht: die Nummern würden sich beim Auf-/Zuklappen anders verhalten als die Zeilen daneben, die Breite ist ohne alle
Knoten nicht vorherzusagen, und die Hierarchie zeigt der Baum schon selbst (Einrückung, `aria-level`). Gruppenzeilen
(Prompt 006): Empfehlung für 006 – Gruppenzeilen **nicht** nummerieren (Zelle leer), Datenzeilen fortlaufend. Dafür
wird 006 `getRowNumber` um eine Abfrage `isGroupRow?(rowIndex)` am Body-Modell erweitern; heute nicht nötig.

### 2.8 Weitere Festlegungen

- **N6 Klick:** `row` – unverändert (jede Zelle wählt die Zeile). `range` – Klick auf die Nummer wählt die ganze Zeile
  (`CellRange(r, 0, r, MAX)`), Shift-Klick den Zeilenbereich ab dem Anker, Strg/⌘ schaltet die Zeile um. `cell` –
  wie jede Zelle (Fokus, eine Zelle). Klick auf „#“ im Header: `SELECT_ALL` (bei `row`/`range`), wie die Ecke in Excel.
- **N8 Export:** `exported: false` (Default) → weder `copyToClipboard()` noch `downloadExcel()` enthalten die Spalte.
  `exported: true` → die angezeigte Nummer (Header „#“).
- **N9:** nicht sortierbar (kein `sortable`), nicht editierbar, nicht ziehbar, kein Resize-Griff, keine Spalte davor.
  `autoResizeColumns()` lässt sie aus. `setColumnVisible("RowNumberColumn", false)` blendet sie aus (gewollt).
- **N10 ARIA:** Body-Zellen `role="rowheader"`; der Screenreader sagt beim Wechsel der Zeile die Nummer an. Header-Zelle
  `columnheader` mit Text „#“ (leerer Spaltenkopf wäre ein axe-Fund `empty-table-header`). Footer-Zelle leer.
- **N11:** `headerLabel` (Default „#“, `""` erlaubt); Footer immer leer.
- **Zustand (003):** Die Spalte hat eine feste Property `"RowNumberColumn"`; gespeicherte Breiten werden beim nächsten
  Render von der automatischen Breite überschrieben. Keine Änderung am State-Code.

## 3. Beispiele (video-tauglich)

```ts
// N1/N2 – eine Zeile Konfiguration
const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, rowNumbersVisible: true });
// → Spalte "#" ganz links, fixiert; 1 … 1000; Breite passt für "1000"
```

```ts
// N3/N4 – Originalnummern, mit Tausendertrennzeichen, im Export
const tableModel = TableFactory.createTableModel({
  rows: orders, columnDefs,
  rowNumbersVisible: { mode: "original", format: n => n.toLocaleString("en-US"), exported: true }
});
// sortiert nach Total ↓: die Nummern bleiben an ihren Zeilen ("1,204", "17", …)
```

```ts
// N5 – Nummer + Checkbox, selbst zusammengesetzt
const columnDefs = [new RowNumberColumnDef(), new CheckboxColumnDef(), ...orderColumns];
const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, fixedLeftColumnCount: 2 });
const total = tableApi.getColumnIndex("total"); // 4 statt 2 – Indizes über die Property holen
```

## 4. Phasen 5–9 (Entscheidung)

| Phase | Umfang |
|---|---|
| 5 Demo | `demo-table-models`: keine neue Fabrik nötig (Flag). `apps/table-demo/row-numbers.html` (Aufnahme-Seite). Angular-Demo: entfällt bis zur Kopplung an lokale Builds (`TODO.md`) |
| 6 Website | Feature-Liste; Showcase „Large dataset“ mit Zeilennummern (2 Mio.); `why.astro` prüfen (ag-Grid: Enterprise) |
| 7 Training | Abschnitt im Kapitel `fixed-columns` (die Spalte ist fixiert) mit `<Callout type="version">`, Live-Demo dort erweitert; kein neues Kapitel |
| 8 Demo-Repo | entfällt (kein neues Kapitel, keine neue Folge) |
| 9 Video | `videos/05-zeilennummern/` – „Zeilennummern wie in Excel – eine Zeile Code (ohne Enterprise-Lizenz)“ |

## 5. Abschluss-Review (separater Agent, 15.10.2026) und Korrekturen

Ein Agent, der den Code nicht geschrieben hat, hat den Diff gelesen (Schwerpunkte: Index-Versatz in allen APIs,
Checkbox- und fixierte Spalten, Export). Ergebnis „keine Verhaltensänderung ohne Nummernspalte“ bestätigt. Funde und
Korrekturen (je zuerst ein roter Test in `row-numbers.browser.spec.ts` bzw. `row-number-column-def.spec.ts`):

| Fund | Korrektur |
|---|---|
| Baum: `ge-table-tree-cell` an jeder Zelle → Nummern linksbündig, Label `inline` | CSS in `table-tree.css`: `.ge-table-row-number.ge-table-tree-cell` rechtsbündig, Label `block` |
| Strg+C ohne Selektion auf einer fokussierten Nummer kopierte `"undefined"` | `CopyService`: Fokus auf Nummernspalte → Nummerntext |
| `overridingColumnWidth`: die Breitenanpassung setzte die Breite **aller** Spalten | Anpassung entfällt; die Nummern bekommen die Einheitsbreite |
| %-/Gewichtsspalten wurden nach Breitenänderung nicht neu verteilt | bei Änderung `setParentWidth` + `init()` vor dem Neuaufbau |
| Rekursion ohne Schutz, falls das Modell die Breite nicht übernimmt | Flag `adjustingRowNumberWidth` + Prüfung, ob die Breite übernommen wurde |
| Messung mit der Schrift des Hosts, fester Innenabstand | Schrift und Innenabstand eines gerenderten Nummern-Labels; erste (geschätzte) Messung wird einmal nachgemessen; Ziffern als „0“ gemessen |
| `original`: Cache veraltet bei Sortieren/Ersetzen im selben Array | jede Abfrage prüft `rows[pos] === row`, sonst einmal neu aufbauen |
| Strg-Klick prüfte fest Spalte 1; jede Header-Zeile wählte alles | Prüfung an der Nummernspalte; nur die **unterste** Header-Zeile |
| Excel: Nummern als Text | mit dem Default-`format` als Zahl (`hasDefaultFormat()`), mit eigenem Format als Text |

Nicht geändert: der Speicherbedarf der `Map` im Modus `original` (bei 2 Mio. Zeilen zweistellige MB) – dokumentiert;
`MouseHandler.getArrowColumnIndex` ignoriert `showCheckboxWihoutExtraColumn` wie schon vorher (eigener Punkt in `TODO.md`).
