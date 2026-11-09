# 022 – Spalten ziehen: Ereignisse, Sperre je Spalte, Doppelklick passt die Breite an

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Phasen, Regeln, Phase 10 =
> Release-Block). **Haltepunkt nach Phase 1** (Design-Dokument `prompts/022-spalten-ziehen.design.md`): Die neuen
> Namen sind öffentliche API in allen Wrappern. Jede Core-Änderung folgt der Regel „zuerst ein roter Test“; die
> Invarianten-Checks aus 021 gelten (kein Mehraufwand je Frame, Zähler statt Zeiten). Branch: `feat/spalten-ziehen`.
> Zielversion: die nächste nach `packages/table/package.json` (Stand 09.11.2026: 1.1.109 → 1.1.110), nur eintragen.
>
> Herkunft: **log-commander** (Tauri-Live-Log-Viewer, `@guiexpert/table@1.1.109`, `<guiexpert-table-signal>`, eigenes
> `AreaModel` mit bis zu 10 Mio. Zeilen, Spaltenansicht mit `columnsResizable`/`columnsDraggable`, feste linke
> Zeilennummer-Spalte als **normale** `ColumnDef` mit `fixedLeftColumnCount: 1`). Die App hängt eigene DOM-Listener an
> die Tabelle, nur weil die Tabelle dafür nichts anbietet. Ziel: Diese Listener fallen weg. Punkte 3–5 der Liste
> „Weitere Punkte aus log-commander“ in `018-klick-trotz-api-render.md` gehen in diesem Prompt auf.

## Befund (09.11.2026)

### Was log-commander heute selbst baut (`src/app/features/log-table/log-table-view.ts`)

| Listener in der App | Zweck | Fehlt in der Tabelle |
|---|---|---|
| `mousedown` (capture) am Host, nur Kopfzeile | `headerBusy = true`: Während Breite oder Reihenfolge gezogen werden, zeichnet die App nicht (ein `repaintHard()` der App mitten im Ziehen stört Geisterbild und Breite). Außerdem `stopPropagation()` auf der Zeilennummer-Spalte, damit man sie weder verschiebt noch in der Breite zieht. | Ereignis „Ziehen beginnt“; Sperre je Spalte |
| `mouseup` (capture) am `window` | Ende des Ziehens, dann `setTimeout(() => syncFromTable())`: liest Breiten und Reihenfolge aus der Tabelle und speichert sie je Profil. `setTimeout`, weil die Tabelle das Ende im selben Event verarbeitet. | Ereignis „Ziehen beendet“ mit Ergebnis |
| `dblclick` (capture) auf `[data-ge-action="resize-column"]` | Breite an den Inhalt anpassen (`fitColumn`: misst nur geladene/sichtbare Zeilen, eigene Textbreite). | Doppelklick auf den Griff; Haken für eine eigene Breitenberechnung |

(Wheel, `ResizeObserver` und das Schließen eigener Menüs bleiben App-Sache; nicht Teil dieses Prompts.)

### Ist-Stand im Core (geprüft im Code, 09.11.2026)

- **Sperren gibt es nur global:** `tableOptions.columnsResizable` / `columnsDraggable`. Je Spalte gesperrt ist nur
  die eingebaute `RowNumberColumnDef` – fest verdrahtet in `TableScope.onMouseDown` (`!isRowNumberColumnDef(...)`),
  `RenderScope.isColumnResizable` (kein Griff) und `getFirstDataColumnIndex()` (nichts davor ablegen). Eine normale
  `ColumnDef` lässt sich nicht sperren; `ColumnDefIf` hat kein `resizable`/`movable`.
- **Keine Spalten-Ereignisse:** `EventListenerIf` kennt nur allgemeine `onMouseDragging`/`onMouseDraggingEnd` (ohne
  Aussage, ob eine Spalte gezogen wurde, und vor bzw. ohne Ergebnis) und `onStateChanged` mit
  `changedParts: ['columns']`. Letzteres kommt **gebündelt nach `stateChangedDebounceDelay`**, unterscheidet nicht
  zwischen Nutzer und API (`applyState`, `setColumnWidth`) und hat **keinen Start** – für „während des Ziehens nicht
  zeichnen“ unbrauchbar. Intern markiert `mouseDraggingEndOnFrame` nur `stateService.markDirty('columns')`.
- **Doppelklick auf den Griff tut nichts** (auch in `TODO.md`, offen aus 013 Etappe 7). `autoResizeColumns()` gibt es
  nur für **alle** Spalten, und `calcAutoColumnWidths()` liest **jede Zeile jeder Spalte** des Body (O(n · Spalten),
  `getValueAt` je Zelle) – für ein eigenes Area-Modell mit Millionen Zeilen und Platzhaltern ungeeignet.
- Verschieben über die Grenze fixierter Spalten ist ungeklärt (`TODO.md`, Folgepunkte 003).

## Teil A – Ereignisse für Ziehen von Spalten (Pflicht)

