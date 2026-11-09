# 022 – Spalten ziehen: Design, Entscheidungen

> Zu `prompts/022-spalten-ziehen-ereignisse-und-sperren.md`. Branch `feat/spalten-ziehen` (von `main` @ 1.1.109),
> Zielversion **1.1.110**. 🛑 Haltepunkt: Die Namen unten werden öffentliche API in allen Wrappern – bitte die
> Entscheidungen (Tabelle „Entscheidungen“) bestätigen oder ändern.

## Befund im Code (09.11.2026)

Zusätzlich zum Befund im Prompt beim Lesen gefunden (beide bekommen zuerst einen roten Test):

- **F1 – Doppelklick auf den Griff sortiert.** Der Griff trägt `data-col-index`, `MouseHandler.handleDblClick` findet
  über `closest("[data-col-index]")` die Spalte und ruft `onHeaderDblClicked` → `sortByColumn`. Deshalb stoppt
  log-commander den Doppelklick selbst.
- **F2 – Ein Klick auf den Griff (oder den Titel) ohne Ziehen hinterlässt einen Zug.** `TableScope.onMouseDown` setzt
  `mouseStartAction`/`mouseStartColumnIndex`; zurückgesetzt wird nur in `mouseDraggingEndOnFrame`, das ohne Mausbewegung
  nie läuft. Der nächste Druck **ohne** Spalten-Aktion (z. B. Bereichsauswahl im Body) überschreibt den Zustand nicht →
  das Ziehen im Body ändert die Breite der zuletzt angeklickten Spalte (bzw. verschiebt sie). Ein Doppelklick auf den
  Griff ist genau so ein Klick ohne Ziehen.
- Spalten-Drag kennt keine Schwelle: die erste Mausbewegung bei gedrückter Taste zeigt das Geisterbild.
- Kein Escape beim Spalten-Drag (Row Drag 009 hat es).
- Über die Grenze fixierter Spalten: `changeColumnOrder` tauscht dann still **welche** Spalte fixiert ist
  (`fixedLeftColumnCount` bleibt, die Spalte rutscht hinein, die letzte fixierte heraus).
- Eine gesperrte Spalte in der Mitte würde von `changeColumnOrder(from, to)` mit `from < gesperrt < to` um eins
  verschoben – „nicht dort ablegen“ allein reicht nicht.

## Bausteine

| Baustein | wofür | Ergebnis |
|---|---|---|
| `TableScope.onMouseDown` / `mouseDraggingOnFrame` / `mouseDraggingEndOnFrame` | Zug | muss erweitert werden: Schwelle, Sperren, Ereignisse, Escape, Reset nach Klick (F2) |
| `MouseHandler` (018: Druck endet auch außerhalb, `flushDraggingEnd`) | Ende | passt; neu: Ende eines Drucks ohne Ziehen meldet `TableScope.onMouseUpWithoutDrag()` (F2) |
| `MouseHandler.handleDblClick` | Doppelklick | erweitert: Aktion `resize-column` → Breite anpassen statt Header-Doppelklick (F1) |
| `RenderScope.isColumnResizable` / `data-ge-action="drag-column"` | Griff, Titel | Sonderfall `isRowNumberColumnDef` → Flags `resizable`/`movable` |
| `RenderScope.getFirstDataColumnIndex()` | Baumpfeil, Checkbox, **und** Ablegen | bleibt für Pfeil/Checkbox; Ablegen bekommt eine eigene Regel (unten) |
| `TableModel.changeColumnOrder` | Umordnen | passt (Breiten + Area-Modelle synchron); Ziel-Reihenfolge wird über mehrere Aufrufe hergestellt (wie `TableStateService`) |
| `calcAutoColumnWidths()` | Breite messen | O(n · Spalten); wird zu einer Messung **je Spalte** mit Zeilen-Grenze, `autoResizeColumns` nutzt sie mit |
| `clampToColumnWidthLimits` | min/max | passt |
| `TableStateService` (Reihenfolge per `changeColumnOrder`) | `applyState` | erweitert: gesperrte Spalten bleiben (Entscheidung 8) |
| `createEventListenerHub` / `EventAdapter` / Wrapper | Ereignisse | additiv, Muster `onRowDragEnd` |

Breaking Changes: keine API wird entfernt oder umbenannt. Verhaltensänderungen (bewusst, Release-Notes): F1, F2,
Schwelle (Entscheidung 3), Grenze fixierter Spalten (Entscheidung 7), `autoResizeColumns` ab 10 000 Zeilen
(Entscheidung 10).

## API

### Teil A – Ereignisse

