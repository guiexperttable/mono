# 020 – `llms.txt`: eine Nutzungsanleitung, mit der jede KI die Tabelle richtig einsetzt

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Regeln, Phase 10 =
> Release-Block). **Doku-Auftrag, kein Feature**: Phasen 2–3 (Tests/Code) entfallen bis auf die Snippet-Prüfung,
> Phasen 5–9 (Demos, Website-Showcase, Training, Demo-Repo, Video) entfallen. **Haltepunkt nach Phase 1** (Gliederung
> + Befundliste in `prompts/020-llms-txt.design.md`). Branch: `docs/llms-txt`.
>
> Herkunft: Wunsch von Marc (08.11.2026). Heute beschreibt `llms.txt` (Root, 96 Zeilen) fast nur **was** die Tabelle
> kann (Feature-Liste, viele überlange Zeilen), aber kaum **wie** man typische Aufgaben löst. Eine KI, die nur
> `llms.txt` liest, erfindet deshalb APIs (`onKeyDown`, `getSelectedRows()`, `api.addRow()` …), baut die Tabelle bei
> jedem Update neu auf oder verliert die Auswahl. Erfahrungen aus **log-commander** (Prompts 017–019) zeigen, wo
> echte Anwender (und ihre KI-Assistenten) hängen bleiben.
>
> **Abhängigkeiten:** 018 (Klick trotz API-Render) und 019 (`appendRows`) sind beim Schreiben dieses Prompts **offen**.
> Zu Beginn prüfen, ob sie umgesetzt sind (`git log --oneline -20`, `prompts/README.md` Status,
> `grep -n "appendRows\|rowsAppended" packages/table/src/lib/table/table-api.ts`). Beschrieben wird **nur, was im Code
> steht**. Ist 019 offen, beschreibt das Rezept „Zeilen anhängen“ den heutigen Weg (unten) – 019 ersetzt es später
> selbst (019 pflegt `llms.txt` in seiner Phase 4).

## Ziel

Eine KI, die **nur** `llms.txt` (und von dort verlinkte Dateien) liest, schreibt für die typischen Aufgaben auf Anhieb
Code, der

1. gegen die echte API kompiliert (keine erfundenen Methoden, Optionen oder Events),
2. performant ist (kein Neuaufbau je Update, der richtige der vier Update-Wege, kein O(n) je Tick),
3. die bekannten Fallen vermeidet (Höhe des Hosts, CSS, Index vs. Zeilenobjekt, Auswahl nach Datenänderung,
   Neuaufbau durch neue Options-Objekte in React/Vue, `destroy()` …),
4. ehrlich sagt, was es **nicht** gibt (Filter-UI, Kontextmenü, Paginierung, Server-Side-Row-Model) und wie man es
   selbst baut.

Ergebnis: `llms.txt` (Root) mit einem neuen Hauptteil **„How to use – recipes“** und **„Pitfalls“**, Format nach
https://llmstxt.org (H1, Blockquote-Zusammenfassung, H2-Abschnitte, Links), Sprache **Englisch**.

## Rezepte (Pflichtumfang)

Je Rezept: Aufgabe in einem Satz („How do I …?“) → kürzester richtiger Code (Plain TS, ≤ ~20 Zeilen, **kompiliert**)
→ 1–3 Sätze Warum/Falle → Verweis auf `instructions.md`-Abschnitt bzw. Training-Kapitel/Showcase. Framework-Varianten
nur, wo sie sich wirklich unterscheiden.

