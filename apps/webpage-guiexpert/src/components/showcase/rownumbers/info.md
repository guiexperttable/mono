---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [rownumbers/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/rownumbers/run.astro).

Row numbers like in a spreadsheet – **one flag**. Switch to 1,000,000 rows: the “#” column grows to fit the largest
number; filter and it gets narrower again. MIT-licensed, no dependencies (at ag-Grid row numbers are an Enterprise
feature).

```ts title="Row numbers"
const tableModel = TableFactory.createTableModel({
  rows: orders,
  rowNumbersVisible: true    // or { mode: "original", format: n => n.toLocaleString() }
});
```

- **Fixed on the left** (on the right in [right-to-left](/showcase/rtl/run/) tables), right aligned, digits of equal width.
- **Two ways to count:** `"display"` numbers the current view (1, 2, 3 … after sorting and filtering), `"original"` keeps
  each row's position in your data.
- **Selection:** a click on a number selects the row (Shift extends, Ctrl/⌘ toggles), a click on “#” selects all.
- **Screen readers** hear the numbers as row headers; copy and Excel leave them out unless `exported: true`.
- Column indices shift by one – use properties: `tableApi.getColumnIndex("total")`.

Training: [chapter 18 – row numbers](/training/fixed-columns/#row-numbers) · API:
[CreateTableModelPara.rowNumbersVisible](/api/interfaces/CreateTableModelPara.html#rowNumbersVisible),
[RowNumberColumnDef](/api/classes/RowNumberColumnDef.html).
