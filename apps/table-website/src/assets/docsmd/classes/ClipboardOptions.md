[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ClipboardOptions

# Class: ClipboardOptions

The defaults of [ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md) (copy, cut and paste, [TableOptionsIf.clipboard](../interfaces/TableOptionsIf.md#clipboard)).

**`Example`**

```ts
const options = ClipboardOptions.create({ copyHeaders: true });
options?.html;   // true
```

**`Since`**

1.1.99

## Implements

- [`ClipboardOptionsIf`](../interfaces/ClipboardOptionsIf.md)

## Table of contents

### Constructors

- [constructor](ClipboardOptions.md#constructor)

### Properties

- [copyHeaders](ClipboardOptions.md#copyheaders)
- [copyValue](ClipboardOptions.md#copyvalue)
- [createRow](ClipboardOptions.md#createrow)
- [html](ClipboardOptions.md#html)
- [maxPasteCells](ClipboardOptions.md#maxpastecells)
- [pasteAddsRows](ClipboardOptions.md#pasteaddsrows)
- [processCopy](ClipboardOptions.md#processcopy)
- [processPaste](ClipboardOptions.md#processpaste)

### Methods

- [create](ClipboardOptions.md#create)

## Constructors

### constructor

• **new ClipboardOptions**(): [`ClipboardOptions`](ClipboardOptions.md)

#### Returns

[`ClipboardOptions`](ClipboardOptions.md)

## Properties

### copyHeaders

• **copyHeaders**: `boolean` = `false`

Copy the header labels as first row. Default `false`.

#### Implementation of

[ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md).[copyHeaders](../interfaces/ClipboardOptionsIf.md#copyheaders)

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L14)

___

### copyValue

• **copyValue**: ``"raw"`` \| ``"text"`` = `"text"`

`"text"`: the text as shown (default); `"raw"`: the value (a number without group separators, ISO dates).

#### Implementation of

[ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md).[copyValue](../interfaces/ClipboardOptionsIf.md#copyvalue)

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L15)

___

### createRow

• `Optional` **createRow**: (`index`: `number`) => `unknown` = `undefined`

#### Type declaration

▸ (`index`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

##### Returns

`unknown`

#### Implementation of

[ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md).[createRow](../interfaces/ClipboardOptionsIf.md#createrow)

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L18)

___

### html

• **html**: `boolean` = `true`

Also put an HTML `<table>` into the clipboard (`text/html`, numbers keep their value in Excel). Default `true`.

#### Implementation of

[ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md).[html](../interfaces/ClipboardOptionsIf.md#html)

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L16)

___

### maxPasteCells

• **maxPasteCells**: `number` = `1_000_000`

Upper limit of pasted cells (after tiling); more are refused and announced. Default `1_000_000`.

#### Implementation of

[ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md).[maxPasteCells](../interfaces/ClipboardOptionsIf.md#maxpastecells)

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L19)

___

### pasteAddsRows

• **pasteAddsRows**: `boolean` = `false`

Pasting over the last row adds rows (`createRow` is needed for arrays of objects). Default `false`.

#### Implementation of

[ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md).[pasteAddsRows](../interfaces/ClipboardOptionsIf.md#pasteaddsrows)

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L17)

___

### processCopy

• `Optional` **processCopy**: (`ctx`: [`CopyContextIf`](../interfaces/CopyContextIf.md)) => `void` \| `string`[][] = `undefined`

#### Type declaration

▸ (`ctx`): `void` \| `string`[][]

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`CopyContextIf`](../interfaces/CopyContextIf.md) |

##### Returns

`void` \| `string`[][]

#### Implementation of

[ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md).[processCopy](../interfaces/ClipboardOptionsIf.md#processcopy)

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L20)

___

### processPaste

• `Optional` **processPaste**: (`ctx`: [`PasteContextIf`](../interfaces/PasteContextIf.md)) => ``false`` \| `void` \| `unknown`[][] = `undefined`

#### Type declaration

▸ (`ctx`): ``false`` \| `void` \| `unknown`[][]

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`PasteContextIf`](../interfaces/PasteContextIf.md) |

##### Returns

``false`` \| `void` \| `unknown`[][]

#### Implementation of

[ClipboardOptionsIf](../interfaces/ClipboardOptionsIf.md).[processPaste](../interfaces/ClipboardOptionsIf.md#processpaste)

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L21)

## Methods

### create

▸ **create**(`option?`): `undefined` \| [`ClipboardOptionsIf`](../interfaces/ClipboardOptionsIf.md)

The options of [TableOptionsIf.clipboard](../interfaces/TableOptionsIf.md#clipboard): `undefined`/`false` = off, `true` = the defaults, an object = the
defaults overridden by its values (`undefined` keeps the default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `option?` | `boolean` \| `Partial`\<[`ClipboardOptionsIf`](../interfaces/ClipboardOptionsIf.md)\> | `tableOptions.clipboard` |

#### Returns

`undefined` \| [`ClipboardOptionsIf`](../interfaces/ClipboardOptionsIf.md)

complete options, `undefined` if the option is off

#### Defined in

[src/lib/table/clipboard/clipboard-options.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.ts#L30)
