[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnAutoWidthContextIf

# Interface: ColumnAutoWidthContextIf

What [ColumnAutoWidthOptionsIf.getWidth](ColumnAutoWidthOptionsIf.md#getwidth) gets to measure a column itself.

**`Since`**

1.1.110

## Table of contents

### Properties

- [columnDef](ColumnAutoWidthContextIf.md#columndef)
- [columnIndex](ColumnAutoWidthContextIf.md#columnindex)
- [firstRenderedRow](ColumnAutoWidthContextIf.md#firstrenderedrow)
- [lastRenderedRow](ColumnAutoWidthContextIf.md#lastrenderedrow)
- [property](ColumnAutoWidthContextIf.md#property)
- [source](ColumnAutoWidthContextIf.md#source)

### Methods

- [getDefaultWidth](ColumnAutoWidthContextIf.md#getdefaultwidth)
- [measureText](ColumnAutoWidthContextIf.md#measuretext)

## Properties

### columnDef

• **columnDef**: `undefined` \| [`ColumnDefIf`](ColumnDefIf.md)

The column definition (`undefined` for a table model without column definitions).

#### Defined in

[src/lib/table/column-drag/column-auto-width-context.if.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-context.if.ts#L13)

___

### columnIndex

• **columnIndex**: `number`

Model index of the column.

#### Defined in

[src/lib/table/column-drag/column-auto-width-context.if.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-context.if.ts#L11)

___

### firstRenderedRow

• **firstRenderedRow**: `number`

First body row drawn now (display index).

#### Defined in

[src/lib/table/column-drag/column-auto-width-context.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-context.if.ts#L19)

___

### lastRenderedRow

• **lastRenderedRow**: `number`

Last body row drawn now (display index, `-1` without rows).

#### Defined in

[src/lib/table/column-drag/column-auto-width-context.if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-context.if.ts#L21)

___

### property

• **property**: `undefined` \| `string`

The property of the column.

#### Defined in

[src/lib/table/column-drag/column-auto-width-context.if.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-context.if.ts#L15)

___

### source

• **source**: ``"dblclick"`` \| ``"api"``

A double click on the resize handle, or a call of [TableApi.autoResizeColumn](../classes/TableApi.md#autoresizecolumn) / [TableApi.autoResizeColumns](../classes/TableApi.md#autoresizecolumns).

#### Defined in

[src/lib/table/column-drag/column-auto-width-context.if.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-context.if.ts#L17)

## Methods

### getDefaultWidth

▸ **getDefaultWidth**(): `number`

The default measurement of this column (header, footer, body rows up to [ColumnAutoWidthOptionsIf.maxRows](ColumnAutoWidthOptionsIf.md#maxrows)).

#### Returns

`number`

#### Defined in

[src/lib/table/column-drag/column-auto-width-context.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-context.if.ts#L28)

___

### measureText

▸ **measureText**(`text`): `number`

Width in px a cell needs for this text: measured with the font of a rendered cell label, plus its padding (the
same measurement as the default).

#### Parameters

| Name | Type |
| :------ | :------ |
| `text` | `string` |

#### Returns

`number`

#### Defined in

[src/lib/table/column-drag/column-auto-width-context.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-drag/column-auto-width-context.if.ts#L26)
