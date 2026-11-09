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
- [adjustForRowChanges](MultiRowsSelectionModel.md#adjustforrowchanges)
- [adjustRangeToSelectionType](MultiRowsSelectionModel.md#adjustrangetoselectiontype)
- [clear](MultiRowsSelectionModel.md#clear)
- [createSnapshot](MultiRowsSelectionModel.md#createsnapshot)
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
- [liftNegativeRanges](MultiRowsSelectionModel.md#liftnegativeranges)
- [removeEventSelectionChangedListener](MultiRowsSelectionModel.md#removeeventselectionchangedlistener)
- [removeSelection](MultiRowsSelectionModel.md#removeselection)
- [reselectPoint](MultiRowsSelectionModel.md#reselectpoint)
- [restoreSnapshot](MultiRowsSelectionModel.md#restoresnapshot)
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

[src/lib/table/selection/selection-model.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L62)

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

[src/lib/table/selection/selection-model.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L61)

___

### ranges

• `Protected` **ranges**: [`CellRange`](CellRange.md)[] = `[]`

This contains all the current selected cell ranges in the grid.

#### Inherited from

[SelectionModel](SelectionModel.md).[ranges](SelectionModel.md#ranges)

#### Defined in

[src/lib/table/selection/selection-model.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L60)

___

### selectionMode

• **selectionMode**: [`SelectionMode`](../modules.md#selectionmode) = `"single"`

The mode of selection being used. It's of type SelectionMode. Default: "single"

#### Inherited from

[SelectionModel](SelectionModel.md).[selectionMode](SelectionModel.md#selectionmode)

#### Defined in

[src/lib/table/selection/selection-model.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L70)

___

### selectionType

• **selectionType**: [`ExtendedSelectionType`](../modules.md#extendedselectiontype) = `"none"`

The type of selection being used. It's of type ExtendedSelectionType. Default: "none"

#### Inherited from

[SelectionModel](SelectionModel.md).[selectionType](SelectionModel.md#selectiontype)

#### Defined in

[src/lib/table/selection/selection-model.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L69)

___

### silent

• `Protected` **silent**: `boolean` = `false`

This is a flag to suppress the firing of selection change events.

#### Inherited from

[SelectionModel](SelectionModel.md).[silent](SelectionModel.md#silent)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[addEventSelectionChangedListener](SelectionModel.md#addeventselectionchangedlistener)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[addRange](SelectionModel.md#addrange)

#### Defined in

[src/lib/table/selection/selection-model.ts:354](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L354)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[addSelection](SelectionModel.md#addselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:303](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L303)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[adjustForRowChanges](SelectionModel.md#adjustforrowchanges)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[adjustRangeToSelectionType](SelectionModel.md#adjustrangetoselectiontype)

#### Defined in

[src/lib/table/selection/selection-model.ts:377](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L377)

___

### clear

▸ **clear**(): `void`

Removes the whole selection.

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[clear](SelectionModel.md#clear)

#### Defined in

[src/lib/table/selection/selection-model.ts:223](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L223)

___

### createSnapshot

▸ **createSnapshot**(): [`SelectionSnapshot`](../interfaces/SelectionSnapshot.md)

A copy of the current selection state, e.g. to restore it while a drag rectangle changes
(see [restoreSnapshot](SelectionModel.md#restoresnapshot)). The ranges themselves are shared – they are never changed after being added.

#### Returns

[`SelectionSnapshot`](../interfaces/SelectionSnapshot.md)

the state

#### Inherited from

[SelectionModel](SelectionModel.md).[createSnapshot](SelectionModel.md#createsnapshot)

#### Defined in

[src/lib/table/selection/selection-model.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L120)

___

### fireChangeEvent

▸ **fireChangeEvent**(): `void`

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[fireChangeEvent](SelectionModel.md#firechangeevent)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[firstClick](SelectionModel.md#firstclick)

#### Defined in

[src/lib/table/selection/selection-model.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L104)

___

### getEventSelectionChangedListeners

▸ **getEventSelectionChangedListeners**(): [`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)[]

The registered listeners (the table registers itself).

#### Returns

[`EventSelectionChangedListenerIf`](../interfaces/EventSelectionChangedListenerIf.md)[]

#### Inherited from

[SelectionModel](SelectionModel.md).[getEventSelectionChangedListeners](SelectionModel.md#geteventselectionchangedlisteners)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[getMergedRowIndices](SelectionModel.md#getmergedrowindices)

#### Defined in

[src/lib/table/selection/selection-model.ts:255](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L255)

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

[src/lib/table/selection/selection-model.ts:219](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L219)

___

### getSelectedRowItems

▸ **getSelectedRowItems**(`allrows`): `T`[]

Retrieves the selected rows from an array of all table rows.
The selection holds row indices of the displayed rows – pass the displayed (filtered, sorted) rows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `allrows` | `T`[] | The array of all rows from the table model. |

#### Returns

`T`[]

- The selected rows from the given array (the array itself if everything is selected).

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L27)

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

[src/lib/table/selection/selection-model.ts:194](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L194)

___

### hasNoSelection

▸ **hasNoSelection**(): `boolean`

Is nothing selected?

#### Returns

`boolean`

#### Inherited from

[SelectionModel](SelectionModel.md).[hasNoSelection](SelectionModel.md#hasnoselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:234](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L234)

___

### hasSelection

▸ **hasSelection**(): `boolean`

Is anything selected?

#### Returns

`boolean`

#### Inherited from

[SelectionModel](SelectionModel.md).[hasSelection](SelectionModel.md#hasselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L230)

___

### isAllSelected

▸ **isAllSelected**(): `boolean`

Was everything selected with [selectAll](../interfaces/SelectionModelIf.md#selectall)?

#### Returns

`boolean`

#### Inherited from

[SelectionModel](SelectionModel.md).[isAllSelected](SelectionModel.md#isallselected)

#### Defined in

[src/lib/table/selection/selection-model.ts:292](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L292)

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

[src/lib/table/selection/selection-model.ts:210](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L210)

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

[src/lib/table/selection/selection-model.ts:349](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L349)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[liftNegativeRanges](SelectionModel.md#liftnegativeranges)

#### Defined in

[src/lib/table/selection/selection-model.ts:420](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L420)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[removeSelection](SelectionModel.md#removeselection)

#### Defined in

[src/lib/table/selection/selection-model.ts:314](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L314)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[reselectPoint](SelectionModel.md#reselectpoint)

#### Defined in

[src/lib/table/selection/selection-model.ts:402](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L402)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[restoreSnapshot](SelectionModel.md#restoresnapshot)

#### Defined in

[src/lib/table/selection/selection-model.ts:129](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L129)

___

### selectAll

▸ **selectAll**(): `void`

Selects all cells. Cells that were deselected before ([removeSelection](SelectionModel.md#removeselection)) are selected again;
removing cells afterwards cuts holes into "all selected".

#### Returns

`void`

#### Inherited from

[SelectionModel](SelectionModel.md).[selectAll](SelectionModel.md#selectall)

#### Defined in

[src/lib/table/selection/selection-model.ts:283](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L283)

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

[src/lib/table/selection/multi-rows-selection-model.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L40)

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

[src/lib/table/selection/multi-rows-selection-model.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L83)

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

#### Inherited from

[SelectionModel](SelectionModel.md).[togglePoint](SelectionModel.md#togglepoint)

#### Defined in

[src/lib/table/selection/selection-model.ts:339](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-model.ts#L339)

___

### toggleRow

▸ **toggleRow**(`rowIndex`): `void`

Toggles the selection state of a row. A row that was toggled off can be toggled on again.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | The index of the row to toggle. |

#### Returns

`void`

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:114](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L114)

___

### toggleSelection

▸ **toggleSelection**(): `void`

Toggles the selection of items based on current selection state.

#### Returns

`void`

#### Defined in

[src/lib/table/selection/multi-rows-selection-model.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L57)

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

[src/lib/table/selection/multi-rows-selection-model.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/multi-rows-selection-model.ts#L50)
