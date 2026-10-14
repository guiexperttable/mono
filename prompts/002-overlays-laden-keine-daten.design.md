# Design 002 – Overlays „Lädt…“ und „Keine Daten“

> Prompt: `prompts/002-overlays-laden-keine-daten.md` · Branch `feat/overlays` · Zielversion **1.1.92** (`since`)
> Stand 14.10.2026. Abhängigkeit 001 (ARIA) ist auf `main` gemergt (`LiveAnnouncer`, `tableApi.announce`, `AriaIds`).
> **Freigegeben** 14.10.2026 (Antwort „go“): alle Empfehlungen aus § 8, Wrapper-Variante (a) Prop `loading`.

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `EleScope` (Konstruktor) | Overlay-Element | legt Hover-, Drag-, Area-, Viewport- und Rahmen-Divs **direkt im Host** an; Deko ist `aria-hidden` | ein Div `.ge-table-overlay` als **letztes Kind des Hosts** anlegen, einmal, `aria-hidden="true"` – **erweitern** |
| `EleScope.adjustContainersAndRows()` | Position | rechnet Header-/Footer-Höhe (`padding.top/bottom`) und Breite; wird bei Resize über `repaintHard()` aufgerufen | Overlay-Geometrie hier setzen (Body-Fläche, ohne vertikale Scrollbar) – **erweitern** |
| `RenderScope.adjustAfterScrolling()` | Zustand prüfen | läuft bei jedem `repaint()`/`repaintHard()`/Scroll | am Ende `updateOverlay()`: `getRowCount()` (O(1)), Klasse nur bei **Änderung** umschalten – **erweitern** |
| `TableScope.destroy()` | Aufräumen | gibt Listener, Observer, Live-Region frei | eigenes Overlay-Element (Fabrik) entfernen, `aria-busy` zurücksetzen, Timer stoppen – **erweitern** |
| `TableScope.externalFilterChanged()` | „Keine Treffer“ | sagt `ariaTexts.filtered(0)` = „No rows“ an, ruft `repaint()` | keine Änderung nötig (Repaint löst die Prüfung aus); keine zweite Ansage (§ 2.8) |
| `AreaModelIf` | „0 insgesamt“ vs. „0 nach Filter“ | nur `getRowCount()` (= gefiltert); `getAllRows()` gibt es nur in `AreaModelObjectArray` (`ObjectArrayHolderIf`), `AreaModelTree` hält die Knoten privat | optionales `getUnfilteredRowCount?(): number` – **additiv**; implementiert in `AreaModelObjectArray` und `AreaModelTree` |
| `TableOptionsIf` | Texte, Verhalten | – | optional `overlayOptions?: Partial<OverlayOptionsIf>` – **additiv** |
| `TableApi` | Steuerung | `announce()`, `repaint()` … | `showLoadingOverlay(text?)`, `showNoRowsOverlay(text?)`, `hideOverlay()`, `getOverlayState()` – **additiv** |
| `ShortcutService` / Tastatur | Blockade | Aktionen laufen über `ActionId` | während einer blockierenden „Lädt…“-Anzeige nur Navigation und Kopieren erlauben (§ 2.6) |
| `CrudTableModelFactory` | erster Nutzer | lädt die Liste **bevor** es ein Modell oder eine Tabelle gibt; `reloadRows()` lädt neu | § 2.9 |
| CSS (`table-classes.css`, `table-color-vars.css`) | Aussehen | `.ge-table-body-east { z-index: 999 }`; `main.css` wird per `cat css/table*.css` erzeugt | `.ge-table-overlay*`, Spinner per `@keyframes`, `prefers-reduced-motion`, 5 Variablen light/dark |
| Wrapper (7) | Prop `loading` | neues `tableOptions`-Objekt = Neuaufbau | § 2.3 (Entscheidung offen) |

**Breaking Changes:** keine. Alle neuen Member sind optional bzw. neue Methoden.
**Verhaltensänderung (Release-Notes):** Eine Tabelle mit leerem Body zeigt jetzt „No rows to show“ (abschaltbar mit
`overlayOptions: { autoNoRows: false }`). Wer heute eine eigene Leer-Anzeige über die Tabelle legt, sieht beides.

## 2. Entscheidungen

### 2.1 API (Frage 1) → vier Methoden, ein Zustand

