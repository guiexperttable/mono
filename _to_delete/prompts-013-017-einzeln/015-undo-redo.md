# TODO-Prompt 015: Rückgängig und Wiederherstellen (Undo/Redo)

> Status: offen · angelegt 16.10.2026 · Slug `undo` (Branch `feat/undo`, Design `prompts/015-undo-redo.design.md`)
> Reihe **Tabellenkalkulation 013–017**. Abhängigkeiten: 010 (`GeModelChangeEvent.changes` mit `oldValue`/`newValue`,
> Batch-Edit), **013** (`"clear"`), **014** (`"paste"`, `"cut"`), 009 (Zeilen verschieben, falls mit aufgenommen).
> ag-Grid: Undo/Redo beim Editieren ist Community. Kein „ohne Enterprise“ im Video.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Strg/⌘+Z nimmt den letzten Vorgang zurück, Strg+Y bzw. Strg/⌘+Shift+Z stellt ihn wieder her. Ein Vorgang ist das, was
der Anwender als **eine** Aktion erlebt: ein Edit, eine Füllung, ein Einfügen, ein Löschen eines Bereichs. Die API
erlaubt eigene Knöpfe („Rückgängig“ in der Werkzeugleiste der App).

## Was es heute gibt (Code-Befund 16.10.2026)

- Kein Undo. 010 hat dafür vorgesorgt: **eine** Schreibstelle `TableScope.applyCellChanges` /
  `writeCellsInternal`, Ergebnis `CellChangeIf[]` (row, rowIndex, columnIndex, property, oldValue, newValue),
  `source` „edit“, „fill“, „commit“, „api“ (+ „clear“ aus 013, „paste“/„cut“ aus 014).
- Batch-Edit: `PendingCellChanges` ordnet über das Zeilenobjekt zu (TreeRow → `data`, ohne Objekte Index).
- Row Drag (009) verschiebt Zeilen in place (`moveRows`), Sortieren sortiert teils in place.
- Externe Änderungen: `updateCells`, `setRows`, Live-Daten der App – nicht über die Schreibstelle.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| U1 | Edit B3 42 → 7, Strg+Z | 42 zurück, Fokus und Auswahl auf B3 (ins Bild gescrollt), ein Event `source: "undo"`, Ansage |
| U2 | Fill über 30 Zellen, Strg+Z | alle 30 in **einem** Schritt |
| U3 | Einfügen, Ausschneiden, Bereich leeren | je ein Schritt |
| U4 | Strg+Y / Strg+Shift+Z / ⌘+Shift+Z | wiederhergestellt, `source: "redo"` |
| U5 | nach Undo eine neue Änderung | Redo-Stapel leer |
| U6 | zwischen Edit und Undo sortiert/gefiltert | richtige Zeile (über das Zeilenobjekt); ausgefilterte Zeile: wie entschieden |
| U7 | Zeile verschoben (009), Strg+Z | zurück an die alte Position (falls aufgenommen) |
| U8 | Strg+Z im offenen Editor | Text-Undo des Browsers, nicht die Tabelle |
| U9 | Batch-Edit | Undo nimmt Vorgemerktes zurück; Commit/Cancel: wie entschieden |
| U10 | Wert inzwischen extern geändert | wie entschieden (überschreiben oder überspringen + Ansage) |
| U11 | `setRows` bzw. neues Modell | Verlauf leer |
| U12 | 101 Vorgänge bei `maxUndoSteps: 100` | ältester fällt weg |
| U13 | `api.undo()`, `redo()`, `canUndo()`, `canRedo()`, `clearUndoHistory()` | wie Tastatur; Event zum Aktualisieren von Knöpfen |
| U14 | Formel geändert (016) | alter Formeltext zurück, Neuberechnung folgt |
| U15 | Option aus (Default) | Strg+Z tut nichts (wie heute) |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Umfang:** nur Zelländerungen oder auch Zeilen verschieben (009) und später Zeilen/Spalten einfügen/löschen (017)?
   Empfehlung: Befehlsmuster `UndoableIf { label, undo(), redo() }`, v1 mit Zellen + Zeilen verschieben; 017 ergänzt
   strukturelle Vorgänge.
2. **Aufzeichnung:** an der Schreibstelle für alle Quellen außer `"api"` (Option `recordApiChanges`)? Zusammenfassen
   mehrerer API-Aufrufe zu einem Vorgang (`api.batchUndoable(fn)`)?
3. **Zuordnung:** Zeilenobjekt + Property (wie `PendingCellChanges`) statt Index. Was, wenn die Zeile nicht mehr im Modell
   ist (überspringen)? Ausgefilterte Zeile (U6): zurücksetzen und ansagen, Fokus nur, wenn sichtbar.
4. **Konflikt** (U10): stimmt der aktuelle Wert nicht mehr mit `newValue` überein → überschreiben (einfach) oder
   überspringen (sicher)? Empfehlung + Option.
5. **Batch-Edit** (U9): Undo arbeitet auf den vorgemerkten Werten; Commit = ein Vorgang im Verlauf oder leert ihn?
6. **Event:** `onUndoStackChanged?(GeUndoEvent { canUndo, canRedo, undoLabel, redoLabel })` additiv + Wrapper-Event
   `undoStackChanged`, oder nur Polling über `canUndo()`? (Knöpfe der App brauchen ein Event.)
7. **Speicher/Grenzen:** `maxUndoSteps` (Default 100), große Vorgänge (1 Mio. Zellen) – Grenze in Zellen?
8. **Tasten:** Windows Strg+Z/Strg+Y, macOS ⌘+Z/⌘+Shift+Z; nur wenn der Host fokussiert ist; `harmonizeShortcut`.

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: `UndoStack` (DOM-frei: push, undo, redo, Grenze, Redo-Verwerfen, Zusammenfassen), Zuordnung nach Sortierung.
- Browser: U1–U15 mit allen Quellen aus 010/013/014, Fokus/Scroll nach Undo, Batch, Row Drag, RTL egal.
- Wrapper-Smoke: `undoStackChanged` in React + Web Component.

## Phase 3 – Hinweise

- Ordner `src/lib/table/undo/` (`undo-stack.ts`, `undoable.if.ts`, `undo-options.if.ts`, `undo-service.ts` als
  `tableScope.undoService`). Undo schreibt über `applyCellChanges(…, "undo")` (Prüfungen bleiben, aber ohne neue
  Aufzeichnung).
- Neue `ActionId`s `UNDO`, `REDO`; Mappings Windows/macOS.

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` Abschnitt „Undo/Redo“ mit Werkzeugleisten-Beispiel (plain HTML, `onUndoStackChanged`).
- **Training/Website/Video:** Abschnitt in Kapitel 31; Teil der Folge aus 017. `new-features.ts`, Feature-Liste.

## Abschluss-Review (Schwerpunkte)

Richtige Zeile nach Sortierung/Filter, ein Schritt je Vorgang, keine Schreibzugriffe auf Nicht-Editierbares beim
Zurücksetzen, Speicher.

## Definition of Done (zusätzlich zu 000)

- [ ] Design mit Umfang, Konfliktregel und Event-Strategie 🛑
- [ ] U1–U15 umgesetzt und getestet
- [ ] `TODO.md`: Folgepunkt 010 „Undo/Redo“ abgehakt
