[GuiExpert Table API](../README.md) / [Exports](../modules.md) / FilterRowOptions

# Class: FilterRowOptions

Default options of the persistent filter row ([TableOptionsIf.filterRow](../interfaces/TableOptionsIf.md#filterrow)).

**`Example`**

```ts
const opts = FilterRowOptions.create({ debounce: 100 });
```

**`Since`**

1.1.114

## Implements

- [`FilterRowOptionsIf`](../interfaces/FilterRowOptionsIf.md)

## Table of contents

### Constructors

- [constructor](FilterRowOptions.md#constructor)

### Properties

- [clearButtonVisible](FilterRowOptions.md#clearbuttonvisible)
- [debounce](FilterRowOptions.md#debounce)
- [height](FilterRowOptions.md#height)
- [minInputWidthInPx](FilterRowOptions.md#mininputwidthinpx)
- [placeholder](FilterRowOptions.md#placeholder)
- [visible](FilterRowOptions.md#visible)

### Methods

- [create](FilterRowOptions.md#create)

## Constructors

### constructor

• **new FilterRowOptions**(): [`FilterRowOptions`](FilterRowOptions.md)

#### Returns

[`FilterRowOptions`](FilterRowOptions.md)

## Properties

### clearButtonVisible

• **clearButtonVisible**: `boolean` = `true`

Show a small clear (`×`) button when a column filter input is non-empty or active. Default `true`.

#### Implementation of

[FilterRowOptionsIf](../interfaces/FilterRowOptionsIf.md).[clearButtonVisible](../interfaces/FilterRowOptionsIf.md#clearbuttonvisible)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L59)

___

### debounce

• **debounce**: `number` = `200`

Debounce delay in milliseconds while typing (`0` applies immediately). Default `200`.

#### Implementation of

[FilterRowOptionsIf](../interfaces/FilterRowOptionsIf.md).[debounce](../interfaces/FilterRowOptionsIf.md#debounce)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L56)

___

### height

• **height**: `number` = `34`

Height of the filter row in pixels. Default `34`.

#### Implementation of

[FilterRowOptionsIf](../interfaces/FilterRowOptionsIf.md).[height](../interfaces/FilterRowOptionsIf.md#height)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L58)

___

### minInputWidthInPx

• **minInputWidthInPx**: `number` = `44`

Below this column width (px) a compact button is shown instead of a cramped input. Default `44`.

#### Implementation of

[FilterRowOptionsIf](../interfaces/FilterRowOptionsIf.md).[minInputWidthInPx](../interfaces/FilterRowOptionsIf.md#mininputwidthinpx)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L60)

___

### placeholder

• `Optional` **placeholder**: `string` = `undefined`

Placeholder shown in filter inputs (defaults to `columnFilterTexts.searchPlaceholder`).

#### Implementation of

[FilterRowOptionsIf](../interfaces/FilterRowOptionsIf.md).[placeholder](../interfaces/FilterRowOptionsIf.md#placeholder)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L57)

___

### visible

• **visible**: `boolean` = `true`

Initial visibility of the filter row. Default `true` once `filterRow` is enabled.

#### Implementation of

[FilterRowOptionsIf](../interfaces/FilterRowOptionsIf.md).[visible](../interfaces/FilterRowOptionsIf.md#visible)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L55)

## Methods

### create

▸ **create**(`option?`): `undefined` \| [`FilterRowOptionsIf`](../interfaces/FilterRowOptionsIf.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `option?` | `boolean` \| `Partial`\<[`FilterRowOptionsIf`](../interfaces/FilterRowOptionsIf.md)\> |

#### Returns

`undefined` \| [`FilterRowOptionsIf`](../interfaces/FilterRowOptionsIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L62)
