# TODO-Prompt 005: Aggregation und Gesamtzeile (Helfer, Footer-Modell, Auswahl-Summen)

> Status: **umgesetzt** (15.10.2026, Branch `feat/aggregation`, selbständig – Entscheidungen im Design-Dokument) · angelegt 14.10.2026 · Slug `aggregation` (Branch `feat/aggregation`, Design `prompts/005-aggregation-gesamtzeile.design.md`)
> Abhängigkeiten: 001 (ARIA) für die Footer-Zellen (`rowheader`/Beschriftung), sonst keine.
> **Grundlage für 006 (Row Grouping), 007 (Pivot) und 008 (Show values as):** Dieser Prompt baut die gemeinsamen
> Aggregatoren. Die späteren Prompts bauen sie nicht neu, sondern nutzen sie.
> ag-Grid: Aggregation und „Grand Total Row“ sind dort **Enterprise**.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Summen, Anzahl, Mittelwert & Co. ohne eigenes `AreaModel` schreiben zu müssen, in drei Schichten:

1. **Aggregatoren und Helfer-Funktionen** (DOM-frei): z. B. `aggregate(rows, 'total', 'sum')` und
   `aggregateColumns(rows, { total: 'sum', quantity: 'sum', customer: 'count' })`, dazu ein Reducer-Interface für
   eigene Aggregationen. Das ist der gemeinsame Kern für 006–008.
2. **Fertiges Footer-Modell** für eine Gesamtzeile, die Filter und Sortierung folgt (heute muss man es von Hand bauen).
3. **Komfort:** Konfiguration in einer Zeile (Fabrik-Option oder Feld an `ColumnDef`) und optional Aggregate der
   **Auswahl** (Anzahl, Summe, Mittelwert der markierten Zellen) für eine Statusleiste, die die Anwendung in plain HTML
   baut.

## Was es heute gibt (Code-Befund Okt. 2026)

- `instructions.md` §5.4 „Footer with totals of the displayed rows“: eigenes `AreaModel` (`areaIdent = "footer"`), das
  `getBody().getFilteredRows()` liest und in `getValueAt` per `reduce` summiert. Wird bei `externalFilterChanged()`,
  `sort()` und `repaint()` neu gezeichnet.
- Training-Demo `apps/webpage-guiexpert/src/training/demos/shared/order-totals-footer.ts` (Kap. 16 `footer-totals`):
  Spalten nach **Property** statt Position, Footer-Renderer der Spalte (`rendererMap.footer`), **Cache je
  Filterergebnis** (gleiches Array + gleiche Länge → nicht neu rechnen), `invalidate()` nach Editieren/Live-Daten.
- `TODO.md` (Abschnitt Core): „Footer-Summen über gefilterte Zeilen … Optional später eine fertige Klasse (z. B.
  `AreaModelAggregateFooter`).“ Dieser Prompt erledigt das.
- `getFilteredRows()` / `getAllRows()` gibt es in `AreaModelObjectArray`; `AreaModelTree` hat `getFilteredFlattenRows()`.
- `api.downloadExcel()` exportiert den Footer mit (aktuelle Sicht).

## Referenzdaten (gemeinsam mit 006/007; Fixture `packages/table/test-utils/grouping-fixtures.ts` hier anlegen)

```ts
const rows = [
  { region: 'Nord', produkt: 'A', monat: 'Jan', umsatz: 100 },
  { region: 'Nord', produkt: 'B', monat: 'Jan', umsatz: 50 },
  { region: 'Süd',  produkt: 'A', monat: 'Jan', umsatz: 80 },
  { region: 'Nord', produkt: 'A', monat: 'Feb', umsatz: 120 },
  { region: 'Süd',  produkt: 'B', monat: 'Feb', umsatz: 70 },
  { region: 'Süd',  produkt: 'A', monat: 'Feb', umsatz: 30 },
];
```

| # | Aufruf | Erwartung |
|---|---|---|
| G1 | `sum(umsatz)`, `count`, `avg(umsatz)`, `min`, `max` | 450, 6, 75, 30, 120 |
| G2 | `countDistinct(region)` | 2 |
| G3 | Filter `monat === 'Jan'` → Footer | Summe 230, Anzahl 3, Mittelwert 76,67, Min 50, Max 100 |
| G4 | `merge` zweier Teilergebnisse (Nord: 270/3, Süd: 180/3) | Mittelwert 75 (= 450/6), **nicht** Mittel der Mittel; wichtig für 006 |
| G5 | leere Menge | `sum` 0, `count` 0, `avg`/`min`/`max` `undefined` (Anzeige leer) |
| G6 | Werte `null`, `undefined`, `''`, `'abc'`, `NaN` in `umsatz` | Verhalten wie in Phase 1 festgelegt (z. B. ignorieren, aber zählen?) |
| G7 | Footer-Zeile mit Label | erste Spalte „6 rows“ bzw. eigenes Label, Zahlen über den Footer-Renderer der Spalte |
| G8 | zwei Footer-Zeilen (Summe und Mittelwert) | beide korrekt, je Zeile eigenes Label |
| G9 | Zelle editiert bzw. `api.updateCells()` | Footer zeigt nach dem Repaint den neuen Wert (ohne manuelles `invalidate()`, falls so entschieden) |
| G10 | 1 Mio. Zeilen, Scrollen | Footer rechnet **nicht** bei jedem Frame neu (Cache) |
| G11 | 3 × 2 Zellen markiert (Bereichsauswahl) | `api.getSelectionAggregates()` → Anzahl 6, Summe/Mittelwert/Min/Max der numerischen Zellen |
| G12 | Footer-Label aus Daten mit `<img src=x onerror=…>` | Text, kein Element |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Aggregator-Interface** (gemeinsam mit 006/007): `AggregatorIf<S, R> { init(): S; add(state, value): S;
   merge(a, b): S; result(state): R }`, eingebaute `sum`, `count`, `avg`, `min`, `max`, `countDistinct`, `first`,
   `last`; Namen als String-Union plus eigene Aggregatoren. Ablage `src/lib/table/aggregation/`.
