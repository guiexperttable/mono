# Design 013: Tabellenkalkulation – ein Excel-ähnliches Grid

> Status: **Entwurf, Etappe 0** (16.10.2026), nach unabhängigem Review überarbeitet (38 Befunde, § 13) – 🛑 wartet auf
> Freigabe.
> Auftrag: `prompts/013-tabellenkalkulation.md`. Ein Design für alle fünf Teile; Umsetzung in Etappen 1–8 (Abschnitt 12
> „Fortschritt“). Zielversion: jede Etappe die nächste Patch-Version zum Zeitpunkt ihres Merges (Stand: 1.1.98 →
> Etappe 1 = **1.1.99**). `since`-Angaben werden je Etappe eingetragen, nicht vorab.
> Grundlage: Code-Stand `main` @ `040f4b8` (Release 1.1.98 + Website-Feature-Sichtbarkeit).

---

## 0. Kurzfassung – die zehn Entscheidungen, um die es geht

| # | Frage | Empfehlung |
|---|---|---|
| K1 | Wie schaltet man es ein? | Je Teil eine Option (`editing`, `clipboard`, `undo`, `cellFormulas`), alle aus; Preset `spreadsheet: true` schaltet alle ein; `SpreadsheetFactory` für ein leeres Blatt |
| K2 | Wo lebt der Editor? | **Ein** dauerhaftes Editor-Element im Host über der Zelle (wie Fill-Handle), nicht mehr im Zell-DOM |
| K3 | Tippen, IME, Zwischenablage | **Spike zuerst** (Etappe 1/2): Host-`keydown` öffnet den Editor, Kopieren/Einfügen über Host-Events; wo ein Browser das nicht kann (IME am nicht editierbaren Host, Safari-`paste`), ein verstecktes Textfeld – Variante und ARIA-Folgen werden nach dem Spike entschieden (🛑) |
| K4 | Enter, Tab | Enter bearbeitet (wie Google Sheets), Enter im Editor übernimmt und geht nach unten; Tab geht nach rechts, in der **letzten Spalte verlässt Tab die Tabelle** (keine Tastaturfalle) |
| K5 | Auswahl beim Navigieren | Mit `editing`: Pfeil/Klick markiert die aktive Zelle (Excel); Shift+Pfeil erweitert ab dem Anker |
| K6 | Zellformeln: wo gespeichert? | In den Daten der Anwendung als Text `"=B2*C2"` (Speichern = Daten speichern); Formeltexte umgehen `editInputPipe` und `validate` |
| K7 | Adressen | A1 = **physische** Zeile (`getAllRows()`-Reihenfolge, sichtbar mit Zeilennummern `original`) × Datenspalte in Erzeugungsreihenfolge; Sortieren/Filtern sind nur Sichten |
| K8 | Engine | Eigene, DOM-freie `SheetEngine` (0 Abhängigkeiten, auch ohne Tabelle nutzbar), Graph mit Bereichs-Knoten, **sofortige** iterative Neuberechnung der abhängigen Zellen |
| K9 | Datum in Formeln | Intern Excel-Seriennummer mit Datums-Kennung (`=A2+1` = nächster Tag), nach außen JS-`Date` |
| K10 | Formelleiste | Kleine optionale Klasse `FormulaBar` im Core (plain DOM), in jedem Framework nutzbar – bewusste Ausnahme von „UI gehört der Anwendung“ |

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `TableScope.initRenderEditor` / `RenderScope.addAndRenderCellDiv` | Editor öffnen/zeichnen | Editor = Zell-Renderer, bei jedem Repaint neu gebaut, Fokus erzwungen | neuer `CellEditorService` mit Host-Element; alter Weg bleibt für `getEditRenderer` |
| `InputCellRenderer`, `SelectCellRenderer` | eingebaute Editoren | Inline-`onfocus` (CSP), Text immer markiert | `onfocus` → `addEventListener` (für alle, auch ohne Option) |
| `InputHandler` | `change`/Escape | übernimmt nur per `change` | bleibt für den alten Weg; neuer Weg über `CellEditorService` |
| `ShortcutService`, Mappings, `harmonizeShortcut` | Tasten | kein Shift/Strg+Pfeil, Tab, Entf; `ctrl+x`/`meta+x` = `DESELECT_ALL`; macOS `⌘↑/↓` = erste/letzte Zelle; `findEntity` nimmt den **ersten** passenden Schlüssel – ein späteres Mapping mit anderer Schreibweise (`meta+arrowleft` vs. `meta+left`) überschreibt nicht | **Mapping-Schichten**: System → Feature-Schichten (nur bei eingeschalteter Option) → `shortcutActionIdMapping`; Schlüssel werden beim Zusammenführen **harmonisiert** (behebt das Überschreiben auch für Anwender-Mappings) |
| `SelectionService` | Anker | Anker = letztes Maus-Event (`previousEvt`, `anchorRanges`) | Anker als Zelle (`setAnchor`, `getAnchor`), von Maus **und** Tastatur gesetzt |
| `TableScope.changeFocusCell` | Pfeile | bewegt nur den Fokus, Auswahl bleibt | mit `editing.collapseSelectionOnNavigate`: Auswahl = aktive Zelle |
| `FillHandleService`, `getBodyCellRectInHost`, `afterRenderPass` | Host-Elemente über Zellen | passt genau | Muster für Editor, Ausschneide-Rahmen, Formel-Bezugsrahmen |
| `TableScope.applyCellChanges` / `writeCellsInternal` | eine Schreibstelle | passt; `oldValue` = `getValueAt` | additiv `oldInput`/`newInput` für Formelzellen; Aufzeichnung für Undo |
| `CellChangeSource` | Quelle im Event | `"edit" \| "fill" \| "commit" \| "api"` | + `"clear" \| "paste" \| "cut" \| "undo" \| "redo" \| "structure"` |
| `TableOptions.getEditRenderer` | Default-Editor | **immer gesetzt** (`() => new InputCellRenderer()`), auch bei `{ ...new TableOptions() }` | der neue Editor erkennt diesen Default (exportierte Konstante `DEFAULT_GET_EDIT_RENDERER`, Identität) und ersetzt ihn mit `editing` |
| `AbstractAreaModel.setValue`, `AreaModelArrayOfArrays.setValue` | Schreiben | wenden `editInputPipe` **selbst** an | neuer optionaler Weg `AreaModelIf.setInputAt?(row, col, input)` ohne Pipe (Formeln, Undo, internes Einfügen) |
| `api.addRows`/`addRowsAt`/`removeRows`, `moveRows`, `MOVE_ROW_UP/DOWN`, `bodyModel.setRows` | Zeilen ändern | ändern physische Zeilen ohne Meldung an `TableScope` | im Sheet-Modus umgeleitet bzw. gesperrt; Erkennung über `AreaModelIf.getStructureVersion?()` (§ 6.9) |
| `BatchEditService`, `PendingCellChanges` | Batch | Zuordnung über Zeilenobjekt | Undo im Batch arbeitet auf den vorgemerkten Werten |
| `CopyService` | Kopieren | TSV aus `getTextValueAt`, **ohne Quoting**, mehrere Bereiche → umschließendes Rechteck (`mergeRanges`), `navigator.clipboard.writeText`; `COPY_2_CLIPBOARD` wird nicht verbraucht (`onActionTriggered` → `false`) | `toTsv` mit Quoting; neuer `ClipboardService` für Copy/Cut/Paste über Proxy-Textfeld; `CopyService` bleibt für `api.copyToClipboard()` |
| `formula/` (008) | Ausdrücke | AST `literal/field/unary/binary/call`, Closures, `FormulaError`, Datum = ms; unäres Minus schwächer als `^` (`-2^2 = -4`), Strings auch in `'…'` mit `\`-Escapes, `compareValues` vergleicht Zahltext als Zahl, `numberResult` rundet **nicht** | **additiv**: Knoten `ref`, `range`, `error`; mit `references: true` Excel-Regeln (§ 6.3); ohne bleibt 008 bit-gleich |
| `ColumnValues` / `getValueByT` | eine Auswertungsstelle | passt | fragt im Sheet-Modus zuerst die Engine (Formelzelle) |
| `AreaModelObjectArray` / `AreaModelArrayOfArrays` | Datenhalter | `getAllRows()` bzw. `arr` bleibt beim Sortieren stabil; Row Drag schreibt in place | Adapter `SheetDataSourceIf`; Row Drag im Sheet-Modus aus |
| `RowNumberColumnDef` (004) | Zeilennummern | `original` zählt nach `getAllRows()` (müsste ein dünnes Blatt materialisieren) | Standard im Sheet-Modus; neues optionales `AreaModelIf.getPhysicalRowIndex?(displayIndex)` hat Vorrang |
| `ExcelService` | Export | Werte, Zahlenformate, ISO-Text für Datum | additiv `<f>` + `<v>` (`ExcelFormulaCellIf`) |
| `EventListenerIf` | Events | neue Events optional | + `onEditingChanged?`, `onUndoStackChanged?` |
| `TableApi` | Fassade | keine Abo-Möglichkeit für weitere Listener | + `subscribe(listener)` (für `FormulaBar` und Apps) |
| `AriaTextsIf` | Ansagen | optionale Funktionen ab 1.1.95 | + Texte aus § 2.9 |

**Breaking Changes:** keine. Alles additiv; neue Tastenbelegungen nur, wenn die jeweilige Option an ist. Einzige
Typ-Erweiterung mit Außenwirkung: `CellChangeSource` bekommt neue Werte (ein erschöpfendes `switch` beim Anwender
meldet sie) → Release-Notes. Drei Änderungen gelten auch ohne Option: Textverlust beim Repaint, CSP (§ 3.11) und das
Harmonisieren der Mapping-Schlüssel (ein Anwender-Mapping `"meta+arrowleft"` überschreibt jetzt wirklich `"meta+left"`
– bisher gewann still das System; Release-Notes).

**Größe:** `dist/index.js` heute 827 KB, gzip 210 KB. Schätzung nach Etappe 7: +90–130 KB (gzip +25–35 KB), davon
Engine + Funktionen ~60 %. Das Paket hat kein `sideEffects`-Feld, Tree-Shaking greift beim Anwender also kaum. Vorschlag:
messen je Etappe, `"sideEffects": ["*.css"]` als eigener Punkt in `TODO.md` (Packaging, eigenes Risiko) – nicht hier.

---

## 2. Gemeinsame Entscheidungen

### 2.1 Optionen-Schnitt (K1)

```ts
// TableOptionsIf, alle optional, alle aus (Default undefined):
editing?: boolean | Partial<EditingOptionsIf>;          // Teil 1
clipboard?: boolean | Partial<ClipboardOptionsIf>;      // Teil 2
undo?: boolean | Partial<UndoOptionsIf>;                // Teil 3
cellFormulas?: boolean | Partial<CellFormulaOptionsIf>; // Teil 4 (Name ≠ ColumnDef.formula aus 008)
spreadsheet?: boolean | Partial<SpreadsheetOptionsIf>;  // Teil 5: Preset
```

Muster wie `fillHandle`/`batchEdit`: `true` = Defaults, Objekt = Teil-Überschreibung; je Option eine Klasse
`XyzOptions.create(value): XyzOptionsIf | undefined`. **Preset** `spreadsheet: true` setzt `editing`, `clipboard`, `undo`,
`cellFormulas`, `fillHandle` ein. **Zusammenführen:** `false` des Anwenders schaltet einen Teil aus; ein Objekt wird
**über** die Preset-Werte gelegt (`editing: { enterKey: "moveDown" }` behält also `defaultEditable: true` aus dem
Preset); fehlt der Teil, gelten die Preset-Werte. Ohne eigenes `getSelectionModel` liefert das Preset ein
`SelectionModel("range", "multi")` (ein Fokusmodell gibt es heute schon als Default). Modelle (Spaltenbuchstaben,
Zeilennummern) kann ein Preset nicht ändern → `SpreadsheetFactory` bzw. `TableFactory.createTableModel({ columnLetters })`
(§ 7).

### 2.2 Änderungssatz (K: Teil 2/3/4)

- `CellChangeSource = "edit" | "fill" | "commit" | "api" | "clear" | "paste" | "cut" | "undo" | "redo" |
  "structure"` (`"structure"` = Zeilen/Spalten eingefügt oder gelöscht, Teil 5; `GeModelChangeEvent.structure?` beschreibt es).
- `CellChangeIf` additiv: `oldInput?: unknown; newInput?: unknown;` – nur gesetzt, wenn die Eingabe vom Wert abweicht
  (Formelzelle: `oldInput = "=B2*C2"`, `oldValue = 2598`). Undo nutzt `input ?? value`.
- Ausschneiden = **ein** `applyCellChanges`-Aufruf mit Ziel- und Quellzellen (Quelle → Leerwert), ein Event `"cut"`.
- Für strukturelle Vorgänge (Teil 5) und Undo: Befehlsmuster (§ 5.1); `UndoableIf.source` ist ebenfalls eine
  `CellChangeSource` (strukturell = `"structure"`).
- **Zwei Schreibwege** in `writeCellsInternal`: *Eingabe* (heute: `editInputPipe` + `validate` + `setValue`) und
  *roh* (`setInputAt` ohne Pipe und Validierung – Fallback `setValue`, wenn das Modell `setInputAt` nicht kennt). Roh
  schreiben: Formeltexte (`=…`, `'=…`, § 6.1), `"undo"`/`"redo"` (der gespeicherte Wert ist schon gepipt; eine nicht
  idempotente Pipe würde ihn verfälschen) und internes Einfügen der Eingaben (§ 4.2).
