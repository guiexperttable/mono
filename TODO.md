# TODO – GuiExpert Table Mono-Repo

> Offene Aufgaben. Herkunft: Code-Analyse und Aufsetzen des Mono-Repos (Oktober 2026).

## Wrapper-Korrekturen

- [x] **Solid-Wrapper** (`packages/solid-table/src/GuiexpertTable.tsx`): ruft keine Callback-Props auf
      (`mouseClicked`, `tableReady`, … sind in `GuiexpertTableProps` deklariert), sondern feuert DOM-`CustomEvent`s
      auf dem Container-Div. → Callback-Props wie bei React/Preact aufrufen (CustomEvents ggf. zusätzlich behalten).
- [x] **Vue-Wrapper** (`packages/vue3-table/src/lib/GuiexpertTable.vue`): Prop `debounceMouseClickDelay` ist
      deklariert, wird aber nicht verwendet. → Mouse-Click wie im Angular-Wrapper entprellen (oder Prop entfernen).
- [x] **Svelte-Wrapper** importiert den Core relativ (`'../../table/src'`) statt `@guiexpert/table` → Core wird ins
      Svelte-Paket gebündelt (doppelter Core, `instanceof`-Probleme). Auf Paket-Import umstellen.
- [x] **React-Wrapper**: `initialized` als lokale Variable statt `useRef`, kein Cleanup im `useEffect`,
      Änderungen an `tableModel`/`tableOptions` werden ignoriert. `onScroll` wird nicht weitergereicht.
      → `useEffect([tableModel, tableOptions])` mit `TableApi.destroy()` als Cleanup, Callbacks über `useRef`
      (dürfen sich frei ändern), `scroll`-Prop wird aufgerufen; StrictMode-Doppel-Init behoben. Zell-Komponenten
      werden verzögert ausgehängt (keine React-Warnung beim Modellwechsel). Demo: Umschalter „Only female“.
- [x] **Angular-Wrapper** (`packages/angular-table/src`): reagiert nicht auf `ngOnChanges` (neues `tableModel` wird
      ignoriert). → `ngOnChanges` baut die Tabelle bei neuem `tableModel`/`tableOptions` neu auf, `ngOnDestroy`
      ruft `destroy()`. Geprüft mit ng22-Build (JIT-Testseite, Signal-Input, Modellwechsel, Klick-Zählung).
- [x] **Preact-, Vue-, Solid-, Web-Component-Wrapper** übernehmen ein neues `tableModel`/`tableOptions` (Branch
      `fix/wrapper-model-change`): alte Tabelle mit `destroy()` freigeben, neu erzeugen, `tableReady` erneut; Unmount =
      `destroy()`. Dabei behoben: Preact rief `mouseMoved` nie auf und fror Callbacks beim Mounten ein; Vue teilte ein
      `new TableOptions()` als Prop-Default zwischen allen Instanzen (Selektionsmodell „wanderte“); Web Component:
      Daten vor dem Einhängen zeigten nur 1 Zeile, `data` ohne `tableOptions` warf, `contextmenu`-Event wurde vom Core
      verschluckt, Entfernen/Wieder-Einfügen (auch mit neuen Daten in derselben Task). Smoke-Tests für alle Wrapper
      (`pnpm test:wrappers`, CI-Job `test-wrappers`, Publish wartet darauf).
- [x] Wrapper – gefunden beim Testen, behoben (Branch `fix/visibility-wrappers`): Solid: `contextmenu`-CustomEvent kam
      nie an (auf dem Host-Div dispatcht, vom Core als zweiter Rechtsklick < 50 ms geschluckt) – Core-Fix:
      `MouseHandler.onContextmenu` ignoriert Nicht-`MouseEvent`s · Solid und Web Component dispatchen `scroll` nicht
      mehr bubbelnd (erreichte globale `scroll`-Listener) · Solid exportierte `GuiexpertTableProps` als Namespace →
      `export *` der Typen · Vue: `inheritAttrs: false` entfernt (`class`/`style`/Attribute landen am Element) ·
      vue3-table: totes `cypress/` gelöscht, `tsconfig.lib.json` nur noch `src/**` (Build ohne TS-Fehler) · Jest-Reste
      (`jest.config.ts`, `tsconfig.spec.json`) in react/preact/vue/solid gelöscht (Tests laufen mit Vitest). Offen:
      devDependency `solid-jest` (bleibt, um die Lockdatei nicht anzufassen).

- [x] **Alle Wrapper + demo-table-models bündelten eine komplette Kopie des Cores** (~210 KB je Paket, obwohl
      `@guiexpert/table` Abhängigkeit ist) → Core + Framework im Vite-Build extern (React 215 KB → 2 KB).
      Solid bündelte zusätzlich die Solid-Laufzeit, Svelte die Svelte-Laufzeit (veröffentlichtes svelte-table
      bricht deshalb selbst unter Svelte 4 mit „Function called outside component initialization“ ab).
- [x] React/Preact `ComponentRendererWrapper` riefen die Komponente als Funktion auf (Hooks kaputt); Preact nutzte
      `react-dom/client` (über compat mitgebündelt); Solid räumte Zell-Roots nie auf (Speicherleck).
- [x] **Svelte 5**: veröffentlichtes svelte-table lief nicht unter Svelte 5 (`lifecycle_outside_component` bzw.
      `svelte/internal`). → Paket liefert jetzt **Svelte-Quellcode** (`GuiexpertTable.svelte`, plain JS + `.d.ts`),
      kompiliert vom Svelte des Anwenders: läuft unter Svelte 4 **und** 5 (beides per Vite-Build + Browser getestet).
      Callback-Props `onTableReady`, `onMouseClicked` … für den Runes-Modus, `on:…`-Events bleiben.
      `ComponentRendererWrapper` nutzt unter Svelte 5 `mount()/unmount()`. Peer `^4.0.0 || ^5.0.0`, kein CJS-Build mehr.
      Demo auf Svelte 5 (Runes) umgestellt. Paketversion ab jetzt **5.x** (`scripts/version.mjs`), nächstes Release 5.1.86.
- [ ] `vue3-table`: unnötige Laufzeit-Abhängigkeiten `vue-i18n`/`vue-router` entfernt – beim Release erwähnen.

## Core

- [x] **Header-Gruppen auf-/zuklappen** setzte alle Spaltenbreiten auf 100 px zurück und verschob die Gruppenzelle
      (`AreaModelCellGroups.toggleHeaderGroup` baute neue `ColumnDef`s). Jetzt bleiben die bestehenden Defs erhalten
      (Breite, Klassen, Renderer, Sortierung), nur `isVisible` kommt aus den neu aufgebauten Gruppen. Debug-Ausgabe
      `'####### !!!!!! *******'` in `TableScope.toggleHeaderGroup` entfernt.

- [x] **Core-CSS überschrieb die Höhe des Anwenders (bis 1.1.86):** `.ge-table { height: 100% }` liegt auf dem Host-Element.
      Je nach Bundle-Reihenfolge gewann es gegen `.table-div { height: 500px }` → Container 0 px, Body unsichtbar, Footer
      oben über dem Header (gefunden in der Demo, Vite mit mehreren Seiten). Fix: `:where(.ge-table)` (Spezifität 0).

- [x] **Typdateien der Wrapper kaputt (bis 1.1.86):** die `.d.ts` von react-, preact-, solid-, vue3-, webcomponent-table
      (und demo-table-models) importierten `'../../../table/src'` statt `'@guiexpert/table'` (vite-plugin-dts löste den
      Vite-Alias auf) → bei Anwendern TS2307 bzw. untypisierte Props. Fix: `aliasesExclude` im dts-Plugin. Zusätzlich
      `HeaderGroupOptions`/`HeaderGroupOptionsIf` im Core exportiert (waren nicht öffentlich). Callback-Typen in
      React/Preact/Solid (`GeMouseEventFn` …) von `=> {}` auf `=> void` – sonst wäre `tableReady={api => console.log(api)}`
      ein Typfehler. Geprüft mit gepackten
      Paketen + `tsc --strict` ohne `skipLibCheck`. **Release 1.1.87 nötig.**

- [x] **Release 1.1.88** (1.1.87 wurde nur getaggt – `v1.1.87` zeigt auf einen Commit mit Version 1.1.86, der
      Workflow hat deshalb nichts veröffentlicht). Enthält zusätzlich:
  - `autoResizeColumns()` schätzte 10 px pro Zeichen nur aus dem Body → Datum und Footer-Summen abgeschnitten.
    Jetzt Header + Body + Footer, gemessen mit `canvas.measureText` in Schrift und Padding eines echten Labels
    (je Spalte max. 30 Kandidaten, ein Durchlauf → 100.000 Zeilen in < 0,5 s).
  - Filter verlor die Sortierung: `externalFilterChanged()` baute `filteredRows` aus den unsortierten Zeilen, das
    Sortier-Symbol blieb stehen. Jetzt wird die letzte Sortierung erneut angewendet; `sort(fn)` löscht die
    Header-Symbole (sie stimmen dann nicht mehr).
  - `copyToClipboard()` kopierte versteckte Spalten mit und hing ohne Inhalt für immer (Promise nie erfüllt).
    `downloadExcel()` exportierte versteckte Spalten ebenfalls – jetzt nur sichtbare (= aktuelle Sicht).
  - Bereichsauswahl per Maus-Ziehen (Typ `"range"`) – vorher nur Shift-Klick.
  - `ColumnDef.create()` ohne `sortable` setzte `sortIconVisible = FalseFn` → späteres `sortable = TrueFn` sortierte
    ohne Symbol. Sortier-Symbol überdeckte rechtsbündige Header-Texte (Label bekommt jetzt Platz).
