[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PivotResult

# Class: PivotResult\<T\>

The result of a pivot ([pivotRows](../modules.md#pivotrows), [AreaModelPivot.getResult](AreaModelPivot.md#getresult)): the row and column hierarchies and the
aggregated value of every combination – cells, subtotals and totals. DOM-free; the table reads its cells from here.

- `getValue(row, column)` – a cell; leave out `row` for the column total, `column` for the row total, both for the
  grand total. Groups of higher levels give subtotals.
- A combination without rows is `undefined` (not 0).
- Every cell is computed from the rows (leaf cells) or by merging aggregation **states** – an average of a region is
  the average of its rows, never the average of the product averages. Order of the merges: first along the columns
  (column groups), then along the rows (row groups, total row) – children in key order. This matters for
  `first`/`last` only: a row total adds its rows in source order, a column group merges its keys in key order, so
  the two may differ. Keys cut off by `maxColumns` still count in subtotals and totals.

**`Example`**

```ts
const result = pivotRows(sales, { rowFields: ["region"], columnFields: ["monat"], values: ["umsatz"] });
const nord = result.rowGroups[0];                      // Nord
const jan = result.columnLeaves.find(c => c.key === "Jan");
result.getValue(nord, jan);   // 150
result.getValue(nord);        // 270 – the row total
result.getValue(undefined, jan);   // 230 – the column total
result.getValue();            // 450
```

**`Since`**

1.1.94

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `any` | the row type |

## Table of contents

### Constructors

- [constructor](PivotResult.md#constructor)

### Properties

- [columnGroups](PivotResult.md#columngroups)
- [columnLeaves](PivotResult.md#columnleaves)
- [rowGroups](PivotResult.md#rowgroups)
- [truncated](PivotResult.md#truncated)
- [values](PivotResult.md#values)

### Methods

- [compute](PivotResult.md#compute)
- [getCount](PivotResult.md#getcount)
- [getSourceRows](PivotResult.md#getsourcerows)
- [getValue](PivotResult.md#getvalue)
- [isColumnShown](PivotResult.md#iscolumnshown)

## Constructors

### constructor

• **new PivotResult**\<`T`\>(`config`, `accept?`): [`PivotResult`](PivotResult.md)\<`T`\>

Groups the rows by the row and column fields and aggregates the values. Use [pivotRows](../modules.md#pivotrows).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`PivotConfigIf`](../interfaces/PivotConfigIf.md)\<`T`\> | fields and values |
| `accept?` | (`sourceIndex`: `number`) => `boolean` | a filter: only rows it accepts count |

#### Returns

[`PivotResult`](PivotResult.md)\<`T`\>

#### Defined in

[src/lib/table/pivot/pivot-result.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L83)

## Properties

### columnGroups

• `Readonly` **columnGroups**: [`RowGroup`](RowGroup.md)\<`T`\>[]

The column groups of the top level (with sub-groups); empty without column fields.

#### Defined in

[src/lib/table/pivot/pivot-result.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L51)

___

### columnLeaves

• `Readonly` **columnLeaves**: [`RowGroup`](RowGroup.md)\<`T`\>[]

The shown column keys of the lowest level in display order – at most [PivotConfigIf.maxColumns](../interfaces/PivotConfigIf.md#maxcolumns).

#### Defined in

[src/lib/table/pivot/pivot-result.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L53)

___

### rowGroups

• `Readonly` **rowGroups**: [`RowGroup`](RowGroup.md)\<`T`\>[]

The row groups of the top level (with sub-groups); empty without row fields.

#### Defined in

[src/lib/table/pivot/pivot-result.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L49)

___

### truncated

• `Readonly` **truncated**: `boolean`

True if there were more column keys than [PivotConfigIf.maxColumns](../interfaces/PivotConfigIf.md#maxcolumns) (the rest is not shown as columns).

#### Defined in

[src/lib/table/pivot/pivot-result.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L57)

___

### values

• `Readonly` **values**: readonly [`PivotValueInfoIf`](../interfaces/PivotValueInfoIf.md)[]

The values (name, label, aggregator, format).

#### Defined in

[src/lib/table/pivot/pivot-result.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L55)

## Methods

### compute

▸ **compute**(`accept?`): `void`

Computes all cells again (same keys) – after a filter change or changed values.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accept?` | (`sourceIndex`: `number`) => `boolean` | a filter: only rows it accepts count |

#### Returns

`void`

**`Example`**

```ts
result.compute(i => sales[i].monat === "Jan");
result.getValue();   // 230
```

#### Defined in

[src/lib/table/pivot/pivot-result.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L126)

___

### getCount

▸ **getCount**(`row?`, `column?`): `number`

The number of rows of a cell, a subtotal or a total (after the filter).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row?` | [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> | a row group; undefined = all rows |
| `column?` | [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> | a column key or group; undefined = all columns |

#### Returns

`number`

the row count, 0 for a combination without rows

**`Example`**

```ts
result.getCount(result.rowGroups[0]);   // 3 – the rows of Nord
```

#### Defined in

[src/lib/table/pivot/pivot-result.ts:200](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L200)

___

### getSourceRows

▸ **getSourceRows**(`row?`, `column?`): `T`[]

The rows behind a cell (drill-down), after the filter, in source order.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `row?` | [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> | a row group; undefined = all rows |
| `column?` | [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> | a column key or group; undefined = all columns |

#### Returns

`T`[]

a new array

**`Example`**

```ts
result.getSourceRows(nord, jan).map(s => s.umsatz);   // [100, 50]
```

#### Defined in

[src/lib/table/pivot/pivot-result.ts:214](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L214)

___

### getValue

▸ **getValue**(`row?`, `column?`, `value?`): `unknown`

The aggregated value of a cell, a subtotal or a total.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `row?` | [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> | `undefined` | a row group (any level); undefined = all rows (column totals) |
| `column?` | [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> | `undefined` | a column key or column group (any level); undefined = all columns (row totals) |
| `value?` | `string` \| `number` | `0` | the index or name of the value |

#### Returns

`unknown`

the result, `undefined` if no row has this combination

**`Example`**

```ts
result.getValue(result.rowGroups[0], undefined, "sum(umsatz)");   // the total of the first row group
```

#### Defined in

[src/lib/table/pivot/pivot-result.ts:181](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L181)

___

### isColumnShown

▸ **isColumnShown**(`column`): `boolean`

True if a column group is shown – false for groups whose keys were all cut off by `maxColumns`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `column` | [`RowGroupIf`](../interfaces/RowGroupIf.md)\<`T`\> | a column group |

#### Returns

`boolean`

true if it has at least one shown column key

#### Defined in

[src/lib/table/pivot/pivot-result.ts:248](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-result.ts#L248)