```ts
// data/common/event/ge-column-resize-event.ts   (@category Column drag, @since 1.1.110)
export type GeColumnDragEventType = "start" | "end" | "cancel";
export type GeColumnResizeSource = "mouse" | "dblclick";

export class GeColumnResizeEvent {
  constructor(
    readonly type: GeColumnDragEventType,
    readonly source: GeColumnResizeSource,
    readonly columnIndex: number,      // Modell-Index (über west/center/east)
    readonly columnDef: ColumnDefIf | undefined,
    readonly property: string | undefined,   // = columnDef?.property
    readonly oldWidth: number,         // px beim Start
    readonly newWidth: number,         // px jetzt (start: = oldWidth, cancel: = oldWidth)
    readonly originalEvent?: MouseEvent
  ) {}
}

// data/common/event/ge-column-move-event.ts
export class GeColumnMoveEvent {
  constructor(
    readonly type: GeColumnDragEventType,
    readonly fromIndex: number,        // Index beim Start
    readonly toIndex: number,          // Index jetzt (start/cancel: = fromIndex; end: auch wenn gleich)
    readonly columnDef: ColumnDefIf | undefined,
    readonly property: string | undefined,
    readonly columnOrder: string[],    // Properties in der Reihenfolge danach
    readonly originalEvent?: MouseEvent
  ) {}
  get moved(): boolean { return this.toIndex !== this.fromIndex; }
}

interface EventListenerIf {
  onColumnResizeStart?(evt: GeColumnResizeEvent): void;
  onColumnResizeEnd?(evt: GeColumnResizeEvent): void;   // type "end" | "cancel"
  onColumnMoveStart?(evt: GeColumnMoveEvent): void;
  onColumnMoveEnd?(evt: GeColumnMoveEvent): void;       // type "end" | "cancel"
}

tableApi.isColumnDragging(): boolean      // zwischen Start und Ende (Breite oder Reihenfolge)
tableApi.cancelColumnDrag(): void         // wie Escape: alte Breite bzw. Reihenfolge, Ende mit type "cancel"
```

Wrapper-Events: `columnResizeStart`, `columnResizeEnd`, `columnMoveStart`, `columnMoveEnd` – React/Preact/Solid
Callback-Props (`columnResizeEnd={…}` wie `rowDragEnd`), Vue `@columnResizeEnd`, Svelte `on:columnResizeEnd` +
`onColumnResizeEnd`, Web Component `CustomEvent`, Angular `@Output()` in `TableComponent` und `output()` in
`TableSignalComponent`.

### Teil B – Sperre je Spalte

```ts
interface ColumnDefIf {
  /** false: kein Griff, keine Breite per Maus/Doppelklick/autoResize (setColumnWidth/applyState wirken). Default true. */
  resizable?: boolean;
  /** false: Titel nicht ziehbar, keine andere Spalte verdrängt sie (applyState lässt sie an ihrem Platz). Default true. */
  movable?: boolean;
}
// ColumnDef: public Felder + ColumnDef.create({ …, resizable, movable }); RowNumberColumnDef: beide false.
```

Ohne Flag gilt wie bisher nur die globale Option (`columnsResizable`/`columnsDraggable`). `TableFactory` braucht nichts
Eigenes – die Flags stehen in den `columnDefs`, die durchgereicht werden.

### Teil C – Breite an den Inhalt anpassen

```ts
tableApi.autoResizeColumn(column: number | string | ColumnDefIf): number | undefined   // gesetzte Breite, undefined = nicht angepasst

tableOptions.columnAutoWidth?: Partial<ColumnAutoWidthOptionsIf>
interface ColumnAutoWidthOptionsIf {
  /** Doppelklick auf den Griff passt die Breite an. Default true (nur wo ein Griff ist). */
  doubleClick: boolean;
  /** Body-Zeilen: bis zu dieser Zahl alle, darüber nur die gezeichneten Zeilen. Default 10_000. */
  maxRows: number;
  /** Eigene Messung: px oder undefined = Vorgabe. Ergebnis wird auf minWidth/maxWidth begrenzt. */
  getWidth?: (ctx: ColumnAutoWidthContextIf) => number | undefined;
}
interface ColumnAutoWidthContextIf {
  columnIndex: number; columnDef: ColumnDefIf | undefined; property: string | undefined;
  source: "dblclick" | "api";
  firstRenderedRow: number; lastRenderedRow: number;   // gezeichnete Body-Zeilen
  measureText(text: string): number;                    // Breite mit Schrift + Padding einer Zelle (wie die Vorgabe)
  getDefaultWidth(): number;                            // die Vorgabe-Messung, erst beim Aufruf gerechnet
}
```