- [x] **Release 1.1.89** (gefunden beim Drehen der Folgen 030/031):
  - Zellen ohne Wert (`undefined`/`null`) zeigten den Text „undefined“ (z. B. Elternzeilen im Baum).
  - Zwei schnelle Klicks auf **verschiedene** Zellen (< 500 ms, z. B. zwei Baum-Pfeile) galten als Doppelklick –
    der zweite Klick ging verloren. Doppelklick jetzt nur auf derselben Zelle.
  - Inline-Editing war praktisch unbenutzbar: Doppelklick auf eine Zelle mit Renderer (Balken, Badge, Komponente)
    öffnete keinen Editor (Attribute nur am Event-Target gesucht); der Editor erschien zusätzlich in Header-Zeile 0
    und bekam keinen Fokus; Tastenkürzel (z. B. ⌘/Strg+A) liefen auch im Editor und bauten die Zelle neu → Eingabe weg.
    Jetzt: `closest()` für die Zell-Attribute, Editor nur im Body, Fokus nach jedem Neuzeichnen, Kürzel ignorieren
    Eingabefelder.
  - `updateCells()` und der Editor-Fokus suchten Zellen per `document.querySelector` → bei mehreren Tabellen auf
    einer Seite traf es die falsche. Jetzt nur im eigenen Host-Element.
  - Zustand merken (`autoRestoreOptions`, Folge 033): Sortier-Symbol zeigte nach dem Laden die Spalten-Defaults statt
    der wiederhergestellten Sortierung; die Scroll-Position wurde oft nie gespeichert (gemeinsamer Debounce-Timer mit
    `debounceRepaint` brach das Speichern ab); Baum: ohne gespeicherten Zustand wurde alles aufgeklappt, verschachtelte
    Knoten wurden nie wiederhergestellt (nur sichtbare Zeilen durchlaufen), eine zugeklappt startende Tabelle merkte
    sich das Aufklappen nicht (Modus jetzt aus dem ersten Klick); `localStorage` ohne try/catch (Private Mode → Fehler
    beim Start); `autoConvertMapToObject` vertauschte Schlüssel und Wert.
- [x] **Release 1.1.90**:
  - `TableOptions`: Standard-`SelectionModel`/`FocusModel` waren modulweite Singletons → mehrere Tabellen ohne
    eigenes `getSelectionModel` teilten Auswahl und Fokus. Jetzt erzeugt jeder `TableScope` eigene Modelle
    (Reihenfolge: Tabellenmodell → Options → eigenes Modell); Defaults in `TableOptions` sind `undefined`.
  - `TreeFactory.buildTreeRows(data, { childrenProperty, expanded, deepMaxLimit })` – `expanded: false` oder
    `(row, deep) => boolean`; `deepMaxLimit` wird jetzt an die Rekursion weitergegeben.
  - Excel: ZIP-Einträge mit DEFLATE (`CompressionStream('deflate-raw')`, Fallback unkomprimiert) – 40 MB → 3,9 MB;
    `downloadExcel()` liefert `Promise<void>`, neu `ExcelService.createExcelBlob()`; Object-URL wird freigegeben.
  - `tableApi.sortByColumn(column, sortState?)` – Sortieren per eigenem Button wie per Doppelklick.
  - tsc-Fehler TS2802 (Set-Iteration bei ES5-Target) in `calcAutoColumnWidths` behoben.
- [x] `TableScope.destroy()` / `TableApi.destroy()`: entfernt alle DOM-Listener (u. a. `window` resize – vorher ein
      Leck bei jedem Neuaufbau), trennt den ResizeObserver, meldet sich bei Selection-/Focus-Model ab, ruft die
      Renderer-Cleanups. Grundlage für den Modellwechsel in allen Wrappern.
- [x] `api.sort(fn)` / `api.reSort()` zeichneten nicht neu (neue Reihenfolge erst nach dem nächsten Scrollen).
- [x] Excel-Export: ZIP ohne CRC-32 (immer 0 → strenge Leser wie Python `zipfile` lehnen ab), Zeilennummern als
      Literal `${r + 1}`, Blattgröße fest `A1:B3`. Behoben und mit openpyxl geprüft.
- [x] Footer-Summen über gefilterte Zeilen: fertige Klasse `AreaModelAggregateFooter` + Fabrik-Option `footerAggregates`
      (Prompt 005 `prompts/005-aggregation-gesamtzeile.md`, ab 1.1.94; instructions.md 5.4).

- [x] `TableApi.setColumnVisible()`, `isColumnVisible()`, `setHeaderVisible()`, `isHeaderVisible()`,
      `setFooterVisible()`, `isFooterVisible()` implementiert (Branch `fix/core-api`): Spalte über `ColumnDef.isVisible`
      (Breite 0, Copy/Excel überspringen sie, Wieder-Einblenden stellt die alte Breite her; Index, Property oder
      ColumnDef), Header/Footer über ein Flag im `TableModel` (Höhe 0, Daten bleiben). `TableModelIf` bekommt die
      Methoden als optionale Member.
- [x] Sichtbarkeit (Branch `fix/visibility-wrappers`): Gewichts-Breiten („weight“) verteilen den Platz nur noch auf
      angezeigte Spalten (vorher zählten ausgeblendete in `usedWidth` → Lücke) · API und Header-Gruppen entscheiden
      gemeinsam (`column/column-visibility.ts`): eine per `setColumnVisible` ausgeblendete Spalte bleibt nach dem
      Aufklappen ihrer Gruppe aus und umgekehrt (vorher überschrieb `toggleHeaderGroup` `isVisible`) ·
      `AreaModelCellGroups` gibt nichts mehr per `console.table` aus · Pfeiltasten überspringen ausgeblendete Spalten
      und scrollen horizontal: neu `api.ensureColumnIsVisible(col)` (Gegenstück zu `ensureRowIsVisible`).
- [x] Performance: `RenderScope.adjustArea` iterierte ab Zeile 0 bis zur ersten sichtbaren Zeile (O(n) pro
      Scroll-Frame). Branch `perf/constant-row-height`: `getConstantRowHeight()` → Startindex direkt berechnet
      (2 Mio. Zeilen, Tabellenende: 28,7 → 14,6 ms; Ausgabe an 265 Positionen identisch, Messung s. Commit).
- [x] **Hover-Zeile/-Spalte versetzt bei großen Tabellen** (gefunden in `apps/table-demo`, 1000 × 100 mit 2 Header- und
      2 Footer-Zeilen, 2 + 2 fixierten Spalten): `adjustHoverRows`/`getColumnLeftInHost` rechneten mit
      `scrollTop`/`scrollLeft` des Scroll-Viewports. Dessen Bereich ist aber nicht der gerenderte Inhaltsbereich
      (Viewport reicht über den Footer, Wrapper + 1 px, East-Spalten und vertikale Scrollleiste) – der Versatz wuchs mit
      der Scrollposition (Mitte ~34 px, Ende ~67 px). Jetzt mit dem gerenderten Versatz (`contentScrollTop`,
      neu `getContentScrollLeft()`); Browser-Test für oben links / Mitte / Ende.
- [ ] Performance, Teil 2: variable Zeilenhöhen weiterhin O(n) → Prefix-Summen + Binärsuche (Invalidierung bei
      Filter/Sortierung/Baum-Toggle beachten).
      → Voraussetzung in Prompt 011 (Master/Detail).
- [x] Performance, Teil 3a: `adjustColumnsToRowParent` las pro Zeile `scrollViewport.scrollLeft` (Wert wurde nie
      benutzt) → erzwungenes Layout je Zeile. Entfernt (Baum 30 → 19,5 ms, Objekt-Array 10,4 → 7 ms, gesamt mit
      Teil 1: 2 Mio. Zeilen Ø 16,5 → 6,0 ms, max 28,7 → 9,6 ms).
- [ ] Performance, Teil 3b: weitere Hotspots laut CPU-Profil (Baum): `setStyle` (~11 %), DOM-Neuaufbau je Scroll
      (Zeilen-/Zell-Divs recyceln statt neu erzeugen wäre der große Hebel).
- [x] `AreaModel.getYPosByRowIndex()` lieferte in der Basisklasse 0 (Branch `perf/constant-row-height`, im Browser geprüft) → `scrollToIndex()`/`ensureRowIsVisible()` sind für
      eigene Modelle ohne Override falsch. Default aus `getRowHeight()` berechnen (bzw. `getConstantRowHeight()`).
- [x] `getLastVisibleRowIndex()`/`getLastFullVisibleRowIndex()` lieferten am Tabellenende bzw. bei wenigen Zeilen −1
      (Folgefehler in `ensureRowIsVisible`). Behoben im selben Branch.
- [x] Sehr große Inhalte: Branch `fix/huge-scroll-height` – Scrollhöhe auf `EleScope.maxScrollHeightInPx` (8 Mio. px)
      gedeckelt. Vorher bei 2 Mio. Zeilen: fehlende Zeilenlinien/verrutschter Text am Tabellenende (GPU-Präzision),
      `scrollToIndex()` landete immer am Ende, Hover-Zeile unsichtbar (y = 33,5 Mio. px), Mausrad doppelt so schnell.
- [ ] Gedeckelte Höhe in Firefox und Safari testen (dort andere Höhen-Limits); evtl. `maxScrollHeightInPx` je Browser.
- [ ] `AsyncBodyAreaModelObjectArray` – unfertige Source-Leiche (nicht exportiert, fehlerhafte Indizes).
      Entscheiden: fertigstellen (Server-Side-Row-Model) oder löschen. *(später)*

## Feature-Prompts (`prompts/`, Okt. 2026)

Lücken gegenüber ag-Grid 36.2, je ein Arbeitsauftrag für eine neue Sitzung (API-Entwurf → Vitest → Code → Doku →
Demos → Website → Training → Demo-Repo → Video). Index, Reihenfolge und Abhängigkeiten: **`prompts/README.md`**,
gemeinsame Regeln: `prompts/000-arbeitsweise.md`.

- [x] **001 Screenreader-Unterstützung (ARIA)** – Branch `feat/aria`, Design `prompts/001-aria-screenreader.design.md`:
      `role="grid"`/`"treegrid"`, Zeilen/Zellen mit Index und Zählung über alle Zeilen (Virtual Scrolling),
      `aria-activedescendant`, Header-Fokus, Pos1/Ende/Bild/Enter, Live-Region, `ariaTexts`, axe-core in den Browser-Specs.
      Offen: manuelle Tests mit NVDA/JAWS/VoiceOver (Protokoll im Design-Dokument § 8) – **vor dem Release**.
- [ ] ARIA-Folgepunkte: Tooltip bei Tastaturfokus sichtbar machen (`title` erreicht nur Screenreader) · Spaltenbreite
      und -reihenfolge per Tastatur · „alle auf-/zuklappen“-Icon im Baum-Header per Tastatur (heute `aria-hidden`,
      Enter je Knoten) · Demo-Repo-Folge `ep-035` (nach dem Release).
