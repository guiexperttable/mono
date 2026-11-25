# 026 – E2E mit Playwright: Design-Notiz (Phase 1) 🛑

> Stand 24.11.2026, Branch `test/e2e-playwright` (von `main` = 1.1.117, 027 ist released). Prompt:
> `026-e2e-playwright.md`. **Freigegeben 25.11.2026** (E1–E12 wie unten, Fragen 1–4 mit den Empfehlungen).
> Etappe 1 umgesetzt – Ergebnis und Abweichungen am Ende („Stand Etappe 1“).

## Bestand (geprüft)

| Baustein | Befund | Folge |
|---|---|---|
| Showcases `src/pages/showcase/*/` | 40 Ordner, je `run.astro` + `info.astro`, URL `/showcase/<n>/run/` (`showcaseUrl()`), Daten über `/scripts/table/…` (`pre:build`) | Liste aus dem Dateisystem |
| Training `chapters.ts` | 40 Kapitel, **keine Imports** → von Playwright direkt importierbar; dazu Seiten `index`, `checklist`, `build-buy-or-guiexpert` | Kapitel aus `CHAPTERS`, Zusatzseiten aus `pages/training/*.astro` |
| `<LiveDemo>` / `runtime.ts` | 41 Demos auf 32 Seiten; `?demos` startet alle, fertig = `[data-ready]`, Fehler = `.td-info` „error: …“ | genau das Signal für E2E |
| Demos `naive-table`, `virtual-scroll` | bauen eine eigene HTML-Tabelle, keine `.ge-table` | Ausnahme „eigene Tabelle“ |
| `training-screenshots.mjs` | Tabelle `DEMOS` (42 Einträge, Aktionen), globales `playwright` | Etappe 2 übernimmt sie |
| `apps/table-demo` | 23 HTML-Seiten, `vite build` | **B1** |
| Framework-Demos (9) | Vite, Alias auf `packages/*/src` (kein dist nötig); `angular-signal-demo` gegen `angular-builds/ng22/dist`; Preview-Ports kollidieren (4300 ×5) | eigener statischer Server (E3) |
| `angular-table-demo` | Angular 17, `ng build` (application builder), 22 Routen (`routerLink="/demo/…"` im Quellcode), **npm-Pakete 1.1.105** | **B2** |
| Playwright | `playwright@1.64.0` in 8 Paketen; Browser-Cache hat Chromium, Firefox, WebKit für 1.64 | `@playwright/test@1.64.0` bringt keine zweite Browser-Version |
| Website extern | keine Skripte/CSS von fremden Hosts in Layouts und Showcases | „fremder Request = rot“ ist machbar |

**Befunde (vor Etappe 1):**
- **B1** `apps/table-demo`: `vite build` baut nur `index.html` – die 22 Feature-Seiten (`row-grouping.html`, `cover-grid.html` …)
  fehlen in `dist/` (geprüft am vorhandenen dist). Fix im eigenen Commit: `build.rollupOptions.input` aus `*.html`
  erzeugen (`vite.config.ts`, ~5 Zeilen). Genau der Fehlertyp, den 026 finden soll.
- **B2** `angular-table-demo` testet die **veröffentlichten** Pakete (1.1.105), nicht den Arbeitsstand (bekannt, `TODO.md`).
  E2E prüft dort also „Demo + npm-Stand lädt“. Kopplung an lokale Builds bleibt eigener TODO-Punkt.
- **B3** Hinweis aus 027: im ausgeblendeten Browser-Bereich der App kommen `ResizeObserver`-Durchgänge nicht zuverlässig an.
  Playwright headless hat immer einen festen Viewport (1280 × 800) – für E2E kein Problem, für Handmessungen
  Viewport-Emulation nutzen.

## Entscheidungen

