# 023 – Spaltenfilter: Design, API und Entscheidungen

> Zu `prompts/023-spaltenfilter.md`. Branch `feat/spaltenfilter` (von `main` @ `1.1.113`), Zielversion **`1.1.114`**
> (nur für `@since`-Angaben, noch nicht hochgezählt).
> 🛑 **Haltepunkt nach Phase 1:** Optionen, `ColumnFilterIf`, `TableApi`, `TableStateIf.filters` und
> `EventListenerIf.onFilterChanged` (Wrapper-Event `filterChanged`) sind öffentliche API in allen Wrappern – bitte die
> Entscheidungen in Abschnitt 4 bestätigen oder anpassen, bevor Phase 2 (rote Tests) startet.

---

## 1. Befund im Code (24.11.2026)

Zusätzlich zum Befund in `prompts/023-spaltenfilter.md` beim Lesen des Cores gefunden:

1. **`PropertyTypeService` erkennt kein `Date`:** `packages/table/src/lib/common/generator/property-type.service.ts`
   unterscheidet nur `string`, `number`, `boolean`, `array`, `object`, `null`, `undefined` (`Date` landet im
   `object`-Zweig). Für die Spaltentyp-Erkennung der Filter braucht `column-filter/` deshalb einen eigenen, kleinen
   DOM-freien Helfer `inferColumnFilterType` (inkl. `Date` und ISO-Datumsstrings).
2. **`parseLocaleNumber` und `parseDateText` in `clipboard/input-pipes.ts` sind derzeit datei-privat:** Beide Parser
   existieren bereits und beherrschen Locale-Dezimaltrenner, Tausendertrenner, Währungs-/Prozentzeichen, `YYYY-MM-DD`
   und Locale-Datumsformate (`Intl.DateTimeFormat().formatToParts`). Sie werden als interne Helfer (bzw. exportiert für
   `column-filter/`) wiederverwendet statt neu geschrieben.
3. **`TableModel.getPadding().top` ist die einzige Quelle für den oberen Abstand in allen Diensten:** Nicht nur
   `EleScope.layoutContainers()` und `RenderScope` (`getBodyViewport`, `getBodyCellRectInHost`, `getBodyCellAtHostPoint`,
   `adjustArea`, `hoverRow`), sondern auch `FillHandleService.updateAutoScroll` und `RowDragService.getMarkerWidth`
   lesen direkt `tableModel.getPadding().top`. Wenn `TableModel.recalcPadding()` die Höhe einer sichtbaren Filterzeile
   über `this.tableScope?.getHeaderExtraHeight?.() ?? 0` einbezieht, stimmen **alle** bestehenden Layout-, Scroll-,
   Overlay-, Master/Detail-, Hover-, Fill- und Drag-Rechnungen automatisch mit – und ohne `filterRow` bleibt
   `padding.top` bit-gleich.
4. **`TableScope.externalFilterChanged()` läuft nur, wenn `externalFilterFunction` gesetzt ist:**
   `table-scope.ts:2874` bricht ohne `externalFilterFunction` ab. Mit Spaltenfiltern wird eine zentrale Methode
   `getEffectiveFilterFunction()` eingeführt, die `externalFilterFunction` und die kompilierten Spaltenfilter per UND
   verknüpft; beim Entfernen des letzten Spaltenfilters ohne `externalFilterFunction` wird `() => true` an das Modell
   gegeben, damit alle Zeilen zurückkehren.
5. **Ereignis-Isolation läuft über `isEventInDetail(evt)` (`composedPath()`):** `MouseHandler.isBlocked`,
   `ShortcutService.onKeyDown`, `InputHandler` (`keydown`/`change`), `RowDragService`, `FillHandleService`,
   `CellEditorService` und `ClipboardService` prüfen bereits `isEventInDetail`. Ein gemeinsamer Haken
   `isEventInOverlayLayer(evt)` (oder Erweiterung in `TableScope`, der Detail-Ebene, Filterzeile und Filter-/Spalten-Popup
   über `composedPath()` erkennt) isoliert alle Filter-Elemente ohne `stopPropagation()`.
6. **`setRows()` in `AreaModelObjectArray` verwirft heute Filter:** `setRows()` kopiert `rows` nach `filteredRows`,
   ohne zu filtern (`AreaModelRowGroups.setRows` hingegen wendet `userFilter` neu an). Entscheidung dazu s. Punkt 7.
7. **ag-Grid-Stufen (geprüft auf ag-grid.com):**
   - Standard-Spaltenfilter (Text, Zahl, Datum) + Floating Filters = **Community**.
   - **Set Filter** (Excel-Werteliste mit Checkboxen), **Multi Filter** (Bedingung + Werteliste) und **Columns Tool
     Panel** (`@ag-grid-enterprise/column-tool-panel`) = **Enterprise**.
   - Folgerung für Website/Video: „ohne Enterprise-Lizenz“ nur für Werteliste (Set Filter) und Spaltenauswahl verwenden,
     nicht pauschal für einfache Spaltenfilter.
8. **Website/Training Ist-Stand:**
   - `apps/webpage-guiexpert/src/components/home/why.astro:42` führt noch `["Filter UI", "✔", "✔", "– your UI, a filter function"]`
     und erwähnt in der Bildunterschrift das Fehlen einer Filter-UI.
   - `apps/webpage-guiexpert/src/pages/training/filtering.astro` (Kapitel 21) ist mit 57 Zeilen kompakt; Teil 8 endet bei
     Kapitel 40 (`spreadsheet`).
   - `videos/README.md` steht bei Folge `15` → nächste freie Nummer ist **`16`**.

