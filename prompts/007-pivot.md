# TODO-Prompt 007: Pivot-Tabellen – API, Vitest, Code, Doku, Website, Training, Demo-Repo, Video

> Status: **offen** · angelegt 14.10.2026, erweitert 14.10.2026 · Ziel 1 (Code) **und** Ziel 2 (Content) aus CLAUDE.md
> Slug `pivot` (Branch `feat/pivot`, Design `prompts/007-pivot.design.md`) · Verweis in `TODO.md` → Abschnitt
> „Feature-Prompts“. Gemeinsame Regeln: `prompts/000-arbeitsweise.md` (gilt bei Widersprüchen).
>
> **Voraussetzung: 005 (Aggregation) und 006 (Row Grouping)** (`prompts/005-aggregation-gesamtzeile.md`,
> `prompts/006-row-grouping.md`). 005 liefert Aggregatoren, Gesamtzeile und Testfixture, 006 die Gruppierung und die
> Gruppenzeilen. Pivot ergänzt nur die Spaltenschlüssel-Dimension.
>
> Diesen Prompt in einer neuen Sitzung im Mono-Repo (`guiexperttable/mono`) ausführen. Er ist eigenständig und setzt kein
> Wissen aus früheren Chats voraus. Die Arbeit reicht über mehrere Sitzungen: Erledigtes in der **Definition of Done**
> am Ende abhaken, damit die nächste Sitzung dort weitermacht.

---

## Auftrag

Pivot-Tabellen als neues Feature des Cores `@guiexpert/table`, von der API bis zur Website. Ausgangspunkt (die
endgültige Signatur legt Phase 1 fest):

```ts
const model: TableModelIf = PivotFactory.create({ rows, rowFields, columnFields, valueField, aggregate });
```

| Phase | Ergebnis | Haltepunkt |
|---|---|---|
| 1 | API-Entwurf `prompts/007-pivot.design.md` (Bausteine, Signaturen, Entscheidungen, Beispiele) | 🛑 Freigabe abwarten |
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
  Training §11), dazu `TODO.md`, `instructions.md` §5 und die Design-Dokumente von 005 und 006
  (`prompts/005-aggregation-gesamtzeile.design.md`, `prompts/006-row-grouping.design.md`).
- **Prüfen, ob 005 und 006 umgesetzt sind** (`TODO.md`, `prompts/README.md`, Ordner `src/lib/table/aggregation/` und
  `rowgroup/` bzw. wie in deren Design-Dokumenten festgelegt). Wenn ja: wiederverwenden statt neu bauen. Wenn nein:
  anhalten und fragen (zuerst 005/006 ausführen, Empfehlung, oder Phase 1 gemeinsam entwerfen).
- Auf Branch **`feat/pivot`** (von `main`) arbeiten. Commits nur nach Rückfrage. **Kein** Push, `npm publish`,
  GitHub-Release, Website-Deploy (`deploy.cjs`) und kein Versionssprung ohne ausdrückliche Anweisung.
- Zielversion für `since`-Angaben und Release-Notes: die Version des Releases, mit dem Pivot erscheint
  (s. `000-arbeitsweise.md`; in `packages/table/package.json` nachsehen). Nur eintragen, nicht hochzählen.
- Eine Taskliste mit einem Eintrag pro Phase führen.
- Nach Phase 1 anhalten und den Entwurf vorlegen, inklusive der Entscheidungen zu Phase 7 (Kapitel-Platzierung)
  und Phase 8 (Demo-Repo).

---

## Hintergrund: Was eine Pivot-Tabelle ist

Pivot = Row Grouping (Zeilen gruppieren und aggregieren) + Spaltenschlüssel (Werte eines Felds werden zu Spalten),
ohne Detailzeilen. Den Vergleich mit Baumtabelle und Row Grouping zeigt `prompts/006-row-grouping.md` („Hintergrund“).

Pivot ist **nicht** Transponieren. Beim Transponieren werden nur Zeilen und Spalten vertauscht, die Information bleibt
gleich. Eine Pivot-Tabelle tut drei Dinge auf einmal:

1. **Gruppieren** nach Zeilenfeldern (mehrere Felder ergeben eine Hierarchie, z. B. Region > Produkt),
2. die **Werte** eines oder mehrerer Spaltenfelder zu **neuen Spalten** machen (mehrere Felder ergeben mehrstufige Header),
3. ein Wertfeld **aggregieren** (Summe, Anzahl, Mittelwert, Min, Max …), dazu Zwischen- und Gesamtsummen.

Folge für die Implementierung: **Wie viele Spalten es gibt, hängt von den Daten ab.** Die `ColumnDef`s entstehen zur
Laufzeit.

