[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterIf

# Interface: ColumnFilterIf

Filter state of one column ([TableApi.setColumnFilter](../classes/TableApi.md#setcolumnfilter), [TableStateIf.filters](TableStateIf.md#filters)).
When both `condition` and `values` are present, a row must satisfy both (AND).

**`Example`**

```ts
const filter: ColumnFilterIf = {
  condition: { operator: "greaterThan", value: 40 }
};
```

**`Since`**

1.1.114

## Table of contents

### Properties

- [condition](ColumnFilterIf.md#condition)
- [values](ColumnFilterIf.md#values)

## Properties

### condition

• `Optional` **condition**: [`ColumnFilterConditionIf`](ColumnFilterConditionIf.md)

Comparison condition from the filter row, the filter menu, or the API.

#### Defined in

[src/lib/table/column-filter/column-filter.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter.if.ts#L35)

___

### values

• `Optional` **values**: `unknown`[]

Allowed distinct values (set filter): omitted = all values allowed, `[]` = matches no rows.

#### Defined in

[src/lib/table/column-filter/column-filter.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter.if.ts#L37)
