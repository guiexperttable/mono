[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowDragOptionsIf

# Interface: RowDragOptionsIf

Options of row dragging ([TableOptionsIf.rowDragOptions](TableOptionsIf.md#rowdragoptions)). Rows get a drag handle in every column with
[ColumnDefIf.rowDrag](ColumnDefIf.md#rowdrag) (or `TableFactory.createTableModel({ rows, rowDrag: true })`).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  rowDragOptions: { managed: false, autoScrollMaxSpeedInPx: 40 }   // events only – the app moves the rows
};
```

**`Since`**

1.1.95

## Implemented by

- [`RowDragOptions`](../classes/RowDragOptions.md)

## Table of contents

### Properties

- [autoScrollMaxSpeedInPx](RowDragOptionsIf.md#autoscrollmaxspeedinpx)
- [autoScrollZoneInPx](RowDragOptionsIf.md#autoscrollzoneinpx)
- [dragThresholdInPx](RowDragOptionsIf.md#dragthresholdinpx)
- [ghostText](RowDragOptionsIf.md#ghosttext)
- [managed](RowDragOptionsIf.md#managed)
- [multiRow](RowDragOptionsIf.md#multirow)
- [treeDropInside](RowDragOptionsIf.md#treedropinside)

## Properties

### autoScrollMaxSpeedInPx

• **autoScrollMaxSpeedInPx**: `number`

Maximum auto-scroll speed in px per animation frame (default 24).

#### Defined in

[src/lib/table/row-drag/row-drag-options.if.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.if.ts#L36)

___

### autoScrollZoneInPx

• **autoScrollZoneInPx**: `number`

Height in px of the zone at the top and bottom edge of the body that scrolls automatically (default 40).

#### Defined in

[src/lib/table/row-drag/row-drag-options.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.if.ts#L33)

___

### dragThresholdInPx

• **dragThresholdInPx**: `number`

Distance in px the pointer has to move before a drag starts (default 4) – below it is a click on the handle.

#### Defined in

[src/lib/table/row-drag/row-drag-options.if.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.if.ts#L30)

___

### ghostText

• `Optional` **ghostText**: (`rows`: `any`[]) => `string`

#### Type declaration

▸ (`rows`): `string`

Text of the drag ghost. Default: the text of the handle cell of the first row, "(+2)" for two more rows.
The text is shown as text (never as HTML).

##### Parameters

| Name | Type |
| :------ | :------ |
| `rows` | `any`[] |

##### Returns

`string`

#### Defined in

[src/lib/table/row-drag/row-drag-options.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.if.ts#L42)

___

### managed

• **managed**: `boolean`

`true` (default): the table moves the rows itself (`AreaModelIf.moveRows`) – only while the table is neither
sorted (a column with sort state asc/desc) nor filtered. `false`: the table only reports the drag
(`onRowDragStart/Move/End`), the app moves the rows (e.g. after the server confirmed), always allowed.

#### Defined in

[src/lib/table/row-drag/row-drag-options.if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.if.ts#L21)

___

### multiRow

• **multiRow**: `boolean`

`true` (default): grabbing a selected row drags all rows with a selection (their order stays).

#### Defined in

[src/lib/table/row-drag/row-drag-options.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.if.ts#L24)

___

### treeDropInside

• **treeDropInside**: `boolean`

`true` (default): tree – dropping on the middle of a row makes the rows its children.

#### Defined in

[src/lib/table/row-drag/row-drag-options.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-options.if.ts#L27)
