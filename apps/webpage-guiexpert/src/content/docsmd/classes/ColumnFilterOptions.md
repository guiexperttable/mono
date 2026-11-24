[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterOptions

# Class: ColumnFilterOptions

Default global options of [TableOptionsIf.columnFilter](../interfaces/TableOptionsIf.md#columnfilter).

**`Example`**

```ts
const opts = ColumnFilterOptions.create({ caseSensitive: true });
```

**`Since`**

1.1.114

## Implements

- [`ColumnFilterOptionsIf`](../interfaces/ColumnFilterOptionsIf.md)

## Table of contents

### Constructors

- [constructor](ColumnFilterOptions.md#constructor)

### Properties

- [caseSensitive](ColumnFilterOptions.md#casesensitive)
- [locale](ColumnFilterOptions.md#locale)
- [managed](ColumnFilterOptions.md#managed)
- [maxValues](ColumnFilterOptions.md#maxvalues)

### Methods

- [create](ColumnFilterOptions.md#create)

## Constructors

### constructor

• **new ColumnFilterOptions**(): [`ColumnFilterOptions`](ColumnFilterOptions.md)

#### Returns

[`ColumnFilterOptions`](ColumnFilterOptions.md)

## Properties

### caseSensitive

• **caseSensitive**: `boolean` = `false`

Case-sensitive text comparisons. Default `false`.

#### Implementation of

[ColumnFilterOptionsIf](../interfaces/ColumnFilterOptionsIf.md).[caseSensitive](../interfaces/ColumnFilterOptionsIf.md#casesensitive)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:92](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L92)

___

### locale

• `Optional` **locale**: `string` = `undefined`

BCP 47 locale used when parsing numbers and dates from filter input (default: browser locale).

#### Implementation of

[ColumnFilterOptionsIf](../interfaces/ColumnFilterOptionsIf.md).[locale](../interfaces/ColumnFilterOptionsIf.md#locale)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L93)

___

### managed

• **managed**: `boolean` = `true`

`true` (default): the table filters the body rows itself.
`false`: the table only keeps the filter state, updates its UI and fires [EventListenerIf.onFilterChanged](../interfaces/EventListenerIf.md#onfilterchanged)
(for server-side filtering).

#### Implementation of

[ColumnFilterOptionsIf](../interfaces/ColumnFilterOptionsIf.md).[managed](../interfaces/ColumnFilterOptionsIf.md#managed)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L91)

___

### maxValues

• **maxValues**: `number` = `10_000`

Maximum distinct values collected for a column filter menu. Default `10_000`.

#### Implementation of

[ColumnFilterOptionsIf](../interfaces/ColumnFilterOptionsIf.md).[maxValues](../interfaces/ColumnFilterOptionsIf.md#maxvalues)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:94](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L94)

## Methods

### create

▸ **create**(`partial?`): [`ColumnFilterOptionsIf`](../interfaces/ColumnFilterOptionsIf.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `partial?` | `Partial`\<[`ColumnFilterOptionsIf`](../interfaces/ColumnFilterOptionsIf.md)\> |

#### Returns

[`ColumnFilterOptionsIf`](../interfaces/ColumnFilterOptionsIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L96)
