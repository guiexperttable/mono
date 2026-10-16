# TODO-Prompt 010: Fill-Handle und Batch-Edit

> Status: **umgesetzt** (16.10.2026, selbständig, Branch `feat/fill-batch`) · angelegt 14.10.2026 · Slug `fill-batch` (Branch `feat/fill-batch`, Design `prompts/010-fill-handle-batch-edit.design.md`)
> Abhängigkeiten: **001 (ARIA)** für Tastatur-Alternative und Ansagen; **008 Teil A** (berechnete Spalten werden
> nicht befüllt); 005 (Footer aktualisiert sich nach dem Füllen). Keine harte Abhängigkeit.
> ag-Grid: Fill Handle (Teil der Bereichsauswahl) und Batch Editing (v34) sind dort **Enterprise**.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Zwei Features für Tabellen, in denen viel bearbeitet wird, beide wie aus der Tabellenkalkulation bekannt:

- **Fill-Handle:** Ein kleines Quadrat an der rechten unteren Ecke der markierten Zellen. Ziehen nach unten oder
  rechts füllt die Nachbarzellen: Werte kopieren oder Reihen fortsetzen (1, 2, 3 …; Datum +1 Tag; „Item 1“ →
  „Item 2“).
- **Batch-Edit:** Änderungen werden zunächst **vorgemerkt** (sichtbar markiert) und erst mit „Übernehmen“ in die Daten
  geschrieben oder mit „Verwerfen“ zurückgenommen. Typisch vor dem Speichern an einen Server.

Beide erzeugen **Änderungssätze** (Liste von Zelländerungen). Damit wird später Undo/Redo möglich, ohne es hier
schon zu bauen.

## Was es heute gibt (Code-Befund Okt. 2026)

- Bereichsauswahl: `SelectionModel` (Typ `range`) mit `CellRange(r1, c1, r2, c2)`, `getRanges()`, `addSelection`,
  `createSnapshot`/`restoreSnapshot`; Maus-Ziehen erzeugt Bereiche (`SelectionService`). Die Auswahl wird als Divs
  `ge-table-<area>-<side>-selected-range` gezeichnet (`RenderScope`, ~Z. 1650/1712). Das Fill-Handle gehört an deren
  Ecke.
- Editieren: `ColumnDef.editable` (`BooleanFunction`), `getEditRenderer`, `editInputPipe`; Speichern über
  `TableScope.updateModelValueAfterEdit` → `areaModel.setValue(row, col, value)` → `repaint()` →
  `onModelChanged(GeModelChangeEvent.createSingle(row, col))`. Es gibt nur ein Einzel-Event.
- Kopieren: `CopyService` (Tab-getrennt, `maxCopyCells`). **Einfügen gibt es nicht**, Undo/Redo auch nicht.
- Maus nur über Mouse Events (keine Pointer/Touch), s. 009.
- CRUD: `crud/` (`CrudTableModelFactory`, `crud-object-edit.ts`) lädt und speichert einzelne Objekte über URLs.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| H1 | Zelle mit `5` markiert, Handle 3 Zeilen nach unten | 5, 5, 5 (kopieren) |
| H2 | Zellen `1`, `2` markiert, Handle 3 Zeilen nach unten | 3, 4, 5 (Reihe); mit Modifikator (z. B. Strg/⌥) stattdessen kopieren |
| H3 | Datum `2026-10-14`, nach unten | 15., 16., … (Format bleibt) |
| H4 | Text `Item 9`, nach unten | `Item 10`, `Item 11` |
| H5 | Ziel enthält nicht editierbare Zellen (`editable` false, berechnete Spalte) | werden übersprungen |
| H6 | Werte laufen durch `editInputPipe` | wie beim normalen Editieren (z. B. Zahl aus Text) |
| H7 | Gefilterte/sortierte Tabelle | Füllen betrifft die **angezeigten** Zeilen in Anzeigereihenfolge |
| H8 | Ziehen über den Rand bei 10.000 Zeilen | Auto-Scroll; Escape bricht ab |
| H9 | Nach dem Füllen | **ein** Event mit allen geänderten Zellen; Footer (005) aktualisiert |
| B1 | Batch-Modus an, drei Zellen editiert | Daten unverändert, Zellen zeigen die neuen Werte mit Markierung `ge-table-cell-pending` |
| B2 | `api.getPendingChanges()` | Liste `{ row, property, oldValue, newValue }` (Zeile als Objekt bzw. ID, nicht nur Index) |
| B3 | `api.commitBatchEdit()` | Werte in die Daten, Markierung weg, ein Event mit allen Änderungen |
| B4 | `api.cancelBatchEdit()` | alles verworfen, Anzeige wie vorher |
| B5 | Sortieren/Filtern während Änderungen offen sind | Änderungen hängen an der Zeile, nicht am Index; bleiben richtig zugeordnet |
| B6 | Fill-Handle im Batch-Modus | erzeugt vorgemerkte Änderungen |
| B7 | Validierung | ungültige Werte werden markiert (`ge-table-cell-invalid`) und blockieren `commit` (Option) |
| B8 | Dieselbe Zelle zweimal geändert, dann zurück auf den Ursprungswert | gilt nicht mehr als Änderung |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

