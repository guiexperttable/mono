# CLAUDE.md – GuiExpert Table Mono-Repo

> Leitfaden für Claude (und Menschen) zur Arbeit an der **GuiExpert Table** – einer framework-agnostischen,
> hoch performanten Daten-Tabelle für den Browser (Konkurrenzprodukt zu ag-Grid).
> Autor: Dr. Marc Kronberg · Website: https://gui.expert · Repo: https://github.com/guiexperttable/mono
>
> Zwei Ziele:
> 1. **Code**: Verbesserungen und Erweiterungen am Source-Code (Core + Wrapper).
> 2. **Content**: Eine **1-Minuten-Videoreihe**, die zeigt, wie man mit der Tabelle typische Probleme löst.
>
> Dieses Mono-Repo (Okt. 2026, frischer Git-Start) ersetzt `ge-table` + 9 `angular-XX-table`-Repos +
> `angular-table-demo`. Die alten Repos bleiben unverändert bestehen (Archiv, alte Historie).

---

## 1. Layout

```
mono/
├── packages/
│   ├── table/                 # @guiexpert/table – CORE, framework-frei, 0 Runtime-Deps (nur tslib)
│   ├── demo-table-models/     # @guiexpert/demo-table-models
│   ├── react-table/ preact-table/ solid-table/ svelte-table/ vue3-table/ webcomponent-table/
│   └── angular-table/         # GEMEINSAMER Angular-Quellcode (src/, README, instructions.md) – kein eigener Build
├── angular-builds/
│   └── ng14 … ng22/           # je Angular-Major ein Build-Paket (angular-build-ngNN) → @guiexpert/angular-table@NN.x.y
│       ├── package.json       #   Angular-/TS-/ng-packagr-Versionen dieser Major, Scripts sync/build/npm-pub
│       ├── tsconfig.json      #   moduleResolution je TS-Version, baseUrl für ng14–21 (ngcc braucht es), paths → packages/table/dist
│       ├── lib/package.json   #   veröffentlichtes npm-Manifest (Peer-Dependencies!)
│       ├── lib/ng-package.json, lib/tsconfig.lib*.json
│       ├── lib/src/           #   GENERIERT (git-ignored) durch scripts/sync-angular-src.mjs
│       └── overrides/         #   optional: versionsspezifische Dateien über den gemeinsamen Code
├── apps/
│   ├── table-demo/ ts-todo-demo/ react-/preact-/solid-/svelte-/vue3-table-demo/ vue3-multi-demo/ webcomponent-table-demo/
│   ├── angular-table-demo/    # Angular 17, NgModule-basiert, ~20 Feature-Demos (nutzt noch npm-Pakete, s. TODO.md)
│   ├── webpage-guiexpert/     # Astro 7 + Tailwind 3 (via PostCSS): Quelle von https://gui.expert
│   └── table-website/         # Ziel für typedoc-Ausgabe
├── scripts/
│   ├── sync-angular-src.mjs   # packages/angular-table/src + Core-CSS → angular-builds/ngNN/lib/src
│   └── version.mjs            # check | sync | patch | minor – ein Versionsschema für alle Pakete
├── instructions.md            # Entwickler-Doku aller Frameworks (geprüft, s. §6)
├── TODO.md                    # offene Code-Aufgaben
├── prompts/                   # Feature-Prompts für neue Sitzungen (Index + Reihenfolge: prompts/README.md)
└── llms.txt  README.md  LICENSE  pnpm-workspace.yaml (packages/*, angular-builds/*, apps/*)
```

## 2. Befehle (Root, pnpm 9.15.9 via `packageManager`, Node ≥ 22.22.3)

| Zweck | Befehl |
|---|---|
| Install | `pnpm i` |
| Core bauen (Voraussetzung für alles) | `pnpm build:core` |
| Core testen (Unit + Browser) / nur Unit | `pnpm test:core` / `pnpm test:core:unit` (Details §6) |
| Wrapper testen (Smoke-Tests aller Frameworks, Chromium) | `pnpm test:wrappers` (~1 min; je Paket `pnpm --filter @guiexpert/react-table test`) |
| Alle Bibliotheken | `pnpm build:libs` |
| Angular, alle Majors / eine | `pnpm build:angular` / `pnpm build:angular:ng22` (je ~7 s) |
| Angular-Quellen nur synchronisieren | `pnpm sync:angular` |
| Alles | `pnpm build:all` (= `pnpm -r build`, topologisch) |
| Demos | `pnpm serve:table-demo`, `serve:react-table-demo`, …, `serve:angular-table-demo` |
| Website lokal | `pnpm build:core && pnpm --filter @guiexpert/demo-table-models build`, dann `pnpm serve:webpage-guiexpert` (`dev`/`build` kopieren die dists per `pre:build` nach `public/scripts/`, git-ignored – fehlen sie, bleiben alle Showcase-Tabellen leer) |
| Versionen | `pnpm version:check`, `pnpm version:patch` (Core 1.1.84 → 1.1.85, Wrapper behalten Framework-Major) |
| Release / Publish | **nie ohne ausdrückliche Anweisung.** Ablauf in `RELEASING.md`: `pnpm version:patch` → Commit → GitHub-Release → Workflow `npm-publish.yml` (Trusted Publishing, kein Token). Lokal: `pnpm pub:all:dry` / `pnpm pub:all` (`scripts/publish.mjs`, überspringt bereits veröffentlichte Versionen). Angular-Dist-Tags: `latest` = neueste Major, sonst `a14` … `a21` |

**Nach jedem fertigen Feature** nennt Claude die Release-Befehle für den nächsten Patch als kopierfertigen Konsolen-Block
(**ohne `#`-Kommentare**, ohne Platzhalter, mit der konkreten Version) – ausführen tut sie Marc. Muster und Regel:
`prompts/000-arbeitsweise.md` Phase 10. Kurzform: `git checkout main`, `git pull`, `pnpm version:patch`,
`pnpm version:check`, `pnpm build:all`, `git commit -am "chore: release X.Y.Z"`, `git push`,
`gh release create vX.Y.Z --target main --title "vX.Y.Z" --generate-notes`.

**Abhängigkeits-Fallen (beim Aufsetzen gelöst, nicht zurückdrehen):**
- `pnpm-lock.yaml` basiert auf der Lockdatei von `ge-table`. Ohne sie zieht pnpm neuere Transitive (z. B. Babel 8),
  die `vite-plugin-babel` brechen.
- `@babel/core: ~7.28.6` steht als devDependency in allen Paketen mit `vite-plugin-babel` – sonst erfüllt pnpm die
  Peer-Dependency mit Babel 8 aus `@angular/compiler-cli@22`.
- Vite **6.4.4** (exakt gepinnt) in allen Paketen/Demos – Vitest 5 braucht ≥ 6.4. Nicht ohne Weiteres auf 7/8 heben:
  das ändert das ausgelieferte Bundle (Vite 8 = Rolldown, `vite-plugin-babel` warnt), s. `TODO.md`.
- Paket-Typen: `exports` mit `"import": { "types", "default" }` + `"require"` (Typen absichtlich nur für `import`, sonst
  TS1479 bei CJS-Konsumenten mit node16). `scripts/fix-dts-imports.mjs` (im `afterBuild` von vite-plugin-dts aller
  Pakete) ergänzt `.js` in relativen `.d.ts`-Importen (node16/nodenext). `vue3-table` ist `"type": "module"`
  (`postcss.config.cjs`, `.eslintrc.cjs`).
- Root-`pnpm.overrides`: `@jridgewell/sourcemap-codec ^1.6.0` – Angular 22 deklariert `^1.4.14`, braucht aber 1.6
  (`encodeRangeMappings`).
- Root-`pnpm.packageExtensions`: `@angular/animations` bekommt die Peer-Dependency `@angular/common`. Angular 17
  importiert `@angular/common` in `animations.mjs`, deklariert es aber nicht; pnpm löst es dann über das versteckte
  Hoisting (`node_modules/.pnpm/node_modules`) auf – dort liegt Angular **14** aus `angular-builds/ng14`. Folge in
  `serve:angular-table-demo`: zwei Angular-Versionen im Vite-Vorab-Bundle, leere Seite,
  „Cannot read properties of undefined (reading 'None')“. Nach Änderungen: `apps/angular-table-demo/.angular` löschen.
- Website (Astro 7): Tailwind 3 läuft über `postcss.config.cjs` + `src/styles/tailwind.css` – `@astrojs/tailwind` unterstützt
  nur Astro ≤ 5. `compressHTML: false` ist Absicht (sonst fehlen Leerzeichen vor Links). Vite 8 minifiziert CSS mit
  lightningcss: kein `//` in `<style>`, kein `;;`. Keine Datei in `public/` mit demselben Pfad wie eine Seite.

---

## 3. Architektur des Cores (`packages/table/src/lib/table`)

### 3.1 Klassenhierarchie & Lebenszyklus
```
EleScope  (ele-scope.ts)      – baut das DOM-Gerüst, hält alle Area-Divs
  └─ RenderScope (render-scope.ts, ~1500 LOC) – virtuelles Rendering, Spaltenbreiten, Hover, Drag-Ghost, Editor
       └─ TableScope (table-scope.ts, ~940 LOC) – Events, Maus/Keyboard, Sortierung, Selektion, Persistenz
             └─ getApi() → TableApi (table-api.ts, ~1800 LOC) – öffentliche Fassade für Anwender
```
Jeder Wrapper macht exakt dasselbe:
```ts
const scope = new TableScope(hostDiv, tableModel, domService, tableOptions, eventListener);
scope.firstInit();
const api = scope.getApi();           // → "tableReady"-Event
LicenseManager.getInstance().setLicenseKey(key); // optional, setzt nur ein <meta>
```

### 3.2 Layout: 3 × 3 Areas
- `AreaIdent = "header" | "body" | "footer"` × `SideIdent = "west" | "center" | "east"` → 9 Areas.
- West/East = fixierte Spalten (`fixedLeftColumnCount` / `fixedRightColumnCount` im **Model**, nicht in den Options).
  Seit 1.1.98 heißt „west“ **Anfang** der Zeile, „east“ Ende: in RTL (`direction: "rtl"`) steht west rechts (§ 3.6 „RTL“).
- **Alle x-Positionen sind logisch** (Abstand vom Zeilenanfang): `ConvenienceDomService` schreibt sie in LTR als `left`,
  in RTL als `right` (`setDirection`, `toPhysicalStyleKey`). Neue Positionierungen immer über `dom.setStyle`/`applyStyle`/
  `applyStyleInPx` mit `left`, nie `element.style.left`; `scrollLeft` nur über `getViewportScrollLeft()`/
  `setViewportScrollLeft()`, Maus-x über `clientXToHostX()`.
- Ein `scrollViewport` mit riesigem `contentWrapperDiv` (Höhe = Summe aller Zeilenhöhen) liefert die native Scrollbar;
  der sichtbare `contentDiv` wird mitgeschoben.

### 3.3 Virtual Scrolling (Kern des Performance-Versprechens)
- Bei jedem Scroll: `scrollFactorY = scrollTop / (scrollHeight - clientHeight)` →
  `adjustBody()` → `adjustArea('body', yStart)` rendert **nur die sichtbaren Zeilen** (Abbruch, sobald `y > divHeight`).
- Seit 1.1.97 **Prefix-Summen** der Body-Zeilenhöhen: `RowLayout` (`row-layout/`, DOM-frei; konstant → `i*h` ohne Array,
  variabel → `Float64Array` lazy, Zusätze = Detailzeilen dünn besetzt) über `RenderScope.getBodyRowLayout()`; Startindex per
  `findIndexAt` (O(log n), vorher O(n) je Frame bei variablen Höhen: 2 Mio. Zeilen 28 → 19,5 ms, wie konstant).
  Invalidiert in `repaintHard()`, `invalidateAggregates()` (Filter, Sortieren, Edit, öffentliches `repaint`), `setRows`, Detail
  auf/zu; zusätzlich Schlüssel Body-Modell + Zeilenzahl. Positionen im Body immer über `getBodyRowTop(i)` /
  `getBodyRowIndexAtY(y)` (Modellwert + Detailhöhen), Scrollhöhe über `getBodyContentHeight()`.
- Horizontal analog über `scrollFactorX` und `adjustColumnsToRowParent(...)` (nur sichtbare Spalten).
- DOM wird pro Render neu aufgebaut (`innerText = ''`); Renderer können Cleanup-Funktionen zurückgeben
  (`RendererCleanupFnType`), die vor dem nächsten Render aufgerufen werden (`cleanupFunctions[area]`).
- Col-/Rowspan-Zellen werden am Ende separat gezeichnet (`drawBigCell`), um „halb abgeschnittene" Zellen zu vermeiden.
- Sichtbarkeits-Infos: `api.getFirstVisibleRowIndex()`, `getLastFullVisibleRowIndex()`, `getDisplayedRowCount()`.
- Showcase „Large dataset" rendert **2 Mio. Zeilen** (`createLargeModelAndOptions(2_000_000)`).

### 3.4 Datenmodell
- `TableModelIf` / `TableModel` (`data/tablemodel/`): hält Header-, Body-, Footer-`AreaModelIf`, `ColumnDefIf[]`,
  Spaltenbreiten, Fixed-Counts, Padding, Content-Höhe/-Breite, Sortierung.
