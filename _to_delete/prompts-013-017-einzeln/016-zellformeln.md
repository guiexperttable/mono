# TODO-Prompt 016: Zellformeln mit Bezügen wie in Excel (`=SUM(B2:B10)`)

> Status: offen · angelegt 16.10.2026 · Slug `sheet-formulas` (Branch `feat/sheet-formulas`, Design `prompts/016-zellformeln.design.md`)
> Reihe **Tabellenkalkulation 013–017**. Abhängigkeiten: **008** (Tokenizer, Pratt-Parser, Auswerter ohne `eval`,
> `FormulaError`), **013** (Editor für die Formel-Eingabe), 014 (Kopieren mit relativen Bezügen), 015 (Undo stellt
> Formeln wieder her), 010 (Fill-Handle verschiebt Bezüge), 004 (Zeilennummern, Zählweise `original`).
> **In Teilen lieferbar:** A Engine (DOM-frei) → B Tabelle → C Formel-Eingabe. Jeder Teil ist ein eigenes Release wert.
> Markt: ag-Grid Formulas (v35) Enterprise; Handsontable + HyperFormula (HyperFormula GPLv3 oder kommerziell). Ziel hier:
> MIT, 0 Runtime-Abhängigkeiten. Vor dem Video auf den Herstellerseiten prüfen.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Zellen enthalten Formeln wie in Excel: `=B2*C2`, `=SUM(D2:D100)`, `=$F$1*D2`, `=IF(E2>100,"high","low")`,
`=VLOOKUP("Mouse",A2:C4,2,FALSE)`. Ändert sich eine Zelle, rechnet die Tabelle **nur die abhängigen** Zellen neu.
Relative und absolute Bezüge verhalten sich beim Füllen, Kopieren und beim Einfügen/Löschen von Zeilen wie in Excel.
Fehlerwerte statt Exceptions, Zirkelbezüge werden erkannt. Bei der Eingabe: Bezüge per Klick/Pfeil, farbige Rahmen,
Funktionsvorschläge.

Abgrenzung zu 008: Dort rechnet eine **Spalte** mit Feldern derselben Zeile (`[price] * [quantity]`). Das bleibt
unverändert und wird in Zellformeln als strukturierter Bezug weiter nutzbar.

## Was es heute gibt (Code-Befund 16.10.2026)

- `formula/` (008): `compileFormula(source, { functions })` → Tokenizer → Pratt-Parser → AST mit den Knoten `literal`,
  `field`, `unary`, `binary`, `call` → Closures (`FormulaEvaluator`), kein `eval`/`new Function`, Länge ≤ 10 000,
  Tiefe ≤ 64. Rund 25 Funktionen (`IF`, `IFERROR`, `AND`, `OR`, `NOT`, `ABS`, `ROUND`, `MOD`, `POWER`, `SQRT`, `FLOOR`,
  `CEILING`, `CONCAT`, `LEN`, `UPPER`, `LOWER`, `TRIM`, `ISBLANK`; `SUM/AVG/MIN/MAX/COUNT([x])` = Spalten-Aggregat).
  Fehler `FormulaError` (`#DIV/0!`, `#NAME?`, `#VALUE!`, `#CIRC!`, `#ERROR!`), CSS `ge-table-cell-error`, Tooltip.
- **Keine Zellbezüge, kein Abhängigkeitsgraph:** Werte je Zeile lazy über `ColumnValues` (`calc/column-values.ts`).
- Website `why.astro`, Zeile „Spreadsheet cell references (A1) & formula editor“: bei uns „–“.
- Reihenfolge: `AreaModelObjectArray.doSort` sortiert `filteredRows` (Kopie), `getAllRows()` bleibt in Quellreihenfolge
  → **stabile physische Adresse** = Index in `getAllRows()`. Aber Row Drag (009) schreibt die Reihenfolge in place in die
  Zeilen der Anwendung → im Sheet-Modus ist das ein „Zeilen verschieben“ mit Bezugsanpassung.
