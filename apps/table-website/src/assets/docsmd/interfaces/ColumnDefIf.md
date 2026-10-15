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
- [getEditRenderer](ColumnDefIf.md#geteditrenderer)
- [headerLabel](ColumnDefIf.md#headerlabel)
- [isVisible](ColumnDefIf.md#isvisible)
- [maxWidth](ColumnDefIf.md#maxwidth)
- [minWidth](ColumnDefIf.md#minwidth)
- [property](ColumnDefIf.md#property)
- [rendererMap](ColumnDefIf.md#renderermap)
- [sortComparator](ColumnDefIf.md#sortcomparator)
- [sortIconVisible](ColumnDefIf.md#sorticonvisible)
- [sortState](ColumnDefIf.md#sortstate)
- [sortStatesOrder](ColumnDefIf.md#sortstatesorder)
- [sortable](ColumnDefIf.md#sortable)
- [width](ColumnDefIf.md#width)

## Properties

### classes

• **classes**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\>

CSS classes per area – `classes.header`, `.body`, `.footer`. The constants [bodyLeft](../modules.md#bodyleft), [allRight](../modules.md#allright) …
are ready-made maps for the alignment.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:78](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L78)

___

### editInputPipe

• `Optional` **editInputPipe**: [`editInputPipe`](editInputPipe.md)

Converts the text of the editor before it is written into the model, e.g. [editInputPipeForNumber](../modules.md#editinputpipefornumber).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:120](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L120)

___

### editable

• `Optional` **editable**: [`BooleanFunction`](../modules.md#booleanfunction)

The cells of this column can be edited (double-click or F2), e.g. `TrueFn`.

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:104](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L104)

___

### getEditRenderer

• `Optional` **getEditRenderer**: [`GetEditRenderer`](../modules.md#geteditrenderer)

The editor of this column. Default: `TableOptions.getEditRenderer` (a text input, [InputCellRenderer](../classes/InputCellRenderer.md)).

**`Example`**

```ts
getEditRenderer: () => new SelectCellRenderer(["open", "paid"].map(s => new ValueLabel(s, s)))
```

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:118](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L118)

___

### headerLabel

• **headerLabel**: `string`

Text of the header cell (used when the header is built from the column definitions).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L56)

___

### isVisible

• `Optional` **isVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Whether the column is shown. Hidden columns are not rendered, copied or exported.

**`Example`**

```ts
ColumnDef.create({ property: "category", headerLabel: "Category", isVisible: FalseFn })
```

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:111](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L111)

___

### maxWidth

• **maxWidth**: [`SizeIf`](SizeIf.md)

Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:62](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L62)

___

### minWidth

• **minWidth**: [`SizeIf`](SizeIf.md)

Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L60)

___

### property

• **property**: `string`

Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L54)

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

[src/lib/table/data/tablemodel/column/column-def.if.ts:73](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L73)

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

[src/lib/table/data/tablemodel/column/column-def.if.ts:91](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L91)

___

### sortIconVisible

• `Optional` **sortIconVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Show the sort icon in the header. Default: follows `sortable` resp. `sortState`.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:82](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L82)

___

### sortState

• `Optional` **sortState**: [`SortState`](../modules.md#sortstate)

The sort icon shown in the header: `"asc"`, `"desc"` or `""` (none). It only sets the icon –
sort the rows once with [TableModelIf.doSort](TableModelIf.md#dosort) to match it.

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:96](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L96)

___

### sortStatesOrder

• `Optional` **sortStatesOrder**: [`SortState`](../modules.md#sortstate)[]

Order of the sort states on repeated double-clicks. Default: `TableOptions.sortOrder` (`["asc", "desc"]`).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:98](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L98)

___

### sortable

• `Optional` **sortable**: [`BooleanFunction`](../modules.md#booleanfunction)

The column can be sorted by a double-click on its header (e.g. `TrueFn`).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:80](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L80)

___

### width

• **width**: [`SizeIf`](SizeIf.md)

Width of the column: `px120`, `new Size(10, "%")` or `new Size(1, "weight")`. See [SizeUnitType](../modules.md#sizeunittype).

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.if.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.if.ts#L58)
