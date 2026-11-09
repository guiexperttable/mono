# 021 – Performance-Regressionsschutz: Design und Befund

> Zu `prompts/021-performance-regressionsschutz.md`. Branch `test/performance-regressionsschutz` (gestapelt auf
> `fix/klick-trotz-api-render`, 018). Marc hat die Prompts 016 → 018 → 021 → 019 → 020 am 09.11.2026 „selbständig“
> beauftragt – der Haltepunkt nach Phase 1 entfällt, die Entscheidungen stehen hier zur Durchsicht.

## Entscheidungen

| # | Frage | Entscheidung | Begründung |
|---|---|---|---|
| 1 | Zellbau zählen | **`MutationObserver`** auf dem Host (`countCellBuilds`), Zählung über ein `Set` der eingefügten `.ge-table-col-div` | unabhängig von Interna (jeder Weg, der eine Zelle baut, zählt); `takeRecords()` liest synchron, kein Warten. Ein Spy auf den `domService` wäre an `createElement`-Aufrufe gebunden, die auch Hover-/Fokus-Divs bauen |
| 2 | Grenzwert/Statistik | Median, **Verhältnis ≤ 2** mit **0,5 ms Schlupf** (`max(2 × klein, klein + 0,5 ms)`), 5 Aufwärm- + 21 Messläufe, kurze Operationen `inner` 5–10 je Lauf, `retry: 1` | 10 Läufe lokal: Verhältnisse 0,5–1,2 (s. u.); `performance.now()` ist auf 0,1 ms vergröbert – unter 0,5 ms ist ein Verhältnis Rauschen. Der Median war stabil genug; das Minimum hätte Frame-Effekte verdeckt (bimodales `updateCells` vor `inner: 10`) |
| 3 | Notbremse ×3 = rot in Stufe 3 | **nein** (nur Warnung) | absolute Zeiten auf geteilten Runnern schwanken 2–3×; Rückschritte findet Stufe 2 (Verhältnis), Stufe 3 zeigt den Trend |
| 4 | `test:perf` auf macOS | **nur Ubuntu** | der macOS-Runner ist langsamer/teurer; die Verhältnisse sind plattformunabhängig. Lokal schreibt der Reporter `macos-local` |
| 5 | Wann sperrt Stufe 2 | nach **20 grünen CI-Läufen** ohne Wackler, frühestens 01.12.2026 (`TODO.md`) | Streuung auf dem Runner erst nach Pushes bekannt |
| 6 | Szenarien Baum/Gruppen/Pivot/Master-Detail/Spreadsheet | **später je Feature** | jedes Feature, das den Render-Pfad ändert, bringt nach der neuen Regel (000, Phase 2) sein Szenario mit; die Grundpfade (Scroll, Update, Eingabe) sind abgedeckt |

Weitere Klärungen aus Phase 1:

- `userEvent` (Playwright-Provider) sendet echte Eingaben, prüft aber vor dem Klick die Actionability („stable“) und
  klickt als **eine** Aktion – ein Render zwischen `down` und `up` ist damit nicht möglich. Dafür gibt es seit 018
  `test-utils/real-mouse.ts` (Vitest-Commands `geMouseMove/Down/Up` → Playwright `page.mouse`, Koordinaten ins Test-iframe
  umgerechnet, `frameElement().boundingBox()` + Skalierung).
- Das erste `ResizeObserver`-Callback nach dem Aufbau rendert einmal (entprellt, Default 500 ms). Zähl-Specs setzen
  `resizeEventDebounceDelay: 10` und warten es ab, sonst zählt ein beliebiger späterer Schritt einen Render zu viel
  (zunächst als „Hover rendert“ fehlgedeutet).

## Stufe 1 – Invarianten (`src/lib/table/perf-invariants.browser.spec.ts`, in `test:browser`, ltr + rtl)

Helfer `test-utils/perf-counters.ts`: `countRenders` (Spy auf `adjustAfterScrolling`), `countCellBuilds`
(`MutationObserver`), `countCalls`, `countRowLayoutBuilds` (Spy auf `RowLayout.setRows` der Instanz),
`visibleBodyCells`, `expectSameArray`. `repaint-count.browser.spec.ts` (017) behält seinen eigenen Spy – gleiche Methode.

| Vorgang | Erwartung (gegen 1.1.107 bestätigt) |
|---|---|
| Scrollen um eine Zeile / weit weg | 1 Render; neu gebaute Zellen = sichtbare Body-Zellen + Header-Zellen (jeder Render baut die Header-Zeile mit); `getValueAt` ≤ 2 × sichtbare Zellen; 10.000 vs. 1 Mio. Zeilen gleich (± eine angeschnittene Zeile – über 8 Mio. px ist der Balken skaliert); kein `RowLayout`-Neuaufbau |
| `tableApi.repaint()` | 1 Render, `RowLayout` **1×** neu – **NOTE**: das öffentliche `repaint()` verwirft abgeleitete Werte und Positionen (`invalidateAggregates`, so dokumentiert in CLAUDE.md §3.3); O(1) bei konstanter Höhe. Der Prompt erwartete „nur bei `repaintHard`“ – stimmt für das interne `repaint()` (Fokus, Auswahl, Klick): 0 |
| `repaintHard()` / `repaintHard({ py })` | 1 Render (inkl. Scroll-Event), `RowLayout` 1× |
| `repaint()` | Zellen neu = sichtbare Body- + Header-Zellen |
| `updateCells` (3 Zellen) | 0 Renders, 3× `setValue`, 0 neue Zell-Divs (Inhalt ersetzt), `RowLayout` bleibt; mit `repaintAll` 1 Render |
| Klick (`range`) mit echter Maus | 0 Renders während des Drückens, ≤ 1 nach `mouseup` |
| Hover (10 Bewegungen) | 0 Renders |
| ↓ im sichtbaren Bereich | ≤ 1 Render, `RowLayout` bleibt |
| ↓ am unteren Rand | ≤ 2 Renders – **NOTE**: Scroll-Event (1) + Fokus-Repaint (1); einer würde reichen (`TODO.md`) |
| Spaltenbreite ziehen (10 Bewegungen, echte Maus) | ≤ 12 Renders (je Bewegung + Start/Ende), `RowLayout` bleibt |
| `sortByColumn` (10.000) | Comparator-Aufrufe ≤ 2 · n log₂ n, 1 Render |
| `externalFilterChanged` (10.000) | Filterfunktion genau n-mal, 1 Render |
| Host-Größe ändern (2 Änderungen in einem Task) | 1 Render (entprellt) |