```ts
// TableApi, alle @since 1.1.92, @category Overlays
showLoadingOverlay(text?: string): void;   // text: nur für diese Anzeige, z. B. "Saving…"
showNoRowsOverlay(text?: string): void;    // manuell, z. B. Server meldet "keine Berechtigung"
hideOverlay(): void;                       // beendet die manuelle Anzeige
getOverlayState(): GeOverlayKind;          // "none" | "loading" | "noRows" | "noMatches"
```

`GeOverlayKind` als Typ in `data/overlay/ge-overlay-kind.type.ts`.

| Option | Pro | Contra |
|---|---|---|
| **(a) vier Methoden** wie oben | sprechend, video-tauglich, nah an ag-Grid (`showNoRowsOverlay`, `hideOverlay`) | drei Mutatoren statt einem |
| (b) nur `showOverlay({ kind, text \| element })` | ein Einstieg | Aufrufer muss „kind“ kennen; Element pro Aufruf erschwert das Aufräumen |

**Empfehlung (a).** Rangfolge, wenn mehreres zutrifft: **manuell (loading / noRows) > noMatches > noRows (automatisch)**.
„Lädt…“ bei 0 Zeilen zeigt also „Lädt…“, nicht „Keine Daten“.

`hideOverlay()` beendet nur die **manuelle** Anzeige. Die automatische („No rows to show“ / „No matching rows“) ist ein
abgeleiteter Zustand und erscheint sofort wieder, wenn der Body leer ist (O2/O3/O5 ohne Sonderfälle). Wer sie nie will:
`autoNoRows: false`.

Direkt nach `firstInit()` aufgerufen (synchron) gibt es kein Flackern: der Browser malt erst danach.

### 2.2 Optionen (Frage 2) → `overlayOptions`, eigene Inhalte als Element-Fabrik

```ts
// data/options/overlay-options.if.ts – Defaults in class OverlayOptions
export interface OverlayOptionsIf {
  loadingText: string;                    // "Loading…"
  noRowsText: string;                     // "No rows to show"
  noMatchesText: string;                  // "No matching rows"
  autoNoRows: boolean;                    // true: leerer Body → noRows / noMatches automatisch
  blockInteractionWhileLoading: boolean;  // true: Maus/Tastatur auf dem Body gesperrt (§ 2.6)
  loadingDelayInMs: number;               // 0: sofort; z. B. 200 = kein Aufblitzen bei schnellen Antworten
  getOverlayElement?: (kind: GeOverlayKind, text: string) => HTMLElement | undefined;
}
// TableOptionsIf: overlayOptions?: Partial<OverlayOptionsIf>;
```

Eigene Inhalte:

| Option | Pro | Contra |
|---|---|---|
| **Element-Fabrik** `getOverlayElement(kind, text)` | sicher (kein HTML-Parsing), Frameworks können hineinrendern, eine Funktion für alle Arten (`undefined` = Standard) | ein paar Zeilen mehr als ein String |
| zwei Fabriken `loadingElement` / `noRowsElement` (wie im Prompt skizziert) | sehr direkt | „noMatches“ bräuchte eine dritte; wächst mit jeder Art |
| HTML-String | bequem | XSS-Risiko liegt beim Anwender; widerspricht CLAUDE.md § 5; Escaping-Test O10 wäre nur Doku |

**Empfehlung: eine Element-Fabrik, kein HTML-String.** Muster wie `getEditRenderer`. Das Element wird bei jeder Anzeige
**einmal** erzeugt, in den Overlay-Inhalt gehängt und beim Ausblenden, beim Wechsel der Art und in `destroy()` entfernt
(O11). Texte schreibt die Tabelle immer mit `textContent` (O10).

### 2.3 Wrapper (Frage 3) → **Empfehlung: Prop `loading`** (Entscheidung offen)

| Option | Pro | Contra |
|---|---|---|
| **(a) Prop `loading: boolean`** in React, Preact, Solid, Vue, Svelte, Angular (`@Input`), Web Component (Property `el.loading`) | deklarativ, so erwarten es Framework-Nutzer (ag-Grid hat seit v32 die Option `loading`); eigener Effekt, **kein** Neuaufbau | 7 Wrapper anpassen + testen; nach einem Neuaufbau (neues Modell) muss der Prop-Wert erneut angewendet werden |
| (b) nur API über `tableReady` | null Wrapper-Arbeit | imperativ in deklarativen Frameworks; jeder Anwender baut sich die Brücke selbst |

