# 019 – Live-Daten anhängen: `appendRows` ohne Kopie, Auswahl und Position bleiben

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Phasen, Regeln, Phase 10 =
> Release-Block). Feature mit API-Entwurf: **Haltepunkt nach Phase 1** (Design-Dokument
> `prompts/019-live-append.design.md`). Jede Code-Änderung am Core folgt der Regel „zuerst ein roter Test“.
> Branch: `feat/live-append`.
>
> **Braucht 018** (`prompts/018-klick-trotz-api-render.md`, Teil A): Ohne den Fix geht im Live-Tail fast jeder Klick
> verloren, die Auswahl mit der Maus hilft dann nichts. Teil B von 018 (kein Zellen-Neuaufbau bei reinem
> Zeilenzuwachs) gehört hierher, falls 018 ihn nicht schon umgesetzt hat – im Design-Dokument festhalten, wer ihn macht.
>
> Herkunft: Frage von Marc (08.11.2026) für eine Log-Viewer-App (eine Log-Zeile = eine Tabellenzeile, periodisch neue
> Zeilen, Freeze-Button in der App), dazu die Erfahrungen aus **log-commander** (Prompts 017, 018: eigenes `AreaModel`,
> bis 10 Mio. Zeilen, 5000 Zeilen/s).

## Ziel

Eine Anwendung hängt laufend Zeilen an – mit `AreaModelObjectArray` (`TableFactory.createTableModel({ rows, … })`)
**oder** mit einem eigenen `AreaModel` – und:

1. jedes Update kostet O(k) für k neue Zeilen (unsortiert), nicht O(n) für alle Zeilen;
2. **Auswahl, Fokus, Anker** der Bereichsauswahl, angehakte Zeilen und offene Detailzeilen bleiben an denselben
   Zeilen – auch mit aktivem Filter, mit Sortierung und wenn vorne alte Zeilen wegfallen (Ringpuffer);
3. die Scrollposition bleibt an derselben Zeile oder folgt dem Ende („tail -f“), wahlweise automatisch;
4. ein Render je Update, kein Render, wenn sich der sichtbare Bereich nicht ändert.

„Freeze“ (Neuaufnahme kurz anhalten) bleibt Sache der Anwendung (Puffer, s. u.) – die Tabelle muss nur damit klarkommen,
dass danach ein großer Block auf einmal kommt.

## Befund (08.11.2026, Stand 1.1.107)

| Stelle | Heute | Problem für Live-Daten |
|---|---|---|
| `TableApi.addRows` (`table-api.ts:1372`) | `am.setRows([...allRows, ...rows])` | kopiert alles (O(n)); Spread ab ~100.000 Zeilen → Stack-Überlauf; setzt Filter **und** Sortierung der Ansicht zurück (neue Zeilen stehen unsortiert hinten, ausgefilterte Zeilen erscheinen wieder); ruft anders als `setRows` weder `pruneOrphans` noch `invalidateRowLayout` |
| `AreaModelObjectArray.setRows` (`area-model-object-array.ts:279`) | `this.rows = rows; this.filteredRows = [...rows]` | `filteredRows` ist eine Kopie: ein `push` in das Array der App sieht die Tabelle nie |
| `TableScope.externalFilterChanged` (`table-scope.ts:2632`) | `clearSelectionModel()`, filtert **alle** Zeilen, `reapplySorting()`, `scrollViewport.scrollTo(0, 0)` | Auswahl weg, springt nach oben – der heutige Rat „`addRows` + `externalFilterChanged` + `repaintHard`“ ist für einen Log-Viewer mit Filter unbrauchbar |
| `TableScope.reSort` (`table-scope.ts:3172`) | sortiert alle Zeilen neu (O(n log n)) | Indizes verschieben sich, die Auswahl (Indizes!) zeigt danach auf andere Zeilen |
| `SelectionModel` (`selection/selection-model.ts`) | `ranges`/`negativeRanges` = `CellRange` mit **Zeilenindizes** der Anzeige | richtig, solange nur hinten angehängt wird; falsch bei Einfügen in der Mitte (Sortierung) und Abschneiden vorne |
| `FocusModel` (`focus/focus-model.ts`), Anker (`SelectionService.getAnchor`, `selection-service.ts:230`) | Indizes | wie oben |
| `AreaModelObjectArray.doSort` (`:688`) | `filteredRows.sort(…)` (stabil), Mehrspalten-Comparator | Comparator ist wiederverwendbar für ein Merge der neuen Zeilen; die zuletzt angewendeten `SortItem`s bzw. `lastSortCompareFn` (`table-scope.ts:175`) muss die Tabelle dafür kennen |
| `TableStateService.applySelection` (`state/table-state.service.ts:881`) | Auswahl über Zeilen-Id + Property | Alternative zum Index-Verschieben (braucht `getRowId`, ist teurer) – im Design abwägen |
| `RenderScope.repaintHard(scrollTo)` (`render-scope.ts:606`) | seit 1.1.107 ein Render, mit Position | Grundlage; baut aber alle sichtbaren Zellen neu (018 Teil B) |

