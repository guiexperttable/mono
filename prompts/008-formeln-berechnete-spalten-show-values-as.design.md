# Design 008: Berechnete Spalten, „Show values as“ und Formeln

> Status: **umgesetzt** (Okt. 2026, Branch `feat/calculated`, Zielversion **1.1.95**).
> Auftrag: `prompts/008-formeln-berechnete-spalten-show-values-as.md`. Marc hat den Auftrag mit „baue selbständig“
> erteilt – der Haltepunkt nach Phase 1 entfällt, dieses Dokument ist das Entscheidungsprotokoll.
> Geliefert werden alle drei Teile (A, B, C) in einem Release. Training-Kapitel, Demo-Repo und Video sind **nicht** Teil
> dieser Sitzung (s. § 7).

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `ColumnDefIf` / `ColumnDef.create` | Spaltendefinition | kein `valueGetter` | **additiv**: `valueGetter`, `valueSetter`, `showValuesAs`, `formula`, `formulaOptions` (alle optional) |
| `AreaModelObjectArray.getValueByT` | eine Stelle für Zellwert, Sortierung | liest nur Pfade | fragt zuerst `ColumnValues` (Getter der Spalte), sonst Pfad wie bisher (bit-gleich) |
| `AreaModelTree.getValueAt` / `getValueByT` | Baum, Row Groups (006) | liest nur Pfade | wie oben; `getValueAt` = `getRawValueAt` + „Show values as“ |
| `AbstractAreaModel.setValue` / `isEditable` | Editieren | – | Spalte mit `valueGetter`: nur editierbar mit `valueSetter` (F7) |
| `AreaModelAggregateFooter` (005) | Gesamtzeile | Spec-Schlüssel = Pfad | Schlüssel = Property einer berechneten Spalte → deren Getter (F5) |
| `AreaModelRowGroups` (006) | Gruppen-Aggregate, `groupBy` | Pfade | Aggregate und Gruppierfelder über berechnete Spalten → Getter |
| `PivotValueIf` (007) | Pivot-Werte | – | **additiv** `showValuesAs` (vier Anteils-Modi, F11) |
| `ExcelService` | Export | nur Zahl/Text/Datum, ein Stil | **additiv**: Zelle `{ value, numberFormat }` (`ExcelFormattedValueIf`) → eigener `numFmt`; `TableApi.downloadExcel` nutzt es für Prozent-Spalten nur, wenn der Service `supportsNumberFormats` meldet (eigene `ExcelServiceIf` bekommen weiter reine Zahlen) |
| `TableApi` | Fassade | – | neu: `getRowValue`, `setShowValuesAs`, `getShowValuesAs`, `setColumnFormula` |
| `AreaModelArrayOfArrays`, eigene `AreaModel`s | – | Werte über Spaltenindex | **kein** `valueGetter` (Spalten werden physisch verschoben). Eigene Modelle rufen `columnDef.valueGetter` selbst auf (Doku). |

Kein Breaking Change: ohne die neuen Felder laufen alle Pfade wie bisher (eine `Map`-Abfrage mehr, die leer ist).

## 2. Teil A – berechnete Spalten

1. **Signatur:** `valueGetter?: (row: T, context: ValueGetterContextIf) => unknown`. `row` ist das Datenobjekt (im Baum
   `TreeRow.data`, nie die `TreeRow`). Der Kontext (`property`, `getValue(row, property)`, `aggregate(property,
   aggregator)`) erlaubt Bezüge auf andere – auch berechnete – Spalten und Spalten-Aggregate; ihn braucht Teil C.
   Kein `rowIndex`: Indizes ändern sich bei Sortierung und Filter (CLAUDE.md: „nie Indizes“).
   `valueSetter?: (row: T, value: unknown) => boolean | void` (optional, `false` = abgelehnt).
2. **Auswertung an genau einer Stelle:** neue interne Klasse `ColumnValues` (`calc/column-values.ts`) je Area-Modell:
   `get(row, property)` (Getter der Spalte oder Pfad), Zyklus-Erkennung (Stack der gerade berechneten Properties →
   `#CIRC!`), `aggregate(property, aggregator)` (über die **gefilterten** Zeilen, gecacht). `getValueByT` → `get` →
   Zellwert, Sortierung, Copy, Excel, Filter-Hilfe, Footer und Gruppen-Aggregate stimmen automatisch.
