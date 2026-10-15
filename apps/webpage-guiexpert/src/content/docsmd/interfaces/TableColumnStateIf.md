[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableColumnStateIf

# Interface: TableColumnStateIf

Width, visibility and (by its position in [TableStateIf.columns](TableStateIf.md#columns)) order of one column.

**`Since`**

1.1.92

## Table of contents

### Properties

- [property](TableColumnStateIf.md#property)
- [visible](TableColumnStateIf.md#visible)
- [width](TableColumnStateIf.md#width)

## Properties

### property

• **property**: `string`

The property of the column ([ColumnDefIf.property](ColumnDefIf.md#property)).

#### Defined in

[src/lib/table/state/table-state.if.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L94)

___

### visible

• `Optional` **visible**: `boolean`

`false` = hidden with [TableApi.setColumnVisible](../classes/TableApi.md#setcolumnvisible) (a collapsed header group is stored separately).

#### Defined in

[src/lib/table/state/table-state.if.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L98)

___

### width

• `Optional` **width**: `number`

Width in px – only set for columns the user (or `setColumnWidth`) resized; otherwise the width of the code.

#### Defined in

[src/lib/table/state/table-state.if.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L96)
