# 016 – Bugfix: Browser-Tests auf macOS grün, Scrollbalken der Angular-Demo

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Regeln, Phase 10 =
> Release-Block). Kein Feature, kein API-Entwurf, **kein Haltepunkt** – aber jede Code-Änderung am Core folgt der Regel
> „zuerst ein roter Test“. Branch: `fix/macos-tests-angular-demo-scrollbar`.

## Ziel

1. **Teil A:** In `pnpm serve:angular-table-demo` lässt sich der senkrechte Scrollbalken auf `/demo/simple` wieder
   ziehen (heute reagiert er nicht, auf `/demo/mouseevent` schon).
2. **Teil B:** `pnpm --filter @guiexpert/table test:browser` **und** `test:browser:scrollbars` sind auf **macOS**
   genauso grün wie in der CI (Linux). Heute: 16 rote Tests lokal auf dem Mac, CI grün.

Fertig = beide Befehle auf dem Mac 0 rot, CI weiter grün, Demo-Scrollbalken bedienbar, `TODO.md` aktualisiert,
Release-Block (Phase 10).

---

## Teil A – Angular-Demo: Scrollbalken reagiert nicht

### Befund (Analyse vom 04.11.2026, gemessen in der laufenden Demo)

- `apps/angular-table-demo` nutzt **npm-Pakete 1.1.102** (`@guiexpert/table`, `@guiexpert/angular-table@^17.1.102`,
  `@guiexpert/demo-table-models`), nicht den Mono-Repo-Code (`TODO.md` „Angular-Demo an lokale Builds koppeln“).
- `/demo/simple` = `generateSimpleModel(1000, 100)` mit **`fixedRightColumnCount: 2`**. Bis 1.1.103 reichte die
  East-Area bis an den Host-Rand und lag **über** dem klassischen Scrollbalken (macOS mit Maus, Windows, Linux):
  `elementFromPoint` auf dem Balken liefert `.ge-table-label` der East-Spalte statt `.ge-table-scroll-viewport`
  (Balkenbreite 15 px, East `right` = Viewport `right` = 1024). Klicks/Ziehen landen in der Zelle.
- `/demo/mouseevent` hat keine East-Spalten → der Balken ist frei.
- Im Core behoben in **1.1.104** (Commit `c0a3bf7` „scrollbar fix“: `getLayoutWidth()`/`getLayoutHeight()`, East neben
  dem Balken, Spec `scroll-bars.scrollbars.browser.spec.ts`). Auf npm liegen `@guiexpert/table@1.1.105` und
  `@guiexpert/angular-table@17.1.105`.

### Auftrag

1. **Regressionstest im Core** (fehlt bisher): in `scroll-bars.scrollbars.browser.spec.ts` (läuft nur mit klassischen
   Balken) je Richtung prüfen, dass `document.elementFromPoint` auf der Mitte des senkrechten Balkens – mit
   fixierten East-Spalten und mit Footer – das `scrollViewport` trifft, ebenso auf dem waagerechten Balken unter den
   West-/East-Spalten. Gegen `c0a3bf7^` muss er rot sein (kurz per `git stash`/Checkout prüfen und im PR erwähnen),
   mit dem heutigen Code grün.
2. **Demo anheben** – erst die kleine Lösung: die drei Abhängigkeiten in `apps/angular-table-demo/package.json` auf
   `^1.1.105` bzw. `^17.1.105` (bzw. die dann aktuelle Version), `pnpm i`. **Lockfile-Diff prüfen**: nur diese drei
   Einträge dürfen sich ändern (Abhängigkeits-Fallen in `CLAUDE.md` §2 – kein Babel 8, kein zweites Angular, kein
   `zone.js@0.16`). Ändert sich mehr: zurückdrehen und Marc fragen.
   Die große Lösung (Demo an `workspace:`-Core + `angular-builds/ng17/dist` koppeln) ist ein eigener TODO-Punkt –
   nur umsetzen, wenn sie ohne Lockfile-Umbau geht; sonst den TODO-Punkt um diesen Befund ergänzen.
3. `apps/angular-table-demo/.angular` löschen, `pnpm serve:angular-table-demo`, `/demo/simple` öffnen und mit
   `elementFromPoint` (wie oben) plus echtem Ziehen am Balken prüfen; `/demo/mouseevent` gegenprüfen.

---

## Teil B – 16 Browser-Tests, die nur auf macOS rot sind

### Befund