| # | Rezept | Quellen im Repo (lesen, nicht raten) |
|---|---|---|
| R1 | Installieren, CSS einbinden, Host mit fester Höhe, erste Tabelle aus Objekten (`TableFactory.createTableModel({ rows, columnDefs })` bzw. `properties`), Options immer `{ ...new TableOptions(), … }` | `instructions.md` 2, 3, 4.1, 5.1; Training `first-table`, `array-to-table-model` |
| R2 | Dieselbe Tabelle in React, Vue 3, Angular (`TableComponent` und `TableSignalComponent`), Svelte, Solid, Preact, Web Component – **wie man an die `TableApi` kommt** und warum Modell/Options stabil bleiben müssen (`useMemo`, `shallowRef`, Konstante; neues Objekt = Neuaufbau); Web Component selbst registrieren | `instructions.md` 4.2–4.8, CLAUDE.md §4, `packages/angular-table/instructions.md` 14, `apps/*-table-demo` |
| R3 | **Maus-Events**: `EventAdapter` ableiten, `onMouseClicked` (`GeMouseEvent`: `rowIndex`, `columnIndex`, `areaIdent`, `clickCount`, `originalEvent`), Doppelklick über `clickCount`, Header-Klick vs. Body-Klick, `rowIndex` → Zeilenobjekt (`tableModel.getBodyModel().getRowByIndex(rowIndex)` = **angezeigte** Zeile nach Filter/Sortierung), `onMouseMoved` (teuer? prüfen), Kontextmenü (`onContextmenu` + eigenes Menü, `preventDefault`), `api.subscribe()` für weitere Listener. Wrapper: Callback-Props/Outputs, `debounceMouseClickDelay` (Angular/Vue, 150 ms), Angular `contextMenu` statt `contextmenu` | `instructions.md` 6.5, Training-Demo `events-and-context-menu.ts`, Angular-Demo `mouseevent`, `mouse-handler.ts` |
| R4 | **Tastatur**: eingebaute Tasten (WAI-ARIA-Navigation, Strg/⌘+A/C, F2, Enter = `ACTIVATE_CELL`), Mapping ändern (`shortcutActionIdMapping`, Schreibweise wird harmonisiert), abschalten (`shortcutActionsDisabled`), aus eigenem Code auslösen (`triggerAction`), macOS ⌘ statt Strg; **auf eigene Tasten reagieren** (z. B. Entf löscht die fokussierte Zeile, Enter öffnet einen Dialog) – den tatsächlich empfohlenen Weg herausfinden (s. Befund B1) | `instructions.md` 6.4, 6.14, 6.20; `action/shortcut.service.ts`, `action/action-id.type.ts`, `table-scope.ts` `onActionTriggered`, `focus/focus-model.ts` |
| R5 | **Zeilen-Selektion**: `SelectionModel("row", "multi")` über `getSelectionModel` (Default-Typ `"none"`!), Typen/Modi, Maus-Gesten (Klick, Shift, Strg/⌘, Ziehen bei `range`), **ausgewählte Zeilenobjekte holen** (`getMergedRowIndices(rowCount)` → `getRowByIndex`), auf Änderungen reagieren (`onSelectionChanged`), per Code auswählen/leeren (die echten Methoden: `SelectionModel.addSelection`/`selectAll`/`clear`, `api.clearSelection()`, `api.setSelectionModel()` – Signaturen prüfen und zeigen), Fokus ≠ Auswahl, Statusleiste (`getSelectionAggregates`), Checkboxen als Alternative (`rowCheckboxVisible`, `onCheckboxChanged`, `isRowChecked`), was mit der Auswahl bei Filter/Sortierung/`setRows` passiert (Indizes!) und wie man sie per Zeilen-Id wiederherstellt (State-API `selection`) | `instructions.md` 6.4, 6.6, 6.11; Training-Demo `selection-and-copy.ts`; Angular-Demo `cellselection`, `checkbox`; `selection/selection-model.ts`, `selection/selection-service.ts` |
| R6 | **Daten ändern – der richtige Weg**: Entscheidungstabelle `updateCells` (einzelne Zellen, nur diese werden gezeichnet; `TableCellUpdateEvent` mit CSS-Klassen) · `repaint()` (Werte im Zeilenobjekt selbst geändert, gleiche Zeilenzahl) · `repaintHard()` / `repaintHard({ px, py })` (Zeilenzahl oder Höhen geändert) · `setRows` + ggf. `externalFilterChanged` + `repaintHard` (Datensatz ersetzt) · **neues Modell nur bei neuen Spalten/Struktur** (sonst Neuaufbau, Zustand weg). Viele Ticks bündeln (ein `updateCells` je Frame, `requestAnimationFrame`). Welcher Index bei `updateCells` gilt (angezeigt oder Quelle?) – prüfen, s. Befund B4 | `instructions.md` 6.9, 6.13, 6.26; Training-Demo `live-data.ts`; Showcases `fps`, `crypto`; Angular-Demo `chunksocket` |
| R7 | **Rollendes Log / Zeilen anhängen** (ausführlich – 019 trägt in `llms.txt` nur Feature-Zeile und FAQ ein und verweist hierher). Ist 019 umgesetzt: `appendRows` (Objekt-Array) bzw. `rowsAppended(count)` (eigenes `AreaModel`) mit `follow` und `maxRows` (Ringpuffer); Updates bündeln (Puffer + `requestAnimationFrame`, ein Aufruf je Frame); **„Freeze scroll“** (Ansicht bleibt, Zeilen kommen weiter, „+N new lines“) und **„Scroll to end“** (ans Ende, wieder folgen) als App-Code; optional „Pause intake“; **Mausklicks und Tasten im Live-Betrieb** (Klick → Zeilenobjekt, Auswahl/Fokus bleiben an ihrer Zeile auch beim Abschneiden vorne, Tastatur-Weg wie in 019 Entscheidungsfrage 7 beschlossen); Fallen (kein `addRows` je Tick, kein neues Modell, kein `repaintHard` ohne Position, Klick-Verlust vor 018). Gemessene Werte aus `test:perf` (Prompt 021, Szenarien von 019: Zeilen/s, ms je Update) als Größenordnung nennen. Ist 019 offen: heute `addRows` + `repaintHard` – mit den Grenzen aus 019 (kopiert alles, Spread-Stack-Überlauf ab ~100.000 Zeilen, setzt Filter/Sortierung zurück) – bzw. eigenes `AreaModel` + `repaintHard({ py })` (Ende folgen mit `Number.MAX_SAFE_INTEGER`, Position halten) | `instructions.md` 5.5, 6.9, FAQ 6.26; `prompts/019-live-append.md` + `019-live-append.design.md` (Entscheidungen, Messwerte); Showcase `logtail` und `apps/table-demo/log-tail.html` (falls 019 umgesetzt); `prompts/017-…` |
| R8 | **Millionen Zeilen**: eigenes `AreaModel` (`getRowCount`, `getValueAt`, `getRowHeight`, `getConstantRowHeight`), Daten lazy, keine Objekte je Zeile nötig, Scrollhöhe aus dem Modell (seit 1.1.107) | `instructions.md` 5.5; Showcase `large`; `demo-table-models` `createLargeModelAndOptions` |
| R9 | Sortieren (Header = **Doppelklick**, `sortable`, `sortComparator`, `sortByColumn`, `sort(fn)`, `reSort()` nach Datenänderung) und Filtern (`externalFilterFunction` + `externalFilterChanged()` – leert die Auswahl und springt nach oben; Filter-UI baut die App) | `instructions.md` 6.2, 6.3; Training `sorting`, `filtering` |
| R10 | Eigener Zell-Renderer (`CellRendererIf.render(...)` mit Cleanup, **nie** Daten unescaped in `innerHTML` – `escapeHtml`/`textContent`, Bedienelemente `tabindex="-1"`), eingebaute Renderer, Framework-Komponente als Zelle | `instructions.md` 6.1, 6.14; Training `cell-renderers`, `framework-components` |
| R11 | Editieren: Inline-Editor, Excel-Bedienung (`editing`), Änderung abfangen (`onModelChanged` mit `changes`/`source`), validieren (`ColumnDef.validate`), Batch-Edit für „erst speichern, dann schreiben“ | `instructions.md` 6.7, 6.17, 6.20 |
| R12 | Spalten fixieren (`fixedLeftColumnCount` im **Modell**), Spaltenindex über `api.getColumnIndex(property)` (Zeilennummer/Checkbox verschieben Indizes), Spalten ein-/ausblenden, Breiten, Header-Gruppen | `instructions.md` 5.2, 6.13; CLAUDE.md §3.4 |
| R13 | Aussehen: CSS-Variablen `--ge-table-*`, Dark Mode (`html[data-theme]`), Scrollbalken per CSS, RTL (`direction`) | `instructions.md` 6.12, 6.19, FAQ |
| R14 | Zustand merken (`autoRestoreOptions` **mit** `getStorageKeyFn`, sonst wird nichts gespeichert; `getState`/`applyState` für den Server) | `instructions.md` 6.11 |
| R15 | Export (Zwischenablage, Excel = aktuelle Sicht; alle Zeilen über `ExcelService`) | `instructions.md` 6.10 |
| R16 | Lebenszyklus: `api.destroy()` vor Modellwechsel/Entfernen (Plain TS); Wrapper machen es selbst | `instructions.md` 4.1; `lifecycle.browser.spec.ts` |
| R17 | „Gibt es nicht“ mit Lösungsweg: Filter-UI, Kontextmenü, Paginierung, Server-Side-Row-Model, Drag zwischen Tabellen – je ein Satz, wie man es mit vorhandener API baut | `instructions.md` 7 |