## Entscheidungen

| # | Frage | Empfehlung | Begründung |
|---|---|---|---|
| 1 | Namen | `onColumnResizeStart/End`, `onColumnMoveStart/End`, `GeColumnResizeEvent`, `GeColumnMoveEvent`, `ColumnDefIf.resizable/movable`, `autoResizeColumn`, `columnAutoWidth` | wie im Prompt; „move“ statt „drag“, weil `columnsDraggable` schon den Titel meint und `onRowDrag*` Zeilen sind. `resizable`/`movable` wie ag-Grid (`resizable`, `suppressMovable`) |
| 2 | Abbruch: Flag oder Typ | **`type: "start" \| "end" \| "cancel"`** (wie `GeRowDragEvent`), End-Handler bekommt `"end"` oder `"cancel"` | ein Muster für alle Zieh-Ereignisse; `cancelled` wäre ein zweites |
| 3 | Wann kommt Start | **nach der Schwelle** `MouseHandler.clickMoveTolerance` (4 px), im selben Frame, bevor sich Breite/Reihenfolge ändert. Darunter: kein Geisterbild, keine Breitenänderung, keine Ereignisse | ein Klick (Sortieren, Auswahl) und ein Zittern beim Doppelklick sind kein Zug; dieselbe Grenze wie „Klick trotz Render“ (018). Verhaltensänderung nur für Züge < 4 px |
| 4 | Ende | im End-Frame **nach** Modell, `markDirty`, Geisterbild weg und Repaint; einmal je Start. `mouseup` außerhalb = normales Ende an der Stelle. Escape / `cancelColumnDrag()` = `"cancel"`: alte Breite bzw. alte Reihenfolge zurück. `destroy()` während des Zugs: kein Ereignis | App liest im Handler `getColumnWidth`/`getColumnDefs`/`getState` und bekommt das Ergebnis; jedes Start hat genau ein Ende |
| 5 | Nur Nutzer | `setColumnWidth`, `applyState`, `autoResizeColumn(s)`, `changeColumnOrder` am Modell lösen **keine** Ereignisse aus | sonst Schleifen beim Speichern; `onStateChanged` bleibt für „irgendeine Änderung“ |
| 6 | Renders der App während des Zugs (`repaint`, `repaintHard({ py })`, `rowsAppended`, `appendRows`) | **Core verträgt sie** (Tests mit echter Maus); `isColumnDragging()` nur für Apps, die selbst Breiten/Reihenfolge setzen (das während des Zugs zu tun bleibt verboten, dokumentiert) | log-commander braucht dann kein `headerBusy`. Breite rechnet vom Startwert + Mausweg, Geisterbild hängt am Host, nicht an den Zellen – Renders ersetzen nur Zellen |
| 7 | Grenze fixierter Spalten | **sperren**: eine Spalte bleibt in ihrem Bereich (west / center / east); das Ziel wird auf den Bereich begrenzt | heute wechselt still, welche Spalte fixiert ist – das will niemand; „Spalte fixieren“ ist eine eigene Funktion (`fixedLeftColumnCount`) |
| 8 | Gesperrte Spalte in der Mitte | **Plätze-Modell**: gesperrte Spalten sind feste Plätze; die beweglichen Spalten füllen die übrigen Plätze. Steht die Maus über einem gesperrten Platz, rückt die Spalte so weit wie möglich in seine Richtung (direkt daneben = bleibt; nachträglich geändert: „bleibt stehen“ hing von der Framerate ab – WebKit bündelt Mausbewegungen, die Maus „sprang“ auf die gesperrte Spalte). `applyState` mit fremder Reihenfolge: gesperrte Spalten bleiben, der Rest füllt die übrigen Plätze in der gespeicherten Reihenfolge | „springen“ wirkt nervös; ein einzelnes `changeColumnOrder` verschiebt die gesperrte Spalte, also Ziel-Reihenfolge wie im `TableStateService` herstellen. Führende gesperrte Spalten (Zeilennummern) ergeben genau das heutige Verhalten |
| 9 | `resizable: false` und API | Maus, Doppelklick, `autoResizeColumns`, `autoResizeColumn` lassen sie aus; `setColumnWidth` und `applyState` setzen sie | „Breite bestimmt die App“; die Zeilennummern waren bei `autoResizeColumns` schon ausgenommen |
| 10 | Messung bei vielen Zeilen | Kopf + Fuß immer ganz; Body: bis `maxRows` (10 000) **alle** Zeilen (wie heute), darüber nur die **gezeichneten** Zeilen. Gilt auch für `autoResizeColumns` | unter 10 000 Zeilen bit-gleich wie heute; darüber war `autoResizeColumns` bei 2 Mio. Zeilen ein Hänger. ag-Grid misst ebenfalls nur gerenderte Zeilen. Zeit flach in n (`test:perf`) |
| 11 | Doppelklick-Schalter | `columnAutoWidth.doubleClick` (Default `true`), wirkt nur, wo ein Griff ist (`columnsResizable` + `resizable`) | ohne Griff kein Doppelklick; die Option nur für Apps, die den Doppelklick selbst belegen |
| 12 | Ereignisse beim Doppelklick | `onColumnResizeStart` + `onColumnResizeEnd` mit `source: "dblclick"`, synchron im `dblclick` | jedes Ende hat ein Start (Apps, die Start/Ende paaren, bleiben im Gleichgewicht) |
| 13 | Tastatur (`source: "keyboard"`) | **nicht** in diesem Prompt, bleibt in `TODO.md` (ARIA-Folgepunkt) | braucht Fokus auf dem Kopf + eigene Tasten + Ansagen – kein Abfallprodukt |
| 14 | `CheckboxColumnDef` sperren? | **nein**, unverändert; in `TODO.md` prüfen, ob eine verschobene Checkbox-Spalte Baum/Checkbox-Erkennung bricht | nicht Teil des Auftrags, eigene Verhaltensänderung |
| 15 | ARIA | gesperrte Spalte: kein `data-ge-action="drag-column"`, Cursor normal, kein Griff (der Griff ist ohnehin `aria-hidden`). Keine neuen Rollen | die Tabelle meldet Ziehbarkeit heute nirgends an Screenreader; Ziehen per Tastatur ist Entscheidung 13 |

