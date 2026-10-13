[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CheckboxColumnDef

# Class: CheckboxColumnDef

A pre-defined column definition for a checkbox representation.

**`Implements`**

## Implements

- [`ColumnDefIf`](../interfaces/ColumnDefIf.md)

## Table of contents

### Constructors

- [constructor](CheckboxColumnDef.md#constructor)

### Properties

- [classes](CheckboxColumnDef.md#classes)
- [headerLabel](CheckboxColumnDef.md#headerlabel)
- [maxWidth](CheckboxColumnDef.md#maxwidth)
- [minWidth](CheckboxColumnDef.md#minwidth)
- [property](CheckboxColumnDef.md#property)
- [rendererMap](CheckboxColumnDef.md#renderermap)
- [type](CheckboxColumnDef.md#type)
- [width](CheckboxColumnDef.md#width)

## Constructors

### constructor

• **new CheckboxColumnDef**(): [`CheckboxColumnDef`](CheckboxColumnDef.md)

#### Returns

[`CheckboxColumnDef`](CheckboxColumnDef.md)

## Properties

### classes

• **classes**: [`AreaObjectMapType`](../modules.md#areaobjectmaptype)\<`string`[]\>

CSS classes per area – `classes.header`, `.body`, `.footer`. The constants [bodyLeft](../modules.md#bodyleft), [allRight](../modules.md#allright) …
are ready-made maps for the alignment.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[classes](../interfaces/ColumnDefIf.md#classes)

#### Defined in

[src/lib/table/data/common/checkbox-column-def.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/checkbox-column-def.ts#L26)

___

### headerLabel

• **headerLabel**: `string` = `""`

Text of the header cell (used when the header is built from the column definitions).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[headerLabel](../interfaces/ColumnDefIf.md#headerlabel)

#### Defined in

[src/lib/table/data/common/checkbox-column-def.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/checkbox-column-def.ts#L21)

___

### maxWidth

• **maxWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Upper limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[maxWidth](../interfaces/ColumnDefIf.md#maxwidth)

#### Defined in

[src/lib/table/data/common/checkbox-column-def.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/checkbox-column-def.ts#L24)

___

### minWidth

• **minWidth**: [`SizeIf`](../interfaces/SizeIf.md)

Lower limit for percentage widths (`"%"`). Not applied to pixel widths or to resizing with the mouse.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[minWidth](../interfaces/ColumnDefIf.md#minwidth)

#### Defined in

[src/lib/table/data/common/checkbox-column-def.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/checkbox-column-def.ts#L23)

___

### property

• **property**: `string` = `"CheckboxColumn"`

Property of the row object shown in this column (`"customer"`). With nested objects a path like `"address.city"`.

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[property](../interfaces/ColumnDefIf.md#property)

#### Defined in

[src/lib/table/data/common/checkbox-column-def.ts:20](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/checkbox-column-def.ts#L20)

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

[src/lib/table/data/common/checkbox-column-def.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/checkbox-column-def.ts#L25)

___

### type

• **type**: `string` = `'CheckboxColumnDef'`

#### Defined in

[src/lib/table/data/common/checkbox-column-def.ts:18](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/checkbox-column-def.ts#L18)

___

### width

• **width**: [`SizeIf`](../interfaces/SizeIf.md)

Width of the column: `px120`, `new Size(10, "%")` or `new Size(1, "weight")`. See [SizeUnitType](../modules.md#sizeunittype).

#### Implementation of

[ColumnDefIf](../interfaces/ColumnDefIf.md).[width](../interfaces/ColumnDefIf.md#width)

#### Defined in

[src/lib/table/data/common/checkbox-column-def.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/checkbox-column-def.ts#L22)
