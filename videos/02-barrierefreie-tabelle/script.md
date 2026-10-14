# Folge 02 – „Barrierefreie Tabelle in 60 Sekunden“

**Problem:** Behörden und Unternehmen brauchen barrierefreie Oberflächen (WCAG 2.1 AA, EN 301 549, in Deutschland das
BFSG seit Juni 2025). Ein Data-Grid aus Divs ist für Screenreader eine Wand: „Gruppe, Gruppe, 243“.
**Kernbotschaft:** Die Tabelle ist ein WAI-ARIA-Grid – Screenreader hören Zeile, Spalte und Kopf, auch bei 100.000 Zeilen
mit Virtual Scrolling. Dazu volle Tastaturbedienung. MIT-lizenziert, kostenlos auch kommerziell.
**Länge:** 60 s · **Format:** Hochformat-tauglich (Code oben, Ergebnis unten) · **Framework:** Plain TypeScript
**Ton:** VoiceOver (macOS) **hörbar**, Untertitel für alles, was der Screenreader sagt.

## Voraussetzung

`@guiexpert/table` **1.1.91** (Branch `feat/aria`). Vor der Aufnahme: `pnpm build:core`.
Kein Vergleich „ohne Enterprise-Lizenz“: ARIA ist bei ag-Grid auch in der Community-Version enthalten – sachlich bleiben.

## Ablauf

| Zeit | Bild | Sprechtext / Ton (Vorschlag) |
|---|---|---|
| 0–8 s | `demo.html` ohne Ton-Erklärung, VoiceOver an, Tab in die Tabelle | VoiceOver: „Bestellungen, Tabelle, 100.001 Zeilen, 3 Spalten“ – Sprecher: „So klingt eine Tabelle mit hunderttausend Zeilen. Für einen Screenreader.“ |
| 8–22 s | `snippet.ts`, Zeilen 3–10 hervorheben | „Ein Name für die Tabelle – die Überschrift. Und, wenn man will, deutsche Ansagen. Mehr ist nicht zu tun.“ |
| 22–35 s | Zeilen 11–15 | „Rollen, Zeilen- und Spaltennummern, Fokus, Sortierzustand: das setzt die Tabelle selbst – auch für die Zeilen, die wegen Virtual Scrolling gar nicht im DOM sind.“ |
| 35–52 s | `demo.html`: Pfeile, **Strg+Ende** („Zeile 100.001 von 100.001“), **↑** bis in die Kopfzeile, **Enter** („Sortiert nach SUMME, aufsteigend“), Filter „42“ („2003 Zeilen“) | VoiceOver hörbar, Untertitel aus dem blauen Kasten |
| 52–60 s | Abspann: `npm i @guiexpert/table` · gui.expert/training/accessibility · „MIT“ | „GuiExpert Table – barrierefrei, Open Source, MIT. Kapitel 35 der Schulung.“ |

## Code (im Video)

`snippet.ts` – 15 Zeilen, kompiliert gegen die echte API (`tsc --strict --noImplicitOverride`, `paths` auf
`packages/table/src`). `demo.html` führt denselben Code aus (plain JS) – plus Filterfeld und einen sichtbaren Kasten,
der zeigt, was der Screenreader hört (Live-Region und aktive Zelle; nur für die Untertitel).

## Aufnahme

1. Repo-Root: `pnpm i && pnpm build:core`
2. `python3 -m http.server 8080` → `http://localhost:8080/videos/02-barrierefreie-tabelle/demo.html`
3. macOS: VoiceOver mit **⌘F5** einschalten, Safari. (Windows: NVDA + Firefox.) Sprechgeschwindigkeit etwas langsamer stellen.
4. Browser-Zoom ~150 %; der blaue Kasten unten liefert die Untertitel-Texte.
5. Vor der Aufnahme einmal durchspielen und die tatsächliche VoiceOver-Ausgabe notieren – die Sprechtexte oben sind
   Erwartungen, nicht gemessen (Protokoll: `prompts/001-aria-screenreader.design.md` § 8).

## Fakten-Check (für Beschreibungstext)

- Lizenz: aktuelle Releases MIT (künftige Releases evtl. Dual-Lizenz – keine Preise nennen).
- Geprüft mit axe-core (WCAG 2.1 A/AA) in Chromium; manuelle Screenreader-Tests siehe Design-Dokument.
- Training: https://gui.expert/training/accessibility/ (nach dem Website-Deploy).