Weitere Rezepte, wenn beim Lesen der Demos typische Fragen auffallen (z. B. Baum + Checkboxen, Master/Detail,
Row Grouping, Pivot, Spreadsheet): **kurz** (2–4 Zeilen + Verweis) – die Feature-Liste deckt das „was“ schon ab.

## Pitfalls (Pflichtumfang – jeder mit Symptom → Ursache → Lösung)

Mindestens diese; in Phase 1 gegen Code, `TODO.md` (Abschnitte „Wrapper-Korrekturen“, „Gefunden durch die Unit-/
Browser-Tests“, „Gefunden im log-commander-Spike“, „Für die Release-Notes“), `instructions.md` 6.26 und die Demos
prüfen und ergänzen:

- Leere Tabelle: Host ohne feste Höhe, CSS `@guiexpert/table/css/main.css` fehlt.
- Tabelle wird bei jedem Render neu aufgebaut / verliert Auswahl, Scroll und Sortierung: Options/Modell inline erzeugt
  (React, Preact, Vue, Svelte, Solid, Angular-Template) – stabil halten; zum Ändern die `TableApi` nehmen.
- Kein Event / keine Auswahl: Selektionstyp Default `"none"`; Selektionsmodell nicht über `getSelectionModel` gesetzt.
- Falsche Zeile: `rowIndex` ist der **angezeigte** Index (nach Filter/Sortierung, ohne Detailzeilen); Zeilenobjekt
  über `getRowByIndex`, nie `rows[rowIndex]` der App.
