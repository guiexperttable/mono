[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowGroupFieldIf

# Interface: RowGroupFieldIf\<T\>

One level of a row grouping in full form: where the key of a row comes from and how the groups of the level are
named and ordered. The short form is just the [ValueAccessor](../modules.md#valueaccessor) (`"region"` or a function).

**`Example`**

```ts
// year › month from a date, newest year first, month names as labels
const groupBy: RowGroupField<Order>[] = [
  { name: "year", label: "Year", value: o => new Date(o.date).getFullYear(), order: "desc" },
  { name: "month", label: "Month", value: o => new Date(o.date).getMonth(), format: m => MONTHS[m as number] }
];
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Table of contents

### Properties

- [format](RowGroupFieldIf.md#format)
- [label](RowGroupFieldIf.md#label)
- [name](RowGroupFieldIf.md#name)
- [order](RowGroupFieldIf.md#order)
- [value](RowGroupFieldIf.md#value)

## Properties

### format

• `Optional` **format**: (`key`: `unknown`) => `string`

#### Type declaration

▸ (`key`): `string`

The text of a key in the group label. Default: the key as text, dates as date (en-US), empty keys `emptyLabel`. Text only – never HTML.

##### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `unknown` |

##### Returns

`string`

#### Defined in

[src/lib/table/rowgroup/row-group-field.type.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-field.type.ts#L42)

___

### label

• `Optional` **label**: `string`

The name of the level, e.g. in the header of the group column. Default: the header label of the column with this property, otherwise the name.

#### Defined in

[src/lib/table/rowgroup/row-group-field.type.ts:40](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-field.type.ts#L40)

___

### name

• `Optional` **name**: `string`

The id of the level – part of the group ids that remember expanded groups ([RowGroupIf.id](RowGroupIf.md#id)).
Default: the property path; for a function `"level<N>"` (give functions a name if you switch between them).

#### Defined in

[src/lib/table/rowgroup/row-group-field.type.ts:38](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-field.type.ts#L38)

___

### order

• `Optional` **order**: [`RowGroupOrder`](../modules.md#rowgrouporder)

The order of the groups of this level. Default `"asc"`.

#### Defined in

[src/lib/table/rowgroup/row-group-field.type.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-field.type.ts#L44)

___

### value

• **value**: [`ValueAccessor`](../modules.md#valueaccessor)\<`T`\>

The key of a row: a property path (`"region"`, `"address.city"`) or a function (computed keys).

#### Defined in

[src/lib/table/rowgroup/row-group-field.type.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-field.type.ts#L33)
