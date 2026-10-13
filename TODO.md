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
- [ ] **Preact-, Vue-, Solid-, Web-Component-Wrapper**: übernehmen ein neues `tableModel` ebenfalls noch nicht
      (Init nur beim Mounten). Jetzt einfach: alte Tabelle mit `TableScope.destroy()` freigeben, neu erzeugen –
      Vorlage React (`useEffect`) bzw. Svelte (`$:`).

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
- [ ] Footer-Summen über gefilterte Zeilen: geht heute mit eigenem Footer-AreaModel + `getFilteredRows()`
      (instructions.md 5.4). Optional später eine fertige Klasse (z. B. `AreaModelAggregateFooter`).

- [ ] `TableApi.setColumnVisible()`, `isColumnVisible()`, `setHeaderVisible()`, `isHeaderVisible()`,
      `setFooterVisible()`, `isFooterVisible()` sind leere TODO-Stubs → implementieren
      (Spalte: über `ColumnDef.isVisible` bzw. Breite 0 + `recalcColumnWidths`).
- [x] Performance: `RenderScope.adjustArea` iterierte ab Zeile 0 bis zur ersten sichtbaren Zeile (O(n) pro
      Scroll-Frame). Branch `perf/constant-row-height`: `getConstantRowHeight()` → Startindex direkt berechnet
      (2 Mio. Zeilen, Tabellenende: 28,7 → 14,6 ms; Ausgabe an 265 Positionen identisch, Messung s. Commit).
- [ ] Performance, Teil 2: variable Zeilenhöhen weiterhin O(n) → Prefix-Summen + Binärsuche (Invalidierung bei
      Filter/Sortierung/Baum-Toggle beachten).
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

## Mono-Repo / Build

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
- [ ] Tests Phase 2: Browser-Tests für `RenderScope`/`TableScope`/`TableApi`, Renderer, Maus/Tastatur, CRUD-Dialoge
      (heute ~38 % Zeilenabdeckung im Rendering-Teil, DOM-freie Teile 92–100 %).
- [x] Tests Phase 3: wiederverwendbarer Workflow `.github/workflows/test-core.yml` (`test:types`, `docs:check`,
      `test:unit`, `test:browser` mit Chromium, Coverage-Artefakt) – aufgerufen von `ci.yml` (Push/PR) und von
      `npm-publish.yml` (Job `publish` hat `needs: test` → rote Tests = kein Release).
- [ ] GitHub → Settings → Branches → Regel für `main`: „Require status checks to pass“ mit
      `test-core / Test @guiexpert/table` und `build` (nur im GitHub-UI möglich).
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
- [ ] Optional: Excel-artig „Enter“ bzw. Tippen startet das Editieren (heute nur F2). Pfeile springen nicht in fixierte
      Spalten-Bereiche horizontal ins Bild (`ensureRowIsVisible` scrollt nur vertikal).
- [ ] `onFocusChanged` feuert bei Mausklick **zweimal** (`selection-service.ts:79`: `fm.setFocus` feuert schon über den
      Focus-Listener von `TableScope`, danach noch `tableScope.onFocusChanged(fm)`).
- [ ] **Strg/⌘-Klick ergänzt die Selektion nicht** (`selection/selection-service.ts:85`): jeder Klick ohne Shift
      leert vorher die Selektion; Strg+Alt-Klick („Zelle abwählen“) arbeitet dadurch immer auf leerer Selektion.
- [ ] **Strg+A, Strg+C kopiert nur eine Zelle** (`service/copy-service.ts:31`): `selectAll()` setzt nur ein Flag,
      keine Range.
- [ ] **Baum + Filter** (`data/tablemodel/areamodel/area-model-tree.ts`): Aufklappen/Zuklappen
      (`recalcVisibleTreeRows`, `:50`) verwirft den Filter; ein Filter nach dem Aufklappen findet die neuen Zeilen nicht
      (`flattenRows` veraltet); `doSort` (`:131`) verwirft den Filter – und weil `externalFilterChanged` danach neu
      sortiert, wirkt ein Filter auf einem sortierten Baum gar nicht. `doSort([])` (`:124`) wirft einen TypeError
      (erreichbar über `api.reSort()`).
- [ ] **Abgewählte Zellen lassen sich nie wieder auswählen** (`selection/selection-model.ts:179/202`): negative Ranges
      werden nur von `clear()` entfernt → `togglePoint` (Leertaste), `addSelection` nach `removeSelection`,
      `MultiRowsSelectionModel.toggleRow`, `selectAll()` betroffen. `removeSelection` einer mehrzeiligen Range bei Typ
      `row` entfernt nur die erste Zeile.
