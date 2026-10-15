# Design 003 – Zustand speichern (`autoRestoreOptions` vervollständigen + State-API)

> Prompt: `prompts/003-zustand-speichern.md` · Branch `feat/table-state` · Zielversion **1.1.92** (`since`; 1.1.91 ist
> veröffentlicht, 002 Overlays steht schon als „ab 1.1.92“ in `TODO.md`).
> Stand 15.10.2026. Abhängigkeiten: keine. **Freigegeben** 15.10.2026 (Antwort „go“): alle Empfehlungen aus § 9.
> Referenz für das heutige Verhalten: `apps/angular-table-demo/src/app/columndef/demo-columndef.component.ts`
> (Baum + Sortierung + Scroll mit `getStorageKeyFn: () => "demoColumndefComponent"`, auf-/zugeklappte Knoten überleben
> das Neuladen). Diese Demo ist der Regressionsfall **R0**: sie muss nach der Umstellung unverändert funktionieren und
> ihre alten `localStorage`-Einträge übernehmen.

---

## 0. Befund vom 14.10.2026 – geprüft

| Punkt | Ergebnis der Prüfung (Code-Stelle) |
|---|---|
| Sortierung | ✔ bestätigt. `TableScope.sortByColumn()` (Z. ~1108–1135) speichert `[new SortItem(colIdx, newState)]` – **ein** Item, **Index**. `autoRestoreSortingState()` (Z. ~1438) wendet die Items per `doSort` an und setzt `columnDefs[item.columnIndex].sortState`. |
| **S5 (Fehler)** | ✔ im Code bestätigt, Test folgt in Phase 2 (`it.fails` + `// BUG:`). `TableModel.changeColumnOrder()` verschiebt `columnDefs`, `columnSizes` und in den Area-Modellen `properties`; `AreaModelObjectArray.doSort()` liest `this.properties[columnIndex]`. Nach dem Neuladen gilt wieder die Standardreihenfolge → der gespeicherte Index trifft eine andere Spalte. Schon **ohne** Neuladen veraltet der Index: sortieren → Spalte ziehen → das gespeicherte Item zeigt auf die alte Position. `columnsDraggable` ist per Default `true`, betrifft also auch R0. |
| Scroll | ✔ `StoreStateScrollPosService`, `[left, top]`; Speichern ist schon entprellt (`RenderScope`, 500 ms, `checkForScrollPosSaving`). |
| Baum | ✔ `StoreStateCollapsedExpandService` (Modus + Id-Liste, „erster Klick bestimmt den Modus“). `getRowId` hat in `AutoRestoreOptions` einen Default (`id` → `uuid` → `JSON.stringify`) – darum braucht R0 keine eigene `getRowId`. |
| `autoRestoreCheckedState`, `autoRestoreSelectedState` | ✔ nur deklariert; einzige Verwendung: `CoverGridFactory` setzt `autoRestoreSelectedState: false`. |
| `isSame` | ✔ nirgends aufgerufen (nur im eigenen Spec). |
| Spaltenbreite / -reihenfolge / -sichtbarkeit / Header-Gruppen | ✔ nichts davon wird gespeichert. Breite: `TableModel.setColumnWidth()` schreibt immerhin ein neues `Size(px)` in die `ColumnDef` (damit erkennen wir „vom Benutzer geändert“, § 2.4). Header-Gruppen haben **keine Id** (`CellGroupIf`: `data`, `property`, `toggle`, `closed`, …). |
| Doku | ✔ falsch: JSDoc von `AutoRestoreOptionsIf` nennt den Ersatzschlüssel `'autorestoreoptionsif'`; ohne `getStorageKeyFn` legt der `TableScope`-Konstruktor (Z. ~143) keinen Service an – keine Speicherung, keine Warnung. Der Spec `auto-restore-options.spec.ts` hält das schon als `// NOTE:` fest. |
| Export | `StoreStateScrollPosService`, `StoreStateCollapsedExpandService`, `StoreStateSortingService` sind öffentlich exportiert (`@category Internals`) → dürfen nicht verschwinden (Export-Snapshot). |

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `AutoRestoreOptionsIf` / `AutoRestoreOptions` | Schalter für `localStorage` | 5 Flags, `getRowId`, `getStorageKeyFn`, `isSame` | **additiv**: `autoRestoreColumnLayout?`, `autoRestoreHeaderGroupState?`, `autoRestoreCustomState?`, `storage?: StateStorageIf`; `isSame` → `@deprecated`; JSDoc korrigieren |
| `GetRowIdFn<T>` | Zeilen-Id | `(row: T) => string \| number` | **additiv**: zweiter, optionaler Parameter `rowIndex?: number` (für Modelle ohne Zeilenobjekte, § 2.5) |
| `TableOptionsIf` | Startzustand, Event-Takt | – | **additiv**: `initialState?: Partial<TableStateIf>`, `stateChangedDebounceDelay?: number` (Default 300) |
| `EventListenerIf` | Änderungen melden | 10 Callbacks | **additiv**: `onStateChanged?(evt: GeStateChangeEvent)`; `EventAdapter` bekommt eine leere Methode |
| `TableApi` | State-API | – | **additiv**: `getState`, `applyState`, `resetState`, `setCustomState`, `setHeaderGroupCollapsed` |
| neu `state/` | Zustand sammeln/anwenden | – | `table-state.if.ts`, `state-storage.if.ts`, `ge-state-change-event.ts`, `table-state.service.ts` (sammeln, anwenden, entprellen, speichern), `table-state-migration.ts` |
| `TableScope` | Auslöser, Restore beim Start | Restore verteilt auf 3 private Methoden | Konstruktor: Warnung S13; `firstInit()`: ein Aufruf `stateService.restoreOnInit()`; an jeder Änderungsstelle `stateService.markDirty(part)` (§ 2.8) |
| `StoreState*Service` (3) | alte Speicherung | öffentlich exportiert | bleiben als Klassen erhalten (`@deprecated`, nicht mehr intern genutzt); ihre Specs bleiben grün; die Migration liest dieselben Schlüssel |
| `TableModel` | Spalten-Layout | `changeColumnOrder`, `setColumnWidth`, `setColumnVisible` vorhanden | keine Änderung; Reihenfolge wird über `changeColumnOrder` **nachgespielt** (hält Area-Modelle konsistent) |
| `AreaModelCellGroups` | Gruppen auf/zu | `toggleHeaderGroup(mouseTargetData)` über Zeilen-/Spaltenindex | **additiv**: `getToggleGroups(): {id, closed}[]`, `setGroupClosed(id, closed): boolean`; `TableScope.toggleHeaderGroup` teilt sich den Code (Merge der ColumnDefs) |
| `CellGroupIf` | Gruppen-Id | keine Id | **additiv**: `id?: string`; Ersatz-Id = Pfad der Labels (§ 2.6) |
| `CheckboxModel` / `TreeCheckboxModel` | Haken | halten Zeilenobjekte bzw. `TreeRow.checked` | keine Änderung; Restore über `getRowId` + `addCheckedRows` / `checkRow` |
| `SelectionModel` | Auswahl | Bereiche in **Indizes** (`CellRange`), `createSnapshot`/`restoreSnapshot` | keine Änderung; Umrechnung Index ↔ (Zeilen-Id, Property) im State-Service |
| Wrapper (7) | Event | – | neues Event `stateChanged` (React/Preact/Solid-Prop `stateChanged`, Vue `@stateChanged`, Svelte `on:stateChanged` + `onStateChanged`, Angular `(stateChanged)`, Web Component `CustomEvent "stateChanged"`) |