---

## 2. Bausteintabelle

### 2.1 Core-Bausteine

| Baustein | Wofür | Ergebnis / Änderung |
|---|---|---|
| `TableOptionsIf` / `TableOptions` | Optionen | **additiv**: `filterRow?`, `columnFilterMenu?`, `columnFilter?`, `columnFilterTexts?` (alle Default `undefined`/`false`) |
| `ColumnDefIf` / `ColumnDef` | Spaltendefinition | **additiv**: `filter?: ColumnFilterColumnOption`, `hideable?: boolean` (wie `resizable`/`movable` in 022) |
| `RowNumberColumnDef`, `CheckboxColumnDef`, `RowGroupColumnDef`, `PivotColumnDef` | Eingebaute Spalten | `filter = false` als Default (nicht filterbar); `RowNumber`/`Checkbox` erscheinen nicht in der Spaltenauswahl |
| `TableModel.recalcPadding()` | Header-Höhe | **erweitern**: addiert `this.tableScope?.getHeaderExtraHeight?.() ?? 0` wenn `headerVisible`; ohne `filterRow` = 0 (bit-gleich) |
| `EleScope` / `RenderScope` | Layout, Header-Rendering | **erweitern**: Header-Zelle (unterste Zeile) rendert bei `columnFilterMenu` den Trichter-Button vor dem Resize-Griff; `afterRenderPass()` aktualisiert `FilterRowService` |
| `TableScope` | Filter-Orchestrierung, Events, Isolation, Lifecycle | **erweitern**: `columnFilterService`, `filterRowService`, `filterPopupService`, `getEffectiveFilterFunction()`, `applyColumnFilters()`, `destroy()` räumt alle Timer/Listener/Popups auf |
| `TableApi` | Öffentliche Fassade | **additiv**: `setColumnFilter`, `getColumnFilter`, `getColumnFilters`, `setColumnFilters`, `clearColumnFilters`, `isColumnFiltered`, `setFilterRowVisible`, `isFilterRowVisible`, `showColumnFilterMenu`, `hideColumnFilterMenu`, `showColumnChooser`, `hideColumnChooser` |
| `EventListenerIf`, `EventAdapter`, `event-listener-hub`, alle 7 Wrapper | Filter-Ereignis | **additiv**: `onFilterChanged?(evt: GeFilterEvent)` bzw. Wrapper-Event `filterChanged` (Muster `columnResizeEnd` aus 022) |
| `TableStateIf`, `TableStatePart`, `AutoRestoreOptionsIf`, `TableStateService` | Persistenz (003) | **additiv**: Teil `"filters"`, Felder `filters?` + `filterRowVisible?`, Flag `autoRestoreFilterState` (Default `false`); vor `"sort"`/`"scroll"` angewendet |
| `MouseHandler` | Klick/Doppelklick/Drag | **erweitern**: `data-ge-action="filter-column"` als Click-Action (kein Sortieren, kein Spalten-Drag, kein Header-Doppelklick); Events in Filterzeile/Popup über `isBlocked` ignoriert |
| `ShortcutService` / `ActionId` | Tastatur | **additiv**: `FOCUS_COLUMN_FILTER`, `OPEN_COLUMN_FILTER_MENU` über Feature-Schicht `columnFilterShortcutLayer(mac)` (nur aktiv mit Option); Events aus Filter-UI ignoriert |
| `AriaGridInfo`, `AriaTextsIf` / `AriaTexts` | ARIA (001) | **erweitern**: `AriaGridInfo` berücksichtigt Filterzeile als +1 Header-Zeile; `aria-owns` bindet Filterzeilen-Rowgroup ein; neue Texte in `AriaTextsIf` |
| `RowDragService`, `TableOverlay`, `AreaModelAggregateFooter`, `SelectionAggregator`, `CopyService`, `ExcelService` | Zusammenspiel | **passt unverändert**: nutzen `getUnfilteredRowCount()`, gefilterte Zeilen, `invalidateAggregates()` und `padding.top` |
| `clipboard/input-pipes.ts` | Zahlen-/Datumsparser | `parseLocaleNumber` und `parseDateText` intern wiederverwendbar exportieren |
| `packages/table/css/` | Styling | neue Datei `table-column-filter.css` + Variablen `--ge-table-filter-*` in `table-color-vars.css` (light + dark), Kopie nach `apps/webpage-guiexpert/src/styles/ge-table.css` |

**Breaking Changes:** Keine. Ohne die neuen Optionen (`filterRow`, `columnFilterMenu`) bleiben DOM, Verhalten,
Tastaturbelegung, `padding.top` und `externalFilterFunction` bit-gleich (Export-Snapshot in `index.spec.ts` bekommt nur
Zugänge).

### 2.2 AreaModel-Matrix

