# TODO-Prompt 008: Berechnete Spalten, „Show values as“ und Formeln

> Status: **offen** · angelegt 14.10.2026 · Slug `calculated` (Branch `feat/calculated`, Design `prompts/008-formeln-berechnete-spalten-show-values-as.design.md`)
> Abhängigkeiten: **005 (Aggregation)** für Summen; **006 (Row Grouping)** und **007 (Pivot)** für „Anteil an der
> Gruppe“ bzw. „Anteil an Zeile/Spalte“. Teil A (berechnete Spalten) geht auch ohne sie.
> ag-Grid: Formulas (v35), Calculated Columns und Show Values As (v36) sind dort **Enterprise**.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Drei verwandte Features, in dieser Reihenfolge und **in Teilen lieferbar** (jeder Teil ist ein eigenes Release wert):

- **Teil A – Berechnete Spalten:** Spalten, deren Wert aus anderen Feldern der Zeile berechnet wird, z. B.
  `total = price * quantity`, ohne die Daten zu verändern. Sortieren, Filtern, Kopieren, Excel und Aggregation (005)
  funktionieren damit genauso wie mit echten Feldern.
- **Teil B – „Show values as“:** Zahlen anders darstellen, ohne die Daten zu ändern: Anteil an der Spaltensumme, an der
  Zeilensumme (Pivot), an der Gesamtsumme, an der übergeordneten Gruppe, Differenz zur Vorzeile, laufende Summe, Rang.
- **Teil C – Formeln:** Ausdrücke als Zeichenkette, die Anwender selbst eingeben können (z. B. `[price] * [quantity] *
  1.19`), mit eingebauten Funktionen (`SUM`, `ROUND`, `IF` …). Das ist der größte und riskanteste Teil. Phase 1
  entscheidet, wie weit er geht (spaltenweise Ausdrücke vs. echte Zellformeln wie in Excel).

## Was es heute gibt (Code-Befund Okt. 2026)

- `ColumnDef` hat **keinen** `valueGetter`. Felder: `property`, `headerLabel`, `width`, `classes`, `rendererMap`,
  `minWidth`, `maxWidth`, `sortable`, `sortComparator`, `sortState`, `sortStatesOrder`, `sortIconVisible`, `editable`,
  `getEditRenderer`, `editInputPipe`, `isVisible` (`data/tablemodel/column/column-def.ts`).
- Werte kommen aus dem Area-Modell: `AreaModelObjectArray.getValueAt` → `getValueByT(t, property)` (auch Pfade mit
  `.`); Sortierung über `genericFlatTableSortComparator(property, f)`; `AreaModelTree` analog (`getValueByT`,
  `genericTreeTableSortComparator`).
- Heute löst man berechnete Werte mit einem Renderer (nur Anzeige, Sortierung/Export falsch) oder rechnet sie in die
  Daten ein.
- Copy und Excel nutzen `getValueAt` bzw. `getTextValueAt`.
- Der Excel-Writer (`service/excel-service.ts`) schreibt heute Werte. Ob er Formeln (`<f>`) kann, prüfen.

## Referenzfälle

Daten: `{ product: 'Laptop', price: 1299, quantity: 2 }`, `{ product: 'Monitor', price: 349, quantity: 3 }`,
`{ product: 'Mouse', price: 25, quantity: 10 }`

