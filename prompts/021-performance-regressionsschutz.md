# 021 – Performance-Regressionsschutz mit Vitest: zählen, Verhältnisse messen, Trend beobachten

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Regeln, Phase 10 =
> Merge-/Release-Block). **Test-Infrastruktur, kein Feature**: Phasen 5–9 (Demos, Website, Training, Demo-Repo, Video)
> entfallen. **Haltepunkt nach Phase 1** (Szenarien, erwartete Zahlen, Entscheidungen in
> `prompts/021-performance-regressionsschutz.design.md`). Branch: `test/performance-regressionsschutz`.
>
> **Reihenfolge:** nach 018, **vor 019**. 019 (Live-Append) hängt seine Szenarien in diese Infrastruktur ein,
> statt eigene Zeitmessungen zu bauen.
>
> Herkunft: Marc (08.11.2026): „Ich möchte verhindern, dass künftige Änderungen unbemerkt ein Performance-Problem
> verursachen.“ Anlass: Bis 1.1.106 renderte jedes `repaintHard()` mit Position drei- bis viermal (017), ohne dass ein
> Test es bemerkte. Entscheidung: **nur Vitest** (Browser-Modus mit dem vorhandenen Playwright-Provider), **kein E2E**
> gegen Website oder Showcase.

## Ziel

Eine Änderung, die den Render-, Scroll-, Update- oder Eingabepfad langsamer macht, fällt in der CI auf, **bevor** sie
veröffentlicht wird. Dabei gilt:

- **keine Tests, die zufällig rot werden.** Absolute Millisekunden schwanken auf geteilten CI-Rechnern um das Zwei- bis
  Dreifache. Ein Test mit engen Grenzen wird abgeschaltet, einer mit weiten Grenzen findet nichts.
- **keine neuen Abhängigkeiten** (`vitest` 5, `@vitest/browser-playwright` 5.0.4 und `playwright` 1.64 sind da;
  Lockdatei unverändert, CLAUDE.md §2 „Abhängigkeits-Fallen“).
- **keine Zeit-Assertions in `test:unit`/`test:browser`** (CLAUDE.md §6) – Zeiten nur im neuen Projekt `test:perf`.

## Drei Stufen

### Stufe 1 – Zählen statt messen (in `test:browser`, sperrt den Release)

Prüft Arbeit, nicht Zeit: fällt auf jedem Rechner gleich aus und findet den typischen Rückschritt („ruft jetzt
zusätzlich `setRows`/`reSort`/einen Render auf“, „baut alle Zellen statt einer neu“, „läuft über alle Zeilen“).

Helfer `packages/table/test-utils/perf-counters.ts` (nie im npm-Paket), z. B.:

- `countRenders(scope)` – Spy auf `adjustAfterScrolling` (Muster: `repaint-count.browser.spec.ts`, dort zusammenführen);
- `countCellBuilds(host)` – neu eingehängte Zell-Divs je Vorgang (`MutationObserver` auf die Areas oder Spy auf den
  `domService`; welches stabiler ist, in Phase 1 entscheiden);
- `countCalls(obj, method)` – Aufrufzähler für teure Pfade (`getValueAt`, `externalFilterFunction`, `sortComparator`,
  `getRowHeight`, `RowLayout`-Neuaufbau);
- `expectSameArray(before, after)` – Identität statt Kopie.

Szenarien (je ltr **und** rtl, wo die Richtung eine Rolle spielt; mit `test:browser:scrollbars` grün):

