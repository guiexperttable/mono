[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AggregateFooterRowIf

# Interface: AggregateFooterRowIf\<T\>

One total row of an [AreaModelAggregateFooter](../classes/AreaModelAggregateFooter.md): the aggregates by column property and an optional label.

**`Example`**

```ts
const sumRow: AggregateFooterRowIf<Order> = { label: "Sum", aggregates: { quantity: "sum", total: "sum" } };
const avgRow: AggregateFooterRowIf<Order> = {
  label: (rowCount, results) => `Ø of ${rowCount} orders`,
  aggregates: { total: { aggregator: "avg", format: v => `${(v as number).toFixed(2)} €` } }
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

- [aggregates](AggregateFooterRowIf.md#aggregates)
- [label](AggregateFooterRowIf.md#label)

## Properties

### aggregates

• **aggregates**: [`AggregateSpecMap`](../modules.md#aggregatespecmap)\<`T`\>

Key = property of the column that shows the result (a key without a column is only in `getResults()`).

#### Defined in

[src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts#L19)

___

### label

• `Optional` **label**: `string` \| (`rowCount`: `number`, `results`: `Record`\<`string`, `unknown`\>) => `string`

Text in the label column (always set as text, never as HTML). Default: `"6 rows"` – or, in a footer with
several rows whose aggregates all use the same built-in aggregator, its word (`"Sum"`, `"Average"`, `"Min"` …).

#### Defined in

[src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts#L24)
