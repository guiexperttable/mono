# TODO-Prompt 013: Tabellenkalkulation – ein Excel-ähnliches Grid

> Status: offen · angelegt 16.10.2026 · Slug `spreadsheet` · **ein** Design `prompts/013-tabellenkalkulation.design.md` ·
> Branches je Etappe `feat/spreadsheet-<n>-<kurz>` (z. B. `feat/spreadsheet-1-editing`)
> Abhängigkeiten (alle umgesetzt): 001 (ARIA), 003 (Zustand), 004 (Zeilennummern), 008 (Formel-Parser und -Auswerter
> ohne `eval`), 009 (Row Drag), 010 (Schreibstelle `applyCellChanges`, Änderungssätze, Fill-Handle, Batch-Edit), 012 (RTL).
> Markt: Handsontable (kommerzielle Lizenz), HyperFormula (GPLv3 oder kommerziell), Google Sheets, Excel im Web.
> ag-Grid: Bereichsauswahl, Clipboard und Formeln Enterprise; Editieren per Tastatur und Undo Community. Vor dem Video
> auf den Herstellerseiten prüfen.
> **Umfang XL** (grob 12–20 Sitzungen). Deshalb **ein** Design mit einem Haltepunkt, Umsetzung in **Etappen**, Website,
> Training, Demo-Repo und Video **einmal** am Ende.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht, was für dieses Feature dazukommt und wo es von 000
> abweicht (Abschnitt „Ablauf“).

---

## Auftrag

Anwender sollen ein Excel-ähnliches Grid nutzen können, ohne etwas zu konfigurieren: Inline-Editing, einfacher
Fokuswechsel, beim Bearbeiten den Wert markiert bzw. einfach drüber tippen, Formeln mit Funktionen und Zellbezügen wie
in Excel, Mehrfachauswahl, Copy & Paste, Undo. Vorbilder: handsontable.com (Data Grid, HyperFormula-Demos),
Google Sheets, Excel im Web.

Fünf Teile, die aufeinander aufbauen:

| Teil | Inhalt | Referenzfälle |
|---|---|---|
| 1 Bedienung | Lostippen, F2/Enter, Enter/Tab übernehmen und weiter, Shift/Strg+Pfeile, Entf, Strg+Enter, dauerhafter Editor | E1–E22 |
| 2 Zwischenablage | Kopieren, Ausschneiden, Einfügen mit Excel und Google Sheets | P1–P19 |
| 3 Undo/Redo | ein Schritt je Vorgang, API für eigene Knöpfe | U1–U15 |
| 4 Zellformeln | `=SUM(B2:B10)`, `$A$1`, Abhängigkeitsgraph, Zeigemodus, Vorschläge – in 4A Engine, 4B Tabelle, 4C Eingabe | S1–S26 |
| 5 Spreadsheet-Modus | alles in einer Zeile, Spaltenbuchstaben, Formelleiste, Zeilen/Spalten einfügen | X1–X13 |

## Ablauf (Abweichungen von 000)

| Etappe | Inhalt | Phasen aus 000 | Ergebnis |
|---|---|---|---|
| 0 | Design für **alle** Teile | 1 | `prompts/013-tabellenkalkulation.design.md` 🛑 Freigabe |
| 1 | Teil 1 Bedienung | 2–4 | PR |
| 2 | Teil 2 Zwischenablage | 2–4 | PR |
| 3 | Teil 3 Undo/Redo | 2–4 | PR |
| 4 | Teil 4A Engine (DOM-frei, darf parallel zu Etappe 2/3 laufen) | 2–4 | PR |
| 5 | Teil 4B Formeln in der Tabelle | 2–4 | PR |
| 6 | Teil 4C Formel-Eingabe | 2–4 | PR |
| 7 | Teil 5 Spreadsheet-Modus | 2–5 | PR |
| 8 | Website, Training, Demo-Repo, Video, Abschlussprüfung | 6–10 | 🛑 kein Deploy; Demo-Repo nur nach Freigabe |

- **Etappe 0** beantwortet die Fragen aller Teile in einem Dokument, zuerst die übergreifenden („Gemeinsame
  Entscheidungen“). Am Ende des Design-Dokuments steht ein Abschnitt **„Fortschritt“**: eine Zeile je Etappe (offen / in
  Arbeit / fertig, Branch, PR, Funde, offene Punkte).
- **Je Etappe:** Branch von `main` (vom Vorgänger, solange dessen PR offen ist); Tests zuerst rot, dann Code, dann grün;
  Kurz-Doku (JSDoc + `docs:check`, Abschnitt in `instructions.md`, `CLAUDE.md` §3, `TODO.md` Release-Notes); die
  Prüfungen aus 000 Phase 10 ohne die Website-Befehle; Review durch einen separaten Agenten (Schwerpunkte unten).
  Commit/PR nach Rückfrage – bei „baue selbständig“ ohne Haltepunkt zwischen den Etappen. Danach „Fortschritt“
  aktualisieren.
- **Jede Etappe ist releasefähig:** neue Optionen sind aus, bis man sie einschaltet; ohne Option bleibt das Verhalten
  wie 1.1.98. Ob nach einer Etappe released wird, entscheidet Marc (Release-Befehle im Etappen-Bericht nennen, 000
  Phase 10). `since` = Version, mit der die Etappe erscheint (`packages/table/package.json`; Stand 16.10.2026: 1.1.98 →
  nächste 1.1.99).
- **Sitzungswechsel sind eingeplant.** Neue Sitzung: „Lies `prompts/000-arbeitsweise.md` und
  `prompts/013-tabellenkalkulation.md` und setze die nächste offene Etappe fort.“ Die Sitzung liest dann das
  Design-Dokument samt „Fortschritt“ und prüft Branch und offene PRs.
- Website, Training und Video **nicht** je Etappe. Je Etappe nur eine Prüf- und Aufnahmeseite in `apps/table-demo/`.

## Gemeinsame Entscheidungen (Etappe 0, vor den Teilen)

1. **Optionen-Schnitt:** `tableOptions.editing`, `clipboard`, `undo`, Formeln (Name entscheiden, z. B. `sheet`), Preset
   `spreadsheet` – Namen, Defaults (alles aus), was das Preset einschaltet.
2. **`CellChangeSource`** einmal additiv erweitern: `"clear"`, `"paste"`, `"cut"`, `"undo"`, `"redo"` (in den
   Release-Notes als Typ-Erweiterung nennen).
3. **Tastenbelegung** als **eine** Tabelle (neue `ActionId`s, Windows und macOS) mit allen Konflikten: `ctrl+x` =
   `DESELECT_ALL`, Strg/⌘+D/R (Fill), Strg+Z im Editor, Tab und Tastaturfalle, Browser-Kürzel.
4. **Editor-Architektur** (Teil 1, Frage 2) zuerst – Teil 4C baut darauf (Zeigemodus, Farben, Vorschläge).
5. **Änderungssatz:** reicht `CellChangeIf` (010) für Einfügen, Ausschneiden (Quelle + Ziel), Undo, Formel-Rohtexte
   (Teil 4) und strukturelle Vorgänge (Teil 5)? Befehlsmuster `UndoableIf`.
6. **Roh- und Anzeigewert:** eine Begrifflichkeit für alle Teile (Editor, internes und externes Kopieren, Formelleiste,
   Undo speichert Rohwerte).
7. **Grenzen des Sheet-Modus:** welche Features dort aus sind (Baum, Row Groups, Pivot, Master/Detail, Spalten-Drag) –
   einmal entscheiden.
8. **Events und Wrapper:** neue Events (`editingChanged`, `undoStackChanged`, ggf. `sheetRecalculated`) gesammelt
   festlegen, damit die sieben Wrapper je Etappe nur einmal angepasst werden.
9. **ARIA-Texte** (`AriaTextsIf`) gesammelt, englische Defaults.

---

## Teil 1 – Excel-Bedienung (Etappe 1)

