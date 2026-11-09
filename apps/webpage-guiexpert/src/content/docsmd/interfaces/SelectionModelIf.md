[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectionModelIf

# Interface: SelectionModelIf

What is selected in a table – a list of rectangles ([CellRange](../classes/CellRange.md)). The implementation is [SelectionModel](../classes/SelectionModel.md);
every table gets its own, or you pass one via [TableOptionsIf.getSelectionModel](TableOptionsIf.md#getselectionmodel).
Changes are reported to [EventListenerIf.onSelectionChanged](EventListenerIf.md#onselectionchanged).

**`Example`**

```ts
override onSelectionChanged(model: SelectionModelIf): void {
  // rows with at least one selected cell – also for "row"/"column" selections (their ranges are unbounded:
  // r2/c2 = Number.MAX_SAFE_INTEGER, so (r2 - r1 + 1) * (c2 - c1 + 1) is no cell count)
  const rowCount = tableModel.getBodyModel().getRowCount();
  const rows = model.getMergedRowIndices(rowCount);
  console.log(model.hasSelection() ? `${rows.length} rows with selected cells` : "nothing selected");
}
```

**`See`**

Training: [Select cells, rows and ranges – and copy them](https://gui.expert/training/selection-and-copy/)

## Implemented by

- [`SelectionModel`](../classes/SelectionModel.md)

## Table of contents

### Methods

- [addEventSelectionChangedListener](SelectionModelIf.md#addeventselectionchangedlistener)
- [addSelection](SelectionModelIf.md#addselection)
- [adjustForRowChanges](SelectionModelIf.md#adjustforrowchanges)
- [clear](SelectionModelIf.md#clear)
- [firstClick](SelectionModelIf.md#firstclick)
- [getEventSelectionChangedListeners](SelectionModelIf.md#geteventselectionchangedlisteners)
- [getMergedRowIndices](SelectionModelIf.md#getmergedrowindices)
- [getRanges](SelectionModelIf.md#getranges)
- [getSelectionCount](SelectionModelIf.md#getselectioncount)
- [hasNoSelection](SelectionModelIf.md#hasnoselection)
- [hasSelection](SelectionModelIf.md#hasselection)
- [isAllSelected](SelectionModelIf.md#isallselected)
- [isSelected](SelectionModelIf.md#isselected)
- [removeEventSelectionChangedListener](SelectionModelIf.md#removeeventselectionchangedlistener)
- [removeSelection](SelectionModelIf.md#removeselection)
- [selectAll](SelectionModelIf.md#selectall)
- [togglePoint](SelectionModelIf.md#togglepoint)

## Methods

### addEventSelectionChangedListener

▸ **addEventSelectionChangedListener**(`listener`): `void`

Get notified on every change of the selection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L28)

___

### addSelection

▸ **addSelection**(`range`): `void`

Adds a rectangle to the selection, e.g. `new CellRange(0, 0, 9, 3)` (rows 0–9, columns 0–3).
Cells removed before ([removeSelection](SelectionModelIf.md#removeselection)) are selected again – the last operation wins.

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`CellRange`](../classes/CellRange.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L86)

___

### adjustForRowChanges

▸ **adjustForRowChanges**(`shift`): `boolean`

Optional (live data, since 1.1.108): moves the selected rows along when rows were removed at the start or
inserted (`tableApi.appendRows()` / `rowsAppended()`), instead of clearing the selection. Removed rows leave the
selection; rows inserted inside a selected range split it (they are not selected); whole columns and "all
selected" stay. Fires no event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `shift` | [`RowIndexShift`](../classes/RowIndexShift.md) | how the display indices move |

#### Returns

`boolean`

true if a selected row was removed (the selection shows other rows now)

**`Example`**

```ts
selectionModel.adjustForRowChanges?.(new RowIndexShift([0, 1], [98, 99]));
```

#### Defined in

[src/lib/table/selection/selection-model.if.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L114)

___

### clear

▸ **clear**(): `void`

Removes the whole selection.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L74)

___

### firstClick

▸ **firstClick**(`rowIndex`, `columnIndex`): `void`

Called by the table on a click: starts a selection at this cell, depending on selection type and mode.

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L101)

___

### getEventSelectionChangedListeners

▸ **getEventSelectionChangedListeners**(): [`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md)[]

The registered listeners (the table registers itself).

#### Returns

[`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md)[]

#### Defined in

[src/lib/table/selection/selection-model.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L26)

___

### getMergedRowIndices

▸ **getMergedRowIndices**(`rowCount?`): `number`[]

The indices of all rows that contain at least one selected cell, sorted ascending.

Ranges that cover all rows (selection type `"column"`) and [selectAll](SelectionModelIf.md#selectall) need `rowCount` to be listed;
without it they are skipped. Implementations written before `rowCount` existed may ignore it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount?` | `number` | number of body rows (optional): limits the result to `0 … rowCount - 1` |

#### Returns

`number`[]

**`Example`**

```ts
const sm = tableApi.getSelectionModel();
const rowIndices = sm?.getMergedRowIndices(tableModel.getBodyModel().getRowCount()) ?? [];
```

#### Defined in

[src/lib/table/selection/selection-model.if.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L71)

___

### getRanges

▸ **getRanges**(): [`CellRange`](../classes/CellRange.md)[]

Returns an array of CellRange objects representing the selections.

#### Returns

[`CellRange`](../classes/CellRange.md)[]

Array of CellRange objects representing the ranges.

#### Defined in

[src/lib/table/selection/selection-model.if.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L57)

___

### getSelectionCount

▸ **getSelectionCount**(`rowIndex`, `columnIndex`): `number`

In how many selected ranges is this cell (0 = not selected)?

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`number`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L92)

___

### hasNoSelection

▸ **hasNoSelection**(): `boolean`

Is nothing selected?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L80)

___

### hasSelection

▸ **hasSelection**(): `boolean`

Is anything selected?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:77](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L77)

___

### isAllSelected

▸ **isAllSelected**(): `boolean`

Was everything selected with [selectAll](SelectionModelIf.md#selectall)?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L98)

___

### isSelected

▸ **isSelected**(`row`, `col`): `boolean`

Checks if a specific cell in a grid is selected.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | The row index of the cell to check. |
| `col` | `number` | The column index of the cell to check. |

#### Returns

`boolean`

- Returns true if the cell is selected, otherwise false.

#### Defined in

[src/lib/table/selection/selection-model.if.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L50)

___

### removeEventSelectionChangedListener

▸ **removeEventSelectionChangedListener**(`listener`): `void`

Stop notifications.

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L30)

___

### removeSelection

▸ **removeSelection**(`range`): `void`

Removes a rectangle from the selection (also from "all selected"); a later [addSelection](SelectionModelIf.md#addselection) selects it again.

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`CellRange`](../classes/CellRange.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:89](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L89)

___

### selectAll

▸ **selectAll**(): `void`

Selects all cells (⌘/Ctrl+A) – also those removed from the selection before.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L95)

___

### togglePoint

▸ **togglePoint**(`row`, `col`): `void`

Toggles the selection state of a point at the specified row and column in a grid.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | The row index of the point to toggle. |
| `col` | `number` | The column index of the point to toggle. |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L41)
