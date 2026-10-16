[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowLayout

# Class: RowLayout

Vertical positions of the body rows: the row heights as prefix sums plus optional extra heights behind single rows
(the detail rows of master/detail). DOM-free; the table keeps one instance for its body
([RenderScope.getBodyRowTop](RenderScope.md#getbodyrowtop), [RenderScope.getBodyRowIndexAtY](RenderScope.md#getbodyrowindexaty)).

- Constant row height: positions are computed (`i * h`), no array.
- Variable row heights: a `Float64Array` of `rowCount + 1` prefix sums, built lazily on the first access after
  [setRows](RowLayout.md#setrows) – then [getTop](RowLayout.md#gettop) is O(1) and [findIndexAt](RowLayout.md#findindexat) O(log n) (before 1.1.97 the table summed the
  heights of all rows above the viewport in every scroll frame).
- Extras: sorted row indices with their extra heights and the prefix sums of the extras (O(log k) per lookup,
  k = number of extras). Changing one extra height ([setExtraHeight](RowLayout.md#setextraheight)) costs O(k), not O(n).

The slot of a row is the row plus its extra height below it: `getTop(i + 1) = getTop(i) + getRowHeight(i) +
getExtraHeight(i)`.

**`Example`**

```ts
const layout = new RowLayout();
layout.setRows(1000, i => i % 2 ? 30 : 50);       // variable heights
layout.setExtras([12, 40], [180, 240]);            // details behind rows 12 and 40
const top = layout.getTop(41);                     // top of row 41 below both details
const row = layout.findIndexAt(5000);              // the row whose slot contains y = 5000
```

**`Since`**

1.1.97

## Table of contents

### Constructors

- [constructor](RowLayout.md#constructor)

### Methods

- [findIndexAt](RowLayout.md#findindexat)
- [getExtraBefore](RowLayout.md#getextrabefore)
- [getExtraCount](RowLayout.md#getextracount)
- [getExtraHeight](RowLayout.md#getextraheight)
- [getExtraTotal](RowLayout.md#getextratotal)
- [getRowCount](RowLayout.md#getrowcount)
- [getRowHeight](RowLayout.md#getrowheight)
- [getTop](RowLayout.md#gettop)
- [getTotalHeight](RowLayout.md#gettotalheight)
- [hasPrefixSums](RowLayout.md#hasprefixsums)
- [setExtra](RowLayout.md#setextra)
- [setExtraHeight](RowLayout.md#setextraheight)
- [setExtras](RowLayout.md#setextras)
- [setRows](RowLayout.md#setrows)

## Constructors

### constructor

• **new RowLayout**(): [`RowLayout`](RowLayout.md)

#### Returns

[`RowLayout`](RowLayout.md)

## Methods

### findIndexAt

▸ **findIndexAt**(`y`): `number`

The row whose slot (row + extra) contains `y`; rows of height 0 are skipped. Above the first row: 0, below the
last: the last row, without rows: -1. O(1) for constant heights without extras, otherwise O(log n).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `y` | `number` | px from the top of the first row |

#### Returns

`number`

the row index

#### Defined in

[src/lib/table/row-layout/row-layout.ts:220](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L220)

___

### getExtraBefore

▸ **getExtraBefore**(`rowIndex`): `number`

The sum of the extra heights of the rows above a row.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | the row (`rowCount` = all extras) |

#### Returns

`number`

px

#### Defined in

[src/lib/table/row-layout/row-layout.ts:187](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L187)

___

### getExtraCount

▸ **getExtraCount**(): `number`

The number of rows with an extra height.

#### Returns

`number`

#### Defined in

[src/lib/table/row-layout/row-layout.ts:147](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L147)

___

### getExtraHeight

▸ **getExtraHeight**(`rowIndex`): `number`

The extra height below a row (0 = none).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | the row |

#### Returns

`number`

the extra height in px

#### Defined in

[src/lib/table/row-layout/row-layout.ts:176](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L176)

___

### getExtraTotal

▸ **getExtraTotal**(): `number`

The sum of all extra heights.

#### Returns

`number`

#### Defined in

[src/lib/table/row-layout/row-layout.ts:192](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L192)

___

### getRowCount

▸ **getRowCount**(): `number`

The number of rows.

#### Returns

`number`

#### Defined in

[src/lib/table/row-layout/row-layout.ts:142](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L142)

___

### getRowHeight

▸ **getRowHeight**(`rowIndex`): `number`

The height of a row (without its extra).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | the row |

#### Returns

`number`

the height in px

#### Defined in

[src/lib/table/row-layout/row-layout.ts:162](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L162)

___

### getTop

▸ **getTop**(`rowIndex`): `number`

The top of a row: heights and extras of all rows above it. `getTop(rowCount)` = total height. The index is
clamped to `0 … rowCount`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | the row |

#### Returns

`number`

px from the top of the first row

#### Defined in

[src/lib/table/row-layout/row-layout.ts:203](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L203)

___

### getTotalHeight

▸ **getTotalHeight**(): `number`

The height of all rows and extras.

#### Returns

`number`

#### Defined in

[src/lib/table/row-layout/row-layout.ts:209](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L209)

___

### hasPrefixSums

▸ **hasPrefixSums**(): `boolean`

True after the prefix sums of variable heights were built (never for constant heights).

#### Returns

`boolean`

#### Defined in

[src/lib/table/row-layout/row-layout.ts:152](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L152)

___

### setExtra

▸ **setExtra**(`rowIndex`, `height`): `boolean`

Sets, changes or (height ≤ 0) removes the extra height behind one row – O(k), the other extras stay.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | the row (ignored outside the rows) |
| `height` | `number` | the extra height, ≤ 0 removes it |

#### Returns

`boolean`

true if something changed

#### Defined in

[src/lib/table/row-layout/row-layout.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L109)

___

### setExtraHeight

▸ **setExtraHeight**(`rowIndex`, `height`): `boolean`

Changes the extra height behind one row that already has one (see [setExtras](RowLayout.md#setextras)).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | the row |
| `height` | `number` | the new extra height (> 0) |

#### Returns

`boolean`

false if the row has no extra or the height did not change

#### Defined in

[src/lib/table/row-layout/row-layout.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L92)

___

### setExtras

▸ **setExtras**(`rowIndices`, `heights`): `void`

Sets the extra heights (e.g. detail rows) behind rows. Unsorted input is fine; heights of the same row add up;
indices outside the rows and heights ≤ 0 are ignored. Replaces all previous extras.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndices` | `ArrayLike`\<`number`\> | the rows with an extra height below them |
| `heights` | `ArrayLike`\<`number`\> | the extra heights (same order as `rowIndices`) |

#### Returns

`void`

#### Defined in

[src/lib/table/row-layout/row-layout.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L70)

___

### setRows

▸ **setRows**(`rowCount`, `heightOf`, `constantHeight?`): `void`

Sets the rows. Prefix sums of variable heights are built lazily on the first access.
Extras behind rows that no longer exist are dropped.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowCount` | `number` | number of rows |
| `heightOf` | (`rowIndex`: `number`) => `number` | height of a row (called only for variable heights) |
| `constantHeight?` | `number` | the height of every row, if they are all equal (`AreaModelIf.getConstantRowHeight`) |

#### Returns

`void`

#### Defined in

[src/lib/table/row-layout/row-layout.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/row-layout/row-layout.ts#L45)