> Braucht 001, 010, 012. ag-Grid: Editieren per Tastatur Community, Bereichsauswahl Enterprise.

### Ziel

Bearbeiten soll sich anfühlen wie Excel bzw. Google Sheets, eingeschaltet mit **einer** Option:

- Zelle markieren und **lostippen** → Editor öffnet sich, der Inhalt wird ersetzt.
- F2, Doppelklick oder Enter → bearbeiten, Cursor am Ende.
- Enter/Tab übernehmen und gehen zur nächsten Zelle, mit Shift rückwärts; Escape verwirft.
- Pfeiltasten übernehmen im „Eingeben“-Modus und wechseln die Zelle (im „Bearbeiten“-Modus bewegen sie den Cursor).
- Shift+Pfeile erweitern die Auswahl, Strg+Pfeile springen an den Rand des Datenblocks.
- Entf leert die Auswahl, Strg+Enter schreibt eine Eingabe in alle markierten Zellen.
- Der Editor überlebt Scrollen, läuft unter strikter CSP, mit IME (Japanisch, Chinesisch) und auf Touch-Geräten.

Das ist die Grundlage für Teil 2 (Zwischenablage), Teil 3 (Undo), Teil 4 (Zellformeln) und Teil 5 (Spreadsheet-Modus).

### Befund (Code-Befund 16.10.2026, Version 1.1.98)

- **Editor öffnen:** nur F2 (`START_EDITING`) und Doppelklick (`MouseHandler.onHostElementDblClicked` →
  `TableScope.initRenderEditor`). Buchstaben öffnen nichts (`TODO.md`: „Optional: Excel-artig Enter bzw. Tippen startet
  das Editieren“). Enter = `ACTIVATE_CELL` (Checkbox, Baumknoten).
- **Editor = Zell-Renderer:** `InputCellRenderer` schreibt `<input>` per `innerHTML` in die Zelle, mit Inline-Handler
  `onfocus="this.setSelectionRange(…)"`. Das bricht unter einer strikten CSP (`script-src` ohne `'unsafe-inline'`) und
  markiert immer den ganzen Text (Excel bei F2: Cursor ans Ende). `SelectCellRenderer` analog prüfen.
- **Vermutlicher BUG:** Die Zelle wird bei jedem Repaint neu gebaut (`RenderScope.addAndRenderCellDiv`, ~Z. 2094: neuer
  Input, Wert aus Modell bzw. Batch). Tippen und dann scrollen (oder ein Repaint durch `updateCells`/Live-Daten) verliert
  den getippten Text. Scrollt die Zeile aus dem Bild, ist der Editor weg. **Zuerst roter Test.**
- **Übernehmen** nur über das `change`-Event (`InputHandler.onHostElementChanged` → `updateModelValueAfterEdit` →
  `applyCellChanges`). Danach bleibt der Fokus auf derselben Zelle. Tab verlässt die Tabelle (Browser-Default). Escape
  bricht ab (`cancelEditing`).
- **Tastatur:** `ShortcutService` lässt Tasten in Formularfeldern in Ruhe (gut), kennt aber kein Shift+Pfeil,
  Strg+Pfeil, Shift+Leertaste, Strg+Leertaste, Entf, Rücktaste. `ctrl+x` ist (Windows) auf `DESELECT_ALL` gemappt:
  Konflikt mit Ausschneiden in Teil 2.
- **Auswahl:** `SelectionModel` Typ `range` mit `CellRange`; der Shift-Klick-Anker sitzt im `SelectionService`, der Fokus
  getrennt im `FocusModel`. Für Shift+Pfeile fehlt ein Anker, der nicht von der Maus kommt.
- **Schreibstelle:** `TableScope.applyCellChanges(changes, source)` prüft `isEditable`, `editInputPipe`, `validate`,
  Batch-Modus, schreibt und meldet ein `onModelChanged`. Passt für Löschen und Strg+Enter.
- **ARIA:** Host `role="grid"` + `aria-activedescendant`; der Editor wird über `labelControl` benannt.

### Referenzfälle

Tabelle: 1000 Zeilen × 6 Spalten (Text, Zahl mit `editInputPipeForNumber`, Datum, Auswahlliste, Boolean, berechnete
Spalte `total`), Option `editing: true`, Selektionstyp `range`.

| # | Situation | Erwartung |
|---|---|---|
| E1 | Fokus B3 (Zahl 42), Taste `7` | Editor offen, Inhalt `7`, Cursor dahinter („Eingeben“-Modus) |
| E2 | F2 bzw. Doppelklick auf B3 | Editor mit `42`, Cursor am Ende („Bearbeiten“-Modus) |
| E3 | Im Editor Enter / Shift+Enter | übernommen (ein `onModelChanged`, `source: "edit"`), Fokus B4 / B2 |
| E4 | Im Editor Tab / Shift+Tab | übernommen, Fokus C3 / A3; in RTL in Leserichtung |
| E5 | Eingeben-Modus, Pfeiltasten | übernommen, Fokus wandert; im Bearbeiten-Modus bewegen sie den Cursor; F2 wechselt den Modus |
| E6 | Escape | alter Wert bleibt, kein Event (wie heute) |
| E7 | Enter ohne Editor auf editierbarer Zelle | Editor öffnet; Checkbox, Baumknoten, Gruppe behalten `ACTIVATE_CELL` |
| E8 | B2:C5 markiert, Entf | editierbare Zellen leer, nicht editierbare/berechnete übersprungen, **ein** Event `source: "clear"`, Ansage „8 cells cleared“ |
| E9 | Rücktaste auf einer Zelle | Editor öffnet leer (wie Excel) |
| E10 | Bereich markiert, `5` tippen, Strg+Enter | alle editierbaren Zellen des Bereichs = 5, ein Event |
| E11 | ab B3 dreimal Shift+↓, dann Shift+→ | Auswahl B3:C6, aktive Zelle bleibt B3, der Rand scrollt mit |
| E12 | Strg+↓ in einer Spalte mit Lücke | Ende des zusammenhängenden Blocks bzw. nächste gefüllte Zelle (Excel-Regel); Strg+Shift+↓ erweitert bis dorthin |
| E13 | Shift+Leertaste / Strg+Leertaste | ganze Zeile / ganze Spalte markiert (Leertaste allein bleibt `TOGGLE_SELECTION`) |
| E14 | Tippen, dann 2000 Zeilen weg- und zurückscrollen | Text noch da, Editor wieder an seiner Zelle; Enter übernimmt |
| E15 | Während des Editierens auf andere Zelle klicken | übernommen, neue Zelle fokussiert |
| E16 | IME (Japanisch) auf fokussierter Zelle | Komposition landet vollständig im Editor, kein verlorenes erstes Zeichen |
| E17 | Strikte CSP `script-src 'self'` | Editor funktioniert, keine CSP-Verletzung |
| E18 | Nicht editierbare Zelle, Taste `a` | kein Editor; optional Ansage „read only“ |
| E19 | Auswahllisten-Spalte: Alt+↓ bzw. Tippen | Liste öffnet bzw. springt zum ersten passenden Eintrag |
| E20 | Boolean-Spalte: Leertaste | schaltet um (ein Event), kein Editor |
| E21 | Option aus (Default) | Verhalten wie 1.1.98: Enter = `ACTIVATE_CELL`, Tab verlässt die Tabelle, Buchstaben tun nichts |
| E22 | Touch: Doppeltipp | Editor mit Bildschirmtastatur, „Fertig“ übernimmt |

### Entscheidungsfragen

1. **Einschalten:** `tableOptions.editing?: boolean | Partial<EditingOptionsIf>` mit z. B. `startOnType`, `enterKey`
   („edit“ oder „moveDown“), `enterMoves` (down/right/none), `tabMoves`, `arrowKeysCommit`, `clearKeys`,
   `fillSelectionWithCtrlEnter`, `selectTextOnEdit`. Default aus (E21). Was setzt das Preset aus Teil 5?