- Zeilennummern (004) können die Quellnummer zeigen (`original`) – passt zu physischen Adressen.
- Spaltenbuchstaben gibt es nicht. Excel-Writer (`ExcelService`) schreibt Werte, `ExcelFormattedValueIf` mit Zahlenformat.

## Referenzfälle

Blatt (Zeile 1 = Kopf als Daten, wie in Excel):

| | A | B | C | D |
|---|---|---|---|---|
| 1 | Product | Price | Qty | Total |
| 2 | Laptop | 1299 | 2 | `=B2*C2` |
| 3 | Monitor | 349 | 3 | `=B3*C3` |
| 4 | Mouse | 25 | 10 | `=B4*C4` |
| 5 | | | | `=SUM(D2:D4)` |

| # | Teil | Situation | Erwartung |
|---|---|---|---|
| S1 | A | Werte D2:D4 | 2598, 1047, 250 |
| S2 | A | D5 | 3895 |
| S3 | A/B | B4 auf 30 | D4 300, D5 3945; nur D4 und D5 neu berechnet (Zähler im Test) |
| S4 | A | `=B2/0`, `=FOO(1)`, `=B2+"x"`, `=SUM(` | `#DIV/0!`, `#NAME?`, `#VALUE!`, `#ERROR!` |
| S5 | A | A7 `=B7`, B7 `=A7` | beide `#CIRC!`; Auflösen des Zyklus rechnet wieder |
| S6 | B | Fill-Handle D2 nach unten | D3 `=B3*C3` …; `$B$1` bleibt `$B$1` |
| S7 | B | D2 kopieren, in E3 einfügen | `=C3*D3`; Bezug außerhalb des Blatts → `#REF!` |
| S8 | B | Zeile 3 löschen (API aus 017) | `=SUM(D2:D4)` → `=SUM(D2:D3)`, `=B3` → `#REF!` |
| S9 | B | nach Price sortieren | alle Werte stimmen (Bezüge hängen an der physischen Zeile); Zeilennummern zeigen 4, 3, 2 |
| S10 | B | Filter blendet Zeile 3 aus | `SUM(D2:D4)` zählt sie weiter (wie Excel; `SUBTOTAL` später) |
| S11 | B | Spalte C per Drag verschieben | wie entschieden (Buchstabe wandert mit oder Spalten-Drag im Sheet aus) |
| S12 | B | `=1+1` in einer Spalte ohne Formeln; `'=1+1` | Text; Text „=1+1“ |
| S13 | B/C | F2 auf D2 | Editor zeigt `=B2*C2`, die Zelle 2598 |
| S14 | C | `=` tippen, Pfeil bzw. Klick auf B2, Shift+↓↓, F4 | `=B2`, dann `=B2:B4`, F4 → `$B$2:$B$4` |
| S15 | C | Formel mit drei Bezügen bearbeiten | drei farbige Rahmen, Farbe = Farbe im Editor-Text |
| S16 | C | `=SU` tippen | Liste `SUBSTITUTE`, `SUM`, `SUMIF` …; Tab übernimmt; Hinweis `SUM(number1, [number2], …)` |
| S17 | A | `=VLOOKUP("Mouse",A2:C4,2,FALSE)`, `=SUMIF(A2:A4,"M*",D2:D4)` | 25; 1297 |
| S18 | A | 1000 × 26 Zellen mit 20 000 Formeln laden; eine Zelle mit 10 000 Abhängigen ändern; `=SUM(A:A)` bei 1 Mio. Zeilen | Bench (Ziele im Design); `A:A` ohne 1 Mio. Einzelkanten |
| S19 | A | `TODAY()`, `NOW()`, `RAND()` | volatil: bei jeder Neuberechnung neu |
| S20 | B | Excel-Export | Option: Werte (Default) oder echte Formeln `<f>` mit gecachtem `<v>`; in Excel/LibreOffice gleiche Ergebnisse |
| S21 | A | `=constructor`, `=__proto__`, `=A1.constructor`, `=SUM(A1:XFD1048576)` | Fehlerwert, kein Code; Riesenbereich gekappt |
| S22 | B | Strg+Z nach Formeländerung (015) | alte Formel und Werte zurück |
| S23 | B | Summenzeile (005), Sortieren, Copy, Excel-Export | nutzen die berechneten Werte |
| S24 | B | Daten der Anwendung nach Eingabe von `=B2*C2` | enthalten den Text `"=B2*C2"`; `api.getCellValue` liefert 2598 |
| S25 | A/B | `="<img src=x onerror=alert(1)>"` | als Text angezeigt, kein Element |
| S26 | A | Inkrementell vs. komplett | nach jeder zufälligen Änderungsfolge (fester Seed) gleiche Werte wie eine Neuberechnung von vorn |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

