[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ExcelExportOptionsIf

# Interface: ExcelExportOptionsIf

Options of an Excel export ([ExcelService.downloadExcel](../classes/ExcelService.md#downloadexcel), [ExcelService.createExcelBlob](../classes/ExcelService.md#createexcelblob)).

**`Example`**

```ts
// an Arabic sheet: column A on the right, like the table
await new ExcelService().downloadExcel(matrix, "sales.xlsx", "", { rightToLeft: true });
```

**`Since`**

1.1.98

## Table of contents

### Properties

- [rightToLeft](ExcelExportOptionsIf.md#righttoleft)

## Properties

### rightToLeft

• `Optional` **rightToLeft**: `boolean`

The worksheet runs from right to left (`<sheetView rightToLeft="1">`): column A on the right.
[TableApi.downloadExcel](../classes/TableApi.md#downloadexcel) sets it for a right-to-left table ([TableOptionsIf.direction](TableOptionsIf.md#direction)).

#### Defined in

[src/lib/table/service/excel-export-options.if.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-export-options.if.ts#L17)
