# 018 – Klick trotz API-Render: Entscheidungen

> Bugfix zu `prompts/018-klick-trotz-api-render.md`. Branch `fix/klick-trotz-api-render`, Zielversion 1.1.108.

## Teil A – Entscheidung: Klick selbst melden (Empfehlung des Prompts), nicht Renders zurückhalten

| Option | Für | Gegen |
|---|---|---|
| **A1 – Klick für die gedrückte Zelle selbst melden** (gewählt) | Live-Tail läuft weiter, auch bei langem Druck; unabhängig davon, wer rendert (API, Wrapper, Renderer-Komponente); Follow-Modus richtig (gedrückte Zeile, nicht die unter dem Zeiger) | etwas mehr Code im `MouseHandler` |
| A2 – API-Renders bis `mouseup` zurückhalten | wenig Code | hält den Live-Tail bei jedem Druck an (Textauswahl, Ziehen); Position muss trotzdem stimmen; jede neue Render-Methode müsste mitmachen |

Umsetzung (`mouse-handler.ts`):

- `mousedown` (linke Taste): `PressedCell` = Element, Area, Seite, Zeile, Spalte, `data-ge-action`, Zeilenobjekt
  (`getRowByIndex`, nur Body), `stableRow` (zweimal `getRowByIndex` liefert dasselbe Objekt), Bildschirmposition.
- `mouseup`: ist das gedrückte Element noch im DOM, entscheidet der Browser wie immer (nie doppelt). Sonst und bei
  Bewegung ≤ `clickMoveTolerance` (4 px, Bildschirmkoordinaten) → `setTimeout(0)` (natives `click`/`dblclick` kommen im
  selben Task wie `mouseup`); kam in der Zwischenzeit ein natives `click` (Zähler), nichts tun.
- Gemeldet wird die **gedrückte** Zelle: aktueller Index des Zeilenobjekts (zuerst der alte Index, sonst Suche nach
  außen; entfernt → kein Klick); Modelle, die je Aufruf neue Objekte liefern → alter Index; Header/Footer → Index.
- Derselbe Weg wie ein nativer Klick (`handleClick`: Checkbox, Baumpfeil, Fokus, Auswahl, `clickCount`), mit
  `mouseup.detail === 2` zusätzlich der Doppelklick (`handleDblClick`: Editor, Sortieren) – nur wenn kein natives
  `dblclick` kam.
- `TableScope.createGeMouseEventForCell(evt, cell)` (neu, `createGeMouseEvent` nutzt es): das Event kommt aus der Zelle,
  nicht aus dem (abgehängten) Element.

Tests: `click-during-render.realmouse.browser.spec.ts` (13 Fälle × ltr/rtl) mit **echter** Maus
(`test-utils/real-mouse.ts` → Vitest-Commands `test-utils/browser-commands.ts`, Playwright `page.mouse`). Ohne Fix
18 rot (Chromium und WebKit), mit Fix 26 grün. WebKit: `pnpm --filter @guiexpert/table test:browser:webkit`
(nicht in der CI – WebKit wird dort nicht installiert). Firefox: lokal nicht geprüft.

## Teil B – übernimmt 019

Kein Zellen-Neuaufbau bei reinem Zeilenzuwachs gehört zum Live-Append (019, Baustein 4 „Render sparen“) und wird dort
mit den Zählern aus 021 abgesichert.

## Weitere Punkte aus log-commander

Nicht umgesetzt (nicht klein), in `TODO.md` unter „Gefunden im log-commander-Spike“.