- [x] **002 Overlays „Lädt…“ / „Keine Daten“** – Branch `feat/overlays`, Design
      `prompts/002-overlays-laden-keine-daten.design.md`: `showLoadingOverlay`/`showNoRowsOverlay`/`hideOverlay`/
      `getOverlayState`, `tableOptions.overlayOptions`, automatisch „No rows to show“ / „No matching rows“
      (`AreaModelIf.getUnfilteredRowCount?`), CSS-Spinner, `loading`-Prop in allen Wrappern, CRUD zeigt beim Laden das
      Overlay. Offen: Angular-Smoke-Test (es gibt noch kein Angular-Test-Setup), Demo-Repo (nach dem Release).
- [x] **003 Zustand speichern vervollständigen + State-API** – Branch `feat/table-state`, Design
      `prompts/003-zustand-speichern.design.md`: `TableStateIf` (JSON, Spalten nach Property, Zeilen nach `getRowId`),
      `api.getState/applyState/resetState/setCustomState/setHeaderGroupCollapsed`, `tableOptions.initialState`,
      `onStateChanged` (`GeStateChangeEvent`, entprellt, `stateChanged` in allen Wrappern), Speicher-Adapter
      (`autoRestoreOptions.storage`), neue Flags `autoRestoreColumnLayout/HeaderGroupState/CustomState`,
      `autoRestoreCheckedState`/`autoRestoreSelectedState` wirken, ein Schlüssel `<key>tableState` (Migration der drei
      alten Schlüssel), Warnung ohne `getStorageKeyFn`. Fehler S5 (Sortierung nach Index) behoben.
      Offen: Demo-Repo (Kap. 33 hat schon einen Tag – kein neuer), Angular-Demo `columndef` erst nach dem Release.
- [ ] Folgepunkte 003: alte Schlüssel (`<key>sortingState`, `scrollState`, `collapsedExpandedState`) bis 1.2 lesen, dann
      `readLegacyState` und die `@deprecated` `StoreState*Service`-Klassen entfernen · Fokuszelle im Zustand (ag-Grid
      hat sie) · Mehrspalten-Sortierung per Shift-Klick im Header (Speicher und `applyState` können sie schon) ·
      Programmatische Änderungen an Haken über das Modell werden erst mit der nächsten Änderung oder `destroy()`
      gespeichert · Verschieben über die Grenze fixierter Spalten (Drag und Restore) prüfen.
- [x] **004 Zeilennummern** – Branch `feat/row-numbers`, Design `prompts/004-zeilennummern.design.md`:
      `RowNumberColumnDef` (+ `isRowNumberColumnDef`, `RowNumberCellRenderer`, `RowNumberOptions`), Flag
      `rowNumbersVisible` in `TableFactory.createTableModel` (Spalte vorne, fixiert), Zählweise `display`/`original`,
      `format`, Breite folgt der größten Nummer, `role="rowheader"`, Klick wählt die Zeile (`range`), „#“ wählt alles,
      kein Export ohne `exported: true`, nicht zieh-/sortier-/resizebar, Checkbox/Baumpfeil rücken hinter die Nummer;
      neu `api.getColumnIndex(property)`. Selbständig umgesetzt (Entscheidungen im Design ohne Freigabe-Runde).
      Offen: Demo-Repo entfällt (kein neues Kapitel), Angular-Demo erst nach dem Release.
- [ ] Folgepunkte 004: Gruppenzeilen (006) nicht nummerieren (`isGroupRow?` am Body-Modell, s. Design § 2.7) · Row Drag
      (009) kann die Nummernspalte als Griff nutzen · `MouseHandler.getArrowColumnIndex` ignoriert
      `showCheckboxWihoutExtraColumn` (anders als `RenderScope.getTreeArrowColumnIndex`, schon vor 004) · Speicher der
      Positions-`Map` im Modus `original` (evtl. Index am Modell statt Map).
- [x] **005 Aggregation und Gesamtzeile** – Branch `feat/aggregation`, Design `prompts/005-aggregation-gesamtzeile.design.md`:
      `AggregatorIf` (`init`/`add`/`merge`/`result`, Zustand statt Zahl → Mittelwert über Gruppen korrekt), `Aggregators`
      (sum, count, avg, min, max, countDistinct, first, last; Summen mit Neumaier-Kompensation), `aggregate()`,
      `aggregateColumns()`, `createValueGetter()`, `formatAggregateValue()`; `AreaModelAggregateFooter` + Fabrik-Option
      `footerAggregates` (eine oder mehrere Gesamtzeilen, Spalten nach Property, Beschriftung `rowheader`, Cache);
      optional `AreaModelIf.invalidateDerivedValues?()` – die Tabelle ruft es bei Filter, Sortierung, Editieren, `updateCells()` und
      `api.repaint()`/`repaintHard()`; `AreaModelTree.getLeafRows()`; `api.getSelectionAggregates()` /
      `SelectionAggregator` (Statusleiste). Grundlage für 006–008. Selbständig umgesetzt.
      Offen: Demo-Repo entfällt (kein neues Kapitel), Angular-Demo erst nach dem Release.
- [ ] Folgepunkte 005: Excel-Formeln für die Gesamtzeile (`=SUBTOTAL(109, …)`; der XLSX-Writer kennt keine `<f>`-Zellen) ·
      Gesamtzeile oben (ag-Grid `grandTotalRow: "top"`) · Beschriftung über leere Nachbarspalten (Colspan) · Live-Daten mit
      Millionen Zeilen: je `updateCells()` ein voller Durchlauf (inkrementelle Summen nur ohne Filter möglich) · ~~008:
      `ColumnDef.valueGetter` im Footer zuerst auflösen~~ (erledigt mit 008) · Review-Nits (Design § 5): Auswahl-Aggregate im Baum
      zählen sichtbare Zeilen, der Footer Blätter · `footerAggregates` + `bodyData` ohne `columnDefs` warnt nicht · eigener
      Aggregator mit Feld `aggregator` wird als Spec gelesen.
- [x] **006 Row Grouping** – Branch `feat/row-grouping`, Design `prompts/006-row-grouping.design.md`: DOM-freie Engine
      `groupRows()` / `aggregateRowGroups()` (`rowgroup/`, Grundlage für 007), `RowGroup`, `AreaModelRowGroups` (Unterklasse
      von `AreaModelTree`), `RowGroupFactory.createTableModel()`, `RowGroupColumnDef`, `api.setRowGroupBy()` /
      `getRowGroupBy()`, `AreaModelIf.invalidateDerivedValues?(change?)` mit `DerivedValuesChangeIf`, `isRowGroup`,
      `isGroupRow`, `isAreaModelRowGroups`, `isRowGroupColumnDef`; CSS `ge-table-row-group*`. Showcase `rowgrouping`,
      Training-Kapitel 36, `videos/07-row-grouping/`. Selbständig umgesetzt.
      Offen: Demo-Repo `ep-036` (nach dem Release, Freigabe), Angular-Demo-Route `rowgroup` erst nach dem Release (die App
      nutzt npm-Pakete), Bench auf dem Mac nachmessen.
- [ ] Folgepunkte 006: Gruppenleiste per Drag & Drop (baut auf `api.setRowGroupBy`) · Excel-Gliederung (Outline-Level)
      für Gruppenzeilen · Zeilennummern zählen Gruppenzeilen mit (004-Folgepunkt: evtl. nur Detailzeilen nummerieren) ·
      eine selbst ausgeblendete gruppierte Spalte erscheint nach dem Umgruppieren wieder (`row-group-layout.ts` merkt nur
      eigene Ausblendungen) · `setValue` mit geändertem Gruppierfeld außerhalb von `batch()` baut je Aufruf neu auf ·
      Gesamtzeile oben/Zwischensummen unten (ag-Grid `groupTotalRow`) · `AreaModelRowGroups` mit 1 Mio. Zeilen ~1,2 s im
      Container (eine `TreeRow` je Zeile; Engine 0,64 s) · Website-Showcases laden eine eigene CSS-Kopie
      (`src/styles/ge-table.css`) statt `@guiexpert/table/css/main.css` – neue Klassen dort jedes Mal nachtragen.
- [x] **007 Pivot-Tabellen** – Branch `feat/pivot`, Design `prompts/007-pivot.design.md`: DOM-freie Engine `pivotRows()` →
      `PivotResult` (`pivot/`, nutzt `groupRowsResolved` aus 006), `PivotFactory.createTableModel()` → `PivotTableModel`
      (Unterklasse von `TableModel`), `AreaModelPivot` (Unterklasse von `AreaModelTree`), `AreaModelPivotFooter`,
      `PivotColumnDef`, `api.setPivotConfig()` / `getPivotConfig()`, `AreaModelCellGroups.setGroups()`,
      `AreaModelIf.isRowHeaderCell?()`, `isPivotTableModel`, `isAreaModelPivot`, `isPivotColumnDef`; CSS `ge-table-pivot-*`.
      Showcase `pivot`, Training-Kapitel 37, `videos/08-pivot-ohne-enterprise/`. Selbständig umgesetzt.
      Offen: Demo-Repo `ep-037` (nach dem Release, Freigabe), Angular-Demo-Route `pivot` erst nach dem Release (die App
      nutzt npm-Pakete), Bench auf dem Mac nachmessen.
- [ ] Folgepunkte 007: Feldliste per Drag & Drop (baut auf `api.setPivotConfig`) · Zwischensummen-Zeilen unterhalb der
      Gruppen (ag-Grid `groupTotalRow: "bottom"`) · Filter auf fertige Pivot-Zeilen („nur Regionen > 200“) · ein
      Doppelklick auf eine Spaltengruppen-Zelle im Header („2026“) sortiert nach der ersten Spalte der Gruppe (Header-Gruppen
      allgemein: die Gruppenzelle trägt den Spaltenindex ihrer ersten Spalte) · eine zugeklappte Header-Gruppe zeigt ihren
      Pfeil in der unteren Header-Zeile (allgemeines Verhalten von `AreaModelCellGroups`: die zugeklappte Gruppe reicht über
      zwei Zeilen) · Header-Gruppenzellen werden doppelt gezeichnet (Span-Zeile, s. unten) – Playwright klickt den Pfeil nur
      mit `force` · `pivotRows` mit 1 Mio. Zeilen, 2 × 2 Ebenen, 2 Werten ~0,95 s im Container (Engine: zweimal
      `groupRows`, dann ein Durchlauf) · Spaltenschlüssel folgen dem Filter nicht (bewusst stabil; `setPivotConfig({})`
      baut sie aus allen Zeilen) · mit Filter kündigt `setPivotConfig` die Zeilenzahl erneut an und filtert zweimal (`firstInit()`).
