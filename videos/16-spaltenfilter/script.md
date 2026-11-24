# Folge 16 – „Spaltenfilter & Excel-Werteliste im Header – eine Option (Werteliste bei ag-Grid Enterprise)“

**Problem:** Nutzer wollen jede Spalte direkt im Header filtern – mal schnell mit `>50000` oder `2025-01..2025-06`, mal
mit einer Excel-Werteliste voller Checkboxen – und Spalten über einen „Columns“-Knopf ein- und ausblenden. Selbst gebaut
sind das tausend Zeilen Code; bei ag-Grid sind Set Filter (Werteliste) und Columns Tool Panel kostenpflichtige
Enterprise-Features.
**Kernbotschaft:** Zwei Optionen im Core: `filterRow: true` und `columnFilterMenu: true`, plus `tableApi.showColumnChooser(btn)`.
200.000 Zeilen, virtualisierte Werteliste, Tastatur (`Strg/⌘+Shift+F`, `Alt+↓`), Dark Mode, RTL, Zustand speichern –
MIT-lizenziert, null Abhängigkeiten, in jedem Framework.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Spaltenfilter & Excel-Werteliste im Header – eine Option (Werteliste bei ag-Grid Enterprise)“ ·
„200.000 Zeilen filtern: Filterzeile, Werteliste, Spaltenauswahl – MIT“ · „Excel-Spaltenfilter im Browser in 60 Sekunden“.
**Wichtig (Fakten):** Einfache Spaltenfilter / Floating Filters gibt es bei ag-Grid in der Community-Version; die
Excel-Werteliste (**Set Filter**) und das **Columns Tool Panel** sind ag-Grid Enterprise (geprüft auf ag-grid.com).
„Ohne Enterprise-Lizenz“ deshalb immer präzise auf Werteliste & Spaltenauswahl beziehen, nicht auf einfache Textfilter.

## Voraussetzung

`@guiexpert/table` **1.1.114** (Branch `feat/spaltenfilter`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html` mit 200.000 Zeilen, Filterzeile offen; in **MRR** `>50000` tippen → Trefferzahl und Footer-Summe springen sofort | „Zweihunderttausend Zeilen, direkt im Header filtern: größer fünfzigtausend – Treffer und Summe passen in Millisekunden.“ |
| 8–26 s | `snippet.ts`, Zeilen 7–13 hervorheben | „Zwei Optionen: `filterRow: true` für die Filterzeile, `columnFilterMenu: true` für das Menü mit Operatoren und Excel-Werteliste.“ |
| 26–44 s | `demo.html`: Trichter in **Region** klicken → Werteliste erscheint (AMER, APAC, EMEA, LATAM mit Zählern) → zwei anhaken → OK; dann unten **Columns** klicken → Spalten ein-/ausblenden (**ID** gesperrt mit `hideable: false`) | „Klick auf den Trichter: virtualisierte Werteliste mit Suche und Trefferzahlen – kaskadiert über die anderen Filter. Und mit einem Aufruf der Spalten-Auswahl-Dialog.“ |
| 44–54 s | `demo.html`: **Filterzeile** aus-/einblenden, **dunkel** anhaken, kurz **Vollbild** | „Funktioniert im Dark Mode, mit Rechts-nach-links und sogar im Vollbild – dank nativem Top-Layer.“ |
| 54–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/showcase/columnfilter · „MIT“ | „Spaltenfilter und Excel-Werteliste ohne Enterprise-Lizenz. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 15 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 200.000 deterministisch erzeugten Accounts, Statusleiste
(Trefferzahl, Filterzeile ein/aus, Columns, Filter löschen, dunkel, Vollbild) und Footer-Summe.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/16-spaltenfilter/demo.html`
3. Browser-Zoom ~140 %. Reihenfolge: `>50000` in MRR tippen → Region-Trichter öffnen, EMEA + AMER wählen → **Columns**
   öffnen (ID ausgegraut) → eine Spalte abwählen → dunkel schalten.
4. Englische Variante / Voll-Showcase: `pnpm serve:table-demo` → `http://localhost:4200/column-filter.html` oder
   `pnpm serve:webpage-guiexpert` → `/showcase/columnfilter/run/`.

## Fakten-Check (für Beschreibungstext)

- Optionen: `tableOptions.filterRow: true | FilterRowOptionsIf`, `tableOptions.columnFilterMenu: true | ColumnFilterMenuOptionsIf`,
  `tableOptions.columnFilter: { managed, caseSensitive, locale, maxValues }`, `ColumnDef.filter` (`false | "text" | "number" | "date" | "boolean" | { type, valueGetter, getValues, placeholder }`), `ColumnDef.hideable: false`.
- Kurzschreibweisen in der Filterzeile: `>100`, `>=100`, `<50`, `<=50`, `!=0`, `10..20`, `=exakt`, `^anfang`, `ende$`, `""` (leer), `2025-01..2025-06`, Tri-State-Auswahl für Booleans.
- API: `setColumnFilter`, `setColumnFilters`, `clearColumnFilters`, `getColumnFilter`, `getColumnFilters`, `isColumnFiltered`,
  `setFilterRowVisible` / `isFilterRowVisible`, `showColumnFilterMenu` / `hideColumnFilterMenu`, `showColumnChooser(anchor)` / `hideColumnChooser`.
- Event: `onFilterChanged(GeFilterEvent: filters, property, source, rowCount, unfilteredRowCount)` (Wrapper: `filterChanged`).
- Kombiniert per UND mit `externalFilterFunction`, bleibt bei Live-`appendRows()` im Fokus (Cursor & IME erhalten),
  Zustand unter `"filters"` (`autoRestoreFilterState: true`), Server-Modus über `columnFilter: { managed: false }`.
- Tastatur: `Strg/⌘+Shift+F` (Filterzeile fokussieren), `Alt+↓` (Filter-Menü öffnen), `Escape` (leeren / schließen).
- ag-Grid-Vergleich (Stand ag-grid.com): einfache Spaltenfilter & Floating Filters = Community; Set Filter (Werteliste)
  und Columns Tool Panel = Enterprise.
