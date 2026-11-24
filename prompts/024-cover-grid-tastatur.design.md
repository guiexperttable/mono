# 024 – Cover Grid mit der Tastatur: Design, Entscheidungen

> Zu `prompts/024-cover-grid-tastatur.md`. Branch `feat/cover-grid-tastatur` (von `main` @ 1.1.114), Zielversion
> **1.1.115**. 🛑 Haltepunkt: `onCellActivated`, `focusFrame` und `getTileLayout` werden öffentliche API (das Ereignis
> in allen Wrappern) – bitte die Tabelle „Entscheidungen“ bestätigen oder ändern. Noch kein Produktivcode geändert.

## Befund im Code (24.11.2026)

Der Befund des Prompts stimmt (Stellen geprüft). Beim Lesen zusätzlich gefunden – jeder Punkt bekommt zuerst einen
roten Test:

- **F1 – Ein Klick auf eine leere Kachel setzt den Fokus.** `MouseHandler.handleClick` ruft für jede Body-Zelle
  `focusModel().setFocus(row, col)`, `SelectionService.onMouseClicked` ebenso. „Leere Kacheln nie fokussierbar“ gilt
  also auch für die Maus, nicht nur für die Pfeiltasten.
- **F2 – `sort()` läuft über `repaint()`, der Filter ebenfalls** (`TableScope.sort`, `applyFilterFunction`), eine
  Größenänderung über `setParentWidth` + Render. Es gibt keinen gemeinsamen Punkt „Modell hat sich geändert“ –
  Teil C braucht deshalb einen Abgleich am Anfang des Render-Durchgangs (wie `adjustRowNumberColumnWidth`).
- **F3 – Heute zwei Renders am Rand.** `setFocusCell`/`changeFocusCell` rufen `ensureRowIsVisible()` (rendert beim
  Scrollen) **und** `repaint()`; die Invariante in `perf-invariants` erlaubt deshalb „≤ 2“ (NOTE dort, `TODO.md`).
  Die Kachel-Navigation bekommt einen eigenen Weg mit genau einem Render.
- **F4 – `filteredItems === items` nur bis zum ersten Filter.** `externalFilterChanged` erzeugt ein neues Array,
  danach sortiert `sort()` die Kopie; ohne Filter das Array der App. Das Verhalten hängt also davon ab, ob schon
  gefiltert wurde.
- **F5 – Der Fokusrahmen ragt 1 px über die Zelle hinaus** (`addFocusBorderDivs`: Breite/Höhe + 1, damit er die
  Gitterlinien deckt). Im Cover Grid ohne Linien wird er in der letzten Spalte abgeschnitten.
- **F6 – `EventAdapter` und alle Wrapper übergeben jedes Ereignis.** „Enter nur verbrauchen, wenn jemand zuhört“ lässt
  sich nicht erkennen. (Nach der Freigabe geändert, s. Entscheidung 7: Enter wird **nicht** verbraucht.)

## Bausteine

| Baustein | wofür | Ergebnis |
|---|---|---|
| `TableScope.onActionTriggered` / `onBodyNavigation` / `changeFocusCell` | Tasten | erweitert: vor der Zellnavigation fragt `TableScope` das Kachel-Layout des Body-Modells; ohne Layout bit-gleich |
| `ShortcutService` (`mirrorArrowKeys` vor dem Mapping) | RTL | passt: `NAVIGATE_LEFT` = rückwärts, die Kachel-Rechnung bleibt logisch |
| `TableScope.activateBodyCell` | Enter | passt; danach (und nach `editing.enterKey`) neu: `onCellActivated` |
| `MouseHandler.handleDblClick` | Doppelklick | erweitert: meldet `onCellActivated`, wenn der Doppelklick nichts anderes tat |
| `MouseHandler.handleClick`, `SelectionService.onMouseClicked` | Fokus per Klick | erweitert: leere Kachel bekommt keinen Fokus (F1) |
| `FocusModel` / `FocusModelIf` | Fokus = (Zeile, Spalte) | bleibt; das gemerkte Item liegt in `TableScope` |
| `RenderScope.addAndRenderCellDiv` + `ConvenienceDomService.addFocusBorderDivs` | Rahmen | erweitert: Option `focusFrame`, bei Kacheln innen (F5) |
| `CoverGridBodyModel` | Modell | drei Fehler (Teil E), implementiert `TileLayoutIf` |
| `CoverGridFactory.createCoverGrisDefaultOptions` | Options | Alias mit richtigem Namen, alter Name `@deprecated` |
| `EventListenerIf` / `EventAdapter` / `createEventListenerHub` / Wrapper | Ereignis | additiv, Muster `onRowDragEnd` |
| `AriaGridInfo`, `applyCellAria` | ARIA | passt; `aria-rowcount` stimmt mit Teil E |