**Fill-Handle**
1. Einschalten: `tableOptions.fillHandle?: boolean | { direction: 'vertical' | 'horizontal' | 'both' }`; nur bei
   Selektionstyp `range`.
2. Reihen-Erkennung: Zahlen (lineare Schrittweite aus ≥ 2 Zellen), Datum (Tag/Monat?), Text mit Endzahl; eigene
   Füllfunktion `fillValue(context) => value` als Erweiterungspunkt.
3. Mehrere Bereiche ausgewählt: nur der letzte Bereich bekommt ein Handle.
4. Tastatur-Alternative: z. B. Strg+D (nach unten füllen) / Strg+R (nach rechts) wie in Excel; Konflikte mit
   Browser-Kürzeln prüfen (Strg+D = Lesezeichen).

**Batch-Edit**
5. API: `api.startBatchEdit()`, `commitBatchEdit()`, `cancelBatchEdit()`, `getPendingChanges()`, `hasPendingChanges()`,
   Option `tableOptions.batchEdit` (dauerhaft an) vs. explizit starten.
6. Speicherung der vorgemerkten Werte: Overlay-Map `Map<rowObject, Map<property, value>>` (Zeilenobjekt als Schlüssel,
   bei Array-of-Arrays das Zeilen-Array), ausgewertet vor `getValueAt`. Für eigene `AreaModel`s ohne Objekte?
7. Validierung: `ColumnDef.validate?: (value, row) => string | undefined` (Fehlermeldung) additiv; Anzeige als Tooltip
   (`getTooltipAt`) und Klasse.

**Gemeinsam**
8. **Änderungssatz** als eigener Typ (`GeCellChangeSet` o. ä.) und Mehrfach-Event: `GeModelChangeEvent` additiv um
   mehrere Zellen erweitern oder neues Event `onCellsChanged`? Rückwärtskompatibel bleiben (`onModelChanged` feuert
   weiter, ggf. einmal je Zelle oder einmal gesamt; entscheiden und dokumentieren).
9. **Undo/Redo:** nicht bauen, aber das Änderungssatz-Format so wählen, dass es reicht (alter + neuer Wert). Einfügen aus
   der Zwischenablage (fehlt ebenfalls) würde denselben Weg nutzen: als „später“ notieren.
10. Wechselwirkung mit CRUD (`crud/`): Batch-Commit → Speichern über die CRUD-URLs? Beispiel oder nur Event?

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: Reihen-Erkennung (H1–H4, negative Schritte, Dezimalzahlen, Monatsende bei Datum), Overlay-Map (B1–B5, B8),
  Validierung (B7), Änderungssatz.
- Browser: Handle sichtbar an der richtigen Ecke (auch bei fixierten Spalten und nach Scrollen), Ziehen H1–H8 mit
  simulierten Maus-Events, Auto-Scroll, Escape; Batch B1–B7 inkl. Markierungs-Klassen; Event-Anzahl (H9, B3).
- Wrapper-Smoke: Mehrfach-Event kommt an.
- HTML-Injection: gefüllter/vorgemerkter Wert `<img src=x onerror=…>` → Text.

## Phase 3 – Hinweise

- Handle-Div an der Bereichsauswahl zeichnen (`RenderScope`), `data-ge-action="fill-handle"`; Start in `TableScope`
  analog zu `drag-column`.
- Alle Schreibzugriffe über **eine** neue Methode (z. B. `TableScope.applyCellChanges(changeSet)`), die `editable`,
  `editInputPipe`, Batch-Modus, Repaint und Event erledigt. `updateModelValueAfterEdit` nutzt sie ebenfalls.
- CSS: `ge-table-fill-handle`, `ge-table-fill-preview`, `ge-table-cell-pending`, `ge-table-cell-invalid` (light/dark).

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` (Editieren), Beispiel „Batch speichern per `fetch`“.
- **Training:** Abschnitt im Kapitel `inline-editing` (Kap. 31) oder eigenes Kapitel in Teil 8; in Phase 1 entscheiden.
- **Website:** Showcase `batchedit` (Preisliste bearbeiten, „Save“/„Discard“-Buttons in plain HTML); Feature-Liste.
- **Video:** „Excel-Feeling: Fill-Handle“ und „Änderungen sammeln, dann speichern“ (zwei kurze Folgen oder eine).

## Abschluss-Review (Schwerpunkte)

Kein Schreiben an nicht editierbare Zellen, Zuordnung der Änderungen nach Sortierung/Filter, Event-Kompatibilität,
Reihen-Erkennung bei Randfällen.

## Definition of Done (zusätzlich zu 000)

- [x] Design-Dokument mit Reihen-Regeln, Batch-API, Änderungssatz-Format, Event-Strategie 🛑
- [x] H1–H9 und B1–B8 umgesetzt und getestet
- [x] Undo/Redo und Einfügen aus der Zwischenablage als Folgeaufgaben in `TODO.md`