| # | Frage | Entscheidung | Begründung |
|---|---|---|---|
| E1 | Ort | `apps/e2e`, Paket `e2e`, `private: true` | vom Workspace `apps/*` erfasst |
| E2 | Version | `@playwright/test` **1.64.0 exakt**, `typescript` wie im Core | gleiche `playwright-core` wie Vitest → kein zweiter Browser-Download; Lockfile-Diff im Bericht (erwartet: nur `@playwright/test`) |
| E3 | Server | **Build + statisch ausliefern** über **einen** eigenen Server `apps/e2e/serve-dist.mjs` (Node `http`, ~60 Zeilen, 0 Deps): ein Prozess, ein Port je dist (4801 …), Verzeichnis → `index.html`, SPA-Fallback nur für Angular, fehlende Datei = 404. Ein `webServer`-Eintrag | Produktions-Build findet fehlendes CSS/`pre:build`; einheitlich statt 11 × `vite/astro/ng preview` mit Port-Kollisionen; 404 zuverlässig |
| E4 | Dev-Modus | `E2E_DEV=1` startet statt dessen die Dev-Server (nur lokal). Zusätzlich Projekt **`angular-dev`** (nur Chromium, nur `angular-table-demo` per `ng serve`) – der „Vite-Vorab-Bundle“-Fehler aus §2 tritt nur im Dev-Server auf | sonst fände E2E genau den Motivationsfall nicht; Laufzeit messen, notfalls hinter `--e2e-dev` |
| E5 | Builds | `pnpm test:e2e` baut **nicht**; `globalSetup` prüft, ob jedes dist existiert, und nennt sonst den Befehl. `pnpm test:e2e:build` = Core + Demo-Paket + ng22 + Website + alle Demo-Apps. In `ci:local` laufen die Builds ohnehin (`build:all`) | Tests in Sekunden wiederholbar; kein doppeltes Bauen |
| E6 | Ziele | **generiert** in `apps/e2e/targets.ts`: Showcases (`run` **und** `info`), Kapitel + Zusatzseiten, `table-demo/*.html`, Framework-Apps (`apps/*` mit `build`-Script außer Website/E2E), Angular-Routen aus `routerLink` | neue Seite = automatisch getestet; Kontrolltest: jede `pages/training/*.astro` ist Kapitel oder Zusatzseite |
| E7 | Ausnahmen | eine Datei `apps/e2e/exceptions.ts`, je Eintrag Ziel + Art + **Begründung**: `placeholder` (`sorting1`, `inputfilter`, `sliderfilter`, `renderer1`, `rowspan`, `nobel` – nur „lädt ohne Fehler“), `ownTable` (`naive-table`, `virtual-scroll`), `noInteraction`, `allowedWarning` | eine Stelle, im Review sichtbar |
| E8 | Assertions | (1) Status 200, kein `pageerror`, kein `console.error`, keine nicht erlaubte `console.warn`; eigener Request ≥ 400 oder `requestfailed` = rot; **fremder Host** = abgebrochen + rot. (2) `.ge-table` sichtbar, Host-Höhe > 0, **≥ 1 Body-Zeile** (`.ge-table-body-center [data-row-index]`) **oder** `.ge-table-overlay` sichtbar – deckt leer startende Seiten ohne Liste ab. (3) generisch: Mausrad über dem Body → andere erste Zeile (nur wenn der Viewport scrollbar ist), Klick auf eine Body-Zelle → Fokus in der Tabelle; Ausfälle → `noInteraction` mit Grund | Wächter als **Auto-Fixture** (`fixtures.ts`), gilt für jeden Test |
| E9 | Training | `?demos` → warten bis jede `.training-demo` `[data-ready]` hat (oder „error:“ = rot); je Demo ≥ 1 `.ge-table` in `.td-host` (außer `ownTable`). Ein Test „interne Links“: alle `/showcase/…`- und `/training/…`-Links der Kapitelseiten einmal (dedupliziert) per `request.get` → 200 | der Build prüft `<ChapterLink>`/`<ApiLink>` schon; nur freie `href`s fehlen |
| E10 | Angular | zusätzlich genau **ein** `[ng-version]` und dessen Major = erwartete (17 bzw. 22) | belegt „eine Angular-Version“ |
| E11 | Browser | Projekte `chromium` + `firefox` (Standard), `webkit` nur mit `E2E_WEBKIT=1`; `angular-dev` nur Chromium | Firefox läuft heute nirgends |
| E12 | CI / lokal | neuer Workflow `.github/workflows/e2e.yml` (Ubuntu, Push auf `main` + PR + manuell), Job `continue-on-error: true`, Artefakte `playwright-report` + Traces bei Rot, **nicht** in `npm-publish.yml`. `ci:local`: Schritt `pnpm test:e2e` hinter `--e2e`, fest eingebaut, sobald ≤ 2 min gemessen | erst Erfahrung sammeln; Termin „sperrend“ in `TODO.md` |

