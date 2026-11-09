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

getMergedRowIndices(rowCount?: number): number[] - Gets the sorted indices of all rows with at least one selected cell.

**`Method`**

selectAll(): void - Selects all selectable entities (also cells that were deselected before). No-op for type "none".

**`Method`**

isAllSelected() - Checks if all selectable entities are selected.

**`Method`**

addSelection(range: CellRange): void - Adds a certain range to the selection (selects removed cells again).

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
- [adjustForRowChanges](SelectionModel.md#adjustforrowchanges)
- [adjustRangeToSelectionType](SelectionModel.md#adjustrangetoselectiontype)
- [clear](SelectionModel.md#clear)
- [createSnapshot](SelectionModel.md#createsnapshot)
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
- [liftNegativeRanges](SelectionModel.md#liftnegativeranges)
- [removeEventSelectionChangedListener](SelectionModel.md#removeeventselectionchangedlistener)
- [removeSelection](SelectionModel.md#removeselection)
- [reselectPoint](SelectionModel.md#reselectpoint)
- [restoreSnapshot](SelectionModel.md#restoresnapshot)
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

[src/lib/table/selection/selection-model.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L68)

## Properties

### allSelected

• `Protected` **allSelected**: `boolean` = `false`

This is a flag to indicate whether all cells in the grid are selected or not.

#### Defined in

[src/lib/table/selection/selection-model.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L62)

___

### negativeRanges

• `Protected` **negativeRanges**: [`CellRange`](CellRange.md)[] = `[]`

This contains all the current negative cell ranges in the grid.

#### Defined in

[src/lib/table/selection/selection-model.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L61)

___

### ranges

• `Protected` **ranges**: [`CellRange`](CellRange.md)[] = `[]`

This contains all the current selected cell ranges in the grid.

#### Defined in

[src/lib/table/selection/selection-model.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L60)

___

### selectionMode

• **selectionMode**: [`SelectionMode`](../modules.md#selectionmode) = `"single"`

The mode of selection being used. It's of type SelectionMode. Default: "single"

#### Defined in

[src/lib/table/selection/selection-model.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L70)

___

### selectionType

• **selectionType**: [`ExtendedSelectionType`](../modules.md#extendedselectiontype) = `"none"`

The type of selection being used. It's of type ExtendedSelectionType. Default: "none"

#### Defined in

[src/lib/table/selection/selection-model.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L69)

___

### silent

• `Protected` **silent**: `boolean` = `false`

This is a flag to suppress the firing of selection change events.

#### Defined in

[src/lib/table/selection/selection-model.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L64)

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

[src/lib/table/selection/selection-model.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L78)

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

[src/lib/table/selection/selection-model.ts:351](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L351)

___

### addSelection

▸ **addSelection**(`range`): `void`

Adds a rectangle to the selection (adjusted to the selection type: whole rows for `"row"`, whole columns for
`"column"`, the first cell for `"cell"`). Cells of the rectangle that were deselected before
([removeSelection](SelectionModel.md#removeselection)) are selected again – the last operation wins.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `range` | [`CellRange`](CellRange.md) | the cells to select (adjusted in place to the selection type) |

#### Returns

`void`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[addSelection](../interfaces/SelectionModelIf.md#addselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:300](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L300)

___

### adjustForRowChanges

▸ **adjustForRowChanges**(`shift`): `boolean`

Live data (since 1.1.108): moves the selected rows along when rows were removed at the start or inserted
(`tableApi.appendRows()` / `rowsAppended()`). Ranges are adjusted **in place** (snapshots and the anchor of the
selection service keep pointing at them); removed rows leave a range, rows inserted inside split it (not
selected – like Excel); whole columns (`r1 = 0`, `r2 = MAX_SAFE_INTEGER`) and "all selected" stay. No event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `shift` | [`RowIndexShift`](RowIndexShift.md) | how the display indices move |

#### Returns

`boolean`

true if a selected row was removed

**`Example`**

```ts
// rows 0 and 1 removed (ring buffer): the selection of row 5 is row 3 now
selectionModel.adjustForRowChanges(new RowIndexShift([0, 1], []));
```

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[adjustForRowChanges](../interfaces/SelectionModelIf.md#adjustforrowchanges)

#### Defined in

[src/lib/table/selection/selection-model.ts:149](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L149)

___

### adjustRangeToSelectionType

▸ **adjustRangeToSelectionType**(`range`): [`CellRange`](CellRange.md)

Adjusts a range (in place) to the selection type: whole rows for `"row"`, whole columns for `"column"`,
the first cell for `"cell"`; `"range"` and `"none"` keep it as it is.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `range` | [`CellRange`](CellRange.md) | the range to adjust |

#### Returns

[`CellRange`](CellRange.md)

the same range object

#### Defined in

[src/lib/table/selection/selection-model.ts:374](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L374)

___

### clear

▸ **clear**(): `void`

Removes the whole selection.

#### Returns

`void`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[clear](../interfaces/SelectionModelIf.md#clear)

#### Defined in

[src/lib/table/selection/selection-model.ts:220](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L220)

___

### createSnapshot

▸ **createSnapshot**(): [`SelectionSnapshot`](../interfaces/SelectionSnapshot.md)

A copy of the current selection state, e.g. to restore it while a drag rectangle changes
(see [restoreSnapshot](SelectionModel.md#restoresnapshot)). The ranges themselves are shared – they are never changed after being added.

#### Returns

[`SelectionSnapshot`](../interfaces/SelectionSnapshot.md)

the state

#### Defined in

[src/lib/table/selection/selection-model.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L120)

___

### fireChangeEvent

▸ **fireChangeEvent**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L92)

___

### firstClick

▸ **firstClick**(`rowIndex`, `columnIndex`): `void`

A plain click: selects the clicked row (`"row"`), column (`"column"`) or cell (`"cell"`, `"range"`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | row index of the clicked cell |
| `columnIndex` | `number` | column index of the clicked cell |

#### Returns

`void`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[firstClick](../interfaces/SelectionModelIf.md#firstclick)

#### Defined in

[src/lib/table/selection/selection-model.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L104)

___

### getEventSelectionChangedListeners

▸ **getEventSelectionChangedListeners**(): [`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)[]

The registered listeners (the table registers itself).

#### Returns

[`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)[]

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[getEventSelectionChangedListeners](../interfaces/SelectionModelIf.md#geteventselectionchangedlisteners)

#### Defined in

[src/lib/table/selection/selection-model.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L74)

___

### getMergedRowIndices

▸ **getMergedRowIndices**(`rowCount?`): `number`[]

The indices of all rows that contain at least one selected cell, sorted ascending and without duplicates.
A row whose selected cells were all removed again ([removeSelection](SelectionModel.md#removeselection)) is left out.

Ranges that cover all rows (selection type `"column"`, [CellRange.singleColumn](CellRange.md#singlecolumn): `r2 = Number.MAX_SAFE_INTEGER`)
and [selectAll](SelectionModel.md#selectall) can only be resolved with `rowCount`. Without it they are skipped (before, such a range
made this method loop forever) – pass the number of (displayed) body rows to get them, too.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount?` | `number` | number of body rows; rows `>= rowCount` are left out, and "all rows" (column ranges, [selectAll](SelectionModel.md#selectall)) becomes `0 … rowCount - 1` |

#### Returns

`number`[]

row indices, sorted ascending

**`Example`**

```ts
const rowCount = tableModel.getBodyModel().getRowCount();
const rowIndices = selectionModel.getMergedRowIndices(rowCount);   // e.g. [1, 2, 5]
console.log(`${rowIndices.length} rows with selected cells`);
```

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[getMergedRowIndices](../interfaces/SelectionModelIf.md#getmergedrowindices)

#### Defined in

[src/lib/table/selection/selection-model.ts:252](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L252)

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

[src/lib/table/selection/selection-model.ts:216](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L216)

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

[src/lib/table/selection/selection-model.ts:191](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L191)

___

### hasNoSelection

▸ **hasNoSelection**(): `boolean`

Is nothing selected?

#### Returns

`boolean`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[hasNoSelection](../interfaces/SelectionModelIf.md#hasnoselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:231](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L231)

___

### hasSelection

▸ **hasSelection**(): `boolean`

Is anything selected?

#### Returns

`boolean`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[hasSelection](../interfaces/SelectionModelIf.md#hasselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:227](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L227)

___

### isAllSelected

▸ **isAllSelected**(): `boolean`

Was everything selected with [selectAll](../interfaces/SelectionModelIf.md#selectall)?

#### Returns

`boolean`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[isAllSelected](../interfaces/SelectionModelIf.md#isallselected)

#### Defined in

[src/lib/table/selection/selection-model.ts:289](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L289)

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

[src/lib/table/selection/selection-model.ts:207](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L207)

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

[src/lib/table/selection/selection-model.ts:346](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L346)

___

### liftNegativeRanges

▸ **liftNegativeRanges**(`range`): `void`

Removes the cells of `range` from all negative ranges ("last operation wins": cells added after they were
removed are selected again). A negative range that overlaps `range` is split into up to four rectangles
(above, below, left and right of the overlap); unbounded ranges (`Number.MAX_SAFE_INTEGER`) work as well.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `range` | [`CellRange`](CellRange.md) | the cells that are selected again |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.ts:417](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L417)

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

[src/lib/table/selection/selection-model.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L84)

___

### removeSelection

▸ **removeSelection**(`range`): `void`

Deselects a rectangle (stored as a "negative" range, so it also cuts holes into [selectAll](SelectionModel.md#selectall)).
For selection type `"row"` all rows `r1 … r2` are removed, for `"column"` all columns `c1 … c2`.
A following [addSelection](SelectionModel.md#addselection) / [togglePoint](SelectionModel.md#togglepoint) of these cells selects them again.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `range` | [`CellRange`](CellRange.md) | the cells to deselect |

#### Returns

`void`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[removeSelection](../interfaces/SelectionModelIf.md#removeselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:311](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L311)

___

### reselectPoint

▸ **reselectPoint**(`row`, `col`): `boolean`

Selects a deselected cell again ("toggle on") by lifting the negative ranges at this cell (for selection type
`"row"`/`"column"`: at its whole row/column) – only possible while the cell is still inside a selected range
or everything is selected. Fires no event.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | row index |
| `col` | `number` | column index |

#### Returns

`boolean`

true if the cell is selected again, false if it has to be added as a new range

#### Defined in

[src/lib/table/selection/selection-model.ts:399](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L399)

___

### restoreSnapshot

▸ **restoreSnapshot**(`snapshot`): `void`

Restores a state created by [createSnapshot](SelectionModel.md#createsnapshot) (fires a change event).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `snapshot` | [`SelectionSnapshot`](../interfaces/SelectionSnapshot.md) | the state to restore |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/selection-model.ts:129](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L129)

___

### selectAll

▸ **selectAll**(): `void`

Selects all cells. Cells that were deselected before ([removeSelection](SelectionModel.md#removeselection)) are selected again;
removing cells afterwards cuts holes into "all selected".

#### Returns

`void`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[selectAll](../interfaces/SelectionModelIf.md#selectall)

#### Defined in

[src/lib/table/selection/selection-model.ts:280](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L280)

___

### togglePoint

▸ **togglePoint**(`row`, `col`): `void`

Toggles the selection state of a cell (for selection type `"row"`/`"column"`: of its row/column).
A cell that was deselected inside a selected range (or after [selectAll](SelectionModel.md#selectall)) gets selected again
without adding a second, overlapping range.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | row index |
| `col` | `number` | column index |

#### Returns

`void`

#### Implementation of

[SelectionModelIf](../interfaces/SelectionModelIf.md).[togglePoint](../interfaces/SelectionModelIf.md#togglepoint)

#### Defined in

[src/lib/table/selection/selection-model.ts:336](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L336)
