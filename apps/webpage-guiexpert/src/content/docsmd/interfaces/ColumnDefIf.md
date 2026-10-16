[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnDefIf

# Interface: ColumnDefIf

Describes one column: which property it shows, header label, width, CSS classes, renderers,
sorting, editing and visibility. Create it with [ColumnDef](../classes/ColumnDef.md) – `new ColumnDef(property, label, width, classes)`
or [ColumnDef.create](../classes/ColumnDef.md#create) with named parameters.

Column indices (e.g. in [AreaModelIf.getValueAt](AreaModelIf.md#getvalueat)) are positions in the `columnDefs` array –
fixed columns and hidden columns included.

**`Example`**

```ts
const columnDefs: ColumnDefIf[] = [
  new ColumnDef("id", "ID", px80, allRight),
  ColumnDef.create({
    property: "total", headerLabel: "Total", width: px120,
    headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"],
    sortable: TrueFn, sortState: "desc"
  })
];
```

**`See`**

Training: [Columns with ColumnDef](https://gui.expert/training/column-definitions/)

## Implemented by

- [`CheckboxColumnDef`](../classes/CheckboxColumnDef.md)
- [`ColumnDef`](../classes/ColumnDef.md)
- [`RowNumberColumnDef`](../classes/RowNumberColumnDef.md)

## Table of contents

### Properties

- [classes](ColumnDefIf.md#classes)
- [editInputPipe](ColumnDefIf.md#editinputpipe)
- [editable](ColumnDefIf.md#editable)
- [formula](ColumnDefIf.md#formula)
- [getEditRenderer](ColumnDefIf.md#geteditrenderer)
- [headerLabel](ColumnDefIf.md#headerlabel)
- [isVisible](ColumnDefIf.md#isvisible)
- [maxWidth](ColumnDefIf.md#maxwidth)
- [minWidth](ColumnDefIf.md#minwidth)
- [property](ColumnDefIf.md#property)
- [rendererMap](ColumnDefIf.md#renderermap)
- [rowDrag](ColumnDefIf.md#rowdrag)
- [showValuesAs](ColumnDefIf.md#showvaluesas)
- [sortComparator](ColumnDefIf.md#sortcomparator)
- [sortIconVisible](ColumnDefIf.md#sorticonvisible)
- [sortState](ColumnDefIf.md#sortstate)
- [sortStatesOrder](ColumnDefIf.md#sortstatesorder)
- [sortable](ColumnDefIf.md#sortable)
- [validate](ColumnDefIf.md#validate)
- [valueGetter](ColumnDefIf.md#valuegetter)
- [valueSetter](ColumnDefIf.md#valuesetter)
- [width](ColumnDefIf.md#width)

## Properties

### classes

• **classes**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\>

CSS classes per area – `classes.header`, `.body`, `.footer`. The constants [bodyLeft](../modules.md#bodyleft), [allRight](../modules.md#allright) …
are ready-made maps for the alignment.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L80)

___

### editInputPipe

• `Optional` **editInputPipe**: [`editInputPipe`](editInputPipe.md)

Converts the text of the editor before it is written into the model, e.g. [editInputPipeForNumber](../modules.md#editinputpipefornumber).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:122](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L122)

___

### editable

• `Optional` **editable**: [`BooleanFunction`](../modules.md#booleanfunction)

The cells of this column can be edited (double-click or F2), e.g. `TrueFn`.

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L106)

___

### formula

• `Optional` **formula**: `string`

The formula of a formula column (`ColumnDef.create({ formula })` compiles it into the `valueGetter`), e.g.
`"[price] * [quantity] * 1.19"`. Informational – change it with [TableApi.setColumnFormula](../classes/TableApi.md#setcolumnformula).

**`See`**

[Live demo: formulas](https://gui.expert/showcase/formulas/run/) · Training: [Formulas your users can type](https://gui.expert/training/formulas/#formulas)

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:168](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L168)

___

### getEditRenderer

• `Optional` **getEditRenderer**: [`GetEditRenderer`](../modules.md#geteditrenderer)

The editor of this column. Default: `TableOptions.getEditRenderer` (a text input, [InputCellRenderer](../classes/InputCellRenderer.md)).

**`Example`**

```ts
getEditRenderer: () => new SelectCellRenderer(["open", "paid"].map(s => new ValueLabel(s, s)))
```

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L120)

___

### headerLabel

• **headerLabel**: `string`

Text of the header cell (used when the header is built from the column definitions).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L58)

___

### isVisible

• `Optional` **isVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Whether the column is shown. Hidden columns are not rendered, copied or exported.

**`Example`**

```ts
ColumnDef.create({ property: "category", headerLabel: "Category", isVisible: FalseFn })
```

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:113](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L113)

___

### maxWidth

• **maxWidth**: [`SizeIf`](SizeIf.md)

Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L64)

___

### minWidth

• **minWidth**: [`SizeIf`](SizeIf.md)

Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L62)

___

### property

• **property**: `string`

Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L56)

___

### rendererMap

• **rendererMap**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`CellRendererIf`](CellRendererIf.md)\>

Cell renderers per area – `rendererMap.header`, `.body`, `.footer`.
Without a renderer the value is shown as text.

**`Example`**

```ts
column.rendererMap.body = new NumberCellProgressBarCellRenderer(20, false);
column.rendererMap.footer = new EuroRenderer();     // an own CellRendererIf
```

**`See`**

Training: [Cell renderers](https://gui.expert/training/cell-renderers/)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L75)

___

### rowDrag

• `Optional` **rowDrag**: [`RowDragColumnOption`](../modules.md#rowdragcolumnoption)

Row drag: the body cells of this column get a drag handle (`true`, or a function that decides per row – e.g. no
handle for locked rows). Dragging the handle moves the row (see [TableOptionsIf.rowDragOptions](TableOptionsIf.md#rowdragoptions)); the keyboard
alternative is Ctrl+Alt+↑/↓. `TableFactory.createTableModel({ rows, rowDrag: true })` sets it on the first data
column.

**`Example`**

```ts
ColumnDef.create({ property: "title", headerLabel: "Task", rowDrag: (task: { locked: boolean }) => !task.locked })
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:180](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L180)

___

### showValuesAs

• `Optional` **showValuesAs**: [`ShowValuesAsConfig`](../modules.md#showvaluesasconfig)

Shows the numbers of the column differently without changing the data: share of the column total, running
total, rank … (see [ShowValuesAs](../modules.md#showvaluesas)). Change it at runtime with [TableApi.setShowValuesAs](../classes/TableApi.md#setshowvaluesas).

**`Example`**

```ts
ColumnDef.create({ property: "total", headerLabel: "Share", showValuesAs: "percentOfColumnTotal" })
```

**`See`**

Training: [Show values as](https://gui.expert/training/formulas/#show-values-as)

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:160](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L160)

___

### sortComparator

• `Optional` **sortComparator**: [`ValueRowSortComparator`](../modules.md#valuerowsortcomparator)

Own comparison of two cell values (and their rows), like for `Array.prototype.sort`.

**`Example`**

```ts
sortComparator: (a: string, b: string) => a.localeCompare(b, "de")     // "Müller" before "Nordlicht"
```

**`See`**

Training: [Sorting](https://gui.expert/training/sorting/)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:93](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L93)

___

### sortIconVisible

• `Optional` **sortIconVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Show the sort icon in the header. Default: follows `sortable` resp. `sortState`.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L84)

___

### sortState

• `Optional` **sortState**: [`SortState`](../modules.md#sortstate)

The sort icon shown in the header: `"asc"`, `"desc"` or `""` (none). It only sets the icon –
sort the rows once with [TableModelIf.doSort](TableModelIf.md#dosort) to match it.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L98)

___

### sortStatesOrder

• `Optional` **sortStatesOrder**: [`SortState`](../modules.md#sortstate)[]

Order of the sort states on repeated double-clicks. Default: `TableOptions.sortOrder` (`["asc", "desc"]`).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:100](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L100)

___

### sortable

• `Optional` **sortable**: [`BooleanFunction`](../modules.md#booleanfunction)

The column can be sorted by a double-click on its header (e.g. `TrueFn`).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L82)

___

### validate

• `Optional` **validate**: [`CellValidator`](../modules.md#cellvalidator)\<`any`\>

Checks an edited, filled or pasted value (after `editInputPipe`): return a message for an invalid value,
`undefined` for a valid one. Batch edit: invalid values are marked (`ge-table-cell-invalid`, the message as
tooltip) and block [TableApi.commitBatchEdit](../classes/TableApi.md#commitbatchedit); otherwise an invalid value is not written.

**`Example`**

```ts
ColumnDef.create({
  property: "price", headerLabel: "Price", editable: TrueFn, editInputPipe: editInputPipeForNumber,
  validate: (value: unknown) => typeof value === "number" && value >= 0 ? undefined : "A price is a number ≥ 0",
})
```

**`Since`**

1.1.96

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:194](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L194)

___

### valueGetter

• `Optional` **valueGetter**: [`ValueGetter`](../modules.md#valuegetter)

A calculated column: computes the value from the row instead of reading `property` (the data stays unchanged).
Sorting, filter ([TableApi.getRowValue](../classes/TableApi.md#getrowvalue)), copy, Excel, totals (`footerAggregates`) and row groups use the
computed value. `property` stays the id of the column (state, `footerAggregates`, other formulas).
Without a [ColumnDefIf.valueSetter](ColumnDefIf.md#valuesetter) the column cannot be edited.

Supported by the models of `TableFactory.createTableModel({ rows })`, trees, row groups (not by array-of-arrays
models; an own `AreaModel` calls it itself).

**`Example`**

```ts
ColumnDef.create({ property: "total", headerLabel: "Total", sortable: TrueFn,
                   valueGetter: (o: Item) => o.price * o.quantity })
```

**`See`**

[Live demo: formulas & calculated columns](https://gui.expert/showcase/formulas/run/) · Training: [Calculated columns, “Show values as” and formulas](https://gui.expert/training/formulas/)

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:140](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L140)

___

### valueSetter

• `Optional` **valueSetter**: [`ValueSetter`](../modules.md#valuesetter)

Makes a calculated column editable: writes the edited value back into the row (return `false` to reject).

**`Example`**

```ts
valueSetter: (o: Item, v: unknown) => { o.price = Number(v) / o.quantity; }
```

**`Since`**

1.1.95

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:149](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L149)

___

### width

• **width**: [`SizeIf`](SizeIf.md)

Width of the column: `px120`, `new Size(10, "%")` or `new Size(1, "weight")`. See [SizeUnitType](../modules.md#sizeunittype).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L60)
