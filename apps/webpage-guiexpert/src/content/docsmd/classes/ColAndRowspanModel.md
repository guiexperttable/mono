[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColAndRowspanModel

# Class: ColAndRowspanModel

Represents a model for handling colspan and rowspan in a table.

## Table of contents

### Constructors

- [constructor](ColAndRowspanModel.md#constructor)

### Properties

- [areaModel](ColAndRowspanModel.md#areamodel)
- [colAndRowspanRanges](ColAndRowspanModel.md#colandrowspanranges)
- [rowCountAtInit](ColAndRowspanModel.md#rowcountatinit)
- [tableModel](ColAndRowspanModel.md#tablemodel)

### Methods

- [getRanges](ColAndRowspanModel.md#getranges)
- [init](ColAndRowspanModel.md#init)
- [initIfRowCountChanged](ColAndRowspanModel.md#initifrowcountchanged)
- [isInRange](ColAndRowspanModel.md#isinrange)

## Constructors

### constructor

• **new ColAndRowspanModel**(`tableModel`, `areaModel`): [`ColAndRowspanModel`](ColAndRowspanModel.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) |
| `areaModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) |

#### Returns

[`ColAndRowspanModel`](ColAndRowspanModel.md)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L14)

## Properties

### areaModel

• `Protected` **areaModel**: [`AreaModelIf`](../interfaces/AreaModelIf.md)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L16)

___

### colAndRowspanRanges

• `Protected` **colAndRowspanRanges**: `undefined` \| [`CellRange`](CellRange.md)[] = `undefined`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L12)

___

### rowCountAtInit

• `Protected` **rowCountAtInit**: `number` = `-1`

Row count of the area model at the last [init](ColAndRowspanModel.md#init) (−1: not initialized yet).

#### Defined in

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L21)

___

### tableModel

• `Protected` **tableModel**: [`TableModelIf`](../interfaces/TableModelIf.md)

#### Defined in

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L15)

## Methods

### getRanges

▸ **getRanges**(): [`CellRange`](CellRange.md)[]

#### Returns

[`CellRange`](CellRange.md)[]

#### Defined in

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L67)

___

### init

▸ **init**(): `void`

#### Returns

`void`

#### Defined in

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L23)

___

### initIfRowCountChanged

▸ **initIfRowCountChanged**(): `boolean`

Builds the ranges again if the row count of the area model changed since the last [init](ColAndRowspanModel.md#init) – e.g. after
`setRows()` or a filter (the old ranges could point to rows that no longer exist). Cheap otherwise.

#### Returns

`boolean`

true if the ranges were rebuilt

#### Defined in

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L59)

___

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

[src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/col-and-rowspan-model.ts#L74)