- Formel-Verschiebung (Fill, Einfügen, Strg+Enter) rechnet Δ aus den **physischen** Zeilen je Zielzelle, nicht aus den
  Anzeige-Zeilen (sonst landet `=B2*C2` nach dem Sortieren auf der falschen Zeile).

### 2.3 Tastenbelegung (K4, K5) – Schichten

`ShortcutService` baut das Mapping in dieser Reihenfolge (spätere gewinnen):
1. System (Windows bzw. macOS, wie heute),
2. **Feature-Schichten**, nur bei eingeschalteter Option: `editing`, `clipboard`, `undo`,
3. `tableOptions.shortcutActionIdMapping` (Anwender).

Neue `ActionId`s (additiv): `NAVIGATE_NEXT_CELL`, `NAVIGATE_PREVIOUS_CELL` (Tab), `EXTEND_SELECTION_UP/DOWN/LEFT/RIGHT`,
`NAVIGATE_DATA_EDGE_UP/DOWN/LEFT/RIGHT`, `EXTEND_TO_DATA_EDGE_UP/DOWN/LEFT/RIGHT`, `EXTEND_SELECTION_ROW_START/END`,
`EXTEND_SELECTION_PAGE_UP/DOWN`, `SELECT_ROW`, `SELECT_COLUMN`, `CLEAR_CELLS`, `CLEAR_AND_EDIT`, `CUT_2_CLIPBOARD`,
`PASTE_FROM_CLIPBOARD`, `UNDO`, `REDO`.

| Taste (Windows) | macOS | Schicht | Aktion | Bemerkung |
|---|---|---|---|---|
| Buchstabe/Ziffer/Satzzeichen | gleich | editing | Editor „Eingeben“ mit dem Zeichen | kein `ActionId`, direkt im `CellEditorService` (vor dem Mapping) |
| F2 | F2 | System | `START_EDITING` | im Editor: Modus wechseln |
| Enter | Enter | editing | `START_EDITING` (statt `ACTIVATE_CELL`) | Checkbox/Baum/Gruppe/Detail: weiter `ACTIVATE_CELL`; **im Kopf** wird es als `ACTIVATE_CELL` behandelt (sortieren/klappen wie heute); Option `enterKey: "moveDown"` = Excel |
| Tab / Shift+Tab | gleich | editing | `NAVIGATE_NEXT/PREVIOUS_CELL` | letzte/erste Spalte: **nicht** verbraucht → Fokus verlässt die Tabelle |
| Shift+Pfeile | gleich | editing | `EXTEND_SELECTION_*` | |
| Strg+Pfeile | ⌘+Pfeile | editing | `NAVIGATE_DATA_EDGE_*` | überschreibt auf macOS `⌘←/→/↑/↓` (heute Zeilenanfang/-ende, erste/letzte Zelle) – Excel für Mac macht es so; ⌃+Pfeile belegt macOS (Spaces), daher nicht |
| Strg+Shift+Pfeile | ⌘+Shift+Pfeile | editing | `EXTEND_TO_DATA_EDGE_*` | |
| Shift+Pos1/Ende, Shift+Bild↑/↓ | Shift+Fn+… | editing | `EXTEND_SELECTION_ROW_START/END`, `…_PAGE_UP/DOWN` | |
| Shift+Leertaste / Strg+Leertaste | gleich / ⌃+Leertaste | editing | `SELECT_ROW` / `SELECT_COLUMN` | vom Lostippen **ausgenommen** (Leertaste mit Shift/Strg); ⌃+Leertaste ist auf macOS oft die Eingabequelle – Ersatz in Etappe 1 festlegen |
| Leertaste | gleich | editing | Editor „Eingeben“ mit Leerzeichen | **bewusste Abweichung von E13** (dort: Leertaste bleibt `TOGGLE_SELECTION`): Excel und Sheets tippen ein Leerzeichen. `TOGGLE_SELECTION` bleibt auf Checkbox-Spalte, Zeilennummer (Zeile markieren) und Boolean-Spalte (umschalten) |
| Entf | Fn+⌫ | editing | `CLEAR_CELLS` | ganze Auswahl |
| Rücktaste | ⌫ | editing | `CLEAR_AND_EDIT` | eine Zelle: leeren + Editor; Bereich: wie Entf (Mac-Tastaturen haben kein Entf) |
| Strg+Enter (im Editor) | ⌘+Enter | editing | in alle markierten Zellen schreiben | |
| Strg+C | ⌘+C | clipboard | `COPY_2_CLIPBOARD` – `copy`-Event, Variante nach Spike (§ 2.10) | |
| Strg+X | ⌘+X | clipboard | `CUT_2_CLIPBOARD` | überschreibt `DESELECT_ALL` nur in dieser Schicht; `DESELECT_ALL` bleibt auf Strg/⌘+Shift+A |
| Strg+V | ⌘+V | clipboard | `PASTE_FROM_CLIPBOARD` – `paste`-Event, Variante nach Spike | |
| Strg+Z / Strg+Y, Strg+Shift+Z | ⌘+Z / ⌘+Shift+Z | undo | `UNDO` / `REDO` | im offenen Editor: Text-Undo des Browsers |
| Strg+D, Strg+R | ⌘+D, ⌘+R | (010) | `FILL_DOWN/RIGHT` | unverändert |

Tasten in Formularfeldern **eigener** Renderer bleiben unberührt (wie heute). RTL: ←/→ werden vorher gespiegelt (012).
Tippen, Entf und Rücktaste wirken nur im Body (nicht bei Header-Fokus).

**Browser-Kürzel:** nie verbraucht werden Strg/⌘+T, +W, +N, +L, +Tab, +Q, F5, F6, F11, F12. Strg/⌘+D (Lesezeichen) und
Strg/⌘+R (Neu laden) nur mit Fill-Handle und markiertem Bereich (wie heute). Strg/⌘+Z/Y nur, wenn der Host fokussiert
ist und `undo` an ist. Strg/⌘+F bleibt beim Browser (keine Suche in v1). Strg/⌘+A wie heute.

### 2.4 Editor-Architektur zuerst (K2) – Details § 3.2

Teil 4C (Zeigemodus, farbige Bezüge, Vorschläge) setzt auf `CellEditorIf.insertText`/`getCaret` und das Host-Element auf.

### 2.5 Roh-, Eingabe- und Anzeigewert

| Begriff | Bedeutung | Quelle |
|---|---|---|
| **Wert** (`value`) | was Sortieren, Filter, Summen, Excel-Werte nutzen | `getValueAt` (Formelzelle: Ergebnis) |
| **Eingabe** (`input`) | was der Anwender getippt hat bzw. im Editor/der Formelleiste steht | neues optionales `AreaModelIf.getInputValueAt?(row, col)`; ohne = Wert |
| **Text** (`text`) | angezeigter Text | `getTextValueAt` / Renderer |

Name `getInputValueAt`, weil `AreaModelTree.getRawValueAt` (008) schon „vor Show values as“ bedeutet. Editor, Formelleiste,
internes Kopieren und Undo arbeiten mit der **Eingabe**; externes Kopieren mit Text (+ Zahl im HTML, § 4).

### 2.6 Grenzen des Sheet-Modus (`cellFormulas` an)

| Feature | im Sheet-Modus | Grund |
|---|---|---|
| Baum, Row Groups, Pivot, Master/Detail | aus (Warnung, Formeln inaktiv) | keine flache physische Zeile |
| Row Drag (009) | aus (Griff `…-disabled`, Ansage) | würde physische Zeilen verschieben → Bezüge umschreiben; später |
| Sortieren, Filter | erlaubt, reine Sicht | Bezüge hängen an physischen Zeilen (K7) |
| Spalten-Drag | Objekt-Arrays: erlaubt; Array-of-Arrays und `AreaModelSheet`: aus | Buchstabe hängt an der Property und wandert mit; Arrays verschieben Spalten physisch (§ 6.2) |
| Spalten ausblenden | erlaubt | Buchstaben bleiben (wie Excel) |
| Batch-Edit | erlaubt | vorgemerkte Formeln rechnen erst nach Commit (Anzeige: Eingabetext + Markierung) |
| Fill-Handle | erlaubt | Formel-Quellen werden verschoben (§ 6.12) |
| `setRows()` | erlaubt | neues Blatt: Engine neu aufbauen, Undo-Verlauf leeren (dokumentieren: strukturelle Änderungen über `insertRows`/`deleteRows`) |
| `api.addRows`/`addRowsAt`/`removeRows` | umgeleitet auf `insertRows`/`deleteRows` (Bezüge werden angepasst) | sonst verschieben sich physische Zeilen ohne Anpassung |
| `api.moveRows`, `MOVE_ROW_UP/DOWN` | aus (wie Row Drag) | dito |
| `bodyModel.setRows()` direkt, Daten von außen geändert | erkannt über `AreaModelIf.getStructureVersion?()` (Zähler, den `setRows`/`moveRows`/Strukturänderungen hochzählen) bzw. Identität und Länge von `getAllRows()` → Engine neu aufbauen, Undo leeren; sonst `api.recalculate()` | `bodyModel.setRows` meldet heute nichts an `TableScope` |
| Mehr als 1 048 576 Zeilen bzw. 16 384 Spalten | Bezüge erlaubt (Zeilen bis `Number.MAX_SAFE_INTEGER / 16384`); Excel-Export mit Formeln nur innerhalb der Excel-Grenzen, sonst Werte + Warnung | Excel-Limit |

Ohne `cellFormulas` gelten Teil 1–3 für **alle** Modelle (auch Baum/Gruppen: dort schreiben sie wie heute nur
Editierbares).

### 2.7 Events und Wrapper

| Event | Etappe | Inhalt | Wrapper-Name |
|---|---|---|---|
| `onEditingChanged?(GeEditEvent)` | 1 | `type: "start" \| "input" \| "commit" \| "cancel"` (`input` = Text geändert, für die Formelleiste), `rowIndex`, `columnIndex`, `mode: "enter" \| "edit"`, `input?` | `editingChanged` |
| `onUndoStackChanged?(GeUndoEvent)` | 3 | `canUndo`, `canRedo`, `undoLabel?`, `redoLabel?`, `size` | `undoStackChanged` |

Kein eigenes Clipboard-Event (Einfügen meldet `onModelChanged` mit `source: "paste"`; Eingriffe über
`clipboard.processPaste/processCopy`). Kein Neuberechnungs-Event (abgeleitete Werte, wie berechnete Spalten); wer sie
braucht: `api.subscribe({ onModelChanged })` + `api.getSheetValue`. Alle sieben Wrapper bekommen die Events in den
Etappen 1 und 3, Smoke-Tests React + Web Component (Svelte 4 und 5 laufen mit).

**`api.subscribe(listener: Partial<EventListenerIf>): () => void`** (Etappe 1, additiv): weitere Listener neben dem
Konstruktor-Listener; nötig für `FormulaBar` (Teil 5) und praktisch für Apps (Werkzeugleisten). Aufruf nach dem
Haupt-Listener, Abmelden per Rückgabe, `destroy()` meldet alle ab.

### 2.8 Wo die Teile im Code liegen

| Ordner | Inhalt | DOM |
|---|---|---|
| `sheet-editing/` | `EditingOptions`, `CellEditorService`, `editors/` (Text, Number, Select, Date), `sheet-navigation.ts` (`findDataEdge`) | ja / `sheet-navigation` nein |
| `clipboard/` | `ClipboardOptions`, `ClipboardService` (Events, ggf. Proxy), `tsv.ts`, `paste-plan.ts`, `clipboard-html.ts` | Service ja, Rest nein |
| `undo/` | `UndoOptions`, `UndoStack`, `UndoService`, `CellChangesUndoable` | Stack nein |
| `sheet/` | `cell-address.ts`, `SheetEngine`, `dependency-graph.ts`, `range-index.ts`, `shift-formula.ts`, `sheet-functions/*.ts`, `sheet-date.ts`, Adapter | nein |
| `sheet-ui/` | Zeigemodus, Bezugsrahmen, Vorschlagsliste | ja |
| `spreadsheet/` | `SpreadsheetFactory`, `AreaModelSheet`, `AreaModelSheetHeader`, `FormulaBar`, `SpreadsheetOptions` | Bar ja |

CSS je Teil: `css/table-sheet-editing.css`, `table-clipboard.css`, `table-sheet-formulas.css`, `table-spreadsheet.css`
(+ Website-Kopie). typedoc-Kategorie neu: **„Spreadsheet“** (Reihenfolge nach „Editing“).

### 2.9 ARIA-Texte (`AriaTextsIf`, alle optional, englische Defaults)

`editingStarted?(columnLabel)` („Editing Price“), `readOnlyCell?()` („Read only“), `cellsCleared?(n)`,
`cellsPasted?(n, skipped)`, `pasteTooLarge?(max)`, `cutMarked?(n)`, `undone?(label, n)`, `redone?(label, n)`,
`nothingToUndo?()`, `formulaError?(code, message)`, `formulaSuggestions?(n)`, `rowsInserted?(n)`, `rowsDeleted?(n)`,
`columnsInserted?(n)`, `columnsDeleted?(n)`, `rangeSelected?(address, cellCount)` (Shift+Pfeil: der Fokus bleibt am Anker,
also wird der Bereich angesagt, z. B. „B3:C6, 8 cells“), `rowSelected?(n)`, `columnSelected?(letter)`,
`copiedLastRangeOnly?()`, `undoSkipped?(n)` (Undo mit übersprungenen Zellen), `clearTooLarge?(max)`.
Neu im DOM: `aria-readonly="true"` an nicht editierbaren Body-Zellen, sobald `editing` an ist (APG-Grid mit Editieren);
Grid `aria-description` nennt mit `editing` die Bedienung („Type to edit, Enter to commit, Tab leaves at the last
column“, über `AriaTextsIf.gridEditingHint?()`).