2. **Editor-Architektur:** (a) weiter im Zell-DOM, Repaint-Problem (E14) über einen Wert-Puffer lösen, oder (b) **ein
   dauerhaftes Editor-Element im Host** (wie Fill-Handle und Detail-Ebene: Lage über `getBodyCellRectInHost()`, gesetzt
   in `afterRenderPass()`, versteckt statt zerstört, wenn die Zelle herausscrollt). Empfehlung (b), weil es E14, E16 und
   E17 zusammen löst. Kompatibel: eigene `getEditRenderer` laufen weiter im Zell-DOM; neue Schnittstelle `CellEditorIf`
   (`open(ctx)`, `getValue()`, `setValue()`, `focus(mode)`, `close()`, `isComposing()`), eingebaut `TextCellEditor`,
   `NumberCellEditor`, `SelectCellEditor`, `DateCellEditor`; neues `ColumnDef.editor` neben `getEditRenderer`.
3. **Tippen und IME:** Ein `keydown` am Host reicht für Latein und AltGr, nicht für IME (`compositionstart` kommt nur in
   editierbaren Elementen). (a) Editor bei `keydown` mit druckbarem Zeichen öffnen und das Zeichen übernehmen; bei
   `key === "Process"`/`isComposing` den Editor leer öffnen und fokussieren, bevor die Komposition beginnt. (b) Ein
   unsichtbares, ständig fokussiertes `textarea` (Handsontable, Google Sheets): dann muss der Grid-Fokus
   (`aria-activedescendant`) anders laufen. Empfehlung (a), mit Browser-Spec (`CompositionEvent`) und manuellem Test
   (macOS Japanisch, Windows Chinesisch) absichern; (b) nur, wenn (a) scheitert.
4. **Enter:** startet Enter das Editieren (Sheets, Handsontable) oder geht es nach unten (Excel)? Empfehlung: Option
   `enterKey`, Default „edit“; `ACTIVATE_CELL` für Checkbox/Baum/Gruppe hat Vorrang.
5. **Tab und Barrierefreiheit:** Die Tabelle ist heute **ein** Tab-Stopp (APG-Grid). Tab von Zelle zu Zelle darf keine
   Tastaturfalle werden (WCAG 2.1.2). Optionen: Tab nur bei offenem Editor; Tab immer, Verlassen über die letzte Zelle
   bzw. Escape+Tab oder F6; Hinweis in `aria-description` des Grids. Empfehlung begründen, mit Screenreader prüfen.
6. **Strg+Pfeil** (E12) DOM-frei (`findDataEdge(model, row, col, direction)`) über die **angezeigten** Zeilen. Kosten bei
   2 Mio. Zeilen (lineare Suche über `getValueAt`)? Was gilt als leer (`""`, `null`, `undefined`; `0` nicht)? Auch
   Shift+Pos1/Ende und Shift+Bild↑/↓?
7. **Anker:** Shift+Pfeil und Shift-Klick teilen sich einen Anker (heute im `SelectionService`). Bei mehreren Bereichen
   (Strg-Klick) ändert Shift+Pfeil nur den letzten (Excel).
8. **Löschen** (E8/E9): `CellChangeSource` additiv um `"clear"` erweitern (in den Release-Notes nennen: ein
   erschöpfendes `switch` beim Anwender meckert). Leerwert `""`, `null` oder neues `ColumnDef.emptyValue`?
9. **Ansagen und Rollen:** neue `AriaTextsIf`-Texte (z. B. `cellsCleared`, `readOnlyCell`), `aria-readonly` an nicht
   editierbaren Zellen, sobald `editing` an ist (APG-Grid mit Editieren).
10. **Events:** ag-Grid hat `cellEditingStarted/Stopped`. Empfehlung: `onEditingChanged?(GeEditEvent)` additiv,
    Wrapper-Event `editingChanged` in allen sieben Wrappern.

### Tests

- Unit: `findDataEdge` (Lücken, Ränder, leere Werte, versteckte Spalten), Auswahl-Erweiterung (Anker, mehrere Bereiche),
  Optionen-Defaults.
- Browser `sheet-editing/sheet-editing.browser.spec.ts`: E1–E21 mit den Fake-KeyboardEvents aus `test-utils`; E14 mit
  `scrollToIndex` + `nextFrame`; E16 mit `CompositionEvent`; E17 als Prüfung „kein `on*`-Attribut im Editor-DOM“ plus
  eine Testseite mit Meta-CSP; RTL (E4); Master/Detail (Tasten im Detail unberührt); Batch-Edit (übernommen =
  vorgemerkt); Overlay „Loading“ blockiert Tippen.
- E21: die bestehenden `keyboard`- und `editing`-Specs bleiben **unverändert** grün.
- Roter Test zuerst für den Textverlust beim Repaint (gilt auch ohne Option).
- axe: Grid mit offenem Editor, `aria-readonly`. Wrapper-Smoke React + Web Component: Tippen → `modelChanged`.

### Hinweise

- Ordner `src/lib/table/sheet-editing/`: `editing-options.if.ts`, `cell-editor.if.ts`, `cell-editor-service.ts`
  (`tableScope.cellEditorService`, `@category Internals`), `editors/*.ts`, `sheet-navigation.ts` (DOM-frei).
- Neue `ActionId`s additiv (z. B. `EXTEND_SELECTION_UP/DOWN/LEFT/RIGHT`, `NAVIGATE_DATA_EDGE_*`,
  `EXTEND_TO_DATA_EDGE_*`, `SELECT_ROW`, `SELECT_COLUMN`, `CLEAR_CELLS`), Mappings Windows und macOS (⌘ statt Strg),
  `harmonizeShortcut` für „shift+up“ prüfen.
- Editor-DOM nur über `DomServiceIf`, Werte über die `value`-Property, nie `innerHTML`, keine `on*`-Attribute. Das
  Inline-`onfocus` im `InputCellRenderer` auch ohne Option durch `addEventListener` ersetzen.
- Lage logisch über `dom.setStyle(…, 'left', …)` (RTL), fixierte Spalten, variable Zeilenhöhen und Detailzeilen
  beachten; z-index unter dem Overlay, über dem Fokusrahmen.
- Übernehmen über `applyCellChanges` (`source: "edit"`), danach Navigation über `changeFocusCell` /
  `ensureRowIsVisible`. `destroy()` räumt Editor und Listener ab.

---

## Teil 2 – Zwischenablage (Etappe 2)

> Braucht Teil 1 (Tastatur-Auswahl, Ansagen, `"clear"`), 010, 004. ag-Grid: Clipboard Enterprise.

### Ziel

Daten zwischen der Tabelle und Excel, Google Sheets, LibreOffice oder einem Texteditor hin- und herkopieren, wie
Anwender es erwarten: Strg/⌘+C, +X, +V. Ein Wert in einen markierten Bereich, Bereiche kacheln, am Ende optional neue
Zeilen anlegen. Alles läuft über die eine Schreibstelle (Prüfungen, Batch, ein Event) und wird in Teil 3 rückgängig machbar.

### Befund (Code-Befund 16.10.2026)

- `CopyService.createContent` baut TSV aus `getTextValueAt` (angezeigter Text), Trennzeichen `\t`/`\n`, **ohne
  Quoting**: eine Zelle mit Tab, Zeilenumbruch oder Anführungszeichen zerreißt die Struktur in Excel.
  `copyContent` nutzt `navigator.clipboard.writeText` (asynchron) → nur `text/plain`, kein `text/html`.
  `maxCopyCells` = 1 Mio. Eigene `CopyServiceIf` kann man dem `TableScope` übergeben.
- **Einfügen und Ausschneiden fehlen** (`TODO.md`, Folgepunkte 010). `ctrl+x` ist auf `DESELECT_ALL` gemappt.
- `getTextValueAt` liefert formatierten Text (z. B. „1,234.50 €“); der Rückweg braucht einen Parser (`editInputPipe`).
- Fill (010) hat die Regeln „angezeigte Zeilen in Anzeigereihenfolge“, „nicht Editierbares überspringen“ – gleiche
  Regeln hier.

### Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| P1 | B2:C3 kopieren, in Excel einfügen | 2×2 Zellen; Zahlen kommen als Zahlen an |
| P2 | Zelle mit Tab, Zeilenumbruch, `"x"` | in Excel jeweils **eine** Zelle (Quoting mit `"…"`, `""`) |
| P3 | 3×2 aus Excel kopiert, Fokus D5, Strg+V | D5:E7 befüllt, ein Event `source: "paste"`, Auswahl = eingefügter Bereich, Ansage „6 cells pasted“ |
| P4 | ein Wert kopiert, B2:B10 markiert, einfügen | alle 9 Zellen |
| P5 | 2 Zeilen kopiert, 6 Zeilen markiert | gekachelt (dreimal); nicht teilbar → einmal (Excel) |
| P6 | über die letzte Spalte hinaus | abgeschnitten, Ansage nennt die ausgelassenen Zellen |
| P7 | über die letzte Zeile hinaus | Option `pasteAddsRows` + `createRow()`: neue Zeilen; sonst abgeschnitten |
| P8 | Ziel mit nicht editierbaren, berechneten, versteckten Spalten | übersprungen; versteckte Spalten zählen nicht (Anzeige) |
| P9 | gefiltert und sortiert | angezeigte Zeilen in Anzeigereihenfolge (wie Fill H7) |
| P10 | „1.234,56“ in Zahlenspalte, Locale de-DE | 1234.56 über die Zahlen-Pipe mit Locale |
| P11 | Wert scheitert an `validate` | Zelle übersprungen und angesagt, Rest eingefügt |
| P12 | B2:B4 ausschneiden, in D2 einfügen | B2:B4 leer, D2:D4 Werte, **ein** Event `source: "cut"`, gestrichelter Rahmen bis Einfügen/Escape |
| P13 | Batch-Edit aktiv | eingefügt = vorgemerkt |
| P14 | 100.000 Zellen einfügen | < 1 s (Bench), darüber `maxPasteCells` mit Ansage |
| P15 | `text/html` mit `<img src=x onerror=alert(1)>` | als Text, kein Element, kein Script |
| P16 | Strg+V im offenen Editor | gehört dem Editor (Browser) |
| P17 | `api.pasteText("a\tb\n1\t2")`, `api.getSelectionAsText()` | wie die Tastatur, ohne Zwischenablage-Rechte |
| P18 | aus Google Sheets (`text/html` + `text/plain`) | Werte korrekt, auch leere Zellen |
| P19 | Option aus (Default) | Strg+C wie 1.1.98; Strg+V/X tun nichts |

### Entscheidungsfragen

1. **Ereignisse:** `copy`/`cut`/`paste`-Events am Host (synchron, `clipboardData`, keine Berechtigungsabfrage, alle
   Browser) statt `navigator.clipboard.*`. Strg+C dann über das `copy`-Event; `api.copyToClipboard()` bleibt (async API).
   Was heißt das für eigene `CopyServiceIf`-Implementierungen (additiv erweitern, alte Methoden weiter aufrufen)?
2. **Formate beim Kopieren:** `text/plain` TSV mit Excel-Quoting + `text/html` `<table>` (escaped)? Inhalt angezeigter
   Text (heute) oder Rohwert (Zahl ohne Tausendertrenner, ISO-Datum)? Option `copyValue` („text“ oder „raw“).
   Kopieren innerhalb der Tabelle behält Rohwerte (und in Teil 4 Formeln) über einen Speicher im Speicher, erkannt am Text.
3. **Formate beim Einfügen:** nur `text/plain` (robust) oder auch `text/html` (Excel/Sheets liefern `<table>`)?
   Empfehlung: `text/plain`, HTML nur ohne `text/plain`; HTML per `DOMParser` (inertes Dokument), nur `textContent`.
4. **TSV DOM-frei** (`clipboard/tsv.ts`: `parseTsv`, `toTsv`): CRLF, abschließender Zeilenumbruch, Anführungszeichen,
   ungleich lange Zeilen, BOM, Excel-Eigenheiten (eine Zelle mit Zeilenumbruch).
5. **Umwandlung:** `editInputPipe` (vorhanden) oder neues `ColumnDef.parseValue?(text, ctx)`? Eingebaute Pipes für
   Zahl (Locale), Datum, Boolean. Was passiert ohne Pipe (Text bleibt Text)?
6. **Ziel-Regeln** P4–P7 wie Excel; `pasteAddsRows` + `createRow(index)` nur für Objekt-Arrays und Array-of-Arrays.
7. **Ausschneiden:** Rahmen `ge-table-cut-range` (eigene Ebene, `aria-hidden`, Ansage); geleert wird erst beim Einfügen
   (Excel), ein Änderungssatz für Quelle und Ziel. Konflikt `ctrl+x` → `DESELECT_ALL`: nur bei eingeschaltetem
   `clipboard` umbelegen (kein Breaking Change) oder grundsätzlich? In den Release-Notes nennen.
8. **Mehrere Bereiche:** Excel lehnt nicht ausgerichtete ab, Sheets nimmt den letzten. Empfehlung.
9. **Optionen:** `tableOptions.clipboard?: boolean | Partial<ClipboardOptionsIf>` (`copyHeaders`, `copyValue`,
   `pasteAddsRows`, `createRow`, `maxPasteCells`, `processPaste(ctx)` zum Ändern/Ablehnen, `processCopy(ctx)`).
   `CellChangeSource` additiv `"paste"`, `"cut"`.
10. **Formeln (Teil 4):** intern kopiert = Formeln mit verschobenen relativen Bezügen; nach außen = Werte; eingefügter Text
    mit führendem `=` ist nur im Sheet-Modus eine Formel. Hier nur die Naht (`ClipboardCellIf { raw, text }`) vorsehen.

### Tests

- Unit: `parseTsv`/`toTsv` als Tabelle (Hin und zurück gleich, Excel-Beispiele als Fixture mit echten Zwischenablage-
  Inhalten aus Excel, Sheets, LibreOffice), Ziel-Regeln (Kacheln, Abschneiden, Anhängen), Locale-Pipes.
- Browser: `ClipboardEvent` mit `DataTransfer` (P3–P13, P15–P19), Event-Anzahl, Auswahl danach, Batch, RTL, gefiltert.
- HTML-Injection P15, Bench P14 (`bench/clipboard.bench.ts`). Wrapper-Smoke: `modelChanged` mit `source: "paste"`.
- Manuell (Protokoll im Design-Dokument): Chrome, Firefox, Safari jeweils Excel ↔ Tabelle ↔ Sheets.

### Hinweise

- Ordner `src/lib/table/clipboard/` (`clipboard-options.if.ts`, `clipboard-service.ts` als `tableScope.clipboardService`,
  `tsv.ts`, `paste-plan.ts` DOM-frei: Matrix + Ziel → `CellValueChangeIf[]`).
- Einfügen läuft über `applyCellChanges(…, "paste")`, Ausschneiden über **einen** Aufruf mit Quelle (leeren) und Ziel.
- Listener über `listenerAbortController`; Events in Detailzeilen ignorieren (`isEventInDetail`).

---

## Teil 3 – Undo/Redo (Etappe 3)

> Braucht 010, Teil 1, Teil 2, 009 (falls Zeilen verschieben aufgenommen wird). ag-Grid: Community – kein „ohne Enterprise“.

### Ziel

Strg/⌘+Z nimmt den letzten Vorgang zurück, Strg+Y bzw. Strg/⌘+Shift+Z stellt ihn wieder her. Ein Vorgang ist das, was
der Anwender als **eine** Aktion erlebt: ein Edit, eine Füllung, ein Einfügen, ein Löschen eines Bereichs. Die API
erlaubt eigene Knöpfe („Rückgängig“ in der Werkzeugleiste der App).

