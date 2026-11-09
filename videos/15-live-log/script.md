# Folge 15 – „Live-Log mit 1 Mio. Zeilen: anhängen, Auswahl bleibt, Freeze und Scroll to end“

**Problem:** Ein Log-Viewer im Browser: tausende neue Zeilen pro Sekunde. Mit „alle Zeilen neu setzen“ wird jedes Update
teurer, die Auswahl springt weg, Klicks gehen verloren, die Ansicht hüpft.
**Kernbotschaft:** `tableApi.appendRows(lines, { follow: "auto", maxRows })` – in place, O(k) je Update, ein Render.
Auswahl und Fokus bleiben an ihren Zeilen, Freeze und Scroll to end sind je eine Zeile. MIT-lizenziert, null
Abhängigkeiten, in jedem Framework.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Live-Log mit 1 Mio. Zeilen“ · „tail -f im Browser – 5.000 Zeilen pro Sekunde“ · „Log-Viewer in
60 Sekunden: Freeze und Scroll to end“. **Kein** „ohne Enterprise-Lizenz“: ag-Grid hat Transactions
(`applyTransactionAsync`) in der Community-Version – vor der Veröffentlichung auf ag-grid.com gegenprüfen.

## Voraussetzung

`@guiexpert/table` **1.1.108** (Branch `feat/live-append`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html` bei 5.000 Zeilen/s, die Zeilen rollen | „Ein Log mit fünftausend neuen Zeilen pro Sekunde. Bis zu einer Million Zeilen im Browser.“ |
| 8–30 s | `snippet.ts`, Zeilen 9–12 hervorheben | „Eine Methode: `appendRows`. `follow: "auto"` bleibt am Ende, wenn man am Ende ist – wie `tail -f`. `maxRows` ist der Ringpuffer.“ |
| 30–40 s | Zeile 14 | „Scroll to end: eine Zeile. Freeze: `follow: false`.“ |
| 40–55 s | `demo.html`: eine ERROR-Zeile anklicken (Anzeige unten zeigt die Zeile), „Freeze scroll“ → Ansicht steht, „+N neue Zeilen“ zählt; ↓ – die Auswahl wandert; „Scroll to end“ → folgt wieder; Haken **dunkel** | „Ein Klick kommt an, auch während die Tabelle rendert. Freeze – die Ansicht steht, die Auswahl bleibt an ihrer Zeile. Scroll to end – und es läuft weiter.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/showcase/logtail · „MIT“ | „Live-Daten ohne Ruckeln. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 15 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit erzeugten Log-Zeilen; dazu (nicht im Snippet) Rate, Zähler,
„+N neue Zeilen“, Klick-Anzeige und Dark-Mode.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/15-live-log/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: rollen lassen → ERROR-Zeile klicken → Freeze → ↓ ↓ → Scroll to end → dunkel.
4. Englische Variante mit Event-Anzeige (Maus und Tastatur): `pnpm serve:table-demo` →
   `http://localhost:4200/log-tail.html` oder der Showcase `/showcase/logtail/run` (`pnpm serve:webpage-guiexpert`).

## Fakten-Check (für Beschreibungstext)

- API: `tableApi.appendRows(rows, { follow?: "auto" | true | false, maxRows? })` → `{ added, shown, removed, following }`;
  eigenes Area-Modell: `tableApi.rowsAppended(count, { follow, removedAtStart })`.
- In place (das Array der App), O(k) je Update; Filter nur für neue Zeilen, Sortierung fügt per Binärsuche ein.
- Auswahl, Fokus, Shift-Anker bleiben an ihren Zeilen; Klicks kommen auch an, wenn die Tabelle zwischen Drücken und
  Loslassen rendert (1.1.108).
- Ringpuffer entfernt in Blöcken ≥ 1 % (`maxRows` … 99 %).
- Messung (Mac, Chromium, 500 Zeilen je Update, Ringpuffer): 100.000 und 2.000.000 Zeilen gleich schnell (~3–4 ms je
  Update inkl. Render, folgend; ~0,4 ms für einen Leser mitten im Log – keine Zelle neu gebaut).
