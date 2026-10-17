[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FormulaRange

# Class: FormulaRange

A rectangle of cells passed to a function (`SUM(A1:B5)`): read lazily, row by row.

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](FormulaRange.md#constructor)

### Properties

- [col](FormulaRange.md#col)
- [cols](FormulaRange.md#cols)
- [row](FormulaRange.md#row)
- [rows](FormulaRange.md#rows)
- [type](FormulaRange.md#type)

### Methods

- [get](FormulaRange.md#get)
- [values](FormulaRange.md#values)

## Constructors

### constructor

• **new FormulaRange**(`row`, `col`, `rows`, `cols`, `read`): [`FormulaRange`](FormulaRange.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | first row (0-based) |
| `col` | `number` | first column |
| `rows` | `number` | number of rows (cut at the rows of the data) |
| `cols` | `number` | number of columns |
| `read` | (`row`: `number`, `col`: `number`) => [`SheetValue`](../modules.md#sheetvalue) | reads a cell (sheet coordinates) |

#### Returns

[`FormulaRange`](FormulaRange.md)

#### Defined in

[src/lib/table/sheet/sheet-values.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L126)

## Properties

### col

• `Readonly` **col**: `number`

first column

#### Defined in

[src/lib/table/sheet/sheet-values.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L126)

___

### cols

• `Readonly` **cols**: `number`

number of columns

#### Defined in

[src/lib/table/sheet/sheet-values.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L126)

___

### row

• `Readonly` **row**: `number`

first row (0-based)

#### Defined in

[src/lib/table/sheet/sheet-values.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L126)

___

### rows

• `Readonly` **rows**: `number`

number of rows (cut at the rows of the data)

#### Defined in

[src/lib/table/sheet/sheet-values.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L126)

___

### type

• `Readonly` **type**: ``"FormulaRange"``

Marker (works across copies of the core).

#### Defined in

[src/lib/table/sheet/sheet-values.ts:117](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L117)

## Methods

### get

▸ **get**(`r`, `c`): [`SheetValue`](../modules.md#sheetvalue)

The value at a position inside the range.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `r` | `number` | row inside the range (0-based) |
| `c` | `number` | column inside the range |

#### Returns

[`SheetValue`](../modules.md#sheetvalue)

the value (blank = `null`)

#### Defined in

[src/lib/table/sheet/sheet-values.ts:137](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L137)

___

### values

▸ **values**(): [`SheetValue`](../modules.md#sheetvalue)[]

#### Returns

[`SheetValue`](../modules.md#sheetvalue)[]

all values, row by row

#### Defined in

[src/lib/table/sheet/sheet-values.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-values.ts#L145)
