# TODO-Prompt 017: Spreadsheet-Modus – ein Excel-Grid in einer Zeile

> Status: offen · angelegt 16.10.2026 · Slug `spreadsheet` (Branch `feat/spreadsheet`, Design `prompts/017-spreadsheet-modus.design.md`)
> Reihe **Tabellenkalkulation 013–017**, **Abschluss der Reihe**. Abhängigkeiten: **013, 014, 015, 016** (bündelt sie),
> 004 (Zeilennummern), 010 (Fill-Handle), 003 (Zustand für Breiten/Scroll).
> Markt: Handsontable (kommerzielle Lizenz), HyperFormula (GPLv3 oder kommerziell), ag-Grid (Formeln, Bereichsauswahl,
> Clipboard: Enterprise). Vor dem Video auf den Herstellerseiten prüfen.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Was 013–016 liefern, soll man **mit einer Zeile** bekommen – und dazu die sichtbaren Bausteine einer
Tabellenkalkulation: Spaltenbuchstaben, Zeilennummern, Formelleiste mit Adressfeld, Zeilen und Spalten einfügen und
löschen, Speichern/Laden. Für ein leeres Blatt wie für vorhandene Objekt-Daten.

```ts
const { tableModel, tableOptions } = SpreadsheetFactory.create({ rowCount: 1000, columnCount: 26, data });
new FormulaBar(document.querySelector('#bar')!, api);   // optional, nach tableReady
```

## Was es heute gibt (Code-Befund 16.10.2026, ergänzt nach 013–016)

- Zeilennummern (004) mit `original`-Zählweise, Klick auf Nummer = ganze Zeile, Klick auf „#“ = alles.
- Header-Gruppen (`AreaModelCellGroups`), eigene Header-Modelle möglich – Spaltenbuchstaben gibt es nicht.
- Fill-Handle, Batch-Edit (010), `autoResizeColumns`, Spaltenbreiten im Zustand (003).
- **Kein Kontextmenü** im Core (CLAUDE.md §10), nur `onContextmenu`.
- Zeilen einfügen/löschen gibt es nur über die Daten der App (`setRows`) bzw. CRUD; keine Bezugsanpassung.
- Leitlinie aus 008: „UI gehört der Anwendung“ (kein eingebauter Formel-Editor). Hier neu abzuwägen.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| X1 | `SpreadsheetFactory.create({ rowCount: 100, columnCount: 26 })` | leeres Blatt A–Z × 1–100, Fokus A1, Bereichsauswahl, Excel-Bedienung, Clipboard, Undo, Formeln, Fill-Handle an |
| X2 | `data: unknown[][]` mit Formeln | Werte und Formeln; `api.getSheetData()` liefert dasselbe zurück |
| X3 | Kopf | A … Z, AA, AB …; Klick auf Buchstabe = Spalte, auf Zeilennummer = Zeile, Ecke = alles; Shift-Klick erweitert |
| X4 | Formelleiste | zeigt `B3` und den Rohinhalt; Tippen dort ändert die Zelle (Enter übernimmt, Escape verwirft) |
| X5 | Adressfeld `D10` + Enter, `B2:C5` + Enter | springt bzw. markiert |
| X6 | `api.insertRows(at, n)`, `deleteRows`, `insertColumns`, `deleteColumns` | Bezüge angepasst (016 S8), ein Undo-Schritt (015) |
| X7 | 1 Mio. Zeilen × 26 Spalten, leer | flüssig, Speicher dünn besetzt (nur gefüllte Zellen) |
| X8 | Vorhandene Objekt-Daten: `tableOptions.spreadsheet: true` | Excel-Bedienung, Clipboard, Undo, Buchstaben über den Labels; Formeln nur in freigegebenen Spalten |
| X9 | React, Vue, Svelte, Solid, Preact, Angular, Web Component | gleiche Fabrik und Option, **kein** Wrapper-Code; `FormulaBar` in allen nutzbar |
| X10 | Speichern/Laden | JSON-Beispiel (Daten mit Formeltexten), Breiten/Scroll über den Zustand (003) |
| X11 | Excel-Export | mit echten Formeln (016 S20) |
| X12 | Dark Mode, RTL, axe, Tastatur ohne Maus | alles bedienbar, keine Verstöße |
| X13 | Kontextmenü-Beispiel (Demo, plain HTML) | Ausschneiden/Kopieren/Einfügen/Zeile einfügen/löschen über die API |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Form:** Fabrik `SpreadsheetFactory.create(…)` (neues dünn besetztes Modell + Optionen) **und** Preset
   `tableOptions.spreadsheet: true | Partial<SpreadsheetOptionsIf>` für vorhandene Modelle? Was genau schaltet das Preset
   ein (Liste aus 013–016), was bleibt aus?
