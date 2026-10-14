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

[src/lib/table/selection/selection-model.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L27)

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

[src/lib/table/selection/selection-model.if.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L85)

___

### clear

▸ **clear**(): `void`

Removes the whole selection.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L73)

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

[src/lib/table/selection/selection-model.if.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L100)

___

### getEventSelectionChangedListeners

▸ **getEventSelectionChangedListeners**(): [`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md)[]

The registered listeners (the table registers itself).

#### Returns

[`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md)[]

#### Defined in

[src/lib/table/selection/selection-model.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L25)

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

[src/lib/table/selection/selection-model.if.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L70)

___

### getRanges

▸ **getRanges**(): [`CellRange`](../classes/CellRange.md)[]

Returns an array of CellRange objects representing the selections.

#### Returns

[`CellRange`](../classes/CellRange.md)[]

Array of CellRange objects representing the ranges.

#### Defined in

[src/lib/table/selection/selection-model.if.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L56)

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

[src/lib/table/selection/selection-model.if.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L91)

___

### hasNoSelection

▸ **hasNoSelection**(): `boolean`

Is nothing selected?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L79)

___

### hasSelection

▸ **hasSelection**(): `boolean`

Is anything selected?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L76)

___

### isAllSelected

▸ **isAllSelected**(): `boolean`

Was everything selected with [selectAll](SelectionModelIf.md#selectall)?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L97)

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

[src/lib/table/selection/selection-model.if.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L49)

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

[src/lib/table/selection/selection-model.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L29)

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

[src/lib/table/selection/selection-model.if.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L88)

___

### selectAll

▸ **selectAll**(): `void`

Selects all cells (⌘/Ctrl+A) – also those removed from the selection before.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L94)

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

[src/lib/table/selection/selection-model.if.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L40)
