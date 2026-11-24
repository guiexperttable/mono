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

A grid of tiles (`AreaModelIf.getTileLayout()`, e.g. a cover grid – since 1.1.116): the id of the first
**item** of the first visible row (`id`/`uuid` of the item or an own `getRowId(item, index)`). After a restore
with another number of tiles per row the table scrolls to the row of this item. Items without id: not set.

#### Defined in

[src/lib/table/state/table-state.if.ts:143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L143)

___

### left

• **left**: `number`

Horizontal scroll position in px.

#### Defined in

[src/lib/table/state/table-state.if.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L132)

___

### top

• **top**: `number`

Vertical scroll position in px.

#### Defined in

[src/lib/table/state/table-state.if.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L134)
