# Design 010 – Fill-Handle und Batch-Edit

> Prompt: `prompts/010-fill-handle-batch-edit.md` · Branch `feat/fill-batch` · Zielversion **1.1.96** (`since`).
> Stand 16.10.2026. Abhängigkeiten: 001 (ARIA), 005 (Aggregation), 008 Teil A (berechnete Spalten) sind auf `main`.
> **Selbständig umgesetzt** (Auftrag „arbeite selbständig an prompts/010-fill-handle-batch-edit.md“, 16.10.2026):
> Claude hat die Empfehlungen aus § 2 übernommen, ohne die Freigabe abzuwarten. Jede Entscheidung ist begründet und
> lässt sich vor dem Merge noch ändern.
>
> ag-Grid (geprüft 16.10.2026): Fill Handle (`CellSelectionModule`) und Batch Editing (`BatchEditModule`) sind dort
> **Enterprise**. ag-Grid nutzt ⌥/Alt als Umschalter (eine Zahl → Reihe, mehrere Zahlen → kopieren) und rechnet
> Sortieren/Filtern/Aggregation bei Batch-Edit mit den **übernommenen** Daten – beides übernehmen wir.

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `SelectionModel` (`range`), `getRanges()` | Quelle des Füllens | letzter Bereich = zuletzt gezogener/geklickter; negative Bereiche nur für Abwahl | Handle am **letzten** Bereich (Frage 3), nur Typ `range`, nicht bei `isAllSelected()` |
| `RenderScope.renderSelectedBackgroundDiv` | Auswahl zeichnen | je **Zelle** ein Div `ge-table-<area>-<side>-selected-range` – es gibt kein Bereichs-Div | Handle = **ein** Div je Tabelle im Host (wie Geisterbild/Marke von Row Drag), Lage **gerechnet** aus Zeile/Spalte (Zeile über `getYPosByRowIndex`, Spalte über `getColumnLeftInHost`); neu gesetzt am Ende jedes Render-Durchgangs |
| `RowDragService` (009) | Vorbild | Pointer Events nur am Griff, `preventDefault` → kein `MouseHandler`, Dokument-Listener mit eigenem `AbortController`, rAF-Auto-Scroll, Escape | `FillHandleService` nach demselben Muster (eigene Klasse, kein Umbau von 009). `findRowIndexAtY` aus `row-drag/move-rows.ts` wiederverwendet |
| `TableScope.updateModelValueAfterEdit` | Editieren | `setValue` → Repaint → `onModelChanged(createSingle)` | ruft jetzt die **eine** Schreibstelle `applyCellChanges()` (Verhalten bit-gleich: ein Event, Editor zu, Fokus an den Host) |
| `AreaModelIf.isEditable/setValue` | Schreiben | `editInputPipe` läuft **in** `setValue` (`AbstractAreaModel`, `ArrayOfArrays`); berechnete Spalte ohne `valueSetter` → nicht editierbar; Pivot `setValue` = `false`; Gruppenzeilen nicht editierbar | unverändert genutzt: nicht editierbare Ziele werden übersprungen (H5), Pipe wie beim Editieren (H6) |
| `AreaModelRowGroups.batch(fn)` | mehrere Zellen | verschiebt Zeilen mit geändertem Gruppierwert erst am Ende | `applyCellChanges` schreibt in `batch()` (Indizes bleiben gültig) |
| `GeModelChangeEvent` | Event | hat schon `cells: GeCellIndices[]` (mehrere Zellen möglich), wird heute nur mit einer Zelle erzeugt | **additiv**: optionale Felder `changes?: CellChangeIf[]` (alt/neu, Zeile, Property) und `source?: CellChangeSource` (Frage 8) |
| `EventListenerIf` | Batch-Status | – | neu optional `onBatchEditChanged?(evt: GeBatchEditEvent)` |
| `ColumnDefIf` / `ColumnDef.create` | Validierung | – | neu optional `validate?: (value, row) => string \| undefined \| null` (Frage 7) |
| `TableOptionsIf` | Optionen | Muster `rowDragOptions` | neu `fillHandle?: boolean \| Partial<FillHandleOptionsIf>`, `batchEdit?: boolean \| Partial<BatchEditOptionsIf>` |
| `ActionId`, Shortcut-Mappings | Tastatur | `ShortcutService` verhindert die Browser-Aktion **nur**, wenn die Aktion verbraucht wurde | neu `FILL_DOWN` (Strg/⌘+D), `FILL_RIGHT` (Strg/⌘+R) – nur verbraucht, wenn das Fill-Handle an ist und ein Bereich markiert ist; sonst bleiben Lesezeichen/Neu laden (Frage 4) |
| `AriaTextsIf` / `AriaTexts` | Ansagen | Row-Drag-Texte optional im Interface | neu **optional** `cellsFilled(n)`, `pendingChanges(n)`, `changesCommitted(n)`, `changesDiscarded()`, `commitBlocked(n)`, `invalidValue(message)` |
| `CopyService`, Excel | – | lesen das Modell | **unverändert**: kopieren/exportieren die übernommenen Werte (Frage 6, Grenze dokumentiert) |
| `crud/` | Speichern | lädt/speichert einzelne Objekte | **unverändert**: Batch-Commit liefert ein Event, das Speichern macht die Anwendung (Frage 10, Beispiel mit `fetch`) |

