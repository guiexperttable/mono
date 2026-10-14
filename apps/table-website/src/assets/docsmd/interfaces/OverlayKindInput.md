[GuiExpert Table API](../README.md) / [Exports](../modules.md) / OverlayKindInput

# Interface: OverlayKindInput

Input of [calcOverlayKind](../modules.md#calcoverlaykind).

**`Since`**

1.1.91

## Table of contents

### Properties

- [autoNoRows](OverlayKindInput.md#autonorows)
- [manual](OverlayKindInput.md#manual)
- [rowCount](OverlayKindInput.md#rowcount)
- [unfilteredRowCount](OverlayKindInput.md#unfilteredrowcount)

## Properties

### autoNoRows

• **autoNoRows**: `boolean`

[OverlayOptionsIf.autoNoRows](OverlayOptionsIf.md#autonorows)

#### Defined in

[src/lib/table/overlay/calc-overlay-kind.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/calc-overlay-kind.ts#L17)

___

### manual

• `Optional` **manual**: ``"loading"`` \| ``"noRows"``

The overlay requested by the API ([TableApi.showLoadingOverlay](../classes/TableApi.md#showloadingoverlay), [TableApi.showNoRowsOverlay](../classes/TableApi.md#shownorowsoverlay)).

#### Defined in

[src/lib/table/overlay/calc-overlay-kind.ts:11](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/calc-overlay-kind.ts#L11)

___

### rowCount

• **rowCount**: `number`

`getRowCount()` of the body (after the filter); < 0 = unknown.

#### Defined in

[src/lib/table/overlay/calc-overlay-kind.ts:13](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/calc-overlay-kind.ts#L13)

___

### unfilteredRowCount

• `Optional` **unfilteredRowCount**: `number`

`getUnfilteredRowCount()` of the body, `undefined` if the model cannot tell.

#### Defined in

[src/lib/table/overlay/calc-overlay-kind.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/calc-overlay-kind.ts#L15)