### Befund (Code-Befund 16.10.2026)

- Kein Undo. 010 hat dafür vorgesorgt: **eine** Schreibstelle `TableScope.applyCellChanges` /
  `writeCellsInternal`, Ergebnis `CellChangeIf[]` (row, rowIndex, columnIndex, property, oldValue, newValue),
  `source` „edit“, „fill“, „commit“, „api“ (+ „clear“ aus Teil 1, „paste“/„cut“ aus Teil 2).
- Batch-Edit: `PendingCellChanges` ordnet über das Zeilenobjekt zu (TreeRow → `data`, ohne Objekte Index).
- Row Drag (009) verschiebt Zeilen in place (`moveRows`), Sortieren sortiert teils in place.
- Externe Änderungen: `updateCells`, `setRows`, Live-Daten der App – nicht über die Schreibstelle.

### Referenzfälle

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
| U14 | Formel geändert (Teil 4) | alter Formeltext zurück, Neuberechnung folgt |
| U15 | Option aus (Default) | Strg+Z tut nichts (wie heute) |

### Entscheidungsfragen

1. **Umfang:** nur Zelländerungen oder auch Zeilen verschieben (009) und später Zeilen/Spalten einfügen/löschen (Teil 5)?
   Empfehlung: Befehlsmuster `UndoableIf { label, undo(), redo() }`, v1 mit Zellen + Zeilen verschieben; Teil 5 ergänzt
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

### Tests

- Unit: `UndoStack` (DOM-frei: push, undo, redo, Grenze, Redo-Verwerfen, Zusammenfassen), Zuordnung nach Sortierung.
- Browser: U1–U15 mit allen Quellen aus 010/Teil 1/Teil 2, Fokus/Scroll nach Undo, Batch, Row Drag, RTL egal.
- Wrapper-Smoke: `undoStackChanged` in React + Web Component.

### Hinweise

- Ordner `src/lib/table/undo/` (`undo-stack.ts`, `undoable.if.ts`, `undo-options.if.ts`, `undo-service.ts` als
  `tableScope.undoService`). Undo schreibt über `applyCellChanges(…, "undo")` (Prüfungen bleiben, aber ohne neue
  Aufzeichnung).
- Neue `ActionId`s `UNDO`, `REDO`; Mappings Windows/macOS.

---

## Teil 4 – Zellformeln mit Bezügen (Etappen 4–6)

> Braucht 008, Teil 1 (Editor), Teil 2 (Kopieren), Teil 3 (Undo), 010 (Fill), 004. Lieferbar als 4A Engine → 4B Tabelle → 4C Eingabe. ag-Grid: Formulas Enterprise; HyperFormula GPLv3 oder kommerziell.

### Ziel

Zellen enthalten Formeln wie in Excel: `=B2*C2`, `=SUM(D2:D100)`, `=$F$1*D2`, `=IF(E2>100,"high","low")`,
`=VLOOKUP("Mouse",A2:C4,2,FALSE)`. Ändert sich eine Zelle, rechnet die Tabelle **nur die abhängigen** Zellen neu.
Relative und absolute Bezüge verhalten sich beim Füllen, Kopieren und beim Einfügen/Löschen von Zeilen wie in Excel.
Fehlerwerte statt Exceptions, Zirkelbezüge werden erkannt. Bei der Eingabe: Bezüge per Klick/Pfeil, farbige Rahmen,
Funktionsvorschläge.

Abgrenzung zu 008: Dort rechnet eine **Spalte** mit Feldern derselben Zeile (`[price] * [quantity]`). Das bleibt
unverändert und wird in Zellformeln als strukturierter Bezug weiter nutzbar.

### Befund (Code-Befund 16.10.2026)

- `formula/` (008): `compileFormula(source, { functions })` → Tokenizer → Pratt-Parser → AST mit den Knoten `literal`,
  `field`, `unary`, `binary`, `call` → Closures (`FormulaEvaluator`), kein `eval`/`new Function`, Länge ≤ 10 000,
  Tiefe ≤ 64. Rund 25 Funktionen (`IF`, `IFERROR`, `AND`, `OR`, `NOT`, `ABS`, `ROUND`, `MOD`, `POWER`, `SQRT`, `FLOOR`,
  `CEILING`, `CONCAT`, `LEN`, `UPPER`, `LOWER`, `TRIM`, `ISBLANK`; `SUM/AVG/MIN/MAX/COUNT([x])` = Spalten-Aggregat).
  Fehler `FormulaError` (`#DIV/0!`, `#NAME?`, `#VALUE!`, `#CIRC!`, `#ERROR!`), CSS `ge-table-cell-error`, Tooltip.
- **Keine Zellbezüge, kein Abhängigkeitsgraph:** Werte je Zeile lazy über `ColumnValues` (`calc/column-values.ts`).
- Website `why.astro`, Zeile „Spreadsheet cell references (A1) & formula editor“: bei uns „–“.
- Reihenfolge: `AreaModelObjectArray.doSort` sortiert `filteredRows` (Kopie), `getAllRows()` bleibt in Quellreihenfolge
  → **stabile physische Adresse** = Index in `getAllRows()`. Aber Row Drag (009) schreibt die Reihenfolge in place in die
  Zeilen der Anwendung → im Sheet-Modus ist das ein „Zeilen verschieben“ mit Bezugsanpassung.
- Zeilennummern (004) können die Quellnummer zeigen (`original`) – passt zu physischen Adressen.
- Spaltenbuchstaben gibt es nicht. Excel-Writer (`ExcelService`) schreibt Werte, `ExcelFormattedValueIf` mit Zahlenformat.

### Referenzfälle

Blatt (Zeile 1 = Kopf als Daten, wie in Excel):

| | A | B | C | D |
|---|---|---|---|---|
| 1 | Product | Price | Qty | Total |
| 2 | Laptop | 1299 | 2 | `=B2*C2` |
| 3 | Monitor | 349 | 3 | `=B3*C3` |
| 4 | Mouse | 25 | 10 | `=B4*C4` |
| 5 | | | | `=SUM(D2:D4)` |

