# 017 – Bugfix: ein Render je Update, Scrollhöhe aus dem Area-Modell

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Regeln, Phase 10 =
> Release-Block). Bugfix mit kleiner API-Ergänzung, **kein Haltepunkt**, außer die API weicht vom Vorschlag unten ab.
> Jede Code-Änderung am Core folgt der Regel „zuerst ein roter Test“. Branch: `fix/ein-render-je-update-scrollhoehe`.
>
> Herkunft: Spike im Projekt **log-commander** (Tauri-Live-Log-Viewer, `@guiexpert/table@1.1.106`,
> `@guiexpert/angular-table@22.1.106`, eigenes `AreaModel` mit bis zu 10 Mio. Zeilen, 5000 neue Zeilen/s).
> Design dort: `log-commander/prompts/003-gui-expert-table.design.md`, Blocker 7 und 8.

## Ziel

1. **Teil A:** Eine Anwendung, deren Zeilenzahl wächst und die eine bestimmte Inhaltsposition halten will, kommt mit
   **einem** Render je Update aus. Heute sind es drei.
2. **Teil B:** Die Scrollhöhe passt zu den Zeilen, die die Tabelle zeichnet. Heute rechnet sie mit `defaultRowHeights`
   (34 px), auch wenn das Area-Modell andere Höhen liefert. Folge: Scrollbalken ohne Überlauf, falsche Balkengröße,
   falsche Zuordnung Balken ↔ Inhalt.

Fertig = beide Teile mit roten, dann grünen Browser-Tests, alle bestehenden Tests grün (`test:browser` und
`test:browser:scrollbars`, ltr und rtl), `instructions.md`/`CLAUDE.md`/`TODO.md` aktualisiert, Release-Block (Phase 10).

---

## Teil A – Ein Render je Update

### Befund (gemessen am 07.11.2026)

Der log-commander hält die Position selbst (Zeile + Pixel) und zeichnet nach jedem Update so:

```ts
api.repaintHard();                 // Zeilenzahl gewachsen
api.scrollToPixel(left, contentTop); // Inhalt exakt halten (gekappte Scrollhöhe, pendingContentScroll)
```

Das ergibt **drei** vollständige Renders des sichtbaren Bereichs (per Stack-Trace auf `adjustAfterScrolling` gezählt):

| # | Aufruf | Stelle |
|---|---|---|
| 1 | `repaintHard()` → `adjustContainersAndRows()` → `adjustAfterScrolling()` | `ele-scope.ts:525` |
| 2 | `repaintHard()` → `adjustAfterScrolling()` | `render-scope.ts:606` |
| 3 | `scrollToPixel()` → `adjustAfterScrolling()` | `table-scope.ts:2730` |

Jeder Render baut alle sichtbaren Zellen neu (`innerText = ''`, `render-scope.ts:1257`). Gemessen im echten WebView
(macOS, 2 und 10 Mio. Zeilen, 5000 Zeilen/s, ~20 sichtbare Zeilen à 2 Spalten): `repaintHard` + `scrollToPixel`
p50 4 ms, p95 9–11 ms, max 15–22 ms je Update; Frames im Follow p95 22–26 ms statt 18 ms mit dem eigenen Viewport des
log-commanders; WebView-CPU etwa doppelt so hoch.

Ohne den `scrollToPixel`-Aufruf wandert der Inhalt beim Wachsen (gekappte Scrollhöhe: Inhaltsposition =
`scrollTop / Balkenbereich`, und der Bereich wächst). Der Aufruf ist also nötig, nur der Weg dorthin ist zu teuer.

### Auftrag

1. **Tests zuerst** (neue Spec `repaint-count.browser.spec.ts` oder in `table-api.browser.spec.ts`), ltr und rtl wie
   `scroll-to-index.browser.spec.ts`:
   - Render-Zähler: `vi.spyOn` auf `adjustAfterScrolling` der `TableScope` (oder ein interner Zähler, falls der Spy
     wegen `bind` nicht greift; dann `@internal`, nicht in `index.ts`).
   - `repaintHard()` rendert **genau einmal** (heute 2 → rot).
   - Die neue Variante (siehe 2.) rendert genau einmal und zeigt danach exakt die verlangte Inhaltsposition.
   - **Wachsen mit gekappter Scrollhöhe:** Modell mit konstanter Höhe 20 px, 1 Mio. Zeilen (20 Mio. px > 8 Mio.),
     Position auf Zeile 500.000 setzen, dann 10× um 50.000 Zeilen wachsen und jeweils die neue Variante mit derselben
     Position aufrufen: erste sichtbare Zeile (`getFirstVisibleRowIndex`) bleibt 500.000, `top` der Zeile im Body
     bleibt gleich (±0,5 px). Gegenprobe ohne Positionsangabe (nur `repaintHard()`): Zeile wandert (dokumentiert das
     heutige Verhalten, als normaler Test, nicht `it.fails`).
   - Ein danach ankommendes natives `scroll`-Event (gleiches `scrollTop`) darf die Position nicht verschieben
     (`pendingContentScroll` gilt weiter).
