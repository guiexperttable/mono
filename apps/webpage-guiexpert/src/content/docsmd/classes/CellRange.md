[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellRange

# Class: CellRange

A rectangle of cells: rows `r1`…`r2`, columns `c1`…`c2` (inclusive, body indices as displayed).
[SelectionModelIf.getRanges](../interfaces/SelectionModelIf.md#getranges) returns the selection as a list of them.

**`Example`**

```ts
const firstTenRows = new CellRange(0, 0, 9, tableModel.getColumnCount() - 1);
tableApi.getSelectionModel()?.addSelection(firstTenRows);
tableApi.repaint();
```

## Table of contents

### Constructors

- [constructor](CellRange.md#constructor)

### Properties

- [c1](CellRange.md#c1)
- [c2](CellRange.md#c2)
- [gammaRange](CellRange.md#gammarange)
- [r1](CellRange.md#r1)
- [r2](CellRange.md#r2)

### Methods

- [isInRange](CellRange.md#isinrange)
- [create](CellRange.md#create)
- [singleCell](CellRange.md#singlecell)
- [singleColumn](CellRange.md#singlecolumn)
- [singleRow](CellRange.md#singlerow)

## Constructors

### constructor

• **new CellRange**(`r1`, `c1`, `r2`, `c2`, `gammaRange?`): [`CellRange`](CellRange.md)

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `r1` | `number` | `undefined` | first row |
| `c1` | `number` | `undefined` | first column |
| `r2` | `number` | `undefined` | last row (inclusive) |
| `c2` | `number` | `undefined` | last column (inclusive) |
| `gammaRange` | `boolean` | `false` | reserved for [AreaModelCellGroups](AreaModelCellGroups.md), not used yet (default false) |

#### Returns

[`CellRange`](CellRange.md)

#### Defined in

[src/lib/table/data/common/cell-range.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L22)

## Properties

### c1

• **c1**: `number`

first column

#### Defined in

[src/lib/table/data/common/cell-range.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L24)

___

### c2

• **c2**: `number`

last column (inclusive)

#### Defined in

[src/lib/table/data/common/cell-range.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L26)

___

### gammaRange

• **gammaRange**: `boolean` = `false`

reserved for [AreaModelCellGroups](AreaModelCellGroups.md), not used yet (default false)

#### Defined in

[src/lib/table/data/common/cell-range.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L27)

___

### r1

• **r1**: `number`

first row

#### Defined in

[src/lib/table/data/common/cell-range.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L23)

___

### r2

• **r2**: `number`

last row (inclusive)

#### Defined in

[src/lib/table/data/common/cell-range.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L25)

## Methods

### isInRange

▸ **isInRange**(`rowIndex`, `columnIndex`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/data/common/cell-range.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L68)

___

### create

▸ **create**(`params`): [`CellRange`](CellRange.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `Object` |
| `params.columnIndex1` | `number` |
| `params.columnIndex2` | `number` |
| `params.gammaRange?` | `boolean` |
| `params.rowIndex1` | `number` |
| `params.rowIndex2` | `number` |

#### Returns

[`CellRange`](CellRange.md)

#### Defined in

[src/lib/table/data/common/cell-range.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L30)

___

### singleCell

▸ **singleCell**(`rowIndex`, `columnIndex`): [`CellRange`](CellRange.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

#### Returns

[`CellRange`](CellRange.md)

#### Defined in

[src/lib/table/data/common/cell-range.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L49)

___

### singleColumn

▸ **singleColumn**(`columnIndex`): [`CellRange`](CellRange.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |

#### Returns

[`CellRange`](CellRange.md)

#### Defined in

[src/lib/table/data/common/cell-range.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L62)

___

### singleRow

▸ **singleRow**(`rowIndex`): [`CellRange`](CellRange.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |

#### Returns

[`CellRange`](CellRange.md)

#### Defined in

[src/lib/table/data/common/cell-range.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/cell-range.ts#L56)
