# Design 009 – Zeilen ziehen (Row Drag)

> Prompt: `prompts/009-row-drag.md` · Branch `feat/row-drag` · Zielversion **1.1.95** (`since`; 008 ist auf `main`,
> aber noch nicht veröffentlicht – beide erscheinen mit 1.1.95). Stand 15.10.2026.
> Abhängigkeiten: 001 (ARIA) und 004 (Zeilennummern) und 006 (Row Grouping) sind auf `main`.
> **Selbständig umgesetzt** (Auftrag „arbeite selbständig an prompts/009-row-drag.md“, 15.10.2026): Claude hat die
> Empfehlungen aus § 2 übernommen, ohne die Freigabe abzuwarten. Jede Entscheidung ist begründet und lässt sich vor
> dem Merge noch ändern.

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| Spalten-Ziehen (`TableScope.onMouseDown/mouseDraggingOnFrame/…EndOnFrame`, `RenderScope.adjustDraggingColumn`, `renderDragTargetDiv`, `EleScope.draggingColumn`) | Vorbild | Zustand verteilt auf 6 Felder in `TableScope`, Geisterbild = Kopie der Spaltenzellen, Ziel = Zelle unter der Maus (`data-col-index`) | **nicht verbiegen.** Row Drag bekommt einen eigenen Dienst `RowDragService` (Zustand an einer Stelle). Nichts Gemeinsames herausgezogen: das Spalten-Geisterbild kopiert Zellen, das Zeilen-Geisterbild ist ein Textbalken (§ 2.4) |
| `MouseHandler` (`mousedown/move/up` am Host) | Konflikte | `mouseup` nur am Host – Loslassen außerhalb lässt das Ziehen hängen; keine Pointer/Touch-Events | **unverändert.** Row Drag hört auf `pointerdown` am Host (nur am Griff) und `preventDefault()` unterdrückt dort die Kompatibilitäts-Mausereignisse → keine Bereichsauswahl, kein Spalten-Drag (D12) |
| `createGeMouseEvent` / `data-ge-action` | Start nur am Griff | Aktion über das nächste `[data-ge-action]` | Griff `data-ge-action="drag-row"` |
| `RenderScope.addAndRenderCellDiv` | Griff zeichnen | Baumpfeil/Checkbox werden dort in die Zelle gesetzt | Griff als erstes Kind der Zelle (Body, Spalte mit `rowDrag`), Zelle bekommt Klasse + `aria-keyshortcuts`; gezogene Zeilen `ge-table-row-dragging` |
| `ColumnDefIf` / `ColumnDef.create` | Griff-Spalte | – | neu optional `rowDrag?: boolean \| ((row, rowIndex) => boolean)` – **additiv** |
| `AreaModelIf` | Verschieben | kein Verschieben von Zeilen | neu optional `canMoveRows?(rowIndices, target)` und `moveRows?(rowIndices, target)` – **additiv** |
| `AreaModelObjectArray` | flach | `rows` (Original) + `filteredRows` (Anzeige, Sortierung in place) | `moveRows` verschiebt in der **Anzeige-Reihenfolge** und schreibt sie nach `rows` zurück (in place, wie `Array.sort`); nur ungefiltert |
| `AreaModelArrayOfArrays` | flach | Daten als `any[][]`, kein Filter | `moveRows` in place |
| `AreaModelTree` | D7 | `rows` + `children`/`parent`/`deep` (Sortierung ordnet in place) | `moveRows`: Geschwister (vor/hinter) oder Kind (`inside`), Zyklus-Schutz, `deep` neu |
| `AreaModelRowGroups`, `AreaModelPivot` | D8 | erben von `AreaModelTree` | `canMoveRows` → `false` (managed gesperrt) |
| `ShortcutService`, `ActionId`, Mappings | D9 | Aktionen über `onActionTriggered` | neue `ActionId`s `MOVE_ROW_UP`, `MOVE_ROW_DOWN` (Strg+Alt+↑/↓, macOS ⌃⌥↑/↓) – **additiv** (die Union wird breiter) |
| `AriaTextsIf` / `AriaTexts` | Ansagen | – | neu `rowMoved(position, rowCount)`, `rowMoveNotPossible()`, `rowDragStarted(rowCount)` – **optional** im Interface (eine Klasse mit `implements AriaTextsIf` bricht sonst), Defaults in `AriaTexts` |
| `EventListenerIf` | D13 | `onStateChanged?` ist schon optional | neu optional `onRowDragStart?`, `onRowDragMove?`, `onRowDragEnd?` |
| `TableOptionsIf` | Optionen | Muster `overlayOptions` | neu `rowDragOptions?: Partial<RowDragOptionsIf>` |
| `TableFactory.createTableModel` | Komfort | `rowNumbersVisible` als Vorbild | neu `rowDrag?: boolean` → `rowDrag: true` an der ersten Datenspalte |
| `TableApi` | Code-Weg, WCAG 2.5.7 | – | neu `moveRows(rowIndices, target)`, `isRowDragging()`, `cancelRowDrag()` |
| Wrapper | Events | `stateChanged` als Vorbild (7 Wrapper) | `rowDragStart`, `rowDragMove`, `rowDragEnd` |
| CSS | Aussehen | – | neue Datei `css/table-row-drag.css` (landet über `table*.css` in `main.css` und im Angular-CSS), Variablen light/dark |

