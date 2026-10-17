---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [spreadsheet/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/spreadsheet/run.astro).

Model: [createSpreadsheetQuoteModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createSpreadsheetQuoteModel.ts).

A quote as a spreadsheet: column letters, row numbers, a formula bar and **cell formulas with A1 references** –
`=B2*C2*(1-D2)`, `=SUM(E2:E6)`, `=IF(E8>=1000,0,49)`. Change a quantity and everything that depends on it calculates
again. One call builds the sheet; MIT-licensed, no dependencies.

```ts title="Spreadsheet"
const { tableModel, tableOptions } = SpreadsheetFactory.create({
  data: [
    ["Item", "Qty", "Price", "Net"],
    ["Laptop", 4, 1299, "=B2*C2"],
    ["Monitor", 8, 349, "=B3*C3"],
    ["Total", "", "", "=SUM(D2:D3)"]
  ]
});
const tableScope = new TableScope(host, tableModel, new SimpleDomService(), tableOptions, new EventAdapter());
tableScope.firstInit();
new FormulaBar(barHost, tableScope.getApi());   // optional: address box + formula input
```

- **Excel-style editing:** type to overwrite, F2 to edit, Enter/Tab move, Delete clears, Ctrl+Enter fills the selection.
- **Formulas:** 70 Excel functions, `$A$1`, ranges, `#DIV/0!` and `#CIRC!`; while typing, references are
  colored and arrow keys or the mouse point at cells (F4 toggles `$`). Formulas are parsed, never run as JavaScript.
- **Copy & paste with Excel and Google Sheets** (Ctrl+C / Ctrl+X / Ctrl+V), the fill handle, **undo and redo** (Ctrl+Z / Ctrl+Y).
- **Insert and delete rows and columns** (right-click): references follow, a deleted one becomes `#REF!`.
- **Excel export with real formulas**, sorting and filtering keep the references, a million empty rows cost nothing.

Docs: [instructions.md 6.20 – 6.25](https://github.com/guiexperttable/mono/blob/main/instructions.md) · API:
[SpreadsheetFactory](/api/classes/SpreadsheetFactory.html), [FormulaBar](/api/classes/FormulaBar.html),
[TableApi.insertRows](/api/classes/TableApi.html#insertRows).
