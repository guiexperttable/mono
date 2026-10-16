[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PivotFactory

# Class: PivotFactory

Creates pivot tables: rows grouped by row fields (a hierarchy with subtotals), the values of column fields as
columns (several fields = a multi-row header), aggregated values in the cells, total column and total row.
MIT-licensed, no dependencies – at ag-Grid this is an Enterprise feature.

The configuration has the form of a row grouping ([RowGroupFactory](RowGroupFactory.md)): fields are property paths, functions
(e.g. the quarter of a date) or [RowGroupFieldIf](../interfaces/RowGroupFieldIf.md) with label, format and order; values use the aggregators of
[Aggregators](../modules.md#aggregators) (`sum`, `avg`, `count` …) or your own [AggregatorIf](../interfaces/AggregatorIf.md). Subtotals and totals are merged from
aggregation states – an average is always the average of the rows.

Filter with `externalFilterFunction` (it gets your source objects, before the aggregation), sort by clicking a value
column, export with `downloadExcel()`, and pivot again at runtime with [TableApi.setPivotConfig](TableApi.md#setpivotconfig).

**`Example`**

```ts
// case 1: regions × months, sum of umsatz, total column and total row
const tableModel = PivotFactory.createTableModel<Sale>({
  rows: sales,
  rowFields: ["region"],
  columnFields: [{ value: "monat", order: "insertion" }],
  values: ["umsatz"]
});
// Region | Jan | Feb | Total
// Nord   | 150 | 120 |   270
// Süd    |  80 | 100 |   180
// Total  | 230 | 220 |   450
```

**`Example`**

```ts
// countries › cities × years, revenue, all groups closed; pivot by another field with a select
const tableModel = PivotFactory.createTableModel<Order>({
  rows: orders,
  rowFields: ["country", "city"],
  columnFields: [{ name: "year", label: "Year", value: o => new Date(o.date).getFullYear() }],
  values: [{ value: "total", label: "Revenue" }],
  expanded: 0
});
select.addEventListener("change", () => tableApi.setPivotConfig({ columnFields: [select.value] }));
```

**`See`**

[Live demo: pivot tables](https://gui.expert/showcase/pivot/run/) · Training: [Pivot tables](https://gui.expert/training/pivot-tables/)

**`Since`**

1.1.94

## Table of contents

### Constructors

- [constructor](PivotFactory.md#constructor)

### Methods

- [createTableModel](PivotFactory.md#createtablemodel)

## Constructors

### constructor

• **new PivotFactory**(): [`PivotFactory`](PivotFactory.md)

#### Returns

[`PivotFactory`](PivotFactory.md)

## Methods

### createTableModel

▸ **createTableModel**\<`T`\>(`p`): [`PivotTableModel`](PivotTableModel.md)\<`T`\>

Creates the table model of a pivot table (see the class description).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `p` | [`PivotTableModelParaIf`](../interfaces/PivotTableModelParaIf.md)\<`T`\> | rows, row fields, column fields, values, options |

#### Returns

[`PivotTableModel`](PivotTableModel.md)\<`T`\>

the table model – a [TableModelIf](../interfaces/TableModelIf.md)

**`Example`**

```ts
// case 3: the average – Jan total is 230 / 3 = 76.67, not the mean of the region averages (77.5)
const tableModel = PivotFactory.createTableModel<Sale>({
  rows: sales, rowFields: ["region"], columnFields: ["monat"],
  values: [{ value: "umsatz", aggregator: "avg" }]
});
```

#### Defined in

[src/lib/table/factory/pivot-factory.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/pivot-factory.ts#L70)
