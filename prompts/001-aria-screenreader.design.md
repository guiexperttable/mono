# Design 001 – Screenreader-Unterstützung (ARIA)

> Prompt: `prompts/001-aria-screenreader.md` · Branch `feat/aria` · Zielversion **1.1.91** (`since`)
> Stand 14.10.2026. Freigabe: Der Auftrag lautete „selbständig bearbeiten“ – die Entscheidungen unten wurden
> deshalb ohne Rückfrage getroffen und sind hier begründet. Offene Punkte stehen am Ende (§ 9).
> **Umgesetzt** auf `feat/aria` (Phasen 1–7, 9, 10); Phase 8 (Demo-Repo) bewusst offen (🛑).

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `EleScope` (Host, 9 Areas, Scroll-Viewport, Hover-/Drag-/Rahmen-Divs) | Rollen der Container | keine Rollen; DOM-Reihenfolge: Header, Body-West/-East, Footer, *dann* Viewport mit Body-Center | Host `role="grid"`/`"treegrid"`, Area-`child`-Divs `role="rowgroup"` mit ID, Host `aria-owns` = logische Reihenfolge; Deko-Divs `aria-hidden`; Viewport `tabindex="-1"` (sonst zweiter Tab-Stopp in Chrome) – **erweitern** |
| `ConvenienceDomService.addRowDiv` / `addColumnDiv` | Zeilen/Zellen | Row-Div-Cache (Divs werden wiederverwendet → Attribute müssen auch **entfernt** werden) | Rahmen, Fokusrahmen, Sortier-Icon, Baum-Pfeil, `addDiv` → `aria-hidden`; Checkbox per DOM-API statt HTML-String; Rollen/Indizes setzt `RenderScope` (kennt Zählung und Modell) – **erweitern** |
| `DomServiceIf` | Attribute | kein `removeAttribute` | optionales `removeAttribute?()` (Angular: `Renderer2.removeAttribute`), Fallback `element.removeAttribute` – **additiv** |
| `RenderScope.adjustArea` / `addAndRenderCellDiv` / `drawBigCell` | Rendering | Span-Zellen werden **außerhalb** jeder Zeile direkt in die Area gezeichnet | Zeilen-/Zell-Attribute; Span-Zellen bekommen eine eigene Zeile `ge-table-span-row` (`role="row"`, 0 × 0 px, `overflow: visible`) – **erweitern** |
| `FocusModel` | Fokus | Modell (Zeile/Spalte) nur für den Body | unverändert; Header-Fokus als zusätzlicher Zustand in `TableScope` (§ 3.8) |
| `ShortcutService` + Mappings + `ActionId` | Tastatur | Pfeile, F2, Space, Strg+A/C | 7 neue `ActionId`s, neue Default-Kürzel (§ 3.8) – **additiv** |
| `SelectionModel` | `aria-selected` | `selectionType`/`selectionMode` öffentlich | lesen (Duck-Typing für eigene `SelectionModelIf`) |
| `AreaModelTree` | Baum-Attribute | `deep`, `parent`, `children`, `keep` (Filter) | `TreeAriaInfo` berechnet Ebene/Position/Größe je Geschwistergruppe, Cache je `getFilteredFlattenRows()`-Array |
| `CheckboxCellRenderer`, `addCheckboxToDiv` | Checkboxen | HTML-String; „teilweise“ = blasses ✓ | DOM-API, natives `indeterminate` (= `aria-checked="mixed"` im A11y-Baum), Name per `aria-label` |
| `CellGroupExtCellRenderer` | Gruppen-Toggle | Div mit Pfeil | `role="button"`, `aria-expanded`, `aria-label` |
| Renderer Fortschritt/Sterne/Wahr-Falsch/Männlich-Weiblich | visuelle Aussage | ohne Text | `role="img"` + `aria-label` (optionaler Konstruktor-Parameter für eigene Texte) |
| `InputCellRenderer` / `SelectCellRenderer` (Editor) | Editor | ohne Namen | `RenderScope` setzt `aria-label` = Spaltenüberschrift, falls keiner da ist |
| `TableScope.sortByColumn`, `externalFilterChanged`, Copy, `SelectionService` (Strg+A) | Ansagen | – | `LiveAnnouncer` (§ 3.6) |
| `TableOptionsIf` | Optionen | – | `ariaLabel?`, `ariaLabelledBy?`, `ariaDescribedBy?`, `ariaTexts?` – optional, **additiv** |
| CSS (`table-color-vars.css`, `table-classes.css`) | Fokus, Kontrast | Fokusrahmen 1 px; Sterne `#fcb515` (1,9 : 1 auf Weiß), Fortschritt `#36BB6C` (2,4 : 1) | `--ge-table-focus-outline-color`, Rahmen 2 px, `.ge-table-sr-only`, Host-`:focus-visible`; Sterne/Fortschritt (light) dunkler |

