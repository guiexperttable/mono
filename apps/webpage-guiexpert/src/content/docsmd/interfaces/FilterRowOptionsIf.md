[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FilterRowOptionsIf

# Interface: FilterRowOptionsIf

Configuration of the persistent filter row below the column titles ([TableOptionsIf.filterRow](TableOptionsIf.md#filterrow)).

**`Example`**

```ts
const tableOptions: TableOptionsIf = {
  ...new TableOptions(),
  filterRow: { debounce: 150, height: 34, clearButtonVisible: true }
};
```

**`Since`**

1.1.114

## Implemented by

- [`FilterRowOptions`](../classes/FilterRowOptions.md)

## Table of contents

### Properties

- [clearButtonVisible](FilterRowOptionsIf.md#clearbuttonvisible)
- [debounce](FilterRowOptionsIf.md#debounce)
- [height](FilterRowOptionsIf.md#height)
- [minInputWidthInPx](FilterRowOptionsIf.md#mininputwidthinpx)
- [placeholder](FilterRowOptionsIf.md#placeholder)
- [visible](FilterRowOptionsIf.md#visible)

## Properties

### clearButtonVisible

• **clearButtonVisible**: `boolean`

Show a small clear (`×`) button when a column filter input is non-empty or active. Default `true`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:99](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L99)

___

### debounce

• **debounce**: `number`

Debounce delay in milliseconds while typing (`0` applies immediately). Default `200`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L93)

___

### height

• **height**: `number`

Height of the filter row in pixels. Default `34`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:97](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L97)

___

### minInputWidthInPx

• **minInputWidthInPx**: `number`

Below this column width (px) a compact button is shown instead of a cramped input. Default `44`.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L101)

___

### placeholder

• `Optional` **placeholder**: `string`

Placeholder shown in filter inputs (defaults to `columnFilterTexts.searchPlaceholder`).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:95](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L95)

___

### visible

• **visible**: `boolean`

Initial visibility of the filter row. Default `true` once `filterRow` is enabled.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L91)
