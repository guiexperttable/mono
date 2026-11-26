# 028 – Bugfix: Die Tabelle bleibt „gedrückt“, wenn das `mouseup` nie ankommt

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Regeln, Phase 10 =
> Release-Block). Bugfix mit kleiner API-Ergänzung, **Haltepunkt nur**, wenn die Lösung von den Vorschlägen unten
> abweicht (dann kurzes `prompts/028-press-ohne-mouseup.design.md`). Jede Code-Änderung am Core folgt der Regel „zuerst
> ein roter Test“. Branch: `fix/press-ohne-mouseup`. Zielversion: die nächste nach 1.1.118 (in
> `packages/table/package.json` nachsehen).
>
> Herkunft: **files-and-folders-tauri** (Dateimanager, Tauri 2 + Angular 22, `@guiexpert/table@1.1.105`,
> `@guiexpert/angular-table@22.1.105`, `<guiexpert-table-signal>` als Dateiliste). Die App zieht Zeilen mit eigenen
> Pointer-Events; verlässt der Zeiger das Fenster, startet sie einen **nativen System-Drag** (Rust-Crate `drag`:
> `NSDraggingSession` auf macOS, `DoDragDrop` unter Windows, GTK unter Linux), damit die Datei im Finder, in Mail
> usw. landet.

## Befund (26.11.2026)

Nach dem Ziehen einer Datei aus der linken Liste in ein anderes Programm sah die Liste so aus: Die Zellen der
Namensspalte waren leer und grünlich hinterlegt (Kopf „Name“ noch da), die Zeilen daneben normal; außerdem stand
„Modified“ plötzlich direkt neben „Name“. Die leere Spalte ist die **Drop-Zone eines Spalten-Drags**
(`renderDragTargetDiv`, Klasse `ge-table-drop-zone`) – die Tabelle glaubte, der Nutzer verschiebe gerade eine Spalte.

Zwei Fehler im Core kamen zusammen (gelesen im Quelltext von 1.1.105, Release-Commit `4b26546`):

1. **Kein `mouseup`.** Sobald der native Drag läuft, gehört die Maus dem System. Die Seite bekommt das `mouseup` nie –
   weder am Host noch am `document`. `MouseHandler` bleibt bei `mouseDown = true`, `dragging = true`. Jede spätere
   Mausbewegung über der Tabelle (ohne gedrückte Taste) läuft weiter durch `mouseDraggingOnFrame`.
2. **Veraltete Spalten-Aktion.** Ein Klick auf einen Spaltenkopf ohne Mausbewegung (hier: der Doppelklick zum
   Sortieren) setzte `mouseStartAction = 'drag-column'` und `dragFrom`; zurückgesetzt wurde beides nur in
   `mouseDraggingEndOnFrame`, also nur nach einem echten Drag. Der nächste Druck auf eine Body-Zelle ließ den Wert
   stehen, die erste Bewegung verschob die Spalte zur Spalte unter dem Zeiger (`changeColumnOrder`) und zeichnete sie
   als Drop-Zone.

**In der App nachgestellt** (echtes Frontend in Chromium über Playwright `page.mouse`, Mock-Backend): ruhiger
Doppelklick auf den Kopf „Modified“ → `mouse.down()` auf einer Zeile in der Namensspalte → in Schritten nach rechts aus
dem Fenster, **kein** `mouse.up()` → fünf `mousemove` ohne Taste über der Liste.

| | Reihenfolge der Köpfe | `.ge-table-drop-zone` |
|---|---|---|
| vorher | Name, Ext, Size, Modified | 0 |
| danach (1.1.105) | **Modified**, Name, Ext, Size | **20** (eine je sichtbarer Zeile) |
| danach mit dem Umweg der App (s. u.) | Name, Ext, Size, Modified | 0 |

Auf macOS im echten Tauri-Fenster beobachtet (Screenshot des Nutzers). Windows und Linux sind nicht geprüft, der
Mechanismus ist derselbe (`DoDragDrop` und GTK behalten die Maus ebenfalls).

## Stand in 1.1.118

- **Fehler 2 ist behoben** (Prompt 022, seit 1.1.110): `TableScope.onMouseDown` ruft `resetColumnDrag()`. Es gibt
  dazu einen Test für den Resize-Griff (`column-drag.realmouse.browser.spec.ts`: „a click on a resize handle, then a
  drag in the body: no column changes“), **keinen** für den Klick auf den Kopf (`drag-column`) – bitte ergänzen.