- [ ] **`getMergedRowIndices()` hängt** bei Selektionstyp `column` (Schleife bis `MAX_SAFE_INTEGER`,
      `selection-model.ts:146`) – nicht als Test möglich. Außerdem unsortiert (Doku: „sorted“) und prüft negative
      Ranges nur in Spalte 0.

**Mittel:**
- [ ] Mehrspaltiges `doSort([a, b])` (`area-model-object-array.ts:533`): das **letzte** Item wird Primärschlüssel
      (JSDoc: „name desc, then age asc“).
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
- [ ] `setColumnWidth` aktualisiert die x-Positionen nicht (`table-model.ts:119`) → `GeMouseEvent.columnLeft` veraltet.
- [ ] `getColumnProperty` ohne ColumnDefs wirft statt `''` (`table-model.ts:457`); `buildByTypedRows(rows, [])` wirft
      (`table-factory.ts:371`).
- [ ] `TreeFactory`: `deepMaxLimit` off-by-one (`tree-factory.ts:98`); `TreeCheckboxModel.checkAll()` endlose Rekursion
      (`tree-checkbox-model.ts:29`).
- [ ] Excel: Autor nicht XML-escaped (`excel-service.ts:138`, „Smith & Co“ → defekte Datei).
- [ ] `CssVars` Blackboard-Theme: Tippfehler `otransparent` (`css-vars.ts:225`).
- [ ] `SchemeGenerator.renderTypeScriptInterfaces` liefert beim zweiten Aufruf `[]` (`scheme-generator-service.ts:83`).
- [ ] Header-Gruppen: `getYPosByRowIndex` ist ein Stub (0); diskutabel: Gruppe mit eigener `property` + Kindern,
      `CellGroupExt.getColumnIndex` (unfertig).
- [ ] Nicht exportiert: `SorterService`, `AbstractStoreStateService` (bewusst?).

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

## Gefunden beim Bau der Startseite (Okt. 2026)

- [ ] `TableApi.scrollToIndex(indexX, indexY)` ignoriert `indexX`: `TableScope.scrollToIndex` ruft immer
      `scrollToPixel(0, py)` auf (`// TODO calc indexX -> px`) und setzt die horizontale Position damit auf 0 zurück.
      Die API-Doku verspricht eine Spalte (`@param indexX`, Beispiel `scrollToIndex(3, 10)`). Behelf auf der Startseite:
      `scrollToPixel(x, getFirstVisibleRowIndex() * rowHeight)`. → x aus den Spaltenbreiten berechnen (fixierte Spalten
      in west/east brauchen keinen horizontalen Scroll).
- [ ] Zellen eines eigenen `AreaModel` sind nicht auswählbar: `AreaModel.isSelectable()` gibt `false` zurück
      (`AbstractAreaModel` und damit alle Factory-Modelle: `true`). Mit `SelectionModel("range")` ist beim Ziehen nichts zu
      sehen, obwohl `getSelectionModel().getRanges()` den Bereich enthält. Die Doku von `AreaModelIf.isSelectable` sagt
      dagegen „All cells are selectable by default“. → Default `true` für den Body? Sonst in Kapitel 17 und 22 erwähnen.
- [ ] Typen bei `skipLibCheck: false`: `vue-tsc` meldet in `@guiexpert/vue3-table@3.1.90` TS7016 („Could not find a
      declaration file for module '@guiexpert/table' … index.cjs implicitly has an 'any' type“). Ursache: die `exports` von
      `@guiexpert/table` haben keine `types`-Bedingung, und `vue3-table` ist `"type": "commonjs"` → seine `.d.ts` lösen
      über `require` auf `index.cjs` auf, für die es keine Typen gibt. Mit `skipLibCheck: true` (Vite-Vorlagen) unsichtbar.
      → in allen Paketen `"exports": { ".": { "types": "./index.d.ts", "import": …, "require": … } }`; Wrapper als ESM.

## Erledigt beim Aufsetzen (Okt. 2026)

- [x] Ein gemeinsamer Angular-Quellcode für Angular 14–22 (`packages/angular-table` + `angular-builds/ngNN`);
      alle 9 Builds getestet.
- [x] `table.component.css` wird aus dem Core-CSS generiert (vorher veraltete Kopie ohne CRUD-Dialog-Styles).
- [x] Angular: interner Import `rxjs/internal/Observable` → `rxjs`.
- [x] Dist-Tags für Angular-Publish korrigiert (früher `--tag latest` für jede Major).
- [x] Ein Versions-Skript statt `patch.js` je Paket + `package.js`.
