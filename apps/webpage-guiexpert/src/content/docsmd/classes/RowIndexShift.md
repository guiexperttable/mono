[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowIndexShift

# Class: RowIndexShift

How the display indices of the body rows move when rows are removed and inserted in one step (live data:
`tableApi.appendRows()` / `rowsAppended()`, since 1.1.108) – so selection, focus and anchor stay at the same rows
instead of being cleared. DOM-free.

Order: first the `removed` rows leave (indices **before** the step), then the `inserted` rows come in (indices
**after** the step). An old row keeps its relative order.

**`Example`**

```ts
// 2 rows dropped at the start (ring buffer), 3 appended at the end of 10 → 11 rows
const shift = new RowIndexShift([0, 1], [8, 9, 10]);
shift.mapIndex(5);        // 3
shift.mapIndex(1);        // -1 (removed)
```

**`Example`**

```ts
// sorted: one row inserted at display index 2 (between the old rows 1 and 2)
const shift = new RowIndexShift([], [2]);
shift.mapRange(0, 4);     // [[0, 1], [3, 5]] – the new row splits the range (it is not selected)
```

**`Since`**

1.1.108

## Table of contents

### Constructors

- [constructor](RowIndexShift.md#constructor)

### Methods

- [getInsertedCount](RowIndexShift.md#getinsertedcount)
- [getRemovedCount](RowIndexShift.md#getremovedcount)
- [isEmpty](RowIndexShift.md#isempty)
- [mapIndex](RowIndexShift.md#mapindex)
- [mapIndexOrNext](RowIndexShift.md#mapindexornext)
- [mapRange](RowIndexShift.md#maprange)
- [touchesUpTo](RowIndexShift.md#touchesupto)

## Constructors

### constructor

• **new RowIndexShift**(`removed?`, `inserted?`): [`RowIndexShift`](RowIndexShift.md)

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `removed` | `ArrayLike`\<`number`\> | `[]` | display indices before the step of the removed rows, ascending, unique |
| `inserted` | `ArrayLike`\<`number`\> | `[]` | display indices after the step of the inserted rows, ascending, unique |

#### Returns

[`RowIndexShift`](RowIndexShift.md)

#### Defined in

[src/lib/table/live-append/row-index-shift.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/row-index-shift.ts#L34)

## Methods

### getInsertedCount

▸ **getInsertedCount**(): `number`

Number of inserted rows.

#### Returns

`number`

#### Defined in

[src/lib/table/live-append/row-index-shift.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/row-index-shift.ts#L54)

___

### getRemovedCount

▸ **getRemovedCount**(): `number`

Number of removed rows.

#### Returns

`number`

#### Defined in

[src/lib/table/live-append/row-index-shift.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/row-index-shift.ts#L49)

___

### isEmpty

▸ **isEmpty**(): `boolean`

True if nothing moves (no row removed, none inserted).

#### Returns

`boolean`

#### Defined in

[src/lib/table/live-append/row-index-shift.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/row-index-shift.ts#L44)

___

### mapIndex

▸ **mapIndex**(`index`): `number`

The new display index of an old one.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | display index before the step |

#### Returns

`number`

the index after the step, -1 if the row was removed (or `index` is negative)

#### Defined in

[src/lib/table/live-append/row-index-shift.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/row-index-shift.ts#L78)

___

### mapIndexOrNext

▸ **mapIndexOrNext**(`index`): `number`

The display index after the step of the first remaining row at or after an old index – for a position that
must stay on a row (e.g. the first visible row) when that row itself was removed.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | display index before the step |

#### Returns

`number`

the index after the step (the end if no old row at or after `index` remains)

#### Defined in

[src/lib/table/live-append/row-index-shift.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/row-index-shift.ts#L97)

___

### mapRange

▸ **mapRange**(`lo`, `hi`): [`number`, `number`][]

The new ranges of an old range of rows `lo … hi` (inclusive): removed rows leave it, inserted rows inside split
it (they are not part of it). `hi = Number.MAX_SAFE_INTEGER` (whole columns) stays open at the end.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `lo` | `number` | first row of the range before the step |
| `hi` | `number` | last row of the range before the step (inclusive) |

#### Returns

[`number`, `number`][]

the pieces after the step, ascending, `[]` if all its rows were removed

#### Defined in

[src/lib/table/live-append/row-index-shift.ts:111](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/row-index-shift.ts#L111)

___

### touchesUpTo

▸ **touchesUpTo**(`index`): `boolean`

True if a row at an old display index `<= index` is removed or a row is inserted in front of the old row `index`
(i.e. the rows `0 … index` are not the same as before).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `index` | `number` | an old display index |

#### Returns

`boolean`

true if the rows up to this index changed

#### Defined in

[src/lib/table/live-append/row-index-shift.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/live-append/row-index-shift.ts#L65)
