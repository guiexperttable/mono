# Folge 11 – „Master/Detail ohne Enterprise-Lizenz“

**Problem:** 100.000 Bestellungen in einer Tabelle – und zu jeder gehören Positionen. Als Spalten? Unlesbar. Als Dialog?
Dann sieht man die anderen Bestellungen nicht mehr. Bei ag-Grid ist Master/Detail Enterprise.
**Kernbotschaft:** Eine Option – `masterDetail` – und jede Zeile lässt sich aufklappen: darunter eine zweite
GuiExpert-Tabelle über die volle Breite. Funktioniert mit Virtual Scrolling und 100.000 Zeilen, das Detail behält beim
Scrollen seinen Zustand. MIT-lizenziert, null Abhängigkeiten, in jedem Framework.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Master/Detail ohne Enterprise-Lizenz“ · „Bestellung aufklappen, Positionen sehen – in 60 Sekunden“ ·
„Tabelle in der Tabelle – mit 100.000 Zeilen“. „Ohne Enterprise-Lizenz“ ist zutreffend: Master/Detail
(`MasterDetailModule`) kommt bei ag-Grid aus `ag-grid-enterprise` (geprüft auf ag-grid.com, 16.10.2026).

## Voraussetzung

`@guiexpert/table` **1.1.97** (Branch `feat/master-detail`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html`: 100.000 Bestellungen, Maus fährt über „Summe“ | „100.000 Bestellungen. Und die Positionen? Als Spalten unlesbar, im Dialog fehlt der Überblick.“ |
| 8–22 s | `snippet.ts`, Zeilen 6–8 hervorheben | „Eine Option: `masterDetail`. Höhe, und was im Detail stehen soll.“ |
| 22–38 s | Zeilen 9–12 | „Hier eine zweite GuiExpert-Tabelle mit den Positionen. `createTable` – sie wird beim Zuklappen wieder sauber abgebaut.“ |
| 38–55 s | `demo.html`: ▸ an Bestellung 2 klicken → Positionen über die volle Breite (auch unter der fixierten Spalte); waagerecht scrollen → Detail bleibt stehen; Pfeil runter auf Zeile 5, **Enter** → aufgeklappt; in der Positionstabelle scrollen; dann in der großen Tabelle weit nach unten (Scrollbalken) und zurück → Detail noch da, gleiche Scrollposition; „20 aufklappen“ → flüssig scrollen; Haken **dunkel** | „Klick – die Positionen erscheinen direkt darunter. Enter geht auch. Weit weg scrollen, zurück: alles noch da. 20 offen, 100.000 Zeilen – flüssig.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/showcase/masterdetail · „MIT“ | „Master/Detail. Eine Option. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 14 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 100.000 erzeugten Bestellungen; dazu (nicht im Snippet)
Spaltenbreiten und deutsche Überschriften, ein Event-Log (`onDetailExpandedChanged`), „20 aufklappen“, „alle zuklappen“
und der Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/11-master-detail/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: ▸ an Bestellung 2 → waagerecht scrollen (Tabelle schmaler ziehen oder Zoom) →
   Pfeiltasten auf Zeile 5, Enter → in den Positionen scrollen → Scrollbalken der großen Tabelle ganz nach unten, zurück
   → „20 aufklappen“ → Mausrad durch → dunkel.
4. Tastatur zeigen (optional): auf einer aufgeklappten Zeile **Tab** – der Fokus springt in die Positionstabelle,
   **Shift+Tab** zurück.
5. Englische Variante: `pnpm serve:table-demo` → `http://localhost:4200/master-detail.html` oder der Showcase
   `/showcase/masterdetail/run` (`pnpm serve:webpage-guiexpert`).

## Fakten-Check (für Beschreibungstext)

- API: `tableOptions.masterDetail = { detailRenderer, detailHeight (px | "auto" | Funktion), isMaster, toggleColumn,
  maxRenderedDetails, getRowId }`; Kontext `ctx.createTable()`, `ctx.signal`, `ctx.recreated`; `tableApi.setDetailExpanded()`,
  `toggleDetail()`, `isDetailExpanded()`, `expandAllDetails()`, `collapseAllDetails()`, `refreshDetail()`.
- Detail = beliebiger Inhalt (zweite Tabelle, Formular, Framework-Komponente: `DetailComponentRendererWrapper` für React,
  Vue, Svelte, Solid, Preact; Angular `DetailRenderWrapperFactory`).
- Inhalt entsteht beim ersten Sichtbarwerden, wird beim Wegscrollen nur versteckt (Zustand bleibt), beim Zuklappen zerstört.
- Sortieren/Filtern: Detail bleibt an seiner Bestellung. Klicks/Tasten im Detail gehen nicht an die äußere Tabelle.
- Tastatur: Enter klappt auf/zu, Tab ins Detail, Shift+Tab zurück; Screenreader: `aria-expanded`.
- Nebenbei schneller: variable Zeilenhöhen per Prefix-Summen (2 Mio. Zeilen so schnell wie mit fester Höhe).
- Nicht enthalten: Details unter Baumknoten/Gruppenzeilen (nur flache Tabellen).
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Showcase: https://gui.expert/showcase/masterdetail/run · Training: Kapitel 38 „Master/detail“ (nach dem Website-Deploy).
