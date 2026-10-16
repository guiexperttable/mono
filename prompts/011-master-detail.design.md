# Design 011 – Master/Detail (aufklappbare Detailzeile)

> Prompt: `prompts/011-master-detail.md` · Branch `feat/master-detail` · Zielversion **1.1.97** (`since`).
> Stand 16.10.2026. Abhängigkeiten: 001 (ARIA) und 003 (Zustand) sind auf `main`.
> **Selbständig umgesetzt** (Auftrag „arbeite selbständig an prompts/011-master-detail.md“, 16.10.2026):
> Claude hat die Empfehlungen aus § 2 übernommen, ohne die Freigabe abzuwarten. Jede Entscheidung ist begründet und
> lässt sich vor dem Merge noch ändern.
>
> ag-Grid (geprüft 16.10.2026, ag-grid.com „Master / Detail“): **Enterprise** (`MasterDetailModule`). Dort werden
> Detailzeilen beim Wegscrollen verworfen und beim Zurückscrollen neu erzeugt; `keepDetailRows` (Default `false`) und
> `keepDetailRowsCount` (Default 10) halten zugeklappte Details im Cache. Wir halten **aufgeklappte** Details am Leben
> (bis zu einer LRU-Grenze) und zerstören beim Zuklappen – das erfüllt M3/M4/M5 direkt.

---

## 1. Bausteine

| Baustein | wofür | Befund | Änderung |
|---|---|---|---|
| `RenderScope.adjustArea('body', y)` | Zeilen rendern | Startindex nur bei `getConstantRowHeight()` direkt, sonst Schleife ab Zeile 0 (O(n) je Frame); y wird aufsummiert; Container werden je Frame geleert | Startindex über **`RowLayout.findIndexAt(y)`** (O(log n)), Detail-Höhe als Zusatz hinter der Masterzeile, sichtbare Details werden am Ende an `MasterDetailService.layoutVisible()` gemeldet. Header/Footer unverändert |
| `AreaModelIf.getYPosByRowIndex` | `scrollToIndex`, `ensureRowIsVisible`, Hover (`rowTop`), Row Drag, Fill-Handle | je Modell: konstant O(1), `AreaModel`-Basis O(n), `AbstractAreaModel` einmal berechnet | **eine** Stelle `RenderScope.getBodyRowTop(i)` = Modellwert + Detail-Höhen davor; `getBodyRowIndexAtY(y)` (Layout). Die Modell-Methode bleibt unverändert (keine Verhaltensänderung ohne Details) |
| `TableModel.getContentHeightInPixel()` | Scrollhöhe | Summe der Modell-Höhen | `EleScope.getBodyContentHeight()` = Modellwert + Summe aller Detail-Höhen (an den 4 Lesestellen) |
| `drawBigCell` | Col-/Rowspan | `y1` = Summe der Höhen 0…r1−1 **je Span und Frame** (O(r1)) | Body: `y1` aus dem Layout (O(log n)); Header/Footer wie bisher |
| `MouseHandler.isBlocked`, `ShortcutService`, `InputHandler`, `RowDragService`/`FillHandleService` (`pointerdown`, Click-Capture, `dblclick`) | Ereignisse am Host | alle am Host-Element → Ereignisse aus einer verschachtelten Tabelle würden hochblubbern | eine Prüfung `TableScope.isEventInDetail(evt)` (über `composedPath()`, also auch Shadow DOM) – Ereignisse aus dem Detail ignoriert die äußere Tabelle; **kein** `stopPropagation` (Dokument-Listener der Seite sehen sie weiter) |
| `ConvenienceDomService.addColumnDiv` / Baum-Pfeil | Auf-/Zu-Symbol | Baum-Pfeil als Text-Div im Layout der Zelle | eigenes Symbol wie der Row-Drag-Griff: `RenderScope` dekoriert die Zelle (`ge-table-detail-toggle-cell` + Div `ge-table-detail-toggle`, `data-ge-action="toggle-detail"`, `aria-hidden`), CSS-Pfeil, Platz über `padding-inline-start` |
| `TableScope.activateBodyCell` (Enter) | Tastatur | Checkbox bzw. Baumknoten | + Masterzeile: Detail auf/zu |
| `TableStateService` (003) | M12 | Teile mit `markDirty`, Ids über `getRowId` | neuer Teil **`details`** (`TableStateIf.detailRowIds`), Flag `autoRestoreDetailState` |
| `AriaIds`, `RenderScope.applyRowAria` | ARIA | 9 Rowgroups in `aria-owns`; Zeilen `role="row"` + `aria-rowindex` | Detail-Ebene = 10. Rowgroup (zwischen Body und Footer in `aria-owns`), Masterzeilen `aria-expanded`, Ansagen über `AriaTexts` |
| Komponenten-Renderer der Wrapper | M13 | je Wrapper `ComponentRendererWrapper` (Zellen) | je Wrapper **`DetailComponentRendererWrapper`** (gleiches Muster), Angular `DetailRenderWrapperFactory` |
| `CopyService`, `ExcelService` | M11 | lesen das Modell | **unverändert**: Details sind nicht im Modell, werden also nie kopiert/exportiert |

