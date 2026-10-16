# Folge 10 – „Excel-Feeling ohne Enterprise-Lizenz: Fill-Handle und Änderungen sammeln“

**Problem:** Eine Preisliste mit 1.000 Artikeln, 40 Preise sollen sich ändern. Zelle für Zelle tippen dauert, und jede
Eingabe geht sofort an die Daten – ohne „Speichern“ und ohne „Verwerfen“. In Excel zieht man am Kästchen unten rechts
und speichert am Ende einmal.
**Kernbotschaft:** Zwei Optionen – `fillHandle: true` und `batchEdit: true` – und die Tabelle fühlt sich an wie eine
Tabellenkalkulation: Reihen fortsetzen (10, 20 → 30, 40 …; Datum; „Artikel 9“ → „Artikel 10“), Änderungen sammeln,
gelb markieren, gesammelt speichern. MIT-lizenziert, null Abhängigkeiten.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Excel-Feeling ohne Enterprise-Lizenz“ · „Fill-Handle in 60 Sekunden“ · „Erst sammeln, dann
speichern – Batch-Edit ohne Library“. „Ohne Enterprise-Lizenz“ ist zutreffend: Fill Handle (`CellSelectionModule`) und
Batch Editing (`BatchEditModule`) kommen bei ag-Grid aus `ag-grid-enterprise` (geprüft auf ag-grid.com, 16.10.2026).
Undo/Redo ist bei ag-Grid Community – das haben wir (noch) nicht, also nicht damit vergleichen.

## Voraussetzung

`@guiexpert/table` **1.1.96** (Branch `feat/fill-batch`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html`: Preisliste, Maus tippt mühsam einen Preis nach dem anderen | „40 Preise ändern – Zelle für Zelle? Und jede Eingabe geht sofort raus?“ |
| 8–22 s | `snippet.ts`, Zeilen 8–10 hervorheben | „Zwei Optionen. `fillHandle`: das Kästchen an der Auswahl. `batchEdit`: erst sammeln, dann speichern.“ |
| 22–38 s | Zeilen 12–15 | „Speichern schickt die gesammelten Änderungen an Ihren Server – mit altem und neuem Wert – und schreibt sie erst dann in die Daten.“ |
| 38–55 s | `demo.html`: 10 und 20 sind markiert → Kästchen 5 Zeilen nach unten ziehen → 30, 40, 50 … (gelb, Statuszeile „5 ungespeichert“); mit **⌥/Alt** ziehen → 10, 20, 10 (kopieren); Datum „ab“ ziehen → 02., 03. …; einen Preis auf „-5“ setzen → rot, „Speichern“ gesperrt; zurück auf den alten Wert → Markierung weg; **Verwerfen** → alles wie vorher; noch einmal füllen → **Speichern**; Haken **dunkel** | „Ziehen – die Reihe läuft weiter. Mit Alt wird kopiert. Datum? Zählt mit. Ungültig? Rot – und Speichern bleibt zu. Verwerfen, alles wie vorher. Speichern – erst jetzt ändern sich die Daten.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/showcase/batchedit · „MIT“ | „Fill-Handle und Batch-Edit. Zwei Optionen. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 14 Zeilen Code, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 1.000 erzeugten Artikeln; dazu (nicht im Snippet) Zahlen-Eingabe
(`editInputPipeForNumber`), eine Prüfung (`validate`: Preis ≥ 0), Statuszeile, „Verwerfen“ und Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/10-fill-handle-batch-edit/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: Kästchen an „20“ fassen, 5 Zeilen nach unten → mit Alt noch einmal → Spalte „ab“:
   eine Zelle markieren, Kästchen ziehen → Doppelklick auf einen Preis, „-5“, Enter (rot) → wieder alter Wert →
   „Verwerfen“ → erneut füllen → „Speichern“ → dunkel.
4. Tastatur zeigen (optional): drei Preise markieren, **Strg+D** (macOS ⌘D) – die oberste Zelle wird nach unten kopiert.
5. Englische Variante: `pnpm serve:table-demo` → `http://localhost:4200/fill-batch.html` oder der Showcase
   `/showcase/batchedit/run` (`pnpm serve:webpage-guiexpert`).

## Fakten-Check (für Beschreibungstext)

- API: `tableOptions.fillHandle: true | { direction, fillValue, maxCells, … }` (braucht `SelectionModel("range", …)`),
  `tableOptions.batchEdit: true | { blockCommitOnInvalid }` oder `tableApi.startBatchEdit()`;
  `tableApi.getPendingChanges()`, `commitBatchEdit()`, `cancelBatchEdit()`, `fillRange()`, `applyCellChanges()`;
  `ColumnDef.validate(value, row)`.
- Reihen: eine Zahl → kopieren, mehrere → lineare Reihe; Datum +1 Tag bzw. Monatsschritte; Text mit Endzahl zählt
  hoch; ⌥/Alt (oder Strg) schaltet Reihe ↔ Kopie. Tastatur Strg/⌘+D, Strg/⌘+R.
- Nur editierbare Zellen werden gefüllt; vorgemerkte Werte hängen an der Zeile (Sortieren/Filtern ändern nichts);
  Sortieren, Filter, Summen, Copy und Excel nutzen die gespeicherten Daten (wie bei ag-Grid).
- Events: `onModelChanged` einmal je Vorgang mit altem und neuem Wert; `onBatchEditChanged` (Wrapper: `batchEditChanged`).
- Nicht enthalten: Einfügen aus der Zwischenablage, Undo/Redo (Folgeaufgaben).
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Showcase: https://gui.expert/showcase/batchedit/run · Training: Kapitel 31, Abschnitt „Fill handle and batch edit“
  (nach dem Website-Deploy).