Mit (a): Der Wrapper ruft bei Änderung `showLoadingOverlay()` / `hideOverlay()` und wendet den Wert nach jedem
Aufbau einmal an. Smoke-Tests in **allen** Wrappern: Prop umschalten → Overlay sichtbar/weg, `tableReady` nur einmal.
Nur `loading`, keine Props für Texte (die gehören in `overlayOptions`).

### 2.4 Fläche (Frage 4) → **nur der Body**

Overlay im Host (nicht im Scroll-Content): `top` = Header-Höhe, `height` = Body-Höhe ohne Footer, `left` 0, `width` =
Viewport-`clientWidth` (ohne vertikale Scrollbar → Inhalt optisch mittig über den Zeilen; Scrollbar bleibt sichtbar).
Header und Footer bleiben lesbar (O1). Ausgeblendeter Header (`setHeaderVisible(false)`) → Höhe 0 → Overlay ab oben.
Liegt im Host, nicht im Content → bleibt beim horizontalen Scrollen stehen (O7). Inhalt per Flexbox zentriert,
`overflow: hidden` (sehr niedrige Tabellen schneiden ab statt zu überlaufen).
`z-index: 1000` (über `.ge-table-body-east` mit 999). Der Drag-Ghost liegt schon heute unter `body-east` – unverändert.

### 2.5 Leere Zeilen erkennen (Frage 5)

Ein Ort: Ende von `RenderScope.adjustAfterScrolling()` → deckt `setRows`, `addRows`, `removeRows`, Filter, Baum auf/zu,
`repaint`/`repaintHard` und Resize ab (O3, O5). Kosten: ein `getRowCount()` je Frame, DOM nur bei Zustandswechsel.

```
rowCount = body.getRowCount()
rowCount > 0                           → none
body.getUnfilteredRowCount?.() > 0     → noMatches
sonst                                  → noRows
```

Eigene `AreaModel`s ohne `getUnfilteredRowCount` bekommen immer „No rows to show“ (sicherer Default, kein falsches
„No matching rows“). Unbekannte Zeilenzahl (`getRowCount() < 0`, künftige Server-Modelle) → kein Overlay.

### 2.6 Interaktion blockieren (O6)

`blockInteractionWhileLoading: true` (Default): Overlay `pointer-events: auto` und halbtransparent – Klicks, Hover und
Mausrad auf dem Body landen am Overlay (Scrollbar rechts bleibt bedienbar). Tastatur: `START_EDITING`, `ACTIVATE_CELL`,
`TOGGLE_SELECTION` werden ignoriert, Navigation und Kopieren bleiben. Ein laufender Editor wird nicht abgebrochen.
`false`: `pointer-events: none`, alles geht durch.
„No rows“/„No matches“ blockieren nie (`pointer-events: none`) – Header-Klicks, Filter, Kontextmenü funktionieren.

### 2.7 Spinner (Frage 6) → reines CSS

Ein Kreis aus `border` mit farbigem oberen Segment, `@keyframes ge-table-spin` (transform rotate, GPU-freundlich).
`@media (prefers-reduced-motion: reduce)`: keine Drehung, statisches Segment (O8). Kein JS-Timer für die Animation.
Variablen in `table-color-vars.css` (light **und** dark, O9):

