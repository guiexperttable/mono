# Folge 14 – „Angular Signals: die Tabelle als Signal – zoneless in 60 Sekunden“

**Problem:** Angular 22 läuft auf Signals und ohne Zone.js. Nur die Tabelle kam noch über `(tableReady)`, ein Feld
`tableApi?: TableApi` und `?.`-Ketten überall – und ein Button „Excel“ musste von Hand wissen, wann die Tabelle fertig ist.
**Kernbotschaft:** `<guiexpert-table-signal [(tableApi)]="api" />` – die `TableApi` ist ein Signal. `computed()` und
`effect()` funktionieren damit wie mit jedem anderen Signal. Zoneless, kein RxJS, 100.000 Zeilen mit Virtual Scrolling;
ein Core, alle Frameworks; MIT-lizenziert.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Angular 22 (zoneless)
**Titel-Varianten:** „Angular Signals: die Tabelle als Signal“ · „Daten-Tabelle für Angular 22 – zoneless, 100.000 Zeilen“ ·
„`[(tableApi)]` – die Tabellen-API als Signal“. **Kein** „ohne Enterprise-Lizenz“ (Wrapper-Feature; ag-Grid funktioniert
laut eigener Kompatibilitätsseite ebenfalls zoneless – keine Aussage über ag-Grid machen, die wir nicht belegen können).

## Voraussetzung

`@guiexpert/angular-table` **22.1.100** (Branch `feat/angular-signal-table`). Vor der Aufnahme:
`pnpm build:core && pnpm build:angular:ng22`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | alter Code: `(tableReady)="api = $event"`, Feld `api?: TableApi`, `@if (api)` | „Angular 22: alles ist ein Signal, Zone.js ist weg. Nur die Tabellen-API kam noch über ein Event und ein Feld.“ |
| 8–22 s | `snippet.ts`, Zeile mit `[(tableApi)]="api"` und `signal<TableApi \| undefined>` hervorheben | „Mit `guiexpert-table-signal` ist die API ein Signal – Zwei-Wege-Bindung, fertig.“ |
| 22–34 s | Zeilen `computed` und `[disabled]="!ready()"` | „Ein `computed` sagt: Tabelle bereit. Der Excel-Button schaltet sich selbst frei.“ |
| 34–40 s | Zeile `effect(() => this.api()?.scrollToIndex(0, 0))` | „Und ein `effect` läuft genau dann, wenn die Tabelle da ist.“ |
| 40–55 s | `apps/angular-signal-demo` → „Video snippet“: 100.000 Zeilen scrollen, „Excel“ → Datei öffnen; dann „Playground“: „2,000,000 rows“ (tables built: 2, `tableApi` wechselt direkt), Haken „loading“, Rechtsklick (einmal) | „100.000 Zeilen, zoneless. Neues Modell? Die API wechselt direkt – kein `undefined` dazwischen.“ |
| 55–60 s | Abspann: `npm i @guiexpert/angular-table@22` · gui.expert/training/angular · „MIT“ | „Die Tabelle als Signal. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – die Zeilen ab `@Component` (15 Zeilen) stehen wortgleich in `apps/angular-signal-demo/src/orders.component.ts`
und auf /whats-new/ (`pnpm --filter webpage-guiexpert check:features` vergleicht sie); die Demo-App kompiliert sie mit
`ngc` und `strictTemplates` (`pnpm --filter angular-signal-demo check`).

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core && pnpm build:angular:ng22`
2. `pnpm serve:angular-signal-demo` → `http://localhost:4210`
3. Browser-Zoom ~150 %. Reihenfolge: „Video snippet“ → scrollen → „Excel“ → „Playground“ → „2,000,000 rows“ →
   „loading“ an/aus → Rechtsklick auf eine Zelle („context menu: … once per right click“) → „Remove table“
   (`tableApi: undefined`).
4. Die Demo kompiliert die eigenen Komponenten im Browser (JIT, Vite) – für die Aufnahme egal; die Bibliothek ist das
   gebaute Paket. Konsole: nur „Angular is running in development mode“.

## Fakten-Check (für Beschreibungstext)

- `TableSignalComponent`, Selektor `guiexpert-table-signal`, ab `@guiexpert/angular-table@22.1.100` – in den Paketen für
  Angular 22 und jede spätere Major; `<guiexpert-table>` (`TableComponent`) bleibt unverändert für Angular 14 – 22.
- Eingaben `input()`: `tableModel`, `tableOptions`, `loading`, `debounceMouseClickDelay`. API: `tableApi = model()` →
  `[(tableApi)]`, `(tableApiChange)`; **kein** `(tableReady)`.
- Ausgaben `output()`: dieselben Events wie `TableComponent`, Rechtsklick heißt `contextMenu` (bei `(contextmenu)` bindet
  Angular zusätzlich das Browser-Event – der Handler liefe zweimal).
- Zoneless (`provideZonelessChangeDetection()`), kein RxJS, SSR: auf dem Server keine Tabelle.
- Neues Modell → neue Tabelle, `api()` direkt die neue API; Komponente entfernt → `api()` = `undefined`.
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Training: https://gui.expert/training/angular/#signals · What's new: https://gui.expert/whats-new/#angular-signals
  (nach dem Website-Deploy).
