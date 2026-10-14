# TODO-Prompt 006: Row Grouping – API, Vitest, Code, Doku, Website, Training, Demo-Repo, Video

> Status: **offen** · angelegt 14.10.2026 · Ziel 1 (Code) **und** Ziel 2 (Content) aus CLAUDE.md
> Slug `row-grouping` (Branch `feat/row-grouping`, Design `prompts/006-row-grouping.design.md`) · Verweis in `TODO.md` →
> Abschnitt „Feature-Prompts“. Gemeinsame Regeln: `prompts/000-arbeitsweise.md` (gilt bei Widersprüchen).
>
> **Voraussetzung: 005 (Aggregation)** (`prompts/005-aggregation-gesamtzeile.md`). 005 liefert die Aggregatoren
> (`src/lib/table/aggregation/`), die Gesamtzeile und die Fixture `test-utils/grouping-fixtures.ts`. Dieser Prompt
> baut darauf die Gruppier-Engine. Ist 005 nicht umgesetzt: anhalten und fragen.
>
> **Reihenfolge: nach 005, vor 007 (Pivot).** Row Grouping baut die Gruppier-Engine, auf der Pivot später aufsetzt.
> Bei ag-Grid ist das genauso: Pivot gibt es dort nur zusammen mit Row Grouping.
>
> Diesen Prompt in einer neuen Sitzung im Mono-Repo (`guiexperttable/mono`) ausführen. Er ist eigenständig und setzt kein
> Wissen aus früheren Chats voraus. Die Arbeit reicht über mehrere Sitzungen: Erledigtes in der **Definition of Done**
> am Ende abhaken, damit die nächste Sitzung dort weitermacht.

---

## Auftrag

Flache Daten nach einer oder mehreren Spalten gruppieren. Jede Gruppe bekommt eine auf- und zuklappbare Gruppenzeile
mit aggregierten Werten je Spalte (Summe, Anzahl, Mittelwert …), darunter stehen die Original-Zeilen. Die Spalten
bleiben, anders als bei Pivot, die Spalten der Daten. Ausgangspunkt (die endgültige Signatur legt Phase 1 fest):

```ts
const model: TableModelIf = RowGroupFactory.create({
  rows, columnDefs, groupBy: ['region', 'produkt'], aggregations: { umsatz: 'sum' }
});
```

| Phase | Ergebnis | Haltepunkt |
|---|---|---|
| 1 | API-Entwurf `prompts/006-row-grouping.design.md` (Bausteine, Signaturen, Entscheidungen, Beispiele), inkl. Engine für Pivot | 🛑 Freigabe abwarten |
| 2 | Vitest-Specs (Unit, Browser, Wrapper, Typen) – zuerst rot | |
| 3 | Implementierung im Core – Specs grün | |
| 4 | Doku: JSDoc/API-Doc, `instructions.md`, READMEs, `llms.txt`, `CLAUDE.md`, `TODO.md` | |
| 5 | Demo-Modelle und Demo-Apps | |
| 6 | Website gui.expert (`apps/webpage-guiexpert`): Showcase, Features, Vergleichsaussagen | 🛑 kein Deploy |
| 7 | Training-Kapitel auf gui.expert/training | |
| 8 | Demo-Repo (neue Folge bzw. neues Repo) | 🛑 Freigabe vor Anlegen/Push/Tag |
| 9 | Video-Folge unter `videos/` | |
| 10 | Abschlussprüfung | |

### Arbeitsweise

- Zuerst **`CLAUDE.md`** vollständig lesen (Konventionen §5, Tests §6, Lizenz §8, Sicherheit §9, Videos §10,
  Training §11), dazu `TODO.md`, `instructions.md` §5, **`prompts/005-aggregation-gesamtzeile.md`** (und dessen
  Design-Dokument) und **`prompts/007-pivot.md`**. Die Engine muss beide Features tragen.
- Auf Branch **`feat/row-grouping`** (von `main`) arbeiten. Commits nur nach Rückfrage. **Kein** Push, `npm publish`,
  GitHub-Release, Website-Deploy (`deploy.cjs`) und kein Versionssprung ohne ausdrückliche Anweisung.
- Zielversion für `since`-Angaben und Release-Notes: die Version des Releases, mit dem das Feature erscheint
  (s. `000-arbeitsweise.md`; in `packages/table/package.json` nachsehen). Nur eintragen, nicht hochzählen.
- Eine Taskliste mit einem Eintrag pro Phase führen.
- Nach Phase 1 anhalten und den Entwurf vorlegen, inklusive der Entscheidungen zu Phase 7 (Kapitel-Platzierung)
  und Phase 8 (Demo-Repo).

---

## Hintergrund

### Baumtabelle, Row Grouping und Pivot im Vergleich

| | Baumtabelle (gibt es) | **Row Grouping (neu)** | Pivot (danach, 007) |
|---|---|---|---|
| Eingabe | verschachtelte Daten (`children`) | flache Daten | flache Daten |
| Hierarchie | steckt in den Daten | aus Gruppierfeldern berechnet | aus Zeilenfeldern berechnet |
| Detailzeilen | ja | ja (die Original-Zeilen) | nein |
| Spalten | fest | fest (+ evtl. Gruppenspalte) | aus Datenwerten erzeugt |
| Aggregation | selbst bauen | je Spalte, in jeder Gruppenzeile | in jeder Zelle |