- `AreaModelIf` (wichtigste Erweiterungsstelle): `getRowCount`, `getValueAt`, `getTextValueAt`, `getRowHeight`,
  `getColspanAt`/`getRowspanAt`, `getCustomClassesAt`/`getCustomStyleAt`, `getTooltipAt`, `getCellRenderer`,
  `isEditable`/`isSelectable`, `isRowCheckable`/`setRowChecked`, `doSort`/`sort`, `setValue`, `changeColumnOrder`.
- Implementierungen: `AreaModel` (Basis zum Ableiten, z. B. `LargeBodyModel`), `AbstractAreaModel`,
  `AreaModelArrayOfArrays`, `AreaModelObjectArray` (+ `…WithColumndefs`), `AreaModelTree`, `AreaModelRowGroups` (1.1.94,
  Unterklasse von `AreaModelTree`), `AreaModelPivot` + `AreaModelPivotFooter` (1.1.94, Pivot; Body = Unterklasse von `AreaModelTree`), `AreaModelCellGroups`
  (Header-Gruppen), `AreaModelHidden`, `CoverGridBodyModel`. (`AsyncBodyAreaModelObjectArray` = unfertige
  Source-Leiche, nicht exportiert – nicht verwenden, wird später entschieden.)
- Fabriken (`factory/`):
  - `TableFactory.createTableModel(Partial<CreateTableModelPara>)` – Universal-Einstieg
    (`rows`+`properties` | `bodyData`/`headerData`/`footerData` | `bodyAreaModel` …, `columnDefs`, `fixedLeftColumnCount`,
    `defaultRowHeights`, `getSelectionModel`, `rowCheckboxVisible`, `rowNumbersVisible` (1.1.93), `footerAggregates`
    (1.1.94), `rowDrag` (1.1.95), `tableOptions`).
  - `createByObjectArray(Param)`, `buildByTypedRows(Param)`, `createByAreaModels(Param)`.
  - `TreeFactory.buildTreeRows(...)`, `CoverGridFactory.createCoverGridModel(...)`, `CrudTableModelFactory`,
    `RowGroupFactory.createTableModel({ rows, groupBy, aggregations, … })` (1.1.94, § 3.6 „Row Grouping“),
    `PivotFactory.createTableModel({ rows, rowFields, columnFields, values, … })` → `PivotTableModel` (1.1.94, § 3.6 „Pivot“).
- Spalten: `ColumnDef.create({ property, headerLabel, width: px200, minWidth, maxWidth, headerRenderer, bodyRenderer,
  footerRenderer, headerClasses, bodyClasses, footerClasses, sortable, sortComparator, sortState, editable, isVisible,
  getEditRenderer, editInputPipe, valueGetter, valueSetter, showValuesAs, formula, formulaOptions, rowDrag, validate })`
  (`valueGetter` … `rowDrag` seit 1.1.95, § 3.6 „Berechnete Spalten“ bzw. „Row Drag“; `validate` seit 1.1.96, § 3.6
  „Fill-Handle und Batch-Edit“). Größen über Konstanten `px0 … px500` (`data/common/sizes.ts`) bzw. `Size`.
- Eingebaute Spalten: `CheckboxColumnDef` und seit 1.1.93 `RowNumberColumnDef` (Erkennung über `type`:
  `isCheckboxColumnDef`/`isRowNumberColumnDef`). **Reihenfolge immer Nummer → Checkbox → Daten**: Code, der „die erste
  Spalte“ meint (Checkbox-Erkennung, Baumpfeil, `showCheckboxWihoutExtraColumn`), liest den Versatz
  `getLeadingRowNumberColumnCount(columnDefs)` bzw. `RenderScope.getFirstDataColumnIndex()` – nie hart `0`.

### 3.5 Rendering & Anpassung
- `CellRendererIf.render(cellDiv, rowIndex, columnIndex, areaIdent, areaModel, cellValue, domService)` →
  optional Cleanup-Fn. Eingebaute Renderer in `renderer/` (Number, ProgressBar, StarRating, Date*, TrueFalse,
  Checkbox, Actions, Input-/Select-Edit-Renderer …).
- Framework-Komponenten als Renderer: jeweils `ComponentRendererWrapper` (React/Preact/Solid/Svelte/Vue) bzw.
  in Angular `RenderWrapperFactory.create(MyComponent, cdr)` + Interface `ComponentRendererIf<T>`.
- DOM-Zugriff ausschließlich über `DomServiceIf` (`SimpleDomService`; Angular: `DomService` mit `Renderer2`),
  gekapselt in `ConvenienceDomService`.
- Look & Feel über **CSS-Variablen** `--ge-table-*` (`packages/table/css/table-color-vars.css`, light/dark via
  `html[data-theme]`) und Klassen `ge-table-*`; Programmatisch: `css-vars.ts`, `color/ge-css-color-util.ts`
  (2-/3-Farb-Gradienten für Heatmaps).

### 3.6 Interaktion
- Events über `EventListenerIf`: `onMouseClicked`, `onMouseMoved`, `onContextmenu`, `onMouseDragging(End)`,
  `onCheckboxChanged`, `onModelChanged`, `onSelectionChanged`, `onFocusChanged`, `onScroll`, seit 1.1.92 `onStateChanged`,
  seit 1.1.95 `onRowDragStart/Move/End`, seit 1.1.96 `onBatchEditChanged`, seit 1.1.97 `onDetailExpandedChanged` (optional). Event-Typen: `GeMouseEvent`,
  `GeKeyEvent`, `GeModelChangeEvent` (seit 1.1.96 + `changes`/`source`), `GeScrollEvent`, `GeStateChangeEvent`,
  `GeRowDragEvent`, `GeBatchEditEvent`, `GeDetailEvent`.
- Selektion: `SelectionModel(selectionType: "none"|"cell"|"row"|"column"|"range", selectionMode)` – via
  `tableOptions.getSelectionModel = () => sm`. Fokus analog `getFocusModel`. Maus (`SelectionService`): Klick = neue
  Selektion, Shift-Klick = Bereich ab letztem Klick, Strg/⌘-Klick = umschalten, Strg/⌘+Alt-Klick = abwählen, Ziehen =
  Bereich. „Letzte Operation je Zelle gewinnt“ (negative Ranges). Ein Klick zeichnet verzögert neu (`debounceRepaint`),
  nicht bei Klicks in Formularelemente (input, select, button …) einer Zelle. Strg+A, Strg+C kopiert
  den sichtbaren Body, gedeckelt durch `CopyService.maxCopyCells`.
- Tastatur: `ShortcutService` + `ActionId` (`COPY_2_CLIPBOARD`, `START_EDITING`, `TOGGLE_SELECTION`, `SELECT_ALL`,
  `DESELECT_ALL`, `NAVIGATE_*`), Mappings für Windows/OSX, überschreibbar über `shortcutActionIdMapping`.
  Mapping-Schlüssel werden mit `harmonizeShortcut` normalisiert („ctrl+c“, „meta+c“ = „cmd c“, „arrowup“ = „up“).
  Editor öffnen: F2. Erst seit Okt. 2026 wirksam – vorher löste jede Taste `START_EDITING` aus (s. `TODO.md`).
  Seit 1.1.91 zusätzlich (WAI-ARIA-Grid): Pos1/Ende (`NAVIGATE_ROW_START/END`, macOS auch ⌘←/⌘→), Strg+Pos1/Ende
  (`NAVIGATE_FIRST/LAST_CELL`, macOS auch ⌘↑/⌘↓), Bild↑/↓ (`NAVIGATE_PAGE_UP/DOWN`), Enter (`ACTIVATE_CELL`: Body =
  Zeilen-Checkbox bzw. Baumknoten, Header = Gruppe bzw. Sortieren). **Header-Fokus**: ↑ in Body-Zeile 0 → unterste
  Header-Zeile, ↓ zurück; Zustand in `TableScope` (`getHeaderFocus()`), das `FocusModel` bleibt Body-only. Seit 1.1.95
  `MOVE_ROW_UP/DOWN` (Strg+Alt+↑/↓, Row Drag), seit 1.1.96 `FILL_DOWN/FILL_RIGHT` (Strg/⌘+D, Strg/⌘+R – nur verbraucht
  mit `fillHandle` + markiertem Bereich, sonst behält der Browser Lesezeichen/Neu laden). `api.triggerAction()` liefert seit 1.1.95 `boolean` (Taste verwendet).
- **Barrierefreiheit (seit 1.1.91, `aria/`, Design `prompts/001-aria-screenreader.design.md`)**: Host `role="grid"`/
  `"treegrid"` mit `aria-rowcount` (Header + **alle** Body-Zeilen + Footer), `aria-colcount` (sichtbare Spalten),
  `aria-owns` (9 Rowgroups in der Reihenfolge Header → Body → Footer, leere = `presentation`), `aria-activedescendant`
  (nur die fokussierte Zelle hat eine ID: `AriaIds`, Präfix `ge-<host-id>` bzw. `ge-t<n>`). Jeder Row-Div `role="row"` +
  `aria-rowindex` (West/Center/East mit gleichem Index – ag-Grid-Muster), Zellen `columnheader`/`gridcell` + `aria-colindex`
  (`AriaGridInfo`, einmal je Render-Durchgang), Span-Zellen in eigener Zeile `.ge-table-span-row`. Baum: `TreeAriaInfo`
  (Level, Setsize, Posinset, Expanded). Deko (Rahmen, Hover, Fokusrahmen, Icons, Resize-Handles) `aria-hidden`.
  Ansagen über `LiveAnnouncer` (Live-Region in `document.body`, `destroy()` entfernt sie), Texte `AriaTexts`
  (`tableOptions.ariaTexts`), eigene Ansagen `tableApi.announce()`. Scroll-Viewport `tabindex="-1"` (sonst zweiter
  Tab-Stopp in Chrome) und gibt den Fokus an den Host weiter. Tab in die Tabelle setzt den Fokus auf die erste Zelle
  (nur bei echtem Tab, nicht bei `host.focus()`).
- **Overlays (seit 1.1.92, `overlay/`, Design `prompts/002-overlays-laden-keine-daten.design.md`)**: ein Div
  `.ge-table-overlay` je Tabelle (`TableOverlay`, in `EleScope` angelegt, Geometrie in `adjustContainersAndRows`, Zustand
  am Ende von `RenderScope.adjustAfterScrolling` → `calcOverlayKind`; DOM nur bei Änderung). `api.showLoadingOverlay(text?)`,
  `showNoRowsOverlay(text?)`, `hideOverlay()` (beendet nur Manuelles), `getOverlayState()` = `"none" | "loading" | "noRows"
  | "noMatches"`. Leerer Body → automatisch „No rows to show“, Filter blendet alles aus → „No matching rows“ (über das
  optionale `AreaModelIf.getUnfilteredRowCount()`). „Loading“ blockiert per Default Maus (`MouseHandler` ignoriert Events auf dem
  Overlay – `TableOverlay.isEventBlocked`, die Seite sieht sie weiter; z-index 10000 über dem Fokusrahmen) und im Body
  `START_EDITING`/`TOGGLE_SELECTION`/`ACTIVATE_CELL` (Header bleibt bedienbar). ARIA: Overlay `aria-hidden`, Host `aria-busy`, Texte über die
  Live-Region. Wrapper: Prop `loading` (kein Neuaufbau, nach Neuaufbau erneut angewendet; `false` blendet nur aus, was die Prop
  eingeblendet hat – ein eigenes Overlay der App aus `tableReady` bleibt).
- **Zeilennummern (seit 1.1.93, Design `prompts/004-zeilennummern.design.md`)**: `TableFactory.createTableModel({ …,
  rowNumbersVisible: true | Partial<RowNumberOptionsIf> })` stellt eine `RowNumberColumnDef` vor die Spalten und erhöht
  `fixedLeftColumnCount` (nicht bei `bodyData`/eigenen Area-Modellen: Warnung). Echte Spalte → alle Indizes +1
  (`api.getColumnIndex(property)`). Zählweise `display` (Sicht) / `original` (`getAllRows()`, Map-Cache), Text über
  `format`. Gerendert vom `RowNumberCellRenderer` der Spaltendefinition – auch bei eigenen `AreaModel`s (`RenderScope`
  nimmt ihn aus dem ColumnDef). Breite: am Anfang von `adjustAfterScrolling()` `adjustRowNumberColumnWidth()` (Text der
  größten Nummer vergleichen, nur bei Änderung messen → `adjustContainersAndRows()`). Body-Zellen `role="rowheader"`;
  kein Resize-Griff, kein `drag-column`, Drag-Ziel ≥ Versatz, `autoResizeColumns` lässt sie aus; Copy/Excel nur mit
  `exported: true` (Excel mit Default-`format` als Zahl). Selektion `range`: Klick/Leertaste auf die Nummer = ganze Zeile;
  Klick auf „#“ (unterste Header-Zeile) = `selectAll`. Baum: CSS `.ge-table-row-number.ge-table-tree-cell` hebt das
  Baum-Layout der Nummernzellen auf. Breitenänderung mit Re-Entry-Schutz, %-/Gewichtsspalten werden neu verteilt.
- Sortierung: Header-Klick, `ColumnDef.sortable/sortComparator`, `api.sort(fn)`, `api.reSort()`.
- Filter: **extern** – `tableOptions.externalFilterFunction = (row) => boolean`, danach `api.externalFilterChanged()`.
  Baum (`AreaModelTree`): eine Pipeline alle Zeilen → sichtbar (Eltern aufgeklappt) → Filter; das Prädikat bekommt die
  `TreeRow`, prüft alle Knoten (auch zugeklappte), Vorfahren von Treffern bleiben sichtbar.
