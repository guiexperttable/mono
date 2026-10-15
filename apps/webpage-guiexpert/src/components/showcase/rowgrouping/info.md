---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [rowgrouping/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/rowgrouping/run.astro).

Model: [createRowGroupModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createRowGroupModel.ts).

This example groups 50,000 flat orders by country and city. Every group is a row with an arrow, a label with the
number of orders and the aggregates of its rows: the sum of quantity and total and the average price. A total row
sits in the footer. Row grouping is built into GuiExpert Table – MIT-licensed, no dependencies (in ag-Grid it is an
Enterprise feature).

```ts title="Creation of the table model"
const tableModel = RowGroupFactory.createTableModel<SalesOrderIf>({
  rows: generateSalesOrders(50_000),
  columnDefs: createSalesOrderColumnDefs(),
  groupBy: ["country", "city"],
  aggregations: { quantity: "sum", price: "avg", total: "sum" },
  expanded: 1                                   // countries open, cities closed
});
```

The select regroups at runtime – without a new table model, so the table keeps its expanded groups and its sorting:

```ts title="Regroup"
select.addEventListener("change", () => tableApi.setRowGroupBy(select.value.split(",")));
```

- The group column is fixed on the left; the grouped columns are hidden (their values are in the group labels).
- A double click on *Total* sorts the groups by their sum and the orders inside each group by their total.
- The average of a country is the average of all its orders – not the average of the city averages.
- A filter (`externalFilterFunction`) gets the orders; groups, counts and sums follow it.

Training chapter: [Row grouping](/training/row-grouping/).
