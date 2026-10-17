[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SheetCellsIf

# Interface: SheetCellsIf

The link between the body model and the cell formulas of a table ([TableOptionsIf.cellFormulas](TableOptionsIf.md#cellformulas)): the model
asks it for the value of every text input – an `=…` cell of a formula column gives its result. Set by the table.

**`Since`**

1.1.99

## Implemented by

- [`TableSheet`](../classes/TableSheet.md)

## Table of contents

### Methods

- [isFormulaColumnIndex](SheetCellsIf.md#isformulacolumnindex)
- [isFormulaProperty](SheetCellsIf.md#isformulaproperty)
- [valueAt](SheetCellsIf.md#valueat)
- [valueOfProperty](SheetCellsIf.md#valueofproperty)

## Methods

### isFormulaColumnIndex

▸ **isFormulaColumnIndex**(`columnIndex`): `boolean`

True if the column may hold formulas.

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/sheet/sheet-cells.if.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-cells.if.ts#L16)

___

### isFormulaProperty

▸ **isFormulaProperty**(`property`): `boolean`

True if the column of this property may hold formulas.

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |

#### Returns

`boolean`

#### Defined in

[src/lib/table/sheet/sheet-cells.if.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-cells.if.ts#L14)

___

### valueAt

▸ **valueAt**(`row`, `columnIndex`, `input`): `unknown`

The value of a cell of an array row (`AreaModelArrayOfArrays`): the result for a formula, otherwise `input`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `unknown` |
| `columnIndex` | `number` |
| `input` | `string` |

#### Returns

`unknown`

#### Defined in

[src/lib/table/sheet/sheet-cells.if.ts:10](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-cells.if.ts#L10)

___

### valueOfProperty

▸ **valueOfProperty**(`row`, `property`, `input`): `unknown`

The value of a property of a row object: the result for a formula, otherwise `input`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `unknown` |
| `property` | `string` |
| `input` | `string` |

#### Returns

`unknown`

#### Defined in

[src/lib/table/sheet/sheet-cells.if.ts:12](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-cells.if.ts#L12)
