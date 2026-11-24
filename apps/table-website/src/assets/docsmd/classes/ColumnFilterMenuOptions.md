[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterMenuOptions

# Class: ColumnFilterMenuOptions

Default options of the per-column filter menu ([TableOptionsIf.columnFilterMenu](../interfaces/TableOptionsIf.md#columnfiltermenu)).

**`Example`**

```ts
const opts = ColumnFilterMenuOptions.create({ applyOnChange: true });
```

**`Since`**

1.1.114

## Implements

- [`ColumnFilterMenuOptionsIf`](../interfaces/ColumnFilterMenuOptionsIf.md)

## Table of contents

### Constructors

- [constructor](ColumnFilterMenuOptions.md#constructor)

### Properties

- [applyOnChange](ColumnFilterMenuOptions.md#applyonchange)
- [maxValues](ColumnFilterMenuOptions.md#maxvalues)
- [showCondition](ColumnFilterMenuOptions.md#showcondition)
- [showValues](ColumnFilterMenuOptions.md#showvalues)

### Methods

- [create](ColumnFilterMenuOptions.md#create)

## Constructors

### constructor

• **new ColumnFilterMenuOptions**(): [`ColumnFilterMenuOptions`](ColumnFilterMenuOptions.md)

#### Returns

[`ColumnFilterMenuOptions`](ColumnFilterMenuOptions.md)

## Properties

### applyOnChange

• **applyOnChange**: `boolean` = `false`

Apply changes immediately instead of waiting for the OK button. Default `false`.

#### Implementation of

[ColumnFilterMenuOptionsIf](../interfaces/ColumnFilterMenuOptionsIf.md).[applyOnChange](../interfaces/ColumnFilterMenuOptionsIf.md#applyonchange)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L21)

___

### maxValues

• **maxValues**: `number` = `10_000`

Maximum distinct values collected for the checklist (defaults to `columnFilter.maxValues`, `10_000`).

#### Implementation of

[ColumnFilterMenuOptionsIf](../interfaces/ColumnFilterMenuOptionsIf.md).[maxValues](../interfaces/ColumnFilterMenuOptionsIf.md#maxvalues)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L22)

___

### showCondition

• **showCondition**: `boolean` = `true`

Show the operator selector and condition input(s). Default `true`.

#### Implementation of

[ColumnFilterMenuOptionsIf](../interfaces/ColumnFilterMenuOptionsIf.md).[showCondition](../interfaces/ColumnFilterMenuOptionsIf.md#showcondition)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L19)

___

### showValues

• **showValues**: `boolean` = `true`

Show the searchable distinct-values checkbox list. Default `true`.

#### Implementation of

[ColumnFilterMenuOptionsIf](../interfaces/ColumnFilterMenuOptionsIf.md).[showValues](../interfaces/ColumnFilterMenuOptionsIf.md#showvalues)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L20)

## Methods

### create

▸ **create**(`option?`, `defaultMaxValues?`): `undefined` \| [`ColumnFilterMenuOptionsIf`](../interfaces/ColumnFilterMenuOptionsIf.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `option?` | `boolean` \| `Partial`\<[`ColumnFilterMenuOptionsIf`](../interfaces/ColumnFilterMenuOptionsIf.md)\> |
| `defaultMaxValues?` | `number` |

#### Returns

`undefined` \| [`ColumnFilterMenuOptionsIf`](../interfaces/ColumnFilterMenuOptionsIf.md)

#### Defined in

[src/lib/table/column-filter/column-filter-options.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.ts#L24)
