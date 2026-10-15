[GuiExpert Table API](../README.md) / [Exports](../modules.md) / AggregateFooterOptionsIf

# Interface: AggregateFooterOptionsIf\<T\>

The options of an [AreaModelAggregateFooter](../classes/AreaModelAggregateFooter.md) (and of `TableFactory.createTableModel({ footerAggregates })`).

**`Example`**

```ts
const options: AggregateFooterOptionsIf<Order> = {
  rows: [
    { label: "Sum", aggregates: { quantity: "sum", total: "sum" } },
    { label: "Average", aggregates: { quantity: "avg", total: "avg" } }
  ],
  labelProperty: "customer",   // the labels go into the customer column
  rowHeight: 36
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

- [getRows](AggregateFooterOptionsIf.md#getrows)
- [labelProperty](AggregateFooterOptionsIf.md#labelproperty)
- [rowHeight](AggregateFooterOptionsIf.md#rowheight)
- [rows](AggregateFooterOptionsIf.md#rows)
- [source](AggregateFooterOptionsIf.md#source)

## Properties

### getRows

• `Optional` **getRows**: (`bodyModel`: [`AreaModelIf`](AreaModelIf.md)) => `ArrayLike`\<`T`\>

#### Type declaration

▸ (`bodyModel`): `ArrayLike`\<`T`\>

An own source of rows (instead of the body model's rows), e.g. the data of a server response.

##### Parameters

| Name | Type |
| :------ | :------ |
| `bodyModel` | [`AreaModelIf`](AreaModelIf.md) |

##### Returns

`ArrayLike`\<`T`\>

#### Defined in

[src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts#L56)

___

### labelProperty

• `Optional` **labelProperty**: `string`

The column of the labels (property). Default: the first data column without an aggregate in that row.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts#L47)

___

### rowHeight

• `Optional` **rowHeight**: `number`

Height of the footer rows in px. Default 34 (the factory uses `defaultRowHeights.footer`).

#### Defined in

[src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts#L49)

___

### rows

• **rows**: [`AggregateFooterRowIf`](AggregateFooterRowIf.md)\<`T`\>[]

One footer row per entry.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts#L45)

___

### source

• `Optional` **source**: ``"all"`` \| ``"filtered"``

Which rows are aggregated: `"filtered"` (default) – the rows the body shows (after `externalFilterFunction`;
in a tree all leaves that pass the filter, expanded or not); `"all"` – all rows, the filter is ignored.

#### Defined in

[src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/areamodel/aggregate-footer-options.if.ts#L54)
