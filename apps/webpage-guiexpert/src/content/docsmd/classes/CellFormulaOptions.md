[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CellFormulaOptions

# Class: CellFormulaOptions

The defaults of [CellFormulaOptionsIf](../interfaces/CellFormulaOptionsIf.md) (cell formulas).

**`Example`**

```ts
CellFormulaOptions.create(true)?.maxRangeCells;   // 10000000
```

**`Since`**

1.1.99

## Implements

- [`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md)

## Table of contents

### Constructors

- [constructor](CellFormulaOptions.md#constructor)

### Properties

- [columns](CellFormulaOptions.md#columns)
- [functions](CellFormulaOptions.md#functions)
- [isoDatesAsDates](CellFormulaOptions.md#isodatesasdates)
- [maxRangeCells](CellFormulaOptions.md#maxrangecells)
- [rejectInvalidFormulas](CellFormulaOptions.md#rejectinvalidformulas)

### Methods

- [create](CellFormulaOptions.md#create)

## Constructors

### constructor

• **new CellFormulaOptions**(): [`CellFormulaOptions`](CellFormulaOptions.md)

#### Returns

[`CellFormulaOptions`](CellFormulaOptions.md)

## Properties

### columns

• `Optional` **columns**: `string`[] = `undefined`

Only these properties hold formulas (the other columns keep `=…` as text). Default: every data column.

#### Implementation of

[CellFormulaOptionsIf](../interfaces/CellFormulaOptionsIf.md).[columns](../interfaces/CellFormulaOptionsIf.md#columns)

#### Defined in

[src/lib/table/sheet/cell-formula-options.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.ts#L18)

___

### functions

• **functions**: `Record`\<`string`, [`FormulaFunction`](../modules.md#formulafunction)\> = `{}`

Own functions by name (case-insensitive); they may replace built-in ones. A range argument (`A1:B5`) arrives as
[FormulaRange](FormulaRange.md), a date as its serial number.

#### Implementation of

[CellFormulaOptionsIf](../interfaces/CellFormulaOptionsIf.md).[functions](../interfaces/CellFormulaOptionsIf.md#functions)

#### Defined in

[src/lib/table/sheet/cell-formula-options.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.ts#L14)

___

### isoDatesAsDates

• **isoDatesAsDates**: `boolean` = `true`

ISO text (`"2026-10-16"`) counts as date in arithmetic (`=A2+1`) and date functions. Default `true`.

#### Implementation of

[CellFormulaOptionsIf](../interfaces/CellFormulaOptionsIf.md).[isoDatesAsDates](../interfaces/CellFormulaOptionsIf.md#isodatesasdates)

#### Defined in

[src/lib/table/sheet/cell-formula-options.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.ts#L15)

___

### maxRangeCells

• **maxRangeCells**: `number` = `10_000_000`

Larger ranges are `#ERROR!` (`A1:XFD1048576`). Default `10_000_000`.

#### Implementation of

[CellFormulaOptionsIf](../interfaces/CellFormulaOptionsIf.md).[maxRangeCells](../interfaces/CellFormulaOptionsIf.md#maxrangecells)

#### Defined in

[src/lib/table/sheet/cell-formula-options.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.ts#L16)

___

### rejectInvalidFormulas

• **rejectInvalidFormulas**: `boolean` = `false`

The table refuses formulas with a syntax error instead of storing them (`#ERROR!`). Default `false`.

#### Implementation of

[CellFormulaOptionsIf](../interfaces/CellFormulaOptionsIf.md).[rejectInvalidFormulas](../interfaces/CellFormulaOptionsIf.md#rejectinvalidformulas)

#### Defined in

[src/lib/table/sheet/cell-formula-options.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.ts#L17)

## Methods

### create

▸ **create**(`option?`): `undefined` \| [`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md)

The options of [TableOptionsIf.cellFormulas](../interfaces/TableOptionsIf.md#cellformulas): `undefined`/`false` = off, `true` = the defaults, an object =
the defaults overridden by its values (`undefined` keeps the default).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `option?` | `boolean` \| `Partial`\<[`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md)\> | the option |

#### Returns

`undefined` \| [`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md)

complete options, `undefined` if off

#### Defined in

[src/lib/table/sheet/cell-formula-options.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-formula-options.ts#L27)