3. **Caching:** Zellwerte **nicht** gecacht (Getter laufen nur für sichtbare Zellen; virtuelles Scrollen). Sortierung
   berechnet je Zeile einmal (Memo-`Map` je Sortierlauf statt 2·n·log n Aufrufen). Gecacht werden nur Aggregate
   (Cache-Schlüssel = Zeilen-Array + Länge, verworfen in `invalidateDerivedValues()` – die Tabelle ruft es bei Filter,
   Sortierung, Edit, `updateCells`, `repaint()`). Die Getter-Zuordnung Property → Getter wird lazy gebaut und ebenfalls
   bei `invalidateDerivedValues()` neu gelesen (`columnDef.valueGetter = …` + `api.repaint()` genügt).
4. **Filter:** Prädikat bekommt weiter die Zeile. Neu `api.getRowValue(row, property)` (berechnet, Pfad, `TreeRow` wird
   ausgepackt) – `externalFilterFunction = row => api.getRowValue(row, "total") > 500` (F3).
5. **Editieren (F7):** berechnete Spalte ohne `valueSetter` ist nie editierbar (auch nicht mit `editable: TrueFn`).
   Editieren einer Quellspalte (F6): kein Cache für Zellwerte → nach dem Repaint neu; Footer über die bestehende
   Invalidierung.

## 3. Teil B – „Show values as“

4. **Konfiguration:** `ColumnDefIf.showValuesAs?: ShowValuesAs | ShowValuesAsIf` mit
   `ShowValuesAs = "percentOfColumnTotal" | "percentOfGrandTotal" | "percentOfParentTotal" | "percentOfRowTotal" |
   "differenceFromPrevious" | "runningTotal" | "rank"` und `ShowValuesAsIf { mode, fractionDigits?, format? }`.
   Für Pivot in `PivotValueIf.showValuesAs` (nur die vier Anteils-Modi). Umschalten zur Laufzeit:
   `api.setShowValuesAs(property, mode | undefined)` (kein Neuaufbau, nur Repaint).
5. **Bezugsmenge (F9):** die **gefilterten** Zeilen (wie die Gesamtzeile aus 005). Sichtbar = 100 %.
   **Sortierung (F12):** nach dem Rohwert. Bei allen Anteils-Modi ergibt das dieselbe Reihenfolge wie der angezeigte
   Anteil (gleicher Nenner je Spalte bzw. je Geschwistermenge); `runningTotal`/`differenceFromPrevious`/`rank` hängen von
   der Reihenfolge ab – nach ihnen zu sortieren wäre zirkulär. Ausnahme Pivot `percentOfRowTotal`: dort sortiert die
   Spalte nach dem angezeigten Anteil (Nenner je Zeile verschieden).
   **Export:** der angezeigte Wert (Export = aktuelle Sicht): Anteile als Zahl (0,667) mit Excel-Format `0.0%`, Copy als
   Text wie angezeigt (`66.7%`).
6. **Darstellung:** Anteile `Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 })`, sonst Zahl mit
   höchstens zwei Nachkommastellen (`formatAggregateValue`); eigene `format`-Funktion möglich. Ohne eigenen Body-Renderer
   zeigt die Spalte `getTextValueAt` (eingebauter `AggregateCellRenderer`). **Rundung:** jede Zelle wird für sich
   gerundet – die Summe der angezeigten Anteile kann 99,9 % oder 100,1 % sein (dokumentiert; der Rohwert summiert sich
   exakt zu 1). F8 ergibt 66,7 % + 26,9 % + 6,4 % = 100,0 %.

| Modus | flach | Baum / Row Groups | Pivot |
|---|---|---|---|
| `percentOfColumnTotal` | Wert / Summe gefilterter Zeilen | Wert / Summe gefilterter Blätter | Zelle / Spaltensumme |
| `percentOfGrandTotal` | = Spaltensumme | = Spaltensumme | Zelle / Gesamtsumme |
| `percentOfParentTotal` | = Spaltensumme | Wert / Summe der (gefilterten) Geschwister – Detailzeilen ergeben je Gruppe 100 % (F10), Gruppen je Elterngruppe | Zelle / Wert der Elternzeile (oberste Ebene: Spaltensumme) |
| `percentOfRowTotal` | – (Rohwert) | – (Rohwert) | Zelle / Zeilensumme (F11) |
| `differenceFromPrevious` | Wert − Vorzeile (erste leer) | unter Geschwistern | – |
| `runningTotal` | Summe bis zur Zeile (Sichtreihenfolge) | unter Geschwistern | – |
| `rank` | 1 = größter Wert, gleiche Werte gleicher Rang (1, 2, 2, 4) | unter Geschwistern | – |

