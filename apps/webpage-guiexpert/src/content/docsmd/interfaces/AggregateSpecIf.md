[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AggregateSpecIf

# Interface: AggregateSpecIf\<T\>

One aggregate in full form: which aggregator, which value, and (in a footer) how it is shown.

**`Example`**

```ts
const spec: AggregateSpecIf<Order> = {
  aggregator: "avg",
  value: "total",                                    // default: the key of the spec
  format: v => `${(v as number).toFixed(2)} €`         // footer text; Excel gets the number
};
```

**`Since`**

1.1.94

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Properties

- [aggregator](AggregateSpecIf.md#aggregator)
- [format](AggregateSpecIf.md#format)
- [value](AggregateSpecIf.md#value)

## Properties

### aggregator

• **aggregator**: [`AggregatorRef`](../modules.md#aggregatorref)

A built-in aggregator by name or an own one.

#### Defined in

[src/lib/table/aggregation/aggregate-spec.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/aggregate-spec.if.ts#L19)

___

### format

• `Optional` **format**: (`result`: `unknown`) => `string`

#### Type declaration

▸ (`result`): `string`

The text in a footer cell. Default: numbers with at most two decimals (`"1,234.5"`), dates as date, `undefined` empty.

##### Parameters

| Name | Type |
| :------ | :------ |
| `result` | `unknown` |

##### Returns

`string`

#### Defined in

[src/lib/table/aggregation/aggregate-spec.if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/aggregate-spec.if.ts#L23)

___

### value

• `Optional` **value**: [`ValueAccessor`](../modules.md#valueaccessor)\<`T`\>

The value of a row. Default: the key of the spec as property path.

#### Defined in

[src/lib/table/aggregation/aggregate-spec.if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/aggregate-spec.if.ts#L21)
