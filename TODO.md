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
- [ ] **React-Wrapper**: `initialized` als lokale Variable statt `useRef`, kein Cleanup im `useEffect`,
      Änderungen an `tableModel`/`tableOptions` werden ignoriert. `onScroll` wird nicht weitergereicht.
- [ ] **Angular-Wrapper** (`packages/angular-table/src`): reagiert nicht auf `ngOnChanges` (neues `tableModel` wird
      ignoriert). Jetzt nur noch an einer Stelle zu ändern → `pnpm build:angular`.

- [x] **Alle Wrapper + demo-table-models bündelten eine komplette Kopie des Cores** (~210 KB je Paket, obwohl
      `@guiexpert/table` Abhängigkeit ist) → Core + Framework im Vite-Build extern (React 215 KB → 2 KB).
      Solid bündelte zusätzlich die Solid-Laufzeit, Svelte die Svelte-Laufzeit (veröffentlichtes svelte-table
      bricht deshalb selbst unter Svelte 4 mit „Function called outside component initialization“ ab).
- [x] React/Preact `ComponentRendererWrapper` riefen die Komponente als Funktion auf (Hooks kaputt); Preact nutzte
      `react-dom/client` (über compat mitgebündelt); Solid räumte Zell-Roots nie auf (Speicherleck).
- [ ] **Svelte 5**: veröffentlichtes und neues svelte-table laufen nicht unter Svelte 5 (`lifecycle_outside_component`
      bzw. `svelte/internal` existiert nicht mehr). Peer-Range daher auf `^4.0.0` gesetzt. Eigener Build mit
      Svelte-5-Compiler (Runes) nötig.
- [ ] `vue3-table`: unnötige Laufzeit-Abhängigkeiten `vue-i18n`/`vue-router` entfernt – beim Release erwähnen.

## Core

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
- [ ] Unit-Tests (Vitest) für Area-Modelle, Factories, SelectionModel einführen.

## Erledigt beim Aufsetzen (Okt. 2026)

- [x] Ein gemeinsamer Angular-Quellcode für Angular 14–22 (`packages/angular-table` + `angular-builds/ngNN`);
      alle 9 Builds getestet.
- [x] `table.component.css` wird aus dem Core-CSS generiert (vorher veraltete Kopie ohne CRUD-Dialog-Styles).
- [x] Angular: interner Import `rxjs/internal/Observable` → `rxjs`.
- [x] Dist-Tags für Angular-Publish korrigiert (früher `--tag latest` für jede Major).
- [x] Ein Versions-Skript statt `patch.js` je Paket + `package.js`.