**Was es schon gibt:** `AreaModelTree` kann Hierarchien auf- und zuklappen, je Ebene sortieren, filtern (Vorfahren von
Treffern bleiben sichtbar) und den Zustand merken. **Was fehlt:** Gruppen aus flachen Daten bilden, Aggregate in
Gruppenzeilen, Neuberechnung bei Filter und Editierung, Umgruppieren zur Laufzeit.

**Markt:** Bei ag-Grid ist Row Grouping ein **Enterprise-Feature** (`RowGroupingModule` und `RowGroupingPanelModule`
aus `ag-grid-enterprise`, Stand Okt. 2026; vor Marketing-Aussagen auf ag-grid.com erneut prüfen). Die eigene Website
sagt heute noch „Row grouping … – tree tables instead“ (s. Phase 6).

### Referenzdaten (gemeinsame Testfixture mit Pivot)

```ts
const rows = [
  { region: 'Nord', produkt: 'A', monat: 'Jan', umsatz: 100 },
  { region: 'Nord', produkt: 'B', monat: 'Jan', umsatz: 50 },
  { region: 'Süd',  produkt: 'A', monat: 'Jan', umsatz: 80 },
  { region: 'Nord', produkt: 'A', monat: 'Feb', umsatz: 120 },
  { region: 'Süd',  produkt: 'B', monat: 'Feb', umsatz: 70 },
  { region: 'Süd',  produkt: 'A', monat: 'Feb', umsatz: 30 },
];
```

**Fall R1:** `groupBy: ['region']`, `umsatz: 'sum'` (Detailzeilen in Eingabe-Reihenfolge)

| Gruppe | produkt | monat | umsatz |
|---|---|---|---|
| ▾ Nord (3) | | | **270** |
| | A | Jan | 100 |
| | B | Jan | 50 |
| | A | Feb | 120 |
| ▾ Süd (3) | | | **180** |
| | A | Jan | 80 |
| | B | Feb | 70 |
| | A | Feb | 30 |
| **Gesamt** (Footer) | | | **450** |

**Fall R2:** `groupBy: ['region', 'produkt']`, `umsatz: 'sum'`

| Gruppe | monat | umsatz |
|---|---|---|
| ▾ Nord (3) | | **270** |
| &nbsp;&nbsp;▾ A (2) | | **220** |
| | Jan | 100 |
| | Feb | 120 |
| &nbsp;&nbsp;▾ B (1) | | **50** |
| | Jan | 50 |
| ▾ Süd (3) | | **180** |
| &nbsp;&nbsp;▾ A (2) | | **110** |
| | Jan | 80 |
| | Feb | 30 |
| &nbsp;&nbsp;▾ B (1) | | **70** |
| | Feb | 70 |
| **Gesamt** | | **450** |

**Fall R3 (Falle Mittelwert):** wie R2, aber `umsatz: 'avg'`. Nord: A = 110, B = 50, **Nord = 90** (270 / 3), nicht 80
(Mittel der Untergruppen). Süd: A = 55, B = 70, **Süd = 60**, nicht 62,5. Gesamt = 75. Aggregate höherer Ebenen
entstehen aus den Rohwerten bzw. aus zusammengeführten Zwischenständen (Summe + Anzahl), nie aus fertigen
Gruppenwerten.

**Fall R4 (Filter):** wie R1, Filter `monat === 'Jan'`. Sichtbar bleiben Nord A 100, Nord B 50, Süd A 80. Folgen die
Aggregate den gefilterten Zeilen (Empfehlung, wie im Training-Kapitel „Footer with totals of the displayed rows“):
Nord = 150, Süd = 80, Gesamt = 230. Eine Gruppe ohne Treffer verschwindet.

**Fall R5 (Sortierung):** wie R1, Klick auf `umsatz` absteigend → Gruppen nach Aggregat (Nord 270 vor Süd 180), Detailzeilen
innerhalb der Gruppe (Nord: 120, 100, 50).

---

## Phase 1 – Bausteine prüfen und API entwerfen 🛑

Ergebnis: **`prompts/006-row-grouping.design.md`**. Danach anhalten und die Entscheidungen bestätigen lassen.

### 1a Vorhandene Bausteine

Prüfe im Code (`packages/table/src/lib/table`), was sich wiederverwenden lässt:

- `AreaModelTree` (`data/tablemodel/areamodel/area-model-tree.ts`): `rows: TreeRowIf<S>[]`, Werte über
  `row.data[property]` (auch Pfade mit `.`), `doSort`/`sort` sortieren die Geschwister jeder Ebene (`treeSortWith`,
  `genericTreeTableSortComparator`), Filter-Pipeline (`keep`, Vorfahren bleiben sichtbar), `recalcVisibleTreeRows`,
  `toggleExpandCollapseAll`, `getFilteredFlattenRows`, `getConstantRowHeight`, `setValue` (mit `editInputPipe`)
- `TreeRowIf` / `TreeRow` (`data/common/tree-row-if.ts`, `tree-row.ts`): `data`, `expanded`, `children`, `parent`,
  `deep`, `checked`, `keep`; `TreeRowService.flattenTree` (`service/tree-row.service.ts`)
- `TreeFactory.buildTreeRows`, `TreeFactoryOptions`, `TreeRowExpandedFn` (`factory/tree-factory.ts`) – Namens- und
  Aufbaumuster für eine neue Fabrik