**Breaking Changes:** keine. Alles optional/neu; `ActionId` bekommt zwei Werte dazu (wer über `ActionId` ein
`switch` mit `never`-Prüfung schreibt, sieht zwei neue Fälle – das ist bei jeder neuen Aktion so, s. 1.1.91).

## 2. Entscheidungen

### 2.1 Griff (Frage 1) → `ColumnDef.rowDrag` + Komfort-Flag

| Option | Pro | Contra |
|---|---|---|
| **`ColumnDef.rowDrag: boolean \| (row, rowIndex) => boolean`** (Griff-Symbol in dieser Spalte) | ag-Grid-Muster, frei platzierbar, je Zeile abschaltbar (z. B. „gesperrte“ Zeilen), funktioniert in jeder Spalte – auch in der `RowNumberColumnDef` (Excel-Gefühl) | Griff teilt sich die Zelle mit dem Inhalt (Einzug 18 px) |
| eigene Griffspalte | sauber getrennt | noch eine Spalte, Index-Versatz wie bei 004 (alle Indizes +1) – teuer |
| Zeilennummer als Griff | kein Platzbedarf | koppelt zwei Features; ohne Nummern kein Ziehen |
| ganze Zeile ziehbar | groß | kollidiert mit Bereichsauswahl (D12), Textauswahl, Editoren, Zell-Komponenten |

**Empfehlung: `rowDrag` an der Spaltendefinition**; `TableFactory.createTableModel({ rows, rowDrag: true })` setzt es
an der ersten **Daten**spalte (hinter Zeilennummer und Checkbox). Wer den Griff an der Nummer will:
`new RowNumberColumnDef()` + `columnDef.rowDrag = true`. Griff = `<span class="ge-table-row-drag-handle"
data-ge-action="drag-row" aria-hidden="true">` (Punkte per CSS, kein Text, keine Bilder).

### 2.2 Modus (Frage 2) → managed (Default) und unmanaged

- **managed** (`rowDragOptions.managed`, Default `true`): Die Tabelle ruft `body.moveRows(rowIndices, target)` und
  zeichnet neu. Erlaubt nur bei **unsortierter und ungefilterter** Anzeige (D5, § 2.6). Die Reihenfolge wird **in
  place** im Zeilen-Array geändert (`getAllRows()` – bei `TableFactory.createTableModel({ rows })` das Array der
  Anwendung, wie `Array.prototype.sort`). Speichern ist Sache der Anwendung (`onRowDragEnd`, Frage 9).