Weitere Festlegungen: `retries: 0` lokal, `1` in CI (Flake sichtbar im Report), `workers` = Standard, Trace
`retain-on-failure`, `reducedMotion: "reduce"`, Viewport 1280 × 800. Root-Scripts: `test:e2e`, `test:e2e:website`,
`test:e2e:demos`, `test:e2e:build` (Etappe 2: `test:e2e:update`, Etappe 3: `record:video`).

## Struktur

```
apps/e2e/
├── package.json  playwright.config.ts  tsconfig.json  README.md
├── serve-dist.mjs        # E3: ein statischer Server, Port je dist
├── targets.ts            # E6: generierte Zielliste (+ Kontrolltest)
├── exceptions.ts         # E7
├── fixtures.ts           # E8: Konsolen-/Request-Wächter, expectTable(), tryInteraction()
└── specs/ showcases.spec.ts  training.spec.ts  table-demo.spec.ts  framework-demos.spec.ts
```

Beispiel (Spec-Kern, ≤ 15 Zeilen):

```ts
for (const t of showcaseTargets()) {
  test(`showcase ${t.name}`, async ({ page, guard }) => {
    await page.goto(t.url);
    if (isPlaceholder(t.name)) return;               // E7: nur „lädt ohne Fehler“ (guard prüft am Ende)
    await expectTable(page);                          // E8 (2)
    await tryInteraction(page, t.name);               // E8 (3), Ausnahme noInteraction
  });
}
```
Erwartet: 40 × `run` + 40 × `info` + 43 Training + 23 table-demo + 10 Apps + 22 Angular-Routen ≈ 180 Tests je Browser.

## Etappe 2 und 3 (Vorentscheidung, Details nach Etappe 1)

- **Screenshots:** `toHaveScreenshot()` für ~10 Ziele (Showcases `large`, `laf`, `rtl`, `covergrid`, `spreadsheet`,
  `columnfilter` mit offenem Popup, `treetable`, `pivot`) in light **und** dark; `page.clock` eingefroren,
  `animations: "disabled"`, Fonts abwarten (Website nutzt lokales Inter), Live-Demos (`logtail`, `crypto`, `fps`)
  ausgenommen. Baselines `apps/e2e/__screenshots__/{linux-ci|macos-local}/…` (`snapshotPathTemplate`, Plattform
  aus `CI`), `maxDiffPixelRatio: 0.01`. Projekt `visual`, erst nicht sperrend, Termin in `TODO.md`.
- **Poster:** die `DEMOS`-Tabelle wandert nach `apps/e2e/training-demos.ts`; Projekt `posters` schreibt nach
  `SHOTS_OUT`; Regressionstest und Poster nutzen dieselben Schritte. `training-screenshots.mjs` wird **entfernt**,
  `screenshots:training` ruft das neue Projekt auf; CLAUDE.md §11 angepasst.
- **Video:** Projekt `video` (nie in `test:e2e`/CI), Aufnahmen in `apps/e2e/recordings/NN-slug.rec.ts` (gleiche
  Config und Fixtures; `videos/` bleibt reiner Inhalt), Ausgabe `videos/NN-slug/out/` (git-ignored),
  `pnpm record:video <NN-slug>`, 1080 × 1920 bzw. 1920 × 1080, sichtbarer Zeiger per CSS. Pilot `01-zwei-millionen-zeilen`,
  `16-spaltenfilter`.

## Nicht im Umfang

Keine Änderung an Core-Tests/Vitest; kein Training-Kapitel, keine Folge, kein Demo-Repo-Tag; kein Versionssprung (außer
ein Core-Fehler taucht auf – dann roter Vitest-Test, eigener Commit, Zielversion 1.1.118).

## Freigabe-Fragen

