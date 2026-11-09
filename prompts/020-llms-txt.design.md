# 020 – `llms.txt` als Nutzungsanleitung: Gliederung, Befund, Entscheidungen, Gegenprobe

> Zu `prompts/020-llms-txt-nutzungsanleitung.md`. Branch `docs/llms-txt` (gestapelt auf 018, 021, 019). Marc hat
> 016 → 018 → 021 → 019 → 020 am 09.11.2026 „selbständig“ beauftragt – der Haltepunkt nach Phase 1 entfällt.
> 018 und 019 sind umgesetzt (1.1.108) und in `llms.txt` beschrieben.

## Gliederung (umgesetzt, Root `llms.txt`, ~570 Zeilen, Englisch, Format llmstxt.org)

1. H1 + Blockquote (was die Tabelle ist), kurze Lesehilfe („code wins“, Tippfehler-APIs, keine erfundenen APIs)
2. **Packages**
3. **How to use – recipes** R1–R17 (Konzepte in einem Absatz; je Rezept: Frage → kürzester Code → Warum/Falle → Verweis)
   – R6 mit Entscheidungstabelle der Update-Wege und Ticker-Beispiel (Flash-Klassen), R7 rollendes Log (019)
4. **Pitfalls** (Symptom → Ursache → Lösung), zuletzt „Invented APIs“ (`getSelectedRows()`, `onKeyDown`, `api.addRow()`,
   `api.refresh()`, `setData()`, `gridOptions`, `rowData`)
5. **Quick answers (FAQ)** (die bisherigen Kurzantworten)
6. **Feature reference** – die bisherigen Feature-Zeilen unverändert (keine Information verloren)
7. **Documentation and links**, **Notes for LLMs**

## Befund

| # | Befund | Ergebnis |
|---|---|---|
| B1 | kein Tastatur-Event in `EventListenerIf`, `GeKeyEvent` nie gemeldet | **bestätigt**. Weg: `keydown` am Host + `tableApi.getActiveCell()` (Test `usage-recipes.browser.spec.ts`: Entf löscht die fokussierte Zeile). Jede Tabelle hat einen eigenen `FocusModel("cell")` – kein Setup nötig. 019 hat bewusst kein Event gebaut (App-Muster). Vorschlag `onKeyDown?` in `TODO.md` |
| B2 | `addRows`/`addRowsAt`/`removeRows` O(n), setzen Filter/Sortierung zurück | bestätigt; Spread-Literal überläuft den Stack **nicht** (nur `push(...rows)`); Rezept R7 verweist auf `appendRows` |
| B3 | `externalFilterChanged` leert Auswahl, scrollt nach oben | bestätigt (Test); Pitfall + Wiederherstellung über State-API mit `getRowId` |
| B4 | Index von `updateCells` | **angezeigter** Index (nach Filter/Sortierung), schreibt in dieses Zeilenobjekt (Test); in R6 und FAQ 6.26 |
| B5 | `instructions.md` 6.5: „`scroll` not forwarded by the React wrapper“ | **falsch** – React reicht `scroll` weiter (`guiexpert-table.tsx`); korrigiert |
| B6 | JSDoc mit `new TableApi(tableScope)` | 4 Stellen in `table-api.ts` → `tableScope.getApi()`; `docs:check` grün |
| B7 | keine Komfort-Methode `getSelectedRows()` | bestätigt; Rezept R5 (`getMergedRowIndices` → `getRowByIndex`, Test); Vorschlag in `TODO.md` |
| B8 | Website-`llms.txt` eigene, veraltete Fassung | ersetzt durch die Root-Datei (Kopie per `pre:build`) |
| neu | `getSelectionAggregates()` summiert alle numerischen Zellen der Auswahl (alle Spalten) | in R5 erklärt; Parameter-Vorschlag in `TODO.md` |
| neu | Selektionstyp-Default `"none"` | Pitfall (Test) |