- **unmanaged** (`managed: false`): nur Events, nichts wird verschoben, keine Sperre bei Sortierung/Filter. Die
  Anwendung schickt z. B. die neue Reihenfolge an den Server und ruft danach `tableApi.moveRows(…)` oder
  `setRows(…)` + `repaintHard()`.
- Veto im Einzelfall: `evt.preventDefault()` in `onRowDragStart` (kein Ziehen) oder `onRowDragMove` (Ziel ungültig).
  `onRowDragEnd` kommt managed **nach** dem Verschieben (`evt.moved`, `evt.toIndex` = echte Position) – wie bei
  ag-Grid; dort ändert `preventDefault()` nichts mehr.

```ts
// row-drag/row-drop-target.if.ts
export type RowDropPosition = "before" | "after" | "inside";   // inside = wird Kind (nur Baum)
export interface RowDropTargetIf { rowIndex: number; position: RowDropPosition }

// AreaModelIf (optional, additiv)
canMoveRows?(rowIndices: number[], target: RowDropTargetIf): boolean;
moveRows?(rowIndices: number[], target: RowDropTargetIf): boolean;   // true = verschoben
```

`rowIndices` = Anzeige-Indizes (aufsteigend, ohne Doppelte), `target.rowIndex` = Anzeige-Index der Zeile unter der
Einfügemarke **vor** dem Verschieben. Ein Ziel innerhalb der Quelle (D1-Grenzfall) ist gültig und ändert nichts.
Die Rechnung steckt in einer DOM-freien Funktion `moveArrayItems(array, indices, insertBefore)` (getestet, in place).

### 2.3 Pointer Events (Frage 3) → ja, nur für dieses Feature

`pointerdown` am Host (über `listenerAbortController`), Start nur bei `[data-ge-action="drag-row"]`, linke Taste
bzw. Touch/Stift. `preventDefault()` unterdrückt die Kompatibilitäts-Mausereignisse (`mousedown/up`) → der
`MouseHandler` sieht nichts davon, Bereichsauswahl und Spalten-Drag bleiben unverändert (D12). Während der Sitzung:
`pointermove`, `pointerup`, `pointercancel`, `keydown` (Escape) am **Dokument** (eigener `AbortController`, verkettet
mit dem der Tabelle) – Loslassen außerhalb der Tabelle beendet sauber. Kein `setPointerCapture`: der Griff wird beim
virtuellen Rendern ersetzt, die Capture ginge verloren. CSS `touch-action: none` am Griff → Touch zieht statt zu
scrollen (D10). Schwelle `dragThresholdInPx` (4 px) – ein Klick auf den Griff bleibt ein Klick (Fokus). Nach einem
echten Ziehen wird der folgende `click` einmal geschluckt (sonst setzte der `MouseHandler` Fokus/Selektion neu).

### 2.4 Geisterbild (Frage 4) → schlichter Balken mit Text

Div `ge-table-row-drag-ghost` (`aria-hidden`, `pointer-events: none`) im Host, folgt dem Zeiger (+12 px). Text =
`getTextValueAt(row, Griffspalte)`, bei mehreren Zeilen „… (+2)“; eigener Text über `rowDragOptions.ghostText(rows)`.
Immer über `textContent` → kein HTML aus Daten (Injection-Test). Begründung: eine Kopie der Zellen (wie beim
Spalten-Ziehen) müsste Renderer und Framework-Komponenten ein zweites Mal rendern, und eine Zeile ist breiter als der
Bildschirmausschnitt. Dazu: Einfügemarke `ge-table-row-drop-indicator` (2-px-Linie über die Body-Breite zwischen den
Zeilen; bei `inside` ein Rahmen um die Zielzeile, Klasse `…-inside`), gezogene Zeilen `ge-table-row-dragging`
(abgeblendet), Host-Klasse `ge-table-row-drag-active` (Cursor `grabbing` überall). Ungültiges Ziel: Marke weg,
Host-Klasse `ge-table-row-drag-invalid` (Cursor `no-drop`).

