[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AriaTextsIf

# Interface: AriaTextsIf

The texts the table speaks to screen reader users: announcements of the live region (sorting, filter, copy,
select all) and the accessible names of controls the table renders (row checkboxes, header group toggles).

The defaults are English ([AriaTexts](../classes/AriaTexts.md)). Override single functions – e.g. for another language – with
[TableOptionsIf.ariaTexts](TableOptionsIf.md#ariatexts); the others keep their default.

Every function returns plain text. It is written with `textContent` / `setAttribute`, never as HTML,
so data in it (column labels, group labels) needs no escaping.

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  ariaTexts: {
    filtered: (rowCount: number) => `${rowCount} Zeilen`,
    sorted: (column: string, state: SortState) => state ? `Sortiert nach ${column}` : `Sortierung entfernt`,
  },
};
```

**`Since`**

1.1.91

**`See`**

Training: [Accessible tables: keyboard and screen readers](https://gui.expert/training/accessibility/)

## Implemented by

- [`AriaTexts`](../classes/AriaTexts.md)

## Table of contents

### Methods

- [allSelected](AriaTextsIf.md#allselected)
- [cellsCleared](AriaTextsIf.md#cellscleared)
- [cellsFilled](AriaTextsIf.md#cellsfilled)
- [cellsPasted](AriaTextsIf.md#cellspasted)
- [changesCommitted](AriaTextsIf.md#changescommitted)
- [changesDiscarded](AriaTextsIf.md#changesdiscarded)
- [clearTooLarge](AriaTextsIf.md#cleartoolarge)
- [collapseGroup](AriaTextsIf.md#collapsegroup)
- [columnSelected](AriaTextsIf.md#columnselected)
- [columnsDeleted](AriaTextsIf.md#columnsdeleted)
- [columnsInserted](AriaTextsIf.md#columnsinserted)
- [commitBlocked](AriaTextsIf.md#commitblocked)
- [copied](AriaTextsIf.md#copied)
- [copiedLastRangeOnly](AriaTextsIf.md#copiedlastrangeonly)
- [copyTooLarge](AriaTextsIf.md#copytoolarge)
- [cutMarked](AriaTextsIf.md#cutmarked)
- [detailCollapsed](AriaTextsIf.md#detailcollapsed)
- [detailExpanded](AriaTextsIf.md#detailexpanded)
- [editingStarted](AriaTextsIf.md#editingstarted)
- [expandGroup](AriaTextsIf.md#expandgroup)
- [fillTooLarge](AriaTextsIf.md#filltoolarge)
- [filtered](AriaTextsIf.md#filtered)
- [formulaError](AriaTextsIf.md#formulaerror)
- [functionSuggestions](AriaTextsIf.md#functionsuggestions)
- [gridEditingHint](AriaTextsIf.md#grideditinghint)
- [invalidValue](AriaTextsIf.md#invalidvalue)
- [nothingToRedo](AriaTextsIf.md#nothingtoredo)
- [nothingToUndo](AriaTextsIf.md#nothingtoundo)
- [pasteTooLarge](AriaTextsIf.md#pastetoolarge)
- [pendingChanges](AriaTextsIf.md#pendingchanges)
- [rangeSelected](AriaTextsIf.md#rangeselected)
- [readOnlyCell](AriaTextsIf.md#readonlycell)
- [redone](AriaTextsIf.md#redone)
- [referenceInserted](AriaTextsIf.md#referenceinserted)
- [rowDragCancelled](AriaTextsIf.md#rowdragcancelled)
- [rowDragStarted](AriaTextsIf.md#rowdragstarted)
- [rowMoveNotPossible](AriaTextsIf.md#rowmovenotpossible)
- [rowMoved](AriaTextsIf.md#rowmoved)
- [rowSelected](AriaTextsIf.md#rowselected)
- [rowsDeleted](AriaTextsIf.md#rowsdeleted)
- [rowsInserted](AriaTextsIf.md#rowsinserted)
- [selectAllRows](AriaTextsIf.md#selectallrows)
- [selectRow](AriaTextsIf.md#selectrow)
- [selectionCleared](AriaTextsIf.md#selectioncleared)
- [sorted](AriaTextsIf.md#sorted)
- [undoHistoryCleared](AriaTextsIf.md#undohistorycleared)
- [undoSkipped](AriaTextsIf.md#undoskipped)
- [undone](AriaTextsIf.md#undone)

## Methods

### allSelected

▸ **allSelected**(): `string`

Announced after Ctrl/⌘+A.

#### Returns

`string`

default: `"All cells selected"`

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L58)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:236](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L236)

___

### cellsFilled

▸ **cellsFilled**(`cellCount`): `string`

Announced after a fill (fill handle, Ctrl/⌘+D, Ctrl/⌘+R) – optional, [AriaTexts](../classes/AriaTexts.md) has a default.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of filled cells |

#### Returns

`string`

default: `"3 cells filled"`

**`Since`**

1.1.96

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:141](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L141)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:291](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L291)

___

### changesCommitted

▸ **changesCommitted**(`cellCount`): `string`

Announced after [TableApi.commitBatchEdit](../classes/TableApi.md#commitbatchedit).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of written cells |

#### Returns

`string`

default: `"3 changes saved"`

**`Since`**

1.1.96

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:168](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L168)

___

### changesDiscarded

▸ **changesDiscarded**(): `string`

Announced after [TableApi.cancelBatchEdit](../classes/TableApi.md#cancelbatchedit).

#### Returns

`string`

default: `"Changes discarded"`

**`Since`**

1.1.96

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:176](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L176)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:245](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L245)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L96)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:273](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L273)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:432](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L432)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:423](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L423)

___

### commitBlocked

▸ **commitBlocked**(`invalidCount`): `string`

Announced when invalid values block [TableApi.commitBatchEdit](../classes/TableApi.md#commitbatchedit).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `invalidCount` | `number` | the number of invalid cells |

#### Returns

`string`

default: `"2 invalid values – nothing saved"`

**`Since`**

1.1.96

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:185](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L185)

___

### copied

▸ **copied**(`cellCount`): `string`

Announced after cells were copied to the clipboard (Ctrl/⌘+C, [TableApi.copyToClipboard](../classes/TableApi.md#copytoclipboard)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cellCount` | `number` | the number of copied cells |

#### Returns

`string`

default: `"12 cells copied"`, `"1 cell copied"`

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L51)

