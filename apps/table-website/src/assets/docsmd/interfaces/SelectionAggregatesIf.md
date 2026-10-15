[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectionAggregatesIf

# Interface: SelectionAggregatesIf

Count, sum, average, minimum and maximum of the selected body cells – for a status bar like in a spreadsheet
([TableApi.getSelectionAggregates](../classes/TableApi.md#getselectionaggregates)).

Counted are the selected cells of the visible data columns (row number and checkbox columns not); `numericCount`,
`sum`, `avg`, `min`, `max` use the cells whose value is a number.

**`Example`**

```ts
const a: SelectionAggregatesIf = tableApi.getSelectionAggregates();
const text = a.capped ? "selection too large"
  : a.numericCount ? `Count ${a.count} · Sum ${formatAggregateValue(a.sum)} · Avg ${formatAggregateValue(a.avg)}`
  : a.count ? `Count ${a.count}` : "";
```

**`Since`**

1.1.94

## Table of contents

### Properties

- [avg](SelectionAggregatesIf.md#avg)
- [capped](SelectionAggregatesIf.md#capped)
- [count](SelectionAggregatesIf.md#count)
- [max](SelectionAggregatesIf.md#max)
- [min](SelectionAggregatesIf.md#min)
- [numericCount](SelectionAggregatesIf.md#numericcount)
- [sum](SelectionAggregatesIf.md#sum)

## Properties

### avg

• **avg**: `undefined` \| `number`

Average of the numbers (`undefined` without numbers).

#### Defined in

[src/lib/table/aggregation/selection-aggregates.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/selection-aggregates.if.ts#L25)

___

### capped

• **capped**: `boolean`

`true` if the selection covers more than [SelectionAggregator.maxCells](../classes/SelectionAggregator.md#maxcells) cells: then nothing is computed
(all values 0 / `undefined`) – a partial sum would be wrong.

#### Defined in

[src/lib/table/aggregation/selection-aggregates.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/selection-aggregates.if.ts#L34)

___

### count

• **count**: `number`

Number of selected cells.

#### Defined in

[src/lib/table/aggregation/selection-aggregates.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/selection-aggregates.if.ts#L19)

___

### max

• **max**: `undefined` \| `number`

Largest number (`undefined` without numbers).

#### Defined in

[src/lib/table/aggregation/selection-aggregates.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/selection-aggregates.if.ts#L29)

___

### min

• **min**: `undefined` \| `number`

Smallest number (`undefined` without numbers).

#### Defined in

[src/lib/table/aggregation/selection-aggregates.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/selection-aggregates.if.ts#L27)

___

### numericCount

• **numericCount**: `number`

Number of selected cells with a number.

#### Defined in

[src/lib/table/aggregation/selection-aggregates.if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/selection-aggregates.if.ts#L21)

___

### sum

• **sum**: `number`

Sum of the numbers (`0` without numbers).

#### Defined in

[src/lib/table/aggregation/selection-aggregates.if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/aggregation/selection-aggregates.if.ts#L23)
