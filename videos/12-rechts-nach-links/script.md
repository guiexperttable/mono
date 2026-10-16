# Folge 12 – „Arabisch, Hebräisch: Tabelle von rechts nach links – eine Option“

**Problem:** Eine Daten-Tabelle für Kunden in Riad, Dubai oder Tel Aviv. Arabisch, Hebräisch, Persisch und Urdu lesen
von rechts nach links – die erste Spalte gehört nach rechts, Scrollen, fixierte Spalten und Pfeiltasten auch. Selbst
gebaut heißt das: jede Position spiegeln, negatives `scrollLeft`, Tastatur umdrehen.
**Kernbotschaft:** Eine Option – `direction: "rtl"` – und die ganze Tabelle ist gespiegelt, inklusive Virtual Scrolling,
fixierter Spalten, Summenzeile und Excel-Export. Links-nach-rechts bleibt Pixel für Pixel gleich. MIT-lizenziert, null
Abhängigkeiten, in jedem Framework.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Titel-Varianten:** „Arabisch, Hebräisch: Tabelle von rechts nach links – eine Option“ · „RTL-Tabelle in 60 Sekunden“ ·
„Von rechts nach links – mit 2.000 Zeilen und Excel-Export“. **Kein** „ohne Enterprise-Lizenz“: RTL ist bei ag-Grid
Community (`enableRtl`).

## Voraussetzung

`@guiexpert/table` **1.1.98** (Branch `feat/rtl`). Vor der Aufnahme: `pnpm build:core`.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html` mit „ltr“: arabische Daten, erste Spalte links – sieht falsch aus | „Arabische Daten in einer Tabelle von links nach rechts. Für Leser in Riad steht alles verkehrt herum.“ |
| 8–25 s | `snippet.ts`, Zeile 12 hervorheben | „Eine Option: `direction: "rtl"`. Oder `"auto"` – dann gilt die Richtung der Seite.“ |
| 25–38 s | Zeile 9 | „Fixierte Spalten bleiben am Anfang – also rechts. Die Namen der Optionen bleiben, ‚links‘ heißt jetzt ‚Anfang‘.“ |
| 38–55 s | `demo.html`: „rtl“ klicken → Stadt rechts fixiert, Summenzeile; waagerecht scrollen (Scrollbalken startet rechts, Log zeigt „vom Anfang“); Spaltenrand **links** ziehen → breiter; Zelle anklicken, Pfeil ← / → (in Leserichtung); „Excel“ → Datei in Excel öffnen: Spalte A rechts; Haken **dunkel** | „Rechts beginnt die Tabelle, nach links wird gescrollt. Spaltenbreite am linken Rand, Pfeiltasten in Leserichtung – und der Excel-Export kommt ebenfalls von rechts nach links.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/showcase/rtl · „MIT“ | „Rechts nach links. Eine Option. GuiExpert Table.“ |

## Code (im Video)

`snippet.ts` – 14 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`).
`demo.html` führt denselben Code aus (plain JS) mit 2.000 erzeugten Filialen und 12 Monatsspalten; dazu (nicht im
Snippet) Zeilennummern, Summenzeile, Umschalter rtl/ltr, Excel und der Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/12-rechts-nach-links/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: „ltr“ → „rtl“ → waagerecht scrollen → Spaltenrand links ziehen → Zelle anklicken,
   ← → → → „Excel“ (Datei in Excel/Numbers öffnen) → dunkel.
4. Englische Variante: `pnpm serve:table-demo` → `http://localhost:4200/rtl.html` oder der Showcase `/showcase/rtl/run`
   (`pnpm serve:webpage-guiexpert`).
5. Vor der Aufnahme in Firefox und Safari einmal durchklicken (die automatischen Tests laufen nur in Chromium).

## Fakten-Check (für Beschreibungstext)

- API: `tableOptions.direction: "ltr" | "rtl" | "auto"` (Default `"ltr"`), `tableApi.getDirection()`; der Host bekommt `dir`.
- Gespiegelt: Spaltenreihenfolge, horizontales Virtual Scrolling, fixierte Spalten (`fixedLeftColumnCount` = Anfang =
  rechts), Header-Gruppen, Col-/Rowspan, Baum-Einrückung und -Pfeile, Sortier-Icon, Spaltenbreite (Griff links),
  Spalten-Drag, Bereichsauswahl, Zeilennummern, Summenzeile, Overlay, Row Drag, Fill-Handle, Master/Detail.
- Pfeiltasten in Leserichtung (→ = vorherige Spalte); Pos1/Ende = erste/letzte Spalte.
- Excel-Export: Arbeitsblatt von rechts nach links (`rightToLeft`).
- Gemischter Text und Zahlen: Bidi des Browsers; Latein mit Satzzeichen: Klasse `ge-table-text-plaintext`.
- Links-nach-rechts unverändert (Specs prüfen Positionen in beiden Richtungen).
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Showcase: https://gui.expert/showcase/rtl/run · Training: Kapitel 28 „Theming & dark mode“, Abschnitt
  „Right-to-left“ (nach dem Website-Deploy).