**Breaking Changes:** keine. Alles optional/neu. `ActionId` bekommt zwei Werte (wie bei jeder neuen Aktion).
`onModelChanged` feuert wie bisher genau einmal je Edit; Fill und Commit sind neue Auslöser (einmal je Vorgang).

## 2. Entscheidungen

### 2.1 Einschalten (Frage 1)

```ts
tableOptions.fillHandle = true;                                     // beide Richtungen
tableOptions.fillHandle = { direction: "vertical" };               // nur nach oben/unten
```

`FillHandleOptionsIf` (`fill/fill-handle-options.if.ts`): `direction: "vertical" | "horizontal" | "both"` (Default
`"both"`, wie ag-Grid), `fillValue?: (ctx: FillValueContextIf) => unknown` (Frage 2), `maxCells` (Default 100.000 – eine
Füllung darüber wird abgelehnt und angesagt), `autoScrollZoneInPx` (40), `autoScrollMaxSpeedInPx` (24, wie Row Drag).
Nur wirksam mit `SelectionModel` vom Typ `range`. Ohne `fillHandle` ändert sich nichts (kein DOM, keine Listener-Wirkung).

### 2.2 Reihen-Erkennung (Frage 2) → DOM-frei `fill/fill-series.ts`

`computeFillValues(sourceValues, count, options) → unknown[]` – eine **Linie** (Spalte beim Füllen nach unten/oben, Zeile
nach rechts/links). Rückwärts (nach oben/links) = Reihe mit negativem Index (ag-Grid/Excel). Regeln (Modus `"series"`):

| Quelle | ohne Modifikator | mit ⌥/Alt bzw. Strg (Windows) |
|---|---|---|
| **eine Zahl** `5` | kopieren: 5, 5, 5 (H1) | Reihe +1: 6, 7, 8 |
| **≥ 2 Zahlen** `1, 2` | lineare Reihe 3, 4, 5 (H2); konstante Differenz wird fortgesetzt, sonst lineare Regression (wie Excel/ag-Grid); Rundung über `toPrecision(15)` (0,1 + 0,2 = 0,3) | kopieren (Muster wiederholen) |
| **Datum** (`Date` oder Text `YYYY-MM-DD`) | ein Datum: +1 Tag (H3); mehrere: gleicher Monatstag (bzw. jeweils Monatsende) und ganze Monate Abstand → **Monatsschritt** (31.01. → 28.02. → 31.03. bleibt Monatsende), sonst Tagesschritt. **Typ bleibt**: Text bleibt Text im selben Format, `Date` bleibt `Date` (lokale Kalenderrechnung, Uhrzeit bleibt) | kopieren |
| **Text mit Endzahl** `Item 9` | Reihe: `Item 10`, `Item 11` (H4); mehrere mit gleichem Präfix: Schritt aus der Differenz; führende Nullen bleiben (`A007` → `A008`) | kopieren |
| Zahl als Text `"5"` | wie Zahl, Ergebnis wieder Text | wie Zahl |
| alles andere (Text, `true`, leer, gemischt) | Muster wiederholen: `A, B` → `A, B, A, B` | dasselbe |