Vorschlag (Namen im Design festlegen, an bestehende anlehnen: `onRowDragStart/Move/End` aus 009):

```ts
interface EventListenerIf {
  /** Breite ziehen beginnt (mousedown auf dem Griff, nach der Drag-Schwelle oder sofort – im Design entscheiden). */
  onColumnResizeStart?(evt: GeColumnResizeEvent): void;
  /** Breite ziehen endet: einmal, mit Endbreite; auch bei Abbruch (Esc / mouseup außerhalb) mit `cancelled`. */
  onColumnResizeEnd?(evt: GeColumnResizeEvent): void;
  onColumnMoveStart?(evt: GeColumnMoveEvent): void;
  /** Verschieben endet: einmal, mit Start- und Zielindex (auch wenn er gleich blieb). */
  onColumnMoveEnd?(evt: GeColumnMoveEvent): void;
}
// GeColumnResizeEvent: columnIndex, columnDef (property!), oldWidth, newWidth, source: 'mouse' | 'dblclick' | 'keyboard'
// GeColumnMoveEvent:   fromIndex, toIndex, columnDef, columnOrder (properties in neuer Reihenfolge)
```

Regeln:

- Das End-Ereignis kommt **nachdem** Modell, Zustand und Darstellung fertig sind – eine App liest im Handler
  `getColumnWidth`/`getColumnDefs` und bekommt das Ergebnis (kein `setTimeout` nötig).
- Nur Nutzeraktionen lösen sie aus, nicht `setColumnWidth`, `applyState`, `autoResizeColumns` über die API
  (sonst Schleifen beim Speichern). Im Design festhalten.
- Ein `Move`-Ereignis je Zug (Start/Ende), **kein** Ereignis je Zwischenschritt (`changeColumnOrder` läuft beim
  Ziehen mehrfach).
- **Renders der App während des Ziehens:** Im Design entscheiden und testen, was ein `repaint()`/`repaintHard()`/
  `rowsAppended()` über die API zwischen Start und Ende tut (Geisterbild, Griffposition, `mouseStartWidth`).
  Am besten verträgt der Core sie (wie seit 018 bei Klicks), dann braucht die App kein `headerBusy`. Sonst eine
  öffentliche Abfrage (z. B. `tableApi.isColumnDragging()`) und eine dokumentierte Regel.
- Wrapper: alle Frameworks bekommen die Ereignisse wie die bestehenden (Angular `output()` in
  `<guiexpert-table-signal>` und `@Output` in `TableComponent`, React/Preact/Solid/Svelte/Vue/Web Component nach dem
  Muster von `onRowDragEnd`).

## Teil B – Sperre je Spalte (Pflicht)

- `ColumnDefIf` / `ColumnDef` / `ColumnDef.create` / `TableFactory`: `resizable?: boolean` und `movable?: boolean`
  (Namen im Design; Vorgabe `true`, wirken nur, wenn die globale Option an ist). `RowNumberColumnDef` setzt beide auf
  `false` – der fest verdrahtete Sonderfall in `onMouseDown`, `isColumnResizable` und beim Ablegen wird durch die
  Flags ersetzt, das Verhalten der Zeilennummern bleibt gleich (bestehende Tests 004 grün).
- Gesperrte Spalte: kein Griff (`data-ge-action="resize-column"` fehlt, Cursor normal), kein Ziehen des Titels.
- **Ablegen:** Eine andere Spalte darf eine nicht verschiebbare Spalte nicht verdrängen. Für führende gesperrte Spalten
  verallgemeinert das `getFirstDataColumnIndex()`; für gesperrte Spalten in der Mitte im Design entscheiden (springen
  oder dort nicht ablegen). Dazu die offene Frage aus `TODO.md`: Verschieben über die Grenze fixierter Spalten
  (`fixedLeftColumnCount`/`fixedRightColumnCount`) – mindestens testen und dokumentieren, wenn klein, sperren.
- ARIA: eine gesperrte Spalte meldet sich nicht als ziehbar (wie heute die Zeilennummern).
- Zustand (003): gesperrte Spalten bleiben beim `applyState` mit fremder Reihenfolge an ihrem Platz? Im Design klären.

## Teil C – Doppelklick auf den Griff passt die Breite an (Pflicht)

- Doppelklick auf `resize-column` setzt die Breite dieser **einen** Spalte auf ihren Inhalt (Kopf, sichtbarer Body,
  Fuß), begrenzt durch `minWidth`/`maxWidth`, dann `onColumnResizeEnd` mit `source: 'dblclick'`.
  Option zum Abschalten (Vorgabe an; im Design klären, ob an `columnsResizable` gekoppelt).
