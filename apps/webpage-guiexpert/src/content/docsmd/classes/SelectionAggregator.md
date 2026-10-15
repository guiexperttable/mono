[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SelectionAggregator

# Class: SelectionAggregator

Computes count, sum, average, minimum and maximum of the selected body cells ([SelectionAggregatesIf](../interfaces/SelectionAggregatesIf.md)) – what
[TableApi.getSelectionAggregates](TableApi.md#getselectionaggregates) returns, e.g. for a status bar under the table.

Counted are the selected cells of the visible data columns (no row numbers, no checkbox column); the numbers are the
cell values (`getValueAt`) of type `number`. Negative ranges (Ctrl/⌘-click) are respected. A selection whose ranges
cover more than [maxCells](SelectionAggregator.md#maxcells) cells is not computed (`capped: true`).

**`Example`**

```ts
SelectionAggregator.maxCells = 5_000_000;            // allow bigger selections
const a = new SelectionAggregator().aggregate(tableModel, selectionModel);
```

**`Since`**

1.1.94

## Table of contents

### Constructors

- [constructor](SelectionAggregator.md#constructor)

### Properties

- [maxCells](SelectionAggregator.md#maxcells)

### Methods

- [aggregate](SelectionAggregator.md#aggregate)

## Constructors

### constructor

• **new SelectionAggregator**(): [`SelectionAggregator`](SelectionAggregator.md)

#### Returns

[`SelectionAggregator`](SelectionAggregator.md)

## Properties

### maxCells

▪ `Static` **maxCells**: `number` = `1_000_000`

Upper limit for the cells of the selected ranges (Ctrl+A on millions of rows). Like
[CopyService.maxCopyCells](CopyService.md#maxcopycells): above it nothing is computed.

**`Example`**

```ts
SelectionAggregator.maxCells = 2_000_000;
```

#### Defined in

[src/lib/table/selection/selection-aggregator.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-aggregator.ts#L32)

## Methods

### aggregate

▸ **aggregate**(`tableModel`, `selectionModel`): [`SelectionAggregatesIf`](../interfaces/SelectionAggregatesIf.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) | the table model (body rows, columns, visibility) |
| `selectionModel` | `undefined` \| [`SelectionModelIf`](../interfaces/SelectionModelIf.md) | the selection; none → all zero |

#### Returns

[`SelectionAggregatesIf`](../interfaces/SelectionAggregatesIf.md)

the aggregates of the selected cells

#### Defined in

[src/lib/table/selection/selection-aggregator.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/selection/selection-aggregator.ts#L39)
