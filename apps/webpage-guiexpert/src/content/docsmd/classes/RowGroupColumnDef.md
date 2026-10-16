[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowGroupColumnDef

# Class: RowGroupColumnDef

The group column of a row grouping: arrows, indentation and the group labels (`"Nord (3)"`). Created by
[RowGroupFactory.createTableModel](RowGroupFactory.md#createtablemodel); the column is sortable (by group key) and not editable. Its property is
[RowGroupColumnDef.PROPERTY](RowGroupColumnDef.md#property-1) – sort and state refer to it like to any column.

**`Example`**

```ts
const tableModel = RowGroupFactory.createTableModel<Sale>({ rows: sales, columnDefs, groupBy: ["region"] });
const groupColumn = tableModel.getColumnDefs()?.find(isRowGroupColumnDef);
```

**`Since`**

1.1.94

## Hierarchy

- [`ColumnDef`](ColumnDef.md)

  ↳ **`RowGroupColumnDef`**

## Table of contents

### Constructors

- [constructor](RowGroupColumnDef.md#constructor)

### Properties

- [autoHeaderLabel](RowGroupColumnDef.md#autoheaderlabel)
- [classes](RowGroupColumnDef.md#classes)
- [editInputPipe](RowGroupColumnDef.md#editinputpipe)
- [editable](RowGroupColumnDef.md#editable)
- [formula](RowGroupColumnDef.md#formula)
- [getEditRenderer](RowGroupColumnDef.md#geteditrenderer)
- [headerLabel](RowGroupColumnDef.md#headerlabel)
- [isVisible](RowGroupColumnDef.md#isvisible)
- [maxWidth](RowGroupColumnDef.md#maxwidth)
- [minWidth](RowGroupColumnDef.md#minwidth)
- [options](RowGroupColumnDef.md#options)
- [property](RowGroupColumnDef.md#property)
- [rendererMap](RowGroupColumnDef.md#renderermap)
- [rowDrag](RowGroupColumnDef.md#rowdrag)
- [showValuesAs](RowGroupColumnDef.md#showvaluesas)
- [sortComparator](RowGroupColumnDef.md#sortcomparator)
- [sortIconVisible](RowGroupColumnDef.md#sorticonvisible)
- [sortState](RowGroupColumnDef.md#sortstate)
- [sortStatesOrder](RowGroupColumnDef.md#sortstatesorder)
- [sortable](RowGroupColumnDef.md#sortable)
- [type](RowGroupColumnDef.md#type)
- [validate](RowGroupColumnDef.md#validate)
- [valueGetter](RowGroupColumnDef.md#valuegetter)
- [valueSetter](RowGroupColumnDef.md#valuesetter)
- [visible](RowGroupColumnDef.md#visible)
- [width](RowGroupColumnDef.md#width)
- [PROPERTY](RowGroupColumnDef.md#property-1)

### Methods

- [bodyRenderer](RowGroupColumnDef.md#bodyrenderer)
- [create](RowGroupColumnDef.md#create)

## Constructors

### constructor

• **new RowGroupColumnDef**(`options?`): [`RowGroupColumnDef`](RowGroupColumnDef.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`\<[`RowGroupColumnOptionsIf`](../interfaces/RowGroupColumnOptionsIf.md)\<`any`\>\> |

#### Returns

[`RowGroupColumnDef`](RowGroupColumnDef.md)

#### Overrides

[ColumnDef](ColumnDef.md).[constructor](ColumnDef.md#constructor)

#### Defined in

[src/lib/table/rowgroup/row-group-column-def.ts:33](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-def.ts#L33)

## Properties

### autoHeaderLabel

• `Readonly` **autoHeaderLabel**: `boolean`

True if the header follows the grouping (no own `headerLabel`).

#### Defined in

[src/lib/table/rowgroup/row-group-column-def.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-def.ts#L31)

___

### classes

• **classes**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\>

CSS classes per area – `classes.header`, `.body`, `.footer`. The constants [bodyLeft](../modules.md#bodyleft), [allRight](../modules.md#allright) …
are ready-made maps for the alignment.

#### Inherited from

[ColumnDef](ColumnDef.md).[classes](ColumnDef.md#classes)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L64)

___

### editInputPipe

• `Optional` **editInputPipe**: [`editInputPipe`](../interfaces/editInputPipe.md)

Converts the text of the editor before it is written into the model, e.g. [editInputPipeForNumber](../modules.md#editinputpipefornumber).

#### Inherited from

[ColumnDef](ColumnDef.md).[editInputPipe](ColumnDef.md#editinputpipe)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:75](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L75)

___

### editable

• `Optional` **editable**: [`BooleanFunction`](../modules.md#booleanfunction)

The cells of this column can be edited (double-click or F2), e.g. `TrueFn`.

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Inherited from

[ColumnDef](ColumnDef.md).[editable](ColumnDef.md#editable)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L73)

___

### formula

• `Optional` **formula**: `string`

The formula of a formula column, see [ColumnDefIf.formula](../interfaces/ColumnDefIf.md#formula).

#### Inherited from

[ColumnDef](ColumnDef.md).[formula](ColumnDef.md#formula)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L55)

___

### getEditRenderer

• `Optional` **getEditRenderer**: [`GetEditRenderer`](../modules.md#geteditrenderer)

The editor of this column. Default: `TableOptions.getEditRenderer` (a text input, [InputCellRenderer](InputCellRenderer.md)).

**`Example`**

```ts
getEditRenderer: () => new SelectCellRenderer(["open", "paid"].map(s => new ValueLabel(s, s)))
```

#### Inherited from

[ColumnDef](ColumnDef.md).[getEditRenderer](ColumnDef.md#geteditrenderer)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L74)

___

### headerLabel

• **headerLabel**: `string`

Text of the header cell (used when the header is built from the column definitions).

#### Inherited from

[ColumnDef](ColumnDef.md).[headerLabel](ColumnDef.md#headerlabel)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L62)

___

### isVisible

• **isVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Whether the column is shown. Hidden columns are not rendered, copied or exported.

**`Example`**

```ts
ColumnDef.create({ property: "category", headerLabel: "Category", isVisible: FalseFn })
```

#### Inherited from

[ColumnDef](ColumnDef.md).[isVisible](ColumnDef.md#isvisible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:76](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L76)

___

### maxWidth

• **maxWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Inherited from

[ColumnDef](ColumnDef.md).[maxWidth](ColumnDef.md#maxwidth)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L67)

___

### minWidth

• **minWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Inherited from

[ColumnDef](ColumnDef.md).[minWidth](ColumnDef.md#minwidth)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L66)

___

### options

• `Readonly` **options**: [`RowGroupColumnOptionsIf`](../interfaces/RowGroupColumnOptionsIf.md)\<`any`\>

The options with defaults.

#### Defined in

[src/lib/table/rowgroup/row-group-column-def.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-def.ts#L28)

___

### property

• **property**: `string`

Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`.

#### Inherited from

[ColumnDef](ColumnDef.md).[property](ColumnDef.md#property)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L61)

___

### rendererMap

• **rendererMap**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`CellRendererIf`](../interfaces/CellRendererIf.md)\>

Cell renderers per area – `rendererMap.header`, `.body`, `.footer`.
Without a renderer the value is shown as text.

**`Example`**

```ts
column.rendererMap.body = new NumberCellProgressBarCellRenderer(20, false);
column.rendererMap.footer = new EuroRenderer();     // an own CellRendererIf
```

**`See`**

Training: [Cell renderers](https://gui.expert/training/cell-renderers/)

#### Inherited from

[ColumnDef](ColumnDef.md).[rendererMap](ColumnDef.md#renderermap)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L65)

___

### rowDrag

• `Optional` **rowDrag**: [`RowDragColumnOption`](../modules.md#rowdragcolumnoption)

Row drag: the body cells of this column get a drag handle (`true`, or a function that decides per row – e.g. no
handle for locked rows). Dragging the handle moves the row (see [TableOptionsIf.rowDragOptions](../interfaces/TableOptionsIf.md#rowdragoptions)); the keyboard
alternative is Ctrl+Alt+↑/↓. `TableFactory.createTableModel({ rows, rowDrag: true })` sets it on the first data
column.

**`Example`**

```ts
ColumnDef.create({ property: "title", headerLabel: "Task", rowDrag: (task: { locked: boolean }) => !task.locked })
```

**`Since`**

1.1.95

#### Inherited from

[ColumnDef](ColumnDef.md).[rowDrag](ColumnDef.md#rowdrag)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L56)

___

### showValuesAs

• `Optional` **showValuesAs**: [`ShowValuesAsConfig`](../modules.md#showvaluesasconfig)

„Show values as“, see [ColumnDefIf.showValuesAs](../interfaces/ColumnDefIf.md#showvaluesas).

#### Inherited from

[ColumnDef](ColumnDef.md).[showValuesAs](ColumnDef.md#showvaluesas)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L53)

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

#### Inherited from

[ColumnDef](ColumnDef.md).[sortComparator](ColumnDef.md#sortcomparator)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L69)

___

### sortIconVisible

• `Optional` **sortIconVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Show the sort icon in the header. Default: follows `sortable` resp. `sortState`.

#### Inherited from

[ColumnDef](ColumnDef.md).[sortIconVisible](ColumnDef.md#sorticonvisible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L72)

___

### sortState

• `Optional` **sortState**: [`SortState`](../modules.md#sortstate)

The sort icon shown in the header: `"asc"`, `"desc"` or `""` (none). It only sets the icon –
sort the rows once with [TableModelIf.doSort](../interfaces/TableModelIf.md#dosort) to match it.

#### Inherited from

[ColumnDef](ColumnDef.md).[sortState](ColumnDef.md#sortstate)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L70)

___

### sortStatesOrder

• `Optional` **sortStatesOrder**: [`SortState`](../modules.md#sortstate)[]

Order of the sort states on repeated double-clicks. Default: `TableOptions.sortOrder` (`["asc", "desc"]`).

#### Inherited from

[ColumnDef](ColumnDef.md).[sortStatesOrder](ColumnDef.md#sortstatesorder)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L71)

___

### sortable

• `Optional` **sortable**: [`BooleanFunction`](../modules.md#booleanfunction)

The column can be sorted by a double-click on its header (e.g. `TrueFn`).

#### Inherited from

[ColumnDef](ColumnDef.md).[sortable](ColumnDef.md#sortable)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L68)

___

### type

• `Readonly` **type**: ``"RowGroupColumnDef"``

Marker for [isRowGroupColumnDef](../modules.md#isrowgroupcolumndef) (works across copies of the core).

#### Defined in

[src/lib/table/rowgroup/row-group-column-def.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-def.ts#L25)

___

### validate

• `Optional` **validate**: [`CellValidator`](../modules.md#cellvalidator)

Checks edited values, see [ColumnDefIf.validate](../interfaces/ColumnDefIf.md#validate) (since 1.1.96).

#### Inherited from

[ColumnDef](ColumnDef.md).[validate](ColumnDef.md#validate)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L58)

___

### valueGetter

• `Optional` **valueGetter**: [`ValueGetter`](../modules.md#valuegetter)

A calculated column, see [ColumnDefIf.valueGetter](../interfaces/ColumnDefIf.md#valuegetter).

#### Inherited from

[ColumnDef](ColumnDef.md).[valueGetter](ColumnDef.md#valuegetter)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L49)

___

### valueSetter

• `Optional` **valueSetter**: [`ValueSetter`](../modules.md#valuesetter)

Writes an edited calculated value back, see [ColumnDefIf.valueSetter](../interfaces/ColumnDefIf.md#valuesetter).

#### Inherited from

[ColumnDef](ColumnDef.md).[valueSetter](ColumnDef.md#valuesetter)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L51)

___

### visible

• **visible**: `boolean` = `true`

#### Inherited from

[ColumnDef](ColumnDef.md).[visible](ColumnDef.md#visible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L46)

___

### width

• **width**: [`SizeIf`](../interfaces/SizeIf.md)

Width of the column: `px120`, `new Size(10, "%")` or `new Size(1, "weight")`. See [SizeUnitType](../modules.md#sizeunittype).

#### Inherited from

[ColumnDef](ColumnDef.md).[width](ColumnDef.md#width)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L63)

___

### PROPERTY

▪ `Static` `Readonly` **PROPERTY**: ``"RowGroupColumn"``

The property of the group column.

#### Defined in

[src/lib/table/rowgroup/row-group-column-def.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/rowgroup/row-group-column-def.ts#L22)

## Methods

### bodyRenderer

▸ **bodyRenderer**(`bodyRenderer`): [`AreaObjectMap`](AreaObjectMap.md)\<[`CellRendererIf`](../interfaces/CellRendererIf.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bodyRenderer` | [`CellRendererIf`](../interfaces/CellRendererIf.md) |

#### Returns

[`AreaObjectMap`](AreaObjectMap.md)\<[`CellRendererIf`](../interfaces/CellRendererIf.md)\>

#### Inherited from

[ColumnDef](ColumnDef.md).[bodyRenderer](ColumnDef.md#bodyrenderer)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:84](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L84)

___

### create

▸ **create**(`param`): [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

Creates a column definition from named parameters. Everything is optional; defaults: width 100 px,
visible, not editable, sortable only if `sortable` is given.

`headerRenderer` / `bodyRenderer` / `footerRenderer` and `headerClasses` / `bodyClasses` / `footerClasses`
fill [ColumnDefIf.rendererMap](../interfaces/ColumnDefIf.md#renderermap) and [ColumnDefIf.classes](../interfaces/ColumnDefIf.md#classes).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param` | `Object` | - |
| `param.bodyClasses?` | `string`[] | CSS classes of the body cells. |
| `param.bodyRenderer?` | [`CellRendererIf`](../interfaces/CellRendererIf.md) | Renderer of the body cells. |
| `param.editInputPipe?` | [`editInputPipe`](../interfaces/editInputPipe.md) | Converts the editor text before it is stored, e.g. `editInputPipeForNumber`. |
| `param.editable?` | [`BooleanFunction`](../modules.md#booleanfunction) | Cells can be edited, e.g. `TrueFn`. |
| `param.footerClasses?` | `string`[] | CSS classes of the footer cells. |
| `param.footerRenderer?` | [`CellRendererIf`](../interfaces/CellRendererIf.md) | Renderer of the footer cells. |
| `param.formula?` | `string` | A formula column, e.g. `"[price] * [quantity] * 1.19"` – compiled once into the `valueGetter` (since 1.1.95, see [compileFormula](../modules.md#compileformula)). Takes precedence over `valueGetter`. |
| `param.formulaOptions?` | [`FormulaOptionsIf`](../interfaces/FormulaOptionsIf.md) | Own functions of the formula (since 1.1.95). |
| `param.getEditRenderer?` | [`GetEditRenderer`](../modules.md#geteditrenderer) | The editor of this column. |
| `param.headerClasses?` | `string`[] | CSS classes of the header cell, e.g. `["ge-table-text-align-right"]`. |
| `param.headerLabel?` | `string` | Header label. |
| `param.headerRenderer?` | [`CellRendererIf`](../interfaces/CellRendererIf.md) | Renderer of the header cell. |
| `param.isVisible?` | [`BooleanFunction`](../modules.md#booleanfunction) | Column is shown (default `TrueFn`). |
| `param.maxWidth?` | [`SizeIf`](../interfaces/SizeIf.md) | Upper limit for % widths. |
| `param.minWidth?` | [`SizeIf`](../interfaces/SizeIf.md) | Lower limit for % widths. |
| `param.property?` | `string` | Property of the row object, see [ColumnDefIf.property](../interfaces/ColumnDefIf.md#property). |
| `param.rowDrag?` | [`RowDragColumnOption`](../modules.md#rowdragcolumnoption) | - |
| `param.showValuesAs?` | [`ShowValuesAsConfig`](../modules.md#showvaluesasconfig) | „Show values as“: `"percentOfColumnTotal"`, `"rank"` … (since 1.1.95). |
| `param.sortComparator?` | [`ValueRowSortComparator`](../modules.md#valuerowsortcomparator) | Own comparison of two cell values. |
| `param.sortIconVisible?` | [`BooleanFunction`](../modules.md#booleanfunction) | Show the sort icon (default: follows `sortable`). |
| `param.sortState?` | [`SortState`](../modules.md#sortstate) | Initial sort icon (`"asc"`, `"desc"`); sort the rows with `tableModel.doSort()` to match. |
| `param.sortStatesOrder?` | [`SortState`](../modules.md#sortstate)[] | Order of the sort states on repeated double-clicks. |
| `param.sortable?` | [`BooleanFunction`](../modules.md#booleanfunction) | Sortable by double-click on the header, e.g. `TrueFn`. |
| `param.validate?` | [`CellValidator`](../modules.md#cellvalidator) | Checks edited values: a message for an invalid value (since 1.1.96). |
| `param.valueGetter?` | [`ValueGetter`](../modules.md#valuegetter) | A calculated column: `(row, context) => value` (since 1.1.95). |
| `param.valueSetter?` | [`ValueSetter`](../modules.md#valuesetter) | Makes a calculated column editable (since 1.1.95). |
| `param.width?` | [`SizeIf`](../interfaces/SizeIf.md) | Width, default 100 px. |

#### Returns

[`ColumnDefIf`](../interfaces/ColumnDefIf.md)

**`Example`**

```ts
ColumnDef.create({
  property: "price", headerLabel: "Price", width: px100,
  headerClasses: ["ge-table-text-align-right"], bodyClasses: ["ge-table-text-align-right"],
  sortable: TrueFn
});
```

#### Inherited from

[ColumnDef](ColumnDef.md).[create](ColumnDef.md#create)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:106](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L106)
