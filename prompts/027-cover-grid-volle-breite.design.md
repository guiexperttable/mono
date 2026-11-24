# 027 – Cover Grid in voller Breite · Design-Notiz (Phase 1)

> Prompt: `027-cover-grid-volle-breite.md` · Branch `feat/cover-grid-volle-breite` · Zielversion **1.1.117**.
> Status: freigegeben (24.11.2026), umgesetzt.

## Bestand

| Baustein | wofür | Befund |
|---|---|---|
| `CoverGridBodyModel.getColumnCount()` | Spalten | `floor(width / coverWidth)`, ≥ 1 – mit Fill: Spaltenzahl aus `tileWidth`, gespeichert im Layout (nicht aus dem gestreckten `coverWidth` zurückgerechnet) |
| `CoverGridTableModel.getColumnWidth(i)` / `getXPosByColumnIndex(i)` | Breite, x-Position | eine Breite für alle; `x = i × getColumnWidth(i)` → muss bei 1 px Unterschied summieren: `i × base + min(i, rest)` (O(1)) |
| `CoverGridTableModel.getContentWidthInPixel()` | Scrollbreite | `cols × coverWidth` → mit Fill exakt die Breite (`cols × base + rest`) |
| `RenderScope.adjustColumnsToRowParent` | Zellen zeichnen | summiert `getColumnWidth(index)` je Spalte → verschiedene Breiten gehen **ohne Änderung** |
| `TableScope.firstInit()` → `setParentWidth(getAvailableColumnWidth())` | Breite beim Start | passt: Fill rechnet vor dem ersten Render → kein Rand im ersten Bild |
| `getAvailableColumnWidth()` (Host − West − senkr. Balken) | Breite | passt = Layoutbreite des Centers (§3.2) |
| `adjustRelativeColumnWidthsToScrollBar()` | Neuverteilung, wenn der Balken kommt/geht | greift nur bei %-/Gewichtsspalten (`getColumnDefs()` – im Cover Grid `undefined`). **Muss erweitert werden**: Fill zählt als breitenabhängig, sonst liegt die letzte Kachel mit klassischem Balken unter dem Balken. Vermutlich hat das Cover Grid schon heute dort einen Fehler (eine Spalte zu viel → waagerechter Balken); in Phase 2 mit `browser-scrollbars` prüfen, ggf. `it.fails` + `// BUG:` |
| `ResizeHandler` | Resize | ein `ResizeObserver`, ganz entprellt (`debounce`, 500 ms) → braucht einen Sofort-Weg |
| `keepTileScrollAnchor` / `rememberTileScrollAnchor` (`TableScope`, 1.1.116) | oberstes Item bleibt oben | **passt schon**: andere Spaltenzahl **oder** andere Kachelhöhe → Position im selben Render-Durchgang auf die Reihe des Items (Spec `cover-grid-state.browser.spec.ts` „another width through the ResizeObserver“). Entscheidung 4 braucht keinen neuen Code, nur Tests mit Fill |
| `beforeRenderPass` (Fokus folgt dem Item, 024) | Fokus | passt, unabhängig von der Geometrie |
| `fitCoversToWidth` (`demo-table-models`) + eigene `ResizeObserver` in Showcase und `apps/table-demo` | heutige App-Lösung | wird durch die Option ersetzt; Funktion bleibt (Export = kein Breaking Change), JSDoc bekommt `@deprecated`-Hinweis auf die Option |

Kein Breaking Change: alles additiv (neue Option, neues Interface, neue optionale Methoden, neue API-Methoden);
ohne Option rechnen alle Methoden bit-gleich.

## Entscheidungen

**1. Wo steht die Einstellung? → (a) Option, Rechenkern im Body-Modell.**
`TableOptionsIf.coverGridFill?: boolean | Partial<CoverGridFillOptionsIf>`. `TableScope` gibt sie im Konstruktor an
das Body-Modell (`body.setFill(…)`, erkannt über `isCoverGridBodyModel` in `instanceof-workaround.ts`); anderer Body →
**eine** `console.warn`. Der Rechenkern ist DOM-frei (`cover-grid/cover-grid-fill.ts`: `computeCoverGridFill(width,
fill, coverHeight)` → `{ columns, baseWidth, rest, tileHeight }`) und das Modell nutzt ihn in `setParentWidth` – damit
auch ohne Tabelle testbar und für eigene Modelle nutzbar. **Kein** dritter Parameter an
`createCoverGridDefaultOptions`: der Spread ist genauso kurz und es gibt einen Weg statt zwei.
`true` = `{ tileWidth: coverWidth des Modells }`, Höhe bleibt `coverHeight`.

