[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterValuesContextIf

# Interface: ColumnFilterValuesContextIf

Context passed to [ColumnFilterColumnOptionsIf.getValues](ColumnFilterColumnOptionsIf.md#getvalues) when a filter menu requests its distinct values.

**`Since`**

1.1.114

## Table of contents

### Properties

- [columnDef](ColumnFilterValuesContextIf.md#columndef)
- [columnIndex](ColumnFilterValuesContextIf.md#columnindex)
- [maxValues](ColumnFilterValuesContextIf.md#maxvalues)
- [otherFilters](ColumnFilterValuesContextIf.md#otherfilters)
- [property](ColumnFilterValuesContextIf.md#property)
- [search](ColumnFilterValuesContextIf.md#search)

## Properties

### columnDef

• **columnDef**: `undefined` \| [`ColumnDefIf`](ColumnDefIf.md)

Column definition, if any.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L31)

___

### columnIndex

• **columnIndex**: `number`

Model column index.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L29)

___

### maxValues

• **maxValues**: `number`

Configured maximum number of distinct values.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L37)

___

### otherFilters

• **otherFilters**: [`ColumnFiltersMap`](../modules.md#columnfiltersmap)

Active filters of all other columns.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L39)

___

### property

• **property**: `string`

Column property (or `"#<index>"`).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L33)

___

### search

• **search**: `string`

Current search text entered in the filter menu.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L35)