- [x] **008 Berechnete Spalten, „Show values as“, Formeln** – Branch `feat/calculated`, Design
      `prompts/008-formeln-berechnete-spalten-show-values-as.design.md`: `ColumnDef.valueGetter` / `valueSetter` /
      `showValuesAs` / `formula` / `formulaOptions`, eine Auswertungsstelle (`calc/column-values.ts`, intern; Zyklen →
      `#CIRC!`, Aggregate gecacht), `ValueGetterContextIf`, `ShowValuesAs` (7 Modi, flach/Baum/Row Groups/Pivot),
      `calculateShowValuesAs`, `formatShowValuesAs`; Formel-Sprache `formula/` (Tokenizer, Pratt-Parser, AST → Closures,
      kein `eval`), `compileFormula`, `createFormulaValueGetter`, `FormulaError` (`#ERROR! #NAME? #VALUE! #DIV/0! #NUM!
      #CIRC!`), CSS `ge-table-cell-error`; `api.getRowValue`, `setShowValuesAs`, `getShowValuesAs`, `setColumnFormula`;
      `AreaModelPivot.getShownValue`, `PivotValueIf.showValuesAs`; Excel: `ExcelFormattedValueIf` + `numFmt` (Prozent).
      Showcase `formulas`, `why.astro`. Selbständig umgesetzt.
      Offen: Training (Abschnitt in `column-definitions` + Kapitel 38 `formulas`), Demo-Repo `ep-038`, Videos 29/30,
      Demo-Modell + `apps/table-demo`, Angular-Demo nach dem Release, Bench auf dem Mac nachmessen.
- [ ] Folgepunkte 008: Footer einer „Show values as“-Spalte zeigt Rohsummen (z. B. 100 % wäre schöner) · Pivot: laufende
      Summe/Rang/Differenz über Spalten (ag-Grid „Running total in“) · `valueGetter` für `AreaModelArrayOfArrays` (Spalten
      werden dort physisch verschoben) · Zellwerte berechneter Spalten werden nicht gecacht (Sortierung 1 Mio. Zeilen ~1,6 s
      im Container, Auswertung ~0,5 µs/Zeile) · Fehlerklasse `ge-table-cell-error` bleibt nach `updateCells` an einer
      wiederverwendeten Zelle, bis neu gezeichnet wird (`rerenderCellContent` entfernt keine Klassen) · Excel-Formeln
      (`<f>`) bewusst nicht · eigene Formel-Funktionen mit Lazy-Argumenten (heute nur `IF`/`IFERROR`/`AND`/`OR`).
- [ ] **009 Zeilen ziehen (Row Drag)** (`prompts/009-row-drag.md`).
- [ ] **010 Fill-Handle und Batch-Edit** (`prompts/010-fill-handle-batch-edit.md`); Undo/Redo und Einfügen aus der
      Zwischenablage als Folgeaufgaben.
- [ ] **011 Master/Detail** (`prompts/011-master-detail.md`); enthält „Performance, Teil 2“ (variable Zeilenhöhen) als
      Voraussetzung.
- [ ] **012 Rechts-nach-links-Sprachen (RTL)** (`prompts/012-rtl.md`), bewusst zuletzt.

## Mono-Repo / Build

- [ ] `pnpm --filter @guiexpert/preact-table build` meldet beim Typ-Build des Core-Quelltexts (lib < ES2019) zwei
      Fehler in `selection/selection-model.ts:387` (`flatMap`, implizites `any`) – nicht fatal (Build-Exit 0), aber
      Rauschen; `lib` der Preact-tsconfig anheben oder die Stelle ohne `flatMap` schreiben (gefunden bei 002).

- [ ] **Angular-Demo an lokale Builds koppeln**: `apps/angular-table-demo` nutzt noch npm
      (`@guiexpert/angular-table@^17.1.83`, `@guiexpert/table@^1.1.84`). Ziel: `workspace:`-Core +
      `link:../../angular-builds/ng17/dist` (oder Demo auf aktuelles Angular heben).
- [x] **Publish-Workflow**: ein Workflow `.github/workflows/npm-publish.yml` für alle 9 Pakete, npm Trusted Publishing
      (OIDC, kein Token), Release = Publish, manuell Dry-Run. Ablauf: `RELEASING.md`.
- [x] Versionen angeglichen (1.1.85); `version.mjs` setzt jetzt auch die Core-Peer-Dependency der Angular-Manifeste.
- [x] `@guiexpert/angular-table` sollte `@guiexpert/table` als `peerDependency` deklarieren (heute muss man es
      manuell mitinstallieren).
- [ ] Dependency-Hygiene: Babel-7-Pin (`@babel/core ~7.28.6` in 16 package.json) entfernen, sobald
      `vite-plugin-babel` Babel 8 unterstützt; Override `@jridgewell/sourcemap-codec ^1.6.0` entfernen, sobald
      `@angular/compiler-cli` die Range korrigiert.
- [ ] Alte `patch.js` je Paket löschen (ersetzt durch `scripts/version.mjs`).
- [ ] Alte Repos (`ge-table`, `angluar-14…17-table`, `angular-18…22-table`, `angular-table-demo`) auf GitHub
      archivieren und in deren README auf `guiexperttable/mono` verweisen.

## Packaging & Doku

- [x] `packages/table/package.json` → `exports` um `"./css/*": "./css/*"` ergänzen, damit
      `import "@guiexpert/table/css/main.css"` in Bundlern funktioniert.
- [x] CDN-Links auf der Website (`getstarted/*.md`, Demo-`index.html`) zeigen auf
      `cdn.jsdelivr.net/gh/guiexperttable/ge-table@main/libs/table/css/main.css` – den Ordner `libs/` gibt es nicht
      mehr. → `https://cdn.jsdelivr.net/npm/@guiexpert/table/css/main.css`.
- [x] Repository-Links (README der Pakete, `llms.txt`, Website, `package.json` → `repository`) von `ge-table` bzw.
      `angular-XX-table` auf `guiexperttable/mono` umstellen. `public/llms.txt` verlinkt
      `guiexperttable/angular-table` (existiert nicht).
- [x] Unit-Tests (Vitest) für Area-Modelle, Factories, SelectionModel einführen. → Vitest 5 in `packages/table`
      (Phase 0 + 1 von `TESTPLAN`, Okt. 2026): 74 Unit-Specs (Node, ~2 s) + 1 Browser-Spec (Chromium); dafür Vite
      6.3.4 → 6.4.4 in allen Paketen (Builds byte-identisch). Siehe CLAUDE.md §6.
- [x] Tests Phase 2: Browser-Tests für Rendering, Maus, Renderer, Editor, Spans/Header-Gruppen, Lebenszyklus, Theming,
      Baum, TableApi, CRUD (Branch `test/browser-rendering`, 10 Specs, 226 Tests) – Rendering-Abdeckung 43 → 96 %.
      Gefundene Fehler: Abschnitt „Gefunden durch die Browser-Tests“.
- [x] Tests Phase 3: wiederverwendbarer Workflow `.github/workflows/test-core.yml` (`test:types`, `docs:check`,
      `test:unit`, `test:browser` mit Chromium, Coverage-Artefakt) – aufgerufen von `ci.yml` (Push/PR) und von
      `npm-publish.yml` (Job `publish` hat `needs: test` → rote Tests = kein Release).
- [ ] GitHub → Settings → Branches → Regel für `main`: „Require status checks to pass“ mit
      `test-core / Test @guiexpert/table`, `test-wrappers / Test framework wrappers` und `build` (nur im GitHub-UI).
- [ ] Tests Phase 4 (Rest): Playwright-E2E gegen die Website-Showcases; Angular-Wrapper-Smoke-Test (ng22); weitere
      Browser (Firefox/WebKit) als `instances`.
- [ ] Später: Vite 7/8 (ändert das ausgelieferte Bundle; Vite 8 = Rolldown, `vite-plugin-babel` warnt) – erst mit
      ausreichend Browser-Tests. `ts-todo-demo` (Vite 6.2.6) und preact-/solid-Demo (Vite ^5) noch nicht angeglichen.

## Gefunden durch die Unit-Tests (Okt. 2026)

Jeder Punkt ist in einem Spec als `it.fails('<richtiges Verhalten>')` + `// BUG:` festgehalten: der Test ist grün,
solange der Fehler besteht, und wird rot, sobald er behoben ist → dann `it.fails` in `it` umwandeln.
Alle 42 vom unabhängigen Review bestätigt (2 davon „diskutabel“, markiert). Fragwürdiges, aber evtl. gewolltes
Verhalten steht als `// NOTE:` in den Specs.

**Hohe Wirkung (normale Bedienung im Browser):**
- [x] **Tastatur-Shortcuts komplett kaputt** (`action/shortcut.service.ts`): `findEntity` verglich das Event mit sich
      selbst → **jede** Taste löste `START_EDITING` aus (und wurde mit `preventDefault` geschluckt – auch Tab).
      Behoben: Vergleich mit `harmonizeShortcut(key)`; `harmonizeShortcut` versteht jetzt „arrowup“ **und** „up“
      (öffentliche Mappings bleiben gleich). Pfeil-Navigation (erstmals wirksam) bleibt am ersten/letzten Zeilen-/
      Spaltenrand stehen und scrollt die fokussierte Zeile ins Bild. Browser-Test `keyboard.browser.spec.ts`.
      Verhaltensänderung: Buchstaben öffnen den Editor nicht mehr – nur noch F2 (laut Mapping).
- [ ] Optional: Excel-artig „Enter“ bzw. Tippen startet das Editieren (heute nur F2). (Pfeile scrollen seit
      `fix/visibility-wrappers` auch horizontal: `ensureColumnIsVisible`.)
- [x] `onFocusChanged` feuerte bei Mausklick **zweimal** (`mouse-handler.ts`: `fm.clear()` vor `setFocus()`;
      `selection-service.ts`: zusätzlich `tableScope.onFocusChanged(fm)`). Jetzt einmal je echter Änderung
      (Branch `fix/selection`).
- [x] **Strg/⌘-Klick ergänzt die Selektion** (`selection-service.ts`): Klick = neue Selektion, Shift-Klick = Bereich ab
      letztem Klick, Strg/⌘-Klick = Zelle (bzw. Zeile/Spalte) **umschalten**, Strg/⌘+Alt-Klick = Zelle abwählen; jeder
      Klick ohne Shift ist Startpunkt für den nächsten Shift-Klick.
