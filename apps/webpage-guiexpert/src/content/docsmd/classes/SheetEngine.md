[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SheetEngine

# Class: SheetEngine

The spreadsheet engine of cell formulas (DOM-free): compiles the formula texts of the data (`"=SUM(D2:D4)"`), keeps a
dependency graph (single cells and range nodes) and recalculates **only the dependent cells** after a change – in
topological order (Kahn), cycles (Tarjan) become `#CIRC!`. No `eval`, no `new Function`. Volatile functions (`TODAY`,
`NOW`, `RAND`, `RANDBETWEEN`) are recomputed on every recalculation.

**`Example`**

```ts
const engine = SheetEngine.fromArrays([
  ["Laptop", 1299, 2, "=B1*C1"],
  ["Mouse", 25, 10, "=B2*C2"],
  [null, null, null, "=SUM(D1:D2)"],
]);
engine.getValue(2, 3);   // 2848
```

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](SheetEngine.md#constructor)

### Properties

- [options](SheetEngine.md#options)

### Methods

- [adjustForStructureChange](SheetEngine.md#adjustforstructurechange)
- [evaluate](SheetEngine.md#evaluate)
- [getDependents](SheetEngine.md#getdependents)
- [getFormulaCount](SheetEngine.md#getformulacount)
- [getPrecedents](SheetEngine.md#getprecedents)
- [getValue](SheetEngine.md#getvalue)
- [inputsChanged](SheetEngine.md#inputschanged)
- [isFormula](SheetEngine.md#isformula)
- [rebuild](SheetEngine.md#rebuild)
- [recalculate](SheetEngine.md#recalculate)
- [fromArrays](SheetEngine.md#fromarrays)

## Constructors

### constructor

• **new SheetEngine**(`source`, `options?`): [`SheetEngine`](SheetEngine.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | [`SheetDataSourceIf`](../interfaces/SheetDataSourceIf.md) | the data |
| `options?` | `Partial`\<[`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md)\> & \{ `now?`: () => `Date` ; `random?`: () => `number`  } | own functions and limits; `now`/`random` for tests |

#### Returns

[`SheetEngine`](SheetEngine.md)

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L126)

## Properties

### options

• `Readonly` **options**: [`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md)

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:109](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L109)

## Methods

### adjustForStructureChange

▸ **adjustForStructureChange**(`edit`): \{ `col`: `number` ; `input`: `string` ; `row`: `number`  }[]

The new formula texts after rows or columns were inserted or deleted (or cells moved) – the caller writes them
(the engine only reads the data). Cells are given at their position **after** the edit.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `edit` | [`SheetStructureEditIf`](../modules.md#sheetstructureeditif) | what changed |

#### Returns

\{ `col`: `number` ; `input`: `string` ; `row`: `number`  }[]

changed formula texts

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:322](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L322)

___

### evaluate

▸ **evaluate**(`source`, `at?`): `unknown`

Evaluates a formula once (not stored), e.g. for a formula bar preview.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `source` | `string` | the formula (`"=SUM(D2:D4)"`, the `=` is optional) |
| `at?` | readonly [`number`, `number`] | the cell it is evaluated in (for `[field]`) |

#### Returns

`unknown`

the result

**`Example`**

```ts
engine.evaluate("=SUM(D2:D4)");   // 3895
```

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:282](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L282)

___

### getDependents

▸ **getDependents**(`row`, `col`): [`number`, `number`][]

The formula cells that read a cell directly.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | physical row |
| `col` | `number` | column |

#### Returns

[`number`, `number`][]

row and column of each dependent

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:309](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L309)

___

### getFormulaCount

▸ **getFormulaCount**(): `number`

#### Returns

`number`

the number of formula cells

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:268](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L268)

___

### getPrecedents

▸ **getPrecedents**(`row`, `col`): [`CellRange`](CellRange.md)[]

The cells and ranges a formula reads.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | physical row |
| `col` | `number` | column |

#### Returns

[`CellRange`](CellRange.md)[]

its precedents (empty for a value cell)

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:294](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L294)

___

### getValue

▸ **getValue**(`row`, `col`): `unknown`

The value of a cell: the result of its formula or its data value (`Date` for dates, a [FormulaError](FormulaError.md) for an
error, `'=…` without the quote).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | physical row (0-based) |
| `col` | `number` | column (0-based) |

#### Returns

`unknown`

the value

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:252](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L252)

___

### inputsChanged

▸ **inputsChanged**(`cells`): [`SheetRecalcResultIf`](../interfaces/SheetRecalcResultIf.md)

The inputs of cells changed (written by the table): formulas are compiled again, the dependent cells recalculated.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | readonly readonly [`number`, `number`][] | physical row and column of each changed cell |

#### Returns

[`SheetRecalcResultIf`](../interfaces/SheetRecalcResultIf.md)

what was recalculated

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:212](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L212)

___

### isFormula

▸ **isFormula**(`row`, `col`): `boolean`

True if the cell holds a formula.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row` | `number` | physical row |
| `col` | `number` | column |

#### Returns

`boolean`

true for a formula cell

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:263](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L263)

___

### rebuild

▸ **rebuild**(): [`SheetRecalcResultIf`](../interfaces/SheetRecalcResultIf.md)

Reads all inputs again and calculates every formula (start, `setRows`, other columns).

#### Returns

[`SheetRecalcResultIf`](../interfaces/SheetRecalcResultIf.md)

what was calculated

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:171](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L171)

___

### recalculate

▸ **recalculate**(): [`SheetRecalcResultIf`](../interfaces/SheetRecalcResultIf.md)

Recalculates the volatile formulas (`TODAY`, `NOW`, `RAND`) and their dependents.

#### Returns

[`SheetRecalcResultIf`](../interfaces/SheetRecalcResultIf.md)

what was recalculated

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:240](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L240)

___

### fromArrays

▸ **fromArrays**(`data`, `options?`): [`SheetEngine`](SheetEngine.md)

An engine over a 2-D array (rows of cells) – without a table.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `data` | `unknown`[][] | the cells; formula texts start with `=` |
| `options?` | `Partial`\<[`CellFormulaOptionsIf`](../interfaces/CellFormulaOptionsIf.md)\> | own functions and limits |

#### Returns

[`SheetEngine`](SheetEngine.md)

the engine, already calculated

**`Example`**

```ts
SheetEngine.fromArrays([[1, 2, "=A1+B1"]]).getValue(0, 2);   // 3
```

#### Defined in

[src/lib/table/sheet/sheet-engine.ts:156](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/sheet-engine.ts#L156)