Nicht-Zahlen bleiben leer (`undefined`), Nenner 0 → leer. Gruppenzeilen (006) nutzen ihr Aggregat der Spalte.

## 4. Teil C – Formeln

7. **Umfang: (a) + (b).** Ausdrücke je Spalte mit Bezügen auf Felder derselben Zeile (`[price] * [quantity]`) und auf
   Spalten-Aggregate (`[total] / SUM([total])`). **Keine** Zellbezüge wie `=B2*C2` (c): Bezüge auf Zeilenpositionen sind
   bei Sortierung, Filter und virtuellem Scrollen instabil, und ein Abhängigkeitsgraph über Millionen Zellen widerspricht
   dem Performance-Versprechen.
8. **Ausdruckssprache, ohne Abhängigkeiten, ohne `eval`/`new Function`** (CSP-tauglich): Tokenizer → Pratt-Parser →
   unveränderlicher AST → Auswerter (Baum-Interpreter). `compileFormula(source, options?)` kompiliert **einmal** je
   Spalte; der `valueGetter` wertet nur aus.
   - Literale: Zahlen (`12`, `1.5`, `.5`, `1e3`), Texte `"…"` / `'…'` (Escapes `\\ \" \' \n \t`), `TRUE`/`FALSE`.
   - Feldbezüge `[price]`, `[address.city]`, `[Unit price]` (`\]` im Namen). Nur **eigene** Eigenschaften
     (`Object.hasOwn`) → `[constructor]`, `[__proto__]` liefern `#NAME?`, nie Prototyp-Funktionen.
   - Operatoren (schwach → stark): `=` `==` `<>` `!=` `<` `<=` `>` `>=` · `&` (Text) · `+ -` · `* /` · `^` (rechtsassoziativ)
     · unäres `-`/`+`. **Abweichung von Excel:** `-2^2 = -4` (mathematische Konvention).
   - Funktionen (Groß-/Kleinschreibung egal): `SUM AVG AVERAGE MIN MAX COUNT` (genau ein Feldbezug = Spalten-Aggregat über die
     gefilterten Zeilen, sonst über die Argumente), `ROUND(x, n=0)`, `ABS`, `FLOOR`, `CEILING`, `MOD`, `SQRT`, `POWER`,
     `IF(c, a, b)` (lazy), `IFERROR(x, y)`, `AND`, `OR`, `NOT`, `CONCAT`, `LEN`, `UPPER`, `LOWER`, `TRIM`, `ISBLANK`.
     Eigene Funktionen über `options.functions` (Name → `(args) => unknown`, Argumente bereits ausgewertet).
   - Typen: Leer (`null`/`undefined`/`""`) → 0 bzw. `""`; Text mit Zahl (`"3"`) → 3; Boolean → 1/0; Date → ms.
     Sonst `#VALUE!`. Ergebnis `NaN`/`±Infinity` → `#NUM!`.
   - Grenzen: Länge ≤ 10 000 Zeichen, Schachtelung ≤ 64 → `#ERROR!`.
9. **Fehlerwerte** statt Exceptions: `FormulaError` (`code`, `message`, `toString() = code`): `#ERROR!` (Syntax),
   `#NAME?` (unbekanntes Feld/Funktion), `#VALUE!`, `#DIV/0!`, `#NUM!`, `#CIRC!` (Zyklus über berechnete Spalten oder
   Aggregat der eigenen Spalte). Fehler pflanzen sich fort (`IFERROR` fängt sie). Zellen mit Fehler bekommen die CSS-Klasse
   `ge-table-cell-error` (`--ge-table-cell-error-color`, light/dark), Tooltip = Meldung. Aggregatoren überspringen sie
   (keine Zahl), Sortierung: Fehler zuletzt.
10. **Keine eingebaute UI** – „UI gehört der Anwendung“ (Checklist-Kapitel). API: `ColumnDef.create({ formula })`,
    `compileFormula`, `api.setColumnFormula(property, source)` (gibt den Compile-Fehler zurück, für die eigene Fehlermeldung).
    Beispiel mit Eingabefeld im Showcase `formulas`.