Markt: Bei ag-Grid ist Pivot ein **Enterprise-Feature** (Lizenzschlüssel nötig, nur zusammen mit Row Grouping).
Eine MIT-lizenzierte Pivot-Funktion ohne Abhängigkeiten wäre ein klares Unterscheidungsmerkmal. Heute sagt die eigene
Website noch ausdrücklich „kein Pivot“ (s. Phase 6).

### Referenzdaten (als Testfixture verwenden)

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

**Fall 1:** Zeilen = `region`, Spalten = `monat`, Wert = `sum(umsatz)`

| Region | Jan | Feb | Gesamt |
|---|---|---|---|
| Nord | 150 | 120 | 270 |
| Süd | 80 | 100 | 180 |
| **Gesamt** | **230** | **220** | **450** |

**Fall 2:** Zeilen = `region` > `produkt` (Hierarchie mit Zwischensummen), Spalten = `monat`, Wert = `sum(umsatz)`

| Region / Produkt | Jan | Feb | Gesamt |
|---|---|---|---|
| ▾ Nord | 150 | 120 | 270 |
| &nbsp;&nbsp;A | 100 | 120 | 220 |
| &nbsp;&nbsp;B | 50 | – | 50 |
| ▾ Süd | 80 | 100 | 180 |
| &nbsp;&nbsp;A | 80 | 30 | 110 |
| &nbsp;&nbsp;B | – | 70 | 70 |
| **Gesamt** | **230** | **220** | **450** |

`–` = Kombination kommt in den Daten nicht vor (leer, **nicht** 0).

**Fall 3 (Falle Mittelwert):** Wert = `avg(umsatz)`, Spalte Jan: Nord = 75, Süd = 80, Gesamt = 230 / 3 ≈ **76,67**.
Der Mittelwert der Mittelwerte wäre 77,5 und damit **falsch**. Summen und Zwischensummen müssen aus den Rohwerten
(bzw. aus Summe + Anzahl) berechnet werden, nicht aus bereits aggregierten Zellen.

---

## Phase 1 – Bausteine prüfen und API entwerfen 🛑

Ergebnis: **`prompts/007-pivot.design.md`**. Danach anhalten und die Entscheidungen bestätigen lassen.

### 1a Vorhandene Bausteine

Prüfe im Code (`packages/table/src/lib/table`), was sich wiederverwenden lässt:

- **Engine aus 005 und 006** (Aggregatoren mit `init / add / merge / result` und Gesamtzeile aus 005; Gruppier-Engine,
  Gruppenzeilen, CSS `ge-table-row-group*` aus 006; Fixture `test-utils/grouping-fixtures.ts`): Was lässt sich direkt nutzen,
  was muss für die Spaltenschlüssel erweitert werden?
- `factory/` (`table-factory.ts`, `tree-factory.ts`, `cover-grid-factory.ts`, je mit `.spec.ts`):
  `TableFactory.createTableModel`, `createByAreaModels`, `TreeFactory.buildTreeRows`,
  `CoverGridFactory.createCoverGridModel` (Namens- und Aufbaumuster für die neue Fabrik, z. B. `factory/pivot-factory.ts`)
- Zeilen-Hierarchie: `AreaModelTree` (`data/tablemodel/areamodel/area-model-tree.ts`), `TreeRow`, `treeOptions`,
  `isAreaModelTree` / `isTreeRow` (`instanceof-workaround.ts`)
- Mehrstufige Header: `AreaModelCellGroups` (`data/tablemodel/areamodel/area-model-cell-groups.ts`),
  `data/tablemodel/cellgroup/` (`cellgroup-factory.ts`, `cell-group.ts`, `cell-group-ext.ts`),
  `renderer/cell-group-ext-cell-renderer.ts`, `headerGroupOptions`, `packages/demo-table-models/src/lib/headergroup`
- Footer mit Summen: Muster aus `instructions.md` §5.4 „Footer with totals of the displayed rows“ (Footer-`AreaModel`
  liest `getFilteredRows()`)
- `ColumnDef.create`, fixierte Spalten (`fixedLeftColumnCount` / `fixedRightColumnCount` im Model)
- Filter (`externalFilterFunction`, `api.externalFilterChanged()`), Sortierung (`sortComparator`, `api.sort`)
- Export: `api.downloadExcel()` exportiert die aktuelle Sicht. Prüfen, ob das für ein Pivot-Modell ohne
  Zusatzarbeit funktioniert (Header-Gruppen, Zwischensummen, Footer).

Ergebnis: kurze Tabelle „Baustein → wofür im Pivot → passt / fehlt / muss erweitert werden“, plus Hinweis, ob eine
Erweiterung ein Breaking Change wäre (nur additive Änderungen, z. B. optionale Member wie bei `TableModelIf`).