- `treeOptions` (`TreeOptionsIf`: Pfeil-Icons), `isAreaModelTree` / `isTreeRow` (`instanceof-workaround.ts`)
- Renderer der Baumspalte (Pfeil, Einrückung) finden. Wird das Label escaped?
- Checkbox-Baum (Showcase `treetablecheckbox`, `generateTreeCheckboxModel` in `demo-table-models`): Was passiert
  beim Anhaken einer Elternzeile?
- Persistenz `autoRestoreOptions` (Collapsed/Expanded): Woran werden Knoten wiedererkannt? Gruppen brauchen stabile
  Schlüssel (Gruppenpfad), keine Objekt-Identität.
- Footer mit Summen: `instructions.md` §5.4 und Training-Demo
  `apps/webpage-guiexpert/src/training/demos/shared/order-totals-footer.ts` (Cache je Filterergebnis, `invalidate()`
  nach Editierung)
- Editieren (`ColumnDef.editable`, `getEditRenderer`), Live-Daten (`api.updateCells`), `onModelChanged`
- Export: `api.downloadExcel()` / `api.copyToClipboard()` mit einem Baum. Was kommt heraus?

Ergebnis: kurze Tabelle „Baustein → wofür im Row Grouping → passt / fehlt / muss erweitert werden“, plus Hinweis, ob
eine Erweiterung ein Breaking Change wäre (nur additive Änderungen, z. B. optionale Member).

### 1b API-Entscheidungen

TypeScript-Signaturen (Interfaces als eigene `.if.ts`-Dateien gedacht, Namen wie im Code üblich). Für jede Frage:
Optionen, Empfehlung, Begründung.

1. **Gemeinsame Engine mit Pivot (wichtigste Entscheidung):** Die Aggregatoren (`init / add / merge / result`,
   eingebaute Aggregationen) kommen aus **005** (`src/lib/table/aggregation/`): nicht neu bauen, nur nutzen und bei
   Bedarf additiv erweitern. Dieser Prompt baut die Gruppierung: verschachtelte `Map`s (keine String-Schlüssel mit
   Trennzeichen), Umgang mit `null` / `undefined` / `''` als Schlüssel. So schneiden, dass Pivot später nur die
   Spaltenschlüssel-Dimension ergänzt. Ablage-Vorschlag: `src/lib/table/rowgroup/`, später `src/lib/table/pivot/`.
2. **Eingabe:** `groupBy` als Property-Pfade und/oder Accessor-Funktionen (z. B. Jahr aus einem Datum), mehrere Ebenen,
   Generik `create<T>(…)`. Aggregation je Spalte in der Fabrik-Konfiguration (`aggregations: { total: 'sum' }`) oder als
   neues optionales Feld an `ColumnDef` (`aggregate`)? `ColumnDefIf` nur additiv erweitern.
3. **Ausgabe:** `TableModelIf` mit `AreaModelTree`-basiertem Body (Gruppenzeilen = `TreeRow` mit synthetischem
   `data`) oder eigene Klasse, z. B. `AreaModelRowGroups extends AreaModelTree`? Gruppen- und Detailzeilen unterscheiden
   (`isGroupRow` in `instanceof-workaround.ts`). Zugriff auf Gruppenschlüssel, Gruppenpfad, Anzahl und die
   Detailzeilen einer Gruppe.
4. **Gruppenspalte:** (a) eigene Gruppenspalte (West, fixiert) mit Pfeil und Label „Nord (3)“, (b) Label in der
   gruppierten Spalte selbst, (c) gruppierte Spalten zusätzlich ausblenden (redundant)? Anzahl anzeigen ja/nein,
   Label-Funktion.
5. **Gruppenzeilen:** Spalten ohne Aggregation bleiben leer. Aggregate über den Renderer der Spalte oder einen eigenen
   formatieren. CSS-Klassen `ge-table-row-group`, `ge-table-row-group-level-N`, Variablen `--ge-table-row-group-*`
   (light und dark).
6. **Gesamtzeile:** das Footer-Modell aus 005 wiederverwenden (bei Gruppen über die Detailzeilen), abschaltbar.
7. **Auf- und Zuklappen:** Startzustand (alle, keine, bis Ebene N), alle auf/zu, Persistenz über stabile
   Gruppenschlüssel.
8. **Sortierung:** Gruppen nach Schlüssel (Klick auf die Gruppenspalte) oder nach Aggregat (Klick auf eine aggregierte
   Spalte), Detailzeilen innerhalb der Gruppe (R5). Prüfen, ob `treeSortWith` das schon leistet.
9. **Filter:** Das Prädikat prüft Detailzeilen, Gruppen ohne Treffer verschwinden (heutiges Baumverhalten). Aggregate
   über die **gefilterten** Detailzeilen (Empfehlung, R4) oder über alle? Neuberechnung einmal bei
   `externalFilterChanged()`, nicht bei jedem Repaint.
10. **Umgruppieren zur Laufzeit:** `model.setGroupBy([...])` + `api.repaintHard()` oder ein neues Modell (= Neuaufbau in
    allen Wrappern)? Der Auf-/Zu-Zustand unveränderter Pfade bleibt erhalten. Eine Gruppenleiste per Drag & Drop
    („Row Group Panel“) ist **außerhalb des Scopes**, die API muss sie aber später erlauben. Für die Demos genügen
    Buttons oder ein Select.
