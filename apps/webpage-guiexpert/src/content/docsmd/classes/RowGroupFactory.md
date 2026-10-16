[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowGroupFactory

# Class: RowGroupFactory

Creates a table model that groups flat rows: one row per group with an arrow, a label (`"Nord (3)"`) and
aggregates per column, below it the sub-groups or the original rows – plus a total row. MIT-licensed, no
dependencies, built on the tree table ([AreaModelRowGroups](AreaModelRowGroups.md)).

What the factory does:
- puts a [RowGroupColumnDef](RowGroupColumnDef.md) (arrows, labels) behind row numbers and checkbox column and fixes it on the left;
- hides the columns of grouped properties (`hideGroupedColumns`), their values are in the group column;
- builds the body ([AreaModelRowGroups](AreaModelRowGroups.md)) and a total row from the `aggregations` ([AreaModelAggregateFooter](AreaModelAggregateFooter.md)).

Regroup at runtime with [TableApi.setRowGroupBy](TableApi.md#setrowgroupby); filter, sort, edit and export as in any table.

**`Example`**

```ts
// R1: sales by region, sum of umsatz, total row
const tableModel = RowGroupFactory.createTableModel<Sale>({
  rows: sales,
  columnDefs,
  groupBy: ["region"],
  aggregations: { umsatz: "sum" }
});
// ▾ Nord (3) … 270 · A Jan 100 · B Jan 50 · A Feb 120 · ▾ Süd (3) … 180 · … · footer "6 rows" … 450
```

**`Example`**

```ts
// two levels, all groups closed, regroup with a select
const tableModel = RowGroupFactory.createTableModel<Order>({
  rows: orders, columnDefs, groupBy: ["country", "city"],
  aggregations: { quantity: "sum", total: "sum" }, expanded: 0
});
select.addEventListener("change", () => tableApi.setRowGroupBy(select.value.split(",")));
```

**`See`**

[Live demo: row grouping](https://gui.expert/showcase/rowgrouping/run/) · Training: [Row grouping](https://gui.expert/training/row-grouping/)

**`Since`**

1.1.94

## Table of contents

### Constructors

- [constructor](RowGroupFactory.md#constructor)

### Methods

- [createTableModel](RowGroupFactory.md#createtablemodel)
- [updateLayout](RowGroupFactory.md#updatelayout)

## Constructors

### constructor

• **new RowGroupFactory**(): [`RowGroupFactory`](RowGroupFactory.md)

#### Returns

[`RowGroupFactory`](RowGroupFactory.md)

## Methods

### createTableModel

▸ **createTableModel**\<`T`\>(`p`): [`TableModelIf`](../interfaces/TableModelIf.md)

Creates the table model of a row grouping (see the class description).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | [`RowGroupTableModelParaIf`](../interfaces/RowGroupTableModelParaIf.md)\<`T`\> | rows, levels, columns, aggregations, options |

#### Returns

[`TableModelIf`](../interfaces/TableModelIf.md)

the table model – its body is an [AreaModelRowGroups](AreaModelRowGroups.md)

**`Example`**

```ts
const tableModel = RowGroupFactory.createTableModel<Sale>({
  rows: sales, columnDefs, groupBy: ["region", "produkt"], aggregations: { umsatz: "avg" }
});
const body = tableModel.getBodyModel() as AreaModelRowGroups<Sale>;
body.getGroups()[0].results.umsatz;   // 90 – Nord, the average of its three rows
```

#### Defined in

[src/lib/table/factory/row-group-factory.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-factory.ts#L66)

___

### updateLayout

▸ **updateLayout**(`tableModel`): `boolean`

Hides the columns of the grouped properties (and shows the ones that are no longer grouped) and sets the header of
the group column – after `body.setGroupBy(…)`. [TableApi.setRowGroupBy](TableApi.md#setrowgroupby) calls it for you.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tableModel` | [`TableModelIf`](../interfaces/TableModelIf.md) | a table model of [createTableModel](RowGroupFactory.md#createtablemodel) |

#### Returns

`boolean`

false if the body is no row grouping

**`Example`**

```ts
const body = tableModel.getBodyModel() as AreaModelRowGroups<Sale>;
body.setGroupBy(["produkt"]);
RowGroupFactory.updateLayout(tableModel);
tableApi.recalcWrappers();
tableApi.repaintHard();
```

#### Defined in

[src/lib/table/factory/row-group-factory.ts:133](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/row-group-factory.ts#L133)
