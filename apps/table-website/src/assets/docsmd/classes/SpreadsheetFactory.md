[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SpreadsheetFactory

# Class: SpreadsheetFactory

Builds an empty (or filled) spreadsheet in one call: column letters, row numbers, a sparse body (a million rows cost
only their filled cells) and the options of the spreadsheet preset – Excel-style editing, copy and paste, undo,
cell formulas, the fill handle and a range selection with the active cell on A1.

**`Example`**

```ts
const { tableModel, tableOptions } = SpreadsheetFactory.create({
  data: [["Product", "Price", "Qty", "Total"], ["Laptop", 1299, 2, "=B2*C2"]],
});
```

**`Since`**

1.1.99

## Table of contents

### Constructors

- [constructor](SpreadsheetFactory.md#constructor)

### Methods

- [create](SpreadsheetFactory.md#create)

## Constructors

### constructor

• **new SpreadsheetFactory**(): [`SpreadsheetFactory`](SpreadsheetFactory.md)

#### Returns

[`SpreadsheetFactory`](SpreadsheetFactory.md)

## Methods

### create

▸ **create**(`param?`): `Object`

Model and options of a spreadsheet.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `param?` | `Partial`\<[`SpreadsheetParamIf`](../interfaces/SpreadsheetParamIf.md)\> | data, size, row numbers, options |

#### Returns

`Object`

for the table or a wrapper

| Name | Type |
| :------ | :------ |
| `tableModel` | [`SpreadsheetTableModel`](SpreadsheetTableModel.md) |
| `tableOptions` | [`TableOptionsIf`](../interfaces/TableOptionsIf.md) |

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-factory.ts:163](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-factory.ts#L163)