11. **Excel-Export:** Werte (sicher, Formelergebnis wie angezeigt), Fehler als Text (`#DIV/0!`). Keine Excel-Formeln:
    Feldbezüge → A1-Bezüge stimmen nach Sortierung/Filter nicht, und Text, der wie eine Formel aussieht, wird als
    `inlineStr` nie ausgeführt.
12. **Fundament:** Formelspalte = `valueGetter` aus `createFormulaValueGetter(compiled)`; `SUM(...)` nutzt die
    Aggregatoren aus 005 über `ValueGetterContextIf.aggregate`.

### Nach dem Abschluss-Review (separater Agent) geändert

- `ROUND`: 15 signifikante Stellen vor dem Runden (wie eine Tabellenkalkulation), ab 1e15 ohne Korrektur, `ROUND(x, -400) = 0`.
- Zyklen je (Zeile, Property): ein Getter darf dieselbe Spalte einer anderen Zeile lesen (laufende Summe), nur echte
  Zyklen sind `#CIRC!`.
- Row Grouping entscheidet je Aufruf, ob eine Spalte berechnet ist (`setColumnFormula` nach dem Aufbau wirkt).
- Überlauf in Zwischenergebnissen → `#NUM!` (fängt `IFERROR`); Zahlentexte nur dezimal (kein `"0x1A"`); Objekte der Daten,
  die wie ein `FormulaError` aussehen, sind `#VALUE!`; höchstens 1.000 Operatoren je Formel; `compileFormula` wirft nie.
- Bewusst belassen (dokumentiert): Summen überspringen Fehlerzellen, `AND`/`OR` mit Kurzschluss, `"10" = 10` ist wahr.

## 5. Beispiele (Video-tauglich)

```ts
const columnDefs = [
  ColumnDef.create({ property: "product", headerLabel: "Product" }),
  ColumnDef.create({ property: "price", headerLabel: "Price", editable: TrueFn }),
  ColumnDef.create({ property: "quantity", headerLabel: "Qty" }),
  ColumnDef.create({ property: "total", headerLabel: "Total", sortable: TrueFn,
                     valueGetter: (o: Item) => o.price * o.quantity }),             // F1: 2598, 1047, 250
  ColumnDef.create({ property: "share", headerLabel: "Share", valueGetter: (o: Item) => o.price * o.quantity,
                     showValuesAs: "percentOfColumnTotal" }),                      // F8: 66.7 %, 26.9 %, 6.4 %
  ColumnDef.create({ property: "gross", headerLabel: "Gross", formula: "[price] * [quantity] * 1.19" }), // F13: 3091.62
];
const tableModel = TableFactory.createTableModel({ rows, columnDefs, footerAggregates: { total: "sum" } }); // F5: 3895
```

## 6. Ablage

- `src/lib/table/calc/`: `value-getter.type.ts`, `value-getter-context.if.ts`, `show-values-as.type.ts`,
  `show-values-as.ts` (Rechnung + Format, DOM-frei), `column-values.ts` (intern, nicht exportiert).
- `src/lib/table/formula/`: `formula-error.ts`, `tokenizer.ts`, `ast.if.ts`, `parser.ts`, `functions.ts`, `evaluator.ts`,
  `compile-formula.ts`, `formula-options.if.ts`. Typedoc-Kategorie **„Calculated columns & formulas“**.
- Specs: `calc/*.spec.ts`, `formula/*.spec.ts` (inkl. Sicherheitstabelle, Fuzzing mit festem Seed),
  `calc/calculated-columns.browser.spec.ts` (Header-Klick, Copy, Excel mit ZIP-Leser, Editieren, Injection, axe).
  Bench: `bench/formula.bench.ts` (F17).

## 7. Website, Training, Demo-Repo, Video

- **Website:** Showcase `formulas` (Rechnung Netto/MwSt./Brutto als Formeln, Anteil am Umsatz, Formel-Eingabefeld),
  Feature-Liste, `why.astro` (Zeile „Calculated columns & formulas“, ag-Grid: Enterprise).
- **Training / Demo-Repo / Video:** in dieser Sitzung nicht beauftragt. Vorschlag: Abschnitt „Calculated columns“ in
  `column-definitions`, Kapitel 38 `formulas` in Teil 8 (Tag `ep-038` nach dem Release), Folgen 29 „Berechnete Spalten in
  60 s“ und 30 „Formeln ohne Enterprise-Lizenz“. Offen in `TODO.md`.
