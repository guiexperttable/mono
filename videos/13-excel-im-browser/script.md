# Folge 13 – „Excel im Browser: Formeln, Copy & Paste, Undo – MIT-lizenziert“

**Problem:** Anwender wollen in der Web-App arbeiten wie in Excel: Zelle anklicken und lostippen, einen Block aus Excel
einfügen, `=SUMME(…)` schreiben, Strg+Z. Selbst gebaut heißt das: Editor, Tastatur, Zwischenablage, Undo-Stack und ein
Formel-Parser mit Abhängigkeitsgraph – Monate Arbeit. Bei ag-Grid sind Zwischenablage, Fill-Handle, Bereichsauswahl und
Formeln mit A1-Bezügen Enterprise-Funktionen (Undo/Redo ist Community).
**Kernbotschaft:** Ein Aufruf – `SpreadsheetFactory.create({ data })` – und es ist ein Tabellenblatt: Buchstaben,
Zeilennummern, Formeln mit Zellbezügen (70 Excel-Funktionen, nie als Code ausgeführt), Copy & Paste mit Excel, Undo/Redo,
Formelleiste. MIT-lizenziert, null Abhängigkeiten, in jedem Framework.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Excel im Browser: Formeln, Copy & Paste, Undo – MIT-lizenziert“ · „Ein Tabellenblatt in einer
Zeile Code“ · „=SUMME in deiner Web-App – ohne Enterprise-Lizenz“.
**Weitere Folgen (optional):** „Copy & Paste mit Excel – ohne Enterprise-Lizenz“ (Option `clipboard`, Training Kapitel
22 „Cut and paste“) · „Excel-Formeln mit Zellbezügen“ (Zeigemodus, F4, farbige Bezüge, Zeilen einfügen → Bezüge wandern).

## Voraussetzung

`@guiexpert/table` **1.1.99** (Branches `feat/spreadsheet-1-editing` … `feat/spreadsheet-8-website`). Vor der Aufnahme:
`pnpm build:core`. Eine Excel-Datei (oder Google Sheets) mit 3 × 2 Zahlen offen.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | Excel: Block B2:D3 markieren, Strg+C → `demo.html`: B4 anklicken, Strg+V – die Zahlen landen in den Zellen, die Summen springen | „Aus Excel kopieren, in die Web-App einfügen – und alles rechnet mit.“ |
| 8–25 s | `snippet.ts`, Zeilen 3–10 hervorheben | „Ein Aufruf: SpreadsheetFactory. Formeln sind einfach Text mit Gleichheitszeichen – wie in Excel.“ |
| 25–38 s | Zeile 14 | „Die Formelleiste ist optional – eine Zeile. Das Ganze läuft in React, Angular, Vue, Svelte oder ohne Framework.“ |
| 38–55 s | `demo.html`: F2 in leerer Zelle, `=SUM(` tippen → Vorschlagsliste; mit Pfeiltasten B2:B5 zeigen (farbiger Rahmen), Enter; Wert in B3 ändern → Summen; Strg+Z, Strg+Y; „Excel“ → Datei öffnen: echte Formeln; Haken **dunkel** | „Bezüge zeigen mit den Pfeiltasten, wie in Excel. Rückgängig mit Strg+Z. Und der Export nach Excel enthält die Formeln, nicht nur die Zahlen.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/showcase/spreadsheet · „MIT“ | „Excel im Browser. MIT-lizenziert. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 14 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit zwei Posten mehr, `locale: "de-DE"` (getipptes „1,5“ = 1,5), Knöpfen
für Rückgängig/Wiederholen (`onUndoStackChanged`), Excel-Export mit Formeln und dem Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/13-excel-im-browser/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: Excel kopieren → B4 einfügen → F2 / `=SUM(` → Pfeiltasten → Enter → B3 ändern →
   Strg+Z / Strg+Y → „Excel“ → dunkel.
4. Englische Variante: Showcase `/showcase/spreadsheet/run` (`pnpm serve:webpage-guiexpert`, Angebot mit Rabatt, MwSt.
   und Kontextmenü) oder `pnpm serve:table-demo` → `http://localhost:4200/spreadsheet.html`.
5. Einfügen aus Excel vorher in Chrome, Firefox **und** Safari einmal probieren (die automatischen Tests laufen nur in
   Chromium).

## Fakten-Check (für Beschreibungstext)

- API: `SpreadsheetFactory.create({ data, rowCount, columnCount, columnWidth, rowHeight, rowNumbers, locale, functions,
  tableOptions })`; einzeln: `tableOptions.editing`, `clipboard`, `undo`, `cellFormulas`, `fillHandle`; Preset
  `spreadsheet: true` für bestehende Tabellen. `FormulaBar`, `tableApi.undo()/redo()`, `insertRows/deleteRows/
  insertColumns/deleteColumns`, `getSheetData()`, `downloadExcel(…, { cellFormulas: true })`.
- Formeln: A1, `$A$1`, Bereiche, 70 Excel-Funktionen (englische Namen, `,` oder `;`), Fehler wie Excel (`#DIV/0!`,
  `#REF!`, `#CIRC!`), nur abhängige Zellen werden neu berechnet. Eigener Parser – kein `eval`, kein `new Function`.
- Zwischenablage: Text + HTML-Tabelle, Excel-Quoting (Tabs, Zeilenumbrüche, Anführungszeichen), ein Wert füllt die
  Auswahl; Ausschneiden = ein Vorgang.
- Undo/Redo: Tippen, Einfügen, Ausschneiden, Füllen, Löschen, Zeilen/Spalten – findet die Zeilen auch nach Sortieren.
- Leere Blätter kosten nichts: 1 Mio. Zeilen speichern nur gefüllte Zellen.
- ag-Grid (Stand Okt. 2026, ag-grid.com): Undo/Redo Community; Clipboard, Fill-Handle, Bereichsauswahl, Formeln mit
  A1-Bezügen Enterprise. Sachlich bleiben, keine Preise nennen (CLAUDE.md §8).
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Showcase: https://gui.expert/showcase/spreadsheet/run · Training: Kapitel 40 „Spreadsheet“ (nach dem Website-Deploy).