Breaking Changes: keine API. Verhaltensänderungen (Release-Notes): Home/End/Bild↑/Bild↓/Enter werden von der
Tabelle verarbeitet (vorher scrollte z. B. Bild↓ die Seite); teilweise markierte Checkbox nutzt das native
„indeterminate“ statt des blassen ✓; Fokusrahmen 2 px statt 1 px; zwei Default-Farben im Light-Theme.

## 2. Entscheidungen

### 2.1 Zeilen über drei Areas (Frage 1) → **(a) `role="row"` je Area-Zeile, gleicher `aria-rowindex`**

| Option | Pro | Contra |
|---|---|---|
| **(a)** je Row-Div `role="row"`, `aria-rowindex` gleich | wie ag-Grid bei gepinnten Spalten (dort mit allen drei Screenreadern im Einsatz); kein `aria-owns` je Zeile; billig | eine logische Zeile erscheint bei fixierten Spalten als bis zu drei Zeilen im A11y-Baum; Ansage „Zeile 5“ stimmt trotzdem (aus `aria-rowindex`) |
| (b) Area-Zeilen `presentation` + `aria-owns` je logischer Zeile | eine Zeile im Baum | jede Zelle in West/East braucht eine ID, `aria-owns` wird bei **jedem** Scroll-Frame neu gesetzt → Chrome baut den A11y-Baum um (teuer, bekannte Performance-Falle); bei Virtual Scrolling fehleranfällig |
| (c) DOM umbauen (eine Zeile über alle Areas) | sauber | widerspricht dem 3 × 3-Layout (fixierte Spalten scrollen nicht mit) – großer Umbau, Risiko für Performance und Anwender-CSS |

Ohne fixierte Spalten (Normalfall) gibt es nur Center-Zeilen – dann ist (a) exakt das APG-Muster.
Die Rowgroups ordnet der Host per `aria-owns` (9 statische IDs, einmal gesetzt) in die Reihenfolge Header → Body → Footer,
weil der Body-Center im DOM hinter dem Footer liegt.

### 2.2 Fokus (Frage 2) → **`aria-activedescendant`**

Der Host behält den DOM-Fokus (Tastatur-Listener, `tabindex="0"` wie heute). Nach jedem Render-Durchgang bekommt die
fokussierte Zelle eine ID und der Host `aria-activedescendant` (fehlt die Zelle im DOM – weggescrollt –, wird das Attribut
entfernt; nie eine tote ID). Roving-Tabindex scheidet aus: Zellen werden bei jedem Render neu erzeugt → DOM-Fokus ginge
bei jedem Scroll-Frame verloren.

### 2.3 ID-Schema (Frage 3)

`<prefix>-<area>-r<row>-c<col>` für Zellen, `<prefix>-rg-<area>-<side>` für Rowgroups, `<prefix>-live` für die Live-Region.
`<prefix>` = `ge-` + `id` des Host-Elements, sonst `ge-t<n>` (fortlaufender Zähler). Mehrere Tabellen pro Seite bleiben
eindeutig; mit Host-ID sind die IDs auch über Neuaufbau stabil. Nur die fokussierte Zelle trägt eine ID (Performance).
Umsetzung: `AriaIds` (unit-getestet).

### 2.4 Rollen der Container (Frage 4)

