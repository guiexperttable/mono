[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ExcelService

# Class: ExcelService

Writes real `.xlsx` files (Office Open XML) without any library – compressed with the browser's
built-in `CompressionStream`. Numbers stay numbers, everything else becomes text.

[TableApi.downloadExcel](TableApi.md#downloadexcel) exports what the table shows; use the ExcelService directly for any other data.

**`Example`**

```ts
// all rows, own columns – independent of filter and sorting
const body = tableApi.getBodyModel() as AreaModelObjectArray<Order>;
const matrix = [
  ["ID", "Customer", "Total"],
  ...body.getAllRows().map(o => [o.id, o.customer, o.total])
];
await new ExcelService().downloadExcel(matrix, "orders.xlsx", "GuiExpert");
```

**`Example`**

```ts
// a Blob instead of a download, e.g. for an upload
const blob = await new ExcelService().createExcelBlob(matrix);
```

**`See`**

Training: [Excel export without a library](https://gui.expert/training/excel-export/)

## Implements

- [`ExcelServiceIf`](../interfaces/ExcelServiceIf.md)

## Table of contents

### Constructors

- [constructor](ExcelService.md#constructor)

### Properties

- [supportsFormulas](ExcelService.md#supportsformulas)
- [supportsNumberFormats](ExcelService.md#supportsnumberformats)

### Methods

- [createExcelBlob](ExcelService.md#createexcelblob)
- [createZip](ExcelService.md#createzip)
- [createZipCompressed](ExcelService.md#createzipcompressed)
- [downloadExcel](ExcelService.md#downloadexcel)

## Constructors

### constructor

• **new ExcelService**(): [`ExcelService`](ExcelService.md)

#### Returns

[`ExcelService`](ExcelService.md)

## Properties

### supportsFormulas

• `Readonly` **supportsFormulas**: ``true``

Understands cells `{ formula, value }` ([ExcelFormulaCellIf](../interfaces/ExcelFormulaCellIf.md)), since 1.1.99.

#### Implementation of

[ExcelServiceIf](../interfaces/ExcelServiceIf.md).[supportsFormulas](../interfaces/ExcelServiceIf.md#supportsformulas)

#### Defined in

[src/lib/table/service/excel-service.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.ts#L85)

___

### supportsNumberFormats

• `Readonly` **supportsNumberFormats**: ``true``

Understands cells `{ value, numberFormat }` ([ExcelFormattedValueIf](../interfaces/ExcelFormattedValueIf.md)), since 1.1.95.

#### Implementation of

[ExcelServiceIf](../interfaces/ExcelServiceIf.md).[supportsNumberFormats](../interfaces/ExcelServiceIf.md#supportsnumberformats)

#### Defined in

[src/lib/table/service/excel-service.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.ts#L82)

## Methods

### createExcelBlob

▸ **createExcelBlob**(`matrix`, `author?`, `options?`): `Promise`\<`Blob`\>

Creates the .xlsx file as a Blob (compressed), e.g. to upload it instead of downloading it.

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `matrix` | `any`[][] | `undefined` |
| `author` | `string` | `''` |
| `options` | [`ExcelExportOptionsIf`](../interfaces/ExcelExportOptionsIf.md) | `{}` |

#### Returns

`Promise`\<`Blob`\>

**`Example`**

```ts
const blob = await new ExcelService().createExcelBlob([["Name", "City"], ["Ann", "Berlin"]]);
await fetch("/api/upload", { method: "POST", body: blob });
```

**`Example`**

```ts
// a sheet from right to left (column A on the right), since 1.1.98
const rtlBlob = await new ExcelService().createExcelBlob([["المدينة"], ["الرياض"]], "", { rightToLeft: true });
```

#### Defined in

[src/lib/table/service/excel-service.ts:139](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.ts#L139)

___

### createZip

▸ **createZip**(`files`): `Uint8Array`

ZIP without compression (method 0, synchronous). Kept for compatibility –
downloads use [createZipCompressed](ExcelService.md#createzipcompressed).

#### Parameters

| Name | Type |
| :------ | :------ |
| `files` | `Map`\<`string`, `string`\> |

#### Returns

`Uint8Array`

#### Defined in

[src/lib/table/service/excel-service.ts:314](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.ts#L314)

___

### createZipCompressed

▸ **createZipCompressed**(`files`): `Promise`\<`Uint8Array`\>

ZIP with DEFLATE (method 8) via the browser's CompressionStream; falls back to stored entries
where that is not available. 100,000 rows × 7 columns: ~40 MB stored → a few MB compressed.

#### Parameters

| Name | Type |
| :------ | :------ |
| `files` | `Map`\<`string`, `string`\> |

#### Returns

`Promise`\<`Uint8Array`\>

#### Defined in

[src/lib/table/service/excel-service.ts:327](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.ts#L327)

___

### downloadExcel

▸ **downloadExcel**(`matrix`, `filename?`, `author?`, `options?`): `Promise`\<`void`\>

Downloads a matrix data as an Excel file.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `matrix` | `any`[][] | `undefined` | A 2D array representing the data to be included in the Excel file. Each inner array corresponds to a row in the sheet. |
| `filename?` | `string` | `'file.xlsx'` | The name of the Excel file to be downloaded. Defaults to 'file.xlsx'. |
| `author?` | `string` | `''` | The author's name to include as metadata in the Excel file. Optional parameter. |
| `options?` | [`ExcelExportOptionsIf`](../interfaces/ExcelExportOptionsIf.md) | `{}` | e.g. `{ rightToLeft: true }` for a sheet from right to left (since 1.1.98) |

#### Returns

`Promise`\<`void`\>

Does not return a value.

**`Throws`**

Throws an error if the input matrix is not a valid 2D array or if the filename is an empty string.

#### Implementation of

[ExcelServiceIf](../interfaces/ExcelServiceIf.md).[downloadExcel](../interfaces/ExcelServiceIf.md#downloadexcel)

#### Defined in

[src/lib/table/service/excel-service.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/excel-service.ts#L97)
