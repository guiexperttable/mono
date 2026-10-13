[GuiExpert Table API](../README.md) / [Exports](../modules.md) / MultiRowsSelectionModel

# Class: MultiRowsSelectionModel\<T\>

Class representing a multi-row selection model.

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [`SelectionModel`](SelectionModel.md)

  ↳ **`MultiRowsSelectionModel`**

## Table of contents

### Constructors

- [constructor](MultiRowsSelectionModel.md#constructor)

### Properties

- [allSelected](MultiRowsSelectionModel.md#allselected)
- [model](MultiRowsSelectionModel.md#model)
- [negativeRanges](MultiRowsSelectionModel.md#negativeranges)
- [ranges](MultiRowsSelectionModel.md#ranges)
- [selectionMode](MultiRowsSelectionModel.md#selectionmode)
- [selectionType](MultiRowsSelectionModel.md#selectiontype)
- [silent](MultiRowsSelectionModel.md#silent)

### Methods

- [addEventSelectionChangedListener](MultiRowsSelectionModel.md#addeventselectionchangedlistener)
- [addRange](MultiRowsSelectionModel.md#addrange)
- [addSelection](MultiRowsSelectionModel.md#addselection)
- [clear](MultiRowsSelectionModel.md#clear)
- [fireChangeEvent](MultiRowsSelectionModel.md#firechangeevent)
- [firstClick](MultiRowsSelectionModel.md#firstclick)
- [getEventSelectionChangedListeners](MultiRowsSelectionModel.md#geteventselectionchangedlisteners)
- [getMergedRowIndices](MultiRowsSelectionModel.md#getmergedrowindices)
- [getRanges](MultiRowsSelectionModel.md#getranges)
- [getSelectedRowItems](MultiRowsSelectionModel.md#getselectedrowitems)
- [getSelectionCount](MultiRowsSelectionModel.md#getselectioncount)
- [hasNoSelection](MultiRowsSelectionModel.md#hasnoselection)
- [hasSelection](MultiRowsSelectionModel.md#hasselection)
- [isAllSelected](MultiRowsSelectionModel.md#isallselected)
- [isInNegativeRange](MultiRowsSelectionModel.md#isinnegativerange)
- [isSelected](MultiRowsSelectionModel.md#isselected)
- [removeEventSelectionChangedListener](MultiRowsSelectionModel.md#removeeventselectionchangedlistener)
- [removeSelection](MultiRowsSelectionModel.md#removeselection)
- [selectAll](MultiRowsSelectionModel.md#selectall)
- [selectRow](MultiRowsSelectionModel.md#selectrow)
- [toggleFilteredRowsSelection](MultiRowsSelectionModel.md#togglefilteredrowsselection)
- [togglePoint](MultiRowsSelectionModel.md#togglepoint)
- [toggleRow](MultiRowsSelectionModel.md#togglerow)
- [toggleSelection](MultiRowsSelectionModel.md#toggleselection)
- [unselectRow](MultiRowsSelectionModel.md#unselectrow)

## Constructors

### constructor

• **new MultiRowsSelectionModel**\<`T`\>(`model`): [`MultiRowsSelectionModel`](MultiRowsSelectionModel.md)\<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `model` | [`ObjectArrayHolderIf`](../interfaces/ObjectArrayHolderIf.md)\<`T`\> |

#### Returns

[`MultiRowsSelectionModel`](MultiRowsSelectionModel.md)\<`T`\>

#### Overrides

[SelectionModel](SelectionModel.md).[constructor](SelectionModel.md#constructor)

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L14)

## Properties

### allSelected

• `Protected` **allSelected**: `boolean` = `false`

This is a flag to indicate whether all cells in the grid are selected or not.

#### Inherited from

[SelectionModel](SelectionModel.md).[allSelected](SelectionModel.md#allselected)

#### Defined in

[src/lib/table/selection/selection-model.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L50)

___

### model

• **model**: [`ObjectArrayHolderIf`](../interfaces/ObjectArrayHolderIf.md)\<`T`\>

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L15)

___

### negativeRanges

• `Protected` **negativeRanges**: [`CellRange`](CellRange.md)[] = `[]`

This contains all the current negative cell ranges in the grid.

#### Inherited from

[SelectionModel](SelectionModel.md).[negativeRanges](SelectionModel.md#negativeranges)

#### Defined in

[src/lib/table/selection/selection-model.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L49)

___

### ranges

• `Protected` **ranges**: [`CellRange`](CellRange.md)[] = `[]`

This contains all the current selected cell ranges in the grid.

#### Inherited from

[SelectionModel](SelectionModel.md).[ranges](SelectionModel.md#ranges)

#### Defined in

[src/lib/table/selection/selection-model.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L48)

___

### selectionMode

• **selectionMode**: [`SelectionMode`](../modules.md#selectionmode) = `"single"`

The mode of selection being used. It's of type SelectionMode. Default: "single"

#### Inherited from

[SelectionModel](SelectionModel.md).[selectionMode](SelectionModel.md#selectionmode)

#### Defined in

[src/lib/table/selection/selection-model.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L58)

___

### selectionType

• **selectionType**: [`ExtendedSelectionType`](../modules.md#extendedselectiontype) = `"none"`

The type of selection being used. It's of type ExtendedSelectionType. Default: "none"

#### Inherited from

[SelectionModel](SelectionModel.md).[selectionType](SelectionModel.md#selectiontype)

#### Defined in

[src/lib/table/selection/selection-model.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L57)

___

### silent

• `Protected` **silent**: `boolean` = `false`

This is a flag to suppress the firing of selection change events.

#### Inherited from

[SelectionModel](SelectionModel.md).[silent](SelectionModel.md#silent)

#### Defined in

[src/lib/table/selection/selection-model.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L52)

## Methods

### addEventSelectionChangedListener

▸ **addEventSelectionChangedListener**(`listener`): `void`

Get notified on every change of the selection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md) |

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[addEventSelectionChangedListener](SelectionModel.md#addeventselectionchangedlistener)

#### Defined in

[src/lib/table/selection/selection-model.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L66)

___

### addRange

▸ **addRange**(`range`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`CellRange`](CellRange.md) |

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[addRange](SelectionModel.md#addrange)

#### Defined in

[src/lib/table/selection/selection-model.ts:196](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L196)

___

### addSelection

▸ **addSelection**(`range`): `void`

Adds a rectangle to the selection, e.g. `new CellRange(0, 0, 9, 3)` (rows 0–9, columns 0–3).

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`CellRange`](CellRange.md) |

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[addSelection](SelectionModel.md#addselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L164)

___

### clear

▸ **clear**(): `void`

Removes the whole selection.

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[clear](SelectionModel.md#clear)

#### Defined in

[src/lib/table/selection/selection-model.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L123)

___

### fireChangeEvent

▸ **fireChangeEvent**(): `void`

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[fireChangeEvent](SelectionModel.md#firechangeevent)

#### Defined in

[src/lib/table/selection/selection-model.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L80)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[firstClick](SelectionModel.md#firstclick)

#### Defined in

[src/lib/table/selection/selection-model.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L86)

___

### getEventSelectionChangedListeners

▸ **getEventSelectionChangedListeners**(): [`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)[]

The registered listeners (the table registers itself).

#### Returns

[`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)[]

#### Inherited from

[SelectionModel](SelectionModel.md).[getEventSelectionChangedListeners](SelectionModel.md#geteventselectionchangedlisteners)

#### Defined in

[src/lib/table/selection/selection-model.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L62)

___

### getMergedRowIndices

▸ **getMergedRowIndices**(): `number`[]

Retrieves the merged row indices from the given range selection.

#### Returns

`number`[]

Array of merged row indices

#### Inherited from

[SelectionModel](SelectionModel.md).[getMergedRowIndices](SelectionModel.md#getmergedrowindices)

#### Defined in

[src/lib/table/selection/selection-model.ts:143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L143)

___

### getRanges

▸ **getRanges**(): [`CellRange`](CellRange.md)[]

Returns an array of CellRange objects representing the selections.

#### Returns

[`CellRange`](CellRange.md)[]

Array of CellRange objects representing the ranges.

#### Inherited from

[SelectionModel](SelectionModel.md).[getRanges](SelectionModel.md#getranges)

#### Defined in

[src/lib/table/selection/selection-model.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L119)

___

### getSelectedRowItems

▸ **getSelectedRowItems**(`allrows`): `T`[]

Retrieves the selected rows from an array of all table rows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `allrows` | `T`[] | The array of all rows from the table model. |

#### Returns

`T`[]

- The selected rows from the given array.

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L26)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[getSelectionCount](SelectionModel.md#getselectioncount)

#### Defined in

[src/lib/table/selection/selection-model.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L94)

___

### hasNoSelection

▸ **hasNoSelection**(): `boolean`

Is nothing selected?

#### Returns

`boolean`

#### Inherited from

[SelectionModel](SelectionModel.md).[hasNoSelection](SelectionModel.md#hasnoselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L134)

___

### hasSelection

▸ **hasSelection**(): `boolean`

Is anything selected?

#### Returns

`boolean`

#### Inherited from

[SelectionModel](SelectionModel.md).[hasSelection](SelectionModel.md#hasselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L130)

___

### isAllSelected

▸ **isAllSelected**(): `boolean`

Was everything selected with [selectAll](../interfaces/SelectionModelIf.md#selectall)?

#### Returns

`boolean`

#### Inherited from

[SelectionModel](SelectionModel.md).[isAllSelected](SelectionModel.md#isallselected)

#### Defined in

[src/lib/table/selection/selection-model.ts:160](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L160)

___

### isInNegativeRange

▸ **isInNegativeRange**(`rowIndex`, `columnIndex`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`boolean`

#### Inherited from

[SelectionModel](SelectionModel.md).[isInNegativeRange](SelectionModel.md#isinnegativerange)

#### Defined in

[src/lib/table/selection/selection-model.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L110)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[isSelected](SelectionModel.md#isselected)

#### Defined in

[src/lib/table/selection/selection-model.ts:191](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L191)

___

### removeEventSelectionChangedListener

▸ **removeEventSelectionChangedListener**(`listener`): `void`

Stop notifications.

#### Parameters

| Name | Type |
| :------ | :------ |
| `listener` | [`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md) |

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[removeEventSelectionChangedListener](SelectionModel.md#removeeventselectionchangedlistener)

#### Defined in

[src/lib/table/selection/selection-model.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L72)

___

### removeSelection

▸ **removeSelection**(`range`): `void`

Removes a rectangle from the selection.

#### Parameters

| Name | Type |
| :------ | :------ |
| `range` | [`CellRange`](CellRange.md) |

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[removeSelection](SelectionModel.md#removeselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:169](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L169)

___

### selectAll

▸ **selectAll**(): `void`

Selects all cells (⌘/Ctrl+A).

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[selectAll](SelectionModel.md#selectall)

#### Defined in

[src/lib/table/selection/selection-model.ts:155](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L155)

___

### selectRow

▸ **selectRow**(`rowIndex`): `void`

Selects the specified row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row to be selected. |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L39)

___

### toggleFilteredRowsSelection

▸ **toggleFilteredRowsSelection**(): `void`

Toggles the selection of filtered rows.
If all rows are currently selected, clears the selection.
If no rows are currently selected, selects all filtered rows.
Otherwise, toggles the selection of all filtered rows.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L82)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[togglePoint](SelectionModel.md#togglepoint)

#### Defined in

[src/lib/table/selection/selection-model.ts:183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L183)

___

### toggleRow

▸ **toggleRow**(`rowIndex`): `void`

Toggles the selection state of a row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row to toggle. |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L113)

___

### toggleSelection

▸ **toggleSelection**(): `void`

Toggles the selection of items based on current selection state.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L56)

___

### unselectRow

▸ **unselectRow**(`rowIndex`): `void`

Unselects the specified row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row to be unselected. |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L49)
