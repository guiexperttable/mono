# Folge 08 – „Pivot-Tabelle in 60 Sekunden – ohne Enterprise-Lizenz“

**Problem:** 50.000 Bestellungen als flache Liste. Gefragt ist „Umsatz pro Land und Stadt – je Jahr nebeneinander“.
Selbst gebaut heißt das: Daten zweimal gruppieren, Spalten aus den Werten erzeugen, Zwischen- und Gesamtsummen rechnen,
bei jedem Filter neu. Bei ag-Grid ist Pivot ein Enterprise-Feature (`PivotModule`, nur zusammen mit Row Grouping).
**Kernbotschaft:** Ein Fabrik-Aufruf: `rowFields` + `columnFields` + `values` – Hierarchie mit Zwischensummen, Spalten aus
den Daten, Gesamtspalte und Gesamtzeile, neu pivotieren zur Laufzeit. MIT-lizenziert, null Abhängigkeiten, ein Core für
alle Frameworks.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Pivot-Tabelle in 60 Sekunden – ohne Enterprise-Lizenz“ · „Umsatz pro Land und Jahr – eine Fabrik,
kein Enterprise“ (geprüft auf ag-grid.com, 15.10.2026: Seite „Pivoting“ mit Enterprise-Kennzeichnung, Modul `PivotModule`)

## Voraussetzung

`@guiexpert/table` **1.1.94** (Branch `feat/pivot`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | Excel-Pivot-Assoziation: flache Liste (z. B. Folge 07, „– nichts –“) scrollen | „50.000 Bestellungen. Gefragt: Umsatz pro Land und Stadt – und jedes Jahr als eigene Spalte.“ |
| 8–25 s | `snippet.ts`, Zeilen 5–11, dann Zeilen 7–9 hervorheben | „`PivotFactory`: Zeilen nach Land und Stadt, Spalten aus dem Jahr des Bestelldatums, die Summe in jede Zelle.“ |
| 25–40 s | Zeile 15 | „Andere Spalten? Ein Aufruf – gleiches Modell, gleiche Tabelle, neue Spalten.“ |
| 40–55 s | `demo.html`: Deutschland aufklappen → Städte mit Zwischensumme; „Jahr › Quartal“ wählen → zweizeiliger Header, Jahressummen, ein Jahr per Pfeil zuklappen; „Mittelwert“ wählen; Filter „Laptop“ → alle Zellen und Summen laufen mit; Haken **dunkel** | „Zwischensummen, Jahressummen, Gesamtsumme – und beim Mittelwert stimmt auch die Gesamtzeile: gerechnet aus den Bestellungen, nicht aus den Zellen.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/training/pivot-tables · „MIT“ | „Bei anderen Enterprise. Hier: MIT. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 15 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 50.000 erzeugten Bestellungen (2024–2026), dazu Spalten- und
Wert-Auswahl, „Alle auf/zu“, Filter und Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/08-pivot-ohne-enterprise/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: Deutschland aufklappen → „Jahr › Quartal“ → Pfeil an „2024“ (zuklappen) →
   „Mittelwert“ → Filter „Laptop“ → dunkel.
4. Alternativ englisch mit Umsatz + Anzahl und Drill-down per Klick: `pnpm serve:table-demo` →
   `http://localhost:4200/pivot.html`.

## Fakten-Check (für Beschreibungstext)

- API: `PivotFactory.createTableModel({ rows, rowFields, columnFields?, values, subtotals?, columnSubtotals?,
  totalColumn?, totalRow?, maxColumns?, expanded?, emptyLabel?, emptyText?, totalLabel?, groupColumn? })`; Modell
  `PivotTableModel`, Body `AreaModelPivot`; neu pivotieren `tableApi.setPivotConfig({ … })`; Engine ohne Tabelle `pivotRows()`.
- Felder wie beim Row Grouping: Property-Pfade, Funktionen (`b => b.datum.slice(0, 4)`) oder `{ value, name, label, format, order }`.
- Werte: `"summe"` (Summe) oder `{ value, aggregator: "avg" | "count" | "min" | "max" | … , label, format }`; mehrere
  Werte = Unterspalten je Schlüssel.
- Zwischen- und Gesamtsummen aus Aggregations-Zuständen: der Mittelwert der Gesamtzeile ist der Mittelwert der
  Bestellungen, nicht der Mittelwert der Zellen. Fehlende Kombination = leer (nicht 0).
- Filter (`externalFilterFunction`) bekommt die Bestellungen und wirkt vor der Aggregation.
- Nicht enthalten: Feldliste per Drag & Drop, Zwischensummen-Zeilen unterhalb der Gruppen, Filter auf fertige Pivot-Zeilen.
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Training: https://gui.expert/training/pivot-tables/ (nach dem Website-Deploy).