**Breaking Changes:** keine. Alle neuen Member sind optional, `GetRowIdFn` bekommt nur einen optionalen Parameter,
die alten Service-Klassen bleiben exportiert.
**Verhaltensänderungen (Release-Notes):** neues Speicherformat (ein Schlüssel `<key>tableState`, alte Schlüssel werden
gelesen und danach entfernt, § 2.9); Sortierung wird nach Property gespeichert (S5 behoben); `autoRestoreCheckedState`
und `autoRestoreSelectedState` wirken jetzt; Warnung ohne `getStorageKeyFn`.

## 2. Entscheidungen

### 2.1 Zustandsformat (Frage 1) → `TableStateIf`, JSON, `version: 1`

Ein Objekt, jeder Teil optional („nicht vorhanden“ = „nicht anwenden“). Keine Zellwerte, keine Indizes (Ausnahme:
Tabellen ganz ohne `ColumnDef`s, § 2.3).

```ts
export type TableStateRowId = string | number;
export type TableStatePart =
  "columns" | "sort" | "scroll" | "tree" | "checked" | "selection" | "headerGroups" | "custom";

export interface TableStateIf {
  version: 1;
  columns?: TableColumnStateIf[];          // Reihenfolge = Array-Reihenfolge (alle Seiten: west, center, east)
  sort?: TableSortStateIf[];               // erstes Item = Primärschlüssel
  scroll?: TableScrollStateIf;
  tree?: TableTreeStateIf;
  checkedRowIds?: TableStateRowId[];
  selection?: TableSelectionStateIf;
  headerGroups?: TableHeaderGroupStateIf[];
  custom?: unknown;                        // Daten der Anwendung, z. B. Filtertext (JSON-fähig)
}
export interface TableColumnStateIf { property: string; width?: number; visible?: boolean; }
export interface TableSortStateIf { property?: string; columnIndex?: number; sortState: SortState; }
export interface TableScrollStateIf { left: number; top: number; firstRowId?: TableStateRowId; }
export interface TableTreeStateIf { expandedRowIds?: TableStateRowId[]; collapsedRowIds?: TableStateRowId[]; }
export interface TableHeaderGroupStateIf { id: string; closed: boolean; }
export interface TableSelectionStateIf {
  allSelected?: boolean;
  ranges: TableStateRangeIf[];
  negativeRanges?: TableStateRangeIf[];
}
/** Zeilen über Ids, Spalten über Properties. Typ "row": nur Zeilen, Typ "column": nur Spalten. */
export interface TableStateRangeIf {
  fromRowId?: TableStateRowId; toRowId?: TableStateRowId;
  fromProperty?: string;      toProperty?: string;
}
```

