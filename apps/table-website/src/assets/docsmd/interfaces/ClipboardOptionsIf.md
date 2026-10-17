[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ClipboardOptionsIf

# Interface: ClipboardOptionsIf

Copy, cut and paste like Excel ([TableOptionsIf.clipboard](TableOptionsIf.md#clipboard)). `clipboard: true` uses the defaults of
[ClipboardOptions](../classes/ClipboardOptions.md); an object overrides single values.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  getSelectionModel: () => new SelectionModel("range", "multi"),
  editing: true,
  clipboard: { pasteAddsRows: true, createRow: () => ({ name: "", qty: 0 }) },
};
```

**`Since`**

1.1.99

## Implemented by

- [`ClipboardOptions`](../classes/ClipboardOptions.md)

## Table of contents

### Properties

- [copyHeaders](ClipboardOptionsIf.md#copyheaders)
- [copyValue](ClipboardOptionsIf.md#copyvalue)
- [createRow](ClipboardOptionsIf.md#createrow)
- [html](ClipboardOptionsIf.md#html)
- [maxPasteCells](ClipboardOptionsIf.md#maxpastecells)
- [pasteAddsRows](ClipboardOptionsIf.md#pasteaddsrows)
- [processCopy](ClipboardOptionsIf.md#processcopy)
- [processPaste](ClipboardOptionsIf.md#processpaste)

## Properties

### copyHeaders

• **copyHeaders**: `boolean`

Copy the header labels as first row. Default `false`.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L54)

___

### copyValue

• **copyValue**: ``"raw"`` \| ``"text"``

`"text"`: the text as shown (default); `"raw"`: the value (a number without group separators, ISO dates).

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L56)

___

### createRow

• `Optional` **createRow**: (`index`: `number`) => `unknown`

#### Type declaration

▸ (`index`): `unknown`

Creates a new row for `pasteAddsRows` (the index is the display index it gets).

##### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

##### Returns

`unknown`

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L62)

___

### html

• **html**: `boolean`

Also put an HTML `<table>` into the clipboard (`text/html`, numbers keep their value in Excel). Default `true`.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L58)

___

### maxPasteCells

• **maxPasteCells**: `number`

Upper limit of pasted cells (after tiling); more are refused and announced. Default `1_000_000`.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L64)

___

### pasteAddsRows

• **pasteAddsRows**: `boolean`

Pasting over the last row adds rows (`createRow` is needed for arrays of objects). Default `false`.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L60)

___

### processCopy

• `Optional` **processCopy**: (`ctx`: [`CopyContextIf`](CopyContextIf.md)) => `void` \| `string`[][]

#### Type declaration

▸ (`ctx`): `void` \| `string`[][]

Changes the copied cells (return a new matrix) – or only reads them.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`CopyContextIf`](CopyContextIf.md) |

##### Returns

`void` \| `string`[][]

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L66)

___

### processPaste

• `Optional` **processPaste**: (`ctx`: [`PasteContextIf`](PasteContextIf.md)) => ``false`` \| `void` \| `unknown`[][]

#### Type declaration

▸ (`ctx`): ``false`` \| `void` \| `unknown`[][]

Changes the pasted cells (return new values), refuses the paste (`false`) – or only reads them.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`PasteContextIf`](PasteContextIf.md) |

##### Returns

``false`` \| `void` \| `unknown`[][]

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L68)
