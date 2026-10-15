# Folge 05 – „Zeilennummern wie in Excel – eine Zeile Code“

**Problem:** Bei 2 Millionen Zeilen will man wissen, wo man ist: „Zeile 1.204 hat einen Fehler.“ Eine eigene Spalte mit
Renderer bauen, die Breite raten, sie fixieren, aus dem Excel-Export heraushalten – das ist eine Stunde Arbeit.
**Kernbotschaft:** Eine Zeile Konfiguration: `rowNumbersVisible: true`. Links fixiert, Breite passt sich an, Klick wählt
die Zeile. Bei ag-Grid ist das ein Enterprise-Feature (`RowNumbersModule`) – hier MIT-lizenziert, kostenlos auch
kommerziell. Millionen Zeilen flüssig.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Zeilennummern wie in Excel – eine Zeile Code“ · „… ohne Enterprise-Lizenz“ (geprüft auf
ag-grid.com, 15.10.2026: „Row Numbers“ trägt das Enterprise-Badge, Modul `RowNumbersModule`)

## Voraussetzung

`@guiexpert/table` **1.1.93** (Branch `feat/row-numbers`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html` ohne Nummern (Zeile 5 auskommentieren) – tief in der Mitte gescrollt | „Zwei Millionen Bestellungen. Der Kunde ruft an: ‚Zeile 1.204 stimmt nicht.‘ Welche ist das?“ |
| 8–20 s | `snippet.ts`, Zeilen 5–9 hervorheben, dann Zeile 8 | „Eine ganz normale Tabelle aus einem Array. Und jetzt die eine Zeile: `rowNumbersVisible: true`.“ |
| 20–38 s | Zeilen 10–11 | „Mit Bereichs-Selektion wählt ein Klick auf die Nummer die ganze Zeile – wie in Excel.“ |
| 38–55 s | `demo.html`: Nummern-Spalte links; **Ans Ende** → „2000000“, Spalte breit genug; Klick auf eine Nummer, Shift-Klick auf eine zweite → Zeilenblock; **Nach Summe sortieren** → wieder 1, 2, 3 …; Filter „42“ → Spalte wird schmaler; Haken **dunkel** | „Die Spalte bleibt links stehen und wird so breit wie die größte Nummer – auch bei zwei Millionen. Sortiert? Wieder eins, zwei, drei. Gefiltert? Schmaler.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/training/fixed-columns · „MIT“ | „Bei anderen ist das Enterprise. Hier: eine Zeile, MIT. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 14 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 2.000.000 erzeugten Bestellungen, dazu Sortier-, Ende- und
Filter-Knopf und den Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/05-zeilennummern/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: Ans Ende → nach oben scrollen → Klick Nummer 3, Shift-Klick Nummer 7 → Sortieren →
   Filter „42“ → Filter leeren → dunkel.
4. Alternativ mit Hot Reload und mehr Schaltern (Zählweise „original“, Tausendertrennzeichen, Checkbox-Spalte):
   `pnpm serve:table-demo` → `http://localhost:4200/row-numbers.html` (englisch).

## Fakten-Check (für Beschreibungstext)

- API: `TableFactory.createTableModel({ …, rowNumbersVisible: true | { mode, format, headerLabel, exported, minWidthInPx } })`,
  Baustein `RowNumberColumnDef`, `tableApi.getColumnIndex(property)` (die Nummern sind eine echte Spalte: alle anderen
  Indizes + 1).
- `mode: "display"` (Default) = 1, 2, 3 … der Sicht; `"original"` = Nummer bleibt an der Zeile.
- Nicht im Copy/Excel-Export, außer `exported: true`. Screenreader: Nummern sind Zeilenköpfe (`role="rowheader"`).
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Training: https://gui.expert/training/fixed-columns/#row-numbers (nach dem Website-Deploy).