- `tree`: genau **eine** der beiden Listen – die kürzere. `expandedRowIds` heißt „diese offen, alle anderen zu“,
  `collapsedRowIds` umgekehrt. Gezählt werden nur Knoten mit Kindern. Ersetzt den heutigen „erster Klick bestimmt den
  Modus“-Trick; „alle auf“ = `{ collapsedRowIds: [] }`.
- `columns[].width` steht nur bei Spalten, deren Breite der Benutzer/die App **geändert** hat (Resize, `setColumnWidth`,
  `autoResizeColumns`). Spalten mit `%`- oder `weight`-Breite bleiben sonst responsiv (§ 2.4).
- `columns[].visible` steht immer (klein, eindeutig).

### 2.2 API (Frage 2)

```ts
// TableApi (additiv)
getState(parts?: TableStatePart[]): TableStateIf;                   // Default: alle Teile
applyState(state: Partial<TableStateIf>, parts?: TableStatePart[]): void; // nur vorhandene (und erlaubte) Teile
resetState(): void;               // Zustand wie direkt nach dem Aufbau (ohne Restore) + gespeicherten Zustand löschen
setCustomState(custom: unknown): void;                             // Teil "custom" setzen → Event/Speichern
setHeaderGroupCollapsed(id: string, collapsed: boolean): boolean;   // false: keine solche Gruppe

// TableOptionsIf (additiv)
initialState?: Partial<TableStateIf>;
stateChangedDebounceDelay?: number;          // ms, Default 300

// EventListenerIf (additiv)
onStateChanged?(evt: GeStateChangeEvent): void;

/** @category Events */
export class GeStateChangeEvent {
  constructor(public readonly state: TableStateIf, public readonly changedParts: TableStatePart[]) {}
}
```

- **`applyState` ohne `partial`-Schalter:** Teile, die im Objekt fehlen, bleiben unverändert (wie ag-Grid
  `initialState`); wer einen Teil zurücksetzen will, übergibt ihn leer (`sort: []`). Ein zweiter Schalter wäre
  doppelt.
- **Rangfolge beim Start:** gespeicherter Zustand (`autoRestoreOptions`) > `initialState` > Modell (ColumnDefs,
  `sortState`, `closed`, …). Pro Teil: was gespeichert ist, gewinnt; der Rest kommt aus `initialState`.
- **`onStateChanged`**: entprellt (`stateChangedDebounceDelay`), feuert nur, wenn sich mindestens ein Teil wirklich
  geändert hat (Vergleich der JSON-Teile mit dem letzten gemeldeten Stand), `changedParts` nennt sie. Beim Start
  (Restore) **kein** Event. `applyState()` feuert eines (die App kann es ignorieren; so bleibt ein Server-Abgleich
  einfach).
- **`resetState()`**: der Service merkt sich in `firstInit()` vor dem Restore den Ausgangszustand (Layout, Sortierung
  der ColumnDefs, Gruppen). Für ein „Layout zurücksetzen“-Knopf – im Video gut zeigbar.
- **Verhältnis zu `autoRestoreOptions`:** intern derselbe Mechanismus. `autoRestoreOptions` = „speichere diese Teile
  unter diesem Schlüssel in diesem Speicher“. Die bisherigen Flags bleiben gültig und bedeuten dasselbe.

| Flag (`AutoRestoreOptionsIf`) | Teil | neu? |
|---|---|---|
| `autoRestoreSortingState` | `sort` | – |
| `autoRestoreScrollPosition` | `scroll` | – |
| `autoRestoreCollapsedExpandedState` | `tree` | – |
| `autoRestoreCheckedState` | `checked` | wirkt jetzt |
| `autoRestoreSelectedState` | `selection` | wirkt jetzt |
| `autoRestoreColumnLayout` | `columns` (Breite, Reihenfolge, Sichtbarkeit) | **neu** |
| `autoRestoreHeaderGroupState` | `headerGroups` | **neu** |
| `autoRestoreCustomState` | `custom` | **neu** |

**Option B (nicht empfohlen):** drei Flags `autoRestoreColumnWidths/Order/Visibility`. Mehr Schalter für einen Fall,
den kaum jemand trennt; wer es braucht, nimmt `getState(["columns"])` und filtert selbst.

### 2.3 Sortierung nach Property (Auftrag 3)