Breaking Changes: keine API wird entfernt oder umbenannt. Verhaltensänderungen (Release-Notes): Cover Grid: Tasten navigieren Kacheln, Rahmen nur
nach Tastatur, `sort()` lässt `items` unverändert, keine leere Extrazeile, mindestens eine Spalte.

## API

### Kachel-Layout (Teil A, C)

```ts
// data/tablemodel/areamodel/tile-layout.if.ts   (@category Area models, @since 1.1.115)
/** The body cells are one sequence of items: tile i sits in row floor(i / perRow), column i % perRow. */
export interface TileLayoutIf {
  getTileCount(): number;               // gezeigte Items (nach dem Filter)
  getTilesPerRow(): number;             // ≥ 1
  getTileAt(index: number): unknown;    // das Item – Identität für „Fokus folgt dem Item“
  indexOfTile(item: unknown): number;   // -1, wenn nicht (mehr) gezeigt
}

// AreaModelIf – neu, optional
getTileLayout?(): TileLayoutIf | undefined;
```

`CoverGridBodyModel` implementiert `TileLayoutIf` und gibt sich selbst zurück. Die Rechnung liegt DOM-frei in
`tile-navigation/tile-navigation.ts` (exportiert, `@category Keyboard`):

```ts
export type TileNavigationAction = "previous" | "next" | "up" | "down" | "first" | "last" | "pageUp" | "pageDown";
/** Zielindex; -1 ohne Items. `index < 0` (kein Fokus) → `firstVisible`. O(1). */
export function navigateTiles(index: number, action: TileNavigationAction,
                              layout: { count: number; perRow: number; pageRows: number; firstVisible?: number }): number;
export function tileIndexToCell(index: number, perRow: number): [number, number];
export function cellToTileIndex(rowIndex: number, columnIndex: number, perRow: number): number;
```

| `ActionId` (Taste) | Aktion | Regel |
|---|---|---|
| `NAVIGATE_LEFT` / `RIGHT` (← →, in RTL gespiegelt) | `previous` / `next` | Index ∓ 1 mit Umbruch über das Reihenende; am ersten/letzten Item bleibt der Fokus |
| `NAVIGATE_UP` / `DOWN` (↑ ↓) | `up` / `down` | Index ∓ `perRow`; ↓ ohne Item darunter: steht darunter noch eine (unvollständige) Reihe → letztes Item, sonst bleibt er |
| `NAVIGATE_ROW_START` / `ROW_END` (Pos1, Ende) und `NAVIGATE_FIRST_CELL` / `LAST_CELL` (Strg+Pos1/Ende) | `first` / `last` | erstes / letztes Item |
| `NAVIGATE_PAGE_UP` / `PAGE_DOWN` | `pageUp` / `pageDown` | ∓ `pageRows × perRow` (`pageRows` = sichtbare Reihen − 1, min. 1), gleiche Spalte; über das Ende hinaus wie ↓ |
| `ACTIVATE_CELL` (Enter) | – | `onCellActivated` (Teil B) |

### Ereignis „Zelle öffnen“ (Teil B)

```ts
// data/common/event/ge-cell-activate-event.ts   (@category Events, @since 1.1.115)
export type GeCellActivateSource = "keyboard" | "mouse" | "api";
export class GeCellActivateEvent {
  constructor(
    readonly areaIdent: AreaIdent,           // immer "body"
    readonly rowIndex: number,
    readonly columnIndex: number,
    readonly value: unknown,                 // getValueAt – im Cover Grid das Item
    readonly row: unknown,                   // getRowByIndex – in Listen das Zeilenobjekt, im Cover Grid undefined
    readonly source: GeCellActivateSource,   // "api" = tableApi.triggerAction("ACTIVATE_CELL")
    readonly originalEvent?: KeyboardEvent | MouseEvent
  ) {}
}
// EventListenerIf
onCellActivated?(evt: GeCellActivateEvent): void;
```

