[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ExcelServiceIf

# Interface: ExcelServiceIf

Writes an Excel file from a matrix of values. The default implementation is [ExcelService](../classes/ExcelService.md);
pass your own as last argument of the `TableScope` constructor to change how [TableApi.downloadExcel](../classes/TableApi.md#downloadexcel) exports.

## Implemented by

- [`ExcelService`](../classes/ExcelService.md)

## Table of contents

### Properties

- [supportsNumberFormats](ExcelServiceIf.md#supportsnumberformats)

### Methods

- [downloadExcel](ExcelServiceIf.md#downloadexcel)

## Properties

### supportsNumberFormats

• `Optional` `Readonly` **supportsNumberFormats**: `boolean`

True if the service understands cells of the form [ExcelFormattedValueIf](ExcelFormattedValueIf.md) (`{ value, numberFormat }`).
Only then [TableApi.downloadExcel](../classes/TableApi.md#downloadexcel) exports percentages of „Show values as“ columns with the format `0.0%`;
otherwise a service gets plain numbers (since 1.1.95).

#### Defined in

[src/lib/table/service/excel-service.if.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L17)

## Methods

### downloadExcel

▸ **downloadExcel**(`matrix`, `filename`, `author?`): `void` \| `Promise`\<`void`\>

Creates the file from `matrix` (rows of values) and hands it to the browser as download.

#### Parameters

| Name | Type |
| :------ | :------ |
| `matrix` | `any`[][] |
| `filename` | `string` |
| `author?` | `string` |

#### Returns

`void` \| `Promise`\<`void`\>

#### Defined in

[src/lib/table/service/excel-service.if.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.if.ts#L10)