- [x] **Strg+A, Strg+C kopiert den ganzen (sichtbaren) Body** (`copy-service.ts`), gedeckelt durch
      `CopyService.maxCopyCells` (1.000.000; darüber Ablehnung + `console.warn`). `selectAll()` ist bei Typ `"none"`
      (Default-Modell) wirkungslos.
- [x] **Klicks wurden nicht gezeichnet** (`mouse-handler.ts`: Repaint auskommentiert) – Fokusrahmen/Selektion erst
      beim nächsten Scrollen. Jetzt verzögertes Repaint (~1 ms), aber nicht bei
      Klicks in `input`/`select`/`textarea`/`button`/Links/`contenteditable` einer Zelle (sonst verlieren Eingabefelder
      eigener Renderer Fokus und Text).
- [x] **Baum + Filter** (`area-model-tree.ts`, Branch `fix/tree-filter`): eine Pipeline – alle Zeilen (in Sortier-
      Reihenfolge) → sichtbar (alle Eltern aufgeklappt) → Filter – für Aufklappen, Zuklappen, Filter, Sortieren und
      „alle auf/zu“. Der Filter bleibt erhalten, findet auch Treffer unter zugeklappten Knoten (deren Vorfahren bleiben
      sichtbar, zugeklappt) und wirkt auf sortierten Bäumen. `doSort([])` ist ein No-op. „Alle auf/zu“ berechnet die
      Scrollhöhe neu (`repaintHard`).
- [x] Baum – behoben (Branch `fix/tree-2`): `api.reSort()` nutzte nur die von `autoRestoreOptions` gespeicherten
      Sortier-Items (sonst wirkungslos, für alle Tabellen) – jetzt die letzte `sort(fn)` bzw. die Spalten mit
      `sortState` · `api.sort(fn)` war auf Bäumen ein No-op – sortiert jetzt die Geschwister jeder Ebene (die Funktion
      bekommt die `TreeRow`s, wie der Filter) · das Filter-Prädikat lief bei jedem Auf-/Zuklappen über alle Knoten und
      bei aktiver Sortierung doppelt – jetzt nur bei `externalFilterChanged()` und `recalcVisibleTreeRows()` (neuer
      Parameter `refilter`, die Tabelle nutzt `false`); zugeklappte Teilbäume werden beim Aufbau der sichtbaren Zeilen
      gar nicht mehr durchlaufen · `getRowCount()` = Länge der Liste · `TreeCheckboxModel.checkAll()`/`checkRow()`
      O(n²) → linear, `isRowChecked()` ein Durchlauf · Eltern ohne angezeigte Kinder (gefiltert) zeigen keinen Pfeil
      (`AreaModelTree.hasDisplayedChildren()`) · Mehrspalten-Sortierung: erstes Item = Primärschlüssel (Baum und
      `AreaModelObjectArray`, s. „Mittel“) · `TableApi.expandAll()`, `collapseAll()`, `setRowExpanded(rowIndex, expanded)`
      (merkt den Zustand wie ein Klick; `TableScope.setTreeRowExpanded()`) · Header-Checkbox einer `CheckboxColumnDef`
      im Baum hakt den ganzen Baum an/ab · das „alle auf/zu“-Icon lag immer bei x = 16 der Header-Zeile – über der
      Header-Checkbox, bei fixierten Ost-Spalten in der Ost-Area, ohne horizontales Scrollen; jetzt im Header der
      Pfeil-Spalte.
- [x] **Abgewählte Zellen lassen sich wieder auswählen** (`selection-model.ts`): „letzte Operation je Zelle gewinnt“ –
      `addSelection`/`togglePoint`/`firstClick`/`toggleRow` heben negative Ranges für ihre Zellen auf (Rechteck-Differenz,
      auch unbegrenzte Zeilen/Spalten), `selectAll()` verwirft sie. `removeSelection` bei Typ `row`/`column` entfernt
      die ganze Spanne.
- [x] **`getMergedRowIndices(rowCount?)`** terminiert (ohne `rowCount` werden unbegrenzte Spalten-Selektionen
      übersprungen), sortiert, prüft alle Spalten der negativen Ranges.
- [x] Selektion – behoben (Branch `fix/selection-2`): Typ `"cell"` (und `"range"`): ein einfacher Klick selektiert die
      Zelle · Header-/Footer-Klicks ändern Selektion und Fokus nicht mehr · `onSelectionChanged` einmal je Klick
      (`TableScope.holdSelectionEvents()`; `addSelection()` feuerte selbst doppelt) · `setSelectionModel()` meldet die
      Tabelle am neuen Modell an (und am alten ab) · Strg/⌘+Ziehen fügt einen weiteren Bereich hinzu
      (`SelectionModel.createSnapshot()/restoreSnapshot()`) · ein Doppelklick erreicht `onMouseClicked` zweimal
      (clickCount 1 und 2) statt dreimal, die Selektion nur einmal (Strg: kein an/aus/an); ob zwei Klicks ein Doppelklick
      sind, entscheidet der Browser (`event.detail`, Doppelklick-Tempo des Betriebssystems) – zwei getrennte schnelle
      Klicks sind zwei Klicks (`doubleClickDelay` gilt nur noch für `element.click()`) · `hasSelection()` wird `false`,
      wenn alle Zellen abgewählt sind (vollständig abgewählte Bereiche fallen weg) · Strg+Alt rief `debugOnce()` →
      `console.clear()` (entfernt) · Zellenzählung im Beispiel von `SelectionModelIf` und in der Schulungs-Demo
      (für row/column ~9e15) → `getMergedRowIndices(rowCount)` · wiederholter Shift-Klick ändert das Rechteck vom selben
      Anker aus (vorher: zweiter Shift-Klick ohne Anker = neue Selektion).
- [ ] Selektion – offen: Klick-Repaint baut alle sichtbaren Zellen neu (Komponenten-Renderer werden neu gemountet) –
      besser nur Fokus-/Selektions-Overlay neu zeichnen (größerer Umbau in `RenderScope`).

**Mittel:**
- [x] Mehrspaltiges `doSort([a, b])`: das **letzte** Item war Primärschlüssel (JSDoc: „name desc, then age asc“) –
      jetzt das erste (Branch `fix/tree-2`).
- [ ] Variable Zeilenhöhen: `TableModel.getAreaHeight` (`table-model.ts:275`) ignoriert `getRowHeight()`, sobald
      `defaultRowHeights.body` gesetzt ist (Factory setzt immer 34) → falsche Scrollhöhe; `AbstractAreaModel.getYPosByRowIndex`
      (`abstract-area-model.ts:95`) ignoriert ein überschriebenes `getRowHeight()` → `scrollToIndex` daneben.
- [ ] `AreaModelArrayOfArrays` (`bodyData`-Tabellen): `setValue` schreibt bei aktivem Filter in die falsche Zeile
      (`:46`); `changeColumnOrder` verschiebt ausgefilterte Zeilen nicht mit (`:70`) – Spalten-Drag ist Standard.
- [ ] `ColumnDef`-Konstruktor überschreibt `minWidth`/`maxWidth` bei %-Breiten (`column-def.ts:62`).
- [ ] `createTableModel({headerData, bodyData})` ohne `columnSizes` → Spaltenbreiten −1 (`table-model.ts:512`).
- [ ] `CoverGridBodyModel`: Breite < 1 Cover → 0 Spalten → `getRowCount() = Infinity` (`:44`); leere Extrazeile bei
      voller letzter Zeile (`:40`, `floor+1` statt `ceil`).
- [ ] Header-Gruppen (`AreaModelCellGroups`, WIP): zugeklappte Gruppe überdeckt ihr „always“-Kind (`:130/168`).
- [ ] Excel-Export: `NaN`/`Infinity` als `<v>NaN</v>` → Excel meldet defekte Datei (`excel-service.ts:194`).

**Gering:**
- [ ] `setValue` auf verschachteltem Pfad mit fehlendem Elternobjekt überschreibt das Elternfeld
      (`abstract-area-model.ts:157`).
- [x] `setColumnWidth` aktualisierte die x-Positionen nicht → `GeMouseEvent.columnLeft` veraltet (Branch
      `fix/columns-scrolling`).
- [ ] `getColumnProperty` ohne ColumnDefs wirft statt `''` (`table-model.ts:457`). (`buildByTypedRows(rows, [])` wirft
      nicht mehr – nebenbei behoben mit 004, 1.1.93.)
- [x] `TreeFactory`: `deepMaxLimit` off-by-one behoben (Zeilen bis Tiefe n, vorher n + 1); `TreeCheckboxModel.checkAll()`
      endlose Rekursion behoben (Argument optional, Default: ganzer Baum; entfernt weiterhin die Häkchen).
- [ ] Excel: Autor nicht XML-escaped (`excel-service.ts:138`, „Smith & Co“ → defekte Datei).
- [ ] `CssVars` Blackboard-Theme: Tippfehler `otransparent` (`css-vars.ts:225`).
- [ ] `SchemeGenerator.renderTypeScriptInterfaces` liefert beim zweiten Aufruf `[]` (`scheme-generator-service.ts:83`).
- [ ] Header-Gruppen: `getYPosByRowIndex` ist ein Stub (0); diskutabel: Gruppe mit eigener `property` + Kindern,
      `CellGroupExt.getColumnIndex` (unfertig).
- [ ] Nicht exportiert: `SorterService`, `AbstractStoreStateService` (bewusst?).

## Gefunden durch die Browser-Tests (Okt. 2026)

Je ein `it.fails('<richtiges Verhalten>')` + `// BUG:` in den Browser-Specs (`packages/table/src/**/*.browser.spec.ts`).

**Spaltenbreiten, Scrollen, fixierte Spalten**
- [x] **Gespeicherte Sortierung traf nach einem Spalten-Drag die falsche Spalte** (`autoRestoreSortingState`, Fall S5 aus
      Prompt 003): gespeichert wurde der Spaltenindex. Behoben in 1.1.92 (Sortierung nach Property); Regressionstest in
      `lifecycle.browser.spec.ts` und `state/table-state.browser.spec.ts`.