CI (`ci.yml` → `test-core.yml`, Linux) ist grün. Lokal auf dem Mac (Chromium von Playwright,
`navigator.platform` = `"MacIntel"`) sind in `test:browser` und `test:browser:scrollbars` dieselben 16 Tests rot.
Ursache in allen Fällen vermutlich: **Der Core verhält sich auf macOS anders (gewollt), die Tests nehmen
Windows/Linux an.** Der Core fragt die Plattform an drei Stellen ab:
`action/shortcut.service.ts:102` (`isMacintosh`), `fill/fill-handle-service.ts:140`,
`sheet-editing/cell-editor-service.ts:509` (`isMac`) – auf macOS gelten ⌘-Kürzel (`Meta+D` statt `Control+D`, ⌘C/⌘X/⌘V,
⌘Z/⌘⇧Z, ⌘↓ …), und ⌥+Buchstabe ist dort Texteingabe.

| # | Spec (`packages/table/src/lib/table/…`) | Test | Meldung auf macOS |
|---|---|---|---|
| 1 | `aria/aria.browser.spec.ts:1244` | fill handle and batch edit (1.1.96): handle and preview hidden, keyboard shortcuts … | `'Meta+D Meta+R'` statt `'Control+D Control+R'` |
| 2 | `clipboard/clipboard.browser.spec.ts:484` | Ctrl+C / Ctrl+X / Ctrl+V focus the hidden text field … | Fokus bleibt am Host, nicht am `textarea`-Proxy (Strg+C ist auf dem Mac kein Kopieren) |
| 3 | `clipboard/clipboard.browser.spec.ts:508` | a real Ctrl+C in the browser fills the clipboard event | `''` statt `'N1\t1.5'` (`userEvent.keyboard('{Control>}c…')`) |
| 4 | `fill/fill-batch.browser.spec.ts:140` | fill handle > sits on the bottom right corner … | `aria-keyshortcuts` `Meta+…` |
| 5 | `fill/fill-batch.browser.spec.ts:260` | direction "vertical": dragging right fills nothing | `'Meta+D'` statt `'Control+D'` |
| 6 | `fill/fill-batch.browser.spec.ts:401` | Ctrl+D copies the top row of the range down | `defaultPrevented` false (Strg+D mit `ctrlKey`) |
| 7 | `fill/fill-batch.browser.spec.ts:410` | Ctrl+D on one row copies the cell above; Ctrl+R … | `'Item 2'` statt `'Item 1'` |
| 8 | `fill/fill-batch.browser.spec.ts:840` | switching the fill handle off at runtime removes handle and aria-keyshortcuts | `Meta+…` |
| 9 | `fill/fill-batch.browser.spec.ts:862` | Ctrl+D on one row: one selection event with the unchanged range | kein Selektions-Event |
| 10 | `sheet-editing/sheet-editing-options.browser.spec.ts:384` | select editor: no matching value …; Alt+↓ opens the list … | `''` statt `'Name 3'` |
| 11 | `sheet-editing/sheet-editing-options.browser.spec.ts:663` | Alt+letter is left to the page (access keys); Shift+arrows in the header … | `true` statt `false` (⌥+Buchstabe tippt auf dem Mac) |
| 12 | `sheet-editing/sheet-editing.browser.spec.ts:284` | E12: Ctrl+↓ jumps to the end of the block …; Ctrl+Shift+↓ extends | `[0, 1]` statt `[2, 1]` |
| 13 | `sheet-editing/sheet-editing.browser.spec.ts:527` | the old in-cell editor keeps the typed text over a repaint | `'xyz'` statt `'Name 3xyz'` (`{End}` bewegt auf dem Mac den Cursor im Input nicht; ⌘→ wäre richtig) |
| 14 | `undo/undo.browser.spec.ts:76` | U1: edit, Ctrl+Z: the old value, focus and selection … | `7` statt `30` |
| 15 | `undo/undo.browser.spec.ts:125` | U4: Ctrl+Y and Ctrl+Shift+Z redo | `'N0'` statt `'x'` |
| 16 | `undo/undo.browser.spec.ts:303` | the old in-cell editor and a double click are recorded too | `'newN2'` statt `'new'` (Text nicht ersetzt, vermutlich `{End}`/Markierung) |

Zusätzlich gesehen (einmal, nicht reproduzierbar): `mouse-handler.browser.spec.ts` „dragging a ColumnDef without
limits is not limited“ im Projekt `browser-scrollbars` rot, einzeln 3× grün → auf Wackeln prüfen (z. B. 20× mit
`--repeat`/Schleife), bei Bestätigung Ursache beheben (keine festen Zeiten, `vi.waitFor`), sonst als `// NOTE:` notieren.

