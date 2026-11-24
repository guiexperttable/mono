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
- [filterRowCount](AriaGridInfo.md#filterrowcount)
- [footerRowCount](AriaGridInfo.md#footerrowcount)
- [headerRowCount](AriaGridInfo.md#headerrowcount)

### Accessors

- [colCount](AriaGridInfo.md#colcount)
- [rowCount](AriaGridInfo.md#rowcount)

### Methods

- [colIndex](AriaGridInfo.md#colindex)
- [colSpan](AriaGridInfo.md#colspan)
- [filterRowIndex](AriaGridInfo.md#filterrowindex)
- [rowIndex](AriaGridInfo.md#rowindex)
- [create](AriaGridInfo.md#create)

## Constructors

### constructor

• **new AriaGridInfo**(`headerRowCount`, `bodyRowCount`, `footerRowCount`, `colIndexMap`, `filterRowCount?`): [`AriaGridInfo`](AriaGridInfo.md)

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `headerRowCount` | `number` | `undefined` | rendered header rows (0 if the header is hidden) |
| `bodyRowCount` | `number` | `undefined` | body rows of the model (negative = unknown) |
| `footerRowCount` | `number` | `undefined` | rendered footer rows (0 if the footer is hidden) |
| `colIndexMap` | `number`[] | `undefined` | per model column its `aria-colindex` (0 = hidden) |
| `filterRowCount?` | `number` | `0` | rendered filter row count (1 when the filter row is visible, else 0) |

#### Returns

[`AriaGridInfo`](AriaGridInfo.md)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L39)

## Properties

### bodyRowCount

• `Readonly` **bodyRowCount**: `number`

body rows of the model (negative = unknown)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L41)

___

### filterRowCount

• `Readonly` **filterRowCount**: `number` = `0`

rendered filter row count (1 when the filter row is visible, else 0)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L44)

___

### footerRowCount

• `Readonly` **footerRowCount**: `number`

rendered footer rows (0 if the footer is hidden)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L42)

___

### headerRowCount

• `Readonly` **headerRowCount**: `number`

rendered header rows (0 if the header is hidden)

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L40)

## Accessors

### colCount

• `get` **colCount**(): `number`

`aria-colcount` of the grid: the number of shown columns.

#### Returns

`number`

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L81)

___

### rowCount

• `get` **rowCount**(): `number`

`aria-rowcount` of the grid: header + filter row + body + footer rows, `-1` if the body does not know its row count.

#### Returns

`number`

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L73)

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

[src/lib/table/aria/aria-grid-info.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L122)

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

[src/lib/table/aria/aria-grid-info.ts:133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L133)

___

### filterRowIndex

▸ **filterRowIndex**(): `number`

1-based `aria-rowindex` of the persistent filter row (immediately after the header rows), or `0` when none is shown.

#### Returns

`number`

1-based row number in the grid

**`Since`**

1.1.114

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L95)

___

### rowIndex

▸ **rowIndex**(`area`, `rowIndex`): `number`

`aria-rowindex` of a row (1-based over header → filter row → body → footer).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `area` | [`AreaIdent`](../modules.md#areaident) | header, body or footer |
| `rowIndex` | `number` | row index in the area |

#### Returns

`number`

the 1-based row number in the whole grid

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L106)

___

### create

▸ **create**(`tableModel`, `filterRowCount?`): [`AriaGridInfo`](AriaGridInfo.md)

Reads the counts of a table model.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `tableModel` | `Pick`\<[`TableModelIf`](../interfaces/TableModelIf.md), ``"getAreaModel"`` \| ``"isHeaderVisibe"`` \| ``"isFooterVisibe"`` \| ``"getColumnCount"`` \| ``"getColumnWidth"``\> | `undefined` | the table model (only the area models, header/footer visibility and column widths are read) |
| `filterRowCount?` | `number` | `0` | rendered filter row count (1 when the filter row is visible, else 0) |

#### Returns

[`AriaGridInfo`](AriaGridInfo.md)

the counts

#### Defined in

[src/lib/table/aria/aria-grid-info.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aria/aria-grid-info.ts#L55)