**Breaking Changes:** keine. Alles optional/neu. `TableStatePart` bekommt den Wert `"details"`, `ALL_TABLE_STATE_PARTS`
einen Eintrag (vor `"scroll"`). Ohne `tableOptions.masterDetail` entsteht kein DOM-Element und kein Listener; das
Rendering mit konstanter Höhe ist bit-gleich (gleicher Startindex, gleiche Positionen).

## 2. Entscheidungen

### 2.1 Voraussetzung: Prefix-Summen (Frage 1) → `row-layout/row-layout.ts`

DOM-frei, `@category Internals`:

```ts
const layout = new RowLayout();
layout.setRows(rowCount, i => tableModel.getRowHeight("body", i), body.getConstantRowHeight?.());
layout.setExtras([12, 40], [180, 240]);   // Detail-Höhen hinter Zeile 12 und 40 (aufsteigend)
layout.getTop(41);                          // Oberkante der Zeile 41 inkl. beider Details
layout.findIndexAt(5000);                   // Zeile, in deren „Slot“ (Zeile + Detail) y = 5000 liegt
```

- **Basis:** konstante Höhe → `i * h` (kein Array, wie heute). Variable Höhe → `Float64Array` mit `rowCount + 1`
  Prefix-Summen, **lazy** beim ersten Zugriff nach einer Invalidierung (2 Mio. Zeilen: 16 MB, ein Durchlauf).
- **Zusätze (Details):** dünn besetzt – sortierte `Int32Array` der Zeilenindizes + `Float64Array` der Prefix-Summen der
  Zusatzhöhen. `getTop(i)` = Basis(i) + Zusätze vor i (Binärsuche über k Details). `findIndexAt(y)` = Binärsuche über i.
  Eine geänderte Detail-Höhe (`auto`, gemessen) baut nur die k Zusätze neu (O(k)), nicht die Basis.
- **Invalidierung:** `RenderScope.invalidateRowLayout()` in `repaintHard()` (Zeilen hinzu/weg, Baum-Toggle, `setRows`,
  CRUD) und `invalidateAggregates()` (Filter, Sortieren in place, Editieren, `updateCells`, öffentliches `repaint()`), dazu
  bei jedem Detail-Auf/Zu. Zusätzlich Schlüssel (Body-Modell, Zeilenzahl): ändert sich einer, wird neu aufgebaut. Ohne
  Details und mit konstanter Höhe kostet das nichts.
- Grenze (dokumentiert): ein eigenes Modell, dessen `getRowHeight()` sich **ohne** Benachrichtigung ändert, braucht
  `api.repaint()` (das brauchte es für die Scrollhöhe schon immer).