Wrapper (Muster `rowDragEnd`): `cellActivated` – React/Preact/Solid Callback-Prop, Vue `@cellActivated`, Svelte
`on:cellActivated` + `onCellActivated`, Angular `(cellActivated)` (`@Output` in `TableComponent`, `output()` in
`TableSignalComponent`), Web Component `CustomEvent("cellActivated")`.

### Fokusrahmen (Teil D)

```ts
// data/options/focus-frame.type.ts   (@category Selection & focus, @since 1.1.115)
export type FocusFrameMode = "always" | "keyboard" | "never";
// TableOptionsIf – neu, optional (Vorgabe "always" = wie bisher)
focusFrame?: FocusFrameMode;
```

`"keyboard"` = wie `:focus-visible`: Rahmen, solange die letzte Eingabe in der Tabelle eine Taste war (auch Tab in
die Tabelle); ein Mausdruck blendet ihn aus. `"never"` = nie (Ersatz für den CSS-Umweg). `aria-activedescendant`
bleibt in allen drei Fällen gesetzt.

### Factory (Teil E, optional)

```ts
CoverGridFactory.createCoverGridDefaultOptions(defaultRowHeight, getStorageKeyFn?)   // neu, setzt focusFrame: "keyboard"
/** @deprecated use createCoverGridDefaultOptions */
CoverGridFactory.createCoverGrisDefaultOptions(…)                                    // ruft die neue Methode
```

## Entscheidungen

