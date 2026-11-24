# 026 – E2E-Tests mit Playwright: Smoke je Showcase, Demo und Training-Kapitel, später Screenshots und Videos

> Für eine neue Claude-Sitzung im Mono-Repo. Zuerst `prompts/000-arbeitsweise.md` lesen (Phasen, Regeln, Phase 10 =
> Release-Block). **Test-Infrastruktur-Prompt** (kein Core-Feature): Phasen 4–9 aus 000 entfallen bis auf die Doku.
> **Haltepunkt nach Phase 1** (Design-Notiz `prompts/026-e2e-playwright.design.md`, 1–2 Seiten, Entscheidungen unten).
> Branch: `test/e2e-playwright`. Kein Core-Code, also **kein** Versionssprung nötig; falls doch Core-Fehler auffallen:
> zuerst roter Vitest-Test im Core, Fix in einem eigenen Commit, dann gilt die Zielversion nach
> `packages/table/package.json` (Stand 24.11.2026: 1.1.116 → 1.1.117).
>
> Umfang: Etappe 1 = M, Etappe 2 = S–M, Etappe 3 = S. Jede Etappe ist für sich mergebar.

## Warum

Die Core-Tests (Vitest-Browser über `@vitest/browser-playwright`, ~930 Specs) prüfen die Tabelle **im selben Kontext**
– Spies, Render-Zähler, `tableScope`. Sie bleiben, wie sie sind; dieser Prompt baut **nichts** davon um.

Es fehlt die Ebene darüber: ob die **gebauten Apps** überhaupt etwas zeigen. Fehler, die heute kein Test findet:
- leere Angular-Demo durch zwei Angular-Versionen im Vite-Vorab-Bundle („Cannot read properties of undefined (reading
  'None')“, CLAUDE.md §2),
- leere Showcase-Tabellen, wenn `pre:build` die dists nicht nach `public/scripts/` kopiert hat,
- CSS-Imports in Client-Skripten, die im Produktions-Build der Website fehlen (§11),
- Konsolenfehler/-warnungen in Demos (wie G10 aus 025),
- Firefox läuft nirgends; WebKit nur für `*.realmouse.browser.spec.ts`.

Dazu später: visuelle Regression (Theming, Dark Mode, RTL, Website-Kopie `src/styles/ge-table.css`) und
reproduzierbare Video-Aufnahmen für die Reihe „GuiExpert Table in 60 Sekunden“ (§10).

## Bestand (vorher ansehen)

- Website-Showcases: `apps/webpage-guiexpert/src/pages/showcase/*/run.astro` (Stand 24.11.2026: 40 Ordner). **Platzhalter**
  `sorting1`, `inputfilter`, `sliderfilter`, `renderer1`, `rowspan`, `nobel` (§6) – Smoke prüft nur „lädt ohne Fehler“
  und markiert sie (`test.fixme` oder eigene Liste), keine Inhalts-Assertions.
- Training: `apps/webpage-guiexpert/src/training/chapters.ts` (Register, 40 Kapitel), Live-Demos
  `src/training/demos/*.ts`, `runtime.ts` (`?demos` startet alle Demos sofort – genau richtig für E2E).
- `apps/webpage-guiexpert/scripts/training-screenshots.mjs`: nutzt `playwright` **schon** (global installiert), Tabelle
  `DEMOS` mit Aktionen je Demo (`button`, `search`, `drag`, `contextmenu` …). Etappe 2 übernimmt diese Tabelle
  bzw. das Skript in das neue Paket – nicht doppelt pflegen.
- Demo-Apps: `apps/table-demo/*.html` (23 Seiten), `react-/preact-/solid-/svelte-/vue3-table-demo`, `vue3-multi-demo`,
  `webcomponent-table-demo`, `ts-todo-demo`, `angular-table-demo` (Angular 17, `ng build`), `angular-signal-demo`
  (Angular 22, gegen `angular-builds/ng22/dist`).
- Videos: `videos/NN-slug/` (`script.md`, `snippet.ts`).
- Pipeline lokal: `scripts/ci-local.mjs` (`pnpm ci:local`), GitHub: `.github/workflows/ci.yml`, `test-core.yml`,
  `test-wrappers.yml`.

## Phase 1 – Entscheidungen 🛑 (Design-Notiz, dann warten)