- Falsche Spalte: Zeilennummer-/Checkbox-/Gruppenspalte verschieben `columnIndex` → `getColumnIndex(property)`.
- Sortieren per Einfachklick erwartet: Header sortiert per Doppelklick; aus Code `sortByColumn`.
- Auswahl weg nach `externalFilterChanged()` / `setRows()`; Sprung nach oben nach `externalFilterChanged()`.
- `addRows` bei großen Mengen (Stack-Überlauf, Filter/Sortierung zurück) – Stand nach 018/019 prüfen.
- Klick geht verloren, wenn die App zwischen `mousedown` und `mouseup` rendert (018) – Stand prüfen; bis dahin: nur
  bei sichtbarer Änderung rendern, Updates bündeln.
- Kontextmenü direkt nach dem Aufbau (< 50 ms) wird verschluckt; Angular `(contextmenu)` feuert doppelt → `contextMenu`.
- Klick-Events verzögert in Angular/Vue (`debounceMouseClickDelay` 150 ms, `0` = sofort).
- `repaint()` nach Änderung der Zeilenzahl (zu wenig) bzw. neues Modell je Tick (viel zu viel).
- `defaultRowHeights` gegen Modellhöhe (seit 1.1.107 gewinnt das Modell), Scrollbalken ohne Überlauf vor 1.1.107.
- Tastenkürzel hart als `ctrlKey` geprüft (macOS ⌘), eigene Tab-Stopps in Zellen (Tabelle = ein Tab-Stopp).
- XSS: Zellwerte in `innerHTML` eines eigenen Renderers.
- Persistenz speichert nichts: `getStorageKeyFn` fehlt.
- Tippfehler-APIs **nicht korrigieren** (`showCheckboxWihoutExtraColumn`, `isHeaderVisibe`, `emmitDataKey`,
  `createCoverGrisDefaultOptions`) – eine KI „verbessert“ sie sonst und der Code kompiliert nicht.
