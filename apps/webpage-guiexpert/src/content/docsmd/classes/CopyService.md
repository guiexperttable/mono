[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CopyService

# Class: CopyService

## Implements

- [`CopyServiceIf`](../interfaces/CopyServiceIf.md)

## Table of contents

### Constructors

- [constructor](CopyService.md#constructor)

### Properties

- [columnSeparatorChar](CopyService.md#columnseparatorchar)
- [maxCopyCells](CopyService.md#maxcopycells)
- [rowSeparatorChar](CopyService.md#rowseparatorchar)

### Methods

- [copyContent](CopyService.md#copycontent)
- [copyToClipboard](CopyService.md#copytoclipboard)
- [createContent](CopyService.md#createcontent)

## Constructors

### constructor

• **new CopyService**(): [`CopyService`](CopyService.md)

#### Returns

[`CopyService`](CopyService.md)

## Properties

### columnSeparatorChar

▪ `Static` **columnSeparatorChar**: `string` = `'\t'`

#### Defined in

[src/lib/table/service/copy-service.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/copy-service.ts#L21)

___

### maxCopyCells

▪ `Static` **maxCopyCells**: `number` = `1_000_000`

Upper limit for the number of cells [createContent](CopyService.md#createcontent) copies (e.g. after Ctrl+A on a table with millions
of rows). Larger selections are rejected instead of building a huge string and blocking the browser.

**`Example`**

```ts
CopyService.maxCopyCells = 5_000_000; // allow bigger copies
```

#### Defined in

[src/lib/table/service/copy-service.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/copy-service.ts#L19)

___

### rowSeparatorChar

▪ `Static` **rowSeparatorChar**: `string` = `'\n'`

#### Defined in

[src/lib/table/service/copy-service.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/copy-service.ts#L22)

## Methods

### copyContent

▸ **copyContent**(`content`): `Promise`\<`void`\>

Copy the provided content to the clipboard.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `content` | `string` | The content to be copied. |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the content has been successfully copied to the clipboard.

#### Implementation of

[CopyServiceIf](../interfaces/CopyServiceIf.md).[copyContent](../interfaces/CopyServiceIf.md#copycontent)

#### Defined in

[src/lib/table/service/copy-service.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/copy-service.ts#L100)

___

### copyToClipboard

▸ **copyToClipboard**(`tableModel`, `selectionModel`, `focusModel`): `Promise`\<`string`\>

Asynchronously copies the content of a table to the clipboard.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) | The table model to copy from. |
| `selectionModel` | [`SelectionModelIf`](../interfaces/SelectionModelIf.md) | The selection model of the table. |
| `focusModel` | [`FocusModelIf`](../interfaces/FocusModelIf.md) | The focus model of the table. |

#### Returns

`Promise`\<`string`\>

A promise that resolves with the copied text if successful, or rejects if an error occurs.

#### Implementation of

[CopyServiceIf](../interfaces/CopyServiceIf.md).[copyToClipboard](../interfaces/CopyServiceIf.md#copytoclipboard)

#### Defined in

[src/lib/table/service/copy-service.ts:112](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/copy-service.ts#L112)

___

### createContent

▸ **createContent**(`tableModel`, `selectionModel`, `focusModel`): `Promise`\<`string`\>

Returns the content to be copied based on the provided table model, selection model, and focus model.

- Selection: the bounding box of all selected ranges, one line per row, cells separated by TAB; cells inside the
  box that are not selected become empty strings, hidden columns are left out.
- Everything selected ([SelectionModelIf.selectAll](../interfaces/SelectionModelIf.md#selectall), ⌘/Ctrl+A): all displayed body rows × all columns.
- No selection: the text of the focused cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) | The table model for data retrieval. |
| `selectionModel` | [`SelectionModelIf`](../interfaces/SelectionModelIf.md) | The selection model to determine the selected range. |
| `focusModel` | [`FocusModelIf`](../interfaces/FocusModelIf.md) | The focus model to determine the focused cell. |

#### Returns

`Promise`\<`string`\>

A promise that resolves to the copied content as a string.

**`Throws`**

Throws an error if neither selection nor focus is defined.

#### Implementation of

[CopyServiceIf](../interfaces/CopyServiceIf.md).[createContent](../interfaces/CopyServiceIf.md#createcontent)

#### Defined in

[src/lib/table/service/copy-service.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/service/copy-service.ts#L38)