Erweiterungspunkt: `fillValue(ctx)` (`FillValueContextIf`: `sourceValues`, `step` (1, 2, … bzw. −1, −2 … rückwärts),
`direction`, `rowIndex`, `columnIndex`, `property`, `row`, `defaultValue`, `copy`) – Rückgabe `undefined` = Default.
Damit z. B. Wochentage zyklisch. Nicht übernommen: ag-Grids `skipCell()` – dafür reicht `editable`.

### 2.3 Mehrere Bereiche (Frage 3) → nur der letzte

Das Handle sitzt an der rechten unteren Ecke des **letzten** Bereichs von `getRanges()`. Sichtbar nur, wenn diese Ecke im
sichtbaren Body liegt (unter Header, über Footer, nicht unter fixierten Spalten); bei offenem Editor, blockierendem
„Loading“-Overlay und während eines Row Drags versteckt.

### 2.4 Ziehen

- `pointerdown` am Handle (`data-ge-action="fill-handle"`) wird `preventDefault`-et → keine Bereichsauswahl
  (`MouseHandler` sieht nichts). Dokument-Listener `pointermove/up/cancel` + `keydown` (Escape) mit eigenem
  `AbortController`, Schwelle 3 px.
- Zielzelle **gerechnet** (Zeile über `findRowIndexAtY`, Spalte über die Spaltenpositionen inkl. fixierter Seiten), nie aus
  dem DOM. Die Richtung bestimmt die Achse, auf der der Zeiger weiter außerhalb des Quellbereichs liegt (Excel); bei
  `direction` nur die erlaubte Achse. Ziehen in den Bereich hinein = keine Füllung (Excel würde leeren – bewusst nicht).
- Vorschau: Rahmen `ge-table-fill-preview` um Quelle + Ziel (Host-Div, `aria-hidden`), Host-Klasse
  `ge-table-fill-active` (Cursor `crosshair`). Auto-Scroll senkrecht und waagerecht in der Randzone (wie 009, H8).
- Loslassen: Werte berechnen → `applyCellChanges(…, "fill")` → Auswahl = Quelle + Ziel (Excel), Ansage
  `cellsFilled(n)`. Escape / `pointercancel`: nichts geändert (H8).

### 2.5 Tastatur (Frage 4) → Strg/⌘+D, Strg/⌘+R wie Excel

`FILL_DOWN`: Bereich mit ≥ 2 Zeilen → oberste Zeile nach unten **kopieren**; eine Zeile → Zelle darüber hineinkopieren.
`FILL_RIGHT` analog nach rechts. Konflikt mit Browser-Kürzeln (Strg+D = Lesezeichen, Strg+R = Neu laden): die
`ShortcutService` verhindert die Browser-Aktion nur, wenn die Aktion **verbraucht** wurde – also nur bei aktivem Fill-Handle,
markiertem Bereich und Fokus in der Tabelle. Wer das nicht will: `shortcutActionIdMapping: { "ctrl+r": undefined }` bzw.
eigene Tasten. Das Handle ist `aria-hidden`; der Host bekommt `aria-keyshortcuts="Control+D Control+R"` (macOS
`Meta+D Meta+R`), solange das Fill-Handle an ist.

### 2.6 Batch-Edit (Fragen 5, 6)