### 1b API-Entscheidungen

TypeScript-Signaturen (Interfaces als eigene `.if.ts`-Dateien gedacht, Namen wie im Code üblich). Für jede Frage:
Optionen, Empfehlung, Begründung.

1. **Eingabe**
   - Felder als `string` (Property-Pfad, z. B. `'address.city'`) **oder** Accessor-Funktion `(row: T) => unknown`?
     Generik `create<T>(…)`. Accessoren sind z. B. für „Quartal aus Datum“ nötig.
   - Ein Wertfeld (`valueField` + `aggregate`) oder mehrere (`values: [{ field, aggregate, label, renderer }]`)?
     Bei mehreren Werten: Unterspalten je Spaltenschlüssel (`Jan › Summe`, `Jan › Anzahl`).
   - Aggregationen: aus 005 übernehmen (`'sum' | 'count' | 'avg' | 'min' | 'max' |
     'countDistinct'` plus eigener Reducer mit `init / add / merge / result`). Nur falls dort nicht vorhanden: hier
     festlegen (Fall 3 zeigt, warum ein Reducer statt `(values[]) => number` nötig ist).
   - Konfiguration möglichst ähnlich zu Row Grouping (`rowFields` ≈ `groupBy`), damit Anwender umsteigen können.
2. **Ausgabe:** nur `TableModelIf` oder ein `PivotResult` (Modell + Metadaten: Spaltenschlüssel, Zeilenschlüssel,
   `getSourceRows(rowIndex, columnIndex)` für Drill-down)?
3. **Zeilen:** flach vs. Baum (`AreaModelTree`), Zwischensummen oben/unten/aus, Sortierung der Gruppen
   (nach Schlüssel oder nach Aggregat).
4. **Spalten:** Reihenfolge der Spaltenschlüssel (natürlich, eigener Comparator, z. B. Monate), mehrstufige Header
   bei mehreren `columnFields`, Label-Funktion, Obergrenze `maxColumns` gegen Spaltenexplosion (Verhalten bei
   Überschreitung: Fehler, Kappen, „Sonstige“?).
5. **Summen:** Gesamtspalte (Ost, fixiert?), Gesamtzeile (Footer), Gesamtsumme; einzeln abschaltbar.
6. **Leere Kombinationen und leere Schlüssel:** Zelle `undefined`, konfigurierbarer Platzhalter; `null`/`undefined`/`''`
   als Schlüssel bilden eine eigene Gruppe mit konfigurierbarem Label.
7. **Filter und Neuberechnung:** Ein Filter wirkt auf die **Quellzeilen vor** der Aggregation, `externalFilterFunction`
   auf die Pivot-Zeilen danach. Wie wird neu pivotiert, ohne dass der Wrapper die Tabelle komplett neu aufbaut
   (neues Modell = Neuaufbau in allen Wrappern)? Optionen: `pivotModel.update(config)` + `api.repaint()`,
   oder bewusst ein neues Modell.
8. **Darstellung:** Zahlen-Renderer für Wertzellen, CSS-Klassen für Zwischen- und Gesamtsummen
   (`ge-table-pivot-subtotal`, `ge-table-pivot-total`), CSS-Variablen `--ge-table-pivot-*` (light und dark).
9. **Sicherheit:** Spaltenschlüssel und Labels stammen aus den Daten. Sie dürfen nie unescaped in `innerHTML` landen
   (`escapeHtml()` bzw. Text-APIs).
10. **Performance:** ein Durchlauf über die Quellzeilen, verschachtelte `Map`s statt String-Schlüssel mit Trennzeichen
    (Kollisionsgefahr). Ziel z. B. 1 Mio. Quellzeilen in < 1 s (Node).
11. **Interaktive Pivot-UI** (Felder per Drag & Drop umsortieren): **außerhalb des Scopes**. Die API muss aber eine
    geänderte Konfiguration ohne Umbau zulassen.
12. **Ablage und Doku-Kategorie:** Ordner (Vorschlag `src/lib/table/pivot/` + `factory/pivot-factory.ts`, neben
    `aggregation/` und `rowgroup/`); typedoc-Kategorie von 005/006 mitnutzen (z. B. „Grouping & aggregation“).
13. **Training und Demo-Repo:** Entscheidungen aus Phase 7 (Kapitel-Platzierung) und Phase 8 (Repo) mit vorlegen.

### 1c Beispiele