| Vorgang | Erwartung (in Phase 1 gegen den heutigen Code bestätigen) |
|---|---|
| Scrollen um eine Zeile / weit weg | 1 Render je Scroll-Event; Zellen neu ≈ sichtbare Zellen; `getValueAt` ≈ sichtbare Zellen, unabhängig von n |
| `repaint()` / `repaintHard()` / `repaintHard({ py })` | je 1 Render (017); `RowLayout` nur bei `repaintHard` neu |
| `updateCells` mit 3 Zellen | 0 volle Renders, 3 Zellen neu gezeichnet; mit `repaintAll` 1 Render |
| Klick auf eine Zelle (`range`) | Renders nach `mouseup` ≤ 1 (`debounceRepaint`), keiner während des Drückens |
| ↓ innerhalb des sichtbaren Bereichs / am unteren Rand | ≤ 1 Render; kein `RowLayout`-Neuaufbau |
| Mausbewegung (Hover) | kein voller Render je `mousemove` (heutiges Verhalten festhalten) |
| Sortieren (Header, `sortByColumn`) | Comparator-Aufrufe ≤ c · n log n; 1 Render |
| Filter (`externalFilterChanged`) | Filterfunktion genau n-mal; 1 Render |
| Spaltenbreite ziehen (10 `mousemove`) | Renders ≤ Anzahl Bewegungen; kein `RowLayout`-Neuaufbau |
| Größe des Hosts ändern | Renders je `resize` (entprellt) ≤ 1 |

Weicht das heutige Verhalten ab: **Charakterisierungstest** (`it.fails('<richtiges Verhalten>')` + `// BUG:` bzw.
`// NOTE:` bei fraglichem, evtl. gewolltem Verhalten) + Eintrag in `TODO.md` – **nicht** in diesem Prompt beheben
(eigener Prompt, wenn es sich lohnt). Datei z. B. `src/lib/table/perf-invariants.browser.spec.ts`.

### Stufe 2 – Verhältnis statt Absolutwert (`test:perf`)

Eigenes Vitest-Browser-Projekt **außerhalb von `src/`** (wie `bench/`: keine Coverage, nie im npm-Paket):
`packages/table/perf/vitest.perf.config.ts` + `perf/*.perf.ts`, Chromium headless über den vorhandenen Provider
(`CHROMIUM_PATH` wie in `vitest.config.ts`), fester Viewport, **`fileParallelism: false`**, keine anderen Tests
parallel. Scripts: `pnpm --filter @guiexpert/table test:perf` und Root `pnpm test:perf`. Läuft **nicht** in
`pnpm test` / `test:core` (sonst zu langsam und zu laut).

Messhelfer `perf/measure.ts`: Messung **in der Seite** (`performance.now()` um den synchronen Teil, `nextFrame()` für
den Frame danach), Aufwärmen (z. B. 5 Läufe), dann N Läufe (z. B. 21), Median und p95;
`expectScalesFlat(small, large, maxRatio)`. Prinzip: **dieselbe Operation** bei kleinem und großem n – die
Rechnergeschwindigkeit kürzt sich heraus, geprüft wird die Komplexität.

| Szenario | klein → groß | Erwartung |
|---|---|---|
| Scroll-Render, konstante Zeilenhöhe | 10.000 → 10 Mio. Zeilen | Verhältnis ≤ 2 (O(1)) |
| Scroll-Render, variable Höhen (`RowLayout`, 1.1.97) | 10.000 → 2 Mio. | ≤ 2 (O(log n)) |
| `repaintHard({ py })` mit wachsendem Body (Live-Tail, 017) | 100.000 → 10 Mio. | ≤ 2 |
| `updateCells` (50 Zellen) | 10.000 → 10 Mio. | ≤ 2 |
| `scrollToIndex` weit weg / `ensureRowIsVisible` | 10.000 → 10 Mio. | ≤ 2 |
| echter Klick → `onMouseClicked` (`userEvent.click` des Playwright-Providers) | 10.000 → 10 Mio. | ≤ 2 |
| echte Taste ↓ → `onFocusChanged` (`userEvent.keyboard`) | 10.000 → 10 Mio. | ≤ 2 |
| viele Spalten (horizontal virtuell) | 100 → 10.000 Spalten | ≤ 2 |

Zusätzlich je Szenario die absolute Zeit (Median, p95) erfassen – für Stufe 3, **ohne** Assertion.