- **Zustand / Persistenz (vervollständigt in 1.1.92, `state/`, Design `prompts/003-zustand-speichern.design.md`)**:
  `TableStateIf` (JSON, `version: 1`; Teile `columns` (Reihenfolge, geänderte Breiten, API-Sichtbarkeit), `sort`, `scroll`
  (+ `firstRowId`), `tree` (kürzere Id-Liste), `checkedRowIds`, `selection` (Rechtecke aus Zeilen-Id + Property),
  `headerGroups` (`CellGroupIf.id` bzw. Label-Pfad), `custom`) – **nie Indizes**, Zeilen über `getRowId(row, rowIndex?)`.
  `TableStateService` (`tableScope.stateService`): Start in `firstInit()` (nur beim ersten Mal; Vorrang: gespeichert, dann
  `initialState`, dann Modell), danach `markDirty(part)` an jeder Änderungsstelle → entprellt (`stateChangedDebounceDelay`, 300 ms) **ein**
  `setItem` + **ein** `onStateChanged(GeStateChangeEvent)`, nur bei echter Änderung; Scroll über `RenderScope.afterRenderPass()`;
  `destroy()` schreibt Offenes. API: `getState(parts?)`, `applyState(state, parts?)` (fehlende Teile bleiben),
  `resetState()`, `setCustomState()`, `setHeaderGroupCollapsed(id, collapsed)`. `autoRestoreOptions` = welche Teile wohin
  (`<key>tableState`, `storage: StateStorageIf`, Default `localStorage`); Flags `autoRestoreSortingState`, `…ScrollPosition`,
  `…CollapsedExpandedState`, `…CheckedState`, `…SelectedState`, `…ColumnLayout`, `…HeaderGroupState`, `…CustomState`.
  Alte Schlüssel (`<key>sortingState` …) liest `readLegacyState` einmal (Index → Property der Standardreihenfolge).
  Ohne `getStorageKeyFn` wird nichts gespeichert (eine Warnung).
- Export: `api.copyToClipboard()`, `api.downloadExcel(fileName, author)` (eigener XLSX-Writer, keine Lib) = **aktuelle
  Sicht** (gefilterte Zeilen in Sortierreihenfolge + Header + Footer); beliebige Daten (z. B. alle Zeilen via
  `getAllRows()`) über `new ExcelService().downloadExcel(matrix, …)`.
- **Aggregation (seit 1.1.94, `aggregation/`, Design `prompts/005-aggregation-gesamtzeile.design.md`)**: DOM-freier Kern
  für 005–008: `AggregatorIf<S, R>` (`init`/`add`/`merge`/`result` – **Zustand** statt Zahl, `avg` = `{ sum, count }`, damit
  `merge` über Gruppen stimmt; `add(s)`/`merge(a, b)` dürfen `s`/`a` ändern, `b` **nie** – ein Kind-Zustand darf in
  mehrere Eltern gemergt werden), `Aggregators` (sum, count, avg, min, max,
  countDistinct, first, last; Summen mit Neumaier-Kompensation; nur `number` ohne `NaN`, Text wird nie umgewandelt,
  `count` zählt Zeilen), `getAggregator`, `aggregate(rows, value, agg)`, `aggregateColumns(rows, specs)` (ein Durchlauf),
  `createValueGetter` (Pfad oder Funktion), `formatAggregateValue`. Interna (`aggregate-internals.ts`) nicht exportiert.
  **Gesamtzeile**: `AreaModelAggregateFooter` (`data/tablemodel/areamodel/`) bzw. `footerAggregates` der Fabrik – Spalten
  über die **Property**, Quelle `getFilteredRows()` / Baum `getLeafRows()` (gefilterte Blätter, unabhängig vom
  Aufklappen) / sonst `getValueAt` je Zeile; Wert roh (Excel), Text über `getTextValueAt` + `AggregateCellRenderer`
  (oder Footer-Renderer der Spalte); Beschriftung `role="rowheader"` (`RenderScope.applyCellAria`). **Cache** je
  Quell-Array + Länge (Baum: Wurzel-Array; Zeilen bzw. Baum-Durchlauf erst beim Fehlschlag); die Tabelle ruft das optionale `AreaModelIf.invalidateDerivedValues?()` aller Areas
  (`RenderScope.invalidateAggregates()`) bei Filter, Sortieren (in place!), Editieren (vor dem Repaint und vor
  `onModelChanged`), `updateCells` (ohne `repaintAll` werden die Footer-Zellen nachgezeichnet), CRUD-Änderungen und **öffentlichem**
  `api.repaint()`/`repaintHard()` – nie beim Scrollen/internen Repaint. Auswahl: `api.getSelectionAggregates()`
  (`SelectionAggregator`, Kappung `maxCells` wie `CopyService.maxCopyCells`). Eigenes Footer-Modell: instructions.md 5.4.
- **Row Grouping (seit 1.1.94, `rowgroup/`, Design `prompts/006-row-grouping.design.md`)**: DOM-freie Engine
  `groupRows(rows, groupBy)` (ein Durchlauf, verschachtelte `Map`s, `null`/`undefined`/`''` = eine Gruppe „(empty)“ am Ende,
  Dates nach Zeit, `1` ≠ `'1'`) + `aggregateRowGroups(groups, specs, accept?)` (Blattgruppe = `aggregateStates` über ihre
  Zeilen, darüber `merge` der Kind-Zustände → `avg` korrekt) – Grundlage für Pivot (007). `RowGroup` (= `data` der
  Gruppenzeile: `key`, `label`, `path`, stabile `id` aus Ebenennamen + typisierten Schlüsseln, `count`, `results`,
  `getRows()`). Body `AreaModelRowGroups extends AreaModelTree` – **`type` bleibt `"AreaModelTree"`** (Pfeil, Klick,
  ARIA, Zustand, Footer laufen unverändert), Erkennung über `kind` (`isAreaModelRowGroups`, `isGroupRow`, `isRowGroup`).
  Detailzeilen = `RowGroupDetailRow` (intern, mit `sourceIndex`). Filter: Prädikat bekommt die **Objekte** (wie flach),
  Ergebnis als `Uint8Array` je Quellindex; Aggregate lazy (`ensureAggregates`) über gefilterte Zeilen. Sortierung: eigenes
  `doSort` (Aggregat- bzw. Schlüsselvergleich für Gruppen), `sort(fn)` sortiert Detailzeilen; letzte Sortierung wird nach
  Neuaufbau wieder angewendet. Editieren: `setValue` → nur Pfad neu (`invalidateDerivedValues(change?:
  DerivedValuesChangeIf)` – Edit und `updateCells` geben `{ area, rowIndices }` mit), geändertes Gruppierfeld → Neuaufbau;
  `TableScope`/`RenderScope` zeichnen bei geänderter Zeilenzahl hart neu, `updateCells` zeichnet sichtbare Gruppenzeilen
  nach. Fabrik: `RowGroupColumnDef` (Property `"RowGroupColumn"`, hinter Zeilennummer/Checkbox, fixiert), gruppierte
  Spalten ausgeblendet (`rowgroup/row-group-layout.ts`, merkt sich, was es selbst ausgeblendet hat), Footer aus 005.
  Umgruppieren: `api.setRowGroupBy(levels)` (kein neues Modell, Zustand bleibt), `getRowGroupBy()`. Persistenz: Gruppen-Id
  unabhängig von `getRowId` (`TableStateService.idOfRow`). CSS `ge-table-row-group*`, `--ge-table-row-group-*`.
- **Pivot (seit 1.1.94, `pivot/`, Design `prompts/007-pivot.design.md`)**: DOM-freie Engine `pivotRows(rows, config, accept?)`
  → `PivotResult` (nutzt `groupRowsResolved` aus 006 zweimal: Zeilen- und Spaltenfelder; `RowGroup` als Knoten; ein
  `Int32Array` Quellzeile → Spaltenblatt; Zellen **sparse** je Zeilenknoten `Map<Spaltenknoten, {count, states}>`, leere
  Kombination = `undefined`, nicht 0; ein Durchlauf je Zeilenblatt, darüber nur `merge` – erst Spalten-, dann
  Zeilenrichtung; `maxColumns` kappt Spalten mit Warnung, Summen zählen alle Zeilen). `PivotConfigIf`: `rowFields`/
  `columnFields` = `RowGroupField` (wie `groupBy`), `values: PivotValue[]` (`"pfad"` = Summe oder `{ value, aggregator,
  name, label, format }`, Default-Name `"sum(umsatz)"`), `subtotals`, `columnSubtotals` (Default ≥ 2 Spaltenfelder:
  Summenspalte je Spaltengruppe, `visibility: "always"`, Gruppe mit Toggle), `totalColumn` (`"fixed"` Default | `true` |
  `false`), `totalRow`, `emptyText`, `totalLabel`. Modell `PivotTableModel extends TableModel` (überschreibt
  `getFixedRightColumnCount`, Spalten austauschbar), Body `AreaModelPivot extends AreaModelTree` (`type` bleibt
  `"AreaModelTree"`, `kind` `"AreaModelPivot"`; Zeilen = `TreeRow` mit `RowGroup`, ohne Zeilenfelder eine Zeile „Total“),
  Header `AreaModelPivotHeader` (intern, `extends AreaModelCellGroups`, Klassen `ge-table-pivot-header-group|column`),
  Footer `AreaModelPivotFooter` (Gesamtsummen aus der Engine, nie aus den Pivot-Zeilen). Spalten: `RowGroupColumnDef`
  (wiederverwendet, `showCount: false`) + `PivotColumnDef` (`pivot: PivotColumnInfoIf` = kind/column/value; stabile
  Property `pivot:[[feld,typSchlüssel]…,wert]`, `pivot:subtotal:…`, `pivot:total:[wert]`). Filter: Prädikat bekommt die
  **Quellobjekte** (vor der Aggregation), Spalten bleiben. Sortierung: Geschwister nach Zellwert (leere zuletzt) bzw.
  Schlüssel. Neu pivotieren: `api.setPivotConfig(changes, rows?)` → `PivotTableModel.setPivotConfig` (gleiche Objekte,
  `AreaModelCellGroups.setGroups` neu in 1.1.94) + `TableScope.setPivotConfig` (Sortierung/Selektion zurück, Span-Modelle
  neu, `firstInit()`); Breiten gleicher Properties, Auf-/Zu-Zustand und Filter bleiben. Drill-down
  `body.getCellSourceRows(r, c)`. ARIA: neues optionales `AreaModelIf.isRowHeaderCell?()` → `rowheader`;
  `RenderScope.updateRowGroupRoles` macht Row-Divs ohne Zellen (von Spans verdeckt) zu `presentation`. CSS
  `ge-table-pivot-*`, `--ge-table-pivot-*`.
- **Berechnete Spalten, „Show values as“, Formeln (seit 1.1.95, `calc/` + `formula/`, Design
  `prompts/008-formeln-berechnete-spalten-show-values-as.design.md`)**: `ColumnDef.valueGetter(row, ctx)` – **eine**
  Auswertungsstelle: `AreaModelObjectArray`/`AreaModelTree.getValueByT` fragen die interne `ColumnValues`
  (`calc/column-values.ts`; Property → Getter lazy, neu bei `invalidateDerivedValues()` oder anderer Spaltenzahl; nur im
  **Body**), sonst Pfad wie bisher (bit-gleich). Damit stimmen Sortierung (Memo je Sortierlauf, Fehler/leer zuletzt), Copy,
  Excel, `footerAggregates` (Spec-Property einer berechneten Spalte → `body.getRowValue`) und Row Grouping (`aggregations`,
  `groupBy` auf berechneter Spalte) automatisch. `ValueGetterContextIf` (`getValue`, `hasColumn`, `isCalculated`,
  `aggregate(p, agg)` über gefilterte Zeilen, gecacht je Zeilen-Array + Länge). Zyklen → `#CIRC!`, Exceptions → `#VALUE!`.
  Ohne `valueSetter` nie editierbar. Filter: `api.getRowValue(row, property)`. Neue optionale `AreaModelIf`-Methoden
  `isCalculatedProperty?`, `getRowValue?`; `AbstractAreaModel.hasDerivedColumns()/isDerivedProperty()` →
  `RenderScope.rerenderCalculatedCells()` nach `updateCells` ohne Repaint. **Show values as**: `ColumnDef.showValuesAs`
  (`ShowValuesAs`, 7 Modi; Bezug gefilterte Zeilen; flach: Summe bzw. Arrays je Property gecacht, bei Filter/Sort/Invalidate
  geleert; Baum/Row Groups: Blätter bzw. Geschwister über `getRawValueOfRow()` – Gruppenzeilen liefern ihr Aggregat), Text
  über `getTextValueAt` + `AggregateCellRenderer`, Sortierung nach Rohwert; Pivot: `PivotValueIf.showValuesAs` (4
  Anteils-Modi, `AreaModelPivot.getShownValue`, sortiert nach Anteil, Footer folgt); `api.setShowValuesAs/getShowValuesAs`.
  Excel: Anteile als `ExcelFormattedValueIf { value, numberFormat: "0.0%" }` nur wenn `excelService.supportsNumberFormats`
  (eigene `numFmt` ab 164). **Formeln**: `compileFormula(source, { functions })` → Tokenizer → Pratt-Parser (`-2^2 = -4`,
  Länge ≤ 10 000, Tiefe ≤ 64) → AST → Closures (`FormulaEvaluator`, **kein `eval`/`new Function`**), Felder nur eigene
  Properties (`[constructor]` → `#NAME?`), `SUM/AVG/MIN/MAX/COUNT([x])` = Spalten-Aggregat, Fehlerwerte `FormulaError`
  (nie geworfen; CSS `ge-table-cell-error`, Tooltip = Meldung). `ColumnDef.create({ formula })` /
  `createFormulaValueGetter` / `api.setColumnFormula(property, source)` (gibt Compile-Fehler zurück). Keine Zellbezüge,
  keine Formel-UI. Bench `bench/formula.bench.ts` (1 Mio. Zeilen ~0,5 µs/Zeile im Container).
