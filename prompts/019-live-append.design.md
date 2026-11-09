# 019 – Live-Daten anhängen: Design, Entscheidungen, Messungen

> Zu `prompts/019-live-append.md`. Branch `feat/live-append` (gestapelt auf 018 und 021), Zielversion **1.1.108**.
> Marc hat 016 → 018 → 021 → 019 → 020 am 09.11.2026 „selbständig“ beauftragt – der Haltepunkt nach Phase 1 entfällt;
> die Entscheidungen stehen hier zur Durchsicht und lassen sich vor dem Release noch ändern.

## API

```ts
tableApi.appendRows(rows, { follow?: "auto" | true | false, maxRows?: number }): AppendRowsResultIf | false
tableApi.rowsAppended(count, { follow?, removedAtStart?: number }): AppendRowsResultIf
// AppendRowsResultIf = { added, shown, removed, following }
```

Neue Exporte (`live-append/`, Kategorie „Live data“): `RowIndexShift`, `AppendFollowMode`, `AppendRowsOptionsIf`,
`RowsAppendedOptionsIf`, `AppendRowsResultIf`, `AppendRowsContextIf`, `AppendRowsModelResultIf`. Additiv: optionale
Member `AreaModelIf.appendRows?`, `SelectionModelIf.adjustForRowChanges?`, `FocusModelIf.adjustForRowChanges?`; neue
Methoden `AreaModelObjectArray.appendRows/createSortComparator`, `SelectionService.adjustForRowChanges`,
`MouseHandler.isButtonDown`, `ColAndRowspanModel.updateForInsertedRows`, `RenderScope.updateRowCountWithoutRender`.
`addRows`/`addRowsAt`/`setRows` unverändert (JSDoc verweist auf `appendRows`).

## Bausteine

| Baustein | wofür | Ergebnis |
|---|---|---|
| `AreaModelObjectArray.setRows/externalFilterChanged/doSort` | Daten, Anzeige | passt; neu `appendRows` in place, Flag `displayInDataOrder` |
| `TableScope.lastSortCompareFn` / `sortState` der Spalten | aktive Ordnung | `getActiveSortComparator()` (+ `createSortComparator`) |
| `tableOptions.externalFilterFunction` | aktiver Filter | nur für neue Zeilen (wurde die Funktion getauscht ohne `externalFilterChanged`, gilt die neue nur für neue Zeilen – dokumentiert) |
| `SelectionModel` (Ranges mit Indizes), `FocusModel`, `SelectionService` (Anker, Ende, letzter Klick) | Indizes | `adjustForRowChanges(RowIndexShift)` |
| `RenderScope.repaintHard({ py })` (017) | ein Render | Grundlage; dazu `updateRowCountWithoutRender` (018 Teil B) |
| `ColAndRowspanModel.initIfRowCountChanged` | Spannen | war O(n·Spalten) je neuer Zeilenzahl (`getMaxColspan()` = 31) → `updateForInsertedRows` |
| `MouseHandler` (018) | Klick während Render | Zeilenobjekt → aktueller Index; `isButtonDown()` |
| Checkbox-Modell, Master/Detail, Batch-Edit, Undo, Zeilennummern, Overlay, ARIA | weitere Zustände | Zeilenobjekte (bleiben); `pruneOrphans` beim Entfernen; Overlay/`aria-rowcount` im Render bzw. im Sparweg; keine Ansage je Update |

## Entscheidungen