- **Fehler 1 besteht weiter.** Seit 1.1.108 hängt `onMouseDown` zwar einen einmaligen `mouseup`-Listener ans
  `document` (`onDocumentMouseUp`), aber ein nativer Drag liefert auch dort nichts. Aus dem Code gelesen (gegen 1.1.118
  **nicht** im Browser nachgestellt – das ist der erste rote Test):
  - `mouseDown` und `dragging` bleiben `true`; `isButtonDown()` meldet dauerhaft „gedrückt“ → `appendRows({ follow:
    "auto" })` folgt nicht mehr (`table-scope.ts`, `busy`).
  - `onMouseMove` nimmt den Drag-Zweig statt `mouseMoveOnFrame`: **kein Hover** mehr, und bei
    `selectionType "range"` zieht `selectionService.onMouseDragging` die Auswahl **ohne gedrückte Taste** hinter dem
    Zeiger her.
  - Das nächste `mousedown` wird ignoriert (`if (!this.dragging)`): `tableScope.onMouseDown` läuft nicht, ein
    Spalten-Resize oder -Move direkt danach tut nichts. Erst das `mouseup` dieses zweiten Drucks räumt auf.
  - Lag der hängende Druck auf einem Spaltenkopf oder Resize-Griff, läuft der Spalten-Drag ohne Taste weiter.

Dasselbe passiert bei jedem Weg, auf dem die Seite das `mouseup` verliert: nativer Drag aus Tauri/Electron
(`startDrag`), HTML5-Drag (`draggable` in einem Zell-Renderer: nach `dragstart` kommt `dragend`, kein `mouseup`),
`pointercancel`, ein Dialog des Systems, der mitten im Druck den Fokus nimmt.

## Wie die App es umgeht (files-and-folders-tauri, Branch `fix/table-press-nach-system-drag`, Commit `d34bfff`)

Zum Nachlesen dort: `src/app/features/browser/file-list/table-bridge.ts`, `file-list.ts`, Tests in
`table-bridge.spec.ts` und `file-list.spec.ts`.

1. **Press von außen beenden** – beim Übergeben an den System-Drag und bei `pointercancel` schickt die App der Tabelle
   ein `mouseup`, das nicht blubbert (damit es sonst niemand für einen Klick hält):

   ```ts
   export function releaseTableMouse(api: TableApi | undefined, x: number, y: number): void {
     api?.getTableScope().hostElement
       ?.dispatchEvent(new MouseEvent('mouseup', { button: 0, clientX: x, clientY: y }));
   }
   ```

2. **Keine `mousemove` an die Tabelle, solange eine Zeile gedrückt ist** (Listener am `window` in der Capture-Phase,
   `stopPropagation()`): Umweg für Fehler 2 in 1.1.105. Entfällt mit dem Upgrade auf ≥ 1.1.110.

Punkt 1 ist ein synthetisches Ereignis an einem privaten Detail (Listener am Host) – dafür fehlt ein API. Und eine App,
die den Fehler nicht kennt, hat ihn einfach.

## Teil A – Die Tabelle merkt selbst, dass die Taste los ist (Pflicht)

Ziel: Kein Zustand „gedrückt“ ohne gedrückte Taste, auch wenn kein `mouseup` kam – ohne Zutun der App.

Vorschlag:

- In `MouseHandler.onMouseMove` (und für den Wiedereintritt des Zeigers: `mouseenter`/`mouseover` am Host) prüfen:
  `this.mouseDown`, aber die Taste des Drucks fehlt in `evt.buttons` → den Druck beenden wie in `onMouseUp`, **bevor**
  die Bewegung verarbeitet wird; sie läuft dann als normales Hover.
- `pointercancel` (am `document`, wie `RowDragService`) beendet den Druck ebenfalls.
- Prüfen und im Zweifel mitnehmen: `dragstart` innerhalb des Hosts (HTML5-Drag aus einem Renderer) und `blur` des
  Fensters während eines Drucks.

Zu entscheiden (Empfehlung jeweils in Klammern, Begründung ins Design-Dokument oder in den Commit):

1. **Welche Taste?** `onMouseDown` unterscheidet heute nicht (auch ein Rechtsklick setzt `mouseDown`). Die Maske aus
   `evt.button` des Drucks ableiten (0 → 1, 1 → 4, 2 → 2) und genau diese in `evt.buttons` prüfen. (So.)