## Entscheidungen

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Aufbau | **(a) eine Datei**, ~570 Zeilen (< 700); Feature-Zeilen unverändert als „Feature reference“ ans Ende |
| 2 | Website-`llms.txt` | **dieselbe Datei**: `pre:build` kopiert `../../llms.txt` nach `public/llms.txt` (die Kopie bleibt eingecheckt, damit der Stand im Repo sichtbar ist). Kein Deploy |
| 3 | npm-Paket | **ja**: `packages/table/vite.config.ts` kopiert `llms.txt` nach `dist/` → `node_modules/@guiexpert/table/llms.txt`; README „Quick answers“ verweist darauf |
| 4 | Snippet-Prüfung | **Skript** `scripts/check-llms-snippets.mjs`, Root `pnpm check:llms`, CI-Schritt in `test-core.yml` (nach `docs:check`). Jeder ```` ```ts ````-Block einzeln, `tsc --strict` gegen `packages/table/src`, CSS-Imports entfernt; Gegenprobe: eine erfundene Methode wird mit Datei:Zeile gemeldet |
| 5 | Framework-Snippets | nur Anzeige (```` ```tsx ````); ```` ```ts ````-Blöcke mit Framework-Import würden übersprungen und gezählt. Der React-Code der Gegenprobe wurde gegen `packages/react-table/src` kompiliert |

## Gegenprobe mit fremden Subagenten (nur `llms.txt`, kein Repo)

Runde 1 (3 Agenten, Sonnet), Ergebnis mit `tsc --strict` gegen `packages/table/src` (React gegen `packages/react-table/src`):

| Aufgabe | kompiliert | erfundene API / Neuaufbau / verlorene Auswahl | Unklarheiten → Änderung an `llms.txt` |
|---|---|---|---|
| 1 50.000 Bestellungen, Mehrfach-Zeilenauswahl, Summe der Auswahl | ja | keine | `onSelectionChanged`-Satz war kaputt („React with …“), Zeitpunkt/Argument unklar → Satz neu, Argument und Zeitpunkt genannt; Kosten von `getMergedRowIndices` |
| 2 Entf löscht fokussierte Zeile, Enter loggt | ja | keine | Default-Fokusmodell unbekannt (Agent baute ein Selektionsmodell dafür), Reihenfolge eigener/eingebauter Tasten, Konflikt Entf mit `editing`, `removeRows`-Kosten → Absätze in R4 |
| 3 rollendes Log, 1 Mio., Freeze/Scroll to end, Klick/Taste anzeigen | ja | keine (`appendRows`, `getActiveCell`) | Bedeutung von `shown`, `follow: false` beim Ringpuffer, leere Tabelle = am Ende → R7 ergänzt |
| 4 Ticker, 50 Preise/100 ms, grün/rot | ja | keine (`updateCells` + `cssClasses`) | Lebensdauer der `cssClasses` (Flash), beide Richtungen setzen, CSS → R6 mit Ticker-Beispiel |
| 5 React: Klick öffnet Seitenpanel | ja | kein Neuaufbau (`useMemo`) | Inline-Callback-Props erlaubt?, Debounce in React?, Größe → R2 ergänzt |

Runde 2 (1 Agent, Ticker + eigene Tasten inkl. Strg/⌘+S): beide Lösungen kompilieren, richtige APIs (`updateCells`
mit beiden Klassen-Richtungen, `keydown` + `getActiveCell`, `preventDefault` für Strg/⌘+S), keine erfundene API. Noch
offen waren nur Kleinigkeiten (Rückgabe/Repaint von `removeRows`, Fokus danach, Werte ohne Renderer) → in R1/R4
nachgetragen. Keine dritte Runde nötig.

Laufzeit: der Kern von Aufgabe 2 (Entf löscht die fokussierte Zeile) und B4/B7 laufen als Browser-Spec
(`usage-recipes.browser.spec.ts`); Aufgabe 3 entspricht dem Showcase `logtail` (gleiche Aufrufe, im Browser geprüft).