| Modell | Filterbar? | Wie der Filter wirkt | Werteliste (Menü) | Besonderheiten |
|---|---|---|---|---|
| `AreaModelObjectArray` (+ `WithColumndefs`) | ✔ | `externalFilterChanged(combinedFn)` auf `rows`; `appendRows` filtert neue Zeilen mit `combinedFn` | ein Durchlauf über `getAllRows()` (gefiltert nach den *anderen* Filtern) | `valueGetter`, `formula`, `sheetCells` über `getRowValue` |
| `AreaModelArrayOfArrays` | ✔ | `externalFilterChanged(combinedFn)` auf `arr`; Spaltenschlüssel = `columnDef.property` oder `"#<index>"` | ein Durchlauf über `arr` | Spaltenzugriff `row[colIdx]` |
| `AreaModelTree` | ✔ | `externalFilterChanged(combinedFn)` prüft alle `TreeRow`s (auch zugeklappte), Vorfahren von Treffern bleiben sichtbar | Tiefensuche über alle `TreeRow`s (`getRowValue` entpackt `row.data`) | `valueGetter`/`formula` funktionieren |
| `AreaModelRowGroups` | ✔ | `externalFilterChanged(combinedFn)` bekommt Quellobjekte `T`; Gruppen & Aggregate folgen | ein Durchlauf über `getSourceRows()` | `RowGroupColumnDef` hat `filter: false`; Daten-Spalten (und sichtbare Quellspalten) sind filterbar |
| `AreaModelPivot` | ✔ (API auf Quell-Properties) | `externalFilterChanged(combinedFn)` bekommt Quellobjekte `T` vor der Aggregation | – (keine UI auf Pivot-Zellspalten) | `RowGroupColumnDef` und `PivotColumnDef` haben `filter: false` (UI nur auf Quell-Spalten, nicht auf aggregierten Pivot-Spalten) |
| `AreaModelSheet` | ✔ | `externalFilterChanged(combinedFn)` auf Zeilen `0..rowCount-1` (Permutation `Int32Array`) | dünne Iteration über gefüllte Zeilen + `(Blanks)` für leere Zeilen | `tableSheet` wertet Formeln zum Ergebnis aus (`=SUM(...)` wird nach Zahl gefiltert) |
| Eigenes `AreaModelIf` | wenn `isFilterable() === true` | wie oben über `externalFilterChanged(combinedFn)` | über `getValueAt` (oder `getValues`-Haken) | Bei `isFilterable() === false` und `managed: true`: einmalige Warnung + keine Filter-UI; bei `managed: false`: UI + State + `onFilterChanged` ohne Client-Filter (Server-Haken) |

---

## 3. Öffentliche API (TypeScript-Signaturen)

Alle neuen Dateien liegen unter `packages/table/src/lib/table/column-filter/` (Kategorie `@category Sorting & filtering`,
alle Exporte in `packages/table/src/index.ts`, `@since 1.1.114`).

### 3.1 Filter-Modell (`column-filter/`)

```ts
// column-filter/column-filter-operator.type.ts
export type ColumnFilterOperator =
  | "contains" | "startsWith" | "endsWith" | "equals" | "notEquals"
  | "lessThan" | "lessOrEqual" | "greaterThan" | "greaterOrEqual" | "between"
  | "blank" | "notBlank";

// column-filter/column-filter-type.type.ts
export type ColumnFilterType = "text" | "number" | "date" | "boolean" | "set";

// column-filter/column-filter.if.ts
export interface ColumnFilterConditionIf {
  operator: ColumnFilterOperator;
  /** Vergleichswert (entfällt bei "blank" und "notBlank"). Datumswerte als Date oder ISO-String "YYYY-MM-DD". */
  value?: unknown;
  /** Obergrenze für operator: "between" (vertauschte Grenzen werden normiert, inklusiv). */
  valueTo?: unknown;
}

export interface ColumnFilterIf {
  /** Vergleichsbedingung aus Filterzeile, Menü oder API. */
  condition?: ColumnFilterConditionIf;
  /** Zugelassene Einzelwerte (Set-Filter): fehlt = alle; [] = keine Zeile passt. Mit condition per UND verknüpft. */
  values?: unknown[];
}

export type ColumnFiltersMap = Record<string, ColumnFilterIf>;
```

### 3.2 Optionen & Spalten-Konfiguration