| Frage | Optionen | Empfehlung (prüfen) |
|---|---|---|
| Ort | `apps/e2e` (vom Workspace `apps/*` schon erfasst) / `tests/e2e` (neuer Eintrag in `pnpm-workspace.yaml`) | `apps/e2e`, Paketname `e2e` (privat) |
| Version | `@playwright/test` | **exakt** wie `playwright` in `packages/table` (1.64.0) – sonst zweite Browser-Version im Lockfile/Cache. Lockfile-Diff prüfen (§2 „Abhängigkeits-Fallen“: keine neuen Transitive wie Babel 8) |
| Server | Dev-Server (`vite`, `astro dev`) / Produktions-Build + `preview` | **Build + preview** (findet Build-Fehler wie fehlendes CSS); Dev nur lokal per Flag. `webServer` in `playwright.config.ts`, je App ein Port |
| Website-Voraussetzung | – | `pnpm build:core` + Demo-Paket-Build, dann `pnpm --filter webpage-guiexpert build` (inkl. `pre:build`) |
| Liste der Ziele | hart codiert / aus dem Dateisystem bzw. `chapters.ts` | **generiert**: Showcases aus `src/pages/showcase/*/`, Kapitel aus `chapters.ts`, `table-demo` aus `*.html` – neue Seite = automatisch getestet; Platzhalter in einer Ausnahmeliste |
| Browser | Chromium / + Firefox / + WebKit | Etappe 1: Chromium **und** Firefox, WebKit als eigenes Projekt (lokal optional) |
| Angular-Demos | mit / ohne | mit (genau der Fall „leere Seite“); `angular-table-demo` braucht `ng build` – Laufzeit messen |
| CI | sperrend / nicht sperrend | neuer Workflow `e2e.yml` (Ubuntu), erst **nicht sperrend** (`continue-on-error`), Artefakt mit Trace/Screenshots bei Rot; in `pnpm ci:local` als letzter Schritt hinter einem Flag (`--e2e`) oder fest – nach Laufzeit entscheiden (Ziel ≤ 2 min) |
| Konsole | nur Fehler / auch Warnungen | `pageerror` + `console.error` = rot; `console.warn` = rot außer einer kleinen, begründeten Erlaubt-Liste |

## Etappe 1 – Smoke-Tests (Pflicht)

Je Ziel **ein** Test, kurz und robust (keine Pixel, keine Textbreiten):

1. Seite lädt (Status 200), kein `pageerror`, kein `console.error`, keine nicht erlaubte `console.warn`, keine
   fehlgeschlagenen Requests auf eigene Assets (404 auf `/scripts/…`, CSS).
2. Mindestens eine Tabelle: `.ge-table` sichtbar, Host hat Höhe > 0, Body hat ≥ 1 gerenderte Zeile
   (`.ge-table-body-center [data-row-index]`) – außer Seiten, die bewusst leer starten (Overlay-Demos: dann
   `.ge-table-overlay` sichtbar).
3. Eine Mini-Interaktion, wo billig: einmal scrollen (`wheel`) → andere erste Zeile; Klick auf eine Zelle → Fokus.
   Nur dort, wo es ohne Sonderwissen geht; sonst weglassen.
4. Training: Kapitelseite mit `?demos` → jede `<LiveDemo>` hat eine Tabelle (Anzahl Demos = Anzahl Tabellen), Links
   auf Showcases/Kapitel liefern 200 (der Build prüft schon vieles – nur ergänzen, was fehlt).
5. Framework-Demos: je App ein Test; Angular-Demos zusätzlich „genau eine Angular-Version geladen“ (z. B. kein
   doppeltes `ng-version` bzw. kein Fehler aus Punkt 1).

Struktur (Vorschlag): `apps/e2e/playwright.config.ts`, `apps/e2e/targets.ts` (generiert die Liste),
`apps/e2e/fixtures.ts` (Konsolen-/Request-Wächter als Fixture, automatisch für jeden Test),
`apps/e2e/specs/showcases.spec.ts`, `training.spec.ts`, `table-demo.spec.ts`, `framework-demos.spec.ts`.
Scripts im Root: `pnpm test:e2e` (alles), `pnpm test:e2e:website`, `pnpm test:e2e:demos`.

Gefundene Fehler: **nicht** im E2E-Paket umgehen. Website/Demo-Fehler direkt fixen (eigener Commit), Core-Fehler
mit rotem Vitest-Test zuerst; Platzhalter und Unklares in `TODO.md`.

## Etappe 2 – Screenshots / visuelle Regression

