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
- [cellsFilled](AriaTextsIf.md#cellsfilled)
- [changesCommitted](AriaTextsIf.md#changescommitted)
- [changesDiscarded](AriaTextsIf.md#changesdiscarded)
- [collapseGroup](AriaTextsIf.md#collapsegroup)
- [commitBlocked](AriaTextsIf.md#commitblocked)
- [copied](AriaTextsIf.md#copied)
- [expandGroup](AriaTextsIf.md#expandgroup)
- [fillTooLarge](AriaTextsIf.md#filltoolarge)
- [filtered](AriaTextsIf.md#filtered)
- [invalidValue](AriaTextsIf.md#invalidvalue)
- [pendingChanges](AriaTextsIf.md#pendingchanges)
- [rowDragCancelled](AriaTextsIf.md#rowdragcancelled)
- [rowDragStarted](AriaTextsIf.md#rowdragstarted)
- [rowMoveNotPossible](AriaTextsIf.md#rowmovenotpossible)
- [rowMoved](AriaTextsIf.md#rowmoved)
- [selectAllRows](AriaTextsIf.md#selectallrows)
- [selectRow](AriaTextsIf.md#selectrow)
- [selectionCleared](AriaTextsIf.md#selectioncleared)
- [sorted](AriaTextsIf.md#sorted)

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