### 2.5 Auto-Scroll (Frage 5)

Rand-Zone `autoScrollZoneInPx` (40 px) an Ober- und Unterkante des Bodys; Zeiger im Header bzw. Footer = volle
Geschwindigkeit. Geschwindigkeit `max × (Eindringtiefe / Zone)²`, `autoScrollMaxSpeedInPx` = 24 px je Frame (≈ 1.400
px/s, 100.000 Zeilen à 30 px in gut 30 s – wer weiter will, zieht in Stufen oder nutzt die Tastatur/`moveRows`). Eine
`requestAnimationFrame`-Schleife läuft nur, solange der Zeiger in der Zone ist. Bei gekappter Scrollhöhe (> 10 Mio.
px) wird wie bei `onWheel` umgerechnet. **Virtual Scrolling:** Das Ziel wird nie aus DOM-Elementen gelesen, sondern
aus der Zeigerposition gerechnet (`clientY` → Inhalts-y → Zeilenindex über `getYPosByRowIndex`, Binärsuche bei
variablen Höhen). Nach jedem Scroll-Schritt wird das Ziel mit der letzten Zeigerposition neu bestimmt.

### 2.6 Sortiert/gefiltert, Baum, Gruppen (D5, D7, D8, Frage 6)

- **D5 – managed + sortiert (Spalte mit `sortState` asc/desc) oder gefiltert** (`getUnfilteredRowCount() >
  getRowCount()`): Ziehen ist **gesperrt**. Griffe bleiben sichtbar, aber `…-handle-disabled` (Cursor `not-allowed`);
  ein Versuch (Maus oder Tastatur) sagt `rowMoveNotPossible()` an („Rows cannot be moved while the table is sorted or
  filtered“) und `onRowDragStart` kommt nicht. Ein Filter, der alle Zeilen behält, sperrt nicht. Eine Sortierung per
  `api.sort(fn)` sperrt nicht (einmaliges Ordnen; danach gilt die gezogene Reihenfolge, `reSort()` vergisst `fn`).
  Unmanaged: keine Sperre (die Anwendung entscheidet).
- **D7 – Baum:** obere/untere 25 % der Zielzeile = davor/dahinter (Geschwister, gleicher Elternknoten), Mitte = `inside`
  (letztes Kind, Elternknoten klappt auf). `rowDragOptions.treeDropInside: false` → nur davor/dahinter. Zyklus
  (Ziel ist ein gezogener Knoten oder dessen Nachfahre) → `canMoveRows` false, Marke weg. Mehrere Knoten: nur die
  „obersten“ (Nachfahren eines mitgezogenen Knotens reisen mit ihm).
- **D8 – Row Grouping / Pivot:** managed **gesperrt** (`canMoveRows` false, Griffe werden in diesem Fall nicht
  gezeichnet + eine Konsolen-Warnung). Unmanaged: Detailzeilen ziehbar, Gruppenzeilen nie; die Anwendung ändert z. B.
  das Gruppierfeld und ruft `api.setRowGroupBy(api.getRowGroupBy())`. Begründung: ein Gruppenwechsel ändert Daten
  (`valueSetter`, Typen, Validierung) – das gehört der Anwendung, nicht dem Ziehen.

### 2.7 Mehrfach-Ziehen und tabellenübergreifend (Frage 7)

- **D6 – jetzt:** Ist die gegriffene Zeile Teil der Auswahl (`selectionModel.getMergedRowIndices()` enthält sie),
  werden alle Zeilen mit Auswahl gezogen, Reihenfolge bleibt (`multiRow`, Default `true`). Danach sind die verschobenen
  Zeilen ausgewählt (flach: zusammenhängend ab Zielposition), der Fokus steht auf der ersten.
