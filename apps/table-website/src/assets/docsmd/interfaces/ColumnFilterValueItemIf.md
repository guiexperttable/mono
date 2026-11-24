[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterValueItemIf

# Interface: ColumnFilterValueItemIf

One item in the distinct-values checklist of a column filter menu.

**`Since`**

1.1.114

## Table of contents

### Properties

- [count](ColumnFilterValueItemIf.md#count)
- [label](ColumnFilterValueItemIf.md#label)
- [value](ColumnFilterValueItemIf.md#value)

## Properties

### count

• `Optional` **count**: `number`

Optional number of matching rows for this value.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L18)

___

### label

• `Optional` **label**: `string`

Display label (defaults to the formatted value, or `(Blanks)` for blank values).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L16)

___

### value

• **value**: `unknown`

Raw cell value stored in [ColumnFilterIf.values](ColumnFilterIf.md#values).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L14)