| Variable | light | dark |
|---|---|---|
| `--ge-table-overlay-bg` | `rgba(255,255,255,0.7)` | `rgba(30,30,30,0.7)` |
| `--ge-table-overlay-color` | `#333` | `#ddd` |
| `--ge-table-spinner-color` | `#1a73e8` | `#8ab4f8` |
| `--ge-table-spinner-track-color` | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.18)` |
| `--ge-table-spinner-size` | `28px` | `28px` |

„No rows“ ohne Hintergrund (Tabelle ist leer), nur Text in `--ge-table-overlay-color`. Neues CSS mit logischen
Eigenschaften (RTL-Vorbereitung, Prompt 012). Klassen: `.ge-table-overlay`, `-visible`, `-loading`, `-no-rows`,
`-no-matches`, `-blocking`, `.ge-table-overlay-content`, `.ge-table-spinner`, `.ge-table-overlay-text`.

### 2.8 Barrierefreiheit (O12)

- Das Overlay-Div ist `aria-hidden="true"`: Es liegt im Host mit `role="grid"`, und ein Grid darf nur Zeilen/Rowgroups
  besitzen (axe `aria-required-children`, wie die anderen Deko-Divs in 001).
- Die Information kommt über ARIA: „Lädt…“ → Host `aria-busy="true"` (über `setHostAriaAttribute`, wird in `destroy()`
  zurückgesetzt) + Ansage des Lade-Texts über die Live-Region. „No rows“ → Ansage beim **Wechsel** nach `firstInit()`
  (nicht beim ersten Render – wie die Filter-Ansage in 001). „No matches“ → keine eigene Ansage, die Filter-Ansage
  `ariaTexts.filtered(0)` („No rows“) kommt schon (sonst doppelt).
- Keine neuen `AriaTexts`: Die Ansage ist der sichtbare Text aus `overlayOptions` (eine Quelle, eine Sprache).
- Keine neuen Tab-Stopps; Inhalte aus `getOverlayElement` liegen im `aria-hidden`-Bereich (Doku: Bedienelemente gehören
  nicht ins Overlay, sondern daneben).

### 2.9 `CrudTableModelFactory`

> **Umgesetzt anders als hier vorgeschlagen:** Das Feld `tableApi?` ist unnötig – die Factory erreicht die Tabelle
> schon über `tableModel.getTableScope()`. Alle Anfragen (fetchItem, updateItem, createItem, deleteItem, Reload) laufen
> durch `whileLoading()`; auch ein Fehler beendet das Overlay. Das erste `fetchList` bleibt ohne Overlay (keine Tabelle).


Die Liste wird geladen, **bevor** es Modell und Tabelle gibt – für das erste Laden kann die Factory kein Overlay zeigen
(es gibt keine Tabelle). Vorschlag:
- neues optionales Feld `tableApi?: TableApi` (Anwender setzt es in `tableReady`); `reloadRows()` und die Aktionen
  `UPDATE`/`DELETE`/`CREATE` zeigen damit `showLoadingOverlay()` bis zur Antwort (auch im Fehlerfall `hideOverlay()`).
- Das erste Laden bleibt unverändert; in der Doku das Muster „leere Tabelle mit `showLoadingOverlay()` zeigen, dann
  `setRows`“ (das ist ohnehin das bessere Muster für `fetch`).

### 2.10 Texte und Sprache (Frage 7)

Englische Defaults („Loading…“, „No rows to show“, „No matching rows“), überschreibbar über `overlayOptions` bzw. je
Aufruf (`showLoadingOverlay("Speichern…")`). Keine Übersetzungstabelle.

## 3. Beispiele (Referenzfälle)

**O1/O2/O5 – Daten per `fetch` (Video-Snippet, 12 Zeilen):**
```ts
const tableModel = TableFactory.createTableModel({ rows: [] as Order[], properties: ["id", "customer", "total"] });
const tableScope = new TableScope(host, tableModel, new SimpleDomService(), new TableOptions(), new EventAdapter());
tableScope.firstInit();
const tableApi = tableScope.getApi();