| # | Frage | Entscheidung | Begründung |
|---|---|---|---|
| 1 | Auswahl: Index-Verschieben oder Zeilen-Identität | **Index-Verschieben** (`RowIndexShift`) | `appendRows` kennt die Positionen ohnehin; O(Ranges · log k), kein `getRowId` nötig. Ranges werden **in place** geändert, damit Snapshots und `anchorRanges` gültig bleiben |
| 2 | eine oder zwei Methoden | **zwei**: `appendRows(rows)` (ObjectArray), `rowsAppended(count)` (eigenes Modell) | klare Typen; ein eigenes Modell hat keine Zeilen zum Übergeben |
| 3 | `follow` | `"auto"` Default; gedrückte Maustaste (auch Row Drag, Fill) = Zeile halten, nach dem Loslassen wieder folgen, außer der Nutzer hat gescrollt (`followHeldAt`) | sonst rutscht die Zeile unter dem Zeiger weg; ohne „wieder folgen“ blieb die Ansicht nach jedem Klick stehen und der Ringpuffer schob die Zeilen heraus (gefunden mit dem Live-Spec: 2 von 8 Klicks) |
| 4 | `maxRows` in der Tabelle | **ja** (`appendRows`), eigenes Modell: `removedAtStart` | häufigster Fall; Entfernen vorne in **Blöcken ≥ 1 %** – `splice(0, k)` ist O(n) (gemessen: 100.000 → 0,26 ms, 1 Mio. → 1,5 ms, 10 Mio. → 9 ms je Update; `shift()` noch schlechter). Zeilenzahl 99–100 % von `maxRows` |
| 5 | Freeze in der Tabelle | **App-Muster** (`follow: false` + Puffer); `LogTailController.setIntakePaused` zeigt es | kein neuer Zustand in der Tabelle |
| 6 | Wrapper | **kein Wrapper-Code** – `TableApi` reicht | Methoden, kein Input |
| 7 | Tastatur-Event für die App | **(a) App-Muster** (`keydown` am Host + Fokus lesen), kein `onKeyDown` | (b) bräuchte alle 8 Wrapper + Doku; Showcase und Demo zeigen das Muster. 020/B1 beschreibt es; ein Event wäre ein eigener Prompt (`TODO.md`) |
| 8 | gemeinsamer Log-Code | **`packages/demo-table-models`** (`LogGenerator` fester Seed, `LogTailController`, `createLogTailModelAndOptions`, `LogLevelCellRenderer`) | Showcase lädt `/scripts/demo-table-models`, `apps/table-demo` per Alias, Specs per relativem Import (`log-tail.browser.spec.ts`) |

Weitere Festlegungen:

- `onSelectionChanged` nur, wenn eine **ausgewählte** Zeile entfernt wurde (reines Verschieben: keins). `onFocusChanged`
  nur, wenn die fokussierte Zeile entfernt wurde (Fokus auf die nächste verbliebene Zeile).
- Eingefügte Zeilen **in** einer markierten Spanne teilen sie (nicht markiert, wie Excel); Spalten-Ranges und
  `allSelected` bleiben.
- Sortiert: Binärsuche + `copyWithin` je neue Zeile (O(k log n) Vergleiche). Vorher (Merge mit Vergleich je verschobener
  Zeile) 106 ms je Update bei 2 Mio. Zeilen in Chromium, jetzt ~3,7 ms.
- Sparweg (018 Teil B): nicht folgen, nichts entfernt, alles hinter der letzten gezeichneten Zeile, keine Zeilennummern /
  Summen-Footer / berechneten Spalten / Master-Detail / Spannen, senkrechter Balken unverändert → keine Zelle neu.
  Mit Ringpuffer (Indizes verschieben sich) und im Folgemodus wird gerendert. „Zellen nach Index wiederverwenden“ bleibt
  ein Folgeschritt (`TODO.md`).
- `addRows`: der befürchtete Stack-Überlauf trat **nicht** auf (`[...a, ...b]` nutzt den Stack nicht, getestet mit
  200.000); der Überlauf betrifft `push(...rows)` – genau das stand im Beispiel 6.9 und ist jetzt eine Schleife.
- Scope: Baum, Row Groups, Pivot, Spreadsheet, Zellformeln → `false` + Warnung.

## Tests

- Unit: `live-append/row-index-shift.spec.ts` (inkl. 200 Zufallsrunden gegen eine Referenzsimulation, Selection/Focus),
  `live-append/append-rows-model.spec.ts` (in place, Filter nur neu, stabiles Merge, Ringpuffer beide Wege, Blöcke).