Keine Abweichung war ein Fehler im engeren Sinn – zwei `NOTE`s (s. o.), kein `it.fails`.

## Stufe 2 – Verhältnisse (`perf/`, `pnpm test:perf`)

`perf/vitest.perf.config.ts` (eigenes Vitest-Browser-Projekt, Chromium, `fileParallelism: false`, `retry: 1`, nicht in
`pnpm test`), `perf/measure.ts` (`measure`, `summarize`, `expectScalesFlat`, `report`), `perf/perf-models.ts`
(`BigBody`: Werte auf Abruf, 10 Mio. Zeilen ohne Speicher), `perf/table.perf.ts`.

Streuung, 10 Läufe hintereinander auf dem Mac (M-Serie, headless Chromium, 09.11.2026), Median in ms:

| Szenario | klein → groß | klein | groß | Verhältnis min–max |
|---|---|---|---|---|
| Scroll-Render, konstante Höhe (Mitte des Inhalts) | 10.000 → 10 Mio. | 3,12–3,22 | 3,10–3,16 | 0,97–1,01 |
| Scroll-Render, variable Höhen | 10.000 → 2 Mio. | 2,32–2,34 | 2,30–2,34 | 0,99–1,01 |
| `repaintHard({ py })` Live-Tail (+500 Zeilen) | 100.000 → 10 Mio. | 5,1–5,6 | 4,2–5,7 | 0,75–1,12 |
| `updateCells` 50 Zellen (`inner: 10`) | 10.000 → 10 Mio. | 0,52–0,62 | 0,59–0,63 | ~1,0–1,2 (5 Läufe) |
| `scrollToIndex` / `ensureRowIsVisible` | 10.000 → 10 Mio. | 4,9–5,2 | 4,9–5,3 | 0,96–1,08 |
| horizontal, Spalten | 100 → 10.000 | 5,9–6,2 | 5,9–6,0 | 0,96–1,02 |
| echter Klick: `mouseup` → `onMouseClicked` | 10.000 → 10 Mio. | 0,1–0,2 | 0,1 | (Schlupf) |
| echte Taste ↓/↑: `keydown` → `onFocusChanged` | 10.000 → 10 Mio. | 0,3–0,4 | 0,3 | (Schlupf) |

Alle 10 Läufe grün. Vor `inner: 10` war `updateCells` bimodal (1,1 / 2,3 ms, Verhältnis bis 2,0).

## Stufe 3 – Trend

`perf/perf-reporter.ts` (Vitest-Reporter, Node): sammelt die `task.meta.perf`-Einträge, schreibt
`perf/results/latest.json` (git-ignored: Plattform, Commit, Node, je Szenario/Variante n, Median, p95, Minimum) und
vergleicht mit `perf/baseline.json` derselben Plattform (`linux-ci`, `macos-ci`, lokal `<os>-local`). Ab **×1,5 und
mindestens +0,3 ms**: Warnung – Konsole (⚠ in der Tabelle), in GitHub Actions `::warning::` + Tabelle in
`$GITHUB_STEP_SUMMARY`. `pnpm --filter @guiexpert/table perf:baseline [datei]` (`perf/update-baseline.mjs`) übernimmt
`latest.json` (oder das CI-Artefakt) als Baseline seiner Plattform. Lokal belegt (Baseline `macos-local` erzeugt,
danach Warnung bei künstlichem Rückschritt). Die eingecheckte `baseline.json` ist leer – die erste `linux-ci`-Baseline
kommt aus dem ersten CI-Lauf (Artefakt `perf-results`).

`bench/` (Node, `vitest bench`) bleibt wie er ist – die Trend-Ausgabe dort anzuhängen wäre ein eigener Reporter für
`bench` (Format `BenchmarkResult`), nicht „einfach“; nicht gemacht.

## CI

`test-core.yml` Job `test-perf` (Ubuntu, `continue-on-error: true`, ohne Secrets/`id-token`, Artefakt `perf-results`).
Stufe 1 läuft mit `test:browser` in `test-core` und `test-core-macos` und sperrt den Release. Ein CI-Lauf braucht einen
Push – offen (kein Push ohne Freigabe).

## Gegenprobe (Phase 6)

| Künstlicher Rückschritt | Stufe 1 | Stufe 2 |
|---|---|---|
| R1 `repaintHard` rendert zweimal | **rot** (6 Tests) | grün (Verhältnis bleibt) |
| R2 `updateCells` erzwingt `repaintAll` | **rot** (2 Tests) | grün |
| R3 `getBodyRowTop` ohne Prefix-Summen (O(Index)) | grün | **rot** (`scrollToIndex`: 4,9 → 14,9 ms; echter Klick 0,1 → 5,6 ms) |
| R4 `RowLayout` bei jedem Render neu (O(n) bei variablen Höhen) | **rot** (12 Tests) | **rot** (variable Höhen 2,4 → 6,6 ms) |

Jeder Rückschritt wird gefunden; Zählen und Messen ergänzen sich.