| # | Frage | Optionen | Empfehlung | Grund |
|---|---|---|---|---|
| 1 | Navigation: Hook im Modell oder Sonderfall? | (a) `AreaModelIf.getTileLayout?()` · (b) `isCoverGridBodyModel` in `TableScope` | **(a)** | generisch (eigene Kachel-Modelle), **ein** Hook für Navigation, Fokus-Identität und Rahmen; die Rechnung bleibt in einer getesteten Funktion statt im Modell |
| 2 | Pos1 / Ende | Reihenanfang/-ende · erstes/letztes Item | **erstes/letztes Item** (Strg+Pos1/Ende ebenso) | Finder, Explorer, Fotos; im Grid ist „Reihe“ zufällig (hängt an der Breite) |
| 3 | Leertaste, Strg/⌘+A, Strg/⌘+C, F2 im Cover Grid | Auswahl einführen · nichts | **nichts** – Test: kein `onSelectionChanged`, nichts gezeichnet, Zwischenablage unberührt, kein Editor | kein Auswahlmodell für Kacheln in diesem Prompt; was die Tests zeigen, wird behoben |
| 4 | `onCellActivated`: nur Cover Grid oder alle Tabellen? | nur Kacheln · alle | **alle Tabellen**, Body-Zellen | „Zeile öffnen“ ist auch in Listen der häufigste Enter-Wunsch |
| 5 | Vorrang bei Enter | – | Checkbox → Master/Detail → Baumknoten → `editing.enterKey` (`moveDown`, bzw. `edit` auf editierbarer Zelle) → **dann** `onCellActivated`; nicht bei blockierendem Overlay, im Editor, im Header | bestehende Aktionen bleiben, wie im Prompt |
| 6 | Doppelklick | melden in `handleClick` (2. Klick) · in `handleDblClick` | **`handleDblClick`**: Body-Zelle, kein Griff/keine Klick-Aktion (`resize-column`, `drag-row`, Checkbox, Pfeil, Detail-Icon), Zelle **nicht** editierbar (dort öffnet der Editor), kein Baum-Umschalten, keine leere Kachel | dort fällt die Entscheidung „Editor/Baum“ schon; ein Ereignis je Doppelklick. `onMouseClicked` mit `clickCount 2` bleibt. Zwei `element.click()` ohne `dblclick` öffnen nicht (wie beim Editor) |
| 7 | Enter verbraucht? | nur mit Listener · immer · nie | ~~immer~~ → **nie** (bei der Umsetzung geändert): gemeldet, aber weder `preventDefault` noch `stopPropagation`; der Handler stoppt die Taste selbst über `evt.originalEvent` | der bestehende Test „Enter on a plain cell does nothing (not consumed – e.g. a form around the table may handle it)“ hält genau das fest: ein Dialog/Formular um die Tabelle (Enter = OK) bekäme die Taste sonst nicht mehr – eine stille Regression für alle Tabellen. `triggerAction("ACTIVATE_CELL")` liefert deshalb `false` |
| 8 | Fokus folgt dem Item: wo? | je Aufrufstelle (sort, Filter, Resize) · am Anfang des Render-Durchgangs | **Render-Anfang**: ein Vergleich `getTileAt(index) === gemerktes Item` (O(1)); nur bei Abweichung `indexOfTile` (O(n), einmal je Änderung) | deckt Sortieren, Filter, Breite, `coverWidth`, `items`-Wechsel ohne Lücke (F2); Scrollen kostet nichts |
| 9 | Fokus-Item ausgefiltert/entfernt | `clear()` · Nachbar | **Kachel am selben Index** (geklemmt aufs letzte Item), ohne Items `clear()` | wie 019 (`adjustForRowChanges`: nächste verbleibende Zeile); Tastaturnutzer verlieren die Stelle nicht |
| 10 | `onFocusChanged`, wenn dasselbe Item die Zelle wechselt | still · melden | **melden** (`setFocus` der neuen Zelle) | Zeile/Spalte ändern sich wirklich; kein neuer stiller Weg im `FocusModelIf`. Gleiche Primitive (zweimal `"a.jpg"`) → erstes Vorkommen, dokumentiert |
| 11 | Scrollt die Tabelle dem Item nach Sortieren/Filtern nach? | ja · nein | **nein** | nicht gefordert; Sortieren behält, Filter setzt die Position wie heute |
| 12 | Rahmen-Option | `focusFrame: "always" \| "keyboard" \| "never"` · `"auto"` statt `"keyboard"` · nur Doku | **`"always" \| "keyboard" \| "never"`**, Vorgabe `"always"` | normale Tabellen bleiben bit-gleich (Tabellenkalkulation braucht den Rahmen nach Klick); `"keyboard"` sagt, was es tut |
| 13 | Cover Grid: welcher Modus? | `"always"` · `"keyboard"` | **`"keyboard"`** in den Default-Options (alter und neuer Name) | Vorbild `:focus-visible`; die Maus markiert im Cover Grid über den Renderer der App |
| 14 | `FocusModel("none")` | auswerten · nicht auswerten | **nicht auswerten**, JSDoc von `FocusModel`/`FocusType` sagt es und verweist auf `focusFrame: "never"` | `new FocusModel()` hat die Vorgabe `"none"` – auswerten nähme bestehenden Apps den Rahmen. `TODO.md`-Eintrag damit erledigt |
| 15 | Rahmen bei Kacheln | wie Zellen (+1 px) · innen | **innen** (genau die Zelle), sobald das Body-Modell ein Kachel-Layout hat; Farbe weiter `--ge-table-focus-outline-color` → `--ge-table-focus-border` | F5; keine neue CSS-Variable nötig (zwei gibt es schon) |
| 16 | `sort()`/`doSort()` und das Array der App | Kopie im Konstruktor · **Kopie beim Sortieren** · lassen | **Kopie beim Sortieren** (`filteredItems = filteredItems.slice().sort(…)`) | `filteredItems === items` bleibt bis zum ersten Sortieren (Apps, die `items` ergänzen und `repaintHard()` rufen, laufen weiter; Spec bleibt); nach F4 einheitlich |
| 17 | ARIA-Name einer Kachel | `getAriaLabel?(item)` · Renderer | **Renderer** (Text, `alt`, `ge-table-sr-only` – Regeln `instructions.md` 6.14), kein neues API | der Name ist der Zellinhalt, wie in jeder Tabelle; Demo-Renderer wird geprüft (Test + axe) |
| 18 | Alias `createCoverGridDefaultOptions` | ja · nein | **ja** | der Film zeigt sonst den Tippfehler; alter Name bleibt (`@deprecated`) |
| 19 | NOTEs der Spec (`getYPosByRowIndex(0)` = Padding, `doSort` über Objekte) | beheben · lassen | **lassen**, NOTEs bleiben | nicht Pflicht; `doSort` wird im Cover Grid nicht ausgelöst (kein Header) |
| 20 | Generischer Weg ≤ 2 Renders am Rand (F3) | mit beheben · lassen | **lassen** (Kachel-Weg: genau 1; `TODO.md` bleibt) | klein halten, kein Risiko für alle Tabellen |
| 21 | Training | eigener Abschnitt · nichts | kurzer Abschnitt `#tiles` im Kapitel `accessibility` (`<Callout type="version">`, Link zum Showcase, keine neue Live-Demo) | kein Kapitel zum Cover Grid; Tastatur gehört thematisch dorthin |

