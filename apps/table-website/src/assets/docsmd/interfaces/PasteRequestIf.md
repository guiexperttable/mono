[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PasteRequestIf

# Interface: PasteRequestIf\<V\>

Input of [computePastePlan](../modules.md#computepasteplan): what is pasted and where. All rows are **displayed** rows (display order after
sorting and filtering), columns are model indices; `shownColumns` lists the visible columns in display order –
hidden columns are skipped and not counted (like the fill handle).

**`Since`**

1.1.99

## Type parameters

| Name | Type |
| :------ | :------ |
| `V` | `unknown` |

## Table of contents

### Properties

- [anchorColumn](PasteRequestIf.md#anchorcolumn)
- [anchorRow](PasteRequestIf.md#anchorrow)
- [canAddRows](PasteRequestIf.md#canaddrows)
- [isWritable](PasteRequestIf.md#iswritable)
- [matrix](PasteRequestIf.md#matrix)
- [rowCount](PasteRequestIf.md#rowcount)
- [selection](PasteRequestIf.md#selection)
- [shownColumns](PasteRequestIf.md#showncolumns)

## Properties

### anchorColumn

• **anchorColumn**: `number`

First column of the target (model index, must be in `shownColumns`).

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L17)

___

### anchorRow

• **anchorRow**: `number`

First row of the target (display index).

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L15)

___

### canAddRows

• `Optional` **canAddRows**: `boolean`

True if rows may be added below the last row (`pasteAddsRows`).

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L28)

___

### isWritable

• `Optional` **isWritable**: (`rowIndex`: `number`, `columnIndex`: `number`) => `boolean`

#### Type declaration

▸ (`rowIndex`, `columnIndex`): `boolean`

`false` skips a target cell (not editable, calculated, group row); it still counts for the layout.

##### Parameters

| Name | Type |
| :------ | :------ |
| `rowIndex` | `number` |
| `columnIndex` | `number` |

##### Returns

`boolean`

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L30)

___

### matrix

• **matrix**: readonly readonly V[][]

The pasted cells (rows of values, at least one row and one column).

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L13)

___

### rowCount

• **rowCount**: `number`

Number of displayed body rows.

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:21](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L21)

___

### selection

• `Optional` **selection**: `Object`

The selected target in rows × shown columns (from the anchor), if a range is selected: an integer multiple of
the matrix tiles it (Excel), a single value fills it.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `columns` | `number` |
| `rows` | `number` |

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L26)

___

### shownColumns

• **shownColumns**: readonly `number`[]

The visible columns (model indices) in display order.

#### Defined in

[src/lib/table/clipboard/paste-plan.ts:19](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/paste-plan.ts#L19)
