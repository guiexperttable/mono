[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PivotColumnDef

# Class: PivotColumnDef

A value column of a pivot table – created by [PivotFactory](PivotFactory.md) (you don't create them yourself). Its property is
stable for the same column key and value (`pivot:[["monat","s:Jan"],"sum(umsatz)"]`), so widths and sorting are
remembered like for any column; [AreaModelPivot.getColumnProperty](AreaModelPivot.md#getcolumnproperty) builds it for you.

**`Example`**

```ts
const columns = tableModel.getColumnDefs()?.filter(isPivotColumnDef) ?? [];
columns.map(c => c.pivot.kind);   // ["value", "value", "total"]
```

**`Since`**

1.1.94

## Hierarchy

- [`ColumnDef`](ColumnDef.md)

  ↳ **`PivotColumnDef`**

## Table of contents

### Constructors

- [constructor](PivotColumnDef.md#constructor)

### Properties

- [classes](PivotColumnDef.md#classes)
- [editInputPipe](PivotColumnDef.md#editinputpipe)
- [editable](PivotColumnDef.md#editable)
- [getEditRenderer](PivotColumnDef.md#geteditrenderer)
- [headerLabel](PivotColumnDef.md#headerlabel)
- [isVisible](PivotColumnDef.md#isvisible)
- [maxWidth](PivotColumnDef.md#maxwidth)
- [minWidth](PivotColumnDef.md#minwidth)
- [pivot](PivotColumnDef.md#pivot)
- [property](PivotColumnDef.md#property)
- [rendererMap](PivotColumnDef.md#renderermap)
- [sortComparator](PivotColumnDef.md#sortcomparator)
- [sortIconVisible](PivotColumnDef.md#sorticonvisible)
- [sortState](PivotColumnDef.md#sortstate)
- [sortStatesOrder](PivotColumnDef.md#sortstatesorder)
- [sortable](PivotColumnDef.md#sortable)
- [type](PivotColumnDef.md#type)
- [visible](PivotColumnDef.md#visible)
- [width](PivotColumnDef.md#width)

### Methods

- [bodyRenderer](PivotColumnDef.md#bodyrenderer)
- [create](PivotColumnDef.md#create)

## Constructors

### constructor

• **new PivotColumnDef**(`property`, `headerLabel`, `pivot`, `width?`): [`PivotColumnDef`](PivotColumnDef.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `property` | `string` | the stable property |
| `headerLabel` | `string` | the label in the lowest header row |
| `pivot` | [`PivotColumnInfoIf`](../interfaces/PivotColumnInfoIf.md) | what the column shows |
| `width?` | [`SizeIf`](../interfaces/SizeIf.md) | the width (default 100 px) |

#### Returns

[`PivotColumnDef`](PivotColumnDef.md)

#### Overrides

[ColumnDef](ColumnDef.md).[constructor](ColumnDef.md#constructor)

#### Defined in

[src/lib/table/pivot/pivot-column-def.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-column-def.ts#L31)

## Properties

### classes

• **classes**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\>

CSS classes per area – `classes.header`, `.body`, `.footer`. The constants [bodyLeft](../modules.md#bodyleft), [allRight](../modules.md#allright) …
are ready-made maps for the alignment.

#### Inherited from

[ColumnDef](ColumnDef.md).[classes](ColumnDef.md#classes)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L48)

___

### editInputPipe

• `Optional` **editInputPipe**: [`editInputPipe`](../interfaces/editInputPipe.md)

Converts the text of the editor before it is written into the model, e.g. [editInputPipeForNumber](../modules.md#editinputpipefornumber).

#### Inherited from

[ColumnDef](ColumnDef.md).[editInputPipe](ColumnDef.md#editinputpipe)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L59)

___

### editable

• `Optional` **editable**: [`BooleanFunction`](../modules.md#booleanfunction)

The cells of this column can be edited (double-click or F2), e.g. `TrueFn`.

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Inherited from

[ColumnDef](ColumnDef.md).[editable](ColumnDef.md#editable)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:57](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L57)

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

[src/lib/table/data/tablemodel/column/column-def.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L58)

___

### headerLabel

• **headerLabel**: `string`

Text of the header cell (used when the header is built from the column definitions).

#### Inherited from

[ColumnDef](ColumnDef.md).[headerLabel](ColumnDef.md#headerlabel)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L46)

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

[src/lib/table/data/tablemodel/column/column-def.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L60)

___

### maxWidth

• **maxWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Inherited from

[ColumnDef](ColumnDef.md).[maxWidth](ColumnDef.md#maxwidth)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L51)

___

### minWidth

• **minWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Inherited from

[ColumnDef](ColumnDef.md).[minWidth](ColumnDef.md#minwidth)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L50)

___

### pivot

• `Readonly` **pivot**: [`PivotColumnInfoIf`](../interfaces/PivotColumnInfoIf.md)

what the column shows

#### Defined in

[src/lib/table/pivot/pivot-column-def.ts:31](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-column-def.ts#L31)

___

### property

• **property**: `string`

Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`.

#### Inherited from

[ColumnDef](ColumnDef.md).[property](ColumnDef.md#property)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:45](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L45)

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

[src/lib/table/data/tablemodel/column/column-def.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L49)

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

[src/lib/table/data/tablemodel/column/column-def.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L53)

___

### sortIconVisible

• `Optional` **sortIconVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Show the sort icon in the header. Default: follows `sortable` resp. `sortState`.

#### Inherited from

[ColumnDef](ColumnDef.md).[sortIconVisible](ColumnDef.md#sorticonvisible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L56)

___

### sortState

• `Optional` **sortState**: [`SortState`](../modules.md#sortstate)

The sort icon shown in the header: `"asc"`, `"desc"` or `""` (none). It only sets the icon –
sort the rows once with [TableModelIf.doSort](../interfaces/TableModelIf.md#dosort) to match it.

#### Inherited from

[ColumnDef](ColumnDef.md).[sortState](ColumnDef.md#sortstate)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L54)

___

### sortStatesOrder

• `Optional` **sortStatesOrder**: [`SortState`](../modules.md#sortstate)[]

Order of the sort states on repeated double-clicks. Default: `TableOptions.sortOrder` (`["asc", "desc"]`).

#### Inherited from

[ColumnDef](ColumnDef.md).[sortStatesOrder](ColumnDef.md#sortstatesorder)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L55)

___

### sortable

• `Optional` **sortable**: [`BooleanFunction`](../modules.md#booleanfunction)

The column can be sorted by a double-click on its header (e.g. `TrueFn`).

#### Inherited from

[ColumnDef](ColumnDef.md).[sortable](ColumnDef.md#sortable)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L52)

___

### type

• `Readonly` **type**: ``"PivotColumnDef"``

Marker for [isPivotColumnDef](../modules.md#ispivotcolumndef) (works across copies of the core).

#### Defined in

[src/lib/table/pivot/pivot-column-def.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/pivot/pivot-column-def.ts#L23)

___

### visible

• **visible**: `boolean` = `true`

#### Inherited from

[ColumnDef](ColumnDef.md).[visible](ColumnDef.md#visible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L42)

___

### width

• **width**: [`SizeIf`](../interfaces/SizeIf.md)

Width of the column: `px120`, `new Size(10, "%")` or `new Size(1, "weight")`. See [SizeUnitType](../modules.md#sizeunittype).

#### Inherited from

[ColumnDef](ColumnDef.md).[width](ColumnDef.md#width)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:47](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L47)

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

[src/lib/table/data/tablemodel/column/column-def.ts:68](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L68)

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
| `param.getEditRenderer?` | [`GetEditRenderer`](../modules.md#geteditrenderer) | The editor of this column. |
| `param.headerClasses?` | `string`[] | CSS classes of the header cell, e.g. `["ge-table-text-align-right"]`. |
| `param.headerLabel?` | `string` | Header label. |
| `param.headerRenderer?` | [`CellRendererIf`](../interfaces/CellRendererIf.md) | Renderer of the header cell. |
| `param.isVisible?` | [`BooleanFunction`](../modules.md#booleanfunction) | Column is shown (default `TrueFn`). |
| `param.maxWidth?` | [`SizeIf`](../interfaces/SizeIf.md) | Upper limit for % widths. |
| `param.minWidth?` | [`SizeIf`](../interfaces/SizeIf.md) | Lower limit for % widths. |
| `param.property?` | `string` | Property of the row object, see [ColumnDefIf.property](../interfaces/ColumnDefIf.md#property). |
| `param.sortComparator?` | [`ValueRowSortComparator`](../modules.md#valuerowsortcomparator) | Own comparison of two cell values. |
| `param.sortIconVisible?` | [`BooleanFunction`](../modules.md#booleanfunction) | Show the sort icon (default: follows `sortable`). |
| `param.sortState?` | [`SortState`](../modules.md#sortstate) | Initial sort icon (`"asc"`, `"desc"`); sort the rows with `tableModel.doSort()` to match. |
| `param.sortStatesOrder?` | [`SortState`](../modules.md#sortstate)[] | Order of the sort states on repeated double-clicks. |
| `param.sortable?` | [`BooleanFunction`](../modules.md#booleanfunction) | Sortable by double-click on the header, e.g. `TrueFn`. |
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

[src/lib/table/data/tablemodel/column/column-def.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L90)