```ts
// column-filter/column-filter-options.if.ts
export interface ColumnFilterValueItemIf {
  /** Rohwert (in ColumnFilterIf.values gespeichert; z. B. 42, "EMEA", null). */
  value: unknown;
  /** Angezeigter Text (optional – Default: formatierter Wert bzw. "(Blanks)"). */
  label?: string;
  /** Optionale Trefferzahl für die Anzeige. */
  count?: number;
}

export interface ColumnFilterValuesContextIf {
  columnIndex: number;
  columnDef: ColumnDefIf | undefined;
  property: string;
  search: string;
  maxValues: number;
  /** Aktuelle Filter aller anderen Spalten. */
  otherFilters: ColumnFiltersMap;
}

export interface ColumnFilterColumnOptionsIf {
  /** Spaltentyp (ohne Angabe automatisch aus den ersten Werten ermittelt). */
  type?: ColumnFilterType;
  /** Eigener Wert-Zugriff je Zeile (Default: getRowValue / valueGetter / cellFormulas). */
  valueGetter?: (row: any) => unknown;
  /** Groß-/Kleinschreibung für Textvergleiche dieser Spalte (Default: tableOptions.columnFilter.caseSensitive). */
  caseSensitive?: boolean;
  /** Platzhalter in der Filterzeile für diese Spalte. */
  placeholder?: string;
  /** Eigene / serverseitige Werteliste für das Filter-Menü. */
  getValues?: (ctx: ColumnFilterValuesContextIf) => ColumnFilterValueItemIf[] | Promise<ColumnFilterValueItemIf[]>;
}

/** Wert von ColumnDefIf.filter (Default: true für Datenspalten, false für RowNumber/Checkbox/RowGroup/Pivot). */
export type ColumnFilterColumnOption = boolean | ColumnFilterType | Partial<ColumnFilterColumnOptionsIf>;

export interface FilterRowOptionsIf {
  /** Startzustand der Filterzeile. Default true (sobald filterRow gesetzt ist). */
  visible: boolean;
  /** Entprellzeit beim Tippen in ms (0 = sofort). Default 200. */
  debounce: number;
  /** Platzhalter der Eingabefelder (Default: columnFilterTexts.searchPlaceholder). */
  placeholder?: string;
  /** Höhe der Filterzeile in px. Default 34. */
  height: number;
  /** Kleines "×" zum Leeren eines aktiven Felds. Default true. */
  clearButtonVisible: boolean;
  /** Ab dieser Spaltenbreite (px) wird ein kompaktes Symbol statt eines schmalen Inputs gezeigt. Default 44. */
  minInputWidthInPx: number;
}

export interface ColumnFilterMenuOptionsIf {
  /** Operator + Eingabefeld(er) anzeigen. Default true. */
  showCondition: boolean;
  /** Werteliste mit Checkboxen + Suche anzeigen. Default true. */
  showValues: boolean;
  /** Sofort beim Ändern filtern statt erst auf "OK". Default false. */
  applyOnChange: boolean;
  /** Obergrenze eindeutiger Werte in der Liste. Default 10_000. */
  maxValues: number;
}

export interface ColumnFilterOptionsIf {
  /** true (Default): Tabelle filtert selbst. false: nur UI, Zustand und onFilterChanged (Server-Filter). */
  managed: boolean;
  /** Groß-/Kleinschreibung bei Textvergleichen. Default false. */
  caseSensitive: boolean;
  /** Locale für Zahlen-/Datums-Parser in Filterzeile und Menü (Default: Browser-Locale). */
  locale?: string;
  /** Obergrenze eindeutiger Werte im Menü. Default 10_000. */
  maxValues: number;
}

export interface ColumnFilterTextsIf {
  searchPlaceholder: string;                      // "Search"
  searchValuesPlaceholder: string;                // "Search values…"
  selectAll: string;                              // "(Select all)"
  blanks: string;                                 // "(Blanks)"
  ok: string;                                     // "OK"
  cancel: string;                                 // "Cancel"
  clear: string;                                  // "Clear"
  andLabel: string;                               // "and" (für between)
  selectedValuesCount: (count: number) => string; // "(3 values)" / "(1 value)"
  valuesTruncated: (max: number) => string;       // "Showing first 10,000 values – refine your search"
  noValues: string;                               // "No values"
  columnsTitle: string;                           // "Columns"
  searchColumnsPlaceholder: string;               // "Search columns…"
  operators: Record<ColumnFilterOperator, string>;
}
```

Erweiterungen an `TableOptionsIf` und `ColumnDefIf`:

```ts
// TableOptionsIf (additiv)
filterRow?: boolean | Partial<FilterRowOptionsIf>;
columnFilterMenu?: boolean | Partial<ColumnFilterMenuOptionsIf>;
columnFilter?: Partial<ColumnFilterOptionsIf>;
columnFilterTexts?: Partial<ColumnFilterTextsIf>;

// ColumnDefIf (additiv)
filter?: ColumnFilterColumnOption;
/** false: Spalte kann im Column Chooser nicht ausgeblendet werden (setColumnVisible wirkt weiter). Default true. */
hideable?: boolean;
```

### 3.3 Ereignis, API, Zustand, ARIA und Aktionen

```ts
// data/common/event/ge-filter-event.ts
export type GeFilterEventSource = "row" | "menu" | "api" | "state";

export class GeFilterEvent {
  constructor(
    readonly filters: ColumnFiltersMap,
    /** Betroffene Spalten-Property; undefined bei setColumnFilters / clearColumnFilters / applyState. */
    readonly property: string | undefined,
    readonly source: GeFilterEventSource,
    readonly rowCount: number,
    readonly unfilteredRowCount: number
  ) {}
}

// EventListenerIf (additiv)
onFilterChanged?(evt: GeFilterEvent): void;
// Wrapper-Event in allen 7 Wrappern: "filterChanged" (Svelte zusätzlich onFilterChanged)

// TableApi (additiv)
setColumnFilter(column: number | string | ColumnDefIf, filter: ColumnFilterIf | undefined): void;
getColumnFilter(column: number | string | ColumnDefIf): ColumnFilterIf | undefined;
getColumnFilters(): ColumnFiltersMap;
setColumnFilters(filters: ColumnFiltersMap): void;   // ein Filterlauf, ein Render, ein onFilterChanged
clearColumnFilters(): void;
isColumnFiltered(column: number | string | ColumnDefIf): boolean;

setFilterRowVisible(visible: boolean): void;
isFilterRowVisible(): boolean;

showColumnFilterMenu(column: number | string | ColumnDefIf): boolean;
hideColumnFilterMenu(): void;

showColumnChooser(anchor?: HTMLElement): void;
hideColumnChooser(): void;

// TableStateIf / TableStatePart / AutoRestoreOptionsIf (additiv)
type TableStatePart = "columns" | "sort" | "scroll" | "tree" | "checked" | "selection"
                    | "headerGroups" | "custom" | "details" | "filters";
interface TableStateIf {
  // ... bestehend ...
  filters?: ColumnFiltersMap;       // Date-Werte als ISO-String ("YYYY-MM-DD" bzw. ISO-8601)
  filterRowVisible?: boolean;       // gesetzt, wenn filterRow konfiguriert ist
}
interface AutoRestoreOptionsIf<T> {
  // ... bestehend ...
  autoRestoreFilterState?: boolean; // Default false
}

// ActionId (additiv)
// "FOCUS_COLUMN_FILTER"     (Ctrl+Shift+F / Cmd+Shift+F)
// "OPEN_COLUMN_FILTER_MENU" (Alt+ArrowDown im Header)

// AriaTextsIf (additiv, englische Defaults in AriaTexts)
filterInput?: (columnLabel: string) => string;           // "Filter <column>"
clearColumnFilter?: (columnLabel: string) => string;     // "Clear filter for <column>"
filterColumn?: (columnLabel: string) => string;          // "Filter menu for <column>"
filterColumnActive?: (columnLabel: string) => string;    // "Filter menu for <column> (active)"
filterMenuDialog?: (columnLabel: string) => string;      // "Filter <column>"
columnChooserDialog?: () => string;                      // "Choose columns"
```