### 2.10 Tastatur-Senke und Zwischenablage (K3) – Spike zuerst

**Befund:** Solange ein nicht editierbares `div` den Fokus hat, schalten viele IMEs (Windows MS-IME, macOS Japanisch,
in Chrome und Safari) gar nicht erst ein – der erste `keydown` kommt als lateinisches `"k"`, nicht als `"Process"`; es
entstünde „kあ“ statt „か“. Safari feuert außerdem `paste` (und `copy` ohne Textauswahl) nicht zuverlässig auf ein
solches `div`. Google Sheets und Handsontable halten deshalb dauerhaft ein verstecktes Textfeld fokussiert – das aber
verschiebt den Grid-Fokus (`aria-activedescendant` am Host, Prompt 001).

**Vorgehen:** Etappe 1 beginnt mit einem **Spike** (Testseite `apps/table-demo/sheet-editing-spike.html`, Protokoll im
Abschnitt „Fortschritt“), Matrix: Chrome, Firefox, Safari × Latein, deutsche tote Tasten (`^`, `´`, `` ` ``), Japanisch
(macOS), MS-IME/Chinesisch (Windows) × Kopieren, Ausschneiden, Einfügen (Tastatur und Browser-Menü) × VoiceOver/NVDA.
Zwei Varianten:

| Variante | Fokus | Tippen/IME | Zwischenablage | ARIA |
|---|---|---|---|---|
| **A** (bevorzugt) | Host wie heute | `keydown` öffnet den Editor; tote Tasten (`key === "Dead"`) öffnen ihn ebenfalls leer und ohne `preventDefault` | `copy`/`cut`/`paste` am Host; nur wo nötig ein Proxy-Textfeld, das **nur** für den Tastendruck den Fokus bekommt (mit Platzhaltertext markiert, Inhalt per `clipboardData.setData` im Event – kein Megabyte-TSV im `textarea`) | unverändert; prüfen, ob die kurze Fokus-Rückgabe eine erneute Ansage auslöst |
| **B** | dauerhaft ein verstecktes `textarea` im Host | Komposition beginnt sofort richtig | Events am Textfeld | Grid-Fokus muss ans Textfeld (`aria-activedescendant` dort, Rolle/Name klären) – neue Barrierefreiheits-Entscheidung |

**Entscheidung nach dem Spike** (🛑 kurzer Haltepunkt in Etappe 1, nicht vorab): A, wenn IME und Einfügen in allen
drei Browsern gehen; sonst B (oder A + dokumentierte Einschränkung, wenn nur ein Randfall scheitert). Was für das
Einfügen gilt, prüft Etappe 2 noch einmal mit echten Excel-/Sheets-Inhalten.

---

## 3. Teil 1 – Excel-Bedienung (Etappe 1)

### 3.1 Optionen

```ts
/** @category Spreadsheet */
export interface EditingOptionsIf {
  startOnType: boolean;                    // true – druckbare Taste öffnet den Editor („Eingeben“)
  enterKey: "edit" | "moveDown";           // "edit" (Google Sheets); "moveDown" = Excel
  enterMoves: "down" | "right" | "none";   // "down" – nach Enter im Editor
  tabMoves: boolean;                       // true – Tab/Shift+Tab übernehmen und gehen weiter
  arrowKeysCommit: boolean;                // true – im „Eingeben“-Modus übernehmen Pfeile
  textSelection: "all" | "end";            // "all" – Enter/Doppelklick markieren den Text; F2 immer "end"
  clearKeys: boolean;                      // true – Entf/Rücktaste
  ctrlEnterFillsSelection: boolean;        // true
  collapseSelectionOnNavigate: boolean;    // true – Pfeil/Klick markiert die aktive Zelle (Excel)
  emptyValue: unknown;                     // "" – Wert beim Leeren (je Spalte: ColumnDef.emptyValue)
  defaultEditable: boolean;                // false; true = Spalten ohne eigenes `editable` sind editierbar (Preset: true)
}
```

`ColumnDef.create({ …, editor, emptyValue })` additiv (§ 3.2). `defaultEditable`: heute ist eine Spalte ohne `editable`
nicht editierbar (`AbstractAreaModel.isEditable` → `false`); mit der Option setzt `TableScope` ein Flag am Body-Modell
(`AbstractAreaModel.defaultEditable`, additiv), berechnete Spalten ohne `valueSetter`, Zeilennummern, Checkbox- und
Gruppenspalten bleiben ausgenommen. Sonst müsste man für „Excel in einer Zeile“ jede Spalte einzeln freischalten. `textSelection: "all"` erfüllt den Wunsch „gleich der
Wert selektiert“; F2 bleibt Excel-treu (Cursor ans Ende).

### 3.2 Editor-Architektur (K2)

- **`CellEditorService`** (`tableScope.cellEditorService`, `@category Internals`, nur mit `editing` angelegt) besitzt
  **ein** Container-Div `ge-table-cell-editor` im Host (z-index unter Overlay 10000, über Fokusrahmen). Lage in
  `afterRenderPass()` aus `getBodyCellRectInHost(row, col)` (logisch `left`, RTL über `dom.setStyle`), Breite = Zelle,
  bei Text länger als die Zelle wächst es nach rechts bis zum Viewport-Rand (wie Excel; `min-width` = Zelle). Scrollt
  die Zelle heraus, bleibt der Editor **gerendert und fokussiert** (kein `visibility: hidden`/`display: none` – ein
  unsichtbar gewordenes fokussiertes Element verliert den Fokus, eine IME-Komposition bräche ab): er wird an den
  Body-Rand geklemmt und per `clip-path` unsichtbar geschnitten. Tippen bei herausgescrollter Zelle scrollt sie zurück ins
  Bild (Excel). Text, Cursor und IME-Zustand bleiben (E14).
- Der Dienst setzt den vorhandenen Zustand `RenderScope.editing` (`isEditing()`), damit die bestehenden Sperren greifen
  (`onBodyNavigation`, `fillByKeyboard`, `moveFocusIntoHeader`, Fill-Handle, Row Drag). Sein `input` trägt **keine**
  `data-area`/`data-row-index`-Attribute (sonst übernähme der `InputHandler` per `change` ein zweites Mal).
- Zeilenzuordnung über das **Zeilenobjekt** (bzw. Index ohne Objekte), nicht über den Index: sortiert/filtert jemand
  während des Editierens, folgt der Editor der Zeile oder bricht ab, wenn sie verschwindet (Eingabe übernommen, wenn
  gültig – Excel-Verhalten beim Wegklicken).
- **Schnittstelle**:

```ts
/** @category Spreadsheet */
export type CellEditMode = "enter" | "edit";
export type EditMove = "down" | "up" | "right" | "left" | "none";

export interface CellEditorContextIf {
  readonly rowIndex: number; readonly columnIndex: number; readonly row: unknown;
  readonly columnDef?: ColumnDefIf;
  readonly input: string;          // Eingabe (§ 2.5) als Text, z. B. "=B2*C2" oder "42"
  readonly typedText?: string;     // das erste Zeichen beim Lostippen
  readonly mode: CellEditMode;
  readonly textSelection: "all" | "end";
  readonly direction: "ltr" | "rtl";
  readonly domService: DomServiceIf;
  commit(move?: EditMove): void;   // Editor meldet „fertig“ (z. B. Auswahl in einer Liste)
  cancel(): void;
}

export interface CellEditorIf {
  open(container: HTMLDivElement, ctx: CellEditorContextIf): void;
  getValue(): unknown;
  focus(): void;
  close(): void;
  setMode?(mode: CellEditMode): void;
  isComposing?(): boolean;
  /** true: Taste gehört dem Editor (z. B. ↑/↓ in einer offenen Liste) – der Dienst übernimmt dann nicht */
  wantsKey?(evt: KeyboardEvent, mode: CellEditMode): boolean;
  /** Teil 4C: Text an der Cursorposition einfügen/ersetzen, Cursor lesen */
  insertText?(text: string, replaceFrom?: number, replaceTo?: number): void;
  getCaret?(): { start: number; end: number; text: string };
}
export type CellEditorFactory = (ctx: CellEditorContextIf) => CellEditorIf;
// ColumnDefIf.editor?: CellEditorFactory | "text" | "number" | "select" | "date";
```

- Eingebaut: `TextCellEditor` (`input type="text"`), `NumberCellEditor` (`inputmode="decimal"`, rechtsbündig), `SelectCellEditor`
  (Optionen aus `ColumnDef` bzw. Fabrik-Parameter; Alt+↓ öffnet, Tippen springt), `DateCellEditor` (`type="date"`).
  Boolean-Spalten: kein Editor, Leertaste/Enter schaltet um (E20). **Auswahl des Editors:** `ColumnDef.editor` →
  `ColumnDef.getEditRenderer` (alter Weg im Zell-DOM) → `tableOptions.getEditRenderer`, **sofern es nicht der
  Bibliotheks-Default ist** → neuer `TextCellEditor`. Hintergrund: `TableOptions` setzt `getEditRenderer` immer
  (`() => new InputCellRenderer()`), auch bei `{ ...new TableOptions() }`. Der Default wird als exportierte Konstante
  `DEFAULT_GET_EDIT_RENDERER` geführt und per Identität erkannt; ein eigener `getEditRenderer` der App läuft weiter im
  Zell-DOM (mit dem Repaint-Fix aus § 3.11).
- Übernehmen: `CellEditorService` → `applyCellChanges([{ rowIndex, column, value: editor.getValue() }], "edit")`
  (Pipe, `validate`, Batch, ein Event); ungültig → Editor bleibt offen, `aria-invalid`, Meldung als `title` + Ansage
  (Excel lehnt ebenfalls ab). Danach Navigation (`enterMoves`/Tab) über `changeFocusCell`.
- Klick woanders (E15): `pointerdown` außerhalb des Editors (im Host) übernimmt **vor** der Klick-Verarbeitung, aber
  **ohne sofortiges Repaint** – `writeCellsInternal` zeichnet synchron, und ein Repaint zwischen `mousedown` und
  `click`/`dblclick` ersetzt die gedrückte Zelle (Warnung in `MouseHandler.onMouseDown`). Neu: Option
  `deferRepaint` der Schreibstelle, gezeichnet wird nach `mouseup` (vorhandenes Muster). Klick außerhalb der Tabelle
  (`focusout` mit `relatedTarget` außerhalb) übernimmt ebenfalls.
- `ShortcutService` ignoriert Tasten im Editor (wie heute für Formularfelder); Enter/Tab/Escape/Pfeile im Editor
  behandelt der Dienst selbst (`keydown` am Editor-Container). Das Lostippen am Host muss **vor** dem
  `ShortcutService` laufen: Listener in der **Capture-Phase** am Host (unabhängig von der Registrierungsreihenfolge).

### 3.3 Tippen und IME (E1, E16)

- `CellEditorService` hört in der Capture-Phase auf `keydown` am Host: druckbares Zeichen (`key.length === 1`,
  ohne Strg/⌘ – AltGr = `getModifierState("AltGraph")` zählt als druckbar; Shift/Strg+Leertaste ausgenommen, § 2.3),
  fokussierte Body-Zelle editierbar, kein Overlay → Editor „Eingeben“ öffnen, `preventDefault`, Zeichen als `typedText`.
- Tote Tasten (`key === "Dead"`, deutsche Tastatur `^ ´ \``) und IME (`isComposing`, `key === "Process"`): Editor
  **leer** öffnen und synchron fokussieren, **ohne** `preventDefault`, damit der Akzent bzw. die Komposition im Feld
  landet. Ob das reicht, entscheidet der Spike (§ 2.10, Variante A/B) – es ist **nicht** vorausgesetzt.
- Touch (E22): Doppeltipp über Pointer Events (`pointerType === "touch"`, zwei `pointerup` < `doubleClickDelay`), weil
  `dblclick` auf Mobilgeräten unzuverlässig ist.

### 3.4 Enter und Tab (K4)

- Enter (ohne Editor): `enterKey: "edit"` → `START_EDITING` im Modus „Bearbeiten“ mit `textSelection`. Vorrang hat
  `ACTIVATE_CELL` für Checkbox-Spalte, Baumknoten-Zelle, Gruppenzeile, Detail-Umschalter (heutige Logik in
  `activateBodyCell`, sie meldet, ob sie etwas getan hat).
- Enter im Editor: übernehmen + `enterMoves`; Shift+Enter entgegen. **Tab-Enter-Rücksprung** (Excel): nach einer Folge
  von Tabs springt Enter in die Startspalte der nächsten Zeile.
- Tab: übernehmen (falls Editor offen) und nächste **sichtbare** Spalte; Shift+Tab vorige. In der letzten (bzw. ersten)
  sichtbaren Spalte ist Tab **nicht** verbraucht → Browser-Fokus geht weiter (kein Umbruch in die nächste Zeile).
  Damit ist jede Zelle mit höchstens „Spaltenzahl“ Tabs zu verlassen (WCAG 2.1.2), ohne Sondertaste. Der Hinweis steht
  im `aria-description` des Grids. Begründung gegen „Tab nur im Editor“: Excel-Nutzer erwarten Tab zum Weitergehen beim
  zeilenweisen Erfassen.

### 3.5 Pfeile, Modi, Auswahl (E5, E11–E13, K5)

- Modus „Eingeben“ (Lostippen): Pfeile übernehmen und bewegen. Modus „Bearbeiten“ (F2, Enter, Doppelklick): Pfeile
  bewegen den Cursor. F2 wechselt. Für Auswahllisten/Datum entscheidet `wantsKey`.
