[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ExcelFormattedValueIf

# Interface: ExcelFormattedValueIf

A cell of an Excel matrix with a number format, e.g. a share shown as percentage. Understood by
[ExcelService](../classes/ExcelService.md) (`supportsNumberFormats`).

**`Example`**

```ts
await new ExcelService().downloadExcel([["Share"], [{ value: 0.667, numberFormat: "0.0%" }]], "shares.xlsx");
```

**`Since`**

1.1.95

## Table of contents

### Properties

- [numberFormat](ExcelFormattedValueIf.md#numberformat)
- [value](ExcelFormattedValueIf.md#value)

## Properties

### numberFormat

• **numberFormat**: `string`

An Excel number format code, e.g. `"0.0%"`, `"#,##0.00"`.

#### Defined in

[src/lib/table/service/excel-service.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L34)

___

### value

• **value**: `number`

The number.

#### Defined in

[src/lib/table/service/excel-service.if.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L32)