```ts
tableApi.startBatchEdit();          // ab jetzt vormerken
tableApi.getPendingChanges();       // [{ row, rowIndex, columnIndex, property, oldValue, newValue, error? }]
tableApi.commitBatchEdit();         // true = geschrieben (false: ungültige Werte blockieren)
tableApi.cancelBatchEdit();         // alles verworfen
tableApi.isBatchEditing(); tableApi.hasPendingChanges();
```

- **Beides**: `startBatchEdit()` gilt bis `commit`/`cancel`; `tableOptions.batchEdit: true` = dauerhaft an (nach Commit
  wird weiter vorgemerkt). `BatchEditOptionsIf`: `blockCommitOnInvalid` (Default `true`, B7).
- **Speicherung**: `BatchEditService` (`batch-edit/`) hält `Map<rowKey, Map<property, PendingCell>>`.
  `rowKey` = das Zeilenobjekt von `getRowByIndex` (bei `TreeRow` dessen `data`; Array-of-Arrays: das Zeilen-Array);
  Spalte über die **Property** (Spaltenreihenfolge darf sich ändern), ohne Property `#<Spaltenindex>`. Modelle ohne
  Zeilenobjekte (`getRowByIndex` liefert nichts) → Schlüssel = Zeilenindex (dokumentierte Grenze: Sortieren verschiebt).
- **Anzeige statt Modell** (wie ag-Grid): Der Overlay wird beim **Zeichnen** ausgewertet (`RenderScope` fragt den Dienst
  je Body-Zelle, eine `Map`-Abfrage; leer = gar keine Arbeit). Renderer bekommen den vorgemerkten Wert als `cellValue`,
  die Zelle die Klasse `ge-table-cell-pending` (ungültig zusätzlich `ge-table-cell-invalid` + `title` = Meldung).
  Sortieren, Filtern, Summen, Copy und Excel rechnen mit den **übernommenen** Daten (B5: Änderungen hängen an der Zeile und
  wandern beim Sortieren mit). Das Fill-Handle liest die angezeigten Werte (B6).
- **Pipe**: Vorgemerkt wird der **gepipete** Wert (Anzeige, `getPendingChanges`), gemerkt wird auch die rohe Eingabe:
  `commit` schreibt die rohe Eingabe über `setValue` (die Pipe läuft dort genau einmal – kein doppeltes `Number()`).
- **B8**: gleicht der neue Wert dem Ursprungswert (`Object.is`, Datum über `getTime()`), wird der Eintrag entfernt;
  `oldValue` bleibt der Wert vor der **ersten** Änderung.
- **Commit**: Index je Zeile einmal per Durchlauf der angezeigten Zeilen (O(n)), Schreiben in `AreaModelRowGroups.batch`,
  danach `invalidateAggregates()`, `repaintHard()`, **ein** `onModelChanged` (source `"commit"`) und
  `onBatchEditChanged({ type: "commit" })`. Zeilen, die ein Filter gerade ausblendet, werden direkt ins Objekt geschrieben
  (`valueSetter` bzw. Property-Pfad bzw. Array-Index, Pipe bereits angewendet).

### 2.7 Validierung (Frage 7)

`ColumnDef.validate?: (value, row) => string | undefined | null` – Meldung = ungültig. Geprüft wird der gepipete Wert.
- **Batch**: ungültige Werte werden vorgemerkt und markiert (`ge-table-cell-invalid`, Tooltip), `commitBatchEdit()` gibt
  bei `blockCommitOnInvalid` `false` zurück und sagt `commitBlocked(n)` an.
- **Ohne Batch**: ein ungültiger Wert wird **nicht** geschrieben (Editor schließt, Ansage `invalidValue(meldung)`); beim
  Füllen wird die Zelle übersprungen.

### 2.8 Änderungssatz und Events (Frage 8)

