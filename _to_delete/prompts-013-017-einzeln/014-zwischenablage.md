# TODO-Prompt 014: Zwischenablage – Kopieren, Ausschneiden, Einfügen (Excel, Google Sheets)

> Status: offen · angelegt 16.10.2026 · Slug `clipboard` (Branch `feat/clipboard`, Design `prompts/014-zwischenablage.design.md`)
> Reihe **Tabellenkalkulation 013–017**. Abhängigkeiten: **013** (Tastatur-Auswahl, Ansagen, `"clear"`), 010
> (`applyCellChanges`, Batch-Edit), 004 (Zeilennummern werden nicht mit eingefügt).
> ag-Grid: Clipboard (Kopieren/Einfügen von Bereichen) ist Enterprise. Vor dem Video prüfen.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Daten zwischen der Tabelle und Excel, Google Sheets, LibreOffice oder einem Texteditor hin- und herkopieren, wie
Anwender es erwarten: Strg/⌘+C, +X, +V. Ein Wert in einen markierten Bereich, Bereiche kacheln, am Ende optional neue
Zeilen anlegen. Alles läuft über die eine Schreibstelle (Prüfungen, Batch, ein Event) und wird in 015 rückgängig machbar.

## Was es heute gibt (Code-Befund 16.10.2026)

- `CopyService.createContent` baut TSV aus `getTextValueAt` (angezeigter Text), Trennzeichen `\t`/`\n`, **ohne
  Quoting**: eine Zelle mit Tab, Zeilenumbruch oder Anführungszeichen zerreißt die Struktur in Excel.
  `copyContent` nutzt `navigator.clipboard.writeText` (asynchron) → nur `text/plain`, kein `text/html`.
  `maxCopyCells` = 1 Mio. Eigene `CopyServiceIf` kann man dem `TableScope` übergeben.
- **Einfügen und Ausschneiden fehlen** (`TODO.md`, Folgepunkte 010). `ctrl+x` ist auf `DESELECT_ALL` gemappt.
- `getTextValueAt` liefert formatierten Text (z. B. „1,234.50 €“); der Rückweg braucht einen Parser (`editInputPipe`).
- Fill (010) hat die Regeln „angezeigte Zeilen in Anzeigereihenfolge“, „nicht Editierbares überspringen“ – gleiche
  Regeln hier.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| P1 | B2:C3 kopieren, in Excel einfügen | 2×2 Zellen; Zahlen kommen als Zahlen an |
| P2 | Zelle mit Tab, Zeilenumbruch, `"x"` | in Excel jeweils **eine** Zelle (Quoting mit `"…"`, `""`) |
| P3 | 3×2 aus Excel kopiert, Fokus D5, Strg+V | D5:E7 befüllt, ein Event `source: "paste"`, Auswahl = eingefügter Bereich, Ansage „6 cells pasted“ |
| P4 | ein Wert kopiert, B2:B10 markiert, einfügen | alle 9 Zellen |
| P5 | 2 Zeilen kopiert, 6 Zeilen markiert | gekachelt (dreimal); nicht teilbar → einmal (Excel) |
| P6 | über die letzte Spalte hinaus | abgeschnitten, Ansage nennt die ausgelassenen Zellen |
| P7 | über die letzte Zeile hinaus | Option `pasteAddsRows` + `createRow()`: neue Zeilen; sonst abgeschnitten |
| P8 | Ziel mit nicht editierbaren, berechneten, versteckten Spalten | übersprungen; versteckte Spalten zählen nicht (Anzeige) |
| P9 | gefiltert und sortiert | angezeigte Zeilen in Anzeigereihenfolge (wie Fill H7) |
| P10 | „1.234,56“ in Zahlenspalte, Locale de-DE | 1234.56 über die Zahlen-Pipe mit Locale |
| P11 | Wert scheitert an `validate` | Zelle übersprungen und angesagt, Rest eingefügt |
| P12 | B2:B4 ausschneiden, in D2 einfügen | B2:B4 leer, D2:D4 Werte, **ein** Event `source: "cut"`, gestrichelter Rahmen bis Einfügen/Escape |
| P13 | Batch-Edit aktiv | eingefügt = vorgemerkt |
| P14 | 100.000 Zellen einfügen | < 1 s (Bench), darüber `maxPasteCells` mit Ansage |
| P15 | `text/html` mit `<img src=x onerror=alert(1)>` | als Text, kein Element, kein Script |
| P16 | Strg+V im offenen Editor | gehört dem Editor (Browser) |
| P17 | `api.pasteText("a\tb\n1\t2")`, `api.getSelectionAsText()` | wie die Tastatur, ohne Zwischenablage-Rechte |
| P18 | aus Google Sheets (`text/html` + `text/plain`) | Werte korrekt, auch leere Zellen |
| P19 | Option aus (Default) | Strg+C wie 1.1.98; Strg+V/X tun nichts |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Ereignisse:** `copy`/`cut`/`paste`-Events am Host (synchron, `clipboardData`, keine Berechtigungsabfrage, alle
   Browser) statt `navigator.clipboard.*`. Strg+C dann über das `copy`-Event; `api.copyToClipboard()` bleibt (async API).
   Was heißt das für eigene `CopyServiceIf`-Implementierungen (additiv erweitern, alte Methoden weiter aufrufen)?
