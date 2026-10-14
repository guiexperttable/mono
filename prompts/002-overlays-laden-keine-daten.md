# TODO-Prompt 002: Overlays „Lädt…“ und „Keine Daten“ (plain HTML/CSS)

> Status: **offen** · angelegt 14.10.2026 · Slug `overlays` (Branch `feat/overlays`, Design `prompts/002-overlays-laden-keine-daten.design.md`)
> Abhängigkeiten: **001 (ARIA)** für `aria-busy` und die Live-Region (ohne 001: Ansagen weglassen und nachrüsten).
> ag-Grid: Overlays „Loading“ / „No Rows“ sind Community; seit v35 zusätzlich Filter- und Export-Overlays.
>
> **Zuerst `prompts/000-arbeitsweise.md` lesen.** Hier steht nur, was für dieses Feature dazukommt.

---

## Auftrag

Zwei eingebaute Überlagerungen über dem Body der Tabelle, **nur mit HTML und CSS** (kein Framework, keine Bibliothek,
keine Bilder):

1. **„Lädt…“** mit einem reinen CSS-Spinner, per API ein- und ausschaltbar (z. B. während ein Server antwortet).
2. **„Keine Daten“** automatisch, wenn der Body 0 Zeilen hat, und eine Variante **„Keine Treffer“**, wenn erst der
   Filter alle Zeilen ausblendet.

Beide Texte und Inhalte sind anpassbar. Ein kleines, sichtbares Feature, gut für eine Video-Folge.

## Was es heute gibt (Code-Befund Okt. 2026)

- Nichts dergleichen. Ein leerer Body ist einfach leer; der Header bleibt sichtbar.
- Host-Aufbau in `ele-scope.ts`: Host `ge-table` mit `tabindex="0"`, darin Hover-Divs, Drag-Ghost
  (`ge-table-dragging-column`), Scroll-Viewport mit Content-Wrapper, Rahmen-Divs. Die Overlay-Ebene muss sich dort
  einreihen (z-index über Hover und Selektion, unter dem Drag-Ghost?).
- `crud/crud-table-model-factory.ts` lädt Daten asynchron (`logError('loading the list', …)`) und hat noch keine
  Ladeanzeige: guter erster Nutzer.
- Wrapper bauen die Tabelle bei einem **neuen** `tableOptions`-Objekt komplett neu (CLAUDE.md §4). Ein „loading“-Flag in
  den Options wäre deshalb teuer.

## Referenzfälle

| # | Situation | Erwartung |
|---|---|---|
| O1 | `api.showLoadingOverlay()` | Overlay über dem Body (Header bleibt lesbar), Spinner dreht sich, Text „Loading…“; Host `aria-busy="true"` |
| O2 | `api.hideOverlay()` | Overlay weg, `aria-busy` entfernt; vorhandene Zeilen wieder bedienbar |
| O3 | Modell mit 0 Zeilen | „No rows to show“ erscheint automatisch, ohne API-Aufruf |
| O4 | 100 Zeilen, Filter blendet alle aus | „No matching rows“ (eigener Text), nach Filter-Reset wieder weg |
| O5 | Zeilen kommen per `setRows`/`addRows` dazu | „Keine Daten“ verschwindet nach dem nächsten Repaint |
| O6 | Laden über vorhandenen Zeilen (Refresh) | halbtransparentes Overlay, Zeilen darunter sichtbar; Klicks werden je nach Option blockiert oder nicht |
| O7 | Horizontal gescrollt, schmale Tabelle, sehr hohe Tabelle | Inhalt bleibt im sichtbaren Bereich zentriert |
| O8 | `prefers-reduced-motion: reduce` | kein Drehen (statischer oder sanft pulsierender Indikator) |
| O9 | Dark Theme | Farben aus CSS-Variablen, lesbar in light und dark |
| O10 | Text aus Optionen enthält `<img src=x onerror=…>` | wird als Text angezeigt (escaped) |
| O11 | eigenes Element statt Text (`() => HTMLElement`) | wird eingehängt und beim Ausblenden/`destroy()` sauber entfernt |
| O12 | Screenreader (mit 001) | Live-Region sagt „Loading…“ bzw. „No rows to show“ an |

## Phase 1 – Entscheidungsfragen (zusätzlich zu 000)

