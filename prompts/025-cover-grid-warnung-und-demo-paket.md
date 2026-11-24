# 025 – Cover Grid ohne Konsolen-Warnung, `demo-table-models` ohne Ballast

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Phasen, Regeln, Phase 10 =
> Release-Block). Bugfix-Prompt, Umfang S–M: Phasen dürfen zusammengelegt werden. **Kurzer Haltepunkt nach Phase 1**
> nur für die Entscheidungen unten (Design-Notiz `prompts/025-cover-grid-warnung-und-demo-paket.design.md`, eine Seite).
> Jede Core-Änderung folgt der Regel „zuerst ein roter Test“. Branch: `fix/cover-grid-warnung-demo-paket`.
> Zielversion: die nächste nach `packages/table/package.json` (Stand 24.11.2026: 1.1.115 → **1.1.116**), nur eintragen.
>
> Herkunft: Demo-Projekt zum Hands-on-Film „Cover Grid zum Nachbauen“ (`github.com/krocon/cover-grid-demo`, Konzept im
> Repo `videoserien`, `prompt/covergrid-KONZEPT.md`, Befunde **G10** und **G11**). Gefunden im Probelauf mit den
> veröffentlichten Paketen 1.1.115 (Vite 8.3.8, Chromium).

## Teil A – Konsolen-Warnung bei jedem Start eines Cover Grids (G10, Pflicht)

### Befund

Jede App mit `CoverGridFactory.createCoverGridDefaultOptions(…)` (auch dem alten Namen) schreibt beim Start:

```
GuiExpert Table: the body model has no row objects – these rows are not stored.
Set autoRestoreOptions.getRowId = (_row, rowIndex) => rowIndex to store them by index.
```

Weg dorthin (`packages/table/src/lib/table/state/table-state.service.ts`):
- Die Default-Options des Cover Grids schalten `autoRestoreScrollPosition: true` ein und setzen `getStorageKeyFn`.
- `computeScroll()` (`:646`) merkt sich zusätzlich zur Pixelposition die **erste sichtbare Zeile** als Id:
  `idAt(first, this.warns("scroll"))` → `body.getRowByIndex(first)`.
- `CoverGridBodyModel.getRowByIndex()` liefert immer `undefined` (eine Reihe im Cover Grid ist kein Datensatz, sondern
  `perRow` Kacheln) → `idOfRow` (`:1038`) warnt einmal je Tabelle.

Die Warnung ist für das Cover Grid **falsch**: Die App hat nichts falsch gemacht, und der Rat (`getRowId` mit Index)
wäre schädlich – eine Reihennummer hängt an der Fensterbreite (Spaltenzahl) und zeigt nach einer Größenänderung auf
andere Cover. Jeder, der das Cover Grid nachbaut, sieht die Warnung in den DevTools.

### Entscheidung (im Design festhalten)

| Option | Bewertung |
|---|---|
| (a) **Kachel-Layout erkennen**: hat das Body-Modell `getTileLayout?.()` (seit 1.1.115), merkt sich `computeScroll()` statt der Reihe das **Item** der ersten sichtbaren Kachel (`getTileAt(firstRow * perRow)` → Id über `getRowId` bzw. `id`/`uuid` des Items) und stellt beim Laden über `indexOfTile` wieder her; ohne Id nur die Pixelposition – **ohne** Warnung | Empfehlung: richtig für Kacheln (überlebt andere Spaltenzahl), nutzt den Hook aus 024 |
| (b) Für Kachel-Layouts `firstRowId` ganz weglassen, nur Pixelposition, keine Warnung | klein, aber die Position springt nach einer Größenänderung |
| (c) Default-Options setzen `getRowId: (_row, i) => i` | falsch (Reihe ≠ Item, s. oben) – nicht machen |

Dazu prüfen: Welche anderen Zustandsteile können im Cover Grid warnen (`tree`, `checked`, `details`, `selection` –
`warns(part)` nur, wenn der Teil gespeichert wird)? In den Default-Options sind sie aus; trotzdem mit einem Test belegen,
dass ein Cover Grid mit `createCoverGridDefaultOptions` **keine** `console.warn`/`console.error` erzeugt.

