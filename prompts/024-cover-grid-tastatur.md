# 024 – Cover Grid: Tastatur-Navigation, „Kachel öffnen“ und drei Fehler im Modell

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Phasen, Regeln, Phase 10 =
> Release-Block). **Haltepunkt nach Phase 1** (Design-Dokument `prompts/024-cover-grid-tastatur.design.md`): Das
> Ereignis „Kachel öffnen“ und die Optionen sind öffentliche API in allen Wrappern. Jede Core-Änderung folgt der Regel
> „zuerst ein roter Test“; die Invarianten aus 021 gelten (ein Render je Tastendruck, Zähler statt Zeiten).
> Branch: `feat/cover-grid-tastatur`. Zielversion: die nächste nach `packages/table/package.json`
> (Stand 24.11.2026: 1.1.114 → 1.1.115), nur eintragen.
>
> Herkunft: Konzept für einen Hands-on-Film „Cover Grid zum Nachbauen“ (Repo `videoserien`,
> `prompt/covergrid-KONZEPT.md`, Befunde G1–G3, G5, G9). Der Film soll keinen Umweg zeigen – heute blenden Demo und
> Showcase den Fokusrahmen per CSS aus und schalten die Tasten ab. Ziel: Ein Cover Grid ist mit Maus **und** Tastatur
> bedienbar, ohne dass die App etwas ausblenden oder selbst nachbauen muss.

## Befund (24.11.2026, im Code geprüft – im Browser noch nicht)

### Fokus und Tastatur

| Stelle | Heute | Folge im Cover Grid |
|---|---|---|
| `RenderScope` (`:239–244`) | Ohne `tableOptions.getFocusModel` legt **jede** Tabelle ein eigenes `new FocusModel("cell")` an | Ein Klick setzt den Fokus, der Rahmen (`ge-table-focus-border`) erscheint um die Kachel |
| `RenderScope.addAndRenderCellDiv` (`:2450`) | Rahmen, sobald `fm.hasFocus(r, c)` – `selectionType` des `FocusModel` wird nie gelesen | `new FocusModel("none")` blendet nichts aus (`TODO.md`, „FocusModel("none") wird ignoriert“) |
| `TableScope.changeFocusCell` (`:3425`) | Generische Zellnavigation: Zeile/Spalte ± 1, an den Rändern geklemmt, `ensureRowIsVisible` | Pfeil → am Reihenende **kein Umbruch** in die nächste Reihe; ↓ in der letzten Reihe landet auf **leeren Kacheln** hinter dem letzten Item |
| `TableScope.onBodyNavigation` | Pos1/Ende = Zeilenanfang/-ende, Strg+Pos1/Ende = erste/letzte Zelle, Bild↑/↓ = Seite | Ende/Strg+Ende können auf eine leere Kachel springen |
| `TableScope.activateBodyCell` (`:1263`) | Enter = Checkbox, Master/Detail, Baumknoten – sonst `false` | **Enter tut nichts und meldet nichts**; die App erfährt nicht, dass ein Cover geöffnet werden soll |
| `TableScope.onMouseClicked` | Doppelklick → `onMouseClicked` mit `clickCount === 2` | Funktioniert, aber Maus und Tastatur haben kein gemeinsames Ereignis |
| `FocusModel` | Fokus = (Zeile, Spalte) | Nach `sort()`, Filter oder Größenänderung (andere Spaltenzahl) zeigt der Fokus auf ein **anderes** Cover |
| Demos | `shortcutActionsDisabled: true` + CSS `.ge-table-focus-border { display: none }` in `createCoverGridModelAndOptions`, `apps/table-demo/cover-grid.html`, Showcase `covergrid/run.astro` | Ein Cover Grid ist heute nur mit der Maus bedienbar (WCAG 2.1.1 Tastatur, 2.4.7 sichtbarer Fokus) |

### Drei Fehler im Modell (`CoverGridBodyModel`, Specs mit `it.fails` vorhanden)

1. **0 Spalten → `Infinity` Zeilen** (`getColumnCount`, `:69`): Breite < `coverWidth` → `floor(width / coverWidth) = 0`,
   `getRowCount()` teilt durch 0. Spec `cover-grid-body-model.spec.ts:59` (`it.fails`).
2. **Leere Extrazeile** (`getRowCount`/`getUnfilteredRowCount`, `:52/:63`): `floor(n / columns) + 1` statt `ceil` → ist
   die letzte Reihe voll, hängt eine leere Reihe an (sichtbar als Streifen unten, Scrollhöhe zu groß).
   Spec `:75` (`it.fails`).
