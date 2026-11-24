# 027 – Cover Grid: Kacheln füllen die Breite (eine Option statt `fillWidth` + `ResizeObserver`)

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Phasen, Regeln, Phase 10 =
> Release-Block). Feature-Prompt, Umfang M. **Haltepunkt nach Phase 1** (Design-Notiz
> `prompts/027-cover-grid-volle-breite.design.md`, 1–2 Seiten) für die Entscheidungen unten.
> Jede Core-Änderung folgt der Regel „zuerst ein roter Test“. Branch: `feat/cover-grid-volle-breite`.
> Zielversion: die nächste nach `packages/table/package.json` (Stand 24.11.2026: 1.1.116 → **1.1.117**), nur eintragen.
>
> Herkunft: Hands-on-Film „Cover Grid zum Nachbauen“ (Repo `videoserien`, Serie `covergrid`, Demo
> `github.com/krocon/cover-grid-demo`), Befund **G4**: „Volle Breite“ geht heute nur mit eigenem Code der App.
> Der Film zeigt diesen Code bewusst als Lehrstück (Kapitel 011 „Kacheln strecken“); dieses Feature macht ihn für alle
> anderen überflüssig. Danach kann der Film einen Hinweis „seit 1.1.117 eine Option“ bekommen (nicht Teil dieses Prompts).

## Befund

Das Cover Grid rechnet `Spalten = floor(width / coverWidth)` (`CoverGridBodyModel.getColumnCount()`,
`packages/table/src/lib/table/data/tablemodel/areamodel/cover-grid-body-model.ts`). Die Kacheln behalten ihre Breite –
rechts bleibt ein Rand (bei 960 px und 165 px: 5 Spalten, 135 px leer). Außerdem reagiert die Tabelle auf eine neue
Fensterbreite erst nach `resizeEventDebounceDelay` (Default **500 ms**, `TableOptions`), die Spalten springen sichtbar
spät.

Jede App, die eine Galerie „in voller Breite“ will, schreibt deshalb heute (Demo `cover-grid-demo`, `src/main.ts`, Stand 10):

```ts
const RATIO = 220 / 165;  // Seitenverhältnis des Covers
const CAPTION = 44;       // zwei Textzeilen unter dem Cover
let wanted = 165;         // Wunschbreite einer Kachel (Regler in der App)

function fillWidth() {
  const body = model.bodyModel;
  const cols = Math.max(1,
    Math.floor(body.width / wanted));
  body.coverWidth = Math.floor(body.width / cols);
  body.coverHeight =
    Math.round(body.coverWidth * RATIO) + CAPTION;
  api.repaintHard();
}
new ResizeObserver(() => {
  api.recalcColumnWidths();
  fillWidth();
}).observe(host);
```

Schwächen dieses App-Codes (gehören in die Tests):
- Ein zweiter `ResizeObserver` neben dem der Tabelle (`ResizeHandler`), zwei Renders je Größenänderung
  (`repaintHard` der App + der entprellte der Tabelle nach 500 ms).
- `Math.floor(body.width / cols)` lässt bis zu `cols − 1` Pixel Rest; die letzte Kachel sitzt nicht bündig am Rand.
- Die App muss `body.width` kennen und `recalcColumnWidths()` vorher aufrufen – sonst rechnet sie mit der alten Breite.
- Die Scrollposition springt: neue Kachelhöhe → andere Zeile oben (seit 1.1.116 hält der Zustandsdienst das oberste
  **Item** nur beim Wiederherstellen, prüfen, ob das auch hier greift – s. Entscheidung 4).
- Fehlt beim Start der erste Aufruf (`fillWidth()` nach `firstInit()`), zeigt das Grid zuerst den Rand.

## Ziel

```ts
const options: TableOptionsIf = {
  ...CoverGridFactory.createCoverGridDefaultOptions(height),
  coverGridFill: { tileWidth: 165, aspectRatio: 220 / 165, extraHeight: 44 }   // Name: Entscheidung 1
};
// später, z. B. Größen-Regler – kein neues Modell, kein eigener Observer:
api.setCoverGridTileWidth(220);                                                  // Name: Entscheidung 3
```

- Spalten = `max(1, floor(Breite / tileWidth))`, dann füllen die Kacheln die **ganze** Breite: die Restpixel werden auf
  die ersten Spalten verteilt (oder: Entscheidung 2), die letzte Kachel endet bündig am Rand (auch mit klassischem
  Scrollbalken: `getLayoutWidth()`, CLAUDE.md §3.2).
- Höhe = `round(Kachelbreite × aspectRatio) + extraHeight` (ohne `aspectRatio`: Höhe bleibt `coverHeight`).
- Reaktion auf eine neue Breite **im selben Frame** wie die Größenänderung (kein 500-ms-Sprung), höchstens **ein**
  Render je Änderung (Invariante aus 021).
- Ohne die Option: bit-gleich wie heute (Snapshot/Invarianten).

## Entscheidungen (Design-Notiz, mit Empfehlung)

1. **Wo steht die Einstellung?** (a) `TableOptionsIf.coverGridFill: true | Partial<CoverGridFillOptionsIf>` (Marcs Wunsch:
   „in den Options angeben“; wirkt nur, wenn der Body ein `CoverGridBodyModel` ist – sonst eine Warnung) · (b) Parameter
   von `CoverGridFactory.createCoverGridModel(…, { fill })` · (c) Eigenschaft am Body-Modell. Empfehlung (a) mit
   `CoverGridFactory.createCoverGridDefaultOptions(height, key, { fill })` als bequemem Weg; der Rechenkern
   (Spalten, Breiten, Höhe) DOM-frei im Body-Modell bzw. `cover-grid/fill-width.ts`, damit er auch ohne Options
   testbar ist.