## Ablauf im Core (Skizze)

- `TableScope.onMouseDown`: Spalten-Aktion nur bei erlaubter Spalte (`isColumnResizable`/`isColumnMovable` + globale
  Option) → `columnDrag = { kind, columnIndex, startWidth, startOrder, started: false }`; sonst `columnDrag = undefined`
  (behebt F2 für jeden neuen Druck). `onMouseUpWithoutDrag()` (aus `MouseHandler.onMouseUp`, wenn nicht gezogen)
  setzt ihn ebenfalls zurück.
- `mouseDraggingOnFrame`: bis `|draggingX|` (bzw. Abstand) > Schwelle nichts; dann `started = true`, Start-Ereignis,
  Escape-Listener am `document` (eigener `AbortController`, `TableScope.destroy()` bricht ab), danach wie heute.
  Umordnen über `moveColumnTo(column, displayTarget)`: Ziel auf den Bereich begrenzen (7), gesperrten Platz ablehnen (8),
  Ziel-Reihenfolge berechnen, mit `changeColumnOrder` herstellen.
- `mouseDraggingEndOnFrame`: wie heute + `columnDrag = undefined` + Ende-Ereignis zuletzt.
- `MouseHandler.handleDblClick`: `action === "resize-column"` → `tableScope.autoResizeColumnByUser(colIdx)` und
  **return** (kein Header-Doppelklick, kein Sortieren, das `GeMouseEvent` mit `clickCount 2` geht weiter an die App
  wie bei jedem Doppelklick).
- Messung: `ColumnWidthMeasurer` (neue interne Datei, DOM nur über den Host-Font) mit `measureColumn(c, rows)`;
  `calcAutoColumnWidths()` bleibt öffentlich und nutzt sie.

## Beispiele (≤ 15 Zeilen)

**Layout speichern, wenn der Nutzer zieht** (statt `onStateChanged` + Debounce, statt DOM-Listener):

```ts
const listener = new EventAdapter();
listener.onColumnResizeEnd = (evt: GeColumnResizeEvent) => {
  if (evt.type === "end") saveWidth(evt.property!, evt.newWidth);
};
listener.onColumnMoveEnd = (evt: GeColumnMoveEvent) => {
  if (evt.moved) saveOrder(evt.columnOrder);
};
```
Erwartet: ein Aufruf je Zug, im Handler liefert `tableApi.getColumnWidth(evt.columnIndex)` schon `evt.newWidth`.

**Zeilennummer als normale Spalte sperren** (log-commander):

```ts
const columnDefs = [
  ColumnDef.create({ property: "line", headerLabel: "#", width: px50, resizable: false, movable: false }),
  ColumnDef.create({ property: "message", headerLabel: "Message", width: px500 }),
];
const tableModel = TableFactory.createTableModel({ rows, columnDefs, fixedLeftColumnCount: 1 });
```
Erwartet: „#“ hat keinen Griff, lässt sich nicht ziehen, keine Spalte landet davor.