- Gespeichert wird `[{ property, sortState }]` aus den `ColumnDef.sortState`-Werten in **Spaltenreihenfolge des
  Sortierens** (das zuletzt geklickte Item zuerst). Mehrere Items bleiben erhalten (Speicher und `doSort` können es);
  der Header-Klick setzt weiterhin **ein** Item – Mehrspalten-Sortierung per Shift-Klick ist nicht Teil dieses Prompts.
- Beim Anwenden: Property → aktueller Index (`findIndex(cd => cd.property === p)`), dann `doSort` + Header-Icons.
  Unbekannte Properties werden übersprungen (S9).
- **Tabellen ohne `ColumnDef`s** (nur `columnSizes`, z. B. `AreaModelArrayOfArrays` ohne Defs): keine Property
  vorhanden → Ersatz `{ columnIndex, sortState }`, damit das heutige Verhalten nicht wegfällt. Dort gibt es auch keine
  Spalten-Identität, die eine Verschiebung überlebt; dokumentiert.
- `api.sort(compareFn)` (eigener Comparator) ist nicht speicherbar → Teil `sort` = `[]`.

### 2.4 Spaltenlayout (Auftrag 2)

- **Reihenfolge**: Ziel-Reihenfolge aus `columns[]`, angewendet durch Nachspielen mit `TableModel.changeColumnOrder()`
  (hält `columnSizes` und die `properties` der Area-Modelle konsistent – direktes Umsortieren der Arrays würde sie
  auseinanderreißen). Spalten, die im Zustand fehlen (neu im Code), behalten ihren Platz hinter ihrem bisherigen
  Vorgänger; unbekannte Properties werden ignoriert (S9).
- **Breite**: beim `firstInit` merkt sich der Service die ursprüngliche `Size` je Spalte. `width` wird gespeichert,
  wenn die aktuelle `ColumnDef.width` davon abweicht (das setzt `setColumnWidth` schon heute). Anwenden über
  `TableModel.setColumnWidth` + `recalcWrappers`.
- **Sichtbarkeit**: `TableModel.setColumnVisible(property, visible)` (kombiniert schon mit Header-Gruppen).
- Header-Gruppen + Reihenfolge: `AreaModelCellGroups.changeColumnOrder` ist ein No-op – das ist heute beim Ziehen
  genauso; der Restore spielt nur nach, was der Benutzer konnte. Keine Sonderbehandlung.

### 2.5 Zeilen-Ids, Auswahl, Haken (Fragen 4 und 5)

- **Zeilen-Id** immer über `autoRestoreOptions.getRowId` (Default wie heute: `id` → `uuid` → JSON) bzw. – wenn
  keine `autoRestoreOptions` gesetzt sind – denselben Default. Baum: `getRowId(treeRow.data)` (wie heute).
- **Modelle ohne Zeilenobjekte** (`LargeBodyModel`, eigene `AreaModel`s, `getRowByIndex` liefert `undefined`): Die
  Anwendung kann `getRowId: (_row, rowIndex) => rowIndex` setzen (neuer optionaler Parameter). Ohne eigene `getRowId`
  werden `checked`/`selection` für solche Zeilen **nicht** gespeichert (einmal `console.warn`), statt stillschweigend
  falsche Zeilen zu markieren.
- **Checked umsetzen (Empfehlung)**, nicht `@deprecated`: dokumentiert, erwartbar, mit Ids einfach. Gespeichert:
  Ids der angehakten Zeilen (`CheckboxModel.getCheckedRows()`; Baum: Knoten mit `checked === true`). Restore: alle
  Zeilen (`getAllRows()` bzw. alle Baumknoten) einmal durchgehen, Treffer anhaken (Baum: `checkRow` → Eltern
  „semi“/„full“ stimmen). Ids, die es nicht mehr gibt, fallen weg.
- **Selected umsetzen (Empfehlung)** mit Typ-Regeln:
  | Typ | gespeichert | Restore |
  |---|---|---|
  | `row` | `fromRowId`/`toRowId` je Bereich, zusammenhängende Zeilen zu einem Bereich | Id → aktueller Index; Bereich wird in der **aktuellen** Reihenfolge wieder aufgespannt |
  | `column` | `fromProperty`/`toProperty` | Property → aktueller Index |
  | `cell`, `range` | beide Ecken (Id + Property) | Ecken umrechnen, Rechteck in aktueller Reihenfolge |
  | `none` | nichts | – |
  Fehlt eine Ecke (gefiltert, gelöscht), entfällt der Bereich. `allSelected` und negative Bereiche werden mitgenommen.
  Bei gleicher Sortierung (der Normalfall, weil `sort` mitgespeichert wird) ist das Ergebnis identisch; bei anderer
  Sortierung bleibt ein Bereich ein Rechteck zwischen denselben Eckzeilen – dokumentiert.
- **App-Vorauswahl vs. gespeicherte Auswahl** (R0 setzt Bereiche im Konstruktor): gespeichert gewinnt nur, wenn
  etwas gespeichert ist. R0 hat `autoRestoreSelectedState: false` und bleibt unberührt.
