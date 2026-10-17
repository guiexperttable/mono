[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RowNumberColumnDef

# Class: RowNumberColumnDef

A built-in column with running row numbers (1, 2, 3 …) like the row headers of a spreadsheet.

The easy way is the factory flag: `TableFactory.createTableModel({ rows, rowNumbersVisible: true })` puts this column
in front of the others and fixes it on the left. Put it into `columnDefs` yourself if you build the models yourself
– as the **first** column, counted in `fixedLeftColumnCount`.

What the table does with it:
- the width follows the largest number (`"9"` → `"2000000"`) – after `setRows`, filtering, expanding tree rows;
- not sortable, not editable, no resize handle, can't be dragged, no column can be dragged in front of it;
- body cells have `role="rowheader"` – screen readers announce the number with the row;
- a click on a number selects the row (selection type `"row"` and `"range"`), Shift extends, Ctrl/⌘ toggles;
  a click on the header cell selects all;
- copy ([TableApi.copyToClipboard](TableApi.md#copytoclipboard)) and Excel export ([TableApi.downloadExcel](TableApi.md#downloadexcel)) leave it out, unless
  `exported: true`;
- with a [CheckboxColumnDef](CheckboxColumnDef.md) directly behind it, the checkbox, the tree arrow and
  `showCheckboxWihoutExtraColumn` move one column to the right.

Note: it is a real column – the indices of all other columns are one higher (like with a `CheckboxColumnDef`).
Use properties where you can (`tableApi.setColumnVisible("total", false)`, [TableApi.getColumnIndex](TableApi.md#getcolumnindex)).

**`Example`**

```ts
const withNumbers: ColumnDefIf[] = [new RowNumberColumnDef(), new CheckboxColumnDef(), ...columnDefs];
const model = TableFactory.createTableModel({ rows: orders, columnDefs: withNumbers, fixedLeftColumnCount: 2 });
```

**`See`**

Training: [Fixed columns](https://gui.expert/training/fixed-columns/)

**`Since`**

1.1.93

## Implements

- [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

## Table of contents

### Constructors

- [constructor](RowNumberColumnDef.md#constructor)

### Properties

- [classes](RowNumberColumnDef.md#classes)
- [headerLabel](RowNumberColumnDef.md#headerlabel)
- [isVisible](RowNumberColumnDef.md#isvisible)
- [maxWidth](RowNumberColumnDef.md#maxwidth)
- [minWidth](RowNumberColumnDef.md#minwidth)
- [options](RowNumberColumnDef.md#options)
- [property](RowNumberColumnDef.md#property)
- [rendererMap](RowNumberColumnDef.md#renderermap)
- [type](RowNumberColumnDef.md#type)
- [width](RowNumberColumnDef.md#width)

### Methods

- [getRowNumber](RowNumberColumnDef.md#getrownumber)
- [getRowNumberText](RowNumberColumnDef.md#getrownumbertext)
- [getWidestText](RowNumberColumnDef.md#getwidesttext)
- [hasDefaultFormat](RowNumberColumnDef.md#hasdefaultformat)

## Constructors

### constructor

• **new RowNumberColumnDef**(`options?`): [`RowNumberColumnDef`](RowNumberColumnDef.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Partial`\<[`RowNumberOptionsIf`](../interfaces/RowNumberOptionsIf.md)\> |

#### Returns

[`RowNumberColumnDef`](RowNumberColumnDef.md)

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:71](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L71)

## Properties

### classes

• **classes**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\>

CSS classes per area – `classes.header`, `.body`, `.footer`. The constants [bodyLeft](../modules.md#bodyleft), [allRight](../modules.md#allright) …
are ready-made maps for the alignment.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[classes](../interfaces/ColumnDefIf.md#classes)

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:55](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L55)

___

### headerLabel

• **headerLabel**: `string`

Text of the header cell (used when the header is built from the column definitions).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[headerLabel](../interfaces/ColumnDefIf.md#headerlabel)

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:49](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L49)

___

### isVisible

• **isVisible**: [`BooleanFunction`](../modules.md#booleanfunction) = `TrueFn`

Whether the column is shown. Hidden columns are not rendered, copied or exported.

**`Example`**

```ts
ColumnDef.create({ property: "category", headerLabel: "Category", isVisible: FalseFn })
```

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[isVisible](../interfaces/ColumnDefIf.md#isvisible)

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:60](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L60)

___

### maxWidth

• **maxWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[maxWidth](../interfaces/ColumnDefIf.md#maxwidth)

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:53](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L53)

___

### minWidth

• **minWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[minWidth](../interfaces/ColumnDefIf.md#minwidth)

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:52](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L52)

___

### options

• `Readonly` **options**: [`RowNumberOptionsIf`](../interfaces/RowNumberOptionsIf.md)

The options (defaults from [RowNumberOptions](RowNumberOptions.md)).

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:63](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L63)

___

### property

• **property**: `string` = `"RowNumberColumn"`

Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[property](../interfaces/ColumnDefIf.md#property)

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:48](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L48)

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

[src/lib/table/data/common/row-number-column-def.ts:54](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L54)

___

### type

• `Readonly` **type**: ``"RowNumberColumnDef"``

Marker for [isRowNumberColumnDef](../modules.md#isrownumbercolumndef) (works across copies of the core).

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:46](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L46)

___

### width

• **width**: [`SizeIf`](../interfaces/SizeIf.md)

Starts with `minWidthInPx`; the table widens it to fit the largest number.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[width](../interfaces/ColumnDefIf.md#width)

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:51](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L51)

## Methods

### getRowNumber

▸ **getRowNumber**(`rowIndex`, `bodyModel`): `number`

The number of a body row (1-based): its position in the view (`"display"`) or in `getAllRows()` (`"original"`).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | row index in the body (the current view) |
| `bodyModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | the body model |

#### Returns

`number`

the row number

**`Example`**

```ts
const columnDef = new RowNumberColumnDef();
const rowNumber = columnDef.getRowNumber(0, tableModel.getBodyModel()); // 1
```

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:90](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L90)

___

### getRowNumberText

▸ **getRowNumberText**(`rowIndex`, `bodyModel`): `string`

The text of a row number: `options.format(getRowNumber(…))`.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rowIndex` | `number` | row index in the body |
| `bodyModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | the body model |

#### Returns

`string`

the text shown in the cell (and exported with `exported: true`)

**`Example`**

```ts
const columnDef = new RowNumberColumnDef({ format: n => n.toLocaleString("en-US") });
const text = columnDef.getRowNumberText(1999, tableModel.getBodyModel()); // "2,000"
```

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:116](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L116)

___

### getWidestText

▸ **getWidestText**(`bodyModel`): `string`

The text of the largest number the column can show now – the table measures it for the column width.
`"display"`: the row count; `"original"`: the count of all rows (unfiltered). At least the text of 1.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bodyModel` | [`AreaModelIf`](../interfaces/AreaModelIf.md) | the body model |

#### Returns

`string`

e.g. `"2000000"`

**`Example`**

```ts
const widest = new RowNumberColumnDef().getWidestText(tableModel.getBodyModel()); // "1000" for 1000 rows
```

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:130](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L130)

___

### hasDefaultFormat

▸ **hasDefaultFormat**(): `boolean`

True if the numbers are shown without an own `format` (plain digits) – the Excel export then writes numbers.

#### Returns

`boolean`

false with an own `options.format`

**`Example`**

```ts
const plain = new RowNumberColumnDef().hasDefaultFormat(); // true
```

#### Defined in

[src/lib/table/data/common/row-number-column-def.ts:148](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/row-number-column-def.ts#L148)
