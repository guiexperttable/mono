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
- [collapseGroup](AriaTexts.md#collapsegroup)
- [copied](AriaTexts.md#copied)
- [expandGroup](AriaTexts.md#expandgroup)
- [filtered](AriaTexts.md#filtered)
- [rowDragCancelled](AriaTexts.md#rowdragcancelled)
- [rowDragStarted](AriaTexts.md#rowdragstarted)
- [rowMoveNotPossible](AriaTexts.md#rowmovenotpossible)
- [rowMoved](AriaTexts.md#rowmoved)
- [selectAllRows](AriaTexts.md#selectallrows)
- [selectRow](AriaTexts.md#selectrow)
- [selectionCleared](AriaTexts.md#selectioncleared)
- [sorted](AriaTexts.md#sorted)
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