11. **Editieren und Live-Daten:** Ändert sich ein Wert einer Detailzeile, werden nur die Aggregate auf dem Pfad zur
    Wurzel neu berechnet. Ändert sich ein Gruppierfeld, wandert die Zeile in eine andere Gruppe (oder ist ein
    Umgruppieren nötig?). Gruppenzeilen sind nicht editierbar.
12. **Selektion und Checkboxen:** Gruppe anhaken = alle Detailzeilen? Selektion mit Gruppenzeilen. Wie sehen
    Gruppenzeilen in Copy und Excel aus (Einrückung als Text?)?
13. **Performance:** 1 Mio. Zeilen in < 1 s gruppieren (Node). Virtual Scrolling bleibt flüssig (konstante
    Zeilenhöhe → `getConstantRowHeight`).
14. **Sicherheit:** Gruppenschlüssel und Labels stammen aus den Daten. Sie dürfen nie unescaped in `innerHTML` landen.
15. **Verhältnis zu `TreeFactory`:** neue `RowGroupFactory` oder `TreeFactory.buildGroupedRows(…)`? Namensmuster der
    vorhandenen Fabriken.
16. **Doku-Kategorie:** die Kategorie aus 005 mitnutzen (z. B. „Grouping & aggregation“), sonst neu in
    `packages/table/typedoc.json` → `categoryOrder`.
17. **Training und Demo-Repo:** Entscheidungen aus Phase 7 (Kapitel-Platzierung) und Phase 8 (Repo) mit vorlegen.

### 1c Beispiele

Für R1–R5 je ein vollständiges Aufrufbeispiel (≤ 15 Zeilen, Video-tauglich) mit erwartetem Ergebnis, dazu je eines mit
Accessor (Jahr > Monat aus einem Datum) und mit Umgruppieren zur Laufzeit. Ein Snippet für die Videoreihe markieren
(„Row Grouping in 60 Sekunden – ohne Enterprise-Lizenz“). Im Design-Dokument skizzieren, wie Pivot die Engine
nutzen wird (ein Absatz und eine Signatur reichen).

---

## Phase 2 – Tests zuerst (Vitest)

Regeln aus CLAUDE.md §6: Specs **neben dem Code**, Importe wie Anwender (`from '@guiexpert/table'`). Erst gegen die
API aus dem Design-Dokument schreiben (rot), dann implementieren (Phase 3, grün). Die Fixture
`packages/table/test-utils/grouping-fixtures.ts` (aus 005) wiederverwenden und um die Erwartungen R1–R5 ergänzen.
`test-utils/` kommt nie ins npm-Paket.

### 2a Unit (Node, `*.spec.ts`, Projekt `unit`)

z. B. `rowgroup/row-group-engine.spec.ts`, `factory/row-group-factory.spec.ts`:

- [ ] R1–R3 exakt, inkl. Gesamtzeile. `avg`: Nord = 90 (nicht 80), Süd = 60 (nicht 62,5), mit `toBeCloseTo`
- [ ] Aggregatoren aus 005 in Gruppen: jede eingebaute Aggregation einmal über die Gruppierung, ein eigener Reducer;
      Gruppensummen per `merge` = ein Durchlauf über alle Rohwerte; leere Gruppe (die Aggregatoren selbst testet 005)
- [ ] `groupBy` als Property-Pfad und als Accessor-Funktion
- [ ] Schlüssel-Randfälle: `null` / `undefined` / `''` (eigene Gruppe), `1` vs. `'1'`, Trennzeichen im Schlüssel
      (`'a|b'` vs. `'a'` + `'|b'`, keine Kollision), `Date`
- [ ] Reihenfolge: Gruppen natürlich und mit Comparator; Detailzeilen stabil in Eingabe-Reihenfolge
- [ ] R4: Aggregate folgen dem Filter (bzw. wie entschieden); Gruppe ohne Treffer verschwindet; Treffer unter
      zugeklappten Gruppen werden gefunden
- [ ] R5: Sortieren nach Aggregat und innerhalb der Gruppe
- [ ] Umgruppieren (`setGroupBy` bzw. neues Modell): richtiges Ergebnis, Auf-/Zu-Zustand unveränderter Pfade bleibt
- [ ] Editieren einer Detailzeile: nur der Pfad zur Wurzel wird neu berechnet (Aufrufe per Spy zählen); geändertes
      Gruppierfeld → Zeile wechselt die Gruppe (bzw. wie entschieden)
- [ ] stabile Gruppenschlüssel (gleiche Daten → gleiche Schlüssel, Grundlage der Persistenz)
- [ ] leere Eingabe, eine Zeile, alle Zeilen in einer Gruppe, jede Zeile eine eigene Gruppe
- [ ] Quellzeilen werden nicht verändert (Vergleich mit `structuredClone` bzw. `Object.freeze`)
- [ ] Typen: `expectTypeOf` für die Generik (`create<Order>` erlaubt nur gültige Felder bzw. Accessoren). Geprüft
      wird das erst durch `test:types`, denn Vitest selbst prüft keine Typen

Das Unit-Projekt läuft mit `isolate: false`: kein Modulzustand, Singletons im `beforeEach` zurücksetzen. Einmal mit
`test:unit --sequence.shuffle` auf Reihenfolge-Unabhängigkeit prüfen.

### 2b Performance

