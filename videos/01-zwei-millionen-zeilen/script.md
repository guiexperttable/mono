# Folge 01 – „2 Millionen Zeilen ohne Ruckeln“

**Problem:** Große Datenmengen im Browser anzeigen – ohne Pagination, ohne dass die Seite einfriert.
**Kernbotschaft:** Virtual Scrolling – egal ob Zeile 1 oder Zeile 2.000.000, gerendert wird nur, was sichtbar ist.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript

## Voraussetzung (wichtig)

Die Folge zeigt das Tabellen-**Ende**. Vor der Aufnahme müssen die Branches
`perf/constant-row-height` und `fix/huge-scroll-height` gemergt sein:

| | `main` (= npm 1.1.84) | mit beiden Branches |
|---|---|---|
| Render am Tabellenende (2 Mio. Zeilen) | ~27 ms (≈ 2 Frames) | ~4–6 ms |
| Zeilenlinien am Ende | jede zweite fehlt, Text springt | sauber |
| `scrollToIndex(1.000.000)` | landet am Ende | exakt |

Gemessen in Chromium (Linux, headless) mit `demo.html` – **auf dem Aufnahme-Rechner nachmessen**,
die Zahlen im Overlay sind die, die im Video zu sehen sind.

## Ablauf

| Zeit | Bild | Sprechtext (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html`, Auto-Scroll läuft (Taste **A**), Zähler „first row …“ rast hoch | „Zwei Millionen Zeilen. Im Browser. Ohne Pagination – und ohne Ruckeln.“ |
| 8–20 s | `snippet.ts`, Zeilen 3–7 hervorheben | „Der Trick: Es gibt kein Array mit zwei Millionen Objekten. Das Modell berechnet jeden Wert erst, wenn die Tabelle ihn braucht.“ |
| 20–32 s | Zeilen 9–14 hervorheben | „Spalten definieren, Modell übergeben, fertig. Die Tabelle rendert nur die sichtbaren Zeilen – rund zwanzig statt zwei Millionen.“ |
| 32–40 s | (nach Merge) Zeile `getConstantRowHeight()` einblenden | „Und weil alle Zeilen gleich hoch sind, findet sie die erste sichtbare Zeile sofort – ohne zu zählen.“ |
| 40–55 s | `demo.html`: Taste **E** → `#1,999,999`, Overlay „60 fps · ~5 ms/render“; Taste **T** zurück | „Ganz unten – Zeile zwei Millionen. Sechzig Bilder pro Sekunde, wenige Millisekunden pro Frame.“ |
| 55–60 s | Abspann: `npm i @guiexpert/table` · gui.expert · „MIT“ | „GuiExpert Table – Open Source, MIT. Link in der Beschreibung.“ |

## Code (im Video)

`snippet.ts` – 14 Zeilen, kompiliert gegen die echte API (geprüft mit `tsc --strict --noImplicitOverride`).
Nach dem Merge der Performance-Branches als 15. Zeile im Modell ergänzen:

```ts
  override getConstantRowHeight() { return 34; }
```

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/01-zwei-millionen-zeilen/demo.html`
3. Tasten: **A** Auto-Scroll an/aus · **E** ans Ende · **T** an den Anfang
4. Browser-Zoom ~150 % für lesbare Schrift im Hochformat; Fensterbreite so, dass beide Spalten + Overlay sichtbar sind.
5. Overlay rechts oben zeigt fps, ms pro Render und die erste sichtbare Zeile – bewusst im Bild lassen (Beweis).

## Fakten-Check (für Beschreibungstext)

- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Keine Runtime-Abhängigkeiten im Core.
- Vertikales **und** horizontales Virtual Scrolling (horizontal hier nicht gezeigt → Folge 2/6).
- Showcase online: https://gui.expert/showcase/large
