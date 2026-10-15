[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowNumberOptions

# Class: RowNumberOptions

The default options of the row number column: numbers of the current view, no thousands separators, header `"#"`,
not exported, at least 36 px wide.

**`Example`**

```ts
const columnDef = new RowNumberColumnDef({ ...new RowNumberOptions(), headerLabel: "" });
```

**`Since`**

1.1.93

## Implements

- [`RowNumberOptionsIf`](../interfaces/RowNumberOptionsIf.md)

## Table of contents

### Constructors

- [constructor](RowNumberOptions.md#constructor)

### Properties

- [exported](RowNumberOptions.md#exported)
- [format](RowNumberOptions.md#format)
- [headerLabel](RowNumberOptions.md#headerlabel)
- [minWidthInPx](RowNumberOptions.md#minwidthinpx)
- [mode](RowNumberOptions.md#mode)

## Constructors

### constructor

• **new RowNumberOptions**(): [`RowNumberOptions`](RowNumberOptions.md)

#### Returns

[`RowNumberOptions`](RowNumberOptions.md)

## Properties

### exported

• **exported**: `boolean` = `false`

`true`: [TableApi.copyToClipboard](TableApi.md#copytoclipboard) and [TableApi.downloadExcel](TableApi.md#downloadexcel) contain the numbers. Default `false`.

#### Implementation of

[RowNumberOptionsIf](../interfaces/RowNumberOptionsIf.md).[exported](../interfaces/RowNumberOptionsIf.md#exported)

#### Defined in

[src/lib/table/data/common/row-number-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.ts#L17)

___

### format

• **format**: (`rowNumber`: `number`) => `string` = `defaultRowNumberFormat`

#### Type declaration

▸ (`rowNumber`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `rowNumber` | `number` |

##### Returns

`string`

#### Implementation of

[RowNumberOptionsIf](../interfaces/RowNumberOptionsIf.md).[format](../interfaces/RowNumberOptionsIf.md#format)

#### Defined in

[src/lib/table/data/common/row-number-options.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.ts#L15)

___

### headerLabel

• **headerLabel**: `string` = `"#"`

Text of the header cell. Default `"#"` (an empty header cell has no accessible name).

#### Implementation of

[RowNumberOptionsIf](../interfaces/RowNumberOptionsIf.md).[headerLabel](../interfaces/RowNumberOptionsIf.md#headerlabel)

#### Defined in

[src/lib/table/data/common/row-number-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.ts#L16)

___

### minWidthInPx

• **minWidthInPx**: `number` = `36`

The column is never narrower than this (px). Default 36.

#### Implementation of

[RowNumberOptionsIf](../interfaces/RowNumberOptionsIf.md).[minWidthInPx](../interfaces/RowNumberOptionsIf.md#minwidthinpx)

#### Defined in

[src/lib/table/data/common/row-number-options.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.ts#L18)

___

### mode

• **mode**: [`RowNumberMode`](../modules.md#rownumbermode) = `"display"`

`"display"` (default) or `"original"`, see [RowNumberMode](../modules.md#rownumbermode).

#### Implementation of

[RowNumberOptionsIf](../interfaces/RowNumberOptionsIf.md).[mode](../interfaces/RowNumberOptionsIf.md#mode)

#### Defined in

[src/lib/table/data/common/row-number-options.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.ts#L14)