- Messung (Bench `bench/row-layout.bench.ts` + Chromium-Messung wie Folge 01): 2 Mio. Zeilen mit variabler Höhe vorher/nachher,
  Ziel ± 20 % der konstanten Höhe. Ergebnis in § 4.

### 2.2 Detail-Ebene (Frage 2) → (a) eigene Ebene im Host

```
host (.ge-table)
 ├ … header/body west/east, scroll viewport (body center), borders …
 ├ div.ge-table-detail-layer        absolut: left 0, top = Header-Höhe, Breite = West + Viewport ohne Scrollbar,
 │                                   Höhe = sichtbarer Body ohne horizontale Scrollbar; overflow hidden;
 │                                   pointer-events: none (nur die Detailzeilen nehmen Ereignisse an)
 │   └ div.ge-table-detail-row       role="row", absolut, top = Masterzeile unten − gescrollter Inhalt, volle Breite
 │       └ div.ge-table-detail-cell  role="gridcell", aria-colspan = Spaltenzahl – der Container für renderDetail()
 └ overlay …
```

Begründung: (b) „Colspan über alle Seiten“ gibt es nicht (Spans wirken nur innerhalb einer Seite), und die Area-Container
werden je Frame geleert. Eine eigene Ebene außerhalb des Scroll-Viewports bleibt beim horizontalen Scrollen stehen (M2),
überdeckt fixierte Spalten (M1) und wird nie geleert (M3). Kosten je Frame: nur `top` der sichtbaren Details (nur bei
Änderung geschrieben). Mausrad über einem Detail: Die Ebene liegt nicht im Viewport, also gibt es keine Scroll-Verkettung –
ein `wheel`-Listener an der Ebene leitet weiter, wenn kein scrollbares Element im Detail die Bewegung aufnimmt (eine
innere Tabelle scrollt also zuerst selbst, am Ende scrollt die äußere – wie natives Verketten). Grenze (dokumentiert,
`TODO.md`): Touch-Wischen über einem Detail scrollt die äußere Tabelle nicht.

### 2.3 Lebenszyklus (Frage 3)

- Schlüssel je Master: `masterDetail.getRowId(row)` → sonst `autoRestoreOptions.getRowId` → sonst das **Zeilenobjekt**
  (`getRowByIndex`), ohne Objekt der Index. Damit bleiben Details beim Sortieren/Filtern am Master (M6); mit einer Id
  bleiben sie auch über `setRows()` mit neuen Objekten offen (Inhalt wird dann neu erzeugt, weil das Objekt wechselte).
- Inhalt wird **lazy** erzeugt, sobald das Detail das erste Mal sichtbar ist (`expandAllDetails()` bei 100.000 Zeilen
  erzeugt also nichts im Voraus).
- Aus dem Sichtbereich gescrollt → **geparkt**: Klasse `ge-table-detail-row-parked` (`visibility: hidden;
  content-visibility: hidden`). Gemessen in Chromium: Scrollposition innerer Elemente bleibt, kein `ResizeObserver`-Aufruf
  (Abhängen aus dem DOM setzt dagegen `scrollTop` auf 0). Geparkte Details sind nicht fokussierbar (keine Tab-Stopps).
- LRU: höchstens `maxRenderedDetails` (Default 50) Inhalte gleichzeitig; das am längsten nicht sichtbare geparkte wird
  zerstört und beim Zurückscrollen **neu** erzeugt (`context.recreated = true`) – das „dokumentierte Neu-Erzeugen“ aus M4.
- Endgültig zerstört: Zuklappen (M5), LRU, Master nicht mehr in `getAllRows()` (nach `setRows`, bei Modellen ohne
  `getAllRows` bleibt der Eintrag), `refreshDetail()`, `TableScope.destroy()` (Modellwechsel der Wrapper). Zerstören =
  Cleanup-Funktion des Renderers, `AbortSignal` des Kontexts, `destroy()` aller mit `context.createTable()` erzeugten
  Tabellen, ResizeObserver, DOM entfernen.