2. **Formelleiste:** (a) nur API + Beispiel in plain HTML (Linie aus 008) oder (b) eine kleine optionale Klasse
   `FormulaBar` im Core (plain DOM, keine Abhängigkeit, CSS-Variablen `--ge-table-formula-bar-*`, Adressfeld als Combobox,
   Eingabe mit Label), angebunden mit `new FormulaBar(container, api)` – in jedem Framework nutzbar, ohne
   Wrapper-Komponenten. Empfehlung (b), weil „leicht für den Anwender“ hier das Ziel ist; begründen.
3. **Spaltenbuchstaben:** eigenes Header-Modell (`AreaModelSheetHeader`, eine Zeile A, B, C) oder zusätzliche
   Header-Zeile über den Labels (Objekt-Daten: „A“ über „Price“)?
4. **Speicher:** dünn besetzt (`Map` je Zeile) für große leere Blätter vs. Array-of-Arrays; virtuelle Zeilenzahl,
   „Wachsen“ am Ende (`growBy`)?
5. **Einfügen/Löschen:** in welchen Modellen (Blatt: Zeilen und Spalten; Objekt-Daten: nur Zeilen über `createRow`)?
6. **Kontextmenü:** nur Beispiel in der Demo, oder eigener Prompt 018 „Kontextmenü“ (auch für andere Features nützlich)?
   Empfehlung: Beispiel hier + Eintrag in `TODO.md`/`prompts/README.md`.
7. **Nicht-Ziele bestätigen:** mehrere Blätter, Zellformatierung (fett, Farben, Zahlenformat je Zelle), verbundene Zellen
   per UI, bedingte Formatierung per UI, Diagramme, gemeinsames Bearbeiten, XLSX-Import (eigener Prompt, ZIP/XML-Leser
   ohne Abhängigkeit), lokalisierte Funktionsnamen.

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: Spaltenbuchstaben (A, Z, AA, AZ, BA, XFD hin und zurück), dünnes Modell, Einfügen/Löschen mit Bezugsanpassung.
- Browser: X1–X8, X10–X13; `FormulaBar` (Synchronisation mit Fokus, Eingabe, Escape, Adressfeld), axe.
- Wrapper-Smoke: alle sieben mit `SpreadsheetFactory` (Mount → `tableReady`, Tippen → `modelChanged`).

## Phase 3 – Hinweise

- Ordner `src/lib/table/spreadsheet/` (`spreadsheet-factory.ts`, `spreadsheet-options.if.ts`, `area-model-sheet.ts`,
  `area-model-sheet-header.ts`, `formula-bar.ts`), CSS `css/table-spreadsheet.css` + Website-Kopie
  `src/styles/ge-table.css`.

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` Abschnitt „Spreadsheet mode“ (eine Zeile, dann Schritt für Schritt), README „Features“,
  beide `llms.txt`.
- **Website:** Showcase `spreadsheet` (z. B. Haushaltsbuch oder Angebot mit Formeln, Formelleiste, Kontextmenü),
  Vorschaubild, `new-features.ts`, `why.astro` (Zeilen Formeln, Clipboard, Undo, Bereichsauswahl), `/doc/`.
- **Training:** eigenes Kapitel in Teil 8, `spreadsheet`, Nummer = höchste + 1 (Stand 16.10.2026: 39 → **40**), Tag
  `ep-040` nach dem Release; Abschnitte aus 013–016 verlinken.
- **Video:** `videos/13-excel-im-browser/` – „Excel im Browser: Formeln, Copy & Paste, Undo – MIT-lizenziert“
  (Hook: Excel-Daten aus Excel kopieren, einfügen, `=SUM(…)` tippen, Wert ändern, alles rechnet nach; Vergleich sachlich,
  keine Preise, CLAUDE.md §8). Backlog CLAUDE.md §10 ergänzen.

## Abschluss-Review (Schwerpunkte)

Eine Zeile reicht wirklich (Snippet ≤ 15 Zeilen kompiliert), Bedienung ohne Maus, große leere Blätter, Bezugsanpassung
bei Einfügen/Löschen, Formelleiste barrierefrei, Wortwahl im Vergleich.

## Definition of Done (zusätzlich zu 000)

- [ ] Design mit Fabrik/Preset, Formelleisten-Entscheidung, Header-Lösung, Nicht-Zielen 🛑
- [ ] X1–X13 umgesetzt und getestet
- [ ] Showcase, Kapitel 40, Video-Ordner; `why.astro` ehrlich angepasst