tableApi.showLoadingOverlay();                 // Spinner + "Loading…", aria-busy
const orders: Order[] = await (await fetch("/api/orders")).json();
tableApi.setRows(orders);
tableApi.repaintHard();                        // setRows zeichnet nicht selbst neu (Zeilenzahl geändert)
tableApi.hideOverlay();                        // 0 Zeilen? → "No rows to show" erscheint von selbst
```
Erwartung: zuerst Spinner über dem leeren Body, Header lesbar; danach Zeilen; bei leerer Antwort „No rows to show“.

**O3** – Modell mit `rows: []` → „No rows to show“ ohne API-Aufruf, `getOverlayState() === "noRows"`.

**O4** – 100 Zeilen, `externalFilterFunction = () => false`, `externalFilterChanged()` → „No matching rows“;
Filter zurück auf `() => true` → Overlay weg.

**O6** – 100 Zeilen, `showLoadingOverlay()` → Zeilen halbtransparent sichtbar, Klick auf eine Zelle löst kein
`onMouseClicked` aus; mit `blockInteractionWhileLoading: false` schon.

**O10** – `overlayOptions: { noRowsText: '<img src="x" onerror="alert(1)">' }` → kein `img`, der Text ist sichtbar.

**O11 – eigenes Element:**
```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  overlayOptions: {
    getOverlayElement: (kind, text) => {
      if (kind !== "noRows") return undefined;   // Standard für die anderen
      const div = document.createElement("div");
      div.className = "my-empty-state";
      div.textContent = `📭 ${text} – create your first order`;
      return div;
    },
  },
};
```

**React (mit § 2.3 a):** `<GuiexpertTable tableModel={model} loading={isLoading} />`

## 4. Tests (Phase 2, geplant)

- Unit: `OverlayOptions`-Defaults/Merge; Zustandsfunktion (§ 2.5) als reine Funktion `calcOverlayKind(...)` mit
  allen Kombinationen (manuell × rowCount × unfiltered × autoNoRows); `getUnfilteredRowCount` für ObjectArray und Tree.
- Browser `overlay/overlay.browser.spec.ts`: O1–O7, O9–O11 (Sichtbarkeit, Position = Body-Rechteck, Klick-Blockade,
  automatisches Ein-/Ausblenden, Escaping, eigenes Element + Aufräumen bei `hideOverlay`/`destroy`/Modellwechsel,
  `loadingDelayInMs` mit `vi.waitFor`), Klasse wird bei unverändertem Zustand nicht neu gesetzt (MutationObserver).
- O8: CSS-Regel vorhanden + `page.emulateMedia({ reducedMotion: 'reduce' })` → `animation-name: none`.
- O12: `aria-busy`, Live-Region-Text, `axeViolations(host)` = `[]` in allen drei Zuständen.
- Wrapper: Smoke in allen 7 (bei § 2.3 a) bzw. React + Web Component (bei b).
- Export-Snapshot: Zugänge `OverlayOptions`, (`GeOverlayKind` ist nur Typ).

## 5. Doku, Demos, Website, Training, Video

| Phase | Entscheidung |
|---|---|
| 4 Doku | JSDoc + `@example`, neue typedoc-Kategorie **„Overlays“**; `instructions.md` neuer Abschnitt bei den Optionen + „Daten per `fetch` laden“; READMEs/`llms.txt` Feature-Zeile |
| 5 Demos | `apps/table-demo/overlay.html` (Aufnahme-Seite: leer → Laden → Daten → Filter ohne Treffer); `demo-table-models`: nichts Neues nötig |
| 6 Website | **kein neuer Showcase**; Crypto-Ticker zeigt „Loading…“ bis zum ersten Kurs-Paket. Feature-Liste ergänzen; `why.astro`: Zeile „Loading/No-rows overlay“ falls vorhanden ehrlich auf „ja“ |
| 7 Training | **kein neues Kapitel**: Abschnitt in Kapitel 32 `live-data` mit `<Callout type="version">`, kleine Live-Demo `demos/overlays.ts` (Button „Reload“) |
| 8 Demo-Repo | keine eigene Folge; nur falls Kapitel 32 im Demo-Repo erweitert wird (🛑, nach Release) |
| 9 Video | `videos/03-lade-spinner/` „Lade-Spinner und leere Tabelle – ohne Library, nur CSS“ (Snippet § 3). Kein „ohne Enterprise“-Titel: ag-Grid hat das in Community |

## 6. Größe und Performance

Erwartet < 2 KB min. JS + ~1 KB CSS. Pro Frame ein `getRowCount()` und ein Vergleich; Messung mit
`scripts/measure-render.mjs` wie in 001 (Budget: keine messbare Änderung, ≤ 1 %).

## 7. Risiken

- Anwender, die selbst schon eine Leer-Anzeige über die Tabelle legen, sehen zwei → Release-Note + `autoNoRows: false`.
- `aria-busy="true"` lässt manche Screenreader den Grid-Inhalt bis zum Ende nicht vorlesen – gewollt, aber nur bei
  „Lädt…“, nie bei „No rows“.
- Wrapper mit Prop (§ 2.3 a): Reihenfolge Neuaufbau ↔ Prop-Effekt muss in jedem Framework getestet werden.

## 8. Entscheidungen (freigegeben 14.10.2026)

1. API § 2.1 (vier Methoden; `hideOverlay()` beendet nur Manuelles, automatische Anzeige ist abgeleitet).
2. Eigene Inhalte nur als **Element-Fabrik** `getOverlayElement(kind, text)`, **kein** HTML-String (§ 2.2).
3. **Wrapper: Prop `loading` in allen 7 Wrappern** (§ 2.3 a) – oder nur API (b)?
4. Neues optionales `AreaModelIf.getUnfilteredRowCount?()` für „No matching rows“ (§ 2.5).
5. Default `blockInteractionWhileLoading: true`, `loadingDelayInMs: 0`, `autoNoRows: true` (Verhaltensänderung!).
6. CRUD: Feld `tableApi?` für Reload/Aktionen; erstes Laden nur dokumentiert (§ 2.9).
7. Kein neuer Showcase, kein neues Trainingskapitel; Video `videos/03-lade-spinner/`.

## 9. Umsetzung (15.10.2026)

| Punkt | Ergebnis |
|---|---|
| Dateien | `overlay/ge-overlay-kind.type.ts`, `overlay/calc-overlay-kind.ts` (reine Funktion), `overlay/table-overlay.ts` (`TableOverlay`, `@category Internals`), `data/options/overlay-options(.if).ts` |
| Einbindung | `EleScope` legt das Overlay an und setzt die Geometrie in `adjustContainersAndRows`; `RenderScope.updateOverlay()` am Ende von `adjustAfterScrolling`; `TableScope.onOverlayChanged` (ARIA), Tastatur-Blockade in `onActionTriggered` (`TableScope.actionsBlockedWhileLoading`) |
| Abweichungen | § 2.9 (kein `tableApi`-Feld); `getOverlayState()` = **gezeigtes** Overlay (während `loadingDelayInMs` bleibt das automatische Overlay stehen – kein Flackern, keine zweite Ansage); Maus-Blockade: `MouseHandler` ignoriert click/dblclick/mousedown/contextmenu und mousemove ohne gedrückte Taste auf dem Overlay (`TableOverlay.isEventBlocked`) – die Seite sieht die Events weiter, ein Spalten-Ziehen aus dem Header folgt der Maus; z-index 10000 (über dem Fokusrahmen 9999) |
| Review (unabhängig) | 0 Muss-Punkte. Umgesetzt: Wrapper blenden mit `loading=false` nur aus, was die Prop zeigte (React/Solid verloren sonst ein Overlay aus `tableReady`); Verzögerung ohne Flackern; `aria-busy` der App wird wiederhergestellt (`EleScope.restoreHostAriaAttribute`); `getUnfilteredRowCount` auch in `AreaModelArrayOfArrays`/`CoverGridBodyModel`; CRUD zählt parallele Anfragen und fängt synchrone Fehler; Fokusrahmen unter dem Overlay; Header-Enter beim Laden erlaubt; noch wartende „Loading…“-Ansage wird verworfen (`LiveAnnouncer.cancel`); Fehler in `getOverlayElement` → Standardinhalt; Hover weg beim Laden; Overlay-Variablen in allen `CssVars`-Themes; Web-Component-JSDoc |
| Tests | Unit: `calc-overlay-kind`, `overlay-options`, `unfiltered-row-count`; Browser: `overlay/overlay.browser.spec.ts` (O1–O12 + Standalone), 4 CRUD-Fälle; Wrapper: React, Preact, Solid, Vue, Svelte 4/5, Web Component. Angular: nur Build 14–22 (kein Test-Setup, `TODO.md`) |
| Abdeckung | `calc-overlay-kind` 100 %, `table-overlay` 98 % Zeilen / 93 % Zweige, `overlay-options` 100 % |
| Größe | `dist/index.cjs` gzip 59,1 → 60,7 KB (+1,6 KB); CSS ~1 KB |
| Website | **Abweichung:** kein Eingriff in den Crypto-Showcase – er hat statische Daten, ein künstliches „Loading…“ wäre vorgetäuscht. Stattdessen: Zeile in `why.astro` (ehrlich: ag-Grid Community hat es auch), Feature-Text in `features.astro`; `pnpm build:webpage-guiexpert` grün (436 Seiten) |
| Training | Abschnitt „Loading and empty tables“ in Kapitel 32 `live-data` mit Live-Demo `demos/overlays.ts` (28. Live-Demo), Callout `version`, Poster `demo-overlays-light|dark.png`, Screenshot-Eintrag |
| Demo/Video | `apps/table-demo/overlay.html`; `videos/03-lade-spinner/` (Snippet 14 Zeilen, kompiliert strict); beide im Browser geprüft (light/dark, keine Konsolenfehler) |
| Demo-Repo | Phase 8 nicht nötig (kein neues Kapitel); der Abschnitt in Kapitel 32 verweist auf keinen neuen Tag |
| Doku | `instructions.md` 6.15, Angular-Doku § 2/§ 4, READMEs, beide `llms.txt`, `CLAUDE.md`, `TODO.md`, typedoc-Kategorie „Overlays“, `docs:check` 310 Beispiele / 0 Fehler |

