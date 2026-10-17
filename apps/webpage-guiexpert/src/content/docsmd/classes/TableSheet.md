[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableSheet

# Class: TableSheet

The cell formulas of a table ([TableOptionsIf.cellFormulas](../interfaces/TableOptionsIf.md#cellformulas)): connects the body model with a
[SheetEngine](SheetEngine.md). Rows are the physical rows (`getAllRows()` / the array), columns the data columns (row number
and checkbox columns don't count). The body asks it for the value of every text input (`SheetCellsIf`); the table
reports every write (`cellsWritten`). A new rows array (`setRows`), another row count or other columns rebuild
the engine.

**`Since`**

1.1.99

## Implements

- [`SheetCellsIf`](../interfaces/SheetCellsIf.md)

## Table of contents

### Properties

- [engine](TableSheet.md#engine)
- [options](TableSheet.md#options)

### Methods

- [address](TableSheet.md#address)
- [allowsColumnDrag](TableSheet.md#allowscolumndrag)
- [cellOfAddress](TableSheet.md#cellofaddress)
- [cellValue](TableSheet.md#cellvalue)
- [cellsWritten](TableSheet.md#cellswritten)
- [copyOf](TableSheet.md#copyof)
- [dependents](TableSheet.md#dependents)
- [destroy](TableSheet.md#destroy)
- [displayRow](TableSheet.md#displayrow)
- [engineColumn](TableSheet.md#enginecolumn)
- [evaluate](TableSheet.md#evaluate)
- [inputAt](TableSheet.md#inputat)
- [isFormulaColumnIndex](TableSheet.md#isformulacolumnindex)
- [isFormulaInput](TableSheet.md#isformulainput)
- [isFormulaProperty](TableSheet.md#isformulaproperty)
- [modelColumn](TableSheet.md#modelcolumn)
- [moveFormula](TableSheet.md#moveformula)
- [physicalRow](TableSheet.md#physicalrow)
- [precedents](TableSheet.md#precedents)
- [recalculate](TableSheet.md#recalculate)
- [rowCount](TableSheet.md#rowcount)
- [rowsArray](TableSheet.md#rowsarray)
- [syntaxError](TableSheet.md#syntaxerror)
- [valueAt](TableSheet.md#valueat)
- [valueOfProperty](TableSheet.md#valueofproperty)
- [writeInput](TableSheet.md#writeinput)
- [create](TableSheet.md#create)

## Properties

### engine

• `Readonly` **engine**: [`SheetEngine`](SheetEngine.md)

#### Defined in

[src/lib/table/sheet/table-sheet.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L40)

___

### options

• `Readonly` **options**: [`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md)

#### Defined in

[src/lib/table/sheet/table-sheet.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L61)

## Methods

### address

▸ **address**(`displayRow`, `columnIndex`): `undefined` \| `string`

The address of a cell (`"B3"`), `undefined` for a row number or checkbox column.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `displayRow` | `number` | display index |
| `columnIndex` | `number` | model column |

#### Returns

`undefined` \| `string`

the address

#### Defined in

[src/lib/table/sheet/table-sheet.ts:324](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L324)

___

### allowsColumnDrag

▸ **allowsColumnDrag**(): `boolean`

False for arrays (moving a column moves the data of every row – the references would point elsewhere); object
rows: the column letter belongs to the property and moves with it.

#### Returns

`boolean`

true if columns may be dragged

#### Defined in

[src/lib/table/sheet/table-sheet.ts:438](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L438)

___

### cellOfAddress

▸ **cellOfAddress**(`address`): `undefined` \| [`number`, `number`]

The cell of an address: display row (`-1` if a filter hides it) and model column; `undefined` if invalid.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | `"B3"`, `"$B$3"` |

#### Returns

`undefined` \| [`number`, `number`]

display row and model column

#### Defined in

[src/lib/table/sheet/table-sheet.ts:336](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L336)

___

### cellValue

▸ **cellValue**(`row`, `col`): `unknown`

The value of a cell by physical row and engine column (the rows are checked first).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | physical row |
| `col` | `number` | engine column |

#### Returns

`unknown`

the value

#### Defined in

[src/lib/table/sheet/table-sheet.ts:195](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L195)

___

### cellsWritten

▸ **cellsWritten**(`changes`): `void`

Cells were written (their inputs changed): the engine compiles their formulas again and recalculates the
dependent cells – before the table repaints.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `changes` | readonly [`CellChangeIf`](../interfaces/CellChangeIf.md)\<`any`\>[] | the written cells (row object or display index, model column) |

#### Returns

`void`

#### Defined in

[src/lib/table/sheet/table-sheet.ts:157](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L157)

___

### copyOf

▸ **copyOf**(`displayRow`, `columnIndex`, `input`, `value`): `unknown`

The copy of a cell inside the table: a CopiedFormula for a formula cell, otherwise `value`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `displayRow` | `number` | display index |
| `columnIndex` | `number` | model column |
| `input` | `unknown` | the cell's input |
| `value` | `unknown` | the cell's value |

#### Returns

`unknown`

the copy

#### Defined in

[src/lib/table/sheet/table-sheet.ts:370](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L370)

___

### dependents

▸ **dependents**(`displayRow`, `columnIndex`): [`number`, `number`][]

The formula cells that read a cell directly (display row, model column; hidden rows left out).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `displayRow` | `number` | display index |
| `columnIndex` | `number` | model column |

#### Returns

[`number`, `number`][]

the dependents

#### Defined in

[src/lib/table/sheet/table-sheet.ts:406](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L406)

___

### destroy

▸ **destroy**(): `void`

Detaches the sheet from the body (table destroyed).

#### Returns

`void`

#### Defined in

[src/lib/table/sheet/table-sheet.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L97)

___

### displayRow

▸ **displayRow**(`physicalRow`): `number`

The display row of a physical row, `-1` if a filter hides it.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `physicalRow` | `number` | the row in `getAllRows()` / the array |

#### Returns

`number`

the display index

#### Defined in

[src/lib/table/sheet/table-sheet.ts:281](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L281)

___

### engineColumn

▸ **engineColumn**(`columnIndex`): `undefined` \| `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |

#### Returns

`undefined` \| `number`

the engine column (A = 0) of a model column

#### Defined in

[src/lib/table/sheet/table-sheet.ts:297](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L297)

___

### evaluate

▸ **evaluate**(`source`): `unknown`

Calculates a formula once against the sheet.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | `string` | the formula |

#### Returns

`unknown`

the result

#### Defined in

[src/lib/table/sheet/table-sheet.ts:206](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L206)

___

### inputAt

▸ **inputAt**(`row`, `col`): `unknown`

The input of a cell by physical row and engine column (also of a row a filter hides).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | physical row |
| `col` | `number` | engine column |

#### Returns

`unknown`

the input

#### Defined in

[src/lib/table/sheet/table-sheet.ts:218](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L218)

___

### isFormulaColumnIndex

▸ **isFormulaColumnIndex**(`columnIndex`): `boolean`

True if the column may hold formulas.

#### Parameters

| Name | Type |
| :------ | :------ |
| `columnIndex` | `number` |

#### Returns

`boolean`

#### Implementation of

[SheetCellsIf](../interfaces/SheetCellsIf.md).[isFormulaColumnIndex](../interfaces/SheetCellsIf.md#isformulacolumnindex)

#### Defined in

[src/lib/table/sheet/table-sheet.ts:118](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L118)

___

### isFormulaInput

▸ **isFormulaInput**(`columnIndex`, `value`): value is string

True if a written value is a formula: text with `=` in a formula column (it skips `editInputPipe` and `validate`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `columnIndex` | `number` | model column |
| `value` | `unknown` | the written value |

#### Returns

value is string

true for a formula

#### Defined in

[src/lib/table/sheet/table-sheet.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L132)

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

#### Implementation of

[SheetCellsIf](../interfaces/SheetCellsIf.md).[isFormulaProperty](../interfaces/SheetCellsIf.md#isformulaproperty)

#### Defined in

[src/lib/table/sheet/table-sheet.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L113)

___

### modelColumn

▸ **modelColumn**(`engineColumn`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `engineColumn` | `number` |

#### Returns

`number`

the model column of an engine column, `-1` if there is none

#### Defined in

[src/lib/table/sheet/table-sheet.ts:303](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L303)

___

### moveFormula

▸ **moveFormula**(`input`, `fromRow`, `fromCol`, `toDisplayRow`, `toColumnIndex`): `undefined` \| `string`

A formula moved from one cell to another (fill handle, paste): relative references move by the physical distance.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `string` | the formula (with `=`) |
| `fromRow` | `number` | physical row of the source |
| `fromCol` | `number` | engine column of the source |
| `toDisplayRow` | `number` | display row of the target |
| `toColumnIndex` | `number` | model column of the target |

#### Returns

`undefined` \| `string`

the moved formula, `undefined` if the target holds no formulas

#### Defined in

[src/lib/table/sheet/table-sheet.ts:354](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L354)

___

### physicalRow

▸ **physicalRow**(`displayRow`): `undefined` \| `number`

The physical row of a display row (`undefined` if there is none).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `displayRow` | `number` | display index |

#### Returns

`undefined` \| `number`

the row in `getAllRows()` / the array

#### Defined in

[src/lib/table/sheet/table-sheet.ts:268](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L268)

___

### precedents

▸ **precedents**(`displayRow`, `columnIndex`): `string`[]

The cells and ranges a formula reads, as addresses (`["B2", "C2", "D2:D4", "A:A"]`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `displayRow` | `number` | display index |
| `columnIndex` | `number` | model column |

#### Returns

`string`[]

the addresses (empty for a value cell)

#### Defined in

[src/lib/table/sheet/table-sheet.ts:387](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L387)

___

### recalculate

▸ **recalculate**(): `void`

Recalculates everything (data changed outside the table) – [TableApi.recalculate](TableApi.md#recalculate).

#### Returns

`void`

#### Defined in

[src/lib/table/sheet/table-sheet.ts:182](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L182)

___

### rowCount

▸ **rowCount**(): `number`

#### Returns

`number`

the number of physical rows

#### Defined in

[src/lib/table/sheet/table-sheet.ts:257](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L257)

___

### rowsArray

▸ **rowsArray**(): `undefined` \| `unknown`[]

#### Returns

`undefined` \| `unknown`[]

the rows array of an object or array body (not of a sheet)

#### Defined in

[src/lib/table/sheet/table-sheet.ts:252](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L252)

___

### syntaxError

▸ **syntaxError**(`input`): `undefined` \| `string`

The message of a syntax error of a formula, `undefined` if it parses.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `string` | the formula text (with `=`) |

#### Returns

`undefined` \| `string`

the message

#### Defined in

[src/lib/table/sheet/table-sheet.ts:142](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L142)

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

#### Implementation of

[SheetCellsIf](../interfaces/SheetCellsIf.md).[valueAt](../interfaces/SheetCellsIf.md#valueat)

#### Defined in

[src/lib/table/sheet/table-sheet.ts:105](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L105)

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

#### Implementation of

[SheetCellsIf](../interfaces/SheetCellsIf.md).[valueOfProperty](../interfaces/SheetCellsIf.md#valueofproperty)

#### Defined in

[src/lib/table/sheet/table-sheet.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L109)

___

### writeInput

▸ **writeInput**(`row`, `col`, `value`): `void`

Writes an input directly into the data (no events, no recalculation) – formulas adjusted after inserting or
deleting rows. `row` is a physical row or the row itself (object or array).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` \| `object` | physical row or row |
| `col` | `number` | engine column |
| `value` | `unknown` | the input |

#### Returns

`void`

#### Defined in

[src/lib/table/sheet/table-sheet.ts:230](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L230)

___

### create

▸ **create**(`tableModel`, `options`): `undefined` \| [`TableSheet`](TableSheet.md)

The cell formulas of a table model – `undefined` (with a warning) for a body that is not flat.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) | the model |
| `options` | [`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md) | complete options |

#### Returns

`undefined` \| [`TableSheet`](TableSheet.md)

the sheet, attached to the body

#### Defined in

[src/lib/table/sheet/table-sheet.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/table-sheet.ts#L83)