- `expect(page).toHaveScreenshot()` für eine **kleine, stabile** Auswahl: je Showcase ein Bild in light **und** dark
  (`html[data-theme]`), dazu RTL (`rtl`), Kacheln (`covergrid`), Spreadsheet, Spaltenfilter-Popup offen.
- Stabil machen: feste Viewport-Größe, `reducedMotion`, Fonts geladen abwarten, Animationen aus, Zufallsdaten nur mit
  festem Seed (Live-Demos wie `logtail`/`crypto` anhalten oder ausnehmen), Zeit einfrieren (`page.clock`).
- Baselines **je Plattform** (`linux-ci` in CI, `macos-local` lokal – wie `perf/baseline.json` aus 021), Ordner
  eingecheckt, Update per `pnpm test:e2e:update`. Toleranz (`maxDiffPixelRatio`) im Design festlegen.
- `training-screenshots.mjs` darauf umstellen (gleiche `DEMOS`-Tabelle, Ausgabe nach `SHOTS_OUT`), damit die Poster
  der Live-Demos und die Regressions-Bilder aus **einer** Quelle kommen. Altes Skript entfernen oder als dünnen Aufruf
  behalten (im Design entscheiden); `CLAUDE.md` §11 anpassen.
- Zuerst **nicht sperrend**; nach zwei Wochen ohne Fehlalarm sperrend machen (Termin in `TODO.md`).

## Etappe 3 – Video-Aufnahmen

- Eigenes Playwright-Projekt `video` (nie in CI, nie in `test:e2e`): `use: { video: { mode: "on", size } }`,
  Hochformat 1080 × 1920 bzw. 1920 × 1080 (§10 „Hochformat-tauglich“), langsame, menschliche Bewegungen
  (`page.mouse.move` mit `steps`, Pausen), optional sichtbarer Mauszeiger per injiziertem CSS.
- Je Folge eine Datei `videos/NN-slug/record.e2e.ts` (oder im E2E-Paket `recordings/NN-slug.ts`, im Design
  entscheiden), die die Demo der Folge bedient – deckt sich mit `script.md` (Hook → Code → Ergebnis live).
  Pilot: zwei vorhandene Folgen (z. B. `01-zwei-millionen-zeilen`, `16-spaltenfilter`).
- Script `pnpm record:video <NN-slug>` → WebM nach `videos/NN-slug/out/` (git-ignored).
- Nebeneffekt: die Aufnahme belegt, dass das gezeigte Snippet gegen die echte API läuft (§10).

## Doku

- `CLAUDE.md`: §1 Layout (`apps/e2e`), §2 Befehle (`test:e2e`, `record:video`), §6 Tests (neue Ebene, Abgrenzung zu
  Vitest: „Core-Verhalten → Vitest, gebaute Apps → Playwright“), §11 Screenshots, ggf. §2 Abhängigkeits-Fallen.
- `apps/e2e/README.md` (kurz: Voraussetzungen, Befehle, neue Seite = automatisch dabei, Ausnahmeliste, Baselines
  aktualisieren).
- `prompts/000-arbeitsweise.md`: in Phase 5/6 ein Satz „neue Demo-/Showcase-Seite läuft im E2E-Smoke mit; neue
  Ausnahme begründen“.
- `TODO.md` (gefundene Fehler, Termin „sperrend“), `prompts/README.md` (Zeile 026 + Status).
- Kein Training-Kapitel, keine Video-Folge, kein Demo-Repo-Tag.

## Fertig, wenn

- Etappe 1: `pnpm test:e2e` grün in Chromium und Firefox, jede Showcase-, Kapitel- und Demo-Seite hat einen Test
  (Liste generiert, Ausnahmen begründet), Laufzeit notiert, `e2e.yml` läuft (nicht sperrend), `pnpm ci:local` bleibt
  grün; die Core-Tests sind unverändert.
- Etappe 2: Baselines für `linux-ci` und `macos-local`, `training-screenshots.mjs` nutzt dieselbe Quelle.
- Etappe 3: zwei Pilot-Videos aufgenommen, Befehl dokumentiert.
- Abschlussbericht: gefundene Fehler (mit Commit), Laufzeiten je Etappe, Lockfile-Änderungen. Release-Block (Phase 10)
  nur, wenn Core-/Paket-Code geändert wurde; sonst Merge-Block ohne `version:patch` – ausführen tut ihn Marc.
