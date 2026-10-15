---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [pivot/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/pivot/run.astro).

Model: [createPivotModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createPivotModel.ts).

This example turns 50,000 flat orders into a pivot table: countries and cities as rows, years and quarters as columns,
the revenue and the number of orders in every cell – with subtotals per country, a total per year (click the arrow of a
year to collapse it to its total), a total column on the right and a total row. Pivot tables are built into GuiExpert
Table – MIT-licensed, no dependencies (in ag-Grid an Enterprise feature).

```ts title="Creation of the table model"
const tableModel = PivotFactory.createTableModel<PivotOrderIf>({
  rows: generatePivotOrders(50_000),
  rowFields: ["country", "city"],
  columnFields: [
    { name: "year", label: "Year", value: o => Number(o.date.slice(0, 4)) },
    { name: "quarter", label: "Quarter", value: o => Math.ceil(Number(o.date.slice(5, 7)) / 3), format: q => `Q${q}` }
  ],
  values: [
    { value: "total", label: "Revenue" },
    { value: "id", aggregator: "count", label: "Orders" }
  ],
  expanded: 0                                   // countries closed
});
```

The selects pivot again at runtime – without a new table model, so the table keeps its expanded rows:

```ts title="Pivot again"
select.addEventListener("change", () => tableApi.setPivotConfig({ columnFields: [select.value] }));
```

- The group column is fixed on the left, the total columns on the right.
- Every subtotal and total is computed from the orders (aggregation states are merged) – an average of a country is
  the average of its orders, never the average of the city averages.
- A combination without orders stays empty (not 0); a double click on a header sorts the rows by that column.
- A filter (`externalFilterFunction`) gets the orders and works before the aggregation; all cells and totals follow.

Training chapter: [Pivot tables](/training/pivot-tables/).