**Teil A – Engine (DOM-frei)**

1. **Ablage:** (a) in den Daten der Anwendung als Text mit führendem `=` (Weg von Handsontable/HyperFormula: Speichern =
   Daten speichern, S24) oder (b) eigener Formel-Speicher neben den Daten. Empfehlung (a). Opt-in je Tabelle und je
   Spalte, damit ein Produkttext „=…“ nicht plötzlich rechnet; `'` am Anfang = Text.
2. **Adressierung (Kern):** Zeilen nach **physischer** Reihenfolge (`getAllRows()`, sichtbar über Zeilennummern
   `original`) oder nach Anzeigereihenfolge (bricht bei Sortieren/Filtern)? Empfehlung physisch (S9/S10). Spalten: ein
   Buchstabe je **Datenspalte** in Erzeugungsreihenfolge, fest an der Property; Zeilennummer, Checkbox, Gruppen-Spalte
   zählen nicht. Spalten-Drag: Buchstabe wandert mit (Anzeige) oder Excel-artiges Verschieben mit Umschreiben oder im
   Sheet-Modus aus (S11). Row Drag = Zeilen verschieben mit Umschreiben.
3. **Strukturierte Bezüge:** `[price]` (008, gleiche Zeile) auch in Zellformeln, wie `[@Price]` in Excel-Tabellen.
4. **Datenquelle:** Engine generisch über `SheetDataSourceIf` (`getRaw(row, col)`, `setRaw`, `getRowCount`,
   `getColumnCount`, Property ↔ Spalte), Adapter für `AreaModelObjectArray` und `AreaModelArrayOfArrays`; das dünn
   besetzte Blatt-Modell kommt mit 017. Baum, Row Groups, Pivot, Master/Detail im Sheet-Modus nicht (Warnung, wie 011).
5. **Grammatik additiv** (008 bleibt bit-gleich, Specs): AST-Knoten `ref` (Zeile, Spalte, je absolut ja/nein), `range`
   (inkl. `A:A`, `1:1`), `error` (`#REF!`), Operator `%` (Postfix) und `:`. Argument-Trenner `,`; `;` (deutsches Excel)
   nur mit `formulaLocale: "de"` und dann Dezimalkomma? Funktionsnamen englisch in v1.
6. **Abhängigkeitsgraph und Neuberechnung:** Vorgänger je Formelzelle; Rückwärtsindex für Einzelbezüge und ein
   **Intervall-Index je Spalte** für Bereiche (keine Kante je Zelle, S18); Neuberechnung = transitive Abhängige markieren
   → topologisch auswerten, Zyklen über starke Zusammenhangskomponenten → `#CIRC!`; volatile Funktionen; Erstladung in
   einem Durchlauf. Synchron oder in Abschnitten (`requestIdleCallback`) bei sehr großen Mengen? Empfehlung synchron +
   Bench, Abschnitte nur bei Bedarf. Speicher je Formelzelle schätzen.
7. **Wertsemantik wie Excel:** leere Zelle = 0 bzw. „“, Text in Arithmetik (`"3"+1` = 4), Booleans, Fehlerweitergabe,
   15 signifikante Stellen. **Datum:** JS-`Date`/ISO-Text oder Excel-Seriennummer (für `=A2+1`, `DATEDIF`, Export)?
