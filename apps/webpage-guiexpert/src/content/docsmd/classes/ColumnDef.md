[GuiExpert Table API](../README.md) / [Exports](../modules.md) / ColumnDef

# Class: ColumnDef

The column definition – see [ColumnDefIf](../interfaces/ColumnDefIf.md) for all fields.

Two ways to create one:

**`Example`**

```ts
// short: property, header label, width, CSS classes
new ColumnDef("customer", "Customer", px180, bodyLeft);
new ColumnDef("total", "Total", px120, allRight);          // numbers: right-aligned in header, body and footer
```

**`Example`**

```ts
// named parameters for everything else
ColumnDef.create({
  property: "status",
  headerLabel: "Status",
  width: px110,
  bodyRenderer: new StatusBadgeRenderer(),
  sortable: TrueFn,
  sortComparator: (a: string, b: string) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b)
});
```

**`See`**

Training: [Columns with ColumnDef](https://gui.expert/training/column-definitions/),
  [Sorting](https://gui.expert/training/sorting/), [Cell renderers](https://gui.expert/training/cell-renderers/)

## Hierarchy

- **`ColumnDef`**

  ↳ [`RowGroupColumnDef`](RowGroupColumnDef.md)

  ↳ [`PivotColumnDef`](PivotColumnDef.md)

## Implements

- [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

## Table of contents

### Constructors

- [constructor](ColumnDef.md#constructor)

### Properties

- [classes](ColumnDef.md#classes)
- [editInputPipe](ColumnDef.md#editinputpipe)
- [editable](ColumnDef.md#editable)
- [formula](ColumnDef.md#formula)
- [getEditRenderer](ColumnDef.md#geteditrenderer)
- [headerLabel](ColumnDef.md#headerlabel)
- [isVisible](ColumnDef.md#isvisible)
- [maxWidth](ColumnDef.md#maxwidth)
- [minWidth](ColumnDef.md#minwidth)
- [property](ColumnDef.md#property)
- [rendererMap](ColumnDef.md#renderermap)
- [rowDrag](ColumnDef.md#rowdrag)
- [showValuesAs](ColumnDef.md#showvaluesas)
- [sortComparator](ColumnDef.md#sortcomparator)
- [sortIconVisible](ColumnDef.md#sorticonvisible)
- [sortState](ColumnDef.md#sortstate)
- [sortStatesOrder](ColumnDef.md#sortstatesorder)
- [sortable](ColumnDef.md#sortable)
- [valueGetter](ColumnDef.md#valuegetter)
- [valueSetter](ColumnDef.md#valuesetter)
- [visible](ColumnDef.md#visible)
- [width](ColumnDef.md#width)

### Methods

- [bodyRenderer](ColumnDef.md#bodyrenderer)
- [create](ColumnDef.md#create)

## Constructors

### constructor

• **new ColumnDef**(`property`, `headerLabel`, `width?`, `classes?`, `rendererMap?`, `minWidth?`, `maxWidth?`, `sortable?`, `sortComparator?`, `sortState?`, `sortStatesOrder?`, `sortIconVisible?`, `editable?`, `getEditRenderer?`, `editInputPipe?`, `isVisible?`): [`ColumnDef`](ColumnDef.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `string` |
| `headerLabel` | `string` |
| `width` | [`SizeIf`](../interfaces/SizeIf.md) |
| `classes` | [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\> |
| `rendererMap` | [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<[`CellRendererIf`](../interfaces/CellRendererIf.md)\> |
| `minWidth` | [`SizeIf`](../interfaces/SizeIf.md) |
| `maxWidth` | [`SizeIf`](../interfaces/SizeIf.md) |
| `sortable?` | [`BooleanFunction`](../modules.md#booleanfunction) |
| `sortComparator?` | [`ValueRowSortComparator`](../modules.md#valuerowsortcomparator) |
| `sortState?` | [`SortState`](../modules.md#sortstate) |
| `sortStatesOrder?` | [`SortState`](../modules.md#sortstate)[] |
| `sortIconVisible?` | [`BooleanFunction`](../modules.md#booleanfunction) |
| `editable?` | [`BooleanFunction`](../modules.md#booleanfunction) |
| `getEditRenderer?` | [`GetEditRenderer`](../modules.md#geteditrenderer) |
| `editInputPipe?` | [`editInputPipe`](../interfaces/editInputPipe.md) |
| `isVisible` | [`BooleanFunction`](../modules.md#booleanfunction) |

#### Returns

[`ColumnDef`](ColumnDef.md)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L58)

## Properties

### classes

• **classes**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\>

CSS classes per area – `classes.header`, `.body`, `.footer`. The constants [bodyLeft](../modules.md#bodyleft), [allRight](../modules.md#allright) …
are ready-made maps for the alignment.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[classes](../interfaces/ColumnDefIf.md#classes)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L62)

___

### editInputPipe

• `Optional` **editInputPipe**: [`editInputPipe`](../interfaces/editInputPipe.md)

Converts the text of the editor before it is written into the model, e.g. [editInputPipeForNumber](../modules.md#editinputpipefornumber).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[editInputPipe](../interfaces/ColumnDefIf.md#editinputpipe)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L73)

___

### editable

• `Optional` **editable**: [`BooleanFunction`](../modules.md#booleanfunction)

The cells of this column can be edited (double-click or F2), e.g. `TrueFn`.

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[editable](../interfaces/ColumnDefIf.md#editable)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L71)

___

### formula

• `Optional` **formula**: `string`

The formula of a formula column, see [ColumnDefIf.formula](../interfaces/ColumnDefIf.md#formula).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[formula](../interfaces/ColumnDefIf.md#formula)

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

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[getEditRenderer](../interfaces/ColumnDefIf.md#geteditrenderer)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:72](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L72)

___

### headerLabel

• **headerLabel**: `string`

Text of the header cell (used when the header is built from the column definitions).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[headerLabel](../interfaces/ColumnDefIf.md#headerlabel)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L60)

___

### isVisible

• **isVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Whether the column is shown. Hidden columns are not rendered, copied or exported.

**`Example`**

```ts
ColumnDef.create({ property: "category", headerLabel: "Category", isVisible: FalseFn })
```

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[isVisible](../interfaces/ColumnDefIf.md#isvisible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:74](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L74)

___

### maxWidth

• **maxWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[maxWidth](../interfaces/ColumnDefIf.md#maxwidth)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:65](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L65)

___

### minWidth

• **minWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[minWidth](../interfaces/ColumnDefIf.md#minwidth)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:64](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L64)

___

### property

• **property**: `string`

Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[property](../interfaces/ColumnDefIf.md#property)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L59)

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

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[rendererMap](../interfaces/ColumnDefIf.md#renderermap)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L63)

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

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[rowDrag](../interfaces/ColumnDefIf.md#rowdrag)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L56)

___

### showValuesAs

• `Optional` **showValuesAs**: [`ShowValuesAsConfig`](../modules.md#showvaluesasconfig)

„Show values as“, see [ColumnDefIf.showValuesAs](../interfaces/ColumnDefIf.md#showvaluesas).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[showValuesAs](../interfaces/ColumnDefIf.md#showvaluesas)

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

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortComparator](../interfaces/ColumnDefIf.md#sortcomparator)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:67](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L67)

___

### sortIconVisible

• `Optional` **sortIconVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Show the sort icon in the header. Default: follows `sortable` resp. `sortState`.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortIconVisible](../interfaces/ColumnDefIf.md#sorticonvisible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:70](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L70)

___

### sortState

• `Optional` **sortState**: [`SortState`](../modules.md#sortstate)

The sort icon shown in the header: `"asc"`, `"desc"` or `""` (none). It only sets the icon –
sort the rows once with [TableModelIf.doSort](../interfaces/TableModelIf.md#dosort) to match it.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortState](../interfaces/ColumnDefIf.md#sortstate)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L68)

___

### sortStatesOrder

• `Optional` **sortStatesOrder**: [`SortState`](../modules.md#sortstate)[]

Order of the sort states on repeated double-clicks. Default: `TableOptions.sortOrder` (`["asc", "desc"]`).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortStatesOrder](../interfaces/ColumnDefIf.md#sortstatesorder)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:69](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L69)

___

### sortable

• `Optional` **sortable**: [`BooleanFunction`](../modules.md#booleanfunction)

The column can be sorted by a double-click on its header (e.g. `TrueFn`).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortable](../interfaces/ColumnDefIf.md#sortable)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:66](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L66)

___

### valueGetter

• `Optional` **valueGetter**: [`ValueGetter`](../modules.md#valuegetter)

A calculated column, see [ColumnDefIf.valueGetter](../interfaces/ColumnDefIf.md#valuegetter).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[valueGetter](../interfaces/ColumnDefIf.md#valuegetter)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L49)

___

### valueSetter

• `Optional` **valueSetter**: [`ValueSetter`](../modules.md#valuesetter)

Writes an edited calculated value back, see [ColumnDefIf.valueSetter](../interfaces/ColumnDefIf.md#valuesetter).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[valueSetter](../interfaces/ColumnDefIf.md#valuesetter)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L51)

___

### visible

• **visible**: `boolean` = `true`

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L46)

___

### width

• **width**: [`SizeIf`](../interfaces/SizeIf.md)

Width of the column: `px120`, `new Size(10, "%")` or `new Size(1, "weight")`. See [SizeUnitType](../modules.md#sizeunittype).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[width](../interfaces/ColumnDefIf.md#width)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:61](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L61)

## Methods

### bodyRenderer

▸ **bodyRenderer**(`bodyRenderer`): [`AreaObjectMap`](AreaObjectMap.md)\<[`CellRendererIf`](../interfaces/CellRendererIf.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bodyRenderer` | [`CellRendererIf`](../interfaces/CellRendererIf.md) |

#### Returns

[`AreaObjectMap`](AreaObjectMap.md)\<[`CellRendererIf`](../interfaces/CellRendererIf.md)\>

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L82)

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

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L104)