___

### copiedLastRangeOnly

▸ **copiedLastRangeOnly**(): `string`

Announced when several ranges are selected and only the last one is copied (like Google Sheets).

#### Returns

`string`

default: `"Only the last selected range was copied"`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:326](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L326)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:309](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L309)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:318](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L318)

___

### detailCollapsed

▸ **detailCollapsed**(): `string`

Announced after a detail row was collapsed (master/detail).

#### Returns

`string`

default: `"Details collapsed"`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:210](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L210)

___

### detailExpanded

▸ **detailExpanded**(): `string`

Announced after a detail row was expanded (master/detail).

#### Returns

`string`

default: `"Details expanded"`

**`Since`**

1.1.97

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:202](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L202)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:219](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L219)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:88](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L88)

___

### fillTooLarge

▸ **fillTooLarge**(`maxCells`): `string`

Announced when a fill is refused because it covers too many cells ([FillHandleOptionsIf.maxCells](FillHandleOptionsIf.md#maxcells)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxCells` | `number` | the limit |

#### Returns

`string`

default: `"Too many cells to fill (at most 100000)"`

**`Since`**

1.1.96

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L150)

___

### filtered

▸ **filtered**(`rowCount`): `string`

Announced after the external filter changed ([TableApi.externalFilterChanged](../classes/TableApi.md#externalfilterchanged)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount` | `number` | the number of rows the body shows now |

#### Returns

`string`

default: `"42 rows"`, `"1 row"`, `"No rows"`

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L43)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:379](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L379)

___

### functionSuggestions

▸ **functionSuggestions**(): `string`

The label of the list of function suggestions while a cell formula is typed.

#### Returns

`string`

default: `"Functions"`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:387](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L387)