Pro Fall 1–3 ein vollständiges Aufrufbeispiel (≤ 15 Zeilen, Video-tauglich) mit erwartetem Ergebnis, dazu ein
Beispiel mit zwei Spaltenfeldern (z. B. `jahr` > `monat`) und eines mit zwei Wertfeldern. Ein Snippet für die
Videoreihe markieren („Pivot in 60 Sekunden – ohne Enterprise-Lizenz“).

---

## Phase 2 – Tests zuerst (Vitest)

Regeln aus CLAUDE.md §6: Specs **neben dem Code**, Importe wie Anwender (`from '@guiexpert/table'`). Erst gegen die
API aus dem Design-Dokument schreiben (rot), dann implementieren (Phase 3, grün). Die Fixture aus 005
(`packages/table/test-utils/grouping-fixtures.ts`: Referenzdaten, Generator für große Datenmengen) wiederverwenden und
um die erwarteten Pivot-Ergebnisse ergänzen. `test-utils/` kommt nie ins npm-Paket. Die Aggregator-Tests gibt es schon
(005); hier nur testen, was Pivot zusätzlich braucht.

### 2a Unit (Node, `*.spec.ts`, Projekt `unit`)

z. B. `pivot/pivot-engine.spec.ts`, `factory/pivot-factory.spec.ts`:

- [ ] Fall 1–3 exakt, inkl. Gesamtsummen. `avg` Gesamt Jan = 76,67 (`toBeCloseTo`), **nicht** 77,5
- [ ] fehlende Kombination → `undefined` (nicht 0); der Platzhalter erscheint nur in der Anzeige
- [ ] jede eingebaute Aggregation einmal über die Pivot-Fabrik (die Aggregatoren selbst testet 005) und ein
      eigener Reducer; Zwischen- und Gesamtsummen per `merge` = ein Durchlauf über alle Rohwerte
- [ ] Feld als Property-Pfad und als Accessor-Funktion (z. B. Quartal aus einem ISO-Datum)
- [ ] Schlüssel-Randfälle: `null` / `undefined` / `''`, `1` vs. `'1'`, Trennzeichen im Schlüssel (`'a|b'` vs.
      `'a'` + `'|b'`, keine Kollision), `NaN`, `Date`
- [ ] nicht-numerische Werte bei `sum` / `avg` (Verhalten wie in Phase 1 festgelegt)
- [ ] Reihenfolge: Spaltenschlüssel natürlich und mit Comparator; Zeilengruppen nach Schlüssel und nach Aggregat
- [ ] `maxColumns`: Verhalten bei Überschreitung
- [ ] zwei Spaltenfelder → Header-Gruppen-Struktur (Labels, Spannweiten); zwei Wertfelder → Unterspalten
- [ ] Zwischensummen, Gesamtzeile und Gesamtspalte einzeln an und aus
- [ ] Quellfilter + Neuberechnung (`update(config)` oder neues Modell, je nach Entscheidung)
- [ ] leere Eingabe, eine Zeile, Feld ohne Treffer
- [ ] Quellzeilen werden nicht verändert (Vergleich mit `structuredClone` bzw. `Object.freeze`)
- [ ] Typen: `expectTypeOf` für die Generik (`create<Order>` erlaubt nur gültige Felder bzw. Accessoren). Geprüft
      wird das erst durch `test:types`, denn Vitest selbst prüft keine Typen

Das Unit-Projekt läuft mit `isolate: false`: kein Modulzustand, Singletons im `beforeEach` zurücksetzen. Einmal mit
`test:unit --sequence.shuffle` auf Reihenfolge-Unabhängigkeit prüfen.

### 2b Performance

Keine Zeit-Assertions in `test:unit` (CI-Rechner schwanken). Stattdessen eine Bench-Datei mit `vitest bench`
(1 Mio. Quellzeilen, Ziel < 1 s in Node) und das Ergebnis im Design-Dokument notieren. Die Coverage-Konfiguration in
`packages/table/vitest.config.ts` schließt heute nur `*.spec.ts`, `*.demo.ts`, `*.if.ts` und `index.ts` aus. Eine
`*.bench.ts` unter `src/` zählt also als unabgedeckter Code: in `exclude` aufnehmen oder außerhalb von `src/` ablegen.

### 2c Browser (Chromium, `*.browser.spec.ts`, Projekt `browser`)

z. B. `pivot/pivot.browser.spec.ts`, Helfer aus `test-utils/mount-table.ts` (`mountTable`, `nextFrame`, `areaRows`,
`cellDiv`, `columnIndices`, `stylePx`, `destroyAllTables`):

