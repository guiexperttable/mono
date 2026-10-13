[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableCellUpdateEvent

# Class: TableCellUpdateEvent

A new value for one cell – the input of [TableApi.updateCells](TableApi.md#updatecells).
The value is written into the area model; if the cell is visible, only this cell is redrawn.
`cssClasses` are applied to the current drawing of the cell (e.g. a short "flash"); permanent colours
belong into the model ([AreaModelIf.getCustomClassesAt](../interfaces/AreaModelIf.md#getcustomclassesat)).

**`Example`**

```ts
tableApi.updateCells([
  new TableCellUpdateEvent("body", row, 2, price, { "tick-up": up, "tick-down": !up }),
  new TableCellUpdateEvent("body", row, 4, volume)
]);
```

**`See`**

Training: [Live data without rebuilding the table](https://gui.expert/training/live-data/)

## Implements

- [`TableCellUpdateEventIf`](../interfaces/TableCellUpdateEventIf.md)

## Table of contents

### Constructors

- [constructor](TableCellUpdateEvent.md#constructor)

### Properties

- [area](TableCellUpdateEvent.md#area)
- [columnIndex](TableCellUpdateEvent.md#columnindex)
- [cssClasses](TableCellUpdateEvent.md#cssclasses)
- [rowIndex](TableCellUpdateEvent.md#rowindex)
- [value](TableCellUpdateEvent.md#value)

## Constructors

### constructor

• **new TableCellUpdateEvent**(`area`, `rowIndex`, `columnIndex`, `value`, `cssClasses?`): [`TableCellUpdateEvent`](TableCellUpdateEvent.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `area` | [`AreaIdent`](../modules.md#areaident) |
| `rowIndex` | `number` |
| `columnIndex` | `number` |
| `value` | `any` |
| `cssClasses` | `Object` |

#### Returns

[`TableCellUpdateEvent`](TableCellUpdateEvent.md)

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.ts:22](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.ts#L22)

## Properties

### area

• **area**: [`AreaIdent`](../modules.md#areaident)

Represents an area identifier ("header" | "body" | "footer"), which defines the part of the table.

#### Implementation of

[TableCellUpdateEventIf](../interfaces/TableCellUpdateEventIf.md).[area](../interfaces/TableCellUpdateEventIf.md#area)

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.ts#L23)

___

### columnIndex

• **columnIndex**: `number`

Represents the index of a column in a data table.

#### Implementation of

[TableCellUpdateEventIf](../interfaces/TableCellUpdateEventIf.md).[columnIndex](../interfaces/TableCellUpdateEventIf.md#columnindex)

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.ts#L25)

___

### cssClasses

• **cssClasses**: `Object` = `{}`

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

#### Implementation of

[TableCellUpdateEventIf](../interfaces/TableCellUpdateEventIf.md).[cssClasses](../interfaces/TableCellUpdateEventIf.md#cssclasses)

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.ts#L27)

___

### rowIndex

• **rowIndex**: `number`

Represents the index of a row of the table.

#### Implementation of

[TableCellUpdateEventIf](../interfaces/TableCellUpdateEventIf.md).[rowIndex](../interfaces/TableCellUpdateEventIf.md#rowindex)

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.ts:24](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.ts#L24)

___

### value

• **value**: `any`

The value can be any data type.
It can store a string, number, boolean, object, function, or null.
It is a flexible variable that can hold any value.

This valie will be set to the area model for the cell (rowIndex, columnIndex).

#### Implementation of

[TableCellUpdateEventIf](../interfaces/TableCellUpdateEventIf.md).[value](../interfaces/TableCellUpdateEventIf.md#value)

#### Defined in

[src/lib/table/data/common/event/input/table-cell-update-event.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/data/common/event/input/table-cell-update-event.ts#L26)