```ts
export type CellChangeSource = "edit" | "fill" | "commit" | "api";
export interface CellChangeIf {   // fill/cell-change.if.ts
  row: unknown;            // Zeilenobjekt (TreeRow → data), bei eigenen Modellen ohne Objekte undefined
  rowIndex: number;        // Anzeige-Index zum Zeitpunkt des Events, -1 = gerade ausgefiltert
  columnIndex: number;
  property: string;
  oldValue: unknown;
  newValue: unknown;
  error?: string;          // nur vorgemerkte, ungültige Werte
}
```

- `onModelChanged` feuert **einmal je Vorgang** (Edit, Fill, Commit, `api.applyCellChanges`), `evt.cells` enthält alle
  Zellen, neu `evt.changes` und `evt.source`. Vorgemerkte Änderungen ändern die Daten nicht → kein `onModelChanged`.
- Neu `onBatchEditChanged(GeBatchEditEvent)`: `type` = `"start" | "change" | "commit" | "cancel" | "end"`, `changes`
  (dieser Schritt), `pendingChanges` (alle), `invalidCount`. Wrapper: Event `batchEditChanged` (alle 7).
- `api.applyCellChanges([{ rowIndex, column: index | property, value }], source?)` ist der öffentliche Weg zur einen
  Schreibstelle (Editor, Fill, Commit nutzen sie intern) – Grundlage für Einfügen und Undo.

### 2.9 Undo/Redo, Einfügen (Frage 9) → später

`CellChangeIf` hat alten **und** neuen Wert, Zeile als Objekt und Property: Undo = `applyCellChanges` mit vertauschten
Werten, Redo = erneut. Einfügen aus der Zwischenablage = Text → Matrix → `applyCellChanges(…, "api")`. Beides als
Folgeaufgabe in `TODO.md`.

### 2.10 CRUD (Frage 10) → nur Event

Kein Automatismus über die CRUD-URLs (die speichern einzelne Objekte per Dialog). Beispiel in `instructions.md`:
`onBatchEditChanged` schaltet „Save“ frei, „Save“ schickt `getPendingChanges()` per `fetch` und ruft bei Erfolg
`commitBatchEdit()`.

## 3. Referenzfälle (Video-taugliche Beispiele)

```ts
const selectionModel = new SelectionModel("range", "multi");
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => selectionModel,
  fillHandle: true,                         // H1–H9
  batchEdit: true,                          // B1–B8: Änderungen erst sammeln
};
saveButton.onclick = async () => {
  await fetch("/api/prices", { method: "PATCH", body: JSON.stringify(tableApi.getPendingChanges()) });
  tableApi.commitBatchEdit();
};
discardButton.onclick = () => tableApi.cancelBatchEdit();
```

Erwartung: Zelle `5` + Handle 3 Zeilen ↓ → 5, 5, 5; `1, 2` → 3, 4, 5 (⌥ → 1, 2, 1); `2026-10-14` → `2026-10-15` …;
`Item 9` → `Item 10`; im Batch-Modus sind die Daten bis „Save“ unverändert, die Zellen gelb markiert.

## 4. Was es sonst braucht (Phasen 5–9)

| Phase | Entscheidung |
|---|---|
| 5 Demo | `demo-table-models`: `createPriceListModelAndOptions()` (fester Seed); `apps/table-demo/fill-batch.html` |
| 6 Website | Showcase `batchedit` (Preisliste, „Save“/„Discard“ in plain HTML, Fill-Handle), Feature-Liste, `why.astro` prüfen |
| 7 Training | **Abschnitt** im Kapitel 31 `inline-editing` (keine neue Kapitelnummer, kein neuer Demo-Repo-Tag), Live-Demo `fill-batch` |
| 8 Demo-Repo | entfällt (kein neues Kapitel) |
| 9 Video | **eine** Folge `videos/10-fill-handle-batch-edit/` „Excel-Feeling ohne Enterprise-Lizenz: Fill-Handle und Änderungen sammeln“ |

Angular-Demo: Route erst nach dem Release (nutzt npm-Pakete, wie 003–009).
