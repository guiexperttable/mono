[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ExcelServiceIf

# Interface: ExcelServiceIf

Writes an Excel file from a matrix of values. The default implementation is [ExcelService](../classes/ExcelService.md);
pass your own as last argument of the `TableScope` constructor to change how [TableApi.downloadExcel](../classes/TableApi.md#downloadexcel) exports.

## Implemented by

- [`ExcelService`](../classes/ExcelService.md)

## Table of contents

### Properties

- [supportsFormulas](ExcelServiceIf.md#supportsformulas)
- [supportsNumberFormats](ExcelServiceIf.md#supportsnumberformats)

### Methods

- [downloadExcel](ExcelServiceIf.md#downloadexcel)

## Properties

### supportsFormulas

• `Optional` `Readonly` **supportsFormulas**: `boolean`

True if the service understands cells of the form [ExcelFormulaCellIf](ExcelFormulaCellIf.md) (`{ formula, value }`). Only then
[TableApi.downloadExcel](../classes/TableApi.md#downloadexcel) with `{ cellFormulas: true }` exports cell formulas as formulas (since 1.1.99).

#### Defined in

[src/lib/table/service/excel-service.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L25)

___

### supportsNumberFormats

• `Optional` `Readonly` **supportsNumberFormats**: `boolean`

True if the service understands cells of the form [ExcelFormattedValueIf](ExcelFormattedValueIf.md) (`{ value, numberFormat }`).
Only then [TableApi.downloadExcel](../classes/TableApi.md#downloadexcel) exports percentages of „Show values as“ columns with the format `0.0%`;
otherwise a service gets plain numbers (since 1.1.95).

#### Defined in

[src/lib/table/service/excel-service.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L19)

## Methods

### downloadExcel

▸ **downloadExcel**(`matrix`, `filename`, `author?`, `options?`): `void` \| `Promise`\<`void`\>

Creates the file from `matrix` (rows of values) and hands it to the browser as download.

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | `any`[][] |
| `filename` | `string` |
| `author?` | `string` |
| `options?` | [`ExcelExportOptionsIf`](ExcelExportOptionsIf.md) |

#### Returns

`void` \| `Promise`\<`void`\>

#### Defined in

[src/lib/table/service/excel-service.if.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L12)