| # | Teil | Situation | Erwartung |
|---|---|---|---|
| S1 | 4A | Werte D2:D4 | 2598, 1047, 250 |
| S2 | 4A | D5 | 3895 |
| S3 | 4A/4B | B4 auf 30 | D4 300, D5 3945; nur D4 und D5 neu berechnet (Zähler im Test) |
| S4 | 4A | `=B2/0`, `=FOO(1)`, `=B2+"x"`, `=SUM(` | `#DIV/0!`, `#NAME?`, `#VALUE!`, `#ERROR!` |
| S5 | 4A | A7 `=B7`, B7 `=A7` | beide `#CIRC!`; Auflösen des Zyklus rechnet wieder |
| S6 | 4B | Fill-Handle D2 nach unten | D3 `=B3*C3` …; `$B$1` bleibt `$B$1` |
| S7 | 4B | D2 kopieren, in E3 einfügen | `=C3*D3`; Bezug außerhalb des Blatts → `#REF!` |
| S8 | 4B | Zeile 3 löschen (API aus Teil 5) | `=SUM(D2:D4)` → `=SUM(D2:D3)`, `=B3` → `#REF!` |
| S9 | 4B | nach Price sortieren | alle Werte stimmen (Bezüge hängen an der physischen Zeile); Zeilennummern zeigen 4, 3, 2 |
| S10 | 4B | Filter blendet Zeile 3 aus | `SUM(D2:D4)` zählt sie weiter (wie Excel; `SUBTOTAL` später) |
| S11 | 4B | Spalte C per Drag verschieben | wie entschieden (Buchstabe wandert mit oder Spalten-Drag im Sheet aus) |
| S12 | 4B | `=1+1` in einer Spalte ohne Formeln; `'=1+1` | Text; Text „=1+1“ |
| S13 | 4B/4C | F2 auf D2 | Editor zeigt `=B2*C2`, die Zelle 2598 |
| S14 | 4C | `=` tippen, Pfeil bzw. Klick auf B2, Shift+↓↓, F4 | `=B2`, dann `=B2:B4`, F4 → `$B$2:$B$4` |
| S15 | 4C | Formel mit drei Bezügen bearbeiten | drei farbige Rahmen, Farbe = Farbe im Editor-Text |
| S16 | 4C | `=SU` tippen | Liste `SUBSTITUTE`, `SUM`, `SUMIF` …; Tab übernimmt; Hinweis `SUM(number1, [number2], …)` |
| S17 | 4A | `=VLOOKUP("Mouse",A2:C4,2,FALSE)`, `=SUMIF(A2:A4,"M*",D2:D4)` | 25; 1297 |
| S18 | 4A | 1000 × 26 Zellen mit 20 000 Formeln laden; eine Zelle mit 10 000 Abhängigen ändern; `=SUM(A:A)` bei 1 Mio. Zeilen | Bench (Ziele im Design); `A:A` ohne 1 Mio. Einzelkanten |
| S19 | 4A | `TODAY()`, `NOW()`, `RAND()` | volatil: bei jeder Neuberechnung neu |
| S20 | 4B | Excel-Export | Option: Werte (Default) oder echte Formeln `<f>` mit gecachtem `<v>`; in Excel/LibreOffice gleiche Ergebnisse |
| S21 | 4A | `=constructor`, `=__proto__`, `=A1.constructor`, `=SUM(A1:XFD1048576)` | Fehlerwert, kein Code; Riesenbereich gekappt |
| S22 | 4B | Strg+Z nach Formeländerung (Teil 3) | alte Formel und Werte zurück |
| S23 | 4B | Summenzeile (005), Sortieren, Copy, Excel-Export | nutzen die berechneten Werte |
| S24 | 4B | Daten der Anwendung nach Eingabe von `=B2*C2` | enthalten den Text `"=B2*C2"`; `api.getCellValue` liefert 2598 |
| S25 | 4A/4B | `="<img src=x onerror=alert(1)>"` | als Text angezeigt, kein Element |
| S26 | 4A | Inkrementell vs. komplett | nach jeder zufälligen Änderungsfolge (fester Seed) gleiche Werte wie eine Neuberechnung von vorn |

### Entscheidungsfragen

**4A – Engine (DOM-frei)**

1. **Ablage:** (a) in den Daten der Anwendung als Text mit führendem `=` (Weg von Handsontable/HyperFormula: Speichern =
   Daten speichern, S24) oder (b) eigener Formel-Speicher neben den Daten. Empfehlung (a). Opt-in je Tabelle und je
   Spalte, damit ein Produkttext „=…“ nicht plötzlich rechnet; `'` am Anfang = Text.
2. **Adressierung (Kern):** Zeilen nach **physischer** Reihenfolge (`getAllRows()`, sichtbar über Zeilennummern
   `original`) oder nach Anzeigereihenfolge (bricht bei Sortieren/Filtern)? Empfehlung physisch (S9/S10). Spalten: ein
   Buchstabe je **Datenspalte** in Erzeugungsreihenfolge, fest an der Property; Zeilennummer, Checkbox, Gruppen-Spalte
   zählen nicht. Spalten-Drag: Buchstabe wandert mit (Anzeige) oder Excel-artiges Verschieben mit Umschreiben oder im
   Sheet-Modus aus (S11). Row Drag = Zeilen verschieben mit Umschreiben.
3. **Strukturierte Bezüge:** `[price]` (008, gleiche Zeile) auch in Zellformeln, wie `[@Price]` in Excel-Tabellen.
4. **Datenquelle:** Engine generisch über `SheetDataSourceIf` (`getRaw(row, col)`, `setRaw`, `getRowCount`,
   `getColumnCount`, Property ↔ Spalte), Adapter für `AreaModelObjectArray` und `AreaModelArrayOfArrays`; das dünn
   besetzte Blatt-Modell kommt mit Teil 5. Baum, Row Groups, Pivot, Master/Detail im Sheet-Modus nicht (Warnung, wie 011).
5. **Grammatik additiv** (008 bleibt bit-gleich, Specs): AST-Knoten `ref` (Zeile, Spalte, je absolut ja/nein), `range`
   (inkl. `A:A`, `1:1`), `error` (`#REF!`), Operator `%` (Postfix) und `:`. Argument-Trenner `,`; `;` (deutsches Excel)
   nur mit `formulaLocale: "de"` und dann Dezimalkomma? Funktionsnamen englisch in v1.
6. **Abhängigkeitsgraph und Neuberechnung:** Vorgänger je Formelzelle; Rückwärtsindex für Einzelbezüge und ein
   **Intervall-Index je Spalte** für Bereiche (keine Kante je Zelle, S18); Neuberechnung = transitive Abhängige markieren
   → topologisch auswerten, Zyklen über starke Zusammenhangskomponenten → `#CIRC!`; volatile Funktionen; Erstladung in
   einem Durchlauf. Synchron oder in Abschnitten (`requestIdleCallback`) bei sehr großen Mengen? Empfehlung synchron +
   Bench, Abschnitte nur bei Bedarf. Speicher je Formelzelle schätzen.
7. **Wertsemantik wie Excel:** leere Zelle = 0 bzw. „“, Text in Arithmetik (`"3"+1` = 4), Booleans, Fehlerweitergabe,
   15 signifikante Stellen. **Datum:** JS-`Date`/ISO-Text oder Excel-Seriennummer (für `=A2+1`, `DATEDIF`, Export)?
8. **Funktionsbibliothek Stufe 1** (~60, Rest später): Mathe (`SUM`, `SUMPRODUCT`, `ROUND`, `ROUNDUP`, `ROUNDDOWN`, `INT`,
   `AVERAGE`, `COUNT`, `COUNTA`, `COUNTBLANK`, `MIN`, `MAX`), bedingt (`SUMIF(S)`, `COUNTIF(S)`, `AVERAGEIF(S)` mit
   Kriterien `">5"`, `"M*"`), Logik (`IF`, `IFS`, `IFERROR`, `SWITCH`, `XOR`), Suche (`VLOOKUP`, `HLOOKUP`, `XLOOKUP`,
   `INDEX`, `MATCH`), Text (`TEXTJOIN`, `LEFT`, `RIGHT`, `MID`, `FIND`, `SEARCH`, `SUBSTITUTE`, `VALUE`, `TEXT` als
   Teilmenge), Datum (`TODAY`, `NOW`, `DATE`, `YEAR`, `MONTH`, `DAY`, `WEEKDAY`, `EOMONTH`), Info (`ISNUMBER`, `ISTEXT`,
   `ISERROR`, `NA`). Bereichs-Argumente als 2D-`FormulaRange` auch für eigene Funktionen (`FormulaOptionsIf.functions`
   additiv). Erwartungswerte aus LibreOffice (headless) mit einer festen Testmappe, Erzeugung dokumentiert.
9. **Bezüge verschieben** DOM-frei: `shiftFormula(source, dRow, dCol)` (Fill, Kopieren), `adjustFormula(source, edit)`
   für Zeilen/Spalten einfügen, löschen, verschieben (`#REF!`).
10. **Naht `FormulaEngineIf`:** Anwender könnten eine fremde Engine (z. B. HyperFormula mit eigener Lizenz) anschließen;
    der Core liefert nur die eigene. Lohnt der Aufwand? Empfehlung.

**4B – Tabelle**

11. **Anzeige und Editor:** `getValueAt` = berechneter Wert, neuer Rohwert (`getRawValueAt` o. ä.) für Editor und
    Formelleiste; Sortieren, Filter, Footer, Copy, Excel nutzen Werte (S23).
12. **Schreiben:** `applyCellChanges` → Engine → Neuberechnung → nur geänderte abhängige Zellen neu zeichnen. Meldet
    `onModelChanged` die abhängigen Zellen? Empfehlung nein (abgeleitet, wie berechnete Spalten); optional
    `onSheetRecalculated` mit der Liste.