- `AsyncBodyAreaModelObjectArray` existiert im Quellcode, ist nicht exportiert – nicht verwenden.
- `instanceof` über Paketgrenzen (doppelter Core) – `isAreaModelTree`, `isTreeRow` … nutzen.

## Befund für Phase 1 (08.11.2026, Stand 1.1.107 – nachprüfen, nicht übernehmen)

| # | Stelle | Beobachtung | Was tun |
|---|---|---|---|
| B1 | `event-listener.if.ts` | `EventListenerIf` hat **kein** Tastatur-Event. `GeKeyEvent` (`data/common/event/ge-key-event.ts`) ist exportiert, wird aber nur als Feld in `table-scope.ts:147` gehalten, nie gemeldet | Den echten Weg für „eigene Taste“ finden und zeigen (z. B. `keydown` am Host – wie kommt die App an den Host, wie an die Fokuszelle: `api.getActiveCell()`? `getFocusModel()`? `getHeaderFocus()`; Konflikt mit `ShortcutService`, Zell-Editor, Master/Detail-Isolation). Lücke in `TODO.md` eintragen (Vorschlag: `onKeyDown?`-Event oder eigene `ActionId`s mit Handler) – **nicht** in diesem Prompt bauen. Zuerst nachsehen, was 019 (Entscheidungsfrage 7) beschlossen und gebaut hat – der Showcase `logtail` zeigt Tastatur-Events an; gibt es dort ein neues Event, ist B1 erledigt und R4 beschreibt es |
| B2 | `table-api.ts:1372` `addRows`, `:1401` `addRowsAt`, `:1430` `removeRows` | `setRows([...alle, ...neu])` bzw. `filter` + `setRows`: O(n), Spread, setzt Filter/Sortierung zurück, rendert nicht | so dokumentieren (mit `repaintHard`), auf 019 verweisen, falls umgesetzt |
| B3 | `table-api.ts:250` `externalFilterChanged` | leert die Auswahl, scrollt nach oben (JSDoc sagt es) | als Pitfall; Auswahl über State-API `selection` wiederherstellen (prüfen, ob das ohne `getRowId` geht) |
| B4 | `table-api.ts:202` `updateCells` | Index-Bedeutung (angezeigt vs. Quelle) bei Filter/Sortierung nicht dokumentiert | im Browser prüfen (kleine Spec oder Demo), Ergebnis in Rezept R6 **und** JSDoc/FAQ |
| B5 | `instructions.md` 6.5 | sagt „`scroll` not forwarded by the React wrapper“, `TODO.md` „Wrapper-Korrekturen“ sagt, React ruft `scroll` jetzt auf | Code von `packages/react-table` lesen, falsche Stelle korrigieren |
| B6 | JSDoc-Beispiel in `externalFilterChanged` | `new TableApi(tableScope)` statt `tableScope.getApi()`; Options nachträglich mutiert | nur prüfen; falls irreführend, JSDoc korrigieren (`docs:check`) |
| B7 | `AreaModelIf.getRowByIndex`, `SelectionModel.getMergedRowIndices` | Weg „ausgewählte Zeilenobjekte“ existiert, aber keine Komfort-Methode `getSelectedRows()` | Rezept zeigen; Komfort-Methode als Vorschlag in `TODO.md` |
| B8 | `apps/webpage-guiexpert/public/llms.txt` | eigene, kürzere Fassung (58 Zeilen), teils veraltet („actively maintained as of mid-2025“) | Entscheidungsfrage 2 |

