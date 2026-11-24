[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterOptionsIf

# Interface: ColumnFilterOptionsIf

Global options for built-in column filtering ([TableOptionsIf.columnFilter](TableOptionsIf.md#columnfilter)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  columnFilter: { managed: false } // server-side filtering via onFilterChanged
};
```

**`Since`**

1.1.114

## Implemented by

- [`ColumnFilterOptions`](../classes/ColumnFilterOptions.md)

## Table of contents

### Properties

- [caseSensitive](ColumnFilterOptionsIf.md#casesensitive)
- [locale](ColumnFilterOptionsIf.md#locale)
- [managed](ColumnFilterOptionsIf.md#managed)
- [maxValues](ColumnFilterOptionsIf.md#maxvalues)

## Properties

### caseSensitive

• **caseSensitive**: `boolean`

Case-sensitive text comparisons. Default `false`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:147](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L147)

___

### locale

• `Optional` **locale**: `string`

BCP 47 locale used when parsing numbers and dates from filter input (default: browser locale).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:149](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L149)

___

### managed

• **managed**: `boolean`

`true` (default): the table filters the body rows itself.
`false`: the table only keeps the filter state, updates its UI and fires [EventListenerIf.onFilterChanged](EventListenerIf.md#onfilterchanged)
(for server-side filtering).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:145](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L145)

___

### maxValues

• **maxValues**: `number`

Maximum distinct values collected for a column filter menu. Default `10_000`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:151](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L151)
