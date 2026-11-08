# 018 – Bugfix: Klick geht verloren, wenn die Anwendung während des Drückens rendert

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Regeln, Phase 10 =
> Release-Block). Bugfix, **Haltepunkt nur**, wenn die API von Teil B vom Vorschlag unten abweicht. Jede Code-Änderung
> am Core folgt der Regel „zuerst ein roter Test“. Branch: `fix/klick-trotz-api-render`.
>
> Herkunft: **log-commander** (Tauri-Live-Log-Viewer, `@guiexpert/table@1.1.107`, `@guiexpert/angular-table@22.1.107`,
> `<guiexpert-table-signal>` mit `(mouseClicked)`, `[debounceMouseClickDelay]="0"`, eigenes `AreaModel`, bis zu
> 10 Mio. Zeilen, 5000 neue Zeilen/s). Die Anwendung hält die Position selbst und zeichnet je Update mit
> `repaintHard({ px, py })`, `scrollToPixel()` oder `repaint()` (siehe Prompt 017).

## Befund (08.11.2026)

Im Live-Tail ließ sich eine Zeile mit der Maus oft nicht mehr wählen, mit der Tastatur schon. `mouseClicked` kam nicht.

Ursache im Core (`packages/table/src/lib/table/mouse-handler.ts`):

1. `mouseClicked` entsteht nur aus dem **nativen** `click` des Browsers (`onHostElementClicked`). Der Browser schickt
   `click` nur, wenn `mousedown` und `mouseup` auf **demselben Element** landen.
2. Jeder Render baut die sichtbaren Zellen neu (`adjustArea`). Ein Render zwischen `mousedown` und `mouseup` ersetzt
   die gedrückte Zelle → kein `click` → kein `mouseClicked`, keine Fokusänderung.
3. Der Core weiß das und hält **seine eigenen** Repaints zurück (`onMouseDown`: `cancelPendingRepaint()` →
   `repaintAfterMouseUp`). Renders, die die Anwendung über die API auslöst (`repaint()`, `repaintHard()`,
   `scrollToPixel()`, `setColumnWidth()` …), laufen dagegen sofort.

Die Demo (`apps/angular-signal-demo`) zeigt das nicht, weil sie nur bei Benutzeraktionen rendert. Ein Live-Tail rendert
bis zu zehnmal pro Sekunde; dann trifft fast jeder Klick einen Render.

Gegenprobe: headless WebKit mit echten Mauseingaben (Playwright `page.mouse`): ohne Updates kommt jeder Klick an, auch
nach einem Doppelklick. Mit `mouse.down()` → Render → `mouse.up()` kommt keiner.

**Im Mono-Repo nachgeprüft (08.11.2026, `dist` 1.1.107, Playwright `page.mouse`, Chromium und WebKit):** gleiches
Ergebnis in **beiden** Engines – also kein WebKit-/Tauri-Sonderfall:

| Fall | Chromium | WebKit |
|---|---|---|
| reines DOM: Element zwischen `mousedown` und `mouseup` ersetzt (Listener am Eltern-Element) | kein `click`, auch nicht am gemeinsamen Vorfahren | ebenso |
| Tabelle (`TableFactory.createTableModel({ rows, properties })`, 1.000 Zeilen), ohne Render | `mouseClicked` 3:1, Fokus 3,1 | ebenso |
| `api.repaint()` zwischen Drücken und Loslassen (andere Zeile) | kein `mouseClicked`, Fokus bleibt auf der vorigen Zelle | ebenso |
| `api.repaintHard()` bzw. `addRows()` + `repaintHard()` dazwischen | ebenso | ebenso |

Firefox ließ sich lokal nicht starten – im Test mitnehmen, falls die CI ihn hat. Die Tabelle wurde in log-commander
**nicht** falsch verwendet: Rendern je Update ist der dokumentierte Weg (JSDoc `repaintHard`, Beispiele 5/6), und es
gibt keine öffentliche Möglichkeit, „Maustaste gedrückt“ abzufragen.