- Fokus (`FocusModel`) wird **nicht** gespeichert (ag-Grid tut es, ist aber selten gewünscht; später additiv möglich).

### 2.6 Header-Gruppen

- Id: `CellGroupIf.id`, sonst der Pfad der Labels (`String(data)` der Vorfahren + eigenes Label, getrennt mit `/`,
  z. B. `"Customer"` oder `"2026/Q1"`). Doppelte Pfade bekommen `#2`, `#3` angehängt (Reihenfolge im Baum). Nur
  Gruppen mit `toggle: true` und `visibility !== "always"` stehen im Zustand.
- Gespeichert wird `closed` aller schaltbaren Gruppen (auch offener – eine Gruppe kann im Code `closed: true`
  starten).

### 2.7 Scroll-Position (Frage 6) → Pixel + Id der ersten sichtbaren Zeile

Gespeichert: `{ left, top, firstRowId }`. Restore: zuerst Pixel (exakt, wenn Daten und Zeilenhöhen gleich sind);
liegt danach eine andere Zeile oben und gibt es `firstRowId` noch, `scrollToIndex(-1, index)`. Robust gegen neue
Zeilen oben, ohne den Normalfall ungenauer zu machen. Ohne Zeilenobjekte (§ 2.5) nur Pixel.

### 2.8 Wann wird gespeichert? (Abschluss-Review: „keine doppelten Speicherzugriffe pro Scroll-Frame“)

`TableStateService.markDirty(part)` setzt nur ein Flag und startet/verlängert **einen** Timer
(`stateChangedDebounceDelay`). Danach: nur die schmutzigen Teile neu berechnen, mit dem letzten Stand vergleichen,
bei Änderung **ein** `setItem` (nur die per Flag erlaubten Teile) und **ein** `onStateChanged`. Der heutige
500-ms-Scroll-Timer in `RenderScope` geht darin auf. `destroy()` stoppt den Timer und schreibt einen noch offenen
Stand sofort (sonst ginge die letzte Änderung vor einem Seitenwechsel verloren).

Auslöser (`markDirty`): `sortByColumn`, `sort(fn)`, Spaltenbreite (Ende des Resize-Ziehens, `setColumnWidth`,
`autoResizeColumns`), Spalten-Drag (Ende), `setColumnVisible`, `toggleHeaderGroup`/`setHeaderGroupCollapsed`,
`setTreeRowExpanded`, `toggleExpandCollapseAll`, `toggleRowCheckbox` + Header-Checkbox + `api`-Methoden, die Haken
ändern, `onSelectionChanged` (TableScope hört schon zu), Scroll, `setCustomState`.

### 2.9 Speicher-Adapter und Migration (Fragen 3 und 7)

```ts
/** Synchroner Schlüssel-Wert-Speicher – `localStorage` und `sessionStorage` erfüllen ihn direkt. */
export interface StateStorageIf {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
```

- **Namen wie die Web-Storage-API** (statt `get/set/remove` aus dem Prompt): dann ist `storage: sessionStorage`
  ohne Adapter möglich.
- **Synchron**: Der Restore muss vor dem ersten Rendern fertig sein. Für Server/IndexedDB ist der Weg
  `initialState` (vorher laden) + `onStateChanged` (speichern) – sauberer als ein asynchroner Adapter, der die Tabelle
  springen ließe. Beispiel in `instructions.md`.
- Default `localStorage`; jeder Zugriff in `try/catch` (S12, wie heute).
- **Ein Schlüssel** `<key>tableState` mit dem ganzen JSON.
- **Migration**: fehlt `<key>tableState`, liest der Service `<key>sortingState` (Index → Property über die
  **Standard**-Reihenfolge, die nach einem Neuladen der alten Version immer galt), `<key>scrollState` und
  `<key>collapsedExpandedState` (Modus + Ids → `tree`). Beim ersten Speichern wird nur der neue Schlüssel geschrieben,
  die alten werden entfernt. Lesen der alten Schlüssel bleibt bis 1.2 (Eintrag in `TODO.md`). Ein Downgrade verliert
  dann den Zustand – vertretbar.

### 2.10 Warnung und Doku (Auftrag 5, S13)

- Ist ein `autoRestore…`-Flag `true`, aber keine `getStorageKeyFn` (oder leerer Schlüssel): **eine** `console.warn`
  pro Tabelle („autoRestoreOptions: … ignored without getStorageKeyFn“). Das Verhalten (nichts speichern) bleibt.
