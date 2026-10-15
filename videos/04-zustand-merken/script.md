# Folge 04 – „Spalten anpassen, neu laden – alles noch da“

**Problem:** Der Nutzer zieht Spalten breiter, schiebt „Summe“ nach vorn, blendet „Stadt“ aus, sortiert – und nach dem
Neuladen ist alles wieder wie vorher. Jeden Morgen dieselbe Arbeit.
**Kernbotschaft:** Fünf Zeilen Optionen, und die Tabelle merkt sich ihr Layout: Breite, Reihenfolge, ausgeblendete
Spalten, Sortierung – nach Property gespeichert, nicht nach Position. Oder als JSON auf dem eigenen Server.
Null Runtime-Abhängigkeiten, ein Core für alle Frameworks, MIT-lizenziert (kostenlos auch kommerziell).
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Backlog:** CLAUDE.md § 10, Folge 19 (erweitert um Spaltenlayout und State-API).

## Voraussetzung

`@guiexpert/table` **1.1.92** (Branch `feat/table-state`). Vor der Aufnahme: `pnpm build:core`.
Kein Titel „ohne Enterprise-Lizenz“: „Grid State“ (`getState`, `initialState`) gibt es bei ag-Grid auch in der
Community-Version – sachlich bleiben, der Punkt ist „fünf Zeilen, nach Property, auch auf dem Server“.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html`: Spalte „summe“ breiter ziehen, nach vorn ziehen, „stadt“ ausblenden – **F5** → alles weg (mit einer Tabelle ohne `autoRestoreOptions`, z. B. `localStorage` vorher leeren und die Optionen auskommentieren) | „Spalten angepasst, Seite neu geladen – alles weg.“ |
| 8–30 s | `snippet.ts`, Zeilen 4–12 hervorheben | „Ein Schlüssel pro Tabelle, und dann sagen wir, was sie sich merken soll: Spaltenlayout und Sortierung.“ |
| 30–40 s | `snippet-server.ts` (kurz einblenden) | „Lieber pro Benutzer auf dem Server? `onStateChanged` liefert den Zustand als JSON, `initialState` gibt ihn zurück.“ |
| 40–55 s | `demo.html`: breiter ziehen, „summe“ nach vorn, doppelklick „summe“ (sortiert), „stadt“ aus – **F5** → alles noch da; unten das JSON im `localStorage`; **Layout zurücksetzen** | „Neu laden – alles noch da. Gespeichert nach Property, nicht nach Position: auch eine verschobene Spalte bleibt richtig sortiert.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/training/persist-state · „MIT“ | „GuiExpert Table – MIT, für jedes Framework.“ |

## Code (im Video)

`snippet.ts` – 15 Zeilen, `snippet-server.ts` – 11 Zeilen; beide kompilieren gegen die echte API (`tsc --strict`,
`paths` auf `packages/table/src`, Top-level `await` → `module: esnext`). `demo.html` führt denselben Code aus (plain
JS), ersetzt `fetch` durch erzeugte Zeilen und zeigt unten den gespeicherten Eintrag.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/04-zustand-merken/demo.html`
3. Vorher in den DevTools `localStorage.clear()`. Browser-Zoom ~150 %.
4. Alternativ mit Hot Reload und JSON-Panel: `pnpm serve:table-demo` → `http://localhost:4200/state.html` (englisch,
   zusätzlich Zeilen-Auswahl und Scroll-Position).

## Fakten-Check (für Beschreibungstext)

- Optionen: `autoRestoreOptions` mit `autoRestoreColumnLayout`, `autoRestoreSortingState`, `autoRestoreScrollPosition`,
  `autoRestoreCollapsedExpandedState`, `autoRestoreCheckedState`, `autoRestoreSelectedState`,
  `autoRestoreHeaderGroupState`, `autoRestoreCustomState`; Speicher `storage` (Default `localStorage`).
- API: `tableApi.getState(parts?)`, `applyState(state, parts?)`, `resetState()`, `setCustomState()`;
  `tableOptions.initialState`; Event `onStateChanged` (`GeStateChangeEvent`) bzw. `stateChanged` in allen Wrappern.
- Spalten nach Property, Zeilen nach `getRowId` – keine Zellwerte im Speicher (Ids können personenbezogen sein).
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Training: https://gui.expert/training/persist-state/ (nach dem Website-Deploy).