2. **Restpixel:** (a) auf die ersten `rest` Spalten je 1 px mehr (bündig, Breiten unterscheiden sich um 1 px) · (b) alle
   gleich, `floor`, Rest links/rechts als Rand verteilt (zentriert) · (c) wie heute rechts. Empfehlung (a); prüfen, ob
   `getColumnWidth(i)` je Spalte verschieden sein darf (Positionen über `getColumnLeft`/Summen – `CoverGridTableModel`
   rechnet heute `columnIndex * getColumnWidth(columnIndex)`!).
3. **Größe zur Laufzeit:** `api.setCoverGridTileWidth(px)` (ein Render, Fokus/oberstes Item bleiben) oder die App setzt
   `options.coverGridFill.tileWidth` + `repaintHard()`. Empfehlung: API-Methode (Options sind nach `firstInit` sonst
   unveränderlich, vgl. `spreadsheetOption`).
4. **Scrollposition beim Umbruch:** Wechselt die Spaltenzahl oder die Kachelhöhe, bleibt das **oberste sichtbare Item**
   oben (gleicher Mechanismus wie seit 1.1.116 im Zustandsdienst / `TileLayoutIf.indexOfTile`), nicht die Pixel.
5. **Sofort reagieren:** Für Cover Grids mit `coverGridFill` die Breite im `ResizeObserver`-Callback synchron übernehmen
   (rAF-gedrosselt, ein Render) statt nach `resizeEventDebounceDelay`. Prüfen, ob das allgemein (alle Tabellen) sinnvoll
   ist – wenn ja, nur als eigene, getrennt dokumentierte Änderung; der Default von `resizeEventDebounceDelay` bleibt.
6. **Mindest-/Höchstbreite:** `minTileWidth`/`maxTileWidth` (eine Spalte mehr, sobald die Kachel breiter als `max`
   würde)? Empfehlung: nur `tileWidth` (= Mindestbreite wie im Film), Rest als Ausblick in `TODO.md`.

## Umsetzung (nach Freigabe)

- Interface `CoverGridFillOptionsIf` in eigener `.if.ts` (`tileWidth`, `aspectRatio?`, `extraHeight?` …), Export in
  `src/index.ts`, `@category Cover grid` (bzw. die vorhandene Kategorie des Cover Grids), JSDoc mit `@example`
  (kompiliert in `docs:check`).
- `CoverGridBodyModel` / `CoverGridTableModel`: Spaltenbreiten aus dem Rechenkern; `getColumnCount()` unverändert ohne
  Option. Keyboard-Navigation aus 024 (`TileLayoutIf`), Fokus und Zustand aus 025 dürfen nicht leiden.
- `TableScope`/`RenderScope`: Breite → Rechenkern → **ein** `repaintHard`; `destroy()` gibt alles frei.
- Wrapper: kein Code (Option wie jede andere); ein Smoke-Test React + Web Component mit der Option.
- Doku: `instructions.md` 5.10 (Cover Grid) neuer Abschnitt „Volle Breite“ + FAQ 6.26, `llms.txt` Rezept
  „Cover Grid in voller Breite“ (`pnpm check:llms`), `packages/table/README.md` Quick answer, JSDoc von
  `createCoverGridDefaultOptions`. Website: Showcase `covergrid` auf die Option umstellen (vorher/nachher prüfen),
  Eintrag in `src/features/new-features.ts` (`check:features`), Training-Abschnitt beim Cover Grid.
- Demo `apps/table-demo/cover-grid.html`: Umschalter „volle Breite“ + Größen-Regler über die neue API.

## Tests (zuerst rot)

- Unit (DOM-frei, Rechenkern): 960 / 165 → 5 Spalten, Breiten 192 × 5 = 960 (bündig); 961 → Restpixel nach
  Entscheidung 2; Breite < tileWidth → 1 Spalte = ganze Breite; Breite 0 → keine Division durch 0, 1 Spalte;
  `aspectRatio` + `extraHeight` → Höhe; ohne `aspectRatio` → `coverHeight` bleibt.
- Browser: Cover Grid mit Option, 10.000 Items, Host 960 px → letzte Kachel endet bei x = Layoutbreite (± 0,5 px), auch
  im Projekt `browser-scrollbars` (klassischer Balken) und in RTL (`describe.each(DIRECTIONS)`).
- Browser: Host von 960 auf 620 px → im **nächsten Frame** 3 Spalten (nicht erst nach 500 ms), **ein** Render
  (`countRenders`, `perf-invariants.browser.spec.ts`), oberstes Item bleibt oben.
- Browser: `setCoverGridTileWidth(115)` / `(280)` → Spaltenzahl und Höhe stimmen, ein Render, Fokus-Item bleibt (024).
- Ohne Option: bestehende Cover-Grid-Specs unverändert grün; keine `console.warn`.
- `test:perf`: Szenario „Cover Grid Resize mit Fill“ (10.000 vs. 1 Mio. Items → gleiche Zeit).

## Abnahme

- Der App-Code oben schrumpft auf die Option (+ eine Zeile für den Regler); Showcase und Demo nutzen sie.
- `pnpm ci:local` grün; Release-Block nach `000-arbeitsweise.md` Phase 10 (Marc führt ihn aus).
- `prompts/README.md`: Status-Zeile und Haken für 027.