- **Neue Methode** `tableApi.autoResizeColumn(index)` für eine Spalte (heute nur alle).
- **Messung, die auch bei Millionen Zeilen trägt:** Vorgabe = vorhandene Logik von `calcAutoColumnWidths`, aber für
  große Modelle begrenzt (z. B. nur sichtbare Zeilen + Kopf/Fuß, oder höchstens N Zeilen) – im Design entscheiden und
  messen (021, `test:perf`: Zeit unabhängig von n). Dazu ein Haken für Apps mit eigener Messung, z. B.
  `tableOptions.getAutoColumnWidth?: (columnIndex: number, context) => number | undefined` (`undefined` = Vorgabe).
  log-commander würde dort seine eigene Messung (Textbreite der geladenen Zeilen, Spannen-Versatz) einhängen.
- Doppelklick auf den Griff darf **nicht** sortieren und nicht den Doppelklick des Kopfs (Editieren, Sortieren)
  auslösen; heute stoppt die App das per `stopPropagation`.

## Nicht in diesem Prompt

- Spaltenbreite und -reihenfolge per Tastatur (ARIA-Folgepunkt in `TODO.md`) – nur aufnehmen, wenn sich das Ereignis
  `source: 'keyboard'` ohne großen Aufwand ergibt, sonst in `TODO.md` lassen.
- Ziehen über Buchstaben im Spreadsheet-Modus (013).

## Tests (Vitest Browser, zuerst rot)

Echte Mauseingaben wie in 018 (Playwright `page.mouse.move/down/up`, kein synthetisches `dispatchEvent`), Chromium und
WebKit, ltr und rtl:

- Breite ziehen: genau ein `onColumnResizeStart`, genau ein `onColumnResizeEnd` mit `oldWidth`/`newWidth`; im
  End-Handler liefert `getColumnWidth` schon die neue Breite.
- Verschieben über mehrere Spalten: ein Start, ein Ende mit `fromIndex`/`toIndex`/`columnOrder`; keine Zwischen-
  ereignisse; im Handler ist `getColumnDefs()` schon umgeordnet.
- `mouseup` außerhalb der Tabelle beendet beides (seit 1.1.108 endet ein Druck dort) und meldet das Ende.
- API-Aufrufe (`setColumnWidth`, `applyState`, `autoResizeColumns`) lösen keine Ereignisse aus.
- App rendert zwischen Start und Ende (`repaintHard({ py })`, `rowsAppended`): Ergebnis und Ereignisse stimmen
  (bzw. die dokumentierte Regel aus Teil A).
- `resizable: false`: kein Griff, kein Ziehen; `movable: false`: Titel nicht ziehbar, andere Spalten verdrängen sie
  nicht; `RowNumberColumnDef` unverändert (Tests 004).
- Doppelklick auf den Griff: Breite = Inhalt (innerhalb `minWidth`/`maxWidth`), `source: 'dblclick'`, kein
  Sortieren; mit `getAutoColumnWidth` gewinnt dessen Wert; mit 1 Mio. Zeilen bleibt die Zeit flach (021, Verhältnis
  kleines/großes n).
- Wrapper-Smoke-Tests: je Framework kommt `onColumnResizeEnd` an (`pnpm test:wrappers`, Angular `pnpm test:angular`).

## Doku, Demo, Website

- `instructions.md` (neuer Abschnitt Spalten ziehen: Ereignisse, Sperre, Doppelklick, eigene Messung), `llms.txt`
  (Rezept „Spaltenlayout speichern, wenn der Nutzer zieht“ statt `onStateChanged` + Debounce; Pitfall „eigene
  DOM-Listener am Kopf“), JSDoc mit `@since`, Training/Video nach `000-arbeitsweise.md` (klein: Phasen zusammenlegen
  ist erlaubt, im Design begründen).
- Demo: `apps/table-demo` – eine Seite mit gesperrter erster Spalte, Ereignis-Log (Start/Ende, Breiten, Reihenfolge)
  und Doppelklick-Anpassung.

## Danach in log-commander (nicht in diesem Repo umsetzen, nur im Design als Ziel notieren)

Mit dem Release entfallen dort `onHeaderMouseDown`, `onMouseUp` + `setTimeout(syncFromTable)`, `onHeaderDblClick`
und das `stopPropagation` für die Zeilennummern: Zeilennummer-Spalte mit `resizable: false, movable: false`,
`(columnResizeEnd)`/`(columnMoveEnd)` → `syncFromTable()`, `getAutoColumnWidth` → bisherige `fitColumn`-Messung,
`headerBusy` nur noch, falls Teil A Renders während des Ziehens nicht verträgt.

## Fertig, wenn

- Design freigegeben, Teile A–C mit roten, dann grünen Tests; alle bestehenden Tests grün (`test:browser`,
  `test:browser:scrollbars`, `test:perf`, `test:wrappers`, `test:angular`, `check:llms`), ltr und rtl.
- `instructions.md`, `llms.txt`, `CLAUDE.md`, `TODO.md` (Punkte „Doppelklick auf den Spaltengriff“ und „Verschieben
  über die Grenze fixierter Spalten“ abhaken oder präzisieren), `prompts/README.md` (Zeile und Status).
- Release-Block (Phase 10) nur auf Anweisung.