- **Row Drag (seit 1.1.95, `row-drag/`, Design `prompts/009-row-drag.design.md`)**: Griff über `ColumnDef.rowDrag`
  (`true` | `(row, rowIndex) => boolean`) bzw. Fabrik-Flag `rowDrag: true` (erste Datenspalte). `RowDragService`
  (`tableScope.rowDragService`, `@category Internals`): **Pointer Events** nur am Griff (`data-ge-action="drag-row"`,
  `pointerdown` wird `preventDefault`-et → keine Kompatibilitäts-Mausereignisse, `MouseHandler`/Bereichsauswahl/Spalten-Drag
  unberührt), danach `pointermove/up/cancel` + `keydown` (Escape) am **Dokument** über einen eigenen `AbortController`
  (kein `setPointerCapture` – der Griff wird beim virtuellen Rendern ersetzt), Schwelle 4 px, der `click` nach einem
  Ziehen wird einmal geschluckt. Ziel **gerechnet** (`clientY` → Inhalts-y → Zeile über `getYPosByRowIndex`, Binärsuche;
  `RenderScope.getBodyViewport()`), nie aus dem DOM; flach obere/untere Hälfte = davor/dahinter, Baum Viertel + Mitte
  `inside`. Auto-Scroll per rAF in der Rand-Zone (quadratisch, `getScrollerToContentRatioY()` für gekappte Höhen).
  Geisterbild `ge-table-row-drag-ghost` (Text, `textContent`), Marke `ge-table-row-drop-indicator(-inside)`, gezogene
  Zeilen `ge-table-row-dragging` (`RenderScope.addAndRenderCellDiv` fragt den Dienst). **managed** (Default): optionale
  `AreaModelIf.canMoveRows?/moveRows?(rowIndices, target: RowDropTargetIf)` – `AreaModelObjectArray`/`ArrayOfArrays`
  verschieben in der **Anzeige-Reihenfolge** und schreiben sie **in place** in die Zeilen der Anwendung, `AreaModelTree`
  hängt um (Zyklus-Schutz, `deep`), `AreaModelRowGroups`/`Pivot` → `false`; gesperrt, wenn eine Spalte `sortState`
  asc/desc hat oder ein Filter Zeilen ausblendet (Griff `…-disabled`, Ansage). **unmanaged**
  (`rowDragOptions.managed: false`): nur Events. `GeRowDragEvent` (`type` start/move/end/cancel, `source`
  pointer/keyboard, `rows`, `rowIndices`, `target`, `toIndex`, `outside`, `moved`, `preventDefault()` in start/move);
  `onRowDragEnd` kommt managed **nach** dem Verschieben. Mehrfach: Zeilen der Auswahl (`getMergedRowIndices`).
  Danach `TableScope.afterRowsMoved()` (Aggregate, `lastSortCompareFn` weg), Fokus/Auswahl folgen, `repaintHard()`,
  Ansage `rowMoved`. Tastatur `MOVE_ROW_UP/DOWN` (Baum: unter Geschwistern), Zellen mit Griff `aria-keyshortcuts`.
  API `moveRows(indices, target | index)` (`false` solange sortiert oder ohne Wirkung), `isRowDragging()`, `cancelRowDrag()`.
  Kein Ziehen bei offenem Editor; Listener dürfen abbrechen (Sitzung wird nach jedem Aufruf geprüft); große Auswahlen
  (200.000 Zeilen) in O(n) ohne Spread. DOM-frei `row-drag/move-rows.ts`
  (`moveArrayItems`, `calcMoveToIndex`, `moveTreeRows`, `canMoveTreeRows` …). CSS `css/table-row-drag.css`,
  `--ge-table-row-drag-*`, `--ge-table-row-drop-*`. Website-Showcases: CSS auch in `src/styles/ge-table.css`.
- **Fill-Handle und Batch-Edit (seit 1.1.96, `fill/` + `batch-edit/`, Design
  `prompts/010-fill-handle-batch-edit.design.md`)**: **eine** Schreibstelle `TableScope.applyCellChanges(changes, source)`
  (`api.applyCellChanges([{ rowIndex, column: index | property, value }])`; Editor `updateModelValueAfterEdit`, Fill und
  Commit laufen darüber): überspringt Nicht-Editierbares (`isEditable`, berechnet ohne `valueSetter`, Gruppen/Pivot),
  `editInputPipe` + `ColumnDef.validate(value, row)` (Meldung = ungültig → nicht geschrieben, Ansage), Row Groups in
  `batch()`, Aggregate, Repaint und **ein** `onModelChanged` (`GeModelChangeEvent.changes: CellChangeIf[]` = row, rowIndex,
  columnIndex, property, oldValue, newValue; `source` `"edit" | "fill" | "commit" | "api"`; ein Edit weiter wie
  `createSingle`). **Fill-Handle** `tableOptions.fillHandle: true | Partial<FillHandleOptionsIf>` (`direction`, `fillValue(ctx)`,
  `maxCells`, Schwelle, Auto-Scroll), nur Selektionstyp `range`, letzter Bereich: `FillHandleService`
  (`tableScope.fillHandleService`, `@category Internals`) – **ein** Host-Div `ge-table-fill-handle`
  (`data-ge-action="fill-handle"`, `aria-hidden`), Lage gerechnet über `RenderScope.getBodyCellRectInHost()` (auch fixierte
  Spalten, versteckt, wenn die Ecke herausgescrollt ist), gesetzt in `afterRenderPass()`; Ziehen mit Pointer Events wie
  009 (Dokument-Listener, Escape, `pointercancel`, Click wird geschluckt), Ziel über `getBodyCellAtHostPoint()` (gerechnet),
  Achse = weiter außerhalb, Vorschau `ge-table-fill-preview`, Auto-Scroll senkrecht + waagerecht, ⌥/Alt bzw. Strg =
  `"alternate"`. `TableScope.fillRange(source, direction, count, mode)` (= `api.fillRange`) nimmt die **angezeigten** Werte
  (Batch: vorgemerkte), setzt danach die Auswahl auf Quelle + Ziel. Reihen DOM-frei `computeFillValues` (eine Zahl kopiert,
  mehrere linear bzw. Regression, `toPrecision(15)`; Datum `Date`/ISO-Text: +1 Tag, Monatsschritt, Monatsende bleibt;
  „Item 9“ → „Item 10“ mit führenden Nullen; Rest zyklisch), `computeFillChanges`, `getFillRange`. **Batch-Edit**
  `tableOptions.batchEdit` (dauerhaft) bzw. `api.startBatchEdit()` (bis commit/cancel): `BatchEditService`
  (`tableScope.batchEditService`) mit `PendingCellChanges` (`Map<Zeilenobjekt, Map<property, …>>`; TreeRow → `data`, ohne
  Objekte der Index, ohne Property `#<index>`; zurück auf den Ursprungswert = entfernt, `isSameCellValue`). Anzeige
  **nur** in `RenderScope.addAndRenderCellDiv` (Wert, `ge-table-cell-pending`, ungültig `ge-table-cell-invalid` +
  `aria-invalid` + `title`; Input-/Select-Editor nehmen `cellValue`); Sortieren, Filtern, Summen, Copy, Excel = geschriebene
  Daten (wie ag-Grid). Commit schreibt die **Roheingabe** über `setValue` (Pipe genau einmal), ausgefilterte Zeilen direkt
  ins Objekt, `repaintHard`, ein `onModelChanged` + `onBatchEditChanged` (`GeBatchEditEvent` start/change/commit/cancel,
  `pendingCount`, `invalidCount`, `pendingChanges` lazy). `blockCommitOnInvalid` (Default `true`). API `getPendingChanges`,
  `hasPendingChanges`, `isBatchEditing`, `commitBatchEdit` (`boolean`), `cancelBatchEdit`, `isFilling`, `cancelFill`.
  Wrapper-Event `batchEditChanged`. CSS `css/table-fill-batch.css`, `--ge-table-fill-*`, `--ge-table-cell-pending-*`,
  `--ge-table-cell-invalid-*`. Kein Einfügen, kein Undo (Folgepunkte in `TODO.md`).
- **Master/Detail (seit 1.1.97, `master-detail/`, Design `prompts/011-master-detail.design.md`)**:
  `tableOptions.masterDetail` (`MasterDetailOptionsIf`: `detailRenderer` (Fn oder `DetailRendererIf`), `detailHeight` number |
  `"auto"` (Default, `ResizeObserver` auf der Detailzelle) | Fn, `estimatedDetailHeight` 200, `isMaster`, `toggleColumn`,
  `maxRenderedDetails` 50, `getRowId`). Nur flache Bodies (Baum/Gruppen/Pivot → Warnung, inaktiv). `MasterDetailService`
  (`tableScope.masterDetailService`, nur mit Option angelegt): **eine** Ebene `ge-table-detail-layer` im Host (z-index 1000,
  `pointer-events: none`, Zeilen `auto`; Lage aus `EleScope.adjustDetailLayerBounds` = West + Viewport ohne Scrollbars) – wird
  nie geleert, scrollt nicht horizontal. Detailhöhen = Zusätze im `RowLayout` hinter dem Master; `adjustArea('body')` meldet
  sichtbare Details (`layoutVisible(rowIndex, top, height…)`), Inhalt lazy beim ersten Sichtbarwerden (an seiner Stelle, damit
  eine innere Tabelle richtig misst), außer Sicht **geparkt** (`ge-table-detail-row-parked` = `visibility: hidden;
  content-visibility: hidden` – Scrollpositionen bleiben, kein RO-Aufruf; Abhängen aus dem DOM würde `scrollTop` verlieren),
  LRU über `maxRenderedDetails`, zerstört bei Zuklappen/`refreshDetail`/`destroy`/Zeile nicht mehr in `getAllRows()`
  (Cleanup, `ctx.signal`, `ctx.createTable()`-Tabellen `destroy()`). Schlüssel: `getRowId` (Option bzw. eigene
  `autoRestoreOptions.getRowId`, nicht der JSON-Default) sonst Zeilenobjekt sonst Index; Index-Zuordnung in `computeExtras()`
  (ein Durchlauf bei Layout-Neuaufbau), Einzel-Toggle inkrementell (`RenderScope.setBodyRowExtra`). Ereignis-Isolation:
  `TableScope.isEventInDetail(evt)` (`composedPath()`) in `MouseHandler.isBlocked`, `ShortcutService`, `InputHandler`,
  Row-Drag/Fill-Listener – kein `stopPropagation`. Mausrad über Details → äußere Tabelle, wenn innen nichts scrollt. ARIA: Host
  `treegrid`, Masterzeilen `aria-expanded`, Ebene = Rowgroup in `aria-owns` (vor Footer), Detail `row` + `gridcell`
  `aria-colspan`; Enter (`activateBodyCell`) klappt, Tab springt ins offene Detail der Fokuszeile, Shift+Tab zurück
  (`focusDetailMaster`). Zustand: Teil `details` (`detailRowIds`, `autoRestoreDetailState`). API `setDetailExpanded`,
  `toggleDetail`, `isDetailExpanded`, `getExpandedDetailRows`, `expandAllDetails`/`collapseAllDetails` (kein Event je Zeile),
  `refreshDetail`, `getDetailElement`; `ensureRowIsVisible` richtet mit Details pixelgenau aus. Wrapper:
  `DetailComponentRendererWrapper` (React, Preact, Vue, Svelte, Solid), Angular `DetailRenderWrapperFactory` +
  `DetailComponentRendererIf`; Event `detailExpandedChanged`. CSS `css/table-master-detail.css`, `--ge-table-detail-*`.