1. **API:** `api.showLoadingOverlay(text?)`, `api.showNoRowsOverlay()`, `api.hideOverlay()`, evtl. allgemein
   `api.showOverlay({ kind, text | element })`. Was gewinnt, wenn „Lädt…“ aktiv ist und 0 Zeilen da sind?
2. **Optionen** (additiv in `TableOptionsIf`): `overlayOptions: { loadingText, noRowsText, noMatchesText, autoNoRows,
   blockInteractionWhileLoading, loadingElement?, noRowsElement? }`. Eigene Inhalte als **Element-Fabrik**
   (`() => HTMLElement`, sicher) oder auch als HTML-String (Entwickler-Verantwortung, in der Doku deutlich
   kennzeichnen)? Empfehlung begründen.
3. **Wrapper:** Ein `loading`-Prop (React/Vue/Angular …), der nur die API aufruft und **keinen** Neuaufbau auslöst?
   Oder nur die API über `tableReady`? Bei Prop-Lösung in allen Wrappern gleich umsetzen und testen.
4. **Fläche:** nur Body (Header und Footer frei) oder ganze Tabelle? Verhalten bei ausgeblendetem Header.
5. **Leere Zeilen erkennen:** wo prüfen (nach `adjustArea('body')`, nach `externalFilterChanged()`, nach `setRows`)?
   Unterschied „0 Zeilen insgesamt“ vs. „0 nach Filter“ (`getAllRows()` vs. `getFilteredRows()`, bei eigenen
   `AreaModel`s nur `getRowCount()`).
6. **Spinner:** reines CSS (`@keyframes`, `border`), Größe und Farbe per CSS-Variablen (`--ge-table-overlay-bg`,
   `--ge-table-overlay-color`, `--ge-table-spinner-color`, `--ge-table-spinner-size`).
7. **Texte und Sprache:** englische Defaults, überschreibbar; keine eingebaute Übersetzungstabelle.

## Phase 2 – Tests (zusätzlich zu 000)

- Browser: O1–O7 und O9–O11 (Sichtbarkeit, Position relativ zum Body, Klick-Blockade, automatisches Ein- und
  Ausblenden, Escaping, eigenes Element, Aufräumen bei `destroy()` und Modellwechsel).
- O8: CSS-Regel für `prefers-reduced-motion` vorhanden (per `matchMedia`-Emulation in Playwright, falls möglich).
- O12 (mit 001): Live-Region-Text, `aria-busy`.
- Wrapper-Smoke (React, Web Component): Overlay über API bzw. Prop, ohne Neuaufbau (`tableReady` nur einmal).

## Phase 3 – Hinweise

- Overlay-Element einmal in `EleScope` anlegen, per Klasse ein- und ausblenden (nicht bei jedem Render neu erzeugen).
- Position aus den vorhandenen Geometrie-Daten (Header-/Footer-Höhe), bei `ResizeObserver`-Änderung nachziehen.
- `CrudTableModelFactory`: während des Ladens das Overlay zeigen (falls das API dort Zugriff hat; sonst im Design
  vermerken).

## Phase 4–9 – Besonderheiten

- **Doku:** `instructions.md` (Abschnitt bei den Optionen), Beispiel „Daten per `fetch` laden“.
- **Website:** kein eigener Showcase nötig; in einen vorhandenen einbauen (z. B. Crypto-Ticker beim Start) oder kleiner
  Showcase `overlays`.
- **Training:** Abschnitt in einem vorhandenen Kapitel (z. B. `table-options` oder `live-data`) mit
  `<Callout type="version">`, kein neues Kapitel.
- **Video:** „Lade-Spinner und leere Tabelle – ohne Library, nur CSS“ (60 s): leere Tabelle → `fetch` → Spinner → Daten.

## Abschluss-Review (Schwerpunkte)

Kein Flackern beim schnellen Ein-/Ausblenden, Escaping, Aufräumen, keine Neuaufbauten in den Wrappern.

## Definition of Done (zusätzlich zu 000)

- [ ] Design-Dokument mit API, Optionen, Wrapper-Entscheidung 🛑
- [ ] O1–O12 umgesetzt und getestet; Spinner ohne JS-Animation; light/dark geprüft
- [ ] `CrudTableModelFactory` zeigt beim Laden das Overlay (oder begründet, warum nicht)
