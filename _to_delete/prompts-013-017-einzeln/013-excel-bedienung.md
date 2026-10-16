# TODO-Prompt 013: Excel-Bedienung – Lostippen, Enter/Tab, Tastatur-Auswahl, Löschen

> Status: offen · angelegt 16.10.2026 · Slug `sheet-editing` (Branch `feat/sheet-editing`, Design `prompts/013-excel-bedienung.design.md`)
> Reihe **Tabellenkalkulation 013–017** (Gesamtbild: `prompts/README.md`). Abhängigkeiten: 001 (ARIA), 010 (eine
> Schreibstelle `applyCellChanges`), 012 (RTL: Tab/Pfeile in Leserichtung) – alle umgesetzt.
> ag-Grid: Editieren per Tippen/Enter/Tab Community, Bereichsauswahl (Shift+Pfeile) Enterprise. Handsontable: Kern,
> aber kommerzielle Lizenz. Vor dem Video auf den Herstellerseiten prüfen.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Bearbeiten soll sich anfühlen wie Excel bzw. Google Sheets, eingeschaltet mit **einer** Option:

- Zelle markieren und **lostippen** → Editor öffnet sich, der Inhalt wird ersetzt.
- F2, Doppelklick oder Enter → bearbeiten, Cursor am Ende.
- Enter/Tab übernehmen und gehen zur nächsten Zelle, mit Shift rückwärts; Escape verwirft.
- Pfeiltasten übernehmen im „Eingeben“-Modus und wechseln die Zelle (im „Bearbeiten“-Modus bewegen sie den Cursor).
- Shift+Pfeile erweitern die Auswahl, Strg+Pfeile springen an den Rand des Datenblocks.
- Entf leert die Auswahl, Strg+Enter schreibt eine Eingabe in alle markierten Zellen.
- Der Editor überlebt Scrollen, läuft unter strikter CSP, mit IME (Japanisch, Chinesisch) und auf Touch-Geräten.

Das ist die Grundlage für 014 (Zwischenablage), 015 (Undo), 016 (Zellformeln) und 017 (Spreadsheet-Modus).

## Was es heute gibt (Code-Befund 16.10.2026, Version 1.1.98)

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
  Konflikt mit Ausschneiden in 014.
- **Auswahl:** `SelectionModel` Typ `range` mit `CellRange`; der Shift-Klick-Anker sitzt im `SelectionService`, der Fokus
  getrennt im `FocusModel`. Für Shift+Pfeile fehlt ein Anker, der nicht von der Maus kommt.
- **Schreibstelle:** `TableScope.applyCellChanges(changes, source)` prüft `isEditable`, `editInputPipe`, `validate`,
  Batch-Modus, schreibt und meldet ein `onModelChanged`. Passt für Löschen und Strg+Enter.
- **ARIA:** Host `role="grid"` + `aria-activedescendant`; der Editor wird über `labelControl` benannt.

## Referenzfälle

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

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **Einschalten:** `tableOptions.editing?: boolean | Partial<EditingOptionsIf>` mit z. B. `startOnType`, `enterKey`
   („edit“ oder „moveDown“), `enterMoves` (down/right/none), `tabMoves`, `arrowKeysCommit`, `clearKeys`,
   `fillSelectionWithCtrlEnter`, `selectTextOnEdit`. Default aus (E21). Was setzt das Preset aus 017?
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

## Phase 2 – Tests (zusätzlich zu 000)

- Unit: `findDataEdge` (Lücken, Ränder, leere Werte, versteckte Spalten), Auswahl-Erweiterung (Anker, mehrere Bereiche),
  Optionen-Defaults.
- Browser `sheet-editing/sheet-editing.browser.spec.ts`: E1–E21 mit den Fake-KeyboardEvents aus `test-utils`; E14 mit
  `scrollToIndex` + `nextFrame`; E16 mit `CompositionEvent`; E17 als Prüfung „kein `on*`-Attribut im Editor-DOM“ plus
  eine Testseite mit Meta-CSP; RTL (E4); Master/Detail (Tasten im Detail unberührt); Batch-Edit (übernommen =
  vorgemerkt); Overlay „Loading“ blockiert Tippen.
- E21: die bestehenden `keyboard`- und `editing`-Specs bleiben **unverändert** grün.
- Roter Test zuerst für den Textverlust beim Repaint (gilt auch ohne Option).
- axe: Grid mit offenem Editor, `aria-readonly`. Wrapper-Smoke React + Web Component: Tippen → `modelChanged`.

## Phase 3 – Hinweise

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

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` Abschnitt „Excel-style editing“ mit Tastentabelle (Windows/macOS).
- **Training:** Abschnitt in Kapitel 31 `inline-editing` (`<Callout type="version">`); das eigene Kapitel kommt mit 017.
- **Website/Demo:** `apps/table-demo/sheet-editing.html`, `new-features.ts`. Showcase erst in 017 (`spreadsheet`).
- **Video:** keine eigene Folge, Teil der Folge aus 017.

## Abschluss-Review (Schwerpunkte)

Kein Verhaltenswechsel ohne Option, keine Tastaturfalle, IME, CSP, kein Textverlust, keine Schreibzugriffe auf
Nicht-Editierbares, Strg+Pfeil bei 2 Mio. Zeilen.

## Definition of Done (zusätzlich zu 000)

- [ ] Design mit Editor-Architektur, Tastenbelegung (Windows/macOS) und Tab-Entscheidung (Barrierefreiheit) 🛑
- [ ] E1–E22 umgesetzt und getestet; roter Test + Fix für den Textverlust; CSP-Fix im `InputCellRenderer`
- [ ] Bestehende Specs unverändert grün (E21)
- [ ] `TODO.md`: „Excel-artig Enter bzw. Tippen startet das Editieren“ abgehakt