- [x] Behoben (Branch `fix/columns-scrolling`): %-Spaltenbreiten wurden bis zum ersten ResizeObserver-Callback (~500 ms)
      für 400 px berechnet – `firstInit()` nimmt jetzt die Host-Breite · `recalcColumnWidths(clientWidth)` las den noch
      alten Scroll-Viewport (nach Host-Resize eine Runde hinterher) – jetzt Host-Breite minus West-Spalten und
      senkrechte Scrollleiste · per `setColumnWidth`/`autoResizeColumns`/Ziehen gesetzte Breiten gingen beim nächsten
      Host-Resize (auch beim ersten Callback nach dem Mounten) verloren – `setColumnWidth` speichert die Breite jetzt im
      ColumnDef (`width` = neue px-`Size`; eine %-Spalte wird damit zur px-Spalte) und berechnet die x-Positionen neu.
- [x] Behoben (Branch `fix/columns-scrolling`): Ost-Trennlinie prüfte `getFixedLeftColumnCount()` · Header/East-Area trug
      `data-area="body"` · `scrollToIndex(0, n)` war vertikal daneben (1 px in der unteren Tabellenhälfte, mit Footer
      ~17 px – Scrollleisten- und Inhaltsbereich sind verschieden groß): `scrollToPixel()` rechnet jetzt immer um und
      zeichnet die exakte Position (wie bisher nur bei gedeckelter Höhe) · Row-Div-Cache wurde nie geleert (jede je
      gerenderte Zeile blieb mit ihren Zellen referenziert) – jeder Render-Durchlauf vergisst nicht gezeichnete Zeilen.

**Maus**
- [x] Behoben (Branch `fix/mouse`): Footer-Klicks/-Hover kamen als Body-Events mit −1 an (der Scroll-Viewport liegt
      über dem Footer, seine waagerechte Scrollleiste muss bedienbar bleiben) – `TableScope.getMouseEventTarget()` sucht
      das Footer-Element unter dem Zeiger · Doppelklick-Sortierung: Event wurde nach dem Repaint erzeugt (`areaIdent`
      undefined) · Spalten-Drag: schneller Drag zeigte die falsche Spalte im Ghost, Ghost renderte **alle** Body-Zeilen
      (jetzt nur die sichtbaren, an ihrer Position), `'overfllow'` – Ghost nicht beschnitten · Hover über Header
      markierte Body-Zeile 0 · Hover-Spalte fixierter West-/Ost-Spalten nach horizontalem Scrollen verschoben · zweiter
      Klick auf dieselbe Checkbox (bzw. Baum-Pfeil, „alle auf/zu“, Header-Gruppe) < 500 ms wurde als Doppelklick
      verschluckt – Aktions-Klicks zählen jetzt nie als Doppelklick · Header-Checkbox von `CheckboxColumnDef` hakte nichts
      an – jetzt alle Body-Zeilen an/ab, zeigt „full“/„semi“/„none“ · `onCheckboxChanged` bekommt eine Kopie der Zeilen
      (vorher das interne Array, das sich mit dem nächsten Klick änderte) · „semi“-Markup ohne schließendes `</span>`.
- [ ] Footer: bei klassischen (nicht überlagerten) Scrollleisten, z. B. Windows, verdeckt die waagerechte Scrollleiste den
      unteren Teil des Footers, die senkrechte liegt unter der Ost-Area (`z-index: 999`). Layout ändern (Viewport ohne
      Footer/Ost-Area) – vorher in Windows/Linux-Browsern prüfen.

**Renderer & Editor**
- [x] `NumberCellRenderer` und `PositiveAndNegativeNumberRenderer` zeigen 0 als leere Zelle; fehlendes Anführungszeichen
      `data-row-index=${rowIndex}"` (`positive-and-negative-number-renderer.ts`) – behoben (Branch `fix/crud`).
- [x] Ungültiges Datum: `RangeError` brach den Render-Durchlauf ab, Tabelle blieb leer (`DateToIsoCellRenderer`,
      `DateToTecCellRenderer`). Jetzt zeigen alle Datums-Renderer einen ungültigen Wert unverändert an (Branch
      `fix/date-renderers`; `DateToLocaleDateCellRenderer` zeigte „Invalid Date“).
- [x] **HTML-Injection in Renderern** (Branch `fix/crud`): neue Hilfsfunktion `escapeHtml()` (exportiert); Werte werden
      escaped in `InputCellRenderer` (Editor: `"` schnitt den Text ab, leere Zelle zeigte „undefined“),
      `SelectCellRenderer` (Optionen), `NumberCellRenderer`, `PositiveAndNegativeNumberRenderer`,
      `DateToIntlDDMMYYYYCellRenderer`, `CellGroupExtCellRenderer` (Header-Gruppen-Label), `ActionsCellRenderer` (`data-id`).
      Die übrigen `innerHTML`-Renderer schreiben nur Zahlen/Konstanten.
- [x] Behoben (Branch `fix/editor-spans`): Editor – Escape bricht ab (alter Wert bleibt, kein `onModelChanged`, Fokus
      zurück an die Tabelle; ein umgebender `<dialog>` schließt nicht mit) · Span-Modell wurde nie neu aufgebaut
      (`setRows()` mit weniger Zeilen + `repaintHard()` → TypeError) – `repaintHard()` baut die Col-/Rowspan-Bereiche
      neu, wenn sich die Zeilenzahl geändert hat (`ColAndRowspanModel.initIfRowCountChanged()`); veraltete Bereiche
      werden übersprungen.
- [x] Baum-CSS: `.ge-table-tree-deep-5` doppelt, keine Regel für Tiefe 6 – jetzt 0 … 9 je 20 px (Branch
      `fix/date-renderers`).

**CRUD** (`crud/*`)
- [x] Behoben (Branch `fix/crud`): **HTML-Injection** – View/Edit escapen Titel, Namen und Werte · Edit liest typgerecht
      (Zahl bleibt Zahl, leeres Zahlfeld = `null`, Checkbox = `true`/`false`, leeres Feld zu `null`/`undefined` bleibt so),
      ein `<form>` mit `<fieldset>` je Unterobjekt (Felder nach einem Unterobjekt gingen verloren), tiefe Kopie (das
      Original blieb nicht unverändert), Schlüssel mit Punkt bleiben flach, `__proto__`/`constructor`/`prototype` werden
      ignoriert · View und Edit verschwinden auch nach Escape aus dem DOM · CREATE sendet die Eingaben (vorher das leere
      Objekt), CLONE und CREATE senden **ohne** id · die Tabelle zeigt das Ergebnis: EDIT aktualisiert die Zeile (Antwort
      des Servers, falls sie ein Objekt mit id ist, sonst die Eingaben), CREATE/CLONE hängen das neue Objekt an (bzw. laden
      die Liste neu, wenn die Antwort keins enthält) · Actions-Spalte und DELETE nutzen `getIdKey()` (vorher fest `id`) ·
      Fehler werden per `console.error` gemeldet statt unbehandelt, `console.info`-Ausgaben entfernt · `CrudOptions`:
      `getIdByObject` nutzt `getIdKey()`, `deleteItem` Default `DELETE` (vorher GET), fehlende URL → Promise rejected
      (vorher `fetch('')`), HTTP-Fehlerstatus → rejected (vorher wurde z. B. bei 500 die Zeile trotzdem gelöscht), leere
      Antwort (204) → `undefined` (vorher Parse-Fehler: DELETE mit 204 entfernte die Zeile nie), `{id}` URL-kodiert und
      jedes Vorkommen ersetzt, JSON-Body mit `Content-Type: application/json`.
- [ ] Leere Liste: es entsteht keine Tabelle und der Aufrufer erfährt nichts (Spalten kommen aus der ersten Zeile) –
      Spalten könnten aus `columnDefs` bzw. `getEmptyItem()` kommen, dann ginge auch „Create“ bei leerer Liste.
- [ ] Tabellen-Aktion `DELETE_SELECTED` (in `CrudOptions.tableActions`) wird von der Factory nicht behandelt.
- [ ] `{ ...new CrudOptions(), getIdKey: () => 'uuid' }`: das kopierte `getIdByObject` ruft noch das `getIdKey` der
      Original-Instanz (Arrow-Function) – die Factory selbst nutzt `getIdKey()` und ist nicht betroffen.

Weitere fragwürdige Stellen (als `// NOTE:` in den Specs): `setColumnWidth()` zeichnet nicht neu · voreingestellter `sortState` zeigt das Icon,
sortiert aber nicht · Spaltenziehen ignoriert min/max · Kontextmenü-Drossel 50 ms · `setRows/addRows/…` zeichnen nicht neu,
`setRows` verwirft Filter + Sortierung (Icon bleibt) · alle Span-Bereiche werden bei jedem Render gezeichnet ·
Header-Gruppen-Zellen doppelt gezeichnet · Rahmenklassen bei `horizontalBorderVisible: false` uneinheitlich · Zeile 0 jeder
Objekt-Tabelle hat `ge-focused-row`.

## Für die Release-Notes (nächstes Release) – Verhaltensänderungen

- **1.1.95 – berechnete Spalten (008)**, nur additiv: `ColumnDef` hat die neuen (leeren) Felder `valueGetter`,
  `valueSetter`, `showValuesAs`, `formula`; eine berechnete Spalte ist nie editierbar ohne `valueSetter` (auch nicht mit
  `editable: TrueFn`). `AreaModelObjectArray` und `AreaModelTree` implementieren jetzt `invalidateDerivedValues()` (leert
  nur eigene Caches) – nach `updateCells()` ohne `repaintAll` werden deshalb auch Footer-Zellen eines Objekt-Array-Footers
  neu gezeichnet. `AreaModelTree.getValueAt` liest über die neue geschützte Methode `getRawValueOfRow()` (Unterklassen,
  die `getValueAt` überschreiben, laufen unverändert). Excel ohne Zahlenformate: `styles.xml` unverändert.

- **Tastatur**: Shortcuts funktionieren (vorher löste jede Taste `START_EDITING` aus); Buchstaben öffnen den Editor
  nicht mehr (nur F2); Tab verlässt die Tabelle; Pfeile navigieren.
- **Maus/Selektion**: Strg/⌘-Klick schaltet Zellen/Zeilen um (Einzelmodus: Strg-Klick auf die selektierte Zeile wählt
  sie ab – Master/Detail-Ansichten prüfen), Strg/⌘+Alt-Klick wählt ab; Klicks werden sofort gezeichnet;
  `onFocusChanged` einmal je Änderung (vorher zweimal, auch ohne Änderung); `getMergedRowIndices(rowCount?)` sortiert.