---

## 4. Entscheidungen

| # | Frage | Optionen | Empfehlung | Begründung |
|---|---|---|---|---|
| 1 | Wie verknüpfen wir Spaltenfilter mit `externalFilterFunction`? | (A) eigener Aufruf im `AreaModel`; (B) eine zusammengesetzte `FilterFunction` in `TableScope`, die an `tableModel.externalFilterChanged(fn)` und `appendRows` geht | **(B) eine zusammengesetzte `FilterFunction`** | Keine Änderung an `AreaModelIf`, alle 6 eingebauten Modelle + eigene Modelle funktionieren sofort. Ohne Spaltenfilter wird `externalFilterFunction` unverändert durchgereicht (bit-gleich). Alle Spaltenfilter werden zu **einer** Closure-Schleife kompiliert → ein Durchlauf bei 2 Mio. Zeilen, 0 Allokationen pro Zeile. |
| 2 | Rohwert vs. angezeigter Text beim Vergleichen | (A) immer angezeigter Text; (B) Zahl/Datum/Boolean roh, Text auf `String(v)` (ohne Groß/Klein), Haken `filter.valueGetter` | **(B) Zahl/Datum/Boolean roh, Text case-insensitive** | Zahl `"1.234,50"` vs. `1234.5`: `<`, `>`, `between` funktionieren nur auf echten Zahlen. Bei `date` vergleichen `equals`/`notEquals`/`<`/`>`/`between` nach **Kalendertag** (`YYYY-MM-DD`), sobald der Filterwert ein reines Datum ohne Uhrzeit ist – sonst verfehlt `equals 2026-05-10` einen Zeitstempel `2026-05-10T14:30:00Z`. `between` normiert vertauschte Grenzen (`[min, max]`, inklusiv). |
| 3 | Spaltentyp-Erkennung | (A) `PropertyTypeService`; (B) eigener schlanker `inferColumnFilterType` (erste 100 nicht-leere Werte) | **(B) `inferColumnFilterType`** | `PropertyTypeService` kennt kein `Date` und baut Schema-Bäume. Ein 30-Zeilen-Helfer erkennt `number`, `date` (`Date` oder ISO-Strings), `boolean`, sonst `text`; explizites `ColumnDef.filter` hat Vorrang; Ergebnis wird je Spalte gecacht. |
| 4 | Name der Filterzeilen-Option | `filterRow` vs. `headerFilter` vs. `floatingFilter` | **`filterRow`** (Vorgabe `false`) | Kurz, eindeutig, kein ag-Grid-Jargon (`floatingFilter`), passt direkt zu `setFilterRowVisible()`. |
| 5 | **Wo leben die Eingabefelder der Filterzeile?** | (1) Dauerhafte Ebene `ge-table-filter-row-layer` im Host über dem unteren Header-Streifen (Muster Master/Detail 011 + CellEditor 013); (2) echte Header-Zeile im `AreaModel` mit Renderer + Entwurf-Restore; (3) feste Zeile in `EleScope` | **(1) Dauerhafte Ebene in `FilterRowService`** | `RenderScope.adjustArea('header')` leert Header-Zellen bei jedem Render (`innerText = ''`). Mit (2) gehen Fokus, Caret und IME-Komposition bei Live-Append (16-ms-Takt) verloren. Mit (1) werden die `<input>`-Elemente nie neu gebaut, `TableModel.recalcPadding()` reserviert nur die Höhe, 3 Clip-Container (west/center/east) spiegeln RTL & Scrollen im selben Frame, bei 100+ Spalten werden nur sichtbare Felder im DOM gehalten (ein fokussiertes, herausgescrolltes Feld wird per `clip-path: inset(100%)` geparkt statt entfernt – Fokus/IME bleiben!). Ohne Option wird der Dienst gar nicht angelegt → DOM bit-gleich. |
| 6 | Ausblenden der Filterzeile (`setFilterRowVisible(false)`) | (A) aktive Filter bleiben; (B) Filter werden gelöscht | **(A) Filter bleiben** | Entspricht Excel und ag-Grid: die Eingabezeile auszublenden verwirft nicht still die aktuelle Ansicht. Im Header bleibt der aktive Trichter sichtbar; zum Löschen gibt es `clearColumnFilters()`. |
| 7 | Verhalten bei `api.setRows(newRows)` | (A) Filter verwerfen; (B) aktive Spaltenfilter behalten und direkt auf die neuen Zeilen anwenden | **(B) aktive Spaltenfilter behalten & anwenden** | Wenn im Header noch `"emea"` im Feld steht und die App neue Daten lädt, darf die Tabelle nicht plötzlich ungefilterte Zeilen zeigen. Ohne aktive Spaltenfilter bleibt `setRows()` 100 % bit-gleich zu heute (kein Breaking Change). |
| 8 | Zustandsteil `filters` in `TableStateIf` | (A) `filters?: ColumnFiltersMap` + `filterRowVisible?: boolean` (beide unter Part `"filters"` + `autoRestoreFilterState`); (B) verschachtelt `{ columns, rowVisible }` | **(A) flach `state.filters` + `state.filterRowVisible`** | Ergonomisch (`getState().filters["region"]`), JSON-sicher (Daten als ISO-Strings), unbekannte Properties werden bei `applyState` ignoriert, `"filters"` läuft beim Restore vor `"sort"` und `"scroll"`. |
| 9 | Tastatur in der Filterzeile (WAI-ARIA Grid) | (A) `tabindex="0"` je Feld (N Tab-Stopps); (B) `tabindex="-1"`, Einstieg via Header-Fokus (`↓`) oder `Ctrl/⌘+Shift+F`, im Feld `Tab`/`Shift+Tab` zum nächsten/vorigen Filterfeld (am Rand raus aus der Tabelle), `↑` zurück zum Header, `↓` zu Body-Zeile 0, `Escape` leert bzw. zurück | **(B) Tabelle bleibt ein Tab-Stopp** | Wahrt die Regel aus 001 (kein 20-Tab-Stopp-Hindernis). `Tab`/`Shift+Tab` innerhalb der Filterzeile erlaubt schnelles Ausfüllen mehrerer Filter ohne Tastaturfalle am Rand; `←`/`→` bewegen den Textcursor im Feld; `Enter` wendet sofort an (mit `!evt.isComposing` für IME). |
| 10 | Wo lebt das Filter-Menü-Popup (und Column Chooser)? | (A) `document.body` (`position: fixed`); (B) im `hostElement` mit nativer Popover-API (`popover="manual"` + `showPopover()`, Fallback `document.body` + `fixed` für ältere Browser ohne Popover-API) | **(B) `hostElement` + Top-Layer `popover="manual"` (mit Fallback)** | Top-Layer verhindert Abschneiden durch `overflow: hidden` der Tabelle/Seite, funktioniert in `host.requestFullscreen()` (ein `body`-Popup wäre im Vollbild unsichtbar!), erbt `--ge-table-*` und `dir="rtl"` direkt vom Host (auch im Shadow DOM / Web Component) und wird bei `destroy()` sicher entfernt. Positionierung per `getBoundingClientRect()` + `position: fixed; inset: auto; margin: 0` + Viewport-Flip (funktioniert in Chromium, WebKit **und** Firefox – CSS Anchor Positioning fehlt in Firefox). Schließt beim Scrollen der Tabelle (nicht beim Scrollen in der Werteliste), Escape, Klick außerhalb (`pointerdown` + `pointerup` außerhalb) und `destroy()`. |
| 11 | Werteliste im Menü: welche Zeilen & wie virtualisiert? | (A) alle Zeilen vs. gefiltert nach den **anderen** aktiven Filtern; (B) eigene leichte virtuelle Liste (~100 LOC) vs. innere `TableScope` | **(A) nach den anderen aktiven Filtern (Excel-Verhalten); (B) eigene leichte virtuelle Liste** | Filtert man Region = EMEA, zeigt das Menü von Company nur EMEA-Firmen, während Region selbst alle Regionen zeigt. Eine dedizierte ~100-LOC-Virtualliste mit nativen `<input type="checkbox">` + `<label>` ist 10× leichter als eine innere `TableScope`, vermeidet verschachtelte `role="grid"`-ARIA-Konflikte und rendert 10.000 Werte flüssig. Ist die Liste bei `maxValues` gekappt, durchsucht das Suchfeld erneut die Quellzeilen, sodass jeder der 200.000 Werte erreichbar bleibt. |
| 12 | Teil D (Spaltenauswahl „Columns“): hier oder eigener Prompt? | (A) eigener Prompt; (B) in diesem Prompt als Etappe D | **(B) hier als Etappe D** | Nutzt exakt dieselbe Popup-Basis wie Teil C (~150 LOC zusätzlich), schließt Referenzfall 4 vollständig ab und führt `ColumnDef.hideable` konsistent zu 022 (`resizable`/`movable`) ein. Keine eingebaute Fußleiste – Plain-HTML-Rezept in Demo und Doku; Vorschlag „Statusleiste“ in `prompts/README.md`. |
| 13 | Training: Abschnitt in `filtering` oder neues Kapitel 41? | (A) Abschnitt `#column-filters` mit `<Callout type="version">` + Live-Demo in Kapitel 21 `filtering.astro`; (B) neues Kapitel 41 in Teil 8 + Demo-Repo-Tag `ep-041` | **(A) Abschnitt `#column-filters` in Kapitel 21 (`filtering`)** | `filtering.astro` ist nur 57 Zeilen lang; wer nach Filtern sucht, landet genau dort und sieht den direkten Weg von `externalFilterFunction` zu `filterRow: true`. Kein neuer Demo-Repo-Tag nötig (Phase 8 entfällt wie bei 003/004/005/009/010/012/019). |
| 14 | Platzhalter-Showcases `inputfilter` / `sliderfilter` | (A) befüllen; (B) unberührt lassen und neuen Showcase `columnfilter` anlegen | **(B) neuer Showcase `columnfilter`** | Prompt 023 empfiehlt `columnfilter` neu anzulegen und die Platzhalter nicht anzufassen. |
| 15 | Video-Folge | `videos/16-spaltenfilter/` + Backlog #42 in `CLAUDE.md` §10 | **umsetzen in Etappe E** | Titel sachlich nach ag-Grid-Stufe: *„Spaltenfilter & Excel-Werteliste im Header – eine Option (Werteliste bei ag-Grid Enterprise)“*. NitGrid wird nirgends öffentlich erwähnt. |