2. **Formate beim Kopieren:** `text/plain` TSV mit Excel-Quoting + `text/html` `<table>` (escaped)? Inhalt angezeigter
   Text (heute) oder Rohwert (Zahl ohne Tausendertrenner, ISO-Datum)? Option `copyValue` („text“ oder „raw“).
   Kopieren innerhalb der Tabelle behält Rohwerte (und in 016 Formeln) über einen Speicher im Speicher, erkannt am Text.
3. **Formate beim Einfügen:** nur `text/plain` (robust) oder auch `text/html` (Excel/Sheets liefern `<table>`)?
   Empfehlung: `text/plain`, HTML nur ohne `text/plain`; HTML per `DOMParser` (inertes Dokument), nur `textContent`.
4. **TSV DOM-frei** (`clipboard/tsv.ts`: `parseTsv`, `toTsv`): CRLF, abschließender Zeilenumbruch, Anführungszeichen,
   ungleich lange Zeilen, BOM, Excel-Eigenheiten (eine Zelle mit Zeilenumbruch).
5. **Umwandlung:** `editInputPipe` (vorhanden) oder neues `ColumnDef.parseValue?(text, ctx)`? Eingebaute Pipes für
   Zahl (Locale), Datum, Boolean. Was passiert ohne Pipe (Text bleibt Text)?
6. **Ziel-Regeln** P4–P7 wie Excel; `pasteAddsRows` + `createRow(index)` nur für Objekt-Arrays und Array-of-Arrays.
7. **Ausschneiden:** Rahmen `ge-table-cut-range` (eigene Ebene, `aria-hidden`, Ansage); geleert wird erst beim Einfügen
   (Excel), ein Änderungssatz für Quelle und Ziel. Konflikt `ctrl+x` → `DESELECT_ALL`: nur bei eingeschaltetem
   `clipboard` umbelegen (kein Breaking Change) oder grundsätzlich? In den Release-Notes nennen.
8. **Mehrere Bereiche:** Excel lehnt nicht ausgerichtete ab, Sheets nimmt den letzten. Empfehlung.
9. **Optionen:** `tableOptions.clipboard?: boolean | Partial<ClipboardOptionsIf>` (`copyHeaders`, `copyValue`,
   `pasteAddsRows`, `createRow`, `maxPasteCells`, `processPaste(ctx)` zum Ändern/Ablehnen, `processCopy(ctx)`).
   `CellChangeSource` additiv `"paste"`, `"cut"`.
10. **Formeln (016):** intern kopiert = Formeln mit verschobenen relativen Bezügen; nach außen = Werte; eingefügter Text
    mit führendem `=` ist nur im Sheet-Modus eine Formel. Hier nur die Naht (`ClipboardCellIf { raw, text }`) vorsehen.

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: `parseTsv`/`toTsv` als Tabelle (Hin und zurück gleich, Excel-Beispiele als Fixture mit echten Zwischenablage-
  Inhalten aus Excel, Sheets, LibreOffice), Ziel-Regeln (Kacheln, Abschneiden, Anhängen), Locale-Pipes.
- Browser: `ClipboardEvent` mit `DataTransfer` (P3–P13, P15–P19), Event-Anzahl, Auswahl danach, Batch, RTL, gefiltert.
- HTML-Injection P15, Bench P14 (`bench/clipboard.bench.ts`). Wrapper-Smoke: `modelChanged` mit `source: "paste"`.
- Manuell (Protokoll im Design-Dokument): Chrome, Firefox, Safari jeweils Excel ↔ Tabelle ↔ Sheets.

## Phase 3 – Hinweise

- Ordner `src/lib/table/clipboard/` (`clipboard-options.if.ts`, `clipboard-service.ts` als `tableScope.clipboardService`,
  `tsv.ts`, `paste-plan.ts` DOM-frei: Matrix + Ziel → `CellValueChangeIf[]`).
- Einfügen läuft über `applyCellChanges(…, "paste")`, Ausschneiden über **einen** Aufruf mit Quelle (leeren) und Ziel.
- Listener über `listenerAbortController`; Events in Detailzeilen ignorieren (`isEventInDetail`).

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` Abschnitt „Clipboard“ (Formate, Regeln, Beispiel `processPaste`).
- **Training:** Abschnitt im Kapitel zur Auswahl/Copy (Folge 15 „Zellen selektieren + Copy“); Kapitel kommt mit 017.
- **Website:** `new-features.ts`, Feature-Liste, `why.astro` (Zeile Clipboard prüfen). Demo `apps/table-demo/clipboard.html`.
- **Video:** möglich als eigene Folge „Copy & Paste mit Excel – ohne Enterprise-Lizenz“ oder Teil von 017.

## Abschluss-Review (Schwerpunkte)

Quoting-Rundreise mit Excel, kein HTML im DOM, keine Schreibzugriffe auf Nicht-Editierbares, Ausschneiden als ein
Vorgang, Verhalten ohne Option unverändert.

## Definition of Done (zusätzlich zu 000)

- [ ] Design mit Formaten, Ziel-Regeln, Tastenbelegung (`ctrl+x`) 🛑
- [ ] P1–P19 umgesetzt und getestet, manuelle Rundreise Excel/Sheets protokolliert
- [ ] `TODO.md`: Folgepunkt 010 „Einfügen aus der Zwischenablage“ abgehakt