- **Baum**: ein Filter bleibt beim Auf-/Zuklappen und Sortieren erhalten und findet Treffer unter zugeklappten Knoten
  (Vorfahren sichtbar); das Filter-Prädikat bekommt weiterhin die `TreeRow`, `index`/`array` beziehen sich jetzt auf alle
  Zeilen; `api.reSort()` wirft nicht mehr; „alle auf/zu“ aktualisiert die Scrollleiste; `deepMaxLimit: n` erzeugt keine
  Zeilen tiefer als n (vorher n + 1).
- **API**: `scrollToIndex(x, y)` scrollt horizontal zur Spalte (fixierte West-Spalte → x = 0, `-1` behält x);
  `setColumnVisible/setHeaderVisible/setFooterVisible` funktionieren (`setColumnVisible` liefert jetzt `boolean`);
  `isHeaderVisible()/isFooterVisible()` melden den echten Zustand; Selektion auf eigenem `AreaModel` wird gezeichnet
  (`isSelectable()` Default `true`).
- **Pakete**: `exports` mit Typen für `import`; relative `.d.ts`-Importe mit `.js` (node16/nodenext); `vue3-table` ist
  ESM (`"type": "module"`).
- **Wrapper**: Preact, Vue, Solid und Web Component bauen die Tabelle bei neuem `tableModel`/`tableOptions` neu auf
  (Inline-`tableOptions={…}` erzeugt sie bei jedem Render neu – Options einmal erzeugen); Vue: `tableOptions`-Default je
  Instanz; Preact: `mouseMoved` wird aufgerufen. Web Component: Events auf dem Element (`event.target`), `contextmenu`
  nicht bubbling, Entfernen = `destroy()`, Wieder-Einfügen = Neuaufbau mit erneutem `tableReady`, `tableReady` eines noch
  nicht eingehängten Elements erst beim Einhängen, `el.data = undefined` gibt die Tabelle frei.
- **Kopieren**: Strg+A, Strg+C kopiert den sichtbaren Body (max. `CopyService.maxCopyCells` = 1.000.000 Zellen);
  `selectAll()` bei Typ `"none"` ohne Wirkung.
- **HTML-Escaping**: CRUD-Dialoge und die Renderer `InputCellRenderer`, `SelectCellRenderer`, `NumberCellRenderer`,
  `PositiveAndNegativeNumberRenderer`, `DateToIntlDDMMYYYYCellRenderer`, `CellGroupExtCellRenderer` und
  `ActionsCellRenderer` (`data-id`) zeigen Daten als **Text** – wer bisher bewusst HTML in Header-Gruppen-Labels oder
  Select-Optionen geschrieben hat, braucht einen eigenen Renderer. Neue Hilfsfunktion `escapeHtml()` für eigene Renderer.
  `NumberCellRenderer`/`PositiveAndNegativeNumberRenderer` zeigen 0 an (vorher leer).
- **Spaltenbreiten**: `setColumnWidth()` (auch `autoResizeColumns()` und Ziehen) schreibt die Breite in den ColumnDef
  (`columnDef.width` = neue px-`Size`) – sie bleibt bei Host-Resize erhalten (vorher zurückgesetzt); %-Spalten passen
  ab dem ersten Zeichnen und nach jedem Host-Resize (vorher 400 px bis ~500 ms nach dem Mounten bzw. eine Runde
  hinterher) und lassen Platz für die senkrechte Scrollleiste. `scrollToIndex()` trifft die Zeile exakt (auch mit Footer).
  Ost-Trennlinie bei nur rechts fixierten Spalten.
- **Baum/Sortierung**: `api.reSort()` sortiert nach der aktuellen Sortierung (letzte `sort(fn)` bzw. Spalten-Icons),
  auch ohne `autoRestoreOptions`; `api.sort(fn)` sortiert Bäume (Funktion bekommt `TreeRow`s); `doSort([a, b])`: das
  **erste** Item ist der Primärschlüssel (vorher das letzte); neu `api.expandAll()`, `collapseAll()`, `setRowExpanded()`;
  der Baum-Filter läuft nicht mehr bei jedem Auf-/Zuklappen (der `index`-Parameter des Prädikats bezieht sich auf die
  Reihenfolge beim letzten `externalFilterChanged()`); Eltern ohne angezeigte Kinder zeigen keinen Pfeil.
- **Selektion**: ein Klick selektiert bei Typ `"cell"`/`"range"` die Zelle (vorher nichts); `onSelectionChanged` einmal je
  Klick (vorher bis zu dreimal), `addSelection()` feuert einmal (vorher zweimal), bei Typ `"none"` gar nicht;
  Header-/Footer-Klicks lassen Selektion und Fokus in Ruhe; Shift-Klicks ändern das Rechteck vom selben Anker aus;
  Strg/⌘+Ziehen = weiterer Bereich; `hasSelection()` ist nach dem Abwählen aller Zellen `false`; `setSelectionModel()`
  meldet Änderungen des neuen Modells; Strg+Alt leert nicht mehr die Browser-Konsole.
- **Doppelklick**: `onMouseClicked` kommt je Doppelklick zweimal (clickCount 1, dann 2 – das `dblclick` wird nicht mehr
  zusätzlich gemeldet); der Browser entscheidet, was ein Doppelklick ist (`event.detail`), zwei getrennte Klicks auf
  dieselbe Zelle sind zwei Einzelklicks (vorher < 500 ms = Doppelklick).
- **Editor**: Escape bricht das Editieren ab (vorher übernahm der nächste Blur den Text).
- **Maus**: Footer-Zellen melden Klick/Hover/Kontextmenü als Footer-Events (vorher Body mit −1); zwei schnelle Klicks
  auf eine Checkbox, einen Baum-Pfeil, „alle auf/zu“ oder eine Header-Gruppe schalten zweimal um (vorher wurde der
  zweite als Doppelklick verschluckt); die Header-Checkbox einer `CheckboxColumnDef` hakt alle Body-Zeilen an/ab;
  `onCheckboxChanged` bekommt eine Kopie des Arrays; ein Doppelklick, der sortiert, meldet `areaIdent` "header".
- **Spalten-Sichtbarkeit**: Pfeiltasten überspringen ausgeblendete Spalten und scrollen die fokussierte Spalte
  horizontal ins Bild (neu `api.ensureColumnIsVisible()`); Gewichts-Breiten verteilen sich auf die angezeigten Spalten;
  mit Header-Gruppen gilt: angezeigt nur, wenn weder `setColumnVisible(…, false)` noch eine zugeklappte Gruppe die
  Spalte ausblendet; `AreaModelCellGroups` schreibt nichts mehr in die Konsole (`console.table`).
- **Wrapper (2)**: Solid exportiert die Props-Typen direkt (`import type { GuiexpertTableProps }` – vorher ein
  Namespace-Objekt); das `scroll`-CustomEvent von Solid und Web Component bubbelt nicht mehr (Listener direkt auf dem
  Element registrieren); Solid: `contextmenu`-CustomEvent kommt an; Vue: `class`, `style` und andere Attribute am
  `<GuiexpertTable>` landen am Wurzel-Element (vorher verworfen).
- **Datums-Renderer**: ein ungültiges Datum wird unverändert angezeigt (vorher leerte es bei `DateToIsoCellRenderer`/
  `DateToTecCellRenderer` die ganze Tabelle, `DateToLocaleDateCellRenderer` zeigte „Invalid Date“). Baum: Einrückung
  bis Tiefe 9 (Tiefe 5 war wie Tiefe 6 eingerückt).
- **CRUD**: `deleteItem` sendet per Default `DELETE` (vorher GET); CLONE/CREATE senden das Objekt **ohne** id-Property;
  `updateItem`/`createItem` senden `Content-Type: application/json` (bei Cross-Origin-Servern ggf. CORS-Header erlauben);
  `{id}` in URLs wird URL-kodiert; die REST-Promises werden bei HTTP-Fehlerstatus und fehlender URL rejected, eine leere
  Antwort liefert `undefined`; `getIdByObject` liefert `o[getIdKey()]` (ohne die Property `undefined`, vorher das Objekt
  selbst); die Tabelle zeigt gespeicherte/neue Zeilen sofort; Actions-Spalte und DELETE nutzen `getIdKey()`; keine
  `console.info`-Ausgaben mehr. Edit-Dialog: Zahlen bleiben Zahlen, Booleans werden als `true`/`false` gespeichert.

- **Barrierefreiheit (1.1.91)**: die Tabelle ist ein WAI-ARIA-`grid` (Baum: `treegrid`) – neue Attribute an Host,
  Zeilen und Zellen (bestehende Klassen und `data-*` unverändert); neue Optionen `ariaLabel`, `ariaLabelledBy`,
  `ariaDescribedBy`, `ariaTexts`, neu `tableApi.announce()`/`getHeaderFocus()`, `DomServiceIf.removeAttribute?()`.
  Verhaltensänderungen: **Pos1/Ende/Bild↑/Bild↓/Enter** werden von der Tabelle verarbeitet (vorher scrollte z. B.
  Bild↓ die Seite; Enter nur, wenn es etwas auslöst); ↑ in der ersten Zeile führt in den Header; **Tab** in die Tabelle
  setzt den Fokus auf die erste sichtbare Zelle (`onFocusChanged`); der Scroll-Viewport ist kein eigener Tab-Stopp
  mehr (`tabindex="-1"`, vorher in Chrome ≥ 130 zweiter Tab-Stopp); teilweise markierte Checkbox = natives
  `indeterminate` statt blassem ✓; Span-Zellen liegen in einem eigenen Div `.ge-table-span-row`; Fokusrahmen 2 px
  (`ConvenienceDomService.focusBorderWidthInPx`); Light-Theme: Sterne `#a86f00`, Fortschrittsbalken `#1e874b`
  (Kontrast ≥ 3 : 1); Live-Region-Div in `document.body` (beim `firstInit()` angelegt, mit `destroy()` entfernt);
  Host-Fokusring `.ge-table:focus-visible` (2 px); während eine Header-Zelle den Fokus hat, ist der Body-Fokusrahmen
  ausgeblendet; Checkboxen und Action-Buttons/-Links in Zellen haben `tabindex="-1"` (kein Tab-Stopp je Zeile mehr –
  bedient per Maus bzw. Enter auf der Fokuszelle), Tasten auf einem fokussierten Button/Link gehören ihm;
  `MaleFemaleToIconCellRenderer` legt das Symbol in ein `span[role=img]`; `ConvenienceDomService.addDiv()` setzt
  `aria-hidden`; `destroy()` stellt vorherige ARIA-Attribute des Hosts wieder her.