---

## 5. Architektur & Ablauf im Core (Skizze)

### 5.1 Dateistruktur (`packages/table/src/lib/table/column-filter/`)

- **DOM-frei (Unit-Tests in Node, `*.spec.ts`):**
  - `column-filter-operator.type.ts`, `column-filter-type.type.ts`, `column-filter.if.ts`
  - `column-filter-options.if.ts`, `column-filter-options.ts` (Defaults + `ColumnFilterTexts`)
  - `compile-column-filters.ts`: kompiliert `ColumnFiltersMap` + Spalten-Accessors zu einer einzigen Prädikatfunktion (`compileColumnFilterPredicate`, `compileSingleColumnFilter`, `valueKey` mit Typ-Präfix `n:`/`s:`/`b:`/`d:`/`blank` damit `1 !== "1"`).
  - `infer-column-filter-type.ts`: schnelle Typ-Erkennung aus den ersten 100 nicht-leeren Werten.
  - `parse-filter-input.ts`: parst Eingaben der Filterzeile (`>100`, `<=5`, `10..20`, `=7`, `!=0`, ISO/Locale-Datum, Boolean) und formatiert `ColumnFilterIf` zurück in den Anzeigetext der Filterzeile (`formatFilterCondition`).
  - `collect-distinct-values.ts`: ein Durchlauf über die (nach den anderen Filtern gefilterten) Zeilen mit `Map`, Kappung `maxValues`, Suchfilter und natürlicher Sortierung.
  - `column-filter-state.ts`: JSON-Serialisierung/Deserialisierung (`Date` ↔ ISO-String), Bereinigung leerer Filter und unbekannter Properties.
  - `column-filter-keymap.ts`: `columnFilterShortcutLayer(mac)` (`Ctrl/⌘+Shift+F`, `Alt+ArrowDown`).
