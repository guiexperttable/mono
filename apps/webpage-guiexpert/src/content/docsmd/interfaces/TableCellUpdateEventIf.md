[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableCellUpdateEventIf

# Interface: TableCellUpdateEventIf

One event defines one table cell update operation.
You can send an array of these event via TableApi#updateCells(events: TableCellUpdateEventIf[], repaintAll: boolean = false).

## Implemented by

- [`TableCellUpdateEvent`](../classes/TableCellUpdateEvent.md)

## Table of contents

### Properties

- [area](TableCellUpdateEventIf.md#area)
- [columnIndex](TableCellUpdateEventIf.md#columnindex)
- [cssClasses](TableCellUpdateEventIf.md#cssclasses)
- [rowIndex](TableCellUpdateEventIf.md#rowindex)
- [value](TableCellUpdateEventIf.md#value)

## Properties

### area

• **area**: [`AreaIdent`](../modules.md#areaident)

Represents an area identifier ("header" | "body" | "footer"), which defines the part of the table.

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.if.ts:16](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.if.ts#L16)

___

### columnIndex

• **columnIndex**: `number`

Represents the index of a column in a data table.

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.if.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.if.ts#L30)

___

### cssClasses

• **cssClasses**: `Object`

Represents a collection of CSS classes with their corresponding boolean values.
For each key-value pair of the object with a truthy value the corresponding key is used as a class name.
For each key-value pair of the object with a falsy value the corresponding key will be removed from the class list of the cell div (dom node).
Example:
   {
      low: val >= 0 && val <=5,
      medium: val > 5 && val <= 10,
      high: val > 10
   }

#### Index signature

▪ [key: `string`]: `boolean`

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.if.ts:58](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.if.ts#L58)

___

### rowIndex

• **rowIndex**: `number`

Represents the index of a row of the table.

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.if.ts#L23)

___

### value

• **value**: `any`

The value can be any data type.
It can store a string, number, boolean, object, function, or null.
It is a flexible variable that can hold any value.

This valie will be set to the area model for the cell (rowIndex, columnIndex).

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.if.ts:42](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.if.ts#L42)