- Browser (ltr + rtl): `live-append/live-append.browser.spec.ts` (Auswahl, Sparweg = 0 Renders/0 Zellen, folgen,
  Freeze, Ringpuffer mit Fokus/Auswahl, Filter, sortiert, 200.000 Zeilen, Overlay, Zellformeln/ohne `appendRows` →
  false, Klick mit echter Maus während des Anhängens, wieder folgen nach dem Loslassen, Tastatur zwischen Updates,
  `rowsAppended`), `live-append/log-tail.browser.spec.ts` (der gemeinsame `LogTailController`: folgen, Freeze/Scroll to
  end, Pause, 8 echte Klicks bei 6.000 Zeilen/s mit vollem Ringpuffer).
- `test:perf` (`perf/live-append.perf.ts`), Bench `bench/append.bench.ts`.

## Messungen (Mac, M-Serie, 09.11.2026)

`test:perf`, Chromium headless, Median je Update inkl. Render:

| Szenario | 100.000 Zeilen | 2.000.000 Zeilen |
|---|---|---|
| `appendRows` 500/Update, folgen, Ringpuffer | 4,0 ms | 3,1 ms |
| dto. gefiltert (¾ sichtbar) | 3,7 ms | 3,3 ms |
| dto. Leser in der Mitte (Sparweg) | 0,6 ms | 0,4 ms |
| `appendRows` sortiert | 1,6 ms | 3,7 ms |
| vorher: `addRows` + `repaintHard` (kopiert alles, setzt Filter/Sortierung zurück) | 5,4 ms | 16,5 ms |
| echter Klick → `onMouseClicked` während Updates (5.000 Zeilen/s) | 0,1 ms | 0,1 ms, alle 20 Klicks angekommen |

Vor dem Span-Fix: folgen 3,7 → 7,6 ms (100.000 → 2 Mio.), Sparweg 0,9 → 5,1 ms – `ColAndRowspanModel.init()` lief bei
jeder neuen Zeilenzahl über alle Zeilen.

Bench (Node, nur Modell, Median):

| n | k | vorher (Kopie + Filter aller Zeilen) | `appendRows` unsortiert, gefiltert, Ringpuffer | `appendRows` sortiert |
|---|---|---|---|---|
| 1 Mio. | 50 | 17,9 ms | 0,010 ms | 19,9 ms |
| 1 Mio. | 500 | 16,0 ms | 0,069 ms | 21,6 ms |
| 1 Mio. | 5.000 | 21,1 ms | 1,3 ms | 37,0 ms |
| 10 Mio. | 50 | 185 ms | 0,004 ms | 213 ms |
| 10 Mio. | 500 | 159 ms | 0,068 ms | 199 ms |
| 10 Mio. | 5.000 | 159 ms | 0,65 ms | 210 ms |

„Sortiert“ in Node ist von `Array.prototype.copyWithin` dominiert (in V8/Node offenbar ohne schnellen Pfad für
Objekt-Arrays; in Chromium 2 Mio. ≈ 3,7 ms). Notiert in `TODO.md`.

## Website, Training, Video

- Showcase `logtail` (rollendes Log, Rate 50/500/5.000, 1 Mio. Ringpuffer, Freeze scroll, Scroll to end, Pause intake,
  die letzten 5 Maus-/Tastatur-Ereignisse), Kachel + Vorschaubild, `new-features.ts`, `/doc/` (`API_GROUPS`, `FEATURES`).
- Training: Abschnitt `#append` in Kapitel 32 `live-data` mit Live-Demo `live-append` (+ Poster light/dark).
- Demo `apps/table-demo/log-tail.html`; Video `videos/15-live-log/` (Folge 40 im Backlog).
- ag-Grid: Transactions (`applyTransactionAsync`) in Community – nicht auf ag-grid.com nachgeprüft (kein Webzugriff in
  dieser Sitzung genutzt); vor der Video-Beschreibung prüfen.