- [ ] Fall 1 gerendert: Header-Labels, Zellwerte, Footer-Gesamtzeile, Gesamtspalte (fixiert, falls so entschieden)
- [ ] Fall 2: Baum auf- und zuklappen; Zwischensummen tragen `ge-table-pivot-subtotal`, Gesamtwerte `ge-table-pivot-total`
- [ ] zwei Spaltenfelder: mehrstufiger Header; Gruppe zuklappen behält die Spaltenbreiten
- [ ] Sortieren per Header-Klick auf eine Pivot-Spalte; Filter + `api.externalFilterChanged()`
- [ ] `api.downloadExcel()` und `api.copyToClipboard()` liefern die Pivot-Sicht (ZIP-Leser `test-utils/zip.ts`)
- [ ] **HTML-Injection:** `<img src="x" onerror=…>` als Zeilen- **und** als Spaltenschlüssel → kein `img`-Element,
      Text sichtbar (Muster: `renderer/renderer.browser.spec.ts` „HTML injection“)
- [ ] Neuberechnung ohne Neuaufbau (falls `update`) bzw. Modellwechsel; `destroy()` gibt alles frei
- [ ] Zeit über `nextFrame()` / `vi.waitFor`, keine festen `setTimeout`s, keine pixelgenauen Textbreiten

### 2d Wrapper (`pnpm test:wrappers`)

- [ ] Ein Pivot-Modell mindestens im React- und im Web-Component-Wrapper mounten (Smoke: `tableReady`, Zeilen,
      Modellwechsel = Neuaufbau + `destroy()`). Gemeinsame Helfer: `packages/table/test-utils/wrapper-test-utils.ts`

### 2e Weitere Prüfungen

- [ ] `pnpm --filter @guiexpert/table test:types`
- [ ] `pnpm --filter @guiexpert/table docs:check` (jedes neue `@example` kompiliert)
- [ ] Export-Snapshot: `pnpm exec vitest run -u src/index.spec.ts` (in `packages/table`), Diff prüfen: nur Zugänge,
      **kein** verschwundener Export
- [ ] `pnpm --filter @guiexpert/table test:coverage`: neue Dateien ≥ 95 % Zeilen / ≥ 90 % Zweige, Gesamtabdeckung
      (~97 % Zeilen) sinkt nicht

Fehler, die dabei in bestehenden Klassen auftauchen: zuerst ein roter Test, bei nicht sofort behobenen Fehlern
`it.fails('<richtiges Verhalten>')` + `// BUG:`, dazu ein Eintrag in `TODO.md`.

---

## Phase 3 – Implementierung (Core)

- Reihenfolge: DOM-freie `PivotEngine` auf Basis von 005 und 006 (Aggregatoren und Gruppierung nicht duplizieren) →
  Area-Modelle (Header / Body / Footer; Gruppenzeilen von Row Grouping wiederverwenden) → `PivotFactory` → CSS.
- Muss die gemeinsame Engine erweitert werden, nur additiv. Die Specs von 005 und 006 bleiben unverändert grün.
- Regeln (CLAUDE.md §5): **0 Runtime-Abhängigkeiten**; Daten nie unescaped in `innerHTML`; `instanceof` über
  Paketgrenzen meiden (`instanceof-workaround.ts` erweitern, z. B. `isPivot…`); bestehende öffentliche APIs nicht
  brechen; bestehende Tippfehler-APIs nicht umbenennen.
- CSS: Klassen `ge-table-pivot-*` in `packages/table/css/`, Variablen `--ge-table-pivot-*` in
  `table-color-vars.css` für light **und** dark (`html[data-theme]`). Angular übernimmt das CSS beim Build
  automatisch (`table.component.css` wird generiert).
- Jede neue öffentliche Datei in `packages/table/src/index.ts` exportieren; jedes Symbol bekommt `@category`.
- Builds grün: `pnpm build:core`, `pnpm build:libs`, `pnpm build:angular`. Größe von `packages/table/dist` vorher und
  nachher notieren.

---

## Phase 4 – Doku

