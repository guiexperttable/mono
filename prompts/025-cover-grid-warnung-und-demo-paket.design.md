# 025 – Design-Notiz: Cover Grid ohne Warnung, Demo-Paket ohne Ballast

> Zielversion 1.1.116, Branch `fix/cover-grid-warnung-demo-paket`. Bugfix, Phasen zusammengelegt (kein Training,
> kein Video, kein Demo-Repo). Die Entscheidungen wurden in der Sitzung selbständig nach den Empfehlungen des
> Prompts getroffen (Auftrag „selbständig arbeiten“) – bei Widerspruch hier korrigieren.

## Teil A – Scrollzustand eines Kachel-Layouts (G10)

| Baustein | wofür | Befund |
|---|---|---|
| `TableStateService.computeScroll` | `scroll.firstRowId` | fragte `getRowByIndex(first)` → im Cover Grid immer `undefined` → Warnung |
| `TableScope.getTileLayout()` / `TileLayoutIf` (1.1.115) | Item ↔ Index | passt: `getTileAt`, `getTilesPerRow`, `getTileCount` |
| `TableStateIf.scroll.firstRowId` | gespeicherte Id | wiederverwendet, kein neues Feld (JSON `version: 1` bleibt) |

**Entscheidung: Option (a).** Für einen Body mit `getTileLayout()` ist `firstRowId` die Id des **ersten Items der ersten
sichtbaren Reihe** (`tileIdAt(index)` = eigenes `getRowId(item, index)` bzw. `id`/`uuid`, `index` = Position in den
angezeigten Items). Laden (`applyTileScroll`): erst die Pixel; steht das Item danach nicht in der ersten sichtbaren
Reihe (andere Spaltenzahl, neue Items), `scrollToIndex(-1, floor(index / perRow))`; Item weg → Pixel bleiben.
Kacheln warnen **nie** (Items ohne Id, z. B. Bild-URLs, sind dort normal).

**Nachtrag (Wunsch von Marc nach der Sichtprüfung):** Die Cover-Grid-Demo passt die Kacheln erst **nach** der
Wiederherstellung an (`ResizeObserver` → `fitCoversToWidth` → `repaintHard()`) und landete deshalb nicht beim
gespeicherten Buch. Darum folgt die Scrollposition eines Kachel-Layouts jetzt auch **zur Laufzeit** dem obersten Item:
`TableScope.rememberTileScrollAnchor` (nach jedem Render-Durchgang, O(1); dasselbe Item, solange es in der obersten
Reihe steht – kein Wandern bei mehreren Größenwechseln) und `keepTileScrollAnchor` (vor dem Durchgang: andere
Spaltenzahl oder Reihenhöhe → Reihe des Items mit gleichem relativem Versatz, im selben Durchgang). Nur Geometrie,
nicht Filter/Sortieren/neue Items. Fängt auch die Review-Funde ab: Breite 0 beim Start (eine Spalte) und ein
Scrollbalken, der die Spaltenzahl nach der Wiederherstellung ändert. (b) verworfen: Position springt nach einer
Größenänderung; (c) verworfen: Reihe ≠ Item.

Andere Zustandsteile: `tree` (kein Baum), `checked` (kein `rowSelectionModel`), `details` (kein Master/Detail),
`selection` (in den Default-Options aus) warnen im Cover Grid nicht – belegt durch den Test „start, scroll, store,
destroy – no console.warn / console.error“ (beide Namen der Options-Fabrik). `selection` mit Kacheln bleibt
reihenbasiert (kein Auswahlmodell für Kacheln, TODO 024).

## Teil B – `@guiexpert/demo-table-models` (G11)

| Fund | Entscheidung |
|---|---|
| `generateHeatmapSeattle.ts` gruppiert 8.759 Werte auf Modul-Ebene | `getSeattleWeather()` mit Cache, Modell bekommt die Daten im Konstruktor |
| weitere Modul-Seiteneffekte (beim Messen gefunden): `createTimeTableModel.ts` (`.map()`, `new ColumnDef()`-Array, `{ ...new TableOptions() }`, +15 kB Core), `generateHeatMapTableModel.ts` (`.split().map()`) | Werte über Funktionen mit `/* @__PURE__ */`; Exporte `data`, `tableOptions`, `COL_IDX_UPDATED_AT` bleiben (Letzteres als Literal 16, Test prüft es) |
| `"sideEffects"` fehlt | `"sideEffects": false` (das Manifest in `dist/` ist die per `viteStaticCopy` kopierte `package.json`) |
| Personendaten doppelt (inhaltlich identisch: 100 Wurzeln, 10.000 Personen, 0 Abweichungen) | **eine** Quelle `demodata/tree-persons.ts` als JSON-Text, `createTreePersons()` parst je Aufruf (eigene Objekte je Modell); `treePeopleData.ts` gelöscht (nicht exportiert → kein Breaking Change) |
| Optional: eigene Einstiegspunkte für die Daten | **nein** – die Daten sind nicht exportiert, die Modell-Funktionen synchron; Unterpfade würden die API teilen. Tree-Shaking + JSON-Text reichen |
| Core `"sideEffects"` (B.5) | **nein** – gemessen ohne Wirkung (eine Datei); ~3 kB Rest (Formel-Funktionstabellen) → `TODO.md` |

Bundle-Check `scripts/check-demo-bundle.mjs` (`pnpm check:bundle`, in `ci:local` nach `build:all` und in `ci.yml` nach
`build:libs`): Vite-Build von drei Mini-Apps (Core-Referenz, `BookCoverRenderer`, `generateBooks`) über einen
temporären `node_modules` mit Symlinks auf die dists (`preserveSymlinks`); rot bei Daten-Marken (Wetter, Personen,
Zeitplan, Heatmap) oder > 10 kB über der Core-Referenz. Unit-Tests im Demo-Paket (erstmals Vitest, Lockfile +3 Zeilen):
Heatmap-Fingerabdruck von 1.1.115, „Import liest keine Wetterdaten“, Baum-Zeilen beider Modelle wie 1.1.115.

## Teil C – Website (nur geprüft)

nginx liefert gzip. Nach Teil B lädt ein Showcase `demo-table-models/index.js` mit 489 kB gzip statt 1.056 kB;
Minifizieren spart dort nur noch 9 kB → nicht umgesetzt. Der Core (`/scripts/table/index.js`, 39 Seiten) spräche
328 → 189 kB gzip, braucht aber einen Minifier als neue Website-Abhängigkeit → `TODO.md`. Kein Deploy.

## Zahlen (Vite 6.4.4, minifiziert)

| | vorher (1.1.115) | nachher |
|---|---|---|
| Mini-App `BookCoverRenderer` | 633,4 kB (gzip 69,9) | 11,1 kB (gzip 4,7) |
| Mini-App `generateBooks` | 626,3 kB (gzip 66,8) | 4,0 kB (gzip 1,7) |
| `demo-table-models/dist/index.js` | 10.708 kB (gzip 1.056) | 3.471 kB (gzip 489) |
| `demo-table-models/dist/index.cjs` | 4.972 kB | 3.132 kB |