3. **`sort()`/`doSort()` sortieren das Array der App** (`:31`, `filteredItems = items` ohne Kopie; NOTE in der Spec
   `:34`): Nach `api.sort(…)` ohne Filter ist das übergebene `items`-Array umsortiert – „zurück zur Sammlung“ geht nur
   mit einem eigenen Vergleich. Anders als `AreaModelObjectArray` (kopiert). Im Design entscheiden: Kopie
   (`filteredItems = [...items]`, auch in `externalFilterChanged` ohne Treffer-Änderung) oder bewusst so lassen und
   dokumentieren. Empfehlung: Kopie, wie `AreaModelObjectArray`.

Nebenbei prüfen (nicht Pflicht): NOTE `:103` (`getYPosByRowIndex` mit `firstRowPaddingTop`), NOTE `:133`
(`doSort` über Objekte vergleicht `"[object Object]"`).

## Teil A – Kachel-Navigation mit der Tastatur (Pflicht)

Ein Cover Grid behandelt die Kacheln als **eine Folge** (Index `i = row * columns + col` in `filteredItems`), nicht als
Matrix:

| Taste | Wirkung |
|---|---|
| ← / → | vorheriges / nächstes Item, **mit Umbruch** über das Reihenende (RTL: gespiegelt, wie `mirrorArrowKeys`) |
| ↑ / ↓ | Item eine Reihe darüber / darunter; ↓ in der vorletzten Reihe ohne Item darunter → **letztes Item** (wie Dateimanager) |
| Pos1 / Ende | erstes / letztes **Item** (nicht Reihenanfang – im Design entscheiden; Vorbild Finder, Explorer, Fotos) |
| Bild↑ / Bild↓ | eine sichtbare Seite (Reihen × Spalten) |
| Enter | „Kachel öffnen“ (Teil B) |
| Leertaste | im Design entscheiden (nichts / Auswahl umschalten, falls Teil D eine Auswahl bekommt) |

- Leere Kacheln hinter dem letzten Item sind **nie** fokussierbar.
- Der fokussierte Item wird sichtbar gehalten (`ensureRowIsVisible`), genau **ein** Render je Tastendruck
  (Invariante in `perf-invariants.browser.spec.ts`).
- Umsetzung im Design entscheiden: (a) eigenes Navigationsverhalten über ein optionales Hook im Area-Modell
  (z. B. `AreaModelIf.getNavigationTarget?(row, col, action)`) – generisch, auch für spätere Kachel-Modelle;
  (b) Sonderfall in `TableScope` über `isCoverGridBodyModel` (`instanceof-workaround.ts`). Empfehlung (a).
- Tastatur standardmäßig **an**: `createCoverGrisDefaultOptions` setzt kein `shortcutActionsDisabled`; Demos und
  Showcase entfernen ihr `shortcutActionsDisabled: true`. Andere Kürzel (Kopieren, Alles auswählen, F2) dürfen im Cover
  Grid nichts Falsches tun – im Design auflisten und testen.
- `onFocusChanged` kommt wie bisher (einmal je Bewegung).

## Teil B – Ereignis „Kachel öffnen“ (Pflicht)

Enter auf der fokussierten Kachel **und** Doppelklick melden dasselbe Ereignis, damit die App nur **einen** Handler
schreibt. Vorschlag (Namen im Design, an bestehende anlehnen):

```ts
interface EventListenerIf {
  /** Kachel/Zelle „öffnen“: Enter auf der fokussierten Zelle oder Doppelklick. @since 1.1.115 */
  onCellActivated?(evt: GeCellActivateEvent): void;
}
// GeCellActivateEvent: rowIndex, columnIndex, areaIdent, value (das Item), source: 'keyboard' | 'mouse',
//                      originalEvent?: KeyboardEvent | MouseEvent
```

- Im Design entscheiden: nur Cover Grid oder **alle** Tabellen (dann Enter erst nach den bisherigen Aktionen in
  `activateBodyCell` – Checkbox, Detail, Baum behalten Vorrang; `editing.enterKey` unverändert). Empfehlung: alle
  Tabellen, Body-Zellen, wenn keine andere Enter-Aktion griff – das ist auch für normale Listen „Zeile öffnen“.
- Doppelklick: zusätzlich zu `onMouseClicked` mit `clickCount 2` (bleibt, kein Breaking Change); nicht bei
  Doppelklick auf Griffe (Spaltenbreite, Row Drag, Fill-Handle) oder im offenen Editor.
