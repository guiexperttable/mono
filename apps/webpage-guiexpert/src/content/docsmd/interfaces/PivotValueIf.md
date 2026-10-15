[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PivotValueIf

# Interface: PivotValueIf\<T\>

One value of a pivot table in full form: where the value of a row comes from, how it is aggregated, and how its
columns are named. The short form is just the [ValueAccessor](../modules.md#valueaccessor) (`"umsatz"` = the sum of umsatz).

**`Example`**

```ts
const revenue: PivotValueIf<Order> = { value: "total", label: "Revenue" };                  // sum
const orders: PivotValueIf<Order> = { value: "id", aggregator: "count", label: "Orders" };
const avgPrice: PivotValueIf<Order> = {
  value: o => o.total / o.quantity, aggregator: "avg", label: "Avg. price",
  format: v => v === undefined ? "" : `${(v as number).toFixed(2)} €`
};
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Table of contents

### Properties

- [aggregator](PivotValueIf.md#aggregator)
- [format](PivotValueIf.md#format)
- [label](PivotValueIf.md#label)
- [name](PivotValueIf.md#name)
- [value](PivotValueIf.md#value)

## Properties

### aggregator

• `Optional` **aggregator**: [`AggregatorRef`](../modules.md#aggregatorref)

A built-in aggregator by name (`"sum"`, `"avg"`, `"count"` …) or an own [AggregatorIf](AggregatorIf.md). Default `"sum"`.

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L25)

___

### format

• `Optional` **format**: (`result`: `unknown`) => `string`

#### Type declaration

▸ (`result`): `string`

The text of a result in a cell. Default: numbers with at most two decimals (`"1,234.5"`). Excel gets the raw value.

##### Parameters

| Name | Type |
| :------ | :------ |
| `result` | `unknown` |

##### Returns

`string`

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L34)

___

### label

• `Optional` **label**: `string`

The header of its columns (with several values). Default: the name. Text only – never HTML.

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L32)

___

### name

• `Optional` **name**: `string`

The id of the value – part of the column properties and the name in [PivotResult.getValue](../classes/PivotResult.md#getvalue).
Default: `"<aggregator>(<path>)"`, e.g. `"sum(umsatz)"`; for a function `"<aggregator>(value<N>)"`.

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L30)

___

### value

• **value**: [`ValueAccessor`](../modules.md#valueaccessor)\<`T`\>

The value of a row: a property path (`"umsatz"`, `"order.total"`) or a function.

#### Defined in

[src/lib/table/pivot/pivot-value.type.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-value.type.ts#L23)