Weitere Stellen, die Zeilenindizes oder das Zeilen-Array halten und in Phase 1 geprüft werden müssen: Zeilennummern
`original` (Map-Cache), angehakte Zeilen, `MasterDetailService.computeExtras` (`master-detail-service.ts:418`),
Undo (`setRows` wird am **anderen** `getAllRows()`-Array erkannt → Verlauf leer; Anhängen in place darf das nicht
auslösen, Abschneiden vorne schon gar nicht still), `BatchEditService` (vorgemerkte Werte je Zeilenobjekt – Abschneiden →
`pruneOrphans`), `TableSheet`/Zellformeln (`sync()` baut bei anderer Länge neu – für Live-Daten aus dem Scope nehmen,
aber nicht kaputt machen), Aggregate (`invalidateDerivedValues`), Overlay „No rows“ → Zeilen (Overlay verschwindet),
Row Drag/Fill-Handle während eines Ziehens, offener Zell-Editor (folgt dem Zeilenobjekt?), ARIA (`aria-rowcount`,
Live-Region: **keine** Ansage je Update).

## API-Vorschlag (in Phase 1 bestätigen)

```ts
// AreaModelObjectArray: Zeilen übergeben
const r = tableApi.appendRows(lines, {
  follow: "auto",      // "auto" (Default): stand der Viewport am Ende → am Ende bleiben, sonst Zeile halten
                       // true = immer ans Ende, false = immer Zeile halten
  maxRows: 1_000_000   // optional: älteste Zeilen vorne entfernen (Ringpuffer)
});
// r: AppendRowsResultIf = { added, shown, removed, following }

// eigenes AreaModel: die App hat schon angehängt, die Tabelle erfährt nur die Anzahl
tableApi.rowsAppended(count, { follow: "auto", removedAtStart: 0 });
```

Bausteine (Namen sind Vorschläge):

1. **Modell, inkrementell** – neues optionales `AreaModelIf.appendRows?(rows, ctx): AppendResultIf`
   (`AppendRowsOptionsIf`, `AppendRowsResultIf` als eigene `.if.ts`). `AreaModelObjectArray`:
   - an `rows` **in place** anhängen (Schleife, kein Spread; die App kann dasselbe Array behalten);
   - aktiven Filter nur auf die **neuen** Zeilen anwenden (die Tabelle muss den zuletzt angewendeten Filter kennen –
     heute nur `tableOptions.externalFilterFunction`; prüfen, ob die Funktion zwischendurch ausgetauscht worden sein
     kann, ohne `externalFilterChanged` aufzurufen);
   - unsortiert: Treffer an `filteredRows` anhängen (O(k));
   - sortiert (`SortItem`s oder `lastSortCompareFn`): die k neuen Zeilen sortieren und per Merge einfügen
     (O(n + k), stabil: neue Zeilen **hinter** gleichen alten – wie `Array.prototype.sort` bei `setRows` + Sortieren);
     Rückgabe der eingefügten Anzeigeindizes (aufsteigend, `Int32Array`);
   - `maxRows`: vorne aus `rows` entfernen (in place, `splice` einmal je Update oder Start-Offset – messen) und die
     entsprechenden Einträge aus `filteredRows` (Anzeigeindizes der entfernten Zeilen zurückgeben).
   Baum, Row Groups, Pivot, Spreadsheet, Zellformeln: `appendRows` gibt `false`/Warnung zurück (Scope festhalten).
