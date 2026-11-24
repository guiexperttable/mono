[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterResolverIf

# Interface: ColumnFilterResolverIf\<T\>

Describes how to read and compare one column when compiling a multi-column predicate
([compileColumnFilterPredicate](../modules.md#compilecolumnfilterpredicate)).

**`Since`**

1.1.114

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Properties

- [caseSensitive](ColumnFilterResolverIf.md#casesensitive)
- [getValue](ColumnFilterResolverIf.md#getvalue)
- [property](ColumnFilterResolverIf.md#property)
- [type](ColumnFilterResolverIf.md#type)

## Properties

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

#### Defined in

[src/lib/table/column-filter/compile-column-filters.ts:361](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/compile-column-filters.ts#L361)

___

### getValue

• **getValue**: (`row`: `T`) => `unknown`

#### Type declaration

▸ (`row`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `T` |

##### Returns

`unknown`

#### Defined in

[src/lib/table/column-filter/compile-column-filters.ts:360](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/compile-column-filters.ts#L360)

___

### property

• **property**: `string`

#### Defined in

[src/lib/table/column-filter/compile-column-filters.ts:358](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/compile-column-filters.ts#L358)

___

### type

• **type**: [`ColumnFilterType`](../modules.md#columnfiltertype)

#### Defined in

[src/lib/table/column-filter/compile-column-filters.ts:359](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/compile-column-filters.ts#L359)
