[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableStateRangeIf

# Interface: TableStateRangeIf

A rectangle of a selection. Without row ids it spans all rows (a selected column), without properties all columns
(a selected row); without `toRowId` / `toProperty` it reaches to the last row / column. Restored in the current
row order: a rectangle between the same first and last row. Tables without column definitions store only
row selections (columns have no property there).

**`Since`**

1.1.92

## Table of contents

### Properties

- [fromProperty](TableStateRangeIf.md#fromproperty)
- [fromRowId](TableStateRangeIf.md#fromrowid)
- [toProperty](TableStateRangeIf.md#toproperty)
- [toRowId](TableStateRangeIf.md#torowid)

## Properties

### fromProperty

• `Optional` **fromProperty**: `string`

#### Defined in

[src/lib/table/state/table-state.if.ts:184](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L184)

___

### fromRowId

• `Optional` **fromRowId**: [`TableStateRowId`](../modules.md#tablestaterowid)

#### Defined in

[src/lib/table/state/table-state.if.ts:182](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L182)

___

### toProperty

• `Optional` **toProperty**: `string`

#### Defined in

[src/lib/table/state/table-state.if.ts:185](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L185)

___

### toRowId

• `Optional` **toRowId**: [`TableStateRowId`](../modules.md#tablestaterowid)

#### Defined in

[src/lib/table/state/table-state.if.ts:183](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L183)
