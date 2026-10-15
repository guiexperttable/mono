# GuiExpert Table – Mono Repo

**Become a master at creating web applications with large tables.**
UI-agnostic, high-performance data table for the browser – one core, wrappers for every major framework.
Accessible: WAI-ARIA grid/treegrid for screen readers, full keyboard navigation, tested with axe-core (since 1.1.91).
Built-in overlays "Loading…" (CSS spinner) and "No rows to show" / "No matching rows" – plain HTML/CSS (since 1.1.92).
Remembers column layout, sorting, selection and tree state – in `localStorage` or on your server via a JSON state API (since 1.1.92).
Row numbers like in a spreadsheet – one flag, `rowNumbersVisible: true` (since 1.1.93).
Total rows (sum, average, count, min, max …) that follow filter and sorting – `footerAggregates: { total: "sum" }` – and the sum of the selected cells for a status bar (since 1.1.94).
Row grouping with aggregates per group – `RowGroupFactory.createTableModel({ rows, groupBy: ["country", "city"], aggregations: { total: "sum" } })`, regroup at runtime with `tableApi.setRowGroupBy()` (since 1.1.94).
Pivot tables – row fields × column fields with subtotals, totals and multi-row headers – `PivotFactory.createTableModel({ rows, rowFields: ["country"], columnFields: ["year"], values: ["total"] })`, pivot again at runtime with `tableApi.setPivotConfig()` (since 1.1.94).
Calculated columns, „Show values as“ and formulas – `ColumnDef.create({ property: "total", valueGetter: o => o.price * o.quantity })` (sorting, filter, copy, Excel and totals use the computed value), `showValuesAs: "percentOfColumnTotal"` (also `runningTotal`, `rank`, `percentOfRowTotal` in pivots …), `formula: "ROUND([price] * [quantity] * 1.19, 2)"` (own parser, no `eval`, error values like `#DIV/0!`) (since 1.1.95).

Website & showcases: https://gui.expert · Training: https://gui.expert/training/ · API: https://gui.expert/api · License: MIT (see below)

## What's inside

| Path | Content | npm |
|---|---|---|
| `packages/table` | Core – framework-free, zero runtime dependencies | `@guiexpert/table` |
| `packages/demo-table-models` | Ready-made demo models | `@guiexpert/demo-table-models` |
| `packages/react-table` · `preact-table` · `solid-table` · `svelte-table` · `vue3-table` · `webcomponent-table` | Framework wrappers | `@guiexpert/<name>` |
| `packages/angular-table` | **Shared source** of the Angular wrapper (no build of its own) | – |
| `angular-builds/ng14` … `ng22` | One build harness per Angular major – compiles the shared source | `@guiexpert/angular-table@14.x … 22.x` |
| `apps/*` | Demo apps (plain TS, React, Preact, Solid, Svelte, Vue, Web Component, Angular) and the gui.expert website (Astro) | – |
| `scripts/` | `sync-angular-src.mjs`, `version.mjs` | – |

## Quick start

```bash
corepack enable          # uses pnpm 9.15.9 from package.json
pnpm i
pnpm build:core          # @guiexpert/table (needed by everything else)
pnpm build:libs          # all packages/*
pnpm build:angular       # @guiexpert/angular-table for Angular 14 … 22
pnpm serve:table-demo    # or serve:react-table-demo, serve:vue3-table-demo, serve:angular-table-demo, …
```

Requirements: Node.js ≥ 22.22.3 (Angular 22), pnpm 9.

## Angular: one source, nine builds

Edit the Angular wrapper **only** in `packages/angular-table/src`. Each `angular-builds/ngNN` contains just the
version-specific parts (Angular/TypeScript/ng-packagr versions, tsconfig, npm manifest `lib/package.json`).
`pnpm build:angular:ng22` (or any other version) runs `scripts/sync-angular-src.mjs`, which copies the shared source
into `angular-builds/ngNN/lib/src` and generates the component stylesheet from `packages/table/css/table*.css`,
then `ng-packagr` writes the package to `angular-builds/ngNN/dist`.
Version-specific code, if ever needed, goes into `angular-builds/ngNN/overrides/` (copied over the shared source).

## Versions

One scheme for all packages: the core version `1.x.y` drives everything, framework wrappers keep their framework
major (`@guiexpert/react-table@18.x.y`, `@guiexpert/angular-table@22.x.y`, …).

```bash
pnpm version:check   # list versions, report mismatches
pnpm version:patch   # 1.1.84 -> 1.1.85 everywhere
```

npm dist-tags for Angular: `latest` = newest Angular major, older majors `a14` … `a21`.

## License

**Current releases: MIT License.** All currently published versions are free to use, modify and distribute – also
in commercial and proprietary applications. See [LICENSE](LICENSE).

**Future releases: possible dual licensing.** Dr. Marc Kronberg (gui.expert) reserves the right to publish future
versions under different terms (e.g. open source for individuals and non-commercial use, commercial license for
businesses). Versions already released under MIT remain MIT. External contributions require a Contributor License
Agreement. Details: https://gui.expert/license/
