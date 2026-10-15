---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [aggregation/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/aggregation/run.astro).

Model: [createAggregationModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createAggregationModel.ts).

This example shows 50,000 flat orders with three total rows in the footer: the sum, the average and the maximum of
quantity, price and total. Select cells with the mouse – the bar above the table shows count, sum, average and maximum
of the selection, like the status bar of a spreadsheet. Totals and status bar are built into GuiExpert Table –
MIT-licensed, no dependencies (in ag-Grid aggregation is an Enterprise feature).

```ts title="Creation of the table model"
const tableModel = TableFactory.createTableModel<SalesOrderIf>({
  rows: generateSalesOrders(50_000),
  columnDefs: createSalesOrderColumnDefs(),
  footerAggregates: {
    rows: [
      { label: n => `Sum · ${n} orders`, aggregates: { quantity: "sum", total: "sum" } },
      { label: "Average", aggregates: { quantity: "avg", price: "avg", total: "avg" } },
      { label: "Maximum", aggregates: { quantity: "max", price: "max", total: "max" } }
    ],
    labelProperty: "product"
  }
});
```

The status bar reads the selected cells:

```ts title="Status bar"
listener.onSelectionChanged = () => {
  const a = tableApi.getSelectionAggregates();     // { count, numericCount, sum, avg, min, max, capped }
  status.textContent = `Count ${a.count} · Sum ${formatAggregateValue(a.sum)}`;
};
```

- The totals follow the filter (`externalFilterFunction`): choose a country and the footer shows its numbers.
- Sums are compensated (Neumaier) – 50,000 prices add up without rounding drift.
- The footer cells keep the raw numbers: the Excel export writes them as numbers.
- Sorting or scrolling does not recompute anything; filtering and editing do, once.

Training chapter: [Footer totals](/training/footer-totals/).
