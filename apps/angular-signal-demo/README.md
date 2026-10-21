# angular-signal-demo

Angular 22, zoneless: `TableSignalComponent` (`<guiexpert-table-signal>`, since 1.1.100) from the **built** package
`angular-builds/ng22/dist`.

```bash
pnpm build:core
pnpm build:angular:ng22
pnpm serve:angular-signal-demo      # http://localhost:4210
```

- **Playground** (`src/app.component.ts`): 1,000 / 100,000 / 2,000,000 rows (a new model re-creates the table –
  `tableApi` switches directly), the `loading` input, remove/show the table (`tableApi` → `undefined`), clicks and
  context menu (`contextMenu`: once per right click) – every value on the page is a signal.
- **Video snippet** (`src/orders.component.ts`): the component of video 14 „Angular Signals“ (`videos/14-angular-signals/`)
  and of /whats-new/ (`pnpm --filter webpage-guiexpert check:features` compares the snippet with this file).

`build:all` builds it after `angular-build-ng22` (devDependency `angular-build-ng22: workspace:*` – the `link:` to
its `dist/` alone gives pnpm no build order).

Vite + JIT instead of the Angular CLI (see `vite.config.ts`): no further packages in the lockfile. Type check of the
templates: `pnpm --filter angular-signal-demo check` (`ngc`, `strictTemplates`).
