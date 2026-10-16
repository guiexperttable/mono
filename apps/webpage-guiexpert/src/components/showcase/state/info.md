---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [state/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/state/run.astro).

Resize a column, drag a header to another place, hide “City”, sort, scroll and select some rows – then **reload the
page**. Everything is back. The panel shows the JSON the table reports with every change – send it to your server, or let
the table keep the parts you switch on in localStorage (one option). MIT-licensed, no dependencies.

```ts title="Remember the layout"
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  autoRestoreOptions: {
    ...new AutoRestoreOptions<Order>(),
    getStorageKeyFn: () => "orders",           // localStorage["orderstableState"]
    getRowId: (order: Order) => order.id,
    autoRestoreColumnLayout: true,             // order, widths, hidden columns
    autoRestoreSortingState: true,
    autoRestoreScrollPosition: true,
    autoRestoreSelectedState: true
  }
};
```

- **What is remembered:** column order, changed widths, hidden columns, sorting, scroll position (also by the first
  visible row id), open tree nodes and header groups, checked and selected rows, open detail rows, your own values.
- **Robust:** rows by id, columns by property – never by index. New data, new columns: the state still fits.
- **Your server:** `tableApi.getState()` → JSON, `tableApi.applyState(json)`, `initialState`, `onStateChanged`
  (debounced, only on real changes), `storage` for your own `StateStorageIf`.
- `tableApi.resetState()` returns to the layout of your code.

Training: [chapter 33 – persist state](/training/persist-state/) · API:
[AutoRestoreOptions](/api/classes/AutoRestoreOptions.html), [TableApi.getState](/api/classes/TableApi.html#getState),
[TableApi.applyState](/api/classes/TableApi.html#applyState).
