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
│   ├── webpage-guiexpert/     # Astro 5 + Tailwind: Quelle von https://gui.expert
│   └── table-website/         # Ziel für typedoc-Ausgabe
├── scripts/
│   ├── sync-angular-src.mjs   # packages/angular-table/src + Core-CSS → angular-builds/ngNN/lib/src
│   └── version.mjs            # check | sync | patch | minor – ein Versionsschema für alle Pakete
├── instructions.md            # Entwickler-Doku aller Frameworks (geprüft, s. §6)
├── TODO.md                    # offene Code-Aufgaben
└── llms.txt  README.md  LICENSE  pnpm-workspace.yaml (packages/*, angular-builds/*, apps/*)
```

## 2. Befehle (Root, pnpm 9.15.9 via `packageManager`, Node ≥ 22.22.3)

| Zweck | Befehl |
|---|---|
| Install | `pnpm i` |
| Core bauen (Voraussetzung für alles) | `pnpm build:core` |
| Alle Bibliotheken | `pnpm build:libs` |
| Angular, alle Majors / eine | `pnpm build:angular` / `pnpm build:angular:ng22` (je ~7 s) |
| Angular-Quellen nur synchronisieren | `pnpm sync:angular` |
| Alles | `pnpm build:all` (= `pnpm -r build`, topologisch) |
| Demos | `pnpm serve:table-demo`, `serve:react-table-demo`, …, `serve:angular-table-demo` |
| Website lokal | `cd apps/webpage-guiexpert && pnpm pre:build` (kopiert dists nach `public/scripts/`, git-ignored), dann `pnpm serve:webpage-guiexpert` |
| Versionen | `pnpm version:check`, `pnpm version:patch` (Core 1.1.84 → 1.1.85, Wrapper behalten Framework-Major) |
| Publish | `pnpm pub:<paket>`, `pnpm pub:angular` – **nie ohne ausdrückliche Anweisung**. Angular-Dist-Tags: `latest` = neueste Major, sonst `a14` … `a21` (so auch bisher auf npm) |

**Abhängigkeits-Fallen (beim Aufsetzen gelöst, nicht zurückdrehen):**
- `pnpm-lock.yaml` basiert auf der Lockdatei von `ge-table`. Ohne sie zieht pnpm neuere Transitive (z. B. Babel 8),
  die `vite-plugin-babel` brechen.
- `@babel/core: ~7.28.6` steht als devDependency in allen Paketen mit `vite-plugin-babel` – sonst erfüllt pnpm die
  Peer-Dependency mit Babel 8 aus `@angular/compiler-cli@22`.
- Root-`pnpm.overrides`: `@jridgewell/sourcemap-codec ^1.6.0` – Angular 22 deklariert `^1.4.14`, braucht aber 1.6
  (`encodeRangeMappings`).

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
- Ein `scrollViewport` mit riesigem `contentWrapperDiv` (Höhe = Summe aller Zeilenhöhen) liefert die native Scrollbar;
  der sichtbare `contentDiv` wird mitgeschoben.

### 3.3 Virtual Scrolling (Kern des Performance-Versprechens)
- Bei jedem Scroll: `scrollFactorY = scrollTop / (scrollHeight - clientHeight)` →
  `adjustBody()` → `adjustArea('body', yStart)` rendert **nur die sichtbaren Zeilen** (Abbruch, sobald `y > divHeight`).
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
  `AreaModelArrayOfArrays`, `AreaModelObjectArray` (+ `…WithColumndefs`), `AreaModelTree`, `AreaModelCellGroups`
  (Header-Gruppen), `AreaModelHidden`, `CoverGridBodyModel`. (`AsyncBodyAreaModelObjectArray` = unfertige
  Source-Leiche, nicht exportiert – nicht verwenden, wird später entschieden.)
- Fabriken (`factory/`):
  - `TableFactory.createTableModel(Partial<CreateTableModelPara>)` – Universal-Einstieg
    (`rows`+`properties` | `bodyData`/`headerData`/`footerData` | `bodyAreaModel` …, `columnDefs`, `fixedLeftColumnCount`,
    `defaultRowHeights`, `getSelectionModel`, `rowCheckboxVisible`, `tableOptions`).
  - `createByObjectArray(Param)`, `buildByTypedRows(Param)`, `createByAreaModels(Param)`.
  - `TreeFactory.buildTreeRows(...)`, `CoverGridFactory.createCoverGridModel(...)`, `CrudTableModelFactory`.
- Spalten: `ColumnDef.create({ property, headerLabel, width: px200, minWidth, maxWidth, headerRenderer, bodyRenderer,
  footerRenderer, headerClasses, bodyClasses, footerClasses, sortable, sortComparator, sortState, editable, isVisible,
  getEditRenderer, editInputPipe })`. Größen über Konstanten `px0 … px500` (`data/common/sizes.ts`) bzw. `Size`.

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
  `onCheckboxChanged`, `onModelChanged`, `onSelectionChanged`, `onFocusChanged`, `onScroll`. Event-Typen: `GeMouseEvent`,
  `GeKeyEvent`, `GeModelChangeEvent`, `GeScrollEvent`.
- Selektion: `SelectionModel(selectionType: "none"|"cell"|"row"|"column"|"range", selectionMode)` – via
  `tableOptions.getSelectionModel = () => sm`. Fokus analog `getFocusModel`.
- Tastatur: `ShortcutService` + `ActionId` (`COPY_2_CLIPBOARD`, `START_EDITING`, `TOGGLE_SELECTION`, `SELECT_ALL`,
  `DESELECT_ALL`, `NAVIGATE_*`), Mappings für Windows/OSX, überschreibbar über `shortcutActionIdMapping`.
- Sortierung: Header-Klick, `ColumnDef.sortable/sortComparator`, `api.sort(fn)`, `api.reSort()`.
- Filter: **extern** – `tableOptions.externalFilterFunction = (row) => boolean`, danach `api.externalFilterChanged()`.
- Persistenz: `tableOptions.autoRestoreOptions` (Scroll-Pos, Sortierung, Collapsed/Expanded; `getStorageKeyFn`).
- Export: `api.copyToClipboard()`, `api.downloadExcel(fileName, author)` (eigener XLSX-Writer, keine Lib).
- Weitere API: `scrollToIndex`, `scrollToPixel`, `ensureRowIsVisible`, `autoResizeColumns`, `setColumnWidth`,
  `recalcColumnWidths`, `updateCells([TableCellUpdateEvent…], repaintAll)`, `triggerAction(ActionId)`, `repaint`,
  `repaintHard`, `setLoggingActive`.
- **Stubs (leer, TODO):** `setColumnVisible`, `isColumnVisible`, `setHeaderVisible`, `isHeaderVisible`,
  `setFooterVisible`, `isFooterVisible`. Spalte ausblenden geht nur über `ColumnDef.isVisible: () => false`.

### 3.7 Wichtige `TableOptionsIf`-Felder (echte Namen!)
`defaultRowHeights {header, body, footer}`, `hoverRowVisible`, `hoverColumnVisible`, `columnsResizable`,
`columnsDraggable`, `columnResizeHandleWidthInPx`, `verticalBorderVisible`, `horizontalBorderVisible`,
`headerSeparatorBorderVisible`, `footerSeparatorBorderVisible`, `fixedWestSeparatorBorderVisible`,
`fixedEastSeparatorBorderVisible`, `tableTopBorderVisible`, `tableBottomBorderVisible`, `overflowX/Y`,
`treeOptions`, `headerGroupOptions`, `headerToggleExpandCollapseIcons`, `showCheckboxWihoutExtraColumn` (sic),
`externalFilterFunction`, `sortedOptions`, `sortOrder`, `autoRestoreOptions`, `getEditRenderer`,
`getSelectionModel`, `getFocusModel`, `shortcutActionIdMapping`, `shortcutActionsDisabled`, `resizeEventDebounceDelay`.
Muster: `const opts = { ...new TableOptions(), hoverColumnVisible: false, ... }`.

---

## 4. Framework-Wrapper (Kurzreferenz)

| Paket | Komponente / Element | Inputs | Hinweise |
|---|---|---|---|
| react-table | `<GuiexpertTable tableModel tableOptions … />` | Callback-Props `mouseClicked`, `selectionChanged`, `tableReady`, `licenseKey` … | `useEffect`-Init, Container 100 % × 100 % |
| vue3-table | `<GuiexpertTable :tableModel :tableOptions @tableReady @mouseClicked …>` | Events als Vue-Events | Default-Export = Plugin; `debounceMouseClickDelay` deklariert, aber wirkungslos |
| preact-table | `GuiexpertTable` | Callback-Props analog React | |
| svelte-table | `GuiexpertTable` | Svelte-Events (`on:tableReady`, `e.detail`) | importiert Core relativ (`../../table/src`) → wird mitgebündelt |
| solid-table | `GuiexpertTable` | Props deklariert, aber **nicht aufgerufen** – Events kommen als DOM-`CustomEvent` (bubbling) | s. `TODO.md` |
| webcomponent-table | Klasse `GuiexpertTable extends HTMLElement` | `el.data = { tableModel, tableOptions }`, `el.licenseKey` | **Selbst registrieren**: `customElements.define('guiexpert-table', GuiexpertTable)`; Events als `CustomEvent` (`mouseClicked`, `tableReady` …) |
| angular-table | `<guiexpert-table [tableModel] [tableOptions] (tableReady) (mouseClicked) …>` | `debounceMouseClickDelay` (150 ms) | Standalone `TableComponent`, `OnPush`, Init `runOutsideAngular`; Output heißt `mouseDraggingEnded` |

Der Host-Container braucht immer eine **feste Höhe** (z. B. `.table-div { height: 500px }`), sonst ist nichts zu sehen.

**Stylesheet:** `@guiexpert/table/css/main.css` (im npm-Paket unter `css/`). Angular (alle Majors aus dem
Mono-Repo): `table.component.css` wird beim Build aus dem Core-CSS generiert – Anwender binden nichts extra ein. HTML: `https://cdn.jsdelivr.net/npm/@guiexpert/table/css/main.css`.
Bare Import `@guiexpert/table/css/main.css` scheitert in Bundlern, weil `exports` nur `"."` freigibt (s. `TODO.md`).

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
- `instanceof` über Paketgrenzen vermeiden → `instanceof-workaround.ts` (`isAreaModelTree`, `isTreeRow`) nutzen/erweitern.
- Jede neue öffentliche Datei in `packages/table/src/index.ts` exportieren (sonst fehlt sie im npm-Paket und in typedoc).
- Umfangreiche JSDoc mit `@example` ist Standard (wird zu https://gui.expert/api).
- Spaltenindex = Modell-Index über alle 3 Seiten (west + center + east).
- Bestehende Tippfehler in öffentlichen APIs (`isHeaderVisibe`, `showCheckboxWihoutExtraColumn`, `emmitDataKey`,
  `createCoverGrisDefaultOptions`) **nicht stillschweigend umbenennen** – Breaking Change. Nur mit Alias + `@deprecated`.

## 6. Doku, Tests & Verifikation

- Entwickler-Doku: `instructions.md` (alle Frameworks), `packages/angular-table/instructions.md` (Angular 14–22),
  `apps/angular-table-demo/instructions.md` (deutsch, Demo-Übersicht). Stand Okt. 2026 gegen den Code geprüft: alle
  `ts`-Blöcke kompilieren (strict, TS 6, Angular-22-Typen). **Bei API-Änderungen mitpflegen** und erneut prüfen
  (Snippets extrahieren → `tsc` mit `paths` auf `packages/*/src`).
- Es gibt praktisch **keine Unit-Tests**. Verifikation heute: Builds + Demo-Apps + Website-Showcases
  (*Large dataset*, *Render speed*, *Tree table*, *Rowspan*, *Sorting*, *Input filter*).
- Wer Tests ergänzt: Vitest passt zum Vite-Setup; Area-Modelle/Factories/SelectionModel sind DOM-frei testbar.

## 7. Offene Punkte

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
  Publish-Tokens nur als GitHub-Secret (`NPN_TOKEN`, so in den Workflows) bzw. lokal in `~/.npmrc`.
- Kein `npm publish`, kein `deploy` (Website-FTP via `deploy.cjs`) ohne ausdrückliche Freigabe.
- `.github/workflows/npm-publish-*.yml` laufen bei `release: created` und manuell – ein GitHub-Release im Mono-Repo
  veröffentlicht also alle Nicht-Angular-Pakete!

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
| 19 | Zustand merken (Sortierung, Scroll) | `autoRestoreOptions` |
| 20 | Inline-Editing | `getEditRenderer`, `InputCellRenderer`, Demo `todo` |
| 21 | Maus-Events & Kontextmenü | Showcase `mouseevents`, Demo `mouseevent` |
| 22 | Warum nicht ag-Grid? (Vergleich, sachlich) | Website `post/top-framework-agnostic-…` |

Bei Folgen, die Lücken in der Bibliothek aufdecken (z. B. kein eingebautes Kontextmenü, kein Server-Side-Row-Model),
zuerst das Feature im Code ergänzen (Ziel 1), dann die Folge drehen (Ziel 2).
