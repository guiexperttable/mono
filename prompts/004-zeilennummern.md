# TODO-Prompt 004: Zeilennummern

> Status: **umgesetzt** 15.10.2026 (selbständig, Design ohne Freigabe-Runde) · angelegt 14.10.2026 · Slug `row-numbers` (Branch `feat/row-numbers`, Design `prompts/004-zeilennummern.design.md`)
> Abhängigkeiten: **001 (ARIA)** – Zeilennummern sind `rowheader`-Zellen. 003 (Zustand) hilft, ist aber nicht nötig.
> Danach nutzt 009 (Row Drag) die Spalte evtl. als Griff.
> ag-Grid: „Row Numbers“ ist dort **Enterprise** (`RowNumbersModule`).
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Eine eingebaute Spalte mit laufenden Zeilennummern (1, 2, 3 …) wie in einer Tabellenkalkulation: links fixiert, Breite
passend zur größten Nummer, Klick wählt die Zeile aus. Mit einer Zeile Konfiguration einschaltbar.

## Was es heute gibt (Code-Befund Okt. 2026)

- Vorbild ist die **Checkbox-Spalte**: `CheckboxColumnDef` (`data/common/checkbox-column-def.ts`, `type =
  'CheckboxColumnDef'`, Erkennung über `isCheckboxColumnDef` in `instanceof-workaround.ts`), eingeschaltet über
  `rowCheckboxVisible` im `TableModel`-Konstruktor bzw. in `TableFactory.createTableModel`. Die Header-Checkbox nutzt
  `AllRowsCheckboxModel`. `MouseHandler` rechnet die Spalte als Versatz ein (`isRowCheckboxVisible() ? 1 : 0`).
- Alternative ohne Extraspalte: `showCheckboxWihoutExtraColumn` (sic) – zeigt die Checkbox in Spalte 0.
- Heute behilft man sich mit einer eigenen Spalte und einem Renderer, der `rowIndex + 1` schreibt.
- Selektion: `SelectionModel` mit Typ `row`; Klick/Shift-Klick/Strg-Klick (CLAUDE.md §3.6).
- Copy (`CopyService`) und Excel (`downloadExcel`) exportieren die aktuelle Sicht inklusive aller sichtbaren Spalten.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| N1 | 1.000 Zeilen, Zeilennummern an | Spalte ganz links, fixiert, zeigt 1 … 1.000; Breite passt für „1000“ |
| N2 | 2 Mio. Zeilen | Breite passt für „2,000,000“ bzw. „2000000“ (Format festlegen), Scrollen bleibt flüssig |
| N3 | Nach „Total“ absteigend sortiert | Nummern zeigen die **Anzeige**-Reihenfolge 1, 2, 3 … (oder Original-Index, je nach Option) |
| N4 | Filter: 42 von 1.000 Zeilen sichtbar | 1 … 42 (Anzeige) bzw. Originalnummern (Option) |
| N5 | Checkbox-Spalte und Zeilennummern zusammen | feste, dokumentierte Reihenfolge (z. B. Nummer, dann Checkbox); Maus-Versatz stimmt |
| N6 | Klick auf eine Nummer | wählt die Zeile aus (bei Selektionstyp `row`/`range`); Shift-Klick erweitert |
| N7 | Baum | Nummern der sichtbaren Zeilen oder hierarchisch (1, 1.1, 1.2)? Option festlegen |
| N8 | Copy und Excel | Nummernspalte standardmäßig **nicht** exportiert (Option) |
| N9 | Spalte nicht verschiebbar, nicht sortierbar, Breite nicht kleiner als nötig | wie beschrieben |
| N10 | Screenreader (mit 001) | Nummernzelle `role="rowheader"`, Zeile wird mit ihrer Nummer angesagt |
| N11 | Footer/Header | Header-Zelle leer oder „#“ (Option), Footer leer |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Einschalten:** wie die Checkbox (`rowNumbersVisible` in `TableModel`/`TableFactory`) oder als Spaltendefinition
   (`RowNumberColumnDef`, `isRowNumberColumnDef`) oder als Renderer für eine beliebige Spalte
   (`RowNumberCellRenderer`)? Empfehlung: Spaltendefinition + Komfort-Flag in der Fabrik; begründen.
2. **Zählweise:** Anzeige-Index (Standard bei Excel-ähnlicher Bedienung) vs. Original-Index (`getAllRows()`), evtl.
   eigene Funktion `(row, displayIndex) => string`.
3. **Breite:** aus der Zeilenzahl berechnen (Ziffern × Zeichenbreite, Messung wie `autoResizeColumns` mit
   `canvas.measureText`) und bei Zeilenänderung (`setRows`, Filter) anpassen.
4. **Fixierung:** zählt die Spalte in `fixedLeftColumnCount` mit oder kommt sie davor? Wechselwirkung mit vom Anwender
   fixierten Spalten und mit `CheckboxColumnDef`.
5. **Spaltenindex-Versatz:** Wie verhindern, dass Anwender-Code mit Spaltenindizes (`getValueAt`, Events,
   `scrollToIndex`, `setColumnVisible(index)`) durch die neue Spalte verrutscht? Wie macht es die Checkbox-Spalte heute,
   und ist das gut genug?
6. **Formatierung:** Tausendertrennzeichen ja/nein, `font-variant-numeric: tabular-nums`, rechtsbündig.
7. **Baum** (N7) und spätere Gruppenzeilen (006): Gruppenzeilen nummerieren oder auslassen?

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: Nummernberechnung (Anzeige/Original, Filter, Sortierung, Baum), Breitenberechnung.
- Browser: N1–N11; Maus-Versatz mit Checkbox-Spalte (Klick in Spalte 2 trifft Spalte 2); Copy und Excel ohne
  Nummernspalte (ZIP-Leser `test-utils/zip.ts`); Scrollen ans Ende bei 2 Mio. Zeilen rendert die richtige Nummer.
- Regression: alle vorhandenen Checkbox-Specs bleiben grün.

## Phase 3 – Hinweise

- Bestehende Mechanik der Checkbox-Spalte wiederverwenden oder verallgemeinern (z. B. „eingebaute Spalten“ als
  gemeinsames Konzept), ohne ihr Verhalten zu ändern.
- CSS: `ge-table-row-number`, Variablen `--ge-table-row-number-bg`/`-color` (light und dark).

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` §5.2 (Spaltendefinitionen) ergänzen.
- **Website:** Feature-Liste; kein eigener Showcase, z. B. im Showcase „Large dataset“ einschalten.
- **Training:** Abschnitt im Kapitel `column-definitions` oder `fixed-columns`, kein neues Kapitel.
- **Video:** kurze Folge („Zeilennummern wie in Excel – eine Zeile Code“) oder Teil einer Sammelfolge mit 002.

## Abschluss-Review (Schwerpunkte)

Index-Versatz in allen öffentlichen APIs, Zusammenspiel mit Checkbox- und fixierten Spalten, Export.

## Definition of Done (zusätzlich zu 000)

- [x] Design-Dokument mit Einschalt-Mechanik, Zählweise, Index-Versatz (selbständig entschieden, s. Design § 2)
- [x] N1–N11 umgesetzt und getestet; Checkbox-Specs unverändert grün
