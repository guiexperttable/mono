# TODO-Prompt 009: Zeilen ziehen (Row Drag)

> Status: **offen** · angelegt 14.10.2026 · Slug `row-drag` (Branch `feat/row-drag`, Design `prompts/009-row-drag.design.md`)
> Abhängigkeiten: **001 (ARIA)** für die Tastatur-Alternative und Ansagen; **004 (Zeilennummern)**, falls der Griff dort
> sitzen soll; **006 (Row Grouping)**, damit Ziehen zwischen Gruppen mitgedacht wird (geht auch ohne).
> ag-Grid: Row Dragging ist dort Community; Ziehen zwischen Tabellen ebenfalls (Drag-and-Drop-Modul).
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Zeilen per Maus (und per Tastatur) an eine andere Position ziehen, z. B. für Prioritätenlisten, Playlists oder
Reihenfolgen. Mit Griff in einer Spalte, Geisterbild, Einfügemarke, automatischem Scrollen am Rand. Zwei Modi:
Die Tabelle verschiebt die Zeile selbst („managed“), oder sie meldet nur Quelle und Ziel und die Anwendung entscheidet.

## Was es heute gibt (Code-Befund Okt. 2026)

- **Spalten** lassen sich schon ziehen (`tableOptions.columnsDraggable`): Header-Zelle mit `data-ge-action="drag-column"`,
  Start in `TableScope` (`mouseStartAction`, ~Z. 395), Verschieben über `tableModel.changeColumnOrder(from, to)`
  (~Z. 428), Geisterbild `ge-table-dragging-column` (`EleScope`) mit `RenderScope.renderContentOfDraggingColumn`,
  Zielmarke `ge-table-drop-zone` (`renderDragTargetDiv`). Das ist das Vorbild.
- Maus-Events nur über `mousedown/mousemove/mouseup` am Host (`mouse-handler.ts`). **Keine Pointer- oder Touch-Events.**
- Events für Anwender: `onMouseDragging`, `onMouseDraggingEnd` (`EventListenerIf`).
- Bereichsauswahl per Ziehen gibt es (Typ `range`). Zeilen-Ziehen darf damit nicht kollidieren (nur am Griff starten).
- Daten: `AreaModelObjectArray` mit `setRows`, `getAllRows`, `getFilteredRows`; Sortierung und Filter erzeugen eine
  eigene Anzeige-Reihenfolge. `TableApi.setRows/addRows/removeRows` zeichnen nicht von selbst neu (`TODO.md`).
- Baum: `AreaModelTree` mit `TreeRowIf` (`parent`, `children`).

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| D1 | Griff in Zeile 3 gezogen und zwischen Zeile 7 und 8 losgelassen | Zeile steht an Position 7 (managed) bzw. Event mit Quelle 3, Ziel 7 (unmanaged) |
| D2 | Während des Ziehens | Geisterbild der Zeile folgt der Maus, Einfügemarke zwischen den Zeilen, Mauszeiger „grabbing“ |
| D3 | Ziehen an den unteren Rand bei 100.000 Zeilen | Tabelle scrollt automatisch, Geschwindigkeit abhängig vom Abstand zum Rand |
| D4 | Escape während des Ziehens | Abbruch, nichts verändert |
| D5 | Tabelle sortiert oder gefiltert, managed | Ziehen gesperrt (mit Hinweis) oder klar definiert; entscheiden |
| D6 | Mehrere Zeilen ausgewählt, eine davon gezogen | alle ausgewählten werden verschoben (Reihenfolge bleibt), falls so entschieden |
| D7 | Baum | Ziehen auf eine Zeile (wird Kind) vs. zwischen Zeilen (Geschwister); Zyklus (Knoten in eigenen Nachfahren) verhindert |
| D8 | Gruppierte Tabelle (006) | Ziehen in eine andere Gruppe ändert das Gruppierfeld oder ist gesperrt; entscheiden |
| D9 | Tastatur (mit 001) | z. B. Strg+Alt+↑/↓ verschiebt die fokussierte Zeile; Live-Region sagt „Row moved to position 7“ |
| D10 | Touch-Gerät | funktioniert (Pointer Events) oder ist bewusst nicht unterstützt; entscheiden |
| D11 | Ziehen aus der Tabelle in eine andere GuiExpert-Tabelle bzw. eine Drop-Zone der Seite | Event mit Daten (optional, Phase 1) |
| D12 | Bereichsauswahl durch Ziehen in normalen Zellen | funktioniert unverändert |
| D13 | Events | `onRowDragStart`, `onRowDragMove`, `onRowDragEnd` (additiv) mit Quelle, Ziel, Zeilen; Anwendung kann abbrechen |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Griff:** `ColumnDef.rowDrag?: boolean | (row) => boolean` (Griff-Symbol in dieser Spalte), eigene Griffspalte, die
   Zeilennummer aus 004, oder ganze Zeile ziehbar? Empfehlung begründen.