- **Overlays (002, ab 1.1.92)**: Eine Tabelle mit leerem Body zeigt jetzt „No rows to show“ (bzw. „No matching rows“, wenn der
  Filter alle Zeilen ausblendet) – abschaltbar mit `overlayOptions: { autoNoRows: false }`. Neues Div
  `.ge-table-overlay` im Host (`aria-hidden`, z-index 10000); Host bekommt beim Laden `aria-busy="true"`.
  `CrudTableModelFactory` zeigt während Anfragen „Loading…“ und blockiert dabei Maus und Editieren.
- **Zustand speichern (003, ab 1.1.92)**: `autoRestoreOptions` speichern in **einem** Schlüssel `<key>tableState` (JSON wie
  `api.getState()`); die drei alten Schlüssel werden einmal gelesen und beim nächsten Speichern entfernt (ein Downgrade
  verliert den Zustand). Sortierung wird nach **Property** gespeichert – vorher nach Index, nach einem Spalten-Drag wurde
  die falsche Spalte sortiert. `autoRestoreCheckedState` und `autoRestoreSelectedState` wirken jetzt (vorher ohne
  Wirkung). Neue Flags `autoRestoreColumnLayout`, `autoRestoreHeaderGroupState`, `autoRestoreCustomState`. Gespeichert wird
  300 ms nach der letzten Änderung (`stateChangedDebounceDelay`), auch der Scroll-Zustand (vorher 500 ms). Ein
  `autoRestore…`-Flag ohne `getStorageKeyFn` erzeugt eine `console.warn`. Neu: `onStateChanged` im `EventListenerIf`
  bzw. `stateChanged` in allen Wrappern. `isSame` ist `@deprecated` (wurde nie benutzt). Zeilen ohne `id`/`uuid` und
  ohne eigene `getRowId` werden nicht mehr gespeichert (vorher diente das JSON der ganzen Zeile als Id – auch für
  aufgeklappte Baumknoten; deren gespeicherter Zustand geht dann einmal verloren).
- **Zeilennummern (004, ab 1.1.93)**: neu `rowNumbersVisible` / `RowNumberColumnDef`, `api.getColumnIndex()`. Ohne
  Nummernspalte keine Verhaltensänderung. Mit Nummernspalte an Index 0 sitzen `CheckboxColumnDef`, Baumpfeil und
  `showCheckboxWihoutExtraColumn` an Index 1 (vorher fest an 0). `TableFactory.buildByTypedRows(rows, [])` wirft nicht
  mehr. `RenderScope.getTreeArrowColumnIndex()` liefert `number` statt `0 | 1` (protected).
- **Pivot (007, ab 1.1.94)**: neu `PivotFactory`, `PivotTableModel`, `AreaModelPivot`, `AreaModelPivotFooter`, `pivotRows()`,
  `api.setPivotConfig()`/`getPivotConfig()`. Ohne Pivot keine Verhaltensänderung, außer: `AreaModelCellGroups.groups` ist nicht
  mehr `readonly` (neu `setGroups()`); neues optionales `AreaModelIf.isRowHeaderCell?()`; Zeilen-Divs eines Bereichs, deren
  Zellen alle von einem Span darüber verdeckt sind (z. B. zweite Header-Zeile einer fixierten Spalte unter Header-Gruppen),
  bekommen `role="presentation"` statt `row` (vorher axe-Fehler „aria-required-children“).
- **Row Grouping (006, ab 1.1.94)**: neu `RowGroupFactory`, `AreaModelRowGroups`, `groupRows()`/`aggregateRowGroups()`,
  `api.setRowGroupBy()`/`getRowGroupBy()`. Ohne Gruppierung keine Verhaltensänderung, außer: `AreaModelIf.invalidateDerivedValues?()`
  bekommt nach Edit und `updateCells()` ein optionales Argument `{ area, rowIndices }` (eigene Modelle dürfen es ignorieren);
  ändert ein Edit die Zeilenzahl des Bodys, zeichnet die Tabelle hart neu (vorher nur `repaint()` – falsche Scrollhöhe).
  Neues Script `pnpm --filter @guiexpert/table bench` (Messungen außerhalb von `src/`).
- **Aggregation (005, ab 1.1.94)**: neu `footerAggregates`, `AreaModelAggregateFooter`, `aggregate()`/`aggregateColumns()`,
  `api.getSelectionAggregates()`. Ohne Aggregat-Footer keine Verhaltensänderung. `api.repaint()`/`repaintHard()` rufen
  zusätzlich `invalidateDerivedValues?()` der drei Area-Modelle (neues optionales Member von `AreaModelIf`); `updateCells()` ohne
  `repaintAll` zeichnet dann auch die Footer-Zellen neu. Mit `footerAggregates` wird `footerData` ignoriert (Warnung).

## Gefunden beim Aufbau der Schulung und der API-Doc (Okt. 2026)

- [x] Schulung `/training/` (34 Kapitel, 26 Live-Demos) + API-Doc überarbeitet (Kategorien, typedoc.json, `docs:check`:
      243 `@example`-Blöcke kompilieren; vorher u. a. erfundene Methoden wie `selectCell`, `getScrollLeft`,
      `tableComponent.api`, `initializeTable()` in den Beispielen). Siehe CLAUDE.md §6 und §11.
- [x] `TableApi.downloadExcel()` hat jetzt den Rückgabetyp `Promise<void>` (vorher `void | Promise<void>` durch `ExcelServiceIf`).
- [x] `CreateTableModelPara` ist jetzt ein `interface` (vorher `type`) – jedes Feld dokumentiert und in typedoc verlinkbar.
- [x] `ExcelServiceIf` wird exportiert (Typ des letzten `TableScope`-Arguments).
- [x] Website: `/showcase/idfilter/` zeigte die Excel-Demo statt des Slider-Filters; Tab-Links der Platzhalter-Showcases
      zeigten auf `/showcase/simple/…`; `.md`-Links der Seiten `/api/docs/interfaces/*` führten ins Leere.
- [ ] Platzhalter-Showcases `sorting1`, `inputfilter`, `sliderfilter`, `renderer1`, `rowspan`, `nobel` mit echtem Inhalt
      füllen oder entfernen (zeigen „Simple demo“ / „Dies ist ein Test“).
- [ ] `TableApi.setRows/addRows/addRowsAt/removeRows` zeichnen nicht neu und setzen Filter + Sortierung zurück –
      Anwender müssen `externalFilterChanged()` + `repaintHard()` selbst aufrufen (jetzt dokumentiert). Automatisch machen?
- [ ] `ColumnDef.minWidth/maxWidth` wirken nur bei %-Breiten, nicht beim Ziehen mit der Maus. Begrenzen? (Die Folge 013 der
      Videoreihe zeigt `minWidth: px80, maxWidth: px200` an einer px-Spalte – ohne Wirkung.)
- [ ] Ohne `getSelectionModel` ist nichts auswählbar (eigenes `SelectionModel()` vom Typ `"none"`). Bewusst so?
- [ ] `TableOptions.headerToggleExpandCollapseIcons` wird nirgends ausgewertet.
- [ ] `ColumnDef`-Felder erben die Doku von `ColumnDefIf` nicht (typedoc) – ggf. `@inheritDoc`.
- [ ] Demo-Repo `krocon/guiexpert-table-step-by-step-demo`: Tags `ep-001` … `ep-034` pushen (die Schulung verlinkt sie).
      Neu: `ep-035` (Kapitel 35 „Accessibility“) nach dem Release 1.1.91 anlegen – Code-Vorlage
      `apps/webpage-guiexpert/src/training/demos/accessibility.ts`.

## Gefunden beim Bau der Startseite (Okt. 2026)

- [x] `TableApi.scrollToIndex(indexX, indexY)` scrollt jetzt zur Spalte (erste Spalte des scrollbaren Mittelteils,
      im Rahmen des Scrollbereichs); fixierte West-Spalte = zurück an den Anfang (x = 0, wie bisher), fixierte Ost-Spalte
      und `-1` = horizontale Position behalten. `ensureRowIsVisible` (und damit die Pfeiltasten) behält x.
- [x] `scrollToIndex` vertikal leicht daneben (mit Footer ~17 px) – behoben (Branch `fix/columns-scrolling`).
- [x] Zellen eines eigenen `AreaModel` sind auswählbar: `AreaModel.isSelectable()` Default `true` (wie
      `AbstractAreaModel` und die Doku); Opt-out: überschreiben und `false` liefern.
- [x] Typen bei `skipLibCheck: false` (TS7016 in `vue3-table`): `exports` aller Pakete mit
      `"import": { "types": "./index.d.ts", "default": "./index.js" }, "require": "./index.cjs"`; `vue3-table` ist jetzt
      `"type": "module"` (Node-`import()` ging vorher gar nicht); relative Importe in den `.d.ts` bekommen `.js`
      (`scripts/fix-dts-imports.mjs` im `afterBuild` von vite-plugin-dts) – nötig für `moduleResolution` node16/nodenext.
      Geprüft mit gepackten Tarballs: bundler 0 Fehler, node16-ESM 0 (bis auf svelte-table), node16-CJS wie vorher TS7016.
- [ ] Typen – offen: CJS-Konsumenten mit `moduleResolution: node16` bekommen weiterhin TS7016 (keine `.d.cts`) ·
      svelte-table: `.d.ts` importiert `./GuiexpertTable.svelte` (Svelte-Konvention; unter node16 TS2307).

## Erledigt beim Aufsetzen (Okt. 2026)

- [x] Ein gemeinsamer Angular-Quellcode für Angular 14–22 (`packages/angular-table` + `angular-builds/ngNN`);
      alle 9 Builds getestet.
- [x] `table.component.css` wird aus dem Core-CSS generiert (vorher veraltete Kopie ohne CRUD-Dialog-Styles).
- [x] Angular: interner Import `rxjs/internal/Observable` → `rxjs`.
- [x] Dist-Tags für Angular-Publish korrigiert (früher `--tag latest` für jede Major).
- [x] Ein Versions-Skript statt `patch.js` je Paket + `package.js`.
