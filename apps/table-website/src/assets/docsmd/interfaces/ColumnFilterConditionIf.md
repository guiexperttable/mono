[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterConditionIf

# Interface: ColumnFilterConditionIf

A single comparison condition of a [ColumnFilterIf](ColumnFilterIf.md).

**`Example`**

```ts
const cond: ColumnFilterConditionIf = { operator: "between", value: 10, valueTo: 50 };
```

**`Since`**

1.1.114

## Table of contents

### Properties

- [operator](ColumnFilterConditionIf.md#operator)
- [value](ColumnFilterConditionIf.md#value)
- [valueTo](ColumnFilterConditionIf.md#valueto)

## Properties

### operator

• **operator**: [`ColumnFilterOperator`](../modules.md#columnfilteroperator)

Comparison operator.

#### Defined in

[src/lib/table/column-filter/column-filter.if.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter.if.ts#L14)

___

### value

• `Optional` **value**: `unknown`

Value to compare against (omitted for `"blank"` and `"notBlank"`). Dates accept `Date` or ISO text `"YYYY-MM-DD"`.

#### Defined in

[src/lib/table/column-filter/column-filter.if.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter.if.ts#L16)

___

### valueTo

• `Optional` **valueTo**: `unknown`

Upper bound for `"between"` (inclusive; swapped bounds are normalized).

#### Defined in

[src/lib/table/column-filter/column-filter.if.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter.if.ts#L18)