Keine Zeit-Assertions in `test:unit` (CI-Rechner schwanken). Stattdessen eine Bench-Datei mit `vitest bench`
(1 Mio. Zeilen, 2 Ebenen, 3 Aggregate, Ziel < 1 s in Node) und das Ergebnis im Design-Dokument notieren. Die
Coverage-Konfiguration in `packages/table/vitest.config.ts` schließt heute nur `*.spec.ts`, `*.demo.ts`, `*.if.ts` und
`index.ts` aus. Eine `*.bench.ts` unter `src/` zählt also als unabgedeckter Code: in `exclude` aufnehmen oder außerhalb
von `src/` ablegen.

### 2c Browser (Chromium, `*.browser.spec.ts`, Projekt `browser`)

z. B. `rowgroup/row-group.browser.spec.ts`, Helfer aus `test-utils/mount-table.ts` (`mountTable`, `nextFrame`,
`areaRows`, `cellDiv`, `columnIndices`, `stylePx`, `destroyAllTables`):

- [ ] R1 gerendert: Gruppenzeilen mit Label und Anzahl, Aggregate, Detailzeilen, Footer-Gesamtzeile
- [ ] R2: Ebenen auf- und zuklappen, `toggleExpandCollapseAll`, CSS-Klassen je Ebene
- [ ] Gruppenspalte (fixiert, falls so entschieden), ausgeblendete gruppierte Spalten
- [ ] R5: Sortieren per Header-Klick
- [ ] R4: Filter + `api.externalFilterChanged()` → Aggregate und Footer aktualisiert
- [ ] Inline-Edit in einer Detailzeile → Gruppenzeile und Footer zeigen nach dem Repaint den neuen Wert
- [ ] Live-Daten über `api.updateCells()` → Gruppenzeile aktualisiert
- [ ] `autoRestoreOptions`: zugeklappte Gruppe bleibt nach Neuaufbau zugeklappt (`test-utils/memory-storage.ts`)
- [ ] Checkboxen und Selektion mit Gruppenzeilen (wie in Phase 1 entschieden)
- [ ] `api.downloadExcel()` und `api.copyToClipboard()` der gruppierten Sicht (ZIP-Leser `test-utils/zip.ts`)
- [ ] **HTML-Injection:** `<img src="x" onerror=…>` als Gruppenschlüssel → kein `img`-Element, Text sichtbar (Muster:
      `renderer/renderer.browser.spec.ts` „HTML injection“)
- [ ] 100.000 Zeilen gruppiert: ans Ende scrollen rendert die letzten Zeilen (keine Zeit-Assertions)
- [ ] Umgruppieren bzw. Modellwechsel; `destroy()` gibt alles frei
- [ ] Zeit über `nextFrame()` / `vi.waitFor`, keine festen `setTimeout`s, keine pixelgenauen Textbreiten

### 2d Wrapper (`pnpm test:wrappers`)

- [ ] Ein gruppiertes Modell mindestens im React- und im Web-Component-Wrapper mounten (Smoke: `tableReady`, Zeilen,
      Modellwechsel = Neuaufbau + `destroy()`). Gemeinsame Helfer: `packages/table/test-utils/wrapper-test-utils.ts`

### 2e Weitere Prüfungen

- [ ] `pnpm --filter @guiexpert/table test:types`
- [ ] `pnpm --filter @guiexpert/table docs:check` (jedes neue `@example` kompiliert)
- [ ] Export-Snapshot: `pnpm exec vitest run -u src/index.spec.ts` (in `packages/table`), Diff prüfen: nur Zugänge,
      **kein** verschwundener Export
- [ ] `pnpm --filter @guiexpert/table test:coverage`: neue Dateien ≥ 95 % Zeilen / ≥ 90 % Zweige, Gesamtabdeckung
      (~97 % Zeilen) sinkt nicht; die bestehenden Baum-Specs bleiben unverändert grün

Fehler, die dabei in bestehenden Klassen auftauchen (besonders `AreaModelTree`): zuerst ein roter Test, bei nicht sofort
behobenen Fehlern `it.fails('<richtiges Verhalten>')` + `// BUG:`, dazu ein Eintrag in `TODO.md`.

---

## Phase 3 – Implementierung (Core)

- Reihenfolge: DOM-freie Gruppier-Engine (auf den Aggregatoren aus 005) → Area-Modell(e) (Body mit Gruppenzeilen;
  Footer aus 005) → Fabrik → CSS. Aggregatoren nicht duplizieren; Erweiterungen dort nur additiv, die Specs von 005
  bleiben grün.
- Regeln (CLAUDE.md §5): **0 Runtime-Abhängigkeiten**; Daten nie unescaped in `innerHTML`; `instanceof` über
  Paketgrenzen meiden (`instanceof-workaround.ts` erweitern, z. B. `isGroupRow`); bestehende öffentliche APIs nicht
  brechen (`AreaModelTree`, `TreeRowIf`, `TreeFactory` nur additiv ändern); bestehende Tippfehler-APIs nicht umbenennen.
- CSS: Klassen `ge-table-row-group*` in `packages/table/css/`, Variablen `--ge-table-row-group-*` in
  `table-color-vars.css` für light **und** dark (`html[data-theme]`). Angular übernimmt das CSS beim Build
  automatisch (`table.component.css` wird generiert).
- Jede neue öffentliche Datei in `packages/table/src/index.ts` exportieren; jedes Symbol bekommt `@category`.
- Builds grün: `pnpm build:core`, `pnpm build:libs`, `pnpm build:angular`. Größe von `packages/table/dist` vorher und
  nachher notieren.

---

## Phase 4 – Doku