- Leere Kachel → kein Ereignis.
- Wrapper: alle Frameworks bekommen das Ereignis wie `rowDragEnd` (Angular `output()` in `<guiexpert-table-signal>`
  und `@Output` in `TableComponent`, React/Preact/Solid/Svelte/Vue/Web Component), Smoke-Test mindestens React + Web
  Component.

## Teil C – Fokus folgt dem Item (Pflicht)

- Nach `sort()`, `externalFilterChanged()`, `repaintHard()` mit anderer Spaltenzahl (Breite, `coverWidth`) und
  `items`-Wechsel steht der Fokus auf **demselben Item** (gemerkt als Objekt, nicht als Index). Ist es ausgefiltert:
  Fokus weg (`clear()`) oder auf das nächste sichtbare Item – im Design entscheiden.
- Gilt die Lösung nur für das Cover Grid (Modell kennt `filteredItems`) oder allgemein (wie die Auswahl seit 019
  über `adjustForRowChanges`)? Empfehlung: nur Cover Grid, klein halten; allgemeine Lösung in `TODO.md` notieren.

## Teil D – Fokusrahmen (Pflicht)

- Der Fokusrahmen bleibt **sichtbar**, wenn der Fokus von der Tastatur kommt (WCAG 2.4.7). Im Design entscheiden, ob
  er bei Mausklick erscheint (Vorbild `:focus-visible`: nur nach Tastatur) – Empfehlung: Rahmen nur nach Tastatur
  bzw. solange die Tabelle per Tastatur bedient wird; im Cover Grid **innen** an der Kachel (kein Abschneiden an
  Nachbarn), Farbe über `--ge-table-focus-border` bzw. eine eigene Variable `--ge-table-cover-focus-*`.
- `FocusModel("none")` aus `TODO.md`: beheben, ohne Anwender mit `new FocusModel()` (Default `"none"`!) den Rahmen zu
  nehmen – im Design die Optionen abwägen (neuer Default `"cell"` im Konstruktor wäre Breaking; Option
  `focusFrame: "auto" | "always" | "never"` in `TableOptionsIf`; oder nur dokumentieren). Mindestens: Eine App kann den
  Rahmen ohne CSS-Trick abschalten.
- Danach entfällt das CSS `.ge-table-focus-border { display: none }` in Demo und Showcase.
- Auswahl: Das Cover Grid hat weiter **kein** eigenes Auswahlmodell (App-Sache, Renderer markiert). Nur aufnehmen,
  wenn es sich aus Teil A/C ohne Aufwand ergibt; sonst in `TODO.md`.

## Teil E – die drei Fehler (Pflicht)

1. `getColumnCount()` liefert mindestens 1 (`Math.max(1, …)`), auch `getUnfilteredRowCount`.
2. `getRowCount()`/`getUnfilteredRowCount()` mit `Math.ceil(n / columns)`; `getContentHeightInPixel` stimmt damit
   (Scrollhöhe-Test wie `scroll-height.browser.spec.ts`).
3. `sort()`/`doSort()` sortieren nicht das Array der App (Entscheidung aus dem Befund).

`it.fails` in `cover-grid-body-model.spec.ts` → `it`, `// BUG:` entfernen, `TODO.md` abhaken.

Optional (klein, im Design entscheiden): Alias **`createCoverGridDefaultOptions`** mit `@deprecated` am alten Namen
`createCoverGrisDefaultOptions` (CLAUDE.md §5: Tippfehler-APIs nur mit Alias) – im Film sähe man sonst den Tippfehler.

## ARIA

- Host `role="grid"`, Zellen `gridcell` wie heute; prüfen, was ein Screenreader bei einer Kachel vorliest (Inhalt des
  Renderers). Im Design entscheiden: `aria-label` je Kachel über ein optionales `getAriaLabel?(item)` der Factory bzw.
  `getTooltipAt`/`getTextValueAt` des Modells (heute `''`). `aria-rowcount`/`aria-colcount` stimmen mit Teil E.
- Ansage bei „Kachel öffnen“ nicht nötig (die App reagiert sichtbar).
- `axeViolations(host)` = `[]` im Cover Grid mit Fokus.

## Tests (Vitest, zuerst rot)

- Unit: Navigation als DOM-freie Funktion (Index-Rechnung: Umbruch, letzte Reihe, leere Kacheln, Seite, RTL),
  Teil E (Specs vorhanden).
