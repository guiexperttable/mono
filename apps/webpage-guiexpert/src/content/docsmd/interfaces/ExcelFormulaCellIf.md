[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ExcelFormulaCellIf

# Interface: ExcelFormulaCellIf

A cell of an Excel matrix with a formula (`<f>`) and its calculated value (`<v>`, shown until Excel recalculates).
Understood by [ExcelService](../classes/ExcelService.md); [TableApi.downloadExcel](../classes/TableApi.md#downloadexcel) writes them for cell formulas with
`{ cellFormulas: true }`.

**`Example`**

```ts
await new ExcelService().downloadExcel([[2, 3, { formula: "A1*B1", value: 6 }]], "sheet.xlsx");
```

**`Since`**

1.1.99

## Table of contents

### Properties

- [formula](ExcelFormulaCellIf.md#formula)
- [value](ExcelFormulaCellIf.md#value)

## Properties

### formula

• **formula**: `string`

The formula without `=`, with Excel's function names (`"SUM(D2:D4)"`, `"_xlfn.XLOOKUP(…)"`).

#### Defined in

[src/lib/table/service/excel-service.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L42)

___

### value

• **value**: `unknown`

The calculated value: a number, text, boolean, `Date` or an error value.

#### Defined in

[src/lib/table/service/excel-service.if.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L44)