1. E3 eigener statischer Server statt `vite/astro preview` – ok?
2. E4 Projekt `angular-dev` (`ng serve`) fest in `test:e2e`, oder nur auf Abruf?
3. B1 im selben Branch fixen (eigener Commit) – ok?
4. E8 „fremder Host = rot“ – ok, oder nur loggen?

## Stand Etappe 1 (25.11.2026)

**Ergebnis:** Chromium + `angular-dev` **~35 s** inkl. Start von `ng serve` (Builds nicht mitgezählt; `build:all` ~35 s bis
2 min). `pnpm ci:local --e2e` auf dem Mac (Chromium + WebKit + `angular-dev`): **431 grün, 8 übersprungen, 71 s**, zweimal stabil;
die Schritte 1–11 bleiben grün. Firefox: lokal nicht startbar (s. u.), CI (Ubuntu) führt ihn aus. Lockfile: nur die 15 Zeilen für
`@playwright/test@1.64.0` (ein normales `pnpm i` hätte zusätzlich den Peer `supports-color` von `debug` an ~55 Stellen
umsortiert – von Hand vermieden, `--frozen-lockfile` grün).

**Gefundene Fehler (behoben auf diesem Branch, nicht im E2E-Paket umgangen):**
1. B1 `apps/table-demo`: nur `index.html` gebaut → alle `*.html` als Rollup-Einträge.
2. Toter Link `/training/filtering/column-filters` (`<ChapterLink hash="column-filters">` ohne `#`) in `checklist` und
   `build-buy-or-guiexpert`.
3. `preact-table-demo`: Tabellen-CSS vom CDN (letztes npm-Release) statt aus dem Repo.
4. `angular-table-demo`: Google Fonts von `fonts.googleapis.com` – die Fonts liegen schon in `assets/fonts`.
5. **Core:** das Mausrad über fixierten Spalten (west/east) scrollte nicht – die Bereiche liegen neben dem Scroll-Viewport.
   Roter Test zuerst (`fixed-columns-wheel.realmouse.browser.spec.ts`, echtes Mausrad über den neuen Befehl
   `realMouse.wheel`), Fix `RenderScope.onFixedAreaWheel`, eigener Commit, **Zielversion 1.1.118**. Aufgefallen als
   flackernder E2E-Test (`vue3-multi-demo /multisize`: zufällige Zellgrößen, Zeiger mal über der fixierten Spalte).

**Abweichungen vom Entwurf:**
- Ausnahmen um `skip` (externer Server nötig), `ALLOWED_FOREIGN_HOSTS` (Inhalt von außen gewollt, wird nie geladen) und
  `FOREIGN_MOCKS` (JSONPlaceholder der CRUD-Demos beantwortet der Test selbst → die Tabelle zeigt wirklich Zeilen) erweitert.
- Mausrad-Prüfung vergleicht die **Menge** der gezeichneten Zeilen (nicht die erste): mit Row-Spans bleibt Zeile 0 gezeichnet.
  Klick in die Mitte des Viewports statt auf die erste Zelle (die liegt nach dem Scrollen halb unter dem Header).
- Zusätzlich: Top-Level-Seiten der Website (nur Wächter), Routen von `vue3-multi-demo` (aus `src/router/demos.ts`, SPA-Fallback).
- Firefox 157 (Playwright 1.64) startet unter macOS 27.2.1 nicht („Could not find profile folder“, auch ohne Sandbox) →
  Schalter `E2E_SKIP_FIREFOX=1`; `ci:local --e2e` nimmt auf dem Mac Chromium + WebKit.
- `angular-dev` läuft fest in `pnpm test:e2e` (Start ~15 s); `test:e2e:website` lässt ihn weg (`E2E_SKIP_ANGULAR_DEV`).
- Es gibt keine Typprüfung des E2E-Pakets (kein `typescript` als Abhängigkeit, Playwright transpiliert nur).

Offen (TODO.md „E2E der gebauten Apps“): Termin „sperrend“ ~09.12.2026, Firefox lokal, B2, `chunksocket`, Münz-Icons
von coinmarketcap, `__screenshots__` in `.gitignore` vor Etappe 2.
