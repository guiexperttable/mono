---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [overlays/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/overlays/run.astro).

The table starts **empty** – and says so. Load data: a **pure CSS spinner** with “Loading…” covers the table (no image,
no library). An empty answer shows your own “No orders yet”, a filter without hits “No matching rows”. MIT-licensed,
no dependencies.

```ts title="Loading, empty, no matches"
tableApi.showLoadingOverlay();                     // CSS spinner + "Loading…"
const orders = await fetch("/api/orders").then(r => r.json());
tableApi.setRows(orders);
tableApi.repaintHard();
tableApi.hideOverlay();         // 0 rows → "No rows to show" by itself,
                                // a filter without hits → "No matching rows"
```

- **Automatic:** “No rows to show” and “No matching rows” need no code – texts via `overlayOptions`
  (`noRowsText`, `noMatchesText`, `loadingText`).
- **Blocks clicks while loading** (switch it off with `blockInteractionWhileLoading: false`); the header stays usable.
- **Screen readers** hear “Loading…”; the grid is `aria-busy` while loading.
- **Framework wrappers:** `<GuiexpertTable loading={isLoading} … />` in React, Vue, Svelte, Solid, Preact, Angular and
  the Web Component – without rebuilding the table.
- `tableApi.getOverlayState()` → `"none" | "loading" | "noRows" | "noMatches"`.

Training: [chapter 32 – loading and empty tables](/training/live-data/#overlays) · API:
[TableApi.showLoadingOverlay](/api/classes/TableApi.html#showLoadingOverlay),
[TableOptionsIf.overlayOptions](/api/interfaces/TableOptionsIf.html#overlayOptions).
