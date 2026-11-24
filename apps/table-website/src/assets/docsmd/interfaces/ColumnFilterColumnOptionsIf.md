[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnFilterColumnOptionsIf

# Interface: ColumnFilterColumnOptionsIf

Per-column configuration of [ColumnDefIf.filter](ColumnDefIf.md#filter).

**`Example`**

```ts
ColumnDef.create({
  property: "total",
  headerLabel: "Total",
  filter: { type: "number", placeholder: "> 100" }
});
```

**`Since`**

1.1.114

## Table of contents

### Properties

- [caseSensitive](ColumnFilterColumnOptionsIf.md#casesensitive)
- [getValues](ColumnFilterColumnOptionsIf.md#getvalues)
- [placeholder](ColumnFilterColumnOptionsIf.md#placeholder)
- [type](ColumnFilterColumnOptionsIf.md#type)
- [valueGetter](ColumnFilterColumnOptionsIf.md#valuegetter)

## Properties

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Case sensitivity for text comparisons on this column (defaults to `tableOptions.columnFilter.caseSensitive`).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L61)

___

### getValues

• `Optional` **getValues**: (`ctx`: [`ColumnFilterValuesContextIf`](ColumnFilterValuesContextIf.md)) => [`ColumnFilterValueItemIf`](ColumnFilterValueItemIf.md)[] \| `Promise`\<[`ColumnFilterValueItemIf`](ColumnFilterValueItemIf.md)[]\>

#### Type declaration

▸ (`ctx`): [`ColumnFilterValueItemIf`](ColumnFilterValueItemIf.md)[] \| `Promise`\<[`ColumnFilterValueItemIf`](ColumnFilterValueItemIf.md)[]\>

Custom or server-side distinct values provider for the filter menu.

##### Parameters

| Name | Type |
| :------ | :------ |
| `ctx` | [`ColumnFilterValuesContextIf`](ColumnFilterValuesContextIf.md) |

##### Returns

[`ColumnFilterValueItemIf`](ColumnFilterValueItemIf.md)[] \| `Promise`\<[`ColumnFilterValueItemIf`](ColumnFilterValueItemIf.md)[]\>

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L65)

___

### placeholder

• `Optional` **placeholder**: `string`

Placeholder text in the filter row input of this column.

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L63)

___

### type

• `Optional` **type**: [`ColumnFilterType`](../modules.md#columnfiltertype)

Explicit column filter type (inferred from data when omitted).

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L57)

___

### valueGetter

• `Optional` **valueGetter**: (`row`: `any`) => `unknown`

#### Type declaration

▸ (`row`): `unknown`

Custom value getter for filtering this column (defaults to `getRowValue` / `valueGetter` / cell formulas).

##### Parameters

| Name | Type |
| :------ | :------ |
| `row` | `any` |

##### Returns

`unknown`

#### Defined in

[src/lib/table/column-filter/column-filter-options.if.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/column-filter/column-filter-options.if.ts#L59)