- **D11 – minimal jetzt:** Zeiger außerhalb der Tabelle → `evt.outside = true`, kein Ziel, nichts verschoben; das
  End-Event trägt Zeilen und `originalEvent` (clientX/Y) – die Anwendung kann damit eine eigene Drop-Zone bedienen
  (`document.elementFromPoint`). Ein eingebautes Ziehen **in eine andere GuiExpert-Tabelle** kommt später (eigener
  Prompt, wenn gewünscht).

### 2.8 Tastatur (D9, Frage 8)

`MOVE_ROW_UP` / `MOVE_ROW_DOWN` – Strg+Alt+↑/↓ (Windows/Linux), ⌃⌥↑/↓ (macOS; ⌃↑ allein ist Mission Control). Verschiebt
die fokussierte Zeile (bzw. die ausgewählten Zeilen, wenn sie dazugehört) um eine Position; im Baum unter den
Geschwistern. Fokus wandert mit, Ansage `rowMoved(7, 20)` → „Row moved to position 7 of 20“. Gleiche Sperren und
gleiche Events wie mit der Maus (`source: "keyboard"`, `start` + `end`). Zellen mit Griff tragen
`aria-keyshortcuts="Control+Alt+ArrowUp Control+Alt+ArrowDown"`.
**WCAG:** Die Tastatur deckt 2.1.1 ab. 2.5.7 „Dragging Movements“ verlangt eine Alternative für **einen Zeiger ohne
Ziehen** – dafür gibt es `tableApi.moveRows()`; der Showcase zeigt ↑/↓-Knöpfe je Zeile. Ein eingebauter
„Aufnehmen/Ablegen per Klick“-Modus ist bewusst nicht dabei (Doku nennt das Muster).

### 2.9 Zustand (Frage 9)

Die Reihenfolge gehört den Daten → **nicht** in `TableStateIf`. `onRowDragEnd` liefert `rows`, `toIndex` und (managed)
nach dem Verschieben `tableApi.getAllRows()`-Reihenfolge; die Anwendung speichert. Selektion ändert sich →
`stateService.markDirty('selection')`.

## 3. Signaturen

```ts
// row-drag/row-drag-options.if.ts
export interface RowDragOptionsIf {
  managed: boolean;                 // true
  multiRow: boolean;                // true – alle ausgewählten Zeilen, wenn die gegriffene dazugehört
  treeDropInside: boolean;          // true – Baum: Mitte der Zeile = Kind
  dragThresholdInPx: number;        // 4
  autoScrollZoneInPx: number;       // 40
  autoScrollMaxSpeedInPx: number;   // 24 (je Frame)
  ghostText?: (rows: any[]) => string;
}

// data/common/event/ge-row-drag-event.ts
export type GeRowDragEventType = "start" | "move" | "end" | "cancel";
export class GeRowDragEvent<T = any> {
  type: GeRowDragEventType;
  source: "pointer" | "keyboard";
  rows: T[];                 // gezogene Zeilenobjekte (Baum: TreeRow, Gruppen: Detailzeile = Quellobjekt)
  rowIndices: number[];      // Anzeige-Indizes beim Start
  target?: RowDropTargetIf;  // aktuelles Ziel (undefined: keins / ungültig / außerhalb)
  toIndex: number;           // flach: Anzeige-Index der ersten Zeile nach dem Verschieben, sonst -1
  outside: boolean;          // Zeiger außerhalb der Tabelle (D11)
  managed: boolean;
  moved: boolean;            // end: die Tabelle hat verschoben (managed, nicht verhindert)
  originalEvent?: PointerEvent | KeyboardEvent;
  readonly defaultPrevented: boolean;
  preventDefault(): void;    // start: kein Ziehen · move: Ziel ungültig · end: ohne Wirkung
}

// EventListenerIf (optional)
onRowDragStart?(evt: GeRowDragEvent): void;
onRowDragMove?(evt: GeRowDragEvent): void;   // nur wenn sich das Ziel ändert, nicht je Pixel
onRowDragEnd?(evt: GeRowDragEvent): void;    // type "end" (managed: nach dem Verschieben) oder "cancel"

// ColumnDefIf / ColumnDef.create
rowDrag?: boolean | ((row: any, rowIndex: number) => boolean);

// TableOptionsIf
rowDragOptions?: Partial<RowDragOptionsIf>;

// CreateTableModelPara
rowDrag?: boolean;

// TableApi
moveRows(rowIndices: number[] | number, target: RowDropTargetIf | number): boolean; // number = davor (flach)
isRowDragging(): boolean;
cancelRowDrag(): void;

// AriaTextsIf (optional, Defaults in AriaTexts)
rowMoved?(position: number, rowCount: number): string;   // "Row moved to position 7 of 20"
rowMoveNotPossible?(): string;                           // "Rows cannot be moved while the table is sorted or filtered"
rowDragStarted?(rowCount: number): string;               // "Dragging 1 row. Press Escape to cancel."

// ActionId (additiv)
"MOVE_ROW_UP" | "MOVE_ROW_DOWN"
```