2. **Loslassen oder Abbrechen?** Ein verlorenes `mouseup` ist kein Drop an der letzten Stelle. (Spalten-Resize und
   -Move: **abbrechen** wie Escape – `cancelColumnDrag()`, Ende mit Typ `"cancel"`; Bereichsauswahl: stehen lassen,
   wie sie ist; `repaintAfterMouseUp` nachholen; **kein** `mouseClicked` aus `checkLostClick`.)
3. **Synthetische Ereignisse.** `new MouseEvent('mousemove')` hat `buttons: 0`. Viele Browser-Specs ziehen so
   (`mouse-handler.browser.spec.ts`, `selection.browser.spec.ts`, `rtl.browser.spec.ts`, `overlay`, `master-detail`,
   `live-append-review`, `perf-invariants`) – sie würden mit der Prüfung alle den Druck verlieren. (Prüfung für alle
   Ereignisse, die Specs bzw. ihr Helfer setzen `buttons: 1`; **nicht** auf `evt.isTrusted` ausweichen – Apps und
   Wrapper-Tests schicken ebenfalls synthetische Ereignisse, und zwei Verhalten sind schwerer zu testen. Vorher zählen,
   wie viele Stellen es trifft; `test-utils/wrapper-test-utils.ts` setzt `buttons` schon richtig.)
4. `RowDragService` arbeitet mit Pointer-Events und kennt `pointercancel` – kurz prüfen, ob dort dasselbe Loch ist
   (Zeile am Griff ziehen, `pointerup` verschlucken, Zeiger ohne Taste bewegen).

## Teil B – API: Druck beenden und abfragen (Pflicht, klein)

Eine App, die selbst einen nativen Drag startet, weiß den Zeitpunkt genau und soll nicht auf die nächste Mausbewegung
warten müssen (bis dahin meldet `isButtonDown()` falsch, Live-Daten folgen nicht).

Vorschlag, additiv, analog zu `cancelColumnDrag()` / `cancelRowDrag()`:

```ts
/** Ends the mouse press of the table when the mouseup never reaches the page (native drag, …). @since 1.1.119 */
tableApi.releaseMouse(): void;
/** true between mousedown and mouseup (or releaseMouse()). @since 1.1.119 */
tableApi.isMouseDown(): boolean;
```

`releaseMouse()` tut dasselbe wie der Weg aus Teil A (eine Funktion im `MouseHandler`, zwei Aufrufer), ohne Druck
nichts. `isMouseDown()` reicht `MouseHandler.isButtonDown()` durch. Namen sind ein Vorschlag – an die Nachbarn in
`table-api.ts` anpassen. Kein Wrapper-Code nötig (alle reichen die `TableApi` durch); in `instructions.md`, `llms.txt`
(Pitfall „eigener Drag aus der Tabelle heraus“) und den Wrapper-Anleitungen erwähnen.

## Tests (zuerst rot)

Echte Mauseingaben wie in Prompt 018 (`test-utils/real-mouse.ts`, Datei `*.realmouse.browser.spec.ts`, läuft mit
`pnpm test:browser:webkit` auch in WebKit – die App läuft in WKWebView). **Das verlorene `mouseup` nachstellen:** vor
`realMouse.up()` einen Listener am `window` in der Capture-Phase setzen, der `mouseup` mit
`stopImmediatePropagation()` schluckt (dann sieht es weder der Host noch `onDocumentMouseUp`), danach wieder entfernen.
Alle folgenden `realMouse.move` sind echte Bewegungen mit `buttons: 0`. Jeweils ltr und rtl.

Teil A:

1. **Body-Druck, `mouseup` verloren, Zeiger kommt zurück:** `isButtonDown()` ist nach der ersten Bewegung `false`;
   Hover folgt dem Zeiger wieder; `onMouseDragging` wird nicht mehr gemeldet; genau ein `onMouseDraggingEnd` (oder
   keins – festlegen und testen), kein `mouseClicked`.
2. **Der Fall der App:** ruhiger Klick auf einen verschiebbaren Spaltenkopf → Druck im Body → Bewegung → `mouseup`
   verloren → Bewegungen ohne Taste über anderen Spalten: Spaltenreihenfolge unverändert, kein
   `.ge-table-drop-zone` im DOM, kein `onColumnMoveStart`/`onColumnMoveEnd`.