- [ ] **JSDoc** mit `@example` für jedes öffentliche Symbol (wird zu https://gui.expert/api) →
      `pnpm --filter @guiexpert/table docs:check` (Okt. 2026: 283 Beispiele, 0 Fehler)
- [ ] Pivot-Symbole in die Kategorie von 005/006 (z. B. „Grouping & aggregation“); Pivot in
      `packages/table/typedoc-readme.md` erwähnen
- [ ] **API-Doc neu erzeugen**: `pnpm --filter @guiexpert/table typedoc:website`. Das erneuert auch
      `apps/webpage-guiexpert/src/training/api-index.json`, ohne den die `<ApiLink>`s im Training nicht bauen
- [ ] **`instructions.md`**: neuer Abschnitt in §5 „Creating table models“ direkt nach „Row grouping“ (z. B. §5.7
      „Pivot tables“), mit Verweis auf Row Grouping: Fall 1,
      Hierarchie, mehrere Werte, Filter und Neuberechnung, Grenzen (keine Drag-&-Drop-UI). Alle `ts`-Blöcke müssen
      kompilieren: Snippets extrahieren → `tsc` strict mit `paths` auf `packages/*/src` (CLAUDE.md §6)
- [ ] `packages/angular-table/instructions.md`: kurzes Angular-Beispiel (Komponente + `PivotFactory`), gegen
      Angular-22-Typen prüfen
- [ ] `README.md` (Root) und `packages/table/README.md` (Abschnitt „Features“): Pivot ergänzen
- [ ] `llms.txt` (Root) **und** `apps/webpage-guiexpert/public/llms.txt`: „Key Features“ und Kapitelzahl des Trainings
- [ ] `CLAUDE.md`: §3.4 Fabriken (`PivotFactory`), ggf. §3.6; §6 Zahlen (Tests, `docs:check`-Beispiele,
      „26 Live-Demos“); §10 Episoden-Backlog; §11 Kapitelzahl
- [ ] `TODO.md`: Pivot-Eintrag abhaken, Abschnitt „Für die Release-Notes (nächstes Release)“ um das Feature ergänzen,
      Funde eintragen

---

## Phase 5 – Demo-Modelle und Demo-Apps

- [ ] `packages/demo-table-models`: z. B. `createPivotModel(…)` (fester Seed, z. B. Bestellungen nach Land > Stadt ×
      Jahr > Quartal, Summe + Anzahl; vorhandene Daten aus `createOrderModel` / `model/order.if.ts` prüfen), in
      `src/index.ts` exportieren, `pnpm --filter @guiexpert/demo-table-models build`. Wird vom Website-Showcase genutzt
      (über `pre:build` nach `public/scripts/` kopiert)
- [ ] `apps/table-demo` (Plain TS, Aufnahme-Umgebung der Videos): Pivot-Beispiel
- [ ] `apps/angular-table-demo`: neue Route `pivot` + Eintrag in `apps/angular-table-demo/instructions.md`.
      **Achtung:** die App nutzt noch die npm-Pakete (s. `TODO.md`), läuft also erst nach dem Release oder nach der
      Kopplung an lokale Builds
- [ ] Framework-Demos (`apps/react-table-demo` …): optional, eine reicht

---

## Phase 6 – Website gui.expert (`apps/webpage-guiexpert`) 🛑 kein Deploy

- [ ] **Showcase `pivot`** (Muster: `timetable`):
  - `src/pages/showcase/pivot/run.astro` + `info.astro`
  - `src/components/showcase/pivot/run.astro`
  - Vorschaubild `src/assets/screens/thumbs/pivot.png` + Kachel in `src/components/showcase/index.astro`
  - optional `src/content/showcase/pivot.json` (`featured`)
- [ ] **Feature-Liste**: `src/components/features.astro`
- [ ] **Aussagen „kein Pivot“ korrigieren.** Row Grouping teilt die gemeinsame Vergleichszeile „Row grouping / pivot“
      in zwei Zeilen auf. Hier wird die Zeile „Pivot tables“ auf ✔ gesetzt. Falls Row Grouping die Zeile noch nicht
      aufgeteilt hat, beides hier erledigen. Betroffene Stellen:
  - `src/components/home/why.astro`: Vergleichstabelle `ROWS` und die „Rule of thumb“ darunter
  - `src/pages/training/build-buy-or-guiexpert.astro`: Tabellenzeile(n) und Absatz darunter
  - `src/pages/training/checklist.astro`: Liste dessen, was nicht eingebaut ist
  - Ehrlich bleiben: was weiterhin fehlt (Drag-&-Drop-Pivot-UI bzw. Gruppenleiste, Server-Side-Row-Model), bleibt als
    fehlend stehen. Wortwahl nach CLAUDE.md §8: „MIT-lizenziert, kostenlos auch kommerziell“, keine Preise; ag-Grid
    sachlich („dort ein Enterprise-Feature“)
  - Beiträge unter `src/pages/post/` bzw. `src/components/post/` auf Vergleichsaussagen prüfen
- [ ] API-Seiten: kommen aus Phase 4 (`typedoc:website`)
- [ ] Bauen: `pnpm build:core && pnpm --filter @guiexpert/demo-table-models build && pnpm build:webpage-guiexpert`
      (der Build prüft ApiLinks, ChapterLinks, Showcases und Screenshots); lokal `pnpm serve:webpage-guiexpert`,
      Showcase in light **und** dark ansehen
- [ ] **Kein Deploy** (`deploy.cjs` / FTP) ohne ausdrückliche Freigabe

---

## Phase 7 – Training-Kapitel (gui.expert/training)

**Platzierung (in Phase 1 bestätigen):** Kapitelnummer `no` und `episode` hängen am Git-Tag `ep-NNN` des Demo-Repos.
Bis Okt. 2026 gibt es 34 Kapitel, Kapitel 34 ist das Finale „Checklist“. Neue Kapitel kommen hinten in
Teil 8 (`PartId` `"advanced"`, s. `000-arbeitsweise.md`); 006 legt dort `row-grouping` an.

- **Option A (Empfehlung):** Kapitel `pivot-tables` mit der nächsten freien Nummer in Teil 8, möglichst direkt nach
  `row-grouping`.
  Keine Umnummerierung, alle Tags und Links bleiben gültig. Hat Row Grouping anders entschieden, dessen Platzierung
  folgen (Pivot steht immer direkt nach Row Grouping).
- **Option B:** in einen der bestehenden Teile einsortieren. Dann müssen alle Kapitel und Folgen dahinter umnummeriert
  und die Tags im Demo-Repo verschoben werden, und bestehende Links brechen. Nur mit gutem Grund.

Vorher in `chapters.ts` nachsehen, welche Nummer wirklich frei ist.

Umsetzung (Muster: `row-grouping`, `header-groups`; Ablauf CLAUDE.md §11):

- [ ] `src/training/chapters.ts`: Eintrag in `CHAPTERS` (`slug: "pivot-tables"`, `part` wie `row-grouping`, `lead`,
      `learn`, `api` mit allen neuen Symbolen, `showcases: [{ name: "pivot", … }]`, `since` = Release-Version, s.
      „Arbeitsweise“); Kopfkommentar `ep-001 … ep-NNN`
- [ ] Seite `src/pages/training/pivot-tables.astro` mit `<TrainingLayout slug="pivot-tables">`. Inhalt: Pivot vs.
      Transponieren vs. Row Grouping, Fall 1 → Hierarchie → zwei Wertfelder, die Mittelwert-Falle, Filter und
      Neuberechnung, Grenzen. Querverweise per `<ChapterLink>` auf `row-grouping`, `header-groups`, `tree-table`,
      `footer-totals`, `filtering`, `excel-export`, `build-buy-or-guiexpert`; im Kapitel `row-grouping` umgekehrt auf
      `pivot-tables` verweisen
- [ ] Live-Demo `src/training/demos/pivot-tables.ts` (`export default (ctx: DemoContext) => cleanup?`), Daten aus
      `./shared/orders` (fester Seed; Felder `date`, `country`, `city`, `category`, `product`, `quantity`, `total` →
      z. B. Land > Stadt × Jahr > Quartal per Accessor aus `date`), Code-Bereiche mit `// #region` für `<Snippet>`
- [ ] Screenshot-Eintrag in `scripts/training-screenshots.mjs`, Bilder
      `src/assets/training/shots/demo-pivot-tables-light.png` / `-dark.png`
- [ ] Typprüfung: `pnpm --filter webpage-guiexpert check:training` (nach `pnpm build:core`)
- [ ] Zahlen nachziehen (Kapitel-, Folgen- und Live-Demo-Zahl; Stand vor Row Grouping: „34 Kapitel“, „ep-034“,
      „26 Live-Demos“): `CLAUDE.md` §6 + §11, beide `llms.txt`, `TODO.md`, `training-examples/README.md`,
      Kopfkommentar `chapters.ts`. Suche (Zahlen anpassen):
      `grep -rn "3[45] chapters\|3[45] Kapitel\|3[45] short chapters\|ep-03[45]\|2[67] Live-Demos" --exclude-dir=node_modules .`

---

## Phase 8 – Demo-Repo 🛑

Jedes Kapitel verlinkt einen Tag im Demo-Repo **`krocon/guiexpert-table-step-by-step-demo`** (`DEMO_REPO` /
`demoTagUrl()` in `chapters.ts`). Das Repo liegt **nicht** im Mono-Repo und muss in der Sitzung erst verbunden bzw.
geklont werden.

- **Entscheidung (in Phase 1 vorlegen):**
  - **A (Empfehlung):** neue Folge im bestehenden Repo: Commit + Tag **`ep-NNN`** (= Kapitelnummer, nach der Folge
    von Row Grouping), Struktur wie die bisherigen Folgen (ggf. `frameworks/`). Passt ohne Änderung zu `demoTagUrl()`.
  - **B:** eigenes Repo, z. B. `krocon/guiexpert-table-pivot-demo`. Dann braucht `chapters.ts` einen abweichenden Link.
  - Die Entscheidung von Row Grouping (Phase 8 dort) gilt hier sinngemäß. Beide Folgen gehören ins selbe Repo.
- **Abhängigkeit:** prüfen, ob das Demo-Repo die veröffentlichten npm-Pakete nutzt. Dann gibt es `PivotFactory` dort
  erst nach dem Release mit Pivot. Bis dahin auf einem Branch arbeiten und den Tag erst nach dem Release setzen.
- **Offener Punkt aus `TODO.md`:** die Tags `ep-001` … `ep-034` sind evtl. noch nicht gepusht. Fehlende Tags
  zusammen mit dem neuen pushen.
- Repo anlegen, pushen, Tags setzen: **nur nach ausdrücklicher Freigabe**.
- Framework-Code, der im Training gezeigt wird, nach `apps/webpage-guiexpert/training-examples/` kopieren (README dort:
  Tag aktualisieren).

---

## Phase 9 – Video-Folge

- [ ] Ordner `videos/NN-pivot-ohne-enterprise/` (NN = nächste freie Nummer; Muster `videos/01-zwei-millionen-zeilen/`):
      `script.md` (Hook 0–8 s → Code 8–40 s → Ergebnis live 40–55 s → CTA gui.expert 55–60 s), `snippet.ts`
      (≤ 15 Zeilen, kompiliert gegen die echte API), `demo.html` (Aufnahme-Seite)
- [ ] Titel-Vorschlag „Pivot-Tabelle in 60 Sekunden – ohne Enterprise-Lizenz“; Kernbotschaft: MIT-lizenziert, null
      Abhängigkeiten, ein Core für alle Frameworks
- [ ] `videos/README.md` (Tabelle) und `CLAUDE.md` §10 Episoden-Backlog (neue Zeile; Basis: Showcase `pivot`,
      Training `pivot-tables`)
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

- Showcase und Training-Demo im Browser ansehen (light und dark), `instructions.md`-Snippets kompilieren.
- Ergebnisse von Fall 1–3 gegen eine unabhängige Rechnung prüfen (z. B. kurzes Skript oder Tabellenkalkulation).
- Abschluss-Review durch einen separaten Agenten, der den Code nicht geschrieben hat. Schwerpunkte:
  Korrektheit der Aggregation, Escaping, Breaking Changes, Doku = Code, Aussagen auf der Website.

---

## Definition of Done

**Phase 1 – Entwurf**
- [ ] `prompts/007-pivot.design.md`: Bausteinanalyse, Signaturen, Entscheidungen mit Empfehlung, offene Fragen
- [ ] Beispiele für Fall 1–3, zwei Spaltenfelder, zwei Wertfelder, mit erwarteten Ergebnissen
- [ ] Entscheidungen Kapitel-Platzierung (Phase 7) und Demo-Repo (Phase 8) vorgelegt
- [ ] 🛑 Entwurf freigegeben

**Phase 2–3 – Tests und Code**
- [ ] Unit-, Browser-, Wrapper- und Typ-Tests vorhanden und grün; Shuffle-Lauf grün; Bench-Ergebnis notiert
- [ ] Coverage-Ziele erreicht; Export-Snapshot aktualisiert (nur Zugänge)
- [ ] Core, Libs und Angular 14–22 bauen

**Phase 4 – Doku**
- [ ] JSDoc + `docs:check` grün, typedoc-Kategorie, API-Doc neu erzeugt
- [ ] `instructions.md` (Snippets kompilieren), Angular-Instructions, READMEs, beide `llms.txt`, `CLAUDE.md`, `TODO.md`

**Phase 5–7 – Demos, Website, Training**
- [ ] `createPivotModel` in `demo-table-models`, Pivot-Beispiel in `apps/table-demo` (Angular-Demo: Route + Hinweis)
- [ ] Showcase `pivot` + Kachel + Feature-Liste; Vergleichszeile „Pivot tables“ auf ✔, „kein Pivot“-Aussagen
      korrigiert (`why.astro`,
      `build-buy-or-guiexpert`, `checklist`)
- [ ] Training-Kapitel `pivot-tables` mit Live-Demo, Screenshots, `check:training` grün; Zahlen nachgezogen
- [ ] `pnpm build:webpage-guiexpert` grün; kein Deploy

**Phase 8–9 – Demo-Repo und Video**
- [ ] 🛑 Demo-Repo: Entscheidung umgesetzt, Push/Tag erst nach Freigabe (und nach dem Release)
- [ ] `videos/NN-pivot-ohne-enterprise/` mit `script.md`, `snippet.ts`, `demo.html`; `videos/README.md`, CLAUDE.md §10

**Immer**
- [ ] Kein Publish, kein Deploy, keine Versionsänderung, kein Push ohne ausdrückliche Anweisung