2. **Indizes nachführen** statt löschen – `SelectionModel.adjustForInsertedRows(positions)` /
   `adjustForRemovedRows(positions)` (optional im `SelectionModelIf`, damit eigene Selektionsmodelle nicht brechen),
   dasselbe für `FocusModel`, Anker/Ende im `SelectionService`, Header-Fokus unberührt. Regeln: Einfügen **in** einer
   markierten Spanne teilt sie (neue Zeilen nicht markiert, wie Excel); Spalten-Ranges (`r2 = MAX`) und `allSelected`
   bleiben; entfernte Zeilen verlassen die Auswahl; Fokus auf einer entfernten Zeile → nächste Zeile bzw. leer.
   Ein `onSelectionChanged` nur, wenn sich die **ausgewählten Zeilen** geändert haben (nicht bei reinem Verschieben?
   – entscheiden; Angular/React-Apps zeigen oft die Auswahl an).
3. **Position** – vor dem Anhängen merken, ob der Viewport am Ende stand (Toleranz ½ Zeile). Danach `py` korrigieren um
   die Höhe der oberhalb eingefügten bzw. vorne entfernten Zeilen (über `RowLayout`, auch variable Höhen) oder
   `py = MAX`. Dann **ein** `repaintHard({ py })`. Gekappte Scrollhöhe (> `maxScrollHeightInPx`) beachten (017).
4. **Render sparen** (018 Teil B, falls dort nicht erledigt) – ändert sich der sichtbare Zeilenbereich nicht (Leser
   mitten im Log, hinten kommt etwas dazu), nur Scrollhöhe/Balken aktualisieren, Zellen nicht neu bauen. Test über
   DOM-Identität der sichtbaren Zellen.
5. **Ohne Ansage** – kein `LiveAnnouncer`-Text je Update; `aria-rowcount` aktualisieren.

`addRows`/`addRowsAt`/`setRows` bleiben wie sie sind (Verhalten unverändert); JSDoc verweist auf `appendRows`. Ob
`addRows` intern `appendRows` nutzen darf, ohne sein heutiges Verhalten (Filter/Sortierung zurück) zu ändern, in Phase 1
entscheiden – sonst nur den Spread durch eine Schleife ersetzen (Stack-Überlauf ist ein Bug: zuerst roter Test).

## Entscheidungsfragen (Phase 1, je Optionen + Empfehlung)

1. Auswahl über **Index-Verschieben** (schnell, ohne `getRowId`) oder über **Zeilen-Identität** (Snapshot der
   ausgewählten Zeilenobjekte, danach zurück auf Indizes – teurer, aber unabhängig vom Weg)? Empfehlung im Vorgespräch:
   Index-Verschieben, weil `appendRows` die Positionen ohnehin kennt.
2. Eine Methode mit Zeilen (`appendRows`) plus eine ohne (`rowsAppended(count)`) – oder eine überladene?
3. `follow: "auto"` als Default? Was gilt, wenn der Nutzer gerade zieht (Bereichsauswahl, Spaltenbreite, Scrollbalken)?
4. `maxRows` in der Tabelle oder nur in der App (dann `rowsAppended(count, { removedAtStart })`)?
5. Freeze-Unterstützung in der Tabelle (z. B. `tableApi.setLiveUpdatesPaused()`), oder reicht das App-Muster unten?
   Empfehlung: App-Muster, nur dokumentieren.
6. Wrapper: reicht die `TableApi` (kein Wrapper-Code), oder braucht z. B. die Angular-Signal-Komponente etwas?

## App-Muster „Freeze“ (für Doku, Demo, Video)

```ts
const pending: LogLine[] = [];
let frozen = false, scheduled = false;

function onLines(lines: LogLine[]) {
  for (const l of lines) pending.push(l);
  if (!frozen && !scheduled) { scheduled = true; requestAnimationFrame(flush); }
}
function flush() {
  scheduled = false;
  if (frozen || !pending.length) return;
  tableApi.appendRows(pending.splice(0), { follow: "auto", maxRows: 1_000_000 });
}
function setFrozen(f: boolean) { frozen = f; if (!f) flush(); }
```

## Tests (Phase 2, zuerst rot)

Node (DOM-frei): Merge-Einfügen (stabil, Mehrspalten, Fehler/leer zuletzt wie `doSort`), Filter nur auf neue Zeilen,
`maxRows`, `SelectionModel.adjustForInsertedRows/RemovedRows` (Spanne teilen, Spalten-Ranges, negative Ranges,
`allSelected`), `FocusModel`.

