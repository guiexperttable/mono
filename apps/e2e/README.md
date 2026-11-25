# E2E – Smoke tests of the built apps (Playwright)

Prompt 026, design `prompts/026-e2e-playwright.design.md`. **Core behaviour → Vitest** (`packages/table`, ~930 browser
specs in the same context as the table); **built apps → Playwright** (this package): does every page of the website and
every demo app show a table – without console errors, failed or foreign requests?

## Commands (repository root)

| Purpose | Command |
|---|---|
| Build everything the tests open (core, demo models, Angular 22, website, demo apps) | `pnpm test:e2e:build` (or `pnpm build:all`) |
| All smoke tests: Chromium + Firefox + project `angular-dev` (`ng serve`) | `pnpm test:e2e` (~35 s with Chromium only, ng serve start included) |
| Website only (showcases, training, top-level pages) / demos only | `pnpm test:e2e:website` / `pnpm test:e2e:demos` |
| Also WebKit / without Firefox | `E2E_WEBKIT=1 pnpm test:e2e` / `E2E_SKIP_FIREFOX=1 pnpm test:e2e` |
| Dev servers instead of the dists (local only) | `E2E_DEV=1 pnpm test:e2e` |
| One test, report of the last run | `pnpm --filter e2e exec playwright test -g "showcase large"`, `pnpm --filter e2e report` |
| In the local pipeline | `pnpm ci:local --e2e` (last step, after `build:all`) |

`pnpm test:e2e` does **not** build: `global-setup.ts` stops with the command if a dist is missing. Browsers: the
Playwright 1.64 browsers of the Vitest tests (`pnpm --filter e2e exec playwright install chromium firefox webkit`).

**Firefox on macOS 27.2:** Firefox 157 of Playwright 1.64 does not start (“Could not find profile folder”, Nov. 2026) –
locally `E2E_SKIP_FIREFOX=1` (`ci:local --e2e` does it on a Mac and adds WebKit), CI (Ubuntu) runs Firefox. Try again
after `pnpm --filter e2e exec playwright install --force firefox` or the next Playwright version.

## What is tested

| Spec | Targets (generated, `targets.ts`) | Checks |
|---|---|---|
| `showcases.spec.ts` | every `src/pages/showcase/*/` – `run` and `info` | table with rows/overlay, wheel → other rows, click → focus |
| `training.spec.ts` | every `src/pages/training/*.astro` with `?demos` | every `<LiveDemo>` started (`data-ready`), no „error:“, one table each; free links → 200 |
| `website.spec.ts` | the top-level pages (`/`, `/showcase/`, `/whats-new/` …) | loads |
| `table-demo.spec.ts` | `apps/table-demo/*.html` | all tables show rows/overlay + interaction |
| `framework-demos.spec.ts` | every app of `apps.mjs` + routes of `angular-table-demo` (`routerLink`) and `vue3-multi-demo` (`demos.ts`) | tables; Angular: exactly one `[ng-version]` with the expected major |
| `angular-dev.spec.ts` | `angular-table-demo` in `ng serve` (Chromium) | the Vite pre-bundle of the dev server (two Angular versions = empty page, CLAUDE.md §2) |
| `targets.spec.ts` | – | no app/chapter drops out of the list, every exception names a target |

Every test has the **guard** (`fixtures.ts`, auto fixture): `pageerror`, `console.error`, `console.warn` (except
`ALLOWED_WARNINGS`), own responses ≥ 400, failed requests and requests to **foreign hosts** (aborted) fail the test.

**A new page is tested automatically** – showcase, chapter, `table-demo/*.html`, Angular/Vue route. A new app under
`apps/` goes into `apps.mjs` (port, dist) – `targets.spec.ts` fails until it is there.

## Exceptions (`exceptions.ts`)

One file, each entry with a reason: `placeholder` (only “loads”), `noTable`, `noInteraction`, `skip` (needs an external
server), `ALLOWED_WARNINGS`, `ALLOWED_FOREIGN_HOSTS` (external content on purpose, never fetched) and `FOREIGN_MOCKS`
(public REST APIs the test answers itself). A bug is **not** worked around here – fix the page (own commit), a core bug
gets a red Vitest test first.

## Server

`serve-dist.mjs` serves all dists in one process (no dependency): one port per app (`apps.mjs`, 4801 …), health check
on 4800, directory → `index.html`, SPA fallback only for Angular and vue3-multi-demo, a missing file is a 404 (the guard
turns it into a red test). `ng serve` of the project `angular-dev` runs on 4850.
