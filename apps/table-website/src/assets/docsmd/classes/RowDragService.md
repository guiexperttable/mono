[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowDragService

# Class: RowDragService

Row drag of one table (`tableScope.rowDragService`): drag handles ([ColumnDefIf.rowDrag](../interfaces/ColumnDefIf.md#rowdrag)), pointer drag with
ghost, drop marker and auto-scroll, the keyboard alternative (`MOVE_ROW_UP` / `MOVE_ROW_DOWN`) and the managed move.
Use [TableApi.moveRows](TableApi.md#moverows), [TableApi.isRowDragging](TableApi.md#isrowdragging) and [TableApi.cancelRowDrag](TableApi.md#cancelrowdrag) instead.

Pointer Events (mouse, touch, pen) – only on the drag handle; its `pointerdown` is prevented, so the mouse handler
of the table (range selection, column drag) never sees it.

**`Since`**

1.1.95

## Table of contents

### Constructors

- [constructor](RowDragService.md#constructor)

### Accessors

- [options](RowDragService.md#options)

### Methods

- [cancel](RowDragService.md#cancel)
- [decorateCell](RowDragService.md#decoratecell)
- [destroy](RowDragService.md#destroy)
- [getBlockReason](RowDragService.md#getblockreason)
- [getDragRowIndices](RowDragService.md#getdragrowindices)
- [getHandleState](RowDragService.md#gethandlestate)
- [isDragSourceRow](RowDragService.md#isdragsourcerow)
- [isDragging](RowDragService.md#isdragging)
- [moveByKeyboard](RowDragService.md#movebykeyboard)
- [moveRows](RowDragService.md#moverows)

## Constructors

### constructor

• **new RowDragService**(`tableScope`): [`RowDragService`](RowDragService.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableScope` | [`TableScope`](TableScope.md) |

#### Returns

[`RowDragService`](RowDragService.md)

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L72)

## Accessors

### options

• `get` **options**(): [`RowDragOptionsIf`](../interfaces/RowDragOptionsIf.md)

The options of this table ([TableOptionsIf.rowDragOptions](../interfaces/TableOptionsIf.md#rowdragoptions) + defaults).

#### Returns

[`RowDragOptionsIf`](../interfaces/RowDragOptionsIf.md)

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L86)

## Methods

### cancel

▸ **cancel**(`originalEvent?`): `void`

Cancels a running drag (Escape, `pointercancel`, [TableApi.cancelRowDrag](TableApi.md#cancelrowdrag), destroy): `onRowDragEnd` with the
type `"cancel"`, nothing is moved.

#### Parameters

| Name | Type |
| :------ | :------ |
| `originalEvent?` | `PointerEvent` \| `KeyboardEvent` |

#### Returns

`void`

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:429](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L429)

___

### decorateCell

▸ **decorateCell**(`cell`, `state`): `void`

Adds the drag handle to a rendered body cell (called by the render pass for columns with `rowDrag`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cell` | `HTMLDivElement` | the cell div |
| `state` | [`RowDragHandleState`](../modules.md#rowdraghandlestate) | from [getHandleState](RowDragService.md#gethandlestate) |

#### Returns

`void`

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:152](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L152)

___

### destroy

▸ **destroy**(): `void`

Releases everything (TableScope.destroy). A running drag is cancelled.

#### Returns

`void`

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:459](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L459)

___

### getBlockReason

▸ **getBlockReason**(): `undefined` \| ``"filtered"`` \| ``"sorted"``

Why a managed drag is not possible right now: `"sorted"` (a column has the sort state asc/desc), `"filtered"`
(a filter hides rows) – `undefined` if it is possible or the drag is unmanaged.

#### Returns

`undefined` \| ``"filtered"`` \| ``"sorted"``

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L104)

___

### getDragRowIndices

▸ **getDragRowIndices**(`rowIndex`): `number`[]

The dragged rows for a grabbed row: all rows with a selection if it is one of them (multiRow), else this one.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |

#### Returns

`number`[]

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:683](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L683)

___

### getHandleState

▸ **getHandleState**(`rowIndex`, `columnDef`, `areaModel`): [`RowDragHandleState`](../modules.md#rowdraghandlestate)

The drag handle of a body cell: none (no `rowDrag`, a group or pivot row, a managed drag the model cannot do),
enabled or disabled (managed + sorted/filtered).

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnDef` | `undefined` \| [`ColumnDefIf`](../interfaces/ColumnDefIf.md) |
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) |

#### Returns

[`RowDragHandleState`](../modules.md#rowdraghandlestate)

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L123)

___

### isDragSourceRow

▸ **isDragSourceRow**(`rowIndex`): `boolean`

true if the row is one of the dragged rows (it is painted dimmed).

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L96)

___

### isDragging

▸ **isDragging**(): `boolean`

true while rows are dragged with the pointer.

#### Returns

`boolean`

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L91)

___

### moveByKeyboard

▸ **moveByKeyboard**(`direction`): `boolean`

`MOVE_ROW_UP` / `MOVE_ROW_DOWN`: moves the focused row (or the selected rows, if it is one of them) one position.
Trees: among the siblings.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `direction` | ``1`` \| ``-1`` | up or down |

#### Returns

`boolean`

true if the key was used (a row with a drag handle has the focus)

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:614](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L614)

___

### moveRows

▸ **moveRows**(`rowIndices`, `target`, `reselect?`): `number`

Moves rows in the model (managed), repaints, keeps focus and selection on the moved rows and announces the new
position.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `rowIndices` | `number`[] | `undefined` | display indices |
| `target` | [`RowDropTargetIf`](../interfaces/RowDropTargetIf.md) | `undefined` | drop target |
| `reselect` | `boolean` | `true` | select the moved rows again (multi-row drag) |

#### Returns

`number`

the new display index of the first moved row, -1 if nothing moved

#### Defined in

[src/lib/table/row-drag/row-drag-service.ts:543](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-drag/row-drag-service.ts#L543)
