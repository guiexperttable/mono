[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableScrollStateIf

# Interface: TableScrollStateIf

The scroll position.

**`Since`**

1.1.92

## Table of contents

### Properties

- [firstRowId](TableScrollStateIf.md#firstrowid)
- [left](TableScrollStateIf.md#left)
- [top](TableScrollStateIf.md#top)

## Properties

### firstRowId

• `Optional` **firstRowId**: [`TableStateRowId`](../modules.md#tablestaterowid)

The id of the first visible row. If other rows are at the top after restoring `top` (new data), the table
scrolls to this row.

#### Defined in

[src/lib/table/state/table-state.if.ts:131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L131)

___

### left

• **left**: `number`

Horizontal scroll position in px.

#### Defined in

[src/lib/table/state/table-state.if.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L124)

___

### top

• **top**: `number`

Vertical scroll position in px.

#### Defined in

[src/lib/table/state/table-state.if.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L126)
