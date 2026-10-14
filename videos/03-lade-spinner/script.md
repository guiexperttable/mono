# Folge 03 – „Lade-Spinner und leere Tabelle – ohne Library, nur CSS“

**Problem:** Daten kommen vom Server. Bis dahin ist die Tabelle leer – und eine leere Tabelle sieht aus wie ein Fehler.
Kommt nichts zurück oder findet der Filter nichts, bleibt nur eine weiße Fläche unter der Kopfzeile.
**Kernbotschaft:** Drei Overlays sind eingebaut: „Lädt…“ mit CSS-Spinner, „Keine Daten“ und „Keine Treffer“ erscheinen
von selbst. Kein Bild, keine Library, null Runtime-Abhängigkeiten. Ein Core, alle Frameworks (`loading`-Prop).
MIT-lizenziert, kostenlos auch kommerziell.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript

## Voraussetzung

`@guiexpert/table` **1.1.91** (Branch `feat/overlays`). Vor der Aufnahme: `pnpm build:core`.
Kein Vergleich „ohne Enterprise-Lizenz“: ag-Grid hat Lade-, Keine-Zeilen- und Keine-Treffer-Overlays auch in der
Community-Version (geprüft auf ag-grid.com, Okt. 2026) – sachlich bleiben, der Punkt ist „nur CSS, null Abhängigkeiten“.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html` mit leerer Tabelle, nur Kopfzeile | „Die Daten kommen gleich. Aber was sieht der Nutzer bis dahin? Eine leere Fläche.“ |
| 8–22 s | `snippet.ts`, Zeilen 3–8 hervorheben | „Eine normale Tabelle – mit leerem Modell. Den Text für ‚keine Daten‘ legen wir in die Optionen.“ |
| 22–40 s | Zeilen 10–14 | „Vor dem Laden: `showLoadingOverlay`. Danach Zeilen setzen, neu zeichnen, `hideOverlay`. Der Spinner ist reines CSS – kein GIF, keine Library.“ |
| 40–55 s | `demo.html`: **Laden** (Spinner über dem Body, Kopfzeile bleibt lesbar) → 100.000 Zeilen; **Laden – leere Antwort** → „Noch keine Bestellungen“; Filter „zzz“ → „Keine Treffer“; Haken **dunkel** | „Leere Antwort? Erscheint von selbst. Filter ohne Treffer? Auch. Und im Dark Mode passen die Farben – CSS-Variablen.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/training/live-data · „MIT“ | „React, Vue, Angular: einfach `loading={true}`. GuiExpert Table – MIT.“ |

## Code (im Video)

`snippet.ts` – 14 Zeilen, kompiliert gegen die echte API (`tsc --strict`, `paths` auf `packages/table/src`;
Top-level `await` → `module: esnext`). `demo.html` führt denselben Code aus (plain JS), ersetzt `fetch` durch einen
Timer (1,5 s) und hat zusätzlich ein Filterfeld und den Dark-Mode-Schalter.

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/03-lade-spinner/demo.html`
3. Browser-Zoom ~150 %. Reihenfolge: Laden → leere Antwort → Laden → Filter „zzz“ → Filter leeren → dunkel → Laden.
4. Alternativ mit Hot Reload: `pnpm serve:table-demo` → `http://localhost:4200/overlay.html` (englische Texte,
   zusätzlich „Refresh“ über vorhandenen Zeilen und der Schalter „block while loading“).

## Fakten-Check (für Beschreibungstext)

- API: `tableApi.showLoadingOverlay(text?)`, `showNoRowsOverlay(text?)`, `hideOverlay()`, `getOverlayState()`;
  Optionen `tableOptions.overlayOptions` (Texte, `autoNoRows`, `blockInteractionWhileLoading`, `loadingDelayInMs`,
  `getOverlayElement`); Prop `loading` in React, Preact, Solid, Vue, Svelte, Angular und Web Component.
- Barrierefrei: `aria-busy` während des Ladens, Ansage über die Live-Region; `prefers-reduced-motion` stoppt den Spinner.
- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Training: https://gui.expert/training/live-data/ (nach dem Website-Deploy).
