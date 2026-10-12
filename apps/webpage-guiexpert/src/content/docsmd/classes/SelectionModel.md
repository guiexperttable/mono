[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectionModel

# Class: SelectionModel

`SelectionModel` is a class that manages the various modes and types of selections within a grid.
It supports basic modes like single cell, row, column, and range selections, as well as advanced mode like negative ranges.
Events related to selections, such as changes to a selection, are propagated to listeners through the EventSelectionChangedListener interface.

The class extends `SelectionModelIf` interface and defines additional methods and fields specific to its functionality.

**`Method`**

constructor(selectionType?: ExtendedSelectionType, selectionMode?: SelectionMode) - Constructs a new instance of the SelectionModel class.

**`Method`**

getEventSelectionChangedListeners(): EventSelectionChangedListenerIf[] - Returns the array of registered event selection changed listeners.

**`Method`**

addEventSelectionChangedListener(listener: EventSelectionChangedListenerIf): void - Adds an event selection changed listener to the array.

**`Method`**

removeEventSelectionChangedListener(listener: EventSelectionChangedListenerIf): void - Removes a specific event selection changed listener if it exists.

**`Method`**

fireChangeEvent(): void - Fires a change event on each registered listener when a selection change occurs. Does nothing if the silent property is true.

**`Method`**

firstClick(rowIndex: number, columnIndex: number): void - Initiates a selection operation at the specified coordinates. The nature of the operation is determined by the current selection type and mode.

**`Method`**

getSelectionCount(rowIndex: number, columnIndex: number): number - Returns the selection count of current ranges

**`Method`**

isInNegativeRange(rowIndex: number, columnIndex: number): boolean - Verifies if any point (cell) is in negative range or not.

**`Method`**

getRanges() - Returns the selection ranges

**`Method`**

clear(): void - Clears all selections in all ranges and resets allSelected and negativeRanges arrays.

**`Method`**

hasSelection(): boolean - Checks whether there is any selection. Returns true if yes, false if no.

**`Method`**

hasNoSelection(): boolean - Checks whether there is no selection. Returns true if yes, false if no.

**`Method`**

getMergedRowIndices(): number[] - Gets the array of merged row indices.

**`Method`**

selectAll(): void - Selects all selectable entities.

**`Method`**

isAllSelected() - Checks if all selectable entities are selected.

**`Method`**

addSelection(range: CellRange): void - Adds a certain range to the selection.

**`Method`**

removeSelection(range: CellRange): void - Removes a certain range from the selection.

**`Method`**

togglePoint(row: number, col: number): void - Toggles the selection state of a point at the specified row and column in a grid.

**`Method`**

isSelected(row: number, col: number): boolean - Checks if a specific cell in a grid is selected.

**`Method`**

addRange(range: CellRange): void - Adds a range of cells to the selection.

## Hierarchy

- **`SelectionModel`**

  ↳ [`MultiRowsSelectionModel`](MultiRowsSelectionModel.md)

## Implements

- [`SelectionModelIf`](../interfaces/SelectionModelIf.md)

## Table of contents

### Constructors

- [constructor](SelectionModel.md#constructor)

### Properties

- [allSelected](SelectionModel.md#allselected)
- [negativeRanges](SelectionModel.md#negativeranges)
- [ranges](SelectionModel.md#ranges)
- [selectionMode](SelectionModel.md#selectionmode)
- [selectionType](SelectionModel.md#selectiontype)
- [silent](SelectionModel.md#silent)

### Methods

- [addEventSelectionChangedListener](SelectionModel.md#addeventselectionchangedlistener)
- [addRange](SelectionModel.md#addrange)
- [addSelection](SelectionModel.md#addselection)
- [clear](SelectionModel.md#clear)
- [fireChangeEvent](SelectionModel.md#firechangeevent)
- [firstClick](SelectionModel.md#firstclick)
- [getEventSelectionChangedListeners](SelectionModel.md#geteventselectionchangedlisteners)
- [getMergedRowIndices](SelectionModel.md#getmergedrowindices)
- [getRanges](SelectionModel.md#getranges)
- [getSelectionCount](SelectionModel.md#getselectioncount)
- [hasNoSelection](SelectionModel.md#hasnoselection)
- [hasSelection](SelectionModel.md#hasselection)
- [isAllSelected](SelectionModel.md#isallselected)
- [isInNegativeRange](SelectionModel.md#isinnegativerange)
- [isSelected](SelectionModel.md#isselected)
- [removeEventSelectionChangedListener](SelectionModel.md#removeeventselectionchangedlistener)
- [removeSelection](SelectionModel.md#removeselection)
- [selectAll](SelectionModel.md#selectall)
- [togglePoint](SelectionModel.md#togglepoint)

## Constructors

### constructor

• **new SelectionModel**(`selectionType?`, `selectionMode?`): [`SelectionModel`](SelectionModel.md)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `selectionType` | [`ExtendedSelectionType`](../modules.md#extendedselectiontype) | `"none"` |
| `selectionMode` | [`SelectionMode`](../modules.md#selectionmode) | `"single"` |

#### Returns

[`SelectionModel`](SelectionModel.md)

#### Defined in

[src/lib/table/selection/selection-model.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L56)

## Properties

### allSelected

• `Protected` **allSelected**: `boolean` = `false`

This is a flag to indicate whether all cells in the grid are selected or not.

#### Defined in

[src/lib/table/selection/selection-model.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L50)

___

### negativeRanges

• `Protected` **negativeRanges**: [`CellRange`](CellRange.md)[] = `[]`

This contains all the current negative cell ranges in the grid.

#### Defined in

[src/lib/table/selection/selection-model.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L49)

___

### ranges

• `Protected` **ranges**: [`CellRange`](CellRange.md)[] = `[]`

This contains all the current selected cell ranges in the grid.

#### Defined in

[src/lib/table/selection/selection-model.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L48)

___

### selectionMode

• **selectionMode**: [`SelectionMode`](../modules.md#selectionmode) = `"single"`

The mode of selection being used. It's of type SelectionMode. Default: "single"

#### Defined in

[src/lib/table/selection/selection-model.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L58)

___

### selectionType

• **selectionType**: [`ExtendedSelectionType`](../modules.md#extendedselectiontype) = `"none"`

The type of selection being used. It's of type ExtendedSelectionType. Default: "none"

#### Defined in

[src/lib/table/selection/selection-model.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L57)

___

### silent

• `Protected` **silent**: `boolean` = `false`

This is a flag to suppress the firing of selection change events.

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

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[addEventSelectionChangedListener](../interfaces/SelectionModelIf.md#addeventselectionchangedlistener)

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

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[addSelection](../interfaces/SelectionModelIf.md#addselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L164)

___

### clear

▸ **clear**(): `void`

Removes the whole selection.

#### Returns

`void`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[clear](../interfaces/SelectionModelIf.md#clear)

#### Defined in

[src/lib/table/selection/selection-model.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L123)

___

### fireChangeEvent

▸ **fireChangeEvent**(): `void`

#### Returns

`void`

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

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[firstClick](../interfaces/SelectionModelIf.md#firstclick)

#### Defined in

[src/lib/table/selection/selection-model.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L86)

___

### getEventSelectionChangedListeners

▸ **getEventSelectionChangedListeners**(): [`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)[]

The registered listeners (the table registers itself).

#### Returns

[`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)[]

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[getEventSelectionChangedListeners](../interfaces/SelectionModelIf.md#geteventselectionchangedlisteners)

#### Defined in

[src/lib/table/selection/selection-model.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L62)

___

### getMergedRowIndices

▸ **getMergedRowIndices**(): `number`[]

Retrieves the merged row indices from the given range selection.

#### Returns

`number`[]

Array of merged row indices

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[getMergedRowIndices](../interfaces/SelectionModelIf.md#getmergedrowindices)

#### Defined in

[src/lib/table/selection/selection-model.ts:143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L143)

___

### getRanges

▸ **getRanges**(): [`CellRange`](CellRange.md)[]

Returns an array of CellRange objects representing the selections.

#### Returns

[`CellRange`](CellRange.md)[]

Array of CellRange objects representing the ranges.

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[getRanges](../interfaces/SelectionModelIf.md#getranges)

#### Defined in

[src/lib/table/selection/selection-model.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L119)

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

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[getSelectionCount](../interfaces/SelectionModelIf.md#getselectioncount)

#### Defined in

[src/lib/table/selection/selection-model.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L94)

___

### hasNoSelection

▸ **hasNoSelection**(): `boolean`

Is nothing selected?

#### Returns

`boolean`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[hasNoSelection](../interfaces/SelectionModelIf.md#hasnoselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L134)

___

### hasSelection

▸ **hasSelection**(): `boolean`

Is anything selected?

#### Returns

`boolean`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[hasSelection](../interfaces/SelectionModelIf.md#hasselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L130)

___

### isAllSelected

▸ **isAllSelected**(): `boolean`

Was everything selected with [selectAll](../interfaces/SelectionModelIf.md#selectall)?

#### Returns

`boolean`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[isAllSelected](../interfaces/SelectionModelIf.md#isallselected)

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

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[isSelected](../interfaces/SelectionModelIf.md#isselected)

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

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[removeEventSelectionChangedListener](../interfaces/SelectionModelIf.md#removeeventselectionchangedlistener)

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

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[removeSelection](../interfaces/SelectionModelIf.md#removeselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:169](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L169)

___

### selectAll

▸ **selectAll**(): `void`

Selects all cells (⌘/Ctrl+A).

#### Returns

`void`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[selectAll](../interfaces/SelectionModelIf.md#selectall)

#### Defined in

[src/lib/table/selection/selection-model.ts:155](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L155)

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

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[togglePoint](../interfaces/SelectionModelIf.md#togglepoint)

#### Defined in

[src/lib/table/selection/selection-model.ts:183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L183)