### Tests (zuerst rot)

- Browser: Cover Grid mit `createCoverGridDefaultOptions(220, () => "covers")`, 10.000 Items, `vi.spyOn(console, "warn")`
  → nach `firstInit()`, Scrollen, Warten auf den entprellten Zustand (`stateChangedDebounceDelay`) und `destroy()`
  **0** Aufrufe.
- Mit (a): scrollen, Zustand speichern, Breite ändern (andere Spaltenzahl), neu aufbauen → dieselbe erste Kachel
  (Item) ist sichtbar; Items ohne `id` → nur Pixelposition, keine Warnung.
- Bestehende Specs zur Warnung (`state/table-state.browser.spec.ts`, normale Tabellen ohne Zeilenobjekte) bleiben grün:
  Dort ist die Warnung weiter richtig.

## Teil B – `@guiexpert/demo-table-models` zieht 624 kB Wetterdaten in jede App (G11, Pflicht)

### Befund (gemessen 24.11.2026, Produktions-Build mit Vite 8.3.8)

| App | Bundle | gzip |
|---|---|---|
| Cover Grid nur mit `@guiexpert/table` (eigener Mini-Renderer) | 542 kB | 153 kB |
| dieselbe App mit `import { BookCoverRenderer } from "@guiexpert/demo-table-models"` | 1.166 kB | 212 kB |

Fast der ganze Zuwachs (≈ 613 kB minifiziert) sind die **Seattle-Wetterdaten** der Heatmap-Demo (8.759 Stundenwerte),
obwohl die App keine Heatmap zeigt. Ursache: `packages/demo-table-models/src/lib/generateHeatmapSeattle.ts` rechnet
**beim Import** (Modul-Ebene, Zeilen 13–42):

```ts
const data: RawData[] = getRawData();     // 1 MB Daten
const map = {};
data.forEach(item => { … });              // Seiteneffekt → der Bundler muss alles behalten
const days = Object.keys(map);
const [MIN, MAX] = getMinMax();
```

Das ist der **einzige** Seiteneffekt auf Modul-Ebene im Paket (geprüft im gebauten `index.js`). Alles andere wird
weggeschüttelt – z. B. fehlen die Personendaten im Build. Folge außerdem: Die Schleife über 8.759 Werte läuft bei
**jedem** Seitenaufruf jeder App, die irgendetwas aus dem Paket importiert.

Weitere Funde im Paket (`dist/index.js` = **11 MB** unminifiziert, `index.cjs` 5 MB):
- Die Baum-Personendaten liegen **zweimal** im Quellcode, je ≈ 5,1 MB: `src/demodata/tree-persons.ts`
  (für `generateTreeCheckboxModel`) und `src/lib/treepeople/treePeopleData.ts` (`TREE_PEOPLE_DATA` für
  `createTreePeopleModelAndOptions`) – fast gleicher Inhalt, nicht byte-gleich.
- `package.json` hat kein `"sideEffects": false`.
- Der Dev-Server (Vite) lädt das ganze 11-MB-Modul (kein Tree-Shaking im Dev-Modus).

### Umsetzung

1. `generateHeatmapSeattle.ts`: Rechnung in eine Funktion mit Cache verlegen (beim ersten `createHeatMapSeattleModel()`
   bzw. erstem Zugriff des Area-Modells), nichts mehr auf Modul-Ebene. Showcase `heatmap2` unverändert.
2. `"sideEffects": false` in `packages/demo-table-models/package.json` (das Paket hat kein CSS) – auch in das
   veröffentlichte Manifest (`publishConfig.directory: "dist"` – prüfen, woher das Manifest in `dist/` kommt).
3. Doppelte Personendaten: auf **eine** Quelle zusammenführen (Unterschiede vorher vergleichen; beide Modelle müssen
   dieselben Zeilen zeigen wie heute – Showcases `treetable`, `treetablecheckbox` ansehen).