- [ ] **JSDoc** mit `@example` für jedes öffentliche Symbol (wird zu https://gui.expert/api) →
      `pnpm --filter @guiexpert/table docs:check` (Okt. 2026: 283 Beispiele, 0 Fehler)
- [ ] Kategorie aus 005 nutzen (sonst neu in `packages/table/typedoc.json` → `categoryOrder`); Row Grouping in
      `packages/table/typedoc-readme.md` erwähnen
- [ ] **API-Doc neu erzeugen**: `pnpm --filter @guiexpert/table typedoc:website`. Das erneuert auch
      `apps/webpage-guiexpert/src/training/api-index.json`, ohne den die `<ApiLink>`s im Training nicht bauen
- [ ] **`instructions.md`**: neuer Abschnitt in §5 „Creating table models“ (z. B. §5.6 „Row grouping“; Pivot folgt
      danach): R1, mehrere Ebenen, Aggregationen, Filter, Sortierung, Editieren, Umgruppieren, Grenzen (keine
      Gruppenleiste per Drag & Drop). In §5.4 (Footer, von 005 überarbeitet) den gruppierten Fall erwähnen. Alle `ts`-Blöcke
      müssen kompilieren: Snippets extrahieren → `tsc` strict mit `paths` auf `packages/*/src` (CLAUDE.md §6)
- [ ] `packages/angular-table/instructions.md`: kurzes Angular-Beispiel, gegen Angular-22-Typen prüfen
- [ ] `README.md` (Root) und `packages/table/README.md` (Abschnitt „Features“): „Row grouping with aggregation“
- [ ] `llms.txt` (Root) **und** `apps/webpage-guiexpert/public/llms.txt`: „Key Features“ und Kapitelzahl des Trainings
- [ ] `CLAUDE.md`: §3.4 (Area-Modelle, Fabriken), §3.6 (Filter/Sortierung mit Gruppen); §6 Zahlen (Tests,
      `docs:check`-Beispiele, „26 Live-Demos“); §10 Episoden-Backlog; §11 Kapitelzahl
- [ ] `TODO.md`: Row-Grouping-Eintrag abhaken, Abschnitt „Für die Release-Notes (nächstes Release)“ ergänzen, Funde
      eintragen; im Pivot-Eintrag vermerken, dass die Engine bereitsteht

---

## Phase 5 – Demo-Modelle und Demo-Apps

- [ ] `packages/demo-table-models`: z. B. `createRowGroupModel(…)` (fester Seed, z. B. Bestellungen nach Land > Stadt,
      Summe Umsatz und Menge, Anzahl; vorhandene Daten aus `createOrderModel` / `model/order.if.ts` prüfen), in
      `src/index.ts` exportieren, `pnpm --filter @guiexpert/demo-table-models build`. Wird vom Website-Showcase genutzt
      (über `pre:build` nach `public/scripts/` kopiert)
- [ ] `apps/table-demo` (Plain TS, Aufnahme-Umgebung der Videos): Beispiel mit Umschalter für die Gruppierung
- [ ] `apps/angular-table-demo`: neue Route `rowgroup` + Eintrag in `apps/angular-table-demo/instructions.md`.
      **Achtung:** die App nutzt noch die npm-Pakete (s. `TODO.md`), läuft also erst nach dem Release oder nach der
      Kopplung an lokale Builds
- [ ] Framework-Demos (`apps/react-table-demo` …): optional, eine reicht

---

## Phase 6 – Website gui.expert (`apps/webpage-guiexpert`) 🛑 kein Deploy

- [ ] **Showcase `rowgrouping`** (Muster: `timetable`, `treetable`):
  - `src/pages/showcase/rowgrouping/run.astro` + `info.astro`
  - `src/components/showcase/rowgrouping/run.astro` (mit Umschalter für die Gruppierung)
  - Vorschaubild `src/assets/screens/thumbs/rowgrouping.png` + Kachel in `src/components/showcase/index.astro`
  - optional `src/content/showcase/rowgrouping.json` (`featured`)
- [ ] **Feature-Liste**: `src/components/features.astro`
- [ ] **Aussagen „kein Row Grouping“ korrigieren.** Pivot ist dann immer noch nicht fertig, deshalb die gemeinsame
      Zeile „Row grouping / pivot“ in **zwei Zeilen** aufteilen („Row grouping“ ✔, „Pivot tables“ weiter –, bis
      007 umgesetzt ist):
  - `src/components/home/why.astro`: Zeile `["Row grouping / pivot", "–", "✔", "– tree tables instead"]` und die
    „Rule of thumb“ darunter
  - `src/pages/training/build-buy-or-guiexpert.astro`: Tabellenzeile „Row grouping / pivot“ und Absatz darunter
  - `src/pages/training/checklist.astro`: „row grouping with aggregation by drag and drop“. Die Drag-&-Drop-Leiste
    fehlt weiterhin, die Gruppierung selbst ist eingebaut. Ehrlich formulieren
  - `src/pages/training/tree-table.astro` (Kap. 30): Hinweis „Flache Daten? → Row Grouping“
  - Wortwahl nach CLAUDE.md §8: „MIT-lizenziert, kostenlos auch kommerziell“, keine Preise; ag-Grid sachlich („dort ein
    Enterprise-Feature“)
  - Beiträge unter `src/pages/post/` bzw. `src/components/post/` auf Vergleichsaussagen prüfen
- [ ] API-Seiten: kommen aus Phase 4 (`typedoc:website`)
- [ ] Bauen: `pnpm build:core && pnpm --filter @guiexpert/demo-table-models build && pnpm build:webpage-guiexpert`
      (der Build prüft ApiLinks, ChapterLinks, Showcases und Screenshots); lokal `pnpm serve:webpage-guiexpert`,
      Showcase in light **und** dark ansehen
- [ ] **Kein Deploy** (`deploy.cjs` / FTP) ohne ausdrückliche Freigabe

---

## Phase 7 – Training-Kapitel (gui.expert/training)

**Platzierung (in Phase 1 entscheiden):** Kapitelnummer `no` und `episode` hängen am Git-Tag `ep-NNN` des Demo-Repos.
Es gibt 34 Kapitel, Kapitel 34 ist das Finale „Checklist“.

- **Option A (Empfehlung):** hinten anhängen in **Teil 8** (`PartId` `"advanced"`, s. `000-arbeitsweise.md`; den Teil
  legt der erste Prompt an, der ein Kapitel braucht), Kapitel `row-grouping` mit der nächsten freien Nummer (Stand
  Okt. 2026: 35, falls 001–005 kein Kapitel angelegt haben). Pivot folgt direkt danach. Keine Umnummerierung, alle
  Tags und Links bleiben gültig.
- **Option B:** in Teil 6 „Look & feel“ neben `tree-table` einsortieren. Dann müssen alle Kapitel und Folgen dahinter
  umnummeriert und die Tags im Demo-Repo verschoben werden, und bestehende Links brechen. Nur mit gutem Grund.

Umsetzung (Muster: `tree-table`, `footer-totals`; Ablauf CLAUDE.md §11):

- [ ] `src/training/chapters.ts`: Teil 8 anlegen, falls noch nicht vorhanden; Eintrag in `CHAPTERS`
      (`slug: "row-grouping"`, `lead`, `learn`, `api` mit allen neuen Symbolen, `showcases: [{ name: "rowgrouping", … }]`,
      `since` = Release-Version); Kopfkommentar `ep-001 … ep-NNN`
- [ ] Seite `src/pages/training/row-grouping.astro` mit `<TrainingLayout slug="row-grouping">`. Inhalt: Baum vs.
      Gruppierung vs. Pivot, R1 → mehrere Ebenen → Aggregationen, die Mittelwert-Falle, Filter und Sortierung,
      Editieren und Live-Daten, Umgruppieren, Grenzen. Querverweise per `<ChapterLink>` auf `tree-table`,
      `footer-totals`, `filtering`, `sorting`, `inline-editing`, `live-data`, `persist-state`, `excel-export`,
      `build-buy-or-guiexpert`
- [ ] Live-Demo `src/training/demos/row-grouping.ts` (`export default (ctx: DemoContext) => cleanup?`), Daten aus
      `./shared/orders` (fester Seed; z. B. `country` > `city`, Summe `total` und `quantity`, Anzahl; Spalten aus
      `./shared/order-columns`), Umschalter für die Gruppierung, Code-Bereiche mit `// #region` für `<Snippet>`
- [ ] Screenshot-Eintrag in `scripts/training-screenshots.mjs`, Bilder
      `src/assets/training/shots/demo-row-grouping-light.png` / `-dark.png`
- [ ] Typprüfung: `pnpm --filter webpage-guiexpert check:training` (nach `pnpm build:core`)
- [ ] Zahlen nachziehen (vorher in `chapters.ts` nachsehen; Stand Okt. 2026 „34 Kapitel“, „ep-034“,
      „26 Live-Demos“): `CLAUDE.md` §6 + §11, beide `llms.txt`, `TODO.md`, `training-examples/README.md`,
      Kopfkommentar `chapters.ts`. Suche (Zahlen anpassen):
      `grep -rn "34 chapters\|34 Kapitel\|34 short chapters\|ep-034\|26 Live-Demos" --exclude-dir=node_modules .`
- [ ] `prompts/007-pivot.md` prüfen: Teil und Kapitelnummer passen noch?

---

## Phase 8 – Demo-Repo 🛑

Jedes Kapitel verlinkt einen Tag im Demo-Repo **`krocon/guiexpert-table-step-by-step-demo`** (`DEMO_REPO` /
`demoTagUrl()` in `chapters.ts`). Das Repo liegt **nicht** im Mono-Repo und muss in der Sitzung erst verbunden bzw.
geklont werden.

- **Entscheidung (in Phase 1 vorlegen):**
  - **A (Empfehlung):** neue Folge im bestehenden Repo: Commit + Tag **`ep-NNN`** (= Kapitelnummer), Struktur wie
    die bisherigen Folgen (ggf. `frameworks/`). Passt ohne Änderung zu `demoTagUrl()`.
  - **B:** eigenes Repo, z. B. `krocon/guiexpert-table-row-grouping-demo`. Dann braucht `chapters.ts` einen
    abweichenden Link.
- **Abhängigkeit:** prüfen, ob das Demo-Repo die veröffentlichten npm-Pakete nutzt. Dann gibt es Row Grouping dort
  erst nach dem Release mit Row Grouping. Bis dahin auf einem Branch arbeiten und den Tag erst nach dem Release setzen.
- **Offener Punkt aus `TODO.md`:** die Tags `ep-001` … `ep-034` sind evtl. noch nicht gepusht. Fehlende Tags
  zusammen mit dem neuen pushen.
- Repo anlegen, pushen, Tags setzen: **nur nach ausdrücklicher Freigabe**.
- Framework-Code, der im Training gezeigt wird, nach `apps/webpage-guiexpert/training-examples/` kopieren (README dort:
  Tag aktualisieren).

---

## Phase 9 – Video-Folge

- [ ] Ordner `videos/NN-row-grouping/` (NN = nächste freie Nummer; Muster `videos/01-zwei-millionen-zeilen/`):
      `script.md` (Hook 0–8 s → Code 8–40 s → Ergebnis live 40–55 s → CTA gui.expert 55–60 s), `snippet.ts`
      (≤ 15 Zeilen, kompiliert gegen die echte API), `demo.html` (Aufnahme-Seite)
- [ ] Titel-Vorschlag „Row Grouping in 60 Sekunden – ohne Enterprise-Lizenz“. Hook z. B.: 50.000 Bestellungen → ein
      Klick → nach Land gruppiert, mit Summen. Kernbotschaft: MIT-lizenziert, null Abhängigkeiten, Millionen Zeilen
      flüssig
- [ ] `videos/README.md` (Tabelle) und `CLAUDE.md` §10 Episoden-Backlog (neue Zeile; Basis: Showcase `rowgrouping`,
      Training `row-grouping`; Bezug zu Folge 12 „Baumtabelle & Checkboxen“)
- [ ] Snippet vor der Aufnahme in `apps/table-demo` ausführen

---

## Phase 10 – Abschlussprüfung

```bash
pnpm build:core
pnpm --filter @guiexpert/table test:types
pnpm --filter @guiexpert/table docs:check
pnpm test:core                                   # Unit + Browser
pnpm --filter @guiexpert/table test:unit --sequence.shuffle
pnpm --filter @guiexpert/table test:coverage
pnpm test:wrappers
pnpm build:libs && pnpm build:angular
pnpm --filter @guiexpert/demo-table-models build
pnpm --filter @guiexpert/table typedoc:website
pnpm --filter webpage-guiexpert check:training
pnpm build:webpage-guiexpert
```

Danach:

- Showcase und Training-Demo im Browser ansehen (light und dark), auch mit 100.000+ Zeilen scrollen;
  `instructions.md`-Snippets kompilieren.
- Ergebnisse von R1–R5 gegen eine unabhängige Rechnung prüfen (z. B. kurzes Skript oder Tabellenkalkulation).
- Die bestehenden Baum-Showcases (`treetable`, `treetablecheckbox`) und das Training-Kapitel `tree-table`
  funktionieren unverändert.
- Abschluss-Review durch einen separaten Agenten, der den Code nicht geschrieben hat. Schwerpunkte:
  Korrektheit der Aggregation, Eignung der Engine für Pivot, Escaping, Breaking Changes an `AreaModelTree`,
  Doku = Code, Aussagen auf der Website.

---

## Definition of Done

**Phase 1 – Entwurf**
- [ ] `prompts/006-row-grouping.design.md`: Bausteinanalyse, Signaturen, Entscheidungen mit Empfehlung, offene Fragen
- [ ] Gruppier-Engine so entworfen, dass Pivot sie nutzen kann (Skizze im Entwurf); Aggregatoren aus 005 genutzt
- [ ] Beispiele R1–R5, Accessor, Umgruppieren, mit erwarteten Ergebnissen
- [ ] Entscheidungen Kapitel-Platzierung (Phase 7) und Demo-Repo (Phase 8) vorgelegt
- [ ] 🛑 Entwurf freigegeben

**Phase 2–3 – Tests und Code**
- [ ] Unit-, Browser-, Wrapper- und Typ-Tests vorhanden und grün; Shuffle-Lauf grün; Bench-Ergebnis notiert
- [ ] Coverage-Ziele erreicht; Export-Snapshot aktualisiert (nur Zugänge); Baum-Specs unverändert grün
- [ ] Core, Libs und Angular 14–22 bauen

**Phase 4 – Doku**
- [ ] JSDoc + `docs:check` grün, typedoc-Kategorie, API-Doc neu erzeugt
- [ ] `instructions.md` (Snippets kompilieren), Angular-Instructions, READMEs, beide `llms.txt`, `CLAUDE.md`, `TODO.md`

**Phase 5–7 – Demos, Website, Training**
- [ ] `createRowGroupModel` in `demo-table-models`, Beispiel in `apps/table-demo` (Angular-Demo: Route + Hinweis)
- [ ] Showcase `rowgrouping` + Kachel + Feature-Liste; Vergleichszeile aufgeteilt, Aussagen korrigiert (`why.astro`,
      `build-buy-or-guiexpert`, `checklist`, `tree-table`)
- [ ] Training-Kapitel `row-grouping` (Teil 8) mit Live-Demo, Screenshots, `check:training` grün; Zahlen nachgezogen
- [ ] `pnpm build:webpage-guiexpert` grün; kein Deploy

**Phase 8–9 – Demo-Repo und Video**
- [ ] 🛑 Demo-Repo: Entscheidung umgesetzt, Push/Tag erst nach Freigabe (und nach dem Release)
- [ ] `videos/NN-row-grouping/` mit `script.md`, `snippet.ts`, `demo.html`; `videos/README.md`, CLAUDE.md §10

**Immer**
- [ ] Kein Publish, kein Deploy, keine Versionsänderung, kein Push ohne ausdrückliche Anweisung