2. **API-Vorschlag** (klein, abwärtskompatibel):
   `TableApi.repaintHard(scrollTo?: { px?: number; py?: number })` – Zeilenzahl/Höhen neu, dann **in einem Render**
   die Inhaltsposition `py` (Inhaltspixel wie `scrollToPixel`) und `px` (logisch, „vom Anfang“, rtl beachten) setzen.
   Ohne Argument wie heute, nur mit einem Render. Alternative, falls sauberer: `scrollToPixel(px, py, { rowsChanged:
   true })`. Entscheidung im PR begründen; weicht sie stark ab (z. B. neue Methode), kurz anhalten und Marc fragen.
3. **Umsetzung:**
   - `repaintHard()` so umbauen, dass `adjustContainersAndRows()` dort **nicht** selbst rendert (Parameter oder Flag,
     alle anderen Aufrufer von `adjustContainersAndRows` unverändert lassen – Aufrufer auflisten und prüfen:
     Resize, Header/Footer ein-/ausblenden, `setColumnVisible`, Zeilennummernbreite, Detailzeilen).
   - Die Positionslogik aus `scrollToPixel` (`table-scope.ts:2719`) in eine interne Methode ziehen, die nur
     `scrollTop`/`pendingContentScroll` setzt, ohne zu rendern; `scrollToPixel` und `repaintHard(scrollTo)` nutzen sie.
     Reihenfolge: Höhen und Wrapper-Größe neu → Position setzen → **ein** `adjustAfterScrolling()`.
   - `onScroll`-Listener der Anwendung bekommen weiterhin genau ein `GeScrollEvent` je Render (bestehende Specs dazu
     prüfen).
4. **Messung im Bericht:** Render-Zähler vorher/nachher; Dauer von `repaintHard` + Position mit 1 Mio. und 10 Mio.
   Zeilen (Showcase „Large dataset“ oder eigener Benchmark-Test, `performance.now()`), vorher/nachher.

---

## Teil B – Scrollhöhe aus dem Area-Modell (Scrollbalken bei wenigen Zeilen)

### Befund

`TableModel.getAreaHeight(area)` (`data/tablemodel/table-model.ts:308`) nimmt **zuerst** `defaultRowHeights[area]`:

```ts
if (this.defaultRowHeights[areaIdent]) return rowCount * this.defaultRowHeights[areaIdent];
```

`TableFactory.createTableModel` setzt `defaultRowHeights` immer (Vorgabe 34/34/34). Gezeichnet wird der Body aber über
`RowLayout` mit `body.getConstantRowHeight?.()` bzw. `getRowHeight(i)` des Area-Modells
(`render-scope.ts:372`). Mit einem eigenen `AreaModel`, das 20 px liefert:

| | erwartet | heute |
|---|---|---|
| 15 Zeilen, Body 423 px hoch | kein Balken (301 px Inhalt) | Balken, `scrollHeight` 511 = 15 × 34 + 1 |
| 3000 Zeilen | `scrollHeight` 60.001 | 102.001 = 3000 × 34 + 1 |

Folgen: Scrollbalken ohne Überlauf, zu kleiner Daumen, `getContentScrollRangeY()` und damit `scrollFactorY`,
`scrollToPixel`, Rad-Skalierung (`onWheel`) und gekappte Höhe rechnen mit dem falschen Bereich. Gezeichnet wird trotzdem
richtig (das Ende ist sichtbar), deshalb fällt es nur am Balken auf. Der log-commander umgeht es, indem er
`defaultRowHeights.body` auf seine Zeilenhöhe setzt.

**Zur Frage „Option zum Ausschalten?“:** Eine Option wäre hier die falsche Lösung, der Balken ist ein Symptom der
falschen Höhe. Mit richtiger Höhe erscheint er nur bei echtem Überlauf (geprüft: mit 20 px in `defaultRowHeights`
ist `scrollHeight` = `clientHeight`). `tableOptions.overflowY` (`"auto" | "scroll"`) gibt es schon. Ein zusätzliches
`"hidden"` (kein Balken, Scrollen nur per Rad/Tastatur/API) **nicht** in diesem Prompt bauen – nur im Bericht als
Möglichkeit nennen und Marc entscheiden lassen.

