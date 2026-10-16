---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [masterdetail/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/masterdetail/run.astro).

Model: [createMasterDetailModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createMasterDetailModel.ts).

100,000 orders. Click ▸ (or press Enter on a row) and the items of the order appear right below it – as a **second
GuiExpert table over the full width**, also over the fixed order column. Scroll far away and back: the detail is still
there with its own scroll position and selection, it was only hidden. The detail can be anything: a nested table, a
form, a chart, a React/Vue/Svelte/Angular component. MIT-licensed, no dependencies.

```ts title="Master/detail"
const tableOptions = {
  ...new TableOptions(),
  masterDetail: {
    detailHeight: 220,                       // px – or "auto" (measured)
    detailRenderer: (container, order, ctx) => {
      ctx.createTable({                      // destroyed together with the detail row
        tableModel: TableFactory.createTableModel({ rows: order.items, properties: ["sku", "product", "quantity"] })
      });
    }
  }
};
tableApi.setDetailExpanded(order, true);     // or a click on ▸, or Enter
```

- **Millions of rows:** details are created when they scroll into view and hidden (not destroyed) when they leave it;
  row positions use prefix sums, so scrolling stays fast with many open details.
- **Sorting and filtering** keep each detail with its order.
- **Events stay inside:** clicks and arrow keys in the item table do not move the focus of the order table.
- **Keyboard and screen readers:** Enter toggles, Tab moves into the open detail, Shift+Tab back; `aria-expanded`.
- **Remembered:** the open orders are part of the table state (`autoRestoreDetailState`).

Docs: [instructions.md 6.18](https://github.com/guiexperttable/mono/blob/main/instructions.md) · API:
[TableApi.setDetailExpanded](/api/classes/TableApi.html#setDetailExpanded), [MasterDetailOptionsIf](/api/interfaces/MasterDetailOptionsIf.html).
