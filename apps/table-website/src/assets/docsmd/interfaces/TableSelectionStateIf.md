[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableSelectionStateIf

# Interface: TableSelectionStateIf

The selection: rectangles between rows (ids) and columns (properties).

**`Since`**

1.1.92

## Table of contents

### Properties

- [allSelected](TableSelectionStateIf.md#allselected)
- [negativeRanges](TableSelectionStateIf.md#negativeranges)
- [ranges](TableSelectionStateIf.md#ranges)

## Properties

### allSelected

• `Optional` **allSelected**: `boolean`

Everything selected (⌘/Ctrl+A).

#### Defined in

[src/lib/table/state/table-state.if.ts:160](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L160)

___

### negativeRanges

• `Optional` **negativeRanges**: [`TableStateRangeIf`](TableStateRangeIf.md)[]

Rectangles removed from the selection (Ctrl/⌘+Alt-click).

#### Defined in

[src/lib/table/state/table-state.if.ts:164](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L164)

___

### ranges

• **ranges**: [`TableStateRangeIf`](TableStateRangeIf.md)[]

The selected rectangles.

#### Defined in

[src/lib/table/state/table-state.if.ts:162](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/state/table-state.if.ts#L162)
