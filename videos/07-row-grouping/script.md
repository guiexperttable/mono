# Folge 07 – „Row Grouping in 60 Sekunden – ohne Enterprise-Lizenz“

**Problem:** 50.000 Bestellungen als flache Liste. Die Frage lautet „Wie viel pro Land – und pro Stadt?“. Selbst gebaut
heißt das: Daten in einen Baum umbauen, Summen je Ebene rechnen, nach jedem Filter neu. Bei ag-Grid ist Row Grouping
ein Enterprise-Feature (`RowGroupingModule` aus `ag-grid-enterprise`).
**Kernbotschaft:** Ein Fabrik-Aufruf: `groupBy: ["land", "stadt"]` + `aggregations` – Gruppenzeilen mit Summen,
Gesamtzeile, umgruppieren zur Laufzeit. MIT-lizenziert, null Abhängigkeiten, Millionen Zeilen flüssig.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Row Grouping in 60 Sekunden – ohne Enterprise-Lizenz“ · „Summen pro Land und Stadt – eine
Fabrik, kein Enterprise“ (geprüft auf ag-grid.com, 15.10.2026: Seite „Row Grouping“ mit Enterprise-Kennzeichnung,
Modul `RowGroupingModule` aus `ag-grid-enterprise`)

## Voraussetzung

`@guiexpert/table` **1.1.94** (Branch `feat/row-grouping`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html` mit „– nichts –“ im Auswahlfeld: 50.000 flache Zeilen scrollen | „50.000 Bestellungen. Die Chefin fragt: ‚Wie viel pro Land – und pro Stadt?‘“ |
| 8–25 s | `snippet.ts`, Zeilen 6–11 hervorheben, dann Zeilen 8 und 9 | „Statt `TableFactory` die `RowGroupFactory`. Gruppieren nach Land und Stadt, Menge und Summe summieren – fertig.“ |
| 25–40 s | Zeile 15 | „Und umgruppieren? Ein Aufruf – kein neues Modell, die Tabelle behält ihren Zustand.“ |
| 40–55 s | `demo.html`: „Land › Stadt“ wählen → acht Länder mit Summen; Deutschland aufklappen → Städte; „Produkt › Land“ wählen; Filter „Laptop“ → Summen und Gesamtzeile laufen mit; Doppelklick auf „summe“ → Gruppen nach Summe sortiert; Haken **dunkel** | „Aufklappen, umgruppieren, filtern – die Summen gelten immer für das, was man sieht. Doppelklick auf eine Spalte sortiert die Gruppen nach ihrer Summe.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/training/row-grouping · „MIT“ | „Bei anderen Enterprise. Hier: MIT. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 15 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 50.000 erzeugten Bestellungen, dazu Auswahlfeld, „Alle auf/zu“,
Filter und Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/07-row-grouping/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: „– nichts –“ → „Land › Stadt“ → Deutschland aufklappen → „Produkt › Land“ →
   Filter „Laptop“ → Doppelklick „summe“ → dunkel.
4. Alternativ englisch mit Mittelwert und „Jahr“-Ebene (Funktion): `pnpm serve:table-demo` →
   `http://localhost:4200/row-grouping.html`.

## Fakten-Check (für Beschreibungstext)

- API: `RowGroupFactory.createTableModel({ rows, columnDefs?, groupBy, aggregations, footerAggregates?, groupColumn?,
  hideGroupedColumns?, expanded?, emptyLabel? })`; Body `AreaModelRowGroups`; umgruppieren `tableApi.setRowGroupBy([...])`.
- Ebenen: Property-Pfade, Funktionen (`o => o.datum.getFullYear()`) oder `{ value, name, label, format, order }`.
- Aggregatoren aus 1.1.94: `"sum" | "count" | "avg" | "min" | "max" | "countDistinct" | "first" | "last"` oder eigene;
  der Mittelwert einer Gruppe ist der Mittelwert ihrer Zeilen (nicht der Untergruppen).
- Filter (`externalFilterFunction`) bekommt die Bestellungen; Gruppen, Anzahl und Summen folgen.
- Nicht enthalten: Gruppenleiste per Drag & Drop, Pivot-Tabellen.
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Training: https://gui.expert/training/row-grouping/ (nach dem Website-Deploy).