- JSDoc `AutoRestoreOptionsIf`: Ersatzschlüssel streichen, alle Flags + Format + Datenschutz beschreiben.
- **Datenschutz (Frage 8):** Im Zustand stehen nur Ids, Properties, Breiten und Zustände, keine Zellwerte. Ids können
  personenbezogen sein (E-Mail als Id) – Hinweis in JSDoc und `instructions.md`; Empfehlung technische Ids.
  Ausnahme: der Default-`getRowId`-Ersatz `JSON.stringify(row)` schreibt bei Zeilen ohne `id`/`uuid` die **ganze
  Zeile** in die Ids → für `checked`/`selection`/`tree` bei diesem Ersatz einmal warnen und die Doku sagt: eigene
  `getRowId` setzen.

## 3. Ablauf beim Start (`firstInit`)

1. Ausgangszustand für `resetState()` merken.
2. Zustand bestimmen: gespeichert (ggf. migriert) Teil für Teil vor `initialState`.
3. Anwenden in dieser Reihenfolge: `columns` (Reihenfolge → Sichtbarkeit → Breite) → `headerGroups` → `tree`
   (alle Knoten, wie heute) → Filter (wie heute) → `sort` → `checked` → `selection` → nach
   `adjustContainersAndRows()`: `scroll`. `custom` wird nur abgelegt; die App liest es in `tableReady`
   (`api.getState().custom`) und wendet ihren Filter selbst an.
4. Kein `onStateChanged`.

## 4. Beispiele (Referenzfälle, ≤ 15 Zeilen)

**Spaltenlayout merken (S1–S5, Video):**
```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<Order>(),
    getStorageKeyFn: () => "orders",
    autoRestoreColumnLayout: true,     // Breite, Reihenfolge, Sichtbarkeit
    autoRestoreHeaderGroupState: true,
    autoRestoreSortingState: true
  }
};
// "Total" auf 240 px ziehen, "City" nach vorn, sortieren, F5 → alles wie vorher
```
Erwartung: S1 Breite 240 px; S2 Reihenfolge wie vorher; S3 `setColumnVisible('city', false)` bleibt; S4 „Customer“
bleibt zu; S5 sortiert nach „Total“ (Header-Icon an „Total“, Zeilen absteigend nach `total`).

**Haken und Auswahl (S6, S7):**
```ts
autoRestoreOptions: {
  ...new AutoRestoreOptions<Order>(),
  getStorageKeyFn: () => "orders",
  getRowId: (order: Order) => order.id,
  autoRestoreCheckedState: true,
  autoRestoreSelectedState: true
}
```
Erwartung: Zeilen mit den Ids der vorher angehakten Zeilen sind angehakt, auch wenn der Server sie in anderer
Reihenfolge liefert; Zeilen-Auswahl (Typ `row`) markiert dieselben Ids.

**Auf dem Server speichern (S10, S11):**
```ts
const saved = await fetch("/api/prefs/orders").then(r => r.json());   // TableStateIf | null
const tableOptions: TableOptionsIf = { ...new TableOptions(), initialState: saved ?? undefined };
const listener: Partial<EventListenerIf> = {
  onStateChanged: (evt: GeStateChangeEvent) =>
    fetch("/api/prefs/orders", { method: "PUT", body: JSON.stringify(evt.state) })
};
```
Erwartung: S10 neue Tabelle mit `initialState = api.getState()` sieht gleich aus; S11 nach einem Resize kommt nach
300 ms **ein** Event mit `changedParts: ["columns"]`.

**Zurücksetzen:** `resetButton.onclick = () => tableApi.resetState();` → Layout wie im Code, Speicher leer.

| # | Erwartung (zusätzlich zu oben) |
|---|---|
| S8 | `localStorage["orderssortingState"] = '[{"columnIndex":2,"sortState":"desc"}]'` → Spalte mit Standard-Index 2 absteigend sortiert; nach der nächsten Änderung steht `orderstableState` mit `sort: [{ property: "…", sortState: "desc" }]`, der alte Schlüssel ist weg |
| S9 | `columns`/`sort`/`selection` mit `property: "gone"` → übersprungen, Rest angewendet, keine Exception |
| S12 | `throwingStorage()` → Tabelle startet, `getState()` funktioniert, Event kommt, nichts wirft |
| S13 | `autoRestoreSortingState: true` ohne `getStorageKeyFn` → genau eine `console.warn` |
| R0 | Angular-Demo `columndef`: Baum auf/zu, Sortierung, Scroll bleiben nach F5 erhalten; alte Schlüssel `demoColumndefComponent…` werden übernommen |

## 5. Tests (Phase 2, geplant)

- **Zuerst** `table-scope`-Browser-Spec für S5 als `it.fails('sorts the same column after a column drag and a rebuild')`
  + `// BUG:` + Eintrag `TODO.md` „Gefunden durch die Unit-Tests“ – auf `main`-Stand rot bzw. `it.fails` grün.
- Unit (`state/*.spec.ts`, In-Memory-Storage): Serialisieren/Anwenden je Teil auf einem Modell ohne DOM, Migration
  S8 (alle drei alten Schlüssel), S9, Speicher-Adapter (`sessionStorage`-artig, `throwingStorage`), S13,
  `tree` kürzere Liste, Ids ohne Zeilenobjekte (§ 2.5), Gruppen-Ids inkl. doppelter Pfade, Entprellung mit Fake-Timern
  (ein `setItem` pro Takt, kein Event ohne Änderung).