```ts
// cover-grid-fill-options.if.ts  (@category Table model – dort stehen CoverGridFactory/-Modelle)
export interface CoverGridFillOptionsIf {
  tileWidth: number;      // Wunsch- = Mindestbreite einer Kachel in px (Default: coverWidth des Modells)
  aspectRatio?: number;   // Höhe/Breite des Bildes; ohne: Höhe bleibt coverHeight
  extraHeight?: number;   // feste Zusatzhöhe (Beschriftung), Default 0
}
```

Das Modell schreibt die **wirksamen** Werte in `coverWidth`/`coverHeight` (Renderer, die `coverWidth` lesen –
`BookCoverRenderer` –, skalieren mit). Der Wunsch steht nur in `fill.tileWidth`.

**2. Restpixel → (a)** die ersten `rest` Spalten 1 px breiter; die letzte Kachel endet bündig. Höhe aus der
Grundbreite: `round(base × aspectRatio) + extraHeight` (alle Kacheln einer Reihe gleich hoch). Breite 0 (versteckter
Host) → 1 Spalte, Breite `tileWidth`, keine Division durch 0.

**3. Größe zur Laufzeit → eine API-Methode für alles:**
`tableApi.setCoverGridFill(fill: boolean | Partial<CoverGridFillOptionsIf>): boolean` (Teilangaben werden mit dem
aktuellen Stand zusammengeführt; `false` schaltet ab → Kachel = `tileWidth` × ungestreckte Höhe; `false` als Rückgabe,
wenn der Body kein Cover Grid ist) und `getCoverGridFill(): CoverGridFillOptionsIf | undefined`. **Ein** Render,
Fokus- und oberstes Item bleiben. Statt `setCoverGridTileWidth(220)`: `setCoverGridFill({ tileWidth: 220 })` – deckt
auch den Umschalter der Demo ab, ohne eine zweite Methode. Das Options-Objekt bleibt unverändert (wie
`spreadsheetOption`); ein Wrapper-Neuaufbau mit denselben Options startet wieder mit deren Wert (JSDoc).

**4. Scrollposition → vorhandener Mechanismus (1.1.116)**, nur mit Fill-Tests belegt (Spaltenzahl **und** Kachelhöhe
ändern sich gleichzeitig).

**5. Sofort reagieren → nur bei aktivem Fill.** Der `ResizeObserver` der Tabelle ruft bei aktivem Fill
`recalcColumnWidths(width)` **im Callback** auf (das Callback läuft nach dem Layout, vor dem Malen → derselbe Frame, je
Frame höchstens ein Callback = ein Render) und bricht einen anstehenden entprellten Aufruf ab; ohne Fill bleibt die
Entprellung. Gleiche Breite und Höhe wie beim letzten Durchgang → nichts. Allgemein für alle Tabellen nicht jetzt (ändert
Verhalten und Last großer Tabellen mit %-Spalten beim Fensterziehen) → Eintrag in `TODO.md`. Risiko: ein Host, dessen
Größe vom Inhalt abhängt, könnte „ResizeObserver loop“ melden – das Cover Grid braucht ohnehin eine feste Höhe (Doku).

**6. Min/Max → nur `tileWidth`.** `maxTileWidth`/`maxColumns` als Ausblick in `TODO.md`.

## Beispiel (Video-/Doku-tauglich)

```ts
const tableModel = CoverGridFactory.createCoverGridModel(books, renderer, 165, 264);
const tableOptions: TableOptionsIf = {
  ...CoverGridFactory.createCoverGridDefaultOptions(264, () => "books"),
  coverGridFill: { tileWidth: 165, aspectRatio: 220 / 165, extraHeight: 44 }
};
const tableApi = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter())
  .firstInit().getApi();
slider.oninput = () => tableApi.setCoverGridFill({ tileWidth: Number(slider.value) });
```

Erwartet: Host 960 px → 5 Spalten à 192 px, Höhe `round(192 × 4/3) + 44` = 300 px, letzte Kachel endet bei 960;
961 px → erste Spalte 193 px; Host auf 620 px → im nächsten Frame 3 Spalten (207, 207, 206 px), ein Render,
dasselbe Buch oben links.

## Tests (Phase 2, zuerst rot)

