[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FormulaOptionsIf

# Interface: FormulaOptionsIf

Options of [compileFormula](../modules.md#compileformula).

**`Example`**

```ts
const options: FormulaOptionsIf = {
  functions: { NET: (gross) => Number(gross) / 1.19 }
};
ColumnDef.create({ property: "net", headerLabel: "Net", formula: "NET([gross])", formulaOptions: options });
```

**`Since`**

1.1.95

## Table of contents

### Properties

- [functions](FormulaOptionsIf.md#functions)

## Properties

### functions

• `Optional` **functions**: `Record`\<`string`, [`FormulaFunction`](../modules.md#formulafunction)\>

Own functions by name (case-insensitive). They may replace built-in ones.

#### Defined in

[src/lib/table/formula/formula-options.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/formula/formula-options.if.ts#L42)