| Element | Rolle/Attribute |
|---|---|
| Host `.ge-table` | `grid` (Baum: `treegrid`), `aria-rowcount`, `aria-colcount`, `aria-label`/`-labelledby`/`-describedby` aus Optionen, `aria-multiselectable` bei `selectionMode "multi"`, `aria-owns` (Rowgroups), `aria-activedescendant` |
| `child` der 9 Areas (`.ge-table-header-west > div` …) | `rowgroup`, ID; leere Rowgroups (z. B. ohne fixierte Spalten) `role="presentation"` (axe: eine Rowgroup braucht Zeilen) – wird nur bei Änderung umgeschaltet |
| Row-Div | `row`, `aria-rowindex`; Baum: `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded` (nur mit Kindern); Zeilen-Selektion: `aria-selected` |
| Zelle `.ge-table-col-div` | Header `columnheader`, sonst `gridcell`; `aria-colindex`, `aria-colspan`/`aria-rowspan` (> 1), `aria-sort` (sortierbare Spalte, unterste Header-Zeile), `aria-selected` (Zell-/Bereichs-/Spalten-Selektion) |
| Area-Parents, Content-Wrapper, Content-Div | `role="presentation"` (reine Layout-Container) |
| Scroll-Viewport | generisch, `tabindex="-1"` (kein zweiter Tab-Stopp), gibt den Fokus an den Host weiter |
| Hover-Zeile/-Spalte, Drag-Ghost, Rahmen, Fokusrahmen, Selektions-Hintergrund, Drop-Zone, Resize-Handles, Sortier-Icon, Baum-Pfeil, „alle auf/zu“-Icon | `aria-hidden="true"` |
| Live-Region | **außerhalb** des Hosts in `document.body` (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`, visuell versteckt per Inline-Style + Klasse `ge-table-sr-only`). Grund: ein `grid` darf nur Zeilen/Rowgroups besitzen (axe `aria-required-children`); `document.body` ist nie Framework-verwaltet. `destroy()` entfernt sie. |

### 2.5 Zählung bei Virtual Scrolling (Frage 5)

- `aria-rowcount` = sichtbare Header-Zeilen + **alle** Body-Zeilen des Modells (nach Filter; Baum: angezeigte Knoten) +
  Footer-Zeilen. Ausgeblendeter Header/Footer (`setHeaderVisible(false)`) zählt 0.
- `aria-rowindex` 1-basiert über Header → Body → Footer (Body-Zeile `i` = Header-Zeilen + `i` + 1).
- `aria-colcount` / `aria-colindex` zählen nur **sichtbare** Spalten (Breite > 0, wie das Rendering). Grund: der
  Screenreader soll „Spalte 3 von 5“ sagen, wenn 5 Spalten zu sehen sind; versteckte Spalten haben keine Zellen.
  Die Abbildung Modellindex → `aria-colindex` wird einmal je Render-Durchgang berechnet (O(Spalten)).
- Unbekannte Zeilenzahl (`getRowCount() < 0`, künftige Server-Modelle) → `aria-rowcount="-1"` (ARIA-Spezifikation).
- Umsetzung: `AriaGridInfo` (unit-getestet).

### 2.6 Renderer (Frage 6)

- Eingebaut: Fortschrittsbalken `role="img"` + `aria-label="75 %"`; Sterne `aria-label="4 stars"`; Wahr/Falsch
  `"Yes"`/`"No"`; Männlich/Weiblich `"male"`/`"female"`. Texte über einen optionalen Konstruktor-Parameter
  `ariaLabel?: (value) => string` änderbar (Renderer kennen die Tabellen-Optionen nicht).
- **Regel für eigene Renderer und Framework-Komponenten** (Doku `instructions.md` „Accessibility“): Die Zelle (`cellDiv`)
  hat bereits `role="gridcell"` – nie überschreiben. Text in der Zelle wird vorgelesen. Rein visuelle Inhalte (Icons,
  Balken, Farben) brauchen einen Text: `role="img"` + `aria-label` oder unsichtbarer Text mit Klasse `ge-table-sr-only`.
  Bedienelemente (Button, Link, Input) brauchen einen Namen (`aria-label`) und `tabindex="-1"` (die Tabelle
  ist **ein** Tab-Stopp). Werte nie unescaped in `innerHTML`.

### 2.7 Optionen (Frage 7) – `TableOptionsIf`, alle optional

```ts
ariaLabel?: string;            // Name der Tabelle, z. B. "Orders"
ariaLabelledBy?: string;       // ID eines sichtbaren Titels (hat Vorrang vor ariaLabel)
ariaDescribedBy?: string;      // ID einer Beschreibung
ariaTexts?: Partial<AriaTextsIf>; // Ansage- und Beschriftungstexte (englische Defaults in AriaTexts)
```

`AriaTextsIf` (Datei `aria/aria-texts.if.ts`; Defaults `AriaTexts`):

| Funktion | Default | wann |
|---|---|---|
| `sorted(columnLabel, sortState)` | „Sorted by Total, descending“ / „Sorting of Total removed“ | Sortieren (Header, Tastatur, `sortByColumn`) |
| `filtered(rowCount)` | „42 rows“ / „1 row“ / „No rows“ | `externalFilterChanged()` (entprellt 400 ms) |
| `copied(cellCount)` | „12 cells copied“ | Strg+C, `copyToClipboard()` |
| `allSelected()` / `selectionCleared()` | „All cells selected“ / „Selection cleared“ | Strg+A / Abwählen |
| `selectRow(rowNumber)` / `selectAllRows()` | „Select row 5“ / „Select all rows“ | Name der Zeilen-Checkbox |
| `expandGroup(label)` / `collapseGroup(label)` | „Expand group Q1“ / „Collapse group Q1“ | Header-Gruppen-Toggle |

Name `ariaTexts` statt `ariaAnnouncements`: dieselbe Stelle liefert auch Beschriftungen (Checkbox, Gruppen-Toggle).
Zusätzlich `TableApi.announce(text)`: eigene Ansagen über die Live-Region (z. B. nach dem Laden).

### 2.8 Tastatur nach APG (Frage 8)

Vorhanden: Pfeile, F2 (Editor), Space (Auswahl umschalten), Strg/⌘+A, Strg/⌘+C, Escape im Editor.
Neu (`ActionId`, Windows-/OSX-Mapping; überschreibbar über `shortcutActionIdMapping`):

| Taste | Windows | OSX zusätzlich | ActionId | Wirkung |
|---|---|---|---|---|
| Pos1 / Ende | `home`, `end` | `cmd+left`, `cmd+right` | `NAVIGATE_ROW_START` / `NAVIGATE_ROW_END` | erste/letzte sichtbare Spalte der Zeile |
| Strg+Pos1 / Strg+Ende | `ctrl+home`, `ctrl+end` | `cmd+up`, `cmd+down` | `NAVIGATE_FIRST_CELL` / `NAVIGATE_LAST_CELL` | erste Zelle der ersten Zeile / letzte der letzten |
| Bild↑ / Bild↓ | `pageup`, `pagedown` | – | `NAVIGATE_PAGE_UP` / `NAVIGATE_PAGE_DOWN` | eine Seite (angezeigte Zeilen − 1) |
| Enter | `enter` | – | `ACTIVATE_CELL` | Body: Zeilen-Checkbox umschalten, sonst Baumknoten auf/zu; Header: Gruppe auf/zu, sonst Sortieren |

**Header-Fokus:** Pfeil↑ in Body-Zeile 0 bringt den Fokus in die unterste Header-Zeile (gleiche Spalte), Pfeil↓ aus der
untersten Header-Zeile zurück in die erste sichtbare Body-Zeile; ←/→ wandern über die Header-Zellen (Span-Zellen als
Ganzes). Damit sind Sortieren und Header-Gruppen per Tastatur erreichbar (WCAG 2.1.1). Der Header-Fokus ist ein Zustand
von `TableScope` (`getHeaderFocus()`), das `FocusModel` bleibt Body-only (keine API-Änderung, kein `onFocusChanged`).
Space und F2 wirken im Header nicht auf den Body; Strg+C kopiert weiterhin die Body-Auswahl. Ein Mausklick beendet den Header-Fokus.

Baum: Enter statt →/← (die Pfeile bewegen den Zell-Fokus – APG-Treegrid „Zellen-Modus“). Konflikte geprüft: Pos1/Ende/
Bild/Enter waren unbelegt; Screenreader leiten diese Tasten in `role="grid"` (Fokus-/Anwendungsmodus) durch.

### 2.9 Tooltips (Frage 9) → bewusst `title` behalten

`title` an der Zelle wird von Chrome/Firefox/Safari als **Beschreibung** der Zelle berechnet (Accessible Description,
weil der Name aus dem Inhalt kommt) und mit `aria-activedescendant` vorgelesen. Offen bleibt: sehende Tastaturnutzer
sehen den Tooltip nicht (dokumentiert, mögliches Folge-Feature „Tooltip bei Tastaturfokus“).

### 2.10 Performance (Frage 10)

Budget: **≤ 10 %** mehr Renderzeit je Scroll-Frame im Szenario „Large dataset“ (2 Mio. Zeilen, 30 Spalten, 1200 × 800 px,
1 fixierte Spalte; `packages/table/scripts/measure-render.mjs`, Median von 5 Läufen à 300 Frames, Chromium headless).
Maßnahmen: IDs nur an der fokussierten Zelle; Host-Attribute nur bei Änderung schreiben; Zählung einmal je Durchgang;
Baum-Positionen gecacht; keine `querySelector`s je Zelle. Messwerte § 7.

### 2.11 Werkzeuge (Frage 11)

`axe-core` als **devDependency** von `@guiexpert/table` (nur Browser-Specs; Runtime bleibt bei 0 Abhängigkeiten).
Regeln: Standard-Tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `best-practice`. Manuelle Screenreader-Tests: § 8.

## 3. Signaturen (neu, alle exportiert, `@category Accessibility`)

```ts
// aria/aria-texts.if.ts
export interface AriaTextsIf {
  sorted(columnLabel: string, sortState: SortState): string;
  filtered(rowCount: number): string;
  copied(cellCount: number): string;
  allSelected(): string;
  selectionCleared(): string;
  selectRow(rowNumber: number): string;
  selectAllRows(): string;
  expandGroup(groupLabel: string): string;
  collapseGroup(groupLabel: string): string;
}
// aria/aria-texts.ts
export class AriaTexts implements AriaTextsIf { /* englische Defaults */
  static create(overrides?: Partial<AriaTextsIf>): AriaTextsIf;
}
// aria/aria-ids.ts
export class AriaIds {
  static createPrefix(hostId?: string): string;          // "ge-orders" | "ge-t3"
  constructor(readonly prefix: string);
  cell(area: AreaIdent, rowIndex: number, columnIndex: number): string;   // "ge-t3-body-r5-c2"
  rowGroup(area: AreaIdent, side: SideIdent): string;    // "ge-t3-rg-body-center"
  liveRegion(): string;                                  // "ge-t3-live"
}
// aria/aria-grid-info.ts
export class AriaGridInfo {
  static create(tableModel: TableModelIf): AriaGridInfo;
  readonly headerRowCount: number; readonly bodyRowCount: number; readonly footerRowCount: number;
  readonly rowCount: number;        // aria-rowcount (-1 = unbekannt)
  readonly colCount: number;        // aria-colcount (sichtbare Spalten)
  rowIndex(area: AreaIdent, rowIndex: number): number;   // aria-rowindex
  colIndex(columnIndex: number): number;                 // aria-colindex, 0 = versteckt
  colSpan(columnIndex: number, colspan: number): number; // sichtbare Spalten im Span
}
// aria/tree-aria-info.ts
export interface TreeAriaRowInfo { level: number; setSize: number; posInSet: number; expanded?: boolean }
export class TreeAriaInfo {
  get(model: AreaModelTree<any>, rowIndex: number): TreeAriaRowInfo | undefined;
}
// aria/live-announcer.ts
export class LiveAnnouncer {
  constructor(document: Document, id: string, domService: DomServiceIf);
  announce(text: string, delayInMs?: number): void;
  getElement(): HTMLElement | undefined;
  destroy(): void;
}
// DomServiceIf (additiv):  removeAttribute?(ele: HTMLElement, key: string): void;
// TableApi (additiv):      announce(text: string): void;   getHeaderFocus(): [number, number] | undefined;
// ActionId (additiv):      NAVIGATE_ROW_START | NAVIGATE_ROW_END | NAVIGATE_FIRST_CELL | NAVIGATE_LAST_CELL
//                          | NAVIGATE_PAGE_UP | NAVIGATE_PAGE_DOWN | ACTIVATE_CELL
```

## 4. Beispiele (Referenzfälle, ≤ 15 Zeilen)

```ts
// A1/A5 – Name, Zählung, Sortier-Ansage
const tableOptions = { ...new TableOptions(), ariaLabel: "Orders" };
const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, tableOptions });
// Host: role="grid" aria-label="Orders" aria-rowcount="1001" aria-colcount="10"
tableApi.sortByColumn("total", "desc");
// Header "Total": aria-sort="descending" · Live-Region: "Sorted by Total, descending"
```

```ts
// A11 – eigene Texte (Deutsch)
const tableOptions = {
  ...new TableOptions(),
  ariaLabelledBy: "orders-title",
  ariaTexts: {
    filtered: (n: number) => `${n} Zeilen`,
    copied: (n: number) => `${n} Zellen kopiert`,
  },
};
```

```ts
// A6 – Baum: role="treegrid", Zeile "Europe": aria-level="1" aria-expanded="true" aria-setsize="3" aria-posinset="2"
const tableModel = TableFactory.createTableModel({ bodyAreaModel: new AreaModelTree("body", treeRows, 34, columnDefs), columnDefs });
```

## 5. Was es an Website, Training, Demo-Repo und Video braucht

- **Demo-Modelle/Apps:** keine neue Modell-Fabrik nötig (ARIA ist immer an). `apps/table-demo`: Seite `aria.html` mit
  Beschriftung, deutschen Texten und Live-Region-Log (Aufnahme-Umgebung des Videos). Angular-Demo: Hinweis in
  `apps/angular-table-demo/instructions.md` (nutzt npm-Pakete → erst nach Release).
- **Website:** Feature-Liste (`features.astro`), Zeile „Accessibility (WAI-ARIA, keyboard)“ in `why.astro`
  (ag-Grid Community ✔ / GuiExpert ✔ ab 1.1.91), Checkliste/„build-buy“ prüfen. Kein eigener Showcase (Barrierefreiheit
  sieht man nicht – das Trainingskapitel zeigt die Live-Region sichtbar).
- **Training:** neues Kapitel **35** „Accessible tables: keyboard and screen readers“ in **Teil 8** (`"advanced"`,
  „Beyond the basics“ – dieser Prompt legt den Teil an), Live-Demo mit sichtbarem Ansage-Protokoll.
- **Demo-Repo:** Folge `ep-035` – 🛑 nicht angelegt (kein Anlegen/Push/Tag ohne Freigabe; das Demo-Repo nutzt
  npm-Pakete → erst nach dem Release 1.1.91). Code-Vorlage: `apps/webpage-guiexpert/src/training/demos/accessibility.ts`
  (Plain TS, keine Framework-Beispiele nötig). Bis dahin zeigt der Link „git tag ep-035“ des Kapitels ins Leere (`TODO.md`).
- **Video:** `videos/02-barrierefreie-tabelle/` („Barrierefreie Tabelle in 60 Sekunden“, VoiceOver hörbar, Untertitel).

**Umgesetzt (Phasen 5–9):** `apps/table-demo/aria.html` (+ `src/aria/aria-demo.ts`) · Website: Feature-Kachel
„Accessible and editable“, Zeile „Accessibility (WAI-ARIA, keyboard)“ in `home/why.astro` und
`training/build-buy-or-guiexpert.astro`, Checkliste · Training: Teil 8 „Beyond the basics“, Kapitel 35
`accessibility` mit Live-Demo und Postern (light/dark) · Video 02 (Drehbuch, `snippet.ts` 15 Zeilen kompiliert,
`demo.html` im Browser geprüft) · Angular-Demo: Hinweis in `apps/angular-table-demo/instructions.md` (npm-Pakete).

## 6. Testplan (Phase 2)

- Unit: `AriaIds`, `AriaGridInfo` (Header/Body/Footer, versteckter Header, versteckte Spalten, `-1`), `AriaTexts`
  (Defaults, Overrides, Singular/Plural), `TreeAriaInfo` (Ebenen, Filter, Cache-Invalidierung), Shortcut-Mappings.
- Browser (`aria/aria.browser.spec.ts`): A1–A13 einzeln, `aria-rowindex` nach `scrollToIndex` Mitte/Ende (2 Mio.),
  `aria-activedescendant` zeigt nach jeder Taste und jedem Scroll auf ein existierendes Element, Baum nach Auf-/Zuklappen
  und Filter, fixierte Spalten, Live-Region nach Filter/Sortieren/Kopieren, Header-Fokus + Enter, HTML-Injection in
  `aria-label` (Spaltenüberschrift, Gruppen-Label, eigene Texte), `destroy()` räumt Live-Region und Host-Attribute auf.
- axe-core: einfach, Baum, Header-Gruppen, fixierte Spalten, Checkboxen, Selektion, Editor offen.
- Wrapper: `role="grid"` in React und Web Component.

## 7. Performance-Messung

| Build | Median je Frame | p95 | Zellen/Frame |
|---|---|---|---|
| vorher (1.1.90, `main` 44c4c27), 3 Messungen abwechselnd mit „nachher“ | 19,0 / 19,6 / 19,7 → **19,6 ms** | 30,3 / 31,4 / 31,4 → **31,4 ms** | 312 |
| nachher (`feat/aria`) | 20,3 / 20,7 / 20,0 → **20,3 ms** (+3,6 %) | 32,6 / 31,9 / 32,1 → **32,1 ms** (+2,2 %) | 312 |

Nach den Review-Fixes (§ 10) erneut: nachher 20,5 / 20,6 ms, vorher 20,3 / 19,4 ms (Streuung der Maschine ~±3 %).
Budget (≤ 10 %) eingehalten. Größe `packages/table/dist` (inkl. `.d.ts`): 1.167.120 → 1.253.700 Byte; `index.js`
433.717 → 468.361, `index.cjs` 210.872 → 229.720, `css/main.css` 16.473 → 17.551 Byte. Runtime-Abhängigkeiten: weiterhin 0.

## 8. Screenreader-Protokoll

Testmatrix (manuell, mit `apps/table-demo` → `aria.html` und Training-Kapitel 35):

| Kombination | Fälle | Ergebnis |
|---|---|---|
| NVDA 2025 + Firefox | A1–A11 | _offen – nicht in der Cloud-Sitzung durchführbar_ |
| NVDA 2025 + Chrome | A1–A11 | _offen_ |
| JAWS 2025 + Chrome | A1–A11 | _offen_ |
| VoiceOver (macOS) + Safari | A1–A11 | _offen_ |

Automatisch geprüft:
- **axe-core** in den Browser-Specs (`aria/aria.browser.spec.ts`): einfache Tabelle (light + dark), fixierte Spalten +
  Selektion + Footer, Baum mit Checkboxen, Header-Gruppen, eingebaute Renderer, offener Editor – keine Verstöße.
  Zwei bekannte Funde am Scroll-Viewport sind in `test-utils/axe.ts` eng gefiltert und begründet: der Viewport hat
  `tabindex="-1"` (sonst macht Chrome ≥ 130 ihn zum zweiten Tab-Stopp – im Test nachgewiesen) und ist damit für axe ein
  fokussierbares Kind des Grids (`aria-required-children`) bzw. ein Scrollbereich ohne Tab-Stopp
  (`scrollable-region-focusable`). Bedient wird er über die Tastatur des Grids; bekommt er per Klick den Fokus, gibt er
  ihn an das Grid weiter.
- **Chromium-Accessibility-Baum** (CDP `Accessibility.getFullAXTree`, Skript im Sitzungs-Scratchpad): `grid "Orders"` →
  `rowgroup` (Header) → `row` → `columnheader`; danach `rowgroup` (Body, per `aria-owns` vor den Footer geholt) → `row` →
  `gridcell`; `activedescendant` = fokussierte Zelle. Mit fixierter Spalte: Header-West-, Header-Center-, Body-West- und
  Body-Center-Rowgroup in dieser Reihenfolge, Zeilen je Seite (Option (a)).
Die Empfehlung in § 2.1 stützt sich auf das ag-Grid-Muster und die Spezifikation; **vor dem Release** die Matrix oben
ausfüllen (Checkliste in `instructions.md` „Accessibility → Testprotokoll“).

## 9. Offene Punkte / Folge-Features

- Manuelle Screenreader-Tests (§ 8).
- Tooltip bei Tastaturfokus sichtbar machen (§ 2.9).
- Spaltenbreite/-reihenfolge per Tastatur ändern (heute nur Maus; ag-Grid bietet dafür ein Spaltenmenü).
- „Alle auf-/zuklappen“-Icon im Baum-Header ist `aria-hidden` (Tastatur: Enter je Knoten).
- Live-Region in `document.body`: in einem modalen Dialog (`aria-modal="true"`) gehen die Ansagen verloren – evtl.
  später eine Option für den Container der Live-Region.
- Header-Checkbox „alle auswählen“ (`CheckboxColumnDef`) ist per Tastatur nicht bedienbar (Enter im Header sortiert bzw.
  klappt Gruppen; die Checkbox ist bewusst kein Tab-Stopp).

## 10. Abschluss-Review (separater Agent) – Ergebnis und Umsetzung

| Fund | Umsetzung |
|---|---|
| H1 Header-Gruppen: `aria-activedescendant` zeigte auf die `aria-hidden`-Kopie | behoben (`setAriaFocusedCell` behält die erste Zelle); Test-Helfer `activeCell()` prüft jetzt auch versteckte Vorfahren |
| M1 Checkboxen/Buttons in Zellen waren Tab-Stopps; Enter auf Buttons wurde abgefangen | `tabindex="-1"` an Checkboxen, Action-Buttons/-Links; `ShortcutService` ignoriert Tasten von BUTTON/A; Test zählt Tab-Stopps |
| M2 `destroy()` entfernte ARIA-Attribute der App am Host | alte Werte werden gemerkt und wiederhergestellt; Test |
| M3 Header in leerer Tabelle nicht erreichbar | Tab bzw. ↑ fokussieren ohne Zeilen den Header; Test |
| M4 Live-Region zu spät erzeugt / außerhalb modaler Dialoge | wird in `firstInit()` erzeugt; Dialog-Grenze dokumentiert (§ 9) |
| M5 `shortcutActionsDisabled`: Viewport nicht mehr per Tastatur scrollbar | `tabindex="-1"` nur mit aktiver Tastatur; Test |
| L1 veraltetes `aria-selected` an Zeilen | entfernt; Test |
| L2 „N cells copied“ zählte das Rechteck | zählt jetzt die selektierten Zellen sichtbarer Spalten; Test |
| L3 Strg+C im Header | bewusst erlaubt (kopiert die Body-Auswahl) – § 2.8 korrigiert |
| L4 `instanceof CheckboxCellRenderer` | `isCheckboxCellRenderer()` (Duck-Typing) |
| L5 Header-Fokus nach `setHeaderVisible(false)` | wird beendet; Test |
| L6 Tab-Heuristik (1 s) | belassen (Seiteneffekt nur bei Klick < 1 s nach Tab) |
| L7 Release-Notes unvollständig | ergänzt (`TODO.md`) |
| L8 doppelte Span-Abfrage je Zelle, Span-Zeilen außerhalb des Sichtbereichs | belassen – Budget eingehalten (+3,6 %), Folgepunkt |
| L9 Risiko Option (a) / `aria-owns` in VoiceOver | bleibt Teil der manuellen Testmatrix (§ 8) |
