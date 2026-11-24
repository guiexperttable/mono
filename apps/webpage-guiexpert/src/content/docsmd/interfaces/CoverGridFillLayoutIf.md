[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CoverGridFillLayoutIf

# Interface: CoverGridFillLayoutIf

The geometry of a cover grid that fills its width ([computeCoverGridFill](../modules.md#computecovergridfill)).

**`Since`**

1.1.117

## Table of contents

### Properties

- [baseWidth](CoverGridFillLayoutIf.md#basewidth)
- [columns](CoverGridFillLayoutIf.md#columns)
- [rest](CoverGridFillLayoutIf.md#rest)
- [tileHeight](CoverGridFillLayoutIf.md#tileheight)

## Properties

### baseWidth

• **baseWidth**: `number`

The width of the narrowest tile; the first `rest` columns are 1 px wider.

#### Defined in

[src/lib/table/cover-grid/cover-grid-fill.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/cover-grid/cover-grid-fill.ts#L13)

___

### columns

• **columns**: `number`

Tiles per row, ≥ 1.

#### Defined in

[src/lib/table/cover-grid/cover-grid-fill.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/cover-grid/cover-grid-fill.ts#L11)

___

### rest

• **rest**: `number`

Pixels left over by `columns × baseWidth` – one more pixel for each of the first `rest` columns.

#### Defined in

[src/lib/table/cover-grid/cover-grid-fill.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/cover-grid/cover-grid-fill.ts#L15)

___

### tileHeight

• **tileHeight**: `number`

The height of a tile (`coverHeight` without `aspectRatio`).

#### Defined in

[src/lib/table/cover-grid/cover-grid-fill.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/cover-grid/cover-grid-fill.ts#L17)
