[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AriaGridInfo

# Class: AriaGridInfo

Row and column numbers for screen readers – computed once per render pass from the table model.

With virtual scrolling only the visible rows and columns are in the DOM, so the table tells screen readers the
real size (`aria-rowcount`, `aria-colcount` on the grid) and the position of every rendered row and cell
(`aria-rowindex`, `aria-colindex`):

- rows are numbered 1-based over header → body → footer; a hidden header/footer (`setHeaderVisible(false)`) counts 0,
- the body counts **all** rows of the model (after the filter; a tree: the displayed nodes),
- columns count only the **shown** columns (width > 0): a column hidden with `setColumnVisible(…, false)` has no
  `aria-colindex`, the following columns move up,
- a body with an unknown row count (`getRowCount() < 0`) gives `aria-rowcount="-1"`.

**`Example`**

```ts
// 1 header row, 1000 body rows, 10 columns, column 3 hidden
const info = AriaGridInfo.create(tableModel);
info.rowCount;               // 1001
info.colCount;               // 9
info.rowIndex("header", 0);  // 1
info.rowIndex("body", 0);    // 2
info.colIndex(4);            // 4 (column 3 is skipped)
info.colIndex(3);            // 0 (hidden)
```

**`Since`**

1.1.91

## Table of contents

### Constructors

- [constructor](AriaGridInfo.md#constructor)

### Properties

- [bodyRowCount](AriaGridInfo.md#bodyrowcount)
- [footerRowCount](AriaGridInfo.md#footerrowcount)
- [headerRowCount](AriaGridInfo.md#headerrowcount)

### Accessors

- [colCount](AriaGridInfo.md#colcount)
- [rowCount](AriaGridInfo.md#rowcount)

### Methods

- [colIndex](AriaGridInfo.md#colindex)
- [colSpan](AriaGridInfo.md#colspan)
- [rowIndex](AriaGridInfo.md#rowindex)
- [create](AriaGridInfo.md#create)

## Constructors

### constructor

• **new AriaGridInfo**(`headerRowCount`, `bodyRowCount`, `footerRowCount`, `colIndexMap`): [`AriaGridInfo`](AriaGridInfo.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `headerRowCount` | `number` | rendered header rows (0 if the header is hidden) |
| `bodyRowCount` | `number` | body rows of the model (negative = unknown) |
| `footerRowCount` | `number` | rendered footer rows (0 if the footer is hidden) |
| `colIndexMap` | `number`[] | per model column its `aria-colindex` (0 = hidden) |

#### Returns

[`AriaGridInfo`](AriaGridInfo.md)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L38)

## Properties

### bodyRowCount

• `Readonly` **bodyRowCount**: `number`

body rows of the model (negative = unknown)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L40)

___

### footerRowCount

• `Readonly` **footerRowCount**: `number`

rendered footer rows (0 if the footer is hidden)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L41)

___

### headerRowCount

• `Readonly` **headerRowCount**: `number`

rendered header rows (0 if the header is hidden)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L39)

## Accessors

### colCount

• `get` **colCount**(): `number`

`aria-colcount` of the grid: the number of shown columns.

#### Returns

`number`

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L76)

___

### rowCount

• `get` **rowCount**(): `number`

`aria-rowcount` of the grid: header + body + footer rows, `-1` if the body does not know its row count.

#### Returns

`number`

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L68)

## Methods

### colIndex

▸ **colIndex**(`columnIndex`): `number`

`aria-colindex` of a column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model column index (west + center + east) |

#### Returns

`number`

the 1-based position among the shown columns, 0 for a hidden or unknown column

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:107](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L107)

___

### colSpan

▸ **colSpan**(`columnIndex`, `colspan`): `number`

`aria-colspan` of a cell that spans columns: the number of **shown** columns it covers.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | the first column of the cell |
| `colspan` | `number` | the number of model columns the cell spans |

#### Returns

`number`

the number of shown columns (at least 1)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:118](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L118)

___

### rowIndex

▸ **rowIndex**(`area`, `rowIndex`): `number`

`aria-rowindex` of a row (1-based over header → body → footer).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `area` | [`AreaIdent`](../modules.md#areaident) | header, body or footer |
| `rowIndex` | `number` | row index in the area |

#### Returns

`number`

the 1-based row number in the whole grid

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L91)

___

### create

▸ **create**(`tableModel`): [`AriaGridInfo`](AriaGridInfo.md)

Reads the counts of a table model.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableModel` | `Pick`\<[`TableModelIf`](../interfaces/TableModelIf.md), ``"getAreaModel"`` \| ``"isHeaderVisibe"`` \| ``"isFooterVisibe"`` \| ``"getColumnCount"`` \| ``"getColumnWidth"``\> | the table model (only the area models, header/footer visibility and column widths are read) |

#### Returns

[`AriaGridInfo`](AriaGridInfo.md)

the counts

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L52)