- Browser (`*.browser.spec.ts`, ltr und rtl, `it.each(PLATFORMS)` + `mockPlatform` für die Kürzel): Tab in das Grid →
  erstes Item fokussiert; → am Reihenende → erstes Item der nächsten Reihe; ↓ zur unvollständigen letzten Reihe →
  letztes Item; Ende → letztes Item; nie leere Kachel; Enter → genau ein `onCellActivated` (`source: 'keyboard'`,
  `value` = Item); Doppelklick → genau ein `onCellActivated` (`source: 'mouse'`) und weiter `onMouseClicked` mit
  `clickCount 2`; nach `sort()` und Filter steht der Fokus auf demselben Item; Größenänderung (andere Spaltenzahl) →
  selbes Item; ein Render je Tastendruck (Invariante); Fokusrahmen nach Tastatur sichtbar, abschaltbar ohne CSS.
- Echte Maus (`test-utils/real-mouse.ts`) für den Doppelklick, auch WebKit (`*.realmouse.browser.spec.ts`).
- Bestehende Tests: Enter in Checkbox-, Baum-, Master/Detail- und Editier-Tabellen unverändert (Teil B mit Vorrang).
- Wrapper: `onCellActivated` kommt in React + Web Component an (`pnpm test:wrappers`), Angular (`pnpm test:angular`).
- `test:perf`: Navigation mit 1 Mio. Items flach (Index-Rechnung O(1)).

## Doku, Demo, Website, Film

- `instructions.md` §5.10: Tabelle um „Tastatur“, „Kachel öffnen“ und „Fokus“ ergänzen, die Notes zu den drei Fehlern
  ersetzen; FAQ 6.26 „Wie öffne ich ein Cover mit Enter?“. `llms.txt`: Rezept „Cover Grid: öffnen per Enter/Doppelklick“,
  Pitfall „Fokusrahmen per CSS ausblenden“ → abschalten über die neue Option.
- `packages/demo-table-models` (`createCoverGridModelAndOptions`): ohne `shortcutActionsDisabled`, neuer Handler
  `onCellActivated` im Beispiel; `apps/table-demo/cover-grid.html` und Showcase `covergrid` (`run.astro`, `info.md`):
  CSS-Umweg raus, Status-Zeile zeigt „geöffnet: …“, Tastatur-Hinweis. Website: `new-features.ts`-Eintrag
  („Cover grid: keyboard and open“), Website-CSS-Kopie `src/styles/ge-table.css` nachziehen.
- Training: kein eigenes Kapitel (es gibt keins zum Cover Grid) – im Design entscheiden, ob ein Abschnitt in
  `accessibility` passt.
- Demo-Repo und Video nach `000-arbeitsweise.md` entfallen: Der Film entsteht im Repo `videoserien` (Serie `covergrid`,
  eigenes Demo-Repo) gegen das veröffentlichte 1.1.115 – dort wird ein Kapitel „Mit der Tastatur“ ergänzt.

## Nicht in diesem Prompt

- Auswahlmodell für Kacheln (Mehrfachauswahl mit Shift/Strg) – höchstens als Vorschlag in `TODO.md`.
- Option „Kacheln füllen die Breite“ im Core (heute `fitCoversToWidth` in `demo-table-models` + eigener
  `ResizeObserver` mit `recalcColumnWidths()`) – eigener Prompt, falls gewünscht (Konzept des Films, Befund G4).
- Allgemeiner „Fokus folgt der Zeile“ für alle Tabellen (Teil C nur Cover Grid).

## Fertig, wenn

- Design freigegeben, Teile A–E mit roten, dann grünen Tests; alle bestehenden Tests grün (`test:browser`,
  `test:browser:scrollbars`, `test:browser:webkit`, `test:perf`, `test:wrappers`, `test:angular`, `check:llms`,
  `docs:check`), ltr und rtl, Mac-Kürzel.
- Showcase und `apps/table-demo/cover-grid.html` ohne CSS-Umweg und ohne `shortcutActionsDisabled`, mit Tastatur
  bedienbar, light und dark angesehen.
- `instructions.md`, `llms.txt`, `CLAUDE.md` (§3.4 Cover Grid, §3.6 Ereignisse/Tastatur, §4 Wrapper-Events),
  `TODO.md` (beide Einträge zum Cover Grid und `FocusModel("none")` abhaken oder präzisieren), `prompts/README.md`
  (Zeile und Status).
- Release-Block (Phase 10) nur auf Anweisung.
