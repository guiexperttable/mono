# Folge 09 – „Zeilen per Drag & Drop sortieren – mit Maus, Touch und Tastatur“

**Problem:** Eine Prioritätenliste, eine Playlist, die Schritte eines Ablaufs – die Nutzer wollen die Reihenfolge selbst
bestimmen. Selbst gebaut heißt das: Pointer-Events, Geisterbild, Einfügemarke, automatisches Scrollen am Rand (bei
virtuellem Scrollen!), Escape, Touch – und eine Tastatur-Alternative für alle, die nicht ziehen können.
**Kernbotschaft:** Ein Flag – `rowDrag: true` – und die Zeilen lassen sich ziehen: Maus, Touch, Stift, Strg+Alt+↑/↓.
Auch bei 10.000 Zeilen (Auto-Scroll). MIT-lizenziert, null Abhängigkeiten.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Zeilen per Drag & Drop sortieren – mit Maus, Touch und Tastatur“ · „Prioritätenliste in 60
Sekunden“ · **kein** „ohne Enterprise-Lizenz“: Row Dragging ist bei ag-Grid Community (`RowDragModule` aus
`ag-grid-community`, geprüft auf ag-grid.com, 15.10.2026). Baumdaten (Tree Data), in denen man bei uns ebenfalls zieht,
sind bei ag-Grid Enterprise – vor einer solchen Aussage im Video auf ag-grid.com nachprüfen.

## Voraussetzung

`@guiexpert/table` **1.1.95** (Branch `feat/row-drag`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html`: Liste mit 10.000 Aufgaben, Maus kreist über Zeile 5 | „Die Chefin sagt: ‚Das hier zuerst!‘ – und Ihre Tabelle kann keine Zeilen verschieben.“ |
| 8–25 s | `snippet.ts`, Zeilen 5–9 hervorheben, dann Zeile 8 | „Ein Flag: `rowDrag: true`. Jede Zeile bekommt einen Griff.“ |
| 25–40 s | Zeilen 10–13 | „Nach dem Ablegen meldet die Tabelle, wohin – hier speichern Sie die neue Reihenfolge.“ |
| 40–55 s | `demo.html`: Zeile 5 an den Griff fassen, nach oben auf Platz 1 ziehen (Geisterbild + blaue Linie) → Log „… → Platz 1“; zwei Zeilen mit Strg-Klick wählen und gemeinsam ziehen; an den unteren Rand ziehen → Tabelle scrollt von selbst; Escape; eine Zelle anklicken, **Strg+Alt+↓** zweimal; „nach Stunden sortieren“ → Griffe grau; Haken **dunkel** | „Ziehen, ablegen, fertig. Mehrere Zeilen auf einmal. Am Rand scrollt die Tabelle mit – auch durch 10.000 Zeilen. Escape bricht ab. Und ohne Maus: Strg+Alt+Pfeil. Sortiert? Dann ist Ziehen gesperrt – sonst wüsste niemand, was ‚Platz 3‘ heißt.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/showcase/rowdrag · „MIT“ | „Maus, Touch, Tastatur. Ein Flag. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 15 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 10.000 erzeugten Aufgaben, dazu Sortier-Knöpfe, Dark-Mode-Schalter
und eine Log-Zeile.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/09-zeilen-ziehen/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: Zeile 5 → Platz 1 → Strg-Klick auf 3 und 4, eine davon ziehen → an den unteren
   Rand ziehen (scrollt), Escape → Zelle anklicken, Strg+Alt+↓ ×2 → „nach Stunden sortieren“ (Griffe grau) →
   „Sortierung weg“ → dunkel.
4. Touch zeigen (optional): Chrome DevTools → Gerätesymbolleiste, dann mit der Maus „tippen und ziehen“.
5. Alternativ englisch mit Baum: `pnpm serve:table-demo` → `http://localhost:4200/row-drag.html` oder der Showcase
   `/showcase/rowdrag/run` (`pnpm serve:webpage-guiexpert`).

## Fakten-Check (für Beschreibungstext)

- API: `ColumnDef.rowDrag: true | (row, rowIndex) => boolean` bzw. `TableFactory.createTableModel({ rows, rowDrag: true })`
  (Griff in der ersten Datenspalte); Optionen `tableOptions.rowDragOptions` (`managed`, `multiRow`, `treeDropInside`,
  `dragThresholdInPx`, `autoScrollZoneInPx`, `autoScrollMaxSpeedInPx`, `ghostText`).
- Events `onRowDragStart` / `onRowDragMove` / `onRowDragEnd` (`GeRowDragEvent`: `rows`, `rowIndices`, `target`,
  `toIndex`, `moved`, `outside`, `source`); in allen Wrappern `rowDragStart` / `rowDragMove` / `rowDragEnd`.
- managed (Default): die Tabelle verschiebt die Zeilen im Array der Anwendung (in place) – nur unsortiert und
  ungefiltert; `managed: false`: nur Events, die Anwendung verschiebt (`tableApi.moveRows()`).
- Pointer Events (Maus, Touch, Stift), Auto-Scroll am Rand, Escape, mehrere ausgewählte Zeilen, Baum (davor/dahinter/
  hinein, keine Zyklen). Tastatur: Strg+Alt+↑/↓ (macOS ⌃⌥↑/↓), Ansage für Screenreader.
- Nicht enthalten: Ziehen in eine **andere** Tabelle (nur Event mit `outside: true`), Gruppenwechsel bei Row Grouping.
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Showcase: https://gui.expert/showcase/rowdrag/run · Training: Kapitel 23, Abschnitt „Dragging rows into order“ (nach
  dem Website-Deploy).