Phasen: 8 (Demo-Repo) und 9 (Video) entfallen laut Prompt (Film im Repo `videoserien`). Kein `demo-table-models`-Zuwachs
außer dem angepassten `createCoverGridModelAndOptions`.

## Ablauf im Core (Skizze)

- **Taste:** `onActionTriggered` → `onTileNavigation(actionId)` (nur wenn `body.getTileLayout?.()` ein Layout liefert,
  kein Header-Fokus, kein Editor): Index aus dem Fokus → `navigateTiles` → `setFocus` → Reihe sichtbar machen:
  scrollt die Tabelle, rendert das Scrollen (ein Durchgang, zeichnet den neuen Fokus), sonst `repaint()` – **genau ein
  Render**. `true` (verbraucht), auch wenn der Fokus am Rand bleibt.
- **Enter:** `onBodyNavigation` → `activateBodyCell` → `editing` → `fireCellActivated(row, col, source)`; bei Kacheln
  nur für `index < count`.
- **Doppelklick:** `MouseHandler.handleDblClick` → `tableScope.activateCellByMouse(areaIdent, row, col, event)`.
- **Klick:** `tableScope.canFocusBodyCell(row, col)` vor `setFocus` (`MouseHandler`, `SelectionService`).
- **Fokus folgt:** `TableScope.onFocusChanged` merkt sich `getTileAt(index)`; am Anfang von `adjustAfterScrolling()`
  `syncFocusToTile()` (Re-Entry-Schutz wie `adjustingRowNumberWidth`).
- **Rahmen:** `TableScope.keyboardModality` (Host-`keydown` → `true`, Host-`mousedown` → `false`, über
  `listenerAbortController`); `RenderScope.isFocusFrameVisible()` entscheidet in `addAndRenderCellDiv`.

## Beispiele (≤ 15 Zeilen)

```ts
// 1) Cover Grid: Enter und Doppelklick öffnen – ein Handler
const model = CoverGridFactory.createCoverGridModel(books, renderer, 160, 240);
const options = CoverGridFactory.createCoverGridDefaultOptions(240, () => "books");
const listener = new EventAdapter();
listener.onCellActivated = evt => openBook(evt.value as Book);
new TableScope(host, model, new SimpleDomService(), options, listener).firstInit();
```

```ts
// 2) Liste: „Zeile öffnen“
listener.onCellActivated = evt => router.open((evt.row as Order).id);   // evt.source: "keyboard" | "mouse"
```

```ts
// 3) Fokusrahmen ohne CSS abschalten
const options = { ...new TableOptions(), focusFrame: "never" as const };
```

Referenzfall Navigation – 5 Items, 2 je Reihe (`[0 1] [2 3] [4 ·]`), `pageRows` 1:

| von | → | ← | ↓ | ↑ | Ende | Pos1 |
|---|---|---|---|---|---|---|
| 1 | 2 (Umbruch) | 0 | 3 | 1 | 4 | 0 |
| 3 | 4 | 2 | 4 (letztes Item) | 1 | 4 | 0 |
| 4 | 4 | 3 | 4 | 2 | 4 | 0 |
| – (kein Fokus) | erstes Item der ersten sichtbaren Reihe | | | | 4 | 0 |

## Tests (zuerst rot)

- **Unit** `tile-navigation.spec.ts`: Tabelle oben, 0 Items, 1 Spalte, volle letzte Reihe, Seite, 1 Mio. Items.
  `cover-grid-body-model.spec.ts`: beide `it.fails` → `it`; `sort()` lässt `items` unverändert; `getUnfilteredRowCount`;
  `TileLayoutIf`. `cover-grid-factory.spec.ts`: Alias, `focusFrame`. Export-Snapshot (nur Zugänge).
- **Browser** `tile-navigation/cover-grid-keyboard.browser.spec.ts` (`describe.each(DIRECTIONS)`, Kürzel mit
  `it.each(PLATFORMS)` + `mockPlatform`): alle Fälle des Prompts, F1 (Klick auf leere Kachel), Entscheidung 3,
  Scrollhöhe (`getContentHeightInPixel` = Reihen × Höhe, kein Streifen), Breite < 1 Cover, HTML-Injection über den
  Renderer entfällt (kein neuer Text aus Daten im DOM), `axeViolations(host)` mit Fokus.