Klassen: `RowDragService` (`row-drag/row-drag-service.ts`, `@category Internals`, `tableScope.rowDragService`),
DOM-frei `moveArrayItems` + `moveTreeRows`/`canMoveTreeRows` (`row-drag/move-rows.ts`). CSS-Variablen
`--ge-table-row-drag-handle-color`, `--ge-table-row-drop-indicator-color`, `--ge-table-row-drag-ghost-bg|-text|-border`,
`--ge-table-row-dragging-opacity` (light + dark).

## 4. Beispiele (Video-tauglich)

**D1 managed – Prioritätenliste**
```ts
const tableModel = TableFactory.createTableModel({ rows: tasks, rowDrag: true });
const tableOptions: TableOptionsIf = { ...new TableOptions() };
const listener = new EventAdapter();
listener.onRowDragEnd = (evt: GeRowDragEvent<Task>) => console.log(`${evt.rows[0].title} → position ${evt.toIndex + 1}`);
new TableScope(host, tableModel, new SimpleDomService(), tableOptions, listener).firstInit();
```
Erwartung: Griff in Zeile 3 (Index 2) ziehen, zwischen 7 und 8 loslassen → `tasks[6]` ist die gezogene Aufgabe,
Konsole „… → position 7“.

**D1 unmanaged – Reihenfolge an den Server**
```ts
const tableOptions: TableOptionsIf = { ...new TableOptions(), rowDragOptions: { managed: false } };
const listener = new EventAdapter();
listener.onRowDragEnd = async (evt: GeRowDragEvent<Task>) => {
  if (evt.type !== "end" || !evt.target) return;
  await fetch("/api/tasks/order", { method: "POST", body: JSON.stringify({ ids: evt.rows.map(r => r.id), toIndex: evt.toIndex }) });
  tableApi.moveRows(evt.rowIndices, evt.target);
};
```

**D9 Tastatur:** Zelle fokussieren, Strg+Alt+↓ → Zeile eine Position tiefer, Ansage „Row moved to position 4 of 20“.

## 5. Website, Training, Demo-Repo, Video

- **Demo-Modelle:** `createRowDragTableModel()` (Prioritätenliste, fester Inhalt) in `@guiexpert/demo-table-models`.
- **`apps/table-demo`:** `row-drag.html` (managed, Baum, Tastatur, Log der Events).
- **Website:** Showcase `rowdrag` (Prioritätenliste mit ↑/↓-Knöpfen als 2.5.7-Alternative, Event-Log),
  Feature-Liste, Vergleichstabelle (Row Dragging ist bei ag-Grid Community → kein „ohne Enterprise“).
- **Training:** **Abschnitt** „Dragging rows into order“ im Kapitel 23 `events-and-context-menu` (mit
  `<Callout type="version">`, Live-Demo `training/demos/row-drag.ts`), **kein** eigenes Kapitel. Begründung: Kapitel 38
  ist in `TODO.md` schon für `formulas` (008, Training offen) vorgesehen – ein Kapitel 38 `row-drag` würde diese Planung
  und die Tags verschieben; die Events (`onRowDragEnd`) passen zum Kapitel, die Anleitung steht vollständig in
  `instructions.md` 6.16. Damit entfällt Phase 8 (Demo-Repo) für 009.
