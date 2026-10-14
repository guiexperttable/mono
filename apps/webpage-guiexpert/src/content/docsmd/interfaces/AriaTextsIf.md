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
- [collapseGroup](AriaTextsIf.md#collapsegroup)
- [copied](AriaTextsIf.md#copied)
- [expandGroup](AriaTextsIf.md#expandgroup)
- [filtered](AriaTextsIf.md#filtered)
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