- **Anker:** `SelectionService` bekommt `getAnchor(): [row, col] | undefined` und `setAnchor(row, col)`. Klick ohne Shift,
  Pfeil ohne Shift, Tab und Enter setzen ihn auf die aktive Zelle; Shift+Klick und Shift+Pfeil spannen den letzten
  Bereich Anker ↔ „Ende“ auf. Das **Ende** (bewegliche Ecke) ist eine eigene Zelle im Dienst; der Fokus
  (`aria-activedescendant`) bleibt am Anker, gescrollt wird zum Ende (Excel).
- `collapseSelectionOnNavigate`: Pfeil/Tab/Enter/Klick setzen die Auswahl auf die aktive Zelle (nur Selektionstyp
  `range`/`cell`); Strg/⌘-Klick ergänzt wie heute.
- Mehrere Bereiche: Shift+Pfeil ändert nur den letzten.
- `SELECT_ROW`: `c1 = 0 … c2 = MAX_SAFE_INTEGER` (wie Zeilennummern-Klick in 004); `SELECT_COLUMN`:
  `r1 = 0 … r2 = MAX_SAFE_INTEGER`. Ansagen `rowSelected`/`columnSelected`, bei Shift+Pfeil `rangeSelected`.

### 3.6 Datenrand (E12)

DOM-frei `findDataEdge(isEmpty: (row, col) => boolean, rowCount, columnCount, row, col, dRow, dCol, isShown?)` →
Excel-Regel: ist die Nachbarzelle leer, springe zur nächsten gefüllten Zelle (sonst Rand); ist sie gefüllt, gehe bis
zur letzten gefüllten Zelle des Blocks. „Leer“ = `null`, `undefined`, `""` (nicht `0`, nicht `false`). Über die
**angezeigten** Zeilen und sichtbaren Spalten. Kosten: linear, über `getValueAt`; 2 Mio. Zeilen voll gefüllt =
2 Mio. Aufrufe – **geschätzt** einige 10 ms (`getValueAt` macht je Aufruf Map-Abfragen), im Bench messen; bei eigenen
Modellen ohne schnelle Werte dokumentiert.

### 3.7 Löschen und Strg+Enter (E8–E10)

- `CLEAR_CELLS`: alle Zellen aller Bereiche (bzw. Fokuszelle), gedeckelt durch `editing.maxClearCells` (Default =
  `CopyService.maxCopyCells`, darüber Ansage `clearTooLarge`), Wert = `ColumnDef.emptyValue ?? editing.emptyValue`,
  Quelle `"clear"`, ein Event, Ansage `cellsCleared`.
- `CLEAR_AND_EDIT` (Rücktaste): eine Zelle → Editor leer im Modus „Eingeben“ (Excel); Bereich → wie `CLEAR_CELLS`.
- Strg+Enter im Editor: Eingabe in alle Zellen der Auswahl über **einen** `applyCellChanges`-Aufruf (`"edit"`); mit
  Formel (Teil 4) relativ verschoben je Zelle (Excel).

### 3.8 Barrierefreiheit

- Editor-Element: das eigentliche `input` hat `aria-label` = Spaltenname (wie heute `labelControl`). Es liegt im DOM
  außerhalb der Rowgroups (wie Fill-Handle), gehört im Barrierefreiheits-Baum aber **zur aktiven Zelle**: die
  `gridcell` bekommt `aria-owns` = Id des Editors (bzw. später der Vorschlagsliste). Sonst wäre ein fokussierbares
  `input` direktes Kind des `role="grid"` (axe `aria-required-children`, Screenreader ohne Zeile/Spalte). Tests: axe
  „Editor offen“ und „Vorschlagsliste offen“. Beim Öffnen Ansage `editingStarted`. Nach dem Schließen Fokus zurück an den
  Host, `aria-activedescendant` auf die neue Zelle.
- `aria-readonly` (§ 2.9). Ungültig: `aria-invalid="true"` + `aria-errormessage` auf ein verstecktes Element mit der Meldung.

### 3.9 Ereignis-Isolation und Konflikte

Detailzeilen (`isEventInDetail`), Overlay „Loading“ (blockiert Tippen und Löschen: `actionsBlockedWhileLoading` um
`CLEAR_CELLS`, `CLEAR_AND_EDIT`, `PASTE_FROM_CLIPBOARD`, `CUT_2_CLIPBOARD`, `UNDO`, `REDO` erweitern), Row Drag/Fill aktiv
→ kein Editor, Batch-Edit → übernommen = vorgemerkt.

### 3.10 Event

`GeEditEvent` (`data/common/event/ge-edit-event.ts`): `type` (`"start" | "input" | "commit" | "cancel"`), `rowIndex`,
`columnIndex`, `mode`, `input?` (bei `"input"` und `"commit"`; `"input"` nur auf dem neuen Weg, für die Formelleiste);
feuert auch auf dem alten Weg (`initRenderEditor`, `cancelEditing`, `updateModelValueAfterEdit`), damit
Apps unabhängig von der Option dasselbe Event bekommen.

### 3.11 Fehlerbehebungen, die auch ohne Option gelten

1. `InputCellRenderer`/`SelectCellRenderer`: kein Inline-`onfocus`; Markieren per Listener nach dem Rendern (CSP).
2. Textverlust beim Repaint (alter Weg): `RenderScope` merkt sich den Text des offenen Editors
   (`editorDraft`, gelesen vor dem Neuaufbau der Zelle, gelöscht beim Schließen) und setzt ihn samt Cursor wieder ein.
   Zuerst roter Test (`it.fails` → `it`).

### 3.12 API (Etappe 1)

`api.startEditing(rowIndex, column, typedText?)`, `api.stopEditing(cancel?)`, `api.isEditing()` (heute nur intern im
`RenderScope`),
`api.getEditingCell(): [number, number] | undefined`, `api.clearCells(ranges?)`, `api.subscribe(listener)` (§ 2.7).

---

## 4. Teil 2 – Zwischenablage (Etappe 2)

### 4.1 Optionen

```ts
/** @category Spreadsheet */
export interface ClipboardOptionsIf {
  copyHeaders: boolean;                 // false – Kopfzeile mitkopieren
  copyValue: "text" | "raw";            // "text" – text/plain wie angezeigt (heute); "raw" = Wert (Zahl, ISO-Datum)
  html: boolean;                        // true – zusätzlich text/html <table>
  pasteAddsRows: boolean;               // false
  createRow?: (index: number) => unknown; // nötig für pasteAddsRows bei Objekt-Arrays
  maxPasteCells: number;                // 1_000_000
  processCopy?: (ctx: CopyContextIf) => string[][] | void;          // Matrix ändern
  processPaste?: (ctx: PasteContextIf) => unknown[][] | false | void; // ändern oder ablehnen (false)
}
export interface CopyContextIf {
  readonly ranges: readonly CellRange[]; // kopierte Bereiche (v1: der letzte)
  readonly matrix: string[][];           // Text je Zelle wie angezeigt bzw. Wert (copyValue)
  readonly cut: boolean;
}
export interface PasteContextIf {
  readonly text: string; readonly html?: string;
  readonly matrix: string[][];          // geparst
  readonly target: CellRange;           // Zielbereich vor Kacheln/Abschneiden
  readonly internal: boolean;           // aus dieser Tabelle kopiert (Eingaben/Formeln verfügbar)
}
```

### 4.2 Ablauf

- Tasten und Events nach der Variante aus dem Spike (§ 2.10). `COPY_2_CLIPBOARD` wird schon heute nicht verbraucht
  (`onActionTriggered` → `false`); mit `clipboard` füllt die Tabelle das `copy`-Event (`clipboardData.setData`) statt
  `navigator.clipboard.writeText`. Ohne Option: alles wie heute.
- **Eigener `CopyServiceIf`** (Konstruktor-Parameter von `TableScope`): mit `clipboard` liefert er weiter den
  `text/plain`-Inhalt (`createContent`), die Tabelle ergänzt `text/html` nur beim eingebauten `CopyService`;
  `copyContent` wird beim Tastatur-Kopieren nicht aufgerufen (das Event schreibt). `api.copyToClipboard()` unverändert.
- **Kopieren** (DOM-frei `clipboard/tsv.ts`): `toTsv(matrix)` mit Excel-Quoting – Zelle mit `\t`, `\n`, `\r` oder `"`
  wird in `"…"` gesetzt, `"` verdoppelt. HTML (`clipboard-html.ts`): `<table>` mit `escapeHtml`, Zahlen zusätzlich als
  `x:num="1234.5"` (Excel/LibreOffice übernehmen die Zahl trotz formatiertem Text), Datum `x:num` als Seriennummer +
  Text. Mehrere Bereiche: **nur der letzte** (Google Sheets) + Ansage – statt heute umschließendes Rechteck (das
  Verhalten von `api.copyToClipboard()` bleibt unverändert).
- **Intern:** zusätzlich im Speicher je Tabelle `{ text, inputs: unknown[][], origin: CellRange }`. Stimmt der eingefügte
  `text/plain` damit überein → `internal: true`, eingefügt werden die **Eingaben** über den rohen Schreibweg (§ 2.2;
  Formeln relativ verschoben mit Δ aus physischen Zeilen, Teil 4).
- **Einfügen** (`paste-plan.ts`, DOM-frei): `parseTsv(text)` (CRLF/LF/CR, abschließender Zeilenumbruch entfernt,
  Quoting, ungleich lange Zeilen = auffüllen mit `""`, BOM weg). `text/html` nur, wenn `text/plain` fehlt (`DOMParser`
  → inertes Dokument, nur `textContent` der Zellen). Plan = Matrix × Ziel:
  - Ziel-Anker = Anfang der Auswahl (bzw. Fokus); ist die Auswahl ein ganzzahliges Vielfaches der Matrix → kacheln
    (P5), 1×1-Matrix → in alle markierten Zellen (P4); sonst einmal ab Anker.
  - Zeilen = **angezeigte** Zeilen in Anzeigereihenfolge; Spalten = **sichtbare** Spalten (versteckte werden
    übersprungen und nicht mitgezählt) – wie Fill (H7).
  - Über das Ende: Spalten abschneiden (Ansage); Zeilen anhängen mit `pasteAddsRows` + `createRow` für Objekt-Arrays
    und `AreaModelSheet` (Array-of-Arrays hat keine Modell-API zum Anhängen – `arr` ist `readonly`, `filteredArr` eine
    Kopie –, dort v1 nicht), sonst abschneiden.
  - Nicht editierbar / berechnet / Gruppenzeile → übersprungen und gezählt.
- Schreiben: **ein** `applyCellChanges(changes, "paste")` (Pipe, `validate`, Batch). Auswahl danach = eingefügter
  Bereich, Ansage `cellsPasted(n, skipped)`.
- **Ausschneiden:** Rahmen `ge-table-cut-range` (Host-Ebene wie Fill-Vorschau, gestrichelt, animiert nur ohne
  `prefers-reduced-motion`), Inhalt kommt in die Zwischenablage wie beim Kopieren; geleert wird erst beim Einfügen
  **dieses** Inhalts (Excel), Escape oder eine andere Änderung hebt die Marke auf. Einfügen = ein Aufruf mit Ziel + Quelle
  (Quelle → `emptyValue`, Zellen, die auch Ziel sind, nicht leeren), Quelle `"cut"`.
  **Im Sheet-Modus** gilt Excels Verschieben-Semantik: die Formeln **werden nicht** relativ verschoben, und Bezüge
  **anderer** Formeln auf den Quellbereich zeigen danach auf das Ziel (`adjustFormula` mit `kind: "moveCells"`, § 6.8).
- Umwandlung beim Einfügen: wie Editieren – `editInputPipe` der Spalte. Neue eingebaute Pipes (additiv, exportiert):
  `createNumberInputPipe(locale?)` (versteht „1.234,56“ in de-DE und „1,234.56“ in en-US, Prozent, Währungszeichen am
  Rand), `createDateInputPipe()`, `booleanInputPipe`, `sheetInputPipe(locale?)` (Excel-artige Erkennung: Zahl, Prozent,
  Datum, `TRUE`/`FALSE`, sonst Text; `=…` und `'=…` unverändert). `editInputPipeForNumber` bleibt unverändert.
  Ohne Pipe und **außerhalb** des Sheet-Modus → Text (stille Zahlen-Erkennung würde bestehende Daten ändern – bewusst
  nicht). **Im Sheet-Modus** (`SpreadsheetFactory`; Preset auf Spalten ohne eigene Pipe) ist `sheetInputPipe` der
  Default für Editor und Einfügen – sonst würden getippte Zahlen zu `"42"`, und `SUM` ignoriert Text in Bereichen
  (Excel), ergäbe also 0.
- Grenze: `maxPasteCells` (Ansage `pasteTooLarge`). Bench-Ziel: 100 000 Zellen < 300 ms (Parsen + Plan + Schreiben,
  ohne Repaint).

### 4.3 API

`api.copySelection(): Promise<void>` (Proxy-unabhängig über `navigator.clipboard.write` mit `ClipboardItem`, sonst
`writeText`), `api.cutSelection()`, `api.pasteText(text: string, target?: [row, col]): CellChangeIf[]`,
`api.getSelectionAsText(): string` (TSV wie beim Kopieren), `api.cancelCut()`.

---

## 5. Teil 3 – Undo/Redo (Etappe 3)

### 5.1 Befehlsmuster