- Browser (`state/table-state.browser.spec.ts`): S1–S7, S10–S12 mit echtem Neuaufbau (`destroyAllTables()`, dann
  `mountTable` mit gleichem Schlüssel); Baum-Restore; `resetState`; Event-Takt; `destroy()` schreibt offenen Stand.
- Bestehende Specs: `store-state-*.service.spec.ts` bleiben unverändert grün (Klassen bleiben);
  `auto-restore-options.spec.ts`: `// NOTE:` zur Doku anpassen; Tree-/Sort-Specs bleiben grün.
- Wrapper: Smoke-Test `stateChanged` in React und Web Component.
- `test:types`, `docs:check`, Export-Snapshot (nur Zugänge), Coverage neue Dateien ≥ 95/90 %, Shuffle-Lauf.
- Keine neuen DOM-Elemente → keine ARIA-/Injection-Tests nötig (Ids landen nirgends im DOM).

## 6. Doku, Demos, Website, Training, Demo-Repo, Video (Phasen 4–9)

| Phase | Entscheidung |
|---|---|
| 4 Doku | JSDoc (alle neuen Symbole `@category State` → neue Kategorie in `typedoc.json`), `instructions.md` § 6.11 neu („What can be remembered“, State-API, Server-Beispiel, Datenschutz), READMEs/`llms.txt` Feature-Zeile, `CLAUDE.md` § 3.6 Persistenz + § 3.7 Felder, `TODO.md` Release-Notes |
| 5 Demos | `apps/table-demo/state.html` (Aufnahme-Seite: Layout ändern, F5, „Reset“-Knopf, State-JSON live daneben). Angular-Demo `columndef`: `autoRestoreColumnLayout: true` ergänzen – erst nach dem Release (Demo nutzt npm-Pakete). Kein neues Demo-Modell nötig (Orders aus `shared/orders`). |
| 6 Website | Feature-Liste: „State persistence: column layout, sorting, selection, tree – localStorage or your server“; `why.astro` prüfen. Kein neuer Showcase. Kein Deploy. |
| 7 Training | **kein neues Kapitel**: Kapitel 33 `persist-state` erweitern (Tabelle „What can be remembered“, Abschnitt „Your own storage / server“ mit `<Callout type="version">` 1.1.92), Live-Demo `demos/persist-state.ts` um Spaltenlayout + Reset, Screenshots neu, `api` im Register ergänzen. |
| 8 Demo-Repo | **auslassen**: `ep-033` ist ein bestehender Tag und darf nicht umgeschrieben werden; der neue Teil steht als Live-Demo auf der Seite. |
| 9 Video | `videos/04-zustand-merken/` = Backlog-Folge 19, erweitert: „Spalten anpassen, neu laden, alles noch da“ (+ 5 s Server-Variante); `CLAUDE.md` § 10 Zeile 19 anpassen. ag-Grid: „Grid State“ ist Community → kein „ohne Enterprise“-Titel. |

## 7. Größe und Performance

- Erwartet +5–7 KB minifiziert (`dist` vorher/nachher in Phase 3 messen).
- Restore: höchstens ein Durchlauf über alle Zeilen je Teil (`checked`, `selection`, `tree`), nur wenn der Teil Daten
  hat. Speichern: entprellt, nur schmutzige Teile; `checked` beim Baum O(n) pro Takt – bei 2 Mio. Zeilen nur, wenn das
  Flag an ist und sich Haken geändert haben.

## 8. Risiken

- Nachspielen der Reihenfolge über fixierte Seiten hinweg: `changeColumnOrder` erlaubt heute auch Verschiebungen über
  die West/East-Grenze; der Restore macht nichts, was der Benutzer nicht konnte. Test mit fixierten Spalten (R0 hat
  links und rechts je eine).
- `selection` in anderer Sortierung kann einen anderen Zellblock ergeben (§ 2.5) – dokumentiert, nicht „gelöst“.
- Default-`getRowId` mit JSON-Ersatz schreibt Zelldaten in den Speicher (§ 2.10) – Warnung + Doku.
- Svelte/Solid/… bekommen ein neues Event; Prop-Namen müssen in allen 7 Wrappern gleich sein.

## 9. Zur Freigabe – Entscheidungen (Empfehlung jeweils zuerst)

1. Format `TableStateIf` wie § 2.1 (ein Teil `columns`, `tree` mit kürzerer Liste, Breite nur wenn geändert).
2. API § 2.2: `getState(parts?)`, `applyState(state, parts?)` **ohne** `partial`, zusätzlich `resetState()`,
   `setCustomState()`, `setHeaderGroupCollapsed()`; `initialState`; `onStateChanged` mit `GeStateChangeEvent`
   (300 ms, kein Event beim Start). Rangfolge gespeichert > `initialState` > Modell.