Browser (ltr **und** rtl, `test:browser` und `test:browser:scrollbars`):

- Auswahl von Zeile 5–7, dann 1.000 Zeilen anhängen → 5–7 bleibt ausgewählt, kein `onSelectionChanged`
  (bzw. wie entschieden); dasselbe mit Filter (neue Zeilen teils ausgefiltert) und mit Sortierung (neue Zeilen landen
  vor, in und hinter der Auswahl).
- `maxRows`: vorne fallen Zeilen weg → Auswahl, Fokus und sichtbare Zeile bleiben an denselben Zeilenobjekten.
- `follow: "auto"`: am Ende → bleibt am Ende; in der Mitte → `getFirstVisibleRowIndex()` zeigt dieselbe Zeile, `top`
  ±0,5 px; mit gekappter Scrollhöhe (1 Mio. Zeilen à 20 px).
- Ein Render je Update (`repaint-count.browser.spec.ts`), kein Render bei Zuwachs außerhalb des sichtbaren Bereichs.
- Performance-Leitplanke ohne Zeit-Assertion: `filteredRows` wird nicht neu angelegt (Identität), `rows` bleibt das
  Array der App.
- 200.000 Zeilen in einem Aufruf (Freeze aufgehoben) → kein Stack-Überlauf; derselbe Test für `addRows` (Bug).
- Overlay „No rows“ verschwindet beim ersten Anhängen; offener Editor, Row Drag und Fill-Handle während eines Updates.
- `appendRows` auf Baum/Gruppen/Pivot → `false` + Warnung, nichts geändert.
- Klick während eines Updates (mit 018): `mouseClicked` kommt, Auswahl stimmt.

Bench (`bench/append.bench.ts`): 1 und 10 Mio. Zeilen, Updates à 50/500/5.000 Zeilen, unsortiert/sortiert/gefiltert,
vorher (`addRows` + `repaintHard`) gegen nachher – Zahlen ins Design-Dokument.

## Doku, Demo, Website, Training, Video (in Phase 1 entscheiden)

- `instructions.md`: neuer Abschnitt „Live-Daten anhängen“ (oder in 6.x bei Overlays/Live-Daten), FAQ 6.26
  („Neue Zeilen kommen periodisch – wie sage ich es der Tabelle?“, „Bleibt die Auswahl erhalten?“), gekürzt in
  `llms.txt` (Root + Website) und `packages/table/README.md` „Quick answers“; JSDoc mit `@example` an `appendRows`,
  `rowsAppended`, `addRows` (Verweis), `docs:check`.
- CLAUDE.md §3.6: Absatz „Live-Daten (seit 1.1.x)“; §3.3, falls 018 Teil B hier umgesetzt wird.
- Demo `apps/table-demo/log-tail.html` (Log-Generator, Filterfeld, Sortieren, Freeze-Button, Auswahl-Anzeige,
  `maxRows`); evtl. Angular-Signal-Demo-Route.
- Website: Eintrag in `src/features/new-features.ts`, Showcase (`logtail`?) oder Ausbau von `crypto`.
- Training: Abschnitt im Kapitel `live-data`.
- Video: neue Folge „Live-Log mit 1 Mio. Zeilen: anhängen, filtern, Auswahl bleibt – Freeze per Knopf“
  (`videos/NN-live-log/`), Backlog-Zeile in CLAUDE.md §10. ag-Grid-Vergleich sachlich: dort Transactions
  (`applyTransactionAsync`, Community) – Stufe in Phase 1 prüfen, nicht raten.

## Fertig, wenn

- Design-Dokument freigegeben, Entscheidungen festgehalten.
- Specs erst rot, dann grün; alle bestehenden Tests grün (`test:unit`, `test:browser`, `test:browser:scrollbars`,
  `test:types`, `docs:check`, `test:wrappers`); `src/index.spec.ts`-Snapshot für neue Exporte geprüft.
- Bench-Zahlen vorher/nachher im Design-Dokument.
- Doku, Demo, Website, Training, Video wie in Phase 1 entschieden; `TODO.md` und `prompts/README.md` (Zeile + Status)
  aktualisiert.
- Abschlussbericht mit Release-Block (Phase 10), ausgeführt nur auf Anweisung.
