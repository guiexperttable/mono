# Folge 06 – „Summenzeile in einer Zeile Code“

**Problem:** Unter jeder Bestell-Tabelle will jemand die Summe sehen – und zwar die Summe dessen, was gerade gefiltert
ist. Selbst gebaut heißt das: ein eigenes Footer-Modell, gefilterte Zeilen lesen, cachen, nach jedem Edit neu rechnen.
Und wer drei Zellen markiert, will unten die Summe sehen wie in Excel.
**Kernbotschaft:** Eine Zeile Konfiguration: `footerAggregates: { menge: "sum", summe: "sum" }`. Die Summenzeile folgt
Filter, Sortierung und Live-Updates – bei einer Million Zeilen, ohne beim Scrollen neu zu rechnen. Bei ag-Grid ist
Aggregation ein Enterprise-Feature – hier MIT-lizenziert, kostenlos auch kommerziell.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Summenzeile in einer Zeile Code“ · „… ohne Enterprise-Lizenz“ (geprüft auf ag-grid.com,
15.10.2026: die Seiten „Aggregation“ und „Total Rows“ tragen das Enterprise-Badge, Modul `RowGroupingModule` aus
`ag-grid-enterprise`)

## Voraussetzung

`@guiexpert/table` **1.1.94** (Branch `feat/aggregation`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html` ohne Summenzeile (Zeile 45 auskommentieren) | „Eine Million Bestellungen. Der Chef fragt: ‚Wie viel ist das zusammen – und nur Kunde 42?‘“ |
| 8–22 s | `snippet.ts`, Zeilen 5–9 hervorheben, dann Zeile 8 | „Eine ganz normale Tabelle aus einem Array. Und jetzt die eine Zeile: `footerAggregates` – Menge und Summe summieren.“ |
| 22–36 s | Zeilen 10–15 | „Und für die Auswahl: Bei jeder Änderung fragt die App die Summe der markierten Zellen ab – das ist die Statusleiste.“ |
| 36–55 s | `demo.html`: Summenzeile unten („1,000,000 rows“); Filter „42“ → „1,003 rows“, neue Summen; Zellen von Menge bis Summe ziehen → „Σ …“ unten; Haken **live** → Werte springen, die Summe läuft mit; scrollen (rechnet nicht neu); Haken **dunkel** | „Gefiltert? Die Summe gilt für das, was man sieht. Markiert? Die Summe der Auswahl. Live-Daten? Läuft mit. Und beim Scrollen durch eine Million Zeilen wird nichts neu gerechnet.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/training/footer-totals · „MIT“ | „Bei anderen ist das Enterprise. Hier: eine Zeile, MIT. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 15 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 1.000.000 erzeugten Bestellungen, dazu Filter, Sortier-Knopf,
Live-Schalter (`updateCells` auf sichtbaren Zeilen) und Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/06-summenzeile/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: Filter „42“ → Zellen Menge…Summe der Zeilen 2–5 ziehen → Filter leeren → live →
   scrollen → dunkel.
4. Alternativ mit Hot Reload, zwei Gesamtzeilen (Summe und Durchschnitt) und Min/Max in der Statusleiste:
   `pnpm serve:table-demo` → `http://localhost:4200/aggregation.html` (englisch).

## Fakten-Check (für Beschreibungstext)

- API: `TableFactory.createTableModel({ …, footerAggregates: { total: "sum" } | [{ label, aggregates }] | { rows, labelProperty, … } })`,
  Klasse `AreaModelAggregateFooter`; Aggregatoren `"sum" | "count" | "avg" | "min" | "max" | "countDistinct" | "first" | "last"`
  oder eigene (`AggregatorIf`); Helfer `aggregate()` / `aggregateColumns()` ohne Tabelle.
- Auswahl: `tableApi.getSelectionAggregates()` → `{ count, numericCount, sum, avg, min, max, capped }`.
- Rechnet nach Filter, Sortierung, Editieren, `updateCells()` und `tableApi.repaint()` neu – nicht beim Scrollen.
- Die Beschriftung („1,003 rows“) und die Zahlen sind per Default englisch formatiert; eigene Texte über `label` und
  `format`.
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Training: https://gui.expert/training/footer-totals/#built-in (nach dem Website-Deploy).
