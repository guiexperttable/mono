[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CreateTableModelPara

# Interface: CreateTableModelPara

Parameters of [TableFactory.createTableModel](../classes/TableFactory.md#createtablemodel) – pass any subset (`Partial<CreateTableModelPara>`).

Three typical combinations:

| You have … | Pass | Training |
|---|---|---|
| an array of objects | `rows` (+ `properties` or `columnDefs`) | [chapter 12](https://gui.expert/training/array-to-table-model/), [13](https://gui.expert/training/column-definitions/) |
| rows of values (CSV, matrix) | `headerData`, `bodyData`, `footerData`, `columnSizes` | [chapter 14](https://gui.expert/training/array-of-arrays/) |
| own area models | `headerAreaModel`, `bodyAreaModel`, `footerAreaModel` + `columnDefs` | [chapter 15–17](https://gui.expert/training/custom-area-model/) |

Everything not given is derived: column definitions from `properties` or the keys of the first row
(header label = key in upper case, width 200 px), area models from the data, row heights from
`tableOptions.defaultRowHeights`.

**`Example`**

```ts
const tableModel = TableFactory.createTableModel({
  rows: orders,                                   // Order[]
  columnDefs: [new ColumnDef("id", "ID", px80, allRight), new ColumnDef("customer", "Customer", px180)],
  fixedLeftColumnCount: 1,
  tableOptions
});
```

## Table of contents

### Properties

- [bodyAreaModel](CreateTableModelPara.md#bodyareamodel)
- [bodyData](CreateTableModelPara.md#bodydata)
- [columnCount](CreateTableModelPara.md#columncount)
- [columnDefs](CreateTableModelPara.md#columndefs)
- [columnLetters](CreateTableModelPara.md#columnletters)
- [columnSizes](CreateTableModelPara.md#columnsizes)
- [defaultRowHeights](CreateTableModelPara.md#defaultrowheights)
- [fixedLeftColumnCount](CreateTableModelPara.md#fixedleftcolumncount)
- [fixedRightColumnCount](CreateTableModelPara.md#fixedrightcolumncount)
- [footerAggregates](CreateTableModelPara.md#footeraggregates)
- [footerAreaModel](CreateTableModelPara.md#footerareamodel)
- [footerData](CreateTableModelPara.md#footerdata)
- [getSelectionModel](CreateTableModelPara.md#getselectionmodel)
- [headerAreaModel](CreateTableModelPara.md#headerareamodel)
- [headerData](CreateTableModelPara.md#headerdata)
- [overridingColumnWidth](CreateTableModelPara.md#overridingcolumnwidth)
- [parentSize](CreateTableModelPara.md#parentsize)
- [properties](CreateTableModelPara.md#properties)
- [rowCheckboxVisible](CreateTableModelPara.md#rowcheckboxvisible)
- [rowDrag](CreateTableModelPara.md#rowdrag)
- [rowNumbersVisible](CreateTableModelPara.md#rownumbersvisible)
- [rows](CreateTableModelPara.md#rows)
- [tableOptions](CreateTableModelPara.md#tableoptions)

## Properties

### bodyAreaModel

• **bodyAreaModel**: [`AreaModelIf`](AreaModelIf.md)

Model of the body. Default: built from `rows` (objects or tree rows) or `bodyData`. See [AreaModel](../classes/AreaModel.md) for own models.

#### Defined in

[src/lib/table/factory/table-factory.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L60)

___

### bodyData

• **bodyData**: `any`[][]

The body as rows of values (`any[][]`).

#### Defined in

[src/lib/table/factory/table-factory.ts:144](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L144)

___

### columnCount

• **columnCount**: `number`

Number of columns. Default: derived from `columnDefs`, `headerData` or `columnSizes`.

#### Defined in

[src/lib/table/factory/table-factory.ts:134](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L134)

___

### columnDefs

• **columnDefs**: [`ColumnDefIf`](ColumnDefIf.md)[]

The columns: property, header label, width, classes, renderers, sorting, editing. See [ColumnDef](../classes/ColumnDef.md).

#### Defined in

[src/lib/table/factory/table-factory.ts:128](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L128)

___

### columnLetters

• **columnLetters**: `boolean`

Column letters `A, B, …` as an extra header row above the header labels (like a spreadsheet; for cell formulas,
[TableOptionsIf.cellFormulas](TableOptionsIf.md#cellformulas)). A click on a letter selects the column (selection type `"range"`).
Row number and checkbox columns get no letter. Only with the default header (labels or `headerData`).

**`Example`**

```ts
const tableModel = TableFactory.createTableModel({ rows, columnDefs, rowNumbersVisible: { mode: "original" }, columnLetters: true });
```

**`Since`**

1.1.99

#### Defined in

[src/lib/table/factory/table-factory.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L124)

___

### columnSizes

• **columnSizes**: `number`[]

Column widths in px – the simple alternative to `columnDefs` (e.g. with `bodyData`).

#### Defined in

[src/lib/table/factory/table-factory.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L130)

___

### defaultRowHeights

• **defaultRowHeights**: [`DefaultRowHeightsIf`](DefaultRowHeightsIf.md)

Row heights of header, body and footer in px. Default: `tableOptions.defaultRowHeights`, otherwise 34 / 34 / 34.

#### Defined in

[src/lib/table/factory/table-factory.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L126)

___

### fixedLeftColumnCount

• **fixedLeftColumnCount**: `number`

Number of columns fixed on the left (side "west"). Default 0.

#### Defined in

[src/lib/table/factory/table-factory.ts:81](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L81)

___

### fixedRightColumnCount

• **fixedRightColumnCount**: `number`

Number of columns fixed on the right (side "east"). Default 0.

#### Defined in

[src/lib/table/factory/table-factory.ts:83](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L83)

___

### footerAggregates

• **footerAggregates**: [`AggregateFooterConfig`](../modules.md#aggregatefooterconfig)

A footer with totals that follow filter and sorting ([AreaModelAggregateFooter](../classes/AreaModelAggregateFooter.md)): `{ total: "sum" }` (one
row – the key is the property of the column), `[{ label, aggregates }, …]` (several rows) or full
[AggregateFooterOptionsIf](AggregateFooterOptionsIf.md). Row height: `defaultRowHeights.footer`. Ignored with an own `footerAreaModel`
(warning); `footerData` is ignored with it (warning).

**`Example`**

```ts
const tableModel = TableFactory.createTableModel({
  rows: orders,
  columnDefs,
  footerAggregates: { quantity: "sum", total: "sum" }       // footer: "100,000 rows" | … | 549,812 | 27,481,033.5
});
```

**`See`**

[Live demo: totals & aggregation](https://gui.expert/showcase/aggregation/run/) · Training: [Totals in one option](https://gui.expert/training/footer-totals/#built-in)

**`Since`**

1.1.94

#### Defined in

[src/lib/table/factory/table-factory.ts:79](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L79)

___

### footerAreaModel

• **footerAreaModel**: [`AreaModelIf`](AreaModelIf.md)

Model of the footer. Default: `footerAggregates`, `footerData`, otherwise no footer.

#### Defined in

[src/lib/table/factory/table-factory.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L62)

___

### footerData

• **footerData**: `string`[][]

Footer rows as values (static – they don't follow filter or edits).

#### Defined in

[src/lib/table/factory/table-factory.ts:148](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L148)

___

### getSelectionModel

• **getSelectionModel**: [`GetT`](../modules.md#gett)\<[`SelectionModelIf`](SelectionModelIf.md)\>

Selection model factory. Default: `tableOptions.getSelectionModel`.

#### Defined in

[src/lib/table/factory/table-factory.ts:138](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L138)

___

### headerAreaModel

• **headerAreaModel**: [`AreaModelIf`](AreaModelIf.md)

Model of the header. Default: one header row from the `headerLabel`s of `columnDefs`, or `headerData`.

#### Defined in

[src/lib/table/factory/table-factory.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L58)

___

### headerData

• **headerData**: `string`[][]

Header rows as values – several rows are possible.

#### Defined in

[src/lib/table/factory/table-factory.ts:146](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L146)

___

### overridingColumnWidth

• **overridingColumnWidth**: `number`

A width in px for all columns; -1 (default) = use the column definitions.

#### Defined in

[src/lib/table/factory/table-factory.ts:132](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L132)

___

### parentSize

• **parentSize**: `number`

Width of the parent element in px, used for percentage column widths before the first render (default 400).

#### Defined in

[src/lib/table/factory/table-factory.ts:136](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L136)

___

### properties

• **properties**: `string`[]

Which properties of `rows` become columns, in this order (ignored if `columnDefs` is given).

#### Defined in

[src/lib/table/factory/table-factory.ts:142](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L142)

___

### rowCheckboxVisible

• **rowCheckboxVisible**: `boolean`

Show a checkbox column for every row. Default false.

#### Defined in

[src/lib/table/factory/table-factory.ts:85](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L85)

___

### rowDrag

• **rowDrag**: `boolean`

Row drag: `true` puts a drag handle into the first data column (behind row numbers and checkboxes) –
sets [ColumnDefIf.rowDrag](ColumnDefIf.md#rowdrag) on that column definition. Options: [TableOptionsIf.rowDragOptions](TableOptionsIf.md#rowdragoptions).
Default false.

**`Example`**

```ts
const tableModel = TableFactory.createTableModel({ rows: orders, rowDrag: true });
```

**`See`**

[Live demo: row drag](https://gui.expert/showcase/rowdrag/run/) · Training: [Dragging rows into order](https://gui.expert/training/events-and-context-menu/#row-drag)

**`Since`**

1.1.95

#### Defined in

[src/lib/table/factory/table-factory.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L113)

___

### rowNumbersVisible

• **rowNumbersVisible**: `boolean` \| `Partial`\<[`RowNumberOptionsIf`](RowNumberOptionsIf.md)\>

Row numbers (1, 2, 3 …) in a column in front of all others, fixed on the left: `true` or options
([RowNumberOptionsIf](RowNumberOptionsIf.md)). Puts a [RowNumberColumnDef](../classes/RowNumberColumnDef.md) in front of `columnDefs` and adds 1 to
`fixedLeftColumnCount`; `headerData`/`footerData` get an empty cell in front. Default false.

The column is a real column: the indices of all other columns are one higher – use properties where you can
([TableApi.getColumnIndex](../classes/TableApi.md#getcolumnindex)). With `bodyData` or own area models the flag is ignored (with a warning), because
their columns would shift – put a `RowNumberColumnDef` into the column definitions of your models yourself.

**`Example`**

```ts
const tableModel = TableFactory.createTableModel({ rows: orders, columnDefs, rowNumbersVisible: true });
```

**`See`**

[Live demo: row numbers](https://gui.expert/showcase/rownumbers/run/) · Training: [Row numbers](https://gui.expert/training/fixed-columns/#row-numbers)

**`Since`**

1.1.93

#### Defined in

[src/lib/table/factory/table-factory.ts:101](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L101)

___

### rows

• **rows**: `any`[]

The rows as objects (`T[]`) or tree rows from [TreeFactory.buildTreeRows](../classes/TreeFactory.md#buildtreerows).

#### Defined in

[src/lib/table/factory/table-factory.ts:140](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L140)

___

### tableOptions

• **tableOptions**: [`TableOptionsIf`](TableOptionsIf.md)

Options of the table; the factory reads `defaultRowHeights`, `getSelectionModel` and `showCheckboxWihoutExtraColumn`.

#### Defined in

[src/lib/table/factory/table-factory.ts:150](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/factory/table-factory.ts#L150)