### 2.4 API (Frage 4)

```ts
tableOptions.masterDetail = {
  detailRenderer: (container, order, ctx) => {           // Funktion oder DetailRendererIf { render(…) }
    const api = ctx.createTable({ tableModel: TableFactory.createTableModel({ rows: order.items, properties: ["sku", "qty"] }) });
    return () => console.log("detail closed", api);       // optionaler eigener Cleanup
  },
  detailHeight: 220,          // number | "auto" | (row, rowIndex) => number | "auto"; Default "auto"
};
```

`MasterDetailOptionsIf<T>` (`master-detail/master-detail-options.if.ts`): `detailRenderer` (Pflicht),
`isMaster?(row, rowIndex)` (Default: jede Zeile), `detailHeight` (Default `"auto"`), `estimatedDetailHeight` (200 – vor der
ersten Messung), `toggleColumn?: number | string` (Default: Spalte des Baum-Pfeils = erste Datenspalte hinter Zeilennummer/
Checkbox), `maxRenderedDetails` (50), `getRowId?`. Klasse `MasterDetailOptions` mit Defaults.

`DetailRenderContextIf<T>`: `row`, `rowIndex`, `tableApi` (der äußeren Tabelle), `recreated`, `signal: AbortSignal`
(abgebrochen beim Zerstören – für eigene Listener), `createTable({ tableModel, tableOptions?, eventListener?, height? })
→ TableApi`.

`TableApi` (alle `@since 1.1.97`): `setDetailExpanded(rowIndex | row, expanded)`, `toggleDetail(rowIndex | row)`,
`isDetailExpanded(rowIndex | row)`, `getExpandedDetailRows()`, `expandAllDetails()` / `collapseAllDetails()` (Anzahl),
`refreshDetail(rowIndex | row)`, `getDetailElement(rowIndex | row)` (der Container, wenn erzeugt). Zahl = Anzeige-Index.

Event: `EventListenerIf.onDetailExpandedChanged?(evt: GeDetailEvent)` (`row`, `rowIndex`, `expanded`, `source`
`"mouse" | "keyboard" | "api" | "state"`); Wrapper-Event `detailExpandedChanged`.

Symbol in einer vorhandenen Spalte (wie der Baum-Pfeil), keine eigene Spaltenart: keine Index-Verschiebung. Wer eine
eigene Spalte will, legt eine leere Spalte an und setzt `toggleColumn` auf sie.

### 2.5 Verschachtelte Tabelle (Frage 5) → `context.createTable()`

Legt im Container ein Div `ge-table-detail-table` an (Breite 100 %, Höhe `height` bzw. bei fester Detail-Höhe 100 %, bei
`"auto"` `estimatedDetailHeight`), baut `TableScope` + `SimpleDomService` + `firstInit()` und ruft beim Zerstören
`destroy()`. Theme erbt (CSS-Variablen hängen an `html[data-theme]`). Wrapper: im Detail-Component einfach die
Wrapper-Komponente der Tabelle verwenden.

### 2.6 Ereignis-Isolation (Frage 6)

`TableScope.isEventInDetail(evt)` = `masterDetailService.isInLayer(evt)` (`composedPath()` enthält die Ebene). Geprüft in
`MouseHandler` (alle Handler über `isBlocked`), `ShortcutService.onKeyDown`, `InputHandler`, `RowDragService` und
`FillHandleService` (`pointerdown`, Click-Capture, `dblclick`). Fokus: Der Host bleibt **ein** Tab-Stopp; Tab auf einer
Masterzeile mit sichtbarem Detail setzt den Fokus auf das erste fokussierbare Element darin (innere Tabelle = ihr Host);
Shift+Tab vom ersten Element kehrt natürlich zum Host zurück (DOM-Reihenfolge), dabei wird die Masterzeile fokussiert.
Ohne fokussierbares Element bleibt Tab beim Browser.