In Phase 1 klären:
- Sendet `userEvent` mit dem Playwright-Provider in Vitest 5 echte (trusted) Eingaben, und wie verhält es sich, wenn
  das Ziel-Element während des Klicks ersetzt wird (Actionability-Prüfung „stable“)? Für Fälle, die rohe
  `mouse.down()`/`mouse.up()` brauchen (018, 019): eigener Vitest-Browser-Command mit Playwright `page.mouse`
  (Vitest-`commands`-API) – Umrechnung der Koordinaten ins iframe des Testers prüfen. Der Helfer gehört hierher, die
  Szenarien bringen 018/019 mit.
- Grenzwert (≤ 2? ≤ 1,5?) aus der Streuung von 10 Läufen lokal **und** auf dem CI-Runner festlegen; `retry: 1` für das
  Projekt ja/nein.
- Reicht der Median, oder ist das Minimum der Läufe stabiler (weniger Störung durch GC/andere Prozesse)?

### Stufe 3 – Absolute Zahlen als Trend (Warnung, kein Rot)

- `test:perf` schreibt `perf/results/latest.json` (git-ignored): je Szenario Median, p95, n, Plattform, Chromium-Version,
  Commit.
- Vergleich mit einer eingecheckten **Baseline** `perf/baseline.json` – je Plattform (`linux-ci`, `macos-ci`), erzeugt auf
  dem **CI-Runner**, nicht auf Marcs Mac. Ab z. B. +50 % (in Phase 1 festlegen): Warnung – in der CI als
  `::warning::`-Annotation und Tabelle in `$GITHUB_STEP_SUMMARY` (vorher/nachher je Szenario), lokal als Konsolen-Tabelle.
- Baseline bewusst erneuern: Script `perf:baseline` (übernimmt `latest.json` bzw. das CI-Artefakt), beim Release-Schritt
  in `RELEASING.md` erwähnen; der Commit zeigt die Veränderung.
- Optional eine **Notbremse** (z. B. × 3 gegenüber der Baseline = rot) – Entscheidungsfrage 3.

`vitest bench` (`bench/`, Node) bleibt für DOM-freie Teile (Formeln, Pivot, Gruppen, Sheet) wie er ist; in Phase 1
prüfen, ob dieselbe Trend-Ausgabe auch dort einfach anzuhängen ist (nur dann).

## CI

- Stufe 1 läuft automatisch mit `test:browser` in `test-core.yml` (Ubuntu **und** `test-core-macos`) → sperrt den
  Release wie bisher.
- Stufe 2/3: neuer Job `test-perf` in `.github/workflows/test-core.yml` (Ubuntu; macOS in Phase 1 entscheiden), Artefakt
  `perf-results` (JSON + Summary). **Zunächst nicht sperrend** (`continue-on-error: true`), bis die Streuung über
  ~20 Läufe bekannt ist; danach Verhältnis-Assertions (Stufe 2) sperrend, Trend (Stufe 3) bleibt Warnung. Die
  Umstellung als offenen Punkt in `TODO.md` mit Datum.
- Der Job bekommt wie die Test-Jobs kein `id-token`, keine Secrets.

## Entscheidungsfragen (Phase 1, je Optionen + Empfehlung)

1. Zellbau zählen: `MutationObserver` (unabhängig von Interna) oder Spy auf den `domService` (genauer, aber an Interna
   gebunden)?
2. Grenzwert für Verhältnisse und Statistik (Median/Minimum, N, Aufwärmen, `retry`).
3. Notbremse in Stufe 3 (× 3 = rot) ja/nein?
4. `test:perf` auch auf macOS (echte Mac-Zahlen, langsamer Runner) oder nur Ubuntu?
5. Wann wird Stufe 2 sperrend (nach n grünen Läufen / Datum)?
6. Szenarien für Baum, Row Grouping, Pivot, Master/Detail, Spreadsheet gleich mit aufnehmen oder später je Feature?
   Empfehlung prüfen: je ein Basisszenario (Scroll-Render bei großem n), Rest bei Bedarf.

## Regel für die Zukunft (Phase 4)

