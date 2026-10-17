[GuiExpert Table API](../README.md) / [Exports](../modules.md) / CopyContextIf

# Interface: CopyContextIf

What the table copies ([ClipboardOptionsIf.processCopy](ClipboardOptionsIf.md#processcopy)).

**`Since`**

1.1.99

## Table of contents

### Properties

- [cut](CopyContextIf.md#cut)
- [matrix](CopyContextIf.md#matrix)
- [ranges](CopyContextIf.md#ranges)

## Properties

### cut

• `Readonly` **cut**: `boolean`

True for Ctrl/⌘+X.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L15)

___

### matrix

• `Readonly` **matrix**: `string`[][]

Text per cell (rows × shown columns): as shown, or the value with `copyValue: "raw"`.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L13)

___

### ranges

• `Readonly` **ranges**: readonly [`CellRange`](../classes/CellRange.md)[]

The copied range (body display rows, model columns) – with several selected ranges the last one.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L11)