13. **Füllen/Kopieren/Undo:** `computeFillValues` (010) erkennt Formel-Quellen und verschiebt sie; Teil 2 nutzt
    `shiftFormula` für interne Kopien; Teil 3 speichert Rohtexte.
14. **Excel-Export** (S20): Tabellen-Adresse ↔ Excel-Zelle (Kopfzeilen-Versatz, versteckte Spalten, Filter). Formeln nur,
    wenn die Exportsicht das ganze Blatt in physischer Reihenfolge ist, sonst Werte + Warnung.
15. **API:** `getCellAddress(row, col)`/`parseCellAddress("B3")`, `getCellFormula`, `setCellFormula`,
    `evaluateFormula(source)`, `getSheetValue("B3")`, `recalculate()`, `getPrecedents`/`getDependents`.

**4C – Formel-Eingabe** (im Editor aus Teil 1)

16. **Zeigemodus** (S14): wann ein Pfeil/Klick einen Bezug einfügt (nach `=`, `(`, `,`, Operator) und wann er übernimmt
    (Excel-Regel); Bereich per Maus ziehen; F4-Zyklus `$A$1 → A$1 → $A1 → A1`.
17. **Farbige Bezugsrahmen** (S15): Ebene wie die Auswahlrahmen, Klassen `ge-table-formula-ref-0` … `-7`, Variablen
    `--ge-table-formula-ref-*` light/dark, `aria-hidden`. Farben im Editor-Text: Spiegel-Div hinter einem normalen
    `input` (kein `contenteditable`) – entscheiden.
18. **Vorschläge** (S16): Liste nach APG-Combobox (`role="listbox"`, `aria-autocomplete="list"`,
    `aria-activedescendant` am Editor), Argument-Hinweis `role="tooltip"`; Texte über `AriaTextsIf`.
19. **Fehler bei der Eingabe:** Syntaxfehler speichern und `#ERROR!` zeigen (+ Ansage) oder ablehnen wie Excel? Kein
    modaler Dialog (UI gehört der App); Option `rejectInvalidFormulas`.

**Nicht-Ziele (bestätigen):** mehrere Blätter und Blattbezüge, benannte Bereiche (evtl. Stufe 2), Matrix-/Spill-Formeln,
lokalisierte Funktionsnamen, Formel-Spurverfolgung als UI, XLSX-Import.

### Tests

- Unit, 4A: Adressen (`A1`, `$AB$12`, `XFD`, Grenzen), Parser-Erweiterung (Präzedenz von `:` und `%`), Verschieben
  und Anpassen (Tabelle), Graph (Einzel- und Bereichsabhängige, Zyklen, volatil), **S26 als Property-Test** (fester Seed:
  zufällige Blätter und Änderungen, inkrementell = von vorn), Funktionen gegen LibreOffice-Werte
  (`test-utils/sheet-reference-values.json`), Fuzzing (wirft nie), Sicherheit S21 (Liste wie in 008).
- Browser, 4B/4C: S3, S6–S16, S20 (ZIP-Leser, `<f>` und `<v>`), S22–S25, axe für Vorschlagsliste und Rahmen.
- Bench `bench/sheet.bench.ts` (S18), keine Zeit-Assertions.
- 008-Specs unverändert grün.

### Hinweise

- 4A in `src/lib/table/sheet/` (DOM-frei): `cell-address.ts`, `sheet-engine.ts`, `dependency-graph.ts`,
  `range-index.ts`, `shift-formula.ts`, `functions/*.ts`. `formula/` **erweitern**, nicht kopieren.
- 4B: Adapter je Area-Modell, Neuberechnung nach `writeCellsInternal`, Zeichnen über den `updateCells`-Weg.
- 4C in `src/lib/table/sheet-ui/` (Zeigemodus, Rahmen, Vorschläge), alles über `DomServiceIf`, Texte per
  `textContent`.

---

## Teil 5 – Spreadsheet-Modus (Etappe 7)

> Braucht Teil 1–4, 004, 010, 003.

### Ziel

Was Teil 1–4 liefern, soll man **mit einer Zeile** bekommen – und dazu die sichtbaren Bausteine einer
Tabellenkalkulation: Spaltenbuchstaben, Zeilennummern, Formelleiste mit Adressfeld, Zeilen und Spalten einfügen und
löschen, Speichern/Laden. Für ein leeres Blatt wie für vorhandene Objekt-Daten.

```ts
const { tableModel, tableOptions } = SpreadsheetFactory.create({ rowCount: 1000, columnCount: 26, data });
new FormulaBar(document.querySelector('#bar')!, api);   // optional, nach tableReady
```

### Befund (Code-Befund 16.10.2026, ergänzt nach Teil 1–4)

- Zeilennummern (004) mit `original`-Zählweise, Klick auf Nummer = ganze Zeile, Klick auf „#“ = alles.
- Header-Gruppen (`AreaModelCellGroups`), eigene Header-Modelle möglich – Spaltenbuchstaben gibt es nicht.
- Fill-Handle, Batch-Edit (010), `autoResizeColumns`, Spaltenbreiten im Zustand (003).
- **Kein Kontextmenü** im Core (CLAUDE.md §10), nur `onContextmenu`.
- Zeilen einfügen/löschen gibt es nur über die Daten der App (`setRows`) bzw. CRUD; keine Bezugsanpassung.
- Leitlinie aus 008: „UI gehört der Anwendung“ (kein eingebauter Formel-Editor). Hier neu abzuwägen.

### Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| X1 | `SpreadsheetFactory.create({ rowCount: 100, columnCount: 26 })` | leeres Blatt A–Z × 1–100, Fokus A1, Bereichsauswahl, Excel-Bedienung, Clipboard, Undo, Formeln, Fill-Handle an |
| X2 | `data: unknown[][]` mit Formeln | Werte und Formeln; `api.getSheetData()` liefert dasselbe zurück |
| X3 | Kopf | A … Z, AA, AB …; Klick auf Buchstabe = Spalte, auf Zeilennummer = Zeile, Ecke = alles; Shift-Klick erweitert |
| X4 | Formelleiste | zeigt `B3` und den Rohinhalt; Tippen dort ändert die Zelle (Enter übernimmt, Escape verwirft) |
| X5 | Adressfeld `D10` + Enter, `B2:C5` + Enter | springt bzw. markiert |
| X6 | `api.insertRows(at, n)`, `deleteRows`, `insertColumns`, `deleteColumns` | Bezüge angepasst (Teil 4 S8), ein Undo-Schritt (Teil 3) |
| X7 | 1 Mio. Zeilen × 26 Spalten, leer | flüssig, Speicher dünn besetzt (nur gefüllte Zellen) |
| X8 | Vorhandene Objekt-Daten: `tableOptions.spreadsheet: true` | Excel-Bedienung, Clipboard, Undo, Buchstaben über den Labels; Formeln nur in freigegebenen Spalten |
| X9 | React, Vue, Svelte, Solid, Preact, Angular, Web Component | gleiche Fabrik und Option, **kein** Wrapper-Code; `FormulaBar` in allen nutzbar |
| X10 | Speichern/Laden | JSON-Beispiel (Daten mit Formeltexten), Breiten/Scroll über den Zustand (003) |
| X11 | Excel-Export | mit echten Formeln (Teil 4 S20) |
| X12 | Dark Mode, RTL, axe, Tastatur ohne Maus | alles bedienbar, keine Verstöße |
| X13 | Kontextmenü-Beispiel (Demo, plain HTML) | Ausschneiden/Kopieren/Einfügen/Zeile einfügen/löschen über die API |

### Entscheidungsfragen

1. **Form:** Fabrik `SpreadsheetFactory.create(…)` (neues dünn besetztes Modell + Optionen) **und** Preset
   `tableOptions.spreadsheet: true | Partial<SpreadsheetOptionsIf>` für vorhandene Modelle? Was genau schaltet das Preset
   ein (Liste aus Teil 1–4), was bleibt aus?
