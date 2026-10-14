[GuiExpert Table API](../README.md) / [Exports](../modules.md) / TableOverlayChange

# Interface: TableOverlayChange

A change of the shown overlay, reported by [TableOverlay.update](../classes/TableOverlay.md#update).

**`Since`**

1.1.91

## Table of contents

### Properties

- [kind](TableOverlayChange.md#kind)
- [previous](TableOverlayChange.md#previous)
- [text](TableOverlayChange.md#text)

## Properties

### kind

• **kind**: [`GeOverlayKind`](../modules.md#geoverlaykind)

#### Defined in

[src/lib/table/overlay/table-overlay.ts:15](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L15)

___

### previous

• **previous**: [`GeOverlayKind`](../modules.md#geoverlaykind)

#### Defined in

[src/lib/table/overlay/table-overlay.ts:14](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L14)

___

### text

• **text**: `string`

the text of the new overlay (`""` for `"none"`)

#### Defined in

[src/lib/table/overlay/table-overlay.ts:17](https://github.com/guiexperttable/mono/blob/main/packages/table/src/lib/table/overlay/table-overlay.ts#L17)