| # | Teil | Situation | Erwartung |
|---|---|---|---|
| F1 | A | Spalte „Total“ = `price * quantity` | 2598, 1047, 250 |
| F2 | A | nach „Total“ absteigend sortieren | Laptop, Monitor, Mouse |
| F3 | A | Filter „Total > 500“ | Laptop, Monitor |
| F4 | A | Copy / Excel | berechnete Werte stehen drin |
| F5 | A | Footer `sum(total)` aus 005 | 3895 |
| F6 | A | `price` der Zeile Mouse editiert auf 30 | Total 300 nach dem Repaint, Footer 3945 |
| F7 | A | Berechnete Spalte editieren | nicht editierbar (oder `valueSetter`, falls entschieden) |
| F8 | B | „Anteil an der Spaltensumme“ für Total | 66,7 %, 26,9 %, 6,4 % (Summe 100 %) |
| F9 | B | mit Filter „Total > 500“ | Anteil bezogen auf die **gefilterten** Zeilen (oder alle; entscheiden) |
| F10 | B | Row Grouping (006), „Anteil an der Gruppe“ | Detailzeilen summieren sich je Gruppe zu 100 % |
| F11 | B | Pivot (007), „Anteil an der Zeilensumme“ | jede Pivot-Zeile summiert sich zu 100 % |
| F12 | B | Sortieren/Export einer Spalte mit „Show values as“ | sortiert nach dem angezeigten oder dem Rohwert (entscheiden); Export wie entschieden |
| F13 | C | Formel `[price] * [quantity] * 1.19` | 3091,62 … |
| F14 | C | Formel mit Fehler (`[price] / 0`, unbekanntes Feld, Syntaxfehler) | `#DIV/0!`, `#NAME?`, `#ERROR!` statt Exception |
| F15 | C | Formel mit Zirkelbezug (falls Zellbezüge erlaubt) | `#CIRC!` |
| F16 | C | Formel aus Benutzereingabe `constructor.constructor('alert(1)')()` | wird nicht ausgeführt (kein `eval`, kein `new Function`, CSP-tauglich) |
| F17 | C | 1 Mio. Zeilen mit einer Formelspalte | Ausdruck einmal kompiliert, Auswertung nur für sichtbare Zeilen bzw. gecacht |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

**Teil A**
1. `ColumnDef.valueGetter?: (row: T, rowIndex: number) => unknown` (additiv) und optional `valueSetter`. Wo wird er
   ausgewertet (`getValueByT` in Objekt-Array- und Baum-Modell), damit Sortierung, Filter, Copy, Excel und 005 ihn
   automatisch nutzen? Was gilt für eigene `AreaModel`s und Array-of-Arrays?
2. Caching: nie, je Render, oder je Zeile mit Invalidierung bei Änderungen (`onModelChanged`, `updateCells`)?
3. Filterfunktion: bekommt weiter die Zeile; Hilfsfunktion `api.getCellValue(row, property)` für berechnete Werte?

**Teil B**
4. Konfiguration: `ColumnDef.showValuesAs?: 'percentOfColumnTotal' | 'percentOfRowTotal' | 'percentOfGrandTotal' |
   'percentOfParentTotal' | 'differenceFromPrevious' | 'runningTotal' | 'rank'` oder in der Aggregations-/Pivot-
   Konfiguration? Umschalten zur Laufzeit (`api.setShowValuesAs(column, mode)`)?
5. Bezugsmenge: gefilterte oder alle Zeilen (F9); Sortierung und Export nach Anzeige- oder Rohwert (F12).
6. Darstellung: eigener Prozent-Renderer, Nachkommastellen, Locale.

**Teil C**
7. **Umfang:** (a) Ausdrücke je Spalte mit Bezügen auf Felder derselben Zeile (`[price] * [quantity]`), (b) zusätzlich
   Spalten-Aggregate (`[total] / SUM([total])`), (c) echte Zellformeln mit Zellbezügen wie in Excel (`=B2*C2`).
   Bezüge nach Zeilenposition sind bei Sortierung und Filter instabil. Empfehlung begründen (vermutlich a + b).
8. **Ausdruckssprache ohne Abhängigkeiten:** eigener Tokenizer + Parser (z. B. Pratt) + Auswerter auf einem AST,
   **kein `eval`, kein `new Function`** (Sicherheit und Content-Security-Policy). Operatoren, Vergleiche, Zeichenketten,
   Funktionsbibliothek (`SUM`, `AVG`, `MIN`, `MAX`, `ROUND`, `ABS`, `IF`, `AND`, `OR`, `CONCAT`, `LEN`, `TODAY`?).
   Erweiterbar über eigene Funktionen.