2. **Formelleiste:** (a) nur API + Beispiel in plain HTML (Linie aus 008) oder (b) eine kleine optionale Klasse
   `FormulaBar` im Core (plain DOM, keine Abhängigkeit, CSS-Variablen `--ge-table-formula-bar-*`, Adressfeld als Combobox,
   Eingabe mit Label), angebunden mit `new FormulaBar(container, api)` – in jedem Framework nutzbar, ohne
   Wrapper-Komponenten. Empfehlung (b), weil „leicht für den Anwender“ hier das Ziel ist; begründen.
3. **Spaltenbuchstaben:** eigenes Header-Modell (`AreaModelSheetHeader`, eine Zeile A, B, C) oder zusätzliche
   Header-Zeile über den Labels (Objekt-Daten: „A“ über „Price“)?
4. **Speicher:** dünn besetzt (`Map` je Zeile) für große leere Blätter vs. Array-of-Arrays; virtuelle Zeilenzahl,
   „Wachsen“ am Ende (`growBy`)?
5. **Einfügen/Löschen:** in welchen Modellen (Blatt: Zeilen und Spalten; Objekt-Daten: nur Zeilen über `createRow`)?
6. **Kontextmenü:** nur Beispiel in der Demo, oder eigener Prompt 018 „Kontextmenü“ (auch für andere Features nützlich)?
   Empfehlung: Beispiel hier + Eintrag in `TODO.md`/`prompts/README.md`.
7. **Nicht-Ziele bestätigen:** mehrere Blätter, Zellformatierung (fett, Farben, Zahlenformat je Zelle), verbundene Zellen
   per UI, bedingte Formatierung per UI, Diagramme, gemeinsames Bearbeiten, XLSX-Import (eigener Prompt, ZIP/XML-Leser
   ohne Abhängigkeit), lokalisierte Funktionsnamen.

### Tests

- Unit: Spaltenbuchstaben (A, Z, AA, AZ, BA, XFD hin und zurück), dünnes Modell, Einfügen/Löschen mit Bezugsanpassung.
- Browser: X1–X8, X10–X13; `FormulaBar` (Synchronisation mit Fokus, Eingabe, Escape, Adressfeld), axe.
- Wrapper-Smoke: alle sieben mit `SpreadsheetFactory` (Mount → `tableReady`, Tippen → `modelChanged`).

### Hinweise

- Ordner `src/lib/table/spreadsheet/` (`spreadsheet-factory.ts`, `spreadsheet-options.if.ts`, `area-model-sheet.ts`,
  `area-model-sheet-header.ts`, `formula-bar.ts`), CSS `css/table-spreadsheet.css` + Website-Kopie
  `src/styles/ge-table.css`.

---

## Phase 4–9 (Etappe 8, einmal am Ende)

- **Doku zusammenführen:** `instructions.md` Kapitel „Spreadsheet“ mit den in den Etappen entstandenen Abschnitten
  (Excel-style editing mit Tastentabelle, Clipboard, Undo/Redo mit Werkzeugleisten-Beispiel, Spreadsheet formulas mit
  Grammatik, Funktionstabelle, Unterschieden zu Excel und Sicherheitshinweis – Verweis aus 5.9 –, Spreadsheet mode).
  READMEs „Features“, beide `llms.txt`, `CLAUDE.md` §3/§6/§10/§11.
- **Demos:** `apps/table-demo/spreadsheet.html` (+ Seiten der Etappen), Fabrik in `demo-table-models`, Angular-Demo nach
  dem Release.
- **Website:** Showcase `spreadsheet` (z. B. Haushaltsbuch oder Angebot mit Formeln, Formelleiste,
  Kontextmenü-Beispiel), Vorschaubild, `new-features.ts` (ein Eintrag je Teil oder einer gesamt – entscheiden),
  Feature-Liste, `/doc/`, `why.astro` (Zeilen „Spreadsheet cell references (A1) & formula editor“, Clipboard, Undo,
  Bereichsauswahl und „Rule of thumb“), `build-buy-or-guiexpert.astro`, `checklist.astro`, CSS-Kopie
  `src/styles/ge-table.css`. **Kein Deploy.**
- **Training:** Abschnitte in Kapitel 31 `inline-editing` (Bedienung, Undo) und im Kapitel zu Auswahl/Copy; eigenes
  Kapitel `spreadsheet` in Teil 8, Nummer = höchste + 1 (Stand 16.10.2026: 39 → **40**), Tag `ep-040` nach dem Release.
- **Video:** `videos/13-excel-im-browser/` – „Excel im Browser: Formeln, Copy & Paste, Undo – MIT-lizenziert“ (Hook:
  aus Excel kopieren, einfügen, `=SUM(…)` tippen, Wert ändern, alles rechnet nach). Optional weitere Folgen „Copy &
  Paste mit Excel – ohne Enterprise-Lizenz“ und „Excel-Formeln mit Zellbezügen“. Vergleich sachlich, keine Preise
  (CLAUDE.md §8). Backlog CLAUDE.md §10 ergänzen.

## Review-Schwerpunkte je Etappe

| Etappe | Schwerpunkte |
|---|---|
| 1 | kein Verhaltenswechsel ohne Option, keine Tastaturfalle, IME, CSP, kein Textverlust, keine Schreibzugriffe auf Nicht-Editierbares, Strg+Pfeil bei 2 Mio. Zeilen |
| 2 | Quoting-Rundreise mit Excel, kein HTML im DOM, Ausschneiden als ein Vorgang, Verhalten ohne Option unverändert |
| 3 | richtige Zeile nach Sortierung/Filter, ein Schritt je Vorgang, keine Schreibzugriffe auf Nicht-Editierbares, Speicher |
| 4 | Sicherheit (kein Code aus Formeln), Korrektheit gegen LibreOffice, inkrementell = von vorn, große Bereiche |
| 5 | Bezugsanpassung bei Füllen, Kopieren, Einfügen/Löschen, Excel-Export, 008-Spaltenformeln unverändert |
| 6 | Barrierefreiheit der Vorschlagsliste, Regeln des Zeigemodus |
| 7 | eine Zeile reicht wirklich (Snippet ≤ 15 Zeilen kompiliert), Bedienung ohne Maus, große leere Blätter, Formelleiste barrierefrei |
| 8 | Wortwahl im Vergleich, Showcase/Training light und dark, Abschlussprüfung 000 Phase 10 |

## Definition of Done (zusätzlich zu 000)

- [x] Etappe 0: Design mit gemeinsamen Entscheidungen, allen Teilen und Abschnitt „Fortschritt“ 🛑
- [x] Etappe 1: E1–E22; roter Test + Fix für den Textverlust; CSP-Fix im `InputCellRenderer`; bestehende Specs
      unverändert grün; `TODO.md` „Excel-artig Enter bzw. Tippen startet das Editieren“ abgehakt
- [x] Etappe 2 (manuelle Rundreise Excel/Sheets in Firefox/Safari offen): P1–P19; manuelle Rundreise Excel/Sheets (Chrome, Firefox, Safari) protokolliert; `TODO.md` Folgepunkt
      010 „Einfügen aus der Zwischenablage“ abgehakt
- [x] Etappe 3: U1–U15; `TODO.md` Folgepunkt 010 „Undo/Redo“ abgehakt
- [x] Etappe 4: S1–S5, S17–S19, S21, S25, S26 inkl. Property-Test, Fuzzing, Bench
- [x] Etappe 5: S3, S6–S13, S20, S22–S24
- [x] Etappe 6 (echter Screenreader offen): S13–S16 mit Screenreader-Prüfung der Vorschlagsliste
- [x] Etappe 7: X1–X13
- [x] Etappe 8: Showcase, Kapitel 40, Video-Ordner, `why.astro` ehrlich angepasst, Abschlussprüfung, Release-Befehle
