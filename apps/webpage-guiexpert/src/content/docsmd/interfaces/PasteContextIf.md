[GuiExpert Table API](../README.md) / [Exports](../modules.md) / PasteContextIf

# Interface: PasteContextIf

What is pasted ([ClipboardOptionsIf.processPaste](ClipboardOptionsIf.md#processpaste)).

**`Since`**

1.1.99

## Table of contents

### Properties

- [html](PasteContextIf.md#html)
- [internal](PasteContextIf.md#internal)
- [matrix](PasteContextIf.md#matrix)
- [target](PasteContextIf.md#target)
- [text](PasteContextIf.md#text)

## Properties

### html

• `Optional` `Readonly` **html**: `string`

The `text/html` content, if any.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:28](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L28)

___

### internal

• `Readonly` **internal**: `boolean`

True if the content was copied from this table (the values are pasted, not the shown texts).

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:34](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L34)

___

### matrix

• `Readonly` **matrix**: `string`[][]

The parsed cells (rows of texts).

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:30](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L30)

___

### target

• `Readonly` **target**: [`CellRange`](../classes/CellRange.md)

The target before tiling and cutting off: anchor cell (display row, model column) and the matrix size.

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:32](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L32)

___

### text

• `Readonly` **text**: `string`

The `text/plain` content (`""` if there is only HTML).

#### Defined in

[src/lib/table/clipboard/clipboard-options.if.ts:26](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/clipboard/clipboard-options.if.ts#L26)