___

### gridEditingHint

▸ **gridEditingHint**(): `string`

The description of the grid with Excel-style editing (`aria-description` of the host): how it is used.

#### Returns

`string`

default: `"Type to edit a cell, Enter to edit or commit, Escape to cancel. Tab in the last column leaves the table."`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:281](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L281)

___

### invalidValue

▸ **invalidValue**(`message`): `string`

Announced when an edited value is invalid ([ColumnDefIf.validate](ColumnDefIf.md#validate)) and not written (without batch edit).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `message` | `string` | the message of the validator |

#### Returns

`string`

default: `"Invalid value: <message>"`

**`Since`**

1.1.96

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:194](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L194)

___

### nothingToRedo

▸ **nothingToRedo**(): `string`

#### Returns

`string`

default: `"Nothing to redo"`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:352](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L352)

___

### nothingToUndo

▸ **nothingToUndo**(): `string`

#### Returns

`string`

default: `"Nothing to undo"`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:349](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L349)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:300](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L300)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:159](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L159)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:255](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L255)

___

### readOnlyCell

▸ **readOnlyCell**(): `string`

Announced when a key is typed on a cell that cannot be edited (Excel-style editing).

#### Returns

`string`

default: `"Read only"`

**`Since`**

1.1.99

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:227](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L227)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:346](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L346)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:396](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L396)

___

### rowDragCancelled

▸ **rowDragCancelled**(): `string`

Announced when a row drag was cancelled (Escape) – optional, [AriaTexts](../classes/AriaTexts.md) has a default.

#### Returns

`string`

default: `"Drag cancelled"`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L132)

___

### rowDragStarted

▸ **rowDragStarted**(`rowCount`): `string`

Announced when a row drag starts (optional – [AriaTexts](../classes/AriaTexts.md) has a default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount` | `number` | number of dragged rows |

#### Returns

`string`

default: `"Dragging 1 row. Press Escape to cancel."`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L105)

___

### rowMoveNotPossible

▸ **rowMoveNotPossible**(): `string`

Announced when rows cannot be moved: the table is sorted or filtered (managed row drag), or the row cannot move
further (optional – [AriaTexts](../classes/AriaTexts.md) has a default).

#### Returns

`string`

default: `"Rows cannot be moved while the table is sorted or filtered"`

**`Since`**

1.1.95

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L124)

___

### rowMoved

▸ **rowMoved**(`position`, `rowCount`): `string`

Announced after rows were moved by drag and drop or Ctrl+Alt+↑/↓ (optional – [AriaTexts](../classes/AriaTexts.md) has a default).

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:115](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L115)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:264](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L264)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:414](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L414)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:405](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L405)

___

### selectAllRows

▸ **selectAllRows**(): `string`

The accessible name of the checkbox in the header (checks all rows).

#### Returns

`string`

default: `"Select all rows"`

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L80)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L73)

___

### selectionCleared

▸ **selectionCleared**(): `string`

Announced after the selection was cleared by the keyboard (e.g. Ctrl+Shift+A).

#### Returns

`string`

default: `"Selection cleared"`

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L65)

___

### sorted

▸ **sorted**(`columnLabel`, `sortState`): `string`

Announced after a column was sorted (header double click, Enter on a header cell, [TableApi.sortByColumn](../classes/TableApi.md#sortbycolumn)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnLabel` | `string` | the header label of the column |
| `sortState` | [`SortState`](../modules.md#sortstate) | the new sort state, `""` = unsorted |

#### Returns

`string`

default: `"Sorted by Total, descending"`, `"Sorting of Total removed"`

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L35)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:370](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L370)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:361](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L361)

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

#### Defined in

[src/lib/table/aria/aria-texts.if.ts:336](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-texts.if.ts#L336)
