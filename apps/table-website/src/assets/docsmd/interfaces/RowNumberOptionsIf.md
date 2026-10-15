[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowNumberOptionsIf

# Interface: RowNumberOptionsIf

Options of the row number column ([RowNumberColumnDef](../classes/RowNumberColumnDef.md)). Pass any subset – to
`new RowNumberColumnDef({ … })` or as `rowNumbersVisible: { … }` to [TableFactory.createTableModel](../classes/TableFactory.md#createtablemodel).
Defaults: [RowNumberOptions](../classes/RowNumberOptions.md).

**`Example`**

```ts
const tableModel = TableFactory.createTableModel({
  rows: orders,
  rowNumbersVisible: { mode: "original", format: n => n.toLocaleString("en-US"), exported: true }
});
```

**`Since`**

1.1.93

## Implemented by

- [`RowNumberOptions`](../classes/RowNumberOptions.md)

## Table of contents

### Properties

- [exported](RowNumberOptionsIf.md#exported)
- [format](RowNumberOptionsIf.md#format)
- [headerLabel](RowNumberOptionsIf.md#headerlabel)
- [minWidthInPx](RowNumberOptionsIf.md#minwidthinpx)
- [mode](RowNumberOptionsIf.md#mode)

## Properties

### exported

• **exported**: `boolean`

`true`: [TableApi.copyToClipboard](../classes/TableApi.md#copytoclipboard) and [TableApi.downloadExcel](../classes/TableApi.md#downloadexcel) contain the numbers. Default `false`.

#### Defined in

[src/lib/table/data/common/row-number-options.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.if.ts#L42)

___

### format

• **format**: (`rowNumber`: `number`) => `string`

#### Type declaration

▸ (`rowNumber`): `string`

The text of a number. Default `String(n)` – no thousands separators (`"2000000"`).
The column width is measured with the text of the largest number, so the text should not get shorter for
larger numbers.

##### Parameters

| Name | Type |
| :------ | :------ |
| `rowNumber` | `number` |

##### Returns

`string`

**`Example`**

```ts
const options: Partial<RowNumberOptionsIf> = { format: n => n.toLocaleString("de-DE") }; // "2.000.000"
```

#### Defined in

[src/lib/table/data/common/row-number-options.if.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.if.ts#L38)

___

### headerLabel

• **headerLabel**: `string`

Text of the header cell. Default `"#"` (an empty header cell has no accessible name).

#### Defined in

[src/lib/table/data/common/row-number-options.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.if.ts#L40)

___

### minWidthInPx

• **minWidthInPx**: `number`

The column is never narrower than this (px). Default 36.

#### Defined in

[src/lib/table/data/common/row-number-options.if.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.if.ts#L44)

___

### mode

• **mode**: [`RowNumberMode`](../modules.md#rownumbermode)

`"display"` (default) or `"original"`, see [RowNumberMode](../modules.md#rownumbermode).

#### Defined in

[src/lib/table/data/common/row-number-options.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-options.if.ts#L29)