```ts
/** @category Spreadsheet */
export interface UndoableIf {
  readonly label: string;            // "Edit", "Paste", "Fill" … (für Knöpfe: "Undo Paste")
  readonly source: CellChangeSource;   // strukturell: "structure"
  readonly cellCount: number;
  undo(scope: TableScope): UndoResultIf;
  redo(scope: TableScope): UndoResultIf;
}
export interface UndoResultIf { readonly applied: number; readonly skipped: number; readonly range?: CellRange; }
export interface UndoOptionsIf {
  maxSteps: number;                  // 100 (Referenzfall U12 meint `undo: { maxSteps: 100 }`)
  maxCells: number;                  // 1_000_000 – Zellen über alle gespeicherten Schritte; ein größerer Vorgang
                                     // leert den Verlauf und wird angesagt (nicht rückgängig zu machen)
  onConflict: "skip" | "overwrite";  // "skip" – Zelle extern geändert seit dem Vorgang
  recordApiChanges: boolean;         // false – api.applyCellChanges(…, "api") nicht aufzeichnen
}
```

- **Aufzeichnung** an der Schreibstelle: `writeCellsInternal` meldet die `CellChangeIf[]` eines Vorgangs an den
  `UndoService` (`CellChangesUndoable`), für alle Quellen außer `"undo"`/`"redo"` und – ohne `recordApiChanges` – `"api"`.
  `api.applyCellChanges(changes, source, { undoable?: boolean })` (3. Parameter additiv). Mehrere API-Aufrufe als
  **ein** Schritt: `api.batchUndoable(label, fn)` (alle Vorgänge in `fn` werden zusammengefasst).
- **Zuordnung:** Zeilenobjekt + Property (Ausnahme ohne Objekte: Index/Spalte, wie `PendingCellChanges`). Undo sucht den
  aktuellen Anzeige-Index über eine `Map<Zeilenobjekt, index>` (lazy, einmal je Undo). Zeile nicht mehr im Modell →
  übersprungen. Zeile ausgefiltert → trotzdem zurückgesetzt: wie beim Batch-Commit direkt ins Objekt und über
  `writeCells(…, { extraChanges })` im selben Event gemeldet (`resolveCellChanges` verwirft Zeilen ohne Anzeige-Index);
  Fokus nur auf sichtbare Zellen. **`AreaModelSheet`** (Teil 5) legt Zeilenobjekte erst beim Schreiben an und verschiebt
  sie beim Einfügen/Löschen: dort ordnet Undo über den **physischen Index** zu, fortgeschrieben über ein Log der
  Strukturänderungen seit dem Vorgang.
- **Konflikt:** aktuelle Eingabe ≠ `newInput ?? newValue` → `onConflict`: `"skip"` (Default, sicher bei Live-Daten,
  Ansage nennt übersprungene) oder `"overwrite"`.
- **Schreiben** über den **rohen** Schreibweg (§ 2.2, ohne `editInputPipe` – der gespeicherte Wert ist schon gepipt) mit
  Quelle `"undo"`/`"redo"`; geprüft wird nur, ob die Zelle noch editierbar ist. Keine neue Aufzeichnung, Fokus und
  Auswahl = betroffener Bereich, ins Bild scrollen, Ansage `undone/redone(label, n)`.
- **Batch-Edit:** Undo nimmt vorgemerkte Werte zurück (das Undoable speichert den vorherigen Vormerk-Zustand der
  Zellen). Commit und Cancel **leeren** den Verlauf (die vorgemerkten Schritte gibt es danach nicht mehr) – dokumentiert.
- **Nicht aufgezeichnet:** `updateCells`, `setRows` (leert den Verlauf), Row Drag (009; bleibt außerhalb – Undo der
  Zellen funktioniert danach trotzdem, weil über Zeilenobjekte), Sortieren, Filter, Auswahl.
- Neue Änderung nach Undo leert Redo; `maxSteps` wirft den ältesten weg.
- Teil 5 ergänzt `RowsUndoable`/`ColumnsUndoable` (Einfügen/Löschen samt Formel-Anpassung). Beim Löschen ist das
  Umschreiben anderer Formeln auf `#REF!` nicht umkehrbar – das Undoable sichert deshalb die gelöschten Zeilen **und**
  die vorherigen Eingaben **aller** umgeschriebenen Formelzellen und schreibt beides zurück.

### 5.2 API und Event

`api.undo(): boolean`, `api.redo(): boolean`, `api.canUndo()`, `api.canRedo()`, `api.clearUndoHistory()`,
`api.getUndoState(): GeUndoEvent`-Daten; Event `onUndoStackChanged` (§ 2.7) bei jeder Änderung des Stapels.

---

## 6. Teil 4 – Zellformeln (Etappen 4–6)

### 6.1 Ablage (K6)

- Formeln stehen **in den Daten der Anwendung** als Text mit führendem `=` (`row.total = "=B2*C2"`). Speichern = Daten
  speichern, Laden = Daten laden (S24). Keine zweite Ablage.
- Opt-in: `tableOptions.cellFormulas: true` = alle Datenspalten (Default von `SpreadsheetFactory`);
  `cellFormulas: { columns: ["total", "net"] }` = nur diese Properties (für vorhandene Objekt-Daten, X8); zusätzlich
  einzelne Spalten aus mit `ColumnDef.cellFormulas: false` (Freitext). Ohne Option ist `"=1+1"` Text wie heute.
- **Formeltexte umgehen `editInputPipe` und `validate`** (rohe Schreibweg, § 2.2): `"=B2*C2"` in einer Zahlenspalte mit
  `editInputPipeForNumber` würde sonst zu `NaN` oder abgelehnt – beim Editor, Einfügen, Füllen und Vormerken. Das
  Ergebnis wird nicht validiert (v1).
- `'` **direkt vor** `=` = Text: die Daten enthalten `"'=1+1"`, angezeigt und als Wert geliefert wird `=1+1`. Andere
  Texte mit `'` (z. B. `"'90s"`) bleiben unverändert – sonst änderte das Einschalten die Anzeige bestehender Daten.

```ts
/** @category Spreadsheet */
export interface CellFormulaOptionsIf {
  functions: Record<string, FormulaFunction>;  // eigene Funktionen (wie 008; Bereiche als FormulaRange)
  isoDatesAsDates: boolean;                    // true – "2026-10-16" rechnet als Datum (§ 6.6)
  maxRangeCells: number;                       // 10_000_000 – größere Bereiche → #ERROR!
  rejectInvalidFormulas: boolean;              // false – Syntaxfehler speichern und #ERROR! zeigen
}
```

### 6.2 Adressen (K7)

- **Zeile n** = physische Zeile n (1-basiert) = Index in `getAllRows()` (Objekt-Array) bzw. im Quell-Array
  (Array-of-Arrays, `AreaModelSheet`). Beim Sortieren und Filtern bleiben Bezüge an den Daten (S9, S10); die
  Zeilennummern zeigen im Sheet-Modus deshalb `original` (Default der Fabrik/des Presets).
- **Spalte** = Position unter den **Datenspalten** zum Zeitpunkt des Aufbaus (Zeilennummer-, Checkbox-, Gruppenspalte
  zählen nicht), gebunden an die Property. Spalten-Drag verschiebt nur die Anzeige, der Buchstabe wandert mit
  (Objekt-Arrays). Array-of-Arrays und `AreaModelSheet` verschieben Spalten **physisch** (`changeColumnOrder`) → dort
  ist Spalten-Drag im Sheet-Modus aus (§ 2.6). Neue Spalten per `setColumnDefs` hängen hinten an.
- Darstellung: `A`…`Z`, `AA`…, max. `XFD` (16 384, wie Excel). DOM-frei `cell-address.ts`: `columnLetter(i)`,
  `columnIndexOfLetter(s)`, `toCellAddress(row, col, { absRow?, absCol? })`, `parseCellAddress("$B$3")`,
  `parseRangeAddress("A1:B5" | "A:A" | "3:3")` – exportiert (`@category Spreadsheet`).

### 6.3 Grammatik (additiv, 008 bit-gleich)

- `compileFormula(source, { …, references: true })` – nur mit `references` (intern vom Sheet-Modus gesetzt) gelten die
  Erweiterungen; ohne bleibt 008 exakt wie heute (alle 008-Specs unverändert).
- Neue Knoten: `{ kind: "ref", row, col, absRow, absCol }`, `{ kind: "range", from, to }` (inkl. ganzer Spalten `A:A`
  = `row: -1` und Zeilen `3:3` = `col: -1`), `{ kind: "error", code }` (`#REF!` im Text, nach Verschieben/Löschen).
- Tokenizer: Bezeichner **vor** `(` = Funktion; sonst passt `^\$?[A-Z]{1,3}\$?[1-9]\d*$` → Bezug (also `LOG10(…)` =
  Funktion, `LOG10` = Zelle); `TRUE`/`FALSE` bleiben Literale; Kleinschreibung erlaubt, Ausgabe groß.
- Operatoren: `:` (bindet am stärksten), Postfix `%` (`50%` = 0.5). Argument-Trenner `,` **und** `;` (deutsche
  Gewohnheit `=IF(A1>1;"x";"y")`; Dezimaltrenner bleibt `.`, Funktionsnamen englisch). Keine Matrix-Konstanten,
  keine Schnitt-/Vereinigungsoperatoren, keine Blattbezüge.
- Strukturierter Bezug `[price]` (008) = Feld derselben **physischen** Zeile – auch in Zellformeln, aber nur für
  Properties, die **Datenspalten** sind (sie stehen dann als Bezug auf diese Zelle im Graph); andere Felder → `#NAME?`
  (sie wären nicht im Graph und würden veralten). Das 008-Spalten-Aggregat `SUM([x])` (über **gefilterte** Zeilen) ist
  in Zellformeln **nicht** erlaubt (`#NAME?` mit Hinweis „use SUM(D:D)“) – zwei Semantiken für `SUM` wären eine Falle.
