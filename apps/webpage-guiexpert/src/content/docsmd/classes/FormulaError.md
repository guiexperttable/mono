[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FormulaError

# Class: FormulaError

An error value of a formula. Formulas never throw: a cell shows the [FormulaErrorCode](../modules.md#formulaerrorcode) (`toString()`), the
table adds the CSS class `ge-table-cell-error` and shows the message as tooltip. Errors propagate through
operators and functions (`[a] / 0 + 1` → `#DIV/0!`), `IFERROR(x, fallback)` catches them, aggregators skip them.

**`Example`**

```ts
const result = compileFormula("[price] / [quantity]").evaluate({ price: 10, quantity: 0 });
if (isFormulaError(result)) {
  console.log(result.code, result.message);   // "#DIV/0!" "Division by zero"
}
```

**`Since`**

1.1.95

## Table of contents

### Constructors

- [constructor](FormulaError.md#constructor)

### Properties

- [code](FormulaError.md#code)
- [message](FormulaError.md#message)
- [position](FormulaError.md#position)
- [type](FormulaError.md#type)

### Methods

- [toString](FormulaError.md#tostring)

## Constructors

### constructor

• **new FormulaError**(`code`, `message`, `position?`): [`FormulaError`](FormulaError.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `code` | [`FormulaErrorCode`](../modules.md#formulaerrorcode) | the code shown in the cell |
| `message` | `string` | a short English explanation (tooltip); never contains HTML |
| `position?` | `number` | for syntax errors: the position in the formula text (0-based) |

#### Returns

[`FormulaError`](FormulaError.md)

#### Defined in

[src/lib/table/formula/formula-error.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-error.ts#L42)

## Properties

### code

• `Readonly` **code**: [`FormulaErrorCode`](../modules.md#formulaerrorcode)

the code shown in the cell

#### Defined in

[src/lib/table/formula/formula-error.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-error.ts#L43)

___

### message

• `Readonly` **message**: `string`

a short English explanation (tooltip); never contains HTML

#### Defined in

[src/lib/table/formula/formula-error.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-error.ts#L44)

___

### position

• `Optional` `Readonly` **position**: `number`

for syntax errors: the position in the formula text (0-based)

#### Defined in

[src/lib/table/formula/formula-error.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-error.ts#L45)

___

### type

• `Readonly` **type**: ``"FormulaError"``

Marker (works across copies of the core): [isFormulaError](../modules.md#isformulaerror).

#### Defined in

[src/lib/table/formula/formula-error.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-error.ts#L35)

## Methods

### toString

▸ **toString**(): `string`

The code, e.g. `"#DIV/0!"` – what a cell shows.

#### Returns

`string`

#### Defined in

[src/lib/table/formula/formula-error.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-error.ts#L50)