2. **Werte holen:** Property-Pfad (`'address.city'`) oder Accessor `(row) => unknown`; Generik `aggregate<T>(…)`.
   Sobald 008 berechnete Spalten bringt, sollen die auch aggregierbar sein: Schnittstelle offen halten.
3. **Ungültige Werte** (G6): ignorieren, als 0 zählen, oder Fehler? `count` zählt Zeilen oder gültige Werte?
4. **Footer-Modell:** Name (z. B. `AreaModelAggregateFooter`), Konfiguration
   `{ aggregates: { total: 'sum' } | [{ label, aggregates }], label?: (rows) => string }`, Datenquelle
   (`getFilteredRows()` des Body-Modells; bei Baum: Blätter oder sichtbare Zeilen?), Cache wie in der Training-Demo.
5. **Invalidierung:** automatisch bei `onModelChanged`, `updateCells`, `setRows/addRows/removeRows`, Filter, Sortierung
   (TableScope kennt diese Stellen) oder nur manuell `invalidate()`?
6. **Komfort-Konfiguration:** Fabrik-Option `TableFactory.createTableModel({ …, footerAggregates: { total: 'sum' } })`
   und/oder `ColumnDef`-Feld `footerAggregate` (additiv). Empfehlung begründen.
7. **Auswahl-Aggregate** (G11): `api.getSelectionAggregates(): { count, numericCount, sum, avg, min, max }` und ein
   Hinweis, wie man daraus mit `onSelectionChanged` eine Statusleiste in plain HTML baut. Kappung bei riesigen
   Auswahlen (vgl. `CopyService.maxCopyCells`).
8. **Excel:** Footer weiter als Werte exportieren oder als Excel-Formeln (`SUM(…)`)? Kann der eigene XLSX-Writer Formeln?
   Wenn nicht: Werte (heute) und Formeln als offene Frage.

## Phase 2 – Tests (zusätzlich zu 000)

- Unit (`aggregation/*.spec.ts`): G1–G6 für jeden Aggregator; `merge` = ein Durchlauf (Eigenschaftstest über zufällige
  Aufteilungen, fester Seed); eigener Aggregator; Accessor vs. Pfad.
- Unit (Footer-Modell): G7, G8, Cache (Anzahl der Berechnungen per Spy, G10), Invalidierung (G9).
- Browser: Footer folgt Filter und Sortierung (G3), Editieren und `updateCells` (G9), Excel-Export enthält die
  Gesamtzeile, Auswahl-Aggregate (G11), HTML-Injection (G12).
- Die Training-Demo `order-totals-footer.ts` lässt sich auf das neue Modell umstellen: als Akzeptanztest nutzen.

## Phase 3 – Hinweise

- `aggregation/` ist DOM-frei und hat keine Abhängigkeit auf Area-Modelle (damit 006/007 sie frei nutzen können).
- Footer-Modell erbt von `AreaModel` (wie das Muster in §5.4) und nutzt die Footer-Renderer der Spalten.
- CSS: `ge-table-footer-aggregate`, ggf. `ge-table-footer-label`.

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` §5.4 umschreiben: zuerst die eingebaute Lösung, danach „eigenes Footer-Modell“ als
  Erweiterung. `TODO.md`-Eintrag „Footer-Summen … `AreaModelAggregateFooter`“ abhaken.
- **Training:** Kapitel `footer-totals` (Kap. 16) um die eingebaute Lösung ergänzen (`<Callout type="version">`), kein
  neues Kapitel. Demo `shared/order-totals-footer.ts` ggf. vereinfachen, ohne die Folge 016 ungültig zu machen (der
  Tag `ep-016` zeigt weiterhin den alten Code: im Text erwähnen).
- **Website:** Feature-Liste; in `why.astro` prüfen, ob „Aggregation / grand total row“ eine eigene Zeile verdient.
- **Video:** „Summenzeile in einer Zeile Code“ (60 s), optional mit Statusleiste für die Auswahl.

## Abschluss-Review (Schwerpunkte)

Rechenkorrektheit (vor allem `merge`/`avg`), Cache und Invalidierung, Eignung der Aggregatoren für 006/007.

## Definition of Done (zusätzlich zu 000)

- [x] Design-Dokument mit Aggregator-Interface, Footer-Modell, Invalidierung, Komfort-API 🛑
- [x] G1–G12 umgesetzt und getestet; Fixture `test-utils/grouping-fixtures.ts` angelegt
- [x] `instructions.md` §5.4 und Kapitel `footer-totals` aktualisiert; `TODO.md`-Eintrag abgehakt
- [x] Hinweis in `prompts/006-row-grouping.md` und `prompts/007-pivot.md` geprüft: dort „Aggregatoren aus 005“
