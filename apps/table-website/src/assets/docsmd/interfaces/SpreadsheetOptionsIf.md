[GuiExpert Table API](../README.md) / [Exports](../modules.md) / SpreadsheetOptionsIf

# Interface: SpreadsheetOptionsIf

The preset `tableOptions.spreadsheet` ([TableOptionsIf.spreadsheet](TableOptionsIf.md#spreadsheet)): which parts it switches on. Each part
is `true` by default; `false` leaves it off, an object configures it. Options the table options set themselves win.

**`Example`**

```ts
const tableOptions: TableOptionsIf = { ...new TableOptions(), spreadsheet: { cellFormulas: { columns: ["total"] } } };
```

**`Since`**

1.1.99

## Table of contents

### Properties

- [cellFormulas](SpreadsheetOptionsIf.md#cellformulas)
- [clipboard](SpreadsheetOptionsIf.md#clipboard)
- [editing](SpreadsheetOptionsIf.md#editing)
- [fillHandle](SpreadsheetOptionsIf.md#fillhandle)
- [undo](SpreadsheetOptionsIf.md#undo)

## Properties

### cellFormulas

• **cellFormulas**: `boolean` \| `Partial`\<[`CellFormulaOptionsIf`](CellFormulaOptionsIf.md)\>

Cell formulas (`=B2*C2`).

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-options.if.ts:25](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-options.if.ts#L25)

___

### clipboard

• **clipboard**: `boolean` \| `Partial`\<[`ClipboardOptionsIf`](ClipboardOptionsIf.md)\>

Copy, cut and paste.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-options.if.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-options.if.ts#L21)

___

### editing

• **editing**: `boolean` \| `Partial`\<[`EditingOptionsIf`](EditingOptionsIf.md)\>

Excel-style editing – the preset sets `defaultEditable: true` (columns without own `editable` are editable).

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-options.if.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-options.if.ts#L19)

___

### fillHandle

• **fillHandle**: `boolean` \| `Partial`\<[`FillHandleOptionsIf`](FillHandleOptionsIf.md)\>

The fill handle.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-options.if.ts:27](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-options.if.ts#L27)

___

### undo

• **undo**: `boolean` \| `Partial`\<[`UndoOptionsIf`](UndoOptionsIf.md)\>

Undo and redo.

#### Defined in

[src/lib/table/spreadsheet/spreadsheet-options.if.ts:23](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/spreadsheet/spreadsheet-options.if.ts#L23)
