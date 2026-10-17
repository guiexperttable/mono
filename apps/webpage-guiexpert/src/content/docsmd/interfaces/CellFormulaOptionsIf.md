[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellFormulaOptionsIf

# Interface: CellFormulaOptionsIf

Cell formulas like in Excel ([TableOptionsIf.cellFormulas](TableOptionsIf.md#cellformulas), [SheetEngine](../classes/SheetEngine.md)): `=B2*C2`, `=SUM(D2:D100)`.
`cellFormulas: true` uses the defaults of [CellFormulaOptions](../classes/CellFormulaOptions.md); an object overrides single values.

**`Example`**

```ts
const engine = SheetEngine.fromArrays(data, { functions: { VAT: (net) => Number(net) * 0.19 } });
```

**`Since`**

1.1.99

## Implemented by

- [`CellFormulaOptions`](../classes/CellFormulaOptions.md)

## Table of contents

### Properties

- [columns](CellFormulaOptionsIf.md#columns)
- [functions](CellFormulaOptionsIf.md#functions)
- [isoDatesAsDates](CellFormulaOptionsIf.md#isodatesasdates)
- [maxRangeCells](CellFormulaOptionsIf.md#maxrangecells)
- [rejectInvalidFormulas](CellFormulaOptionsIf.md#rejectinvalidformulas)

## Properties

### columns

• `Optional` **columns**: `string`[]

Only these properties hold formulas (the other columns keep `=…` as text). Default: every data column.

#### Defined in

[src/lib/table/sheet/cell-formula-options.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.if.ts#L26)

___

### functions

• **functions**: `Record`\<`string`, [`FormulaFunction`](../modules.md#formulafunction)\>

Own functions by name (case-insensitive); they may replace built-in ones. A range argument (`A1:B5`) arrives as
[FormulaRange](../classes/FormulaRange.md), a date as its serial number.

#### Defined in

[src/lib/table/sheet/cell-formula-options.if.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.if.ts#L18)

___

### isoDatesAsDates

• **isoDatesAsDates**: `boolean`

ISO text (`"2026-10-16"`) counts as date in arithmetic (`=A2+1`) and date functions. Default `true`.

#### Defined in

[src/lib/table/sheet/cell-formula-options.if.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.if.ts#L20)

___

### maxRangeCells

• **maxRangeCells**: `number`

Larger ranges are `#ERROR!` (`A1:XFD1048576`). Default `10_000_000`.

#### Defined in

[src/lib/table/sheet/cell-formula-options.if.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.if.ts#L22)

___

### rejectInvalidFormulas

• **rejectInvalidFormulas**: `boolean`

The table refuses formulas with a syntax error instead of storing them (`#ERROR!`). Default `false`.

#### Defined in

[src/lib/table/sheet/cell-formula-options.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.if.ts#L24)