### 2.7 Wrapper (Frage 7)

`DetailComponentRendererWrapper` in React, Preact, Vue 3, Svelte (4/5), Solid – Props `row`, `rowIndex`, `tableApi`,
`context`; Cleanup = Unmount (React verzögert wie der Zell-Wrapper). Angular: `DetailRenderWrapperFactory.create(Comp,
appRef/injector)` analog `RenderWrapperFactory`. Web Component: Funktion reicht. Alle Wrapper: Event
`detailExpandedChanged`. Smoke-Tests: React, Vue, Web Component (Event + Aufräumen).

### 2.8 Baum und Gruppen (Frage 8) → vorerst nur flach

Mit `AreaModelTree` (Baum, Row Grouping, Pivot) wird `masterDetail` ignoriert (eine Warnung): `aria-expanded` und
Enter sind dort schon belegt, und die Detail-Form wäre je Ebene verschieden. Folgepunkt in `TODO.md`.

### 2.9 Export/Copy (Frage 9) → nie

Details sind nicht Teil des Modells; Copy/Excel liefern wie bisher nur die Masterzeilen (Test M11). Keine Option.

### 2.10 ARIA

Masterzeilen (West/Center/East) `aria-expanded="true|false"`; Detail-Ebene `role="rowgroup"` (in `aria-owns` zwischen
Body und Footer, leer = `presentation`); Detailzeile `role="row"` ohne `aria-rowindex` (zählt nicht in `aria-rowcount` – die
Indizes der Masterzeilen bleiben stabil), Zelle `role="gridcell"` mit `aria-colspan`. Symbol `aria-hidden` (Name über
`aria-expanded` + Enter). Ansagen `AriaTexts.detailExpanded()` / `detailCollapsed()` (optional im Interface). Test mit
`axeViolations()`.

### 2.11 CSS

`css/table-master-detail.css`: `ge-table-detail-layer` (z-index 1000: über East 999, unter Fill-Vorschau 8999, Fokusrahmen
9999 und Overlay 10000), `ge-table-detail-row`, `-cell`, `-parked`, `ge-table-detail-toggle(-cell)`, `-expanded`.
Variablen `--ge-table-detail-bg`, `--ge-table-detail-border`, `--ge-table-detail-toggle-color` (light + dark). Logische
Eigenschaften (`padding-inline-start`, `inset-inline-start`).

## 3. Beispiele (Referenzfälle)

```ts
// M1: Bestellungen → Positionen (≤ 15 Zeilen, Video)
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  masterDetail: {
    detailHeight: 180,
    detailRenderer: (_container, order: Order, ctx) => {
      ctx.createTable({
        tableModel: TableFactory.createTableModel({ rows: order.items, properties: ["sku", "name", "qty", "price"] })
      });
    }
  }
};
```
Erwartung: Klick auf ▸ in der ersten Spalte → darunter 180 px Positionstabelle über die volle Breite; ▾; Enter macht
dasselbe; Scrollen erhält Auswahl und Scrollposition in der Positionstabelle.

```ts
// M7: Formular mit automatischer Höhe
masterDetail: { detailRenderer: (el, row) => { el.textContent = `Notes for ${row.customer}`; } }  // detailHeight "auto"
```

## 4. Messungen

`scripts/measure-render.mjs` (erweitert um `--variable 1` und `--details N`): 2 Mio. Zeilen × 30 Spalten, 1200 × 800 px,
300 Scrollpositionen, Median je Frame (Chromium im Container – absolute Werte langsamer als auf dem Mac, Vergleich zählt):

