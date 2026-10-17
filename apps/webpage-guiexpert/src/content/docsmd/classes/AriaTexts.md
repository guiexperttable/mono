[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AriaTexts

# Class: AriaTexts

The English default texts for screen readers (see [AriaTextsIf](../interfaces/AriaTextsIf.md)).

The table uses `AriaTexts.create(tableOptions.ariaTexts)`: your functions replace the defaults one by one.

**`Example`**

```ts
const texts = AriaTexts.create({ copied: (n: number) => `${n} Zellen kopiert` });
texts.copied(3);       // "3 Zellen kopiert"
texts.filtered(42);    // "42 rows" (default)
```

**`Since`**

1.1.91

## Implements

- [`AriaTextsIf`](../interfaces/AriaTextsIf.md)

## Table of contents

### Constructors

- [constructor](AriaTexts.md#constructor)

### Methods

- [allSelected](AriaTexts.md#allselected)
- [cellsCleared](AriaTexts.md#cellscleared)
- [cellsFilled](AriaTexts.md#cellsfilled)
- [cellsPasted](AriaTexts.md#cellspasted)
- [changesCommitted](AriaTexts.md#changescommitted)
- [changesDiscarded](AriaTexts.md#changesdiscarded)
- [clearTooLarge](AriaTexts.md#cleartoolarge)
- [collapseGroup](AriaTexts.md#collapsegroup)
- [columnSelected](AriaTexts.md#columnselected)
- [columnsDeleted](AriaTexts.md#columnsdeleted)
- [columnsInserted](AriaTexts.md#columnsinserted)
- [commitBlocked](AriaTexts.md#commitblocked)
- [copied](AriaTexts.md#copied)
- [copiedLastRangeOnly](AriaTexts.md#copiedlastrangeonly)
- [copyTooLarge](AriaTexts.md#copytoolarge)
- [cutMarked](AriaTexts.md#cutmarked)
- [detailCollapsed](AriaTexts.md#detailcollapsed)
- [detailExpanded](AriaTexts.md#detailexpanded)
- [editingStarted](AriaTexts.md#editingstarted)
- [expandGroup](AriaTexts.md#expandgroup)
- [fillTooLarge](AriaTexts.md#filltoolarge)
- [filtered](AriaTexts.md#filtered)
- [formulaError](AriaTexts.md#formulaerror)
- [functionSuggestions](AriaTexts.md#functionsuggestions)
- [gridEditingHint](AriaTexts.md#grideditinghint)
- [invalidValue](AriaTexts.md#invalidvalue)
- [nothingToRedo](AriaTexts.md#nothingtoredo)
- [nothingToUndo](AriaTexts.md#nothingtoundo)
- [pasteTooLarge](AriaTexts.md#pastetoolarge)
- [pendingChanges](AriaTexts.md#pendingchanges)
- [rangeSelected](AriaTexts.md#rangeselected)
- [readOnlyCell](AriaTexts.md#readonlycell)
- [redone](AriaTexts.md#redone)
- [referenceInserted](AriaTexts.md#referenceinserted)
- [rowDragCancelled](AriaTexts.md#rowdragcancelled)
- [rowDragStarted](AriaTexts.md#rowdragstarted)
- [rowMoveNotPossible](AriaTexts.md#rowmovenotpossible)
- [rowMoved](AriaTexts.md#rowmoved)
- [rowSelected](AriaTexts.md#rowselected)
- [rowsDeleted](AriaTexts.md#rowsdeleted)
- [rowsInserted](AriaTexts.md#rowsinserted)
- [selectAllRows](AriaTexts.md#selectallrows)
- [selectRow](AriaTexts.md#selectrow)
- [selectionCleared](AriaTexts.md#selectioncleared)
- [sorted](AriaTexts.md#sorted)
- [undoHistoryCleared](AriaTexts.md#undohistorycleared)
- [undoSkipped](AriaTexts.md#undoskipped)
- [undone](AriaTexts.md#undone)
- [create](AriaTexts.md#create)

## Constructors

### constructor

• **new AriaTexts**(): [`AriaTexts`](AriaTexts.md)

#### Returns

[`AriaTexts`](AriaTexts.md)

## Methods

### allSelected

▸ **allSelected**(): `string`

Announced after Ctrl/⌘+A.

#### Returns

`string`

default: `"All cells selected"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[allSelected](../interfaces/AriaTextsIf.md#allselected)

#### Defined in

[src/lib/table/aria/aria-texts.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L54)

___

### cellsCleared

▸ **cellsCleared**(`cellCount`): `string`

Announced after Delete/Backspace cleared cells.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of cleared cells |

#### Returns

`string`

default: `"8 cells cleared"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[cellsCleared](../interfaces/AriaTextsIf.md#cellscleared)

#### Defined in

[src/lib/table/aria/aria-texts.ts:139](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L139)

___

### cellsFilled

▸ **cellsFilled**(`cellCount`): `string`

Announced after a fill (fill handle, Ctrl/⌘+D, Ctrl/⌘+R) – optional, [AriaTexts](AriaTexts.md) has a default.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of filled cells |

#### Returns

`string`

default: `"3 cells filled"`

**`Since`**

1.1.96

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[cellsFilled](../interfaces/AriaTextsIf.md#cellsfilled)

#### Defined in

[src/lib/table/aria/aria-texts.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L94)

___

### cellsPasted

▸ **cellsPasted**(`cellCount`, `skippedCount`): `string`

Announced after Ctrl/⌘+V (copy, cut and paste, `tableOptions.clipboard`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of pasted cells |
| `skippedCount` | `number` | cells left out (read only, invalid, cut off at the last column) |

#### Returns

`string`

default: `"6 cells pasted"`, `"4 cells pasted, 2 skipped"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[cellsPasted](../interfaces/AriaTextsIf.md#cellspasted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:165](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L165)

___

### changesCommitted

▸ **changesCommitted**(`cellCount`): `string`

Announced after [TableApi.commitBatchEdit](TableApi.md#commitbatchedit).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of written cells |

#### Returns

`string`

default: `"3 changes saved"`

**`Since`**

1.1.96

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[changesCommitted](../interfaces/AriaTextsIf.md#changescommitted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L115)

___

### changesDiscarded

▸ **changesDiscarded**(): `string`

Announced after [TableApi.cancelBatchEdit](TableApi.md#cancelbatchedit).

#### Returns

`string`

default: `"Changes discarded"`

**`Since`**

1.1.96

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[changesDiscarded](../interfaces/AriaTextsIf.md#changesdiscarded)

#### Defined in

[src/lib/table/aria/aria-texts.ts:119](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L119)

___

### clearTooLarge

▸ **clearTooLarge**(`maxCells`): `string`

Announced when more cells should be cleared than `EditingOptionsIf.maxClearCells` allows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxCells` | `number` | the limit |

#### Returns

`string`

default: `"Too many cells to clear (at most 1000000)"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[clearTooLarge](../interfaces/AriaTextsIf.md#cleartoolarge)

#### Defined in

[src/lib/table/aria/aria-texts.ts:143](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L143)

___

### collapseGroup

▸ **collapseGroup**(`groupLabel`): `string`

The accessible name of the toggle button of an expanded header group.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `groupLabel` | `string` | the label of the group |

#### Returns

`string`

default: `"Collapse group Q1"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[collapseGroup](../interfaces/AriaTextsIf.md#collapsegroup)

#### Defined in

[src/lib/table/aria/aria-texts.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L74)

___

### columnSelected

▸ **columnSelected**(`columnCount`): `string`

Announced after Ctrl+Space selected the columns of the active cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnCount` | `number` | number of selected columns |

#### Returns

`string`

default: `"Column selected"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[columnSelected](../interfaces/AriaTextsIf.md#columnselected)

#### Defined in

[src/lib/table/aria/aria-texts.ts:157](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L157)

___

### columnsDeleted

▸ **columnsDeleted**(`count`): `string`

Announced after columns were deleted (`TableApi.deleteColumns`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `count` | `number` | the columns |

#### Returns

`string`

default: `"2 columns deleted"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[columnsDeleted](../interfaces/AriaTextsIf.md#columnsdeleted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:234](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L234)

___

### columnsInserted

▸ **columnsInserted**(`count`): `string`

Announced after columns were inserted (`TableApi.insertColumns`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `count` | `number` | the columns |

#### Returns

`string`

default: `"2 columns inserted"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[columnsInserted](../interfaces/AriaTextsIf.md#columnsinserted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L230)

___

### commitBlocked

▸ **commitBlocked**(`invalidCount`): `string`

Announced when invalid values block [TableApi.commitBatchEdit](TableApi.md#commitbatchedit).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `invalidCount` | `number` | the number of invalid cells |

#### Returns

`string`

default: `"2 invalid values – nothing saved"`

**`Since`**

1.1.96

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[commitBlocked](../interfaces/AriaTextsIf.md#commitblocked)

#### Defined in

[src/lib/table/aria/aria-texts.ts:123](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L123)

___

### copied

▸ **copied**(`cellCount`): `string`

Announced after cells were copied to the clipboard (Ctrl/⌘+C, [TableApi.copyToClipboard](TableApi.md#copytoclipboard)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of copied cells |

#### Returns

`string`

default: `"12 cells copied"`, `"1 cell copied"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[copied](../interfaces/AriaTextsIf.md#copied)

#### Defined in

[src/lib/table/aria/aria-texts.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L50)

___

### copiedLastRangeOnly

▸ **copiedLastRangeOnly**(): `string`

Announced when several ranges are selected and only the last one is copied (like Google Sheets).

#### Returns

`string`

default: `"Only the last selected range was copied"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[copiedLastRangeOnly](../interfaces/AriaTextsIf.md#copiedlastrangeonly)

#### Defined in

[src/lib/table/aria/aria-texts.ts:182](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L182)

___

### copyTooLarge

▸ **copyTooLarge**(`maxCells`): `string`

Announced when more cells should be copied than `CopyService.maxCopyCells` allows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxCells` | `number` | the limit |

#### Returns

`string`

default: `"Too many cells to copy (at most 1000000)"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[copyTooLarge](../interfaces/AriaTextsIf.md#copytoolarge)

#### Defined in

[src/lib/table/aria/aria-texts.ts:174](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L174)

___

### cutMarked

▸ **cutMarked**(`cellCount`): `string`

Announced after Ctrl/⌘+X: the cells are marked and move on the next paste.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of cut cells |

#### Returns

`string`

default: `"6 cells cut, paste to move them"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[cutMarked](../interfaces/AriaTextsIf.md#cutmarked)

#### Defined in

[src/lib/table/aria/aria-texts.ts:178](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L178)

___

### detailCollapsed

▸ **detailCollapsed**(): `string`

Announced after a detail row was collapsed (master/detail).

#### Returns

`string`

default: `"Details collapsed"`

**`Since`**

1.1.97

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[detailCollapsed](../interfaces/AriaTextsIf.md#detailcollapsed)

#### Defined in

[src/lib/table/aria/aria-texts.ts:102](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L102)

___

### detailExpanded

▸ **detailExpanded**(): `string`

Announced after a detail row was expanded (master/detail).

#### Returns

`string`

default: `"Details expanded"`

**`Since`**

1.1.97

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[detailExpanded](../interfaces/AriaTextsIf.md#detailexpanded)

#### Defined in

[src/lib/table/aria/aria-texts.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L98)

___

### editingStarted

▸ **editingStarted**(`columnLabel`): `string`

Announced when the cell editor opens (Excel-style editing).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnLabel` | `string` | the column label |

#### Returns

`string`

default: `"Editing Price"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[editingStarted](../interfaces/AriaTextsIf.md#editingstarted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:131](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L131)

___

### expandGroup

▸ **expandGroup**(`groupLabel`): `string`

The accessible name of the toggle button of a collapsed header group.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `groupLabel` | `string` | the label of the group |

#### Returns

`string`

default: `"Expand group Q1"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[expandGroup](../interfaces/AriaTextsIf.md#expandgroup)

#### Defined in

[src/lib/table/aria/aria-texts.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L70)

___

### fillTooLarge

▸ **fillTooLarge**(`maxCells`): `string`

Announced when a fill is refused because it covers too many cells ([FillHandleOptionsIf.maxCells](../interfaces/FillHandleOptionsIf.md#maxcells)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxCells` | `number` | the limit |

#### Returns

`string`

default: `"Too many cells to fill (at most 100000)"`

**`Since`**

1.1.96

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[fillTooLarge](../interfaces/AriaTextsIf.md#filltoolarge)

#### Defined in

[src/lib/table/aria/aria-texts.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L106)

___

### filtered

▸ **filtered**(`rowCount`): `string`

Announced after the external filter changed ([TableApi.externalFilterChanged](TableApi.md#externalfilterchanged)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount` | `number` | the number of rows the body shows now |

#### Returns

`string`

default: `"42 rows"`, `"1 row"`, `"No rows"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[filtered](../interfaces/AriaTextsIf.md#filtered)

#### Defined in

[src/lib/table/aria/aria-texts.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L45)

___

### formulaError

▸ **formulaError**(`message`): `string`

Announced when a cell formula with a syntax error is stored (it shows `#ERROR!`, `tableOptions.cellFormulas`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | the parser's message |

#### Returns

`string`

default: `"Formula error: <message>"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[formulaError](../interfaces/AriaTextsIf.md#formulaerror)

#### Defined in

[src/lib/table/aria/aria-texts.ts:210](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L210)

___

### functionSuggestions

▸ **functionSuggestions**(): `string`

The label of the list of function suggestions while a cell formula is typed.

#### Returns

`string`

default: `"Functions"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[functionSuggestions](../interfaces/AriaTextsIf.md#functionsuggestions)

#### Defined in

[src/lib/table/aria/aria-texts.ts:214](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L214)

___

### gridEditingHint

▸ **gridEditingHint**(): `string`

The description of the grid with Excel-style editing (`aria-description` of the host): how it is used.

#### Returns

`string`

default: `"Type to edit a cell, Enter to edit or commit, Escape to cancel. Tab in the last column leaves the table."`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[gridEditingHint](../interfaces/AriaTextsIf.md#grideditinghint)

#### Defined in

[src/lib/table/aria/aria-texts.ts:161](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L161)

___

### invalidValue

▸ **invalidValue**(`message`): `string`

Announced when an edited value is invalid ([ColumnDefIf.validate](../interfaces/ColumnDefIf.md#validate)) and not written (without batch edit).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | the message of the validator |

#### Returns

`string`

default: `"Invalid value: <message>"`

**`Since`**

1.1.96

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[invalidValue](../interfaces/AriaTextsIf.md#invalidvalue)

#### Defined in

[src/lib/table/aria/aria-texts.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L127)

___

### nothingToRedo

▸ **nothingToRedo**(): `string`

#### Returns

`string`

default: `"Nothing to redo"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[nothingToRedo](../interfaces/AriaTextsIf.md#nothingtoredo)

#### Defined in

[src/lib/table/aria/aria-texts.ts:198](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L198)

___

### nothingToUndo

▸ **nothingToUndo**(): `string`

#### Returns

`string`

default: `"Nothing to undo"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[nothingToUndo](../interfaces/AriaTextsIf.md#nothingtoundo)

#### Defined in

[src/lib/table/aria/aria-texts.ts:194](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L194)

___

### pasteTooLarge

▸ **pasteTooLarge**(`maxCells`): `string`

Announced when more cells should be pasted than `ClipboardOptionsIf.maxPasteCells` allows.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxCells` | `number` | the limit |

#### Returns

`string`

default: `"Too many cells to paste (at most 1000000)"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[pasteTooLarge](../interfaces/AriaTextsIf.md#pastetoolarge)

#### Defined in

[src/lib/table/aria/aria-texts.ts:170](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L170)

___

### pendingChanges

▸ **pendingChanges**(`pendingCount`): `string`

Announced after a value was marked in a batch edit (or set back).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pendingCount` | `number` | the number of pending cells |

#### Returns

`string`

default: `"3 changes not saved"`, `"No unsaved changes"`

**`Since`**

1.1.96

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[pendingChanges](../interfaces/AriaTextsIf.md#pendingchanges)

#### Defined in

[src/lib/table/aria/aria-texts.ts:110](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L110)

___

### rangeSelected

▸ **rangeSelected**(`rowCount`, `columnCount`): `string`

Announced when Shift+arrows change the selected range (the focus stays on the active cell).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount` | `number` | rows of the range |
| `columnCount` | `number` | shown columns of the range |

#### Returns

`string`

default: `"3 rows, 2 columns selected"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[rangeSelected](../interfaces/AriaTextsIf.md#rangeselected)

#### Defined in

[src/lib/table/aria/aria-texts.ts:147](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L147)

___

### readOnlyCell

▸ **readOnlyCell**(): `string`

Announced when a key is typed on a cell that cannot be edited (Excel-style editing).

#### Returns

`string`

default: `"Read only"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[readOnlyCell](../interfaces/AriaTextsIf.md#readonlycell)

#### Defined in

[src/lib/table/aria/aria-texts.ts:135](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L135)

___

### redone

▸ **redone**(`label`, `cellCount`): `string`

Announced after Ctrl+Y / Ctrl/⌘+Shift+Z.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `label` | `string` | the step |
| `cellCount` | `number` | cells written again |

#### Returns

`string`

default: `"Redo Paste, 6 cells"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[redone](../interfaces/AriaTextsIf.md#redone)

#### Defined in

[src/lib/table/aria/aria-texts.ts:190](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L190)

___

### referenceInserted

▸ **referenceInserted**(`reference`): `string`

Announced when a reference is inserted by pointing (arrow keys or a click while typing a formula).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `reference` | `string` | e.g. `"B2"` or `"B2:B4"` |

#### Returns

`string`

default: the reference

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[referenceInserted](../interfaces/AriaTextsIf.md#referenceinserted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:218](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L218)

___

### rowDragCancelled

▸ **rowDragCancelled**(): `string`

Announced when a row drag was cancelled (Escape) – optional, [AriaTexts](AriaTexts.md) has a default.

#### Returns

`string`

default: `"Drag cancelled"`

**`Since`**

1.1.95

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[rowDragCancelled](../interfaces/AriaTextsIf.md#rowdragcancelled)

#### Defined in

[src/lib/table/aria/aria-texts.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L90)

___

### rowDragStarted

▸ **rowDragStarted**(`rowCount`): `string`

Announced when a row drag starts (optional – [AriaTexts](AriaTexts.md) has a default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount` | `number` | number of dragged rows |

#### Returns

`string`

default: `"Dragging 1 row. Press Escape to cancel."`

**`Since`**

1.1.95

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[rowDragStarted](../interfaces/AriaTextsIf.md#rowdragstarted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L78)

___

### rowMoveNotPossible

▸ **rowMoveNotPossible**(): `string`

Announced when rows cannot be moved: the table is sorted or filtered (managed row drag), or the row cannot move
further (optional – [AriaTexts](AriaTexts.md) has a default).

#### Returns

`string`

default: `"Rows cannot be moved while the table is sorted or filtered"`

**`Since`**

1.1.95

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[rowMoveNotPossible](../interfaces/AriaTextsIf.md#rowmovenotpossible)

#### Defined in

[src/lib/table/aria/aria-texts.ts:86](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L86)

___

### rowMoved

▸ **rowMoved**(`position`, `rowCount`): `string`

Announced after rows were moved by drag and drop or Ctrl+Alt+↑/↓ (optional – [AriaTexts](AriaTexts.md) has a default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `position` | `number` | 1-based position of the first moved row |
| `rowCount` | `number` | number of displayed rows |

#### Returns

`string`

default: `"Row moved to position 7 of 20"`

**`Since`**

1.1.95

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[rowMoved](../interfaces/AriaTextsIf.md#rowmoved)

#### Defined in

[src/lib/table/aria/aria-texts.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L82)

___

### rowSelected

▸ **rowSelected**(`rowCount`): `string`

Announced after Shift+Space selected the rows of the active cell.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount` | `number` | number of selected rows |

#### Returns

`string`

default: `"Row selected"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[rowSelected](../interfaces/AriaTextsIf.md#rowselected)

#### Defined in

[src/lib/table/aria/aria-texts.ts:153](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L153)

___

### rowsDeleted

▸ **rowsDeleted**(`count`): `string`

Announced after rows were deleted (`TableApi.deleteRows`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `count` | `number` | the rows |

#### Returns

`string`

default: `"3 rows deleted"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[rowsDeleted](../interfaces/AriaTextsIf.md#rowsdeleted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:226](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L226)

___

### rowsInserted

▸ **rowsInserted**(`count`): `string`

Announced after rows were inserted (`TableApi.insertRows`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `count` | `number` | the rows |

#### Returns

`string`

default: `"3 rows inserted"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[rowsInserted](../interfaces/AriaTextsIf.md#rowsinserted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:222](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L222)

___

### selectAllRows

▸ **selectAllRows**(): `string`

The accessible name of the checkbox in the header (checks all rows).

#### Returns

`string`

default: `"Select all rows"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[selectAllRows](../interfaces/AriaTextsIf.md#selectallrows)

#### Defined in

[src/lib/table/aria/aria-texts.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L66)

___

### selectRow

▸ **selectRow**(`rowNumber`): `string`

The accessible name of the checkbox of a body row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowNumber` | `number` | 1-based number of the row in the body |

#### Returns

`string`

default: `"Select row 5"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[selectRow](../interfaces/AriaTextsIf.md#selectrow)

#### Defined in

[src/lib/table/aria/aria-texts.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L62)

___

### selectionCleared

▸ **selectionCleared**(): `string`

Announced after the selection was cleared by the keyboard (e.g. Ctrl+Shift+A).

#### Returns

`string`

default: `"Selection cleared"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[selectionCleared](../interfaces/AriaTextsIf.md#selectioncleared)

#### Defined in

[src/lib/table/aria/aria-texts.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L58)

___

### sorted

▸ **sorted**(`columnLabel`, `sortState`): `string`

Announced after a column was sorted (header double click, Enter on a header cell, [TableApi.sortByColumn](TableApi.md#sortbycolumn)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnLabel` | `string` | the header label of the column |
| `sortState` | [`SortState`](../modules.md#sortstate) | the new sort state, `""` = unsorted |

#### Returns

`string`

default: `"Sorted by Total, descending"`, `"Sorting of Total removed"`

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[sorted](../interfaces/AriaTextsIf.md#sorted)

#### Defined in

[src/lib/table/aria/aria-texts.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L39)

___

### undoHistoryCleared

▸ **undoHistoryCleared**(`maxCells`): `string`

Announced when one change has more cells than `UndoOptionsIf.maxCells`: the history is emptied.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxCells` | `number` | the limit |

#### Returns

`string`

default: `"This change cannot be undone (more than 1000000 cells)"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[undoHistoryCleared](../interfaces/AriaTextsIf.md#undohistorycleared)

#### Defined in

[src/lib/table/aria/aria-texts.ts:206](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L206)

___

### undoSkipped

▸ **undoSkipped**(`cellCount`): `string`

Added to the undo/redo announcement when cells were left out (changed meanwhile, row gone, read only).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | cells left out |

#### Returns

`string`

default: `"2 cells skipped"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[undoSkipped](../interfaces/AriaTextsIf.md#undoskipped)

#### Defined in

[src/lib/table/aria/aria-texts.ts:202](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L202)

___

### undone

▸ **undone**(`label`, `cellCount`): `string`

Announced after Ctrl/⌘+Z (undo and redo, `tableOptions.undo`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `label` | `string` | the step: `"Edit"`, `"Paste"`, `"Fill"` … |
| `cellCount` | `number` | cells written back |

#### Returns

`string`

default: `"Undo Paste, 6 cells"`

**`Since`**

1.1.99

#### Implementation of

[AriaTextsIf](../interfaces/AriaTextsIf.md).[undone](../interfaces/AriaTextsIf.md#undone)

#### Defined in

[src/lib/table/aria/aria-texts.ts:186](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L186)

___

### create

▸ **create**(`overrides?`): [`AriaTextsIf`](../interfaces/AriaTextsIf.md)

The default texts, overridden by the given functions.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `overrides?` | `Partial`\<[`AriaTextsIf`](../interfaces/AriaTextsIf.md)\> | functions that replace the English defaults (e.g. `tableOptions.ariaTexts`) |

#### Returns

[`AriaTextsIf`](../interfaces/AriaTextsIf.md)

a complete set of texts

#### Defined in

[src/lib/table/aria/aria-texts.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.ts#L25)