3. **Derselbe Ablauf mit normalem `mouseup`** (Regression für Fehler 2, heute nur für den Resize-Griff getestet):
   Klick auf den Kopf, dann Drag im Body → keine Spaltenänderung.
4. **Druck auf dem Kopf, Spalte gezogen, `mouseup` verloren:** nach der ersten Bewegung ohne Taste ist der Move zu Ende
   (laut Entscheidung 2: alte Reihenfolge zurück, `onColumnMoveEnd` mit Typ `"cancel"`), kein Geist (`draggingColumn`
   versteckt), keine Drop-Zone, `isColumnDragging()` `false`.
5. **Dasselbe am Resize-Griff:** Breite laut Entscheidung 2, `onColumnResizeEnd` genau einmal, weitere Bewegungen
   ändern die Breite nicht.
6. **`selectionType "range"`:** Auswahl ziehen, `mouseup` verloren → Bewegungen ohne Taste erweitern die Auswahl nicht.
7. **Nächster Druck zählt wieder:** nach dem verlorenen `mouseup` ein Spalten-Resize mit echtem Drücken, Ziehen,
   Loslassen → wirkt (heute wird dieses `mousedown` ignoriert).
8. **Live-Daten:** verlorenes `mouseup`, dann `appendRows(rows, { follow: "auto" })` nach einer Bewegung ohne Taste →
   die Tabelle folgt wieder (Muster: `live-append-drag.realmouse.browser.spec.ts`).
9. **`pointercancel`** während eines Drucks beendet ihn (synthetisch am `document`).
10. **Kein falscher Alarm:** ein normaler Drag mit gehaltener Taste (Resize, Move, Bereichsauswahl), auch über den
    Rand des Hosts hinaus und zurück, läuft wie bisher – die bestehenden Realmouse-Specs bleiben unverändert grün.
11. **Rechte/mittlere Taste:** Druck mit Taste 2 und Bewegung mit `buttons: 2` ist kein Loslassen; Bewegung mit
    `buttons: 0` schon.

Teil B:

12. `releaseMouse()` nach verlorenem `mouseup`, **ohne** jede Mausbewegung: `isMouseDown()` `false`, laufender
    Spalten-Move/-Resize beendet wie in 4/5, `appendRows` folgt sofort.
13. `releaseMouse()` ohne Druck: nichts passiert, kein Ereignis. Ein echtes `mouseup` **nach** `releaseMouse()` meldet
    nichts doppelt (kein zweites `onMouseDraggingEnd`, kein zweites Spalten-Ende).
14. `releaseMouse()` im Handler von `onMouseDragging` bzw. `onColumnMoveStart` (die App startet dort ihren nativen
    Drag) – kein Fehler, Zustand sauber.
15. Zerstörte Tabelle: `releaseMouse()` wirft nicht.

Dazu: angepasste synthetische Specs (Entscheidung 3) bleiben grün; `pnpm --filter @guiexpert/table test:unit`,
`test:browser`, `test:browser:scrollbars`, `test:browser:webkit`; Performance-Invarianten (Prompt 021) unverändert –
die Prüfung in `onMouseMove` ist ein Vergleich je Ereignis, kein Layout.

## Nicht Teil dieses Prompts

- Ein eigener Weg der Tabelle, Zeilen in andere Programme zu ziehen – das bleibt Sache der App.
- Umbau des `MouseHandler` auf Pointer-Events (wäre die saubere Lösung mit `setPointerCapture`, ist aber ein eigener,
  größerer Schritt – als Folgepunkt in `TODO.md` notieren, falls sinnvoll).

## Fertig, wenn

- Tests 1–15 erst rot, dann grün; alle bestehenden Tests grün (ltr und rtl, Chromium und WebKit).
- `instructions.md`, `llms.txt`, `CLAUDE.md` (§3.6 Interaktion) und `TODO.md` aktualisiert; Zeile in
  `prompts/README.md` auf „umgesetzt“ mit Branch und Zielversion.
- Release-Block (Phase 10) auf Anweisung. Für files-and-folders-tauri in die Release-Notes: nach dem Upgrade ersetzt
  `tableApi.releaseMouse()` das synthetische `mouseup` in `releaseTableMouse` (`table-bridge.ts`), und der
  `mousemove`-Filter `onPressMouseMove` (`file-list.ts`) entfällt.