Weitere Kandidaten beim Lesen der Demos sammeln: `apps/table-demo/src/*`, `apps/angular-table-demo/src/app/*`
(`mouseevent`, `cellselection`, `checkbox`, `chunksocket`, `filter`, `sorting`, `todo`, `componentrenderer`),
`apps/*-table-demo`, Training-Demos `apps/webpage-guiexpert/src/training/demos/*.ts`, Showcases
`apps/webpage-guiexpert/src/components/showcase/*`. Jeder Fund: Rezept/Pitfall, und – wenn es ein Fehler im Code ist –
`TODO.md` (Bugs nicht in diesem Prompt beheben, außer Doku-Fehler).

## Entscheidungsfragen (Phase 1, je Optionen + Empfehlung)

1. **Aufbau von `llms.txt`**: (a) alles in eine Datei (Index + Rezepte + Pitfalls), (b) `llms.txt` als Index nach
   llmstxt.org + `llms-full.txt` mit allen Rezepten, (c) Rezepte als eigene Markdown-Datei (`docs/ai-recipes.md`)
   und `llms.txt` verlinkt sie. Marc wünscht ausdrücklich die Ergänzung von `llms.txt`; Empfehlung vorher prüfen:
   (a), solange die Datei ≲ 700 Zeilen bleibt, dabei die überlangen Feature-Zeilen in eine kompakte Liste
   (Feature → Einstieg → Abschnitt) umbauen, **ohne Information zu verlieren** (Details stehen in `instructions.md`).