- **Enter/Doppelklick in normalen Tabellen** (`keyboard.browser.spec.ts`, `mouse-handler.browser.spec.ts`): Vorrang
  Checkbox, Baum, Master/Detail, `editing` (beide `enterKey`), Overlay, Griff, editierbare Zelle; Liste ohne alles →
  genau ein Ereignis mit `row`.
- **Echte Maus** `cover-grid-open.realmouse.browser.spec.ts` (auch WebKit): Doppelklick → ein `onCellActivated` +
  `onMouseClicked` mit `clickCount 2`.
- **Fokusrahmen** (`aria.browser.spec.ts`): `"always"` unverändert, `"keyboard"` (Tab, Taste, Klick), `"never"`.
- **Invarianten** (`perf-invariants.browser.spec.ts`): Kachel-Navigation innen und am Rand je **genau 1** Render;
  Scrollen ruft `indexOfTile` nie. **`test:perf`**: Navigation bei 1 000 vs. 1 Mio. Items (`expectScalesFlat`).
- **Wrapper**: `cellActivated` in React, Web Component, Angular 22 (`<guiexpert-table>` und `-signal`).

## Doku, Demo, Website (Phasen 4–7)

Wie im Prompt: `instructions.md` 5.10 + FAQ 6.26, `llms.txt` (Rezept, Pitfall), JSDoc + `docs:check`, `CLAUDE.md`
(§3.4, §3.6, §3.7, §4), `TODO.md`, `prompts/README.md`; `createCoverGridModelAndOptions` ohne
`shortcutActionsDisabled`; `apps/table-demo/cover-grid.html` und Showcase `covergrid` ohne CSS-Umweg, Status-Zeile
„Opened: …“, Tastatur-Hinweis; `new-features.ts`, `/doc/` (Events, Options), Website-CSS-Kopie nur falls Core-CSS
dazukommt; Training-Abschnitt (Entscheidung 21). Kein Deploy, kein Release.

## Bei der Umsetzung dazugekommen (24.11.2026)

- **Entscheidung 7 geändert:** Enter wird für `onCellActivated` nicht verbraucht (s. Tabelle).
- **F7 – Doppelklick geht verloren, wenn die App im Klick-Handler rendert.** Die Cover-Grid-Demo ruft in
  `onMouseClicked` `repaint()` (der Renderer markiert das angeklickte Buch): der zweite Klick ersetzt das Element, der
  Browser schickt `dblclick` an das abgehängte Element – kein `onCellActivated`, in editierbaren Tabellen auch kein
  Editor. Gefunden mit dem Test mit echter Maus. Behoben: `MouseHandler.checkLostDblClick` (nach dem gemeldeten
  zweiten Klick; nur wenn kein natives `dblclick` am Host ankam und das Element abgehängt ist). Tests
  `cover-grid-open.realmouse.browser.spec.ts`, `click-during-render.realmouse.browser.spec.ts`.
- **Strg/⌘+C im Cover Grid** kopierte einen leeren Text in die Zwischenablage (Entscheidung 3 „was die Tests zeigen,
  wird behoben“): In einem Kachel-Layout ohne Texte wird nichts mehr kopiert.
- `activateCell` meldet auch unter einem blockierenden Overlay nichts (Doppelklick per Skript auf die Zelle).
- **Abschluss-Review** (unabhängiger Agent), jeweils mit rotem Test behoben: der Wechsel Taste/Maus rendert nicht
  für Ereignisse aus Formularelementen in Zellen (sonst ersetzt `focusFrame: "keyboard"` ein Eingabefeld beim Tippen);
  `checkLostDblClick` nur für `detail === 2` (Dreifachklick) und über Zeile bzw. Item statt Index; Doppelklick auf
  Button/Link/Input einer Zelle meldet nichts; der Fokus eines mitgebrachten `FocusModel` wird im ersten
  Render-Durchgang übernommen; eine gehaltene Enter-Taste meldet einmal. Offen (→ `TODO.md`): geteiltes `FocusModel`
  zweier Kachel-Tabellen; nach `sort()` angehängte Items erscheinen erst nach `filteredItems = items`.

## Nicht enthalten (→ `TODO.md`)

Auswahlmodell für Kacheln; „Kacheln füllen die Breite“ im Core; „Fokus folgt der Zeile“ für alle Tabellen; ein Render
am Rand für alle Tabellen (F3); CSS-Klasse an der fokussierten Zelle für eigene Fokus-Ringe im Renderer.
