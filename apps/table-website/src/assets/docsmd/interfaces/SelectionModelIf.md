[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectionModelIf

# Interface: SelectionModelIf

What is selected in a table – a list of rectangles ([CellRange](../classes/CellRange.md)). The implementation is [SelectionModel](../classes/SelectionModel.md);
every table gets its own, or you pass one via [TableOptionsIf.getSelectionModel](TableOptionsIf.md#getselectionmodel).
Changes are reported to [EventListenerIf.onSelectionChanged](EventListenerIf.md#onselectionchanged).

**`Example`**

```ts
override onSelectionChanged(model: SelectionModelIf): void {
  const ranges = model.getRanges().filter(r => !r.gammaRange);     // skip special ranges
  const cells = ranges.reduce((n, r) => n + (r.r2 - r.r1 + 1) * (r.c2 - r.c1 + 1), 0);
  console.log(`${cells} cells selected`);
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

[src/lib/table/selection/selection-model.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L25)

___

### addSelection

▸ **addSelection**(`range`): `void`

Adds a rectangle to the selection, e.g. `new CellRange(0, 0, 9, 3)` (rows 0–9, columns 0–3).

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`CellRange`](../classes/CellRange.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L69)

___

### clear

▸ **clear**(): `void`

Removes the whole selection.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L60)

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

[src/lib/table/selection/selection-model.if.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L84)

___

### getEventSelectionChangedListeners

▸ **getEventSelectionChangedListeners**(): [`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md)[]

The registered listeners (the table registers itself).

#### Returns

[`EventSelectionChangedListenerIf`](EventSelectionChangedListenerIf.md)[]

#### Defined in

[src/lib/table/selection/selection-model.if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L23)

___

### getMergedRowIndices

▸ **getMergedRowIndices**(): `number`[]

The indices of all rows that contain at least one selected cell, sorted.

#### Returns

`number`[]

#### Defined in

[src/lib/table/selection/selection-model.if.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L57)

___

### getRanges

▸ **getRanges**(): [`CellRange`](../classes/CellRange.md)[]

Returns an array of CellRange objects representing the selections.

#### Returns

[`CellRange`](../classes/CellRange.md)[]

Array of CellRange objects representing the ranges.

#### Defined in

[src/lib/table/selection/selection-model.if.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L54)

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

[src/lib/table/selection/selection-model.if.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L75)

___

### hasNoSelection

▸ **hasNoSelection**(): `boolean`

Is nothing selected?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L66)

___

### hasSelection

▸ **hasSelection**(): `boolean`

Is anything selected?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L63)

___

### isAllSelected

▸ **isAllSelected**(): `boolean`

Was everything selected with [selectAll](SelectionModelIf.md#selectall)?

#### Returns

`boolean`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L81)

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

[src/lib/table/selection/selection-model.if.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L47)

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

[src/lib/table/selection/selection-model.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L27)

___

### removeSelection

▸ **removeSelection**(`range`): `void`

Removes a rectangle from the selection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`CellRange`](../classes/CellRange.md) |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L72)

___

### selectAll

▸ **selectAll**(): `void`

Selects all cells (⌘/Ctrl+A).

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.if.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L78)

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

[src/lib/table/selection/selection-model.if.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.if.ts#L38)