2. **Website-`llms.txt`** (`apps/webpage-guiexpert/public/llms.txt`, ausgeliefert unter https://gui.expert/llms.txt):
   gleiche Datei (Kopie per Build-Skript oder `pre:build`), oder Kurzfassung mit Link auf die Root-Datei auf GitHub?
   Veraltetes dort in jedem Fall bereinigen. **Kein Deploy.**
3. **npm-Paket**: `llms.txt` zusätzlich in `packages/table` ausliefern (`files`), damit KI-Assistenten sie in
   `node_modules/@guiexpert/table/` finden? Oder reicht der README-Abschnitt „Quick answers“ (mit Link)?
4. **Snippet-Prüfung**: neues Skript (z. B. `scripts/check-llms-snippets.mjs`: ```` ```ts ````-Blöcke aus `llms.txt`
   extrahieren, je Block gegen `packages/table/src` mit `tsc --strict` kompilieren, Prelude wie
   `packages/table/scripts/doc-examples-prelude.ts`) + Root-Script `check:llms` + CI-Schritt – oder einmalig manuell
   wie bei `instructions.md`? Empfehlung: Skript, weil `llms.txt` bei jedem Feature-Prompt angefasst wird (000 Phase 4).
5. **Framework-Snippets** (React/Vue/Angular …): prüfen (wie?) oder als nicht kompilierte Anzeige markieren?

## Phasen

1. **Lesen und Befund** 🛑: CLAUDE.md, `instructions.md` (ganz), `packages/table/README.md`,
   `packages/angular-table/instructions.md`, beide `llms.txt`, `TODO.md`, die Demos oben, die JSDoc der `TableApi`
   (Kopf-Tabelle „The most important methods“). Ergebnis `prompts/020-llms-txt.design.md`: Gliederung der neuen
   `llms.txt`, Liste der Rezepte mit gewählter API (Signatur aus dem Code), Pitfall-Liste mit Quelle, bestätigte bzw.
   widerlegte Befunde B1–B8 + neue, Antworten auf die Entscheidungsfragen. **Anhalten.**
2. **Offene Fragen im Browser klären** (B1, B4 und alles, was nur ausprobiert sicher ist): kleine Browser-Spec im Core
   (`*.browser.spec.ts`, bleibt als Charakterisierungstest; falsches Verhalten = `it.fails` + `// BUG:` + `TODO.md`)
   oder Seite in `apps/table-demo` – nicht nur raten.
3. **Schreiben**: `llms.txt` nach freigegebener Gliederung. Regeln: Englisch, kurze Sätze, jede Antwort für sich
   verständlich (eine KI liest oft nur einen Ausschnitt), echte Namen (Tippfehler-APIs so wie sie sind), `since 1.1.x`
   wo es für ältere Versionen zählt, keine Preise, Lizenz „MIT“ (CLAUDE.md §8), ag-Grid nur sachlich. Snippets
   ≤ ~20 Zeilen, `import … from "@guiexpert/table"`, kompilierend.
4. **Prüfen**: Snippet-Prüfung (Entscheidung 4) grün; Links (Abschnitte, Training-Slugs, Showcases) existieren.
   **Gegenprobe mit einer fremden KI**: zwei bis drei Subagenten, die **nur** die neue `llms.txt` bekommen (kein Repo),
   lösen je Aufgabe Code – z. B. „Tabelle mit 50.000 Bestellungen, Mehrfach-Zeilenauswahl, darunter die Summe der
   ausgewählten Beträge“, „Entf löscht die fokussierte Zeile“, „rollendes Log mit 1 Mio. Zeilen Ringpuffer, 500 Zeilen/s,
   Knöpfe ‚Freeze scroll‘ und ‚Scroll to end‘, Anzeige des letzten Mausklicks und der letzten Taste“ (Ergebnis mit dem
   Showcase `logtail` vergleichen), „Kurs-Ticker: 1.000 Zeilen, 50 Preise je 100 ms“, „React: Klick auf eine Zeile
   öffnet ein Detail-Panel“. Ergebnis kompilieren (und den Kern in `apps/table-demo` kurz ausführen); jede erfundene
   API, jeder Neuaufbau je Update, jede verlorene Auswahl = Lücke in `llms.txt` → nachbessern, Runde wiederholen
   (höchstens 2). Ergebnis-Tabelle (Aufgabe → Fehler vorher → nachher) ins Design-Dokument.
5. **Nachziehen** (CLAUDE.md §6 „Wichtige Antworten auffindbar ablegen“): neue Antworten auch in `instructions.md` 6.26
   FAQ, `packages/table/README.md` „Quick answers“ und der Website-`llms.txt` (wie entschieden); Doku-Fehler aus dem
   Befund in `instructions.md`/JSDoc korrigieren (`docs:check`, `instructions.md`-Snippets kompilieren);
   `prompts/000-arbeitsweise.md` Phase 4: Hinweis, dass neue Features ihr Rezept/Pitfall in `llms.txt` eintragen
   (und `check:llms` laufen lassen, falls gebaut); CLAUDE.md §6 kurz ergänzen (Rolle von `llms.txt`, Prüfskript);
   `TODO.md` (Funde, Lücken wie B1/B7), `prompts/README.md` (Zeile + Status).
6. **Abschluss** (000 Phase 10, soweit betroffen): `pnpm build:core`, `pnpm --filter @guiexpert/table test:types`,
   `docs:check`, `test:unit`, `test:browser` (falls Specs dazukamen), Snippet-Prüfung, bei Website-Änderung
   `pnpm build:webpage-guiexpert`. Release-Block nach 000 Phase 10, wenn etwas im npm-Paket geändert wurde (README,
   JSDoc, ggf. `llms.txt` im Paket) – sonst nur Merge-Block.

## Fertig, wenn

- [ ] Design-Dokument mit Gliederung, Befund und Entscheidungen freigegeben 🛑
- [ ] `llms.txt` enthält R1–R17 und die Pitfall-Liste; jedes Snippet kompiliert gegen `packages/table/src`; keine API,
      die es nicht gibt; alle Verweise gültig
- [ ] Gegenprobe mit fremden Subagenten bestanden (Tabelle im Design-Dokument), keine erfundenen APIs mehr
- [ ] Offene Verhaltensfragen (B1, B4 …) im Browser geklärt; Bugs als `it.fails` + `TODO.md`, Lücken als Vorschlag in
      `TODO.md`
- [ ] FAQ 6.26, `packages/table/README.md`, Website-`llms.txt`, `000-arbeitsweise.md`, CLAUDE.md §6, `TODO.md`,
      `prompts/README.md` nachgezogen
- [ ] Kein Publish, kein Deploy, kein Push, keine Versionsänderung ohne ausdrückliche Anweisung; Abschlussbericht mit
      Merge-/Release-Block (000 Phase 10)
