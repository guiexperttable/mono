[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SpreadsheetParamIf

# Interface: SpreadsheetParamIf

The parameters of [SpreadsheetFactory.create](../classes/SpreadsheetFactory.md#create). All optional.

**`Since`**

1.1.99

## Table of contents

### Properties

- [columnCount](SpreadsheetParamIf.md#columncount)
- [columnWidth](SpreadsheetParamIf.md#columnwidth)
- [data](SpreadsheetParamIf.md#data)
- [functions](SpreadsheetParamIf.md#functions)
- [locale](SpreadsheetParamIf.md#locale)
- [rowCount](SpreadsheetParamIf.md#rowcount)
- [rowHeight](SpreadsheetParamIf.md#rowheight)
- [rowNumbers](SpreadsheetParamIf.md#rownumbers)
- [tableOptions](SpreadsheetParamIf.md#tableoptions)

## Properties

### columnCount

• **columnCount**: `number`

Columns of the sheet. Default `max(longest row, 26)` (A–Z).

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L32)

___

### columnWidth

• **columnWidth**: `number`

Width of a column in px. Default 100.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L34)

___

### data

• **data**: `unknown`[][]

Rows × columns of inputs; formulas as `"=…"`. Default: empty.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L28)

___

### functions

• **functions**: `Record`\<`string`, [`FormulaFunction`](../modules.md#formulafunction)\>

Own functions of the cell formulas.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L42)

___

### locale

• **locale**: `string`

The locale of typed and pasted values (`sheetInputPipe`): `"1,5"` is 1.5 in `"de-DE"`. Default: the browser's
locale. Formulas always use `.` and English function names.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L47)

___

### rowCount

• **rowCount**: `number`

Rows of the sheet. Default `max(data.length, 100)`.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L30)

___

### rowHeight

• **rowHeight**: `number`

Height of a row in px. Default 30.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:36](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L36)

___

### rowNumbers

• **rowNumbers**: `boolean`

Row numbers in front (they count the rows of the sheet, also when sorted). Default `true`.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L38)

___

### tableOptions

• **tableOptions**: `Partial`\<[`TableOptionsIf`](TableOptionsIf.md)\>

Merged over the options of the factory (selection, focus, the spreadsheet preset).

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L40)