4. Im Design entscheiden (optional): die großen Datensätze als eigene Einstiegspunkte (`exports`:
   `"./data/tree-persons"`), damit `index.js` klein wird; oder nur Minifizierung des Builds. Abwägung: Breaking für
   Anwender, die die Daten direkt importieren? (Prüfen, was in `src/index.ts` exportiert wird.)
5. Kern `@guiexpert/table`: nur **prüfen**, ob er Seiteneffekte auf Modul-Ebene hat und ob `"sideEffects"` (mit
   Ausnahme `"**/*.css"`) etwas bringt (Messung wie oben: voller Core minifiziert 669 kB, Cover-Grid-App 542 kB).
   Nur umsetzen, wenn messbar und ohne Risiko; sonst Befund in `TODO.md`.

### Tests und Messung

- Ein **Bundle-Check**, der den Rückfall verhindert (im Design entscheiden, wo: Node-Skript in `scripts/`, in
  `pnpm ci:local` und `ci.yml`): eine Mini-App importiert nur `BookCoverRenderer` (und eine zweite nur `generateBooks`),
  Build mit Vite gegen `packages/demo-table-models/dist` → Bundle enthält keine Wetterdaten (z. B. kein `"pressure"`)
  und ist höchstens Core + wenige kB groß. Zahlen vorher/nachher in den Abschlussbericht.
- Heatmap-Showcase und Training-Demos, die Seattle-Daten nutzen, liefern dieselben Werte (vorhandene Specs, sonst ein
  kleiner Unit-Test: Min/Max/Anzahl Tage wie vorher).
- `pnpm --filter @guiexpert/demo-table-models build`: Größe von `dist/index.js` vorher/nachher notieren.

## Teil C – Website: Showcases laden 12 MB unminifiziertes JavaScript (prüfen, im Design entscheiden)

`apps/webpage-guiexpert` kopiert per `pre:build` die **unminifizierten** Builds nach `public/scripts/`
(`demo-table-models/index.js` 11 MB, `table/index.js` 1,3 MB). **21 Showcase-Seiten** laden
`/scripts/demo-table-models/index.js` direkt als ES-Modul – jeder Besucher eines Showcases lädt also das ganze
Demo-Paket (wie viel davon gzip/brotli auf dem Server spart, messen). Optionen: minifizierte Kopie ausliefern;
nach Teil B kleinere Einstiegspunkte; oder die Showcase-Skripte von Astro bündeln lassen. Kein Deploy.

## Doku

- `TODO.md`: beide Befunde eintragen und abhaken; „Für die Release-Notes (nächstes Release)“.
- `instructions.md` §5.10: falls die Warnung dort erwähnt ist oder ein Rat zu `getRowId` im Cover Grid steht, anpassen;
  sonst Satz „Scrollposition merkt sich das Cover Grid über das erste sichtbare Item“ (bei Option a).
- `CLAUDE.md` §3.6 (Zustand) kurz ergänzen; `prompts/README.md` (Zeile + Status).
- Kein Training, kein Video, kein Demo-Repo-Tag.

## Fertig, wenn

> Stand 24.11.2026: umgesetzt (Design-Notiz `025-cover-grid-warnung-und-demo-paket.design.md`); Website-Minifizierung
> des Cores (Teil C) als Befund in `TODO.md`.

- Teil A und B mit roten, dann grünen Tests; Bundle-Check läuft in `pnpm ci:local`; alle bestehenden Tests grün
  (`pnpm ci:local`).
- Cover-Grid-Demo (`apps/table-demo/cover-grid.html`) und Showcase `covergrid` ohne Warnung in der Konsole;
  Showcases `heatmap2`, `treetable`, `treetablecheckbox` unverändert.
- Abschlussbericht mit den Zahlen (Bundle der Mini-Apps, Größe `dist/index.js`, ggf. Website-Transfer) und dem
  Release-Block (Phase 10) für **1.1.116** – nur auf Anweisung ausführen.
