[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowDropTargetIf

# Interface: RowDropTargetIf

The drop target of a row drag ([GeRowDragEvent.target](../classes/GeRowDragEvent.md#target), [TableApi.moveRows](../classes/TableApi.md#moverows)).

`rowIndex` is the display index (body row index) of the target row **before** the rows are moved.

**`Example`**

```ts
// move the rows 2 and 3 behind the last row
tableApi.moveRows([2, 3], { rowIndex: tableApi.getDisplayedRowCount() - 1, position: "after" });
```

**`Since`**

1.1.95

## Table of contents

### Properties

- [position](RowDropTargetIf.md#position)
- [rowIndex](RowDropTargetIf.md#rowindex)

## Properties

### position

• **position**: [`RowDropPosition`](../modules.md#rowdropposition)

Before or after that row, or inside it (tree: becomes its last child).

#### Defined in

[src/lib/table/row-drag/row-drop-target.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drop-target.if.ts#L29)

___

### rowIndex

• **rowIndex**: `number`

Display index of the row next to (or under) the drop marker – before the move.

#### Defined in

[src/lib/table/row-drag/row-drop-target.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drop-target.if.ts#L27)