- **DOM-Dienste (Browser-Tests in Chromium + WebKit + Scrollbars + RTL):**
  - `column-filter-service.ts`: hält `ColumnFiltersMap`, `ColumnFilterOptionsIf`, orchestriert Kompilierung, Filterlauf (1 Lauf, 1 Render, 1 `onFilterChanged`, 1 `markDirty('filters')`, 1 entprellte ARIA-Ansage) und Typ-Cache.
  - `filter-row-service.ts`: dauerhafte Ebene `ge-table-filter-row-layer` (west/center/east), Spalten-Virtualisierung, `clip-path`-Parken für fokussiertes herausgescrolltes Feld, Debounce-Timer, Clear-Button, Keyboard-Übergänge, ARIA `rowgroup`/`row`/`gridcell`.
  - `filter-popup-shell.ts`: gemeinsame Popup-Basis für Teil C und Teil D (`popover="manual"` im Host mit `body`-Fallback, Viewport-Flip LTR/RTL, Fokusfalle, Fokus-Rückgabe, Escape / Outside-Pointer-Dismiss, `destroy()`).
  - `column-filter-menu-service.ts`: Inhalt des Filter-Menüs (Operator-`<select>`, Bedingungs-Input(s), Suchfeld, virtuelle Checkbox-Liste mit ~28 px Zeilenhöhe, „(Select all)“, OK/Cancel/Clear, Async-`getValues`-Unterstützung).
  - `column-chooser-service.ts`: Spaltenauswahl-Popup (Reihenfolge wie in der Tabelle, Suche ab 8 Spalten, „(Select all)“, `hideable: false` gesperrt, letzte sichtbare Spalte geschützt).

### 5.2 Render-, Event- und Performance-Invarianten

- **Ein Filterlauf + ein Render je Änderung:** `setColumnFilter`, `setColumnFilters`, `clearColumnFilters`, Filterzeilen-Eingabe (nach Debounce) und Menü-„OK“ rufen genau **einmal** `tableModel.externalFilterChanged(combinedFn)` → `reapplySorting()` → `invalidateAggregates()` → Scroll auf `y = 0` → `recalcHeightAndPadding()` → `resetSizeOfWrapperDiv()` → **ein** `repaint()` → `onFilterChanged(evt)` → `stateService.markDirty('filters')` → entprellte ARIA-Ansage.
- **Kein DOM-Neuaufbau der Filter-Inputs:** Tippen in einem Filterzeilen-Feld ändert Body-Zeilen, lässt aber das `<input>`-Element in `ge-table-filter-row-layer` unangetastet (Invariante per Element-Identität + `MutationObserver` in `perf-invariants.browser.spec.ts`).
- **Ohne Optionen 0 Overhead:** `filterRowService` und `columnFilterMenuService` werden nur erzeugt, wenn die jeweilige Option gesetzt ist; `columnFilterService` hält eine leere Map, `getEffectiveFilterFunction()` liefert direkt `externalFilterFunction`.
- **`test:perf` (Stufe 2, Prompt 021):**
  - Szenario 1: `setColumnFilter` auf kleinem vs. großem n (Verhältnis + Trend-Baseline).
  - Szenario 2: `bench/column-filter.bench.ts` für 2 Mio. Zeilen (Filterlauf + `collectDistinctValues` mit Ziel < 100 ms bei 2 Mio. Zeilen).

---

## 6. Referenzfälle (≤ 15 Zeilen, Video-tauglich)

### Fall 1 – Filterzeile auf 200.000 Zeilen mit Summen-Footer