8. **Funktionsbibliothek Stufe 1** (~60, Rest später): Mathe (`SUM`, `SUMPRODUCT`, `ROUND`, `ROUNDUP`, `ROUNDDOWN`, `INT`,
   `AVERAGE`, `COUNT`, `COUNTA`, `COUNTBLANK`, `MIN`, `MAX`), bedingt (`SUMIF(S)`, `COUNTIF(S)`, `AVERAGEIF(S)` mit
   Kriterien `">5"`, `"M*"`), Logik (`IF`, `IFS`, `IFERROR`, `SWITCH`, `XOR`), Suche (`VLOOKUP`, `HLOOKUP`, `XLOOKUP`,
   `INDEX`, `MATCH`), Text (`TEXTJOIN`, `LEFT`, `RIGHT`, `MID`, `FIND`, `SEARCH`, `SUBSTITUTE`, `VALUE`, `TEXT` als
   Teilmenge), Datum (`TODAY`, `NOW`, `DATE`, `YEAR`, `MONTH`, `DAY`, `WEEKDAY`, `EOMONTH`), Info (`ISNUMBER`, `ISTEXT`,
   `ISERROR`, `NA`). Bereichs-Argumente als 2D-`FormulaRange` auch für eigene Funktionen (`FormulaOptionsIf.functions`
   additiv). Erwartungswerte aus LibreOffice (headless) mit einer festen Testmappe, Erzeugung dokumentiert.
9. **Bezüge verschieben** DOM-frei: `shiftFormula(source, dRow, dCol)` (Fill, Kopieren), `adjustFormula(source, edit)`
   für Zeilen/Spalten einfügen, löschen, verschieben (`#REF!`).
10. **Naht `FormulaEngineIf`:** Anwender könnten eine fremde Engine (z. B. HyperFormula mit eigener Lizenz) anschließen;
    der Core liefert nur die eigene. Lohnt der Aufwand? Empfehlung.

**Teil B – Tabelle**

11. **Anzeige und Editor:** `getValueAt` = berechneter Wert, neuer Rohwert (`getRawValueAt` o. ä.) für Editor und
    Formelleiste; Sortieren, Filter, Footer, Copy, Excel nutzen Werte (S23).
12. **Schreiben:** `applyCellChanges` → Engine → Neuberechnung → nur geänderte abhängige Zellen neu zeichnen. Meldet
    `onModelChanged` die abhängigen Zellen? Empfehlung nein (abgeleitet, wie berechnete Spalten); optional
    `onSheetRecalculated` mit der Liste.
13. **Füllen/Kopieren/Undo:** `computeFillValues` (010) erkennt Formel-Quellen und verschiebt sie; 014 nutzt
    `shiftFormula` für interne Kopien; 015 speichert Rohtexte.
14. **Excel-Export** (S20): Tabellen-Adresse ↔ Excel-Zelle (Kopfzeilen-Versatz, versteckte Spalten, Filter). Formeln nur,
    wenn die Exportsicht das ganze Blatt in physischer Reihenfolge ist, sonst Werte + Warnung.
15. **API:** `getCellAddress(row, col)`/`parseCellAddress("B3")`, `getCellFormula`, `setCellFormula`,
    `evaluateFormula(source)`, `getSheetValue("B3")`, `recalculate()`, `getPrecedents`/`getDependents`.

**Teil C – Formel-Eingabe** (im Editor aus 013)

16. **Zeigemodus** (S14): wann ein Pfeil/Klick einen Bezug einfügt (nach `=`, `(`, `,`, Operator) und wann er übernimmt
    (Excel-Regel); Bereich per Maus ziehen; F4-Zyklus `$A$1 → A$1 → $A1 → A1`.
17. **Farbige Bezugsrahmen** (S15): Ebene wie die Auswahlrahmen, Klassen `ge-table-formula-ref-0` … `-7`, Variablen
    `--ge-table-formula-ref-*` light/dark, `aria-hidden`. Farben im Editor-Text: Spiegel-Div hinter einem normalen
    `input` (kein `contenteditable`) – entscheiden.