### Auftrag

1. **Jeden der 16 Fälle einordnen**, bevor etwas geändert wird – in einer Tabelle im PR:
   - **(a) Test nimmt Windows/Linux an, Core auf dem Mac richtig** (erwartet: #1–#9, #12, wahrscheinlich #13, #16):
     Test plattformneutral machen.
   - **(b) echter Fehler auf macOS** (Core verhält sich auf dem Mac falsch oder anders als dokumentiert,
     `instructions.md` 6.20–6.25, `ShortcutService`-Mappings): **zuerst** ein Test, der auf dem Mac rot ist, dann der
     Fix im Core, Eintrag in `TODO.md` „Gefunden durch die Unit-Tests“. Kandidaten: #10, #11, #14, #15 – genau prüfen,
     ob z. B. ⌘Z bzw. ⌘⇧Z/⌘Y das Richtige tun und ob ⌥+↓ den Select-Editor öffnen soll.
   - Was nicht eindeutig ist: Marc fragen, nicht raten.
2. **Plattform im Test bestimmbar machen** – ein Helfer in `packages/table/test-utils/` (z. B. `platform.ts`):
   `isMacPlatform()`, `primaryModifier()` (`'Meta'` | `'Control'`), `primaryKeyInit()` (`{ metaKey: true }` bzw.
   `{ ctrlKey: true }` für `new KeyboardEvent`), `ariaShortcut('D')` (`'Meta+D'` | `'Control+D'`), `userEventPrimary('c')`
   (`'{Meta>}c{/Meta}'` | `'{Control>}c{/Control}'`), `lineEndKeys()` (`'{Meta>}{ArrowRight}{/Meta}'` | `'{End}'`).
   Gleiche Erkennung wie der Core (`navigator.platform` enthält `"Mac"`).
3. **Beide Plattformen in jedem Lauf testen**, nicht nur die des Rechners: wo sinnvoll `describe.each(['mac', 'other'])`
   und `navigator.platform` per `vi.spyOn(navigator, 'platform', 'get')` setzen (vor `mountTable` – `ShortcutService`
   liest es beim Aufbau bzw. je Taste; prüfen!). Dann deckt die Linux-CI auch die Mac-Kürzel ab und umgekehrt.
   Ausnahmen: Tests mit **echten** Browser-Tasten (`userEvent.keyboard`, #3, #13, #16), bei denen das Verhalten des
   Browsers selbst plattformabhängig ist – dort die Tasten der echten Plattform nehmen (Helfer aus 2.).
4. **Core-Erkennung bündeln** (nur falls es ohne API-Änderung geht): die drei `navigator.platform`-Abfragen in eine
   interne Funktion (z. B. `common/platform.ts`, `@internal`, nicht in `index.ts`), damit Tests sie an **einer** Stelle
   steuern. `navigator.platform` ist veraltet – `navigator.userAgentData?.platform` als Vorrang erwägen, Verhalten
   bit-gleich lassen.
5. **CI absichern**: prüfen, ob ein macOS-Job in `test-core.yml` (z. B. Matrix `ubuntu-latest` + `macos-latest`, nur
   `test:browser`) sinnvoll ist; Laufzeit/Kosten im PR nennen und **Marc entscheiden lassen**, nicht eigenmächtig
   einbauen.
6. **Verifikation**: auf dem Mac `pnpm --filter @guiexpert/table test` (Unit + Browser),
   `test:browser:scrollbars`, `test:types`, `test:unit --sequence.shuffle`; bei Core-Änderungen an JSDoc
   `docs:check`. Ergebnis: 0 rot (außer bewusst `it.fails` mit `// BUG:`).
7. **Doku**: `CLAUDE.md` §6 (Browser-Specs) um die Regel „Tastenkürzel nie hart `ctrlKey`/`Control` – Helfer aus
   `test-utils/platform.ts`; Mac und andere per `describe.each`“ ergänzen; `TODO.md` (Angular-Demo-Punkt, ggf. neue
   Befunde).

## Nicht tun

- Tests nicht mit `it.skip`/`it.skipIf(isMac)` stilllegen – sie sollen auf beiden Plattformen etwas prüfen.
- Keine Mac-Kürzel im Core ändern, nur damit Tests grün werden (Mac-Anwender erwarten ⌘).
- Kein Release ohne Marc (Phase 10: Block nennen, nicht ausführen).