9. **Fehlerwerte** wie in Tabellenkalkulationen (F14, F15) und ihre Anzeige (CSS-Klasse `ge-table-cell-error`).
10. **Benutzeroberfläche:** ag-Grid hat einen Formel-Editor und eine Oberfläche zum Anlegen berechneter Spalten. Hier
    nur API + Beispiel in plain HTML (Eingabefeld → neue Spalte)? Eine eingebaute UI widerspricht der Linie „UI gehört
    der Anwendung“ (Checklist-Kapitel); begründen.
11. **Excel-Export** von Formelspalten: Werte (sicher) oder Excel-Formeln (Feldbezüge in A1-Bezüge übersetzen)?
12. Gemeinsames Fundament: Teil C nutzt die Aggregatoren aus 005 für `SUM`/`AVG`; Teil A liefert die `valueGetter`-
    Mechanik, auf der Teil C aufsetzt (Formelspalte = `valueGetter` aus kompiliertem Ausdruck).

## Phase 2 – Tests (zusätzlich zu 000)

- Teil A, Unit: F1, F2, F3, F5 (mit 005), F7; Pfade und Accessoren; Cache-Invalidierung.
- Teil A, Browser: Sortieren per Header-Klick, F4 (Copy/Excel mit ZIP-Leser), F6 (Editieren der Quellspalte).
- Teil B: F8–F12, Rundung so, dass 100 % nicht zu 99,9 % wird (oder dokumentieren); mit 006/007 sobald vorhanden.
- Teil C, Unit: Tokenizer/Parser (Präzedenz, Klammern, Zeichenketten mit Escapes, Zahlenformate), Auswertung,
  Fehlerwerte F14/F15, **Sicherheit F16** (Liste bösartiger Eingaben als Tabelle), Fuzzing mit festem Seed (darf nie
  werfen, nur Fehlerwerte liefern), F17 als Bench.
- HTML-Injection: Formelergebnis bzw. Fehlermeldung mit `<img src=x onerror=…>` → Text.

## Phase 3 – Hinweise

- Ablage z. B. `src/lib/table/calc/` (Teil A/B) und `src/lib/table/formula/` (Teil C: `tokenizer.ts`, `parser.ts`,
  `evaluator.ts`, `functions.ts`), alles DOM-frei.
- `valueGetter` an genau einer Stelle auswerten, damit Sortierung, Filter, Copy, Excel und Aggregation automatisch
  stimmen; bestehendes Verhalten ohne `valueGetter` bit-genau gleich lassen.

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` §5.2 (Spaltendefinitionen: `valueGetter`) und eigener Abschnitt „Formulas“ mit Grammatik
  und Funktionsliste; Sicherheitshinweis (keine Code-Ausführung).
- **Training:** Teil A als Abschnitt in `column-definitions`; Teil B im Kapitel von 006/007 oder eigenes Kapitel;
  Teil C eigenes Kapitel in Teil 8.
- **Website:** Showcase `formulas` (Rechnung mit Netto/MwSt./Brutto, Anteil am Umsatz); Feature-Liste; `why.astro`
  prüfen.
- **Video:** zwei Folgen denkbar: „Berechnete Spalten in 60 s“ und „Formeln ohne Enterprise-Lizenz“.

## Abschluss-Review (Schwerpunkte)

Sicherheit des Auswerters (kein `eval`), Korrektheit (Präzedenz, Rundung, Fehlerwerte), Performance bei großen
Tabellen, keine Verhaltensänderung für Spalten ohne `valueGetter`.

## Definition of Done (zusätzlich zu 000)

- [ ] Design-Dokument mit Umfang je Teil (insbesondere Teil C) und Lieferreihenfolge 🛑
- [ ] Teil A: `valueGetter` mit F1–F7
- [ ] Teil B: Show values as mit F8–F12 (F10/F11 sobald 006/007 umgesetzt)
- [ ] Teil C: Ausdruckssprache mit F13–F17, Sicherheitstests, Fuzzing, Bench