18. **Vorschläge** (S16): Liste nach APG-Combobox (`role="listbox"`, `aria-autocomplete="list"`,
    `aria-activedescendant` am Editor), Argument-Hinweis `role="tooltip"`; Texte über `AriaTextsIf`.
19. **Fehler bei der Eingabe:** Syntaxfehler speichern und `#ERROR!` zeigen (+ Ansage) oder ablehnen wie Excel? Kein
    modaler Dialog (UI gehört der App); Option `rejectInvalidFormulas`.

**Nicht-Ziele (bestätigen):** mehrere Blätter und Blattbezüge, benannte Bereiche (evtl. Stufe 2), Matrix-/Spill-Formeln,
lokalisierte Funktionsnamen, Formel-Spurverfolgung als UI, XLSX-Import.

## Phase 2 – Tests (zusätzlich zu 000)

- Unit, Teil A: Adressen (`A1`, `$AB$12`, `XFD`, Grenzen), Parser-Erweiterung (Präzedenz von `:` und `%`), Verschieben
  und Anpassen (Tabelle), Graph (Einzel- und Bereichsabhängige, Zyklen, volatil), **S26 als Property-Test** (fester Seed:
  zufällige Blätter und Änderungen, inkrementell = von vorn), Funktionen gegen LibreOffice-Werte
  (`test-utils/sheet-reference-values.json`), Fuzzing (wirft nie), Sicherheit S21 (Liste wie in 008).
- Browser, Teil B/C: S3, S6–S16, S20 (ZIP-Leser, `<f>` und `<v>`), S22–S25, axe für Vorschlagsliste und Rahmen.
- Bench `bench/sheet.bench.ts` (S18), keine Zeit-Assertions.
- 008-Specs unverändert grün.

## Phase 3 – Hinweise

- Teil A in `src/lib/table/sheet/` (DOM-frei): `cell-address.ts`, `sheet-engine.ts`, `dependency-graph.ts`,
  `range-index.ts`, `shift-formula.ts`, `functions/*.ts`. `formula/` **erweitern**, nicht kopieren.
- Teil B: Adapter je Area-Modell, Neuberechnung nach `writeCellsInternal`, Zeichnen über den `updateCells`-Weg.
- Teil C in `src/lib/table/sheet-ui/` (Zeigemodus, Rahmen, Vorschläge), alles über `DomServiceIf`, Texte per
  `textContent`.

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` Abschnitt „Spreadsheet formulas“ (Grammatik, Funktionstabelle, Unterschiede zu Excel,
  Sicherheitshinweis), Verweis aus 5.9 (Spaltenformeln).
- **Website:** `why.astro` Zeile „Spreadsheet cell references (A1) & formula editor“ und „Rule of thumb“ anpassen,
  `build-buy-or-guiexpert.astro`, `checklist.astro`; `new-features.ts`.
- **Training/Video:** mit 017 (eigenes Kapitel, Folge „Excel im Browser“); optional eigene Folge „Excel-Formeln mit
  Zellbezügen – MIT-lizenziert“.

## Abschluss-Review (Schwerpunkte)

Sicherheit (kein Code aus Formeln), Korrektheit gegen LibreOffice, inkrementell = von vorn, Bezugsanpassung bei Füllen,
Kopieren, Einfügen/Löschen, Leistung großer Bereiche, keine Verhaltensänderung für 008-Spaltenformeln.

## Definition of Done (zusätzlich zu 000)

- [ ] Design mit Adressierung, Ablage, Graph, Datumsmodell, Funktionsliste und Lieferreihenfolge A → B → C 🛑
- [ ] Teil A: S1–S5, S17–S19, S21, S25, S26 inkl. Property-Test, Fuzzing, Bench
- [ ] Teil B: S3, S6–S13, S20, S22–S24
- [ ] Teil C: S13–S16 mit Screenreader-Prüfung der Vorschlagsliste