Die App umgeht es jetzt, indem sie nur noch bei sichtbarer Änderung zeichnet (Vergleich mit dem zuletzt gezeichneten
Zustand). Im Live-Tail bleibt das Problem: Dort ändert sich das Bild wirklich, auch während eines Klicks.

## Teil A – Klick übersteht einen Render (Pflicht)

Empfohlen (robust, unabhängig von DOM-Identität):

- Beim `mousedown` die gedrückte Zelle als **Schlüssel** merken (Area, Zeile, Spalte – `getCellKey` gibt es schon),
  dazu Position und Zeit.
- Beim `mouseup` auf derselben Zelle (gleicher Schlüssel, Bewegung unter der Drag-Schwelle) den Klick melden, wenn
  bis zum Ende dieses Tasks kein natives `click` kam (z. B. `queueMicrotask`/`setTimeout(0)` nach `mouseup`). Kam ein
  natives `click`, bleibt alles wie heute – nie doppelt melden.
- Doppelklick (`clickCount` 2) und `dblclick` analog: zwei solche Klicks auf derselben Zelle innerhalb von
  `doubleClickDelay`.
- **Achtung Follow-Modus:** Beim Folgen („tail -f“) oder Halten mit vorne abgeschnittenen Zeilen rutscht der Inhalt
  unter dem stehenden Mauszeiger. Beim `mouseup` liegt dann eine **andere** Zeile unter dem Zeiger, der Schlüssel
  stimmt nicht mehr, und der Klick ginge wieder verloren. Deshalb nicht den Schlüssel unter dem `mouseup` vergleichen,
  sondern den Klick für die **Zelle vom `mousedown`** melden, wenn die Maus sich unter der Drag-Schwelle bewegt hat
  (Bildschirmkoordinaten) – egal, was jetzt darunter liegt. Gemerkt wird die Zeile möglichst als Zeilenobjekt
  (`getRowByIndex`), damit ein Index-Versatz (Prompt 019: `maxRows`, sortiertes Einfügen) den Klick nicht auf eine
  andere Zeile lenkt; der gemeldete `rowIndex` ist der aktuelle Index dieses Objekts. Beim Doppelklick gilt dasselbe
  für beide Klicks.

Alternative (kleiner): Renders über die API während eines gedrückten Buttons bis `mouseup` zurückhalten, wie
`repaintAfterMouseUp` es für eigene Repaints tut, und nach dem `click`/`dblclick` nachholen. Nachteil: Ein langer
Druck (Textauswahl ziehen) hält den Live-Tail an; die Position muss trotzdem stimmen (`pendingContentScroll`).

Entscheidung mit Begründung im Design-Dokument.

**Tests (Browser, zuerst rot):**

- `mousedown` auf Zelle (r, c) → `api.repaint()` → `mouseup` + Klick an derselben Stelle → genau ein `mouseClicked`
  mit `rowIndex` r, Fokus auf (r, c).
- Dasselbe mit `repaintHard({ py })` und `scrollToPixel()`, und mit wachsender Zeilenzahl dazwischen.
- Follow: `mousedown` auf Zeile r → Zeilen anhängen + `repaintHard({ py: Number.MAX_SAFE_INTEGER })` (Inhalt rutscht
  unter dem Zeiger) → `mouseup` an derselben Bildschirmstelle → genau ein `mouseClicked` für **Zeile r** (nicht die
  Zeile, die jetzt unter dem Zeiger liegt), Fokus auf r.
- Echte Mauseingaben (Vitest-Browser-Commands mit Playwright `page.mouse.down/up`, kein synthetisches `click()` –
  das umgeht das Problem), Chromium und WebKit; Aufbau wie in der Nachprüfung oben: `mouse.move` auf die Zellmitte,
  `mouse.down()`, Render per `page.evaluate`, `mouse.up()`, dann `mouseClicked` und Fokus lesen.
