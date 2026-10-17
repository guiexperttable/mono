[GuiExpert Table API](../README.md) / [Exports](../modules.md) / RangeAddressIf

# Interface: RangeAddressIf

A parsed range: first and last cell (0-based, inclusive). A whole column (`"A:A"`) has the rows 0 … 1 048 575 and
`wholeColumns: true`, a whole row (`"3:3"`) the columns 0 … 16 383 and `wholeRows: true`.

**`Since`**

1.1.99

## Table of contents

### Properties

- [from](RangeAddressIf.md#from)
- [to](RangeAddressIf.md#to)
- [wholeColumns](RangeAddressIf.md#wholecolumns)
- [wholeRows](RangeAddressIf.md#wholerows)

## Properties

### from

• **from**: [`CellAddressIf`](CellAddressIf.md)

#### Defined in

[src/lib/table/sheet/cell-address.ts:124](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-address.ts#L124)

___

### to

• **to**: [`CellAddressIf`](CellAddressIf.md)

#### Defined in

[src/lib/table/sheet/cell-address.ts:125](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-address.ts#L125)

___

### wholeColumns

• `Optional` **wholeColumns**: `boolean`

#### Defined in

[src/lib/table/sheet/cell-address.ts:126](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-address.ts#L126)

___

### wholeRows

• `Optional` **wholeRows**: `boolean`

#### Defined in

[src/lib/table/sheet/cell-address.ts:127](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/sheet/cell-address.ts#L127)