- **Angular-Demo:** nach dem Release (nutzt npm-Pakete, wie bei 003–008).
- **Video:** `videos/09-zeilen-ziehen/` „Zeilen per Drag & Drop sortieren – mit Tastatur und Touch“ (60 s).
  Kein „ohne Enterprise-Lizenz“ (bei ag-Grid Community).

## 6. Bewusst nicht dabei

- Ziehen in eine andere GuiExpert-Tabelle (D11 nur als Event mit `outside`).
- Gruppenwechsel per Ziehen (D8 managed gesperrt).
- Ein eingebauter Klick-Aufnehmen/Ablegen-Modus (2.5.7 über `moveRows` + eigene Knöpfe).
- Animation der verschobenen Zeilen.

## 7. Abschluss-Review (separater Agent, 15.10.2026) und Folgen

Ein Agent, der den Code nicht geschrieben hat, hat Bereichsauswahl/Spalten-Drag, Auto-Scroll, Tastatur, Touch, managed
Move, Lebenszyklus und API geprüft. Ohne Befund: Konflikte mit Bereichsauswahl und Spalten-Drag, Klick nach dem Ziehen,
Listener-Lebenszyklus, HTML-Injection, Wrapper, Rückwärtskompatibilität, Zyklus-Schutz im Baum. Behoben:

| Befund | Behebung |
|---|---|
| 200.000 gezogene Zeilen: `splice(…, ...items)` sprengt das Argument-Limit mitten im Verschieben, O(k·n) | `moveArrayItems` in einem Durchlauf (O(n), kein Spread), `Math.min(...)` ersetzt; eine Auswahl-Range statt einer je Zeile |
| große Auswahl: `includes` je gezeichneter Zelle, Normalisieren je Zieländerung | `Set` in der Sitzung, `normalizeRowIndices` ohne Kopie, wenn schon normalisiert |
| `cancelRowDrag()`/`destroy()` aus einem Listener: TypeError bzw. hängende Sitzung | nach jedem Listener-Aufruf prüfen, ob die Sitzung noch dieselbe ist |
| Baum: „hinter“ einem aufgeklappten Knoten landete hinter dem ganzen Teilbaum, die Marke stand direkt darunter | wird zu „vor dem ersten Kind“ (dort steht die Marke) |
| `api.moveRows` schrieb eine sortierte Anzeige stillschweigend als neue Reihenfolge | `false`, solange eine Spalte sortiert ist (auch unmanaged) |
| Auto-Scroll bei gekappter Scrollhöhe < 1 px/Frame blieb stehen; 120 Hz doppelt so schnell | Rest-Bruchteile werden mitgenommen, Geschwindigkeit je 60-Hz-Frame nach echter Frame-Zeit |
| Ziehen bei offenem Editor (Editor hängt am Zeilenindex) | kein Ziehen während des Editierens |
| Ablegen an derselben Stelle meldete `moved: true` und löschte die Auswahl | kein Verschieben, `moved: false` |
| keine Neuzeichnung, wenn das Modell ablehnt; Marke veraltet beim Mausrad | Repaint bei jedem Nicht-Verschieben; `scroll`-Listener während der Sitzung |
| Doppelklick auf den Griff öffnete den Editor | `dblclick` am Griff wird abgefangen |
| keine Ansage bei Escape | `AriaTextsIf.rowDragCancelled?` („Drag cancelled“) |
| Strg+Alt+↑/↓ kollidiert mit NVDA/JAWS (Browse-Modus) und Desktop-Tasten | dokumentiert (instructions.md 6.16), umbelegbar über `shortcutActionIdMapping`; `aria-keyshortcuts` bleibt fest → Folgepunkt in `TODO.md` |