- **Excel-Regeln** mit `references: true` (ohne bleibt 008 bit-gleich): unäres Minus bindet **stärker** als `^`
  (`=-2^2` = 4), Strings nur in `"…"` mit Excel-Escape `""` (keine `'…'`, kein `\`), Vergleich Text vs. Zahl wie Excel
  (`"3"=3` → FALSE, Text > Zahl > …), Zahlen werden auf **15 signifikante Stellen** gerundet, bevor sie verglichen,
  angezeigt oder gespeichert werden (`=0.1+0.2=0.3` → TRUE). Abweichungen der Spaltenformeln (008) von Excel stehen in der
  Doku.
- `formatFormula(ast)` → kanonischer Text (Großschreibung, `,` als Trenner) – für Excel-Export und Verschieben.

### 6.4 Engine (K8) – DOM-frei, exportiert

```ts
/** @category Spreadsheet */
export interface SheetDataSourceIf {
  getRowCount(): number;
  getColumnCount(): number;
  getInput(row: number, col: number): unknown;     // physisch, 0-basiert
  isFormulaColumn?(col: number): boolean;          // ColumnDef.cellFormulas !== false
  getFieldValue?(row: number, field: string): unknown; // für [field]
}
export interface SheetRecalcResultIf {
  readonly changedCells: ReadonlyArray<readonly [number, number]>; // Formelzellen mit neuem Ergebnis
  readonly evaluated: number;
}
export class SheetEngine {
  constructor(source: SheetDataSourceIf, options?: Partial<CellFormulaOptionsIf>);
  static fromArrays(data: unknown[][], options?: Partial<CellFormulaOptionsIf>): SheetEngine; // ohne Tabelle
  rebuild(): SheetRecalcResultIf;                       // alles neu lesen (setRows, Erststart)
  inputsChanged(cells: ReadonlyArray<readonly [number, number]>): SheetRecalcResultIf;
  recalculate(): SheetRecalcResultIf;                   // volatile + alles Dirty; api.recalculate()
  getValue(row: number, col: number): unknown;          // Ergebnis bzw. Datenwert; Datum als Date
  isFormula(row: number, col: number): boolean;
  evaluate(source: string, at?: readonly [number, number]): unknown;
  getPrecedents(row: number, col: number): CellRange[];
  getDependents(row: number, col: number): Array<[number, number]>;
  adjustForStructureChange(edit: SheetStructureEditIf): Array<{ row: number; col: number; input: string }>;
}
```

- **Graph:** Schlüssel `row * 16384 + col` (Zahl). Je Formelzelle: kompilierte Closure, Einzel-Vorgänger, Bereichs-Knoten.
  Rückwärtsindex für Einzelbezüge `Map<key, Set<key>>`. **Bereichs-Knoten** werden dedupliziert (`"r1:c1:r2:c2"`), mit
  Referenzzähler; Index je Spalte (sortiert nach `r1`, Präfix-Maximum von `r2` für Abbruch) bzw. je Zeile für `3:3`.
  `=SUM(A:A)` über 1 Mio. Zeilen = **ein** Knoten, keine Million Kanten (S18).
- **Neuberechnung** sofort nach jedem Schreiben (nicht lazy): geänderte Zellen → Dirty-Menge per BFS über
  Einzel-Abhängige und Bereichs-Knoten → **Kahn** (topologisch, iterativ, keine Rekursion – eine Kette `A2=A1+1` über
  100 000 Zeilen darf den Stack nicht sprengen) → Rest: **Tarjan** (iterativ) markiert Zellen in Komponenten > 1 bzw.
  Selbstbezug mit `#CIRC!`; die übrigen Zellen des Rests (hinter einem Zyklus) werden danach in einem zweiten
  Kahn-Durchlauf ausgewertet und erben den Fehler.
  Volatile Funktionen (`TODAY`, `NOW`, `RAND`, `RANDBETWEEN`) sind bei jedem `recalculate()` und jeder Neuberechnung
  dirty. Ergebnis-Cache je Formelzelle; Nicht-Formelzellen werden nie kopiert (aus den Daten gelesen).
  Begründung gegen lazy-Auswertung: einfacher korrekt (S26-Property-Test), die geänderten Zellen sind fürs Repaint
  bekannt, Summen/Sortieren brauchen ohnehin alle Werte.
- **Bekannte teure Form:** laufende Summe `=SUM($B$2:B2)` nach unten gefüllt = n verschiedene Bereiche, O(n²) – beim
  Laden **und bei jeder Änderung in B2** (alle n Summen sind abhängig). 10 000 Zeilen = 5·10⁷ Zellzugriffe über den
  Adapter, **geschätzt** 0,5–2 s. Im Bench festhalten, Doku-Hinweis (`=C1+B2` statt `SUM`), Optimierung (Präfix-Summen
  je Spalte für Bereiche mit festem Anfang) als Folgepunkt; Etappe 4 entscheidet anhand der Messung, ob sie gleich kommt.
- **Speicher:** **Schätzung** 300–1000 Byte je Formelzelle (Closure, Arrays, Map-Einträge) → 100 000 Formeln ≈
  30–100 MB. Im Bench messen und dokumentieren.
- **Ziele (Schätzungen, im Bench messen, keine Assertions):** 20 000 Formeln laden < 150 ms; Änderung mit 10 000
  Abhängigen < 30 ms; `SUM(A:A)` über 1 Mio. Zeilen < 50 ms. Werden sie verfehlt: in „Fortschritt“ eintragen, nicht
  stillschweigend anpassen.
- **Kein `FormulaEngineIf`** in v1 (Frage 10): eine Naht für fremde Engines (HyperFormula) ohne konkreten Bedarf wäre
  spekulative API; die Klasse lässt sich später hinter einer Schnittstelle verstecken, ohne Bruch.

### 6.5 Werte wie in Excel

`FormulaValue` + `FormulaRange` (2D, lazy über die Daten; in skalarem Zusammenhang → `#VALUE!`, keine implizite
Schnittmenge) + `SheetDate`. Leere Zelle: 0 in Arithmetik, `""` in Text (wie `toNumber(null)` heute), Text mit Zahl
rechnet (`"3"+1 = 4`, vorhanden), Booleans 1/0, Fehler pflanzen sich fort, 15 signifikante Stellen (**neu** im
Sheet-Modus – `numberResult` aus 008 prüft nur auf endlich/−0 und rundet nicht).
Neue Fehlercodes: `#REF!`, `#N/A` (zu den vorhandenen `#DIV/0!`, `#NAME?`, `#VALUE!`, `#NUM!`, `#CIRC!`, `#ERROR!`).

### 6.6 Datum (K9)

- Intern **Excel-Seriennummer** (1900er System, 1 = 1.1.1900, Excel-Fehler 29.2.1900 nachgebildet, damit Export und
  `DATE()` stimmen) mit Kennung `SheetDate`. `Date` aus den Daten → Seriennummer über die **lokalen**
  Kalenderbestandteile (kein Zeitzonen-Versatz, wie Excel). ISO-Text `YYYY-MM-DD[THH:MM[:SS]]` mit
  `isoDatesAsDates` ebenso.
- Datum ± Zahl → Datum; Datum − Datum → Zahl (Tage); `DATE`, `TODAY`, `EOMONTH` → Datum. Werte **mit** Datums-Kennung
  werden unverändert weitergegeben (`=A2`, `=IF(…, A2, …)`, `MIN`/`MAX` über Daten, `INDEX`/`VLOOKUP`-Treffer bleiben
  Datum); nur Arithmetik außer ± Zahl ergibt eine Zahl.
- ISO-Text bleibt im **Text**-Zusammenhang Text (`LEN("2026-10-16")` = 10, `&` hängt den Text an) und wird nur in
  Arithmetik und Vergleichen mit Zahlen/Daten als Datum gelesen – deshalb ist `isoDatesAsDates: true` als Default
  vertretbar (viele Apps speichern ISO-Text).
- Ergebnis nach außen: `Date` (lokale Mitternacht + Uhrzeit). Anzeige über die Renderer der Spalte bzw. ISO-Datum.
- 008 (Spaltenformeln) bleibt bei Millisekunden – bit-gleich.

### 6.7 Funktionsbibliothek Stufe 1 (Etappe 4)

| Gruppe | Funktionen |
|---|---|
| Mathe | `SUM`, `SUMPRODUCT`, `PRODUCT`, `AVERAGE`, `MIN`, `MAX`, `COUNT`, `COUNTA`, `COUNTBLANK`, `ROUND`, `ROUNDUP`, `ROUNDDOWN`, `INT`, `ABS`, `MOD`, `POWER`, `SQRT`, `FLOOR`, `CEILING`, `RAND`, `RANDBETWEEN` |
| Bedingt | `SUMIF`, `SUMIFS`, `COUNTIF`, `COUNTIFS`, `AVERAGEIF`, `AVERAGEIFS` (Kriterien `">5"`, `"<>x"`, `"M*"`, `"?"`, Zahl, Groß/klein egal) |
| Logik | `IF`, `IFS`, `IFERROR`, `IFNA`, `AND`, `OR`, `NOT`, `XOR`, `SWITCH` |
| Suche | `VLOOKUP`, `HLOOKUP`, `XLOOKUP` (ohne Suchmodus), `INDEX`, `MATCH` (0, 1, −1) |
| Text | `CONCAT`, `TEXTJOIN`, `LEFT`, `RIGHT`, `MID`, `LEN`, `FIND`, `SEARCH`, `SUBSTITUTE`, `UPPER`, `LOWER`, `TRIM`, `VALUE`, `TEXT` (Teilmenge: `0`, `0.00`, `#,##0`, `0%`, `yyyy-mm-dd`, `dd.mm.yyyy`) |
| Datum | `TODAY`, `NOW`, `DATE`, `YEAR`, `MONTH`, `DAY`, `WEEKDAY`, `EOMONTH`, `DATEDIF` (`"d"`, `"m"`, `"y"`) |
| Info | `ISBLANK`, `ISNUMBER`, `ISTEXT`, `ISERROR`, `ISNA`, `NA` |

~65 Funktionen. Im Sheet-Modus mit **Excel-Signaturen und -Semantik** – wo 008 abweicht, eigene Implementierung:
`FLOOR(x, significance)`/`CEILING(x, significance)` (008: einstellig), kein `AVG` (nur `AVERAGE`), `ISBLANK("")` =
FALSE (008: TRUE). Die 008-Varianten bleiben für Spaltenformeln. Metadaten
`FORMULA_FUNCTION_INFO` (Name, Signatur, Kurzbeschreibung englisch) – für Vorschläge (4C) und die Doku-Tabelle.
Erwartungswerte aus **LibreOffice headless** über eine feste Testmappe (`test-utils/sheet-reference.fods`, Skript
`scripts/sheet-reference-values.mjs` erzeugt `sheet-reference-values.json`; im Container verfügbar machen oder einmal
lokal erzeugen und einchecken – entscheidet Etappe 4).

### 6.8 Verschieben und Anpassen

DOM-frei `shift-formula.ts`: `shiftFormula(source, dRow, dCol, bounds)` (relative Teile verschieben, außerhalb →
`#REF!`, kanonisch über `formatFormula`), `offsetReferences(source, dRow, dCol)` (verschiebt **alle** Bezüge, auch
`$F$1` – für den Excel-Export-Versatz) und `adjustFormula(source, edit: SheetStructureEditIf)` mit
`{ kind: "insertRows" | "deleteRows" | "insertColumns" | "deleteColumns", at, count }` bzw.
`{ kind: "moveCells", from: CellRange, to: [row, col] }` (Ausschneiden + Einfügen, § 4.2). Excel-Regeln: Einfügen in einem
Bereich vergrößert ihn, Löschen eines Teils verkleinert, Löschen des ganzen Bereichs/Bezugs → `#REF!`; `moveCells`
schreibt Bezüge, die ganz im Quellbereich liegen, auf das Ziel um.

### 6.9 Tabelle (Etappe 5)

- Adapter `ObjectArraySheetSource`/`ArraySheetSource` (später `AreaModelSheet`), Anzeige-Index → physisch über
  `Map<Zeilenobjekt, Index>` (lazy, neu bei `setRows`).
- **Eine Auswertungsstelle** wie 008: `getValueByT` (Objekt-Array) bzw. `getValueAt` (Arrays) fragen zuerst die Engine
  (`isFormula`) → Sortieren, Filter, Summen (005), Copy, Excel stimmen automatisch (S23).
- `getInputValueAt` (§ 2.5) liefert den Formeltext für Editor, Formelleiste, internes Kopieren, Undo.
- Schreiben: `writeCellsInternal` ruft nach `setValue` **vor** dem Repaint `engine.inputsChanged(cells)`; die abhängigen
  Zellen sind damit vor dem Zeichnen neu. `api.updateCells(…)` meldet die Zellen ebenfalls. Externe Änderungen an den
  Daten ohne diese Wege → `api.recalculate()` (Doku); `api.repaint()` rechnet bewusst **nicht** alles neu (Live-Daten
  rufen es oft).
- Batch-Edit: vorgemerkte Formel = Eingabetext mit Markierung; gerechnet wird nach dem Commit.
- Fehlerzellen: wie 008 (`ge-table-cell-error`, `title` = Meldung).
- **Fill-Handle (010):** Quellzelle mit Formel → Ziel = `shiftFormula(input, Δrow, Δcol)` (Kopiermodus, keine Reihe).
  `TableScope.fillRange` liest dafür die Eingaben (`getInputValueAt`) statt der angezeigten Werte, wenn es sie gibt.
- **Excel-Export (S20):** `ExcelExportOptionsIf.cellFormulas?: boolean` + Zelle `{ formula, value }` (`ExcelFormulaCellIf`,
  `<c><f>…</f><v>…</v></c>`, XML-escaped). Formeln nur, wenn die Exportsicht das Blatt ist (kein Filter blendet aus,
  keine Sortierung, alle Datenspalten sichtbar); dann werden Bezüge um Kopfzeilen und führende Nicht-Datenspalten
  verschoben – mit `offsetReferences` (auch absolute Teile), nicht `shiftFormula`. Weiter: neuere Funktionen mit
  OOXML-Präfix `_xlfn.` (`XLOOKUP`, `IFS`, `SWITCH`, `TEXTJOIN`, `CONCAT`, `IFNA`, `XOR`, …), `<v>` mit passendem `t`
  (`str`, `b`, `e`), eigene Fehler ohne Excel-Gegenstück (`#CIRC!`, `#ERROR!`) als `#VALUE!` bzw. nur als Wert, und
  `<calcPr fullCalcOnLoad="1"/>` (LibreOffice rechnet xlsx sonst nicht neu). Sonst Werte + `console.warn`. Prüfung mit
  openpyxl und LibreOffice (gleiche Ergebnisse).
- API: `getCellAddress(rowIndex, column)` → `"B3"`, `getCellByAddress("B3")` → `[rowIndex, columnIndex]` (−1, wenn
  ausgefiltert), `getCellInput(rowIndex, column)`, `setCellInput(rowIndex, column, input)` (= `applyCellChanges`),
  `getCellValue(rowIndex, column)` (= `getValueAt`, Referenzfall S24), `evaluateFormula(source)`,
  `getSheetValue("B3")`, `recalculate()`, `getPrecedents/getDependents(rowIndex, column)`,
  `getSheetEngine()` (`@category Internals`).

### 6.10 Formel-Eingabe (Etappe 6, im Editor aus § 3.2)

- **Zeigemodus** (S14): aktiv, wenn die Eingabe mit `=` beginnt und der Cursor an einer Einfügestelle steht (direkt nach
  `=`, `(`, `,`, `;`, Operator, oder auf einem gerade eingefügten Bezug). Dann fügen Pfeile (statt zu übernehmen) einen
  Bezug ein bzw. verschieben ihn, Shift+Pfeile spannen einen Bereich auf, ein Klick in eine Zelle fügt ihren Bezug ein
  (übernimmt **nicht**), Ziehen einen Bereich. Jedes andere Zeichen beendet den Zeigemodus. F4 schaltet den Bezug am
  Cursor durch `$A$1 → A$1 → $A1 → A1`.
- **Farbige Bezüge** (S15): Farben 0–7 nach Reihenfolge des ersten Auftretens, gleicher Bezug = gleiche Farbe. Rahmen als
  Host-Ebene (`ge-table-formula-ref-0` … `-7`, `--ge-table-formula-ref-0…7` light/dark, `aria-hidden`), Lage aus
  `getBodyCellRectInHost` der Bereichsecken, abgeschnitten am Body. Text im Editor farbig über ein **Spiegel-Div** hinter
  dem `input` (Text des Inputs `color: transparent`, `caret-color` normal, gleiche Schrift/Abstände, Scroll synchron);
  während einer IME-Komposition und ohne `=` zeigt das Input den Text normal.
- **Vorschläge** (S16): ab dem ersten Buchstaben eines Funktionsnamens eine Liste unter dem Editor (APG-Combobox: Input
  `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant` auf die
  Option; Liste `role="listbox"`, Optionen `role="option"`). ↑/↓ wählen, Tab/Enter übernehmen (`SUM(`), Escape schließt
  die Liste (zweites Escape bricht ab). Argument-Hinweis `role="tooltip"` aus `FORMULA_FUNCTION_INFO`, aktuelles
  Argument fett. Texte per `textContent`.
- **Syntaxfehler beim Übernehmen:** gespeichert, Zelle `#ERROR!` + Ansage `formulaError` (Google Sheets); mit
  `rejectInvalidFormulas` bleibt der Editor offen, `aria-invalid` (Excel). Kein modaler Dialog.

---

## 7. Teil 5 – Spreadsheet-Modus (Etappe 7)

### 7.1 Fabrik und Preset (Frage 1)

- **Preset** `tableOptions.spreadsheet: true | Partial<SpreadsheetOptionsIf>` – nur Optionen (§ 2.1), für vorhandene
  Modelle. `SpreadsheetOptionsIf = { editing, clipboard, undo, cellFormulas, fillHandle }` (je `boolean | Partial<…>`,
  Default `true`; `editing.defaultEditable: true`).
- **Fabrik** für ein Blatt:

```ts
/** @category Spreadsheet */
export interface SpreadsheetParamIf {
  data: unknown[][];                 // Zeilen × Spalten, Formeln als "=…"
  rowCount: number;                  // Default max(data.length, 100)
  columnCount: number;               // Default max(längste Zeile, 26)
  columnWidth: number;               // 100
  rowNumbers: boolean;               // true (Zählweise "original")
  columnLetters: boolean;            // true
  tableOptions: Partial<TableOptionsIf>; // wird über das Preset gelegt
  functions: Record<string, FormulaFunction>;
}
export class SpreadsheetFactory {
  static create(param?: Partial<SpreadsheetParamIf>): { tableModel: TableModelIf; tableOptions: TableOptionsIf };
}
```

- Für vorhandene Objekt-Daten zusätzlich `TableFactory.createTableModel({ …, columnLetters: true })` (additiv): eine
  Buchstaben-Zeile über den vorhandenen Kopfzeilen (Dekorator `AreaModelLetterHeader`). Das Preset allein ändert das
  Modell nicht – Referenzfall X8 („Buchstaben über den Labels“) braucht diesen Parameter; X8 im Prompt entsprechend
  lesen. Formeln dort in allen Datenspalten oder nur in `cellFormulas.columns`.

### 7.2 `AreaModelSheet` (Frage 4)

- Dünn besetzt: `Map<physischeZeile, unknown[]>`, `getRowCount()` = `rowCount` (auch 1 Mio. leer, X7). Leere Zeilen
  kosten nichts. `setValue` legt die Zeile an. `getSheetData(): unknown[][]` (dicht bis zur letzten gefüllten Zelle),
  auch als `api.getSheetData()` (Referenzfall X2). `getPhysicalRowIndex(displayIndex)` (§ 1) – die Zeilennummern
  (`original`) müssen so kein Array aller Zeilen bauen.
- Sortieren/Filtern: Permutation `Int32Array` (Anzeige → physisch) nur, solange sortiert/gefiltert; sonst Identität ohne
  Array. Filter-Prädikat bekommt die Zeile als Array (`[]` für leere).
- `AreaModelSheetHeader`: eine Kopfzeile `A, B, …` (`role="columnheader"`, `aria-label` „Column B“).

### 7.3 Kopf, Auswahl

- Klick auf einen Buchstaben = ganze Spalte (Selektionstyp `range`), Shift erweitert, Strg/⌘ ergänzt, Ziehen über
  Buchstaben = mehrere Spalten; Ecke (Zeilennummern-Kopf) = alles (vorhanden, 004). Kopfklick sortiert in der Fabrik
  **nicht** (`sortable: false`); mit Preset auf eigenen Modellen bleibt Sortieren, wie es konfiguriert ist.
- Spaltenbreite per Doppelklick auf den Griff = passend (`autoResizeColumns` für eine Spalte) – prüfen, ob schon
  vorhanden, sonst ergänzen.

### 7.4 Zeilen und Spalten einfügen/löschen (Frage 5)

- `api.insertRows(at, count)`, `deleteRows(at, count)`, `insertColumns(at, count)`, `deleteColumns(at, count)`;
  `at` = **physische** Zeile/Spalte (= Zeilennummer − 1 bzw. Buchstabenindex).
- Modelle: `AreaModelSheet` (Zeilen + Spalten), `AreaModelObjectArray` (nur Zeilen, neue Objekte über
  `clipboard.createRow` bzw. `{}`; das Array der Anwendung wird **in place** geändert, wie beim Row Drag – dokumentiert),
  `AreaModelArrayOfArrays` (nur Zeilen). Sonst `false`.
- Formeln: `engine.adjustForStructureChange(edit)` liefert umgeschriebene Eingaben, die in die Daten geschrieben werden.
  Ein `onModelChanged` mit `source: "structure"`, ein Undo-Schritt (`RowsUndoable`/`ColumnsUndoable` merken gelöschte
  Zeilen samt Eingaben), Ansage `rowsInserted/…`.
- Kein automatisches „Wachsen“ am Ende in v1 (Demo: Knopf „+100 rows“ über `insertRows`).

### 7.5 Formelleiste (Frage 2, K10)

```ts
/** @category Spreadsheet */
export interface FormulaBarOptionsIf { addressBox: boolean; ariaLabel: string; addressAriaLabel: string; }
export class FormulaBar {
  constructor(container: HTMLElement, api: TableApi, options?: Partial<FormulaBarOptionsIf>);
  destroy(): void;
}
```

- DOM: `div.ge-table-formula-bar` > `input.ge-table-formula-bar-address` (Adressfeld; Enter springt bzw. markiert
  `D10`, `B2:C5`; ungültig → `aria-invalid`) + `span` „fx“ (`aria-hidden`) + `input.ge-table-formula-bar-input`
  (`aria-label` „Formula“). Plain DOM, Texte per `value`, CSS-Variablen `--ge-table-formula-bar-*`, RTL über `dir` des
  Containers.
- Adressfeld als **einfaches Textfeld**, nicht als Combobox: es gibt in v1 keine benannten Bereiche, also nichts
  auszuwählen; mit benannten Bereichen (später) wird es eine Combobox.
- Synchronisation über `api.subscribe` (§ 2.7): Fokus/Auswahl → Adresse + Eingabe (`getCellInput`); Editor-Eingabe →
  live (`onEditingChanged` `"input"`); `onModelChanged` → neu lesen.
- Eingabe in der Leiste: Enter/Tab übernehmen über `api.setCellInput` (Enter bewegt wie `enterMoves`), Escape stellt
  her und gibt den Fokus an die Tabelle zurück. Zeigemodus aus der Leiste heraus: nicht in v1.
- Warum im Core (gegen die 008-Linie „UI gehört der Anwendung“): Ziel ist „ohne Konfiguration“; die Leiste hat keine
  Abhängigkeit, ist optional und wird nur geladen, wenn man sie baut; jedes Framework nutzt sie gleich (keine sieben
  Wrapper-Komponenten). Eine eigene Leiste bleibt mit `api.subscribe` + `getCellInput`/`setCellInput` möglich (Beispiel
  in der Doku).

### 7.6 Kontextmenü, Nicht-Ziele (Fragen 6, 7)

- Kontextmenü: **nur Beispiel** in Showcase und `apps/table-demo/spreadsheet.html` (plain HTML über `onContextmenu`:
  Ausschneiden, Kopieren, Einfügen, Zeile einfügen/löschen). Ein eingebautes Menü wäre ein eigenes Feature für alle
  Tabellen → Vorschlag „Prompt 014 Kontextmenü“ (nächste freie Nummer; der Prompt nannte vor dem Zusammenlegen 018) in
  `prompts/README.md`/`TODO.md`.
- **Nicht-Ziele:** mehrere Blätter und Blattbezüge, benannte Bereiche, Zellformatierung (fett, Farben, Zahlenformat je
  Zelle), verbundene Zellen per UI, bedingte Formatierung per UI, Diagramme, Matrix-/Spill-Formeln, gemeinsames
  Bearbeiten, XLSX-Import, lokalisierte Funktionsnamen, Formel-Spurverfolgung als UI, Zeilen-Drag im Sheet-Modus.

---

## 8. Beispiele (≤ 15 Zeilen, Video-tauglich)

**B1 – vorhandene Tabelle wie Excel bedienen (Teil 1–4 über das Preset)**

```ts
const tableModel = TableFactory.createTableModel({
  rows: orders,                  // [{ product: "Laptop", price: 1299, qty: 2, total: "=B1*C1" }, … "=B2*C2", "=B3*C3"]
  properties: ["product", "price", "qty", "total"],
  rowNumbersVisible: { mode: "original" },
  columnLetters: true,
});
const tableOptions: TableOptionsIf = { ...new TableOptions(), spreadsheet: true };
const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
scope.firstInit();
```

Bei Objekt-Daten gibt es keine Kopfzeile als Daten: das erste Objekt ist Zeile 1 (Zeilennummer 1), deshalb `=B1*C1`.
Erwartung: Lostippen, Enter/Tab, Copy & Paste mit Excel, Strg+Z, `total` rechnet (2598, 1047, 250); Sortieren nach
`price` lässt die Werte stimmen, die Zeilennummern zeigen die physischen Zeilen.

**B2 – leeres Blatt mit Formelleiste (Teil 5)**

```ts
const { tableModel, tableOptions } = SpreadsheetFactory.create({
  data: [
    ["Product", "Price", "Qty", "Total"],
    ["Laptop", 1299, 2, "=B2*C2"],
    ["Monitor", 349, 3, "=B3*C3"],
    ["Mouse", 25, 10, "=B4*C4"],
    ["", "", "Sum", "=SUM(D2:D4)"],
  ],
});
const scope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
scope.firstInit();
new FormulaBar(document.querySelector<HTMLDivElement>("#bar")!, scope.getApi());
```

Erwartung: D5 = 3895; B4 auf 30 → D4 300, D5 3945 (S3).

**B3 – eigene Rückgängig-Knöpfe (Teil 3)**

```ts
const api = scope.getApi();
const undoBtn = document.querySelector<HTMLButtonElement>("#undo")!;
const redoBtn = document.querySelector<HTMLButtonElement>("#redo")!;
api.subscribe({
  onUndoStackChanged: (e: GeUndoEvent) => {
    undoBtn.disabled = !e.canUndo;
    redoBtn.disabled = !e.canRedo;
    undoBtn.title = e.undoLabel ? `Undo ${e.undoLabel}` : "Undo";
  },
});
undoBtn.onclick = () => api.undo();
redoBtn.onclick = () => api.redo();
```

**B4 – Einfügen prüfen (Teil 2)**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  clipboard: {
    pasteAddsRows: true,
    createRow: () => ({ product: "", price: 0, qty: 0 }),
    processPaste: ctx => ctx.matrix.length > 10_000 ? false : undefined, // zu groß: ablehnen
  },
};
```

**B5 – Engine ohne Tabelle (Teil 4A, „headless“)**

```ts
const engine = SheetEngine.fromArrays([[1299, 2, "=A1*B1"], [349, 3, "=A2*B2"], ["", "", "=SUM(C1:C2)"]]);
engine.getValue(2, 2);                 // 3645
```

Alle Beispiele werden in Etappe 8 Teil der Doku/des Showcase und mit `check:features` bzw. `docs:check` kompiliert.

---

## 9. Neue öffentliche Symbole (Überblick, Kategorie „Spreadsheet“ sofern nicht anders)

Etappe 1: `EditingOptionsIf`, `EditingOptions`, `CellEditorIf`, `CellEditorContextIf`, `CellEditorFactory`, `CellEditMode`,
`EditMove`, `TextCellEditor`, `NumberCellEditor`, `SelectCellEditor`, `DateCellEditor`, `GeEditEvent`, `findDataEdge`,
`CellEditorService` (Internals), `DEFAULT_GET_EDIT_RENDERER`; `TableApi.subscribe/startEditing/stopEditing/
getEditingCell/clearCells`; neue `ActionId`s.
Etappe 2: `ClipboardOptionsIf`, `ClipboardOptions`, `CopyContextIf`, `PasteContextIf`, `toTsv`, `parseTsv`,
`createNumberInputPipe`, `createDateInputPipe`, `booleanInputPipe`, `sheetInputPipe`, `ClipboardService` (Internals);
API § 4.3.
Etappe 3: `UndoOptionsIf`, `UndoOptions`, `UndoableIf`, `UndoResultIf`, `GeUndoEvent`, `UndoStack`, `UndoService`
(Internals); API § 5.2 + `batchUndoable`.
Etappe 4: `SheetEngine`, `SheetDataSourceIf`, `SheetRecalcResultIf`, `SheetStructureEditIf`, `CellFormulaOptionsIf`,
`FormulaRange`, `columnLetter`, `columnIndexOfLetter`, `toCellAddress`, `parseCellAddress`, `parseRangeAddress`,
`shiftFormula`, `offsetReferences`, `adjustFormula`, `formatFormula`, `FORMULA_FUNCTION_INFO`.
Etappe 5: `CellFormulaOptions`, `ExcelFormulaCellIf`, API § 6.9. Etappe 6: keine neuen (intern `sheet-ui/`).
Etappe 7: `SpreadsheetFactory`, `SpreadsheetParamIf`, `SpreadsheetOptionsIf`, `AreaModelSheet`, `AreaModelSheetHeader`,
`AreaModelLetterHeader`, `FormulaBar`, `FormulaBarOptionsIf`; API § 7.4 + `getSheetData`.

Additive Member an bestehenden Typen: `TableOptionsIf` (5 Optionen), `ColumnDefIf` (`editor`, `emptyValue`,
`cellFormulas`), `AreaModelIf.getInputValueAt?/setInputAt?/getStructureVersion?/getPhysicalRowIndex?`,
`AbstractAreaModel.defaultEditable`, `CellChangeIf.oldInput?/newInput?`,
`GeModelChangeEvent.structure?`, `EventListenerIf.onEditingChanged?/onUndoStackChanged?`, `AriaTextsIf` (§ 2.9),
`ExcelExportOptionsIf.cellFormulas?`, `CreateTableModelPara.columnLetters?`, `FormulaOptionsIf.references?` (intern).

---

## 10. Website, Training, Demo-Repo, Video (Etappe 8)

- **Website:** ein Showcase **`spreadsheet`** („Quote calculator“: Positionen, Menge × Preis, Rabatt per `IF`, Summe,
  MwSt., Formelleiste, Kontextmenü-Beispiel, Knöpfe Undo/Redo). `new-features.ts`: **ein** Eintrag „Spreadsheet mode“
  plus je ein kurzer Eintrag für Excel-Bedienung, Clipboard und Undo (sie wirken auch ohne Formeln) – vier Einträge.
  `why.astro`: Zeilen „Spreadsheet cell references (A1) & formula editor“ → ✔, Clipboard, Undo, Bereichsauswahl
  prüfen; „Rule of thumb“ anpassen; ehrlich bleiben bei dem, was fehlt (mehrere Blätter, Formatierung).
- **Training:** Kapitel **40 `spreadsheet`** in Teil 8 (eine Live-Demo, Abschnitte: Bedienung, Copy & Paste, Undo,
  Formeln, Formelleiste) + kurze `<Callout type="version">`-Abschnitte in Kapitel 31 `inline-editing`. Tag `ep-040`
  erst nach dem Release (🛑 Demo-Repo).
- **Demo-Repo:** neue Folge `ep-040` mit dem Showcase-Code (nach Freigabe und Release).
- **Video:** `videos/13-excel-im-browser/` – „Excel im Browser: Formeln, Copy & Paste, Undo – MIT-lizenziert“. Ablauf:
  Hook „Excel-Gefühl im Browser – ohne Enterprise-Lizenz?“ (0–8 s) → B2 als Code (8–40 s) → live: aus Excel kopieren,
  einfügen, `=SUM(` tippen mit Vorschlägen, Wert ändern, Strg+Z (40–55 s) → CTA (55–60 s). Vergleich nur sachlich
  (Handsontable kommerziell, HyperFormula GPLv3/kommerziell, ag-Grid Formeln/Clipboard Enterprise – vorher prüfen).
- **Angular-Demo:** nach dem Release (nutzt npm-Pakete).
- **Prüf- und Aufnahmeseiten je Etappe** (`apps/table-demo/`): `sheet-editing-spike.html` + `sheet-editing.html`
  (Etappe 1), `clipboard.html` (2), `undo.html` (3), `sheet-formulas.html` (5, mit 4C ab Etappe 6), `spreadsheet.html` (7);
  Einträge in `apps/table-demo/index.html`.

---

## 11. Risiken und offene Punkte

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Safari: `paste`/`copy` am nicht editierbaren Host | Einfügen per Tastatur geht nicht | Spike Etappe 1, Nachprüfung Etappe 2; Variante B (§ 2.10) |
| IME am nicht editierbaren Host (Windows MS-IME, macOS Japanisch) | „kあ“ statt „か“, Akzente fehlen | Spike am Anfang von Etappe 1, Variante B vorgeplant (§ 2.10) |
| Tab-Verhalten mit Screenreadern | Verwirrung trotz „keine Falle“ | NVDA/VoiceOver-Test Etappe 1, `aria-description` |
| Laufende Summen O(n²) | langsames Laden großer Blätter | Bench, Doku-Hinweis, Folgepunkt Präfix-Summen |
| Funktions-Semantik weicht von Excel ab | falsche Zahlen | LibreOffice-Referenzwerte, Unterschiede in der Doku |
| Paketgröße | +25–35 KB gzip | je Etappe messen; `sideEffects` als eigener Packaging-Punkt |
| Umfang (12–20 Sitzungen) | Kontextverlust | Abschnitt „Fortschritt“, Etappen-PRs, kleine Specs je Teil |
| Ändernde Daten von außen ohne `updateCells` | veraltete Formelwerte | `api.recalculate()`, Doku; bewusst kein Rechnen in `repaint()` |

Offen für die Etappen (nicht für die Freigabe): Namen einzelner `ActionId`s, exakte Defaults der Bench-Ziele,
LibreOffice im Container ja/nein (Etappe 4).

---

## 12. Fortschritt

| Etappe | Inhalt | Stand | Branch | PR | Funde / offen |
|---|---|---|---|---|---|
| 0 | Design | freigegeben (16.10.2026, zehn Kernentscheidungen) | `feat/spreadsheet-1-editing` (mit Etappe 1) | – | Review: 38 Befunde eingearbeitet (§ 13) |
| 1 | Teil 1 Bedienung | umgesetzt, lokal committet | `feat/spreadsheet-1-editing` | – | Spike: **Variante A** (Fokus bleibt am Host, Editor-Element über der Zelle, per `clip-path` statt versteckt). Review: 17 Befunde, alle eingearbeitet außer Strg+Pfeil ohne Obergrenze und Zeile als neues Objekt (→ TODO). Abweichungen: Editor behält die Zellbreite; Touch nur über `dblclick`. Offen (manuell, Seite `sheet-editing-spike.html`): IME macOS/Windows, tote Tasten Chrome/Firefox/Safari, NVDA/VoiceOver |
| 2 | Teil 2 Zwischenablage | umgesetzt, lokal committet | `feat/spreadsheet-2-clipboard` (von Etappe 1) | – | Variante A bestätigt: Proxy-`textarea` nur für den Tastendruck, echtes Strg+C in Chromium automatisiert geprüft; Menü-Kopieren/Einfügen über `document`-Events bei fokussiertem Host. Review: 22 Befunde, eingearbeitet bis auf „weggefilterte Ausschnittzeilen werden nicht geleert“ (gewollt) und Pipe über Spaltengrenzen (dokumentiert). Abweichungen: intern roh mit `validate`; ohne Pipe Umwandlung wie im Editor. Offen (manuell, `clipboard.html`): Rundreise Excel/Sheets/LibreOffice in Chrome, Firefox, Safari; Bildschirmleser beim Fokuswechsel |
| 3 | Teil 3 Undo/Redo | umgesetzt, lokal committet | `feat/spreadsheet-3-undo` (von Etappe 2) | – | U1–U6, U8–U13, U15 als Browser-Tests; U7 (Row Drag) bewusst nicht aufgezeichnet (§ 5.1), U14 folgt mit Teil 4. Review: 11 Befunde, eingearbeitet bis auf Auswahl als Rechteck und `addRows` leert den Verlauf (dokumentiert). Abweichung: Werte aus `onModelChanged`-Handlern werden dem Schritt zugeschlagen |
| 4 | Teil 4A Engine | umgesetzt, lokal committet | `feat/spreadsheet-4-engine` (von Etappe 3) | – | S1–S5, S17–S19, S21, S25, S26 (Property-Test, 5 Seeds), Fuzzing, 206 Fälle gegen LibreOffice 24.2 headless (eingecheckte JSON, Skript), Review mit 19 Befunden eingearbeitet (`sheet-review.spec.ts`). Bench: Laden 20 000 Formeln 245 ms (Ziel 150), Änderung mit 10 000 Abhängigen 20 ms (Ziel 30 ✓), `SUM(A:A)` 1 Mio. 61 ms (Ziel 50), laufende Summe 10 000 Zeilen 2,3 s je Änderung (Schätzung 0,5–2 s) → Präfix-Summen als Folgepunkt. Abweichung: `getFieldColumn` statt `getFieldValue` in `SheetDataSourceIf` |
| 5 | Teil 4B Formeln in der Tabelle | umgesetzt, lokal committet | `feat/spreadsheet-5-sheet` (von Etappe 4) | – | S3, S6–S13, S20, S22–S24 (`sheet-table.browser.spec.ts`, `table-sheet.spec.ts`, `excel-formula.spec.ts`). Abweichungen: `getPrecedents` liefert Adressen (`["B2", "C2"]`) statt Bereiche; S8 (Zeile löschen) kommt mit der API aus Etappe 7; Ausschneiden passt Bezüge auf die verschobenen Zellen noch nicht an |
| 6 | Teil 4C Formel-Eingabe | offen | `feat/spreadsheet-6-formula-input` | | |
| 7 | Teil 5 Spreadsheet-Modus | offen | `feat/spreadsheet-7-mode` | | |
| 8 | Website, Training, Demo-Repo, Video, Abschluss | offen | `feat/spreadsheet-8-site` | | |

Basis-Branch: jede Etappe von `main`; ist der PR der Vorgänger-Etappe noch offen, von deren Branch. Etappe 4 (DOM-frei)
darf parallel zu 2/3 laufen und geht von `main` ab. Der Spike (Etappe 1) trägt sein Ergebnis hier ein.

**Spike-Ergebnis (Etappe 1):** Variante A. Der Host behält den Fokus, bis getippt wird; das erste Zeichen öffnet den
Editor (`preventDefault` + Wert setzen), IME/tote Tasten öffnen ihn leer ohne `preventDefault`, damit der Browser die
Komposition ins neue Feld legt (Chromium automatisiert geprüft; Safari/Firefox und echte IMEs offen). Ein Editor ohne
Eingabe nach IME-Start schreibt nichts.

---

## 13. Review-Protokoll (unabhängiger Agent, 16.10.2026)

38 Befunde gegen Code und Prompt, alle bearbeitet. Wichtigste Änderungen gegenüber dem ersten Entwurf:

| Befund | Änderung | § |
|---|---|---|
| IME schaltet am nicht editierbaren Host nicht ein; tote Tasten | Spike zuerst, Varianten A/B, Entscheidung danach; `key === "Dead"` | 2.10, 3.3 |
| B1 rechnete mit Excel-Zeilen, Objekt-Daten haben keine Kopfzeile | `=B1*C1` im ersten Objekt | 8 |
| Formeltexte liefen durch `editInputPipe`/`validate` | roher Schreibweg `setInputAt` für Formeln | 2.2, 6.1 |
| Undo/internes Einfügen pipeten erneut | roher Schreibweg für `"undo"`/`"redo"`/interne Eingaben | 2.2, 4.2, 5.1 |
| `TableOptions.getEditRenderer` ist immer gesetzt | `DEFAULT_GET_EDIT_RENDERER` per Identität erkennen | 1, 3.2 |
| Editor als Kind des Grids (axe, Screenreader) | `aria-owns` von der aktiven Zelle | 3.8 |
| Getippte Zahlen blieben Text | `sheetInputPipe` als Default im Sheet-Modus | 4.2 |
| Excel-Export: Versatz, `_xlfn.`, Typen, Neuberechnung | `offsetReferences`, Präfixe, `t`, `fullCalcOnLoad` | 6.9 |
| 008-Semantik ≠ Excel (Präzedenz, Strings, Vergleich, Rundung) | Excel-Regeln mit `references: true`; 008 bleibt | 6.3, 6.5 |
| 008-Funktionssignaturen (`FLOOR`, `AVG`, `ISBLANK`) | eigene Excel-Varianten im Sheet-Modus | 6.7 |
| Andere APIs verschieben physische Zeilen | umleiten/sperren, `getStructureVersion` | 2.6 |
| Δ beim Verschieben aus Anzeige-Zeilen | Δ aus physischen Zeilen | 2.2 |
| Ausschneiden mit Formeln | Excel-Verschieben (`moveCells`) | 4.2, 6.8 |
| Mapping-Schichten überschrieben nicht (erster Treffer gewinnt) | Schlüssel harmonisieren (auch ohne Option, Release-Notes) | 1, 2.3 |
| Enter im Kopf, Shift+Leertaste, Leertaste vs. E13 | Kopf = `ACTIVATE_CELL`; Ausnahmen; Abweichung begründet | 2.3 |
| `visibility: hidden` verliert den Fokus | gerendert lassen, per `clip-path` schneiden | 3.2 |
| Commit bei `pointerdown` mit Repaint | `deferRepaint` bis `mouseup` | 3.2 |
| Proxy: Ansage bei Fokus-Rückgabe, großes TSV im `textarea` | Platzhalter + `setData`; Ansage im Spike prüfen | 2.10 |
| Undo ausgefilterter Zeilen / `RowsUndoable` / Blatt-Identität | `extraChanges`-Weg; Eingaben aller umgeschriebenen Formeln sichern; physischer Index + Log | 5.1 |
| Zeilennummern `original` bei dünnem Blatt | `getPhysicalRowIndex` | 1, 7.2 |
| Opt-out statt Opt-in, `'`-Präfix änderte Bestandsdaten | `cellFormulas.columns`; `'` nur vor `=` | 6.1 |
| `[field]`/`SUM([x])` in Zellformeln | nur Datenspalten; 008-Aggregat verboten | 6.3 |
| fehlende ARIA-Texte | `rangeSelected` u. a. | 2.9 |
| offene Fragen (eigener `CopyServiceIf`, `batchUndoable`, Zellgrenze Undo, Verschieben, Adressfeld, Browser-Kürzel, `getCellValue`, `getSheetData`, X8) | beantwortet | 2.3, 4.2, 5.1, 6.8, 6.9, 7.1, 7.2, 7.5 |
| `numberResult` rundet nicht; Kahn hinter Zyklen; Leistungsangaben; Zeilengrenze; Datums-Weitergabe, ISO-Text | korrigiert bzw. als Schätzung markiert | 6.4–6.6, 2.6 |
| Integration (Capture-Phase, `editing`-Flag, `data-*`-Attribute) | festgelegt | 3.2, 3.3 |
| Array-of-Arrays ohne Anhänge-API; Bestandsfehler `changeColumnOrder` (nur `filteredArr`) | v1 ohne; Fehler nach `TODO.md` | 4.2 |
| macOS ⌃+Pfeile, ⌘+D/R; Tippfehler und Unstimmigkeiten; Preset-Zusammenführung; Basis-Branch; Demo-Seiten | korrigiert | 2.1, 2.3, 10, 12 |