| Fall | vorher (1.1.96) | nachher |
|---|---|---|
| konstante Höhe | 20,1 / 21,3 / 22,5 ms | 21,9 / 22,0 / 24,2 ms (Rauschen ±2 ms; kein zusätzlicher Code je Zeile) |
| variable Höhen (34/50 px) | 28,2 ms | 18,6–19,5 ms – jetzt wie konstant (Ziel ± 20 % erreicht) |
| variable Höhen + 50 offene Details | – | 19,1 ms |

Ein einzelnes Auf-/Zuklappen ändert das Layout inkrementell (`setBodyRowExtra`, O(k)); Sortieren/Filtern bauen die
Zuordnung Master → Index in einem Durchlauf neu auf. Werte-Änderungen (`updateCells`, Editieren) bauen nichts neu.
`dist` 3,0 → 3,2 MB (`index.js` 770 → 820 kB).

## 5. Website, Training, Demo-Repo, Video

- Showcase `masterdetail` (Bestellungen → Positionen, 100.000 Master), Feature-Liste, `why.astro`-Zeile „Master/detail“
  (ag-Grid Enterprise).
- Training: eigenes Kapitel 38 `master-detail` in Teil 8 (Demo `training/demos/master-detail.ts`, Daten `shared/orders`
  + Positionen mit festem Seed, `shared/order-items.ts`). Kapitel 38 war in `TODO.md` für `formulas` (008, Training offen)
  vorgemerkt – es gab aber weder Seite noch Tag noch Link. Regel aus 000: Nummer = höchste vorhandene + 1; die Planung für
  `formulas` rückt auf 39 (`ep-039`). Prompt 009 hatte dafür auf ein eigenes Kapitel verzichtet; Master/Detail braucht eines
  (Prompt: „eigenes Kapitel in Teil 8“).
- Demo-Repo: 🛑 nicht angelegt (Freigabe nötig); Tag `ep-038` erst nach dem Release 1.1.97.
- Video `videos/11-master-detail/` „Master/Detail ohne Enterprise-Lizenz“.
- `apps/table-demo/master-detail.html`; Demo-Modell `createOrdersWithItemsModel()` in `demo-table-models`.

## 6. Abschluss-Review (separater Agent) und Korrekturen

Der Reviewer hat den Code nicht geschrieben und Funde 1–3, 5 mit einem Wegwerf-Test bestätigt. Behoben (je mit Test):
1. Füllt ein Detail den ganzen Body, galt die Masterzeile als „sichtbar“ → `ensureRowIsVisible(master)` tat nichts, Tab
   sprang auf Zeile 0. Jetzt: keine Zeile sichtbar (`displayedRowCount` 0), `ensureRowIsVisible` rechnet mit Details in
   Pixeln, `onHostKeyboardFocus` nimmt die Zeile oben im Sichtbereich.
2. Jedes `updateCells` invalidierte das Layout (O(n) bei offenen Details bzw. variablen Höhen) → nur noch bei
   strukturellen Änderungen (ohne `change`).
3. `"auto"`: gemessen wurde die Zelle ohne die Rahmen der Detailzeile (2 px Überlappung) → `ResizeObserver` auf der Zeile.
4. LRU sortierte alle Einträge je Frame, wenn mehr Details sichtbar als `maxRenderedDetails` → nur mit geparkten Inhalten.
5. Fokus im Detail ging beim Zuklappen/Parken/LRU verloren → Host + Masterzeile übernehmen (`takeFocusFromDetail`).
Außerdem: `getBodyRowTop` mit Details aus dem Layout (O(1)), Spalten-Geisterbild mit Detailhöhen, Hover wird über
Details ausgeblendet. Offen (dokumentiert in `TODO.md`): Tab von einer Zeile ohne offenes Detail landet im ersten
sichtbaren Detail in DOM-Reihenfolge; Lesereihenfolge der Details für Screenreader (eigene Rowgroup nach dem Body);
Rowspan-Höhe ohne Details; `ctx.rowIndex` ist der Index beim Erzeugen.