```ts
const tableModel = TableFactory.createTableModel({
  rows: accounts,           // 200 000 Zeilen: id, company, region, plan, seats, mrr, status
  columnDefs,
  footerAggregates: { mrr: "sum", seats: "sum" },
});
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  filterRow: true,
};
```
**Erwartet:** Unter den Spaltentiteln erscheint eine Filterzeile; Tippen von `emea` in `Region` filtert entprellt auf
EMEA-Zeilen, MRR-/Seats-Summen im Footer folgen, bei 0 Treffern erscheint das Overlay „No matching rows“.

### Fall 2 – Filter-Menü mit Werteliste

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  filterRow: true,
  columnFilterMenu: true,
};
```
**Erwartet:** Jede filterbare Kopfzelle zeigt ein Trichter-Symbol; Klick öffnet das Menü unter der Spalte, Abwählen
zweier Pläne + „OK“ hebt den Trichter hervor, die Filterzeile zeigt `(2 values)` mit `×`-Button zum Leeren.

### Fall 3 – Filter per API setzen und im Zustand speichern

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  filterRow: true,
  autoRestoreOptions: {
    ...new AutoRestoreOptions(),
    getStorageKeyFn: () => "accounts-v1",
    autoRestoreFilterState: true,
  },
};
// nach tableReady:
tableApi.setColumnFilter("seats", { condition: { operator: "greaterThan", value: 40 } });
```
**Erwartet:** Nur Zeilen mit `seats > 40`; Filterzeile zeigt `> 40`; nach Reload sind Filter, Anzeige im Feld und
gefilterte Zeilen wiederhergestellt.

### Fall 4 – App-Fußleiste in plain HTML mit Spaltenauswahl

```ts
const listener = new EventAdapter();
listener.onFilterChanged = (evt) => {
  countEl.textContent = `Records: ${evt.rowCount} / ${evt.unfilteredRowCount}`;
};
columnsBtn.addEventListener("click", () => tableApi.showColumnChooser(columnsBtn));
toggleBtn.addEventListener("click", () => tableApi.setFilterRowVisible(!tableApi.isFilterRowVisible()));
fullBtn.addEventListener("click", () => host.requestFullscreen());
```
**Erwartet:** Fußleiste aktualisiert die Trefferzahl synchron nach jedem Filterlauf, „Columns“ öffnet die Spaltenauswahl
am Button, Filterzeile lässt sich ohne Neuaufbau umschalten, Vollbild schließt das Popup mit ein.

---

## 7. Etappenplan & Fortschritt

Jede Etappe folgt „rote Tests → Implementierung → grüne Tests“ und bleibt in sich releasefähig:

- [x] **Phase 1:** Design-Dokument `prompts/023-spaltenfilter.design.md` (🛑 Freigabe abwarten)
- [x] **Etappe A (Teil A):** DOM-freies Filter-Modell (`column-filter/`), Kompilierer, Typ-Erkennung, `TableScope`/`TableApi`, `onFilterChanged` + alle 7 Wrapper, Zustand `filters` + `autoRestoreFilterState`, Zusammenspiel mit allen 6 AreaModels + `appendRows` + `setRows` + Sortierung + Footer + Overlay + Row Drag + Batch-Edit + Master/Detail, Perf-Invarianten & `test:perf`
- [x] **Etappe B (Teil B):** Persistente Filterzeile `FilterRowService`, Eingabe-Parser (`>100`, `10..20`, Locale, Datum, Boolean), Live-Append-Fokus/Caret-Tests, Spalten-Drag/Resize/Scroll/RTL-Sync, Ereignis-Isolation, Tastatur & ARIA (`axeViolations === []`), `setFilterRowVisible`
- [x] **Etappe C (Teil C):** Trichter-Button in Kopfzellen, `FilterPopupShell` (`popover="manual"` + Fallback), `ColumnFilterMenuService` mit Operatoren, Suche, virtueller Werteliste, `(Select all)`, `maxValues`, `getValues`, OK/Cancel/Clear, RTL/Viewport-Flip, ARIA-Dialog & Fokusfalle, `showColumnFilterMenu`
- [x] **Etappe D (Teil D):** `ColumnChooserService`, `ColumnDef.hideable`, `showColumnChooser`/`hideColumnChooser`, Schutz der letzten sichtbaren Spalte
- [x] **Etappe E (Phasen 4–10):** Doku (`instructions.md`, FAQ 6.26, `llms.txt`, `packages/table/README.md`, JSDoc, `typedoc:website`), Demo (`demo-table-models`, `apps/table-demo/column-filter.html`), Website (`showcase/columnfilter`, `new-features.ts`, `/doc/`, `why.astro`, `ge-table.css`), Training (`filtering.astro#column-filters` + Live-Demo + Screenshots), Video (`videos/16-spaltenfilter/`), `CLAUDE.md`, `TODO.md`, `prompts/README.md`, Vollprüfung + separater Review-Agent + Release-Block
- [x] **Abschluss-Review (24.11.2026, separater Agent):** 12 Befunde, 11 behoben (rote Tests zuerst:
  `column-filter-review.browser.spec.ts`, Ergänzungen in `parse-filter-input.spec.ts` und `compile-column-filters.spec.ts`),
  1 als bekannte Grenze in `TODO.md` (`#<index>`-Schlüssel bei `bodyData`). Geänderte Entscheidungen: das Menü schließt
  nur bei **waagerechtem** Scrollen der Tabelle; Spaltenfilter behalten die waagerechte Scrollposition; unvollständige
  Eingabe in der Filterzeile behält den aktiven Filter; Anzeige-Text = Eingabe-Syntax (`""` statt „(Blanks)“);
  mit Suchtext übernimmt OK die im Suchergebnis angehakten Werte (Excel); Monatsangaben für Datumsspalten.