- `prompts/000-arbeitsweise.md` Phase 2: „Ändert ein Prompt den Render-, Scroll-, Update- oder Eingabepfad, bringt er
  eine Invariante (Stufe 1) und, wenn n eine Rolle spielt, ein `test:perf`-Szenario (Stufe 2) mit; `test:perf` gehört
  zur Abschlussprüfung (Phase 10) und die Trend-Tabelle in den Abschlussbericht.“
- CLAUDE.md §6: Zeile `test:perf` in der Befehlstabelle, kurzer Absatz „Performance-Absicherung“ (drei Stufen, Helfer,
  Baseline, CI-Job); §2 Befehlstabelle ergänzen.
- `TODO.md`: Funde aus Stufe 1 (Charakterisierungen), offene Umstellung „Stufe 2 sperrend“.

## Phasen

1. **Lesen und Befund** 🛑: `repaint-count.browser.spec.ts`, `scroll-height.browser.spec.ts`, `scroll-sync.browser.spec.ts`,
   `test-utils/mount-table.ts`, `vitest.config.ts`, `bench/`, `render-scope.ts` (`adjustAfterScrolling`, `adjustArea`,
   `updateCells`, `debounceRepaint`), `mouse-handler.ts`, `row-layout/`, `.github/workflows/test-core.yml`. Die Tabellen
   oben gegen den Code prüfen (erwartete Zahlen), Entscheidungsfragen beantworten, Design-Dokument. **Anhalten.**
2. **Stufe 1**: Helfer + Invarianten-Spec; heutiges Verhalten festhalten (Abweichungen = `it.fails`/`NOTE` + `TODO.md`).
3. **Stufe 2**: Projekt `test:perf`, Messhelfer, Szenarien; 10 Läufe lokal, Streuung ins Design-Dokument.
4. **Stufe 3**: JSON-Ausgabe, Baseline-Vergleich, Summary/Warnung, `perf:baseline`.
5. **CI**: Job `test-perf`, Artefakt. Ein Lauf auf GitHub braucht einen Push – **nur nach Freigabe**. Ohne Freigabe die
   Scripts lokal belegen und im Bericht sagen, dass der CI-Lauf offen ist. Die erste Baseline (`linux-ci`) kommt erst
   aus einem echten CI-Lauf.
6. **Gegenprobe**: einen bekannten Rückschritt **künstlich** einbauen (z. B. in `repaintHard` einen zweiten Render, in
   `updateCells` `repaintAll` erzwingen, in `getBodyRowTop` die Prefix-Summen umgehen = O(n)) → Stufe 1 bzw. 2 muss rot
   werden; danach zurücknehmen. Ergebnis-Tabelle (Rückschritt → welche Stufe hat ihn gefunden) ins Design-Dokument.
7. **Doku und Regel** (Abschnitt oben), Abschlussprüfung nach 000 Phase 10 (`test:types` deckt auch `perf/` ab – sonst
   eigenes `tsconfig`), Merge-Block. Ein Release ist nicht nötig (nichts im npm-Paket geändert) – nur nennen, wenn doch.

## Fertig, wenn

- [ ] Design-Dokument mit Szenarien, erwarteten Zahlen und Entscheidungen freigegeben 🛑
- [ ] Stufe 1: Invarianten-Spec in `test:browser` grün (ltr/rtl, auch `test:browser:scrollbars`), Abweichungen als
      Charakterisierung + `TODO.md`
- [ ] Stufe 2: `test:perf` lokal 10× hintereinander grün; Streuung dokumentiert
- [ ] Stufe 3: JSON, Baseline-Vergleich, Warnung/Summary funktionieren (lokal belegt); CI-Baseline offen oder erzeugt
- [ ] CI-Job `test-perf` angelegt (nicht sperrend), Umstellung terminiert in `TODO.md`
- [ ] Gegenprobe: jeder künstliche Rückschritt wird gefunden
- [ ] `000-arbeitsweise.md`, CLAUDE.md §2/§6, `TODO.md`, `prompts/README.md` (Zeile + Status) aktualisiert
- [ ] Keine neue Abhängigkeit, Lockdatei unverändert; kein Push/Publish ohne Anweisung; Merge-Block im Abschlussbericht