3. Ein neues Flag `autoRestoreColumnLayout` (statt drei), dazu `autoRestoreHeaderGroupState`, `autoRestoreCustomState`.
4. Speicher-Adapter **synchron**, Web-Storage-Namen (`getItem/setItem/removeItem`); Server über `initialState` +
   Event.
5. Checked **und** Selected umsetzen (nicht `@deprecated`); `isSame` → `@deprecated`.
6. Auswahl über (Zeilen-Id, Property); ohne Zeilenobjekte nur mit eigener `getRowId(row, rowIndex)`.
7. Scroll: Pixel + `firstRowId`.
8. Migration: alte Schlüssel lesen, nur neu schreiben, alte nach Migration löschen; Lesen bis 1.2.
9. Sortierung ohne `ColumnDef`s: Ersatz `columnIndex` (heutiges Verhalten bleibt).
10. Phasen: kein neues Trainingskapitel (Kap. 33 erweitern), kein Showcase, Demo-Repo auslassen, Video
    `videos/04-zustand-merken/`.

## 10. Umsetzung (15.10.2026)

Branch `feat/table-state`. Alles aus § 9 umgesetzt; Abweichungen und Ergänzungen:

- **Reihenfolge unbekannter Spalten (S9):** Spalten, die im Zustand fehlen, bleiben hinter der Spalte, der sie *jetzt*
  folgen (nicht „auf ihrem Platz“). Eine Teilliste ordnet so nur die genannten Spalten; Beispiel im Spec
  („not listed columns stay behind the column they follow now“).
- **Zeilen-Ids:** Der Default-`getRowId` von `AutoRestoreOptions` ist intern markiert (`data/options/default-row-id.ts`).
  Mit ihm nutzt die Tabelle nur `id`/`uuid` – **kein JSON der Zeile** (Review-Fund: personenbezogene Daten im Speicher,
  auch bei Array-Zeilen). Zeilen ohne Id werden nicht gespeichert, eine Warnung nur für gespeicherte Teile.
  Verhaltensänderung für Bäume ohne `id`: der alte Zustand (JSON-Ids) geht einmal verloren (Release-Notes).
- **Auswahl:** offene Bereiche (bis zur letzten Zeile/Spalte) ohne `toRowId`/`toProperty`; Tabellen ohne `ColumnDef`s
  speichern nur Zeilen-Auswahlen.
- **Kosten:** `tree`, `checked`, `selection` (Durchlauf über alle Zeilen) werden beim Start nur berechnet, wenn sie
  gespeichert oder als `initialState` gegeben sind; ihre erste Änderung wird immer gemeldet. `resetState()` setzt sie
  nur in diesem Fall zurück; Sortierung: nur die Symbole (die Zeilen behalten ihre Reihenfolge).
- **Robustheit:** Fehler in `onStateChanged`, `getRowId` oder einem nicht-JSON `custom` landen in `console.error`;
  `destroy()` gibt die Tabelle trotzdem frei. `markDirty`/`flush` wirken erst nach dem Start. Das Event bekommt eine
  Kopie; `ALL_TABLE_STATE_PARTS` ist eingefroren. Programmatisch geänderte Haken werden spätestens mit `destroy()`
  gespeichert. Alte Schlüssel werden nach dem ersten erfolgreichen Speichern entfernt (auch wenn schon
  `<key>tableState` existiert).
- **Ausgeblendete Spalten:** `visible` = Sichtbarkeit ohne Header-Gruppe, also auch `isVisible: FalseFn` aus dem Code
  (Review-Fund: „vom Benutzer eingeblendet“ ging verloren).
- **Größe:** `dist/index.js` 489,4 kB → 520,6 kB (gzip 118,6 → 126,9 kB) – mehr als geschätzt (+8,3 kB gzip), v. a.
  `TableStateService` (~900 Zeilen inkl. JSDoc; das Bundle ist nicht minifiziert).
- **Tests:** Unit 1.556 (+21), Browser ~538 (+63, neu `state/table-state.browser.spec.ts`), Wrapper-Smoke React + Web
  Component; Abdeckung `state/` 98 % Zeilen / 93 % Zweige, gesamt 97,1 % / 90,1 %. `docs:check`: 329 Beispiele.
- **Review** (separater Agent, 13 Funde): 1–7, 9–12 behoben bzw. abgesichert (Specs in „review findings“), 8 dokumentiert,
  13 (öffentliche, jetzt immer leere `storeState…`-Felder) bewusst `@deprecated` gelassen.
- **Nicht gemacht:** Angular-Demo `columndef` (nutzt npm-Pakete – nach dem Release `autoRestoreColumnLayout: true`
  ergänzen), Demo-Repo (Kap. 33 hat schon `ep-033`), Mehrspalten-Sortierung per Shift-Klick, Fokuszelle im Zustand.
