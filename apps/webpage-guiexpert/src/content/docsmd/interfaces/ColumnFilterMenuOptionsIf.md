[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterMenuOptionsIf

# Interface: ColumnFilterMenuOptionsIf

Configuration of the per-column filter menu popup ([TableOptionsIf.columnFilterMenu](TableOptionsIf.md#columnfiltermenu)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  columnFilterMenu: { showCondition: true, showValues: true, applyOnChange: false, maxValues: 10_000 }
};
```

**`Since`**

1.1.114

## Implemented by

- [`ColumnFilterMenuOptions`](../classes/ColumnFilterMenuOptions.md)

## Table of contents

### Properties

- [applyOnChange](ColumnFilterMenuOptionsIf.md#applyonchange)
- [maxValues](ColumnFilterMenuOptionsIf.md#maxvalues)
- [showCondition](ColumnFilterMenuOptionsIf.md#showcondition)
- [showValues](ColumnFilterMenuOptionsIf.md#showvalues)

## Properties

### applyOnChange

• **applyOnChange**: `boolean`

Apply changes immediately instead of waiting for the OK button. Default `false`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L122)

___

### maxValues

• **maxValues**: `number`

Maximum distinct values collected for the checklist (defaults to `columnFilter.maxValues`, `10_000`).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L124)

___

### showCondition

• **showCondition**: `boolean`

Show the operator selector and condition input(s). Default `true`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:118](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L118)

___

### showValues

• **showValues**: `boolean`

Show the searchable distinct-values checkbox list. Default `true`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L120)