**Eigene Messung für den Doppelklick:**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  columnAutoWidth: {
    getWidth: ctx => ctx.property === "message"
      ? Math.max(...loadedMessages().map(m => ctx.measureText(m)))
      : undefined,   // andere Spalten: Vorgabe
  },
};
```

## Tests (zuerst rot)

- `column-drag.realmouse.browser.spec.ts` (Chromium + WebKit, `describe.each(DIRECTIONS)`): Breite ziehen (1 Start,
  1 Ende, `getColumnWidth` im Handler), Verschieben über 3 Spalten (1 Start, 1 Ende, `getColumnDefs` im Handler, keine
  Zwischenereignisse), `mouseup` außerhalb, Escape (alte Breite/Reihenfolge, `"cancel"`), Zug < 4 px = kein Ereignis,
  Renders der App zwischen Start und Ende (`repaintHard({ py })`, `rowsAppended`, `appendRows`), F2 (Klick auf den Griff,
  dann Bereichsauswahl im Body ändert keine Breite), Doppelklick auf den Griff (Breite = Inhalt, min/max, kein Sortieren,
  `source: "dblclick"`, `getWidth` gewinnt, `doubleClick: false`).
- `column-locks.browser.spec.ts`: `resizable: false` (kein Griff), `movable: false` (kein `drag-column`, vorne/Mitte/
  hinten nicht verdrängt), Grenze west/center/east, `applyState` mit fremder Reihenfolge, Zeilennummern unverändert
  (bestehende 004-Specs grün).
- API ohne Ereignisse (`setColumnWidth`, `applyState`, `autoResizeColumns`, `autoResizeColumn`), `autoResizeColumn`
  bei `resizable: false` → `undefined`.
- Unit: `GeColumnMoveEvent.moved`, Ziel-Reihenfolge mit Plätzen (DOM-frei, `column-order.ts`), Messung mit Zeilen-Grenze.
- Perf (021): Invariante „Doppelklick = ein Render“; `test:perf`-Szenario `autoResizeColumn` 1 000 vs. 1 000 000
  Zeilen (`expectScalesFlat`).
- Wrapper: `columnResizeEnd` kommt in React, Preact, Solid, Svelte 4/5, Vue, Web Component, Angular (beide Komponenten).
- Export-Snapshot (nur Zugänge), `test:types`, `docs:check`, `check:llms`.

## Doku, Demo, Website, Training, Video (Phasen 4–9, klein → zusammengelegt)

- Doku: `instructions.md` neuer Abschnitt 6.27 „Spalten ziehen: Ereignisse, Sperre, Doppelklick“ + FAQ 6.26;
  Angular-`instructions.md` (Outputs); `llms.txt` Rezept „Spaltenlayout speichern, wenn der Nutzer zieht“, Pitfall
  „eigene DOM-Listener am Kopf“; READMEs; `CLAUDE.md` §3.6/§3.7/§4; `TODO.md`.
- Demo: `apps/table-demo/column-drag.html` (gesperrte erste Spalte, Ereignis-Log, Doppelklick, Live-Zeilen während des
  Zugs).
- Website: Eintrag in `src/features/new-features.ts` (ag-Grid-Stufe Community), `/doc/` (Events, Optionen) – **kein
  eigener Showcase** (Vorschaubild aus der Demo wäre nötig – ich nehme den Showcase `columndef`/`large`, falls
  `new-features.ts` einen braucht).
- Training: **kein neues Kapitel**, Abschnitt `#column-events` in Kapitel 33 `persist-state` (Layout speichern) mit
  `<Callout type="version">`; damit kein Demo-Repo-Tag (Phase 8 entfällt).
- Video: nur Backlog-Eintrag in `CLAUDE.md` §10 (Folge 41 „Spaltenlayout speichern, wenn der Nutzer zieht“), kein
  Ordner unter `videos/` – das Feature ist bei ag-Grid Community, kein „ohne Enterprise“-Haken.

## Danach in log-commander (nicht hier umsetzen)

Mit 1.1.110 entfallen dort `onHeaderMouseDown`, `onMouseUp` + `setTimeout(syncFromTable)`, `onHeaderDblClick` und das
`stopPropagation` der Zeilennummern: Zeilennummer-Spalte `resizable: false, movable: false`,
`(columnResizeEnd)`/`(columnMoveEnd)` → `syncFromTable()`, `columnAutoWidth.getWidth` → bisherige `fitColumn`-Messung
(`ctx.measureText`), `headerBusy` entfällt (Entscheidung 6).
