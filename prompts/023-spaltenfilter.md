# 023 – Spaltenfilter: Filterzeile im Header, Filter-Menü je Spalte, Spaltenauswahl

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Phasen, Regeln, Phase 10 =
> Release-Block). **Haltepunkt nach Phase 1** (Design-Dokument `prompts/023-spaltenfilter.design.md`): Optionen,
> Filter-Zustand und Ereignisse sind öffentliche API in allen Wrappern. Jede Core-Änderung folgt der Regel „zuerst ein
> roter Test“; die Invarianten aus 021 gelten (Zähler statt Zeiten). Branch: `feat/spaltenfilter`.
> Zielversion: die nächste nach `packages/table/package.json` (Stand 20.11.2026: 1.1.113 → 1.1.114), nur eintragen.
> Braucht: 001 (ARIA), 003 (Zustand), 012 (RTL), 019 (Live-Append), 021 (Performance-Checks), 022 (Spalten-Sperren).
> Umfang: L (in Etappen liefern, jede releasefähig: A → B → C → D).
>
> Herkunft: Vergleich mit **NitGrid** (https://nitgrid.nitstack.com/, Live-Grid auf der Startseite und
> https://nitgrid.nitstack.com/demo-react/). Drei Screenshots von Marc (20.11.2026) zeigen, was dort eingebaut ist und
> bei uns fehlt. Vorbild für Bedienung, **nicht** für Code, Klassennamen oder Aussehen – eigenes Design im
> Look & Feel der Tabelle (`--ge-table-*`).

## Befund (20.11.2026)

### Was NitGrid zeigt (Screenshots + Blick ins DOM der Startseite)

| Element | Beobachtung |
|---|---|
| **Filterzeile** unter den Spaltentiteln | je Datenspalte ein Textfeld „Search“ (Checkbox-Spalte ohne), schmale Spalten mit schmalem Feld; die Zeile ist Teil des Headers (scrollt waagerecht mit, bleibt oben stehen). Ein Knopf in der Fußleiste blendet sie ein/aus („Show or hide the quick search row“). |
| **Trichter-Symbol** rechts in jeder Kopfzelle | öffnet ein Popup unter der Spalte: Suchfeld („Search, then press Enter“), Auswahl des Vergleichs (`Starts with`, `Ends with`, `Contains`, `Equals`, `Does not equal`), scrollbare Liste der **vorkommenden Werte** mit Checkboxen, Checkbox „All“, Knöpfe „OK“ / „Cancel“. |
| **Sortier-Symbol** links in jeder Kopfzelle | haben wir (Sortier-Icon, Klick auf den Kopf). |
| **Fußleiste** unter der Tabelle | „No. of Records: 200000“, Knopf „Columns“ (Popup mit einer Checkbox je Spalte = ein-/ausblenden), Filterzeile ein/aus, Vollbild, Export. |
| Summenzeile im Footer | haben wir (`footerAggregates`, 005). |

### Ist-Stand im Core (geprüft im Code)

- **Filter gibt es nur extern:** `tableOptions.externalFilterFunction = (row) => boolean` + `api.externalFilterChanged()`.
  Die Tabelle weiß nichts über Spalten, Vergleiche oder Filterwerte; jedes Eingabefeld baut die Anwendung selbst
  (Training-Kapitel `filtering`, Showcases `inputfilter`, `idfilter`, `sliderfilter`). `GeFilterService` ist nur ein
  Textvergleich über ganze Zeilen (`+muss -nicht`), ohne Spaltenbezug.
- **Kein Filter-Zustand:** `TableStateIf` hat keinen Teil für Filter; Apps legen ihren Filtertext in `custom` ab
  (`setCustomState`).
- **Keine Filter-UI:** keine Filterzeile, kein Trichter, kein Popup. Im Header gibt es Titel, Sortier-Icon,
  Gruppen-Toggle, Resize-Griff.
- **Spalten ein-/ausblenden nur per API:** `api.setColumnVisible(column, visible)` / `isColumnVisible`, Zustandsteil
  `columns`. Eine eingebaute Spaltenauswahl gibt es nicht.
- **Was schon passt und wiederverwendet wird:** Overlay „No matching rows“ (`getUnfilteredRowCount`, 002), Summen über
  gefilterte Zeilen (005), Ansage `filtered(rowCount)` in `AriaTexts`, Excel-Export und Copy = aktuelle Sicht,
  `appendRows` filtert nur neue Zeilen (`AppendRowsContextIf.filter`, 019), Baum-/Gruppen-/Pivot-Filter-Pipelines,
  Overlay-Muster „ein Div im Host“ (`TableOverlay`, `CellEditorService`, `FillHandleService`), Ereignis-Isolation
  (`TableScope.isEventInDetail`), Eingabe-Pipes (`createNumberInputPipe`, `createDateInputPipe`).

**Ergebnis:** Filterzeile, Filter-Menü und Spaltenauswahl fehlen vollständig; die Anzeige „No. of Records“, Vollbild
und Export-Knöpfe sind App-Sache und bleiben es (s. „Nicht in diesem Prompt“).

## Teil A – Spaltenfilter-Modell (Pflicht, DOM-frei, Grundlage für B und C)

Ein Filter-Zustand **in der Tabelle**, den Filterzeile, Menü, API und Persistenz gemeinsam benutzen. Vorschlag
(Namen im Design festlegen, Ordner `column-filter/`):

```ts
type ColumnFilterOperator =
  | "contains" | "startsWith" | "endsWith" | "equals" | "notEquals"      // Text
  | "lessThan" | "lessOrEqual" | "greaterThan" | "greaterOrEqual" | "between"  // Zahl, Datum
  | "blank" | "notBlank";

interface ColumnFilterIf {
  /** Bedingung aus Filterzeile bzw. Menü. */
  condition?: { operator: ColumnFilterOperator; value: unknown; valueTo?: unknown };
  /** Werteliste des Menüs: nur diese Werte bleiben (fehlt = alle). */
  values?: unknown[];
}
// Zustand: Property → ColumnFilterIf (nie Spaltenindex, wie in 003)

interface TableApi {
  setColumnFilter(column: number | string, filter: ColumnFilterIf | undefined): void;
  getColumnFilter(column: number | string): ColumnFilterIf | undefined;
  getColumnFilters(): Record<string, ColumnFilterIf>;
  setColumnFilters(filters: Record<string, ColumnFilterIf>): void;   // ein Filterlauf, ein Render
  clearColumnFilters(): void;
  isColumnFiltered(column: number | string): boolean;
}
interface EventListenerIf { onFilterChanged?(evt: GeFilterEvent): void; }   // nach Filterlauf und Render
```

Regeln und Entscheidungsfragen fürs Design:

- **Ein Prädikat:** Die Spaltenfilter werden zu **einer** Funktion kompiliert (Closures, kein `eval`) und mit
  `externalFilterFunction` per UND verknüpft – an der Stelle, an der heute `externalFilterChanged()` filtert. Ohne
  Spaltenfilter bleibt der Weg bit-gleich (Charakterisierungstest). Entscheiden: eigener Aufruf im Modell oder
  zusammengesetzte `FilterFunction`, die die Tabelle den Area-Modellen gibt.
- **Werte wie überall:** je Zeile über `getRowValue`/`ColumnValues` (berechnete Spalten, Formeln, Zellformeln 013 =
  Ergebnis, nicht Formeltext). Text-Vergleiche auf dem **angezeigten** Text (`getTextValueAt`-Logik) oder dem Rohwert?
  Im Design entscheiden und begründen (Zahl „1.234,50“ vs. `1234.5`); Vorgabe: Zahl-/Datumsspalten vergleichen roh,
  Textspalten ohne Groß-/Kleinschreibung (Option `caseSensitive`), `ColumnDef.filterValueGetter?` als Haken.
- **Spaltentyp:** Woran erkennt die Tabelle Zahl/Datum/Text/Boolean? Vorschlag `ColumnDef.filter?: boolean | "text" |
  "number" | "date" | "set" | Partial<ColumnFilterOptionsIf>` (`false` = Spalte nicht filterbar: kein Feld, kein
  Trichter); ohne Angabe Erkennung aus den ersten Werten (`PropertyTypeService` prüfen). Zeilennummern-, Checkbox-,
  Gruppen- und Pivot-Wertspalten: im Design festlegen (Vorgabe: nicht filterbar).
- **Modelle:** `AreaModelObjectArray`, `AreaModelArrayOfArrays` (Spalte = Index, Zustandsschlüssel `#<index>` wie in
  010), `AreaModelTree` (Vorfahren von Treffern bleiben), `AreaModelRowGroups` und `AreaModelPivot` (Prädikat bekommt
  die Quellobjekte – nur Filter auf Quell-Properties; wie zeigt man das in B/C?), `AreaModelSheet`, eigene
  `AreaModelIf` (Filter nur, wenn das Modell filtern kann – sonst Warnung + keine UI, alternativ nur Ereignis für
  serverseitiges Filtern: `tableOptions.columnFilter.managed: false` wie bei Row Drag 009). Je Modell eine Zeile in der
  Bausteintabelle.
- **Zusammenspiel** (je ein Test): Sortierung bleibt; `footerAggregates`, Auswahl-Summen, „Show values as“ folgen;
  Overlay `noMatches`; `appendRows` filtert neue Zeilen mit dem kombinierten Prädikat; Row Drag ist bei aktivem Filter
  gesperrt (wie heute); Batch-Edit/Undo schreiben in ausgefilterte Zeilen wie heute; Master/Detail schließt Details
  ausgefilterter Zeilen nicht; `setRows` – Filter bleibt oder fällt weg? (heute verwirft `setRows` Filter + Sortierung,
  `TODO.md`) im Design entscheiden.
- **Zustand (003):** neuer Teil `filters` in `TableStateIf` (Property → Filter, JSON; Datumswerte als ISO-Text),
  Flag `autoRestoreFilterState`, `markDirty('filters')`, `applyState`/`resetState`, `GeStateChangeEvent.changedParts`.
  Dazu der Zustand „Filterzeile sichtbar“ (Teil B).
- **Ereignis** `onFilterChanged` (`GeFilterEvent`: `filters`, geänderte Property, `source: "row" | "menu" | "api" |
  "state"`, `rowCount`, `unfilteredRowCount`) – einmal je Filterlauf, nach dem Render; Wrapper-Event `filterChanged`
  in allen Frameworks (Muster `columnResizeEnd` aus 022).
- **Performance (021):** Filtern von 2 Mio. Zeilen bleibt ein Durchlauf (kein Durchlauf je Spalte, keine Objekte je
  Zeile); `test:perf`-Szenario „Spaltenfilter setzen“ und Invariante „ein Filterlauf + ein Render je Änderung“.

## Teil B – Filterzeile im Header (Pflicht) – **eine einfache Option, Vorgabe `false`**

```ts
const tableOptions = { ...new TableOptions(), filterRow: true };          // mehr braucht es nicht
// fein: filterRow: { visible: true, debounce: 200, placeholder: "Search", height: 34 }
```

- `tableOptions.filterRow?: boolean | Partial<FilterRowOptionsIf>` – **Vorgabe `false`**: ohne die Option ist die
  Tabelle bit-gleich zu heute (DOM-Snapshot-Test, Export-Snapshot nur Zugänge). Name im Design festlegen
  (`filterRow` | `headerFilter` | `floatingFilter`); `ColumnDef.filter: false` nimmt eine Spalte aus.
- **Verhalten:** je filterbarer Spalte ein Eingabefeld unter der letzten Header-Zeile; Tippen filtert entprellt
  (Vorgabe ~200 ms, Enter sofort, Escape leert das Feld), Text = `contains`; Zahlspalten verstehen `>100`, `<=5`,
  `10..20`, `=7` (über die Eingabe-Pipes, `locale`), Datumsspalten ISO und `>2026-01-01`; Boolean `true/false`.
  Das Feld zeigt immer die Bedingung aus Teil A (auch wenn sie über das Menü oder die API gesetzt wurde), eine
  Werteliste aus dem Menü zeigt es als Hinweis (z. B. „(3 values)“, nur lesbar). Kleines „×“ zum Leeren.
- **Die wichtigste Entscheidung – wo leben die Eingabefelder?** Der Header wird je Render neu aufgebaut
  (`innerText = ''`), ein `<input>` in einer Header-Zelle verliert bei jedem Repaint Fokus, Cursor und IME-Zustand
  (Live-Daten zeichnen laufend neu!). Optionen im Design vergleichen:
  1. eigene **dauerhafte Ebene** im Host über der Header-Fläche (Muster `ge-table-detail-layer` /
     `ge-table-cell-editor`): Felder bleiben, Lage je Render aus den Spaltenpositionen gerechnet (west/center/east,
     waagerechtes Scrollen, `clip-path` bei Herausscrollen, RTL über `ConvenienceDomService`), der Header reserviert
     nur die Höhe (eine zusätzliche Header-Zeile bzw. Zusatzhöhe im `TableModel`);
  2. echte Header-Zeile im `AreaModel` mit Renderer + Entwurf-Wiederherstellung (`RenderScope.setEditorDraft`-Muster);
  3. dauerhafte Zeile außerhalb des Render-Zyklus als Teil von `EleScope`.
  Empfehlung begründen; Pflicht-Tests unten („Tippen während Live-Append“) entscheiden mit. Virtualisierung beachten:
  100+ Spalten → Felder nur für sichtbare Spalten, Zustand hängt am Filter-Modell, nicht am DOM.
- **Spaltenbreite/-reihenfolge/-sichtbarkeit** ändern (Ziehen 022, `setColumnVisible`, `%`-Spalten, Scrollbalken
  kommt/geht) → Felder folgen im selben Frame; schmale Spalten: Feld schrumpft, unter einer Mindestbreite nur Symbol.
  Header-Gruppen (`AreaModelCellGroups`), Pivot-Header, Spreadsheet-Buchstabenzeile, Zeilennummern-/Checkbox-Spalte:
  kein Feld bzw. im Design festlegen. `setHeaderVisible(false)` blendet auch die Filterzeile aus.
- **Ein-/Ausblenden zur Laufzeit:** `api.setFilterRowVisible(visible)` / `isFilterRowVisible()` (ohne Neuaufbau, Höhe
  neu verteilen, ein Render); Ausblenden behält die Filter (Entscheidung notieren). Persistenz s. Teil A.
- **Ereignis-Isolation:** Tasten im Feld gehören dem Feld (kein `START_EDITING`, kein Strg+A der Tabelle, kein
  Lostippen-Editor 013, keine Zwischenablage-Schicht, kein Spalten-Drag/Sortieren beim Klick ins Feld) – Muster
  `isEventInDetail`/`composedPath()`, kein `stopPropagation`.
- **Tastatur/ARIA (001):** Die Tabelle bleibt **ein** Tab-Stopp. Vorschlag: Felder `tabindex="-1"`; aus dem
  Header-Fokus (↑ aus Body-Zeile 0 → unterste Header-Zeile) führt ↓/Enter bzw. eine neue `ActionId`
  (`FOCUS_COLUMN_FILTER`, z. B. Strg/⌘+Shift+F auf der fokussierten Spalte) ins Feld, Escape/↓ zurück zur Tabelle,
  ←/→ wandern im Feld (Cursor), Tab im Feld = nächstes Feld oder hinaus? Im Design nach WAI-ARIA-Grid entscheiden.
  Rolle der Zeile (`row` mit `gridcell`s bzw. `aria-hidden` + Felder per `aria-owns`), Name je Feld
  (`AriaTexts.filterInput(columnLabel)`), `aria-rowcount`/`aria-rowindex` stimmen weiter, Ansage `filtered(rowCount)`
  nach jedem Filterlauf (entprellt), `axeViolations(host)` leer.

## Teil C – Filter-Menü je Spalte (Pflicht)

```ts
const tableOptions = { ...new TableOptions(), columnFilterMenu: true };   // Vorgabe false
```

- **Trichter** in der Kopfzelle (`data-ge-action="filter-column"`, nur filterbare Spalten, Platz neben Sortier-Icon
  und Resize-Griff; aktiver Filter = hervorgehobenes Symbol `ge-table-column-filter-active` + `aria-pressed`/Text).
  Klick öffnet das Menü, **kein** Sortieren, kein Spalten-Drag, kein Header-Doppelklick (wie der Griff in 022).
  Öffnen auch per Tastatur aus dem Header-Fokus (im Design: Alt+↓ wie Excel) und per `api.showColumnFilterMenu(column)`
  / `hideColumnFilterMenu()`.
- **Popup** (ein Element je Tabelle, im Host oder in `document.body`? – Abschneiden durch `overflow` der Seite,
  Vollbild, verschachtelte Master/Detail-Tabellen, `destroy()` bedenken; an der Spalte ausgerichtet, klappt an den
  Rändern um, RTL): Suchfeld, Vergleichs-Auswahl (Text: `Contains`, `Starts with`, `Ends with`, `Equals`,
  `Does not equal`; Zahl/Datum zusätzlich `<`, `≤`, `>`, `≥`, `Between`, `Blank`), **Werteliste** der vorkommenden
  Werte mit Checkboxen und „(Select all)“, „OK“ / „Cancel“ (Vorgabe: erst OK wendet an; Option `applyOnChange`),
  „Clear“. Schließt bei Escape, Klick außerhalb, Scrollen der Tabelle (oder folgt es?), `destroy()`.
- **Werteliste bei Millionen Zeilen:** eindeutige Werte **lazy beim Öffnen**, ein Durchlauf über die Spalte
  (`Map`, nach den **anderen** aktiven Filtern gefiltert – Excel-Verhalten – oder über alle Zeilen? entscheiden),
  sortiert, Anzeige über den angezeigten Text; Liste **virtualisiert** (z. B. 200.000 verschiedene IDs) – eigene
  Mini-Liste oder eine innere `TableScope` (`ctx.createTable`-Muster aus 011)? Kappung `maxValues` mit Hinweis
  („first 10 000 values – refine the search“), das Suchfeld grenzt die Liste ein. Messen (021): Öffnen bei 2 Mio.
  Zeilen bleibt bedienbar (Ziel im Design nennen, `bench/`-Messung, kein Zeit-Assert im Browser-Projekt). Haken
  `ColumnFilterOptionsIf.getValues?(ctx)` für eigene/serverseitige Wertelisten.
- **Kein HTML aus Daten:** Werte und Labels nur über Text-APIs; Injection-Test mit `<img src=x onerror=…>` als
  Zellwert in der Werteliste, im Filterfeld und im Hinweistext.
- **ARIA:** Trichter = `button` mit Name (`AriaTexts.filterColumn(label)`), `aria-haspopup="dialog"`,
  `aria-expanded`; Popup `role="dialog"` + `aria-label`, Fokusfalle, Fokus zurück an die Tabelle (Header-Fokus der
  Spalte) beim Schließen; Werteliste `listbox` mit `aria-multiselectable` bzw. Checkbox-Gruppe; alle Texte über
  `AriaTextsIf` + `tableOptions.columnFilterTexts` (englische Defaults, Beispiel mit deutschen Texten in der Doku).
- **CSS:** `packages/table/css/table-column-filter.css`, Klassen `ge-table-filter-row*`, `ge-table-column-filter*`,
  Variablen `--ge-table-filter-*` light + dark, logische Eigenschaften (RTL), Kopie nach
  `apps/webpage-guiexpert/src/styles/ge-table.css`; CSP-tauglich (keine Inline-Styles außer Positionen über
  `domService`).

## Teil D – Spaltenauswahl „Columns“ (kleiner Zusatz, im Design entscheiden: hier oder eigener Prompt)

- `api.showColumnChooser(anchor?: HTMLElement)` / `hideColumnChooser()`: Popup mit einer Checkbox je Spalte (Label =
  Header-Text, Reihenfolge = aktuelle Spaltenreihenfolge, Suchfeld ab N Spalten, „alle“), schaltet
  `setColumnVisible` (Zustandsteil `columns` wird schon gespeichert). Nutzt dieselbe Popup-Basis wie Teil C.
  Zeilennummern/Checkbox-Spalte nicht aufgeführt; `ColumnDef.hideable?: boolean` im Design prüfen (022-Muster).
  Mindestens eine Spalte bleibt sichtbar.
- **Keine eingebaute Fußleiste.** Der Knopf „Columns“, „No. of Records“, Filterzeile ein/aus und Vollbild sind in der
  Demo plain HTML der Anwendung über die API (`getDisplayedRowCount`/Zeilenzahl aus `onFilterChanged`,
  `setFilterRowVisible`, `showColumnChooser(button)`, `host.requestFullscreen()`); als Rezept dokumentieren.
  Eine eingebaute Statusleiste wäre ein eigener Prompt (Vorschlag in `prompts/README.md` notieren, zusammen mit
  014 Kontextmenü – dort später Einträge „Filter…“, „Spalte ausblenden“, „Spalten…“).

## Nicht in diesem Prompt

- Serverseitiges Filtern / Server-Side-Row-Model (nur der Haken `managed: false` + Ereignis aus Teil A).
- Erweiterte Filter (mehrere Bedingungen je Spalte mit UND/ODER, Filter-Builder), Schnellfilter über alle Spalten
  (bleibt `externalFilterFunction` + `GeFilterService`).
- Eingebaute Fußleiste/Statusleiste, Vollbild-Knopf, Export-Knöpfe, Paging.
- Kontextmenü (Vorschlag 014).

## Referenzfälle (Snippets ≤ 15 Zeilen fürs Design, Video-tauglich)

1. `filterRow: true` auf 200.000 Zeilen (Daten wie im Screenshot: ID, Company, Region, Plan, Seats, MRR, Status +
   `footerAggregates` auf MRR): „emea“ in Region → nur EMEA, Summe im Footer folgt, Overlay bei 0 Treffern.
2. `columnFilterMenu: true`: Menü auf „Plan“, zwei Werte abwählen, OK → Trichter aktiv, Filterzeile zeigt den Hinweis.
3. Filter per API setzen und speichern: `setColumnFilter("seats", { condition: { operator: "greaterThan", value: 40 } })`,
   Reload → Filter und Felder wieder da (`autoRestoreOptions`).
4. App-Fußleiste in plain HTML: Zeilenzahl aus `onFilterChanged`, Knopf „Columns“ → `showColumnChooser(button)`.

## Tests (Vitest, zuerst rot)

Unit (DOM-frei): Prädikat-Compiler je Operator und Typ (leer, `null`, `NaN`, Datum, Text mit Zahl, Groß/Klein,
`between` mit vertauschten Grenzen), Parser der Filterzeilen-Eingabe (`>100`, `10..20`, Locale), Zustand
(Serialisieren, `applyState`, unbekannte Property = ignoriert), eindeutige Werte (Kappung, Sortierung, `1` ≠ `"1"`).

Browser (Chromium, ltr **und** rtl, klassische Scrollbalken; echte Maus/Tastatur über `real-mouse.ts` bzw.
`userEvent`, Tasten über `test-utils/platform.ts`, WebKit für die `*.realmouse`-Specs):

- Ohne Optionen: DOM und Verhalten wie vorher (kein Feld, kein Trichter, `externalFilterFunction` bit-gleich).
- Filterzeile: Tippen filtert entprellt, Enter sofort, Escape leert; Feld behält **Fokus, Cursor und Text**, während
  `appendRows` im 16-ms-Takt rendert, während sortiert, eine Spalte gezogen/verschoben und waagerecht gescrollt wird
  (fixierte West-/East-Spalten); Feld einer herausgescrollten Spalte behält seinen Wert.
- Tasten im Feld lösen nichts in der Tabelle aus (kein Editor, keine Selektion, kein Kopieren der Tabelle); Klick ins
  Feld sortiert nicht und startet keinen Spalten-Drag; Strg/⌘+A markiert den Feldtext.
- Menü: öffnen/schließen (Klick, Escape, außerhalb, `destroy()`), OK/Cancel, „Select all“, Suche grenzt ein, Operator
  + Wert, aktiver Trichter; Popup an Rändern und in RTL im sichtbaren Bereich; Fokus kehrt zurück.
- Kombination: Filterzeile + Menü + `externalFilterFunction` = UND; Sortierung bleibt; Footer-Summen, Overlay,
  `aria-rowcount`, Ansage; Baum (Vorfahren bleiben), Row Groups, Pivot (Quell-Properties), `bodyData`-Tabelle.
- Zustand: `getState().filters`, `applyState`, Reload über `autoRestoreOptions`, `resetState`, ein `onStateChanged`.
- `onFilterChanged`: genau eins je Änderung, nach dem Render (`getDisplayedRowCount` stimmt im Handler), `source`.
- Spaltenauswahl: Checkbox schaltet Sichtbarkeit, letzte Spalte nicht abwählbar, Zustand `columns`.
- HTML-Injection (Feld, Werteliste, Labels), `axeViolations(host)` leer (Filterzeile sichtbar, Menü offen).
- Invarianten (021): ein Filterlauf + ein Render je Änderung; Tippen baut keine Header-Zellen neu (je nach
  Entscheidung in Teil B); `test:perf`: Filter setzen und Menü öffnen, kleines vs. großes n.
- Wrapper-Smoke (mind. React + Web Component, Angular `test:angular`): `filterRow: true` rendert Felder,
  `filterChanged` kommt an, neues Options-Objekt = Neuaufbau mit Feldern.

## Doku, Demo, Website, Training, Video

- `instructions.md`: neuer Abschnitt „Column filters“ (Option, Operatoren, Eingabe-Syntax, API, Zustand, eigene
  Texte, eigene Werteliste, Fußleisten-Rezept); Abgrenzung zu `externalFilterFunction` (bleibt für eigene UI).
  FAQ 6.26 („Wie bekomme ich Filterfelder im Header?“), `llms.txt` (Rezept + Pitfall „eigene Inputs in Header-Zellen
  rendern“), `packages/table/README.md`, JSDoc mit `@example` + `@since`, `docs:check`, `check:llms`.
- Demo: `apps/table-demo/column-filter.html` (Daten wie Referenzfall 1, Fußleiste in plain HTML, Ereignis-Log);
  Modell-Fabrik in `demo-table-models` (fester Seed). Website: Showcase `columnfilter`, Eintrag in
  `src/features/new-features.ts`, `/doc/`-Tabellen, Vergleichstabelle `why.astro` ehrlich nachziehen. Die
  Platzhalter-Showcases `inputfilter`/`sliderfilter` nicht anfassen, außer das Design schlägt vor, sie damit zu füllen.
- Training: Abschnitt im Kapitel `filtering` (`#column-filters`, `<Callout type="version">`) **oder** neues Kapitel
  41 in Teil 8 – in Phase 1 entscheiden.
- Video (nächste freie Nummer `videos/16-…`, Backlog-Zeile in `CLAUDE.md` §10): „Filter im Header – eine Option“.
  **ag-Grid-Stufe vor dem Titel auf ag-grid.com prüfen** (Stand der Annahme: Spaltenfilter + Floating Filters
  Community, Set Filter mit Werteliste und Columns-Tool-Panel Enterprise) – „ohne Enterprise-Lizenz“ nur für das, was
  dort wirklich Enterprise ist. NitGrid in Doku/Video nicht nennen.

## Abschluss-Review (separater Agent, Schwerpunkte)

Fokus-/Cursor-Verlust beim Repaint; Tastatur-Isolation in beide Richtungen; Lecks (Listener, Popup in `document.body`,
Timer der Entprellung nach `destroy()`); Kosten bei 2 Mio. Zeilen und 200 Spalten; RTL und fixierte Spalten;
ARIA/axe; XSS; bit-gleiches Verhalten ohne Optionen; Zustand ohne Indizes.

## Fertig, wenn

- Design freigegeben; Teile A–C (und D laut Entscheidung) mit roten, dann grünen Tests; alle bestehenden Tests grün
  (`test:browser`, `test:browser:scrollbars`, `test:browser:webkit`, `test:perf`, `test:wrappers`, `test:angular`,
  `check:llms`, `docs:check`), ltr und rtl, Export-Snapshot nur Zugänge.
- `filterRow` und `columnFilterMenu` sind **Vorgabe `false`**; ohne sie ändert sich nichts.
- Doku, Demo, Website, Training, Video wie in Phase 1 entschieden; `CLAUDE.md` (§3.6, §3.7, §4, §10), `TODO.md`,
  `prompts/README.md` (Status).
- Release-Block (Phase 10) nur auf Anweisung.