- **Rechts-nach-links (seit 1.1.98, `rtl/`, Design `prompts/012-rtl.design.md`)**: `tableOptions.direction` `"ltr"`
  (Default) | `"rtl"` | `"auto"` (`resolveTableDirection`: berechnetes `direction` des Hosts **vor** dem Setzen von `dir`,
  ohne Dokument das nächste `[dir]`), einmal in `EleScope` ausgewertet (`scope.direction`, `isRtl()`, `api.getDirection()`);
  der Host bekommt `dir` (auch `"ltr"`; `destroy()` stellt den alten Wert her). Strategie: Rechnungen bleiben logisch,
  `ConvenienceDomService` tauscht beim Schreiben `left` ↔ `right` (Host → Area → Zeile → Zelle, also der ganze Baum; eigene
  Styles der App über `getCustomStyleAt` gehen ungespiegelt an `domService`). Scroll-Container in RTL: Inhalt rechts, läuft
  nach links über, `contentDiv` mit `right: <logisches scrollLeft>`. `rtl/rtl-util.ts` (DOM-frei, exportiert):
  `getLogicalScrollLeft`/`setLogicalScrollLeft`/`toPhysicalScrollLeft` (RTL-`scrollLeft` 0 … negativ, CSSOM View),
  `canScrollHorizontally` (Mausrad-Weitergabe Master/Detail), `toLogicalX`, `mirrorArrowKeys` (`ShortcutService` tauscht
  ←/→ **vor** dem Mapping: `NAVIGATE_LEFT` = rückwärts). Spaltenbreite: `start − draggingX` (`GeMouseEvent.draggingX` bleibt
  physisch). API-Positionen vom Anfang: `scrollToPixel`, `GeScrollEvent.scrollLeft`, Zustand `scroll.left`. Excel:
  `ExcelExportOptionsIf.rightToLeft` (4. Parameter `downloadExcel`, `<sheetView rightToLeft="1">`), `api.downloadExcel` setzt
  ihn. CSS logisch (`padding-inline-*`, `text-align: start/end`; `ge-table-text-align-left/-right` = Anfang/Ende, neu
  `-start/-end`), RTL-Regeln `.ge-table[dir="rtl"]` (Baumpfeil aufgeklappt, Detail-Dreieck, Pending-Marke), Klasse
  `ge-table-text-plaintext` (Latein mit Satzzeichen in RTL). Verschachtelte Master/Detail-Tabellen erben die Richtung.
  Browser-Specs: `rtl/rtl.browser.spec.ts` (R1–R15) + `describe.each(DIRECTIONS)` in `horizontal-scrolling`,
  `scroll-to-index`, `column-visibility`, `spans-and-header-groups` (Helfer `startPx`, `DIRECTIONS`).
- **Excel-Bedienung (seit 1.1.99, `sheet-editing/`, Design `prompts/013-tabellenkalkulation.design.md` Teil 1)**:
  `tableOptions.editing` (`EditingOptionsIf`: `startOnType`, `enterKey` edit|moveDown, `enterMoves`, `tabMoves`,
  `arrowKeysCommit`, `textSelection`, `clearKeys`, `ctrlEnterFillsSelection`, `collapseSelectionOnNavigate`, `emptyValue`,
  `defaultEditable`, `maxClearCells`). `CellEditorService` (`tableScope.cellEditorService`, nur mit Option): **ein**
  Container `ge-table-cell-editor` im Host (wie Fill-Handle; Lage in `afterRenderPass()` aus `getBodyCellRectInHost`,
  herausgescrollt per `clip-path` geschnitten, **nicht** versteckt – Fokus/IME bleiben), Editor folgt dem Zeilenobjekt
  (Sortieren). `CellEditorIf` + `TextCellEditor`/`NumberCellEditor`/`DateCellEditor`/`SelectCellEditor`, `ColumnDef.editor`
  (Name oder Fabrik), `ColumnDef.emptyValue`; Auswahl: `editor` → eigener `getEditRenderer` (alter Weg im Zell-DOM) →
  `DEFAULT_GET_EDIT_RENDERER` (exportierte Konstante, per Identität erkannt) → neuer Editor. Lostippen: Capture-`keydown`
  am Host (vor `ShortcutService`, `stopImmediatePropagation`), tote Tasten/IME öffnen leer ohne `preventDefault`; Commit
  über `TableScope.commitCellEditor` → `writeCellsInternal` (neu: `deferRepaint` beim `pointerdown`-Commit, `message`).
  `isEditing()` = alter Weg **oder** offener Dienst. **Tastatur-Schichten**: `ShortcutService` = System → `getShortcutLayers()`
  (`editingShortcutLayer(mac)`) → `shortcutActionIdMapping`; Schlüssel werden beim Zusammenführen harmonisiert (gleiche Taste,
  andere Schreibweise ersetzt – auch ohne Option). Neue `ActionId`s `NAVIGATE_NEXT/PREVIOUS_CELL`, `EXTEND_SELECTION_*`,
  `NAVIGATE_DATA_EDGE_*`, `EXTEND_TO_DATA_EDGE_*` (DOM-frei `findDataEdge`), `SELECT_ROW/COLUMN`, `CLEAR_CELLS`,
  `CLEAR_AND_EDIT`; Enter ohne Editor = `ACTIVATE_CELL` → sonst Editieren; Tab in der letzten Spalte nicht verbraucht.
  `SelectionService`: Anker/Ende (`getAnchor`, `getExtent`, `collapseTo`, `extendTo`), Shift-Klick nutzt den Anker.
  `CellChangeSource` + `"clear"`, `api.clearCells`, `startEditing`, `stopEditing`, `isEditing`, `getEditingCell`,
  **`api.subscribe(listener)`** (Proxy `event-listener-hub.ts`: ohne Abonnenten bit-gleich), Event `onEditingChanged`
  (`GeEditEvent` start/input/commit/cancel, auch alter Weg; Wrapper `editingChanged`). ARIA: Zelle `aria-owns` → Editor,
  `aria-readonly`, Host `aria-description`; axe-Filter in `test-utils/axe.ts` für den besessenen Editor. Ohne Option
  gelten nur: Mapping-Harmonisierung, CSP-Umbau von `InputCellRenderer`/`SelectCellRenderer` (DOM statt `innerHTML`,
  Styles in `css/table-sheet-editing.css`) und `RenderScope.setEditorDraft` (Text des Zell-Editors bleibt über Repaints;
  wiederhergestellt = `data-ge-restored`, `InputHandler` übernimmt per Enter/`focusout`). CSS `css/table-sheet-editing.css`,
  `--ge-table-cell-editor-*`.
- **Zwischenablage (seit 1.1.99, `clipboard/`, Design 013 Teil 2)**: `tableOptions.clipboard` (`ClipboardOptionsIf`:
  `copyHeaders`, `copyValue` text|raw, `html`, `pasteAddsRows` + `createRow`, `maxPasteCells`, `processCopy`,
  `processPaste`). `ClipboardService` (`tableScope.clipboardService`; mit Option Tasten + Events, sonst über
  `getClipboardService()` nur für die API): `copy`/`cut`/`paste`-Events am `document` (nur wenn der Host fokussiert ist
  oder das Event am Proxy hängt). Tasten über die Schicht `clipboardShortcutLayer(mac)` (`COPY_2_CLIPBOARD`,
  `CUT_2_CLIPBOARD`, `PASTE_FROM_CLIPBOARD`; Strg+X ersetzt nur hier `DESELECT_ALL`): `onActionTriggered` → `arm()`
  fokussiert für den Tastendruck ein verstecktes `textarea.ge-table-clipboard-proxy` (Safari feuert sonst nichts),
  Aktion **nicht** verbraucht → Browser feuert das Event dort → Fokus zurück an den Host (sofort bzw. `setTimeout 0`).
  Eigener `CopyServiceIf` (nicht `instanceof CopyService`): Kopieren bleibt beim alten async Weg. DOM-frei: `tsv.ts`
  (`toTsv`/`parseTsv`, Excel-Quoting), `paste-plan.ts` (`computePastePlan`, `getPasteSize`: Kacheln, Abschneiden,
  angezeigte Zeilen, sichtbare Spalten), `input-pipes.ts` (`createNumberInputPipe`, `createDateInputPipe`,
  `booleanInputPipe`, `sheetInputPipe`); `clipboard-html.ts` (`toHtmlTable` mit `x:num`, `parseHtmlTable` per
  `DOMParser`, nur `textContent`). Intern kopiert (gleicher Text wie der Speicher) = **Werte roh** (`writePastedCells`
  mit `raw`: `editInputPipe` für den Aufruf ausgehängt, `validate` läuft). Ausschneiden: Rahmen `ge-table-cut-range`
  (`afterRenderPass`), Quelle über Zeilenobjekte, Ziel + geleerte Quelle in **einem** `writePastedCells(…, "cut")`;
  Escape/andere Änderung (`subscribe` → `onModelChanged`) hebt die Marke auf. Extern ohne Pipe: wie der Editor (Zahl in
  Zahlzelle, TRUE/FALSE, ISO-Datum). `CellChangeSource` + `"paste"`, `"cut"`; API `copySelection`, `cutSelection`,
  `pasteText`, `getSelectionAsText`, `cancelCut`. CSS `css/table-clipboard.css`, `--ge-table-cut-range-border(-alt)`.
- **Undo/Redo (seit 1.1.99, `undo/`, Design 013 Teil 3)**: `tableOptions.undo` (`UndoOptionsIf`: `maxSteps`, `maxCells`,
  `onConflict` skip|overwrite, `recordApiChanges`). `UndoService` (`tableScope.undoService`, nur mit Option) zeichnet in
  `writeCellsInternal` auf (`record(all, source, opts.undoable)`; nicht `"undo"`/`"redo"`, `"api"` nur mit
  `recordApiChanges` bzw. `applyCellChanges(…, source, { undoable })`, `"commit"` leert) und in `markPending`
  (Batch: Vormerk-Zustand vorher/nachher → `PendingChangesUndoable`, `BatchEditService.getPendingEntry/restorePending`,
  `PendingCellChanges.put`; Commit/Cancel leeren). DOM-frei `UndoStack` (Grenzen Schritte/Zellen). `CellChangesUndoable`:
  Zuordnung über Zeilenobjekt (Map einmal je Undo), Spalte über Property; ausgefilterte Zeile → `writeRowValue`
  (`batch-edit/write-row-value.ts`) + `extraChanges`; Schreiben über `TableScope.writeUndoCells` (roh, ohne Validierung,
  nur editierbare Zellen). `setRows` erkannt am anderen `getAllRows()`-Array → Verlauf leer. `batchUndoable(label, fn)`
  fasst zusammen (`GroupUndoable`). Tasten `undoShortcutLayer(mac)` (`UNDO`, `REDO`), im Editor nicht (INPUT-Ziel).
  Event `onUndoStackChanged` (`GeUndoEvent`, Wrapper `undoStackChanged`), API `undo`, `redo`, `canUndo`, `canRedo`,
  `clearUndoHistory`, `getUndoState`, `batchUndoable`. `CellChangeSource` + `"undo"`, `"redo"`.
- **Zellformel-Engine (seit 1.1.99, `sheet/`, DOM-frei, Design 013 Teil 4A)**: `SheetEngine(source: SheetDataSourceIf,
  options)` bzw. `SheetEngine.fromArrays(data)`; Formeln = Text mit `=` in den Daten, `'=` = Text, `""` = leer.
  Parser: `parseFormula(source, true)` (Referenzmodus; ohne Flag 008 bit-gleich) – Tokenizer `tokenizeSheet` (`$`, `:`,
  `%`, `;`, Fehlerliterale, nur `"…"`), AST + `ref`/`range`/`error`, unäres Minus bindet stärker als `^`, `^` linksassoziativ, leere Argumente = blank. Auswertung
  `sheet-compiler.ts` (Closures, Bezüge sammeln, `[feld]` → Spalte über `getFieldColumn`, `SUM([x])` → `#NAME?`),
  Werte `sheet-values.ts` (`SheetDate` = Excel-Seriennummer, `FormulaRange`, Vergleich wie Excel, 15 Stellen),
  Funktionen `sheet-functions.ts` (Excel-Semantik, getrennt von 008), Metadaten `FORMULA_FUNCTION_INFO`. Graph:
  Einzelbezüge `Map<key, Set>` + Bereichsknoten (dedupliziert, Index je Spalte, breite Bereiche > 64 Spalten extra);
  Neuberechnung BFS → Kahn → Tarjan (`#CIRC!`) → zweiter Kahn, iterativ. `shift-formula.ts`: `shiftFormula`,
  `offsetReferences`, `adjustFormula` (Einfügen/Löschen/`moveCells`; ohne geänderten Bezug bleibt der Text). Erwartungswerte aus LibreOffice:
  `scripts/sheet-reference-values.mjs` → `test-utils/sheet-reference-values.json` (eingecheckt; Excel-Abweichungen von
  LibreOffice in `sheet-reference.spec.ts`). Bench `bench/sheet.bench.ts`.
