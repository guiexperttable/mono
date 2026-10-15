[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AggregatorIf

# Interface: AggregatorIf\<S, R\>

An aggregation (sum, average, …) as four small functions over a **state**: `init` → `add` per value → `result`.
`merge` combines two partial states – the result is the same as one pass over all values. That makes groups
(row grouping, pivot) cheap: the state of a group is the merge of the states of its sub-groups, and an average of
averages stays correct (`{ sum, count }` instead of a number).

The built-in aggregators are in [Aggregators](../modules.md#aggregators); an own aggregator implements this interface and can be used
everywhere a name like `"sum"` is accepted ([AggregatorRef](../modules.md#aggregatorref)).

`add(state, …)` and `merge(a, b)` may change `state` / `a` and return it (no allocation per row with millions of
rows); `merge` never changes `b`, so a child state can be merged into several parents. Call `init()` for a fresh
state, e.g. `merge(init(), child)` for a parent that must not change the child.

**`Example`**

```ts
// the product of all numbers
const product: AggregatorIf<number, number> = {
  name: "product",
  init: () => 1,
  add: (state, value) => typeof value === "number" ? state * value : state,
  merge: (a, b) => a * b,
  result: state => state
};
aggregate([{ f: 2 }, { f: 3 }, { f: 7 }], "f", product); // 42
```

**`Example`**

```ts
// partial results: the average of two groups is the average of all rows
const avg = Aggregators.avg;
const north = [100, 50, 120].reduce((s, v) => avg.add(s, v), avg.init());
const south = [80, 70, 30].reduce((s, v) => avg.add(s, v), avg.init());
avg.result(avg.merge(north, south)); // 75 – not the mean of 90 and 60
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `S` | `any` | the state |
| `R` | `unknown` | the result |

## Table of contents

### Properties

- [name](AggregatorIf.md#name)

### Methods

- [add](AggregatorIf.md#add)
- [init](AggregatorIf.md#init)
- [merge](AggregatorIf.md#merge)
- [result](AggregatorIf.md#result)

## Properties

### name

• `Readonly` **name**: `string`

The name, e.g. `"sum"` – the built-in ones use their [AggregatorName](../modules.md#aggregatorname).

#### Defined in

[src/lib/table/aggregation/aggregator.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/aggregator.if.ts#L39)

## Methods

### add

▸ **add**(`state`, `value`): `S`

Takes one value into the state (values the aggregator can't use are ignored); returns the state.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `S` |
| `value` | `unknown` |

#### Returns

`S`

#### Defined in

[src/lib/table/aggregation/aggregator.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/aggregator.if.ts#L45)

___

### init

▸ **init**(): `S`

The state of the empty set.

#### Returns

`S`

#### Defined in

[src/lib/table/aggregation/aggregator.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/aggregator.if.ts#L42)

___

### merge

▸ **merge**(`a`, `b`): `S`

Combines two partial states (`a` first, then `b` – matters for `first`/`last`); may change `a` and returns the
combined state; never changes `b`.

#### Parameters

| Name | Type |
| :------ | :------ |
| `a` | `S` |
| `b` | `S` |

#### Returns

`S`

#### Defined in

[src/lib/table/aggregation/aggregator.if.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/aggregator.if.ts#L51)

___

### result

▸ **result**(`state`): `R`

The result of a state, e.g. `sum / count` for the average.

#### Parameters

| Name | Type |
| :------ | :------ |
| `state` | `S` |

#### Returns

`R`

#### Defined in

[src/lib/table/aggregation/aggregator.if.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/aggregator.if.ts#L54)
