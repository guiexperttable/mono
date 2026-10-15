[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableSortStateIf

# Interface: TableSortStateIf

One sorted column.

**`Since`**

1.1.92

## Table of contents

### Properties

- [columnIndex](TableSortStateIf.md#columnindex)
- [property](TableSortStateIf.md#property)
- [sortState](TableSortStateIf.md#sortstate)

## Properties

### columnIndex

• `Optional` **columnIndex**: `number`

Only for tables without column definitions (and the format before 1.1.92): the column index.

#### Defined in

[src/lib/table/state/table-state.if.ts:111](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L111)

___

### property

• `Optional` **property**: `string`

The property of the column.

#### Defined in

[src/lib/table/state/table-state.if.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L109)

___

### sortState

• **sortState**: [`SortState`](../modules.md#sortstate)

`"asc"` or `"desc"`.

#### Defined in

[src/lib/table/state/table-state.if.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L113)