- Unit `cover-grid-fill.spec.ts` (Rechenkern + Modell): Fälle aus dem Prompt (960/961/< tileWidth/0, Höhe mit/ohne
  `aspectRatio`), `getXPosByColumnIndex`/`getContentWidthInPixel` summieren, `setFill(false)`, ohne Fill bit-gleich.
- Browser `cover-grid-fill.browser.spec.ts`: bündig (± 0,5 px zur Layoutbreite) in `describe.each(DIRECTIONS)`, im
  Projekt `browser-scrollbars` grün; Resize 960 → 620 im nächsten Frame, `countRenders` = 1, oberstes Item bleibt;
  `setCoverGridFill({ tileWidth: 115 | 280 })` → Spalten, Höhe, ein Render, Fokus-Item bleibt; falscher Body → eine
  Warnung; ohne Option keine Warnung. Invariante in `perf-invariants.browser.spec.ts`; `test:perf`-Szenario
  „Cover Grid Resize mit Fill“ (10.000 vs. 1 Mio. Items). Wrapper: Smoke React + Web Component mit der Option.

## Phasen 4–9

- **Doku**: JSDoc + `@example`, `instructions.md` 5.10 (Zeile „Fill the width“ + Hinweise unten) + FAQ 6.26, `llms.txt`
  Rezept, `packages/table/README.md` Quick answer, `CLAUDE.md` §3.6/§3.7, `TODO.md`.
- **Demos**: `apps/table-demo/cover-grid.html` und Showcase `covergrid` auf die Option umstellen (eigener Observer und
  `fitCoversToWidth` fallen weg; vorher/nachher ansehen); `createCoverGridModelAndOptions` bekommt `fill`.
- **Website**: Eintrag in `new-features.ts` (`check:features`), `doc.astro` (Option + API), Showcase-Info. Kein Deploy.
- **Training**: entfällt – es gibt kein Cover-Grid-Kapitel; die Doku und der Showcase reichen.
- **Demo-Repo / Video**: entfällt hier (Hinweis „seit 1.1.117 eine Option“ im Film `covergrid` ist ein eigener Schritt).

## Umsetzung – Abweichungen und Funde

- **Performance (auch ohne Option):** das `test:perf`-Szenario zeigte O(Reihen) je Resize – `CoverGridBodyModel` hatte
  kein `getConstantRowHeight()` (jedes `repaintHard` baute die Präfixsummen aller Reihen) und meldete
  `getMaxColspan/getMaxRowspan()` = 31 (jede neue Reihenzahl suchte Spans in allen Reihen). Jetzt `coverHeight` (nicht
  mit `firstRowPaddingTop`) bzw. 1 – Positionen bleiben gleich; eine Unterklasse mit Spans überschreibt beide.
- **Altfehler ohne Option:** mit klassischem Balken rechnete das erste Layout eine Spalte zu viel (waagerechter Balken
  bis zum entprellten Resize). Nach Rückfrage mitbehoben: jedes Cover Grid zählt in `hasRelativeColumnWidths()` als
  breitenabhängig (`cover-grid-scroll-bar.scrollbars.browser.spec.ts`).
- **Abschluss-Review (separater Agent):** (1) mit `aspectRatio` + klassischem Balken pendelte das Layout je
  `repaintHard` (schmaler → Balken weg → breiter → Balken da) → die Neuverteilung behält jetzt das schmalere Layout;
  (2) Unterklassen mit eigenen Spans/Zeilenhöhen → behalten das alte Verhalten; (3) ein Wrapper-Neuaufbau übernahm
  Laufzeitänderungen → die Option ersetzt die Einstellungen; (4) `coverWidth`/`coverHeight` sind mit Fill Ausgabe
  (JSDoc); (5) NaN/negative Eingaben abgefangen; (6) ein anstehender entprellter Resize wird beim Einschalten verworfen.
- **Training:** statt „entfällt“ ein kurzer Absatz + Versions-Callout im Abschnitt „Tiles“ von Kapitel 35
  (`accessibility#tiles`), weil `new-features.ts` einen Training-Abschnitt verlangt.
- Das Gegenbeispiel „99 px / 10 Spalten“ in der Bestandstabelle war falsch gerechnet (aus `floor(w / floor(w / c))` folgt
  für ganzzahlige `tileWidth` immer wieder `c`); die Spaltenzahl wird trotzdem gespeichert (klarer, auch für Bruchteile).