### Auftrag

1. **Tests zuerst** (Browser, in `scroll-bars.scrollbars.browser.spec.ts` für klassische Balken und eine Variante in
   `table-scope.browser.spec.ts` ohne feste Balkenbreite):
   - Eigenes `AreaModel` mit `getRowHeight` = `getConstantRowHeight` = 20, Factory ohne `defaultRowHeights`
     (also Vorgabe 34): 15 Zeilen in 500 px Host → kein senkrechter Balken (`scrollHeight <= clientHeight`), Inhalt =
     15 × 20 (+1 siehe 3.). Heute rot.
   - 3000 Zeilen: `scrollHeight` = 3000 × 20 + 1; `scrollToPixel(0, contentRange)` zeigt die letzte Zeile ganz.
   - Gekappte Höhe (1 Mio. × 20 px): Balken ans Ende ziehen → letzte Zeile sichtbar, Mitte → Zeile ~500.000.
   - Variable Höhen ohne `getConstantRowHeight` (z. B. abwechselnd 20/40): Inhalt = Summe, wie `RowLayout`.
   - Header/Footer: dieselbe Regel für `getAreaHeight("header"|"footer")` (Padding), mindestens ein Fall mit eigener
     Header-Höhe.
   - Bestehende Modelle mit Standardhöhen (`AreaModelObjectArray`, Baum, Gruppen, Pivot, Master/Detail): Scrollhöhe
     unverändert (Regressions-Snapshot der Werte vor der Änderung).
2. **Umsetzung:** **eine** Quelle für die Body-Höhe: `getAreaHeight("body")` bzw. `contentHeightInPx` aus derselben
   Logik wie `RowLayout` (konstante Höhe des Modells vor `defaultRowHeights`, sonst Summe von `getRowHeight`; O(1) bei
   konstanter Höhe, keine O(n)-Schleife je `repaintHard` für Millionen Zeilen). Prüfen, wie die eingebauten
   Area-Modelle `getRowHeight` heute aus `defaultRowHeights` ableiten, damit sich für sie nichts ändert. Die Regel
   „`defaultRowHeights` gilt nur, wenn das Modell keine eigene Höhe hat“ in JSDoc von `TableFactory`
   (`defaultRowHeights`), `AreaModelIf.getRowHeight`/`getConstantRowHeight` und `instructions.md` festhalten.
3. **Das „+1“** in `resetSizeOfWrapperDiv` (`ele-scope.ts`, „we want to see the last horizontal border“): Füllt der
   Inhalt den Body genau, entsteht dadurch ein 1-px-Balken. Prüfen, ob das +1 nur nötig ist, wenn eine untere bzw.
   horizontale Linie sichtbar ist (`horizontalBorderVisible`, `tableBottomBorderVisible`); falls ja, nur dann addieren.
   Mit Test (Inhalt = Body-Höhe exakt, Linien aus → kein Balken).

---

## Doku und Abschluss

- `instructions.md`: Abschnitt zu `repaintHard`/`scrollToPixel` (Live-Daten, wachsende Zeilen, Position halten) mit
  Beispiel für einen Live-Tail; Regel zu `defaultRowHeights` vs. Höhe des Area-Modells.
- `packages/angular-table/instructions.md` Abschnitt 13 („Live updates“) um den Live-Tail-Fall ergänzen.
- `CLAUDE.md` §3.3 (Virtual Scrolling): Render-Anzahl je `repaintHard`, eine Höhenquelle.
- `TODO.md`: Eintrag „Gefunden im log-commander-Spike“ mit beiden Befunden, nach Abschluss abhaken.
- `prompts/README.md`: Status 017.
- Phase 10 vollständig, Release-Block nennen (nicht ausführen). Abschluss-Review durch einen separaten Agenten,
  Schwerpunkte: alle Aufrufer von `adjustContainersAndRows`, `pendingContentScroll` nach dem Umbau, rtl, Master/Detail
  (Zusatzhöhen in `getBodyContentHeight`), keine Verhaltensänderung für Tabellen mit Standardhöhen.

## Nicht tun

- Kein „sparse row heights“ / Zeilenumbruch: im log-commander verworfen (feste Zeilenhöhe).
- Keine Optimierung „nur geänderte Zeilen neu aufbauen“ in diesem Prompt (eigener TODO-Punkt, falls gewünscht).
- Keine Option zum Ausblenden des Balkens bauen (siehe Teil B), kein Release ohne Marc.
