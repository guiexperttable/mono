---
layout: ../../../layouts/DemoCodeLayout.astro
---


Source of demo: [formulas/run.astro](https://github.com/guiexperttable/mono/blob/main/apps/webpage-guiexpert/src/components/showcase/formulas/run.astro).

Model: [createFormulaModel.ts](https://github.com/guiexperttable/mono/blob/main/packages/demo-table-models/src/lib/createFormulaModel.ts).

This example shows 500 invoice lines. The data only has quantity, price and discount – **net, VAT and gross are
formula columns**, the share of the net total and the rank use **„Show values as“**, and the last column takes a
formula you type. Sorting, the country filter, copy, the Excel export and the total row all use the computed values.
Calculated columns, „Show values as“ and formulas are built into GuiExpert Table – MIT-licensed, no dependencies (in
ag-Grid they are Enterprise features).

```ts title="Formula columns"
ColumnDef.create({ property: "net", headerLabel: "Net",
                   formula: "ROUND([quantity] * [price] * (1 - [discount] / 100), 2)" }),
ColumnDef.create({ property: "vat", headerLabel: "VAT 19%", formula: "ROUND([net] * 0.19, 2)" }),
ColumnDef.create({ property: "gross", headerLabel: "Gross", formula: "[net] + [vat]" }),
ColumnDef.create({ property: "share", headerLabel: "Share of net", formula: "[net]",
                   showValuesAs: { mode: "percentOfColumnTotal", fractionDigits: 2 } }),
ColumnDef.create({ property: "rank", headerLabel: "Rank", formula: "[gross]", showValuesAs: "rank" })
```

The total row sums the calculated columns like normal ones:

```ts title="Total row"
footerAggregates: { rows: [{ label: n => `Sum · ${n} lines`, aggregates: { net: "sum", vat: "sum", gross: "sum" } }] }
```

The input field belongs to the page, the table only compiles the text:

```ts title="Your own formula"
input.addEventListener("change", () => {
  const error = tableApi.setColumnFormula("custom", input.value);   // FormulaError | undefined
  hint.textContent = error ? `${error.code} ${error.message}` : "";
});
```

- Try `[gross] / SUM([gross])` (share of the column total), `IF([quantity] >= 10, "bulk", "")` or
  `[price] / ([quantity] - [quantity])` – errors like `#DIV/0!`, `#NAME?` (unknown field) or `#ERROR!` (syntax) appear in
  the cells, never as an exception.
- No `eval`, no `new Function`: formulas are parsed into a syntax tree and evaluated by an interpreter – user input can't
  run code, and the page works with a strict Content-Security-Policy.
- Edit price, quantity or discount (double click or F2): net, VAT, gross, shares, ranks and the total row follow.
- Without formulas: `valueGetter: line => line.quantity * line.price` does the same in TypeScript.
- The share column: `% of column total`, running total, difference from the previous row or rank – switched at runtime
  with `tableApi.setShowValuesAs("share", mode)`. With the country filter the shares relate to the visible lines.

Developer guide: `instructions.md` sections 5.2 (calculated columns), 5.8 (Show values as) and 5.9 (formulas).