2. **Modus:** managed (Tabelle ändert die Reihenfolge im Modell; nur bei unsortierter, ungefilterter Anzeige?) und
   unmanaged (nur Events). Welche Modell-Methode verschiebt (`moveRows(from[], to)` additiv am Area-Modell)?
3. **Pointer Events** statt Mouse Events für dieses Feature (Touch, Stift)? Wirkung auf den bestehenden `MouseHandler`
   (nicht umbauen, nur ergänzen?).
4. **Geisterbild:** wie beim Spalten-Ziehen gerendert (Kopie der Zeilenzellen) oder schlichter Balken mit Text?
5. **Auto-Scroll:** Rand-Zone, Geschwindigkeit, Zusammenspiel mit Virtual Scrolling (Zeilen unter der Maus ändern sich).
6. **Baum und Gruppen:** D7/D8 festlegen; Datenänderung bei Gruppenwechsel (`valueSetter`?).
7. **Mehrfach-Ziehen** (D6) und **Tabellen übergreifend** (D11) jetzt oder später?
8. **Tastatur-Alternative** (D9) ist für Barrierefreiheit Pflicht (WCAG 2.5.7 „Dragging Movements“).
9. **Zustand:** Die neue Reihenfolge gehört den Daten der Anwendung. Speichern ist Sache der Anwendung (Event), nicht
   von 003.

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: `moveRows` (Grenzen, mehrere Zeilen, Ziel innerhalb der Quelle), Baum-Umhängen inkl. Zyklus-Schutz.
- Browser (Maus-Events wie in `mouse-handler.browser.spec.ts` simulieren): D1–D7, D9, D12, D13; Auto-Scroll D3 mit
  `vi.waitFor`; Abbruch D4; Bereichsauswahl unverändert.
- Wrapper-Smoke: neue Events kommen in React und Web Component an.
- HTML-Injection: Geisterbild zeigt Zellinhalt mit `<img src=x onerror=…>` → Text.

## Phase 3 – Hinweise

- Spalten-Drag-Code als Vorbild, aber nicht verbiegen; gemeinsame Teile (Geisterbild, Auto-Scroll) ggf. herausziehen.
- `data-ge-action="drag-row"` am Griff; Start nur dort.
- CSS: `ge-table-row-drag-handle`, `ge-table-row-dragging`, `ge-table-row-drop-indicator`, Variablen (light/dark).

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` (Interaktion), Beispiel managed und unmanaged (Reihenfolge an den Server schicken).
- **Training:** eigenes Kapitel in Teil 8 oder Abschnitt im Kapitel `events-and-context-menu`; in Phase 1 entscheiden.
- **Website:** Showcase `rowdrag` (Prioritätenliste); Feature-Liste.
- **Video:** „Zeilen per Drag & Drop sortieren“ (60 s).

## Abschluss-Review (Schwerpunkte)

Konflikte mit Bereichsauswahl und Spalten-Drag, Auto-Scroll bei großen Tabellen, Tastatur-Alternative, Touch.

## Definition of Done (zusätzlich zu 000)

- [ ] Design-Dokument mit Griff, Modus, Pointer-Entscheidung, Baum/Gruppen 🛑
- [ ] D1–D13 umgesetzt bzw. begründet ausgelassen und getestet