- Doppelklick mit Render zwischen erstem und zweitem Klick → `clickCount` 2 einmal.
- Ohne Render: weiterhin genau ein `mouseClicked` (keine Doppelmeldung durch den neuen Weg).
- Ziehen über die Drag-Schwelle → kein Klick, `mouseDragging`/`mouseDraggingEnded` wie heute.
- ltr und rtl.

## Teil B – Kein Neuaufbau, wenn sich nichts ändert (empfohlen)

Für Live-Daten ändert sich eine Zeile nie, es kommen nur Zeilen hinzu. Heute baut jeder Render alle sichtbaren Zellen
neu, auch wenn sich der sichtbare Bereich nicht ändert (z. B. Leser mitten in der Datei, hinten kommen Zeilen dazu – nur
die Scrollhöhe wächst).

Vorschlag:

1. `repaintHard({ px, py })` (oder eine neue Methode, z. B. `updateRowCount()`) aktualisiert Scrollhöhe und
   Balkenposition, **ohne** die Zellen neu zu bauen, wenn der sichtbare Zeilenbereich, Spalten und Höhen gleich bleiben.
2. Mittelfristig: Zellen beim Render nach Zeilenindex wiederverwenden statt neu bauen (beim Follow käme dann nur die neue
   Zeile unten hinzu). Das senkt auch die Frame-Zeiten (log-commander, Spaltenmodus mit 7 Zellen je Zeile: p95 22–24 ms
   gegenüber 19–20 ms mit 2 Zellen).

Tests: Render-Zähler/DOM-Identität der sichtbaren Zellen bleibt bei reinem Zeilenzuwachs außerhalb des sichtbaren
Bereichs gleich; Scrollhöhe stimmt.

## Weitere Punkte aus log-commander (nur aufnehmen, wenn klein; sonst in `TODO.md`)

Aus `log-commander/prompts/done/009-tabellen-header.design.md` (dort in der App umgangen):

1. Spalten-Spannen (`getColspanAt`) lassen die Tabelle bei jeder neuen Zeilenzahl alle Zeilen durchsuchen.
   **Bestätigt (08.11.2026):** `RenderScope.repaintHard` → `ColAndRowspanModel.initIfRowCountChanged()`
   (`render-scope.ts:609`) → `init()` ruft `getColspanAt`/`getRowspanAt` für **jede Zelle aller Zeilen**, sobald
   `getMaxColspan() ≥ 2` oder `getMaxRowspan() ≥ 2` – bei 10 Mio. Zeilen × 7 Spalten 70 Mio. Aufrufe je Update.
   `isInRange` läuft je gezeichneter Zelle linear über alle Spannen.
2. Eine Spanne wird nur gezeichnet, wenn ihre erste Zelle sichtbar ist. **Im Code anders gesehen (08.11.2026, nicht
   im Browser nachgestellt):** `adjustArea` zeichnet am Ende **alle** Spannen der Area (`render-scope.ts:1544`,
   Schleife über `getRanges()` ohne Sichtbarkeitsprüfung, `drawBigCell` je Spanne) – bei vielen Spannen ist das eher
   ein Performance-Problem als ein fehlendes Zeichnen. Vor einer Änderung mit einem Test klären, was log-commander genau
   beobachtet hat (Spanne, deren erste Zeile oberhalb des Viewports liegt?).
3. Eine feste linke Spalte (Zeilennummern) lässt sich nicht gegen Verschieben sperren.
4. Spaltenbreite nur per Maus änderbar (kein Tastaturweg).
5. Kein Ereignis „Spalten-Ziehen beendet“ (Breite/Reihenfolge).

## Fertig, wenn

- Teil A mit roten, dann grünen Browser-Tests; alle bestehenden Tests grün (`test:browser`, `test:browser:scrollbars`,
  ltr und rtl).
- Teil B umgesetzt oder als begründeter Folgeschritt in `TODO.md`.
- `instructions.md`/`CLAUDE.md`/`TODO.md` aktualisiert, `prompts/README.md`-Zeile, Release-Block (Phase 10) nur auf
  Anweisung.
