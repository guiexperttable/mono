[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowGroupModelOptionsIf

# Interface: RowGroupModelOptionsIf\<T\>

Options of an [AreaModelRowGroups](../classes/AreaModelRowGroups.md) (the factory [RowGroupFactory.createTableModel](../classes/RowGroupFactory.md#createtablemodel) fills them).

**`Example`**

```ts
const body = new AreaModelRowGroups<Sale>(sales, columnDefs, { groupBy: ["region"], aggregations: { umsatz: "sum" } });
```

**`Since`**

1.1.94

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Properties

- [aggregations](RowGroupModelOptionsIf.md#aggregations)
- [emptyLabel](RowGroupModelOptionsIf.md#emptylabel)
- [expanded](RowGroupModelOptionsIf.md#expanded)
- [groupBy](RowGroupModelOptionsIf.md#groupby)
- [groupColumn](RowGroupModelOptionsIf.md#groupcolumn)
- [hideGroupedColumns](RowGroupModelOptionsIf.md#hidegroupedcolumns)

## Properties

### aggregations

• `Optional` **aggregations**: [`AggregateSpecMap`](../modules.md#aggregatespecmap)\<`T`\>

The aggregates of the group rows; the key is the property of the column that shows it (`{ umsatz: "sum" }`).

#### Defined in

[src/lib/table/rowgroup/row-group-model-options.if.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-model-options.if.ts#L31)

___

### emptyLabel

• `Optional` **emptyLabel**: `string`

The label of the group of empty keys (`null`, `undefined`, `""`). Default `"(empty)"`.

#### Defined in

[src/lib/table/rowgroup/row-group-model-options.if.ts:35](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-model-options.if.ts#L35)

___

### expanded

• `Optional` **expanded**: [`RowGroupExpanded`](../modules.md#rowgroupexpanded)\<`T`\>

Which groups are expanded at the start and in new paths after regrouping. Default true.

#### Defined in

[src/lib/table/rowgroup/row-group-model-options.if.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-model-options.if.ts#L33)

___

### groupBy

• **groupBy**: [`RowGroupField`](../modules.md#rowgroupfield)\<`T`\>[]

The levels, top first. An empty list shows the rows without groups.

#### Defined in

[src/lib/table/rowgroup/row-group-model-options.if.ts:29](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-model-options.if.ts#L29)

___

### groupColumn

• `Optional` **groupColumn**: `Partial`\<[`RowGroupColumnOptionsIf`](RowGroupColumnOptionsIf.md)\<`T`\>\>

Label options of the group column (`showCount`, `label`).

#### Defined in

[src/lib/table/rowgroup/row-group-model-options.if.ts:37](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-model-options.if.ts#L37)

___

### hideGroupedColumns

• `Optional` **hideGroupedColumns**: `boolean`

Hide the columns of the grouped properties (their values are in the group column). Default true.

#### Defined in

[src/lib/table/rowgroup/row-group-model-options.if.ts:39](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-model-options.if.ts#L39)