- **Zellformeln in der Tabelle (seit 1.1.99, `sheet/table-sheet.ts`, Design 013 Teil 4B)**: `tableOptions.cellFormulas`
  (`true` | `Partial<CellFormulaOptionsIf>` mit `columns`), `ColumnDef.cellFormulas: false` = Freitext. `TableSheet`
  (`scope.tableSheet`, nur flache Bodies – `AreaModelObjectArray`/`AreaModelArrayOfArrays`, sonst und mit Master/Detail
  Warnung) hängt sich als `body.sheetCells` (`SheetCellsIf`, intern) ein: `getValueByT`/`getValueAt`/`getRowValue` geben
  jeden **Text** an ihn → `=…` in einer Formelspalte = Engine-Wert (**eine** Auswertungsstelle: Sortieren, Filter,
  Footer über `isCalculatedProperty`, Copy, Excel stimmen), `'=` = Text. Zeilen physisch (`getAllRows()`/`arr`,
  `Map<Zeile, Index>`), Spalten = Datenspalten (Zeilennummer/Checkbox zählen nicht; Objekte: Buchstabe hängt an der
  Property, Spalten-Drag erlaubt; Arrays: Spalten-Drag aus). Neuer Zeilen-Array, andere Länge oder andere Spalten →
  `sync()` baut neu. `getInputValueAt` (Objekt/Array) = Eingabe; `TableScope.getCellInput` nutzen Editor
  (`getShownCellValue`), Batch, Undo-Konfliktprüfung, `writeCellsInternal` (`oldValue`/`newValue` = Eingaben).
  Schreibweg: Formeltext roh (`setRawValue`, ohne Pipe/`validate`; `rejectInvalidFormulas`), danach
  `sheet.cellsWritten(all)` **vor** Undo-Aufzeichnung und Repaint; `updateCells` meldet ebenfalls und zeichnet neu.
  Füllen: `moveFilledFormulas` (Quelle zyklisch, `shiftFormula` um die physische Distanz); Kopieren intern:
  `CopiedFormula` im Speicher, `resolvePastedValue` verschiebt (Ausschneiden: unverändert). Excel:
  `downloadExcel(…, { cellFormulas: true })` → `ExcelFormulaCellIf` (`toExcelFormula`: `offsetReferences` + `_xlfn.`),
  `<f>`/`<v>` mit `t`, `fullCalcOnLoad`; nur wenn Export = Blatt. Row Drag aus (`getBlockReason` `"cellFormulas"`).
  Fehlerzellen über `AbstractAreaModel.getCustomClassesAt/getTooltipAt`. API: `hasCellFormulas`, `getCellAddress`,
  `getCellByAddress`, `getCellInput`, `getCellValue`, `setCellInput`, `evaluateFormula`, `getSheetValue`,
  `recalculate`, `getPrecedents`, `getDependents`, `getSheetEngine`. Demo `apps/table-demo/cell-formulas.html`.
  **Formel-Eingabe (Etappe 6, `sheet-editing/formula-assist.ts`)**: `CellEditorService` hängt bei einem Text-Input in
  einer Formelspalte einen `FormulaAssist` an (Tasten **vor** `wantsKey`, `pointerdown` vor dem Commit, `update()` in
  `afterRenderPass`). Zeigemodus: Einfügestelle (`isInsertionPoint`, DOM-frei `formula-text.ts`) im Modus „enter“ oder
  direkt hinter dem gezeigten Bezug; Pfeile/Shift/Klick/Ziehen setzen bzw. ersetzen den Bezug (physische Adressen über
  `TableSheet`), jede andere Eingabe beendet ihn. F4 `toggleAbsolute`. Farben: Spiegel-Div `ge-table-formula-mirror`
  hinter dem transparenten Input (`ge-table-formula-input`), Rahmen `ge-table-formula-ref-N` im Host (`aria-hidden`).
  Vorschläge: Input `role="combobox"` + Listbox im Editor-Container, Hinweis `role="tooltip"` (`aria-describedby`);
  beide stehen im `aria-owns` der Zelle (`getOwnedEditorId`, axe-Filter in `test-utils/axe.ts`). CSS in
  `css/table-sheet-editing.css`, Variablen `--ge-table-formula-ref-0…7`, `--ge-table-formula-popup-*`.
- **Spreadsheet-Modus (seit 1.1.99, `spreadsheet/`, Design 013 Teil 5)**: `SpreadsheetFactory.create({ data, rowCount,
  columnCount, columnWidth, rowHeight, rowNumbers, tableOptions, functions })` → `SpreadsheetTableModel`
  (`setDataColumns`, `getDataColumnWidths`) mit `AreaModelSheetHeader` (Buchstabenzeile, `isColumnLetterRow`) und
  `AreaModelSheet` (dünn: `Map<physischeZeile, unknown[]>` + `Map<Array, Zeile>`, Daten je Datenspalte, `columnOffset`
  für die Zeilennummern, Sortieren/Filtern als `Int32Array`-Permutation nur solange aktiv, `version` je Strukturänderung,
  `getPhysicalRowIndex`/`getDisplayRowIndex` – Zeilennummern `original` und `TableSheet` nutzen sie, `forEachCell` →
  `SheetDataSourceIf.forEachInput` (Neuaufbau liest nur gefüllte Zellen), `getContentExtent` (Excel-Export schneidet
  darauf zu), `deleteRows`/`restoreRows`, `deleteColumns`/`restoreColumns` behalten die Zeilen-Arrays). Preset
  `tableOptions.spreadsheet`: die Options werden **nie** geändert – `spreadsheetOption(options, key)` liefert je Teil
  den wirksamen Wert (`TableScope`, `getFillHandleOptions`, `cellFormulas`), `applySpreadsheetPreset` gibt eine Kopie;
  eigenes Selektionsmodell dann `range`. Eingaben über `sheetInputPipe(locale)` (Zahl, Datum, TRUE/FALSE). `TableFactory` `columnLetters: true` = Buchstabenzeile
  über den Labels. Klick auf Buchstaben = Spalte (`SelectionService.clickColumnLetter`), Doppelklick sortiert dort nicht,
  Excel-Export lässt Buchstabenzeilen weg. Struktur: `applyStructureEdit` (`spreadsheet/structure-edit.ts`):
  `engine.adjustForStructureChange` **vor** der Änderung, danach roh schreiben (`TableSheet.writeInput`), ein
  `StructureUndoable` (Delta: gelöschte Zeilen/Zellen + alte Formeltexte an der Position vor der Änderung, zuerst Struktur
  zurück, dann Texte; Redo = noch einmal), Event-Quelle `"structure"`, nicht während Batch-Edit,
  `TableScope.refreshAfterStructureChange` (Fokus bleibt in der Tabelle). `FormulaBar` (plain DOM, `api.subscribe`, schreibt mit Quelle `"edit"` = ein Undo-Schritt). API `getActiveCell`,
  `goToAddress`, `insertRows`, `deleteRows`, `insertColumns`, `deleteColumns`, `getSheetData`. Demo
  `apps/table-demo/spreadsheet.html` (Formelleiste, Kontextmenü-Beispiel, +100 Zeilen, JSON). CSS `css/table-spreadsheet.css`.
- Lebenszyklus: `TableScope.destroy()` / `api.destroy()` gibt alle Listener (alle über `listenerAbortController`),
  den ResizeObserver und Renderer-Cleanups frei. Wrapper rufen es beim Modellwechsel und Unmount auf.
- Weitere API: `scrollToIndex`, `scrollToPixel`, `ensureRowIsVisible`, `ensureColumnIsVisible`, `autoResizeColumns`, `setColumnWidth`,
  `recalcColumnWidths`, `updateCells([TableCellUpdateEvent…], repaintAll)`, `triggerAction(ActionId)`, `repaint`,
  `repaintHard`, `setLoggingActive`.
- Sichtbarkeit: `api.setColumnVisible(index | property | ColumnDef, visible)` / `isColumnVisible` (über
  `ColumnDef.isVisible`, Breite 0, alte Breite bleibt), `setHeaderVisible` / `setFooterVisible` (Flag im `TableModel`,
  Höhe 0). `scrollToIndex(x, y)`: x = Spalte (fixierte West-Spalte → Anfang, `-1` behält x).

### 3.7 Wichtige `TableOptionsIf`-Felder (echte Namen!)
`defaultRowHeights {header, body, footer}`, `hoverRowVisible`, `hoverColumnVisible`, `columnsResizable`,
`columnsDraggable`, `columnResizeHandleWidthInPx`, `verticalBorderVisible`, `horizontalBorderVisible`,
`headerSeparatorBorderVisible`, `footerSeparatorBorderVisible`, `fixedWestSeparatorBorderVisible`,
`fixedEastSeparatorBorderVisible`, `tableTopBorderVisible`, `tableBottomBorderVisible`, `overflowX/Y`,
`treeOptions`, `headerGroupOptions`, `headerToggleExpandCollapseIcons`, `showCheckboxWihoutExtraColumn` (sic),
`externalFilterFunction`, `sortedOptions`, `sortOrder`, `autoRestoreOptions`, `getEditRenderer`,
`getSelectionModel`, `getFocusModel`, `shortcutActionIdMapping`, `shortcutActionsDisabled`, `resizeEventDebounceDelay`,
seit 1.1.91 `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`, `ariaTexts`, seit 1.1.92 `overlayOptions`, `initialState`,
`stateChangedDebounceDelay`, seit 1.1.95 `rowDragOptions`, seit 1.1.96 `fillHandle`, `batchEdit`, seit 1.1.97 `masterDetail`,
seit 1.1.98 `direction`, seit 1.1.99 `editing`, `clipboard`, `undo`, `cellFormulas`, `spreadsheet`.
Muster: `const opts = { ...new TableOptions(), hoverColumnVisible: false, ... }`.

---

## 4. Framework-Wrapper (Kurzreferenz)

| Paket | Komponente / Element | Inputs | Hinweise |
|---|---|---|---|
| react-table | `<GuiexpertTable tableModel tableOptions … />` | Callback-Props `mouseClicked`, `selectionChanged`, `tableReady`, `scroll`, `licenseKey` … | `useEffect([tableModel, tableOptions])` → neues Objekt = Neuaufbau (Modell/Options mit `useMemo` stabil halten), Container 100 % × 100 % |
| vue3-table | `<GuiexpertTable :tableModel :tableOptions @tableReady @mouseClicked …>` | Events als Vue-Events | Default-Export = Plugin; `debounceMouseClickDelay` (Default 150 ms, `0` = sofort); `watch` auf Modell/Options → Neuaufbau; Modell als Konstante/`shallowRef` |
| preact-table | `GuiexpertTable` | Callback-Props analog React | neues Modell/Options-Objekt = Neuaufbau (Options einmal erzeugen, nicht inline) |
| svelte-table | `GuiexpertTable` | Svelte-Events (`on:tableReady`, `e.detail`) **und** Callback-Props `onTableReady`, `onMouseClicked` … (Runes-Modus) | Paket = Svelte-**Quellcode** (plain JS + `.d.ts`, Build `build.mjs`), läuft unter Svelte 4 und 5; neues Modell = Neuaufbau |
| solid-table | `GuiexpertTable` | Callback-Props (zusätzlich DOM-`CustomEvent`s, bubbling) | `createEffect` auf Modell/Options → Neuaufbau; `contextmenu`-CustomEvent kommt nicht an (s. `TODO.md`) |
| webcomponent-table | Klasse `GuiexpertTable extends HTMLElement` | `el.data = { tableModel, tableOptions }`, `el.licenseKey` | **Selbst registrieren**: `customElements.define('guiexpert-table', GuiexpertTable)`; Events als `CustomEvent` auf dem Element (`contextmenu` nicht bubbling); Entfernen = `destroy()`, Wieder-Einfügen = Neuaufbau |
| angular-table | `<guiexpert-table [tableModel] [tableOptions] (tableReady) (mouseClicked) …>` | `debounceMouseClickDelay` (150 ms) | Standalone `TableComponent`, `OnPush`, Init `runOutsideAngular`; `ngOnChanges` → neues Modell = Neuaufbau; Output heißt `mouseDraggingEnded` |

Alle Wrapper haben seit 1.1.92 die Prop `loading` (Angular `@Input`, Web Component Property + Attribut): Loading-Overlay
ohne Neuaufbau der Tabelle – und das Event `stateChanged` (`GeStateChangeEvent`; React/Preact/Solid Callback-Prop, Vue
`@stateChanged`, Svelte `on:stateChanged`/`onStateChanged`, Angular `(stateChanged)`, Web Component `CustomEvent`).
Seit 1.1.95 genauso `rowDragStart`, `rowDragMove`, `rowDragEnd` (`GeRowDragEvent`), seit 1.1.96 `batchEditChanged`
(`GeBatchEditEvent`), seit 1.1.97 `detailExpandedChanged` (`GeDetailEvent`), seit 1.1.99 `editingChanged` (`GeEditEvent`), `undoStackChanged` (`GeUndoEvent`) – und je Wrapper `DetailComponentRendererWrapper`
(Detailzeile als Framework-Komponente; Angular `DetailRenderWrapperFactory`). `direction` (1.1.98) ist eine Option wie jede
andere: kein Wrapper-Code, ein neues Options-Objekt baut neu auf (Smoke-Tests React + Web Component).

Der Host-Container braucht immer eine **feste Höhe** (z. B. `.table-div { height: 500px }`), sonst ist nichts zu sehen.

**Stylesheet:** `@guiexpert/table/css/main.css` (im npm-Paket unter `css/`). Angular (alle Majors aus dem
Mono-Repo): `table.component.css` wird beim Build aus dem Core-CSS generiert – Anwender binden nichts extra ein. HTML: `https://cdn.jsdelivr.net/npm/@guiexpert/table/css/main.css`.
Bare Import `@guiexpert/table/css/main.css` funktioniert ab 1.1.85 (`exports` um `./css/*` ergänzt).

### Angular: ein Quellcode, neun Builds
- Änderungen am Angular-Wrapper **nur** in `packages/angular-table/src`. Danach `pnpm build:angular` – baut ng14 … ng22.
- `table.component.css` wird bei jedem Build aus `packages/table/css/table*.css` erzeugt (früher veraltete Kopie).
- Versionsspezifischen Code (falls je nötig) unter `angular-builds/ngNN/overrides/` ablegen.
- Neue Angular-Major: `ng22` → `ng23` kopieren, Versionen + Peer-Deps anpassen, `latest`-Tag umhängen
  (s. `angular-builds/README.md`).
- Angular-Doku: `packages/angular-table/instructions.md` (gilt für 14–22).

## 5. Code-Konventionen

