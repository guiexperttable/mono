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

## Implements

- [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

## Table of contents

### Constructors

- [constructor](ColumnDef.md#constructor)

### Properties

- [classes](ColumnDef.md#classes)
- [editInputPipe](ColumnDef.md#editinputpipe)
- [editable](ColumnDef.md#editable)
- [getEditRenderer](ColumnDef.md#geteditrenderer)
- [headerLabel](ColumnDef.md#headerlabel)
- [isVisible](ColumnDef.md#isvisible)
- [maxWidth](ColumnDef.md#maxwidth)
- [minWidth](ColumnDef.md#minwidth)
- [property](ColumnDef.md#property)
- [rendererMap](ColumnDef.md#renderermap)
- [sortComparator](ColumnDef.md#sortcomparator)
- [sortIconVisible](ColumnDef.md#sorticonvisible)
- [sortState](ColumnDef.md#sortstate)
- [sortStatesOrder](ColumnDef.md#sortstatesorder)
- [sortable](ColumnDef.md#sortable)
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

[src/lib/table/data/tablemodel/column/column-def.ts:44](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L44)

## Properties

### classes

• **classes**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\>

CSS classes per area – `classes.header`, `.body`, `.footer`. The constants [bodyLeft](../modules.md#bodyleft), [allRight](../modules.md#allright) …
are ready-made maps for the alignment.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[classes](../interfaces/ColumnDefIf.md#classes)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L48)

___

### editInputPipe

• `Optional` **editInputPipe**: [`editInputPipe`](../interfaces/editInputPipe.md)

Converts the text of the editor before it is written into the model, e.g. [editInputPipeForNumber](../modules.md#editinputpipefornumber).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[editInputPipe](../interfaces/ColumnDefIf.md#editinputpipe)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:59](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L59)

___

### editable

• `Optional` **editable**: [`BooleanFunction`](../modules.md#booleanfunction)

The cells of this column can be edited (double-click or F2), e.g. `TrueFn`.

**`See`**

Training: [Inline editing](https://gui.expert/training/inline-editing/)

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[editable](../interfaces/ColumnDefIf.md#editable)

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

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[getEditRenderer](../interfaces/ColumnDefIf.md#geteditrenderer)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L58)

___

### headerLabel

• **headerLabel**: `string`

Text of the header cell (used when the header is built from the column definitions).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[headerLabel](../interfaces/ColumnDefIf.md#headerlabel)

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

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[isVisible](../interfaces/ColumnDefIf.md#isvisible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L60)

___

### maxWidth

• **maxWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[maxWidth](../interfaces/ColumnDefIf.md#maxwidth)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L51)

___

### minWidth

• **minWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[minWidth](../interfaces/ColumnDefIf.md#minwidth)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:50](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L50)

___

### property

• **property**: `string`

Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[property](../interfaces/ColumnDefIf.md#property)

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

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[rendererMap](../interfaces/ColumnDefIf.md#renderermap)

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

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortComparator](../interfaces/ColumnDefIf.md#sortcomparator)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L53)

___

### sortIconVisible

• `Optional` **sortIconVisible**: [`BooleanFunction`](../modules.md#booleanfunction)

Show the sort icon in the header. Default: follows `sortable` resp. `sortState`.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortIconVisible](../interfaces/ColumnDefIf.md#sorticonvisible)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:56](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L56)

___

### sortState

• `Optional` **sortState**: [`SortState`](../modules.md#sortstate)

The sort icon shown in the header: `"asc"`, `"desc"` or `""` (none). It only sets the icon –
sort the rows once with [TableModelIf.doSort](../interfaces/TableModelIf.md#dosort) to match it.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortState](../interfaces/ColumnDefIf.md#sortstate)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L54)

___

### sortStatesOrder

• `Optional` **sortStatesOrder**: [`SortState`](../modules.md#sortstate)[]

Order of the sort states on repeated double-clicks. Default: `TableOptions.sortOrder` (`["asc", "desc"]`).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortStatesOrder](../interfaces/ColumnDefIf.md#sortstatesorder)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L55)

___

### sortable

• `Optional` **sortable**: [`BooleanFunction`](../modules.md#booleanfunction)

The column can be sorted by a double-click on its header (e.g. `TrueFn`).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[sortable](../interfaces/ColumnDefIf.md#sortable)

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L52)

___

### visible

• **visible**: `boolean` = `true`

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L42)

___

### width

• **width**: [`SizeIf`](../interfaces/SizeIf.md)

Width of the column: `px120`, `new Size(10, "%")` or `new Size(1, "weight")`. See [SizeUnitType](../modules.md#sizeunittype).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[width](../interfaces/ColumnDefIf.md#width)

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

#### Defined in

[src/lib/table/data/tablemodel/column/column-def.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/tablemodel/column/column-def.ts#L90)
