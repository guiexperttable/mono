[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CompiledFormula

# Interface: CompiledFormula

A formula compiled once ([compileFormula](../modules.md#compileformula)): the AST, the referenced fields and `evaluate()` for a row.
A formula with a syntax error or an unknown function has `error` set; `evaluate()` then always returns it.

**`Example`**

```ts
const f = compileFormula("[price] * [quantity] * 1.19");
f.fields;                                    // ["price", "quantity"]
f.evaluate({ price: 1299, quantity: 2 });    // 3091.62
```

**`Since`**

1.1.95

## Table of contents

### Properties

- [ast](CompiledFormula.md#ast)
- [error](CompiledFormula.md#error)
- [fields](CompiledFormula.md#fields)
- [source](CompiledFormula.md#source)
- [usesAggregates](CompiledFormula.md#usesaggregates)

### Methods

- [evaluate](CompiledFormula.md#evaluate)

## Properties

### ast

• `Optional` `Readonly` **ast**: [`FormulaNode`](../modules.md#formulanode)

The syntax tree; `undefined` if the formula has an error.

#### Defined in

[src/lib/table/formula/compile-formula.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/compile-formula.ts#L39)

___

### error

• `Optional` `Readonly` **error**: [`FormulaError`](../classes/FormulaError.md)

The error of the formula itself (`#ERROR!`, `#NAME?` for an unknown function); `undefined` if it is valid.

#### Defined in

[src/lib/table/formula/compile-formula.ts:41](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/compile-formula.ts#L41)

___

### fields

• `Readonly` **fields**: readonly `string`[]

The referenced fields (`[price]` → `"price"`), each once, in order of appearance.

#### Defined in

[src/lib/table/formula/compile-formula.ts:43](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/compile-formula.ts#L43)

___

### source

• `Readonly` **source**: `string`

The formula text as given.

#### Defined in

[src/lib/table/formula/compile-formula.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/compile-formula.ts#L37)

___

### usesAggregates

• `Readonly` **usesAggregates**: `boolean`

True if the formula uses a column aggregate (`SUM([total])` …).

#### Defined in

[src/lib/table/formula/compile-formula.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/compile-formula.ts#L45)

## Methods

### evaluate

▸ **evaluate**(`row`, `context?`): [`FormulaValue`](../modules.md#formulavalue)

Evaluates the formula for a row. Never throws: errors are returned as [FormulaError](../classes/FormulaError.md).
Without a context, column aggregates (`SUM([x])`) return `#VALUE!`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `unknown` |
| `context?` | [`ValueGetterContextIf`](ValueGetterContextIf.md) |

#### Returns

[`FormulaValue`](../modules.md#formulavalue)

#### Defined in

[src/lib/table/formula/compile-formula.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/compile-formula.ts#L50)