- TypeScript, strikt objektorientiert; Interfaces in eigenen Dateien mit Suffix **`.if.ts`** (`TableModelIf`, `AreaModelIf`).
- Event-Typen mit Präfix `Ge…`; CSS-Klassen/Variablen mit Präfix `ge-table-`.
- **Keine Runtime-Abhängigkeiten im Core.** Neue Features ohne Fremd-Libs umsetzen.
- **Daten nie unescaped in `innerHTML`** (Zellwerte, Labels, ids, Server-Daten): `escapeHtml()` (`common/escape-html.ts`,
  auch für Attribute in `"…"`) oder Text-APIs (`domService.createText`, `textContent`). Browser-Test mit
  `<img src="x" onerror=…>` als Wert (Muster: `renderer/renderer.browser.spec.ts` „HTML injection“).
- `instanceof` über Paketgrenzen vermeiden → `instanceof-workaround.ts` (`isAreaModelTree`, `isTreeRow`) nutzen/erweitern.
- Jede neue öffentliche Datei in `packages/table/src/index.ts` exportieren (sonst fehlt sie im npm-Paket und in typedoc).
- Umfangreiche JSDoc mit `@example` ist Standard (wird zu https://gui.expert/api).
- Spaltenindex = Modell-Index über alle 3 Seiten (west + center + east).
- **Barrierefreiheit (seit 1.1.91)**: Jedes neue DOM-Element bekommt eine passende Rolle bzw. `aria-*`-Attribute –
  Bedienelemente einen Namen (Texte über `AriaTextsIf`, englische Defaults), rein Dekoratives `aria-hidden="true"`
  (`ConvenienceDomService.setAriaHidden`), Kinder eines `role="row"` sind nur Zellen oder versteckt. Attribute immer über
  `DomServiceIf.setAttribute`/`removeAttribute` (wiederverwendete Row-Divs: veraltete Attribute entfernen). Keine eigenen
  Tab-Stopps (die Tabelle ist **ein** Tab-Stopp): Bedienelemente in Zellen `tabindex="-1"`. Test mit `axeViolations()` (`test-utils/axe.ts`, axe-core) + Eintrag in
  `aria/aria.browser.spec.ts`. Regeln für eigene Renderer: `instructions.md` 6.14.
- Bestehende Tippfehler in öffentlichen APIs (`isHeaderVisibe`, `showCheckboxWihoutExtraColumn`, `emmitDataKey`,
  `createCoverGrisDefaultOptions`) **nicht stillschweigend umbenennen** – Breaking Change. Nur mit Alias + `@deprecated`.

## 6. Doku, Tests & Verifikation

- Entwickler-Doku: `instructions.md` (alle Frameworks), `packages/angular-table/instructions.md` (Angular 14–22),
  `apps/angular-table-demo/instructions.md` (deutsch, Demo-Übersicht). Stand Okt. 2026 gegen den Code geprüft: alle
  `ts`-Blöcke kompilieren (strict, TS 6, Angular-22-Typen). **Bei API-Änderungen mitpflegen** und erneut prüfen
  (Snippets extrahieren → `tsc` mit `paths` auf `packages/*/src`).
- **API-Doc (JSDoc → https://gui.expert/api)**: `pnpm --filter @guiexpert/table docs:check` kompiliert jedes `@example`
  (und ```` ```ts ````-Blöcke in Beschreibungen) einzeln gegen `src/` (Prelude: `packages/table/scripts/doc-examples-prelude.ts`).
  Stand Okt. 2026: 658 Beispiele, 0 Fehler – **bei jeder JSDoc-Änderung laufen lassen.** Jedes exportierte Symbol hat ein
  `@category` (Gruppierung im typedoc-Index, Reihenfolge in `packages/table/typedoc.json`); neue Exporte bekommen eins.
  Interna, die öffentlich sein müssen: `@category Internals`; gar nicht dokumentieren: `@internal`.
- **API-Doc erzeugen**: `pnpm --filter @guiexpert/table typedoc:website` → HTML/JSON/MD nach `apps/table-website/src/assets`,
  HTML nach `apps/webpage-guiexpert/public/api` (`index.html` → `overview.html`, weil `/api/` die Astro-Seite `api.astro` ist),
  JSON nach `src/content/docs/doctype.json`, Link-Index `src/training/api-index.json` (s. §11). Konfiguration: `typedoc.json`,
  Startseite: `typedoc-readme.md`.
- **Tests (Core, Vitest 5)** – `packages/table`, Konfiguration `vitest.config.ts` (unabhängig von `vite.config.ts`):
  | Befehl (`pnpm --filter @guiexpert/table …`) | Was |
  |---|---|
  | `test` | Unit + Browser |
  | `test:unit` / `test:watch` | nur Node, ~3 s (~2.170 Tests) |
  | `test:browser` | echtes Chromium, ~930 Tests in 30 Dateien (einmalig: `pnpm --filter @guiexpert/table exec playwright install chromium`; im Container `CHROMIUM_PATH=/opt/pw-browsers/chromium`) |
  | `test:coverage` | v8-Coverage → `packages/table/coverage/` (git-ignored) |
  | `test:types` | `tsc` über Specs + `test-utils` (Vitest prüft keine Typen!) |
  | `bench` | Messungen außerhalb von `src/` (`bench/*.bench.ts`, eigene Config, keine Zeit-Assertions) |
  - Specs liegen **neben dem Code**: `*.spec.ts` = Node (Projekt `unit`), `*.browser.spec.ts` = Chromium (Projekt
    `browser`, Helfer `test-utils/mount-table.ts`: `mountTable`, `nextFrame`, `renderedRows`, `destroyAllTables`).
    Weitere Helfer in `test-utils/` (ZIP-Leser, Fake-KeyboardEvents, In-Memory-`localStorage`, `axe.ts` =
    `axeViolations(host)` mit axe-core als devDependency; zwei bekannte, begründete Funde am Scroll-Viewport werden dort
    eng gefiltert) – nie im npm-Paket.
  - Importe wie Anwender: `from '@guiexpert/table'` (Alias → `src/index.ts`).
  - Unit-Projekt läuft mit `isolate: false` (geteilter Modulzustand je Worker, sonst ~18 s statt ~2 s): keine
    Zustandsreste zwischen Tests, Singletons im `beforeEach` zurücksetzen; `test-utils/unit-setup.ts` stellt Timer,
    Globals und Mocks nach jedem Test zurück. Reihenfolge-Unabhängigkeit prüfen mit `test:unit --sequence.shuffle`.
  - **Charakterisierungstests**: Specs halten das heutige Verhalten fest. Bekannte Fehler stehen als
    `it.fails('<richtiges Verhalten>')` + `// BUG:` (grün, solange der Fehler besteht; nach dem Fix rot → `it.fails`
    in `it` umwandeln). Liste: `TODO.md` „Gefunden durch die Unit-Tests“. Fragwürdiges, evtl. gewolltes Verhalten:
    `// NOTE:`. **Jeder Bugfix bekommt zuerst einen roten Test.**
  - `src/index.spec.ts` hält alle Exportnamen als Snapshot fest: neuer Export → `pnpm exec vitest run -u src/index.spec.ts`
    und den Diff prüfen; ein **verschwundener** Export ist ein Breaking Change.
  - Abdeckung (Okt. 2026): gesamt ~97 % Zeilen / ~91 % Zweige; DOM-freie Teile 92–100 %, Rendering (`RenderScope`,
    `TableScope`, `TableApi`, `MouseHandler`, Renderer, CRUD) ~96 % durch die Browser-Specs (`horizontal-scrolling`,
    `mouse-handler`, `renderer/renderer`, `editing`, `spans-and-header-groups`, `lifecycle`, `theming`, `tree-rendering`,
    `table-api`, `crud/crud`, `keyboard`, `selection`, `scroll-to-index`, `column-visibility`, `state/table-state`,
    `row-numbers`, `aggregation`, `rowgroup/row-group`, `row-drag/row-drag`, `fill/fill-batch`, `master-detail/master-detail`,
    `rtl/rtl` …).
  - Browser-Specs: Zeit nicht über feste `setTimeout`s, sondern `nextFrame()`/`vi.waitFor`; Doppelklick-Erkennung über
    `mouseHandler.doubleClickDelay`; nicht auf Pixel-genaue Textbreiten prüfen (Mac vs. Linux-CI). Helfer in
    `test-utils/mount-table.ts`: `mountTable`, `nextFrame`, `renderedRows`, `areaRows`, `cellDiv`/`getCellDiv`,
    `columnIndices`, `stylePx`, `createRows`, `destroyAllTables`.
  - **Wrapper-Tests**: je Wrapper-Paket `vitest.config.ts` + `*.browser.spec.*` neben dem Code (Smoke: Mount →
    `tableReady`, Zeilen, Klick-Event, Modellwechsel = Neuaufbau + `destroy()`, Unmount = `destroy()`); Core per Alias aus
    `packages/table/src`; gemeinsame Helfer `packages/table/test-utils/wrapper-test-utils.ts` (ohne `vitest`-Import).
    Svelte läuft zweimal: Svelte 5 (`@sveltejs/vite-plugin-svelte` 5) und Svelte 4 (devDependency `"svelte4":
    "npm:svelte@^4.2.20"`, kleines Compile-Plugin in der Config). CI: `.github/workflows/test-wrappers.yml`.
  - **CI**: `.github/workflows/test-core.yml` (wiederverwendbar) läuft bei jedem Push/PR (aus `ci.yml`, parallel zum
    Build) und **vor jedem npm-Publish** (aus `npm-publish.yml`, dort ohne Caches): `test:types` → `docs:check` →
    `test:unit` → `test:browser` (Chromium) → Coverage-Report als Artefakt `coverage-table`; bei roten Browser-Tests
    Screenshots als Artefakt `browser-test-failures`. Rote Tests = kein Release.
- Weitere Verifikation: Builds + Demo-Apps + Website-Showcases
  (*Large dataset*, *Render speed*, *Tree table*, *Timetable*, *Slider filter*) + die 37 Live-Demos der Schulung (§11).
  Achtung: die Showcases `sorting1`, `inputfilter`, `sliderfilter`, `renderer1`, `rowspan`, `nobel` sind **Platzhalter**
  („Simple demo“, Inhalt „Dies ist ein Test“) – nicht verlinken, bis sie echte Inhalte haben.

## 7. Offene Punkte

Neue Features (Lücken gegenüber ag-Grid): **`prompts/README.md`** – je ein Arbeitsauftrag, nummeriert in
sinnvoller Reihenfolge, gemeinsame Regeln in `prompts/000-arbeitsweise.md`.

Siehe **`TODO.md`** (Wrapper-Bugs Solid/Vue/Svelte/React/Angular, API-Stubs, Performance `adjustArea`, Packaging,
Angular-Demo an lokale Builds koppeln, CI-Workflow für Angular).

## 8. Lizenz

- **Aktuelle Releases: MIT** (alle `LICENSE`-Dateien, alle `package.json` `"license": "MIT"`, README-Abschnitt
  „License" in allen Repos, Website `/license` und `/pricing`).
- **Künftige Releases: mögliche Dual-Lizenz** (Open Source für Privat/Nicht-kommerziell, kommerzielle Lizenz für
  Unternehmen); bereits unter MIT veröffentlichte Versionen bleiben MIT. Externe Beiträge nur mit CLA.
- In Videos/Marketing daher: „MIT-lizenziert, kostenlos auch kommerziell" – keine Preise nennen.
- `LicenseManager.setLicenseKey()` setzt nur ein `<meta>`-Tag, prüft nichts – bleibt als Vorbereitung bestehen.

## 9. Sicherheit

- `.npmrc`, `.env*`, `secret.txt` sind git-ignored und werden **nie** ausgegeben, kopiert oder committet.
  CI braucht **kein npm-Token**: `npm-publish.yml` nutzt npm Trusted Publishing (OIDC, `id-token: write`) und erzeugt
  Provenance. Lokales Publish nur mit eigenem `npm login` (`~/.npmrc`).
- Kein `npm publish`, kein `deploy` (Website-FTP via `deploy.cjs`) ohne ausdrückliche Freigabe.
- `.github/workflows/npm-publish.yml`: bei **`release: published`** → veröffentlicht alle 9 Pakete (8 Libs + Angular
  14–22), soweit die Version noch nicht auf npm ist. Manuell: Standard **Dry-Run**, Eingabe `only` für einzelne Pakete.
  Ein GitHub-Release ist also ein echter npm-Release! Der Workflow läuft mit dem Stand des Release-Tags.
  Vorher laufen die Core-Tests (`test-core.yml`, Job `test`) – nur wenn sie grün sind, startet der Job `publish`.
  Der Test-Job bekommt kein `id-token`.
- Trusted Publisher auf npmjs.com je Paket: `guiexperttable` / `mono` / `npm-publish.yml` (Dateiname nie ändern,
  sonst schlägt das Publish fehl).
- `ci.yml`: Build-Check (Core, Libs, Angular 14–22) + Core-Tests (`test-core.yml`) bei Push/PR, ohne Secrets,
  `permissions: contents: read`.

---

## 10. Videoreihe „GuiExpert Table in 60 Sekunden"

### Ziel & Zielgruppe
Frontend-Entwickler (Angular, React, Vue, Svelte, Vanilla), die **große Datenmengen** im Browser anzeigen müssen
und heute an Performance, ag-Grid-Lizenzkosten oder Framework-Lock-in scheitern. Jede Folge löst **genau ein Problem**.

### Kernbotschaften (in jeder Folge mindestens eine)
- Millionen Zeilen flüssig – horizontales **und** vertikales Virtual Scrolling.
- Ein Core, alle Frameworks (Angular 14–22, React, Vue 3, Svelte, Solid, Preact, Web Component, Plain JS).
- Null Runtime-Abhängigkeiten, volle Kontrolle über HTML/CSS, MIT-lizenziert (auch kommerziell kostenlos).

### Format-Regeln
- **≤ 60 s**, Hochformat-tauglich (zentrierter Code + Ergebnis), Code-Snippets **≤ 15 Zeilen**.
- Aufbau: **Hook/Problem (0–8 s) → Code (8–40 s) → Ergebnis live (40–55 s) → CTA gui.expert (55–60 s)**.
- Nur Code zeigen, der gegen die **echte API** kompiliert (§3/§4 bzw. die geprüften `instructions.md`). Jedes Snippet vor der
  Aufnahme in einer Demo-App ausführen.
- Standard-Recording-Umgebung (im Mono-Repo): `pnpm serve:table-demo` (Plain TS) bzw. Framework-Demo der Folge; für fertige
  Showcases `pnpm serve:webpage-guiexpert` → `/showcase/<name>`.
- Skripte pro Folge ablegen im Ordner `videos/NN-slug/` (Mono-Repo-Root)
  (`script.md`, `snippet.ts`, Link auf Demo).

### Episoden-Backlog (Mapping auf vorhandenes Material)
| # | Problem / Titel | Vorhandene Basis |
|---|---|---|
| 1 | „2 Millionen Zeilen ohne Ruckeln" | Showcase `large`, `createLargeModelAndOptions` |
| 2 | „Wie schnell rendert sie wirklich?" (FPS) | Showcase `fps` („Render speed") |
| 3 | Erste Tabelle in 60 s – Plain JS | Showcase `simple`, `generateSimpleModel(1000, 100)` |
| 4 | Gleiche Tabelle in React / Vue / Svelte / Angular | `apps/*-table-demo`, `angular-table-demo/simple` |
| 5 | JSON-Objekte → Tabelle (`TableFactory.createTableModel({rows, properties})`) | `angular-table-demo/objectarray` |
| 6 | Spalten links/rechts fixieren | `fixedLeftColumnCount`, Demo `columndef` |
| 7 | Sortieren mit eigenem Comparator | Showcase `sorting1`, Demo `sorting/headerdblclick` |
| 8 | Live-Filter über Eingabefeld | Showcases `inputfilter`, `idfilter`, `sliderfilter` |
| 9 | Eigene Zell-Renderer (Progressbar, Sterne) | Showcase `renderer1`, eingebaute Renderer |
| 10 | Framework-Komponente als Zelle | Demo `componentrenderer` (Angular `RenderWrapperFactory`) |
| 11 | Heatmap mit Farbgradienten | Showcases `heatmap1`, `heatmap2` (Seattle) |
| 12 | Baumtabelle & Checkboxen | Showcases `treetable`, `treetablecheckbox` |
| 13 | Row-/Colspan (Stundenplan) | Showcases `rowspan`, `timetable`, Demo `rowandcolspan` |
| 14 | Mehrzeilige Header-Gruppen | `demo-table-models/headergroup`, Demo `cellgroup` |
| 15 | Zellen/Zeilen/Bereiche selektieren + Copy | Demo `cellselection`, `api.copyToClipboard()` |
| 16 | Excel-Export ohne Library | Showcase `downloadexcel`, `api.downloadExcel()` |
| 17 | Theming mit CSS-Variablen / Dark Mode | Showcase `laf`, Demo `style/ultra` |
| 18 | Live-Daten (Krypto-Ticker) | Showcase `crypto`, Demo `chunksocket` |
| 19 | Spalten anpassen, neu laden – alles noch da (Zustand merken, State-API) | `videos/04-zustand-merken/`, Training-Kapitel `persist-state`, `apps/table-demo/state.html` |
| 20 | Inline-Editing | `getEditRenderer`, `InputCellRenderer`, Demo `todo` |
| 21 | Maus-Events & Kontextmenü | Showcase `mouseevents`, Demo `mouseevent` |
| 22 | Warum nicht ag-Grid? (Vergleich, sachlich) | Website `post/top-framework-agnostic-…` |
| 23 | Barrierefreie Tabelle (Screenreader + Tastatur) | `videos/02-barrierefreie-tabelle/`, Training-Kapitel `accessibility`, `apps/table-demo/aria.html` |
| 24 | Lade-Spinner und leere Tabelle – ohne Library, nur CSS | `videos/03-lade-spinner/`, Training-Kapitel `live-data`, `apps/table-demo/overlay.html` |
| 25 | Zeilennummern wie in Excel – eine Zeile Code (ohne Enterprise-Lizenz) | `videos/05-zeilennummern/`, Training-Kapitel `fixed-columns`, `apps/table-demo/row-numbers.html`, Showcase `large` |
| 26 | Summenzeile in einer Zeile Code – plus Statusleiste für die Auswahl (ohne Enterprise-Lizenz) | `videos/06-summenzeile/`, Training-Kapitel `footer-totals`, `apps/table-demo/aggregation.html` |
| 27 | Row Grouping in 60 Sekunden – ohne Enterprise-Lizenz | `videos/07-row-grouping/`, Showcase `rowgrouping`, Training-Kapitel `row-grouping`, `apps/table-demo/row-grouping.html`; Bezug zu Folge 12 „Baumtabelle & Checkboxen“ |
| 28 | Pivot-Tabelle in 60 Sekunden – ohne Enterprise-Lizenz | `videos/08-pivot-ohne-enterprise/`, Showcase `pivot`, Training-Kapitel `pivot-tables`, `apps/table-demo/pivot.html`; Bezug zu Folge 14 „Mehrzeilige Header-Gruppen“ |
| 29 | Berechnete Spalten in 60 Sekunden (`valueGetter`, Sortieren/Summe stimmen) – geplant | Showcase `formulas`, Training-Kapitel `formulas`, `instructions.md` 5.2 |
| 30 | Formeln ohne Enterprise-Lizenz (`formula`, `#DIV/0!`, kein `eval`) – geplant | Showcase `formulas`, Training-Kapitel `formulas` (#formulas), `instructions.md` 5.9 |
| 31 | Zeilen per Drag & Drop sortieren – mit Maus, Touch und Tastatur (kein „ohne Enterprise“: bei ag-Grid Community) | `videos/09-zeilen-ziehen/`, Showcase `rowdrag`, Training-Kapitel `events-and-context-menu` (Abschnitt), `apps/table-demo/row-drag.html`, `instructions.md` 6.16 |
| 32 | Excel-Feeling ohne Enterprise-Lizenz: Fill-Handle und Änderungen sammeln, dann speichern | `videos/10-fill-handle-batch-edit/`, Showcase `batchedit`, Training-Kapitel `inline-editing` (Abschnitt), `apps/table-demo/fill-batch.html`, `instructions.md` 6.17 |
| 33 | Master/Detail ohne Enterprise-Lizenz – Bestellung aufklappen, Positionen als zweite Tabelle, 100.000 Zeilen | `videos/11-master-detail/`, Showcase `masterdetail`, Training-Kapitel `master-detail`, `apps/table-demo/master-detail.html`, `instructions.md` 6.18 |
| 34 | Arabisch, Hebräisch: Tabelle von rechts nach links – eine Option (kein „ohne Enterprise“: bei ag-Grid Community) | `videos/12-rechts-nach-links/`, Showcase `rtl`, Training-Kapitel `theming-dark-mode` (Abschnitt), `apps/table-demo/rtl.html`, `instructions.md` 6.19 |

Bei Folgen, die Lücken in der Bibliothek aufdecken (z. B. kein eingebautes Kontextmenü, kein Server-Side-Row-Model),
zuerst das Feature im Code ergänzen (Ziel 1), dann die Folge drehen (Ziel 2).

---

## 11. Schulung „GuiExpert Table – step by step“ (https://gui.expert/training/)

Englisch, 39 Kapitel = 39 Folgen der Step-by-Step-Videoreihe (Demo-Repo `krocon/guiexpert-table-step-by-step-demo`,
ein Git-Tag `ep-NNN` pro Folge – die Tags müssen gepusht sein, sonst laufen die „git tag“-Links ins Leere).
Teil 8 „Beyond the basics“ (`PartId` `"advanced"`) nimmt neue Kapitel auf (seit Prompt 001: Kapitel 35 `accessibility`,
Tag `ep-035` erst nach dem Release 1.1.91; seit Prompt 006: Kapitel 36 `row-grouping`, Tag `ep-036` erst nach dem Release 1.1.94;
seit Prompt 007: Kapitel 37 `pivot-tables`, Tag `ep-037` erst nach dem Release 1.1.94; seit Prompt 011: Kapitel 38
`master-detail`, Tag `ep-038` erst nach dem Release 1.1.97; Kapitel 39 `formulas` (008, nachgeholt), Tag `ep-039` offen).

**Neue Features sichtbar machen** (Seite `/whats-new/`, Home „What's new“, Training-Index „New since the course“ `#new`,
Showcase-Übersicht „New“): eine Liste `src/features/new-features.ts` (je Feature Problem, Snippet ≤ 15 Zeilen, Showcase,
Training-Abschnitt, API-Symbole, ag-Grid-Stufe). Snippets prüfen: `pnpm --filter webpage-guiexpert check:features`
(kompiliert jedes Snippet gegen `packages/table/dist`); API-Namen, Kapitel und Showcases prüft der Build. Ein neues Feature
= ein Eintrag dort + Vorschaubild `src/assets/screens/thumbs/<showcase>.png`. Die Website hat eine eigene Kopie des
Tabellen-CSS (`src/styles/ge-table.css`) – neues Core-CSS dort nachtragen (Overlays/Zeilennummern fehlten bis Okt. 2026).

```
apps/webpage-guiexpert/src/
├── training/chapters.ts        # Register: Teile, Kapitel (slug, Titel, Lead, Lernziele, Folge, API-Symbole, Showcases, since)
├── training/demos/*.ts         # eine Live-Demo pro Datei: export default (ctx: DemoContext) => cleanup?
│   └── shared/                 # orders.ts (Testdaten, fester Seed), order-columns.ts, order-totals-footer.ts, demo.ts, demo.css
├── training/api-index.json     # generiert (scripts/build-api-index.mjs) aus dem typedoc-JSON
├── training/runtime.ts         # startet Demos per Klick (?demos = alle sofort, für Screenshots)
├── components/training/        # Snippet, LiveDemo, ApiLink, ChapterLink, Callout, Figure, TrainingNav, diagrams/*.astro (SVG)
├── layouts/TrainingLayout.astro, styles/training.css
├── pages/training/index.astro + <slug>.astro (ein File pro Kapitel)
└── assets/training/shots/      # demo-<name>-light|dark.png (Poster der Live-Demos), fw-*.png (Framework-Demos)
```

`apps/webpage-guiexpert/training-examples/` enthält den Framework-Code aus dem Demo-Repo (React, Vue, Svelte, …) –
nur Anzeige (`<Snippet file="examples/…" />`), wird nicht kompiliert. Er liegt **bewusst außerhalb von `src/`**:
Astro scannt beim Dev-Start `src/**` nach Abhängigkeiten, und die Frameworks sind keine Dependencies der Website
(sonst: „Failed to run dependency scan … react … could not be resolved“).

- **Code auf der Seite = Code der Demo**: `<Snippet file="demos/x.ts" region="r" />` zeigt den Bereich zwischen
  `// #region r` und `// #endregion r` (mehrere gleichnamige Blöcke werden zusammengefügt). Anzeige-Umschreibungen:
  `… // @show: <code>` ersetzt die Zeile, `// @hide` blendet sie aus, `./shared/orders` → `./data/orders`.
- **Links werden beim Build geprüft**: `<ApiLink name="TableApi.sortByColumn" />` gegen `api-index.json`, `<ChapterLink slug=…>`
  gegen das Register, Showcases gegen `src/pages/showcase/*/run.astro`, fehlende Screenshots (`<Figure>`) im Produktions-Build.
  Nach API-Umbenennungen: `typedoc:website` (erneuert den Index) und `pnpm build:webpage-guiexpert`.
- Demos importieren `@guiexpert/table` → Alias in `astro.config.mjs` auf `packages/table/dist` (vorher `pnpm build:core`).
  Demo-CSS wird in `LiveDemo.astro` importiert – **CSS-Imports in Client-Skripten fehlen im Produktions-Build**.
- Typprüfung der Demos: `pnpm --filter webpage-guiexpert check:training` (`tsconfig.training.json`, gegen `packages/table/dist`,
  also nach `pnpm build:core`; `verbatimModuleSyntax` wie Astro – Typ-Importe mit `type`).
- Screenshots: `pnpm dev` (bzw. `astro preview`), dann `SHOTS_OUT=/tmp/shots node scripts/training-screenshots.mjs http://localhost:4321`
  (Playwright + Chromium nötig), danach nach `src/assets/training/shots/` kopieren (direkt hineinschreiben löst Reloads aus).
- Neues Kapitel: Eintrag in `chapters.ts`, Seite `pages/training/<slug>.astro` mit `<TrainingLayout slug=…>`, Demo in
  `training/demos/`, Screenshot-Eintrag in `scripts/training-screenshots.mjs`.

